#!/usr/bin/env node

/**
 * Unified Database Setup Script
 * Handles migrations and seeding with proper tracking
 *
 * Usage:
 *   npm run db:setup         - Run all pending migrations
 *   npm run db:seed          - Run all seeds (idempotent)
 *   npm run db:setup:fresh   - Fresh install (migrations + seeds)
 *   npm run db:status        - Check migration status
 */

const { execSync } = require('child_process');
const path = require('path');

const commands = {
  'migrate': () => {
    console.log('\n📊 Running database migrations...\n');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('\n✅ Migrations completed!\n');
  },

  'migrate:undo': () => {
    console.log('\n⏮️  Rolling back last migration...\n');
    execSync('npx sequelize-cli db:migrate:undo', { stdio: 'inherit' });
    console.log('\n✅ Rollback completed!\n');
  },

  'migrate:status': () => {
    console.log('\n📋 Migration status:\n');
    execSync('npx sequelize-cli db:migrate:status', { stdio: 'inherit' });
  },

  'seed': () => {
    console.log('\n🌱 Seeding database...\n');
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('\n✅ Seeding completed!\n');
  },

  'seed:undo': () => {
    console.log('\n🔄 Undoing seeds...\n');
    execSync('npx sequelize-cli db:seed:undo:all', { stdio: 'inherit' });
    console.log('\n✅ Seeds undone!\n');
  },

  'fresh': () => {
    console.log('\n🆕 Fresh database setup...\n');
    commands.migrate();
    commands.seed();
    console.log('\n🎉 Database setup complete!\n');
  },

  'help': () => {
    console.log(`
📘 Database Setup Commands:

  migrate         Run all pending migrations
  migrate:undo    Rollback the last migration
  migrate:status  Show migration status
  seed            Run all seeds (safe to re-run)
  seed:undo       Undo all seeds
  fresh           Fresh setup (migrate + seed) ⭐ RECOMMENDED
  help            Show this help message

NPM Shortcuts:
  npm run db:setup         → migrate
  npm run db:setup:fresh   → fresh (migrations + seeds) ⭐
  npm run db:seed          → seed
  npm run db:status        → migrate:status
  npm run db:rollback      → migrate:undo

Examples:
  npm run db:setup:fresh              # Complete database setup
  npm run db:status                   # Check what's been run
  node src/database/db-setup.js fresh # Same as above

Database Structure:
  ✅ 26 schema migrations (tables, indexes, triggers)
  ✅ 4 data seeders (roles, billing, providers, inventory)
  ✅ All seeders are idempotent (safe to re-run)
`);
  }
};

// Main execution
const command = process.argv[2] || 'help';

if (commands[command]) {
  try {
    commands[command]();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error executing ${command}:`, error.message);
    process.exit(1);
  }
} else {
  console.error(`\n❌ Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}
