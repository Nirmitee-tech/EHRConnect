const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Prior Authorization Enhancements
-- Adds readiness tracking columns for prior auths

ALTER TABLE billing_prior_authorizations
  ADD COLUMN IF NOT EXISTS readiness_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_passed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS readiness_notes TEXT;
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
      console.log('🔄 Executing 20240101000025-prior_auth_enhancements...');
      await pool.query(sql);
      console.log('✅ 20240101000025-prior_auth_enhancements completed');
    } catch (error) {
      console.error('❌ 20240101000025-prior_auth_enhancements failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000025-prior_auth_enhancements.js');
  }
};
