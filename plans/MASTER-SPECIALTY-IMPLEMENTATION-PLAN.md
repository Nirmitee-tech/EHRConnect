# MASTER SPECIALTY IMPLEMENTATION PLAN
**EHRConnect Multi-Specialty Module Development**

**Document Version**: 1.0
**Date**: December 21, 2025
**Status**: Ready for Implementation Planning
**Total Research**: 6 Comprehensive Specialties Analyzed

---

## Executive Summary

This master plan consolidates comprehensive research on **6 specialty modules** to guide EHRConnect's expansion beyond the current OB/GYN implementation (27 tables, 7-phase IVF workflow). Each specialty has been researched with the same level of detail as the IVF component.

### Specialties Covered

| # | Specialty | Complexity | Tables | Key Features | Timeline | Priority |
|---|-----------|------------|--------|--------------|----------|----------|
| 1 | **Pediatrics** | ⭐⭐⭐⭐ | 28 | Growth charts, vaccines, milestones, HEADSS | 8-9 weeks | **TIER 1** |
| 2 | **Dermatology** | ⭐⭐⭐ | 15 | Lesion tracking, HIPAA photos, ABCDE scoring | 8-10 weeks | **TIER 1** |
| 3 | **Mental Health** | ⭐⭐⭐⭐ | 9 | 8 assessment tools, C-SSRS safety, DSM-5 | 28 weeks | **TIER 1** |
| 4 | **Orthopedics** | ⭐⭐⭐⭐ | 16 | AJRR registry, ROM tracking, implants | 10+ weeks | **TIER 2** |
| 5 | **Wound Care** | ⭐⭐⭐ | 16 | PUSH/Braden scoring, healing rate, photos | 12 weeks | **TIER 2** |
| 6 | **Cardiology** | ⭐⭐⭐⭐⭐ | 15+ | 8 risk calculators, device monitoring, GDMT | 16 weeks | **TIER 2** |

**Total Database Impact**: 99+ new tables across all specialties
**Total Development Time (Sequential)**: ~83 weeks (19 months)
**Total Development Time (Parallel - 2 teams)**: ~42 weeks (10 months)
**Total Development Time (Parallel - 3 teams)**: ~28 weeks (6.5 months)

---

## Research Deliverables Summary

### Completed Documentation

All 6 specialties have comprehensive research packages located in:
- `/Users/developer/Projects/EHRConnect/plans/`
- `/Users/developer/Projects/EHRConnect/.claude/skills/research/plans/`

#### Research Package Contents (Per Specialty):
1. **Clinical Workflows** - Phase-by-phase workflow diagrams
2. **Database Schema** - Complete SQL specifications with fields, indexes, constraints
3. **Assessment Tools** - Calculator specifications with scoring algorithms
4. **Implementation Plans** - Phased roadmaps with timelines
5. **Clinical Decision Support** - Rule templates with triggers/actions
6. **Integration Points** - External system requirements
7. **FHIR Mappings** - FHIR R4 resource mappings
8. **Unresolved Questions** - Clarification needed from stakeholders

### Total Documentation Metrics

| Metric | Value |
|--------|-------|
| Total Documents | 24+ comprehensive files |
| Total Lines | 10,000+ lines of specifications |
| Total Words | 100,000+ words |
| Database Tables Specified | 99+ tables with full schemas |
| Assessment Tools | 30+ clinical calculators |
| Clinical Workflows | 30+ distinct workflows |
| CDS Rules | 40+ clinical decision support rules |
| Authoritative Sources | 100+ references |

---

## Tier 1 Specialties (Highest ROI, Quickest Implementation)

### 1. PEDIATRICS ⭐ HIGHEST RECOMMENDATION

**Why Priority #1:**
- Natural extension from existing OB/GYN (baby linkage already implemented)
- Completes maternal-child care continuum
- Standardized protocols (AAP Bright Futures, CDC immunization schedule)
- High patient volume specialty

**Research Location**: `/Users/developer/Projects/EHRConnect/.claude/skills/research/plans/pediatrics-specialty-pack/`

#### Clinical Coverage (Birth to 18 Years)

**4 Developmental Phases**:
1. **Newborn (Birth-1 Month)**: Hospital birth linkage, newborn screening, jaundice, feeding
2. **Infant (1-12 Months)**: 6 well-visits, 6 immunization visits, WHO growth charts, Denver II
3. **Early Childhood (1-5 Years)**: 7 well-visits, CDC growth transition, ASQ-3, M-CHAT autism
4. **School & Adolescent (6-18 Years)**: Annual visits, HEADSS assessment, mental health screening

#### Database Architecture (28 Tables)

**Core Demographics (8 tables)**:
- `pediatrics_patients` - Extended patient demographics
- `pediatrics_growth_tracking` - WHO/CDC percentiles with Z-scores
- `pediatrics_vital_signs` - Age-dependent normal ranges
- `pediatrics_allergies` - Pediatric allergy tracking
- `pediatrics_medications` - Weight-based dosing
- `pediatrics_medical_history` - Birth history, neonatal conditions
- `pediatrics_family_history` - Genetic conditions, familial diseases
- `pediatrics_social_determinants` - SDOH screening

**Well-Visits & Encounters (1 table)**:
- `pediatrics_well_visits` - AAP Bright Futures 22 visit types

**Immunizations (2 tables)**:
- `pediatrics_immunization_records` - CDC/ACIP 2024 schedule (23+ vaccines)
- `pediatrics_immunization_status` - Real-time status cache

**Newborn & Screening (2 tables)**:
- `pediatrics_newborn_screening` - Heel stick panels (state-specific)
- `pediatrics_developmental_screening` - Denver II, ASQ-3, M-CHAT

**Behavioral & Mental Health (9 tables)**:
- `pediatrics_headss_assessment` - 6-domain adolescent screening
- `pediatrics_lead_screening` - Blood lead levels (12, 24 months)
- `pediatrics_tb_screening` - Tuberculosis risk assessment
- `pediatrics_autism_screening` - M-CHAT results
- `pediatrics_behavioral_assessment` - Vanderbilt ADHD, behavioral concerns
- `pediatrics_mental_health_screening` - PHQ-9 Modified, suicide risk
- `pediatrics_substance_use_screening` - CRAFFT screening tool
- `pediatrics_sexual_health` - Confidential adolescent screening
- `pediatrics_injury_prevention` - Safety counseling tracking

**Specialized (3 tables)**:
- `pediatrics_vision_hearing_screening` - Sensory screening
- `pediatrics_nutrition_assessment` - Feeding history, BMI tracking
- `pediatrics_sports_physicals` - Sports clearance assessments

**Coordination (2 tables)**:
- `pediatrics_vaccination_schedule_cache` - Automated schedule generation
- `pediatrics_care_coordination` - Early intervention, specialty referrals

#### Assessment Tools & Standards

**Growth Monitoring**:
- WHO Growth Standards (Birth-2 years): Weight, length, head circumference
- CDC Growth Charts (2-20 years): Height, weight, BMI-for-age with percentiles
- Growth velocity tracking (cm/month, kg/month)
- Failure-to-thrive alerts

**Vital Signs (Age-Dependent)**:
| Age | HR (bpm) | RR (breaths/min) | SBP (mmHg) | DBP (mmHg) |
|-----|----------|------------------|------------|------------|
| Newborn | 100-160 | 30-60 | 60-90 | 20-60 |
| 6 months | 100-160 | 25-40 | 80-100 | 55-65 |
| 2 years | 90-150 | 20-30 | 95-105 | 60-70 |
| 5 years | 80-120 | 20-25 | 95-110 | 60-75 |
| 10 years | 70-110 | 18-22 | 100-120 | 60-75 |
| 16 years | 60-100 | 12-20 | 100-135 | 65-85 |

**Developmental Screening**:
- Denver II (4 domains: gross motor, fine motor, language, personal-social)
- ASQ-3 (Ages & Stages Questionnaire, 18-60 months)
- M-CHAT (Modified Checklist for Autism, 18-24 months)
- Vanderbilt ADHD (3-17 years, parent & teacher versions)

**Adolescent Assessment**:
- **HEADSS Protocol** (Ages 13+):
  - **H**ome: Family dynamics, safety, substance use in home
  - **E**ducation: School performance, bullying, learning disabilities
  - **A**ctivities: Peer relationships, extracurricular, gang involvement
  - **D**rugs/Alcohol/Tobacco: Current use, frequency, age of first use
  - **S**exual: Relationship status, contraception, STI risk, assault
  - **S**uicide/Self-Harm/Mood: Depression, anxiety, self-harm, ideation
- Risk Stratification: Low/Moderate/High/Immediate
- Auto-triggers: Safety planning for high/immediate risk

**Immunization Management**:
- CDC/ACIP 2024 Schedule with Penbraya (meningococcal A,B,C,W,Y)
- Medical/immunological contraindications tracking
- Catch-up schedules for delayed vaccinations
- Grace period calculations (4 weeks post-due)
- Lot number, expiration, site, route documentation

#### Clinical Decision Support Rules

1. **Growth Velocity Abnormality**:
   - Trigger: Crossing ≥2 percentile lines downward
   - Action: Alert provider, nutritional assessment, endocrinology consult

2. **Immunization Overdue**:
   - Trigger: Vaccine due + 4 weeks grace period expired
   - Action: Patient outreach, scheduling prompt

3. **Developmental Delay**:
   - Trigger: Denver II delay (>2 months behind milestones)
   - Action: Early intervention referral (IDEA Part C)

4. **HEADSS High Risk**:
   - Trigger: Multiple risk factors or immediate suicide risk
   - Action: Safety planning, crisis protocol, mental health referral

5. **Lead Level Elevated**:
   - Trigger: Blood lead ≥5 mcg/dL
   - Action: Environmental assessment, follow-up testing, case management

6. **Autism Screening Positive**:
   - Trigger: M-CHAT high risk
   - Action: Developmental pediatrics referral, ABA evaluation

7. **BMI Obesity**:
   - Trigger: BMI ≥95th percentile for age
   - Action: Nutrition counseling, activity plan, endocrine evaluation

8. **Blood Pressure Elevated**:
   - Trigger: SBP/DBP ≥95th percentile for age/sex/height (3+ readings)
   - Action: Ambulatory BP monitoring, cardiology referral

#### Integration Points

1. **Maternal OB/GYN Linkage**:
   - Auto-link newborn to mother's delivery record
   - Import: Gestational age, birth weight, delivery complications, APGAR scores
   - Maternal health history transfer

2. **Appointment Scheduling**:
   - AAP Bright Futures well-visit schedule (22 age groups)
   - Automated immunization appointment generation
   - Sports physical scheduling

3. **Rule Engine**:
   - 8+ pediatric-specific CDS rules (see above)
   - Automated early intervention referrals
   - Safety planning workflows

4. **Form System**:
   - 20+ FHIR Questionnaire templates
   - Age-appropriate forms (parent vs adolescent completion)
   - Conditional logic (skip patterns based on age)

5. **Patient Portal**:
   - Growth chart visualization for parents
   - Immunization history with next-due reminders
   - Adolescent-only confidential portal (13+)

#### Implementation Roadmap (8-9 Weeks)

**Phase 1: Foundation (2 weeks)**
- Create 28 tables with migrations
- Implement `PediatricsService` with core methods
- Growth percentile calculations (WHO/CDC lookup tables)
- Immunization schedule generator

**Phase 2: APIs & Forms (2 weeks)**
- 6 API route files (`/well-visits`, `/growth`, `/immunizations`, `/developmental`, `/headss`, `/screening`)
- 20+ FHIR Questionnaires (well-visit templates by age)
- Service implementations with business logic
- Integration tests

