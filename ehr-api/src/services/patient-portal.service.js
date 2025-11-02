const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, transaction } = require('../database/connection');

/**
 * Patient Portal Service
 * Manages patient portal authentication, access control, and audit logging
 */
class PatientPortalService {
  /**
   * Grant portal access to a patient
   */
  async grantPortalAccess(fhirPatientId, email, password, grantedByUserId, orgId) {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Check if patient portal user already exists
      const existingUser = await query(
        'SELECT id, status FROM patient_portal_users WHERE fhir_patient_id = $1',
        [fhirPatientId]
      );

      let portalUser;

      if (existingUser.rows.length > 0) {
        // Update existing user
        const updateResult = await query(
          `UPDATE patient_portal_users
           SET email = $1,
               password_hash = $2,
               status = 'active',
               portal_access_granted_at = CURRENT_TIMESTAMP,
               portal_access_granted_by = $3,
               failed_login_attempts = 0,
               account_locked_until = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE fhir_patient_id = $4
           RETURNING *`,
          [email, passwordHash, grantedByUserId, fhirPatientId]
        );
        portalUser = updateResult.rows[0];

        // Log access update
        await this.logAudit(portalUser.id, 'portal_access_updated', null, null, {
          granted_by: grantedByUserId,
          email: email
        });
      } else {
        // Create new patient portal user
        const insertResult = await query(
          `INSERT INTO patient_portal_users (
            fhir_patient_id, org_id, email, password_hash,
            portal_access_granted_by, status
          ) VALUES ($1, $2, $3, $4, $5, 'active')
          RETURNING *`,
          [fhirPatientId, orgId, email, passwordHash, grantedByUserId]
        );
        portalUser = insertResult.rows[0];

        // Log access grant
        await this.logAudit(portalUser.id, 'portal_access_granted', null, null, {
          granted_by: grantedByUserId,
          email: email
        });
      }

      return {
        id: portalUser.id,
        fhirPatientId: portalUser.fhir_patient_id,
        email: portalUser.email,
        status: portalUser.status,
        portalAccessGrantedAt: portalUser.portal_access_granted_at
      };
    } catch (error) {
      console.error('Error granting portal access:', error);
      throw new Error('Failed to grant portal access: ' + error.message);
    }
  }

  /**
   * Authenticate patient by email and password
   */
  async authenticatePatient(email, password, ipAddress, userAgent) {
    try {
      // Find patient by email
      const userResult = await query(
        `SELECT id, fhir_patient_id, org_id, email, password_hash, status,
                failed_login_attempts, account_locked_until, last_login_at
         FROM patient_portal_users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        // Log failed attempt (no user found)
        await this.logAudit(null, 'login_failed', null, null, {
          email,
          reason: 'User not found',
          ip_address: ipAddress
        }, 'failure');
        throw new Error('Invalid email or password');
      }

      const user = userResult.rows[0];

      // Check if account is locked
      if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
        const minutesRemaining = Math.ceil((new Date(user.account_locked_until) - new Date()) / 60000);
        await this.logAudit(user.id, 'login_failed', null, null, {
          reason: 'Account locked',
          ip_address: ipAddress
        }, 'failure');
        throw new Error(`Account is locked. Try again in ${minutesRemaining} minutes.`);
      }

      // Check account status
      if (user.status !== 'active') {
        await this.logAudit(user.id, 'login_failed', null, null, {
          reason: `Account status: ${user.status}`,
          ip_address: ipAddress
        }, 'failure');
        throw new Error('Account is not active. Please contact support.');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        // Increment failed login attempts
        const newFailedAttempts = user.failed_login_attempts + 1;
        const lockUntil = newFailedAttempts >= 5
          ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
          : null;

        await query(
          `UPDATE patient_portal_users
           SET failed_login_attempts = $1,
               account_locked_until = $2
           WHERE id = $3`,
          [newFailedAttempts, lockUntil, user.id]
        );

        await this.logAudit(user.id, 'login_failed', null, null, {
          reason: 'Invalid password',
          failed_attempts: newFailedAttempts,
          ip_address: ipAddress
        }, 'failure');

        if (newFailedAttempts >= 5) {
          throw new Error('Too many failed attempts. Account locked for 15 minutes.');
        }

        throw new Error('Invalid email or password');
      }

      // Successful login - reset failed attempts and update last login
      await query(
        `UPDATE patient_portal_users
         SET last_login_at = CURRENT_TIMESTAMP,
             failed_login_attempts = 0,
             account_locked_until = NULL
         WHERE id = $1`,
        [user.id]
      );

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await query(
        `INSERT INTO patient_portal_sessions (
          patient_portal_user_id, session_token, ip_address, user_agent, expires_at
        ) VALUES ($1, $2, $3, $4, $5)`,
        [user.id, sessionToken, ipAddress, userAgent, expiresAt]
      );

      // Log successful login
      await this.logAudit(user.id, 'login_success', null, null, {
        ip_address: ipAddress
      }, 'success');

      // Generate JWT token
      const token = this.generateJWT({
        id: user.id,
        fhirPatientId: user.fhir_patient_id,
        email: user.email,
        orgId: user.org_id,
        userType: 'patient'
      });

      return {
        user: {
          id: user.id,
          fhirPatientId: user.fhir_patient_id,
          email: user.email,
          orgId: user.org_id,
          userType: 'patient'
        },
        token,
        sessionToken
      };
    } catch (error) {
      console.error('Patient authentication error:', error);
      throw error;
    }
  }

  /**
   * Check if patient has portal access
   */
  async checkPortalAccess(fhirPatientId) {
    try {
      const result = await query(
        `SELECT id, email, status, portal_access_granted_at, last_login_at
         FROM patient_portal_users
         WHERE fhir_patient_id = $1`,
        [fhirPatientId]
      );

      if (result.rows.length === 0) {
        return {
          hasAccess: false
        };
      }

      const user = result.rows[0];

      return {
        hasAccess: user.status === 'active',
        email: user.email,
        status: user.status,
        grantedAt: user.portal_access_granted_at,
        lastLoginAt: user.last_login_at
      };
    } catch (error) {
      console.error('Error checking portal access:', error);
      throw new Error('Failed to check portal access');
    }
  }

  /**
   * Revoke portal access
   */
  async revokePortalAccess(fhirPatientId, revokedByUserId) {
    try {
      const result = await query(
        `UPDATE patient_portal_users
         SET status = 'disabled',
             updated_at = CURRENT_TIMESTAMP
         WHERE fhir_patient_id = $1
         RETURNING id`,
        [fhirPatientId]
      );

      if (result.rows.length === 0) {
        throw new Error('Patient portal user not found');
      }

      const portalUserId = result.rows[0].id;

      // Invalidate all sessions
      await query(
        'DELETE FROM patient_portal_sessions WHERE patient_portal_user_id = $1',
        [portalUserId]
      );

      // Log revocation
      await this.logAudit(portalUserId, 'portal_access_revoked', null, null, {
        revoked_by: revokedByUserId
      });

      return {
        success: true,
        message: 'Portal access revoked successfully'
      };
    } catch (error) {
      console.error('Error revoking portal access:', error);
      throw error;
    }
  }

  /**
   * Logout patient
   */
  async logout(sessionToken) {
    try {
      const result = await query(
        `DELETE FROM patient_portal_sessions
         WHERE session_token = $1
         RETURNING patient_portal_user_id`,
        [sessionToken]
      );

      if (result.rows.length > 0) {
        await this.logAudit(result.rows[0].patient_portal_user_id, 'logout', null, null, {}, 'success');
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  /**
   * Validate session token
   */
  async validateSession(sessionToken) {
    try {
      const result = await query(
        `SELECT pps.*, ppu.fhir_patient_id, ppu.email, ppu.org_id, ppu.status
         FROM patient_portal_sessions pps
         JOIN patient_portal_users ppu ON pps.patient_portal_user_id = ppu.id
         WHERE pps.session_token = $1
           AND pps.expires_at > CURRENT_TIMESTAMP
           AND ppu.status = 'active'`,
        [sessionToken]
      );

      if (result.rows.length === 0) {
        return { valid: false };
      }

      const session = result.rows[0];

      // Update last activity
      await query(
        'UPDATE patient_portal_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
        [session.id]
      );

      return {
        valid: true,
        user: {
          id: session.patient_portal_user_id,
          fhirPatientId: session.fhir_patient_id,
          email: session.email,
          orgId: session.org_id,
          userType: 'patient'
        }
      };
    } catch (error) {
      console.error('Error validating session:', error);
      return { valid: false };
    }
  }

  /**
   * Change patient password
   */
  async changePassword(patientPortalUserId, oldPassword, newPassword) {
    try {
      const userResult = await query(
        'SELECT password_hash FROM patient_portal_users WHERE id = $1',
        [patientPortalUserId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await query(
        'UPDATE patient_portal_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, patientPortalUserId]
      );

      // Invalidate all existing sessions except current
      await query(
        'DELETE FROM patient_portal_sessions WHERE patient_portal_user_id = $1',
        [patientPortalUserId]
      );

      // Log password change
      await this.logAudit(patientPortalUserId, 'password_changed', null, null, {}, 'success');

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Log audit event
   */
  async logAudit(patientPortalUserId, action, resourceType, resourceId, metadata, status = 'success') {
    try {
      await query(
        `INSERT INTO patient_portal_audit_logs (
          patient_portal_user_id, action, resource_type, resource_id,
          ip_address, user_agent, metadata, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          patientPortalUserId,
          action,
          resourceType,
          resourceId,
          metadata.ip_address || null,
          metadata.user_agent || null,
          JSON.stringify(metadata),
          status
        ]
      );
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Generate JWT token
   */
  generateJWT(payload) {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-min-32-chars';
    return jwt.sign(payload, secret, { expiresIn: '30d' });
  }

  /**
   * Generate session token
   */
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify JWT token
   */
  verifyJWT(token) {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-min-32-chars';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get patient portal statistics for admin dashboard
   */
  async getPortalStats(orgId) {
    try {
      const stats = await query(
        `SELECT
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE status = 'active') as active_users,
          COUNT(*) FILTER (WHERE last_login_at IS NOT NULL) as users_who_logged_in,
          COUNT(*) FILTER (WHERE last_login_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as active_last_30_days,
          COUNT(*) FILTER (WHERE last_login_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as active_last_7_days
         FROM patient_portal_users
         WHERE org_id = $1`,
        [orgId]
      );

      return stats.rows[0];
    } catch (error) {
      console.error('Error getting portal stats:', error);
      throw error;
    }
  }
}

module.exports = new PatientPortalService();
