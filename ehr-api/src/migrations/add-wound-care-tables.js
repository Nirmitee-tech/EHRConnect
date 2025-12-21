/**
 * Migration: Create Wound Care & Hyperbaric Medicine tables
 *
 * Creates tables for comprehensive wound care management including:
 * - Patient wound profiles
 * - Wound assessments and tracking
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

    // 1. Wound Care Patient Profile
    await client.query(`
      CREATE TABLE IF NOT EXISTS wound_care_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        org_id UUID NOT NULL,
        wound_type VARCHAR(100),
        healing_status VARCHAR(50),
        treatment_plan TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_wound_care_patients_patient_id
      ON wound_care_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_wound_care_patients_org_id
      ON wound_care_patients(org_id);
    `);
    console.log('✅ Created wound_care_patients table');

    // 2. Wound Care Assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS wound_care_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        wound_location VARCHAR(100),
        wound_size VARCHAR(100),
        wound_stage VARCHAR(50),
        photos JSONB DEFAULT '[]',
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_wound_care_assessments_patient_id
      ON wound_care_assessments(patient_id);

      CREATE INDEX IF NOT EXISTS idx_wound_care_assessments_episode_id
      ON wound_care_assessments(episode_id);

      CREATE INDEX IF NOT EXISTS idx_wound_care_assessments_org_id
      ON wound_care_assessments(org_id);

      CREATE INDEX IF NOT EXISTS idx_wound_care_assessments_date
      ON wound_care_assessments(assessment_date);
    `);
    console.log('✅ Created wound_care_assessments table');

    // 3. Add foreign keys
    await client.query(`
      ALTER TABLE wound_care_patients
      ADD CONSTRAINT fk_wound_care_patients_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

      ALTER TABLE wound_care_assessments
      ADD CONSTRAINT fk_wound_care_assessments_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);
    console.log('✅ Added foreign key constraints');

    await client.query('COMMIT');
    console.log('✅ Wound Care tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating Wound Care tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Drop tables in reverse order
    await client.query('DROP TABLE IF EXISTS wound_care_assessments CASCADE;');
    await client.query('DROP TABLE IF EXISTS wound_care_patients CASCADE;');

    await client.query('COMMIT');
    console.log('✅ Wound Care tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping Wound Care tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// CLI support
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'up') {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (command === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    console.log('Usage: node add-wound-care-tables.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
