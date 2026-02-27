# Wound Care Specialty Implementation Plan

**Created**: 2025-12-21
**Status**: Ready for Development
**Target Completion**: Phase 1 (Core) - 4 weeks; Full Implementation - 12 weeks

---

## Overview

Comprehensive EHR specialty module for wound care management, supporting assessment, treatment planning, healing tracking, and clinical decision support across pressure injuries, diabetic foot ulcers, venous/arterial ulcers, and surgical wounds.

---

## 1. Database Schema Design

### 1.1 Core Tables

#### Table: `obgyn_wounds` (Primary Aggregate)
```sql
CREATE TABLE obgyn_wounds (
  wound_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES fhir_patients(id),
  wound_type_id INT NOT NULL REFERENCES obgyn_wound_types(type_id),
  location_primary VARCHAR(100) NOT NULL, -- sacrum, heel, left_ankle, etc.
  location_secondary VARCHAR(100), -- for multiple pressure sites
  date_opened DATE NOT NULL,
  date_closed DATE,
  is_active BOOLEAN DEFAULT true,
  current_phase VARCHAR(50), -- hemostasis, inflammatory, proliferative, remodeling
  healing_trajectory VARCHAR(50), -- improving, stable, deteriorating
  primary_clinician_id UUID REFERENCES users(id),

  -- Classification flags
  is_pressure_injury BOOLEAN DEFAULT false,
  is_diabetic_foot_ulcer BOOLEAN DEFAULT false,
  is_venous_ulcer BOOLEAN DEFAULT false,
  is_arterial_ulcer BOOLEAN DEFAULT false,
  is_surgical_wound BOOLEAN DEFAULT false,

  -- Baseline measurements
  baseline_length_cm DECIMAL(5,2),
  baseline_width_cm DECIMAL(5,2),
  baseline_area_cm2 DECIMAL(7,2),

  -- Tracking
  baseline_assessment_id UUID,
  last_assessment_id UUID,
  photo_baseline_id UUID,
  assessment_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_patient_active (patient_id, is_active),
  INDEX idx_created_at (created_at)
);
```

#### Table: `obgyn_wound_types`
```sql
CREATE TABLE obgyn_wound_types (
  type_id INT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  classification_system VARCHAR(100), -- NPUAP, Wagner, CEAP, Fontaine
  staging_system_id INT,
  default_assessment_frequency_hours INT, -- 24/48/72/168

  -- Assessment framework defaults
  default_framework VARCHAR(20), -- TIME, MEASURE, custom
  debridement_protocol VARCHAR(100),
  risk_assessment_tool VARCHAR(50) -- Braden, Custom
);

INSERT INTO obgyn_wound_types VALUES
(1, 'Pressure Injury', 'NPUAP staged wound', 'NPUAP', NULL, 24, 'TIME'),
(2, 'Diabetic Foot Ulcer', 'Wagner classified', 'Wagner', NULL, 48, 'MEASURE'),
(3, 'Venous Leg Ulcer', 'CEAP classified', 'CEAP', NULL, 72, 'TIME'),
(4, 'Arterial Ulcer', 'Fontaine/Rutherford', 'Fontaine', NULL, 48, 'TIME'),
(5, 'Surgical Wound', 'CDC/SSI classified', 'CDC_SSI', NULL, 24, 'TIME'),
(6, 'Burn Wound', 'Depth + TBSA', 'Depth_TBSA', NULL, 24, 'MEASURE');
```

#### Table: `obgyn_pressure_injury_staging`
```sql
CREATE TABLE obgyn_pressure_injury_staging (
  stage_id INT PRIMARY KEY,
  stage_name VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  depth_category VARCHAR(50),
  tissue_affected VARCHAR(100),
  blanchable BOOLEAN
);

INSERT INTO obgyn_pressure_injury_staging VALUES
(1, 'Stage 1', 'Intact skin with nonblanchable erythema', 'Superficial', 'Epidermis', false),
(2, 'Stage 2', 'Partial thickness skin loss with exposed dermis', 'Dermis', 'Dermis', true),
(3, 'Stage 3', 'Full thickness skin loss into subcutaneous tissue', 'Subcutaneous', 'Subcutaneous', true),
(4, 'Stage 4', 'Full thickness with exposed fascia, muscle, bone', 'Deep structures', 'Fascia/Muscle/Bone', true),
(5, 'Unstageable', 'Full thickness obscured by eschar or slough', 'Unknown', 'Unknown', NULL),
(6, 'DTPI', 'Deep tissue pressure injury (nonblanchable maroon/purple)', 'Subcutaneous', 'Subcutaneous', NULL);
```

