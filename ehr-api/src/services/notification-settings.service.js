const { query, transaction } = require('../database/connection');

/**
 * Notification Settings Service
 *
 * Manages notification provider configurations (Email, SMS, Push)
 * Allows admins to configure providers through UI instead of .env
 */

class NotificationSettingsService {
  /**
   * Get provider by type for an organization
   */
  async getProvider(orgId, providerType, providerName = null) {
    let queryText;
    let params;

    if (providerName) {
      queryText = `
        SELECT * FROM notification_providers
        WHERE org_id = $1 AND provider_type = $2 AND provider_name = $3
        AND enabled = true
        LIMIT 1
      `;
      params = [orgId, providerType, providerName];
    } else {
      // Get default provider for the type
      queryText = `
        SELECT * FROM notification_providers
        WHERE org_id = $1 AND provider_type = $2 AND enabled = true
        ORDER BY is_default DESC, created_at DESC
        LIMIT 1
      `;
      params = [orgId, providerType];
    }

    const result = await query(queryText, params);
    return result.rows[0] || null;
  }

  /**
   * Get all providers for an organization
   */
  async getAllProviders(orgId, providerType = null) {
    let queryText = `
      SELECT * FROM notification_providers
      WHERE org_id = $1
    `;
    const params = [orgId];

    if (providerType) {
      queryText += ` AND provider_type = $2`;
      params.push(providerType);
    }

    queryText += ` ORDER BY provider_type, is_default DESC, created_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Create or update a provider
   */
  async upsertProvider(orgId, providerData, userId) {
    return await transaction(async (client) => {
      const {
        provider_type,
        provider_name,
        enabled,
        is_default,
        config,
        credentials,
        metadata,
      } = providerData;

      // If setting as default, unset other defaults for the same type
      if (is_default) {
        await client.query(
          `UPDATE notification_providers
           SET is_default = false
           WHERE org_id = $1 AND provider_type = $2 AND is_default = true`,
          [orgId, provider_type]
        );
      }

      // Upsert provider
      const result = await client.query(
        `INSERT INTO notification_providers (
          org_id, provider_type, provider_name, enabled, is_default,
          config, credentials, metadata, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
        ON CONFLICT (org_id, provider_type, provider_name)
        DO UPDATE SET
          enabled = EXCLUDED.enabled,
          is_default = EXCLUDED.is_default,
          config = EXCLUDED.config,
          credentials = EXCLUDED.credentials,
          metadata = EXCLUDED.metadata,
          updated_by = EXCLUDED.updated_by,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          orgId,
          provider_type,
          provider_name,
          enabled,
          is_default,
          JSON.stringify(config),
          JSON.stringify(credentials),
          JSON.stringify(metadata || {}),
          userId,
        ]
      );

      return result.rows[0];
    });
  }

  /**
   * Delete a provider
   */
  async deleteProvider(orgId, providerId, userId) {
    const result = await query(
      `DELETE FROM notification_providers
       WHERE id = $1 AND org_id = $2
       RETURNING *`,
      [providerId, orgId]
    );

    if (result.rowCount === 0) {
      throw new Error('Provider not found');
    }

    return { success: true, deleted: result.rows[0] };
  }

  /**
   * Test provider configuration
   */
  async testProvider(orgId, providerId) {
    const result = await query(
      'SELECT * FROM notification_providers WHERE id = $1 AND org_id = $2',
      [providerId, orgId]
    );

    if (result.rows.length === 0) {
      throw new Error('Provider not found');
    }

    const provider = result.rows[0];

    // Test based on provider type
    switch (provider.provider_type) {
      case 'email_smtp':
        return await this.testEmailProvider(provider);
      case 'sms_twilio':
      case 'sms_aws':
        return await this.testSMSProvider(provider);
      default:
        throw new Error(`Testing not supported for ${provider.provider_type}`);
    }
  }

  /**
   * Test email provider
   */
  async testEmailProvider(provider) {
    try {
      const nodemailer = require('nodemailer');

      const config = {
        host: provider.config.host,
        port: provider.config.port,
        secure: provider.config.secure || false,
      };

      if (provider.credentials.user && provider.credentials.password) {
        config.auth = {
          user: provider.credentials.user,
          pass: provider.credentials.password,
        };
      }

      const transporter = nodemailer.createTransport(config);
      await transporter.verify();

      return {
        success: true,
        message: 'Email provider connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: `Email provider test failed: ${error.message}`,
      };
    }
  }

  /**
   * Test SMS provider
   */
  async testSMSProvider(provider) {
    try {
      if (provider.provider_type === 'sms_twilio') {
        // Twilio test (without actually sending)
        const twilio = require('twilio');
        const client = twilio(
          provider.credentials.account_sid,
          provider.credentials.auth_token
        );

        // Just verify credentials by fetching account info
        await client.api.accounts(provider.credentials.account_sid).fetch();

        return {
          success: true,
          message: 'Twilio provider connection successful',
        };
      }

      throw new Error('Unsupported SMS provider');
    } catch (error) {
      return {
        success: false,
        message: `SMS provider test failed: ${error.message}`,
      };
    }
  }

  /**
   * Get email provider for an organization
   * Fallback to env variables if no DB config
   */
  async getEmailProvider(orgId) {
    if (orgId) {
      const provider = await this.getProvider(orgId, 'email_smtp');
      if (provider) {
        return {
          host: provider.config.host,
          port: provider.config.port,
          secure: provider.config.secure || false,
          auth: provider.credentials.user
            ? {
                user: provider.credentials.user,
                pass: provider.credentials.password,
              }
            : undefined,
          from: {
            name: provider.config.from_name || 'EHR Connect',
            address: provider.config.from_email || 'noreply@ehrconnect.com',
          },
        };
      }
    }

    // Fallback to environment variables
    return {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      from: {
        name: process.env.SMTP_FROM_NAME || 'EHR Connect',
        address: process.env.SMTP_FROM_EMAIL || 'noreply@ehrconnect.com',
      },
    };
  }

  /**
   * Get SMS provider for an organization
   */
  async getSMSProvider(orgId) {
    if (orgId) {
      const provider = await this.getProvider(orgId, 'sms_twilio');
      if (provider) {
        return {
          type: 'twilio',
          accountSid: provider.credentials.account_sid,
          authToken: provider.credentials.auth_token,
          fromNumber: provider.config.from_number,
        };
      }
    }

    // Fallback to environment variables
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return {
        type: 'twilio',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      };
    }

    return null;
  }
}

module.exports = new NotificationSettingsService();
