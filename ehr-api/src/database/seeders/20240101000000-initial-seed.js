const fs = require('fs');
const path = require('path');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // We can reuse the logic from existing seeders by requiring them if they were designed to be reusable,
        // but they are standalone scripts. We will reimplement the critical parts here using Sequelize.

        // 1. Seed Default Roles
        // We'll read the roles from the existing file if possible, or just copy the array.
        // Since the file is large, let's try to require the array if it was exported.
        // Looking at seed-default-roles.js, it doesn't export the array, it just runs.
        // So we will copy the critical roles or just run the script via child_process?
        // Running via child_process is safer to ensure exact behavior, but it's not "pure" Sequelize.
        // However, for an initial migration/seed, it's acceptable to invoke the existing scripts
        // until they are fully refactored.

        // Actually, let's try to use the existing scripts by executing them.
        // But wait, the existing scripts use 'pg' and their own connection logic.
        // We want to use the transaction provided by Sequelize if possible, but that's hard with external scripts.

        // Let's copy the roles logic for now as it's the most critical one.
        // I'll read the file content and extract the DEFAULT_ROLES array using a regex or just copy-paste if I had the full content.
        // Since I don't have the full content of seed-default-roles.js (it was truncated), I should probably read it fully first or just use a simplified version.

        // Better approach: Create a seeder that runs the existing scripts using `child_process.execSync`.
        // This ensures we don't miss anything and don't introduce regression.

        const { execSync } = require('child_process');

        console.log('Running existing seeders...');

        try {
            // We need to make sure we are in the project root
            const projectRoot = path.resolve(__dirname, '../../..');

            // 1. Seed Roles
            console.log('Seeding Roles...');
            execSync('node src/scripts/seed-default-roles.js', { cwd: projectRoot, stdio: 'inherit' });

            // 2. Seed Inventory (locations, categories, suppliers)
            console.log('\nSeeding Inventory...');
            execSync('node src/database/seed-scripts/seed-inventory-masters.js', { cwd: projectRoot, stdio: 'inherit' });

            console.log('\n✅ All seeders completed successfully!');
        } catch (error) {
            console.error('Error running seeders:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Truncate tables
        // Be careful with foreign keys
        await queryInterface.bulkDelete('roles', null, {});
        // Add other tables if needed
    }
};
