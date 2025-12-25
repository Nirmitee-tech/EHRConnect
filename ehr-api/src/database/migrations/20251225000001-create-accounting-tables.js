/**
 * Migration: Create Accounting Master Tables
 * Date: 2025-12-25
 * Description: Creates chart of accounts, cost centers, bank accounts, and fiscal periods tables
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- =====================================================
-- ACCOUNTING: CHART OF ACCOUNTS
-- =====================================================
CREATE TABLE IF NOT EXISTS accounting_chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_code VARCHAR(20) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'contra_asset')),
  account_subtype VARCHAR(50),
  parent_account_id UUID REFERENCES accounting_chart_of_accounts(id) ON DELETE SET NULL,
  normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_org_account_code UNIQUE(org_id, account_code)
);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_org_id ON accounting_chart_of_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_org_type ON accounting_chart_of_accounts(org_id, account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_org_active ON accounting_chart_of_accounts(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent ON accounting_chart_of_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON accounting_chart_of_accounts(account_code);

-- =====================================================
-- ACCOUNTING: COST CENTERS
-- =====================================================
CREATE TABLE IF NOT EXISTS accounting_cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cost_center_code VARCHAR(20) NOT NULL,
  cost_center_name VARCHAR(255) NOT NULL,
  cost_center_type VARCHAR(50) NOT NULL CHECK (cost_center_type IN ('revenue_generating', 'administrative', 'support')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  parent_cost_center_id UUID REFERENCES accounting_cost_centers(id) ON DELETE SET NULL,
  budget_amount DECIMAL(15,2),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_org_cost_center_code UNIQUE(org_id, cost_center_code)
);

CREATE INDEX IF NOT EXISTS idx_cost_centers_org_id ON accounting_cost_centers(org_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_org_type ON accounting_cost_centers(org_id, cost_center_type);
CREATE INDEX IF NOT EXISTS idx_cost_centers_department ON accounting_cost_centers(department_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_active ON accounting_cost_centers(org_id, is_active);

-- =====================================================
-- ACCOUNTING: BANK ACCOUNTS
-- =====================================================
CREATE TABLE IF NOT EXISTS accounting_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number_encrypted TEXT,
  account_number_last4 VARCHAR(4),
  bank_name VARCHAR(255) NOT NULL,
  routing_number VARCHAR(20),
  account_type VARCHAR(50) CHECK (account_type IN ('checking', 'savings', 'payroll', 'merchant')),
  gl_account_id UUID REFERENCES accounting_chart_of_accounts(id) ON DELETE SET NULL,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_id ON accounting_bank_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org_active ON accounting_bank_accounts(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_gl_account ON accounting_bank_accounts(gl_account_id);

-- =====================================================
-- ACCOUNTING: FISCAL PERIODS
-- =====================================================
CREATE TABLE IF NOT EXISTS accounting_fiscal_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  period_number INTEGER NOT NULL,
  period_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed', 'locked')) DEFAULT 'open',
  closed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_org_fiscal_period UNIQUE(org_id, fiscal_year, period_number)
);

CREATE INDEX IF NOT EXISTS idx_fiscal_periods_org_id ON accounting_fiscal_periods(org_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_org_status ON accounting_fiscal_periods(org_id, status);
CREATE INDEX IF NOT EXISTS idx_fiscal_periods_dates ON accounting_fiscal_periods(org_id, start_date, end_date);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_accounting_chart_of_accounts_updated_at BEFORE UPDATE ON accounting_chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounting_cost_centers_updated_at BEFORE UPDATE ON accounting_cost_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounting_bank_accounts_updated_at BEFORE UPDATE ON accounting_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounting_fiscal_periods_updated_at BEFORE UPDATE ON accounting_fiscal_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Accounting master tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
DROP TRIGGER IF EXISTS update_accounting_fiscal_periods_updated_at ON accounting_fiscal_periods;
DROP TRIGGER IF EXISTS update_accounting_bank_accounts_updated_at ON accounting_bank_accounts;
DROP TRIGGER IF EXISTS update_accounting_cost_centers_updated_at ON accounting_cost_centers;
DROP TRIGGER IF EXISTS update_accounting_chart_of_accounts_updated_at ON accounting_chart_of_accounts;

DROP TABLE IF EXISTS accounting_fiscal_periods CASCADE;
DROP TABLE IF EXISTS accounting_bank_accounts CASCADE;
DROP TABLE IF EXISTS accounting_cost_centers CASCADE;
DROP TABLE IF EXISTS accounting_chart_of_accounts CASCADE;
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Accounting master tables dropped successfully');
  }
};
