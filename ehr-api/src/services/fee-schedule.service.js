/**
 * Fee Schedule Service
 * Handles fee schedule management and lookups
 */

const { pool } = require('../database/connection');

class FeeScheduleService {
  /**
   * Get fee schedules for an organization
   */
  async getFeeSchedules(orgId, filters = {}) {
    const { payer_id, cpt_code, active = true, page = 1, limit = 100 } = filters;
    const offset = (page - 1) * limit;

    const conditions = ['org_id = $1'];
    const params = [orgId];
    let paramIndex = 2;

    if (active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      params.push(active);
    }

    if (payer_id) {
      conditions.push(`payer_id = $${paramIndex++}`);
      params.push(payer_id);
    }

    if (cpt_code) {
      conditions.push(`cpt_code = $${paramIndex++}`);
      params.push(cpt_code);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM billing_fee_schedules WHERE ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT fs.*, p.name as payer_name, c.description as cpt_description
       FROM billing_fee_schedules fs
       LEFT JOIN billing_payers p ON fs.payer_id = p.id
       LEFT JOIN billing_cpt_codes c ON fs.cpt_code = c.code
       WHERE ${whereClause}
       ORDER BY fs.cpt_code ASC, fs.effective_from DESC
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
   * Lookup fee for CPT code, payer, and date
   */
  async lookupFee(orgId, cptCode, payerId = null, modifier = null, date = new Date()) {
    const params = [orgId, cptCode, date];
    let paramIndex = 4;

    let payerCondition = 'payer_id IS NULL';
    if (payerId) {
      payerCondition = `payer_id = $${paramIndex++}`;
      params.splice(3, 0, payerId);
    }

    let modifierCondition = 'modifier IS NULL';
    if (modifier) {
      modifierCondition = `modifier = $${paramIndex++}`;
      params.push(modifier);
    }

    const result = await pool.query(
      `SELECT fs.*, p.name as payer_name
       FROM billing_fee_schedules fs
       LEFT JOIN billing_payers p ON fs.payer_id = p.id
       WHERE fs.org_id = $1 
       AND fs.cpt_code = $2
       AND fs.active = true
       AND fs.effective_from <= $3
       AND (fs.effective_to IS NULL OR fs.effective_to >= $3)
       AND ${payerCondition}
       AND ${modifierCondition}
       ORDER BY fs.payer_id DESC NULLS LAST
       LIMIT 1`,
      params
    );

    return result.rows[0];
  }

  /**
   * Create fee schedule entry
   */
  async createFeeSchedule(orgId, feeData) {
    const {
      payer_id = null,
      cpt_code,
      modifier = null,
      amount,
      facility_amount,
      effective_from,
      effective_to,
      metadata = {}
    } = feeData;

    const result = await pool.query(
      `INSERT INTO billing_fee_schedules 
       (org_id, payer_id, cpt_code, modifier, amount, facility_amount,
        effective_from, effective_to, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [orgId, payer_id, cpt_code, modifier, amount, facility_amount,
        effective_from, effective_to, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Update fee schedule
   */
  async updateFeeSchedule(orgId, feeScheduleId, feeData) {
    const updates = [];
    const params = [feeScheduleId, orgId];
    let paramIndex = 3;

    const allowedFields = ['amount', 'facility_amount', 'effective_to', 'active', 'metadata'];

    for (const field of allowedFields) {
      if (feeData[field] !== undefined) {
        if (field === 'metadata') {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(JSON.stringify(feeData[field]));
        } else {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(feeData[field]);
        }
      }
    }

    if (updates.length === 0) {
      const result = await pool.query(
        'SELECT * FROM billing_fee_schedules WHERE id = $1 AND org_id = $2',
        [feeScheduleId, orgId]
      );
      return result.rows[0];
    }

    const result = await pool.query(
      `UPDATE billing_fee_schedules SET ${updates.join(', ')} 
       WHERE id = $1 AND org_id = $2 RETURNING *`,
      params
    );

    return result.rows[0];
  }

  /**
   * Bulk import fee schedules
   */
  async bulkImportFeeSchedules(orgId, feeSchedules) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];
      for (const feeData of feeSchedules) {
        const result = await this.createFeeSchedule(orgId, feeData);
        results.push(result);
      }

      await client.query('COMMIT');
      return { imported: results.length, data: results };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Copy fee schedule from one payer to another with multiplier
   */
  async copyFeeSchedule(orgId, sourcePayerId, targetPayerId, multiplier = 1.0, effectiveFrom) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO billing_fee_schedules 
         (org_id, payer_id, cpt_code, modifier, amount, facility_amount, effective_from, active, metadata)
         SELECT 
           org_id,
           $2 as payer_id,
           cpt_code,
           modifier,
           amount * $3 as amount,
           facility_amount * $3 as facility_amount,
           $4 as effective_from,
           active,
           metadata
         FROM billing_fee_schedules
         WHERE org_id = $1 AND payer_id = $5 AND active = true
         RETURNING *`,
        [orgId, targetPayerId, multiplier, effectiveFrom, sourcePayerId]
      );

      await client.query('COMMIT');
      return { copied: result.rows.length, data: result.rows };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new FeeScheduleService();
