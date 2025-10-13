-- Audit logging enhancements for healthcare compliance
-- Adds category metadata, creates audit settings table, and seeds defaults

ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'system';

-- Ensure future inserts must choose a category explicitly unless using defaults
ALTER TABLE audit_events
  ALTER COLUMN category SET DEFAULT 'system';

-- Capture request identifiers when available
ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS request_id TEXT;

CREATE TABLE IF NOT EXISTS audit_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id),
  UNIQUE(org_id, preference_key)
);

CREATE INDEX IF NOT EXISTS idx_audit_settings_org ON audit_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_settings_key ON audit_settings(org_id, preference_key);

-- Seed default settings for existing organizations
INSERT INTO audit_settings (org_id, preference_key, enabled, config)
SELECT o.id, defaults.key, defaults.enabled, defaults.config::jsonb
FROM organizations o
CROSS JOIN (
  VALUES
    ('http_requests', TRUE, '{"retention_days": 180, "redact_fields": ["password", "token", "secret"]}'),
    ('data_changes', TRUE, '{"capture_diffs": true, "retention_days": 2555}'),
    ('authentication', TRUE, '{"retention_days": 2555}'),
    ('administration', TRUE, '{"retention_days": 2555}'),
    ('security', TRUE, '{"retention_days": 2555}')
) AS defaults(key, enabled, config)
ON CONFLICT (org_id, preference_key) DO NOTHING;

-- Update existing audit events without a category to a sensible default based on action prefix
UPDATE audit_events
SET category = CASE
  WHEN action LIKE 'AUTH.%' THEN 'authentication'
  WHEN action LIKE 'SECURITY.%' THEN 'security'
  WHEN action LIKE 'ORG.%' THEN 'administration'
  WHEN action LIKE 'ROLE.%' THEN 'administration'
  WHEN action LIKE 'USER.%' THEN 'administration'
  WHEN action LIKE 'INVENTORY.%' THEN 'data_changes'
  WHEN action LIKE 'BILLING.%' THEN 'data_changes'
  ELSE category
END
WHERE category = 'system';

CREATE OR REPLACE FUNCTION set_audit_event_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category IS NULL OR NEW.category = 'system' THEN
    NEW.category := CASE
      WHEN NEW.action LIKE 'AUTH.%' THEN 'authentication'
      WHEN NEW.action LIKE 'SECURITY.%' THEN 'security'
      WHEN NEW.action LIKE 'ORG.%' THEN 'administration'
      WHEN NEW.action LIKE 'ROLE.%' THEN 'administration'
      WHEN NEW.action LIKE 'USER.%' THEN 'administration'
      WHEN NEW.action LIKE 'INVENTORY.%' THEN 'data_changes'
      WHEN NEW.action LIKE 'BILLING.%' THEN 'data_changes'
      WHEN NEW.action LIKE 'HTTP.%' THEN 'http_requests'
      ELSE COALESCE(NEW.category, 'data_changes')
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_events_category_default ON audit_events;
CREATE TRIGGER audit_events_category_default
  BEFORE INSERT ON audit_events
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_event_category();
