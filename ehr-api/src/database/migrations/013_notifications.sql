-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  title TEXT,
  message TEXT,
  category TEXT NOT NULL DEFAULT 'system',
  severity TEXT NOT NULL DEFAULT 'info',
  href TEXT,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  read_by TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_org_created_at
  ON notifications (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_event
  ON notifications (event);

CREATE INDEX IF NOT EXISTS idx_notifications_recipients
  ON notifications
  USING GIN (recipients);

CREATE INDEX IF NOT EXISTS idx_notifications_read_by
  ON notifications
  USING GIN (read_by);
