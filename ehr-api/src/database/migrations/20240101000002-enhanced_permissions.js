const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Enhanced Permissions Migration
-- Adds support for org-specific roles and copy-on-write for system roles

-- =====================================================
-- UPDATE ROLES TABLE
-- =====================================================

-- Add org_id column to roles table (for custom roles per organization)
ALTER TABLE roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add parent_role_id for tracking copied roles
ALTER TABLE roles ADD COLUMN IF NOT EXISTS parent_role_id UUID REFERENCES roles(id);

-- Add is_modified flag to track if org modified a system role
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_modified BOOLEAN DEFAULT FALSE;

-- Update unique constraint to allow same key for different orgs
-- Drop old unique constraint on key
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_key_key;

-- Add new composite unique constraint: system roles have unique keys globally,
-- custom roles have unique keys per org
CREATE UNIQUE INDEX IF NOT EXISTS roles_key_system_unique
  ON roles(key)
  WHERE is_system = true AND org_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS roles_key_org_unique
  ON roles(key, org_id)
  WHERE org_id IS NOT NULL;

-- Add index for parent_role_id
CREATE INDEX IF NOT EXISTS idx_roles_parent_role_id ON roles(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(org_id);

-- =====================================================
-- UPDATE DEFAULT SYSTEM ROLES WITH NEW PERMISSIONS
-- =====================================================

-- Clear existing system roles and re-insert with new permission structure
DELETE FROM roles WHERE is_system = true;

-- Insert enhanced system roles
INSERT INTO roles (key, name, description, scope_level, permissions, is_system) VALUES
  ('PLATFORM_ADMIN', 'Platform Administrator', 'Nirmitee super-admin with full platform access', 'PLATFORM',
   '["platform:*"]', true),

  ('ORG_OWNER', 'Organization Owner', 'Full organization control', 'ORG',
   '["org:*", "locations:*", "departments:*", "staff:*", "roles:*", "permissions:*", "settings:*",
     "patients:*", "appointments:*", "encounters:*", "billing:*", "reports:*", "audit:*"]', true),

  ('ORG_ADMIN', 'Organization Administrator', 'Manage organization settings and staff', 'ORG',
   '["org:read", "org:edit", "locations:*", "departments:*", "staff:*", "roles:read", "roles:edit",
     "settings:*", "patients:read", "appointments:read", "reports:read", "audit:read"]', true),

  ('CLINICIAN', 'Clinician', 'Full clinical workflow access', 'LOCATION',
   '["patients:read", "patients:create", "patients:edit", "appointments:read", "appointments:edit",
     "encounters:*", "observations:*", "diagnoses:*", "procedures:*", "medications:*", "allergies:*",
     "immunizations:*", "clinical_notes:*", "prescriptions:*", "lab_orders:*", "lab_results:read",
     "imaging_orders:*", "imaging_results:read", "reports:read", "reports:print"]', true),

  ('NURSE', 'Nurse', 'Patient care and vitals management', 'LOCATION',
   '["patients:read", "appointments:read", "encounters:read", "encounters:edit", "observations:*",
     "medications:read", "medications:submit", "allergies:read", "clinical_notes:read", "clinical_notes:create",
     "lab_results:read", "imaging_results:read"]', true),

  ('FRONT_DESK', 'Front Desk', 'Patient registration and appointment management', 'LOCATION',
   '["patients:read", "patients:create", "patients:edit", "patient_demographics:*", "appointments:*",
     "billing:read", "billing:create", "payments:read", "payments:create"]', true),

  ('LAB_TECHNICIAN', 'Lab Technician', 'Laboratory order and result management', 'LOCATION',
   '["patients:read", "lab_orders:read", "lab_results:create", "lab_results:edit", "lab_results:submit"]', true),

  ('PHARMACIST', 'Pharmacist', 'Medication and prescription management', 'LOCATION',
   '["patients:read", "prescriptions:read", "prescriptions:approve", "prescriptions:reject",
     "medications:read", "allergies:read"]', true),

  ('BILLING_CLERK', 'Billing Clerk', 'Billing and payment management', 'LOCATION',
   '["patients:read", "appointments:read", "billing:*", "invoices:*", "payments:*",
     "insurance:read", "claims:create", "claims:edit", "claims:submit"]', true),

  ('AUDITOR', 'Auditor', 'Read-only access for compliance and auditing', 'ORG',
   '["audit:read", "org:read", "locations:read", "staff:read", "patients:read",
     "encounters:read", "billing:read", "reports:read", "reports:export"]', true),

  ('VIEWER', 'Viewer', 'Read-only access to basic information', 'LOCATION',
   '["patients:read", "appointments:read", "encounters:read", "reports:read"]', true)

ON CONFLICT DO NOTHING;

-- =====================================================
-- CREATE PERMISSION CHANGE LOG TABLE
-- =====================================================

-- Track permission changes for real-time updates
CREATE TABLE IF NOT EXISTS permission_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('role_created', 'role_updated', 'role_deleted', 'role_assigned', 'role_revoked')),
  change_data JSONB,
  affected_users UUID[], -- Array of user IDs affected by this change
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP, -- When real-time notification was sent
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_permission_changes_org_id ON permission_changes(org_id);
CREATE INDEX IF NOT EXISTS idx_permission_changes_created_at ON permission_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_permission_changes_processed_at ON permission_changes(processed_at);

