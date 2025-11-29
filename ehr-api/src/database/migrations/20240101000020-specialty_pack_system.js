const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Specialty Pack System
-- Enables dynamic specialty-aware configuration per organization
-- Version: 1.0

-- =====================================================
-- ENABLE UUID EXTENSION
-- Required for uuid_generate_v4() function
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORG SPECIALTY SETTINGS
-- Stores which specialty packs are enabled for each org/location/department
-- =====================================================
CREATE TABLE IF NOT EXISTS org_specialty_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pack identification
  pack_slug TEXT NOT NULL, -- e.g., 'ob-gyn', 'wound-care', 'orthopedics'
  pack_version TEXT NOT NULL, -- Semantic versioning e.g., '1.2.0'

  -- Enablement
  enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Scope (where this pack applies)
  scope TEXT NOT NULL CHECK (scope IN ('org', 'location', 'department', 'service_line')),
  scope_ref_id UUID, -- References locations.id, departments.id, etc. NULL if scope='org'

  -- Overrides (JSONB for flexibility)
  overrides JSONB DEFAULT '{}', -- Template substitutions, feature flags, etc.

  -- Audit fields
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one setting per pack+scope combination
  UNIQUE(org_id, pack_slug, scope, scope_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_org_specialty_settings_org_id ON org_specialty_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_org_specialty_settings_pack_slug ON org_specialty_settings(pack_slug);
CREATE INDEX IF NOT EXISTS idx_org_specialty_settings_enabled ON org_specialty_settings(enabled);
CREATE INDEX IF NOT EXISTS idx_org_specialty_settings_scope ON org_specialty_settings(org_id, scope);

COMMENT ON TABLE org_specialty_settings IS 'Stores enabled specialty packs per organization with scope-based overrides';
COMMENT ON COLUMN org_specialty_settings.pack_slug IS 'Unique identifier for specialty pack (lowercase, hyphenated)';
COMMENT ON COLUMN org_specialty_settings.pack_version IS 'Semantic version of the pack (1.2.0)';
COMMENT ON COLUMN org_specialty_settings.scope IS 'Level at which pack is enabled: org, location, department, or service_line';
COMMENT ON COLUMN org_specialty_settings.scope_ref_id IS 'Reference ID for the scope (location_id, department_id, etc.)';
COMMENT ON COLUMN org_specialty_settings.overrides IS 'JSON object with pack-specific overrides (template mappings, feature flags)';

-- =====================================================
-- SPECIALTY PACK AUDITS
-- Immutable audit trail for all pack changes
-- =====================================================
CREATE TABLE IF NOT EXISTS specialty_pack_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What changed
  pack_slug TEXT NOT NULL,
  pack_version TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('enabled', 'disabled', 'updated', 'rollback')),

  -- Who and when
  actor_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Context
  scope TEXT,
  scope_ref_id UUID,

  -- Additional metadata
  metadata JSONB DEFAULT '{}', -- Before/after diff, reason, etc.

  -- Immutable: no updates or deletes allowed
  -- Enforce via REVOKE in production
  CHECK (created_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_specialty_pack_audits_org_id ON specialty_pack_audits(org_id);
CREATE INDEX IF NOT EXISTS idx_specialty_pack_audits_pack_slug ON specialty_pack_audits(pack_slug);
CREATE INDEX IF NOT EXISTS idx_specialty_pack_audits_actor_id ON specialty_pack_audits(actor_id);
CREATE INDEX IF NOT EXISTS idx_specialty_pack_audits_created_at ON specialty_pack_audits(created_at DESC);

COMMENT ON TABLE specialty_pack_audits IS 'Immutable audit log of all specialty pack configuration changes';
COMMENT ON COLUMN specialty_pack_audits.action IS 'Type of change: enabled, disabled, updated, or rollback';
COMMENT ON COLUMN specialty_pack_audits.metadata IS 'Additional context: diff, reason, previous values, etc.';

-- =====================================================
-- PATIENT SPECIALTY EPISODES
-- Tracks concurrent specialty episodes per patient
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_specialty_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Patient reference (FHIR Patient resource)
  patient_id UUID NOT NULL, -- References fhir_patients.id or equivalent
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Episode details
  specialty_slug TEXT NOT NULL, -- Which pack this episode belongs to
  episode_state TEXT NOT NULL CHECK (episode_state IN ('planned', 'active', 'on-hold', 'completed', 'cancelled')),

  -- Timeline
  start_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_at TIMESTAMP,

  -- Active flag for quick filtering
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Pack-specific metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}', -- e.g., EDD for prenatal, surgery date for ortho

  -- Care team
  primary_practitioner_id UUID, -- Lead clinician
  care_team_ids UUID[], -- Array of practitioner IDs

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_specialty_episodes_patient_id ON patient_specialty_episodes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_specialty_episodes_org_id ON patient_specialty_episodes(org_id);
CREATE INDEX IF NOT EXISTS idx_patient_specialty_episodes_specialty_slug ON patient_specialty_episodes(specialty_slug);
CREATE INDEX IF NOT EXISTS idx_patient_specialty_episodes_active ON patient_specialty_episodes(active);
CREATE INDEX IF NOT EXISTS idx_patient_specialty_episodes_state ON patient_specialty_episodes(episode_state);
CREATE INDEX IF NOT EXISTS idx_patient_specialty_episodes_patient_active ON patient_specialty_episodes(patient_id, active);

