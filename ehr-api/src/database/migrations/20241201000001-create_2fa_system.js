const { Pool } = require('pg');

/**
 * Migration: Create 2FA System
 *
 * This migration creates tables for a comprehensive 2FA system:
 * - global_2fa_settings: Global 2FA enforcement settings
 * - user_2fa_settings: Per-user 2FA preferences
 * - mfa_codes: Stores generated MFA codes with expiry and retry tracking
 * - audit_events: Extended for 2FA-related events
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
      console.log('🔄 Creating 2FA system tables...');

      // 1. Create global_2fa_settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS global_2fa_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          enabled BOOLEAN NOT NULL DEFAULT false,
          enforcement_level TEXT NOT NULL DEFAULT 'optional' CHECK (
            enforcement_level IN ('disabled', 'optional', 'mandatory')
          ),
          allowed_methods JSONB NOT NULL DEFAULT '["email"]'::JSONB,
          grace_period_days INTEGER DEFAULT 0,
          config JSONB NOT NULL DEFAULT '{}'::JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_by UUID REFERENCES users(id),
          UNIQUE(org_id)
        );
      `);

      await client.query(`
        CREATE INDEX idx_global_2fa_settings_org_id ON global_2fa_settings(org_id);
        CREATE INDEX idx_global_2fa_settings_enabled ON global_2fa_settings(org_id, enabled);
      `);

      console.log('  ✅ Created global_2fa_settings table');

      // 2. Create user_2fa_settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_2fa_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          enabled BOOLEAN NOT NULL DEFAULT false,
          method TEXT NOT NULL DEFAULT 'email' CHECK (
            method IN ('email', 'sms', 'totp')
          ),
          verified BOOLEAN NOT NULL DEFAULT false,
          backup_email TEXT,
          phone_number TEXT,
          totp_secret TEXT,
          backup_codes JSONB,
          last_used_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB,
          UNIQUE(user_id)
        );
      `);

      await client.query(`
        CREATE INDEX idx_user_2fa_settings_user_id ON user_2fa_settings(user_id);
        CREATE INDEX idx_user_2fa_settings_enabled ON user_2fa_settings(user_id, enabled);
        CREATE INDEX idx_user_2fa_settings_verified ON user_2fa_settings(user_id, verified);
      `);

      console.log('  ✅ Created user_2fa_settings table');

      // 3. Create mfa_codes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS mfa_codes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          code TEXT NOT NULL,
          method TEXT NOT NULL CHECK (
            method IN ('email', 'sms', 'totp')
          ),
          purpose TEXT NOT NULL DEFAULT 'login' CHECK (
            purpose IN ('login', 'setup', 'verify', 'backup')
          ),
          expires_at TIMESTAMP NOT NULL,
          verified_at TIMESTAMP,
          attempts INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 3,
          ip_address TEXT,
          user_agent TEXT,
          sent_to TEXT,
          email_sent BOOLEAN NOT NULL DEFAULT false,
          email_sent_at TIMESTAMP,
          email_error TEXT,
          email_retry_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB
        );
      `);

      await client.query(`
        CREATE INDEX idx_mfa_codes_user_id ON mfa_codes(user_id);
        CREATE INDEX idx_mfa_codes_code ON mfa_codes(code);
        CREATE INDEX idx_mfa_codes_expires_at ON mfa_codes(expires_at);
        CREATE INDEX idx_mfa_codes_verified_at ON mfa_codes(verified_at);
        CREATE INDEX idx_mfa_codes_created_at ON mfa_codes(created_at);
      `);

      console.log('  ✅ Created mfa_codes table');

      // 4. Create trigger for updated_at on global_2fa_settings
      await client.query(`
        CREATE TRIGGER set_global_2fa_settings_updated_at
        BEFORE UPDATE ON global_2fa_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);

      // 5. Create trigger for updated_at on user_2fa_settings
      await client.query(`
        CREATE TRIGGER set_user_2fa_settings_updated_at
        BEFORE UPDATE ON user_2fa_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);

      console.log('  ✅ Created triggers');

      // 6. Insert default global settings for existing organizations
      await client.query(`
        INSERT INTO global_2fa_settings (org_id, enabled, enforcement_level, allowed_methods)
        SELECT id, false, 'optional', '["email"]'::JSONB
        FROM organizations
        ON CONFLICT (org_id) DO NOTHING;
      `);

      console.log('  ✅ Inserted default global 2FA settings for existing organizations');

      // 7. Create a function to clean up expired MFA codes (scheduled cleanup)
      await client.query(`
        CREATE OR REPLACE FUNCTION cleanup_expired_mfa_codes()
        RETURNS void AS $$
        BEGIN
          DELETE FROM mfa_codes
          WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
            OR (verified_at IS NOT NULL AND verified_at < CURRENT_TIMESTAMP - INTERVAL '7 days');
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log('  ✅ Created cleanup function for expired MFA codes');

      console.log('✅ 2FA system tables created successfully');

    } catch (error) {
      console.error('❌ Error creating 2FA system:', error);
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
      console.log('🔄 Dropping 2FA system tables...');

      // Drop tables in reverse order
      await client.query('DROP TABLE IF EXISTS mfa_codes CASCADE;');
      await client.query('DROP TABLE IF EXISTS user_2fa_settings CASCADE;');
      await client.query('DROP TABLE IF EXISTS global_2fa_settings CASCADE;');
      await client.query('DROP FUNCTION IF EXISTS cleanup_expired_mfa_codes() CASCADE;');

      console.log('✅ 2FA system tables dropped successfully');

    } catch (error) {
      console.error('❌ Error dropping 2FA system:', error);
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  }
};
