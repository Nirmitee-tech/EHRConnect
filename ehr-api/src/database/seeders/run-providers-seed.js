/**
 * Script to seed billing providers
 * Run with: node src/database/seeders/run-providers-seed.js
 */

const { Pool } = require('pg');
const { seedProviders } = require('./providers.seeder');

async function main() {
  // Database connection
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'medplum',
    user: process.env.DB_USER || 'medplum',
    password: process.env.DB_PASSWORD || 'medplum123',
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('Connected successfully!\n');

    await seedProviders(pool);

    console.log('\n✅ Provider seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