COMMENT ON TABLE patient_specialty_episodes IS 'Tracks concurrent specialty-specific care episodes for each patient';
COMMENT ON COLUMN patient_specialty_episodes.specialty_slug IS 'Specialty pack slug (ob-gyn, wound-care, etc.)';
COMMENT ON COLUMN patient_specialty_episodes.episode_state IS 'Episode lifecycle state';
COMMENT ON COLUMN patient_specialty_episodes.metadata IS 'Specialty-specific data (EDD, complication flags, etc.)';
COMMENT ON COLUMN patient_specialty_episodes.active IS 'Quick filter for currently active episodes';

-- =====================================================
-- SPECIALTY VISIT TYPES
-- Defines appointment taxonomy per specialty with resource requirements
-- =====================================================
CREATE TABLE IF NOT EXISTS specialty_visit_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for system-wide default types

  -- Visit type identification
  specialty_slug TEXT NOT NULL,
  code TEXT NOT NULL, -- e.g., 'prenatal-initial', 'wound-followup'
  name TEXT NOT NULL,
  description TEXT,

  -- Scheduling parameters
  duration_min INTEGER NOT NULL DEFAULT 30,
  buffer_before_min INTEGER DEFAULT 0,
  buffer_after_min INTEGER DEFAULT 0,

  -- Resource requirements
  required_roles TEXT[], -- e.g., ['ob_nurse', 'midwife']
  required_resources TEXT[], -- e.g., ['ultrasound_machine', 'fetal_monitor']

  -- Recurrence template (JSONB)
  recurrence_template JSONB, -- Predefined recurrence rules (weekly NST, daily wound care)

  -- Intake/forms
  intake_template_id TEXT, -- Reference to form template

  -- Metadata
  category TEXT, -- consultation, follow-up, procedure, emergency
  color TEXT, -- Hex color for calendar display
  active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(org_id, specialty_slug, code)
);

CREATE INDEX IF NOT EXISTS idx_specialty_visit_types_specialty_slug ON specialty_visit_types(specialty_slug);
CREATE INDEX IF NOT EXISTS idx_specialty_visit_types_org_id ON specialty_visit_types(org_id);
CREATE INDEX IF NOT EXISTS idx_specialty_visit_types_active ON specialty_visit_types(active);

