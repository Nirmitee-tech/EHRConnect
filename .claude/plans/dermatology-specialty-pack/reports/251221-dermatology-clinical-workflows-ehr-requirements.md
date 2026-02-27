# Research Report: Dermatology Clinical Workflows & EHR Requirements

**Report Generated**: December 21, 2025
**Research Scope**: Comprehensive dermatology specialty workflows for EHR implementation
**Target**: Building specialty pack similar to OB/GYN implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Research Methodology](#research-methodology)
3. [Clinical Workflow Phases](#clinical-workflow-phases)
4. [Lesion Assessment & Documentation](#lesion-assessment--documentation)
5. [Assessment & Scoring Tools](#assessment--scoring-tools)
6. [Biopsy Tracking Workflows](#biopsy-tracking-workflows)
7. [Dermoscopy & Photo Management](#dermoscopy--photo-management)
8. [Disease-Specific Staging](#disease-specific-staging)
9. [Dermatology Procedures](#dermatology-procedures)
10. [Database Schema Design](#database-schema-design)
11. [Clinical Decision Support Rules](#clinical-decision-support-rules)
12. [Implementation Recommendations](#implementation-recommendations)
13. [Unresolved Questions](#unresolved-questions)

---

## Executive Summary

Dermatology specialty pack requires comprehensive tracking of lesions, biopsies, procedures, and disease-specific assessments. Key clinical workflows differ from OB/GYN: lesion photography with HIPAA compliance, standardized assessment tools (PASI, SCORAD, DLQI, BSA), biopsy specimen tracking with pathology result management, and TNM staging for skin cancers. System must support teledermatology, automated assessment calculations, and clinical decision support for suspicious lesion alerts. Research identified 20+ core tables with emphasis on lesion management, procedural tracking, and outcome measurement.

---

## Research Methodology

**Sources Consulted**: 25+ authoritative sources
**Date Range**: 2018-2025 (emphasis on 2024-2025)
**Key Sources**:
- Academic journals (PMC, PubMed, Frontiers in Medicine)
- Professional standards (American Academy of Dermatology)
- Clinical guidelines (Mayo Clinic, UCSF Medical Affairs)
- EHR solution reviews (ModMed, EMA Dermatology)
- Compliance standards (HIPAA Journal, Compliancy Group)

**Search Terms Used**:
- "dermatology clinical workflows EHR documentation standards ABCDE lesion"
- "dermatology assessment tools PASI SCORAD DLQI BSA calculations"
- "skin biopsy tracking workflow order result follow-up"
- "dermoscopy documentation photo management HIPAA teledermatology"
- "skin cancer TNM staging acne grading IGA Leeds classification"

---

## Clinical Workflow Phases

### Phase 1: Consultation & Intake

**Activities**:
- Patient registration with dermatology-specific history
- Chief complaint documentation
- Duration and symptom progression tracking
- Prior treatment history
- Medication review (especially photosensitizing drugs)
- Allergy documentation (contact dermatitis triggers)

**Key Data Points**:
- Lesion onset date
- Symptoms (pruritus, pain, bleeding)
- Prior dermatologic diagnoses
- Family history of skin cancer
- Sun exposure history (Fitzpatrick scale)
- Occupational exposures

### Phase 2: Visual Assessment & Documentation

**Activities**:
- Physical examination with standardized body area mapping
- Lesion identification and photography
- Dermoscopic examination (if indicated)
- Disease severity assessment using appropriate scales
- Clinical differential diagnosis

**Critical Outputs**:
- Body map with lesion locations (mole mapping)
- High-quality clinical photographs
- Dermoscopic images (with magnification documented)
- Assessment tool scores (PASI/SCORAD/DLQI/BSA)
- Clinical impression

### Phase 3: Decision & Planning

**Activities**:
- Clinical decision support consultation
- Determination if biopsy needed
- Treatment plan selection
- Patient education delivery
- Consent capture (if procedures planned)

**Decision Points**:
- ABCDE rule evaluation for melanoma risk
- Ugly duckling sign presence
- Suspicious lesion criteria met
- Biopsy necessity determination
- Treatment modality selection

### Phase 4: Intervention & Procedure

**Activities**:
- Lesion biopsy (punch, shave, excisional)
- Surgical procedures (Mohs micrographic surgery, excision)
- Therapeutic procedures (laser, cryotherapy, chemical peels)
- Topical/systemic treatment initiation
- Procedural documentation and specimen handling

**Tracking Requirements**:
- Procedure type and technique
- Specimen identification and handling
- Anesthesia used
- Complications documented
- Immediate outcomes

### Phase 5: Result Management & Follow-Up

**Activities**:
- Pathology result notification (with patient preference)
- Result interpretation and clinical correlation
- Additional testing if needed
- Treatment plan modification
- Follow-up scheduling
- Long-term surveillance planning

**Communication Requirements**:
- Patient notification method (phone, in-person, portal)
- Referring provider notification
- Documentation of discussion
- Consent for any additional procedures

---

## Lesion Assessment & Documentation

### ABCDE Rule Framework

**Components** (with EHR field specifications):

| Component | Clinical Definition | EHR Field | Validation |
|-----------|-------------------|-----------|-----------|
| **Asymmetry** | Asymmetric shape | `asymmetry_grade` (0-3) | 0=None, 1=Slight, 2=Moderate, 3=Severe |
| **Border** | Irregular borders | `border_irregularity` (0-3) | 0=Regular, 1=Slightly, 2=Moderately, 3=Highly irregular |
| **Color** | Multiple colors present | `color_variation_count` (1-6) | Count of distinct colors: brown, black, tan, red, white, blue |
| **Diameter** | Size ≥6mm | `diameter_mm` (integer) | Range: 1-100mm, alert if ≥6mm |
| **Evolving** | Recent change (new or changing) | `evolving_status` (bool) | Track change timeline |

**Ugly Duckling Sign**:
- `ugly_duckling_present` (boolean) - Lesion that looks different from surrounding nevi
- `stands_out_description` (text) - Clinical description of difference

**Score Calculation**:
```
abcde_risk_score = asymmetry_grade + border_irregularity + (color_variation_count * 0.5) +
                   (diameter_mm >= 6 ? 1 : 0) + (evolving_status ? 1 : 0)
Alert if score >= 4 (suspicious for melanoma)
```

### Mole Mapping System

**Body Map Zones** (standard anatomical divisions):
- Head/Neck: anterior, posterior
- Chest: anterior, posterior
- Back: upper, lower
- Abdomen: anterior
- Arms: right, left (upper, lower, dorsal, volar)
- Hands: right, left (dorsal, palmar)
- Legs: right, left (anterior, posterior)
- Feet: right, left (dorsal, plantar)
- Genitalia (if applicable)
- Nails (if applicable)

**Lesion Registry Entry**:
```
dermatology_lesions table fields:
- lesion_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- body_zone (VARCHAR) - anatomical location
- lesion_number (INTEGER) - tracking ID (e.g., "Lesion 15")
- description (TEXT) - clinical appearance
- size_mm (DECIMAL) - longest diameter
- abcde_score (DECIMAL)
- ugly_duckling_present (BOOLEAN)
- dermoscopy_performed (BOOLEAN)
- photo_count (INTEGER)
- biopsy_status (VARCHAR) - 'not_indicated', 'recommended', 'completed'
- biopsy_date (DATE)
- specimen_id (VARCHAR) - references pathology
- management_plan (TEXT)
- follow_up_interval_days (INTEGER)
- next_assessment_date (DATE)
- status (VARCHAR) - 'new', 'stable', 'evolving', 'treated'
```

---

## Assessment & Scoring Tools

### 1. PASI (Psoriasis Area and Severity Index)

**Purpose**: Quantify psoriasis severity
**Score Range**: 0-72 (higher = more severe)
**Clinical Interpretation**:
- 0-1: Minimal
- 2-10: Mild
- 11-20: Moderate
- 21-30: Moderate-Severe
- >30: Severe

**Components**:
- Redness severity (0-4)
- Thickness severity (0-4)
- Scaliness severity (0-4)
- Area of body involvement (head, trunk, upper limbs, lower limbs)
- Area involvement percentage per region (0-6 scale)

**Database Fields**:
```
dermatology_pasi_assessments:
- assessment_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- assessment_date (DATE)
- head_redness (0-4), head_thickness (0-4), head_scaliness (0-4), head_area (0-6)
- trunk_redness (0-4), trunk_thickness (0-4), trunk_scaliness (0-4), trunk_area (0-6)
- upper_limb_redness (0-4), upper_limb_thickness (0-4), upper_limb_scaliness (0-4), upper_limb_area (0-6)
- lower_limb_redness (0-4), lower_limb_thickness (0-4), lower_limb_scaliness (0-4), lower_limb_area (0-6)
- total_pasi_score (DECIMAL) - calculated
- risk_category (VARCHAR) - 'minimal', 'mild', 'moderate', 'moderate_severe', 'severe'
- assessed_by (VARCHAR)
- org_id (UUID)
```

**Calculation**:
```
PASI = 0.1(Sh + Th + Ah) + 0.2(St + Tt + At) + 0.3(Su + Tu + Au) + 0.4(Sl + Tl + Al)
where S=Severity, T=Thickness, A=Area; h=head, t=trunk, u=upper limbs, l=lower limbs
```

### 2. SCORAD (SCORing Atopic Dermatitis)

**Purpose**: Quantify atopic dermatitis severity
**Score Range**: 0-103
**Clinical Interpretation**:
- 0-15: Mild
- 16-40: Moderate
- >40: Severe

**Components**:
- Extent (0-100, percentage of BSA)
- Intensity score (redness, edema, oozing, excoriation, lichenification) - each 0-3
- Subjective symptoms (pruritus, sleep loss) - 0-20 each

**Database Fields**:
```
dermatology_scorad_assessments:
- assessment_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- assessment_date (DATE)
- extent_percentage (0-100)
- intensity_redness (0-3), intensity_edema (0-3), intensity_oozing (0-3)
- intensity_excoriation (0-3), intensity_lichenification (0-3)
- intensity_subscore (DECIMAL)
- pruritus_score (0-20)
- sleep_loss_score (0-20)
- total_scorad_score (DECIMAL) - calculated
- risk_category (VARCHAR) - 'mild', 'moderate', 'severe'
- assessed_by (VARCHAR)
- org_id (UUID)
```

### 3. DLQI (Dermatology Life Quality Index)

**Purpose**: Patient-reported quality of life impact
**Score Range**: 0-30 (higher = worse QoL)
**Scoring**:
- 0-1: No impact
- 2-5: Small impact
- 6-10: Moderate impact
- 11-20: Very large impact
- 21-30: Extremely large impact

**10 Question Areas**:
1. Symptoms and feelings
2. Influence on daily activities
3. Work or study impact
4. Sport/hobby impact
5. Closeness to partner/friends
6. Sexual difficulties
7. Social embarrassment
8. Treatment burden
9. Depression
10. Anxiety

**Database Fields**:
```
dermatology_dlqi_assessments:
- assessment_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- assessment_date (DATE)
- q1_symptoms_score (0-3)
- q2_daily_activities_score (0-3)
- q3_work_study_score (0-3)
- q4_sport_hobbies_score (0-3)
- q5_relationships_score (0-3)
- q6_sexual_score (0-3)
- q7_social_embarrassment_score (0-3)
- q8_treatment_burden_score (0-3)
- q9_depression_score (0-3)
- q10_anxiety_score (0-3)
- total_dlqi_score (DECIMAL) - sum of all questions
- impact_category (VARCHAR) - 'no_impact', 'small', 'moderate', 'very_large', 'extremely_large'
- patient_completed (BOOLEAN)
- assessed_by (VARCHAR)
- org_id (UUID)
```

### 4. BSA (Body Surface Area)

**Purpose**: Percentage of body surface area affected
**Scoring Methods**:
- Rule of 9s (for quick estimation)
- Hand rule: patient's palm = 1% BSA
- Precise measurement using photography software

**Clinical Threshold**: ≥10% BSA often triggers systemic therapy consideration

**Database Fields**:
```
dermatology_bsa_assessments:
- assessment_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- assessment_date (DATE)
- head_percentage (DECIMAL)
- trunk_anterior_percentage (DECIMAL)
- trunk_posterior_percentage (DECIMAL)
- right_upper_limb_percentage (DECIMAL)
- left_upper_limb_percentage (DECIMAL)
- right_lower_limb_percentage (DECIMAL)
- left_lower_limb_percentage (DECIMAL)
- genitals_percentage (DECIMAL)
- total_bsa_percentage (DECIMAL) - calculated
- assessment_method (VARCHAR) - 'rule_of_nines', 'hand_rule', 'photographic', 'visual_estimation'
- systemic_therapy_indicated (BOOLEAN)
- assessed_by (VARCHAR)
- org_id (UUID)
```

### 5. Auto-Calculation Rules

**PASI Alert Rules**:
```
IF total_pasi_score > 10 AND prior_pasi < 10 THEN
  CREATE TASK FOR care_coordinator: "PASI improved, may consider treatment adjustment"
IF total_pasi_score >= 11 THEN
  CREATE ALERT: "Moderate-to-severe psoriasis requires systemic therapy"
```

**SCORAD Alert Rules**:
```
IF total_scorad_score > 40 THEN
  CREATE ALERT: "Severe atopic dermatitis - consider systemic immunosuppression"
IF total_scorad_score > prior_scorad + 10 THEN
  CREATE TASK: "Disease flare - escalate treatment"
```

**DLQI Alert Rules**:
```
IF total_dlqi_score > 10 AND mental_health_screening_pending THEN
  CREATE TASK: "Screen for depression/anxiety related to dermatologic disease"
```

---

## Biopsy Tracking Workflows

### Pre-Biopsy Phase

**Requirements**:
- Clinical photography (dermatoscopic and macroscopic)
- Differential diagnosis documentation
- Indication documentation
- Patient consent capture
- Clinical information packet for pathologist

**Database Fields**:
```
dermatology_biopsies:
- biopsy_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- lesion_id (UUID) - references dermatology_lesions
- indication (TEXT) - "Evaluation of pigmented lesion for possible melanoma"
- clinical_diagnosis_list (JSONB) - array of differential diagnoses
- specimen_location (VARCHAR) - anatomical site
- specimen_site_description (TEXT) - e.g., "2mm punch from inferior border"
- biopsy_type (VARCHAR) - CHECK ('punch', 'shave', 'excisional', 'incisional')
- biopsy_diameter_mm (INTEGER)
- anesthesia_type (VARCHAR) - 'local_lidocaine', 'none', 'tumescent'
- biopsy_date (DATE) NOT NULL
- biopsy_time (TIME)
- status (VARCHAR) - CHECK ('ordered', 'completed', 'specimen_sent', 'result_pending', 'completed_reviewed')
- performed_by (VARCHAR)
- org_id (UUID)
- created_at TIMESTAMP
```

### Specimen Management

**Database Fields**:
```
dermatology_biopsy_specimens:
- specimen_id (UUID) PRIMARY KEY
- biopsy_id (UUID) REFERENCES dermatology_biopsies(biopsy_id)
- specimen_number (INTEGER) - if multiple specimens from same biopsy
- container_type (VARCHAR) - 'formalin', 'saline', 'other'
- fixative (VARCHAR) - 'formalin', 'alcohol', 'other'
- collection_time (TIMESTAMP)
- lab_id (VARCHAR) - external lab identifier
- lab_name (VARCHAR)
- specimen_tracking_number (VARCHAR) - lab's specimen ID
- sent_date (DATE)
- estimated_arrival_date (DATE)
- received_date (DATE)
- processing_status (VARCHAR) - 'sent', 'received', 'processed', 'reported'
- temperature_maintained (BOOLEAN)
- org_id (UUID)
```

### Pathology Result Management

**Database Fields**:
```
dermatology_pathology_results:
- result_id (UUID)
- specimen_id (UUID) REFERENCES dermatology_biopsy_specimens(specimen_id)
- biopsy_id (UUID) REFERENCES dermatology_biopsies(biopsy_id)
- patient_id (VARCHAR)
- episode_id (UUID)
- result_date (DATE)
- final_diagnosis (TEXT) - primary diagnosis from pathology report
- diagnostic_categories JSONB - structured diagnosis data
- histopathologic_findings (TEXT) - detailed pathology description
- special_stains_performed (JSONB) - array of stains used (e.g., Melan-A, S-100)
- immunohistochemistry (JSONB) - IHC results if performed
- breslow_thickness_mm (DECIMAL) - if melanoma (measured to 0.1mm)
- clark_level (VARCHAR) - if melanoma (I-V)
- ulceration_present (BOOLEAN)
- mitotic_rate (DECIMAL) - mitoses per mm²
- tumor_infiltrating_lymphocytes (VARCHAR) - 'none', 'sparse', 'moderate', 'brisk'
- tnm_stage (VARCHAR) - staged using AJCC 8th edition
- margins_status (VARCHAR) - 'clear', 'involved', 'not_applicable'
- margin_distance_mm (DECIMAL)
- pathologist_name (VARCHAR)
- pathologist_license (VARCHAR)
- pathology_report_url (TEXT) - PDF document storage
- interpretation_by_ordering_provider (TEXT)
- result_communicated_to_patient (BOOLEAN)
- communication_date (DATE)
- communication_method (VARCHAR) - 'phone', 'in_person', 'portal', 'mail'
- communication_notes (TEXT)
- org_id (UUID)
```

### Post-Result Follow-Up

**Activities & Database**:
```
dermatology_biopsy_follow_up:
- follow_up_id (UUID)
- biopsy_id (UUID) REFERENCES dermatology_biopsies(biopsy_id)
- result_id (UUID) REFERENCES dermatology_pathology_results(result_id)
- patient_id (VARCHAR)
- episode_id (UUID)
- planned_treatment (TEXT) - management plan based on pathology
- treatment_category (VARCHAR) - 'observation', 'topical', 'systemic', 'surgical', 'none'
- additional_tests_needed (JSONB) - array of recommended follow-up tests
- monitoring_plan (TEXT) - surveillance strategy
- next_appointment_type (VARCHAR) - 'follow_up_check', 'full_skin_exam', 'dermatopathology_discussion'
- next_appointment_date (DATE)
- sent_to_oncology (BOOLEAN)
- sent_to_mohs (BOOLEAN) - Mohs micrographic surgery referral
- closure_status (VARCHAR) - 'open', 'closed'
- closure_date (DATE)
- org_id (UUID)
```

---

## Dermoscopy & Photo Management

### Dermoscopy Standards

**Documentation Requirements**:
```
dermatology_dermoscopy:
- dermoscopy_id (UUID)
- lesion_id (UUID) REFERENCES dermatology_lesions(lesion_id)
- patient_id (VARCHAR)
- episode_id (UUID)
- examination_date (DATE)
- magnification_level (INTEGER) - typically 10x
- device_type (VARCHAR) - model of dermoscope used
- dermoscopic_pattern (VARCHAR) - classification system used
- pattern_type (VARCHAR) - e.g., 'starburst', 'reticular', 'parallel_furrows', etc.
- colors_present JSONB - array of {color, location, pattern}
- lines_present JSONB - array of {type, location} - commas, dots, streaks, etc.
- structures_present JSONB - array of {structure_type} - milia-like cysts, fingerprints, etc.
- menzies_score (DECIMAL) - alternative scoring system (0-10)
- three_point_checklist_score (INTEGER) - 0-3 points
- total_dermoscopy_impression (TEXT)
- risk_assessment (VARCHAR) - 'benign', 'suspicious', 'high_suspicion_melanoma'
- images_captured (INTEGER) - number of dermoscopic images
- recorded_by (VARCHAR)
- org_id (UUID)
```

**Dermoscopic Classification Systems** (rule 3, ABCD, Menzies):
- Store each evaluation method separately for comparative analysis

### Photo Management & HIPAA Compliance

**Photo Storage Requirements**:

```
dermatology_lesion_photos:
- photo_id (UUID)
- lesion_id (UUID) REFERENCES dermatology_lesions(lesion_id)
- patient_id (VARCHAR)
- episode_id (UUID)
- photo_type (VARCHAR) - CHECK ('clinical', 'dermoscopic', 'body_map', 'comparative')
- photo_date (DATE)
- anatomical_location (VARCHAR)
- body_zone (VARCHAR)
- magnification (VARCHAR) - 'naked_eye', '10x_dermoscopic', '20x_dermoscopic'
- image_orientation (VARCHAR) - '12_oclock', 'lateral_view', 'dorsal_view', 'plantar_view'
- laterality (VARCHAR) - CHECK ('right', 'left', 'bilateral', 'midline')
- file_storage_path (TEXT ENCRYPTED) - encrypted path to image
- file_format (VARCHAR) - 'jpg', 'png', 'dicom'
- file_size_bytes (INTEGER)
- image_resolution (VARCHAR) - minimum 800x600 for teledermatology
- checksum (VARCHAR) - integrity verification
- metadata_dicom_compliant (BOOLEAN) - includes patient, location, laterality, magnification in DICOM headers
- encryption_status (VARCHAR) - CHECK ('encrypted_at_rest', 'encrypted_in_transit', 'both')
- access_log_id (UUID) - audit trail reference
- retention_policy (VARCHAR) - 'permanent', '3_years', '7_years'
- retention_expiry_date (DATE)
- deletable (BOOLEAN) - false = cannot be deleted per compliance requirements
- photo_taken_by (VARCHAR)
- device_model (VARCHAR) - camera/smartphone model
- org_id (UUID)
- created_at TIMESTAMP
```

**HIPAA Compliance Checklist**:
- Photos stored encrypted at rest (AES-256)
- Transmission encrypted (TLS 1.3, 128-bit minimum)
- Device access control (no photos leave office on unwiped devices)
- Metadata includes patient ID, body part, laterality, magnification
- Audit logging of all photo access
- Retention policies enforced automatically
- De-identification possible for educational use
- Patient consent for photo use captured

### Teledermatology Support

**Requirements**:
```
dermatology_teledermatology_consultations:
- consultation_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- ordering_provider (VARCHAR)
- dermatology_provider (VARCHAR)
- consultation_date (DATE)
- platform_used (VARCHAR) - HIPAA-compliant platform name
- video_resolution (VARCHAR) - minimum 800x600 pixels
- encryption_level (VARCHAR) - 128-bit minimum
- photo_package_sent (BOOLEAN)
- photo_count (INTEGER)
- dermatology_assessment (TEXT)
- recommendation (TEXT)
- follow_up_required (BOOLEAN)
- follow_up_type (VARCHAR)
- consultation_status (VARCHAR) - 'pending', 'completed', 'documented'
- org_id (UUID)
```

---

## Disease-Specific Staging

### Melanoma TNM Staging (AJCC 8th Edition)

**Tumor Classification (T Stage)**:
| T Stage | Breslow Thickness | Ulceration | Mitotic Rate |
|---------|------------------|-----------|--------------|
| Tx | Not measurable | - | - |
| T0 | No primary tumor | - | - |
| Tis | In situ melanoma | - | - |
| T1a | ≤0.8 mm | No | <1/mm² |
| T1b | ≤0.8 mm | Yes OR ≥1/mm² | - |
| T2a | 0.81-1.0 mm | No | - |
| T2b | 0.81-1.0 mm | Yes | - |
| T3a | 1.01-2.0 mm | No | - |
| T3b | 1.01-2.0 mm | Yes | - |
| T4a | >2.0 mm | No | - |
| T4b | >2.0 mm | Yes | - |

**Node Classification (N Stage)**:
| N Stage | Metastatic Nodes | Nodal Tumor Burden |
|---------|-----------------|-----------------|
| N0 | No regional nodes | - |
| N1a | 1 node | Micrometastasis |
| N1b | 1 node | Macrometastasis |
| N2a | 2-3 nodes | Micrometastasis |
| N2b | 2-3 nodes | Macrometastasis |
| N2c | 1+ nodes | In-transit metastasis |

**Metastasis Classification (M Stage)**:
| M Stage | Location | LDH |
|---------|----------|-----|
| M0 | No distant metastasis | - |
| M1a | Skin/subcutaneous | Normal |
| M1b | Lung | Normal |
| M1c | Other organ or any with elevated LDH | Normal or elevated |

**Database Fields**:
```
dermatology_melanoma_staging:
- staging_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- pathology_result_id (UUID) REFERENCES dermatology_pathology_results
- staging_date (DATE)
- breslow_thickness_mm (DECIMAL) - precision to 0.1mm
- clark_level (VARCHAR) - I, II, III, IV, V
- ulceration_present (BOOLEAN)
- mitotic_rate_per_mm2 (DECIMAL)
- tumor_stage (VARCHAR) - T0, T1a, T1b, T2a, T2b, T3a, T3b, T4a, T4b
- node_stage (VARCHAR) - N0, N1a, N1b, N2a, N2b, N2c, N3
- metastasis_stage (VARCHAR) - M0, M1a, M1b, M1c
- ldh_level (DECIMAL) - lactate dehydrogenase
- overall_stage (VARCHAR) - Stage 0-IV
- stage_group_number (INTEGER) - 0, I, IIA, IIB, IIC, IIIA, IIIB, IIIC, IIID, IV
- sentinel_node_biopsy_performed (BOOLEAN)
- sentinel_nodes_positive (INTEGER)
- mutation_testing_performed (BOOLEAN)
- braf_status (VARCHAR) - 'negative', 'positive', 'unknown'
- nras_status (VARCHAR) - 'negative', 'positive', 'unknown'
- kc_status (VARCHAR) - 'negative', 'positive', 'unknown'
- immunotherapy_indicated (BOOLEAN)
- radiation_therapy_considered (BOOLEAN)
- surgical_margins_adequate (BOOLEAN)
- oncology_referral_sent (BOOLEAN)
- follow_up_imaging_needed (BOOLEAN)
- follow_up_interval_months (INTEGER)
- staged_by (VARCHAR)
- org_id (UUID)
```

### Non-Melanoma Skin Cancer Staging (BCC, SCC)

**Simplified T, N, M staging**:
```
dermatology_non_melanoma_staging:
- staging_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- pathology_result_id (UUID)
- cancer_type (VARCHAR) - CHECK ('basal_cell', 'squamous_cell', 'merkel_cell', 'other')
- tumor_size_mm (DECIMAL)
- depth_clark_level (VARCHAR)
- perineural_invasion (BOOLEAN)
- degree_of_differentiation (VARCHAR) - 'well', 'moderate', 'poor'
- tumor_stage (VARCHAR)
- node_stage (VARCHAR)
- metastasis_stage (VARCHAR)
- overall_stage (VARCHAR)
- mohs_recommended (BOOLEAN)
- mohs_performed (BOOLEAN)
- mohs_clear_margin_check (BOOLEAN)
- radiation_therapy_indicated (BOOLEAN)
- follow_up_imaging (BOOLEAN)
- org_id (UUID)
```

---

## Dermatology Procedures

### Common Procedures Tracking

**Procedure Categories**:
1. **Diagnostic**: Biopsy (punch, shave, excisional)
2. **Therapeutic**: Excision, Mohs micrographic surgery, cryotherapy, laser
3. **Cosmetic**: Chemical peels, microdermabrasion, fillers
4. **Other**: Patch testing, phototherapy, allergy testing

**Unified Procedure Database**:
```
dermatology_procedures:
- procedure_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- procedure_date (DATE)
- procedure_type (VARCHAR) - 'biopsy_punch', 'biopsy_shave', 'excision', 'mohs', 'cryo', 'laser', 'chemical_peel', 'phototherapy'
- primary_indication (TEXT)
- lesion_id (UUID) - references lesion being treated (if applicable)
- location_anatomical (VARCHAR)
- size_mm (INTEGER)
- anesthesia_type (VARCHAR)
- procedure_duration_minutes (INTEGER)
- personnel_involved JSONB - array of {role, name} - physician, nurse, technician
- complications (JSONB) - array of complications if any
- post_procedure_care_instructions (TEXT)
- follow_up_date (DATE)
- follow_up_type (VARCHAR)
- stitches_placed (INTEGER)
- suture_type (VARCHAR)
- suture_removal_date (DATE)
- infection_status (VARCHAR) - 'none', 'mild', 'moderate', 'severe'
- scarring_expected (VARCHAR) - 'minimal', 'moderate', 'significant'
- outcome (VARCHAR) - 'healing_well', 'infection_present', 'delayed_healing', 'closed'
- performed_by (VARCHAR)
- documented_by (VARCHAR)
- org_id (UUID)
```

### Mohs Micrographic Surgery Tracking

```
dermatology_mohs_cases:
- mohs_case_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- referral_date (DATE)
- procedure_date (DATE)
- lesion_location (VARCHAR)
- clinical_diagnosis (VARCHAR)
- pathology_diagnosis (VARCHAR)
- tumor_type (VARCHAR) - 'BCC', 'SCC', 'melanoma', 'other'
- stages_required (INTEGER) - number of layers removed
- specimen_mapping JSONB - anatomical mapping of removed specimens
- margins_cleared_stage (INTEGER) - at what stage margins became clear
- reconstruction_method (VARCHAR) - 'primary_closure', 'flap', 'graft', 'secondary'
- reconstruction_performed (BOOLEAN)
- reconstruction_date (DATE)
- tumor_removed_completely (BOOLEAN)
- complications (JSONB)
- pathology_final_clear (BOOLEAN)
- mohs_surgeon_name (VARCHAR)
- reconstructive_surgeon_name (VARCHAR)
- org_id (UUID)
```

### Cryotherapy & Laser Procedures

```
dermatology_cryotherapy_laser:
- procedure_id (UUID)
- patient_id (VARCHAR)
- episode_id (UUID)
- procedure_date (DATE)
- lesion_id (UUID)
- procedure_type (VARCHAR) - 'liquid_nitrogen', 'laser_ablation', 'pdt'
- device_model (VARCHAR) - specific equipment used
- temperature_celsius (DECIMAL) - if cryotherapy
- laser_wavelength_nm (INTEGER) - if laser (e.g., 532nm, 1064nm)
- energy_joules (DECIMAL) - laser energy
- treatment_duration_seconds (INTEGER)
- passes_number (INTEGER) - number of applications
- freezing_time_seconds (INTEGER)
- thaw_time_seconds (INTEGER)
- expected_outcome (TEXT)
- post_procedure_blister_formation_expected (BOOLEAN)
- wound_care_instructions (TEXT)
- pain_level_post_procedure (0-10 scale)
- healing_timeline_weeks (INTEGER)
- follow_up_weeks (INTEGER)
- org_id (UUID)
```

---

## Database Schema Design

### Core Tables Architecture

**Table Naming Convention**: `dermatology_[entity_type]`

### Primary Entity Tables

#### 1. dermatology_lesions
Core lesion registry with all primary lesion information.

```sql
CREATE TABLE dermatology_lesions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID REFERENCES patient_specialty_episodes(id),
  lesion_number INTEGER NOT NULL, -- 1, 2, 3... for tracking
  body_zone VARCHAR(100) NOT NULL,
  body_zone_laterality VARCHAR(10), -- 'right', 'left', 'midline'
  description TEXT,
  size_mm DECIMAL(5, 2),
  shape VARCHAR(50),
  color_primary VARCHAR(50),
  color_secondary VARCHAR(50),
  color_tertiary VARCHAR(50),
  borders VARCHAR(50), -- 'well_defined', 'ill_defined'
  surface_type VARCHAR(50), -- 'smooth', 'scaly', 'crusted'

  -- ABCDE Assessment
  asymmetry_grade INTEGER CHECK (asymmetry_grade BETWEEN 0 AND 3),
  border_irregularity INTEGER CHECK (border_irregularity BETWEEN 0 AND 3),
  color_variation_count INTEGER CHECK (color_variation_count BETWEEN 1 AND 6),
  diameter_mm DECIMAL(5, 2),
  evolving_status BOOLEAN DEFAULT FALSE,
  evolving_duration_months INTEGER,
  abcde_risk_score DECIMAL(5, 2),

  -- Clinical Assessment
  ugly_duckling_present BOOLEAN DEFAULT FALSE,
  ugly_duckling_description TEXT,
  clinical_impression VARCHAR(255),
  differential_diagnosis JSONB, -- array of diagnoses

  -- Management
  dermoscopy_performed BOOLEAN DEFAULT FALSE,
  photo_count INTEGER DEFAULT 0,
  biopsy_indicated BOOLEAN DEFAULT FALSE,
  biopsy_status VARCHAR(50), -- 'not_indicated', 'recommended', 'scheduled', 'completed'
  biopsy_date DATE,

  -- Tracking
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'stable', 'evolving', 'biopsied', 'treated', 'resolved'
  management_plan TEXT,
  treatment_status VARCHAR(50),
  follow_up_interval_days INTEGER,
  next_assessment_date DATE,
  resolved_date DATE,

  -- Metadata
  org_id UUID NOT NULL,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(patient_id, lesion_number)
);

CREATE INDEX idx_lesions_patient ON dermatology_lesions(patient_id);
CREATE INDEX idx_lesions_episode ON dermatology_lesions(episode_id);
CREATE INDEX idx_lesions_body_zone ON dermatology_lesions(body_zone);
CREATE INDEX idx_lesions_biopsy_status ON dermatology_lesions(biopsy_status);
CREATE INDEX idx_lesions_abcde_score ON dermatology_lesions(abcde_risk_score)
  WHERE abcde_risk_score >= 4;
CREATE INDEX idx_lesions_evolving ON dermatology_lesions(evolving_status)
  WHERE evolving_status = TRUE;
```

#### 2. dermatology_lesion_photos
```sql
CREATE TABLE dermatology_lesion_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesion_id UUID NOT NULL REFERENCES dermatology_lesions(id) ON DELETE CASCADE,
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID,
  photo_date DATE NOT NULL,
  photo_type VARCHAR(50) NOT NULL, -- 'clinical', 'dermoscopic', 'body_map', 'comparative'
  magnification VARCHAR(50), -- 'naked_eye', '10x', '20x'
  anatomical_location VARCHAR(255),
  laterality VARCHAR(10),
  orientation VARCHAR(100),

  -- File Management (ENCRYPTED)
  file_path TEXT ENCRYPTED,
  file_format VARCHAR(10), -- 'jpg', 'png', 'dicom'
  file_size_bytes INTEGER,
  image_resolution VARCHAR(20), -- '800x600', '1200x900'
  checksum VARCHAR(255),

  -- HIPAA Compliance
  metadata_dicom_compliant BOOLEAN DEFAULT TRUE,
  encryption_type VARCHAR(50), -- 'AES256'
  encryption_status VARCHAR(50), -- 'at_rest', 'in_transit', 'both'

  -- Access & Retention
  access_log_id UUID,
  retention_policy VARCHAR(50), -- '3_years', '7_years', 'permanent'
  retention_expiry_date DATE,
  org_id UUID NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(lesion_id, photo_date, photo_type)
);

CREATE INDEX idx_lesion_photos_lesion ON dermatology_lesion_photos(lesion_id);
CREATE INDEX idx_lesion_photos_patient ON dermatology_lesion_photos(patient_id);
CREATE INDEX idx_lesion_photos_date ON dermatology_lesion_photos(photo_date);
```

#### 3. dermatology_biopsies
```sql
CREATE TABLE dermatology_biopsies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID REFERENCES patient_specialty_episodes(id),
  lesion_id UUID NOT NULL REFERENCES dermatology_lesions(id),

  biopsy_type VARCHAR(50) NOT NULL CHECK (biopsy_type IN ('punch', 'shave', 'excisional', 'incisional')),
  biopsy_date DATE NOT NULL,
  biopsy_time TIME,

  indication TEXT NOT NULL,
  clinical_diagnosis_list JSONB DEFAULT '[]',

  specimen_location VARCHAR(255) NOT NULL,
  specimen_site_description TEXT,
  biopsy_diameter_mm INTEGER,

  anesthesia_type VARCHAR(50),
  anesthesia_volume_ml DECIMAL(4, 1),

  status VARCHAR(50) NOT NULL CHECK (status IN ('ordered', 'completed', 'specimen_sent', 'result_pending', 'completed_reviewed')),

  -- Specimen Tracking
  specimen_id UUID REFERENCES dermatology_biopsy_specimens(id),
  specimen_tracking_number VARCHAR(255),
  lab_name VARCHAR(255),

  org_id UUID NOT NULL,
  performed_by VARCHAR(255),
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_biopsies_patient ON dermatology_biopsies(patient_id);
CREATE INDEX idx_biopsies_lesion ON dermatology_biopsies(lesion_id);
CREATE INDEX idx_biopsies_status ON dermatology_biopsies(status);
CREATE INDEX idx_biopsies_date ON dermatology_biopsies(biopsy_date);
```

#### 4. dermatology_biopsy_specimens
```sql
CREATE TABLE dermatology_biopsy_specimens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biopsy_id UUID NOT NULL REFERENCES dermatology_biopsies(id) ON DELETE CASCADE,
  specimen_number INTEGER,

  container_type VARCHAR(50), -- 'formalin', 'saline'
  fixative VARCHAR(50),
  collection_time TIMESTAMP WITH TIME ZONE,

  lab_id VARCHAR(255),
  lab_name VARCHAR(255),
  specimen_tracking_number VARCHAR(255) UNIQUE,

  sent_date DATE,
  estimated_arrival_date DATE,
  received_date DATE,

  processing_status VARCHAR(50), -- 'sent', 'received', 'processed', 'reported'
  temperature_maintained BOOLEAN DEFAULT TRUE,

  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(biopsy_id, specimen_number)
);

CREATE INDEX idx_specimens_biopsy ON dermatology_biopsy_specimens(biopsy_id);
CREATE INDEX idx_specimens_tracking ON dermatology_biopsy_specimens(specimen_tracking_number);
```

#### 5. dermatology_pathology_results
```sql
CREATE TABLE dermatology_pathology_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specimen_id UUID NOT NULL REFERENCES dermatology_biopsy_specimens(id),
  biopsy_id UUID NOT NULL REFERENCES dermatology_biopsies(id),
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID,

  result_date DATE NOT NULL,
  final_diagnosis TEXT NOT NULL,
  diagnostic_categories JSONB,
  histopathologic_findings TEXT,

  special_stains_performed JSONB DEFAULT '[]', -- ['Melan-A', 'S-100', 'HMB-45']
  immunohistochemistry JSONB DEFAULT '[]',

  -- Melanoma-specific
  breslow_thickness_mm DECIMAL(5, 2),
  clark_level VARCHAR(10),
  ulceration_present BOOLEAN,
  mitotic_rate DECIMAL(5, 2),
  tumor_infiltrating_lymphocytes VARCHAR(50),

  -- TNM Staging
  tnm_stage VARCHAR(10),

  -- General
  margins_status VARCHAR(50), -- 'clear', 'involved', 'not_applicable'
  margin_distance_mm DECIMAL(5, 2),

  pathologist_name VARCHAR(255),
  pathology_report_url TEXT,

  -- Communication
  result_communicated_to_patient BOOLEAN DEFAULT FALSE,
  communication_date DATE,
  communication_method VARCHAR(50), -- 'phone', 'in_person', 'portal'
  communication_notes TEXT,

  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pathology_specimen ON dermatology_pathology_results(specimen_id);
CREATE INDEX idx_pathology_patient ON dermatology_pathology_results(patient_id);
CREATE INDEX idx_pathology_breslow ON dermatology_pathology_results(breslow_thickness_mm);
CREATE INDEX idx_pathology_tnm ON dermatology_pathology_results(tnm_stage);
```

#### 6. dermatology_assessment_tools
Unified table for PASI, SCORAD, DLQI, BSA scores.

```sql
CREATE TABLE dermatology_assessment_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID,
  assessment_date DATE NOT NULL,
  assessment_type VARCHAR(50) NOT NULL, -- 'pasi', 'scorad', 'dlqi', 'bsa'

  -- Unified score storage
  total_score DECIMAL(10, 2),
  score_range_min DECIMAL(10, 2),
  score_range_max DECIMAL(10, 2),
  clinical_category VARCHAR(100), -- 'mild', 'moderate', 'severe'

  -- Component scores (stored as JSONB for flexibility)
  component_scores JSONB,

  -- Source of assessment
  assessed_by VARCHAR(255),
  patient_completed BOOLEAN DEFAULT FALSE,

  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_patient ON dermatology_assessment_tools(patient_id);
CREATE INDEX idx_assessment_type ON dermatology_assessment_tools(assessment_type);
CREATE INDEX idx_assessment_date ON dermatology_assessment_tools(assessment_date);
```

#### 7. dermatology_procedures
```sql
CREATE TABLE dermatology_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL,
  episode_id UUID,
  procedure_date DATE NOT NULL,
  procedure_type VARCHAR(100) NOT NULL,

  lesion_id UUID REFERENCES dermatology_lesions(id),
  indication TEXT,
  location_anatomical VARCHAR(255),
  size_mm INTEGER,

  anesthesia_type VARCHAR(50),
  procedure_duration_minutes INTEGER,

  complications JSONB DEFAULT '[]',
  post_procedure_instructions TEXT,

  stitches_placed INTEGER,
  suture_type VARCHAR(100),
  suture_removal_date DATE,

  infection_status VARCHAR(50), -- 'none', 'mild', 'moderate', 'severe'
  outcome VARCHAR(50), -- 'healing_well', 'infection', 'delayed_healing', 'closed'

  follow_up_date DATE,
  follow_up_type VARCHAR(100),

  performed_by VARCHAR(255),
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_procedures_patient ON dermatology_procedures(patient_id);
CREATE INDEX idx_procedures_lesion ON dermatology_procedures(lesion_id);
CREATE INDEX idx_procedures_date ON dermatology_procedures(procedure_date);
```

---

## Clinical Decision Support Rules

### Rule 1: Melanoma Suspicion Alert

**Trigger**: Lesion updated
**Conditions**:
```
IF (abcde_risk_score >= 4 OR ugly_duckling_present = TRUE) AND biopsy_status != 'completed'
THEN
  Priority = HIGH
  Action = CREATE_ALERT("Lesion meets criteria for melanoma suspicion. Recommend biopsy.")
  Task = Create task for provider: "Review suspicious lesion - recommend urgent biopsy"
  Notification = Send to provider immediately
```

### Rule 2: PASI Disease Progression

**Trigger**: New PASI assessment recorded
**Conditions**:
```
IF new_pasi_score > prior_pasi_score + 10
THEN
  Priority = MEDIUM
  Action = CREATE_ALERT("Significant psoriasis flare detected")
  Task = Create task: "Assess for psoriasis flare - consider treatment escalation"
  Recommendation = "Consider systemic therapy evaluation"
```

### Rule 3: Pathology Result with Malignancy

**Trigger**: Pathology result documented
**Conditions**:
```
IF final_diagnosis CONTAINS ('melanoma' OR 'carcinoma' OR 'malignancy')
THEN
  Priority = CRITICAL
  Action = CREATE_ALERT("Malignant pathology result - urgent follow-up required")
  Task = Create task: "Stage tumor and initiate oncology referral"
  Notification = Send to provider immediately
  Secondary = Check if TNM staging completed; if not, prompt
```

### Rule 4: Biopsy Result Communication Due

**Trigger**: 7 days after pathology result date
**Conditions**:
```
IF result_communicated_to_patient = FALSE AND days_since_result >= 7
THEN
  Priority = MEDIUM
  Task = Create task: "Contact patient with biopsy results"
  Reminder = Send to provider with patient contact info and preferred method
```

### Rule 5: Follow-Up Overdue

**Trigger**: Daily schedule check
**Conditions**:
```
IF next_assessment_date < TODAY AND next_assessment_date IS NOT NULL
THEN
  Priority = LOW/MEDIUM (depends on status)
  Task = Create task: "Schedule follow-up appointment - lesion assessment overdue"
  Notification = Send to scheduler
```

### Rule 6: DLQI Quality of Life Impact

**Trigger**: DLQI assessment recorded
**Conditions**:
```
IF total_dlqi_score > 10 AND prior_assessment_score <= 10
THEN
  Priority = MEDIUM
  Task = Create task: "Patient reported significant QoL impact - consider mental health screening"
  Recommendation = "Suggest referral to dermatology psychiatry or counseling services"
```

### Rule 7: Phototherapy Eligibility

**Trigger**: PASI/SCORAD assessment recorded
**Conditions**:
```
IF (assessment_type = 'pasi' AND total_score > 10) OR (assessment_type = 'scorad' AND total_score > 40)
AND phototherapy_not_yet_prescribed
THEN
  Priority = MEDIUM
  Recommendation = "Patient eligible for phototherapy - consider referral"
  Task = Create task: "Evaluate phototherapy candidacy for this patient"
```

---

## Implementation Recommendations

### 1. Data Migration Strategy

**Phase 1: Lesion Registry**
- Migrate historical lesion data from unstructured notes
- Parse clinical descriptions to populate structured fields
- Link photos to lesions using anatomical descriptors
- Validate ABCDE scoring against pathology outcomes

**Phase 2: Biopsy & Pathology**
- Import pathology reports from lab system
- OCR extraction of key findings (Breslow thickness, TNM stage)
- Manual review and validation by dermatologists
- Link to original lesions and patient timelines

**Phase 3: Assessment Tools**
- Create calculator pages for automated scoring
- Populate historical scores from paper records
- Establish baseline assessments for ongoing monitoring

### 2. User Interface Considerations

**Lesion Management Dashboard**:
- Body map visualization with clickable zones
- Thumbnail gallery of photos by lesion
- ABCDE risk score color-coded (green/yellow/red)
- Quick actions: Order biopsy, Schedule follow-up, Add photo

**Assessment Tool Pages**:
- Interactive scoring forms with real-time calculations
- Historical trend graphs (PASI, SCORAD, DLQI over time)
- Auto-population from prior assessments
- Alert banners for concerning values

**Biopsy Tracking**:
- Timeline view: order → send → receive → report → communicate
- Status dashboard with specimen tracking
- Pathology report inline viewer
- Follow-up action checklist

### 3. Integration Points

**External Lab Integration**:
- Specimen barcode tracking API
- Pathology result imports via HL7 or SFTP
- Status notifications (received, processed, reported)
- Report document ingestion

**Photo Management**:
- Integration with DICOM-compliant medical imaging systems
- Cloud storage with encryption (AWS S3, Azure Blob with AES-256)
- Metadata extraction and validation
- Automated archiving based on retention policies

**Teledermatology**:
- Integration with 100ms or similar HIPAA-compliant video platform
- Photo package auto-generation for consultations
- Secure image transmission
- Consultation note integration

### 4. Security & Compliance Specifics

**Data Classification**:
- Lesion photos = highest sensitivity (PII + PHI)
- Pathology results = high sensitivity (diagnostic data)
- Assessment scores = medium sensitivity
- Procedure notes = medium sensitivity

**Audit Requirements**:
- All photo access logged with timestamp, user, action
- All pathology result views logged
- All patient communications logged
- PHI download attempts logged
- Data deletion attempts logged (even if prevented)

**Encryption**:
- Photo files: AES-256 at rest, TLS 1.3 in transit
- Pathology report PDFs: AES-256 at rest
- DICOM metadata: encrypted with patient/location/magnification included
- Database fields marked ENCRYPTED: file_path, patient identifiers in photo table

---

## Implementation Roadmap

### Sprint 1-2: Core Lesion Management
- Create dermatology_lesions table
- Build lesion dashboard with body map
- Implement ABCDE scoring
- Create photo upload/storage mechanism

### Sprint 3: Assessment Tools
- Build PASI calculator
- Build SCORAD calculator
- Build DLQI form
- Create trending dashboard

### Sprint 4-5: Biopsy Tracking
- Create biopsy workflow
- Build specimen tracking
- Integrate lab result imports
- Create result communication workflow

### Sprint 6: Clinical Decision Support
- Implement alert rules
- Create clinical recommendation engine
- Build provider notification system

### Sprint 7+: Advanced Features
- Teledermatology integration
- Mohs case tracking
- Procedure scheduling
- Comparative lesion analysis

---

## Unresolved Questions

1. **Photo Storage Scale**: What is expected volume of photos per patient per year? (Affects storage architecture)
2. **Lab Integration**: Which pathology labs are priority for direct HL7 integration vs. manual upload?
3. **Teledermatology Priority**: Is synchronous video or asynchronous photo consultation higher priority?
4. **Mobile App**: Should dermatology support include mobile photo capture app with offline capability?
5. **Mole Mapping**: Should system include automated mole detection/segmentation using AI/CV?
6. **Comparative Analysis**: Should system auto-compare lesions between visits for change detection?
7. **Dermoscopy Device Integration**: Should system integrate directly with dermoscope device APIs?
8. **Treatment Outcome Tracking**: How detailed should post-treatment outcome tracking be (scars, residual lesions)?
9. **Surgical Planning**: Should Mohs casework include pre-operative mapping/planning tools?
10. **Systemic Therapy Integration**: Should system track biologics dosing/side effects for psoriasis/atopic dermatitis?
11. **Phototherapy Tracking**: Should phototherapy sessions be tracked with UVA/UVB dose management?
12. **Genetic Testing**: Should system support BRAF/NRAS/KIT mutation results management?

---

## References

### Clinical Guidelines & Standards
- [ABCDE: Melanoma Assessment Mnemonic - Osmosis](https://www.osmosis.org/answers/abcde-melanoma-assessment-mnemonic)
- [ABCDE Rule Expansion & Ugly Duckling Sign - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4345927/)
- [TNM Staging for Melanoma - Cancer Research UK](https://www.cancerresearchuk.org/about-cancer/melanoma/stages-types/tnm-staging)
- [Digital Tools for Assessing Disease Severity - PMC](https://journals.lww.com/idoj/fulltext/2022/13020/digital_tools_for_assessing_disease_severity_in.3.aspx)
- [PASI Assessment Tool - International Psoriasis Council](https://www.psoriasiscouncil.org/education/clinical-assessments/)

### EHR Solutions & Best Practices
- [Top 5 Dermatology EHR Solutions - Viveve](https://www.viveve.com/blog/top-5-dermatology-ehr-solutions-to-streamline-clinical-workflows/)
- [EMA Dermatology EHR - ModMed](https://www.modmed.com/specialties/dermatology/ehr/)
- [Medsender Dermatology EHR Reviews 2024](https://medsender.com/blog/ema-software-dermatology-solutions-reviews-pricing-2024)

### HIPAA & Compliance
- [HIPAA Compliance for Dermatology - HIPAA Journal](https://www.hipaajournal.com/hipaa-compliance-for-dermatologists/)
- [Keep Dermatology Practice HIPAA Compliant with Photo Tips - Practical Dermatology](https://practicaldermatology.com/topics/practice-management/keep-your-dermatology-practice-hipaa-compliant-with-these-5-photo-tips/20684/)
- [Transforming Dermatologic Imaging for Digital Era - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6113154/)

### Biopsy & Pathology
- [Skin Biopsy StatPearls - NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK470457/)
- [Skin Biopsy - Mayo Clinic](https://www.mayoclinic.org/tests-procedures/skin-biopsy/about/pac-20384634)
- [Punch Biopsy of the Skin - AAFP](https://www.aafp.org/pubs/afp/issues/2002/0315/p1155.html)
- [Patient Preferences for Biopsy Result Notification - PubMed](https://pubmed.ncbi.nlm.nih.gov/25831475/)

### Teledermatology & Technology
- [AAD Teledermatology Standards](https://www.aad.org/member/practice/telederm/standards)
- [HIPAA Compliance for Dermatologists 2025 - iFax](https://www.ifaxapp.com/hipaa/hipaa-compliance-for-dermatologist/)

### AI & Advanced Diagnostics
- [AI Integration with ABCDE Rule Analysis - Frontiers in Medicine](https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2024.1445318/full)
- [Post-Deployment Performance of ML-Based Digital Health - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10645139/)

### Disease-Specific Scoring
- [Comprehensive Review of Acne Grading Scales 2023 - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10995619/)
- [Acne Severity Assessment - JCAD](https://jcadonline.com/a-comprehensive-critique-and-review-of-published-measures-of-acne-severity/)
- [TNM Staging Implications for Skin Cancer - British Journal of Dermatology](https://onlinelibrary.wiley.com/doi/10.1111/bjd.16892)
- [AI-Powered Clinical Decision Support - Legit.Health](https://legit.health/blog/apasi-the-bright-future-of-psoriasis-diagnosis)

---

**Report Version**: 1.0
**Last Updated**: December 21, 2025
**Status**: Complete - Ready for Implementation Planning