**Phase 3: Frontend Components (2 weeks)**
- Dashboard: Growth charts (Recharts), immunization status widget
- Well-visit forms with age-conditional logic
- HEADSS assessment calculator
- Developmental milestone tracker
- Immunization scheduler

**Phase 4: CDS & Automation (1 week)**
- Configure 8+ CDS rules in rule engine
- Automated safety planning for HEADSS high-risk
- Early intervention referral automation
- Immunization reminder automation

**Phase 5: Integration & Validation (1-2 weeks)**
- OB/GYN maternal linkage implementation
- State immunization registry (IIS) integration
- Clinical validation with pediatricians
- Performance optimization (growth chart rendering <500ms)

**MVP Target**: 8-9 weeks for complete pediatric specialty pack

#### Unresolved Questions

1. State newborn screening panels (60+ variations) - which states to prioritize?
2. Early intervention program integration (IDEA Part C) - state-specific workflows?
3. School records IEP/504 plan import - data format standards?
4. Billing codes for developmental screening (CPT 96110, 96127) - integration with RCM?
5. Growth chart library licensing (LMS method) - licensed software vs open-source?
6. State immunization registry priorities - which registries first?
7. Telehealth teen consent workflows - state-specific minor consent laws?
8. HIPAA teen confidentiality (13+) vs parental access - portal access rules?
9. Transition planning (18-21 to adult care) - handoff protocols?
10. Performance targets - acceptable latency for growth percentile calculations?

---

### 2. DERMATOLOGY

**Why Priority #1:**
- Simple data model (image-centric, minimal complex calculations)
- Quick implementation (8-10 weeks)
- High teledermatology potential (reimbursement codes available)
- Photo documentation reusable for other specialties

**Research Location**: `/Users/developer/Projects/EHRConnect/plans/dermatology-specialty-pack/`

#### Clinical Coverage

**5-Phase Clinical Workflow**:
1. **Consultation** - Chief complaint, lesion identification, preliminary assessment
2. **Assessment** - ABCDE scoring, body map documentation, dermoscopy
3. **Decision** - Biopsy vs treatment vs observation
4. **Intervention** - Biopsy, treatment initiation, prescriptions
5. **Follow-Up** - Result communication, treatment adjustment, surveillance

#### Database Architecture (15 Tables in 5 Tiers)

**Tier 1 (MVP - Weeks 1-2)**:
- `derm_lesions` - Primary lesion entity (location, size, type)
- `derm_photos` - HIPAA-encrypted photo storage (AES-256, DICOM metadata)
- `derm_dermoscopy` - Dermoscopy results and images

**Tier 2 (Critical - Weeks 3-4)**:
- `derm_biopsies` - Biopsy orders (shave, punch, excisional)
- `derm_pathology_results` - Pathology integration (Breslow thickness, Clark level)
- `derm_patient_communication` - Result notification tracking

**Tier 3 (High Priority - Weeks 5-6)**:
- `derm_assessments` - PASI, SCORAD, DLQI, BSA calculators
- `derm_body_maps` - Interactive body map with lesion markers

**Tier 4 (Medium Priority - Weeks 7-8)**:
- `derm_procedures` - In-office procedures (cryotherapy, excision)
- `derm_mohs_surgery` - Mohs micrographic surgery tracking
- `derm_cancer_staging` - TNM staging (AJCC 8th edition)

**Tier 5 (Support - Weeks 9-10)**:
- `derm_patient_education` - Educational materials tracking
- `derm_teledermatology` - Store-and-forward consultations
- `derm_care_plans` - Treatment plans with progress tracking

#### Assessment Tools

**ABCDE Lesion Scoring** (Risk Algorithm):
- **A**symmetry (0-2 points)
- **B**order irregularity (0-2 points)
- **C**olor variation (0-2 points)
- **D**iameter >6mm (0-2 points)
- **E**volving/Elevation (0-2 points)
- **Total Score**: 0-10 (≥4 = suspicious, urgent biopsy)
- **Ugly Duckling Sign**: Lesion different from others (boolean)

**PASI (Psoriasis Area and Severity Index)**: 0-72
- Formula: 0.1(E+I+S)A_head + 0.2(E+I+S)A_arms + 0.3(E+I+S)A_trunk + 0.4(E+I+S)A_legs
- E = Erythema (0-4), I = Induration (0-4), S = Scaling (0-4)
- A = Area affected (0-6): 0=none, 1=<10%, 2=10-29%, 3=30-49%, 4=50-69%, 5=70-89%, 6=90-100%
- Interpretation: <10 mild, 10-20 moderate, >20 severe

**SCORAD (SCORing Atopic Dermatitis)**: 0-103
- Formula: A/5 + 7B/2 + C
- A = Area (Rule of 9s, max 100)
- B = Intensity (6 items: erythema, edema, oozing, excoriation, lichenification, dryness, 0-3 each)
- C = Subjective symptoms (itch + sleep loss, VAS 0-10 each)
- Interpretation: <25 mild, 25-50 moderate, >50 severe

**DLQI (Dermatology Life Quality Index)**: 0-30
- 10 questions covering symptoms, feelings, daily activities, leisure, work/school, personal relationships, treatment burden
- Each question: 0=not at all, 1=a little, 2=a lot, 3=very much
- Interpretation: 0-1 no effect, 2-5 small, 6-10 moderate, 11-20 large, 21-30 extremely large

**BSA (Body Surface Area)**: 0-100%
- Hand palm method: Patient's palm = 1% BSA
- Rule of 9s (burns/extensive lesions): Head 9%, each arm 9%, anterior trunk 18%, posterior trunk 18%, each leg 18%, perineum 1%

#### Clinical Decision Support Rules

1. **Melanoma Suspicion**:
   - Trigger: ABCDE score ≥4 OR ugly duckling sign = true
   - Action: Urgent biopsy recommendation, dermatopathology referral

2. **PASI Flare**:
   - Trigger: PASI increase >10 points from baseline
   - Action: Treatment escalation protocol, rheumatology consult (psoriatic arthritis screening)

3. **Malignant Pathology**:
   - Trigger: Pathology result = "melanoma" OR "SCC" OR "BCC"
   - Action: Oncology referral, staging workup, Mohs surgery evaluation

4. **Result Communication Overdue**:
   - Trigger: Biopsy result received + 7 days, patient not contacted
   - Action: Alert clinical team, automated patient outreach

5. **Assessment Overdue**:
   - Trigger: Psoriasis/atopic dermatitis patient, no assessment in 3 months
   - Action: Scheduling reminder

6. **DLQI Quality of Life Impact**:
   - Trigger: DLQI score ≥11 (large/extremely large effect)
   - Action: Mental health referral, social work consultation

7. **Phototherapy Eligibility**:
   - Trigger: PASI >10 OR SCORAD >25, failed topical treatment
   - Action: Phototherapy recommendation (UVB)

#### Photo Management (HIPAA-Critical)

**DICOM Metadata Requirements**:
- Patient ID, name, date of birth
- Body part examined (SNOMED CT coded)
- Laterality (left, right, bilateral, unilateral)
- Image orientation, acquisition date/time
- Dermatoscopy vs clinical photo
- Magnification factor, ruler inclusion

**Encryption Standards**:
- **At Rest**: AES-256 encryption
- **In Transit**: TLS 1.3
- **Access**: Signed URLs with 1-hour expiry
- **Audit**: Complete access logging (who, when, what)

**Retention Policies**:
- Active lesions: Indefinite retention
- Resolved lesions (benign): 3 years post-resolution
- Malignant lesions: 7 years post-treatment
- Research consent: Permanent with de-identification

#### Biopsy Workflow (End-to-End)

1. **Order Phase**:
   - Biopsy type (shave, punch, excisional)
   - Anatomic location (body map selection)
   - Clinical indication, provisional diagnosis
   - Specimen handling (fixative, container)

2. **Specimen Tracking**:
   - Lab tracking number
   - Pathologist assignment
   - Expected turnaround time (7-14 days)

3. **Result Import**:
   - Pathology report integration (HL7 ORU messages)
   - Structured data extraction: Breslow thickness, Clark level, mitotic rate, ulceration
   - TNM staging auto-calculation (melanoma)

4. **Communication**:
   - Patient notification preference (phone, in-person, portal)
   - Result communication logging
   - Follow-up appointment scheduling

5. **Follow-Up**:
   - Surveillance schedule (melanoma: every 3-6 months for 5 years)
   - Imaging orders (CT chest/abdomen/pelvis for high-risk melanoma)

#### Implementation Roadmap (8-10 Weeks)

**Phase 1: MVP (Weeks 1-2)**
- Tier 1 tables (lesions, photos, dermoscopy)
- Basic lesion documentation form
- ABCDE calculator
- HIPAA-compliant photo upload

**Phase 2: Biopsy Workflow (Weeks 3-4)**
- Tier 2 tables (biopsies, pathology, communication)
- Biopsy order interface
- Pathology result display
- Patient communication tracking

**Phase 3: Assessment Tools (Weeks 5-6)**
- Tier 3 tables (assessments, body maps)
- PASI, SCORAD, DLQI, BSA calculators
- Interactive body map component

**Phase 4: Advanced Features (Weeks 7-8)**
- Tier 4 tables (procedures, Mohs, staging)
- Procedure documentation
- Melanoma TNM staging calculator

**Phase 5: Integration & Optimization (Weeks 9-10)**
- Tier 5 tables (education, teledermatology, care plans)
- Lab interface for pathology results (HL7)
- Photo storage optimization
- Teledermatology store-and-forward

#### Unresolved Questions

1. Photo storage backend (AWS S3, Azure, self-hosted)?
2. Lab integration priority (3 major labs vs comprehensive)?
3. Assessment tool AI (manual entry vs AI-assisted vs AI-primary)?
4. Teledermatology approach (asynchronous photos vs synchronous video)?
5. Mobile support scope (web-responsive first vs native apps)?
6. Mole mapping automation (manual zones vs automated segmentation)?
7. Comparative lesion analysis (auto-change detection vs provider review)?
8. Treatment outcome tracking depth (minimal vs comprehensive)?

---

### 3. MENTAL HEALTH/PSYCHIATRY

**Why Priority #1:**
- Reuses EPDS pattern from OB/GYN (already implemented)
- Standardized assessment tools (PHQ-9, GAD-7, etc.)
- Critical for adolescent care (integrates with Pediatrics HEADSS)
- Measurement-based care increasingly required by payers

**Research Location**: `/Users/developer/Projects/EHRConnect/plans/mental-health-psychiatry-module/`

#### Clinical Coverage

**4-Phase Clinical Workflow**:
1. **Triage & Screening** (5 min) - Brief screening tools, risk assessment
2. **Comprehensive Assessment** (30-45 min) - Full psychiatric evaluation, MSE, diagnosis
3. **Treatment Formulation** (15-20 min) - Treatment plan, medication, therapy modalities
4. **Ongoing Monitoring** - Measurement-based care, medication management, outcome tracking

#### Database Architecture (9 Core Tables)

1. **`psychiatric_assessments`** - Multi-tool scoring repository
   - Assessment type (PHQ-9, GAD-7, PCL-5, MDQ, AUDIT, DAST-10, CAGE-AID, C-SSRS)
   - Score, interpretation, risk level
   - Assessment date, assessor
   - Episode linkage

