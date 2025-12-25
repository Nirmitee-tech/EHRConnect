/**
 * Billing Validation Service
 * Validates master data setup readiness for billing operations
 */

const { pool } = require('../database/connection');

class BillingValidationService {
  /**
   * Validate complete master data setup for an organization
   */
  async validateMasterDataSetup(orgId) {
    const validations = await Promise.all([
      this.validateChartOfAccounts(orgId),
      this.validateCPTCodes(),
      this.validateICDCodes(),
      this.validatePayers(),
      this.validateFeeSchedules(orgId),
      this.validateCostCenters(orgId),
      this.validateBankAccounts(orgId),
      this.validatePaymentGateways(orgId),
      this.validateBillingSettings(orgId)
    ]);

    const [
      chartOfAccounts,
      cptCodes,
      icdCodes,
      payers,
      feeSchedules,
      costCenters,
      bankAccounts,
      paymentGateways,
      billingSettings
    ] = validations;

    const overallReady = 
      chartOfAccounts.ready &&
      cptCodes.ready &&
      icdCodes.ready &&
      payers.ready &&
      feeSchedules.ready &&
      costCenters.ready &&
      bankAccounts.ready &&
      paymentGateways.ready &&
      billingSettings.ready;

    return {
      overallReady,
      chartOfAccounts,
      cptCodes,
      icdCodes,
      payers,
      feeSchedules,
      costCenters,
      bankAccounts,
      paymentGateways,
      billingSettings,
      validatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate Chart of Accounts setup
   */
  async validateChartOfAccounts(orgId) {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN is_system = true THEN 1 END) as system_accounts,
              COUNT(CASE WHEN is_active = true THEN 1 END) as active_accounts
       FROM accounting_chart_of_accounts
       WHERE org_id = $1`,
      [orgId]
    );

    const { total, system_accounts, active_accounts } = result.rows[0];

    // Check for essential system accounts
    const essentialAccounts = [
      'cash', 'accounts_receivable', 'revenue', 'expenses'
    ];

    const missingAccounts = [];
    for (const accountType of essentialAccounts) {
      const check = await pool.query(
        `SELECT COUNT(*) as count FROM accounting_chart_of_accounts 
         WHERE org_id = $1 AND (account_code ILIKE $2 OR account_name ILIKE $2)`,
        [orgId, `%${accountType}%`]
      );
      if (parseInt(check.rows[0].count) === 0) {
        missingAccounts.push(accountType);
      }
    }

    return {
      ready: parseInt(total) >= 30 && missingAccounts.length === 0,
      count: parseInt(total),
      systemAccountsReady: parseInt(system_accounts) >= 5,
      activeAccounts: parseInt(active_accounts),
      missingRequired: missingAccounts
    };
  }

  /**
   * Validate CPT Codes
   */
  async validateCPTCodes() {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM billing_cpt_codes WHERE active = true'
    );

    const total = parseInt(result.rows[0].total);

    return {
      ready: total >= 100, // At least 100 CPT codes
      count: total,
      recommended: 10000
    };
  }

  /**
   * Validate ICD Codes
   */
  async validateICDCodes() {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM billing_icd_codes WHERE active = true'
    );

    const total = parseInt(result.rows[0].total);

    return {
      ready: total >= 100, // At least 100 ICD codes
      count: total,
      recommended: 50000
    };
  }

  /**
   * Validate Payers
   */
  async validatePayers() {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN payer_type = 'medicare' THEN 1 END) as medicare,
              COUNT(CASE WHEN payer_type = 'medicaid' THEN 1 END) as medicaid,
              COUNT(CASE WHEN payer_type = 'commercial' THEN 1 END) as commercial,
              COUNT(CASE WHEN payer_type = 'self_pay' THEN 1 END) as self_pay
       FROM billing_payers
       WHERE active = true`
    );

    const { total, medicare, medicaid, commercial, self_pay } = result.rows[0];

    return {
      ready: parseInt(total) >= 3, // At least 3 payers
      count: parseInt(total),
      breakdown: {
        medicare: parseInt(medicare),
        medicaid: parseInt(medicaid),
        commercial: parseInt(commercial),
        self_pay: parseInt(self_pay)
      }
    };
  }

  /**
   * Validate Fee Schedules
   */
  async validateFeeSchedules(orgId) {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(DISTINCT payer_id) as payers_with_fees,
              COUNT(DISTINCT cpt_code) as cpt_codes_with_fees
       FROM billing_fee_schedules
       WHERE org_id = $1 AND active = true`,
      [orgId]
    );

    const { total, payers_with_fees, cpt_codes_with_fees } = result.rows[0];

    return {
      ready: parseInt(total) >= 50, // At least 50 fee schedule entries
      count: parseInt(total),
      payersWithFees: parseInt(payers_with_fees),
      cptCodesWithFees: parseInt(cpt_codes_with_fees)
    };
  }

  /**
   * Validate Cost Centers
   */
  async validateCostCenters(orgId) {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN cost_center_type = 'revenue_generating' THEN 1 END) as revenue_generating
       FROM accounting_cost_centers
       WHERE org_id = $1 AND is_active = true`,
      [orgId]
    );

    const { total, revenue_generating } = result.rows[0];

    return {
      ready: parseInt(total) >= 3, // At least 3 cost centers
      count: parseInt(total),
      revenueGenerating: parseInt(revenue_generating)
    };
  }

  /**
   * Validate Bank Accounts
   */
  async validateBankAccounts(orgId) {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN is_default = true THEN 1 END) as has_default
       FROM accounting_bank_accounts
       WHERE org_id = $1 AND is_active = true`,
      [orgId]
    );

    const { total, has_default } = result.rows[0];

    return {
      ready: parseInt(total) >= 1 && parseInt(has_default) >= 1,
      count: parseInt(total),
      hasDefault: parseInt(has_default) >= 1
    };
  }

  /**
   * Validate Payment Gateways
   */
  async validatePaymentGateways(orgId) {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN is_default = true THEN 1 END) as has_default,
              COUNT(CASE WHEN test_mode = false THEN 1 END) as production_gateways
       FROM billing_payment_gateways
       WHERE org_id = $1 AND is_active = true`,
      [orgId]
    );

    const { total, has_default, production_gateways } = result.rows[0];

    return {
      ready: parseInt(total) >= 1,
      count: parseInt(total),
      hasDefault: parseInt(has_default) >= 1,
      productionGateways: parseInt(production_gateways)
    };
  }

  /**
   * Validate Billing Settings
   */
  async validateBillingSettings(orgId) {
    const result = await pool.query(
      'SELECT * FROM billing_tenant_settings WHERE org_id = $1 AND active = true',
      [orgId]
    );

    const settings = result.rows[0];

    return {
      ready: !!settings,
      exists: !!settings,
      hasClaimMDConfig: !!(settings?.claim_md_account_key || settings?.claim_md_account_key_encrypted)
    };
  }

  /**
   * Get setup progress percentage
   */
  async getSetupProgress(orgId) {
    const validation = await this.validateMasterDataSetup(orgId);
    
    const sections = [
      'chartOfAccounts',
      'cptCodes',
      'icdCodes',
      'payers',
      'feeSchedules',
      'costCenters',
      'bankAccounts',
      'paymentGateways',
      'billingSettings'
    ];

    const completedSections = sections.filter(section => validation[section]?.ready).length;
    const progress = Math.round((completedSections / sections.length) * 100);

    return {
      progress,
      completedSections,
      totalSections: sections.length,
      validation
    };
  }
}

module.exports = new BillingValidationService();
