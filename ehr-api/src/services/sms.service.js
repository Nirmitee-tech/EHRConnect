const twilio = require('twilio');
const { query } = require('../database/connection');
const notificationSettingsService = require('./notification-settings.service');

/**
 * SMS Service
 *
 * Features:
 * - Twilio integration
 * - Database-driven configuration (with .env fallback)
 * - Automatic retry with exponential backoff
 * - Error tracking and logging
 */

class SMSService {
  constructor() {
    this.clientCache = new Map(); // Cache Twilio clients per org
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second initial delay
  }

  /**
   * Get Twilio client for an organization
   */
  async getClient(orgId = null) {
    // Check cache first
    const cacheKey = orgId || 'default';
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey);
    }

    // Get provider config from database or env
    const providerConfig = await notificationSettingsService.getSMSProvider(orgId);

    if (!providerConfig) {
      throw new Error('SMS provider not configured');
    }

    const client = twilio(providerConfig.accountSid, providerConfig.authToken);

    const config = {
      client,
      fromNumber: providerConfig.fromNumber,
    };

    // Cache for future use (cache for 5 minutes)
    this.clientCache.set(cacheKey, config);
    setTimeout(() => this.clientCache.delete(cacheKey), 5 * 60 * 1000);

    console.log(`📱 SMS client initialized for ${cacheKey}`);

    return config;
  }

  /**
   * Send SMS with retry logic
   */
  async sendSMS(options, retryCount = 0) {
    const {
      to,
      message,
      orgId = null,
      metadata = {},
    } = options;

    try {
      const { client, fromNumber } = await this.getClient(orgId);

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      });

      console.log('✅ SMS sent successfully:', {
        to: this.maskPhoneNumber(to),
        sid: result.sid,
        status: result.status,
        retryCount,
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        retryCount,
      };
    } catch (error) {
      console.error(`❌ SMS send failed (attempt ${retryCount + 1}):`, {
        to: this.maskPhoneNumber(to),
        error: error.message,
      });

      // Retry logic with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.log(`⏳ Retrying SMS send in ${delay}ms...`);

        await this.sleep(delay);
        return this.sendSMS(options, retryCount + 1);
      }

      // Max retries exceeded
      return {
        success: false,
        error: error.message,
        retryCount,
      };
    }
  }

  /**
   * Send MFA code via SMS
   */
  async sendMFACode(phoneNumber, code, purpose = 'login', orgId = null) {
    const expiryMinutes = parseInt(process.env.MFA_CODE_EXPIRY_MINUTES || '10');

    const message = `Your EHR Connect verification code is: ${code}. Valid for ${expiryMinutes} minutes. Do not share this code.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
      orgId,
      metadata: {
        purpose,
        type: 'mfa_code',
      },
    });
  }

  /**
   * Send SMS with database tracking
   */
  async sendMFACodeWithTracking(phoneNumber, code, mfaCodeId, purpose = 'login', orgId = null) {
    const result = await this.sendMFACode(phoneNumber, code, purpose, orgId);

    // Update database with send status
    await query(
      `UPDATE mfa_codes
       SET email_sent = $1,
           email_sent_at = CASE WHEN $1 THEN CURRENT_TIMESTAMP ELSE email_sent_at END,
           email_error = $2,
           email_retry_count = $3
       WHERE id = $4`,
      [result.success, result.error || null, result.retryCount, mfaCodeId]
    );

    return result;
  }

  /**
   * Mask phone number for security
   */
  maskPhoneNumber(phone) {
    if (!phone || phone.length < 4) return phone;
    const last4 = phone.slice(-4);
    return `***${last4}`;
  }

  /**
   * Clear client cache (useful when settings are updated)
   */
  clearCache(orgId = null) {
    if (orgId) {
      this.clientCache.delete(orgId);
    } else {
      this.clientCache.clear();
    }
  }

  /**
   * Verify SMS provider configuration
   */
  async verifyConnection(orgId = null) {
    try {
      const { client, fromNumber } = await this.getClient(orgId);

      // Verify by fetching account info
      const account = await client.api.accounts.list({ limit: 1 });

      console.log('✅ SMS service connection verified');
      return {
        success: true,
        fromNumber,
      };
    } catch (error) {
      console.error('❌ SMS service connection failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Helper: Sleep function for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
module.exports = new SMSService();
