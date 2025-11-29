const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Migration 016: Fix permission_changes trigger to handle system roles
-- System roles have org_id = NULL, which violates the NOT NULL constraint
-- This migration modifies the trigger to skip logging for system role creation

-- Drop and recreate the trigger function with proper NULL handling
CREATE OR REPLACE FUNCTION log_permission_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for custom roles (org_id IS NOT NULL)
  -- System roles (org_id IS NULL) should not be logged to permission_changes

  IF TG_OP = 'INSERT' THEN
    -- Only log if this is a custom org role
    IF NEW.org_id IS NOT NULL THEN
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
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if permissions changed
    IF OLD.permissions != NEW.permissions THEN
      -- For system roles (org_id IS NULL), find affected orgs via role_assignments
      IF NEW.org_id IS NULL THEN
        -- System role updated - log per affected org
        INSERT INTO permission_changes (org_id, role_id, change_type, change_data, affected_users)
        SELECT
          ra.org_id,
          NEW.id,
          'role_updated',
          jsonb_build_object(
            'role_key', NEW.key,
            'role_name', NEW.name,
            'old_permissions', OLD.permissions,
            'new_permissions', NEW.permissions,
            'is_system_role', true
          ),
          ARRAY_AGG(DISTINCT ra.user_id)
        FROM role_assignments ra
        WHERE ra.role_id = NEW.id
          AND ra.revoked_at IS NULL
        GROUP BY ra.org_id;
      ELSE
        -- Custom org role updated
        INSERT INTO permission_changes (org_id, role_id, change_type, change_data, affected_users)
        SELECT
          NEW.org_id,
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
        GROUP BY ra.org_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Only log deletion of custom roles
    IF OLD.org_id IS NOT NULL THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS trigger_log_permission_change ON roles;
CREATE TRIGGER trigger_log_permission_change
  AFTER INSERT OR UPDATE OR DELETE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION log_permission_change();

COMMENT ON FUNCTION log_permission_change() IS
'Automatically logs permission changes for custom org roles. System roles (org_id IS NULL) are only logged when updated, tracking affected orgs via role_assignments.';
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
      console.log('🔄 Executing 20240101000016-fix_permission_changes_trigger...');
      await pool.query(sql);
      console.log('✅ 20240101000016-fix_permission_changes_trigger completed');
    } catch (error) {
      console.error('❌ 20240101000016-fix_permission_changes_trigger failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000016-fix_permission_changes_trigger.js');
  }
};
