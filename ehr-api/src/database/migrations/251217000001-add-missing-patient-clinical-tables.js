const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Migration: Add Missing Patient and Clinical Tables
-- Description: Creates tables for complete UI-to-database field mapping
-- Date: 2025-12-17
-- Purpose: Address issue of APIs jumping to file server by creating proper table structure

-- ==========================================
-- 1. PATIENT EMERGENCY CONTACTS
-- ==========================================
CREATE TABLE IF NOT EXISTS patient_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50),  -- Spouse, Parent, Child, Sibling, Friend, Other
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ensure only one primary contact per patient
CREATE UNIQUE INDEX idx_patient_emergency_contacts_one_primary 
  ON patient_emergency_contacts(patient_id) 
  WHERE is_primary = TRUE;

CREATE INDEX idx_patient_emergency_contacts_patient 
  ON patient_emergency_contacts(patient_id);
CREATE INDEX idx_patient_emergency_contacts_org 
  ON patient_emergency_contacts(org_id);

COMMENT ON TABLE patient_emergency_contacts IS 'Emergency contact information for patients';
COMMENT ON COLUMN patient_emergency_contacts.is_primary IS 'Primary emergency contact flag - only one per patient';

-- ==========================================
-- 2. PATIENT INSURANCE
-- ==========================================
CREATE TABLE IF NOT EXISTS patient_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES payers(id),
  
  policy_number VARCHAR(100),
  group_number VARCHAR(100),
  subscriber_name VARCHAR(255),
  subscriber_dob DATE,
  relationship_to_subscriber VARCHAR(50),  -- Self, Spouse, Child, Other
  
  effective_date DATE,
  termination_date DATE,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 3),
  
  card_front_url TEXT,
  card_back_url TEXT,
  
  verification_status VARCHAR(50) DEFAULT 'unverified',
  last_verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX idx_patient_insurance_payer ON patient_insurance(payer_id);
CREATE INDEX idx_patient_insurance_priority ON patient_insurance(patient_id, priority);
CREATE INDEX idx_patient_insurance_org ON patient_insurance(org_id);

COMMENT ON TABLE patient_insurance IS 'Patient insurance coverage information';
COMMENT ON COLUMN patient_insurance.priority IS '1=Primary, 2=Secondary, 3=Tertiary';
COMMENT ON COLUMN patient_insurance.verification_status IS 'verified, unverified, expired';

-- ==========================================
-- 3. PATIENT CONSENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS patient_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  consent_email BOOLEAN DEFAULT FALSE,
  consent_call BOOLEAN DEFAULT FALSE,
  consent_sms BOOLEAN DEFAULT FALSE,
  allow_data_sharing BOOLEAN DEFAULT FALSE,
  hipaa_authorization BOOLEAN DEFAULT FALSE,
  research_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  
  consent_form_signed BOOLEAN DEFAULT FALSE,
  consent_form_url TEXT,
  signed_at TIMESTAMPTZ,
  signed_by VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- One consent record per patient
CREATE UNIQUE INDEX idx_patient_consents_unique_patient 
  ON patient_consents(org_id, patient_id);

CREATE INDEX idx_patient_consents_patient ON patient_consents(patient_id);

COMMENT ON TABLE patient_consents IS 'Patient consent tracking for communications and data sharing';
COMMENT ON COLUMN patient_consents.hipaa_authorization IS 'HIPAA authorization consent for PHI disclosure';

