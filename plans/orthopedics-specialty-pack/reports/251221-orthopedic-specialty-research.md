# Research Report: Comprehensive Orthopedics Specialty Clinical Workflows for EHR Implementation

**Date**: December 21, 2025  
**Status**: Complete  
**Scope**: Clinical workflows, assessment tools, implant registry, complications, imaging, and rehabilitation protocols

---

## Executive Summary

Orthopedic specialty implementation for EHR systems requires comprehensive documentation across 5 clinical phases: pre-operative assessment, intraoperative procedures, post-operative care, rehabilitation, and long-term follow-up. This research synthesizes clinical best practices from AAOS (American Academy of Orthopedic Surgeons) and COA (Canadian Orthopedic Association) standards. Key deliverables include 15+ database tables, assessment calculator specifications with scoring formulas, implant registry compliance (AJRR), clinical decision support rules, and integration points for PACS, PT scheduling, and device registries. The orthopedic specialty pack will follow patterns established in the OB/GYN specialty while adding joint-specific complexity.

---

## Research Methodology

- **Sources**: AAOS Clinical Practice Guidelines, AJRR (American Joint Replacement Registry), orthopedic surgery standards, rehabilitation principles, imaging guidelines
- **Search Focus**: Clinical workflows, assessment tools, implant tracking, complication protocols, rehabilitation
- **Validation**: Cross-referenced AAOS, COA, and orthopedic surgical standards for accuracy
- **Scope**: Comprehensive coverage of major procedures (joint replacement, arthroscopy, fracture management, spine surgery, sports medicine)

---

## 1. CLINICAL WORKFLOW PHASES

### 1.1 Pre-Operative Assessment Phase

**Workflow Objective**: Patient optimization, risk stratification, informed consent, surgical planning.

**Key Steps**:
1. Chief complaint & HPI documentation
2. Medical/surgical history review
3. Physical examination (orthopedic-focused)
4. Diagnostic imaging review (X-ray, MRI, CT, ultrasound)
5. Lab testing for clearance (CBC, metabolic panel, coagulation studies)
6. Risk assessment (DVT/PE, infection, anesthesia)
7. Medical clearance from primary care/specialists
8. Surgical planning & approach selection
9. Informed consent discussion & documentation
10. Pre-operative optimization (smoking cessation, glucose control)

**Data Elements**:
- Patient demographics & contact information
- Chief complaint (dropdown: joint, location, affected limb)
- Pain scale (0-10 VAS)
- Functional limitations (text/checklist)
- Medical history (chronic conditions: diabetes, cardiovascular, renal, hepatic)
- Surgical history (prior orthopedic procedures, complications)
- Medications (current regimen, anticoagulants, NSAIDs)
- Allergies (drug, contrast, implant materials)
- Social history (smoking, alcohol, occupation, activity level)
- Physical exam findings (ROM, strength 0-5, neurovascular status, special tests)
- Imaging findings (radiologist report, measurements, key observations)
- Lab values (CBC, CMP, PT/INR, type & screen)
- Medical clearance status (cleared/conditional/not cleared)
- Planned procedure (CPT code, approach, anticipated implants)
- ASA score for anesthesia risk
- DVT/PE risk assessment (Caprini score or equivalent)
- Informed consent date & signature

### 1.2 Intraoperative Documentation Phase

**Workflow Objective**: Accurate procedure capture, implant tracking, safety verification, complication documentation.

**Key Steps**:
1. Pre-incision safety timeout
2. Incision & approach execution
3. Exposure of surgical site
4. Procedure-specific steps (e.g., joint preparation, component positioning)
5. Implant selection & placement
6. Hemostasis & irrigation
7. Soft tissue closure
8. Sponge/sharps/instrument counts
9. Dressing application
10. Transfer to recovery

**Data Elements**:
- Pre-operative timeout checklist (patient, site, procedure, equipment, allergies verification)
- Surgeon(s) name & credentials
- Surgical time-in/time-out
- Anesthesia type & provider
- Incision location & length
- Approach (anterior, posterior, anterolateral, etc.)
- Surgical findings (synovitis, chondral damage, tendon status)
- Key procedure steps (templating, reaming, cutting, trialing, final placement)
- **Implant Data** (critical for registry):
  - Component type (femoral, tibial, patellar, acetabular, etc.)
  - Manufacturer & model
  - Unique Device Identifier (UDI)
  - Lot number & serial number
  - Size/dimensions (mm for bone cuts, component sizes)
  - Fixation method (cementless, cemented, hybrid)
  - Cement type (if applicable)
  - Quantity placed
  - Placement location & orientation
  - Expiration date
- Estimated blood loss (mL)
- Drain placement (type, location)
- Fluids given (crystalloid, blood products)
- Irrigant type (saline, antibiotic-loaded)
- Hemostasis method (cautery, sutures, hemostatic agents)
- Closure technique (layers, suture type/size)
- Sponge/sharps/instrument counts (initial, final, discrepancy noted?)
- Intraoperative complication (if present): type, management
- Specimen collection (synovium, tissue sent to pathology)
- X-ray performed (intraoperative confirmation)
- Final position assessment (alignment verified)
- Surgeon's narrative summary

### 1.3 Post-Operative Care Phase

**Workflow Objective**: Pain management, wound healing, early mobilization, complication monitoring, discharge planning.

**Timeline**: Hospital stay (typically 1-3 days for joint replacement, same-day for arthroscopy)

**Key Steps**:
1. Recovery room monitoring
2. Vital signs & pain assessment
3. Wound evaluation
4. DVT prophylaxis initiation
5. Antibiotic administration
6. Pain control (multimodal)
7. Early ROM exercises
8. Weight-bearing status documentation
9. Physical therapy initiation
10. Discharge planning