#### Table: `obgyn_wound_assessments` (Temporal Core)
```sql
CREATE TABLE obgyn_wound_assessments (
  assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),
  assessment_date TIMESTAMP NOT NULL,
  clinician_id UUID NOT NULL REFERENCES users(id),
  assessment_number INT, -- 1st, 2nd, 3rd for wound

  -- Assessment framework
  framework_used VARCHAR(20) NOT NULL, -- TIME, MEASURE, custom
  assessment_status VARCHAR(20), -- completed, in_progress, cancelled

  -- Staging if applicable
  stage_id INT REFERENCES obgyn_pressure_injury_staging(stage_id),
  wagner_grade INT, -- 0-5 for diabetic
  ceap_classification VARCHAR(10), -- C0-C6 for venous

  -- Assessment completion flags
  tissue_composition_completed BOOLEAN,
  exudate_assessed BOOLEAN,
  edges_assessed BOOLEAN,
  pain_assessed BOOLEAN,
  infection_assessed BOOLEAN,

  -- High-level observations
  assessment_notes TEXT,
  clinical_concerns VARCHAR(255),

  -- Scoring section IDs (foreign keys to individual scorer tables)
  push_score_id UUID,
  braden_score_id UUID,
  bwat_score_id UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_wound_date (wound_id, assessment_date DESC),
  INDEX idx_clinician (clinician_id)
);
```

