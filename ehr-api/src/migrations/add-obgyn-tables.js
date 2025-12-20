/**
 * Migration: Create OB/GYN clinical tables
 * 
 * Creates tables for:
 * - obgyn_epds_assessments (Edinburgh Postnatal Depression Scale)
 * - obgyn_labor_delivery_records
 * - obgyn_postpartum_visits
 * - obgyn_ultrasound_records
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function up() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // EPDS Assessments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_epds_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        answers JSONB NOT NULL,
        total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 30),
        risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
        self_harm_risk BOOLEAN DEFAULT FALSE,
        interpretation TEXT,
        recommendation TEXT,
        assessed_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_epds_patient ON obgyn_epds_assessments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_epds_episode ON obgyn_epds_assessments(episode_id);
      CREATE INDEX IF NOT EXISTS idx_epds_risk ON obgyn_epds_assessments(risk_level);
      CREATE INDEX IF NOT EXISTS idx_epds_self_harm ON obgyn_epds_assessments(self_harm_risk) WHERE self_harm_risk = TRUE;
    `);

    console.log('✅ Created obgyn_epds_assessments table');

    // Labor & Delivery Records Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_labor_delivery_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        delivery_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
        gestational_age VARCHAR(20),
        delivery_mode VARCHAR(50) NOT NULL CHECK (delivery_mode IN ('SVD', 'Cesarean', 'Vacuum', 'Forceps', 'VBAC')),
        labor_onset VARCHAR(50) CHECK (labor_onset IN ('Spontaneous', 'Induced', 'Augmented')),
        rupture_of_membranes VARCHAR(50) CHECK (rupture_of_membranes IN ('Spontaneous', 'Artificial', 'Intact at delivery')),
        amniotic_fluid VARCHAR(50) CHECK (amniotic_fluid IN ('Clear', 'Meconium-stained', 'Bloody', 'Foul-smelling')),
        anesthesia_type VARCHAR(50),
        cesarean_details JSONB,
        blood_loss INTEGER,
        episiotomy VARCHAR(50),
        laceration VARCHAR(50),
        placenta_delivery VARCHAR(50),
        uterotonic TEXT,
        maternal_complications JSONB,
        newborn_data JSONB,
        delivery_provider VARCHAR(255),
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        updated_by VARCHAR(255),
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_labor_patient ON obgyn_labor_delivery_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_labor_episode ON obgyn_labor_delivery_records(episode_id);
      CREATE INDEX IF NOT EXISTS idx_labor_datetime ON obgyn_labor_delivery_records(delivery_datetime);
    `);

    console.log('✅ Created obgyn_labor_delivery_records table');

    // Postpartum Visits Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_postpartum_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        visit_date DATE NOT NULL,
        visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('phone_contact', 'wound_check', 'comprehensive', 'lactation', 'mental_health')),
        days_postpartum INTEGER,
        vitals JSONB,
        physical_exam JSONB,
        mental_health JSONB,
        breastfeeding JSONB,
        contraception JSONB,
        labs JSONB,
        notes TEXT,
        next_visit_date DATE,
        provider VARCHAR(255),
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_postpartum_patient ON obgyn_postpartum_visits(patient_id);
      CREATE INDEX IF NOT EXISTS idx_postpartum_episode ON obgyn_postpartum_visits(episode_id);
      CREATE INDEX IF NOT EXISTS idx_postpartum_date ON obgyn_postpartum_visits(visit_date);
    `);

    console.log('✅ Created obgyn_postpartum_visits table');

    // Ultrasound Records Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_ultrasound_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        scan_date DATE NOT NULL,
        gestational_age VARCHAR(20),
        scan_type VARCHAR(50) NOT NULL CHECK (scan_type IN ('dating', 'nt_screening', 'anatomy', 'growth', 'bpp', 'targeted', 'cervical_length')),
        indication TEXT,
        provider VARCHAR(255),
        facility VARCHAR(255),
        fetal_number INTEGER DEFAULT 1,
        presentation VARCHAR(50),
        placenta_location VARCHAR(100),
        amniotic_fluid JSONB,
        biometry JSONB,
        findings JSONB,
        assessment VARCHAR(50) CHECK (assessment IN ('Normal', 'Abnormal', 'Follow-up recommended')),
        abnormal_findings JSONB,
        recommendations JSONB,
        image_count INTEGER,
        report_url TEXT,
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ultrasound_patient ON obgyn_ultrasound_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_ultrasound_episode ON obgyn_ultrasound_records(episode_id);
      CREATE INDEX IF NOT EXISTS idx_ultrasound_date ON obgyn_ultrasound_records(scan_date);
      CREATE INDEX IF NOT EXISTS idx_ultrasound_type ON obgyn_ultrasound_records(scan_type);
    `);

    console.log('✅ Created obgyn_ultrasound_records table');

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS obgyn_ultrasound_records CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_postpartum_visits CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_labor_delivery_records CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_epds_assessments CASCADE');

    await client.query('COMMIT');
    console.log('✅ Rollback completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'down') {
    down()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    up()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { up, down };
