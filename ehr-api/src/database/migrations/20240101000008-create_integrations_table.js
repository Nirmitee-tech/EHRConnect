const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Integration Management Tables
-- Stores third-party integration configurations

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('sandbox', 'production')),
    api_endpoint TEXT,
    credentials JSONB DEFAULT '{}',
    usage_mappings JSONB DEFAULT '[]',
    health_status VARCHAR(20) DEFAULT 'inactive' CHECK (health_status IN ('active', 'inactive', 'testing', 'error')),
    last_tested_at TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(org_id, vendor_id, environment)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_integrations_vendor_id ON integrations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_integrations_enabled ON integrations(enabled);
CREATE INDEX IF NOT EXISTS idx_integrations_health_status ON integrations(health_status);

-- Integration Activity Log (for audit trail)
CREATE TABLE IF NOT EXISTS integration_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'enabled', 'disabled', 'tested', 'error', 'webhook_received', 'operation_executed'
    status VARCHAR(20) NOT NULL, -- 'success', 'error'
    details JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_integration_activity_log_integration_id ON integration_activity_log(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_activity_log_created_at ON integration_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_activity_log_activity_type ON integration_activity_log(activity_type);

-- Update trigger for integrations
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integrations_updated_at();

-- Comments
COMMENT ON TABLE integrations IS 'Third-party integration configurations for organizations';
COMMENT ON COLUMN integrations.vendor_id IS 'Integration vendor identifier (epic, cerner, stripe, twilio, etc.)';
COMMENT ON COLUMN integrations.enabled IS 'Whether the integration is currently active';
COMMENT ON COLUMN integrations.environment IS 'Sandbox or production environment';
COMMENT ON COLUMN integrations.credentials IS 'Encrypted API credentials (JSON)';
COMMENT ON COLUMN integrations.usage_mappings IS 'Workflow mappings for the integration (JSON array)';
COMMENT ON COLUMN integrations.health_status IS 'Current health status of the integration';

COMMENT ON TABLE integration_activity_log IS 'Audit log for integration activities and operations';
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 20240101000008-create_integrations_table...');
      await pool.query(sql);
      console.log('✅ 20240101000008-create_integrations_table completed');
    } catch (error) {
      console.error('❌ 20240101000008-create_integrations_table failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000008-create_integrations_table.js');
  }
};
