const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Add org_type to organizations table

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS org_type TEXT;

-- Add comment
COMMENT ON COLUMN organizations.org_type IS 'Type of healthcare organization: hospital, clinic, diagnostic_center, pharmacy, nursing_home, lab';
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
      console.log('🔄 Executing 20240101000012-add_org_type...');
      await pool.query(sql);
      console.log('✅ 20240101000012-add_org_type completed');
    } catch (error) {
      console.error('❌ 20240101000012-add_org_type failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000012-add_org_type.js');
  }
};