**Data Elements**:
- PACU documentation (Aldrete score, time, vital signs)
- Pain score (VAS 0-10, frequency)
- Pain medications given (type, dose, time, effectiveness)
- Nausea/vomiting (if present)
- Drain output (amount, character, date of removal)
- Wound appearance (erythema, edema, drainage, dehiscence, hematoma)
- Suture/staple count & status
- Dressing changes (date, type of dressing)
- Wound photos (image upload capability)
- Weight-bearing status (NWB, TDWB, PWB, WBAT, FWB)
- Assistive devices (crutches, walker, cane)
- ROM exercises (type, frequency, tolerance)
- Neurovascular assessment (pulses, sensation, motor function)
- Swelling assessment (girth measurements)
- Temperature (fever monitoring)
- Deep vein thrombosis (DVT) prophylaxis (mechanical + pharmacological)
- Antibiotic prophylaxis (dose, timing)
- Daily progress notes (SOAP format)
- Discharge medications (list with dosages, frequency)
- Discharge instructions (wound care, activity, follow-up)
- Rehabilitation plan/PT referral
- Follow-up appointment dates
- Patient education documented (pain management, precautions, signs of infection)

### 1.4 Rehabilitation Phase

**Workflow Objective**: Restore ROM, strength, functional mobility, adherence to weight-bearing status.

**Timeline**: Weeks 0-12+ (varies by procedure; TKA/THA typically 6-12 weeks, ACL 6 months, rotator cuff 4-6 months)

**Key Steps**:
1. PT/OT referral & scheduling
2. Initial evaluation (baseline ROM, strength, functional assessment)
3. Goal setting (short/long-term)
4. Exercise prescription (therapeutic, functional)
5. Modality application (heat, ice, electrical stimulation)
6. Weight-bearing progression
7. ROM progression
8. Strength training progression
9. Functional training (gait, stairs, ADLs)
10. Progress re-assessment (every 2-3 weeks)
11. Home exercise program (HEP) provision
12. Return-to-activity clearance

**Data Elements**:
- PT/OT referral date & provider
- Initial evaluation date
- Patient goals (subjective)
- Initial measurements:
  - ROM (degrees per joint plane)
  - Strength (0-5 manual muscle test per muscle group)
  - Functional scores (WOMAC, Harris Hip Score, Oxford, DASH, etc.)
  - Pain (VAS)
  - Gait assessment
  - Balance assessment
- Weight-bearing status (current, date of last change)
- Therapy session notes (interventions, dosage, response)
- Objective measurements (re-assessment every 2-3 weeks)
- Progress notes (functional gains, barrier to progress)
- Home exercise program (prescribed exercises, frequency, sets/reps)
- Patient adherence tracking
- Pain management (need for analgesics)
- Complications (swelling, pain exacerbation, new issues)
- Re-assessment dates & findings
- Discharge criteria met (date)
- Final functional status & outcome scores
- Return-to-activity/work status

### 1.5 Long-Term Follow-Up Phase

**Workflow Objective**: Implant surveillance, outcome assessment, complication detection, registry submission.

**Timeline**: 6 weeks, 3 months, 6 months, 1 year, then annually or per protocol

**Key Steps**:
1. Scheduled follow-up visit
2. Subjective review (pain, function, satisfaction)
3. Physical examination
4. Radiographic assessment (imaging review)
5. Functional outcome scores (PRO-PROM)
6. Implant surveillance
7. Complication assessment
8. Activity status clarification
9. Registry data submission
10. Patient satisfaction survey

**Data Elements**:
- Follow-up visit date
- Time interval since surgery
- Patient subjective report (pain, function, satisfaction)
- Physical exam findings (ROM, strength, swelling, effusion, stability)
- Limp/gait abnormality (if present)
- Radiographic findings (alignment, lucencies, osteolysis, implant position)
- Imaging type & date (X-ray series, MRI, CT)
- Implant surveillance findings (loosening signs, wear, subsidence)
- Functional outcome score (WOMAC, Harris Hip, Oxford, PROMIS, etc.)
- Comparison to baseline
- Complications identified (infection, loosening, dislocation, fracture)
- Revision surgery performed (if applicable)
- Registry data submitted (AJRR, national registry)
- Activity level (work status, sports participation)
- Patient satisfaction score
- Plan for next follow-up

---

## 2. DATABASE SCHEMA (15+ TABLES)

### Core Orthopedic Tables

