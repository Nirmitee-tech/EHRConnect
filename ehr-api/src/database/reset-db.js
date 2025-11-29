#!/usr/bin/env node

/**
 * Reset Database - Drop all tables and start fresh
 * WARNING: This will delete ALL data!
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

async function resetDatabase() {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL data in the database!\n');
    console.log('🔄 Dropping and recreating schema...\n');

    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');

    console.log('✅ Database reset complete!\n');
    console.log('Now run: npm run db:setup\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