-- ==========================================
-- 4. ENCOUNTER VITALS
-- ==========================================
CREATE TABLE IF NOT EXISTS encounter_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  encounter_id UUID NOT NULL REFERENCES fhir_encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  -- Vital Signs
  temperature DECIMAL(5,2),
  temperature_unit VARCHAR(10) DEFAULT 'F',  -- F or C
  bp_systolic INTEGER,  -- mmHg
  bp_diastolic INTEGER,  -- mmHg
  heart_rate INTEGER,  -- bpm
  respiratory_rate INTEGER,  -- breaths/min
  oxygen_saturation INTEGER,  -- percentage
  
  -- Body Measurements
  weight DECIMAL(6,2),
  weight_unit VARCHAR(10) DEFAULT 'lbs',  -- kg or lbs
  height DECIMAL(6,2),
  height_unit VARCHAR(10) DEFAULT 'in',  -- cm or in
  bmi DECIMAL(5,2),  -- Calculated
  
  -- Additional Vitals
  pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
  head_circumference DECIMAL(6,2),  -- For pediatrics
  
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  recorded_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_encounter_vitals_encounter ON encounter_vitals(encounter_id);
CREATE INDEX idx_encounter_vitals_patient ON encounter_vitals(patient_id);
CREATE INDEX idx_encounter_vitals_recorded_at ON encounter_vitals(recorded_at DESC);
CREATE INDEX idx_encounter_vitals_org ON encounter_vitals(org_id);

COMMENT ON TABLE encounter_vitals IS 'Vital signs captured during patient encounters';
COMMENT ON COLUMN encounter_vitals.bmi IS 'Body Mass Index - calculated from weight and height';

-- ==========================================
-- 5. ENCOUNTER DIAGNOSES
-- ==========================================
CREATE TABLE IF NOT EXISTS encounter_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  encounter_id UUID NOT NULL REFERENCES fhir_encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  icd10_code VARCHAR(20),
  description TEXT NOT NULL,
  diagnosis_type VARCHAR(20) DEFAULT 'primary' 
    CHECK (diagnosis_type IN ('primary', 'secondary', 'differential', 'working')),
  
  onset_date DATE,
  resolution_date DATE,
  status VARCHAR(50) DEFAULT 'active' 
    CHECK (status IN ('active', 'resolved', 'inactive', 'recurrence')),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_encounter_diagnoses_encounter ON encounter_diagnoses(encounter_id);
CREATE INDEX idx_encounter_diagnoses_patient ON encounter_diagnoses(patient_id);
CREATE INDEX idx_encounter_diagnoses_icd10 ON encounter_diagnoses(icd10_code);
CREATE INDEX idx_encounter_diagnoses_type ON encounter_diagnoses(diagnosis_type);
CREATE INDEX idx_encounter_diagnoses_org ON encounter_diagnoses(org_id);

COMMENT ON TABLE encounter_diagnoses IS 'Diagnoses assigned during patient encounters';
COMMENT ON COLUMN encounter_diagnoses.diagnosis_type IS 'primary, secondary, differential, or working diagnosis';

-- ==========================================
-- 6. ENCOUNTER PROCEDURES
-- ==========================================
CREATE TABLE IF NOT EXISTS encounter_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  encounter_id UUID NOT NULL REFERENCES fhir_encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  cpt_code VARCHAR(20),
  description TEXT NOT NULL,
  
  performed_date DATE NOT NULL,
  performed_by UUID REFERENCES users(id),
  assisted_by UUID REFERENCES users(id),
  
  duration_minutes INTEGER,
  location VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'completed' 
    CHECK (status IN ('preparation', 'in-progress', 'completed', 'aborted', 'cancelled')),
  
  notes TEXT,
  complications TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_encounter_procedures_encounter ON encounter_procedures(encounter_id);
CREATE INDEX idx_encounter_procedures_patient ON encounter_procedures(patient_id);
CREATE INDEX idx_encounter_procedures_cpt ON encounter_procedures(cpt_code);
CREATE INDEX idx_encounter_procedures_performed_date ON encounter_procedures(performed_date DESC);
CREATE INDEX idx_encounter_procedures_org ON encounter_procedures(org_id);

COMMENT ON TABLE encounter_procedures IS 'Procedures performed during patient encounters';
COMMENT ON COLUMN encounter_procedures.cpt_code IS 'CPT/HCPCS procedure code for billing';

