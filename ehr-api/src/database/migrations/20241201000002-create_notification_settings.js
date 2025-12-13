const { Pool } = require('pg');

/**
 * Migration: Create Notification Settings
 *
 * This migration creates a system for storing notification provider settings in the database
 * instead of environment variables. This allows admins to configure email (SMTP) and SMS
 * providers through the UI.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    const client = await pool.connect();

    try {
      console.log('🔄 Creating notification settings tables...');

      // 1. Create notification_providers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS notification_providers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          provider_type TEXT NOT NULL CHECK (
            provider_type IN ('email_smtp', 'sms_twilio', 'sms_aws', 'push_fcm')
          ),
          provider_name TEXT NOT NULL,
          enabled BOOLEAN NOT NULL DEFAULT false,
          is_default BOOLEAN NOT NULL DEFAULT false,
          config JSONB NOT NULL DEFAULT '{}'::JSONB,
          credentials JSONB NOT NULL DEFAULT '{}'::JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by UUID REFERENCES users(id),
          updated_by UUID REFERENCES users(id),
          metadata JSONB,
          UNIQUE(org_id, provider_type, provider_name)
        );
      `);

      await client.query(`
        CREATE INDEX idx_notification_providers_org_id ON notification_providers(org_id);
        CREATE INDEX idx_notification_providers_type ON notification_providers(org_id, provider_type);
        CREATE INDEX idx_notification_providers_enabled ON notification_providers(org_id, enabled);
        CREATE INDEX idx_notification_providers_default ON notification_providers(org_id, is_default);
      `);

      console.log('  ✅ Created notification_providers table');

      // 2. Create trigger for updated_at
      await client.query(`
        CREATE TRIGGER set_notification_providers_updated_at
        BEFORE UPDATE ON notification_providers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);

      console.log('  ✅ Created triggers');

      // 3. Insert default MailHog provider for existing organizations (for development)
      await client.query(`
        INSERT INTO notification_providers (
          org_id, provider_type, provider_name, enabled, is_default, config, credentials
        )
        SELECT
          id,
          'email_smtp',
          'MailHog (Development)',
          true,
          true,
          jsonb_build_object(
            'host', 'localhost',
            'port', 1025,
            'secure', false,
            'from_name', 'EHR Connect',
            'from_email', 'noreply@ehrconnect.com'
          ),
          '{}'::JSONB
        FROM organizations
        ON CONFLICT (org_id, provider_type, provider_name) DO NOTHING;
      `);

      console.log('  ✅ Inserted default email provider for existing organizations');

      console.log('✅ Notification settings tables created successfully');

    } catch (error) {
      console.error('❌ Error creating notification settings:', error);
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    const client = await pool.connect();

    try {
      console.log('🔄 Dropping notification settings tables...');

      await client.query('DROP TABLE IF EXISTS notification_providers CASCADE;');

      console.log('✅ Notification settings tables dropped successfully');

    } catch (error) {
      console.error('❌ Error dropping notification settings:', error);
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  }
};
