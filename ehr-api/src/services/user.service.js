const { query, transaction } = require('../database/connection');
const KeycloakService = require('./keycloak.service');
const RBACService = require('./rbac.service');
const { syncUserLocations } = require('../utils/user-location-sync');

/**
 * User Management Service
 * Handles direct user creation (not invitation-based)
 */

class UserService {
  /**
   * Create user account directly (no invitation)
   * Admin can create staff accounts immediately
   */
  async createUser(userData, createdBy, orgId) {
    const {
      email,
      name,
      password,
      role_keys,
      scope = 'ORG',
      location_ids = []
    } = userData;

    if (!email || !name || !password || !role_keys || role_keys.length === 0) {
      throw new Error('Missing required fields: email, name, password, role_keys');
    }

    const normalizedLocationIds = Array.isArray(location_ids)
      ? [...new Set(location_ids.filter(Boolean))]
      : [];

    if (scope === 'LOCATION' && normalizedLocationIds.length === 0) {
      throw new Error('Location scoped roles require at least one location_id');
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    return await transaction(async (client) => {
      // Create user in Keycloak
      const keycloakUser = await KeycloakService.createUser({
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        password,
        emailVerified: true, // Auto-verify for directly created users
        enabled: true,
        attributes: {
          org_id: orgId,
          org_slug: '', // Will be set from org query
          location_ids: normalizedLocationIds,
          permissions: [] // Will be set after role assignment
        }
      });

      // Get org slug
      const orgResult = await client.query(
        'SELECT slug FROM organizations WHERE id = $1',
        [orgId]
      );

      if (orgResult.rows.length === 0) {
        throw new Error('Organization not found');
      }

      const orgSlug = orgResult.rows[0].slug;

      // Create user in database
      const userResult = await client.query(
        `INSERT INTO users (
          email, name, keycloak_user_id, status
        )
        VALUES ($1, $2, $3, 'active')
        RETURNING *`,
        [email, name, keycloakUser.id]
      );

      const user = userResult.rows[0];

      // Verify roles exist
      const rolesResult = await client.query(
        `SELECT id, key, permissions FROM roles 
         WHERE key = ANY($1) AND (is_system = true OR org_id = $2)`,
        [role_keys, orgId]
      );

      if (rolesResult.rows.length !== role_keys.length) {
        throw new Error('One or more roles not found');
      }

      // Assign roles
      for (const role of rolesResult.rows) {
        if (scope === 'LOCATION') {
          for (const locationId of normalizedLocationIds) {
            const exists = await client.query(
              `SELECT 1 FROM role_assignments
               WHERE user_id = $1 AND org_id = $2 AND role_id = $3
                 AND scope = $4 AND location_id = $5
                 AND revoked_at IS NULL
               LIMIT 1`,
              [user.id, orgId, role.id, scope, locationId]
            );

            if (exists.rows.length > 0) {
              continue;
            }

            await client.query(
              `INSERT INTO role_assignments (
                user_id, org_id, role_id, scope, location_id, assigned_by
              )
              VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                user.id,
                orgId,
                role.id,
                scope,
                locationId,
                createdBy
              ]
            );
          }
        } else {
          const exists = await client.query(
            `SELECT 1 FROM role_assignments
             WHERE user_id = $1 AND org_id = $2 AND role_id = $3
               AND scope = $4 AND location_id IS NULL
               AND revoked_at IS NULL
             LIMIT 1`,
            [user.id, orgId, role.id, scope]
          );

          if (exists.rows.length > 0) {
            continue;
          }

          await client.query(
            `INSERT INTO role_assignments (
              user_id, org_id, role_id, scope, location_id, assigned_by
            )
            VALUES ($1, $2, $3, $4, NULL, $5)`,
            [
              user.id,
              orgId,
              role.id,
              scope,
              createdBy
            ]
          );
        }
      }

      const syncedLocationIds = await syncUserLocations({
        userId: user.id,
        orgId,
        client
      });

      // Get aggregated permissions
      const permissions = await RBACService.getUserPermissions(user.id, orgId);

      // Update Keycloak user with complete attributes
      await KeycloakService.updateUserAttributes(keycloakUser.id, {
        org_id: orgId,
        org_slug: orgSlug,
        location_ids: syncedLocationIds,
        permissions: Array.isArray(permissions) ? permissions : []
      });

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'USER.CREATED', 'User', $3, $4, 'success', $5)`,
        [orgId, createdBy, user.id, email, JSON.stringify({ role_keys, scope })]
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status
        },
        message: 'User created successfully'
      };
    });
  }

  /**
   * Get all users in an organization
   */
  async getUsers(orgId, options = {}) {
    const { activeOnly = false, page = 0, limit = 50 } = options;
    
    const whereClause = activeOnly ? "AND u.status = 'active'" : '';
    const offset = page * limit;

    const result = await query(
      `SELECT 
        u.id, u.email, u.name, u.status, u.last_login_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'role_key', r.key,
              'role_name', r.name,
              'scope', ra.scope
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as roles
       FROM users u
       JOIN role_assignments ra ON u.id = ra.user_id
       JOIN roles r ON ra.role_id = r.id
       WHERE ra.org_id = $1 
         AND ra.revoked_at IS NULL
         ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $2 OFFSET $3`,
      [orgId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId, orgId, deactivatedBy, reason = null) {
    const SessionService = require('./session.service');
    
    return await transaction(async (client) => {
      // Update user status
      await client.query(
        `UPDATE users 
         SET status = 'disabled', 
             disabled_at = CURRENT_TIMESTAMP,
             disabled_reason = $1
         WHERE id = $2`,
        [reason, userId]
      );

      // Revoke all role assignments
      await client.query(
        `UPDATE role_assignments
         SET revoked_at = CURRENT_TIMESTAMP,
             revoked_by = $1,
             revocation_reason = $2
         WHERE user_id = $3 AND org_id = $4`,
        [deactivatedBy, reason || 'User deactivated', userId, orgId]
      );

      // Force logout
      await SessionService.forceLogout(userId, 'User account deactivated');

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'USER.DEACTIVATED', 'User', $3, 
                (SELECT email FROM users WHERE id = $3),
                'success', $4)`,
        [orgId, deactivatedBy, userId, JSON.stringify({ reason })]
      );

      return { success: true, message: 'User deactivated successfully' };
    });
  }
}

module.exports = new UserService();
