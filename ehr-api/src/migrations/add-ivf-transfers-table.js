/**
 * Migration: Create IVF Transfers table
 *
 * Phase 3: Transfer Precision
 * Comprehensive transfer tracking with:
 * - Embryo selection details
 * - Endometrial preparation protocol
 * - Transfer day labs and measurements
 * - Procedure details
 * - Clinician confidence and notes
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

    console.log('🔧 Creating obgyn_ivf_transfers table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_ivf_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cycle_id UUID NOT NULL REFERENCES obgyn_ivf_cycles(id) ON DELETE CASCADE,
        patient_id VARCHAR(255) NOT NULL,

        -- Transfer basic info
        transfer_date DATE NOT NULL,
        transfer_time TIME,
        transfer_type VARCHAR(50) CHECK (transfer_type IN ('fresh', 'frozen', 'donor')),

        -- Embryo details
        embryo_ids JSONB DEFAULT '[]',
        number_transferred INTEGER NOT NULL CHECK (number_transferred > 0 AND number_transferred <= 3),
        embryo_grades VARCHAR(255),
        embryo_ages JSONB DEFAULT '[]',
        embryo_day VARCHAR(20) CHECK (embryo_day IN ('day3', 'day5', 'day6')),

        -- Endometrial preparation (FET)
        prep_protocol VARCHAR(50) CHECK (prep_protocol IN ('medicated', 'natural', 'modified_natural', 'not_applicable')),
        prep_start_date DATE,
        estrogen_medication VARCHAR(100),
        estrogen_dose VARCHAR(50),
        estrogen_route VARCHAR(50) CHECK (estrogen_route IN ('oral', 'transdermal', 'vaginal', 'injection')),
        progesterone_medication VARCHAR(100),
        progesterone_dose VARCHAR(50),
        progesterone_route VARCHAR(50) CHECK (progesterone_route IN ('injection', 'vaginal', 'oral', 'combined')),
        progesterone_start_date DATE,
        progesterone_days INTEGER,

        -- Transfer day labs
        estradiol_level DECIMAL(10, 2),
        progesterone_level DECIMAL(10, 2),
        endometrial_thickness DECIMAL(4, 2),
        endometrial_pattern VARCHAR(50) CHECK (endometrial_pattern IN ('trilaminar', 'homogeneous', 'heterogeneous')),

        -- Procedure details
        catheter_type VARCHAR(100),
        catheter_loaded_by VARCHAR(255),
        transfer_performed_by VARCHAR(255) NOT NULL,
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'moderate', 'difficult')),
        difficulty_reason TEXT,
        ultrasound_guidance BOOLEAN DEFAULT TRUE,
        bladder_volume VARCHAR(50) CHECK (bladder_volume IN ('optimal', 'adequate', 'inadequate', 'overfilled')),
        cervical_dilation_needed BOOLEAN DEFAULT FALSE,
        tenaculum_used BOOLEAN DEFAULT FALSE,
        trial_transfer_done BOOLEAN DEFAULT FALSE,
        distance_from_fundus DECIMAL(3, 1),
        air_bubble_visible BOOLEAN,
        embryo_visibility_confirmed BOOLEAN,
        blood_on_catheter BOOLEAN DEFAULT FALSE,
        mucus_on_catheter BOOLEAN DEFAULT FALSE,

        -- Post-transfer
        bed_rest_minutes INTEGER DEFAULT 15,
        patient_tolerated_well BOOLEAN DEFAULT TRUE,
        complications TEXT,
        discharge_time TIME,

        -- Clinical assessment
        clinician_confidence INTEGER CHECK (clinician_confidence >= 1 AND clinician_confidence <= 5),
        clinician_notes TEXT,
        technical_quality VARCHAR(50) CHECK (technical_quality IN ('excellent', 'good', 'fair', 'poor')),

        -- Post-transfer instructions
        beta_hcg_date DATE,
        continue_medications BOOLEAN DEFAULT TRUE,
        activity_restrictions TEXT,
        follow_up_instructions TEXT,

        -- Outcome prediction (optional, for display purposes)
        predicted_success_rate DECIMAL(5, 2),

        -- Audit fields
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(255)
      );
    `);

    console.log('✅ Created obgyn_ivf_transfers table');

    // Create indexes for efficient querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ivf_transfers_cycle ON obgyn_ivf_transfers(cycle_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_transfers_patient ON obgyn_ivf_transfers(patient_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_transfers_date ON obgyn_ivf_transfers(transfer_date);
      CREATE INDEX IF NOT EXISTS idx_ivf_transfers_type ON obgyn_ivf_transfers(transfer_type);
      CREATE INDEX IF NOT EXISTS idx_ivf_transfers_confidence ON obgyn_ivf_transfers(clinician_confidence);
      CREATE INDEX IF NOT EXISTS idx_ivf_transfers_difficulty ON obgyn_ivf_transfers(difficulty);
    `);

    console.log('✅ Created indexes for obgyn_ivf_transfers');

    // Create pregnancy outcomes table for Phase 4
    console.log('🔧 Creating obgyn_ivf_pregnancy_outcomes table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS obgyn_ivf_pregnancy_outcomes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cycle_id UUID NOT NULL REFERENCES obgyn_ivf_cycles(id) ON DELETE CASCADE,
        transfer_id UUID REFERENCES obgyn_ivf_transfers(id) ON DELETE SET NULL,
        patient_id VARCHAR(255) NOT NULL,

        -- Beta hCG tracking
        beta_hcg_series JSONB DEFAULT '[]',
        first_beta_date DATE,
        first_beta_value DECIMAL(10, 2),
        second_beta_date DATE,
        second_beta_value DECIMAL(10, 2),
        doubling_time_hours DECIMAL(5, 1),

        -- Early ultrasounds
        ultrasounds JSONB DEFAULT '[]',
        first_ultrasound_date DATE,
        gestational_sacs INTEGER,
        yolk_sacs INTEGER,
        fetal_poles INTEGER,
        heartbeat_detected BOOLEAN,
        heartbeat_bpm INTEGER,
        crl_mm DECIMAL(4, 1),

        -- Outcome
        outcome VARCHAR(50) CHECK (outcome IN ('ongoing', 'biochemical', 'clinical_pregnancy', 'miscarriage', 'ectopic', 'live_birth', 'pending')),
        outcome_date DATE,
        gestational_age_at_outcome VARCHAR(20),

        -- Live birth details
        delivery_date DATE,
        delivery_type VARCHAR(50),
        babies JSONB DEFAULT '[]',

        -- Complications
        complications JSONB DEFAULT '[]',
        notes TEXT,

        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(255)
      );
    `);

    console.log('✅ Created obgyn_ivf_pregnancy_outcomes table');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ivf_outcomes_cycle ON obgyn_ivf_pregnancy_outcomes(cycle_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_outcomes_transfer ON obgyn_ivf_pregnancy_outcomes(transfer_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_outcomes_patient ON obgyn_ivf_pregnancy_outcomes(patient_id);
      CREATE INDEX IF NOT EXISTS idx_ivf_outcomes_outcome ON obgyn_ivf_pregnancy_outcomes(outcome);
      CREATE INDEX IF NOT EXISTS idx_ivf_outcomes_beta_date ON obgyn_ivf_pregnancy_outcomes(first_beta_date);
    `);

    console.log('✅ Created indexes for obgyn_ivf_pregnancy_outcomes');

    await client.query('COMMIT');

    console.log('✅ Migration completed successfully');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - obgyn_ivf_transfers: Comprehensive transfer tracking');
    console.log('   - obgyn_ivf_pregnancy_outcomes: Beta hCG series + early pregnancy milestones');
    console.log('');

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
    console.log('🎉 Phase 3 & 4 database infrastructure ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
