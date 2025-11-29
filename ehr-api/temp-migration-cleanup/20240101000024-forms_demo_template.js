const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sqlPath = path.resolve(__dirname, '024_forms_demo_template.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Create a new pg pool using the same config as Sequelize
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });
    
    try {
      console.log('🔄 Executing 024_forms_demo_template.sql...');
      await pool.query(sql);
      console.log('✅ 024_forms_demo_template.sql completed');
    } catch (error) {
      console.error('❌ 024_forms_demo_template.sql failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if rollback file exists
    const rollbackPath = path.resolve(__dirname, '024_forms_demo_template_rollback.sql');
    
    if (!fs.existsSync(rollbackPath)) {
      console.log('⚠️  No rollback file found for 024_forms_demo_template.sql');
      return;
    }
    
    const sql = fs.readFileSync(rollbackPath, 'utf8');
    
    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });
    
    try {
      console.log('🔄 Rolling back 024_forms_demo_template.sql...');
      await pool.query(sql);
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
