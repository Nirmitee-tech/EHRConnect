const { Pool } = require('pg');
const { seedProviders } = require('../seed-scripts/providers.seeder');

/**
 * Sequelize Seeder: Billing Providers
 * Seeds sample healthcare providers
 *
 * IDEMPOTENT: Safe to run multiple times
 * Uses ON CONFLICT DO UPDATE for all inserts
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

    try {
      console.log('\n👨‍⚕️ Seeding providers...\n');
      await seedProviders(pool);
      console.log('\n✅ Providers seeded successfully!\n');
    } catch (error) {
      console.error('\n❌ Failed to seed providers:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Only cleanup in non-production environments
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Skipping seed cleanup in production');
      return;
    }

    console.log('🔄 Cleaning up providers...');
    await queryInterface.bulkDelete('billing_providers', null, {});
    console.log('✅ Cleanup completed');
  }
};
