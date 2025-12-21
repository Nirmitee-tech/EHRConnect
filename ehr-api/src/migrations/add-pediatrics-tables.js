/**
 * Migration: Create Pediatrics clinical tables
 * 
 * Creates 28+ tables for comprehensive pediatric care including:
 * - Patient demographics and growth tracking
 * - Well-child visits and immunizations
 * - Developmental and behavioral screenings
 * - Health assessments and care coordination
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

    // 1. Pediatric Patient Demographics
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_patient_demographics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        birth_weight_grams INTEGER,
        birth_length_cm NUMERIC(5,2),
        birth_head_circumference_cm NUMERIC(5,2),
        gestational_age_weeks INTEGER,
        gestational_age_days INTEGER,
        linked_maternal_patient_id VARCHAR(255),
        birth_hospital VARCHAR(255),
        birth_complications TEXT,
        apgar_1min INTEGER CHECK (apgar_1min >= 0 AND apgar_1min <= 10),
        apgar_5min INTEGER CHECK (apgar_5min >= 0 AND apgar_5min <= 10),
        multiple_birth BOOLEAN DEFAULT FALSE,
        multiple_birth_order INTEGER,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_demo_patient ON pediatric_patient_demographics(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_demo_maternal ON pediatric_patient_demographics(linked_maternal_patient_id);
    `);
    console.log('✅ Created pediatric_patient_demographics table');

    // 2. Pediatric Growth Records
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_growth_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        measurement_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        weight_kg NUMERIC(6,3),
        weight_percentile NUMERIC(5,2),
        weight_zscore NUMERIC(5,2),
        length_height_cm NUMERIC(5,2),
        length_height_percentile NUMERIC(5,2),
        length_height_zscore NUMERIC(5,2),
        head_circumference_cm NUMERIC(5,2),
        head_circumference_percentile NUMERIC(5,2),
        head_circumference_zscore NUMERIC(5,2),
        bmi NUMERIC(5,2),
        bmi_percentile NUMERIC(5,2),
        bmi_zscore NUMERIC(5,2),
        bmi_category VARCHAR(50),
        growth_chart_type VARCHAR(20) CHECK (growth_chart_type IN ('WHO', 'CDC')),
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_growth_patient ON pediatric_growth_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_growth_date ON pediatric_growth_records(measurement_date);
      CREATE INDEX IF NOT EXISTS idx_peds_growth_episode ON pediatric_growth_records(episode_id);
    `);
    console.log('✅ Created pediatric_growth_records table');

    // 3. Pediatric Vital Signs
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_vital_signs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        measurement_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
        age_group VARCHAR(50) NOT NULL,
        heart_rate INTEGER,
        heart_rate_flag VARCHAR(20),
        respiratory_rate INTEGER,
        respiratory_rate_flag VARCHAR(20),
        systolic_bp INTEGER,
        diastolic_bp INTEGER,
        bp_flag VARCHAR(20),
        temperature_celsius NUMERIC(4,2),
        oxygen_saturation INTEGER,
        pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_vitals_patient ON pediatric_vital_signs(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_vitals_datetime ON pediatric_vital_signs(measurement_datetime);
      CREATE INDEX IF NOT EXISTS idx_peds_vitals_episode ON pediatric_vital_signs(episode_id);
    `);
    console.log('✅ Created pediatric_vital_signs table');

    // 4. Pediatric Well Visits
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_well_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        visit_date DATE NOT NULL,
        visit_type VARCHAR(100) NOT NULL,
        age_at_visit_months NUMERIC(6,2),
        completed BOOLEAN DEFAULT FALSE,
        chief_concerns TEXT,
        developmental_milestones JSONB,
        physical_exam JSONB,
        anticipatory_guidance_provided JSONB,
        next_visit_due DATE,
        provider VARCHAR(255),
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_visits_patient ON pediatric_well_visits(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_visits_date ON pediatric_well_visits(visit_date);
      CREATE INDEX IF NOT EXISTS idx_peds_visits_type ON pediatric_well_visits(visit_type);
      CREATE INDEX IF NOT EXISTS idx_peds_visits_episode ON pediatric_well_visits(episode_id);
    `);
    console.log('✅ Created pediatric_well_visits table');

    // 5. Pediatric Immunizations
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_immunizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        vaccine_name VARCHAR(255) NOT NULL,
        vaccine_code VARCHAR(50),
        cvx_code VARCHAR(10),
        dose_number INTEGER,
        series_doses INTEGER,
        administration_date DATE NOT NULL,
        expiration_date DATE,
        lot_number VARCHAR(100),
        manufacturer VARCHAR(255),
        route VARCHAR(50),
        site VARCHAR(100),
        dose_amount VARCHAR(50),
        administered_by VARCHAR(255) NOT NULL,
        vis_date DATE,
        vis_provided BOOLEAN DEFAULT TRUE,
        consent_obtained BOOLEAN DEFAULT TRUE,
        adverse_reactions TEXT,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_imm_patient ON pediatric_immunizations(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_imm_date ON pediatric_immunizations(administration_date);
      CREATE INDEX IF NOT EXISTS idx_peds_imm_vaccine ON pediatric_immunizations(vaccine_name);
      CREATE INDEX IF NOT EXISTS idx_peds_imm_episode ON pediatric_immunizations(episode_id);
    `);
    console.log('✅ Created pediatric_immunizations table');

    // 6. Pediatric Immunization Status
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_immunization_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        vaccine_series VARCHAR(255) NOT NULL,
        doses_completed INTEGER DEFAULT 0,
        doses_required INTEGER,
        status VARCHAR(50) CHECK (status IN ('up_to_date', 'due', 'overdue', 'contraindicated')),
        next_due_date DATE,
        catch_up_schedule JSONB,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, vaccine_series, org_id)
      );

      CREATE INDEX IF NOT EXISTS idx_peds_imm_status_patient ON pediatric_immunization_status(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_imm_status_due ON pediatric_immunization_status(status, next_due_date);
    `);
    console.log('✅ Created pediatric_immunization_status table');

    // 7. Pediatric Newborn Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_newborn_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        state_program VARCHAR(100),
        specimen_collection_time TIMESTAMP WITH TIME ZONE,
        test_panel JSONB NOT NULL,
        overall_result VARCHAR(50) CHECK (overall_result IN ('normal', 'abnormal', 'pending', 'repeat_required')),
        abnormal_findings JSONB,
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_notes TEXT,
        provider_notified BOOLEAN DEFAULT FALSE,
        notification_date DATE,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_nbs_patient ON pediatric_newborn_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_nbs_result ON pediatric_newborn_screening(overall_result);
      CREATE INDEX IF NOT EXISTS idx_peds_nbs_followup ON pediatric_newborn_screening(follow_up_required) WHERE follow_up_required = TRUE;
    `);
    console.log('✅ Created pediatric_newborn_screening table');

    // 8. Pediatric Developmental Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_developmental_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        screening_tool VARCHAR(100) NOT NULL,
        domains_assessed JSONB NOT NULL,
        overall_result VARCHAR(50) CHECK (overall_result IN ('normal', 'concern', 'delay', 'advanced')),
        gross_motor_score JSONB,
        fine_motor_score JSONB,
        language_score JSONB,
        personal_social_score JSONB,
        referral_recommended BOOLEAN DEFAULT FALSE,
        referral_details TEXT,
        follow_up_date DATE,
        screened_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_dev_patient ON pediatric_developmental_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_dev_date ON pediatric_developmental_screening(screening_date);
      CREATE INDEX IF NOT EXISTS idx_peds_dev_result ON pediatric_developmental_screening(overall_result);
      CREATE INDEX IF NOT EXISTS idx_peds_dev_referral ON pediatric_developmental_screening(referral_recommended) WHERE referral_recommended = TRUE;
    `);
    console.log('✅ Created pediatric_developmental_screening table');

    // 9. Pediatric HEADSS Assessment (Adolescents 13+)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_headss_assessment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        age_years INTEGER NOT NULL CHECK (age_years >= 13),
        home_environment JSONB,
        education_employment JSONB,
        activities_peers JSONB,
        drugs_alcohol_tobacco JSONB,
        sexuality JSONB,
        suicide_safety JSONB,
        overall_risk_level VARCHAR(50) CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'immediate')),
        concerns_identified TEXT[],
        interventions_recommended TEXT[],
        referrals_made TEXT[],
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        assessed_by VARCHAR(255) NOT NULL,
        confidentiality_discussed BOOLEAN DEFAULT TRUE,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_headss_patient ON pediatric_headss_assessment(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_headss_date ON pediatric_headss_assessment(assessment_date);
      CREATE INDEX IF NOT EXISTS idx_peds_headss_risk ON pediatric_headss_assessment(overall_risk_level);
      CREATE INDEX IF NOT EXISTS idx_peds_headss_followup ON pediatric_headss_assessment(follow_up_required) WHERE follow_up_required = TRUE;
    `);
    console.log('✅ Created pediatric_headss_assessment table');

    // 10. Pediatric Lead Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_lead_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        test_type VARCHAR(50) CHECK (test_type IN ('capillary', 'venous')),
        blood_lead_level NUMERIC(5,2),
        result_category VARCHAR(50) CHECK (result_category IN ('normal', 'elevated', 'high', 'very_high')),
        risk_assessment JSONB,
        environmental_interventions TEXT,
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        provider_notified BOOLEAN DEFAULT FALSE,
        health_dept_notified BOOLEAN DEFAULT FALSE,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_lead_patient ON pediatric_lead_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_lead_result ON pediatric_lead_screening(result_category);
      CREATE INDEX IF NOT EXISTS idx_peds_lead_followup ON pediatric_lead_screening(follow_up_required) WHERE follow_up_required = TRUE;
    `);
    console.log('✅ Created pediatric_lead_screening table');

    // 11. Pediatric TB Risk Assessment
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_tb_risk_assessment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        risk_factors JSONB,
        risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high')),
        testing_recommended BOOLEAN DEFAULT FALSE,
        test_type VARCHAR(50) CHECK (test_type IN ('TST', 'IGRA', 'none')),
        test_date DATE,
        test_result VARCHAR(50),
        interpretation TEXT,
        treatment_required BOOLEAN DEFAULT FALSE,
        treatment_details TEXT,
        follow_up_date DATE,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_tb_patient ON pediatric_tb_risk_assessment(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_tb_risk ON pediatric_tb_risk_assessment(risk_level);
    `);
    console.log('✅ Created pediatric_tb_risk_assessment table');

    // 12. Pediatric Autism Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_autism_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        screening_tool VARCHAR(100) NOT NULL,
        responses JSONB NOT NULL,
        total_score INTEGER,
        risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high')),
        critical_items_positive INTEGER DEFAULT 0,
        referral_recommended BOOLEAN DEFAULT FALSE,
        referral_details TEXT,
        follow_up_screening_date DATE,
        screened_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_autism_patient ON pediatric_autism_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_autism_risk ON pediatric_autism_screening(risk_level);
      CREATE INDEX IF NOT EXISTS idx_peds_autism_referral ON pediatric_autism_screening(referral_recommended) WHERE referral_recommended = TRUE;
    `);
    console.log('✅ Created pediatric_autism_screening table');

    // 13. Pediatric Behavioral Assessment
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_behavioral_assessment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        age_years INTEGER NOT NULL,
        assessment_type VARCHAR(100) NOT NULL,
        parent_rating JSONB,
        teacher_rating JSONB,
        inattention_score INTEGER,
        hyperactivity_score INTEGER,
        combined_score INTEGER,
        diagnosis_criteria_met BOOLEAN DEFAULT FALSE,
        diagnosis_details TEXT,
        severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe')),
        treatment_recommendations TEXT,
        medication_considered BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        assessed_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_behavior_patient ON pediatric_behavioral_assessment(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_behavior_type ON pediatric_behavioral_assessment(assessment_type);
    `);
    console.log('✅ Created pediatric_behavioral_assessment table');

    // 14. Pediatric Mental Health Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_mental_health_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_years INTEGER NOT NULL,
        screening_tool VARCHAR(100) NOT NULL,
        responses JSONB NOT NULL,
        depression_score INTEGER,
        anxiety_score INTEGER,
        overall_score INTEGER,
        risk_level VARCHAR(50) CHECK (risk_level IN ('minimal', 'mild', 'moderate', 'severe')),
        self_harm_ideation BOOLEAN DEFAULT FALSE,
        safety_plan_created BOOLEAN DEFAULT FALSE,
        referral_recommended BOOLEAN DEFAULT FALSE,
        referral_details TEXT,
        parent_guardian_notified BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        screened_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_mental_patient ON pediatric_mental_health_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_mental_risk ON pediatric_mental_health_screening(risk_level);
      CREATE INDEX IF NOT EXISTS idx_peds_mental_selfharm ON pediatric_mental_health_screening(self_harm_ideation) WHERE self_harm_ideation = TRUE;
    `);
    console.log('✅ Created pediatric_mental_health_screening table');

    // 15. Pediatric Substance Use Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_substance_use_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_years INTEGER NOT NULL CHECK (age_years >= 12),
        screening_tool VARCHAR(100) NOT NULL,
        responses JSONB NOT NULL,
        total_score INTEGER,
        risk_level VARCHAR(50) CHECK (risk_level IN ('no_risk', 'low', 'medium', 'high')),
        substances_used TEXT[],
        frequency_of_use JSONB,
        brief_intervention_provided BOOLEAN DEFAULT FALSE,
        referral_recommended BOOLEAN DEFAULT FALSE,
        referral_details TEXT,
        parent_guardian_notified BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        screened_by VARCHAR(255) NOT NULL,
        confidentiality_discussed BOOLEAN DEFAULT TRUE,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_substance_patient ON pediatric_substance_use_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_substance_risk ON pediatric_substance_use_screening(risk_level);
      CREATE INDEX IF NOT EXISTS idx_peds_substance_referral ON pediatric_substance_use_screening(referral_recommended) WHERE referral_recommended = TRUE;
    `);
    console.log('✅ Created pediatric_substance_use_screening table');

    // 16. Pediatric Sexual Health Assessment
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_sexual_health_assessment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        age_years INTEGER NOT NULL CHECK (age_years >= 13),
        sexually_active BOOLEAN,
        contraception_discussed BOOLEAN DEFAULT FALSE,
        contraception_method VARCHAR(100),
        sti_screening_offered BOOLEAN DEFAULT FALSE,
        sti_tests_ordered JSONB,
        pregnancy_test_result VARCHAR(50),
        education_provided JSONB,
        referrals_made TEXT[],
        follow_up_date DATE,
        assessed_by VARCHAR(255) NOT NULL,
        confidentiality_maintained BOOLEAN DEFAULT TRUE,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_sexual_patient ON pediatric_sexual_health_assessment(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_sexual_date ON pediatric_sexual_health_assessment(assessment_date);
    `);
    console.log('✅ Created pediatric_sexual_health_assessment table');

    // 17. Pediatric Injury Prevention
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_injury_prevention (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        age_group VARCHAR(50) NOT NULL,
        car_seat_type VARCHAR(100),
        car_seat_proper_use BOOLEAN,
        helmet_use BOOLEAN,
        water_safety JSONB,
        fire_safety JSONB,
        poison_prevention JSONB,
        fall_prevention JSONB,
        gun_safety JSONB,
        education_provided JSONB,
        resources_given TEXT[],
        follow_up_date DATE,
        assessed_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_injury_patient ON pediatric_injury_prevention(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_injury_date ON pediatric_injury_prevention(assessment_date);
    `);
    console.log('✅ Created pediatric_injury_prevention table');

    // 18. Pediatric Vision Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_vision_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        screening_method VARCHAR(100) NOT NULL,
        right_eye_result VARCHAR(100),
        left_eye_result VARCHAR(100),
        binocular_vision VARCHAR(100),
        red_reflex_normal BOOLEAN,
        cover_test_result VARCHAR(100),
        alignment VARCHAR(100),
        overall_result VARCHAR(50) CHECK (overall_result IN ('pass', 'fail', 'refer')),
        referral_recommended BOOLEAN DEFAULT FALSE,
        referral_details TEXT,
        glasses_prescribed BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        screened_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_vision_patient ON pediatric_vision_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_vision_result ON pediatric_vision_screening(overall_result);
      CREATE INDEX IF NOT EXISTS idx_peds_vision_referral ON pediatric_vision_screening(referral_recommended) WHERE referral_recommended = TRUE;
    `);
    console.log('✅ Created pediatric_vision_screening table');

    // 19. Pediatric Hearing Screening
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_hearing_screening (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        screening_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        screening_method VARCHAR(100) NOT NULL,
        right_ear_result VARCHAR(100),
        left_ear_result VARCHAR(100),
        tympanometry_right VARCHAR(100),
        tympanometry_left VARCHAR(100),
        overall_result VARCHAR(50) CHECK (overall_result IN ('pass', 'fail', 'refer')),
        referral_recommended BOOLEAN DEFAULT FALSE,
        referral_details TEXT,
        follow_up_date DATE,
        screened_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_hearing_patient ON pediatric_hearing_screening(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_hearing_result ON pediatric_hearing_screening(overall_result);
      CREATE INDEX IF NOT EXISTS idx_peds_hearing_referral ON pediatric_hearing_screening(referral_recommended) WHERE referral_recommended = TRUE;
    `);
    console.log('✅ Created pediatric_hearing_screening table');

    // 20. Pediatric Nutrition Assessment
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_nutrition_assessment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        age_months NUMERIC(6,2) NOT NULL,
        feeding_type VARCHAR(100),
        breastfeeding_status VARCHAR(100),
        formula_type VARCHAR(100),
        solid_foods_introduced BOOLEAN,
        dietary_restrictions TEXT[],
        food_allergies TEXT[],
        typical_diet JSONB,
        nutritional_concerns TEXT,
        vitamin_supplementation JSONB,
        feeding_difficulties TEXT,
        counseling_provided JSONB,
        referral_to_dietitian BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        assessed_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_nutrition_patient ON pediatric_nutrition_assessment(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_nutrition_date ON pediatric_nutrition_assessment(assessment_date);
    `);
    console.log('✅ Created pediatric_nutrition_assessment table');

    // 21. Pediatric Medications
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_medications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        medication_name VARCHAR(255) NOT NULL,
        generic_name VARCHAR(255),
        medication_code VARCHAR(50),
        indication TEXT,
        dose VARCHAR(100) NOT NULL,
        dose_calculation_method VARCHAR(100),
        patient_weight_kg NUMERIC(6,3),
        dose_per_kg VARCHAR(100),
        route VARCHAR(50) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(50) CHECK (status IN ('active', 'completed', 'discontinued', 'on_hold')),
        prescriber VARCHAR(255) NOT NULL,
        pharmacy VARCHAR(255),
        instructions TEXT,
        adverse_effects TEXT,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_meds_patient ON pediatric_medications(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_meds_status ON pediatric_medications(status);
      CREATE INDEX IF NOT EXISTS idx_peds_meds_episode ON pediatric_medications(episode_id);
    `);
    console.log('✅ Created pediatric_medications table');

    // 22. Pediatric Allergies
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_allergies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        allergen VARCHAR(255) NOT NULL,
        allergen_type VARCHAR(50) CHECK (allergen_type IN ('drug', 'food', 'environmental', 'other')),
        reaction_type VARCHAR(100),
        severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
        symptoms TEXT[],
        onset_date DATE,
        verified BOOLEAN DEFAULT FALSE,
        verification_date DATE,
        treatment_required TEXT,
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, allergen, org_id)
      );

      CREATE INDEX IF NOT EXISTS idx_peds_allergies_patient ON pediatric_allergies(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_allergies_type ON pediatric_allergies(allergen_type);
      CREATE INDEX IF NOT EXISTS idx_peds_allergies_severity ON pediatric_allergies(severity);
    `);
    console.log('✅ Created pediatric_allergies table');

    // 23. Pediatric Medical History
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_medical_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        condition_name VARCHAR(255) NOT NULL,
        icd10_code VARCHAR(20),
        onset_date DATE,
        resolved_date DATE,
        status VARCHAR(50) CHECK (status IN ('active', 'resolved', 'chronic', 'recurrent')),
        severity VARCHAR(50),
        treatment TEXT,
        complications TEXT,
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_history_patient ON pediatric_medical_history(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_history_status ON pediatric_medical_history(status);
      CREATE INDEX IF NOT EXISTS idx_peds_history_condition ON pediatric_medical_history(condition_name);
    `);
    console.log('✅ Created pediatric_medical_history table');

    // 24. Pediatric Family History
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_family_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        condition_name VARCHAR(255) NOT NULL,
        icd10_code VARCHAR(20),
        age_of_onset INTEGER,
        notes TEXT,
        recorded_by VARCHAR(255) NOT NULL,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_fam_history_patient ON pediatric_family_history(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_fam_history_condition ON pediatric_family_history(condition_name);
    `);
    console.log('✅ Created pediatric_family_history table');

    // 25. Pediatric Social Determinants
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_social_determinants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        assessment_date DATE NOT NULL,
        housing_status VARCHAR(100),
        housing_concerns BOOLEAN DEFAULT FALSE,
        food_security VARCHAR(100),
        food_insecurity_risk BOOLEAN DEFAULT FALSE,
        insurance_status VARCHAR(100),
        insurance_type VARCHAR(100),
        transportation_access BOOLEAN,
        caregiver_support VARCHAR(100),
        school_enrollment BOOLEAN,
        educational_concerns TEXT,
        childcare_needs BOOLEAN,
        financial_strain BOOLEAN,
        utilities_concern BOOLEAN,
        safety_concerns BOOLEAN,
        domestic_violence_screening BOOLEAN DEFAULT FALSE,
        domestic_violence_positive BOOLEAN DEFAULT FALSE,
        resources_provided JSONB,
        referrals_made TEXT[],
        follow_up_date DATE,
        assessed_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_sdoh_patient ON pediatric_social_determinants(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_sdoh_date ON pediatric_social_determinants(assessment_date);
      CREATE INDEX IF NOT EXISTS idx_peds_sdoh_concerns ON pediatric_social_determinants(patient_id) 
        WHERE housing_concerns = TRUE OR food_insecurity_risk = TRUE OR safety_concerns = TRUE;
    `);
    console.log('✅ Created pediatric_social_determinants table');

    // 26. Pediatric Vaccination Schedule Cache
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_vaccination_schedule_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        schedule_version VARCHAR(50) NOT NULL,
        birth_date DATE NOT NULL,
        current_age_months NUMERIC(6,2),
        due_vaccines JSONB NOT NULL,
        overdue_vaccines JSONB,
        upcoming_vaccines JSONB,
        catch_up_required BOOLEAN DEFAULT FALSE,
        catch_up_schedule JSONB,
        last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, org_id)
      );

      CREATE INDEX IF NOT EXISTS idx_peds_vax_cache_patient ON pediatric_vaccination_schedule_cache(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_vax_cache_catchup ON pediatric_vaccination_schedule_cache(catch_up_required) WHERE catch_up_required = TRUE;
    `);
    console.log('✅ Created pediatric_vaccination_schedule_cache table');

    // 27. Pediatric Sports Physicals
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_sports_physicals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        exam_date DATE NOT NULL,
        age_years INTEGER NOT NULL,
        sport VARCHAR(100),
        level_of_play VARCHAR(100),
        medical_history_reviewed BOOLEAN DEFAULT TRUE,
        physical_exam JSONB NOT NULL,
        cardiovascular_screening JSONB NOT NULL,
        musculoskeletal_exam JSONB NOT NULL,
        vision_screening VARCHAR(100),
        clearance_status VARCHAR(50) CHECK (clearance_status IN ('cleared', 'cleared_with_restrictions', 'not_cleared', 'needs_evaluation')),
        restrictions TEXT,
        further_evaluation_needed TEXT,
        clearance_valid_until DATE,
        examined_by VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_sports_patient ON pediatric_sports_physicals(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_sports_date ON pediatric_sports_physicals(exam_date);
      CREATE INDEX IF NOT EXISTS idx_peds_sports_clearance ON pediatric_sports_physicals(clearance_status);
    `);
    console.log('✅ Created pediatric_sports_physicals table');

    // 28. Pediatric Care Coordination
    await client.query(`
      CREATE TABLE IF NOT EXISTS pediatric_care_coordination (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        coordination_date DATE NOT NULL,
        coordination_type VARCHAR(100) CHECK (coordination_type IN ('referral', 'early_intervention', 'specialist_consult', 'care_plan', 'transition', 'other')),
        specialty VARCHAR(100),
        provider_name VARCHAR(255),
        provider_contact TEXT,
        reason TEXT NOT NULL,
        status VARCHAR(50) CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
        appointment_date DATE,
        outcome TEXT,
        reports_received BOOLEAN DEFAULT FALSE,
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        coordinator VARCHAR(255) NOT NULL,
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_peds_coord_patient ON pediatric_care_coordination(patient_id);
      CREATE INDEX IF NOT EXISTS idx_peds_coord_type ON pediatric_care_coordination(coordination_type);
      CREATE INDEX IF NOT EXISTS idx_peds_coord_status ON pediatric_care_coordination(status);
      CREATE INDEX IF NOT EXISTS idx_peds_coord_followup ON pediatric_care_coordination(follow_up_required) WHERE follow_up_required = TRUE;
    `);
    console.log('✅ Created pediatric_care_coordination table');

    await client.query('COMMIT');
    console.log('✅ All pediatric tables created successfully');
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

    const tables = [
      'pediatric_care_coordination',
      'pediatric_sports_physicals',
      'pediatric_vaccination_schedule_cache',
      'pediatric_social_determinants',
      'pediatric_family_history',
      'pediatric_medical_history',
      'pediatric_allergies',
      'pediatric_medications',
      'pediatric_nutrition_assessment',
      'pediatric_hearing_screening',
      'pediatric_vision_screening',
      'pediatric_injury_prevention',
      'pediatric_sexual_health_assessment',
      'pediatric_substance_use_screening',
      'pediatric_mental_health_screening',
      'pediatric_behavioral_assessment',
      'pediatric_autism_screening',
      'pediatric_tb_risk_assessment',
      'pediatric_lead_screening',
      'pediatric_headss_assessment',
      'pediatric_developmental_screening',
      'pediatric_newborn_screening',
      'pediatric_immunization_status',
      'pediatric_immunizations',
      'pediatric_well_visits',
      'pediatric_vital_signs',
      'pediatric_growth_records',
      'pediatric_patient_demographics'
    ];

    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`✅ Dropped ${table} table`);
    }

    await client.query('COMMIT');
    console.log('✅ All pediatric tables dropped successfully');
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
    console.log('Usage: node add-pediatrics-tables.js [up|down]');
    process.exit(1);
  }
}