COMMENT ON TABLE specialty_visit_types IS 'Appointment types per specialty with resource bindings and recurrence rules';
COMMENT ON COLUMN specialty_visit_types.code IS 'Unique code within specialty (prenatal-initial, wound-debridement)';
COMMENT ON COLUMN specialty_visit_types.required_roles IS 'Practitioner roles required for this visit type';
COMMENT ON COLUMN specialty_visit_types.required_resources IS 'Equipment/supplies required';
COMMENT ON COLUMN specialty_visit_types.recurrence_template IS 'Predefined recurrence rules for common protocols';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_org_specialty_settings_updated_at ON org_specialty_settings;
CREATE TRIGGER update_org_specialty_settings_updated_at
  BEFORE UPDATE ON org_specialty_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_specialty_episodes_updated_at ON patient_specialty_episodes;
CREATE TRIGGER update_patient_specialty_episodes_updated_at
  BEFORE UPDATE ON patient_specialty_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_specialty_visit_types_updated_at ON specialty_visit_types;
CREATE TRIGGER update_specialty_visit_types_updated_at
  BEFORE UPDATE ON specialty_visit_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create audit entry on pack settings change
CREATE OR REPLACE FUNCTION audit_specialty_pack_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO specialty_pack_audits (org_id, pack_slug, pack_version, action, actor_id, scope, scope_ref_id, metadata)
    VALUES (NEW.org_id, NEW.pack_slug, NEW.pack_version, 'enabled', NEW.created_by, NEW.scope, NEW.scope_ref_id, jsonb_build_object('enabled', NEW.enabled));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.enabled != NEW.enabled THEN
      INSERT INTO specialty_pack_audits (org_id, pack_slug, pack_version, action, actor_id, scope, scope_ref_id, metadata)
      VALUES (NEW.org_id, NEW.pack_slug, NEW.pack_version,
              CASE WHEN NEW.enabled THEN 'enabled' ELSE 'disabled' END,
              NEW.updated_by, NEW.scope, NEW.scope_ref_id,
              jsonb_build_object('enabled_before', OLD.enabled, 'enabled_after', NEW.enabled));
    ELSE
      INSERT INTO specialty_pack_audits (org_id, pack_slug, pack_version, action, actor_id, scope, scope_ref_id, metadata)
      VALUES (NEW.org_id, NEW.pack_slug, NEW.pack_version, 'updated', NEW.updated_by, NEW.scope, NEW.scope_ref_id,
              jsonb_build_object('version_before', OLD.pack_version, 'version_after', NEW.pack_version));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_org_specialty_settings_changes ON org_specialty_settings;
CREATE TRIGGER audit_org_specialty_settings_changes
  AFTER INSERT OR UPDATE ON org_specialty_settings
  FOR EACH ROW
  EXECUTE FUNCTION audit_specialty_pack_change();

-- =====================================================
-- SEED DEFAULT PACK
-- Insert a default 'general' pack for existing organizations
-- =====================================================
INSERT INTO org_specialty_settings (org_id, pack_slug, pack_version, enabled, scope, created_by)
SELECT
  id as org_id,
  'general' as pack_slug,
  '1.0.0' as pack_version,
  true as enabled,
  'org' as scope,
  (
    CASE
      WHEN created_by IS NOT NULL AND created_by IN (SELECT id FROM users) THEN created_by
      ELSE (SELECT id FROM users LIMIT 1)
    END
  ) as created_by
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM org_specialty_settings
  WHERE org_specialty_settings.org_id = organizations.id
  AND org_specialty_settings.pack_slug = 'general'
);

-- =====================================================
-- PERMISSIONS
-- Grant appropriate permissions (adjust based on your RBAC)
-- =====================================================
-- These are examples - adjust based on your actual role structure
-- GRANT SELECT ON org_specialty_settings TO app_user;
-- GRANT SELECT ON specialty_pack_audits TO app_user;
-- GRANT SELECT ON patient_specialty_episodes TO app_user;
-- GRANT SELECT ON specialty_visit_types TO app_user;
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 20240101000020-specialty_pack_system...');
      await pool.query(sql);
      console.log('✅ 20240101000020-specialty_pack_system completed');
    } catch (error) {
      console.error('❌ 20240101000020-specialty_pack_system failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000020-specialty_pack_system.js');
  }
};
