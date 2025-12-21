/**
 * Migration: Fix embryo grade field VARCHAR length
 *
 * Issue: day2_grade and day3_grade are VARCHAR(10) but users need longer text
 * Solution: Increase to VARCHAR(50) to match other grade fields
 */

const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'medplum',
    user: process.env.DB_USER || 'medplum',
    password: process.env.DB_PASSWORD || 'medplum123'
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔧 Altering embryo grade columns...');

    // Alter day2_grade from VARCHAR(10) to VARCHAR(50)
    await client.query(`
      ALTER TABLE obgyn_ivf_embryo_development
      ALTER COLUMN day2_grade TYPE VARCHAR(50);
    `);

    // Alter day3_grade from VARCHAR(10) to VARCHAR(50)
    await client.query(`
      ALTER TABLE obgyn_ivf_embryo_development
      ALTER COLUMN day3_grade TYPE VARCHAR(50);
    `);

    await client.query('COMMIT');

    console.log('✅ Successfully updated embryo grade columns to VARCHAR(50)');
    console.log('✅ day2_grade: VARCHAR(10) → VARCHAR(50)');
    console.log('✅ day3_grade: VARCHAR(10) → VARCHAR(50)');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
