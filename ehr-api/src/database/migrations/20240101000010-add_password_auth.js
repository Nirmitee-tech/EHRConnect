const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Migration: Add password field to users table for Postgres-based authentication
-- This enables AUTH_PROVIDER=postgres to work alongside AUTH_PROVIDER=keycloak

-- Add password_hash field (nullable to support both auth methods)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make keycloak_user_id nullable (required for postgres-only auth)
ALTER TABLE users
ALTER COLUMN keycloak_user_id DROP NOT NULL;

-- Add index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status);

-- Create a function to hash passwords using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMENT ON COLUMN users.password_hash IS 'Password hash for postgres-based authentication (bcrypt). NULL if using Keycloak-only auth.';
COMMENT ON COLUMN users.keycloak_user_id IS 'Keycloak user ID. NULL if using postgres-only auth.';
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
      console.log('🔄 Executing 20240101000010-add_password_auth...');
      await pool.query(sql);
      console.log('✅ 20240101000010-add_password_auth completed');
    } catch (error) {
      console.error('❌ 20240101000010-add_password_auth failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000010-add_password_auth.js');
  }
};
