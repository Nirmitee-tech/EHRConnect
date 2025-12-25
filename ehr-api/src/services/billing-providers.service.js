/**
 * Billing Providers Service
 * Handles provider management with NPI validation
 */

const { pool } = require('../database/connection');
const axios = require('axios');

class BillingProvidersService {
  /**
   * Get all providers for an organization
   */
  async getProviders(orgId, filters = {}) {
    const { search, specialty, active = true, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    const conditions = ['(org_id = $1 OR org_id IS NULL)'];
    const params = [orgId];
    let paramIndex = 2;

    if (active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      params.push(active);
    }

    if (specialty) {
      conditions.push(`specialty ILIKE $${paramIndex}`);
      params.push(`%${specialty}%`);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        npi ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM billing_providers WHERE ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM billing_providers 
       WHERE ${whereClause}
       ORDER BY last_name, first_name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit
    };
  }

  /**
   * Get provider by ID
   */
  async getProviderById(orgId, providerId) {
    const result = await pool.query(
      'SELECT * FROM billing_providers WHERE id = $1 AND (org_id = $2 OR org_id IS NULL)',
      [providerId, orgId]
    );
    return result.rows[0];
  }

  /**
   * Get provider by NPI
   */
  async getProviderByNPI(npi) {
    const result = await pool.query(
      'SELECT * FROM billing_providers WHERE npi = $1',
      [npi]
    );
    return result.rows[0];
  }

  /**
   * Verify NPI with NPPES registry
   */
  async verifyNPI(npi) {
    try {
      const cleanNPI = npi.replace(/\D/g, '');
      if (cleanNPI.length !== 10) {
        return { valid: false, error: 'NPI must be 10 digits' };
      }

      const response = await axios.get(
        `https://npiregistry.cms.hhs.gov/api/?number=${cleanNPI}&version=2.1`
      );

      if (response.data.result_count > 0) {
        const provider = response.data.results[0];
        return {
          valid: true,
          data: {
            npi: provider.number,
            first_name: provider.basic?.first_name,
            last_name: provider.basic?.last_name,
            taxonomy_code: provider.taxonomies?.[0]?.code,
            specialty: provider.taxonomies?.[0]?.desc,
            addresses: provider.addresses
          }
        };
      }

      return { valid: false, error: 'NPI not found in registry' };
    } catch (error) {
      console.error('NPI verification error:', error.message);
      return { valid: false, error: 'Failed to verify NPI' };
    }
  }

  /**
   * Create provider
   */
  async createProvider(orgId, providerData) {
    const {
      npi,
      first_name,
      last_name,
      credentials,
      specialty,
      taxonomy_code,
      license_number,
      license_state,
      dea_number,
      email,
      phone,
      address,
      user_id,
      is_billing_provider = false,
      is_rendering_provider = true,
      is_referring_provider = false,
      metadata = {}
    } = providerData;

    const result = await pool.query(
      `INSERT INTO billing_providers 
       (org_id, npi, first_name, last_name, credentials, specialty, taxonomy_code,
        license_number, license_state, dea_number, email, phone, address, user_id,
        is_billing_provider, is_rendering_provider, is_referring_provider, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [orgId, npi, first_name, last_name, credentials, specialty, taxonomy_code,
       license_number, license_state, dea_number, email, phone, 
       address ? JSON.stringify(address) : null, user_id,
       is_billing_provider, is_rendering_provider, is_referring_provider, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Update provider
   */
  async updateProvider(orgId, providerId, providerData) {
    const updates = [];
    const params = [providerId, orgId];
    let paramIndex = 3;

    const allowedFields = [
      'first_name', 'last_name', 'credentials', 'specialty', 'taxonomy_code',
      'license_number', 'license_state', 'dea_number', 'email', 'phone', 'address',
      'is_billing_provider', 'is_rendering_provider', 'is_referring_provider',
      'active', 'metadata'
    ];

    for (const field of allowedFields) {
      if (providerData[field] !== undefined) {
        if (['address', 'metadata'].includes(field)) {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(JSON.stringify(providerData[field]));
        } else {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(providerData[field]);
        }
      }
    }

    if (updates.length === 0) {
      return await this.getProviderById(orgId, providerId);
    }

    const result = await pool.query(
      `UPDATE billing_providers SET ${updates.join(', ')} 
       WHERE id = $1 AND (org_id = $2 OR org_id IS NULL) RETURNING *`,
      params
    );

    return result.rows[0];
  }
}

module.exports = new BillingProvidersService();
