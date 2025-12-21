/**
 * Migration: Create Orthopedics clinical tables
 *
 * Creates tables for orthopedic and sports medicine care including:
 * - Patient demographics and mobility tracking
 * - Joint assessments and injury evaluations
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

    // 1. Orthopedics Patient Profile
    await client.query(`
      CREATE TABLE IF NOT EXISTS orthopedics_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        org_id UUID NOT NULL,
        primary_condition TEXT,
        mobility_status VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ortho_patients_patient_id
      ON orthopedics_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_ortho_patients_org_id
      ON orthopedics_patients(org_id);
    `);
    console.log('✅ Created orthopedics_patients table');

    // 2. Orthopedics Assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS orthopedics_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        joint_location VARCHAR(100),
        injury_type VARCHAR(100),
        severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe')),
        range_of_motion JSONB,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ortho_assessments_patient_id
      ON orthopedics_assessments(patient_id);

      CREATE INDEX IF NOT EXISTS idx_ortho_assessments_episode_id
      ON orthopedics_assessments(episode_id);

      CREATE INDEX IF NOT EXISTS idx_ortho_assessments_date
      ON orthopedics_assessments(assessment_date);

      CREATE INDEX IF NOT EXISTS idx_ortho_assessments_org_id
      ON orthopedics_assessments(org_id);
    `);
    console.log('✅ Created orthopedics_assessments table');

    // 3. Add foreign key constraint
    await client.query(`
      ALTER TABLE orthopedics_patients
      ADD CONSTRAINT fk_ortho_patients_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

      ALTER TABLE orthopedics_assessments
      ADD CONSTRAINT fk_ortho_assessments_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);
    console.log('✅ Added foreign key constraints');

    await client.query('COMMIT');
    console.log('✅ All orthopedics tables created successfully');
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

    await client.query('DROP TABLE IF EXISTS orthopedics_assessments CASCADE;');
    console.log('✅ Dropped orthopedics_assessments table');

    await client.query('DROP TABLE IF EXISTS orthopedics_patients CASCADE;');
    console.log('✅ Dropped orthopedics_patients table');

    await client.query('COMMIT');
    console.log('✅ All orthopedics tables dropped successfully');
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
    console.log('Usage: node add-orthopedics-tables.js [up|down]');
    process.exit(1);
  }
}