2. **`suicide_risk_assessments`** - C-SSRS tracking (GOLD STANDARD)
   - Ideation (yes/no), Intensity (1-5)
   - Behavior (preparatory, aborted, interrupted, actual attempt)
   - Plan, intent, means access
   - Risk stratification: Low/Moderate/High/Critical
   - Safety planning triggered automatically

3. **`safety_plans`** - Personalized crisis plans
   - Warning signs, coping strategies
   - Social contacts (friends, family)
   - Professional contacts (therapist, psychiatrist, crisis line)
   - Environmental restrictions (means reduction)
   - Reasons for living

4. **`psychiatric_diagnoses`** - DSM-5 + ICD-10
   - Primary, secondary, provisional diagnoses
   - Onset date, severity, course specifiers
   - Rule-out diagnoses
   - Differential diagnosis notes

5. **`psychiatric_treatment_plans`** - Evidence-based planning
   - Problem list
   - SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
   - Interventions (medication, therapy type, frequency)
   - Progress indicators
   - Review schedule

6. **`psychiatric_medications`** - Medication trials tracking
   - Medication name, dose, frequency
   - Start date, trial duration
   - Response (CGI-I scale: 1=very much improved, 7=very much worse)
   - Side effects, adherence
   - Reason for discontinuation

7. **`mental_status_examinations`** - 12-domain MSE
   - Appearance, behavior, speech, mood, affect
   - Thought process, thought content, perception
   - Cognition, insight, judgment
   - Suicidal/homicidal ideation

8. **`therapy_session_notes`** - Session tracking
   - Session date, duration, modality (individual, group, family)
   - Chief complaint, interventions used
   - Progress toward goals, homework assigned
   - Next session plan

9. **`mental_health_cds_rules`** - Clinical decision support
   - Rule definitions, triggers, actions
   - Risk stratification logic
   - Medication safety alerts

#### Assessment Tools (8 Standardized)

**1. PHQ-9 (Patient Health Questionnaire - Depression)**: 0-27
- 9 items based on DSM-5 criteria for major depression
- Each item: 0=not at all, 1=several days, 2=more than half the days, 3=nearly every day
- Scoring: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe
- Clinical Actions:
  - ≥10: Warrants treatment (psychotherapy, pharmacotherapy, or both)
  - ≥15: Requires active treatment with pharmacotherapy and/or psychotherapy
  - Item 9 (suicidal thoughts) >0: Suicide risk assessment required

**2. GAD-7 (Generalized Anxiety Disorder)**: 0-21
- 7 items based on DSM-5 criteria for GAD
- Scoring same as PHQ-9 (0-3 per item)
- Interpretation: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe
- Clinical Actions:
  - ≥10: Warrants treatment
  - Consider panic disorder if item 7 (anxiety attack) scored high

**3. PCL-5 (PTSD Checklist for DSM-5)**: 0-80
- 20 items covering DSM-5 PTSD criteria
- Each item: 0=not at all, 1=a little bit, 2=moderately, 3=quite a bit, 4=extremely
- Interpretation: 0-20 minimal, 21-30 mild, 31-45 moderate, 46-60 severe, 61-80 extreme
- Clinical Actions:
  - ≥31: Provisional PTSD diagnosis, trauma-focused therapy (CPT, PE, EMDR)

**4. MDQ (Mood Disorder Questionnaire - Bipolar Screening)**: Binary
- 13 yes/no items about manic/hypomanic symptoms
- Additional questions: symptoms occurred same time? caused problems?
- Positive screen: ≥7 yes + occurred same time + caused moderate/serious problems
- Clinical Actions:
  - Positive screen: Prevent SSRI monotherapy (risk of switching to mania), refer to psychiatrist

**5. AUDIT (Alcohol Use Disorders Identification Test)**: 0-40
- 10 items (3 on consumption, 3 on dependence, 4 on harm)
- Scoring: 0-4 per item (varies by question)
- Interpretation: 0-7 low risk, 8-15 hazardous, 16-19 harmful, 20-40 probable dependence
- Clinical Actions:
  - 8-15: Brief intervention, counseling
  - 16-19: Brief counseling + monitoring
  - ≥20: Refer to addiction specialist, consider detox

**6. DAST-10 (Drug Abuse Screening Test)**: 0-10
- 10 yes/no items about drug use (excluding alcohol/tobacco)
- Scoring: 1 point per "yes"
- Interpretation: 0 no problems, 1-2 low, 3-5 moderate, 6-8 substantial, 9-10 severe
- Clinical Actions:
  - ≥3: Substance use assessment, motivational interviewing, treatment referral

**7. CAGE-AID (Rapid Substance Screening)**: Binary
- 4 yes/no items: Cut down? Annoyed by criticism? Guilty? Eye-opener?
- Positive screen: ≥2 yes
- Clinical Actions:
  - Positive: Administer full AUDIT/DAST for detailed assessment

**8. C-SSRS (Columbia-Suicide Severity Rating Scale)**: GOLD STANDARD
- **Ideation Section**: Wish to die? Non-specific thoughts? Specific thoughts? Intent? Plan?
- **Behavior Section**: Preparatory acts? Aborted attempt? Interrupted attempt? Actual attempt?
- **Intensity**: Frequency, duration, controllability, deterrents, reasons for ideation (1-5 scale)
- **Risk Stratification**:
  - **Low**: Wish to die, no plan/intent
  - **Moderate**: Specific ideation, no plan
  - **High**: Intent + plan, no behavior
  - **Critical**: Recent attempt OR plan + intent + means access
- **Clinical Actions**:
  - High/Critical: Immediate safety planning, means restriction, emergency contact activation
  - Critical + imminent: Psychiatric emergency, consider hospitalization

#### Clinical Decision Support Rules (8+)

1. **Suicide Risk Escalation**:
   - Trigger: C-SSRS = "High" OR "Critical"
   - Action: CRITICAL alert, safety plan activation, emergency contact notification, consider psychiatric hospitalization

2. **SSRI Black Box Warning**:
   - Trigger: Age <25 OR C-SSRS moderate/high + SSRI prescribed
   - Action: WARNING to provider, increase monitoring frequency (weekly for 4 weeks, then biweekly for 8 weeks)

3. **Bipolar Switching Risk**:
   - Trigger: MDQ positive + SSRI prescribed (no mood stabilizer)
   - Action: WARNING, recommend mood stabilizer before SSRI, psychiatry consult

4. **Controlled Substance Safety**:
   - Trigger: C-SSRS ≥moderate + controlled substance (benzodiazepine, stimulant)
   - Action: WARNING, weekly monitoring, consider alternative medication

5. **Medication Non-Response**:
   - Trigger: 8+ weeks on adequate dose, PHQ-9/GAD-7 not improved by ≥50%
   - Action: INFO alert, consider dose increase, augmentation, or switch

6. **Serotonin Syndrome Risk**:
   - Trigger: ≥2 serotonergic medications prescribed
   - Action: CRITICAL alert, educate patient on symptoms, consider alternative

7. **Benzodiazepine Duration**:
   - Trigger: Benzodiazepine prescribed >12 weeks
   - Action: WARNING, taper plan recommendation, CBT referral

8. **Therapeutic Drug Level Monitoring**:
   - Trigger: Lithium, valproate, carbamazepine prescribed + no level in 3 months
   - Action: INFO alert, order lab

#### Safety-Critical Features

**C-SSRS Integration**:
- Embedded in all psychiatric assessments
- Risk stratification algorithm (Low/Moderate/High/Critical)
- Automatic safety plan generation (<2 minutes)
- Emergency contact verification

**Safety Planning Protocol**:
- Template-based with customization
- Warning signs identification
- Coping strategies (internal, social)
- Contact list (friends, family, crisis line, 988, 911)
- Means restriction counseling (medications, firearms, sharps)
- Reasons for living documentation

**Emergency Protocols**:
- 988 Suicide & Crisis Lifeline integration
- Local crisis team contact info
- Involuntary commitment criteria documentation
- Law enforcement involvement protocols

#### Implementation Roadmap (28 Weeks, 4 Phases)

**Phase 1: Assessment Tools Foundation (4-6 weeks)**
- 9 core database tables
- 8 assessment tool calculators (PHQ-9, GAD-7, PCL-5, MDQ, AUDIT, DAST-10, CAGE-AID, C-SSRS)
- Basic intake forms
- FHIR Questionnaire templates

**Phase 2: Clinical Workflows (6-8 weeks)**
- Psychiatric intake assessment form (30-45 min template)
- Mental Status Examination (MSE) structured form
- DSM-5 diagnosis selection with ICD-10 mapping
- Treatment plan builder with SMART goals
- Therapy session note templates

**Phase 3: Advanced Features & Safety (8-10 weeks)**
- C-SSRS risk stratification algorithm
- Automated safety planning
- Medication management workflows (trials, side effects, adherence)
- Clinical decision support rules (8+ rules)
- Outcome monitoring dashboards (measurement-based care)

**Phase 4: Integration & Optimization (4-6 weeks)**
- Pediatrics HEADSS integration (auto-import scores)
- Prescription drug monitoring program (PDMP) integration
- Crisis hotline integration (988 Lifeline)
- Performance optimization (<2 second assessment completion)

**MVP Target**: 28 weeks for complete mental health specialty pack

#### Unresolved Questions

1. E-prescribing controlled substances (EPCS) - DEA registration requirements?
2. State-specific involuntary commitment laws - documentation templates needed per state?
3. Substance use treatment integration - SAMHSA-certified programs referral workflows?
4. Group therapy management - attendance tracking, co-payment splitting?
5. Psychological testing integration - import scores from external systems?
6. Telepsychiatry scope - DEA prescribing across state lines?
7. Teen confidentiality rules - when to break confidentiality for parents?
8. Peer support specialist documentation - how to track peer support services?

---

## Tier 2 Specialties (Moderate Complexity, High Value)

### 4. ORTHOPEDICS

**Why Tier 2:**
- Higher complexity (surgical tracking, implant registry, long-term follow-up)
- Already referenced in project docs as planned
- Requires AJRR compliance (American Joint Replacement Registry)
- 10+ week implementation timeline

**Research Location**: `/Users/developer/Projects/EHRConnect/plans/orthopedics-specialty-pack/`

#### Clinical Coverage (5 Phases)

1. **Pre-Operative Assessment**: Risk stratification, imaging review, medical clearance, informed consent
2. **Intraoperative Documentation**: Procedure notes, implant tracking (UDI), complications, safety verification
3. **Post-Operative Care**: Pain management, wound care, DVT prophylaxis, discharge planning
4. **Rehabilitation**: PT/OT coordination, ROM/strength tracking, weight-bearing progression
5. **Long-Term Follow-Up**: Implant surveillance, outcome assessment, registry submission

#### Database Architecture (16 Tables)

**Phase 1 (MVP - Weeks 1-3)**: 7 core tables
- `ortho_procedures` - Surgical procedures (TKA, THA, TSA, ACL, rotator cuff, spine fusion)
- `ortho_pre_operative_assessments` - Pre-op clearance, risk scores
- `ortho_implant_registry` - AJRR Level 1/2/3 data, UDI tracking
- `ortho_post_operative_care` - Post-op visits, wound checks, pain management
- `ortho_rehabilitation_protocols` - PT/OT protocols by procedure
- `ortho_therapy_sessions` - PT/OT session notes, progress
- `ortho_functional_assessments` - WOMAC, Harris Hip, Oxford, DASH, Oswestry

**Phase 2 (Extended - Weeks 4-6)**: 4 tables
- `ortho_imaging_studies` - X-ray, MRI, CT, DEXA tracking
- `ortho_complications` - Infection, DVT, dislocation, fracture tracking
- `ortho_infection_surveillance` - PJI (Prosthetic Joint Infection) MSIS criteria
- `ortho_dvt_prophylaxis` - Caprini score, prophylaxis protocol

