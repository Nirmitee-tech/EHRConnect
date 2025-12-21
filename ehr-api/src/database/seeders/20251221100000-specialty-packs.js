'use strict';

/**
 * Specialty Pack Settings Seeder
 * Enables default specialty packs for all active organizations
 *
 * This seeder ensures that specialty packs are automatically enabled
 * when the system is initialized or reset.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { execSync } = require('child_process');
    const path = require('path');

    console.log('🌱 Running specialty packs seed script...');

    try {
      // Get project root (3 levels up from seeders directory)
      const projectRoot = path.resolve(__dirname, '../../..');

      // Execute the seed script
      execSync('node src/database/seed-scripts/seed-specialty-packs.js', {
        cwd: projectRoot,
        stdio: 'inherit'
      });

      console.log('✅ Specialty packs seeded successfully via Sequelize!');
    } catch (error) {
      console.error('❌ Error running specialty packs seed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⚠️  Removing all specialty pack settings...');

    // Remove all specialty pack settings (be careful!)
    await queryInterface.bulkDelete('org_specialty_settings', null, {});

    console.log('✅ Specialty pack settings removed');
  }
};