-- ==========================================
-- 7. LAB ORDERS
-- ==========================================
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES fhir_encounters(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  test_name VARCHAR(255) NOT NULL,
  loinc_code VARCHAR(20),
  category VARCHAR(100),  -- Chemistry, Hematology, Microbiology, etc.
  
  priority VARCHAR(20) DEFAULT 'routine' 
    CHECK (priority IN ('routine', 'urgent', 'stat', 'asap')),
  status VARCHAR(50) DEFAULT 'ordered' 
    CHECK (status IN ('ordered', 'collected', 'in-transit', 'in-lab', 'resulted', 'cancelled', 'entered-in-error')),
  
  ordered_by UUID REFERENCES users(id),
  ordered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  specimen_type VARCHAR(100),  -- Blood, Urine, Stool, etc.
  collection_method VARCHAR(100),
  collected_by UUID REFERENCES users(id),
  collected_at TIMESTAMPTZ,
  
  resulted_at TIMESTAMPTZ,
  resulted_by UUID REFERENCES users(id),
  
  instructions TEXT,
  fasting_required BOOLEAN DEFAULT FALSE,
  
  -- Result fields
  result_value TEXT,
  result_unit VARCHAR(50),
  reference_range VARCHAR(100),
  abnormal_flag BOOLEAN DEFAULT FALSE,
  critical_flag BOOLEAN DEFAULT FALSE,
  result_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_orders_encounter ON lab_orders(encounter_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_orders_ordered_at ON lab_orders(ordered_at DESC);
CREATE INDEX idx_lab_orders_priority ON lab_orders(priority) WHERE status NOT IN ('resulted', 'cancelled');
CREATE INDEX idx_lab_orders_org ON lab_orders(org_id);

COMMENT ON TABLE lab_orders IS 'Laboratory test orders and results';
COMMENT ON COLUMN lab_orders.abnormal_flag IS 'Result is outside normal reference range';
COMMENT ON COLUMN lab_orders.critical_flag IS 'Result is in critical range requiring immediate attention';

-- ==========================================
-- 8. ALLERGIES AND INTOLERANCES
-- ==========================================
CREATE TABLE IF NOT EXISTS allergies_intolerances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES fhir_patients(id) ON DELETE CASCADE,
  
  allergen VARCHAR(255) NOT NULL,
  allergen_code VARCHAR(50),  -- RxNorm, SNOMED, etc.
  allergen_system VARCHAR(100),  -- Coding system used
  
  category VARCHAR(50) DEFAULT 'medication' 
    CHECK (category IN ('medication', 'food', 'environment', 'biologic', 'other')),
  criticality VARCHAR(50) DEFAULT 'unable-to-assess' 
    CHECK (criticality IN ('low', 'high', 'unable-to-assess')),
  
  reaction_type VARCHAR(100),  -- rash, anaphylaxis, nausea, etc.
  severity VARCHAR(50) 
    CHECK (severity IN ('mild', 'moderate', 'severe')),
  
  onset_date DATE,
  last_occurrence_date DATE,
  notes TEXT,
  
  status VARCHAR(50) DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'resolved')) ,
  verification_status VARCHAR(50) DEFAULT 'unconfirmed' 
    CHECK (verification_status IN ('unconfirmed', 'confirmed', 'refuted', 'entered-in-error')),
  
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  recorded_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allergies_patient ON allergies_intolerances(patient_id);
CREATE INDEX idx_allergies_status ON allergies_intolerances(status);
CREATE INDEX idx_allergies_category ON allergies_intolerances(category);
CREATE INDEX idx_allergies_criticality ON allergies_intolerances(criticality);
CREATE INDEX idx_allergies_org ON allergies_intolerances(org_id);

-- Special index for allergy safety checks
CREATE INDEX idx_allergies_active_meds ON allergies_intolerances(patient_id, category, status) 
  WHERE category = 'medication' AND status = 'active';

