/**
 * Migration: Enhance Billing Settings Table
 * Date: 2025-12-25
 * Description: Adds additional settings fields to billing_tenant_settings
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- =====================================================
-- ENHANCE BILLING TENANT SETTINGS
-- =====================================================
-- Add encrypted fields for ClaimMD credentials
ALTER TABLE billing_tenant_settings 
  ADD COLUMN IF NOT EXISTS claim_md_account_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS claim_md_token_encrypted TEXT;

-- Add additional settings fields
ALTER TABLE billing_tenant_settings 
  ADD COLUMN IF NOT EXISTS billing_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS collection_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approval_thresholds JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS statement_settings JSONB DEFAULT '{}';

-- Rename old fields to maintain backward compatibility
ALTER TABLE billing_tenant_settings 
  ALTER COLUMN claim_md_account_key DROP NOT NULL,
  ALTER COLUMN claim_md_token DROP NOT NULL;

-- Add comment to document the structure
COMMENT ON TABLE billing_tenant_settings IS 'Organization-level billing configuration and ClaimMD credentials';
COMMENT ON COLUMN billing_tenant_settings.billing_settings IS 'Payment terms, late fees, etc.';
COMMENT ON COLUMN billing_tenant_settings.collection_settings IS 'Thresholds, auto-workflows';
COMMENT ON COLUMN billing_tenant_settings.approval_thresholds IS 'Adjustment/refund/writeoff limits';
COMMENT ON COLUMN billing_tenant_settings.statement_settings IS 'Frequency, generation day';

-- Add trigger if not exists
CREATE OR REPLACE TRIGGER update_billing_tenant_settings_updated_at 
  BEFORE UPDATE ON billing_tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Billing Settings table enhanced successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
-- Drop trigger
DROP TRIGGER IF EXISTS update_billing_tenant_settings_updated_at ON billing_tenant_settings;

-- Drop columns
ALTER TABLE billing_tenant_settings DROP COLUMN IF EXISTS statement_settings;
ALTER TABLE billing_tenant_settings DROP COLUMN IF EXISTS approval_thresholds;
ALTER TABLE billing_tenant_settings DROP COLUMN IF EXISTS collection_settings;
ALTER TABLE billing_tenant_settings DROP COLUMN IF EXISTS billing_settings;
ALTER TABLE billing_tenant_settings DROP COLUMN IF EXISTS claim_md_token_encrypted;
ALTER TABLE billing_tenant_settings DROP COLUMN IF EXISTS claim_md_account_key_encrypted;
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Billing Settings enhancements rolled back');
  }
};
