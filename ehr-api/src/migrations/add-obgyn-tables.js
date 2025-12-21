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

    // Complications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_complications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
        detected_at VARCHAR(20),
        detected_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'monitoring', 'resolved', 'resultedInLoss')),
        description TEXT,
        actions_taken JSONB DEFAULT '[]',
        support_services JSONB DEFAULT '[]',
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        updated_by VARCHAR(255),
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_complications_patient ON obgyn_complications(patient_id);
      CREATE INDEX IF NOT EXISTS idx_complications_episode ON obgyn_complications(episode_id);
      CREATE INDEX IF NOT EXISTS idx_complications_type ON obgyn_complications(type);
      CREATE INDEX IF NOT EXISTS idx_complications_status ON obgyn_complications(status);
      CREATE INDEX IF NOT EXISTS idx_complications_active ON obgyn_complications(status) WHERE status IN ('active', 'monitoring');
    `);

    console.log('✅ Created obgyn_complications table');

    // Baby Records Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_baby_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        maternal_patient_id VARCHAR(255) NOT NULL,
        delivery_encounter_id VARCHAR(255),
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        birth_order CHAR(1) NOT NULL CHECK (birth_order IN ('A', 'B', 'C', 'D')),
        sex VARCHAR(10) NOT NULL CHECK (sex IN ('Male', 'Female', 'Unknown')),
        birth_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
        gestational_age_at_birth VARCHAR(20),
        birth_weight INTEGER NOT NULL,
        birth_length INTEGER,
        head_circumference INTEGER,
        apgar_scores JSONB,
        resuscitation VARCHAR(50) CHECK (resuscitation IN ('None', 'Stimulation', 'PPV', 'Intubation', 'CPR')),
        cord_blood BOOLEAN DEFAULT FALSE,
        skin_to_skin BOOLEAN DEFAULT FALSE,
        breastfeeding_initiated BOOLEAN DEFAULT FALSE,
        vitamin_k BOOLEAN DEFAULT FALSE,
        eye_prophylaxis BOOLEAN DEFAULT FALSE,
        nicu_admission JSONB,
        twin_type VARCHAR(50),
        ttts_status VARCHAR(20) CHECK (ttts_status IN ('None', 'Recipient', 'Donor') OR ttts_status IS NULL),
        created_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_baby_maternal ON obgyn_baby_records(maternal_patient_id);
      CREATE INDEX IF NOT EXISTS idx_baby_episode ON obgyn_baby_records(episode_id);
      CREATE INDEX IF NOT EXISTS idx_baby_encounter ON obgyn_baby_records(delivery_encounter_id);
      CREATE INDEX IF NOT EXISTS idx_baby_nicu ON obgyn_baby_records((nicu_admission->>'required')) WHERE (nicu_admission->>'required')::boolean = true;
    `);

    console.log('✅ Created obgyn_baby_records table');

    // Pregnancy History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_pregnancy_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        gtpal JSONB,
        prior_pregnancies JSONB DEFAULT '[]',
        risk_factors JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_preg_history_patient ON obgyn_pregnancy_history(patient_id);
    `);

    console.log('✅ Created obgyn_pregnancy_history table');

    // Genetic Screening Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_genetic_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        nipt_results JSONB DEFAULT '[]',
        nt_results JSONB DEFAULT '[]',
        invasive_tests JSONB DEFAULT '[]',
        carrier_screening JSONB DEFAULT '[]',
        counseling_sessions JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_genetic_patient ON obgyn_genetic_screening(patient_id);
    `);

    console.log('✅ Created obgyn_genetic_screening table');

    // Labs Tracking Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_labs_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        labs JSONB DEFAULT '[]',
        glucose_logs JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_labs_patient ON obgyn_labs_tracking(patient_id);
    `);

    console.log('✅ Created obgyn_labs_tracking table');

    // Kick Counts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_kick_counts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        sessions JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_kicks_patient ON obgyn_kick_counts(patient_id);
    `);

    console.log('✅ Created obgyn_kick_counts table');

    // Birth Plans Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_birth_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        plan_data JSONB NOT NULL,
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_birthplan_patient ON obgyn_birth_plans(patient_id);
    `);

    console.log('✅ Created obgyn_birth_plans table');

    // Vitals Log Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_vitals_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        entries JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_vitals_patient ON obgyn_vitals_log(patient_id);
    `);

    console.log('✅ Created obgyn_vitals_log table');

    // Fetal Assessment (NST/BPP) Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_fetal_assessment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        nst_records JSONB DEFAULT '[]',
        bpp_records JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_fetal_patient ON obgyn_fetal_assessment(patient_id);
    `);

    console.log('✅ Created obgyn_fetal_assessment table');

    // Risk Assessments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_risk_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessments JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_risk_patient ON obgyn_risk_assessments(patient_id);
    `);

    console.log('✅ Created obgyn_risk_assessments table');

    // Medications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_medications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        medications JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_meds_patient ON obgyn_medications(patient_id);
    `);

    console.log('✅ Created obgyn_medications table');

    // Consents Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_consents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        consents JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, COALESCE(episode_id, '00000000-0000-0000-0000-000000000000'::uuid))
      );

      CREATE INDEX IF NOT EXISTS idx_consents_patient ON obgyn_consents(patient_id);
    `);

    console.log('✅ Created obgyn_consents table');

    // IVF Cycles Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_ivf_cycles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        cycle_type VARCHAR(50) NOT NULL CHECK (cycle_type IN ('fresh_ivf', 'fet', 'egg_freezing', 'pgt_cycle')),
        protocol_type VARCHAR(50) CHECK (protocol_type IN ('antagonist', 'long_lupron', 'microdose_flare', 'mild', 'natural')),
        status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'completed', 'frozen')),
        start_date DATE NOT NULL,
        donor_cycle BOOLEAN DEFAULT FALSE,
        baseline JSONB,
        semen_analysis JSONB,
        medications JSONB DEFAULT '[]',
        retrieval_date DATE,
        oocytes_retrieved INTEGER,
        mature_oocytes INTEGER,
        embryos JSONB DEFAULT '[]',
        monitoring_visits JSONB DEFAULT '[]',
        transfers JSONB DEFAULT '[]',
        cryo_storage JSONB DEFAULT '[]',
        outcome JSONB,
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ivf_patient ON obgyn_ivf_cycles(patient_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_episode ON obgyn_ivf_cycles(episode_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_status ON obgyn_ivf_cycles(status);
    `);

    console.log('✅ Created obgyn_ivf_cycles table');

    // Cervical Length Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_cervical_length (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        date DATE NOT NULL,
        gestational_age VARCHAR(20),
        length DECIMAL(5,2) NOT NULL,
        method VARCHAR(50) CHECK (method IN ('transvaginal', 'transabdominal', 'translabial')),
        funneling BOOLEAN DEFAULT FALSE,
        funneling_length DECIMAL(5,2),
        internal_os_open BOOLEAN DEFAULT FALSE,
        notes TEXT,
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cervical_patient ON obgyn_cervical_length(patient_id);
      CREATE INDEX IF NOT EXISTS idx_cervical_episode ON obgyn_cervical_length(episode_id);
      CREATE INDEX IF NOT EXISTS idx_cervical_date ON obgyn_cervical_length(date);
    `);

    console.log('✅ Created obgyn_cervical_length table');

    // Patient Education Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_patient_education (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        module_id VARCHAR(100) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_date TIMESTAMP WITH TIME ZONE,
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, module_id)
      );

      CREATE INDEX IF NOT EXISTS idx_education_patient ON obgyn_patient_education(patient_id);
      CREATE INDEX IF NOT EXISTS idx_education_module ON obgyn_patient_education(module_id);
    `);

    console.log('✅ Created obgyn_patient_education table');

    // Care Plans table (FHIR R4)
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_care_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        intent VARCHAR(50) NOT NULL DEFAULT 'plan',
        title VARCHAR(500) NOT NULL,
        description TEXT,
        period_start TIMESTAMP WITH TIME ZONE,
        period_end TIMESTAMP WITH TIME ZONE,
        activity JSONB DEFAULT '[]',
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_careplan_patient ON obgyn_care_plans(patient_id);
      CREATE INDEX IF NOT EXISTS idx_careplan_episode ON obgyn_care_plans(episode_id);
      CREATE INDEX IF NOT EXISTS idx_careplan_status ON obgyn_care_plans(status);
    `);

    console.log('✅ Created obgyn_care_plans table');

    // Goals table (FHIR R4)
    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        care_plan_id UUID REFERENCES obgyn_care_plans(id) ON DELETE SET NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'active',
        achievement_status JSONB,
        priority JSONB,
        category JSONB,
        description TEXT NOT NULL,
        start_date DATE,
        target JSONB,
        notes JSONB,
        org_id UUID NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_goal_patient ON obgyn_goals(patient_id);
      CREATE INDEX IF NOT EXISTS idx_goal_careplan ON obgyn_goals(care_plan_id);
      CREATE INDEX IF NOT EXISTS idx_goal_status ON obgyn_goals(lifecycle_status);
    `);

    console.log('✅ Created obgyn_goals table');

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

    await client.query('DROP TABLE IF EXISTS obgyn_goals CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_care_plans CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_patient_education CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_cervical_length CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_ivf_cycles CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_consents CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_medications CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_risk_assessments CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_fetal_assessment CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_vitals_log CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_birth_plans CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_kick_counts CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_labs_tracking CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_genetic_screening CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_pregnancy_history CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_baby_records CASCADE');
    await client.query('DROP TABLE IF EXISTS obgyn_complications CASCADE');
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
