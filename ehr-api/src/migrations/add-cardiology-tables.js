/**
 * Migration: Create Cardiology clinical tables
 *
 * Creates tables for comprehensive cardiovascular care including:
 * - Patient cardiac profiles
 * - Cardiac assessments and monitoring
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Cardiology Patient Profile
    await client.query(`
      CREATE TABLE IF NOT EXISTS cardiology_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        org_id UUID NOT NULL,
        primary_condition VARCHAR(255),
        risk_factors TEXT[],
        cardiac_history JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cardiology_patients_patient_id
      ON cardiology_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_cardiology_patients_org_id
      ON cardiology_patients(org_id);
    `);
    console.log('✅ Created cardiology_patients table');

    // 2. Cardiology Assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS cardiology_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        blood_pressure VARCHAR(50),
        heart_rate INTEGER,
        ecg_results TEXT,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cardiology_assessments_patient_id
      ON cardiology_assessments(patient_id);

      CREATE INDEX IF NOT EXISTS idx_cardiology_assessments_episode_id
      ON cardiology_assessments(episode_id);

      CREATE INDEX IF NOT EXISTS idx_cardiology_assessments_date
      ON cardiology_assessments(assessment_date);

      CREATE INDEX IF NOT EXISTS idx_cardiology_assessments_org_id
      ON cardiology_assessments(org_id);
    `);
    console.log('✅ Created cardiology_assessments table');

    // 3. Add foreign key constraints
    await client.query(`
      ALTER TABLE cardiology_patients
      ADD CONSTRAINT fk_cardiology_patients_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

      ALTER TABLE cardiology_assessments
      ADD CONSTRAINT fk_cardiology_assessments_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);
    console.log('✅ Added foreign key constraints');

    await client.query('COMMIT');
    console.log('✅ All cardiology tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Drop tables in reverse order
    await client.query('DROP TABLE IF EXISTS cardiology_assessments CASCADE;');
    console.log('✅ Dropped cardiology_assessments table');

    await client.query('DROP TABLE IF EXISTS cardiology_patients CASCADE;');
    console.log('✅ Dropped cardiology_patients table');

    await client.query('COMMIT');
    console.log('✅ All cardiology tables dropped successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Export for use in migration runner
module.exports = { up, down };

// Run migration if executed directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'up') {
    up()
      .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Migration failed:', err);
        process.exit(1);
      });
  } else if (command === 'down') {
    down()
      .then(() => {
        console.log('✅ Rollback completed successfully');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Rollback failed:', err);
        process.exit(1);
      });
  } else {
    console.log('Usage: node add-cardiology-tables.js [up|down]');
    process.exit(1);
  }
}
