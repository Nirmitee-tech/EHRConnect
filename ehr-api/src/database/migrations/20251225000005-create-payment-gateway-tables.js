/**
 * Migration: Create Payment Gateway Tables
 * Date: 2025-12-25
 * Description: Creates payment gateway configuration table for Stripe, SePay, etc.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- =====================================================
-- PAYMENT GATEWAYS CONFIGURATION
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_payment_gateways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gateway_name VARCHAR(100) NOT NULL,
  gateway_provider VARCHAR(50) NOT NULL CHECK (gateway_provider IN ('stripe', 'sepay', 'square', 'authorize_net')),
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  webhook_secret_encrypted TEXT,
  merchant_id VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  supported_methods TEXT[] DEFAULT ARRAY['credit_card', 'debit_card'],
  test_mode BOOLEAN DEFAULT FALSE,
  configuration JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_org_gateway_provider UNIQUE(org_id, gateway_provider)
);

CREATE INDEX IF NOT EXISTS idx_payment_gateways_org_id ON billing_payment_gateways(org_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_org_active_default ON billing_payment_gateways(org_id, is_active, is_default);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_provider ON billing_payment_gateways(gateway_provider);

-- Add trigger
CREATE OR REPLACE TRIGGER update_billing_payment_gateways_updated_at 
  BEFORE UPDATE ON billing_payment_gateways
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Payment Gateway tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
DROP TRIGGER IF EXISTS update_billing_payment_gateways_updated_at ON billing_payment_gateways;
DROP TABLE IF EXISTS billing_payment_gateways CASCADE;
`;

    await queryInterface.sequelize.query(sql);
    console.log('✓ Payment Gateway tables dropped successfully');
  }
};
