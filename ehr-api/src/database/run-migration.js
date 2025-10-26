#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration(migrationFile) {
  const client = await pool.connect();

  try {
    console.log(`\n🔄 Running migration: ${migrationFile}`);

    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Begin transaction
    await client.query('BEGIN');

    // Run migration
    await client.query(sql);

    // Commit transaction
    await client.query('COMMIT');

    console.log(`✅ Migration completed: ${migrationFile}\n`);

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error(`❌ Migration failed: ${migrationFile}`);
    console.error(error.message);
    throw error;

  } finally {
    client.release();
  }
}

async function main() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.log('Usage: node run-migration.js <migration-file>');
    console.log('Example: node run-migration.js 001_add_org_id_to_fhir_resources.sql');
    process.exit(1);
  }

  try {
    await runMigration(migrationFile);
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed!');
    process.exit(1);
  }
}

main();