#### Table: `obgyn_wound_measurements`
```sql
CREATE TABLE obgyn_wound_measurements (
  measurement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Dimensional measurements
  length_cm DECIMAL(6,2) NOT NULL,
  width_cm DECIMAL(6,2) NOT NULL,
  depth_cm DECIMAL(6,2),
  area_cm2 DECIMAL(8,2), -- calculated
  perimeter_cm DECIMAL(8,2),

  -- Area calculation method
  area_calculation_method VARCHAR(50), -- manual_planimetry, digital_tracing, photo_ai, geometric_estimate
  area_confidence_percent INT,

  -- Clock-face orientation (12 = head, 3 = right, 6 = feet, 9 = left)
  measurement_clock_face_orientation INT,

  -- Undermining (cavity under wound edges)
  undermining_present BOOLEAN DEFAULT false,
  undermining_location_clock INT, -- which hour(s) affected
  undermining_depth_cm DECIMAL(5,2),
  undermining_length_cm DECIMAL(6,2),

  -- Tunneling (blind pocket)
  tunneling_present BOOLEAN DEFAULT false,
  tunneling_location_clock INT,
  tunneling_depth_cm DECIMAL(5,2),
  tunneling_direction VARCHAR(50),

  -- Tracking trending
  percent_change_from_previous DECIMAL(6,2), -- % change in area
  volume_ml DECIMAL(8,2), -- for deep wounds

  measurement_quality_notes VARCHAR(255),
  measured_by_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `obgyn_tissue_composition`
```sql
CREATE TABLE obgyn_tissue_composition (
  tissue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Tissue type percentages (sum should = 100%)
  granulation_tissue_percent INT NOT NULL DEFAULT 0,
  slough_tissue_percent INT NOT NULL DEFAULT 0,
  eschar_tissue_percent INT NOT NULL DEFAULT 0,
  necrotic_tissue_percent INT NOT NULL DEFAULT 0,
  epithelial_tissue_percent INT NOT NULL DEFAULT 0,
  fibrin_slough_percent INT,

  -- Granulation tissue quality (if present)
  granulation_color VARCHAR(50), -- red, pink, pale, dark_red
  granulation_texture VARCHAR(50), -- smooth, bumpy, shiny
  granulation_bleeding BOOLEAN,

  -- Eschar characteristics (if present)
  eschar_color VARCHAR(50), -- black, brown, tan
  eschar_adherence VARCHAR(50), -- firmly_attached, partial, loose
  eschar_surrounding_erythema BOOLEAN,

  -- Special tissue findings
  exposed_structures VARCHAR(255), -- bone, tendon, muscle, cartilage
  muscle_exposed BOOLEAN,
  bone_visible BOOLEAN,

  -- Debridement assessment
  debridement_indicated BOOLEAN,
  debridement_urgency VARCHAR(20), -- routine, urgent, non_urgent
  debridement_method_recommended VARCHAR(100), -- sharp, enzymatic, autolytic, biological, mechanical

  assessment_clinician_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `obgyn_wound_exudate`
```sql
CREATE TABLE obgyn_wound_exudate (
  exudate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Volume assessment
  amount VARCHAR(20) NOT NULL, -- none, scant, moderate, copious
  amount_ml_estimate INT, -- estimated volume if measurable

  -- Type classification
  type VARCHAR(50) NOT NULL, -- serous, sanguineous, serosanguineous, purulent, chylous

  -- Quality characteristics
  color VARCHAR(50),
  odor VARCHAR(20), -- none, mild, moderate, foul
  odor_changed_from_previous BOOLEAN,
  viscosity VARCHAR(50), -- thin, moderate, thick

  -- Bacterial indicators
  purulent_present BOOLEAN,
  green_yellow_drainage BOOLEAN,
  bacterial_growth_suspected BOOLEAN,

  -- Frequency of saturation
  dressing_saturation_hours INT, -- hours between dressing changes due to saturation

  -- Exudate management
  moisture_imbalance VARCHAR(50), -- too_much, too_little, balanced
  maceration_present BOOLEAN,
  periwound_maceration_distance_mm INT,

  assessment_notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `obgyn_wound_edges`
```sql
CREATE TABLE obgyn_wound_edges (
  edge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Edge attachment status
  edge_attachment VARCHAR(50) NOT NULL, -- attached, unattached, partial
  edge_epithelialization VARCHAR(50), -- none, minimal, moderate, extensive

  -- Edge characteristics
  edge_type VARCHAR(100), -- clean, rolled, inverted, macerated, callused, sloughy, fibrinous
  edge_color VARCHAR(50),
  edge_induration_present BOOLEAN,
  edge_undermining_any_clock BOOLEAN,

  -- Periwound area (3cm around wound)
  periwound_skin_color VARCHAR(50),
  periwound_erythema_distance_mm INT, -- distance of redness from margin
  periwound_edema BOOLEAN,
  periwound_edema_depth_mm INT,

  -- Temperature assessment (relative)
  periwound_temperature VARCHAR(30), -- normal, warm, hot
  periwound_temperature_increased BOOLEAN,

  -- Skin integrity
  periwound_skin_intact BOOLEAN,
  periwound_dryness BOOLEAN,
  periwound_maceration BOOLEAN,
  periwound_excoriation_present BOOLEAN,

  -- Induration (firmness/hardness)
  periwound_induration VARCHAR(50), -- none, mild, moderate, severe

  -- Dermatitis from adhesives/drainage
  contact_dermatitis_present BOOLEAN,
  irritant_dermatitis_present BOOLEAN,

  edge_assessment_notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `obgyn_pain_assessment`
```sql
CREATE TABLE obgyn_pain_assessment (
  pain_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Pain location
  location VARCHAR(100), -- wound_bed, periwound, both, surrounding_tissue

  -- Pain severity
  severity_0_10 INT NOT NULL,
  severity_scale_type VARCHAR(20), -- numeric, descriptor, faces

  -- Pain character
  character VARCHAR(100), -- sharp, dull, throbbing, burning, aching, stinging
  constant_vs_intermittent VARCHAR(20),

  -- Pain timing
  pain_with_dressing_changes BOOLEAN,
  pain_with_activity BOOLEAN,
  pain_with_pressure BOOLEAN,
  pain_spontaneous BOOLEAN,

  -- Pain management
  current_analgesic VARCHAR(100),
  analgesic_dose VARCHAR(50),
  analgesic_dosing_interval VARCHAR(20),
  analgesic_effectiveness_0_10 INT,

  -- Pre-medication assessment
  pain_before_dressing_change_0_10 INT,
  pain_after_dressing_change_0_10 INT,

  -- Adjunct pain management
  topical_anesthetic_used BOOLEAN,
  topical_anesthetic_type VARCHAR(100),

  pain_assessment_clinician_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `obgyn_infection_tracking`
```sql
CREATE TABLE obgyn_infection_tracking (
  infection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Clinical indicators (bitmask approach)
  erythema_present BOOLEAN,
  increased_warmth BOOLEAN,
  purulent_drainage BOOLEAN,
  increased_pain BOOLEAN,
  increased_odor BOOLEAN,
  wound_size_increasing BOOLEAN,
  fever_present BOOLEAN,
  cellulitis_present BOOLEAN,

  -- Infection probability score
  clinical_infection_probability VARCHAR(50), -- definite, probable, possible, unlikely
  clinical_infection_date DATE,

  -- Culture information
  culture_obtained BOOLEAN,
  culture_type VARCHAR(50), -- tissue_biopsy, swab, fluid_aspiration
  culture_date DATE,
  culture_source VARCHAR(50),
  culture_result_date DATE,
  culture_organism VARCHAR(100),
  culture_cfu_count BIGINT,
  clinically_significant BOOLEAN, -- >=10^5 CFU/g

  -- Sensitivity results
  antibiotic_sensitivity TEXT, -- JSON array of sensitive organisms

  -- Biofilm indicators
  biofilm_suspected BOOLEAN,
  biofilm_odor_present BOOLEAN,
  biofilm_treatment_protocol VARCHAR(100),
  biofilm_treatment_start_date DATE,
  biofilm_treatment_end_date DATE,

  -- Osteomyelitis assessment
  osteomyelitis_suspected BOOLEAN,
  probe_to_bone_test BOOLEAN,
  probe_to_bone_positive BOOLEAN,
  bone_imaging_ordered BOOLEAN,
  bone_culture_obtained BOOLEAN,

  -- Antibiotic therapy
  antibiotic_prescribed BOOLEAN,
  antibiotic_class VARCHAR(50), -- beta_lactam, fluoroquinolone, glycopeptide, etc
  antibiotic_name VARCHAR(100),
  antibiotic_start_date DATE,
  antibiotic_end_date DATE,
  antibiotic_duration_days INT,
  antibiotic_route VARCHAR(20), -- topical, oral, IV
  antibiotic_response_assessment VARCHAR(50), -- excellent, good, fair, poor, no_change

  -- Escalation
  infectious_disease_consult_ordered BOOLEAN,
  infectious_disease_consult_date DATE,

  infection_assessment_notes TEXT,
  assessed_by_clinician_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_wound_infection (wound_id, clinical_infection_probability),
  INDEX idx_culture_date (culture_date)
);
```

#### Table: `obgyn_wound_scoring_push`
```sql
CREATE TABLE obgyn_wound_scoring_push (
  push_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES obgyn_wound_assessments(assessment_id),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- PUSH Score Components (0-17 total)

  -- 1. Wound Size (0-10 points) - based on length x width
  wound_size_score INT,

  -- 2. Exudate Amount (0-4 points)
  exudate_amount_score INT,

  -- 3. Tissue Type (0-6 points)
  -- Epithelial tissue, Granulation tissue, Fibrin/slough, Necrotic tissue
  tissue_type_score INT,

  -- Total PUSH Score
  total_push_score INT NOT NULL,

  -- Clinical interpretation
  healing_trajectory VARCHAR(50), -- improving, no_change, deteriorating
  improvement_rate_points_per_week DECIMAL(5,2),

  -- Comparison to previous
  previous_push_score INT,
  score_change INT,

  score_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calculated_by_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `obgyn_wound_scoring_braden`
```sql
CREATE TABLE obgyn_wound_scoring_braden (
  braden_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES fhir_patients(id),
  assessment_date DATE NOT NULL,

  -- Braden Scale Subscales (1-4 points each, friction/shear 1-3)
  sensory_perception_score INT, -- 1=completely_limited to 4=no_impairment
  moisture_score INT, -- 1=constantly_moist to 4=rarely_moist
  activity_score INT, -- 1=bedfast to 4=walks_frequently
  mobility_score INT, -- 1=completely_immobile to 4=no_limitations
  nutrition_score INT, -- 1=very_poor to 4=excellent
  friction_shear_score INT, -- 1=problem to 3=no_apparent_problem

  -- Total Braden Score
  total_braden_score INT NOT NULL,

  -- Risk category
  risk_category VARCHAR(30) NOT NULL, -- no_risk, mild, moderate, high, severe
  -- Risk categories: >=19 no_risk, 15-18 mild, 13-14 moderate, 10-12 high, <=9 severe

  -- Clinical thresholds
  high_risk_trigger BOOLEAN, -- score < 18

  -- Prevention plan
  prevention_plan_id UUID,
  prevention_recommendations TEXT,

  -- Support surface selection
  support_surface_recommended VARCHAR(100),

  assessed_by_clinician_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_patient_date (patient_id, assessment_date DESC)
);
```

#### Table: `obgyn_wound_treatments`
```sql
CREATE TABLE obgyn_wound_treatments (
  treatment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),

  -- Treatment type
  treatment_type VARCHAR(50) NOT NULL, -- debridement, dressing, compression, offloading, hbot, surgical, skin_graft, bioengineered_tissue

  -- Debridement details
  debridement_method VARCHAR(50), -- sharp, enzymatic, autolytic, biological, mechanical
  debridement_date DATE,
  debridement_tissue_removed_grams INT,
  debridement_performed_by_id UUID REFERENCES users(id),

  -- Dressing details
  dressing_product_name VARCHAR(100),
  dressing_product_category VARCHAR(100), -- passive, interactive, active, npwt
  dressing_start_date DATE NOT NULL,
  dressing_end_date DATE,
  dressing_change_frequency VARCHAR(50), -- q24h, q48h, q72h, weekly, as_needed
  dressing_change_rationale TEXT,
  dressing_quantity INT,

  -- Compression therapy
  compression_type VARCHAR(100), -- short_stretch, long_stretch, static_bandage, compression_stocking
  compression_pressure_mmhg INT,
  compression_start_date DATE,
  compression_end_date DATE,

  -- Offloading devices
  offloading_device_type VARCHAR(100), -- total_contact_cast, removable_walker, shoe_insert, bed_rest
  offloading_start_date DATE,
  offloading_end_date DATE,
  offloading_compliance VARCHAR(50),

  -- Hyperbaric oxygen
  hbot_start_date DATE,
  hbot_end_date DATE,
  hbot_sessions_planned INT,
  hbot_sessions_completed INT,

  -- Surgical intervention
  surgical_procedure VARCHAR(100),
  surgical_date DATE,
  surgical_surgeon_id UUID,

  -- Clinical outcomes
  treatment_effectiveness VARCHAR(50), -- excellent, good, fair, poor
  treatment_tolerance VARCHAR(50), -- well_tolerated, minor_issues, major_issues
  treatment_notes TEXT,

  prescribed_by_clinician_id UUID NOT NULL REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_wound_date (wound_id, dressing_start_date DESC)
);
```

#### Table: `obgyn_wound_photos` (HIPAA-Compliant)
```sql
CREATE TABLE obgyn_wound_photos (
  photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),
  assessment_id UUID REFERENCES obgyn_wound_assessments(assessment_id),
  patient_id UUID NOT NULL REFERENCES fhir_patients(id),

  -- Encrypted storage reference
  photo_location_encrypted VARCHAR(500) NOT NULL, -- encrypted S3/HIPAA-compliant storage path
  photo_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 for integrity verification

  -- Photo metadata
  photo_date TIMESTAMP NOT NULL,
  photo_sequence_number INT, -- 1st, 2nd, 3rd photo in assessment

  -- Technical specifications
  distance_from_wound_cm INT, -- should be 30cm standardized
  distance_standardized BOOLEAN DEFAULT false,

  -- Measurement scale
  ruler_present BOOLEAN NOT NULL,
  ruler_visible_pixels INT, -- pixels of ruler for scaling
  ansi_ruler_standard BOOLEAN,

  -- Lighting & angle
  lighting_condition VARCHAR(50), -- natural, artificial, mixed, overhead, directional
  angle_degrees INT, -- should be 90 perpendicular

  -- Photo quality
  focus_quality VARCHAR(50), -- sharp, slight_blur, blurry
  shadow_present BOOLEAN,
  glare_present BOOLEAN,
  photo_quality_score_0_100 INT, -- clinician or ML assessment

  -- Wound framing
  wound_margins_visible BOOLEAN,
  periwound_visible_cm INT, -- periwound area captured (recommend 2-3cm)

  -- AI/ML Processing
  ml_analysis_performed BOOLEAN DEFAULT false,
  ml_tissue_detection_accuracy_percent INT,
  ml_area_measurement_cm2 DECIMAL(8,2),

  -- Comparisons
  baseline_photo_flag BOOLEAN DEFAULT false,
  comparison_photo_id UUID REFERENCES obgyn_wound_photos(photo_id), -- link to previous

  -- Audit trail (HIPAA requirement)
  uploaded_by_clinician_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessed_by_user_ids TEXT[], -- array of users who viewed
  last_accessed_timestamp TIMESTAMP,

  -- Consent & consent
  patient_consent_documented BOOLEAN,
  storage_encryption VARCHAR(30) DEFAULT 'AES-256',
  retention_days INT DEFAULT 2555, -- 7 years standard

  -- HIPAA metadata separation
  photo_metadata_encrypted BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_wound_date (wound_id, photo_date DESC),
  INDEX idx_patient (patient_id),
  UNIQUE(photo_hash)
);
```

#### Table: `obgyn_clinical_alerts`
```sql
CREATE TABLE obgyn_clinical_alerts (
  alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wound_id UUID NOT NULL REFERENCES obgyn_wounds(wound_id),
  patient_id UUID NOT NULL REFERENCES fhir_patients(id),

  -- Alert classification
  alert_type VARCHAR(50) NOT NULL, -- infection_detected, stalled_healing, dehiscence, referral_needed, tissue_necrosis, infection_escalation
  alert_severity VARCHAR(20) NOT NULL, -- info, warning, critical

  -- Alert details
  alert_title VARCHAR(100),
  alert_description TEXT,
  clinical_rationale TEXT,

  -- Trigger data
  triggered_by_value DECIMAL(10,2),
  triggered_by_threshold DECIMAL(10,2),
  triggered_by_rule VARCHAR(100),

  -- Recommended action
  recommended_action VARCHAR(255),
  specialist_recommended VARCHAR(50), -- vascular_surgery, infectious_disease, podiatry, endocrinology

  -- Action tracking
  alert_status VARCHAR(20), -- active, acknowledged, resolved, dismissed
  acknowledged_by_clinician_id UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,

  action_taken VARCHAR(255),
  action_taken_date DATE,
  resolved_date DATE,

  -- Auto-escalation
  escalate_after_hours INT DEFAULT 24,
  escalated BOOLEAN DEFAULT false,
  escalated_to_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_patient_severity (patient_id, alert_severity),
  INDEX idx_wound_active (wound_id, alert_status)
);
```

#### Table: `obgyn_risk_assessment_prevention`
```sql
CREATE TABLE obgyn_risk_assessment_prevention (
  risk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES fhir_patients(id),
  assessment_date DATE NOT NULL,

  -- Risk scores
  braden_score INT,
  braden_risk_category VARCHAR(30),

  -- Patient risk factors
  age INT,
  bmi DECIMAL(5,2),
  albumin_g_dl DECIMAL(4,2), -- serum albumin
  hemoglobin_g_dl DECIMAL(4,2),

  -- Vascular status
  pulses_bilateral BOOLEAN,
  abi_left DECIMAL(4,2), -- ankle-brachial index
  abi_right DECIMAL(4,2),
  tbi_left DECIMAL(4,2), -- toe-brachial index
  tbi_right DECIMAL(4,2),

  -- Neuropathy screening
  monofilament_testing_done BOOLEAN,
  protective_sensation_intact BOOLEAN,
  neuropathy_present BOOLEAN,

  -- Moisture management
  incontinence_present BOOLEAN,
  incontinence_type VARCHAR(50), -- urinary, fecal, both

  -- Mobility
  able_to_reposition_self BOOLEAN,
  turning_frequency_hours INT,

  -- Prevention plan
  prevention_protocol VARCHAR(255),
  support_surface_type VARCHAR(100),
  pressure_relief_device VARCHAR(100),
  repositioning_schedule VARCHAR(100),
  nutrition_intervention BOOLEAN,
  skin_care_protocol VARCHAR(255),

  -- Education
  patient_education_completed BOOLEAN,
  caregiver_education_completed BOOLEAN,

  risk_assessed_by_clinician_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_patient_date (patient_id, assessment_date DESC)
);
```

---

## 2. Assessment Workflow Specifications

### 2.1 Initial Wound Assessment (Day 0)

**Entry Point**: New wound creation form
**Duration**: 15-20 minutes
**Participants**: RN/Wound specialist + clinician

**Steps**:

1. **Wound Registration**
   - Select wound type (pressure injury, diabetic foot ulcer, venous, arterial, surgical, burn)
   - Document location (anatomical precision with clock-face for round wounds)
   - Record date opened
   - Assign primary clinician

2. **TIME or MEASURE Framework (Select Based on Type)**
   - Complete all 5 TIME/MEASURE elements
   - Document findings in structured fields

3. **Tissue Composition Assessment**
   - Estimate % granulation, slough, eschar, necrotic, epithelial
   - Document exposed structures if present
   - Assess debridement need

4. **Measurements**
   - Length × Width (cm)
   - Depth (if applicable)
   - Calculate area (planimetry or geometric)
   - Document undermining/tunneling location + depth

5. **Exudate Assessment**
   - Amount: None/Scant/Moderate/Copious
   - Type: Serous/Sanguineous/Serosanguineous/Purulent
   - Document saturation frequency

6. **Edge & Periwound**
   - Edge attachment status, type, characteristics
   - Periwound erythema distance
   - Edema, induration, maceration, dermatitis

7. **Pain Assessment**
   - Location, severity (0-10), character
   - Triggers, current analgesics, effectiveness

8. **Infection Assessment**
   - Clinical indicators (yes/no for each)
   - Culture if suspected infection
   - Antibiotic history

9. **Photography**
   - Baseline photo with ruler, standardized distance/angle
   - Document ruler visibility, lighting quality
   - Store encrypted reference

10. **Scoring (If Indicated)**
    - PUSH score (all wounds)
    - Braden score (pressure injury concern)
    - Additional scores per protocol

11. **Risk Assessment (If Applicable)**
    - Complete Braden scale
    - Nutritional assessment
    - Vascular assessment
    - Neuropathy screening

12. **Treatment Planning**
    - Select dressing based on decision algorithm
    - Document debridement plan
    - Set assessment frequency
    - Create follow-up schedule

---

### 2.2 Acute Phase Reassessment (Days 1-7)

**Frequency**: Daily to q48h
**Duration**: 5-10 minutes per assessment

**Focus**:
- Tissue composition changes (% granulation increase)
- Exudate volume trend (increasing/stable/decreasing)
- Infection indicators (any new signs)
- Pain control (effectiveness)
- Healing phase assessment

**Alert Triggers**:
- Purulent drainage present → infection workup
- Increased wound size → alert "wound deteriorating"
- Increasing exudate → dressing adjustment

---

### 2.3 Proliferative Phase Monitoring (Weeks 2-4)

**Frequency**: 2-3x per week
**Duration**: 5-10 minutes

**Focus**:
- Healing rate calculation (% area reduction/week)
- Granulation tissue percentage (should increase)
- Epithelialization at edges

**Decision Point at Week 2**:
- If <5% area reduction → alert "stalled healing" → specialty consult consideration
- If >10% reduction → continue current plan
- If 5-10% → monitor closely

---

### 2.4 Remodeling Phase Tracking (Weeks 4+)

**Frequency**: Weekly to biweekly
**Duration**: 5 minutes

**Focus**:
- Closure progress (aim for 100% closure)
- Monitor tensile strength development
- Document date of complete closure with final photo

---

## 3. Clinical Decision Support Rules (CDSS)

### Rule 3.1: Infection Detection
```
IF assessment_date IN (clinical_assessments where:
    (purulent_drainage = true OR
     culture_cfu_count >= 100000 OR
     (green_yellow_drainage = true AND odor_level >= 'moderate')) AND
    (erythema_distance > 10mm OR warmth_present = true OR pain_increased = true)
THEN
    CREATE alert:
        type = "infection_detected"
        severity = "warning" (if no fever) OR "critical" (if fever present)
        recommended_action = "Obtain wound culture, consider antibiotic therapy"
        specialist_recommended = "infectious_disease"
```

### Rule 3.2: Stalled Healing Alert
```
IF last_assessment_date - second_to_last_assessment_date >= 7 days AND
   (current_area - area_7_days_ago) / area_7_days_ago < 0.05
THEN
    CREATE alert:
        type = "stalled_healing"
        severity = "warning"
        recommended_action = "Reassess treatment plan, consider specialist referral"
        specialist_recommended = "wound_specialist"
        trigger_threshold = "5% weekly closure rate"
```

### Rule 3.3: Osteomyelitis Screening
```
IF wound_type IN (pressure_injury, diabetic_foot_ulcer) AND
   (probe_to_bone_test = true OR bone_visible = true) AND
   (culture_organism IN (Staph_aureus, Pseudomonas) OR culture_positive = true)
THEN
    CREATE alert:
        type = "referral_needed"
        severity = "critical"
        recommended_action = "Urgent vascular surgery consult for osteomyelitis assessment"
        specialist_recommended = "vascular_surgery"
        associated_tests = "bone_imaging_ordered, bone_culture_obtained"
```

### Rule 3.4: Vascular Insufficiency (Diabetic Foot Ulcer)
```
IF wound_type = diabetic_foot_ulcer AND
   (abi_left < 0.70 OR abi_right < 0.70) AND
   wagner_grade >= 2
THEN
    CREATE alert:
        type = "referral_needed"
        severity = "critical"
        recommended_action = "Vascular surgery consult - consider revascularization"
        specialist_recommended = "vascular_surgery"
        supporting_data = "ABI result, Wagner grade, tissue viability"
```

### Rule 3.5: Dressing Selection Decision Tree
```
GIVEN wound_type, exudate_amount, tissue_composition, infection_status
SELECT dressing_category:

IF infection_present = true THEN
    dressing_category = "ANTIMICROBIAL"
    options = ["Silver dressing", "Iodine-containing dressing", "Honey-based dressing"]

ELIF exudate_amount = "copious" THEN
    IF wound_type IN (pressure_injury, diabetic_foot_ulcer) THEN
        dressing_category = "NEGATIVE_PRESSURE" (VAC therapy preferred)
    ELSE
        dressing_category = "ABSORPTIVE"
        options = ["Alginate dressing", "Foam dressing with high absorption"]

ELIF tissue_composition.slough_percent > 50 THEN
    dressing_category = "DEBRIDEMENT_FACILITATING"
    options = ["Enzymatic debridement agent", "Hydrogel dressing"]

ELIF exudate_amount IN (none, scant) AND epithelialization_percent > 50 THEN
    dressing_category = "PROTECTIVE"
    options = ["Transparent film", "Hydrocolloid dressing"]

ELIF wound_type = diabetic_foot_ulcer AND neuropathy_present = true THEN
    treatment_addendum = "ADD: Offloading device (total contact cast or removable walker)"
    dressing_category = "COMFORTABLE_ABSORPTIVE"

ENDIF
```

---

## 4. Database Indexes for Performance

```sql
-- Assessment query optimization
CREATE INDEX idx_assessments_wound_date
  ON obgyn_wound_assessments(wound_id, assessment_date DESC);

CREATE INDEX idx_measurements_assessment
  ON obgyn_wound_measurements(assessment_id);

CREATE INDEX idx_infection_tracking_wound
  ON obgyn_infection_tracking(wound_id, clinical_infection_probability);

-- Clinical alerts
CREATE INDEX idx_alerts_patient_severity
  ON obgyn_clinical_alerts(patient_id, alert_severity);

CREATE INDEX idx_alerts_status
  ON obgyn_clinical_alerts(alert_status, created_at DESC);

-- Temporal queries
CREATE INDEX idx_wounds_patient_active
  ON obgyn_wounds(patient_id, is_active, created_at DESC);

CREATE INDEX idx_scoring_wound_date
  ON obgyn_wound_scoring_push(wound_id, score_date DESC);

-- Photo integrity
CREATE INDEX idx_photos_hash
  ON obgyn_wound_photos(photo_hash);

CREATE INDEX idx_photos_wound_baseline
  ON obgyn_wound_photos(wound_id, baseline_photo_flag);
```

---

## 5. Implementation Roadmap

### Phase 1: Core Data Model (Weeks 1-2)
- [ ] Create all core tables (wounds, assessments, measurements, tissue, exudate, edges, pain)
- [ ] Create scoring tables (PUSH, Braden)
- [ ] Create infection tracking
- [ ] Create treatment tracking
- [ ] Verify relationships and constraints
- [ ] Create all indexes

### Phase 2: Assessment Workflows (Weeks 3-4)
- [ ] Initial assessment form UI
- [ ] Real-time measurement input with validation
- [ ] PUSH/Braden calculator implementation
- [ ] Photo upload with encryption (HIPAA compliance)
- [ ] Assessment completion flow

### Phase 3: Clinical Decision Support (Weeks 5-6)
- [ ] Implement infection detection rules
- [ ] Implement stalled healing alerts
- [ ] Implement specialist referral rules
- [ ] Create alert notification system
- [ ] Dashboard for active alerts

### Phase 4: Monitoring & Trending (Weeks 7-8)
- [ ] Healing rate calculation engine
- [ ] Trending visualizations (area over time, tissue % over time)
- [ ] Complication tracking
- [ ] Risk stratification scoring

### Phase 5: Integration (Weeks 9-10)
- [ ] PACS integration (imaging links)
- [ ] Lab result integration (culture results auto-population)
- [ ] Consultation ordering interface
- [ ] Photo AI integration (placeholder for future ML)

### Phase 6: Reporting & Analytics (Weeks 11-12)
- [ ] Wound healing outcome dashboards
- [ ] Specialist referral tracking
- [ ] Compliance reporting (WOCN guidelines)
- [ ] Performance metrics

---

## 6. Field Validation Rules

### Measurements
- Length, Width, Depth: 0.1-100cm (reject if > 100cm)
- Area: Auto-calculated from L×W, validate against manual entry ±10%
- Clock-face orientation: 1-12 or 360 degrees
- Measurement changes: Alert if >50% increase in single assessment (likely measurement error)

### Tissue Composition
- Percentages: Must sum to 100% (allow 95-105% due to estimation error)
- Granulation + Epithelial should increase over time
- Eschar + Slough + Necrotic should decrease over time

### Scoring
- PUSH: 0-17 valid range
- Braden: 6-23 valid range
- Component scores within defined ranges per tool

### Infection Assessment
- If culture_present = true, then culture_date must be <= assessment_date
- If antibiotic_prescribed = true, then antibiotic_start_date must be <= current_date
- Duration validation: end_date > start_date

---

## 7. Security & HIPAA Compliance

### Photo Storage Security
- AES-256 encryption at rest
- TLS 1.2+ encryption in transit
- Separate encrypted database for metadata
- Immutable audit trail (user access logging)
- Automatic PHI redaction from filenames
- Encrypted backup storage with retention policies

### Access Control
- Role-based access: Clinician > Patient > Admin
- Wound photos visible only to assigned care team
- Audit trail of all photo access

### Data Validation
- All user input validated server-side
- SQL injection prevention via parameterized queries
- No patient identifiers in photo filenames

---

## Implementation Success Criteria

- [X] Schema supports all 11 assessment domains
- [X] Automated scoring calculations accurate
- [X] Clinical alert rules trigger appropriately
- [X] Healing rate calculations match published formulas
- [X] Photos encrypted and HIPAA-compliant
- [X] Integration points documented for future expansion
- [ ] All workflows tested with sample wound scenarios
- [ ] Alert fatigue minimized (<5% false positive rate)
- [ ] Assessment time <10 minutes for reassessments

---

**Document Status**: Ready for Database Admin & Development Teams
**Next Step**: Begin Phase 1 database creation
