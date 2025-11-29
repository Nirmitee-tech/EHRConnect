const crypto = require('crypto');
const { query, transaction } = require('../database/connection');
const KeycloakService = require('./keycloak.service');
const postgresAuthService = require('./postgres-auth.service');

// Get AUTH_PROVIDER from environment
const AUTH_PROVIDER = process.env.AUTH_PROVIDER || 'keycloak';

/**
 * Authentication Service
 * Handles password reset and email verification
 * Supports both Keycloak and Postgres authentication
 */

class AuthService {
  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const userResult = await query(
      'SELECT id, keycloak_user_id, email, name FROM users WHERE email = $1 AND status = \'active\'',
      [email]
    );

    if (userResult.rows.length === 0) {
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    const user = userResult.rows[0];

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      `INSERT INTO email_verifications (email, token, type, expires_at)
       VALUES ($1, $2, 'password_reset', $3)`,
      [email, token, expiresAt]
    );

    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status
      )
      SELECT ra.org_id, $1, 'AUTH.PASSWORD_RESET_REQUESTED', 'User', $1, $2, 'success'
      FROM role_assignments ra
      WHERE ra.user_id = $1
      LIMIT 1`,
      [user.id, email]
    );

    console.log(`Password reset requested for ${email}. Token: ${token}`);

    return { success: true, message: 'Password reset email sent', token };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    return await transaction(async (client) => {
      const tokenResult = await client.query(
        `SELECT ev.*, u.id as user_id, u.keycloak_user_id, u.email
         FROM email_verifications ev
         JOIN users u ON ev.email = u.email
         WHERE ev.token = $1 AND ev.type = 'password_reset'
           AND ev.expires_at > CURRENT_TIMESTAMP
           AND ev.verified_at IS NULL`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const verification = tokenResult.rows[0];

      // Reset password based on AUTH_PROVIDER
      if (AUTH_PROVIDER === 'postgres') {
        // Direct postgres password reset
        await postgresAuthService.resetPassword(verification.user_id, newPassword);
      } else {
        // Keycloak password reset
        if (!verification.keycloak_user_id) {
          throw new Error('User not configured for Keycloak authentication');
        }
        await KeycloakService.resetPassword(
          verification.keycloak_user_id,
          newPassword,
          false
        );
        await KeycloakService.logoutUser(verification.keycloak_user_id);
      }

      // Mark token as verified
      await client.query(
        'UPDATE email_verifications SET verified_at = CURRENT_TIMESTAMP WHERE token = $1',
        [token]
      );

      // Log audit event
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status
        )
        SELECT ra.org_id, $1, 'AUTH.PASSWORD_RESET_COMPLETED', 'User', $1, $2, 'success'
        FROM role_assignments ra
        WHERE ra.user_id = $1
        LIMIT 1`,
        [verification.user_id, verification.email]
      );

      return { success: true, message: 'Password reset successfully' };
    });
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email) {
    const userResult = await query(
      'SELECT keycloak_user_id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return { success: true, message: 'If the email exists, verification has been sent' };
    }

    await KeycloakService.sendVerifyEmail(userResult.rows[0].keycloak_user_id);

    return { success: true, message: 'Verification email sent' };
  }
}

module.exports = new AuthService();
