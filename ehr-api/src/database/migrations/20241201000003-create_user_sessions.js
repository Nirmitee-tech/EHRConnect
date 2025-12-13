const { Pool } = require('pg');

/**
 * Migration: Create User Sessions Table
 *
 * This migration creates the user_sessions table for session management:
 * - Stores access token and refresh token hashes
 * - Tracks session activity and device info
 * - Supports multi-device sessions
 * - Enables session revocation
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
      console.log('🔄 Creating user_sessions table...');

      // Create user_sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          access_token_hash TEXT NOT NULL,
          refresh_token_hash TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          revoked_at TIMESTAMP,
          is_active BOOLEAN NOT NULL DEFAULT true,
          ip_address TEXT,
          user_agent TEXT,
          device_info JSONB DEFAULT '{}'::JSONB,
          metadata JSONB DEFAULT '{}'::JSONB
        );
      `);

      // Create indexes for performance
      await client.query(`
        CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
        CREATE INDEX idx_user_sessions_access_token ON user_sessions(access_token_hash);
        CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
        CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
        CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active);
        CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at);
      `);

      console.log('  ✅ Created user_sessions table with indexes');

      // Create trigger for updated_at-like behavior on last_activity_at
      await client.query(`
        CREATE OR REPLACE FUNCTION update_session_last_activity()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.last_activity_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await client.query(`
        CREATE TRIGGER set_session_last_activity
        BEFORE UPDATE ON user_sessions
        FOR EACH ROW
        WHEN (OLD.last_activity_at IS DISTINCT FROM NEW.last_activity_at)
        EXECUTE FUNCTION update_session_last_activity();
      `);

      console.log('  ✅ Created triggers for session activity tracking');

      // Create cleanup function for expired sessions
      await client.query(`
        CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
        RETURNS void AS $$
        BEGIN
          UPDATE user_sessions
          SET is_active = false
          WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true;
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log('  ✅ Created cleanup function for expired sessions');

      console.log('✅ User sessions table created successfully');

    } catch (error) {
      console.error('❌ Error creating user_sessions table:', error);
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
      console.log('🔄 Dropping user_sessions table...');

      await client.query('DROP TABLE IF EXISTS user_sessions CASCADE;');
      await client.query('DROP FUNCTION IF EXISTS update_session_last_activity() CASCADE;');
      await client.query('DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;');

      console.log('✅ User sessions table dropped successfully');

    } catch (error) {
      console.error('❌ Error dropping user_sessions table:', error);
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  }
};
