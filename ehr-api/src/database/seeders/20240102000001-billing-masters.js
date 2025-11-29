const { Pool } = require('pg');
const { seedBillingMasters } = require('../seed-scripts/seed-billing-masters');

/**
 * Sequelize Seeder: Billing Master Data
 * Seeds CPT codes, ICD codes, modifiers, payers, and fee schedules
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
      console.log('\n🧾 Seeding billing master data...\n');
      await seedBillingMasters(pool);
      console.log('\n✅ Billing master data seeded successfully!\n');
    } catch (error) {
      console.error('\n❌ Failed to seed billing master data:', error.message);
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

    console.log('🔄 Cleaning up billing master data...');

    await queryInterface.bulkDelete('billing_fee_schedules', null, {});
    await queryInterface.bulkDelete('billing_payers', null, {});
    await queryInterface.bulkDelete('billing_modifiers', null, {});
    await queryInterface.bulkDelete('billing_icd_codes', null, {});
    await queryInterface.bulkDelete('billing_cpt_codes', null, {});

    console.log('✅ Cleanup completed');
  }
};
