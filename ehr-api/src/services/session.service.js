const KeycloakService = require('./keycloak.service');
const { query } = require('../database/connection');

/**
 * Session Management Service
 * Handles session validation and forced logout
 */

class SessionService {
  /**
   * Force logout user (revoke all sessions)
   * Called when user is disabled or roles revoked
   */
  async forceLogout(userId, reason) {
    const result = await query(
      'SELECT keycloak_user_id, email FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Revoke all Keycloak sessions
    await KeycloakService.logoutUser(user.keycloak_user_id);

    // Log the forced logout
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata
      )
      SELECT 
        ra.org_id, $2, 'AUTH.FORCED_LOGOUT', 'User', $1,
        $3, 'success', $4
      FROM role_assignments ra
      WHERE ra.user_id = $1
      LIMIT 1`,
      [userId, userId, user.email, JSON.stringify({ reason })]
    );

    return { success: true, message: 'User sessions revoked' };
  }

  /**
   * Check if user session is still valid
   */
  async validateUserSession(userId, orgId) {
    const result = await query(
      `SELECT u.status, ra.revoked_at
       FROM users u
       LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.org_id = $2
       WHERE u.id = $1
       LIMIT 1`,
      [userId, orgId]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'User not found in organization' };
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return { valid: false, reason: 'User account is not active' };
    }

    if (user.revoked_at) {
      return { valid: false, reason: 'User access has been revoked' };
    }

    return { valid: true };
  }
}

module.exports = new SessionService();
