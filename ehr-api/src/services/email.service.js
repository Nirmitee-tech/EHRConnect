const nodemailer = require('nodemailer');
const { query } = require('../database/connection');
const notificationSettingsService = require('./notification-settings.service');

/**
 * Email Service with Retry Logic
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Email queue management
 * - Template support
 * - Error tracking and logging
 * - Database-driven configuration (with .env fallback)
 * - Support for MailHog (dev) and production SMTP
 */

class EmailService {
  constructor() {
    this.transporterCache = new Map(); // Cache transporters per org
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second initial delay
  }

  /**
   * Get transporter for an organization
   * Reads from database or falls back to .env
   */
  async getTransporter(orgId = null) {
    // Check cache first
    const cacheKey = orgId || 'default';
    if (this.transporterCache.has(cacheKey)) {
      return this.transporterCache.get(cacheKey);
    }

    // Get provider config from database or env
    const providerConfig = await notificationSettingsService.getEmailProvider(orgId);

    const config = {
      host: providerConfig.host,
      port: providerConfig.port,
      secure: providerConfig.secure,
      auth: providerConfig.auth,
    };

    const transporter = nodemailer.createTransport(config);

    // Cache for future use (cache for 5 minutes)
    this.transporterCache.set(cacheKey, transporter);
    setTimeout(() => this.transporterCache.delete(cacheKey), 5 * 60 * 1000);

    console.log(`📧 Email transporter initialized for ${cacheKey}:`, {
      host: config.host,
      port: config.port,
      secure: config.secure,
      hasAuth: !!config.auth,
    });

    return { transporter, from: providerConfig.from };
  }

  /**
   * Send email with retry logic
   */
  async sendEmail(options, retryCount = 0) {
    const {
      to,
      subject,
      html,
      text,
      orgId = null,
      metadata = {},
    } = options;

    // Get transporter and from config for the organization
    const { transporter, from: fromConfig } = await this.getTransporter(orgId);

    const mailOptions = {
      from: `"${fromConfig.name}" <${fromConfig.address}>`,
      to,
      subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, ''),
    };

