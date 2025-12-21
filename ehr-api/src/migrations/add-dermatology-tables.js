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

    // Dermatology patient profile
    await client.query(`
      CREATE TABLE IF NOT EXISTS dermatology_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        skin_type VARCHAR(50),
        primary_concern TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Skin assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS dermatology_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        body_location VARCHAR(100),
        condition_type VARCHAR(100),
        severity VARCHAR(50),
        photos JSONB DEFAULT '[]',
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_dermatology_patients_patient_id
      ON dermatology_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_dermatology_patients_org_id
      ON dermatology_patients(org_id);

      CREATE INDEX IF NOT EXISTS idx_dermatology_assessments_patient_id
      ON dermatology_assessments(patient_id);

      CREATE INDEX IF NOT EXISTS idx_dermatology_assessments_episode_id
      ON dermatology_assessments(episode_id);

      CREATE INDEX IF NOT EXISTS idx_dermatology_assessments_org_id
      ON dermatology_assessments(org_id);
    `);

    // Add foreign key constraint
    await client.query(`
      ALTER TABLE dermatology_patients
      ADD CONSTRAINT fk_dermatology_patients_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);

    await client.query(`
      ALTER TABLE dermatology_assessments
      ADD CONSTRAINT fk_dermatology_assessments_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);

    await client.query('COMMIT');
    console.log('✅ Dermatology tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating dermatology tables:', error);
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

    await client.query('DROP TABLE IF EXISTS dermatology_assessments CASCADE;');
    await client.query('DROP TABLE IF EXISTS dermatology_patients CASCADE;');

    await client.query('COMMIT');
    console.log('✅ Dermatology tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping dermatology tables:', error);
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
    console.log('Usage: node add-dermatology-tables.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
