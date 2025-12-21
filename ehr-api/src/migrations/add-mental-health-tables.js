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

    // Mental health patient profile
    await client.query(`
      CREATE TABLE IF NOT EXISTS mental_health_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        org_id UUID NOT NULL,
        primary_diagnosis TEXT,
        therapy_type VARCHAR(100),
        medication_status VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Mental health assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS mental_health_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
        anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
        sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mental_health_patients_patient_id
      ON mental_health_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_mental_health_patients_org_id
      ON mental_health_patients(org_id);

      CREATE INDEX IF NOT EXISTS idx_mental_health_assessments_patient_id
      ON mental_health_assessments(patient_id);

      CREATE INDEX IF NOT EXISTS idx_mental_health_assessments_episode_id
      ON mental_health_assessments(episode_id);

      CREATE INDEX IF NOT EXISTS idx_mental_health_assessments_org_id
      ON mental_health_assessments(org_id);
    `);

    // Add foreign keys
    await client.query(`
      ALTER TABLE mental_health_patients
      ADD CONSTRAINT fk_mental_health_patients_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

      ALTER TABLE mental_health_assessments
      ADD CONSTRAINT fk_mental_health_assessments_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);

    await client.query('COMMIT');
    console.log('✅ Mental health tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating mental health tables:', error);
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
    await client.query('DROP TABLE IF EXISTS mental_health_assessments CASCADE;');
    await client.query('DROP TABLE IF EXISTS mental_health_patients CASCADE;');

    await client.query('COMMIT');
    console.log('✅ Mental health tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping mental health tables:', error);
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
    console.log('Usage: node add-mental-health-tables.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