COMMENT ON TABLE allergies_intolerances IS 'Patient allergies and intolerances for safety checking';
COMMENT ON COLUMN allergies_intolerances.criticality IS 'Risk level: low, high, or unable-to-assess';
COMMENT ON COLUMN allergies_intolerances.verification_status IS 'Confirmation status of the allergy';

-- ==========================================
-- UPDATE TRIGGERS
-- ==========================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all new tables
CREATE TRIGGER update_patient_emergency_contacts_updated_at
  BEFORE UPDATE ON patient_emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_insurance_updated_at
  BEFORE UPDATE ON patient_insurance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_consents_updated_at
  BEFORE UPDATE ON patient_consents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounter_vitals_updated_at
  BEFORE UPDATE ON encounter_vitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounter_diagnoses_updated_at
  BEFORE UPDATE ON encounter_diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounter_procedures_updated_at
  BEFORE UPDATE ON encounter_procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_orders_updated_at
  BEFORE UPDATE ON lab_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_intolerances_updated_at
  BEFORE UPDATE ON allergies_intolerances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- AUDIT TRIGGERS (if audit function exists)
-- ==========================================

-- Check if audit function exists and apply
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event'
  ) THEN
    -- Apply audit triggers to clinical tables
    EXECUTE 'CREATE TRIGGER audit_patient_insurance
      AFTER INSERT OR UPDATE OR DELETE ON patient_insurance
      FOR EACH ROW EXECUTE FUNCTION log_audit_event()';
    
    EXECUTE 'CREATE TRIGGER audit_patient_consents
      AFTER INSERT OR UPDATE OR DELETE ON patient_consents
      FOR EACH ROW EXECUTE FUNCTION log_audit_event()';
    
    EXECUTE 'CREATE TRIGGER audit_encounter_vitals
      AFTER INSERT OR UPDATE OR DELETE ON encounter_vitals
      FOR EACH ROW EXECUTE FUNCTION log_audit_event()';
    
    EXECUTE 'CREATE TRIGGER audit_encounter_diagnoses
      AFTER INSERT OR UPDATE OR DELETE ON encounter_diagnoses
      FOR EACH ROW EXECUTE FUNCTION log_audit_event()';
    
    EXECUTE 'CREATE TRIGGER audit_allergies
      AFTER INSERT OR UPDATE OR DELETE ON allergies_intolerances
      FOR EACH ROW EXECUTE FUNCTION log_audit_event()';
  END IF;
END $$;

`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 251217000001-add-missing-patient-clinical-tables...');
      console.log('📋 Creating 8 new tables for complete UI-to-database field mapping:');
      console.log('   1. patient_emergency_contacts');
      console.log('   2. patient_insurance');
      console.log('   3. patient_consents');
      console.log('   4. encounter_vitals');
      console.log('   5. encounter_diagnoses');
      console.log('   6. encounter_procedures');
      console.log('   7. lab_orders');
      console.log('   8. allergies_intolerances');
      
      await pool.query(sql);
      
      console.log('✅ 251217000001-add-missing-patient-clinical-tables completed successfully');
      console.log('✨ All UI data points now have proper database table mappings');
    } catch (error) {
      console.error('❌ 251217000001-add-missing-patient-clinical-tables failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `-- Rollback: Drop all tables created in this migration
    
    DROP TABLE IF EXISTS allergies_intolerances CASCADE;
    DROP TABLE IF EXISTS lab_orders CASCADE;
    DROP TABLE IF EXISTS encounter_procedures CASCADE;
    DROP TABLE IF EXISTS encounter_diagnoses CASCADE;
    DROP TABLE IF EXISTS encounter_vitals CASCADE;
    DROP TABLE IF EXISTS patient_consents CASCADE;
    DROP TABLE IF EXISTS patient_insurance CASCADE;
    DROP TABLE IF EXISTS patient_emergency_contacts CASCADE;
    `;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Rolling back 251217000001-add-missing-patient-clinical-tables...');
      await pool.query(sql);
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
