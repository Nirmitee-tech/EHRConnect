/**
 * Billing Payers Service
 * Handles insurance payer management
 */

const { pool } = require('../database/connection');

class BillingPayersService {
  /**
   * Get all payers with filters
   */
  async getPayers(filters = {}) {
    const { search, payer_type, active = true, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      params.push(active);
    }

    if (payer_type) {
      conditions.push(`payer_type = $${paramIndex++}`);
      params.push(payer_type);
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR payer_id ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM billing_payers ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM billing_payers 
       ${whereClause}
       ORDER BY name ASC
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
   * Get payer by ID
   */
  async getPayerById(payerId) {
    const result = await pool.query(
      'SELECT * FROM billing_payers WHERE id = $1',
      [payerId]
    );
    return result.rows[0];
  }

  /**
   * Create payer
   */
  async createPayer(payerData) {
    const {
      name,
      payer_id,
      payer_type,
      address,
      contact_email,
      contact_phone,
      claim_submission_method,
      timely_filing_days = 365,
      requires_prior_auth = false,
      era_supported = true,
      edi_payer_id,
      clearinghouse_id,
      settings = {},
      metadata = {}
    } = payerData;

    const result = await pool.query(
      `INSERT INTO billing_payers 
       (name, payer_id, payer_type, address, contact_email, contact_phone,
        claim_submission_method, timely_filing_days, requires_prior_auth, era_supported,
        edi_payer_id, clearinghouse_id, settings, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [name, payer_id, payer_type, JSON.stringify(address), contact_email, contact_phone,
       claim_submission_method, timely_filing_days, requires_prior_auth, era_supported,
       edi_payer_id, clearinghouse_id, JSON.stringify(settings), JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Update payer
   */
  async updatePayer(payerId, payerData) {
    const updates = [];
    const params = [payerId];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'payer_type', 'address', 'contact_email', 'contact_phone',
      'claim_submission_method', 'timely_filing_days', 'requires_prior_auth',
      'era_supported', 'edi_payer_id', 'clearinghouse_id', 'active', 'settings', 'metadata'
    ];

    for (const field of allowedFields) {
      if (payerData[field] !== undefined) {
        if (['address', 'settings', 'metadata'].includes(field)) {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(JSON.stringify(payerData[field]));
        } else {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(payerData[field]);
        }
      }
    }

    if (updates.length === 0) {
      return await this.getPayerById(payerId);
    }

    const result = await pool.query(
      `UPDATE billing_payers SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    return result.rows[0];
  }

  /**
   * Delete payer (soft delete)
   */
  async deletePayer(payerId) {
    const result = await pool.query(
      'UPDATE billing_payers SET active = false WHERE id = $1 RETURNING *',
      [payerId]
    );
    return result.rows[0];
  }
}

module.exports = new BillingPayersService();
