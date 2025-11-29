/**
 * Script to seed billing master data and billing providers.
 * Run with: node src/database/seeders/run-billing-seed.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const { seedBillingMasters } = require('./seed-billing-masters');
const { seedProviders } = require('./providers.seeder');

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'medplum',
    user: process.env.DB_USER || 'medplum',
    password: process.env.DB_PASSWORD || 'medplum123'
  });

  try {
    console.log('🔌 Connecting to database...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection established.');

    await seedBillingMasters(pool);
    await seedProviders(pool);

    console.log('\n🎯 Billing seed process completed successfully!');
  } catch (error) {
    console.error('\n❌ Billing seed process failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
