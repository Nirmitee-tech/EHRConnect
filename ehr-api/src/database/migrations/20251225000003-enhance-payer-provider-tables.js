/**
 * Migration: Enhance Payer and Provider Tables
 * Date: 2025-12-25
 * Description: Adds missing fields to payers and providers tables per requirements
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- =====================================================
-- ENHANCE PAYERS TABLE
-- =====================================================
-- Add missing fields for payer management
ALTER TABLE billing_payers 
  ADD COLUMN IF NOT EXISTS timely_filing_days INTEGER DEFAULT 365,
  ADD COLUMN IF NOT EXISTS edi_payer_id VARCHAR(20),
  ADD COLUMN IF NOT EXISTS clearinghouse_id VARCHAR(50);

-- Update payer_type constraint to include all required types
ALTER TABLE billing_payers DROP CONSTRAINT IF EXISTS billing_payers_payer_type_check;
ALTER TABLE billing_payers 
  ADD CONSTRAINT billing_payers_payer_type_check 
  CHECK (payer_type IN ('medicare', 'medicaid', 'commercial', 'self_pay', 'workers_comp', 'tricare', 'champva', 'other'));

-- Add index for payer type search
CREATE INDEX IF NOT EXISTS idx_payers_type_active ON billing_payers(payer_type, active);
CREATE INDEX IF NOT EXISTS idx_payers_name_search ON billing_payers USING gin(to_tsvector('english', name));

-- =====================================================
-- ENHANCE PROVIDERS TABLE
-- =====================================================
-- Add missing fields for provider management
ALTER TABLE billing_providers 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS credentials VARCHAR(50),
  ADD COLUMN IF NOT EXISTS dea_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_billing_provider BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_rendering_provider BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_referring_provider BOOLEAN DEFAULT FALSE;

-- Make some fields nullable since they might not always be required
ALTER TABLE billing_providers ALTER COLUMN license_number DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN taxonomy_code DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN address_line1 DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN city DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN state DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN zip_code DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE billing_providers ALTER COLUMN last_name DROP NOT NULL;

-- Update unique constraint to include org_id
ALTER TABLE billing_providers DROP CONSTRAINT IF EXISTS billing_providers_npi_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_org_npi ON billing_providers(org_id, npi) WHERE org_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_npi_system ON billing_providers(npi) WHERE org_id IS NULL;

-- Add composite indexes
CREATE INDEX IF NOT EXISTS idx_providers_org_active ON billing_providers(org_id, active) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_org_specialty ON billing_providers(org_id, specialty) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON billing_providers(user_id);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE TRIGGER update_billing_payers_updated_at 
  BEFORE UPDATE ON billing_payers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_billing_providers_updated_at 
  BEFORE UPDATE ON billing_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Payer and Provider tables enhanced successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
-- Drop triggers
DROP TRIGGER IF EXISTS update_billing_providers_updated_at ON billing_providers;
DROP TRIGGER IF EXISTS update_billing_payers_updated_at ON billing_payers;

-- Drop provider indexes
DROP INDEX IF EXISTS idx_providers_user_id;
DROP INDEX IF EXISTS idx_providers_org_specialty;
DROP INDEX IF EXISTS idx_providers_org_active;
DROP INDEX IF EXISTS idx_providers_npi_system;
DROP INDEX IF EXISTS idx_providers_org_npi;

-- Drop payer indexes
DROP INDEX IF EXISTS idx_payers_name_search;
DROP INDEX IF EXISTS idx_payers_type_active;

-- Drop provider columns
ALTER TABLE billing_providers DROP COLUMN IF EXISTS is_referring_provider;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS is_rendering_provider;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS is_billing_provider;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS address;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS dea_number;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS credentials;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS user_id;
ALTER TABLE billing_providers DROP COLUMN IF EXISTS org_id;

-- Drop payer columns
ALTER TABLE billing_payers DROP COLUMN IF EXISTS clearinghouse_id;
ALTER TABLE billing_payers DROP COLUMN IF EXISTS edi_payer_id;
ALTER TABLE billing_payers DROP COLUMN IF EXISTS timely_filing_days;
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Payer and Provider enhancements rolled back');
  }
};
