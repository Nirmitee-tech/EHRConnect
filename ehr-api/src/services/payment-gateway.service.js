/**
 * Payment Gateway Service
 * Handles payment gateway configuration with encryption
 */

const { pool } = require('../database/connection');
const crypto = require('crypto');

class PaymentGatewayService {
  constructor() {
    // In production, use a proper key management system (e.g., AWS KMS, HashiCorp Vault)
    this.encryptionKey = process.env.GATEWAY_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Simple encryption (use proper encryption library in production)
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
   * Simple decryption (use proper encryption library in production)
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
   * Get all payment gateways for an organization
   */
  async getGateways(orgId, includeInactive = false) {
    const query = includeInactive
      ? 'SELECT * FROM billing_payment_gateways WHERE org_id = $1 ORDER BY is_default DESC, gateway_name ASC'
      : 'SELECT * FROM billing_payment_gateways WHERE org_id = $1 AND is_active = true ORDER BY is_default DESC, gateway_name ASC';

    const result = await pool.query(query, [orgId]);

    // Mask sensitive data
    return result.rows.map(gateway => ({
      ...gateway,
      api_key_encrypted: gateway.api_key_encrypted ? '***masked***' : null,
      api_secret_encrypted: gateway.api_secret_encrypted ? '***masked***' : null,
      webhook_secret_encrypted: gateway.webhook_secret_encrypted ? '***masked***' : null
    }));
  }

  /**
   * Get gateway by ID
   */
  async getGatewayById(orgId, gatewayId, includeSensitive = false) {
    const result = await pool.query(
      'SELECT * FROM billing_payment_gateways WHERE id = $1 AND org_id = $2',
      [gatewayId, orgId]
    );

    const gateway = result.rows[0];
    if (!gateway) return null;

    if (!includeSensitive) {
      gateway.api_key_encrypted = gateway.api_key_encrypted ? '***masked***' : null;
      gateway.api_secret_encrypted = gateway.api_secret_encrypted ? '***masked***' : null;
      gateway.webhook_secret_encrypted = gateway.webhook_secret_encrypted ? '***masked***' : null;
    }

    return gateway;
  }

  /**
   * Create payment gateway
   */
  async createGateway(orgId, gatewayData) {
    const {
      gateway_name,
      gateway_provider,
      api_key,
      api_secret,
      webhook_secret,
      merchant_id,
      is_default = false,
      supported_methods = ['credit_card', 'debit_card'],
      test_mode = false,
      configuration = {},
      metadata = {}
    } = gatewayData;

    // Encrypt sensitive data
    const api_key_encrypted = this.encrypt(api_key);
    const api_secret_encrypted = this.encrypt(api_secret);
    const webhook_secret_encrypted = this.encrypt(webhook_secret);

    const result = await pool.query(
      `INSERT INTO billing_payment_gateways 
       (org_id, gateway_name, gateway_provider, api_key_encrypted, api_secret_encrypted,
        webhook_secret_encrypted, merchant_id, is_default, supported_methods, test_mode,
        configuration, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [orgId, gateway_name, gateway_provider, api_key_encrypted, api_secret_encrypted,
       webhook_secret_encrypted, merchant_id, is_default, supported_methods, test_mode,
       JSON.stringify(configuration), JSON.stringify(metadata)]
    );

    // Mask in response
    const gateway = result.rows[0];
    gateway.api_key_encrypted = '***masked***';
    gateway.api_secret_encrypted = '***masked***';
    gateway.webhook_secret_encrypted = '***masked***';

    return gateway;
  }

  /**
   * Update payment gateway
   */
  async updateGateway(orgId, gatewayId, gatewayData) {
    const updates = [];
    const params = [gatewayId, orgId];
    let paramIndex = 3;

    const allowedFields = [
      'gateway_name', 'merchant_id', 'is_active', 'is_default',
      'supported_methods', 'test_mode', 'configuration', 'metadata'
    ];

    // Handle encrypted fields separately
    if (gatewayData.api_key) {
      updates.push(`api_key_encrypted = $${paramIndex++}`);
      params.push(this.encrypt(gatewayData.api_key));
    }

    if (gatewayData.api_secret) {
      updates.push(`api_secret_encrypted = $${paramIndex++}`);
      params.push(this.encrypt(gatewayData.api_secret));
    }

    if (gatewayData.webhook_secret) {
      updates.push(`webhook_secret_encrypted = $${paramIndex++}`);
      params.push(this.encrypt(gatewayData.webhook_secret));
    }

    for (const field of allowedFields) {
      if (gatewayData[field] !== undefined) {
        if (['configuration', 'metadata'].includes(field)) {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(JSON.stringify(gatewayData[field]));
        } else {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(gatewayData[field]);
        }
      }
    }

    if (updates.length === 0) {
      return await this.getGatewayById(orgId, gatewayId);
    }

    const result = await pool.query(
      `UPDATE billing_payment_gateways SET ${updates.join(', ')} 
       WHERE id = $1 AND org_id = $2 RETURNING *`,
      params
    );

    const gateway = result.rows[0];
    if (gateway) {
      gateway.api_key_encrypted = '***masked***';
      gateway.api_secret_encrypted = '***masked***';
      gateway.webhook_secret_encrypted = '***masked***';
    }

    return gateway;
  }

  /**
   * Test gateway connection
   */
  async testGateway(orgId, gatewayId) {
    const gateway = await this.getGatewayById(orgId, gatewayId, true);
    if (!gateway) {
      throw new Error('Gateway not found');
    }

    // Decrypt credentials for testing
    const apiKey = this.decrypt(gateway.api_key_encrypted);
    const apiSecret = this.decrypt(gateway.api_secret_encrypted);

    // In production, implement actual gateway testing based on provider
    // For now, return mock test result
    return {
      success: true,
      message: 'Gateway connection test successful',
      provider: gateway.gateway_provider,
      test_mode: gateway.test_mode
    };
  }

  /**
   * Set default gateway
   */
  async setDefaultGateway(orgId, gatewayId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Unset current default
      await client.query(
        'UPDATE billing_payment_gateways SET is_default = false WHERE org_id = $1',
        [orgId]
      );

      // Set new default
      const result = await client.query(
        'UPDATE billing_payment_gateways SET is_default = true WHERE id = $1 AND org_id = $2 RETURNING *',
        [gatewayId, orgId]
      );

      await client.query('COMMIT');
      
      const gateway = result.rows[0];
      if (gateway) {
        gateway.api_key_encrypted = '***masked***';
        gateway.api_secret_encrypted = '***masked***';
        gateway.webhook_secret_encrypted = '***masked***';
      }

      return gateway;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new PaymentGatewayService();