**Phase 3 (Advanced - Weeks 7-9)**: 5 tables
- `ortho_long_term_follow_up` - Annual visits, implant surveillance
- `ortho_range_of_motion` - Joint ROM measurements (goniometer)
- `ortho_muscle_strength` - 0-5 grading scale
- `ortho_neurovascular_exams` - Sensation, pulses, motor function
- `ortho_revision_surgeries` - Revision procedures, explant tracking

#### Assessment Tools (10+ Scoring Systems)

**Joint-Specific Scores**:

1. **WOMAC (Western Ontario McMaster)**: 0-96 (hip/knee OA)
   - Pain: 5 items (0-20)
   - Stiffness: 2 items (0-8)
   - Physical function: 17 items (0-68)
   - Lower score = better outcome

2. **Harris Hip Score**: 0-100
   - Pain (44 points), Function (47 points), Range of Motion (5 points), Deformity (4 points)
   - ≥90 excellent, 80-89 good, 70-79 fair, <70 poor

3. **Oxford Hip/Knee Score**: 12-60
   - 12 questions, each scored 0-4
   - 48-60 excellent, 42-47 good, 34-41 fair, <34 poor

4. **DASH (Disabilities of Arm, Shoulder, Hand)**: 0-100
   - 30 questions about upper extremity function
   - 0 = no disability, 100 = severe disability
   - Optional modules: Work, Sports/Performing Arts

5. **Constant-Murley Score (Shoulder)**: 0-100
   - Pain (15), Activities of daily living (20), Range of motion (40), Strength (25)
   - ≥86 excellent, 71-85 good, 56-70 fair, <56 poor

6. **Lysholm Score (Knee)**: 0-100
   - Limp, support, locking, instability, pain, swelling, stairs, squatting
   - ≥95 excellent, 84-94 good, 65-83 fair, <65 poor

**Spine Scores**:

7. **Oswestry Disability Index (ODI)**: 0-100%
   - 10 sections (pain, personal care, lifting, walking, sitting, standing, sleeping, sex life, social life, traveling)
   - Each section 0-5 points
   - 0-20% minimal, 21-40% moderate, 41-60% severe, 61-80% crippled, 81-100% bed-bound

**General Scores**:

8. **SF-36 (Short Form 36)**: Quality of life
   - 8 domains: physical functioning, role-physical, bodily pain, general health, vitality, social functioning, role-emotional, mental health
   - Scored 0-100 per domain

**Strength Assessment**:

9. **Muscle Strength Grading**: 0-5 scale
   - 0: No contraction
   - 1: Trace contraction, no movement
   - 2: Movement with gravity eliminated
   - 3: Movement against gravity, no resistance
   - 4: Movement against some resistance
   - 5: Normal strength

**Range of Motion Normative Values** (Goniometer measurements):
- **Shoulder**: Flexion 180°, Extension 60°, Abduction 180°, Internal rotation 70°, External rotation 90°
- **Hip**: Flexion 120°, Extension 30°, Abduction 45°, Adduction 30°, Internal rotation 45°, External rotation 45°
- **Knee**: Flexion 135°, Extension 0°
- **Ankle**: Dorsiflexion 20°, Plantarflexion 50°

#### AJRR (American Joint Replacement Registry) Compliance

**Level 1 Data (Required)**:
- Patient demographics (age, sex, race, BMI)
- Implant information (manufacturer, model, UDI)
- Procedure details (joint, approach, fixation method)
- Date of surgery

**Level 2 Data (Recommended)**:
- Diagnosis (osteoarthritis, rheumatoid, trauma)
- ASA class (anesthesia risk)
- Comorbidities (diabetes, heart disease, lung disease)
- Previous surgeries on same joint

**Level 3 Data (Optional)**:
- Patient-reported outcome measures (WOMAC, Oxford)
- Complications (infection, dislocation, revision)
- Implant survivorship

**UDI (Unique Device Identifier) Format**:
- GS1 standard: (01) GTIN + (21) Serial Number
- Example: (01)00614141123456(21)1234567890
- Barcode scannable for automated capture

#### Clinical Decision Support Rules (6)

1. **DVT Prophylaxis Alert**:
   - Trigger: Caprini score ≥4 (high risk)
   - Action: Recommend LMWH/rivaroxaban, sequential compression devices, early mobilization

2. **Infection Risk Warning**:
   - Trigger: Diabetes (HbA1c >8%) OR immunosuppression OR BMI >40
   - Action: Optimize glucose control pre-op, antibiotic prophylaxis extended

3. **ROM Progress Lag**:
   - Trigger: TKA 6 weeks post-op + flexion <90° (expected 90-110°)
   - Action: Intensify PT, consider manipulation under anesthesia (MUA)

4. **Implant Loosening Suspicion**:
   - Trigger: X-ray shows radiolucencies >2mm OR subsidence
   - Action: Serial X-rays every 3 months, metal ion levels (if metal-on-metal), consider revision

5. **Surgical Site Infection (SSI)**:
   - Trigger: Post-op day 7-90 + increasing pain + erythema + fever + CRP elevated
   - Action: Urgent infectious disease consult, irrigation & debridement, 6-week antibiotics

6. **Dislocation Risk**:
   - Trigger: THA + posterior approach + previous dislocation
   - Action: Hip precautions education, abduction brace, limit flexion >90°

#### Rehabilitation Protocols (Procedure-Specific)

**Total Knee Arthroplasty (TKA)**:
- **Week 0-2**: NWB → WBAT with walker, ROM 0-90°, quad sets, ankle pumps
- **Week 3-6**: WBAT → FWB with cane, ROM 0-110°, stationary bike, straight leg raises
- **Week 7-12**: FWB without assistive device, ROM 0-120°, squats, step-ups
- **Week 13+**: Return to low-impact activities (golf, swimming), avoid high-impact (running, jumping)

**Total Hip Arthroplasty (THA)**:
- **Week 0-6**: TDWB → WBAT with walker, hip precautions (no flexion >90°, no adduction past midline, no internal rotation)
- **Week 7-12**: WBAT → FWB with cane, increase ROM, strengthening
- **Week 13+**: FWB without assistive device, return to activities

**ACL Reconstruction**:
- **Week 0-2**: NWB → TDWB with crutches, brace locked 0°, ROM 0-90°, quad sets
- **Week 3-6**: WBAT → FWB, ROM 0-120°, stationary bike, leg press
- **Week 7-12**: FWB, proprioception exercises, light jogging
- **Month 4-6**: Running, agility drills, sport-specific training
- **Month 6-9**: Return to sport clearance (functional testing required)

**Rotator Cuff Repair**:
- **Week 0-6**: Sling immobilization, pendulum exercises, passive ROM only
- **Week 7-12**: Remove sling, active-assisted ROM, light strengthening
- **Week 13-24**: Full active ROM, progressive strengthening, return to overhead activities

#### Implementation Roadmap (10+ Weeks)

**Phase 1: MVP (Weeks 1-3)**
- 7 core tables
- Pre-op and post-op assessment forms
- WOMAC, Harris Hip, Oxford calculators
- ROM and strength assessment forms
- AJRR Level 1 data capture

**Phase 2: Extended (Weeks 4-6)**
- 4 extended tables (imaging, complications, infection, DVT)
- Imaging PACS integration
- Complication tracking workflows
- DVT Caprini score calculator
- Long-term follow-up scheduling

**Phase 3: Advanced (Weeks 7-9)**
- 5 advanced tables (follow-up, ROM, strength, neurovascular, revision)
- Advanced calculators (DASH, Oswestry, Constant-Murley, Lysholm)
- Implant failure detection algorithms
- Revision surgery tracking

**Phase 4: Integration (Weeks 10+)**
- AJRR data export (annual submission)
- FDA device recall integration
- PT/OT scheduling integration
- Patient portal for home exercise programs (HEP)

#### Unresolved Questions

1. AJRR submission process - automated export or manual data entry?
2. UDI barcode scanning - hardware integration requirements?
3. ROM measurement tools - manual goniometer entry or digital sensor integration?
4. PT/OT scheduling - bidirectional integration with external therapy providers?
5. Implant warranty tracking - automated claim submission for failures?
6. Device recall notifications - FDA MAUDE database integration?
7. Pre-op optimization protocols - bundled care pathways or individual care plans?
8. Revision surgery registry - separate registry or extend AJRR?

---

### 5. WOUND CARE

**Why Tier 2:**
- Moderate complexity (photo documentation, healing rate calculations)
- 12-week implementation timeline
- High chronic care management potential (reimbursement codes)
- Reusable photo architecture from Dermatology

**Research Location**: `/Users/developer/Projects/EHRConnect/plans/wound-care-specialty/`

#### Clinical Coverage

**4-Phase Healing Workflow**:
1. **Day 0 (Initial)**: Complete wound registration, all assessment frameworks, baseline photo (15-20 min)
2. **Days 1-7 (Acute)**: Daily to q48h monitoring, infection/pain focus
3. **Weeks 2-4 (Proliferative)**: 2-3x/week assessments, healing rate calculations (target: 10-15% weekly area reduction)
4. **Weeks 4+ (Remodeling)**: Weekly to biweekly, closure tracking

#### Database Architecture (16 Core Tables)

**Wound Entity**:
1. `obgyn_wounds` - Primary wound entity (patient, location, type, onset date)
2. `obgyn_wound_types` - Classification (pressure, diabetic, venous, arterial, surgical, burn)

**Assessment Frameworks**:
3. `obgyn_pressure_injury_staging` - NPUAP lookup (Stage I-IV, Unstageable, DTPI)
4. `obgyn_wound_assessments` - Temporal assessment tracking (TIME/MEASURE frameworks)
5. `obgyn_wound_measurements` - L×W×D, area, undermining (clock face), tunneling
6. `obgyn_tissue_composition` - % granulation, slough, eschar, necrotic
7. `obgyn_wound_exudate` - Amount (none/scant/moderate/copious), type (serous/purulent)
8. `obgyn_wound_edges` - Attachment, epithelialization, rolled, macerated
9. `obgyn_pain_assessment` - Location, severity (0-10), character

**Infection & Risk**:
10. `obgyn_infection_tracking` - Clinical indicators, cultures, osteomyelitis screening
11. `obgyn_risk_assessment_prevention` - Braden scale, prevention planning

**Scoring Tools**:
12. `obgyn_wound_scoring_push` - PUSH score calculator (0-17)
13. `obgyn_wound_scoring_braden` - Braden scale calculator (6-23)

**Treatment & Documentation**:
14. `obgyn_wound_treatments` - Debridement, dressings (200+ types), compression, offloading, HBOT, surgical
15. `obgyn_wound_photos` - HIPAA-encrypted photo storage (AES-256), trending
16. `obgyn_clinical_alerts` - Real-time alerts (infection, stalled healing, specialist referral)

#### Assessment Frameworks (5)

**TIME Framework**:
- **T**issue: Non-viable vs viable
- **I**nfection/Inflammation: Clinical signs, bioburden
- **M**oisture: Balance (dry vs macerated)
- **E**dge: Advancing vs non-advancing
- **Surrounding skin**: Periwound condition

**MEASURE Framework**:
- **M**easure: L×W×D with standard technique
- **E**xudate: Amount, type
- **A**ppearance: Tissue types, percentages
- **S**uffering: Pain assessment
- **U**ndermining: Clock face location, depth
- **R**eevaluate: Frequency based on phase
- **E**dge: Attachment status