    try {
      const info = await transporter.sendMail(mailOptions);

      console.log('✅ Email sent successfully:', {
        to,
        subject,
        messageId: info.messageId,
        retryCount,
      });

      return {
        success: true,
        messageId: info.messageId,
        retryCount,
      };
    } catch (error) {
      console.error(`❌ Email send failed (attempt ${retryCount + 1}):`, {
        to,
        subject,
        error: error.message,
      });

      // Retry logic with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.log(`⏳ Retrying email send in ${delay}ms...`);

        await this.sleep(delay);
        return this.sendEmail(options, retryCount + 1);
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
   * Send MFA code email
   */
  async sendMFACode(user, code, purpose = 'login', orgId = null) {
    const expiryMinutes = parseInt(process.env.MFA_CODE_EXPIRY_MINUTES || '10');
    const purposeText = {
      login: 'sign in to your account',
      setup: 'set up two-factor authentication',
      verify: 'verify your identity',
      backup: 'use your backup code',
    }[purpose] || 'authenticate';

    const html = this.getMFACodeEmailTemplate({
      userName: user.name || user.email,
      code,
      purpose: purposeText,
      expiryMinutes,
    });

    return this.sendEmail({
      to: user.email,
      subject: `Your verification code: ${code}`,
      html,
      orgId,
      metadata: {
        userId: user.id,
        purpose,
        type: 'mfa_code',
      },
    });
  }

  /**
   * Send 2FA setup completion email
   */
  async send2FASetupConfirmation(user, orgId = null) {
    const html = this.get2FASetupEmailTemplate({
      userName: user.name || user.email,
    });

    return this.sendEmail({
      to: user.email,
      subject: 'Two-Factor Authentication Enabled',
      html,
      orgId,
      metadata: {
        userId: user.id,
        type: '2fa_setup',
      },
    });
  }

  /**
   * Send 2FA disabled notification
   */
  async send2FADisabledNotification(user, orgId = null) {
    const html = this.get2FADisabledEmailTemplate({
      userName: user.name || user.email,
    });

    return this.sendEmail({
      to: user.email,
      subject: 'Two-Factor Authentication Disabled',
      html,
      orgId,
      metadata: {
        userId: user.id,
        type: '2fa_disabled',
      },
    });
  }

  /**
   * Send email with database tracking
   * Updates mfa_codes table with send status
   */
  async sendMFACodeWithTracking(user, code, mfaCodeId, purpose = 'login', orgId = null) {
    const result = await this.sendMFACode(user, code, purpose, orgId);

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
   * Get MFA code email template
   */
  getMFACodeEmailTemplate({ userName, code, purpose, expiryMinutes }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
    }
    .code-box {
      background-color: #f8f9fa;
      border: 2px dashed #2563eb;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #2563eb;
      font-family: 'Courier New', monospace;
    }
    .info {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏥 EHR Connect</div>
    </div>

    <h2>Hello ${userName},</h2>

    <p>You requested a verification code to ${purpose}.</p>

    <div class="code-box">
      <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Your verification code is:</div>
      <div class="code">${code}</div>
    </div>

    <div class="info">
      <strong>⏰ This code will expire in ${expiryMinutes} minutes</strong>
    </div>

    <p>Enter this code in the application to continue. For your security, this code can only be used once.</p>

    <div class="warning">
      <strong>⚠️ Security Notice</strong><br>
      If you didn't request this code, please ignore this email and consider changing your password.
    </div>

    <div class="footer">
      <p>This is an automated message from EHR Connect. Please do not reply to this email.</p>
      <p style="margin-top: 10px; font-size: 12px;">
        If you're having trouble, please contact support at support@ehrconnect.com
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get 2FA setup confirmation email template
   */
  get2FASetupEmailTemplate({ userName }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Two-Factor Authentication Enabled</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
    }
    .success-icon {
      text-align: center;
      font-size: 64px;
      margin: 30px 0;
    }
    .info {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏥 EHR Connect</div>
    </div>

    <div class="success-icon">✅</div>

    <h2>Hello ${userName},</h2>

    <p>Two-factor authentication (2FA) has been successfully enabled on your account.</p>

    <div class="info">
      <strong>🔒 Your account is now more secure!</strong><br>
      From now on, you'll need to enter a verification code sent to your email when signing in.
    </div>

    <h3>What this means:</h3>
    <ul>
      <li>Each time you sign in, you'll receive a verification code via email</li>
      <li>You'll need to enter this code to complete your login</li>
      <li>This helps protect your account from unauthorized access</li>
    </ul>

    <p><strong>Important:</strong> Make sure you have access to this email address to receive verification codes.</p>

    <div class="footer">
      <p>If you didn't enable 2FA, please contact support immediately at support@ehrconnect.com</p>
      <p style="margin-top: 10px; font-size: 12px;">
        This is an automated message from EHR Connect.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get 2FA disabled email template
   */
  get2FADisabledEmailTemplate({ userName }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Two-Factor Authentication Disabled</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
    }
    .warning-icon {
      text-align: center;
      font-size: 64px;
      margin: 30px 0;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏥 EHR Connect</div>
    </div>

    <div class="warning-icon">⚠️</div>

    <h2>Hello ${userName},</h2>

    <p>Two-factor authentication (2FA) has been disabled on your account.</p>

    <div class="warning">
      <strong>⚠️ Security Notice</strong><br>
      Your account is now less secure. We strongly recommend keeping 2FA enabled to protect your account.
    </div>

    <p>If you disabled 2FA yourself, you can ignore this email. However, if you did not make this change, please:</p>

    <ul>
      <li>Change your password immediately</li>
      <li>Re-enable two-factor authentication</li>
      <li>Contact support if you suspect unauthorized access</li>
    </ul>

    <div class="footer">
      <p>If you didn't disable 2FA, please contact support immediately at support@ehrconnect.com</p>
      <p style="margin-top: 10px; font-size: 12px;">
        This is an automated message from EHR Connect.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Verify transporter configuration
   */
  async verifyConnection(orgId = null) {
    try {
      const { transporter } = await this.getTransporter(orgId);
      await transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }

  /**
   * Clear transporter cache (useful when settings are updated)
   */
  clearCache(orgId = null) {
    if (orgId) {
      this.transporterCache.delete(orgId);
    } else {
      this.transporterCache.clear();
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
module.exports = new EmailService();
