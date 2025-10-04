const { query, transaction, buildOrgFilter } = require('../database/connection');
const crypto = require('crypto');

/**
 * RBAC Service - Dynamic Role and Permission Management
 * All roles and permissions are stored in and fetched from the database
 */

class RBACService {
  /**
   * Get all roles with their permissions
   * @param {Object} options - Query options
   * @param {string} options.org_id - Filter by organization (for custom roles)
   * @param {boolean} options.includeSystem - Include system roles
   * @param {boolean} options.includeCustom - Include org-specific custom roles
   */
  async getRoles({ org_id, includeSystem = true, includeCustom = true } = {}) {
    let whereClause = '';
    const params = [];

    if (!includeSystem && !includeCustom) {
      throw new Error('At least one of includeSystem or includeCustom must be true');
    }

    const conditions = [];
    
    if (includeSystem) {
      conditions.push('is_system = true');
    }
    
    if (includeCustom && org_id) {
      params.push(org_id);
      conditions.push(`org_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' OR ');
    }

    const sql = `
      SELECT 
        id, key, name, description, scope_level, 
        permissions, is_system, org_id,
        created_at, updated_at
      FROM roles
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN is_system = true THEN 0
          ELSE 1
        END,
        name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get a single role by ID or key
   */
  async getRole(identifier, org_id = null) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const sql = `
      SELECT 
        id, key, name, description, scope_level, 
        permissions, is_system, org_id,
        created_at, updated_at
      FROM roles
      WHERE ${isUUID ? 'id' : 'key'} = $1
        AND (is_system = true OR org_id = $2 OR $2 IS NULL)
    `;

    const result = await query(sql, [identifier, org_id]);
    
    if (result.rows.length === 0) {
      throw new Error('Role not found');
    }

    return result.rows[0];
  }

  /**
   * Create a custom role for an organization
   * System roles cannot be created through this method
   */
  async createRole(roleData, org_id, created_by_user_id) {
    const { key, name, description, scope_level, permissions } = roleData;

    // Validate inputs
    if (!key || !name || !scope_level || !permissions) {
      throw new Error('Missing required fields: key, name, scope_level, permissions');
    }

    // Validate scope_level
    const validScopes = ['PLATFORM', 'ORG', 'LOCATION', 'DEPARTMENT'];
    if (!validScopes.includes(scope_level)) {
      throw new Error(`Invalid scope_level. Must be one of: ${validScopes.join(', ')}`);
    }

    // Validate permissions format
    if (!Array.isArray(permissions)) {
      throw new Error('Permissions must be an array');
    }

    // Generate key if not provided
    const roleKey = key || `CUSTOM_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    return await transaction(async (client) => {
      // Check if key already exists
      const checkResult = await client.query(
        'SELECT id FROM roles WHERE key = $1 AND (org_id = $2 OR is_system = true)',
        [roleKey, org_id]
      );

      if (checkResult.rows.length > 0) {
        throw new Error('Role key already exists');
      }

      // Insert role
      const insertSql = `
        INSERT INTO roles (key, name, description, scope_level, permissions, is_system, org_id)
        VALUES ($1, $2, $3, $4, $5, false, $6)
        RETURNING id, key, name, description, scope_level, permissions, is_system, org_id, created_at
      `;

      const result = await client.query(insertSql, [
        roleKey,
        name,
        description || null,
        scope_level,
        JSON.stringify(permissions),
        org_id
      ]);

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: created_by_user_id,
        action: 'ROLE.CREATED',
        target_type: 'Role',
        target_id: result.rows[0].id,
        target_name: name,
        status: 'success',
        metadata: { role_key: roleKey, permissions }
      });

      return result.rows[0];
    }, { org_id });
  }

  /**
   * Update a role's permissions
   * System roles can have permissions updated but not deleted
   * Custom roles can be fully updated
   */
  async updateRole(roleId, updates, org_id, updated_by_user_id) {
    const { name, description, permissions } = updates;

    return await transaction(async (client) => {
      // Get existing role
      const roleResult = await client.query(
        'SELECT * FROM roles WHERE id = $1 AND (org_id = $2 OR (is_system = true AND $3 = true))',
        [roleId, org_id, !!updates.allowSystemRoleUpdate]
      );

      if (roleResult.rows.length === 0) {
        throw new Error('Role not found or access denied');
      }

      const existingRole = roleResult.rows[0];

      // Build update query
      const updateFields = [];
      const params = [];
      let paramCount = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        params.push(name);
      }

      if (description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        params.push(description);
      }

      if (permissions !== undefined) {
        if (!Array.isArray(permissions)) {
          throw new Error('Permissions must be an array');
        }
        updateFields.push(`permissions = $${paramCount++}`);
        params.push(JSON.stringify(permissions));
      }

      if (updateFields.length === 0) {
        return existingRole;
      }

      params.push(roleId);

      const updateSql = `
        UPDATE roles
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, key, name, description, scope_level, permissions, is_system, org_id, updated_at
      `;

      const result = await client.query(updateSql, params);

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: updated_by_user_id,
        action: 'ROLE.UPDATED',
        target_type: 'Role',
        target_id: roleId,
        target_name: result.rows[0].name,
        status: 'success',
        metadata: { 
          updates,
          previous: { 
            name: existingRole.name,
            permissions: existingRole.permissions 
          }
        }
      });

      return result.rows[0];
    }, { org_id });
  }

  /**
   * Delete a custom role
   * System roles cannot be deleted
   */
  async deleteRole(roleId, org_id, deleted_by_user_id) {
    return await transaction(async (client) => {
      // Check if role exists and is deletable
      const roleResult = await client.query(
        'SELECT * FROM roles WHERE id = $1 AND org_id = $2 AND is_system = false',
        [roleId, org_id]
      );

      if (roleResult.rows.length === 0) {
        throw new Error('Role not found, access denied, or cannot delete system role');
      }

      const role = roleResult.rows[0];

      // Check if role is in use
      const usageResult = await client.query(
        'SELECT COUNT(*) as count FROM role_assignments WHERE role_id = $1 AND revoked_at IS NULL',
        [roleId]
      );

      if (parseInt(usageResult.rows[0].count) > 0) {
        throw new Error('Cannot delete role that is currently assigned to users');
      }

      // Delete role
      await client.query('DELETE FROM roles WHERE id = $1', [roleId]);

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: deleted_by_user_id,
        action: 'ROLE.DELETED',
        target_type: 'Role',
        target_id: roleId,
        target_name: role.name,
        status: 'success',
        metadata: { role_key: role.key }
      });

      return { success: true, message: 'Role deleted successfully' };
    }, { org_id });
  }

  /**
   * Get all permissions for a user across all their roles
   * This aggregates permissions from all assigned roles
   */
  async getUserPermissions(userId, org_id) {
    const sql = `
      SELECT DISTINCT jsonb_array_elements_text(r.permissions) as permission
      FROM role_assignments ra
      JOIN roles r ON ra.role_id = r.id
      WHERE ra.user_id = $1 
        AND ra.org_id = $2
        AND ra.revoked_at IS NULL
        AND (ra.expires_at IS NULL OR ra.expires_at > CURRENT_TIMESTAMP)
      ORDER BY permission
    `;

    const result = await query(sql, [userId, org_id]);
    return result.rows.map(row => row.permission);
  }

  /**
   * Get user's role assignments with full role details
   */
  async getUserRoleAssignments(userId, org_id) {
    const sql = `
      SELECT 
        ra.id, ra.user_id, ra.org_id, ra.role_id, ra.scope,
        ra.location_id, ra.department_id, ra.assigned_at, ra.expires_at,
        r.key as role_key, r.name as role_name, r.permissions,
        l.name as location_name,
        d.name as department_name
      FROM role_assignments ra
      JOIN roles r ON ra.role_id = r.id
      LEFT JOIN locations l ON ra.location_id = l.id
      LEFT JOIN departments d ON ra.department_id = d.id
      WHERE ra.user_id = $1 
        AND ra.org_id = $2
        AND ra.revoked_at IS NULL
        AND (ra.expires_at IS NULL OR ra.expires_at > CURRENT_TIMESTAMP)
      ORDER BY ra.assigned_at DESC
    `;

    const result = await query(sql, [userId, org_id]);
    return result.rows;
  }

  /**
   * Assign a role to a user
   */
  async assignRole(assignmentData, assigned_by_user_id) {
    const { 
      user_id, 
      org_id, 
      role_id, 
      scope, 
      location_id, 
      department_id,
      expires_at 
    } = assignmentData;

    // Validate inputs
    if (!user_id || !org_id || !role_id || !scope) {
      throw new Error('Missing required fields: user_id, org_id, role_id, scope');
    }

    const validScopes = ['ORG', 'LOCATION', 'DEPARTMENT'];
    if (!validScopes.includes(scope)) {
      throw new Error(`Invalid scope. Must be one of: ${validScopes.join(', ')}`);
    }

    return await transaction(async (client) => {
      // Verify role exists
      const roleResult = await client.query(
        'SELECT * FROM roles WHERE id = $1',
        [role_id]
      );

      if (roleResult.rows.length === 0) {
        throw new Error('Role not found');
      }

      const role = roleResult.rows[0];

      // Verify user exists and belongs to org
      const userResult = await client.query(
        `SELECT u.* FROM users u
         JOIN role_assignments ra ON u.id = ra.user_id
         WHERE u.id = $1 AND ra.org_id = $2
         LIMIT 1`,
        [user_id, org_id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found in organization');
      }

      // Insert role assignment
      const insertSql = `
        INSERT INTO role_assignments (
          user_id, org_id, role_id, scope, location_id, department_id,
          assigned_by, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await client.query(insertSql, [
        user_id,
        org_id,
        role_id,
        scope,
        location_id || null,
        department_id || null,
        assigned_by_user_id,
        expires_at || null
      ]);

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: assigned_by_user_id,
        action: 'ROLE.GRANTED',
        target_type: 'RoleAssignment',
        target_id: result.rows[0].id,
        target_name: `${role.name} to user ${user_id}`,
        status: 'success',
        metadata: { 
          user_id, 
          role_key: role.key, 
          scope, 
          location_id, 
          department_id 
        }
      });

      return result.rows[0];
    }, { org_id });
  }

  /**
   * Revoke a role assignment
   */
  async revokeRole(assignmentId, org_id, revoked_by_user_id, reason = null) {
    return await transaction(async (client) => {
      // Get assignment
      const assignmentResult = await client.query(
        `SELECT ra.*, r.name as role_name, r.key as role_key
         FROM role_assignments ra
         JOIN roles r ON ra.role_id = r.id
         WHERE ra.id = $1 AND ra.org_id = $2 AND ra.revoked_at IS NULL`,
        [assignmentId, org_id]
      );

      if (assignmentResult.rows.length === 0) {
        throw new Error('Role assignment not found or already revoked');
      }

      const assignment = assignmentResult.rows[0];

      // Revoke assignment
      await client.query(
        `UPDATE role_assignments
         SET revoked_at = CURRENT_TIMESTAMP, 
             revoked_by = $1,
             revocation_reason = $2
         WHERE id = $3`,
        [revoked_by_user_id, reason, assignmentId]
      );

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: revoked_by_user_id,
        action: 'ROLE.REVOKED',
        target_type: 'RoleAssignment',
        target_id: assignmentId,
        target_name: `${assignment.role_name} from user ${assignment.user_id}`,
        status: 'success',
        metadata: { 
          user_id: assignment.user_id, 
          role_key: assignment.role_key, 
          reason 
        }
      });

      return { success: true, message: 'Role revoked successfully' };
    }, { org_id });
  }

  /**
   * Helper to create audit log entry
   */
  async _createAuditLog(client, logData) {
    const {
      org_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      target_name,
      status,
      error_message = null,
      metadata = {},
      ip_address = null,
      user_agent = null
    } = logData;

    const sql = `
      INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id, target_name,
        status, error_message, metadata, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    await client.query(sql, [
      org_id,
      actor_user_id,
      action,
      target_type,
      target_id,
      target_name,
      status,
      error_message,
      JSON.stringify(metadata),
      ip_address,
      user_agent
    ]);
  }
}

module.exports = new RBACService();
