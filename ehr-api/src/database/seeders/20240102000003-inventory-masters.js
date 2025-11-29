const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Sequelize Seeder: Inventory Master Data
 * Seeds locations, categories, and suppliers
 *
 * IDEMPOTENT: Safe to run multiple times
 * Uses ON CONFLICT DO UPDATE for all inserts
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if seed-inventory-masters.js exists
    const seedFilePath = path.join(__dirname, '../seed-scripts/seed-inventory-masters.js');

    if (!fs.existsSync(seedFilePath)) {
      console.log('⚠️  Inventory master seeder not found, skipping...');
      return;
    }

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('\n📦 Seeding inventory master data...\n');

      // Import and run the seeder
      const { seedInventoryMasters } = require('../seed-scripts/seed-inventory-masters');
      await seedInventoryMasters(pool);

      console.log('\n✅ Inventory master data seeded successfully!\n');
    } catch (error) {
      console.error('\n❌ Failed to seed inventory master data:', error.message);
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

    console.log('🔄 Cleaning up inventory master data...');
    await queryInterface.bulkDelete('inventory_suppliers', null, {});
    await queryInterface.bulkDelete('inventory_categories', null, {});
    await queryInterface.bulkDelete('inventory_locations', null, {});
    console.log('✅ Cleanup completed');
  }
};
