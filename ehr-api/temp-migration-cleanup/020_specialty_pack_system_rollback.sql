-- Rollback for Specialty Pack System
-- Version: 1.0

-- Drop triggers first
DROP TRIGGER IF EXISTS audit_org_specialty_settings_changes ON org_specialty_settings;
DROP TRIGGER IF EXISTS update_specialty_visit_types_updated_at ON specialty_visit_types;
DROP TRIGGER IF EXISTS update_patient_specialty_episodes_updated_at ON patient_specialty_episodes;
DROP TRIGGER IF EXISTS update_org_specialty_settings_updated_at ON org_specialty_settings;

-- Drop functions
DROP FUNCTION IF EXISTS audit_specialty_pack_change();
-- Note: Don't drop update_updated_at_column() as it may be used by other tables

-- Drop tables in reverse order (accounting for dependencies)
DROP TABLE IF EXISTS specialty_visit_types CASCADE;
DROP TABLE IF EXISTS patient_specialty_episodes CASCADE;
DROP TABLE IF EXISTS specialty_pack_audits CASCADE;
DROP TABLE IF EXISTS org_specialty_settings CASCADE;