-- =====================================================
-- CREATE FUNCTION TO LOG PERMISSION CHANGES
-- =====================================================

-- Function to automatically log role changes
CREATE OR REPLACE FUNCTION log_permission_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for custom roles or modified system roles
  IF TG_OP = 'INSERT' THEN
    INSERT INTO permission_changes (org_id, role_id, change_type, change_data)
    VALUES (
      NEW.org_id,
      NEW.id,
      'role_created',
      jsonb_build_object(
        'role_key', NEW.key,
        'role_name', NEW.name,
        'permissions', NEW.permissions
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if permissions changed
    IF OLD.permissions != NEW.permissions THEN
      INSERT INTO permission_changes (org_id, role_id, change_type, change_data, affected_users)
      SELECT
        COALESCE(NEW.org_id, ra.org_id),
        NEW.id,
        'role_updated',
        jsonb_build_object(
          'role_key', NEW.key,
          'role_name', NEW.name,
          'old_permissions', OLD.permissions,
          'new_permissions', NEW.permissions
        ),
        ARRAY_AGG(DISTINCT ra.user_id)
      FROM role_assignments ra
      WHERE ra.role_id = NEW.id
        AND ra.revoked_at IS NULL
      GROUP BY NEW.org_id, NEW.id, ra.org_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO permission_changes (org_id, role_id, change_type, change_data)
    VALUES (
      OLD.org_id,
      OLD.id,
      'role_deleted',
      jsonb_build_object(
        'role_key', OLD.key,
        'role_name', OLD.name
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS trigger_log_permission_change ON roles;
CREATE TRIGGER trigger_log_permission_change
AFTER INSERT OR UPDATE OR DELETE ON roles
FOR EACH ROW
EXECUTE FUNCTION log_permission_change();

-- =====================================================
-- CREATE FUNCTION TO LOG ROLE ASSIGNMENTS
-- =====================================================

CREATE OR REPLACE FUNCTION log_role_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO permission_changes (org_id, user_id, role_id, change_type, change_data, affected_users)
    SELECT
      NEW.org_id,
      NEW.user_id,
      NEW.role_id,
      'role_assigned',
      jsonb_build_object(
        'role_key', r.key,
        'role_name', r.name,
        'scope', NEW.scope,
        'location_id', NEW.location_id
      ),
      ARRAY[NEW.user_id]
    FROM roles r
    WHERE r.id = NEW.role_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL THEN
    INSERT INTO permission_changes (org_id, user_id, role_id, change_type, change_data, affected_users)
    SELECT
      NEW.org_id,
      NEW.user_id,
      NEW.role_id,
      'role_revoked',
      jsonb_build_object(
        'role_key', r.key,
        'role_name', r.name,
        'reason', NEW.revocation_reason
      ),
      ARRAY[NEW.user_id]
    FROM roles r
    WHERE r.id = NEW.role_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role assignment changes
DROP TRIGGER IF EXISTS trigger_log_role_assignment_change ON role_assignments;
CREATE TRIGGER trigger_log_role_assignment_change
AFTER INSERT OR UPDATE ON role_assignments
FOR EACH ROW
EXECUTE FUNCTION log_role_assignment_change();

-- =====================================================
-- UPDATE AUDIT EVENTS TABLE
-- =====================================================

-- Add permission-specific columns to audit events if needed
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS permission_context JSONB;

COMMENT ON TABLE permission_changes IS 'Tracks permission and role changes for real-time updates via Socket.IO';
COMMENT ON COLUMN roles.org_id IS 'NULL for system roles, set for org-specific custom roles';
COMMENT ON COLUMN roles.parent_role_id IS 'References the system role this was copied from (for copy-on-write)';
COMMENT ON COLUMN roles.is_modified IS 'TRUE if this is a copy of a system role that has been modified';
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
      console.log('🔄 Executing 20240101000002-enhanced_permissions...');
      await pool.query(sql);
      console.log('✅ 20240101000002-enhanced_permissions completed');
    } catch (error) {
      console.error('❌ 20240101000002-enhanced_permissions failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000002-enhanced_permissions.js');
  }
};
