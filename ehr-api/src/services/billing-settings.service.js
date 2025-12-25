/**
 * Billing Settings Service
 * Handles billing tenant settings and configuration
 */

const { pool } = require('../database/connection');
const crypto = require('crypto');

class BillingSettingsService {
  constructor() {
    this.encryptionKey = process.env.CLAIMMD_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Simple encryption
   */
  encrypt(text) {
    if (!text) return null;
    try {
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Simple decryption
   */
  decrypt(encryptedText) {
    if (!encryptedText) return null;
    try {
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Get billing settings for organization
   */
  async getSettings(orgId, includeSensitive = false) {
    const result = await pool.query(
      'SELECT * FROM billing_tenant_settings WHERE org_id = $1',
      [orgId]
    );

    const settings = result.rows[0];
    if (!settings) return null;

    if (!includeSensitive) {
      settings.claim_md_account_key = settings.claim_md_account_key ? '***masked***' : null;
      settings.claim_md_token = settings.claim_md_token ? '***masked***' : null;
      settings.claim_md_account_key_encrypted = settings.claim_md_account_key_encrypted ? '***masked***' : null;
      settings.claim_md_token_encrypted = settings.claim_md_token_encrypted ? '***masked***' : null;
    }

    return settings;
  }

  /**
   * Create or update billing settings
   */
  async upsertSettings(orgId, settingsData) {
    const {
      claim_md_account_key,
      claim_md_token,
      claim_md_api_url = 'https://api.claim.md/v1',
      billing_settings = {},
      collection_settings = {},
      approval_thresholds = {},
      statement_settings = {},
      settings = {},
      active = true
    } = settingsData;

    // Encrypt credentials if provided
    const claim_md_account_key_encrypted = claim_md_account_key ? this.encrypt(claim_md_account_key) : null;
    const claim_md_token_encrypted = claim_md_token ? this.encrypt(claim_md_token) : null;

    const result = await pool.query(
      `INSERT INTO billing_tenant_settings 
       (org_id, claim_md_account_key, claim_md_token, claim_md_account_key_encrypted, 
        claim_md_token_encrypted, claim_md_api_url, billing_settings, collection_settings,
        approval_thresholds, statement_settings, settings, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (org_id) DO UPDATE SET
         claim_md_account_key = COALESCE(EXCLUDED.claim_md_account_key, billing_tenant_settings.claim_md_account_key),
         claim_md_token = COALESCE(EXCLUDED.claim_md_token, billing_tenant_settings.claim_md_token),
         claim_md_account_key_encrypted = COALESCE(EXCLUDED.claim_md_account_key_encrypted, billing_tenant_settings.claim_md_account_key_encrypted),
         claim_md_token_encrypted = COALESCE(EXCLUDED.claim_md_token_encrypted, billing_tenant_settings.claim_md_token_encrypted),
         claim_md_api_url = EXCLUDED.claim_md_api_url,
         billing_settings = EXCLUDED.billing_settings,
         collection_settings = EXCLUDED.collection_settings,
         approval_thresholds = EXCLUDED.approval_thresholds,
         statement_settings = EXCLUDED.statement_settings,
         settings = EXCLUDED.settings,
         active = EXCLUDED.active
       RETURNING *`,
      [orgId, claim_md_account_key, claim_md_token, claim_md_account_key_encrypted,
       claim_md_token_encrypted, claim_md_api_url, JSON.stringify(billing_settings),
       JSON.stringify(collection_settings), JSON.stringify(approval_thresholds),
       JSON.stringify(statement_settings), JSON.stringify(settings), active]
    );

    const savedSettings = result.rows[0];
    // Mask sensitive data
    savedSettings.claim_md_account_key = '***masked***';
    savedSettings.claim_md_token = '***masked***';
    savedSettings.claim_md_account_key_encrypted = '***masked***';
    savedSettings.claim_md_token_encrypted = '***masked***';

    return savedSettings;
  }

  /**
   * Update specific settings section
   */
  async updateSettingsSection(orgId, section, data) {
    const allowedSections = ['billing_settings', 'collection_settings', 'approval_thresholds', 'statement_settings'];
    
    if (!allowedSections.includes(section)) {
      throw new Error('Invalid settings section');
    }

    const result = await pool.query(
      `UPDATE billing_tenant_settings 
       SET ${section} = $2
       WHERE org_id = $1
       RETURNING *`,
      [orgId, JSON.stringify(data)]
    );

    return result.rows[0];
  }

  /**
   * Delete billing settings (soft delete)
   */
  async deleteSettings(orgId) {
    const result = await pool.query(
      'UPDATE billing_tenant_settings SET active = false WHERE org_id = $1 RETURNING *',
      [orgId]
    );
    return result.rows[0];
  }
}

module.exports = new BillingSettingsService();
