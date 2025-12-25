/**
 * Billing Codes Service
 * Handles CPT codes, ICD codes, and modifiers with search functionality
 */

const { pool } = require('../database/connection');

class BillingCodesService {
  /**
   * ==========================================
   * CPT CODES
   * ==========================================
   */

  /**
   * Get CPT codes with pagination and filters
   */
  async getCPTCodes(filters = {}) {
    const { search, category, active = true, page = 1, limit = 100 } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      params.push(active);
    }

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(
        code ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        short_description ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM billing_cpt_codes ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM billing_cpt_codes 
       ${whereClause}
       ORDER BY code ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  /**
   * Get single CPT code by code
   */
  async getCPTCodeByCode(code) {
    const result = await pool.query(
      'SELECT * FROM billing_cpt_codes WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  /**
   * Search CPT codes with full-text search
   */
  async searchCPTCodes(searchTerm, limit = 20) {
    const result = await pool.query(
      `SELECT code, description, short_description, category, subcategory
       FROM billing_cpt_codes
       WHERE active = true 
       AND (
         to_tsvector('english', description) @@ plainto_tsquery('english', $1)
         OR code ILIKE $2
         OR description ILIKE $2
       )
       ORDER BY 
         CASE WHEN code ILIKE $2 THEN 1 ELSE 2 END,
         code ASC
       LIMIT $3`,
      [searchTerm, `%${searchTerm}%`, limit]
    );
    return result.rows;
  }

  /**
   * Create CPT code
   */
  async createCPTCode(cptData) {
    const {
      code,
      description,
      short_description,
      category,
      subcategory,
      modifier_allowed = true,
      active = true,
      effective_date,
      termination_date,
      version,
      rvu_work,
      rvu_facility,
      rvu_malpractice,
      metadata = {}
    } = cptData;

    const result = await pool.query(
      `INSERT INTO billing_cpt_codes 
       (code, description, short_description, category, subcategory, modifier_allowed,
        active, effective_date, termination_date, version, rvu_work, rvu_facility, 
        rvu_malpractice, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (code) DO UPDATE SET
         description = EXCLUDED.description,
         short_description = EXCLUDED.short_description,
         category = EXCLUDED.category,
         subcategory = EXCLUDED.subcategory,
         modifier_allowed = EXCLUDED.modifier_allowed,
         active = EXCLUDED.active,
         effective_date = EXCLUDED.effective_date,
         termination_date = EXCLUDED.termination_date,
         version = EXCLUDED.version,
         rvu_work = EXCLUDED.rvu_work,
         rvu_facility = EXCLUDED.rvu_facility,
         rvu_malpractice = EXCLUDED.rvu_malpractice,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [code, description, short_description, category, subcategory, modifier_allowed,
       active, effective_date, termination_date, version, rvu_work, rvu_facility,
       rvu_malpractice, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Bulk import CPT codes
   */
  async bulkImportCPTCodes(cptCodes) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const cptData of cptCodes) {
        const result = await this.createCPTCode(cptData);
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
   * ==========================================
   * ICD CODES
   * ==========================================
   */

  /**
   * Get ICD codes with pagination and filters
   */
  async getICDCodes(filters = {}) {
    const { search, category, icd_version = 'ICD-10', active = true, page = 1, limit = 100 } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      params.push(active);
    }

    if (icd_version) {
      conditions.push(`icd_version = $${paramIndex++}`);
      params.push(icd_version);
    }

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(
        code ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        short_description ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM billing_icd_codes ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM billing_icd_codes 
       ${whereClause}
       ORDER BY code ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  /**
   * Get single ICD code by code
   */
  async getICDCodeByCode(code) {
    const result = await pool.query(
      'SELECT * FROM billing_icd_codes WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  /**
   * Search ICD codes with full-text search
   */
  async searchICDCodes(searchTerm, icd_version = 'ICD-10', limit = 20) {
    const result = await pool.query(
      `SELECT code, description, short_description, category, chapter, is_billable
       FROM billing_icd_codes
       WHERE active = true 
       AND icd_version = $1
       AND (
         to_tsvector('english', description) @@ plainto_tsquery('english', $2)
         OR code ILIKE $3
         OR description ILIKE $3
       )
       ORDER BY 
         CASE WHEN code ILIKE $3 THEN 1 ELSE 2 END,
         code ASC
       LIMIT $4`,
      [icd_version, searchTerm, `%${searchTerm}%`, limit]
    );
    return result.rows;
  }

  /**
   * Create ICD code
   */
  async createICDCode(icdData) {
    const {
      code,
      description,
      short_description,
      category,
      chapter,
      icd_version = 'ICD-10',
      active = true,
      effective_date,
      termination_date,
      is_billable = true,
      metadata = {}
    } = icdData;

    const result = await pool.query(
      `INSERT INTO billing_icd_codes 
       (code, description, short_description, category, chapter, icd_version,
        active, effective_date, termination_date, is_billable, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (code) DO UPDATE SET
         description = EXCLUDED.description,
         short_description = EXCLUDED.short_description,
         category = EXCLUDED.category,
         chapter = EXCLUDED.chapter,
         icd_version = EXCLUDED.icd_version,
         active = EXCLUDED.active,
         effective_date = EXCLUDED.effective_date,
         termination_date = EXCLUDED.termination_date,
         is_billable = EXCLUDED.is_billable,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [code, description, short_description, category, chapter, icd_version,
       active, effective_date, termination_date, is_billable, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Bulk import ICD codes
   */
  async bulkImportICDCodes(icdCodes) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const icdData of icdCodes) {
        const result = await this.createICDCode(icdData);
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
   * ==========================================
   * MODIFIERS
   * ==========================================
   */

  /**
   * Get all modifiers
   */
  async getModifiers(filters = {}) {
    const { modifier_type, active = true } = filters;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      params.push(active);
    }

    if (modifier_type) {
      conditions.push(`modifier_type = $${paramIndex++}`);
      params.push(modifier_type);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(
      `SELECT * FROM billing_modifiers ${whereClause} ORDER BY code ASC`,
      params
    );

    return result.rows;
  }

  /**
   * Create modifier
   */
  async createModifier(modifierData) {
    const {
      code,
      description,
      modifier_type,
      active = true,
      effective_date,
      metadata = {}
    } = modifierData;

    const result = await pool.query(
      `INSERT INTO billing_modifiers 
       (code, description, modifier_type, active, effective_date, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET
         description = EXCLUDED.description,
         modifier_type = EXCLUDED.modifier_type,
         active = EXCLUDED.active,
         effective_date = EXCLUDED.effective_date,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [code, description, modifier_type, active, effective_date, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }
}

module.exports = new BillingCodesService();
