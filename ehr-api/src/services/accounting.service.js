/**
 * Accounting Service
 * Handles chart of accounts, cost centers, bank accounts, and fiscal periods
 */

const { pool } = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class AccountingService {
  /**
   * ==========================================
   * CHART OF ACCOUNTS
   * ==========================================
   */

  /**
   * Get all accounts for an organization with optional filters
   */
  async getChartOfAccounts(orgId, filters = {}) {
    const { account_type, is_active, search, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    const conditions = ['org_id = $1'];
    const params = [orgId];
    let paramIndex = 2;

    if (account_type) {
      conditions.push(`account_type = $${paramIndex++}`);
      params.push(account_type);
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    if (search) {
      conditions.push(`(account_code ILIKE $${paramIndex} OR account_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM accounting_chart_of_accounts WHERE ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM accounting_chart_of_accounts 
       WHERE ${whereClause}
       ORDER BY account_code ASC
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
   * Get account by ID
   */
  async getAccountById(orgId, accountId) {
    const result = await pool.query(
      'SELECT * FROM accounting_chart_of_accounts WHERE id = $1 AND org_id = $2',
      [accountId, orgId]
    );
    return result.rows[0];
  }

  /**
   * Create new account
   */
  async createAccount(orgId, accountData) {
    const {
      account_code,
      account_name,
      account_type,
      account_subtype,
      parent_account_id,
      normal_balance,
      description,
      is_system = false,
      metadata = {}
    } = accountData;

    const result = await pool.query(
      `INSERT INTO accounting_chart_of_accounts 
       (org_id, account_code, account_name, account_type, account_subtype, 
        parent_account_id, normal_balance, description, is_system, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [orgId, account_code, account_name, account_type, account_subtype,
       parent_account_id, normal_balance, description, is_system, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Update account
   */
  async updateAccount(orgId, accountId, accountData) {
    const account = await this.getAccountById(orgId, accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.is_system) {
      throw new Error('System accounts cannot be modified');
    }

    const {
      account_name,
      account_subtype,
      parent_account_id,
      description,
      is_active,
      metadata
    } = accountData;

    const result = await pool.query(
      `UPDATE accounting_chart_of_accounts 
       SET account_name = COALESCE($3, account_name),
           account_subtype = COALESCE($4, account_subtype),
           parent_account_id = COALESCE($5, parent_account_id),
           description = COALESCE($6, description),
           is_active = COALESCE($7, is_active),
           metadata = COALESCE($8, metadata)
       WHERE id = $1 AND org_id = $2
       RETURNING *`,
      [accountId, orgId, account_name, account_subtype, parent_account_id,
       description, is_active, metadata ? JSON.stringify(metadata) : null]
    );

    return result.rows[0];
  }

  /**
   * Delete account (soft delete)
   */
  async deleteAccount(orgId, accountId) {
    const account = await this.getAccountById(orgId, accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.is_system) {
      throw new Error('System accounts cannot be deleted');
    }

    const result = await pool.query(
      'UPDATE accounting_chart_of_accounts SET is_active = false WHERE id = $1 AND org_id = $2 RETURNING *',
      [accountId, orgId]
    );

    return result.rows[0];
  }

  /**
   * ==========================================
   * COST CENTERS
   * ==========================================
   */

  /**
   * Get all cost centers
   */
  async getCostCenters(orgId, filters = {}) {
    const { cost_center_type, department_id, is_active, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    const conditions = ['org_id = $1'];
    const params = [orgId];
    let paramIndex = 2;

    if (cost_center_type) {
      conditions.push(`cost_center_type = $${paramIndex++}`);
      params.push(cost_center_type);
    }

    if (department_id) {
      conditions.push(`department_id = $${paramIndex++}`);
      params.push(department_id);
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    const whereClause = conditions.join(' AND ');

    const result = await pool.query(
      `SELECT cc.*, d.name as department_name 
       FROM accounting_cost_centers cc
       LEFT JOIN departments d ON cc.department_id = d.id
       WHERE ${whereClause}
       ORDER BY cc.cost_center_code ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  }

  /**
   * Create cost center
   */
  async createCostCenter(orgId, costCenterData) {
    const {
      cost_center_code,
      cost_center_name,
      cost_center_type,
      department_id,
      parent_cost_center_id,
      budget_amount,
      metadata = {}
    } = costCenterData;

    const result = await pool.query(
      `INSERT INTO accounting_cost_centers 
       (org_id, cost_center_code, cost_center_name, cost_center_type, 
        department_id, parent_cost_center_id, budget_amount, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [orgId, cost_center_code, cost_center_name, cost_center_type,
       department_id, parent_cost_center_id, budget_amount, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Update cost center
   */
  async updateCostCenter(orgId, costCenterId, costCenterData) {
    const result = await pool.query(
      `UPDATE accounting_cost_centers 
       SET cost_center_name = COALESCE($3, cost_center_name),
           cost_center_type = COALESCE($4, cost_center_type),
           department_id = COALESCE($5, department_id),
           budget_amount = COALESCE($6, budget_amount),
           is_active = COALESCE($7, is_active),
           metadata = COALESCE($8, metadata)
       WHERE id = $1 AND org_id = $2
       RETURNING *`,
      [costCenterId, orgId, costCenterData.cost_center_name, costCenterData.cost_center_type,
       costCenterData.department_id, costCenterData.budget_amount, costCenterData.is_active,
       costCenterData.metadata ? JSON.stringify(costCenterData.metadata) : null]
    );

    return result.rows[0];
  }

  /**
   * ==========================================
   * BANK ACCOUNTS
   * ==========================================
   */

  /**
   * Get all bank accounts
   */
  async getBankAccounts(orgId, is_active = true) {
    const result = await pool.query(
      `SELECT ba.*, coa.account_code as gl_account_code, coa.account_name as gl_account_name
       FROM accounting_bank_accounts ba
       LEFT JOIN accounting_chart_of_accounts coa ON ba.gl_account_id = coa.id
       WHERE ba.org_id = $1 AND ba.is_active = $2
       ORDER BY ba.is_default DESC, ba.account_name ASC`,
      [orgId, is_active]
    );

    return result.rows;
  }

  /**
   * Create bank account
   */
  async createBankAccount(orgId, bankAccountData) {
    const {
      account_name,
      account_number,
      bank_name,
      routing_number,
      account_type,
      gl_account_id,
      metadata = {}
    } = bankAccountData;

    // Simple encryption placeholder - in production use proper encryption
    const account_number_encrypted = Buffer.from(account_number || '').toString('base64');
    const account_number_last4 = account_number ? account_number.slice(-4) : null;

    const result = await pool.query(
      `INSERT INTO accounting_bank_accounts 
       (org_id, account_name, account_number_encrypted, account_number_last4, 
        bank_name, routing_number, account_type, gl_account_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [orgId, account_name, account_number_encrypted, account_number_last4,
       bank_name, routing_number, account_type, gl_account_id, JSON.stringify(metadata)]
    );

    return result.rows[0];
  }

  /**
   * Set default bank account
   */
  async setDefaultBankAccount(orgId, bankAccountId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Unset current default
      await client.query(
        'UPDATE accounting_bank_accounts SET is_default = false WHERE org_id = $1',
        [orgId]
      );

      // Set new default
      const result = await client.query(
        'UPDATE accounting_bank_accounts SET is_default = true WHERE id = $1 AND org_id = $2 RETURNING *',
        [bankAccountId, orgId]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new AccountingService();
