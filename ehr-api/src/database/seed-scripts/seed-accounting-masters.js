/**
 * Accounting Masters Seed Script
 * Seeds chart of accounts, cost centers, and sample data for testing
 */

const { pool } = require('../connection');

// Standard Hospital Chart of Accounts
const CHART_OF_ACCOUNTS = [
  // ASSETS
  { account_code: '1000', account_name: 'ASSETS', account_type: 'asset', normal_balance: 'debit', is_system: true, parent_account_id: null },
  { account_code: '1100', account_name: 'Current Assets', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1000' },
  { account_code: '1110', account_name: 'Cash and Cash Equivalents', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1100', is_system: true },
  { account_code: '1120', account_name: 'Accounts Receivable - Patient Services', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1100', is_system: true },
  { account_code: '1121', account_name: 'Accounts Receivable - Insurance', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1100', is_system: true },
  { account_code: '1130', account_name: 'Medical Supplies Inventory', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1100' },
  { account_code: '1131', account_name: 'Pharmaceutical Inventory', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1100' },
  { account_code: '1140', account_name: 'Prepaid Expenses', account_type: 'asset', account_subtype: 'current', normal_balance: 'debit', parent_code: '1100' },
  
  { account_code: '1500', account_name: 'Fixed Assets', account_type: 'asset', account_subtype: 'fixed', normal_balance: 'debit', parent_code: '1000' },
  { account_code: '1510', account_name: 'Medical Equipment', account_type: 'asset', account_subtype: 'fixed', normal_balance: 'debit', parent_code: '1500' },
  { account_code: '1520', account_name: 'Furniture and Fixtures', account_type: 'asset', account_subtype: 'fixed', normal_balance: 'debit', parent_code: '1500' },
  { account_code: '1530', account_name: 'Buildings', account_type: 'asset', account_subtype: 'fixed', normal_balance: 'debit', parent_code: '1500' },
  { account_code: '1600', account_name: 'Accumulated Depreciation', account_type: 'contra_asset', normal_balance: 'credit', parent_code: '1000' },

  // LIABILITIES
  { account_code: '2000', account_name: 'LIABILITIES', account_type: 'liability', normal_balance: 'credit', is_system: true, parent_account_id: null },
  { account_code: '2100', account_name: 'Current Liabilities', account_type: 'liability', account_subtype: 'current', normal_balance: 'credit', parent_code: '2000' },
  { account_code: '2110', account_name: 'Accounts Payable - Suppliers', account_type: 'liability', account_subtype: 'current', normal_balance: 'credit', parent_code: '2100' },
  { account_code: '2120', account_name: 'Accrued Salaries and Wages', account_type: 'liability', account_subtype: 'current', normal_balance: 'credit', parent_code: '2100' },
  { account_code: '2130', account_name: 'Taxes Payable', account_type: 'liability', account_subtype: 'current', normal_balance: 'credit', parent_code: '2100' },
  { account_code: '2140', account_name: 'Patient Deposits', account_type: 'liability', account_subtype: 'current', normal_balance: 'credit', parent_code: '2100' },
  
  { account_code: '2500', account_name: 'Long-term Liabilities', account_type: 'liability', account_subtype: 'long_term', normal_balance: 'credit', parent_code: '2000' },
  { account_code: '2510', account_name: 'Long-term Loans', account_type: 'liability', account_subtype: 'long_term', normal_balance: 'credit', parent_code: '2500' },

  // EQUITY
  { account_code: '3000', account_name: 'EQUITY', account_type: 'equity', normal_balance: 'credit', is_system: true, parent_account_id: null },
  { account_code: '3100', account_name: 'Owner\'s Equity', account_type: 'equity', normal_balance: 'credit', parent_code: '3000' },
  { account_code: '3200', account_name: 'Retained Earnings', account_type: 'equity', normal_balance: 'credit', parent_code: '3000' },

  // REVENUE
  { account_code: '4000', account_name: 'REVENUE', account_type: 'revenue', normal_balance: 'credit', is_system: true, parent_account_id: null },
  { account_code: '4100', account_name: 'Patient Service Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4000', is_system: true },
  { account_code: '4110', account_name: 'Inpatient Services Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4120', account_name: 'Outpatient Services Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4130', account_name: 'Emergency Services Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4140', account_name: 'Laboratory Services Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4150', account_name: 'Radiology Services Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4160', account_name: 'Pharmacy Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4170', account_name: 'Surgical Services Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4100' },
  { account_code: '4200', account_name: 'Other Operating Revenue', account_type: 'revenue', account_subtype: 'operating', normal_balance: 'credit', parent_code: '4000' },

  // EXPENSES
  { account_code: '5000', account_name: 'EXPENSES', account_type: 'expense', normal_balance: 'debit', is_system: true, parent_account_id: null },
  { account_code: '5100', account_name: 'Operating Expenses', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5000' },
  { account_code: '5110', account_name: 'Salaries and Wages - Medical Staff', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5120', account_name: 'Salaries and Wages - Nursing Staff', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5130', account_name: 'Salaries and Wages - Administrative Staff', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5140', account_name: 'Medical Supplies Expense', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5150', account_name: 'Pharmaceutical Expenses', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5160', account_name: 'Utilities', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5170', account_name: 'Rent and Lease Expenses', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5180', account_name: 'Insurance Expenses', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5190', account_name: 'Maintenance and Repairs', account_type: 'expense', account_subtype: 'operating', normal_balance: 'debit', parent_code: '5100' },
  { account_code: '5200', account_name: 'Administrative Expenses', account_type: 'expense', account_subtype: 'administrative', normal_balance: 'debit', parent_code: '5000' },
  { account_code: '5300', account_name: 'Depreciation and Amortization', account_type: 'expense', account_subtype: 'non_operating', normal_balance: 'debit', parent_code: '5000' },
];

// Cost Centers
const COST_CENTERS = [
  { cost_center_code: 'CC-ER', cost_center_name: 'Emergency Department', cost_center_type: 'revenue_generating', budget_amount: 2000000 },
  { cost_center_code: 'CC-IPD', cost_center_name: 'Inpatient Department', cost_center_type: 'revenue_generating', budget_amount: 3000000 },
  { cost_center_code: 'CC-OPD', cost_center_name: 'Outpatient Department', cost_center_type: 'revenue_generating', budget_amount: 1500000 },
  { cost_center_code: 'CC-LAB', cost_center_name: 'Laboratory', cost_center_type: 'revenue_generating', budget_amount: 800000 },
  { cost_center_code: 'CC-RAD', cost_center_name: 'Radiology', cost_center_type: 'revenue_generating', budget_amount: 1000000 },
  { cost_center_code: 'CC-PHM', cost_center_name: 'Pharmacy', cost_center_type: 'revenue_generating', budget_amount: 600000 },
  { cost_center_code: 'CC-SRG', cost_center_name: 'Surgery', cost_center_type: 'revenue_generating', budget_amount: 2500000 },
  { cost_center_code: 'CC-ADM', cost_center_name: 'Administration', cost_center_type: 'administrative', budget_amount: 500000 },
  { cost_center_code: 'CC-HSK', cost_center_name: 'Housekeeping', cost_center_type: 'support', budget_amount: 200000 },
  { cost_center_code: 'CC-IT', cost_center_name: 'Information Technology', cost_center_type: 'support', budget_amount: 300000 },
];

async function seedChartOfAccounts(orgId) {
  console.log(`📊 Seeding chart of accounts for org: ${orgId}...`);

  const accountMap = new Map();

  // First pass: Create all accounts without parent references
  for (const account of CHART_OF_ACCOUNTS) {
    try {
      const result = await pool.query(
        `INSERT INTO accounting_chart_of_accounts 
         (org_id, account_code, account_name, account_type, account_subtype, normal_balance, 
          description, is_system, parent_account_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, true)
         ON CONFLICT (org_id, account_code) DO UPDATE SET
           account_name = EXCLUDED.account_name,
           account_type = EXCLUDED.account_type,
           account_subtype = EXCLUDED.account_subtype,
           normal_balance = EXCLUDED.normal_balance
         RETURNING id, account_code`,
        [orgId, account.account_code, account.account_name, account.account_type,
         account.account_subtype || null, account.normal_balance,
         account.description || null, account.is_system || false]
      );
      
      accountMap.set(account.account_code, result.rows[0].id);
    } catch (error) {
      console.error(`Error seeding account ${account.account_code}:`, error.message);
    }
  }

  // Second pass: Update parent relationships
  for (const account of CHART_OF_ACCOUNTS) {
    if (account.parent_code) {
      const parentId = accountMap.get(account.parent_code);
      const accountId = accountMap.get(account.account_code);
      
      if (parentId && accountId) {
        await pool.query(
          'UPDATE accounting_chart_of_accounts SET parent_account_id = $1 WHERE id = $2',
          [parentId, accountId]
        );
      }
    }
  }

  console.log(`✅ Seeded ${accountMap.size} chart of accounts entries.`);
}

async function seedCostCenters(orgId) {
  console.log(`🏢 Seeding cost centers for org: ${orgId}...`);

  for (const costCenter of COST_CENTERS) {
    try {
      await pool.query(
        `INSERT INTO accounting_cost_centers 
         (org_id, cost_center_code, cost_center_name, cost_center_type, budget_amount, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (org_id, cost_center_code) DO UPDATE SET
           cost_center_name = EXCLUDED.cost_center_name,
           cost_center_type = EXCLUDED.cost_center_type,
           budget_amount = EXCLUDED.budget_amount`,
        [orgId, costCenter.cost_center_code, costCenter.cost_center_name,
         costCenter.cost_center_type, costCenter.budget_amount]
      );
    } catch (error) {
      console.error(`Error seeding cost center ${costCenter.cost_center_code}:`, error.message);
    }
  }

  console.log(`✅ Seeded ${COST_CENTERS.length} cost centers.`);
}

async function seedAccountingMasters() {
  console.log('🌱 Starting accounting masters seed...\n');

  try {
    // Get all organizations
    const { rows: organizations } = await pool.query('SELECT id, name FROM organizations ORDER BY name');

    if (organizations.length === 0) {
      console.log('⚠️  No organizations found. Skipping accounting masters seeding.');
      return;
    }

    for (const org of organizations) {
      console.log(`\n📍 Processing organization: ${org.name} (${org.id})`);
      await seedChartOfAccounts(org.id);
      await seedCostCenters(org.id);
    }

    console.log('\n✅ Accounting masters seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding accounting masters:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAccountingMasters()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedAccountingMasters };
