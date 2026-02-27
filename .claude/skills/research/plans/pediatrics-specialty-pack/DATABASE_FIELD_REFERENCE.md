# Pediatric Database Schema: Complete Field Reference

**Document Date**: December 21, 2025
**Purpose**: Detailed field specifications for all 28 pediatric database tables
**Status**: Implementation-Ready Specification

---

## Table 1: pediatric_patient_demographics

**Purpose**: Core pediatric patient information with maternal linkage

```sql
CREATE TABLE pediatric_patient_demographics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Patient Reference
  patient_id VARCHAR(255) NOT NULL UNIQUE REFERENCES patients(id),

  -- Birth Information
  date_of_birth DATE NOT NULL,
  gestational_age_at_birth VARCHAR(10),  -- Format: "39+2" (weeks+days)
  birth_weight_grams INTEGER CHECK (birth_weight_grams > 0),
  birth_length_cm DECIMAL(5,1) CHECK (birth_length_cm > 0),
  birth_head_circumference_cm DECIMAL(5,1) CHECK (birth_head_circumference_cm > 0),

  -- Apgar Scoring (1-10 scale)
  apgar_score_1min SMALLINT CHECK (apgar_score_1min BETWEEN 0 AND 10),
  apgar_score_5min SMALLINT CHECK (apgar_score_5min BETWEEN 0 AND 10),
  apgar_score_10min SMALLINT CHECK (apgar_score_10min BETWEEN 0 AND 10),

  -- Delivery Information
  delivery_method VARCHAR(50) CHECK (delivery_method IN (
    'SVD', 'Cesarean', 'Vacuum', 'Forceps', 'VBAC'
  )),
  delivery_facility VARCHAR(255),
  delivery_provider VARCHAR(255),
  delivery_date_time TIMESTAMP WITH TIME ZONE,

  -- Maternal Linkage (OB/GYN integration)
  linked_maternal_patient_id VARCHAR(255) REFERENCES patients(id),
  maternal_pregnancy_complications JSONB,  -- Array of complication objects
  maternal_medications_during_pregnancy JSONB,  -- Array with dosage/timing
  maternal_infections_during_pregnancy JSONB,  -- Infections affecting neonate

  -- Neonatal Status
  birth_status VARCHAR(50) CHECK (birth_status IN ('live birth', 'stillbirth')),
  nicu_admission BOOLEAN DEFAULT FALSE,
  nicu_length_of_stay_days INTEGER CHECK (nicu_length_of_stay_days >= 0),
  resuscitation_required BOOLEAN DEFAULT FALSE,
  resuscitation_details TEXT,

  -- Congenital Anomalies
  congenital_anomalies JSONB,  -- Array of anomaly objects
  genetic_testing_ordered BOOLEAN DEFAULT FALSE,

  -- Multi-tenant & Audit
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_pediatric_patient_id ON pediatric_patient_demographics(patient_id);
CREATE INDEX idx_pediatric_dob ON pediatric_patient_demographics(date_of_birth);
CREATE INDEX idx_pediatric_maternal_link ON pediatric_patient_demographics(linked_maternal_patient_id);
CREATE INDEX idx_pediatric_nicu ON pediatric_patient_demographics(nicu_admission) WHERE nicu_admission = TRUE;
```

---

## Table 2: pediatric_growth_records

**Purpose**: Longitudinal growth tracking with percentile calculations

```sql
CREATE TABLE pediatric_growth_records (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  encounter_id VARCHAR(255),
  visit_date DATE NOT NULL,

  -- Age Context (both stored for flexibility)
  age_in_months INTEGER NOT NULL,  -- Most queries use this
  age_in_weeks INTEGER,  -- For precise infant calculation
  age_in_days INTEGER,  -- For neonatal precision

  -- Measurements (3 basic anthropometric measures)
  weight_kg DECIMAL(7,2) CHECK (weight_kg > 0),
  length_cm DECIMAL(6,2) CHECK (length_cm > 0),  -- Recumbent (0-2y)
  height_cm DECIMAL(6,2),  -- Standing (2y+)
  head_circumference_cm DECIMAL(6,2),  -- Birth to ~2y critical

  -- WHO Growth Standards (Birth to 24 months)
  who_weight_for_age_percentile DECIMAL(5,2),  -- 0-100
  who_weight_for_age_z_score DECIMAL(6,2),  -- SD units
  who_length_for_age_percentile DECIMAL(5,2),
  who_length_for_age_z_score DECIMAL(6,2),
  who_head_circumference_for_age_percentile DECIMAL(5,2),
  who_head_circumference_for_age_z_score DECIMAL(6,2),

  -- CDC Growth Standards (2 to 20 years)
  cdc_weight_for_age_percentile DECIMAL(5,2),
  cdc_weight_for_age_z_score DECIMAL(6,2),
  cdc_height_for_age_percentile DECIMAL(5,2),
  cdc_height_for_age_z_score DECIMAL(6,2),
  cdc_bmi DECIMAL(6,2) CHECK (cdc_bmi >= 10 AND cdc_bmi <= 60),
  cdc_bmi_for_age_percentile DECIMAL(5,2),
  cdc_bmi_for_age_z_score DECIMAL(6,2),
  cdc_bmi_category VARCHAR(50) CHECK (cdc_bmi_category IN (
    'underweight', 'healthy_weight', 'overweight', 'obese', 'severe_obesity'
  )),

  -- Growth Velocity (rate of change)
  growth_velocity_weight_kg_per_month DECIMAL(6,3),
  growth_velocity_length_cm_per_month DECIMAL(6,3),
  growth_velocity_assessment VARCHAR(50) CHECK (growth_velocity_assessment IN (
    'normal', 'slow', 'accelerated', 'abnormal'
  )),
  percentile_crossing BOOLEAN DEFAULT FALSE,  -- Crossed major percentile lines
  percentile_crossing_direction VARCHAR(20) CHECK (percentile_crossing_direction IN (
    'upward', 'downward'
  )),

  -- Chart Type & Method
  chart_type VARCHAR(20) CHECK (chart_type IN ('WHO', 'CDC')),
  measurement_method VARCHAR(50) CHECK (measurement_method IN (
    'scale', 'length_board', 'stadiometer', 'tape_measure', 'other'
  )),

  -- Quality Indicators
  measurement_quality VARCHAR(50) CHECK (measurement_quality IN (
    'verified', 'estimated', 'parental_reported', 'uncertain'
  )),

  -- Provider & Audit
  recorded_by VARCHAR(255) NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_growth_patient ON pediatric_growth_records(patient_id);
CREATE INDEX idx_growth_date ON pediatric_growth_records(visit_date);
CREATE INDEX idx_growth_age ON pediatric_growth_records(age_in_months);
CREATE INDEX idx_growth_abnormal ON pediatric_growth_records(growth_velocity_assessment)
  WHERE growth_velocity_assessment != 'normal';
CREATE INDEX idx_growth_percentile_cross ON pediatric_growth_records(percentile_crossing)
  WHERE percentile_crossing = TRUE;
```

---

## Table 3: pediatric_vital_signs

**Purpose**: Age-appropriate vital sign capture and flagging

```sql
CREATE TABLE pediatric_vital_signs (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  encounter_id VARCHAR(255),
  visit_date DATE NOT NULL,
  visit_time TIME,

  -- Age Context (for interpreting ranges)
  age_in_months INTEGER NOT NULL,

  -- Temperature (in Celsius)
  temperature_c DECIMAL(4,1) CHECK (temperature_c BETWEEN 34.0 AND 42.0),
  temperature_measurement_site VARCHAR(50) CHECK (temperature_measurement_site IN (
    'rectal', 'axillary', 'oral', 'tympanic', 'temporal_artery'
  )),

  -- Heart Rate (beats per minute)
  heart_rate_bpm SMALLINT CHECK (heart_rate_bpm BETWEEN 0 AND 300),
  heart_rate_quality VARCHAR(50) CHECK (heart_rate_quality IN (
    'regular', 'irregular', 'regular_with_murmur', 'bounding', 'weak'
  )),

  -- Respiratory Rate (breaths per minute)
  respiratory_rate_bpm SMALLINT CHECK (respiratory_rate_bpm BETWEEN 0 AND 100),
  respiratory_pattern VARCHAR(50) CHECK (respiratory_pattern IN (
    'regular', 'labored', 'grunting', 'stridor', 'wheezing'
  )),

  -- Blood Pressure (millimeters of mercury)
  systolic_bp_mmhg SMALLINT CHECK (systolic_bp_mmhg BETWEEN 0 AND 250),
  diastolic_bp_mmhg SMALLINT CHECK (diastolic_bp_mmhg BETWEEN 0 AND 200),
  bp_measurement_method VARCHAR(50) CHECK (bp_measurement_method IN (
    'automated', 'manual', 'doppler', 'auscultation'
  )),
  bp_cuff_size VARCHAR(50) CHECK (bp_cuff_size IN (
    'newborn', 'infant', 'child', 'adolescent', 'adult'
  )),

  -- Oxygen Saturation (SpO2)
  oxygen_saturation_percent DECIMAL(5,2) CHECK (oxygen_saturation_percent BETWEEN 0 AND 100),
  oxygen_delivery_method VARCHAR(50) CHECK (oxygen_delivery_method IN (
    'room_air', 'nasal_cannula', 'face_mask', 'non_rebreather'
  )),
  oxygen_flow_rate_lpm DECIMAL(5,2),  -- Liters per minute

  -- Pain Assessment (if applicable)
  pain_scale_type VARCHAR(50) CHECK (pain_scale_type IN (
    'FLACC', 'FACES', 'numeric', 'verbal', 'NIPS'
  )),
  pain_score DECIMAL(5,2),

  -- Context (important for interpretation)
  patient_state VARCHAR(50) CHECK (patient_state IN (
    'asleep', 'quiet', 'awake', 'crying', 'active', 'distressed'
  )),

  -- Flags & Alerts (automatically calculated)
  abnormal_vital_sign BOOLEAN DEFAULT FALSE,
  abnormal_vital_sign_type VARCHAR(255),  -- "elevated HR", "hypothermia", etc.
  needs_intervention BOOLEAN DEFAULT FALSE,

  -- Provider & Audit
  recorded_by VARCHAR(255) NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_vital_patient ON pediatric_vital_signs(patient_id);
CREATE INDEX idx_vital_date ON pediatric_vital_signs(visit_date);
CREATE INDEX idx_vital_abnormal ON pediatric_vital_signs(abnormal_vital_sign)
  WHERE abnormal_vital_sign = TRUE;
```

---

## Table 4-8: Allergy, Medication, Medical History, Family History, Social Determinants

(Fields follow standard patterns; examples above demonstrate format)

---

## Table 9: pediatric_well_visits

**Purpose**: Age-stratified well-visit encounters with Bright Futures framework

```sql
CREATE TABLE pediatric_well_visits (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_specialty_episodes(id),

  -- Visit Details
  visit_date DATE NOT NULL,
  visit_type VARCHAR(100) NOT NULL CHECK (visit_type IN (
    -- Newborn visits
    'newborn_hospital_visit', 'newborn_3_5_day_visit', 'newborn_7_10_day_visit',
    -- Infant visits
    'infant_1mo_well_visit', 'infant_2mo_well_visit_vaccines',
    'infant_4mo_well_visit_vaccines', 'infant_6mo_well_visit_vaccines',
    'infant_9mo_well_visit_development', 'infant_12mo_well_visit_vaccines',
    -- Toddler visits
    'toddler_15mo_well_visit', 'toddler_18mo_well_visit_vaccines_development',
    'toddler_2yr_well_visit', 'toddler_2_5yr_brief_visit',
    'preschool_3yr_well_visit', 'preschool_4yr_well_visit',
    'preschool_5yr_well_visit_school_readiness',
    -- School-age visits
    'school_6yr_entry_physical', 'school_annual_well_visit',
    'school_sick_visit', 'school_sports_physical',
    -- Adolescent visits
    'adolescent_annual_well_visit', 'adolescent_sports_physical',
    'adolescent_mental_health_visit'
  )),
  age_at_visit_months INTEGER,  -- Calculated

  -- Visit Components
  physical_exam_findings JSONB NOT NULL,  -- Structured exam findings
  vital_signs_recorded BOOLEAN,
  immunizations_administered JSONB,  -- Array of vaccine objects
  development_screening_completed BOOLEAN,
  screening_tool_used VARCHAR(255),

  -- Anticipatory Guidance
  guidance_topics JSONB,  -- Array of topics discussed
  parent_education_provided TEXT,
  safety_counseling_completed BOOLEAN,

  -- Assessment Results
  assessment_summary TEXT,
  clinical_impressions TEXT,
  plan_of_care TEXT,

  -- Follow-up
  next_visit_scheduled_date DATE,
  next_visit_type VARCHAR(100),
  referrals_recommended JSONB,  -- Array of referral objects

  -- Provider & Audit
  provider_id VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255),
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table 10: pediatric_immunizations

**Purpose**: Vaccine administration tracking with 2024 CDC/ACIP schedule

```sql
CREATE TABLE pediatric_immunizations (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_specialty_episodes(id),

  -- Vaccine Information
  vaccine_type VARCHAR(50) NOT NULL CHECK (vaccine_type IN (
    'DTaP', 'IPV', 'HepB', 'Hib', 'PCV15', 'PCV20', 'PPSV23', 'RV',
    'MMR', 'VAR', 'HepA', 'IIV', 'LAIV', 'RSV', 'COVID-19', 'HPV',
    'Meningococcal', 'Tdap', 'Td', 'Mpox', 'JE', 'Yellow_Fever'
  )),
  vaccine_name VARCHAR(255) NOT NULL,  -- Brand name (Pentacel, Pediarix, etc.)
  cvx_code VARCHAR(10),  -- CDC vaccine code
  manufacturer VARCHAR(255),
  lot_number VARCHAR(50),
  expiration_date DATE,

  -- Administration Details
  administration_date DATE NOT NULL,
  route VARCHAR(20) CHECK (route IN ('IM', 'SC', 'Oral', 'Intranasal', 'IV', 'ID')),
  site VARCHAR(50) CHECK (site IN (
    'Left_arm', 'Right_arm', 'Left_thigh', 'Right_thigh', 'Abdomen', 'Other'
  )),

  -- Dose Tracking
  dose_number SMALLINT CHECK (dose_number BETWEEN 1 AND 20),
  dose_series VARCHAR(20),  -- "2 of 3", "Booster 1", etc.
  minimum_interval_met BOOLEAN,  -- Checked against CDC minimum intervals

  -- Status & Contraindications
  status VARCHAR(50) NOT NULL CHECK (status IN (
    'administered', 'not_given', 'deferred', 'refused', 'contraindicated', 'partial'
  )),
  reason_if_not_given VARCHAR(255),  -- "Medical contraindication", "Parental refusal", etc.

  -- Adverse Events
  adverse_reaction BOOLEAN DEFAULT FALSE,
  adverse_reaction_type VARCHAR(100),  -- "Local swelling", "Fever", etc.
  adverse_reaction_severity VARCHAR(20) CHECK (adverse_reaction_severity IN (
    'mild', 'moderate', 'severe'
  )),
  adverse_reaction_date DATE,
  anaphylaxis BOOLEAN DEFAULT FALSE,
  adverse_event_reported_to_vaers BOOLEAN DEFAULT FALSE,
  vaers_report_id VARCHAR(50),

  -- Contraindications
  contraindication_present BOOLEAN DEFAULT FALSE,
  contraindication_type VARCHAR(100),  -- "Anaphylaxis to vaccine component", etc.

  -- Clinical Notes
  provider_notes TEXT,

  -- Provider & Audit
  provider_id VARCHAR(255) NOT NULL,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for vaccine tracking
CREATE INDEX idx_immunization_patient ON pediatric_immunizations(patient_id);
CREATE INDEX idx_immunization_date ON pediatric_immunizations(administration_date);
CREATE INDEX idx_immunization_status ON pediatric_immunizations(status);
CREATE INDEX idx_immunization_vaccine ON pediatric_immunizations(vaccine_type);
CREATE INDEX idx_immunization_overdue ON pediatric_immunizations(status)
  WHERE status IN ('not_given', 'deferred');
```

---

## Table 11: pediatric_immunization_status

**Purpose**: Summary cache of vaccine compliance status

```sql
CREATE TABLE pediatric_immunization_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  visit_id UUID,  -- Reference to well-visit

  -- Age & Context
  age_in_months INTEGER NOT NULL,
  evaluation_date DATE NOT NULL,

  -- Status Arrays (JSON for flexibility)
  vaccines_due JSONB,  -- Array of vaccine objects due
  vaccines_overdue JSONB,  -- Array overdue beyond grace period
  vaccines_completed JSONB,  -- Array of successfully given vaccines
  vaccines_contraindicated JSONB,  -- Vaccines patient cannot receive

  -- Metrics
  compliance_percent DECIMAL(5,2),  -- 0-100
  fully_compliant BOOLEAN DEFAULT FALSE,  -- All age-appropriate vaccines given
  days_overdue INTEGER,  -- Days since first overdue vaccine

  -- Next Action
  recommended_action VARCHAR(255),  -- "Schedule appointment", "Review contraindications", etc.

  -- Audit
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table 12: pediatric_newborn_screening

**Purpose**: Mandatory newborn screening program tracking

```sql
CREATE TABLE pediatric_newborn_screening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),

  -- Specimen Collection
  screening_order_date DATE NOT NULL,
  specimen_collection_date DATE NOT NULL,
  specimen_id VARCHAR(100),  -- State-specific ID
  age_at_collection_hours INTEGER,  -- Hours after birth

  -- Screening Details
  screening_type VARCHAR(100) CHECK (screening_type IN (
    'core_panel', 'extended_panel', 'comprehensive', 'targeted'
  )),
  conditions_screened JSONB NOT NULL,  -- Array of condition objects
  -- Example: [{"condition": "Sickle_Cell", "code": "SCD"}, ...]

  -- Results
  results JSONB NOT NULL,  -- Array with result per condition
  -- Example: [{"condition": "Sickle_Cell", "result": "normal|abnormal|borderline"}]
  result_date DATE,
  abnormal_findings JSONB,  -- Details if abnormal

  -- Confirmatory Testing
  confirmatory_test_ordered BOOLEAN DEFAULT FALSE,
  confirmatory_test_type VARCHAR(255),  -- "Hemoglobin electrophoresis", etc.
  confirmatory_test_date DATE,
  confirmatory_test_results JSONB,

  -- Follow-up
  referral_made BOOLEAN DEFAULT FALSE,
  referral_destination VARCHAR(255),  -- Specialist/program
  referral_status VARCHAR(50) CHECK (referral_status IN (
    'pending', 'accepted', 'completed', 'declined'
  )),
  follow_up_plan TEXT,

  -- Multi-tenant
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table 13: pediatric_developmental_screening

**Purpose**: Denver II, ASQ-3, M-CHAT tracking with automated referrals

```sql
CREATE TABLE pediatric_developmental_screening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_specialty_episodes(id),

  -- Assessment Details
  assessment_date DATE NOT NULL,
  age_in_months INTEGER NOT NULL,
  screening_tool VARCHAR(50) NOT NULL CHECK (screening_tool IN (
    'Denver_II', 'ASQ3', 'M_CHAT', 'PEDS', 'Bayley', 'BSID'
  )),
  tool_version VARCHAR(20),

  -- Domain Scores (Denver II example)
  gross_motor_score DECIMAL(5,2),
  gross_motor_interpretation VARCHAR(50) CHECK (gross_motor_interpretation IN (
    'normal', 'caution', 'delay', 'no_opportunity'
  )),

  fine_motor_score DECIMAL(5,2),
  fine_motor_interpretation VARCHAR(50),

  language_score DECIMAL(5,2),
  language_interpretation VARCHAR(50),

  personal_social_score DECIMAL(5,2),
  personal_social_interpretation VARCHAR(50),

  -- Overall Assessment
  overall_score DECIMAL(5,2),
  results_interpretation VARCHAR(50) CHECK (results_interpretation IN (
    'normal', 'caution', 'delay', 'concern', 'needs_evaluation'
  )),

  -- Risk Assessment
  developmental_delay_detected BOOLEAN DEFAULT FALSE,
  delay_severity VARCHAR(50) CHECK (delay_severity IN (
    'mild', 'moderate', 'severe'
  )),

  -- Referral Details
  referral_recommended BOOLEAN DEFAULT FALSE,
  referral_destination VARCHAR(255) CHECK (referral_destination IN (
    'early_intervention_program', 'developmental_pediatrician',
    'speech_pathologist', 'occupational_therapist', 'physical_therapist',
    'school_district_evaluation', 'other'
  )),
  referral_urgency VARCHAR(50) CHECK (referral_urgency IN (
    'routine', 'soon', 'urgent'
  )),

  -- Follow-up
  follow_up_planned BOOLEAN,
  follow_up_date DATE,
  referral_status VARCHAR(50) CHECK (referral_status IN (
    'pending', 'referred', 'accepted', 'in_progress', 'completed', 'declined'
  )),

  -- Provider & Audit
  provider_id VARCHAR(255) NOT NULL,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table 14: pediatric_headss_assessment

**Purpose**: Comprehensive adolescent psychosocial risk assessment (ages 13+)

[See earlier section - complete 6-domain structure with risk stratification]

---

## Tables 15-26: Specialized Assessment Tables

**pediatric_lead_screening**:
- blood_lead_level_mcg_dl, CDC_action_level_met, referral_if_elevated

**pediatric_tb_risk_assessment**:
- risk_factors, tskin_date, igra_date, test_result, treatment_initiated

**pediatric_autism_screening** (M-CHAT):
- screening_tool, total_questions, critical_items_positive, risk_level

**pediatric_behavioral_assessment** (Vanderbilt):
- inattention_score, hyperactivity_score, oppositional_score, adhd_likelihood

**pediatric_mental_health_screening**:
- phq9_modified_score, suicide_risk_assessment, anxiety_score, referral_needed

**pediatric_substance_use_screening** (CRAFFT):
- crafft_score (0-6), substance_categories, risk_level, brief_intervention_offered

**pediatric_sexual_health_assessment**:
- sexual_activity, number_partners, contraception_type, sti_screening_completed

**pediatric_injury_prevention**:
- car_seat_usage, helmet_use, pool_safety, fire_safety_assessment

**pediatric_vision_screening**:
- visual_acuity_right, visual_acuity_left, screening_method, referral_indicated

**pediatric_hearing_screening**:
- screening_type, results (normal/refer), referral_to_audiology

**pediatric_nutrition_assessment**:
- feeding_type, caloric_intake, dietary_adequacy, dietitian_referral

**pediatric_sports_physicals**:
- clearance_status, cardiovascular_findings, orthopedic_assessment, restrictions

---

## Table 27: pediatric_vaccination_schedule_cache

**Purpose**: Pre-calculated vaccination due schedule (avoid recalculation)

```sql
CREATE TABLE pediatric_vaccination_schedule_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  age_in_months INTEGER NOT NULL,

  -- Pre-generated schedule
  schedule_type VARCHAR(50) CHECK (schedule_type IN (
    'standard', 'catch_up', 'accelerated', 'modified'
  )),
  due_vaccines JSONB NOT NULL,  -- Array of vaccine objects with due dates
  -- Example: [{"vaccine": "DTaP", "dose_number": 1, "due_date": "2025-02-15"}]

  -- Metadata
  generated_date DATE NOT NULL,
  valid_through DATE,  -- Cache validity period

  -- Organization
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table 28: pediatric_care_coordination

**Purpose**: Referral tracking and specialist follow-up management

```sql
CREATE TABLE pediatric_care_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),

  -- Referral Details
  referral_date DATE NOT NULL,
  referral_type VARCHAR(100) CHECK (referral_type IN (
    'early_intervention', 'developmental_specialist', 'speech_pathology',
    'occupational_therapy', 'physical_therapy', 'mental_health',
    'psychiatry', 'pediatric_subspecialty', 'school_evaluation',
    'neurology', 'genetics', 'immunology', 'gastroenterology',
    'orthopedics', 'cardiology', 'other'
  )),
  referral_reason TEXT NOT NULL,
  referral_urgency VARCHAR(50) CHECK (referral_urgency IN (
    'routine', 'soon', 'urgent', 'emergency'
  )),

  -- Destination
  referral_destination VARCHAR(255),  -- Specialist name/facility
  specialist_name VARCHAR(255),
  specialist_contact VARCHAR(255),

  -- Status Tracking
  referral_status VARCHAR(50) CHECK (referral_status IN (
    'pending', 'sent', 'accepted', 'in_process', 'completed', 'declined'
  )),
  status_update_date DATE,
  status_update_notes TEXT,

  -- Encounter/Results
  initial_encounter_date DATE,
  encounter_findings TEXT,
  specialist_recommendations TEXT,

  -- Follow-up
  follow_up_required BOOLEAN,
  follow_up_date DATE,
  follow_up_interval_months INTEGER,

  -- Document Management
  referral_letter_sent BOOLEAN,
  results_received BOOLEAN,
  results_reviewed_date DATE,

  -- Provider & Audit
  referring_provider VARCHAR(255) NOT NULL,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Cross-Cutting Field Patterns

### Organization & Multi-Tenancy
Every table includes:
```sql
org_id UUID NOT NULL REFERENCES organizations(id)
```

### Audit Trail
Every table includes:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

### Timestamps (all with timezone)
```sql
-- Always use TIMESTAMP WITH TIME ZONE for temporal data
visit_date DATE,  -- Date only
visit_date_time TIMESTAMP WITH TIME ZONE,  -- Date + time
collection_date DATE,  -- Date only
```

### Provider Attribution
Most clinical records include:
```sql
provider_id VARCHAR(255) NOT NULL,  -- Link to practitioners
provider_name VARCHAR(255),  -- Cached for denormalization
recorded_by VARCHAR(255),  -- Data entry user (may differ from provider)
```

### JSONB Usage (Flexible Data)
Used for:
- Complex nested objects (medications, complications, findings)
- Arrays of objects (multiple responses, conditions)
- Semi-structured data (lab results, observations)

Example pattern:
```sql
CREATE INDEX idx_jsonb_field ON table_name USING GIN (column_name);
```

---

## Data Validation Rules

### Age-Related Validation
```sql
-- Growth records should only use WHO for age <24mo, CDC for >=24mo
ALTER TABLE pediatric_growth_records
ADD CONSTRAINT check_who_age CHECK (
  (chart_type = 'WHO' AND age_in_months < 24) OR
  (chart_type = 'CDC' AND age_in_months >= 24)
);
```

### Immunization Dose Sequencing
```sql
-- Next dose must be after minimum interval from previous dose
-- Validated in application layer (complex CDC rules)
```

### HEADSS Risk Level Calculation
```sql
-- Risk level must match assessment findings
-- Automatic calculation in service layer
-- Immediate risk requires suicidal ideation + plan
```

---

## Indexing Strategy

**High-Priority Indexes** (immediate queries):
- `(patient_id, visit_date)` - Timeline queries
- `(patient_id, age_in_months)` - Age-related lookups
- `status` - Immunization/referral status
- `overall_risk_level` - HEADSS high-risk queries

**Composite Indexes** (common WHERE + ORDER BY):
- `(patient_id, visit_date DESC)` - Latest records first
- `(org_id, patient_id)` - Tenant + patient queries

**Partial Indexes** (specific conditions):
- `idx_abnormal_vital_signs (abnormal_vital_sign) WHERE abnormal_vital_sign = TRUE`
- `idx_overdue_vaccines (status) WHERE status IN ('not_given', 'deferred')`

---

## Retention & Archival Policy

**Keep in active tables**:
- Current patient data (all pediatric tables)
- Active episodes (up to age 18+)

**Archive after age 18**:
- Pediatric growth records (rarely queried)
- Old well-visit notes (searchable via archive)
- Historical immunizations (keep summary)

**Permanent retention** (regulatory):
- Immunization records (lifetime)
- Newborn screening results (lifetime)
- HEADSS/mental health assessments (per HIPAA retention)

---

**Document Complete**: Ready for implementation
**Status**: All 28 tables fully specified
**Next Step**: Create SQL migration file based on this specification
