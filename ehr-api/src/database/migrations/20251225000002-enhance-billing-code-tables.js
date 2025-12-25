/**
 * Migration: Enhance Billing Code Tables
 * Date: 2025-12-25
 * Description: Adds missing fields and indexes to CPT, ICD, and modifier tables for performance
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- =====================================================
-- ENHANCE CPT CODES TABLE
-- =====================================================
-- Add missing fields
ALTER TABLE billing_cpt_codes 
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
  ADD COLUMN IF NOT EXISTS rvu_work DECIMAL(8,4),
  ADD COLUMN IF NOT EXISTS rvu_facility DECIMAL(8,4),
  ADD COLUMN IF NOT EXISTS rvu_malpractice DECIMAL(8,4);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_cpt_codes_code_active ON billing_cpt_codes(code, active);
CREATE INDEX IF NOT EXISTS idx_cpt_codes_active_effective ON billing_cpt_codes(active, effective_date) WHERE active = true;

-- Add full-text search index for description
CREATE INDEX IF NOT EXISTS idx_cpt_codes_description_gin ON billing_cpt_codes USING gin(to_tsvector('english', description));

-- =====================================================
-- ENHANCE ICD CODES TABLE
-- =====================================================
-- Add missing fields
ALTER TABLE billing_icd_codes 
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(255),
  ADD COLUMN IF NOT EXISTS chapter VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT TRUE;

-- Add composite indexes
CREATE INDEX IF NOT EXISTS idx_icd_codes_version_active ON billing_icd_codes(icd_version, active);
CREATE INDEX IF NOT EXISTS idx_icd_codes_active_effective ON billing_icd_codes(active, effective_date) WHERE active = true;

-- Add full-text search index
CREATE INDEX IF NOT EXISTS idx_icd_codes_description_gin ON billing_icd_codes USING gin(to_tsvector('english', description));

-- =====================================================
-- ENHANCE MODIFIERS TABLE
-- =====================================================
-- Update modifier_type to use ENUM-like constraint
ALTER TABLE billing_modifiers DROP CONSTRAINT IF EXISTS billing_modifiers_modifier_type_check;
ALTER TABLE billing_modifiers 
  ADD CONSTRAINT billing_modifiers_modifier_type_check 
  CHECK (modifier_type IN ('CPT', 'HCPCS', 'ambulance', 'anesthesia'));

-- Add effective_date field
ALTER TABLE billing_modifiers 
  ADD COLUMN IF NOT EXISTS effective_date DATE;

-- Add composite index
CREATE INDEX IF NOT EXISTS idx_modifiers_active_type ON billing_modifiers(active, modifier_type);

-- =====================================================
-- UPDATE EXISTING TRIGGERS
-- =====================================================
-- Ensure updated_at triggers exist
CREATE TRIGGER IF NOT EXISTS update_billing_cpt_codes_updated_at 
  BEFORE UPDATE ON billing_cpt_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_billing_icd_codes_updated_at 
  BEFORE UPDATE ON billing_icd_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_billing_modifiers_updated_at 
  BEFORE UPDATE ON billing_modifiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Billing code tables enhanced successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
-- Drop triggers
DROP TRIGGER IF EXISTS update_billing_modifiers_updated_at ON billing_modifiers;
DROP TRIGGER IF EXISTS update_billing_icd_codes_updated_at ON billing_icd_codes;
DROP TRIGGER IF EXISTS update_billing_cpt_codes_updated_at ON billing_cpt_codes;

-- Drop indexes
DROP INDEX IF EXISTS idx_modifiers_active_type;
DROP INDEX IF EXISTS idx_icd_codes_description_gin;
DROP INDEX IF EXISTS idx_icd_codes_active_effective;
DROP INDEX IF EXISTS idx_icd_codes_version_active;
DROP INDEX IF EXISTS idx_cpt_codes_description_gin;
DROP INDEX IF EXISTS idx_cpt_codes_active_effective;
DROP INDEX IF EXISTS idx_cpt_codes_code_active;

-- Drop columns (be careful in production - data loss!)
ALTER TABLE billing_modifiers DROP COLUMN IF EXISTS effective_date;
ALTER TABLE billing_icd_codes DROP COLUMN IF EXISTS is_billable;
ALTER TABLE billing_icd_codes DROP COLUMN IF EXISTS chapter;
ALTER TABLE billing_icd_codes DROP COLUMN IF EXISTS short_description;
ALTER TABLE billing_cpt_codes DROP COLUMN IF EXISTS rvu_malpractice;
ALTER TABLE billing_cpt_codes DROP COLUMN IF EXISTS rvu_facility;
ALTER TABLE billing_cpt_codes DROP COLUMN IF EXISTS rvu_work;
ALTER TABLE billing_cpt_codes DROP COLUMN IF EXISTS subcategory;
ALTER TABLE billing_cpt_codes DROP COLUMN IF EXISTS short_description;
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Billing code enhancements rolled back');
  }
};
