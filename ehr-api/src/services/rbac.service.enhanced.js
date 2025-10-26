const { query, transaction } = require('../database/connection');
const crypto = require('crypto');
const socketService = require('./socket.service');
const {
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionMatrix,
  DEFAULT_SYSTEM_ROLES,
} = require('../constants/permissions');

/**
 * Enhanced RBAC Service with Copy-on-Write Support
 * Supports org-specific customization of system roles
 */

class EnhancedRBACService {
  /**
   * Get all roles with their permissions
   * Includes system roles and org-specific custom roles
   */
  async getRoles({ org_id, includeSystem = true, includeCustom = true } = {}) {
    let whereClause = '';
    const params = [];

    if (!includeSystem && !includeCustom) {
      throw new Error('At least one of includeSystem or includeCustom must be true');
    }

    const conditions = [];

    if (includeSystem) {
      conditions.push('(is_system = true AND org_id IS NULL)');
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
        r.id, r.key, r.name, r.description, r.scope_level,
        r.permissions, r.is_system, r.org_id, r.parent_role_id,
        r.is_modified, r.created_at, r.updated_at,
        pr.key as parent_role_key, pr.name as parent_role_name
      FROM roles r
      LEFT JOIN roles pr ON r.parent_role_id = pr.id
      ${whereClause}
      ORDER BY
        CASE
          WHEN r.is_system = true AND r.org_id IS NULL THEN 0
          WHEN r.parent_role_id IS NOT NULL THEN 1
          ELSE 2
        END,
        r.name
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
        r.id, r.key, r.name, r.description, r.scope_level,
        r.permissions, r.is_system, r.org_id, r.parent_role_id,
        r.is_modified, r.created_at, r.updated_at,
        pr.key as parent_role_key, pr.name as parent_role_name
      FROM roles r
      LEFT JOIN roles pr ON r.parent_role_id = pr.id
      WHERE ${isUUID ? 'r.id' : 'r.key'} = $1
        AND ((r.is_system = true AND r.org_id IS NULL) OR r.org_id = $2 OR $2 IS NULL)
    `;

    const result = await query(sql, [identifier, org_id]);

    if (result.rows.length === 0) {
      throw new Error('Role not found');
    }

    return result.rows[0];
  }

  /**
   * Copy-on-Write: Create org-specific copy of system role when modified
   * This allows orgs to customize system roles without affecting other orgs
   */
  async copySystemRoleForOrg(roleId, org_id, modified_by_user_id) {
    return await transaction(async (client) => {
      // Get the system role
      const roleResult = await client.query(
        'SELECT * FROM roles WHERE id = $1 AND is_system = true AND org_id IS NULL',
        [roleId]
      );

      if (roleResult.rows.length === 0) {
        throw new Error('System role not found');
      }

      const systemRole = roleResult.rows[0];

      // Check if org already has a copy of this role
      const existingCopyResult = await client.query(
        'SELECT id FROM roles WHERE parent_role_id = $1 AND org_id = $2',
        [roleId, org_id]
      );

      if (existingCopyResult.rows.length > 0) {
        return existingCopyResult.rows[0];
      }

      // Create org-specific copy
      const copySql = `
        INSERT INTO roles (
          key, name, description, scope_level, permissions,
          is_system, org_id, parent_role_id, is_modified
        )
        VALUES ($1, $2, $3, $4, $5, false, $6, $7, false)
        RETURNING *
      `;

      const copyResult = await client.query(copySql, [
        systemRole.key,
        systemRole.name,
        systemRole.description,
        systemRole.scope_level,
        systemRole.permissions,
        org_id,
        roleId,
      ]);

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: modified_by_user_id,
        action: 'ROLE.COPIED',
        target_type: 'Role',
        target_id: copyResult.rows[0].id,
        target_name: systemRole.name,
        status: 'success',
        metadata: {
          parent_role_key: systemRole.key,
          reason: 'Organization-specific customization',
        },
      });

      return copyResult.rows[0];
    });
  }

  /**
   * Update a role's permissions with copy-on-write support
   * If updating a system role, create org copy first
   */
  async updateRole(roleId, updates, org_id, updated_by_user_id) {
    const { name, description, permissions } = updates;

    return await transaction(async (client) => {
      // Get existing role
      const roleResult = await client.query(
        'SELECT * FROM roles WHERE id = $1',
        [roleId]
      );

      if (roleResult.rows.length === 0) {
        throw new Error('Role not found');
      }

      const existingRole = roleResult.rows[0];

      // If this is a system role (not org-specific), create a copy for this org
      if (existingRole.is_system && existingRole.org_id === null) {
        // Create org-specific copy
        const orgCopy = await this.copySystemRoleForOrg(roleId, org_id, updated_by_user_id);

        // Now update the copy
        roleId = orgCopy.id;
        existingRole.id = orgCopy.id;
        existingRole.org_id = org_id;
        existingRole.parent_role_id = roleId;
      }

      // Verify user has access to this role
      if (existingRole.org_id && existingRole.org_id !== org_id) {
        throw new Error('Access denied: Role belongs to different organization');
      }

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

        // Mark as modified if permissions changed
        updateFields.push(`is_modified = true`);
      }

      if (updateFields.length === 0) {
        return existingRole;
      }

      params.push(existingRole.id);

      const updateSql = `
        UPDATE roles
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateSql, params);

      // Audit log
      await this._createAuditLog(client, {
        org_id,
        actor_user_id: updated_by_user_id,
        action: 'ROLE.UPDATED',
        target_type: 'Role',
        target_id: result.rows[0].id,
        target_name: result.rows[0].name,
        status: 'success',
        metadata: {
          updates,
          previous: {
            name: existingRole.name,
            permissions: existingRole.permissions,
          },
          is_copy_on_write: existingRole.parent_role_id !== null,
        },
      });

      // Get affected users for real-time notification
      const affectedUsers = await client.query(
        `SELECT DISTINCT user_id FROM role_assignments
         WHERE role_id = $1 AND org_id = $2 AND revoked_at IS NULL`,
        [result.rows[0].id, org_id]
      );

      // Notify via Socket.IO
      if (affectedUsers.rows.length > 0) {
        const userIds = affectedUsers.rows.map(row => row.user_id);
        setImmediate(() => {
          socketService.notifyUsersPermissionChange(userIds, {
            type: 'role_updated',
            orgId: org_id,
            roleId: result.rows[0].id,
            roleName: result.rows[0].name,
            permissions: JSON.parse(result.rows[0].permissions),
          });
        });
      }

      // Also notify org
      setImmediate(() => {
        socketService.notifyOrgRoleChange(org_id, {
          type: 'role_updated',
          orgId: org_id,
          roleId: result.rows[0].id,
          roleName: result.rows[0].name,
        });
      });

      return result.rows[0];
    });
  }

  /**
   * Create a custom role for an organization
   */
  async createRole(roleData, org_id, created_by_user_id) {
    const { key, name, description, scope_level, permissions, parent_role_id } = roleData;

    // Validate inputs
    if (!name || !scope_level || !permissions) {
      throw new Error('Missing required fields: name, scope_level, permissions');
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
      // Check if key already exists for this org
      const checkResult = await client.query(
        'SELECT id FROM roles WHERE key = $1 AND org_id = $2',
        [roleKey, org_id]
      );

      if (checkResult.rows.length > 0) {
        throw new Error('Role key already exists for this organization');
      }

      // Insert role
      const insertSql = `
        INSERT INTO roles (
          key, name, description, scope_level, permissions,
          is_system, org_id, parent_role_id
        )
        VALUES ($1, $2, $3, $4, $5, false, $6, $7)
        RETURNING *
      `;

      const result = await client.query(insertSql, [
        roleKey,
        name,
        description || null,
        scope_level,
        JSON.stringify(permissions),
        org_id,
        parent_role_id || null,
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
        metadata: { role_key: roleKey, permissions, parent_role_id },
      });

      return result.rows[0];
    });
  }

  /**
   * Delete a custom role (not system roles)
   */
  async deleteRole(roleId, org_id, deleted_by_user_id) {
    return await transaction(async (client) => {
      // Check if role exists and is deletable
      const roleResult = await client.query(
        `SELECT * FROM roles
         WHERE id = $1
         AND org_id = $2
         AND (is_system = false OR parent_role_id IS NOT NULL)`,
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
        metadata: { role_key: role.key, was_modified_system_role: role.parent_role_id !== null },
      });

      return { success: true, message: 'Role deleted successfully' };
    });
  }

  /**
   * Get permission matrix structure
   */
  async getPermissionMatrix() {
    return getPermissionMatrix();
  }

  /**
   * Check if user has permission (with wildcard support)
   */
  checkPermission(userPermissions, requiredPermission) {
    return hasAnyPermission(userPermissions, requiredPermission);
  }

  /**
   * Check if user has all permissions
   */
  checkAllPermissions(userPermissions, requiredPermissions) {
    return hasAllPermissions(userPermissions, requiredPermissions);
  }

  /**
   * Get all permissions for a user across all their roles
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
        AND ((r.is_system = true AND r.org_id IS NULL) OR r.org_id = $2)
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
        r.is_system, r.parent_role_id, r.is_modified,
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
      // Verify role exists and belongs to org or is system role
      const roleResult = await client.query(
        `SELECT * FROM roles
         WHERE id = $1
         AND ((is_system = true AND org_id IS NULL) OR org_id = $2)`,
        [role_id, org_id]
      );

      if (roleResult.rows.length === 0) {
        throw new Error('Role not found or access denied');
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

      // Notify user via Socket.IO
      setImmediate(() => {
        socketService.notifyRoleAssignment(user_id, org_id, {
          type: 'role_assigned',
          orgId: org_id,
          roleId: role_id,
          roleName: role.name,
          roleKey: role.key,
          permissions: JSON.parse(role.permissions),
          scope,
          locationId: location_id,
          departmentId: department_id,
        });
      });

      return result.rows[0];
    });
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

      // Notify user via Socket.IO
      setImmediate(() => {
        socketService.notifyRoleRevocation(assignment.user_id, org_id, {
          type: 'role_revoked',
          roleName: assignment.role_name,
          roleKey: assignment.role_key,
          reason,
        });
      });

      return { success: true, message: 'Role revoked successfully' };
    });
  }

  /**
   * Get recent permission changes for real-time sync
   */
  async getPermissionChanges(org_id, since = null, limit = 100) {
    const sql = `
      SELECT *
      FROM permission_changes
      WHERE org_id = $1
        ${since ? 'AND created_at > $2' : ''}
      ORDER BY created_at DESC
      LIMIT $${since ? '3' : '2'}
    `;

    const params = since ? [org_id, since, limit] : [org_id, limit];
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Mark permission changes as processed
   */
  async markPermissionChangesProcessed(changeIds) {
    if (!Array.isArray(changeIds) || changeIds.length === 0) return;

    await query(
      `UPDATE permission_changes
       SET processed_at = CURRENT_TIMESTAMP
       WHERE id = ANY($1)`,
      [changeIds]
    );
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

module.exports = new EnhancedRBACService();
