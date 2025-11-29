const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Add logo and specialties to organizations table

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN organizations.logo_url IS 'URL to organization logo image';
COMMENT ON COLUMN organizations.specialties IS 'Array of medical specialties offered by the organization';
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
      console.log('🔄 Executing 20240101000031-add_org_logo_and_specialties...');
      await pool.query(sql);
      console.log('✅ 20240101000031-add_org_logo_and_specialties completed');
    } catch (error) {
      console.error('❌ 20240101000031-add_org_logo_and_specialties failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000031-add_org_logo_and_specialties.js');
  }
};
