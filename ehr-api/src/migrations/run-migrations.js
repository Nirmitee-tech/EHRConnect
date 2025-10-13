const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ehr_db',
  user: process.env.DB_USER || 'ehr_user',
  password: process.env.DB_PASSWORD || 'ehr_password'
});

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await pool.query(query);
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const { rows } = await pool.query('SELECT name FROM migrations ORDER BY id');
  return rows.map(row => row.name);
}

// Mark migration as executed
async function markMigrationAsExecuted(migrationName) {
  await pool.query(
    'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [migrationName]
  );
}

// Get all migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '../database/migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return [];
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure migrations run in order

  return files;
}

// Run a single migration
async function runMigration(fileName) {
  const filePath = path.join(__dirname, '../database/migrations', fileName);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`Running migration: ${fileName}`);

  try {
    await pool.query(sql);
    await markMigrationAsExecuted(fileName);
    console.log(`✅ Migration ${fileName} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${fileName} failed:`, error.message);
    throw error;
  }
}

// Main function to run all pending migrations
async function runMigrations() {
  try {
    console.log('🔄 Starting migrations...\n');

    // Create migrations table
    await createMigrationsTable();

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`Executed migrations: ${executedMigrations.length}`);

    // Get all migration files
    const migrationFiles = getMigrationFiles();
    console.log(`Total migration files found: ${migrationFiles.length}\n`);

    // Filter out already executed migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✨ No pending migrations to run');
      return;
    }

    console.log(`Pending migrations: ${pendingMigrations.length}\n`);

    // Run each pending migration
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }

    console.log('\n✅ All migrations completed successfully');

  } catch (error) {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
