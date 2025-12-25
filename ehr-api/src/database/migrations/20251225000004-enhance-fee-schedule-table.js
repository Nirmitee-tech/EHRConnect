/**
 * Migration: Enhance Fee Schedule Table
 * Date: 2025-12-25
 * Description: Adds missing fields to fee schedules for better pricing management
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- =====================================================
-- ENHANCE FEE SCHEDULES TABLE
-- =====================================================
-- Add missing fields
ALTER TABLE billing_fee_schedules 
  ADD COLUMN IF NOT EXISTS modifier VARCHAR(5),
  ADD COLUMN IF NOT EXISTS facility_amount DECIMAL(10,2);

-- Update unique constraint to include modifier
ALTER TABLE billing_fee_schedules DROP CONSTRAINT IF EXISTS billing_fee_schedules_org_id_payer_id_cpt_code_effective_from_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_schedules_unique 
  ON billing_fee_schedules(org_id, COALESCE(payer_id, '00000000-0000-0000-0000-000000000000'::uuid), cpt_code, COALESCE(modifier, ''), effective_from);

-- Add composite indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_fee_schedules_lookup ON billing_fee_schedules(org_id, cpt_code, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_fee_schedules_payer_lookup ON billing_fee_schedules(org_id, payer_id, active) WHERE active = true AND payer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fee_schedules_dates ON billing_fee_schedules(effective_from, effective_to);

-- Add trigger
CREATE OR REPLACE TRIGGER update_billing_fee_schedules_updated_at 
  BEFORE UPDATE ON billing_fee_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Fee Schedule table enhanced successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
-- Drop trigger
DROP TRIGGER IF EXISTS update_billing_fee_schedules_updated_at ON billing_fee_schedules;

-- Drop indexes
DROP INDEX IF EXISTS idx_fee_schedules_dates;
DROP INDEX IF EXISTS idx_fee_schedules_payer_lookup;
DROP INDEX IF EXISTS idx_fee_schedules_lookup;
DROP INDEX IF EXISTS idx_fee_schedules_unique;

-- Drop columns
ALTER TABLE billing_fee_schedules DROP COLUMN IF EXISTS facility_amount;
ALTER TABLE billing_fee_schedules DROP COLUMN IF EXISTS modifier;
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Fee Schedule enhancements rolled back');
  }
};