**2.1 obgyn_surgical_procedures** (tracks all procedures, similar to OB/GYN pattern)
```sql
CREATE TABLE orthopedic_surgical_procedures (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID NOT NULL REFERENCES patient_specialty_episodes(id),
  procedure_name VARCHAR(255) NOT NULL, -- TKA, THA, ORIF, etc.
  cpt_code VARCHAR(10) NOT NULL, -- CPT code for billing
  laterality VARCHAR(10), -- Left, Right, Bilateral
  scheduled_date TIMESTAMP NOT NULL,
  actual_date TIMESTAMP,
  surgeon_id UUID REFERENCES practitioners(id),
  anesthesiologist_id UUID REFERENCES practitioners(id),
  surgical_approach VARCHAR(100), -- Anterior, posterior, anterolateral, etc.
  implant_selection TEXT, -- JSON: components/sizes selected
  duration_minutes INTEGER,
  estimated_blood_loss INTEGER,
  complications TEXT, -- JSON: complication list
  intraoperative_notes TEXT,
  procedure_status VARCHAR(20), -- Scheduled, Completed, Cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.2 orthopedic_preoperative_assessment**
```sql
CREATE TABLE orthopedic_preoperative_assessment (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  chief_complaint TEXT,
  pain_score_vas INTEGER CHECK (pain_score_vas BETWEEN 0 AND 10),
  functional_limitations TEXT, -- JSON: checklist of limitations
  medical_history JSONB, -- chronic conditions
  surgical_history JSONB, -- prior procedures
  current_medications JSONB, -- drug, dose, frequency
  allergies JSONB, -- drug, contrast, implant material
  social_history JSONB, -- smoking, alcohol, occupation
  physical_exam_findings JSONB, -- ROM, strength, neurovascular
  imaging_reviewed JSONB, -- imaging types reviewed, key findings
  laboratory_results JSONB, -- CBC, CMP, PT/INR
  medical_clearance VARCHAR(20), -- Cleared, Conditional, NotCleared
  clearance_provider UUID REFERENCES practitioners(id),
  asa_score INTEGER CHECK (asa_score BETWEEN 1 AND 5), -- ASA classification
  dvt_pe_risk_score DECIMAL(5,2), -- Caprini or similar
  informed_consent_date DATE,
  consent_documented BOOLEAN DEFAULT FALSE,
  optimized BOOLEAN DEFAULT FALSE, -- Pre-op optimization complete
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.3 orthopedic_implant_tracking** (AJRR compliance)
```sql
CREATE TABLE orthopedic_implant_tracking (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  component_type VARCHAR(50), -- Femoral, Tibial, Patellar, Acetabular, Humeral, etc.
  manufacturer VARCHAR(100) NOT NULL,
  model_number VARCHAR(100) NOT NULL,
  unique_device_identifier VARCHAR(50), -- UDI (GS1 format)
  lot_number VARCHAR(50),
  serial_number VARCHAR(50),
  size_specification JSONB, -- JSON: size dimensions specific to component
  fixation_method VARCHAR(50), -- Cementless, Cemented, Hybrid
  cement_type VARCHAR(50), -- If cemented
  placement_location TEXT, -- Anatomical location
  placement_date TIMESTAMP NOT NULL,
  expiration_date DATE,
  quantity INTEGER DEFAULT 1,
  status VARCHAR(20), -- In-situ, Explanted, Failed
  explanted_date DATE, -- If revision
  explant_reason VARCHAR(255),
  warranty_start_date DATE,
  warranty_end_date DATE,
  recall_status VARCHAR(20), -- Active, Recalled, None
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(procedure_id, component_type, placement_location)
);
```

**2.4 orthopedic_postoperative_orders**
```sql
CREATE TABLE orthopedic_postoperative_orders (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  weight_bearing_status VARCHAR(20), -- NWB, TDWB, TTWB, PWB, WBAT, FWB
  assistive_device VARCHAR(50), -- Crutches, Walker, Cane, None
  initial_rom_limits JSONB, -- Flexion/extension limits per joint
  dvt_prophylaxis_ordered JSONB, -- Mechanical & pharmacological type
  antibiotic_prophylaxis_ordered JSONB, -- Type, dose, duration
  pain_management_orders JSONB, -- Analgesics, NSAIDs, opioids
  immobilization_type VARCHAR(50), -- Sling, splint, cast, brace
  drain_management JSONB, -- Type, location, removal criteria
  infection_monitoring_plan TEXT,
  early_mobilization_protocol VARCHAR(100), -- AAOS guideline-based
  pt_ot_referral BOOLEAN DEFAULT TRUE,
  patient_education_provided BOOLEAN DEFAULT FALSE,
  discharge_criteria_met BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.5 orthopedic_rehabilitation_plan**
```sql
CREATE TABLE orthopedic_rehabilitation_plan (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID NOT NULL REFERENCES patient_specialty_episodes(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  referring_physician_id UUID REFERENCES practitioners(id),
  therapy_type VARCHAR(50), -- PT, OT, Both
  referral_date DATE NOT NULL,
  initial_evaluation_date DATE,
  expected_duration_weeks INTEGER,
  frequency_per_week INTEGER,
  short_term_goals TEXT, -- JSON: goal list with expected achievement dates
  long_term_goals TEXT, -- JSON: goal list
  treatment_plan JSONB, -- Interventions planned
  weight_bearing_restrictions JSONB, -- Progression phases
  rom_targets JSONB, -- Target ROM by phase
  functional_milestones TEXT, -- Milestones per timeline
  hep_prescribed BOOLEAN DEFAULT FALSE, -- Home exercise program
  hep_content TEXT, -- Prescribed exercises, frequency
  status VARCHAR(20), -- Active, Completed, Discharged, OnHold
  discharge_date DATE,
  discharge_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.6 orthopedic_pt_ot_session**
```sql
CREATE TABLE orthopedic_pt_ot_session (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  rehab_plan_id UUID NOT NULL REFERENCES orthopedic_rehabilitation_plan(id),
  session_date DATE NOT NULL,
  session_time_in TIMESTAMP,
  session_time_out TIMESTAMP,
  provider_id UUID NOT NULL REFERENCES practitioners(id), -- PT/OT provider
  session_type VARCHAR(50), -- PT, OT, Both
  interventions_performed JSONB, -- List of interventions
  dosage_parameters JSONB, -- Sets, reps, weight, duration
  patient_tolerance TEXT,
  pain_during_session INTEGER CHECK (pain_during_session BETWEEN 0 AND 10),
  pain_after_session INTEGER CHECK (pain_after_session BETWEEN 0 AND 10),
  progress_toward_goals TEXT,
  objective_measurements JSONB, -- ROM, strength, gait parameters
  adverse_events TEXT,
  modifications_made TEXT,
  hep_compliance TEXT, -- Assessment of home exercise adherence
  session_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.7 orthopedic_functional_assessment**
```sql
CREATE TABLE orthopedic_functional_assessment (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID NOT NULL REFERENCES patient_specialty_episodes(id),
  assessment_date DATE NOT NULL,
  assessment_type VARCHAR(50), -- WOMAC, Harris Hip, Oxford, DASH, ODI, Constant-Murley, Lysholm, SF-36, etc.
  score INTEGER,
  interpretation TEXT, -- Score interpretation/clinical significance
  comparison_to_baseline TEXT, -- Improvement, stable, decline
  components JSONB, -- Sub-scores for multi-component tools
  raw_responses JSONB, -- Patient answers stored for audit trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.8 orthopedic_imaging_documentation**
```sql
CREATE TABLE orthopedic_imaging_documentation (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID NOT NULL REFERENCES patient_specialty_episodes(id),
  procedure_id UUID REFERENCES orthopedic_surgical_procedures(id),
  imaging_type VARCHAR(50), -- X-ray, MRI, CT, DEXA, Ultrasound, Arthrography
  imaging_date DATE NOT NULL,
  imaging_time TIMESTAMP,
  ordering_provider_id UUID REFERENCES practitioners(id),
  imaging_location VARCHAR(100), -- Body part/joint
  views_obtained VARCHAR(255), -- AP, Lateral, Sunrise, etc.
  pacs_link TEXT, -- Link to PACS viewer
  radiology_report_id UUID, -- Link to radiology report
  key_findings TEXT, -- Summary of findings
  measurements JSONB, -- Quantitative measurements (leg length, joint space, alignment)
  implant_assessment JSONB, -- Position, alignment, signs of loosening/wear
  comparison_to_prior VARCHAR(255), -- Reference to prior imaging for progression
  quality_score VARCHAR(20), -- Diagnostic quality assessment
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.9 orthopedic_complication_tracking**
```sql
CREATE TABLE orthopedic_complication_tracking (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID NOT NULL REFERENCES patient_specialty_episodes(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  complication_type VARCHAR(50), -- Infection, DVT/PE, Dislocation, Fracture, Nerve injury, Vascular injury, Implant failure, etc.
  severity VARCHAR(20), -- Mild, Moderate, Severe
  onset_date DATE NOT NULL,
  onset_timing VARCHAR(50), -- Intraoperative, Immediate, Early (0-6wks), Late (>6wks)
  clinical_presentation TEXT,
  diagnostic_tests JSONB, -- Tests performed, results
  management_plan TEXT,
  intervention_required BOOLEAN,
  intervention_type VARCHAR(100), -- Antibiotics, revision surgery, etc.
  intervention_date DATE,
  resolution_date DATE,
  outcome VARCHAR(50), -- Resolved, Ongoing, Referred
  status VARCHAR(20), -- Active, Resolved, Closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.10 orthopedic_infection_tracking**
```sql
CREATE TABLE orthopedic_infection_tracking (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  complication_id UUID NOT NULL REFERENCES orthopedic_complication_tracking(id),
  infection_type VARCHAR(50), -- Superficial, Deep, PJI (Prosthetic Joint Infection)
  classification VARCHAR(50), -- Early, Delayed, Acute hematogenous
  cierny_mader_grade VARCHAR(10), -- If osteomyelitis: IA, IB, IIA, etc.
  mcpherson_grade VARCHAR(10), -- For PJI
  clinical_symptoms JSONB, -- Fever, pain, drainage, sinus tract
  laboratory_findings JSONB, -- ESR, CRP, WBC, culture results
  microorganism TEXT, -- Organism identified (if culture positive)
  organism_susceptibility JSONB, -- Antibiotic sensitivities
  imaging_findings TEXT, -- Radiographic signs
  antibiotic_therapy JSONB, -- Medications, doses, duration
  surgical_management TEXT, -- DAIR, debridement, revision, etc.
  treatment_outcome VARCHAR(50), -- Cured, Failed, Ongoing
  pji_diagnosis_confirmed BOOLEAN DEFAULT FALSE, -- MSIS 2018 criteria met
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.11 orthopedic_dvt_prophylaxis**
```sql
CREATE TABLE orthopedic_dvt_prophylaxis (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  risk_assessment_date DATE NOT NULL,
  caprini_risk_score INTEGER,
  risk_category VARCHAR(20), -- Low, Moderate, High, Very High
  bleeding_risk_assessment TEXT,
  mechanical_prophylaxis JSONB, -- Early mobilization, GCS, IPCDs, venous foot pump
  pharmacological_prophylaxis JSONB, -- Medication, dose, start/end dates
  compliance_assessment TEXT,
  screening_test_ordered VARCHAR(50), -- Ultrasound, etc. if symptomatic
  dvt_diagnosed BOOLEAN DEFAULT FALSE,
  pe_diagnosed BOOLEAN DEFAULT FALSE,
  treatment_plan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.12 orthopedic_long_term_followup**
```sql
CREATE TABLE orthopedic_long_term_followup (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID NOT NULL REFERENCES patient_specialty_episodes(id),
  procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  followup_date DATE NOT NULL,
  time_interval_months INTEGER, -- Months since surgery
  provider_id UUID REFERENCES practitioners(id),
  subjective_report TEXT, -- Pain, function, satisfaction
  pain_vas INTEGER CHECK (pain_vas BETWEEN 0 AND 10),
  physical_exam_findings JSONB, -- ROM, strength, swelling, effusion
  gait_assessment TEXT,
  imaging_type VARCHAR(50), -- X-ray, MRI, CT
  imaging_reviewed BOOLEAN DEFAULT FALSE,
  implant_surveillance_findings JSONB, -- Loosening, wear, subsidence
  functional_outcome_score INTEGER, -- Associated with assessment table
  functional_outcome_type VARCHAR(50), -- WOMAC, Harris Hip, etc.
  complications_new JSONB, -- New complications identified
  activity_level VARCHAR(50), -- Work status, sports participation
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  revision_performed BOOLEAN DEFAULT FALSE,
  revision_date DATE,
  registry_submitted BOOLEAN DEFAULT FALSE,
  registry_name VARCHAR(100), -- AJRR, national registry
  registry_id VARCHAR(100), -- Unique registry identifier
  next_followup_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.13 orthopedic_range_of_motion**
```sql
CREATE TABLE orthopedic_range_of_motion (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  assessment_date DATE NOT NULL,
  joint VARCHAR(50), -- Shoulder, Elbow, Wrist, Hip, Knee, Ankle, Spine
  joint_side VARCHAR(10), -- Left, Right, Bilateral
  measurement_type VARCHAR(50), -- Active, Passive, Assisted
  examiner_id UUID REFERENCES practitioners(id),
  flexion_degrees INTEGER,
  extension_degrees INTEGER,
  abduction_degrees INTEGER,
  adduction_degrees INTEGER,
  internal_rotation_degrees INTEGER,
  external_rotation_degrees INTEGER,
  other_planes JSONB, -- Additional movements specific to joint
  normative_baseline JSONB, -- Expected normal values for comparison
  comparison_to_prior TEXT, -- Improvement/decline from previous assessment
  limitations TEXT, -- End-feel, pain, restrictions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.14 orthopedic_strength_assessment**
```sql
CREATE TABLE orthopedic_strength_assessment (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  assessment_date DATE NOT NULL,
  muscle_group VARCHAR(100), -- Quadriceps, Hamstring, Hip abductors, etc.
  joint_or_region VARCHAR(50), -- Knee, Hip, Shoulder, etc.
  side VARCHAR(10), -- Left, Right, Bilateral
  strength_grade INTEGER CHECK (strength_grade BETWEEN 0 AND 5), -- 0=Paralyzed, 5=Normal
  manual_muscle_test_method VARCHAR(50), -- Standard MMT
  examiner_id UUID REFERENCES practitioners(id),
  pain_with_testing BOOLEAN DEFAULT FALSE,
  comparison_to_contralateral TEXT, -- Difference from opposite side
  comparison_to_prior TEXT, -- Change over time
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.15 orthopedic_neurovascular_assessment**
```sql
CREATE TABLE orthopedic_neurovascular_assessment (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  assessment_date DATE NOT NULL,
  extremity VARCHAR(50), -- Upper, Lower (left/right)
  pulse_assessment JSONB, -- Radial, Brachial, Femoral, Popliteal, Dorsalis pedis, Posterior tibial
  sensory_assessment JSONB, -- Sensation by nerve distribution (intact/diminished/absent)
  motor_assessment JSONB, -- Motor function by nerve distribution
  temperature TEXT, -- Warm, cool, cold
  color_assessment TEXT, -- Normal, pale, cyanotic, flushed
  capillary_refill INTEGER, -- Seconds
  edema_present BOOLEAN DEFAULT FALSE,
  edema_severity VARCHAR(20), -- Mild, Moderate, Severe (if present)
  compartment_syndrome_signs BOOLEAN DEFAULT FALSE,
  hard_signs_present BOOLEAN DEFAULT FALSE, -- Pulsatile bleeding, thrill, etc.
  soft_signs_present BOOLEAN DEFAULT FALSE, -- Proximity, hematoma, bleeding history
  vascular_status VARCHAR(50), -- Intact, Compromised, Requires intervention
  intervention_required BOOLEAN DEFAULT FALSE,
  referral_to_vascular BOOLEAN DEFAULT FALSE,
  documented_by_id UUID REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.16 orthopedic_revision_tracking**
```sql
CREATE TABLE orthopedic_revision_tracking (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  original_procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  revision_procedure_id UUID NOT NULL REFERENCES orthopedic_surgical_procedures(id),
  reason_for_revision VARCHAR(255), -- Infection, loosening, dislocation, fracture, wear, etc.
  time_to_revision_months INTEGER, -- Months between original and revision
  explanted_components JSONB, -- Components removed, condition
  revised_components JSONB, -- New components implanted
  surgical_complexity VARCHAR(50), -- Simple, Moderate, Complex
  intraoperative_complications TEXT,
  new_implant_tracking_ids TEXT, -- JSON array of new implant IDs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. ASSESSMENT TOOLS & SCORING SYSTEMS

### 3.1 Range of Motion (ROM) Assessment

**Measurement Method**: Goniometer (universal or finger-based)

**Normative Values by Joint**:

| Joint | Movement | Normal ROM (degrees) |
|-------|----------|----------------------|
| Shoulder | Flexion | 0-180 |
| Shoulder | Abduction | 0-180 |
| Shoulder | Internal rotation | 0-90 |
| Shoulder | External rotation | 0-90 |
| Elbow | Flexion | 0-145 |
| Elbow | Supination/Pronation | 0-90 / 0-80 |
| Hip | Flexion | 0-120 |
| Hip | Abduction | 0-45 |
| Hip | Internal rotation | 0-40 |
| Hip | External rotation | 0-45 |
| Knee | Flexion | 0-135 |
| Knee | Extension | 0 (or slight hyperext -5°) |
| Ankle | Dorsiflexion | 0-20 |
| Ankle | Plantarflexion | 0-50 |

**Database Recording**: Store actual degrees in orthopedic_range_of_motion table. Auto-compare to normative baseline.

---

### 3.2 Pain Assessment Scales

**VAS (Visual Analog Scale)**
- Scale: 0-10 (0 = no pain, 10 = worst pain)
- Field type: Integer (0-10)
- Database: pain_score_vas in preoperative_assessment, pain_vas in followup

**NRS (Numeric Rating Scale)**
- Equivalent to VAS
- Patient verbally rates pain 0-10

---

### 3.3 Functional Outcome Scores

#### WOMAC (Western Ontario McMaster Osteoarthritis Index) - Hip/Knee OA

**Components**:
- Pain subscale: 5 items (0-4 each) = 0-20 total
- Stiffness subscale: 2 items (0-4 each) = 0-8 total
- Function subscale: 17 items (0-4 each) = 0-68 total
- **Total WOMAC**: 0-96 (lower = better function)

**Interpretation**:
- 0-20: Severe OA
- 21-40: Moderate-severe OA
- 41-60: Moderate OA
- 61-80: Mild OA
- 81-96: Minimal OA

**Database**: Store total score & sub-scores in orthopedic_functional_assessment

#### Harris Hip Score (HHS)

**Components** (0-100 scale):
- Pain (0-44 points)
- Function (0-47 points)
- Deformity (0-4 points)
- Range of motion (0-5 points)

**Interpretation**:
- 90-100: Excellent
- 80-89: Good
- 70-79: Fair
- <70: Poor

**Outcome-Specific Version (Harris Hip Score-New)**: Updated version more responsive to change.

#### Oxford Hip & Knee Scores

**Oxford Hip Score**: 12 items, 1-5 Likert scale, total 12-60 (lower = better outcome)
**Oxford Knee Score**: 12 items, 1-5 Likert scale, total 12-60 (lower = better outcome)

**Interpretation**:
- 12-19: Poor
- 20-29: Fair
- 30-39: Good
- 40-48: Excellent

#### DASH (Disabilities of the Arm, Shoulder and Hand)

**Structure**: 30-item questionnaire, 1-5 Likert scale
- Total score: 0-100 (lower = better function)

**Interpretation**:
- 0-20: Minimal disability
- 21-40: Mild disability
- 41-60: Moderate disability
- 61-80: Severe disability
- 81-100: Very severe disability

**Optional modules**: For work/sports (additional 4 questions each)

#### Oswestry Disability Index (ODI) - Spine

**Structure**: 10 items, 6 options per item (0-5 points each)
- Total: 0-50 points
- **Percentage disability**: (Total points / 50) × 100

**Interpretation**:
- 0-20%: Minimal disability
- 21-40%: Moderate disability
- 41-60%: Severe disability
- 61-80%: Crippled
- 81-100%: Bedbound or exaggerating symptoms

#### Constant-Murley Score - Shoulder

**Components**:
- Pain (15 points)
- Activities of daily living (20 points)
- Range of motion - flexion, abduction, rotation (40 points)
- Strength (25 points)
- **Total**: 0-100 (higher = better)

**Interpretation**:
- 90-100: Normal
- 80-89: Good
- 70-79: Satisfactory
- <70: Poor

#### Lysholm Score - Knee

**Structure**: 8 items covering pain, instability, locking, swelling, limp, stair climbing, squatting, need for support
- Total: 0-100 (higher = better)

**Interpretation**:
- 95-100: Excellent
- 84-93: Good
- 65-83: Fair
- <65: Poor

#### SF-36 / SF-12 (Quality of Life)

**SF-36**: 36 items across 8 domains (physical function, role-physical, body pain, general health, vitality, social function, role-emotional, mental health)
- Scored 0-100 per domain (higher = better)

**SF-12**: Shortened version (12 items, 2 items per domain)

---

### 3.4 Muscle Strength Grading

**Manual Muscle Test (MMT) 0-5 Scale**:
- **0**: Paralyzed - No muscle contraction visible
- **1**: Trace - Visible muscle contraction but no movement
- **2**: Poor - Movement possible with gravity eliminated
- **3**: Fair - Movement against gravity, no resistance
- **4**: Good - Movement against gravity + some resistance
- **5**: Normal - Movement against gravity + full resistance

**Database**: Store grade (0-5) per muscle group in orthopedic_strength_assessment

---

### 3.5 Neurovascular Examination

**Components to Document**:
1. **Pulses**: Present (P) or Absent (A) - Document for each major artery
   - Upper extremity: Radial, Brachial, Axillary
   - Lower extremity: Femoral, Popliteal, Dorsalis pedis, Posterior tibial

2. **Sensation**: Intact (I), Diminished (D), or Absent (A) - By nerve distribution
   - Upper extremity: Radial, Median, Ulnar nerve distributions
   - Lower extremity: Femoral, Sciatic (tibial & peroneal), Saphenous distributions

3. **Motor Function**: By nerve distribution (same as sensation)

4. **Capillary Refill**: <2 seconds normal, >2 seconds suggests compromise

5. **Temperature & Color**: Warm/cool, normal/pale/cyanotic

6. **Edema**: Absent, mild, moderate, severe (measure girth if moderate/severe)

7. **Hard Signs of Vascular Compromise** (require immediate intervention):
   - Pulsatile bleeding
   - Expanding hematoma
   - Palpable thrill or audible bruit
   - Limb ischemia signs (pulselessness, pain, pallor, paresthesia, paralysis, poikilothermia)

8. **Soft Signs** (warrant further investigation):
   - History of arterial bleeding
   - Proximity to major artery
   - Small non-pulsatile hematoma
   - Neurological deficit near artery

**Database**: Store as JSONB in orthopedic_neurovascular_assessment with structured fields per nerve/artery.

---

## 4. IMPLANT REGISTRY COMPLIANCE (AJRR)

### 4.1 AJRR Data Requirements

**Level 1 Data** (Minimum):
- Patient demographics (name, DOB, sex)
- Procedure details (date, CPT code, laterality)
- Surgeon identifier
- Implant details (UDI, manufacturer, model)

**Level 2 Data** (Enhanced):
- Implant size & fixation type
- Approach/technique
- Comorbidities
- BMI, smoking status

**Level 3 Data** (Comprehensive):
- Detailed outcomes (ROM, functional scores)
- Complications within 30 days
- Implant positioning radiographs
- Long-term follow-up data (1, 2, 5, 10 years)

### 4.2 Unique Device Identifier (UDI)

**Format**: FDA-mandated GS1 standard

**Components**:
- **DI (Device Identifier)**: Fixed portion (manufacturer + device model)
- **PI (Production Identifier)**: Variable portion
  - Lot/Batch number
  - Serial number
  - Expiration date
  - Date of manufacture

**EHR Storage**: Store in orthopedic_implant_tracking.unique_device_identifier field

### 4.3 Data Submission

**Frequency**: Typically annually or per organizational protocol
**Method**: Custom SFTP reports or API integration
**Fields Required**:
- All implant data from orthopedic_implant_tracking
- Procedure data from orthopedic_surgical_procedures
- Outcome data from orthopedic_long_term_followup (annually)
- Complication data from orthopedic_complication_tracking

**Privacy**: De-identified (patient name, contact removed; assigned AJRR patient ID)

---

## 5. CLINICAL DECISION SUPPORT RULES

### 5.1 DVT/PE Prophylaxis Rules

**Caprini Risk Score Logic**:
```
IF procedure = major orthopedic (TKA, THA, HFS) THEN add 5 points
IF age ≥60 THEN add points based on decade
IF BMI ≥25 THEN add 1 point
IF acute myocardial infarction THEN add 1 point
IF congestive heart failure THEN add 1 point
IF COPD THEN add 1 point
IF paralysis THEN add 2 points
IF cancer THEN add 2 points
IF major surgery (>45 min) THEN add 2 points
IF laparoscopic surgery THEN add 1 point
IF history of DVT/PE THEN add 3 points
IF familial thrombophilia THEN add 3 points
IF varicose veins THEN add 1 point
IF inflammatory bowel disease THEN add 1 point
IF Sweet syndrome THEN add 1 point
IF pregnancy/postpartum THEN add 3 points
IF oral contraceptives/hormone therapy THEN add 1 point
IF TOTAL ≥4 = HIGH RISK → RECOMMEND pharmacological prophylaxis
IF TOTAL 2-3 = MODERATE RISK → CONSIDER mechanical prophylaxis
IF TOTAL 0-1 = LOW RISK → Early mobilization sufficient
```

**Alert Rule**:
```
IF procedure_type IN ('TKA', 'THA', 'HFS', 'Complex orthopedic')
  AND no_dvt_prophylaxis_ordered
  AND NOT contraindicated (e.g., bleeding disorder)
THEN trigger alert: "DVT prophylaxis not prescribed - Review Caprini score and AAOS guidelines"
```

### 5.2 Infection Risk Assessment Rules

**Pre-Op Infection Risk**:
```
IF diabetes AND uncontrolled (HbA1c >7.5) THEN flag HIGH RISK
IF immunosuppression (corticosteroids, biologics) THEN flag HIGH RISK
IF active infection (UTI, pneumonia) at time of surgery THEN delay surgery
IF obesity (BMI ≥40) THEN flag MODERATE RISK
IF age ≥70 THEN flag MODERATE RISK
IF multiple comorbidities THEN flag risk level proportionally
```

**Alert Rule**:
```
IF pre_op_infection_risk = 'HIGH' AND antibiotic_prophylaxis_NOT_optimized THEN
  trigger alert: "High infection risk patient - Verify antibiotic prophylaxis timing (within 60 min of incision)"
```

### 5.3 Implant Failure Surveillance Rules

**Post-Implant Monitoring**:
```
IF implant_in_situ AND time_since_surgery > 1 year THEN
  at each follow-up: evaluate for:
    - Progressive radiolucent lines (>2mm width)
    - Implant migration/subsidence
    - Osteolysis patterns
    - Functional decline
    - Pain increase
    IF any above finding THEN flag: "Possible aseptic loosening - Consider revision"
```

**Alert Rule**:
```
IF imaging shows progressive lucency OR subsidence >5mm
  AND patient symptomatic
THEN trigger alert: "Implant loosening suspected - Schedule revision surgery discussion"
```

### 5.4 ROM/Functional Deficit Rules

**Post-Operative ROM Monitoring**:
```
IF procedure = TKA AND time_since_surgery = 6 weeks AND knee_flexion < 90° THEN
  flag: "ROM progress lag - Intensify PT or evaluate for stiffness"
IF procedure = THA AND time_since_surgery = 12 weeks AND hip_flexion < 110° THEN
  flag: "ROM progress lag - Intensify PT or evaluate for contracture"
IF procedure = Rotator cuff AND time_since_surgery = 8 weeks AND passive_external_rot < 45° THEN
  flag: "ROM progress lag - Verify passive ROM protocol adherence"
```

### 5.5 Complication Detection Rules

**Infection Surveillance**:
```
IF pain_vas > baseline_pain + 3 points
  AND wound_erythema OR drainage
  AND fever (temp >38°C)
  AND elevated CRP/ESR
THEN trigger alert: "Possible surgical site infection - Obtain cultures, consider antibiotics"
```

**Dislocation Monitoring** (post-hip replacement):
```
IF history_of_dislocation THEN enforce hip precautions (flexion <90°, adduction >0°, internal rotation avoided)
IF patient_reports_feeling_of_instability AND posterior_approach THEN
  flag: "Recurrent dislocation risk - Consider bracing or revision"
```

---

## 6. PROCEDURE-SPECIFIC WORKFLOWS

### 6.1 Total Knee Arthroplasty (TKA)

**Pre-Op**:
- Leg length discrepancy assessment
- Malalignment documentation (varus/valgus)
- Chondral damage grading
- ROM baseline

**Intraoperative**:
- Bone cuts (distal femoral, proximal tibial, patellar)
- Component sizing & positioning
- Alignment verification (mechanical axis, kinematic alignment options)
- Ligament balancing assessment

**Post-Op**:
- Weight-bearing progression: Touch-down → 50% → 100% (0-6 weeks typically)
- ROM progression: 0-90° flexion at 2 weeks, 0-110° by 6 weeks
- Complications: Stiffness (ROM <90° at 8 weeks), infection, DVT

**Rehabilitation Timeline**:
- Weeks 0-4: Protected weight-bearing, ROM exercises, swelling control
- Weeks 4-8: Progressive weight-bearing, functional training
- Weeks 8-12: Return to ADLs, light activity
- Months 3-6: Return to sport/high-impact activities (if goals include)

---

### 6.2 Total Hip Arthroplasty (THA)

**Pre-Op**:
- Hip osteoarthritis severity
- Femoral head diameter assessment
- Acetabular bone stock evaluation

**Intraoperative**:
- Surgical approach (anterior, posterolateral, anterolateral)
- Cup positioning (45° inclination, 20-30° anteversion)
- Stem positioning (proper varus/valgus alignment)
- Dislocation precautions per approach

**Post-Op**:
- Weight-bearing progression: Same as TKA (0-6 weeks)
- Hip precautions (approach-dependent):
  - Posterior approach: No flexion >90°, no adduction past midline, no internal rotation
  - Anterior approach: Fewer restrictions, focus on external rotation limit
- ROM: Hip flexion goal 110-120° by 8-12 weeks

**Rehabilitation Timeline**:
- Weeks 0-6: Protected weight-bearing, hip precautions, ROM within limits
- Weeks 6-12: Progressive weight-bearing removal, precautions relaxed, functional strengthening
- Months 3-6: Return to ADLs, driving, light recreational activity

---

### 6.3 Total Shoulder Arthroplasty (TSA)

**Pre-Op**:
- Rotator cuff assessment (repair needed? intact?)
- Bone loss evaluation (glenoid, humeral head)

**Intraoperative**:
- Humeral head replacement vs. reverse shoulder arthroplasty (RSA)
- Glenoid bone loss classification (Walch, Bony Bankart)
- Humeral head size & positioning

**Post-Op**:
- **Anatomical TSA**: ROM protection (sling 4-6 weeks)
- **Reverse TSA**: Extended protection (sling 6-8 weeks), specific restrictions on active motion
- Pain management (brachial plexus blocks, multimodal analgesia)
- Early passive ROM exercises (if pain controlled)

**Rehabilitation Timeline**:
- Weeks 0-6: Passive ROM, sling weaning, scapular stabilization
- Weeks 6-12: Active-assisted ROM progression, rotator cuff strengthening
- Months 3-6: Return to functional activities, progressive strengthening

---

### 6.4 ACL Reconstruction

**Pre-Op**:
- Associated meniscal tears (repair vs. meniscectomy)
- Cartilage damage assessment
- Associated ligament injuries (PCL, collateral ligaments)

**Intraoperative**:
- Graft choice (autograft: bone-patellar tendon-bone, hamstring; allograft)
- Tunnel placement (anatomic vs. isometric)
- Graft tensioning & fixation

**Post-Op**:
- Immediate ROM (0-90° flexion by end of week 1)
- Weight-bearing progression: Immediate toe-touch, progress per protocol
- Brace/sleeve: 6 weeks for swelling control

**Rehabilitation Timeline**:
- Phase 1 (Weeks 0-6): Control swelling, restore ROM, activate VMO
- Phase 2 (Weeks 6-12): Strength development, proprioceptive training
- Phase 3 (Months 3-6): Return to running, cutting, sport-specific training
- Return to sport: 6 months (conservative) to 9-12 months (high-demand athletes)

---

### 6.5 Rotator Cuff Repair

**Pre-Op**:
- Tear size & location (supraspinatus, infraspinatus, subscapularis)
- Chronicity (acute vs. chronic)
- Associated pathology (acromioplasty needed)

**Intraoperative**:
- Repair technique (single-row, double-row, transosseous)
- Anchor placement & number
- Suture quality
- Rotator cuff integrity confirmation

**Post-Op**:
- Immobilization (sling 4-6 weeks for initial protection)
- Passive ROM (per protocol; often restricted in Phase 1)
- Avoid active motion first 4-6 weeks (risk of re-tear)

**Rehabilitation Timeline**:
- Phase 1 (Weeks 0-6): Passive ROM, sling weaning by week 4-6, pain control
- Phase 2 (Weeks 6-12): Active-assisted ROM, gentle isometric strengthening
- Phase 3 (Months 3-6): Progressive active ROM, rotator cuff strengthening
- Return to activity: 3-6 months (light activity), 6-12 months (overhead activity)

---

### 6.6 Spine Surgery (Fusion)

**Pre-Op**:
- Myelopathy/radiculopathy severity
- Instability confirmation (flexion-extension X-rays, imaging)
- Fusion level & technique selection

**Intraoperative**:
- Decompression (laminectomy, foraminotomy)
- Fusion technique (anterior, posterior, combined)
- Instrumentation (plates, screws, rods)
- Bone graft placement

**Post-Op**:
- Brace/orthosis: 6-12 weeks (stability dependent)
- Weight-bearing: Full immediate (stabilized by instrumentation)
- ROM: Limited initially; gradual progression after brace weaning

**Rehabilitation Timeline**:
- Weeks 0-6: Brace wearing, gentle mobility, pain control, no heavy lifting
- Weeks 6-12: Brace weaning, progressive strengthening, functional training
- Months 3-6: Return to ADLs, work-specific training, light recreational activity

**Precautions**:
- No bending, twisting, or lifting >10 lbs for 6-12 weeks
- Back trauma avoidance
- Long-term fusion monitoring (adjacent segment degeneration risk)

---

## 7. INTEGRATION POINTS

### 7.1 PACS Imaging Integration
- Link to DICOM viewers for radiographic assessment
- Automated import of imaging reports from radiology system
- Timestamp imaging with procedure/follow-up dates

### 7.2 PT/OT Scheduling System
- Automated referral generation from surgical scheduling
- Availability matching (patient → therapist → location)
- Session notifications & rescheduling alerts

### 7.3 Device Registry Integration
- Automated AJRR data export (annual submission)
- Recall alert system (if device recalled, patient flag + notification)
- Warranty tracking & claim management

### 7.4 Patient Portal Features
- Discharge instructions & educational materials
- Home exercise program (video-based, printable)
- Pain/ROM tracking (patient-reported data)
- Appointment scheduling & reminders

### 7.5 Rule Engine Integration
- DVT prophylaxis alerts (based on Caprini score)
- ROM/Functional outcome reminders (at scheduled intervals)
- Complication detection (pain/swelling/fever triggers)
- Implant surveillance alerts (loosening suspicion)

---

## 8. UNRESOLVED QUESTIONS

1. **Revision Surgery Cost Tracking**: How to integrate revision procedure costs with insurance for implant failure liability?
2. **International Registry Participation**: Beyond AJRR, should the EHR support integration with international registries (ISAR, ICOR)?
3. **Real-Time Patient Monitoring**: Should ROM/pain data auto-populate from wearable devices (accelerometers, pressure sensors)?
4. **AI-Based Predictive Analytics**: Timeline for implementing predictive models for implant failure risk?
5. **Insurance Pre-Authorization**: Should pre-operative assessment trigger automatic pre-auth requests to insurance?
6. **Prosthetic Patella Replacement Logic**: Patellar resurfacing decision logic for TKA (size, BMI, age criteria)?
7. **Osteolysis Quantification**: Automated measurement tools for osteolysis volume/progression on serial CT scans?
8. **Specialist Referral Automation**: Criteria for automatic referral to vascular/orthopedic specialists based on neurovascular exam findings?

---

## IMPLEMENTATION PRIORITY

**Phase 1 (MVP - Weeks 1-3)**:
- Tables 2.1-2.7 (core procedures, assessment, implants, post-op, rehab)
- Assessment calculators (WOMAC, ROM, strength, pain)
- Pre-op assessment form & post-op orders
- Basic implant tracking (AJRR Level 1)

**Phase 2 (Weeks 4-6)**:
- Tables 2.8-2.10 (imaging, complications, infection, DVT)
- DVT prophylaxis alerts
- Infection risk assessment rules
- Long-term follow-up documentation

**Phase 3 (Weeks 7-9)**:
- Tables 2.11-2.16 (neurovascular, revision, detailed assessments)
- Implant failure surveillance rules
- ROM/functional deficit alerts
- PACS integration

**Phase 4 (Weeks 10+)**:
- AJRR automated data export
- Device registry recall alerts
- PT/OT scheduling integration
- Patient portal with HEP delivery

---

**End of Research Report**