**PUSH Score (Pressure Ulcer Scale for Healing)**: 0-17
- Length × Width (0-10 points): 0=closed, 1=<0.3cm², 2=0.3-0.6, 3=0.7-1.0, ..., 10=>24cm²
- Exudate Amount (0-3): 0=none, 1=light, 2=moderate, 3=heavy
- Tissue Type (0-4): 0=closed, 1=epithelial, 2=granulation, 3=slough, 4=necrotic
- Interpretation: Decreasing score = healing, increasing = worsening
- Track weekly, expect 2-4 point decrease in 2 weeks if healing

**Braden Scale (Pressure Injury Risk)**: 6-23
- 6 domains (each 1-4 points): Sensory perception, Moisture, Activity, Mobility, Nutrition, Friction/Shear
- Interpretation: ≤18 = high risk, 15-18 = moderate risk, 13-14 = low risk
- Use for prevention planning

**BWAT (Bates-Jensen Wound Assessment Tool)**: 13-65
- 13 items (each 1-5 points): Size, depth, edges, undermining, necrotic tissue type/amount, exudate type/amount, periwound color/edema/induration, granulation, epithelialization
- Lower score = healthier wound
- Track weekly, expect 4-8 point decrease in 2 weeks if healing

#### Wound Type Classification

**Pressure Injuries (NPUAP Staging)**:
- **Stage I**: Intact skin, non-blanchable erythema
- **Stage II**: Partial-thickness loss, exposed dermis (blister, abrasion)
- **Stage III**: Full-thickness loss, visible subcutaneous fat, no bone/tendon/muscle
- **Stage IV**: Full-thickness loss, exposed bone/tendon/muscle
- **Unstageable**: Full-thickness, obscured by slough/eschar (cannot determine depth)
- **DTPI (Deep Tissue Pressure Injury)**: Intact/non-intact skin, purple/maroon discoloration

**Diabetic Foot Ulcers (Wagner Classification)**:
- **Grade 0**: Pre-ulcerative lesion, healed ulcer, bony deformity
- **Grade 1**: Superficial ulcer, no infection
- **Grade 2**: Deep ulcer to tendon/bone/joint
- **Grade 3**: Deep ulcer with abscess, osteomyelitis, septic arthritis
- **Grade 4**: Gangrene of forefoot
- **Grade 5**: Gangrene of entire foot

**Venous Leg Ulcers (CEAP Classification)**:
- **C0-C6**: C0=none, C1=spider veins, C2=varicose veins, C3=edema, C4=skin changes, C5=healed ulcer, C6=active ulcer

**Arterial Ulcers (Fontaine Staging)**:
- **I**: Asymptomatic
- **II**: Claudication (IIa=distance >200m, IIb=<200m)
- **III**: Rest pain
- **IV**: Ulceration or gangrene

#### Clinical Decision Support Rules

1. **Infection Detection**:
   - Trigger: 2+ clinical indicators (pain increase, erythema, warmth, purulent drainage, fever) + culture positive
   - Action: Antibiotic therapy, increased monitoring, infectious disease consult if severe

2. **Stalled Healing Alert**:
   - Trigger: <5% weekly area reduction for 2+ consecutive weeks
   - Action: Reassess treatment plan, consider advanced therapies (HBOT, bioengineered tissue), specialist referral

3. **Osteomyelitis Screening**:
   - Trigger: Probe-to-bone positive + exposed bone OR X-ray positive
   - Action: MRI/bone biopsy, infectious disease consult, 6-12 week antibiotics

4. **Vascular Surgery Referral**:
   - Trigger: Arterial ulcer + ABI <0.5 OR non-healing venous ulcer despite compression
   - Action: Urgent vascular surgery consult, ankle-brachial index (ABI), arterial duplex

5. **Endocrinology Referral**:
   - Trigger: Diabetic foot ulcer + HbA1c >9% OR recurrent ulcers
   - Action: Endocrinology consult, diabetes education, continuous glucose monitoring

6. **Nutrition Referral**:
   - Trigger: Albumin <3.5 g/dL OR prealbumin <15 mg/dL OR BMI <18.5
   - Action: Nutrition consult, high-protein diet, supplementation

7. **Podiatry Referral**:
   - Trigger: Diabetic foot ulcer + neuropathy (monofilament test failed) OR structural deformity
   - Action: Podiatry consult, offloading device (total contact cast, walking boot)

#### Dressing Selection Decision Tree (5-Level Algorithm)

**Level 1: Wound Bed Preparation**
- If necrotic tissue (eschar, slough) >50%: Debridement required → Sharp debridement or enzymatic debrider (collagenase)

**Level 2: Moisture Management**
- If dry wound: Hydrogel (moisture donation)
- If moist wound: Foam, alginate (moisture absorption)
- If copious exudate: Superabsorbent, negative pressure wound therapy (NPWT/VAC)

**Level 3: Infection Control**
- If infected: Silver-impregnated dressing (Aquacel Ag), cadexomer iodine
- If biofilm suspected: Antimicrobial (polyhexamethylene biguanide, PHMB), honey

**Level 4: Granulation Promotion**
- If clean wound bed, stalled healing: Collagen dressing, growth factors (PDGF)

**Level 5: Epithelialization Support**
- If epithelializing: Transparent film, non-adherent contact layer, low-adherence silicone

**200+ Dressing Types** categorized in database by:
- Primary function (moisture donation, absorption, infection control)
- Material (hydrocolloid, hydrogel, foam, alginate, collagen, transparent film, gauze)
- Antimicrobial agent (silver, iodine, honey, PHMB)
- Form factor (sheet, rope/packing, powder, gel)

#### Photo Documentation Standards (HIPAA-Compliant)

**Capture Requirements**:
- Distance: 30 cm (12 inches) from wound
- Ruler inclusion: ANSI-standardized wound ruler in frame
- Lighting: Natural or adjustable LED, no shadows
- Angle: Perpendicular to wound surface
- Background: Neutral color drape

