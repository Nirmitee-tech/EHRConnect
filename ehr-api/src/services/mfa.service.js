const crypto = require('crypto');
const { query, transaction } = require('../database/connection');
const emailService = require('./email.service');
const smsService = require('./sms.service');

/**
 * Multi-Factor Authentication Service
 *
 * Handles:
 * - MFA code generation and verification
 * - User and global 2FA settings management
 * - Email and SMS-based 2FA workflow
 * - Rate limiting and security checks
 */

class MFAService {
  constructor() {
    this.codeLength = parseInt(process.env.MFA_CODE_LENGTH || '6');
    this.codeExpiryMinutes = parseInt(process.env.MFA_CODE_EXPIRY_MINUTES || '10');
    this.maxAttempts = parseInt(process.env.MFA_MAX_ATTEMPTS || '3');
  }

  /**
   * Generate random numeric code
   */
  generateCode(length = this.codeLength) {
    const digits = '0123456789';
    let code = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      code += digits[randomBytes[i] % digits.length];
    }

    return code;
  }

  /**
   * Check if 2FA is required for a user
   */
  async is2FARequired(userId, orgId) {
    // Check global settings first
    const globalResult = await query(
      `SELECT enabled, enforcement_level, grace_period_days
       FROM global_2fa_settings
       WHERE org_id = $1`,
      [orgId]
    );

    if (globalResult.rows.length === 0) {
      return { required: false, reason: 'not_configured' };
    }

    const globalSettings = globalResult.rows[0];

    if (!globalSettings.enabled || globalSettings.enforcement_level === 'disabled') {
      return { required: false, reason: 'disabled_globally' };
    }

    // Check user settings
    const userResult = await query(
      `SELECT enabled, verified, created_at
       FROM user_2fa_settings
       WHERE user_id = $1`,
      [userId]
    );

    const userSettings = userResult.rows[0];

    // If mandatory, 2FA is required
    if (globalSettings.enforcement_level === 'mandatory') {
      if (!userSettings || !userSettings.enabled || !userSettings.verified) {
        return {
          required: true,
          reason: 'mandatory',
          needsSetup: !userSettings || !userSettings.verified,
        };
      }
      return { required: true, reason: 'mandatory', needsSetup: false };
    }

    // If optional, check if user has enabled it
    if (globalSettings.enforcement_level === 'optional') {
      if (userSettings && userSettings.enabled && userSettings.verified) {
        return { required: true, reason: 'user_enabled', needsSetup: false };
      }
      return { required: false, reason: 'optional_not_enabled' };
    }

    return { required: false, reason: 'unknown' };
  }

  /**
   * Generate and send MFA code (Email or SMS)
   */
  async generateAndSendCode(userId, purpose = 'login', ipAddress = null, userAgent = null) {
    return await transaction(async (client) => {
      // Get user info and MFA settings
      const userResult = await client.query(
        `SELECT u.id, u.email, u.name, ra.org_id, ufs.method, ufs.phone_number
         FROM users u
         LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.revoked_at IS NULL
         LEFT JOIN user_2fa_settings ufs ON u.id = ufs.user_id
         WHERE u.id = $1
         LIMIT 1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];
      const method = user.method || 'email'; // Default to email
      const orgId = user.org_id;

      // Validate SMS requirements
      if (method === 'sms' && !user.phone_number) {
        throw new Error('Phone number not configured for SMS authentication');
      }

      // Generate code
      const code = this.generateCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.codeExpiryMinutes);

      // Invalidate previous codes for this user and purpose
      await client.query(
        `UPDATE mfa_codes
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{invalidated}',
           'true'
         )
         WHERE user_id = $1
           AND purpose = $2
           AND verified_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP`,
        [userId, purpose]
      );

      // Insert new code
      const sentTo = method === 'sms' ? user.phone_number : user.email;
      const insertResult = await client.query(
        `INSERT INTO mfa_codes (
          user_id, code, method, purpose, expires_at,
          max_attempts, ip_address, user_agent, sent_to
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, code, expires_at`,
        [userId, code, method, purpose, expiresAt, this.maxAttempts, ipAddress, userAgent, sentTo]
      );

      const mfaCode = insertResult.rows[0];

      // Send via email or SMS
      let sendResult;
      if (method === 'sms') {
        sendResult = await smsService.sendMFACodeWithTracking(
          user.phone_number,
          code,
          mfaCode.id,
          purpose,
          orgId
        );
      } else {
        sendResult = await emailService.sendMFACodeWithTracking(
          user,
          code,
          mfaCode.id,
          purpose,
          orgId
        );
      }

      if (!sendResult.success) {
        throw new Error(`Failed to send MFA code: ${sendResult.error}`);
      }

      const maskedDestination =
        method === 'sms'
          ? smsService.maskPhoneNumber(user.phone_number)
          : this.maskEmail(user.email);

      return {
        success: true,
        method,
        codeId: mfaCode.id,
        expiresAt: mfaCode.expires_at,
        sentTo: maskedDestination,
      };
    });
  }

  /**
   * Verify MFA code
   */
  async verifyCode(userId, code, purpose = 'login') {
    return await transaction(async (client) => {
      // Find valid code
      const codeResult = await client.query(
        `SELECT id, code, attempts, max_attempts, expires_at, verified_at, metadata
         FROM mfa_codes
         WHERE user_id = $1
           AND purpose = $2
           AND verified_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP
           AND (metadata->>'invalidated')::boolean IS NOT TRUE
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, code, purpose]
      );

      if (codeResult.rows.length === 0) {
        return {
          success: false,
          error: 'invalid_or_expired',
          message: 'Invalid or expired verification code',
        };
      }

      const mfaCode = codeResult.rows[0];

      // Check attempts
      if (mfaCode.attempts >= mfaCode.max_attempts) {
        return {
          success: false,
          error: 'max_attempts',
          message: 'Maximum verification attempts exceeded',
        };
      }

      // Increment attempts
      await client.query(
        'UPDATE mfa_codes SET attempts = attempts + 1 WHERE id = $1',
        [mfaCode.id]
      );

      // Verify code
      if (mfaCode.code !== code) {
        const remainingAttempts = mfaCode.max_attempts - (mfaCode.attempts + 1);
        return {
          success: false,
          error: 'incorrect_code',
          message: 'Incorrect verification code',
          remainingAttempts: Math.max(0, remainingAttempts),
        };
      }

      // Mark as verified
      await client.query(
        'UPDATE mfa_codes SET verified_at = CURRENT_TIMESTAMP WHERE id = $1',
        [mfaCode.id]
      );

      // Update user's last_used_at if this is for login
      if (purpose === 'login') {
        await client.query(
          `UPDATE user_2fa_settings
           SET last_used_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId]
        );
      }

      return {
        success: true,
        message: 'Code verified successfully',
      };
    });
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId, method = 'email', phoneNumber = null) {
    return await transaction(async (client) => {
      // Validate method
      if (!['email', 'sms'].includes(method)) {
        throw new Error('Invalid method. Must be "email" or "sms"');
      }

      // Validate phone number for SMS
      if (method === 'sms' && !phoneNumber) {
        throw new Error('Phone number is required for SMS authentication');
      }

      // Check if already exists
      const existingResult = await client.query(
        'SELECT id, enabled FROM user_2fa_settings WHERE user_id = $1',
        [userId]
      );

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        if (existing.enabled) {
          throw new Error('2FA is already enabled for this user');
        }

        // Update existing record
        await client.query(
          `UPDATE user_2fa_settings
           SET enabled = true, method = $2, phone_number = $3, verified = false, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId, method, phoneNumber]
        );
      } else {
        // Insert new record
        await client.query(
          `INSERT INTO user_2fa_settings (user_id, enabled, method, phone_number, verified)
           VALUES ($1, true, $2, $3, false)`,
          [userId, method, phoneNumber]
        );
      }

      // Generate verification code
      const codeResult = await this.generateAndSendCode(userId, 'setup');

      const destination = method === 'sms' ? 'phone' : 'email';

      return {
        success: true,
        message: `2FA setup initiated. Please verify your ${destination}.`,
        ...codeResult,
      };
    });
  }

  /**
   * Verify 2FA setup
   */
  async verify2FASetup(userId, code) {
    return await transaction(async (client) => {
      // Verify the code
      const verifyResult = await this.verifyCode(userId, code, 'setup');

      if (!verifyResult.success) {
        return verifyResult;
      }

      // Mark user's 2FA as verified
      await client.query(
        `UPDATE user_2fa_settings
         SET verified = true, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId]
      );

      // Get user info for email
      const userResult = await client.query(
        'SELECT u.email, u.name, ra.org_id FROM users u LEFT JOIN role_assignments ra ON u.id = ra.user_id WHERE u.id = $1 LIMIT 1',
        [userId]
      );

      const user = userResult.rows[0];

      // Send confirmation email
      await emailService.send2FASetupConfirmation(user, user.org_id);

      return {
        success: true,
        message: '2FA has been successfully enabled',
      };
    });
  }

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId) {
    return await transaction(async (client) => {
      // Get user info first
      const userResult = await client.query(
        'SELECT u.email, u.name, ra.org_id FROM users u LEFT JOIN role_assignments ra ON u.id = ra.user_id WHERE u.id = $1 LIMIT 1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Disable 2FA
      await client.query(
        `UPDATE user_2fa_settings
         SET enabled = false, verified = false, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId]
      );

      // Send notification email
      await emailService.send2FADisabledNotification(user, user.org_id);

      return {
        success: true,
        message: '2FA has been disabled',
      };
    });
  }

  /**
   * Get user 2FA settings
   */
  async getUserSettings(userId) {
    const result = await query(
      `SELECT enabled, method, phone_number, verified, last_used_at, created_at, updated_at
       FROM user_2fa_settings
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        enabled: false,
        verified: false,
        method: null,
        phone_number: null,
      };
    }

    // Mask phone number for security
    const settings = result.rows[0];
    if (settings.phone_number) {
      settings.phone_number_masked = smsService.maskPhoneNumber(settings.phone_number);
      delete settings.phone_number; // Don't expose full phone number
    }

    return settings;
  }

  /**
   * Get global 2FA settings
   */
  async getGlobalSettings(orgId) {
    const result = await query(
      `SELECT enabled, enforcement_level, allowed_methods, grace_period_days, config
       FROM global_2fa_settings
       WHERE org_id = $1`,
      [orgId]
    );

    if (result.rows.length === 0) {
      // Return defaults
      return {
        enabled: false,
        enforcement_level: 'optional',
        allowed_methods: ['email'],
        grace_period_days: 0,
        config: {},
      };
    }

    return result.rows[0];
  }

  /**
   * Update global 2FA settings (admin only)
   */
  async updateGlobalSettings(orgId, settings, updatedBy) {
    const {
      enabled,
      enforcement_level,
      allowed_methods,
      grace_period_days,
      config,
    } = settings;

    const result = await query(
      `INSERT INTO global_2fa_settings (
        org_id, enabled, enforcement_level, allowed_methods,
        grace_period_days, config, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (org_id)
      DO UPDATE SET
        enabled = EXCLUDED.enabled,
        enforcement_level = EXCLUDED.enforcement_level,
        allowed_methods = EXCLUDED.allowed_methods,
        grace_period_days = EXCLUDED.grace_period_days,
        config = EXCLUDED.config,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        orgId,
        enabled,
        enforcement_level,
        JSON.stringify(allowed_methods || ['email']),
        grace_period_days || 0,
        JSON.stringify(config || {}),
        updatedBy,
      ]
    );

    return result.rows[0];
  }

  /**
   * Mask email for security
   */
  maskEmail(email) {
    const [username, domain] = email.split('@');
    const maskedUsername =
      username.length > 2
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : username;
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Clean up expired codes (can be run periodically)
   */
  async cleanupExpiredCodes() {
    const result = await query(
      `DELETE FROM mfa_codes
       WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
          OR (verified_at IS NOT NULL AND verified_at < CURRENT_TIMESTAMP - INTERVAL '7 days')
       RETURNING id`
    );

    return {
      success: true,
      deletedCount: result.rowCount,
    };
  }

  /**
   * Get MFA statistics for a user
   */
  async getUserMFAStats(userId) {
    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE verified_at IS NOT NULL) as successful_verifications,
         COUNT(*) FILTER (WHERE verified_at IS NULL AND expires_at < CURRENT_TIMESTAMP) as expired_codes,
         COUNT(*) FILTER (WHERE attempts >= max_attempts) as failed_attempts,
         MAX(created_at) as last_code_sent
       FROM mfa_codes
       WHERE user_id = $1
         AND created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'`,
      [userId]
    );

    return result.rows[0];
  }
}

module.exports = new MFAService();