**Metadata Standards**:
- Patient ID (encrypted), date/time stamp
- Body part, laterality, orientation (12 o'clock = cranial)
- Photographer name
- Camera/device metadata (resolution, focal length)

**Security**:
- At rest: AES-256 encryption
- In transit: TLS 1.3
- Access: Signed URLs with 1-hour expiry
- Audit: Complete access logging

**Retention**:
- Active wounds: All photos retained
- Healed wounds: 3 years post-closure (benign), 7 years (litigation risk)
- Research: Permanent with de-identification and consent

#### Healing Progression Calculation

**Weekly Area Reduction** (target: 10-15%):
```
Area_reduction = (Area_baseline - Area_current) / Area_baseline × 100%
```
- Week 2-4: Expect 10-15% reduction per week
- <5% per week for 2+ weeks = stalled healing → reassess treatment

**Expected Healing Time** (based on wound type):
- Pressure ulcer Stage II: 2-4 weeks
- Pressure ulcer Stage III: 1-4 months
- Pressure ulcer Stage IV: 3-6 months
- Diabetic foot ulcer: 3-6 months
- Venous leg ulcer: 3-6 months
- Arterial ulcer: Variable (depends on revascularization)

**Closure Documentation**:
- Date of complete re-epithelialization
- Time to closure (weeks)
- Treatment modalities used
- Complications encountered

#### Implementation Roadmap (12 Weeks)

**Phase 1: Core Data Model (Weeks 1-2)**
- 16 core tables with indexes
- Wound registration workflow
- Basic assessment form (TIME/MEASURE)

**Phase 2: Assessment Workflows (Weeks 3-4)**
- PUSH, Braden, BWAT calculators
- Photo upload with metadata capture
- Measurement tools (L×W×D, area calculation)
- Tissue composition percentage entry

**Phase 3: Clinical Intelligence (Weeks 5-6)**
- 7 clinical decision support rules
- Infection detection algorithm
- Stalled healing alerts
- Automated specialist referral routing

**Phase 4: Monitoring & Trending (Weeks 7-8)**
- Healing rate calculation (weekly area reduction)
- Wound progression timeline visualization
- Complication tracking workflows

**Phase 5: Integration (Weeks 9-10)**
- PACS integration for imaging (X-ray, MRI for osteomyelitis)
- Lab integration (albumin, prealbumin, ESR, CRP)
- Consultation workflows (vascular, infectious disease, endocrinology, podiatry, nutrition)

**Phase 6: Reporting & Analytics (Weeks 11-12)**
- Wound care dashboards (caseload, healing rates, complication rates)
- Quality metrics (time to closure, infection rates)
- Compliance reporting (documentation completeness)

#### Unresolved Questions

1. Photo AI measurement accuracy - acceptable error margin for clinical safety?
2. Healing trajectory prediction - AI-based early intervention recommendations?
3. PACS integration scope - full imaging repository or photo-only?
4. Specialist referral routing - automatic or clinical judgment for borderline cases?
5. Photo retention period - encrypted metadata storage post-closure?
6. Multi-wound tracking - individual workflows or consolidated dashboard?
7. Biofilm detection - non-invasive clinical indicators for EHR alerts?

---

### 6. CARDIOLOGY

**Why Tier 2:**
- Highest complexity (8 risk calculators, device monitoring, GDMT tracking)
- 16-week implementation timeline
- Requires external integrations (ECG, device remote monitoring)
- High reimbursement potential (chronic care management)

**Research Location**: `/Users/developer/Projects/EHRConnect/.claude/skills/research/plans/cardiology-pack/`

#### Clinical Coverage (6 Phases)

1. **Consultation & Triage**: CCS angina classification, symptom assessment
2. **Diagnostic Workup**: ECG, echo, stress testing, catheterization (3-tier model)
3. **Diagnosis & Planning**: Coded diagnoses, severity staging, guideline-based pathways
4. **Medication Management**: GDMT optimization with automated titration tracking
5. **Intervention Tracking**: PCI, CABG, ablation, device implants
6. **Monitoring**: Short-term (post-procedure) and long-term (ongoing management)

#### Database Architecture (15+ Core Tables)

**Consultations & Diagnoses**:
1. `cardiology_consultations` - Initial/follow-up consultations
2. `cardiology_diagnoses` - ICD-10, severity, onset date

**Diagnostic Studies**:
3. `cardiology_ecg_studies` - 12-lead ECG, rhythm strips, Holter, event recorder
4. `cardiology_echocardiograms` - TTE/TEE, LVEF, wall motion, valves, chamber sizes
5. `cardiology_stress_tests` - Exercise ECG, nuclear stress, stress echo, Duke Treadmill Score
6. `cardiology_catheterizations` - Coronary angiography, PCI, stent placement, FFR, IVUS

**Risk Assessments**:
7. `cardiology_risk_assessments` - Multi-calculator repository

**Heart Failure Management**:
8. `cardiology_heart_failure_management` - NYHA class, GDMT tracking, fluid status

**Device Registry**:
9. `cardiology_device_registry` - Pacemakers, ICDs, CRT with remote monitoring
10. `cardiology_device_interrogations` - Interrogation reports, arrhythmia episodes

**Arrhythmias & Anticoagulation**:
11. `cardiology_arrhythmias` - AFib, VT, VF episodes
12. `cardiology_anticoagulation` - Warfarin, DOACs, INR tracking

**Procedures**:
13. `cardiology_procedures` - PCI, ablation, device implants, cardioversion

**Medications**:
14. `cardiology_medications` - Cardiology-specific medication tracking (statins, GDMT)

**Labs & Vitals**:
15. `cardiology_labs` - Troponin, BNP, lipid panel, HbA1c
16. `cardiology_vital_signs` - BP, HR, weight (daily for heart failure)

#### 8 Essential Risk Calculators

**1. ASCVD Risk Calculator (2013 ACC/AHA)**: 10-year risk (%)
- **Inputs**: Age (40-75), sex, race (white/black/other), total cholesterol, HDL, systolic BP, BP treatment (yes/no), diabetes (yes/no), smoker (yes/no)
- **Formula**: Cox regression model (race-specific coefficients)
- **Interpretation**:
  - <5%: Low risk
  - 5-7.4%: Borderline risk
  - 7.5-19.9%: Intermediate risk
  - ≥20%: High risk
- **Clinical Actions**:
  - ≥7.5%: High-intensity statin (atorvastatin 40-80mg, rosuvastatin 20-40mg)
  - LDL targets: <70 mg/dL (very high risk), <55 mg/dL (extreme risk)

**2. CHA2DS2-VASc (AFib Stroke Risk)**: 0-9 score
- **C**ongestive heart failure (1 point)
- **H**ypertension (1 point)
- **A**ge ≥75 (2 points)
- **D**iabetes (1 point)
- **S**troke/TIA/thromboembolism history (2 points)
- **V**ascular disease (1 point)
- **A**ge 65-74 (1 point)
- **S**ex category (female, 1 point)
- **Interpretation**:
  - 0: 0% annual stroke risk, consider no anticoagulation
  - 1: 1.3% risk, consider anticoagulation (men), no anticoagulation (women with only sex point)
  - 2: 2.2% risk, anticoagulation recommended
  - ≥3: Anticoagulation strongly recommended
- **Clinical Actions**:
  - Score ≥2 (men) or ≥3 (women): Initiate anticoagulation (DOAC preferred: apixaban, rivaroxaban, dabigatran, edoxaban)

**3. HAS-BLED (Bleeding Risk on Anticoagulation)**: 0-9 score
- **H**ypertension (SBP >160, 1 point)
- **A**bnormal renal function (dialysis, transplant, Cr ≥2.6, 1 point)
- **A**bnormal liver function (cirrhosis, bilirubin >2×, AST/ALT >3×, 1 point)
- **S**troke history (1 point)
- **B**leeding history or predisposition (1 point)
- **L**abile INR (TTR <60% if on warfarin, 1 point)
- **E**lderly (age >65, 1 point)
- **D**rugs (antiplatelet, NSAIDs, 1 point) or alcohol (≥8 drinks/week, 1 point)
- **Interpretation**:
  - 0-2: Low risk (1-3% annual major bleed)
  - ≥3: High risk (>4% annual major bleed)
- **Clinical Actions**:
  - Score ≥3: Address modifiable risk factors (BP control, avoid NSAIDs), closer monitoring, but anticoagulation still recommended if CHA2DS2-VASc ≥2

**4. GRACE Score (ACS Mortality Risk)**: 0-250+
- **Inputs**: Age, heart rate, systolic BP, creatinine, cardiac arrest at admission, ST deviation, elevated cardiac markers, Killip class
- **Interpretation**:
  - <109: Low risk (in-hospital mortality <1%, 6-month mortality <3%)
  - 109-140: Intermediate risk (1-3% in-hospital, 3-8% 6-month)
  - >140: High risk (>3% in-hospital, >8% 6-month)
- **Clinical Actions**:
  - High risk: Early invasive strategy (cardiac catheterization within 24 hours), intensive medical therapy, cardiac care unit

**5. TIMI Risk Score (STEMI: 0-14, NSTEMI: 0-7)**:
- **STEMI TIMI**: Age ≥75 (3 points), 65-74 (2 points), diabetes/HTN/angina (1 point), SBP <100 (3 points), HR >100 (2 points), Killip II-IV (2 points), weight <67kg (1 point), anterior MI or LBBB (1 point), time to treatment >4 hours (1 point)
  - 0-1: Low risk (0.8% 30-day mortality)
  - 6-8: Intermediate risk (12% 30-day mortality)
  - >8: High risk (36% 30-day mortality)
- **NSTEMI TIMI**: Age ≥65 (1 point), ≥3 CAD risk factors (1 point), known CAD (1 point), ASA use in past 7 days (1 point), severe angina (1 point), ST deviation (1 point), elevated cardiac markers (1 point)
  - 0-2: Low risk (5% event rate)
  - 5-7: High risk (41% event rate)

**6. Framingham Risk Score**: CHD risk (10-year %)
- **Inputs**: Age, sex, total cholesterol, HDL, systolic BP, BP treatment, smoker, diabetes
- **Interpretation**: <10% low, 10-20% intermediate, >20% high
- **Clinical Actions**: Similar to ASCVD, statin therapy for ≥10% risk

**7. Wells Score (DVT/PE Probability)**:
- **DVT Wells**: Active cancer (1), paralysis (1), recent bedrest (1), localized tenderness (1), entire leg swollen (1), calf swelling >3cm (1), pitting edema (1), collateral veins (1), alternative diagnosis less likely (2)
  - ≤0: Low probability, D-dimer
  - 1-2: Moderate probability, D-dimer or imaging
  - ≥3: High probability, imaging (venous ultrasound)
- **PE Wells**: Clinical DVT signs (3), alternative less likely (3), HR >100 (1.5), immobilization/surgery (1.5), previous DVT/PE (1.5), hemoptysis (1), cancer (1)
  - ≤4: Unlikely, D-dimer
  - >4: Likely, imaging (CT pulmonary angiography)

**8. EuroSCORE II (Cardiac Surgery Mortality Risk)**: % mortality
- **Inputs**: Patient-related (age, sex, creatinine clearance, extracardiac arteriopathy, poor mobility, previous cardiac surgery, chronic lung disease, active endocarditis, critical preop state, diabetes on insulin, NYHA class)
- **Inputs**: Cardiac-related (CCS angina class, LV function, recent MI, pulmonary hypertension)
- **Inputs**: Operation-related (urgency, weight of intervention, surgery on thoracic aorta)
- **Interpretation**: <2% low risk, 2-5% medium risk, >5% high risk
- **Clinical Actions**: High risk → optimize pre-op, consider TAVR/MitraClip if appropriate

#### Heart Failure GDMT (Guideline-Directed Medical Therapy)

**All 4 Medication Classes** (2024 ACC/AHA Guidelines):

1. **RAS Inhibition** (Renin-Angiotensin System):
   - **Preferred**: ARNI (Sacubitril/Valsartan, Entresto)
     - Target dose: 97/103 mg BID
   - **Alternative**: ACE-I (Lisinopril, Enalapril, Captopril) or ARB (Losartan, Valsartan)
   - **Monitoring**: Potassium, creatinine, BP

2. **Beta-Blocker**:
   - **Carvedilol**: Target 25 mg BID (or 50 mg BID if >85 kg)
   - **Metoprolol Succinate**: Target 200 mg daily
   - **Bisoprolol**: Target 10 mg daily
   - **Monitoring**: Heart rate (target 50-60 bpm), BP, symptoms

3. **Mineralocorticoid Receptor Antagonist (MRA)**:
   - **Spironolactone**: 25-50 mg daily
   - **Eplerenone**: 50 mg daily
   - **Monitoring**: Potassium (avoid if K+ >5.0), creatinine

4. **SGLT2 Inhibitor**:
   - **Dapagliflozin**: 10 mg daily
   - **Empagliflozin**: 10 mg daily
   - **Monitoring**: Volume status, renal function

**Titration Strategy**:
- Start all 4 classes simultaneously at low doses
- Up-titrate every 2 weeks to target doses
- Monitor potassium, creatinine, BP, HR at each titration
- Goal: Maximize doses tolerated by patient

**NYHA Classification**:
- **Class I**: No limitation, ordinary activity does not cause symptoms
- **Class II**: Slight limitation, comfortable at rest, ordinary activity causes symptoms
- **Class III**: Marked limitation, comfortable at rest, less than ordinary activity causes symptoms
- **Class IV**: Unable to carry on any activity without symptoms, symptoms at rest

**ACC/AHA Staging**:
- **Stage A**: At risk (HTN, diabetes, CAD), no structural heart disease
- **Stage B**: Structural heart disease (LV dysfunction, valvular disease), no symptoms
- **Stage C**: Symptomatic heart failure
- **Stage D**: Refractory heart failure, requiring advanced therapies (LVAD, transplant, hospice)

**Ejection Fraction Categories**:
- **HFrEF**: EF <40% (reduced ejection fraction, GDMT applies)
- **HFmrEF**: EF 40-49% (mildly reduced, some GDMT benefit)
- **HFpEF**: EF ≥50% (preserved ejection fraction, SGLT2 inhibitor + diuretics)

#### Cardiac Device Monitoring (IHE IDCO Integration)

**IHE IDCO (Integrating the Healthcare Enterprise - Implantable Device Cardiac Observation)**:
- **Standard**: HL7 V2 messages or HL7 CDA (Clinical Document Architecture)
- **Data Exchange**: Automated import of device interrogation reports

**Device Types**:
- **Pacemakers**: Dual-chamber (DDD), single-chamber (VVI, AAI), biventricular (CRT-P)
- **ICDs**: Single-chamber, dual-chamber, CRT-D (cardiac resynchronization therapy + defibrillator)
- **Remote Monitoring Vendors**: Medtronic Carelink, Boston Scientific Latitude, Abbott Merlin, Biotronik Home Monitoring

**Interrogation Data**:
- **Arrhythmia Episodes**: AFib burden (% time in AFib), VT/VF episodes, ATP (anti-tachycardia pacing) events
- **Shocks Delivered**: Appropriate vs inappropriate shocks
- **Lead Integrity**: Impedance, sensing, pacing threshold
- **Battery Status**: Voltage, estimated longevity, ERI (elective replacement indicator), EOL (end of life)
- **Pacing Percentages**: Atrial pacing %, ventricular pacing % (target >95% for CRT)

**Clinical Actions**:
- AFib burden >6 minutes/day: Anticoagulation evaluation (CHA2DS2-VASc)
- Battery EOL: Schedule device replacement
- Lead malfunction (impedance out of range): Urgent evaluation, possible lead extraction/replacement
- Frequent ICD shocks: Antiarrhythmic medication, catheter ablation consideration

#### Clinical Decision Support Rules (8+)

1. **Acute Chest Pain Alert**:
   - Trigger: Chest pain + GRACE/TIMI auto-calculated high risk
   - Action: CRITICAL alert, urgent cardiac catheterization recommendation, activate cath lab team

2. **Atrial Fibrillation Anticoagulation**:
   - Trigger: AFib diagnosis documented + CHA2DS2-VASc auto-calculated ≥2 (men) or ≥3 (women)
   - Action: Anticoagulation recommendation (apixaban, rivaroxaban), HAS-BLED auto-calculated

3. **Heart Failure GDMT Optimization**:
   - Trigger: HFrEF diagnosis (EF <40%) + <4 medication classes at target doses
   - Action: GDMT checklist, medication initiation prompts, 4-week follow-up labs (potassium, creatinine, BNP)

4. **High ASCVD Risk Statin**:
   - Trigger: ASCVD 10-year risk ≥7.5% + no statin prescribed
   - Action: High-intensity statin recommendation (atorvastatin 40-80mg, rosuvastatin 20-40mg), LDL target <70 mg/dL

5. **CRT Candidacy**:
   - Trigger: HFrEF (EF ≤35%) + wide QRS (≥150ms) + NYHA Class II-IV
   - Action: CRT evaluation recommendation, electrophysiology referral

6. **Post-MI Secondary Prevention Bundle**:
   - Trigger: Recent MI (within 1 year) documented
   - Action: Medication bundle check (dual antiplatelet for 12 months, beta-blocker, ACE-I, high-intensity statin), cardiac rehab referral

7. **Syncope Evaluation**:
   - Trigger: Syncope documented + normal ECG + no structural heart disease
   - Action: Arrhythmia evaluation, event monitor recommendation (30-day)

8. **Device Battery EOL Alert**:
   - Trigger: Device interrogation shows EOL or ERI
   - Action: Schedule device replacement within 3 months

#### Implementation Roadmap (16 Weeks, 4 Phases)

**Phase 1: Database Schema & Risk Calculators (Weeks 1-4)**
- 15+ core tables
- 8 risk calculator backend services (ASCVD, CHA2DS2-VASc, HAS-BLED, GRACE, TIMI, Framingham, Wells, EuroSCORE II)
- Basic consultation and diagnosis forms
- FHIR Observation resources for labs and vitals

**Phase 2: Diagnostic Studies (Weeks 5-8)**
- ECG integration (DICOM-based or HL7 waveform)
- Echocardiography structured reporting (LVEF, wall motion, valves)
- Stress test documentation with Duke Treadmill Score
- Catheterization procedure notes with coronary anatomy mapping

**Phase 3: Clinical Decision Support (Weeks 9-12)**
- 8+ CDS rule implementations (see above)
- Heart failure GDMT tracking with titration prompts
- Anticoagulation management workflows
- Medication interaction checking

**Phase 4: Device Monitoring & Integration (Weeks 13-16)**
- Device registry implementation
- IHE IDCO remote monitoring integration (Medtronic, Boston Scientific, Abbott, Biotronik)
- Automated interrogation report import
- Arrhythmia episode tracking and alerts

**MVP Target**: 16 weeks for complete cardiology specialty pack

#### Unresolved Questions

1. ECG integration approach - DICOM storage vs HL7 waveform vs third-party viewer?
2. Remote device monitoring priorities - which vendors first (Medtronic, Boston Scientific, Abbott, Biotronik)?
3. Catheterization report structured data extraction - manual entry vs NLP?
4. Heart failure fluid management - daily weight integration (Bluetooth scales)?
5. Cardiac rehab integration - bidirectional scheduling and progress tracking?
6. Anticoagulation clinic workflows - INR management for warfarin patients?
7. Arrhythmia episode event correlation - match device episodes to symptoms in diary?
8. Device recall notifications - FDA MAUDE integration for proactive patient outreach?

---

## Implementation Priorities & Dependencies

### Recommended Implementation Order

**Year 1 - Q1-Q2 (Parallel Track A + B)**:
1. **Track A**: **Pediatrics** (8-9 weeks) + **Mental Health Phase 1-2** (10-14 weeks)
   - Justification: Natural extension from OB/GYN maternal care, completes family care continuum
   - Pediatrics integrates with OB/GYN baby linkage (already implemented)
   - Mental Health Phase 1-2 provides assessment tools that integrate with Pediatrics HEADSS (adolescent screening)

2. **Track B**: **Dermatology** (8-10 weeks)
   - Justification: Simple data model, quick win, photo architecture reusable for Wound Care
   - Can run in parallel with Pediatrics (minimal architectural overlap)

**Year 1 - Q3 (Sequential)**:
3. **Mental Health Phase 3-4** (12-16 weeks, completes 28-week total)
   - Justification: Completes mental health module started in Q1-Q2, integrates with completed Pediatrics

**Year 1 - Q4 / Year 2 - Q1 (Parallel Track C + D)**:
4. **Track C**: **Orthopedics** (10+ weeks)
   - Justification: Referenced in project docs, surgical tracking experience applicable to other specialties

5. **Track D**: **Wound Care** (12 weeks)
   - Justification: Reuses photo architecture from Dermatology, moderate complexity

**Year 2 - Q2-Q3**:
6. **Cardiology** (16 weeks)
   - Justification: Highest complexity, requires ECG/device integration, save for when team has experience with complex integrations

### Dependency Matrix

| Specialty | Depends On | Why |
|-----------|-----------|-----|
| **Pediatrics** | OB/GYN | Baby linkage, maternal health history import |
| **Dermatology** | None | Standalone, photo architecture foundation |
| **Mental Health** | Pediatrics (optional) | HEADSS adolescent screening integration |
| **Orthopedics** | None | Standalone, implant registry is independent |
| **Wound Care** | Dermatology | Reuses photo management architecture |
| **Cardiology** | None | Standalone, but benefits from team's integration experience |

### Technical Reusability

| Feature | Source Specialty | Reused By |
|---------|------------------|-----------|
| **Baby Linkage** | OB/GYN | Pediatrics (newborn linkage) |
| **Photo Management (HIPAA)** | Dermatology | Wound Care (wound photos), Orthopedics (surgical site photos) |
| **Assessment Framework** | OB/GYN (EPDS) | Mental Health (PHQ-9, GAD-7, etc.), Pediatrics (HEADSS, Denver II) |
| **Risk Assessment Calculators** | OB/GYN (OHSS risk, trigger readiness) | Cardiology (ASCVD, GRACE, TIMI), Orthopedics (Caprini DVT), Wound Care (Braden) |
| **Episode Management** | OB/GYN | All specialties (episode-based care tracking) |
| **Clinical Decision Support** | OB/GYN (MFM referral triggers) | All specialties (specialty-specific CDS rules) |
| **Timeline Visualization** | OB/GYN (pregnancy timeline) | Pediatrics (growth timeline), Orthopedics (rehab progression), Wound Care (healing timeline) |
| **Flowsheet Pattern** | OB/GYN (prenatal flowsheet) | Cardiology (heart failure monitoring), Wound Care (wound assessment flowsheet) |

---

## Resource Requirements

### Development Team Structure

**Option A: Sequential Implementation (1 Team)**:
- 1 Full-Stack Developer (backend + frontend)
- 1 Clinical Advisor (part-time, 10 hours/week)
- 1 QA Engineer (part-time, 20 hours/week)
- **Timeline**: 83 weeks (~19 months)

**Option B: Parallel Implementation (2 Teams)**:
- Team 1: Pediatrics + Mental Health + Dermatology
- Team 2: Orthopedics + Wound Care + Cardiology
- Each team: 1 Full-Stack Developer, 0.5 Clinical Advisor, 0.5 QA Engineer
- **Timeline**: 42 weeks (~10 months)

**Option C: Aggressive Parallel (3 Teams)**:
- Team 1: Pediatrics (8-9 weeks)
- Team 2: Dermatology (8-10 weeks)
- Team 3: Mental Health (28 weeks, phased)
- Then regroup for Orthopedics, Wound Care, Cardiology
- **Timeline**: 28 weeks (~6.5 months) for Tier 1, then 16 weeks for Tier 2 = 44 weeks total

### Clinical Advisory Needs

| Specialty | Clinical Advisor Role | Time Commitment |
|-----------|----------------------|-----------------|
| Pediatrics | Pediatrician | 10 hours/week for 8 weeks |
| Dermatology | Dermatologist | 10 hours/week for 8 weeks |
| Mental Health | Psychiatrist/Psychologist | 10 hours/week for 28 weeks |
| Orthopedics | Orthopedic Surgeon | 10 hours/week for 10 weeks |
| Wound Care | Wound Care Nurse (CWCN) | 10 hours/week for 12 weeks |
| Cardiology | Cardiologist | 10 hours/week for 16 weeks |

### Infrastructure & Integration Needs

| Integration | Specialties Using | Timeline | Notes |
|-------------|-------------------|----------|-------|
| **PACS (Imaging)** | Dermatology, Orthopedics, Wound Care, Cardiology | Q1-Q2 | DICOM-based, reusable across specialties |
| **ECG System** | Cardiology | Q2-Q3 Year 2 | DICOM waveform or HL7, vendor-specific |
| **Device Remote Monitoring** | Cardiology | Q2-Q3 Year 2 | IHE IDCO standard, multiple vendors |
| **Lab Interface (HL7)** | All specialties | Q1 | Core infrastructure, priority #1 |
| **State Immunization Registry (IIS)** | Pediatrics | Q1-Q2 | State-specific, phased rollout |
| **AJRR (Joint Registry)** | Orthopedics | Q4-Q1 Year 2 | Annual submission, export format |
| **Pathology Interface** | Dermatology | Q1-Q2 | HL7 ORU messages for biopsy results |

---

## Success Metrics & KPIs

### Clinical Quality Metrics

| Specialty | Key Metric | Target |
|-----------|-----------|--------|
| Pediatrics | Immunization up-to-date rate | ≥95% |
| Pediatrics | Developmental screening completion rate | ≥80% at well-visits |
| Dermatology | Biopsy result communication within 7 days | 100% |
| Mental Health | PHQ-9/GAD-7 administration rate | ≥80% at visits |
| Mental Health | Safety plan completion rate (high-risk patients) | 100% |
| Orthopedics | AJRR data submission completeness | 100% Level 1, ≥90% Level 2 |
| Wound Care | Healing rate documentation | ≥90% weekly assessments |
| Wound Care | Infection detection within 48 hours | ≥95% |
| Cardiology | ASCVD risk calculator usage for eligible patients | ≥90% |
| Cardiology | Heart failure GDMT 4-class usage | ≥80% HFrEF patients |

### Technical Performance Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Page load time | <2 seconds | All specialty dashboards |
| Assessment calculator response | <500ms | All risk calculators |
| Photo upload & encryption | <10 seconds | 10 MB image, AES-256 |
| Database query latency | <100ms | P95 for all specialty queries |
| CDS rule evaluation | <1 second | Real-time rule execution |
| API uptime | ≥99.9% | All specialty endpoints |

### Adoption Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Clinician training completion | 100% | Within 2 weeks of launch |
| First specialty visit documented | ≥50% of eligible patients | Within 4 weeks of launch |
| Assessment tool usage | ≥70% of visits | Within 8 weeks of launch |
| Photo documentation rate (Derm/Wound) | ≥60% of lesions/wounds | Within 8 weeks of launch |
| Patient portal engagement | ≥40% active users | Within 12 weeks of launch |

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|----------|
| **Photo storage scalability** (Derm, Wound) | Medium | High | Implement S3/Azure with CDN, compression, tiered storage (hot/cold) |
| **ECG integration complexity** (Cardiology) | High | High | Use DICOM standard, third-party viewer (ECGVIEW), phased vendor rollout |
| **Device remote monitoring fragmentation** | High | Medium | Prioritize top 2 vendors (Medtronic, Boston Scientific), IHE IDCO standard |
| **Assessment calculator accuracy** | Low | Critical | Clinical validation, unit tests with edge cases, published algorithm verification |
| **HIPAA photo compliance** (Derm, Wound) | Low | Critical | AES-256 encryption, signed URLs, complete audit trails, annual security audit |
| **Database performance with 99+ tables** | Medium | High | Indexing optimization, query performance testing, database sharding for large orgs |

### Clinical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|----------|
| **Suicide risk missed** (Mental Health) | Low | Critical | C-SSRS required for all assessments, automated safety planning, hard stop if high risk |
| **Immunization error** (Pediatrics) | Low | High | CDC schedule validation, lot number verification, duplicate dose alerts |
| **Implant tracking error** (Orthopedics) | Low | High | UDI barcode scanning, AJRR validation rules, duplicate implant alerts |
| **Wound infection missed** (Wound Care) | Medium | High | Automated infection detection algorithm, daily reassessment prompts, specialist referral triggers |
| **ASCVD risk miscalculation** (Cardiology) | Low | High | Algorithm validation against published data, edge case testing, clinical override option |

### Regulatory Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|----------|
| **HIPAA photo violation** | Low | Critical | Encryption, access controls, audit trails, staff training, annual security assessment |
| **State immunization registry non-compliance** | Medium | Medium | HL7 V2.5.1 standard, state-specific validation, phased rollout, registry testing |
| **AJRR submission failure** | Low | Medium | Export format validation, test submissions, backup manual entry process |
| **Minor consent laws (Mental Health, Pediatrics)** | Medium | High | State-specific consent workflows, legal review, confidentiality flags, portal access rules |
| **Controlled substance prescribing** (Mental Health) | Medium | High | EPCS compliance (DEA two-factor), PDMP integration, state-specific regulations |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|----------|
| **Insufficient clinical advisory time** | High | High | Secure advisors early, flexible schedules, compensate fairly, backup advisors |
| **Team attrition during 19-month timeline** | Medium | High | Parallel teams (reduce timeline), knowledge documentation, cross-training |
| **Scope creep beyond research scope** | High | Medium | Change control process, prioritization framework, MVP definition strict adherence |
| **Integration delays from third parties** | High | High | Early vendor engagement, backup integration options, manual workarounds for MVP |

---

## Unresolved Strategic Questions

### Business Decisions Required

1. **Specialty Prioritization**:
   - Which specialties align with target market demand?
   - Any existing customer requests for specific specialties?
   - Reimbursement potential per specialty (chronic care management codes)?

2. **Go-to-Market Strategy**:
   - Bundle all 6 specialties in enterprise license?
   - À la carte specialty selection with modular pricing?
   - Tiered packages (Basic: Pediatrics + Mental Health, Advanced: All 6)?

3. **Integration Priorities**:
   - Which state immunization registries first (top 5 states by patient volume)?
   - Lab interface vendors (Quest, LabCorp, regional labs)?
   - ECG vendors (GE, Philips, Welch Allyn, Mortara)?
   - Device monitoring vendors (Medtronic, Boston Scientific, Abbott, Biotronik - order?)?

4. **Resource Allocation**:
   - Parallel implementation (2-3 teams, 10-month timeline) vs sequential (1 team, 19-month timeline)?
   - Clinical advisory budget allocation per specialty?
   - QA resourcing (dedicated QA engineer or shared across projects)?

5. **Regulatory Strategy**:
   - State-specific workflows for minor consent (which states first)?
   - EPCS (e-prescribing controlled substances) - DEA registration for all providers or opt-in?
   - State immunization registry opt-in vs mandatory?
   - AJRR joint registry - automatic enrollment or opt-in per surgeon?

### Technical Architecture Decisions

1. **Photo Storage**:
   - AWS S3, Azure Blob, Google Cloud Storage, or self-hosted?
   - CDN for photo delivery (CloudFlare, AWS CloudFront)?
   - Tiered storage (hot/cold) for cost optimization?

2. **PACS Integration**:
   - Third-party DICOM viewer (OHIF, Weasis, Horos) or build custom?
   - PACS vendors to prioritize (GE, Philips, Agfa, Sectra)?
   - Store-and-forward vs real-time integration?

3. **Assessment Calculators**:
   - Client-side (JavaScript) vs server-side (Node.js) calculation?
   - Third-party libraries (MDCalc API) vs custom implementation?
   - Caching strategy for growth percentile lookups (Redis)?

4. **ECG Integration** (Cardiology):
   - DICOM waveform storage vs HL7 aECG vs third-party API?
   - Real-time ECG monitoring (for stress tests) or batch import only?
   - AI-assisted ECG interpretation (FDA-cleared algorithm) or manual only?

5. **Device Remote Monitoring** (Cardiology):
   - IHE IDCO standard implementation (HL7 V2 or CDA)?
   - Direct vendor integration (Medtronic Carelink API, etc.) or HL7 middleman?
   - Real-time alerts vs batch overnight imports?

### Clinical Workflow Questions

1. **Pediatrics**:
   - Early intervention program integration (IDEA Part C) - manual referral or automated?
   - School records IEP/504 plan import - data format standards?
   - Transition planning (18-21 to adult care) - handoff protocols?
   - Newborn screening panels - state-specific customization or national panel?

2. **Dermatology**:
   - Teledermatology workflows - store-and-forward only or synchronous video?
   - Mole mapping - manual body map or automated AI segmentation?
   - Comparative lesion analysis - provider-driven or AI-assisted change detection?

3. **Mental Health**:
   - Group therapy management - attendance tracking, co-payment splitting?
   - Peer support specialist documentation - how to track?
   - Substance use treatment - integration with SAMHSA-certified programs?
   - Telepsychiatry - DEA prescribing across state lines (Ryan Haight Act compliance)?

4. **Orthopedics**:
   - ROM measurement - manual goniometer entry or digital sensor integration (e.g., smartphone apps)?
   - PT/OT scheduling - bidirectional integration with external therapy providers?
   - Pre-op optimization protocols - bundled care pathways or individual care plans?

5. **Wound Care**:
   - Photo AI measurement - acceptable error margin for clinical safety?
   - Healing trajectory prediction - AI-based early intervention recommendations?
   - Multi-wound tracking - individual workflows or consolidated dashboard?

6. **Cardiology**:
   - Cardiac rehab integration - bidirectional scheduling and progress tracking?
   - Anticoagulation clinic - INR management for warfarin patients (dedicated module)?
   - Arrhythmia episode correlation - match device episodes to patient symptom diary?

---

## Next Steps & Action Items

### Immediate Actions (Week 1-2)

1. **Stakeholder Review**:
   - [ ] Executive team reviews Master Implementation Plan
   - [ ] Clinical advisory team reviews specialty research for each specialty (6 reviews)
   - [ ] Technical architecture team reviews database schemas and integration requirements
   - [ ] Product management prioritizes specialties based on market demand

2. **Strategic Decisions**:
   - [ ] Approve specialty implementation order (Tier 1 vs sequential)
   - [ ] Approve resource allocation (1 team sequential vs 2-3 teams parallel)
   - [ ] Approve integration priorities (state registries, labs, ECG, devices)
   - [ ] Approve go-to-market strategy (bundled vs à la carte vs tiered)

3. **Clinical Validation**:
   - [ ] Engage pediatrician for Pediatrics research validation
   - [ ] Engage dermatologist for Dermatology research validation
   - [ ] Engage psychiatrist for Mental Health research validation
   - [ ] Engage orthopedic surgeon for Orthopedics research validation
   - [ ] Engage wound care nurse (CWCN) for Wound Care research validation
   - [ ] Engage cardiologist for Cardiology research validation

4. **Technical Planning**:
   - [ ] Database architect reviews 99+ table schemas across all specialties
   - [ ] Backend architect designs service layer for each specialty
   - [ ] Frontend architect designs component library and specialty dashboards
   - [ ] DevOps plans infrastructure scaling (photo storage, CDN, database performance)
   - [ ] Security architect plans HIPAA compliance (encryption, audit trails, access controls)

### Short-Term Actions (Week 3-4)

1. **Team Formation**:
   - [ ] Recruit/assign full-stack developers (1-3 depending on parallel strategy)
   - [ ] Engage clinical advisors (contracts, scheduling, orientation)
   - [ ] Assign QA engineer(s) (dedicated or shared)
   - [ ] Form cross-functional working group (product, engineering, clinical)

2. **Development Environment**:
   - [ ] Set up specialty-specific development branches
   - [ ] Configure staging environment for specialty testing
   - [ ] Establish CI/CD pipelines for specialty modules
   - [ ] Create test data sets for each specialty (synthetic patient data)

3. **Vendor Engagement**:
   - [ ] Contact lab interface vendors (Quest, LabCorp) for HL7 specifications
   - [ ] Contact state immunization registries for IIS integration specs
   - [ ] Contact ECG vendors for DICOM/HL7 integration (Cardiology)
   - [ ] Contact device monitoring vendors for IHE IDCO integration (Cardiology)
   - [ ] Contact AJRR for registry submission specifications (Orthopedics)

4. **Epic/User Story Creation**:
   - [ ] Product management creates implementation epics for each specialty
   - [ ] Break down epics into user stories with acceptance criteria
   - [ ] Estimate story points for each specialty (backend, frontend, integration)
   - [ ] Create sprint plan for first specialty (Pediatrics or Dermatology)

### Medium-Term Actions (Week 5-8)

1. **Development Kickoff**:
   - [ ] Sprint 0: Architecture design, database migrations, service scaffolding
   - [ ] Sprint 1: Core entities and basic CRUD operations
   - [ ] Sprint 2: Assessment calculators and forms
   - [ ] Sprint 3: Frontend components and dashboards

2. **Clinical Workflows**:
   - [ ] Clinical advisor conducts workflow walkthroughs with development team
   - [ ] Document clinical edge cases and error handling requirements
   - [ ] Create clinical validation test cases
   - [ ] Schedule clinical pilot dates

3. **Integration Development**:
   - [ ] Lab interface development (priority for all specialties)
   - [ ] PACS integration for imaging (Dermatology, Orthopedics, Wound Care)
   - [ ] State immunization registry integration (Pediatrics)

4. **Quality Assurance**:
   - [ ] Write unit tests for assessment calculators (100% coverage requirement)
   - [ ] Write integration tests for API endpoints
   - [ ] Perform security testing (encryption, access controls, audit trails)
   - [ ] Conduct clinical validation testing with clinical advisors

---

## Conclusion

This Master Implementation Plan provides a comprehensive roadmap for implementing **6 specialty modules** in EHRConnect, with the same level of detail as the existing OB/GYN IVF component (27 tables, 7 phases).

### Key Deliverables

✅ **Comprehensive Research**: 24+ documents, 10,000+ lines, 100,000+ words
✅ **Database Architecture**: 99+ tables fully specified with SQL schemas
✅ **Clinical Workflows**: 30+ distinct workflows with phase-by-phase breakdowns
✅ **Assessment Tools**: 30+ clinical calculators with scoring algorithms
✅ **Implementation Roadmaps**: Phased timelines for each specialty (8-28 weeks)
✅ **Clinical Decision Support**: 40+ CDS rules with IF/THEN logic
✅ **Integration Requirements**: PACS, labs, ECG, devices, registries
✅ **FHIR Mappings**: FHIR R4 resource mappings for all specialties

### Implementation Timeline Summary

| Approach | Teams | Timeline | Notes |
|----------|-------|----------|-------|
| Sequential | 1 team | 83 weeks (19 months) | Lowest risk, highest cost efficiency |
| Parallel (Option B) | 2 teams | 42 weeks (10 months) | Balanced risk/speed |
| Aggressive (Option C) | 3 teams | 28-44 weeks (6.5-10 months) | Highest speed, highest risk |

### Recommended Approach

**Parallel Implementation (Option B)** - 2 Teams, 42 Weeks:
- **Track A**: Pediatrics + Mental Health (Phases 1-2)
- **Track B**: Dermatology
- **Sequential**: Mental Health (Phases 3-4), then Orthopedics + Wound Care (parallel), then Cardiology

This approach balances speed, risk, and resource efficiency while ensuring high quality and clinical validation at each stage.

---

**Status**: ✅ **MASTER PLAN COMPLETE - READY FOR STRATEGIC DECISION & DEVELOPMENT KICKOFF**

All research is complete. All specialties have been analyzed with IVF-level detail. Next steps: stakeholder review, strategic decisions, clinical validation, team formation, and development kickoff.
