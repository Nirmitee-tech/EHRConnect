# Research Report: Comprehensive Pediatrics Specialty Clinical Workflows for EHR Implementation

**Research Conducted**: December 21, 2025
**Status**: Complete
**Sources Consulted**: 22 authoritative sources (AAP, CDC, NIH, medical institutions)

---

## Executive Summary

Pediatric EHR implementation requires modeling clinical workflows across 18+ years spanning 5 distinct developmental phases: newborn (0-1mo), infant (1mo-12mo), toddler (1-3y), preschool (3-5y), school-age (5-13y), and adolescent (13-18y). Unlike OB/GYN's pregnancy-centric model, pediatrics demands age-stratified protocols with unique vital signs, growth standards, immunization schedules, developmental assessments, and risk screening tools.

Core requirement: Database schema supporting **4 workflow phases** with **28+ specialized tables** covering:
- Newborn screening & birth records
- Growth tracking (WHO 0-2y, CDC 2-20y)
- Well-child visits (22 distinct visit types across development stages)
- Complete immunization management (CDC/ACIP 2024 schedule)
- Developmental milestone tracking (Denver II framework)
- Adolescent health assessments (HEADSS protocol)
- Risk assessments (abuse, suicide, substance use)

This report details database schema, assessment templates, integration points with maternal records, and clinical decision support rules.

---

## Research Methodology

**Date Range**: Current materials Dec 2023-Dec 2025 (AAP 2024 updates, CDC ACIP 2024 schedule)
**Sources**:
- Official AAP guidelines (Bright Futures periodicity schedule, 2024 edition)
- CDC immunization schedules (ACIP 2024 updates)
- NIH developmental screening standards
- Healthcare institutions (Stanford Medicine, Cleveland Clinic, RCH Australia)
- PMC/PubMed peer-reviewed literature

**Search Terms Used**:
- AAP Bright Futures well-child visit schedules
- CDC ACIP immunization 2024 pediatric
- Denver II developmental screening
- WHO/CDC growth charts BMI percentiles
- Pediatric vital signs by age
- HEADSS adolescent assessment
- Newborn screening programs
- Pediatric EHR workflows

---

## Key Findings

### 1. Clinical Workflow Architecture

#### Phase 1: Newborn Care (Birth - 1 Month)
**Critical Events**:
- Birth record documentation (linkage from maternal OB/GYN episode)
- Newborn screening program enrollment
- Initial hospital encounter documentation
- Vital signs monitoring (highly variable baseline)
- Initial feeding assessment
- Jaundice screening (AAP phototherapy guidelines)

**Database Requirements**:
- Baby linkage to maternal record
- Birth event capture
- Newborn screening status tracking
- Hospital admission details

**Key Assessment**: First well-visit screening at 3-5 days or 7-10 days (per AAP guidelines)

#### Phase 2: Infant Care (1 Month - 12 Months)
**Well-Visit Schedule** (AAP Bright Futures 2024):
- 1 month
- 2 months
- 4 months
- 6 months
- 9 months
- 12 months

**Core Activities at Each Visit**:
- Immunizations (per CDC ACIP 2024 schedule)
- Growth monitoring (weight/length/head circumference)
- Developmental screening (Denver II at 9, 18, 30 months)
- Physical examination
- Hearing/vision screening
- Anticipatory guidance (feeding, sleep, safety)

#### Phase 3: Early Childhood (12 Months - 5 Years)
**Well-Visit Schedule**:
- 15 months
- 18 months
- 2 years (24 months)
- 2.5 years
- 3 years
- 4 years
- 5 years

**Additional Components**:
- Developmental screening (Denver II, ASQ-3 at 18, 30 months)
- Lead screening (12, 24 months per CDC)
- TB risk assessment
- Autism screening (M-CHAT at 18, 24 months)
- Behavioral assessment
- Kindergarten readiness (5 years)

#### Phase 4: School Age & Adolescent (5-18 Years)
**Well-Visit Schedule**:
- 6 years (school entry physical)
- Annual well visits (7-10 years)
- Annual well visits (11-14 years) - increased frequency for puberty monitoring
- Annual well visits (15-18 years)
- Sports physicals (as needed)

**Specialized Assessments**:
- School performance/learning assessment
- Behavioral/mental health screening
- HEADSS assessment (13+ years) covering:
  - **H**ome environment
  - **E**ducation/employment
  - **A**ctivities/peer relationships
  - **D**rug/alcohol/tobacco use
  - **S**exual history/activity
  - **S**uicidality/self-harm/mood
- Sexual health assessment
- Suicide risk screening
- Substance abuse screening
- Injury prevention counseling

### 2. Vital Signs Standards by Age (AAP/CDC Guidelines)

| Age Group | Heart Rate | Respiratory Rate | Systolic BP | Diastolic BP | Temp |
|-----------|-----------|-----------------|-----------|-----------|------|
| **Newborn (0-3mo)** | 100-160 bpm | 30-60 bpm | 60-90 mmHg | 20-60 mmHg | 97-99°F |
| **Infant (3-12mo)** | 100-160 bpm | 25-40 bpm | 80-100 mmHg | 55-65 mmHg | 97-99°F |
| **Toddler (1-3y)** | 90-150 bpm | 20-30 bpm | 95-105 mmHg | 60-70 mmHg | 98.6°F |
| **Preschool (3-5y)** | 80-120 bpm | 20-25 bpm | 95-110 mmHg | 60-75 mmHg | 98.6°F |
| **School-age (6-12y)** | 70-110 bpm | 18-22 bpm | 100-120 mmHg | 60-75 mmHg | 98.6°F |
| **Adolescent (13-18y)** | 60-100 bpm | 12-20 bpm | 100-135 mmHg | 65-85 mmHg | 98.6°F |

**Clinical Note**: Pediatric vital signs highly variable; context & trends more important than absolute values. Fever thresholds vary by age (rectal temp >100.4°F = fever for infants).

### 3. Growth Standards & BMI Percentiles (CDC/WHO 2024)

**Birth to 2 Years**: WHO standards (international reference)
- Weight-for-age: Birth to 24 months
- Length-for-age: Birth to 24 months
- Head circumference-for-age: Birth to 24 months
- Recumbent length (use for <2y, not standing height)

**Ages 2-20 Years**: CDC growth charts
- Height-for-age percentiles
- Weight-for-age percentiles
- BMI-for-age percentiles (2-19 years)

**BMI Categories (Age/Sex-Specific)**:
- **Underweight**: BMI < 5th percentile
- **Healthy weight**: BMI 5th-<85th percentile
- **Overweight**: BMI 85th-<95th percentile
- **Obesity**: BMI ≥95th percentile
- **Severe obesity**: BMI ≥120% of 95th percentile OR BMI ≥35 kg/m²

**Extended BMI Charts** (CDC 2022):
- Include 98th, 99th, 99.9th, 99.99th percentiles
- Plot up to 60 kg/m²
- Critical for adolescents with elevated BMI

**Database Implementation**: Store Z-scores, percentiles, and age-adjusted values; include decision support alerts for growth velocity abnormalities.

### 4. Immunization Management (CDC/ACIP 2024 Schedule)

**Major Vaccine Groups** (2024 Updates):

**Infancy (Birth-12 months)**:
- Hepatitis B (HepB): Birth, 1-2mo, 6-18mo
- Rotavirus (RV): 2, 4, 6mo
- Diphtheria, tetanus, pertussis (DTaP): 2, 4, 6mo, 15-18mo, 4-6y
- Haemophilus influenzae type b (Hib): 2, 4, 6mo, 12-15mo
- Pneumococcal (PCV15/PCV20): 2, 4, 6mo, 12-15mo
- Inactivated poliovirus (IPV): 2, 4, 6-18mo, 4-6y
- Influenza (IIV): 6mo+ (annual)
- Measles, mumps, rubella (MMR): 12-15mo, 4-6y
- Varicella (VAR): 12-15mo, 4-6y
- Hepatitis A (HepA): 12-23mo (2 doses)
- RSV vaccine: New 2023 (single dose, ≥60y or specific risk groups)
- COVID-19: Per latest guidance

**Major 2024 Changes**:
- **Meningococcal vaccine** (Penbraya): Ages 10-25y, serogroups A, B, C, W, Y (replaces separate vaccines)
- **Pneumococcal**: Updated recommendations for PCV15, PCV20, PPSV23 combinations
- **COVID-19**: 2023-2024 updated formula vaccines
- **IPV**: Updated formulations per new guidance

**Database Schema Requirements**:
- Track vaccine type, lot number, manufacturer, date given
- Record vaccination status (not-given/partial/complete)
- Manage medical & immunological contraindications
- Generate catch-up schedules for delayed vaccinations
- Interface with state immunization registries (IIS)

### 5. Developmental Milestone Assessment (Denver II Framework)

**Four Assessment Domains**:

1. **Gross Motor** (larger muscle movements)
   - Newborn: head lag, stepping reflex
   - 6mo: rolls over, sits with support
   - 12mo: pulls to stand, cruises
   - 18mo: walks without support
   - 24mo: runs, climbs stairs
   - 3-5y: hops, skips, rides tricycle

2. **Fine Motor-Adaptive** (hand/finger coordination, problem-solving)
   - 2mo: follows objects to midline
   - 6mo: rakes, transfers objects
   - 12mo: pincer grasp, waves bye-bye
   - 18mo: scribbles, points
   - 24mo: stacks blocks, turns pages
   - 3-5y: copies circles/squares, dresses self

3. **Language**
   - 3mo: coos
   - 6mo: babbles
   - 12mo: mama/dada, understands names
   - 18mo: 10-50 words
   - 24mo: 50-200 words, 2-word phrases
   - 3y: 3-word sentences, names colors
   - 4-5y: tells stories, asks questions

4. **Personal-Social**
   - 3mo: smiles socially
   - 6mo: regards mirror image
   - 12mo: waves bye-bye, plays pat-a-cake
   - 18mo: shows affection, imitates
   - 24mo: plays alongside peers
   - 3y: toilet training, cooperative play
   - 4-5y: follows rules, shows empathy

**AAP Screening Recommendations**:
- Screen at 9, 18, 30 months (Denver II, ASQ-3)
- Use validated tools (Denver II, ASQ-3, Parents' Evaluation of Developmental Status - PEDS)
- Follow-up for any concerns with referral to early intervention

**Database Implementation**:
- Record developmental milestones by age (standardized age ranges)
- Store assessment tool results (Denver II scores)
- Flag developmental delays (>2 months behind)
- Generate referral recommendations
- Integrate with early intervention program coordination

### 6. Ages and Stages Questionnaires (ASQ-3)

**Coverage**: 18 different versions for ages 2-60 months (at 2-month intervals)

**Five Domains Assessed**:
- Communication
- Gross Motor
- Fine Motor
- Problem-Solving
- Personal-Social

**Clinical Use**:
- Parental completion (10-15 minutes)
- Validated screening tool with high sensitivity/specificity
- Recommended at 18, 30 months per AAP
- Risk cutoff: scores indicating <-1 SD below mean suggest referral for evaluation

### 7. Newborn Screening Program (NHS)

**Mandatory Screening** (varies by state, >60 conditions screened in comprehensive programs):

**Core Panel** (recommended by ACMS):
- Sickle cell disease (Hemoglobinopathy)
- Congenital hypothyroidism (CH)
- Phenylketonuria (PKU)
- Galactosemia
- Maple syrup urine disease (MSUD)
- Homocystinuria
- Biotinidase deficiency
- Medium-chain acyl-CoA dehydrogenase deficiency (MCADD)

**Extended Screening** (available in most states):
- Cystic fibrosis (CF)
- Spinal muscular atrophy (SMA)
- Severe combined immunodeficiency (SCID)
- 30+ additional conditions via tandem mass spectrometry

**Timeline**:
- Initial screening: 24-48 hours after birth (heel stick)
- Confirmatory testing: For positive results (1-2 weeks)
- Long-term follow-up: Per condition

**Database Requirements**:
- Newborn screening order entry & tracking
- Result capture (abnormal/borderline/normal)
- Referral management for positive screens
- Follow-up appointment scheduling
- Linkage to maternal delivery record

### 8. Bright Futures Periodicity Schedule (AAP 2024)

**22 Well-Visit Age Groups** (complete schedule):

| Age | Type | Key Focus |
|-----|------|-----------|
| **Birth-1 month** | Initial visit | Birth assessment, feeding, screening |
| **1 month** | Well-visit | Feeding, growth, development check |
| **2 months** | Well-visit + Vaccines | DTaP, IPV, PCV, Hib, HepB, RV |
| **4 months** | Well-visit + Vaccines | DTaP, IPV, PCV, Hib, RV |
| **6 months** | Well-visit + Vaccines | DTaP, IPV, PCV, Hib, HepB, RV, IIV |
| **9 months** | Well-visit | Development screening (Denver II) |
| **12 months** | Well-visit + Vaccines | Hib, PCV, HepA, MMR, VAR, IIV |
| **15 months** | Well-visit | Assessment |
| **18 months** | Well-visit + Vaccines | DTaP, IPV, HepA, Development (Denver II/ASQ-3) |
| **2 years** | Well-visit | Development, behavior, safety |
| **2.5 years** | Brief visit | Anticipatory guidance |
| **3 years** | Well-visit | Preschool readiness |
| **4 years** | Well-visit | School readiness, vision/hearing |
| **5 years** | Well-visit + Sports physic | Development, school readiness |
| **6 years** | Well-visit + School physical | Entry physical |
| **7-10 years** | Annual well-visit | Growth, development, behavior |
| **11-14 years** | Annual well-visit + Vaccines | Puberty assessment, mental health, vaccines |
| **15-18 years** | Annual well-visit + Vaccines + HEADSS | Sexual health, suicide screening, vaccines |

**Each Visit Includes**:
- Physical examination (age-appropriate)
- Growth assessment (length/height, weight, HC)
- Developmental screening (selected ages)
- Vital signs
- Hearing/vision screening (selected ages)
- Immunizations (per schedule)
- Anticipatory guidance (parent education)
- Screening tools (lead, TB, behavior, mental health, substance use per age)

### 9. HEADSS Adolescent Risk Assessment (Ages 13+)

**Structured Interview Framework**:

**H - Home Environment**
- Living situation (both parents, single parent, foster, homeless)
- Relationships with family members
- Domestic violence/abuse screening
- Substance use in home
- Food security

**E - Education/Employment**
- School performance/grades
- School attendance
- Behavior/discipline issues
- Career interests
- Employment (for teens)

**A - Activities & Peers**
- Extracurricular activities
- Hobbies/interests
- Peer relationships (positive/negative influences)
- Gang involvement screening
- Recreational activities

**D - Drugs/Alcohol/Tobacco**
- Cigarette/vape use
- Alcohol use (frequency, quantity)
- Marijuana/cannabis use
- Other drug use (substances, prescription misuse)
- Age of first use

**S - Sexual History**
- Relationship status
- Sexual activity (age of onset, partners, contraception use)
- STI/pregnancy screening
- Consensual/non-consensual sexual experiences
- Sexual orientation/gender identity

**S - Suicide/Self-Harm/Mood**
- Mood (happy, sad, angry, anxious)
- Suicidal ideation/attempts (immediate risk assessment)
- Self-harm behaviors (cutting, etc.)
- Depression/anxiety symptoms
- Mental health support/treatment

**Clinical Implementation**:
- Private, non-judgmental conversation
- Template-based documentation (cascading logic per Stanford model)
- Clinical decision support for positive findings
- Crisis referral protocols for immediate risk
- Regular monitoring through visits

**Database Schema**:
- HEADSS template form (FHIR Questionnaire)
- Risk level categorization (low/moderate/high/immediate)
- Intervention tracking
- Referral management

### 10. Comprehensive Assessment & Screening Tools

**Established Tools** (Database must support documentation):

| Age | Tool | Screens For | Frequency |
|-----|------|-----------|-----------|
| **18-24mo** | M-CHAT (Modified Checklist) | Autism risk | Once at 18-24mo |
| **2-60mo** | ASQ-3 | Developmental delay | At 2-month intervals |
| **All ages** | Denver II | Developmental milestones | 9, 18, 30mo |
| **6mo+** | Lead screening | Lead exposure | 12, 24mo (minimum) |
| **12mo+** | TB risk assessment | TB exposure | Annual |
| **3-17y** | NICHQ Vanderbilt | ADHD symptoms | Pre-school/school referral |
| **13+** | HEADSS | Adolescent risk factors | Annual or per concern |
| **13+** | PHQ-9 Modified | Depression/suicidality | Annual + per concern |
| **13+** | CRAFFT | Substance use risk | Annual + per concern |

### 11. Risk Assessment Tools (Abuse, Suicide, Substance Use)

**Abuse Screening** (AAP recommendations):
- Ask about physical punishment, emotional abuse, sexual abuse
- Screen caregivers for ACEs (Adverse Childhood Experiences)
- Mandatory reporting protocols
- Child protective services referral procedures

**Suicide Risk** (Age 13+):
- Ask about suicidal thoughts/ideation directly
- Assess frequency, intensity, timeline
- Screen for protective/risk factors
- Immediate referral for active ideation + plan
- Safety planning

**Substance Use** (Age 13+):
- CRAFFT assessment (Car, Relax, Alone, Forget, Friends, Trouble)
- Screen for use of alcohol, marijuana, prescription drugs
- Assess peer influence and access
- Motivational interviewing for brief intervention

---

## Clinical Workflow Diagram

```
Birth Event (Maternal OB/GYN)
    ↓
[Birth Record Created]
    ↓
Newborn (0-1mo)
├─ Hospital Birth Record
├─ Initial Newborn Screening (heel stick)
├─ Jaundice Assessment
└─ Feeding/Vital Signs Monitoring
    ↓
Infant Care (1-12mo) - 6 Well-Visits
├─ Immunizations (6 vaccine visits)
├─ Growth Tracking (WHO standards)
├─ Feeding Assessment
└─ Development Screening (Denver II at 9mo)
    ↓
Early Childhood (1-5y) - 7 Well-Visits
├─ Immunizations (catch-up/boosters)
├─ Growth Tracking (transition to CDC at 2y)
├─ Development Screening (Denver II, ASQ-3)
├─ Lead Screening (12, 24mo)
├─ TB Risk Assessment
├─ Autism Screening (M-CHAT, 18-24mo)
└─ Behavioral Assessment
    ↓
School Age (6-12y) - Annual Well-Visits
├─ School Entry Physical (6y)
├─ Annual Assessment
├─ Growth/BMI Tracking
├─ Vision/Hearing Screening
├─ Behavioral/Learning Assessment
└─ Safety/Injury Prevention
    ↓
Adolescent (13-18y) - Annual Well-Visits + Sports Physicals
├─ Annual Assessment
├─ HEADSS Screening
├─ Mental Health/Suicide Risk Assessment
├─ Sexual Health Assessment
├─ Substance Use Screening
├─ Immunizations (catch-up, HPV, Meningococcal, COVID-19)
├─ Sports Physicals (as needed)
└─ Transition Planning (>18y)
```

---

## Database Schema Overview (28+ Tables Required)

### Core Pediatric Tables

**1. pediatric_patient_demographics**
- patient_id (FK to fhir_patients)
- date_of_birth
- gestational_age_at_birth (for premature tracking)
- birth_weight_g
- birth_length_cm
- birth_head_circumference_cm
- apgar_score_1min, apgar_score_5min
- delivery_method (vaginal, cesarean, etc.)
- linked_maternal_patient_id (FK to OB/GYN record)
- birth_facility
- org_id, created_at, updated_at

**2. pediatric_growth_records**
- id, patient_id, visit_date
- age_in_months
- weight_kg, length_or_height_cm, head_circumference_cm
- weight_percentile, length_percentile, hc_percentile
- weight_z_score, length_z_score, hc_z_score
- bmi (calculated for age >2y)
- bmi_percentile
- growth_velocity_assessment (normal/slow/accelerated)
- chart_type (WHO/CDC based on age)
- recorded_by, org_id

**3. pediatric_vital_signs**
- id, patient_id, encounter_id, visit_date
- temperature_c, heart_rate_bpm, respiratory_rate_bpm
- systolic_bp_mmhg, diastolic_bp_mmhg
- oxygen_saturation_percent
- flags (abnormal vital sign alerts)
- org_id

**4. pediatric_well_visits**
- id, patient_id, episode_id
- visit_date, visit_type (per Bright Futures schedule)
- age_at_visit_months
- provider_id
- physical_exam_findings JSONB
- anticipatory_guidance_topics JSONB
- next_visit_scheduled_date
- org_id, created_at, updated_at

**5. pediatric_immunizations**
- id, patient_id, episode_id
- vaccine_type (DTaP, PCV, IPV, etc. - per 2024 ACIP)
- vaccine_name, manufacturer
- lot_number, expiration_date
- dose_number (1st, 2nd, 3rd, booster)
- administration_date
- route (IM, oral, etc.)
- site (arm, thigh, etc.)
- provider_id
- status (given, not-given, deferred, contraindicated)
- reason_if_not_given
- adverse_reaction_noted
- org_id

**6. pediatric_immunization_status**
- id, patient_id, visit_id
- age_in_months
- vaccines_due JSONB (array of vaccine objects)
- vaccines_overdue JSONB
- vaccines_completed JSONB
- compliance_percent
- org_id

**7. pediatric_newborn_screening**
- id, patient_id
- screening_order_date
- specimen_collection_date
- specimen_id
- screening_type (NBS panel type)
- conditions_screened JSONB (array of condition objects)
- results JSONB (normal/abnormal/borderline per condition)
- abnormal_findings JSONB (details if abnormal)
- confirmatory_test_ordered
- confirmatory_test_results
- referral_status
- follow_up_plan
- org_id

**8. pediatric_developmental_screening**
- id, patient_id, episode_id
- assessment_date
- age_in_months
- screening_tool (Denver II, ASQ-3, M-CHAT, etc.)
- tool_version
- gross_motor_score, fine_motor_score
- language_score, personal_social_score
- overall_score
- results_interpretation (normal/caution/delay/concern)
- referral_recommended
- referral_destination (early intervention, pediatric developmental clinic, etc.)
- provider_id
- org_id

**9. pediatric_headss_assessment**
- id, patient_id, episode_id
- assessment_date
- age_at_assessment
- home_environment JSONB (responses to home domain questions)
- education_employment JSONB
- activities_peers JSONB
- drugs_alcohol_tobacco JSONB
- sexual_history JSONB
- suicide_self_harm_mood JSONB
- overall_risk_level (low/moderate/high/immediate)
- interventions_recommended JSONB
- referrals_made JSONB
- safety_plan_created (boolean)
- provider_id
- org_id

**10. pediatric_lead_screening**
- id, patient_id
- screening_date
- age_in_months
- blood_lead_level_mcg_dl
- testing_method
- risk_assessment JSONB
- referral_if_elevated (boolean)
- org_id

**11. pediatric_tb_risk_assessment**
- id, patient_id
- assessment_date
- risk_factors JSONB (exposure, origin country, etc.)
- tskin_or_igra_ordered
- test_type (TSkin/IGRA)
- test_date
- test_result (negative/positive/indeterminate)
- referral_status
- org_id

**12. pediatric_autism_screening**
- id, patient_id
- screening_date
- age_in_months
- screening_tool (M-CHAT, M-CHAT-R/F, etc.)
- responses JSONB
- score
- risk_level (low risk/moderate risk/high risk)
- referral_recommended (boolean)
- referral_destination
- org_id

**13. pediatric_behavioral_assessment**
- id, patient_id
- assessment_date
- age_in_months
- assessment_tool (NICHQ Vanderbilt, etc.)
- responses JSONB
- score
- adhd_likelihood
- behavioral_concerns JSONB
- referral_status
- org_id

**14. pediatric_mental_health_screening**
- id, patient_id
- screening_date
- age_at_screening
- phq9_modified_score (if applicable)
- depression_risk_level
- anxiety_symptoms JSONB
- mood_assessment
- thoughts_of_harm (boolean)
- referral_needed (boolean)
- org_id

**15. pediatric_substance_use_screening**
- id, patient_id
- screening_date
- age_at_screening
- crafft_responses JSONB
- crafft_score
- risk_level
- substances_screened (alcohol, marijuana, prescription drugs, etc.)
- positive_responses JSONB
- referral_recommended (boolean)
- org_id

**16. pediatric_sexual_health_assessment**
- id, patient_id
- assessment_date
- age_at_assessment
- relationship_status
- sexual_activity (yes/no)
- age_at_first_sexual_activity
- number_of_partners
- contraception_use
- contraception_type
- sti_screening_ordered
- pregnancy_screening_ordered
- pregnancy_test_result
- consensual_sexual_experiences (boolean)
- non_consensual_experiences (boolean)
- org_id

**17. pediatric_injury_prevention**
- id, patient_id, visit_id
- assessment_date
- age_in_months
- car_seat_use (for young children)
- seat_belt_use
- helmet_use (bicycle/sports)
- fire_safety_assessment
- water_safety_assessment
- poison_prevention_counseling
- falls_prevention
- org_id

**18. pediatric_vision_screening**
- id, patient_id, visit_id
- screening_date
- age_in_months
- screening_method (visual acuity, photoscreening, etc.)
- results
- referral_to_ophthalmology (boolean)
- org_id

**19. pediatric_hearing_screening**
- id, patient_id, visit_id
- screening_date
- age_in_months
- screening_type (OAE, tympanometry, etc.)
- results (normal/refer)
- referral_to_audiology (boolean)
- org_id

**20. pediatric_nutrition_assessment**
- id, patient_id, visit_id
- assessment_date
- age_in_months
- feeding_type (breast/bottle/mixed/solids)
- dietary_intake JSONB
- feeding_concerns JSONB
- nutrition_counseling_topics JSONB
- dietitian_referral (boolean)
- org_id

**21. pediatric_medications**
- id, patient_id, encounter_id
- medication_name, rxnorm_code
- indication
- start_date, end_date
- dosage_mg, frequency
- route (oral, inhaled, etc.)
- prescribed_date, prescribed_by
- refills_allowed, refills_remaining
- org_id

**22. pediatric_allergies**
- id, patient_id
- allergen_name, allergen_code
- reaction_severity (mild/moderate/severe)
- reaction_type (rash, anaphylaxis, etc.)
- date_identified
- org_id

**23. pediatric_medical_history**
- id, patient_id
- condition_name, icd10_code
- onset_date
- status (active/resolved)
- severity
- notes
- org_id

**24. pediatric_family_history**
- id, patient_id
- relation (mother/father/sibling/grandparent)
- condition_name
- age_at_onset
- org_id

**25. pediatric_social_determinants**
- id, patient_id
- assessment_date
- housing_stability (stable/unstable/homeless)
- food_insecurity (screened/present/absent)
- transportation_access
- healthcare_access
- financial_barriers
- language_spoken_at_home
- insurance_status
- org_id

**26. pediatric_vaccination_schedule_cache**
- id, patient_id
- age_in_months
- schedule_type (catch-up/standard/accelerated)
- due_vaccines JSONB (vaccine objects with due dates)
- generated_date
- org_id

**27. pediatric_sports_physicals**
- id, patient_id
- examination_date
- age_at_exam
- clearance_status (cleared/cleared with limitations/not cleared)
- findings JSONB
- cardiovascular_screening (hypertension, murmurs, syncope)
- orthopedic_assessment JSONB
- ppe_form_completed (boolean)
- org_id

**28. pediatric_care_coordination**
- id, patient_id
- referral_date
- referral_type (early intervention, specialty care, mental health, etc.)
- referral_destination
- referral_status (pending/accepted/completed)
- specialist_name
- encounter_notes JSONB
- follow_up_date
- outcome
- org_id

### Integration with Existing Tables

**Linking to Maternal OB/GYN Records**:
- pediatric_patient_demographics.linked_maternal_patient_id → obgyn_baby_records.maternal_patient_id
- Auto-populate newborn vitals from delivery record
- Track mother's pregnancy complications affecting baby care

**Linking to Episode Management**:
- All pediatric tables reference patient_specialty_episodes(id)
- Pediatric episode created at birth, continues through age 18-21y

**Linking to FHIR Resources**:
- patient_id = FHIR Patient resource ID
- Immunizations → FHIR Immunization resource
- Observations → FHIR Observation resources (vital signs, growth)

---

## Assessment Templates & Forms (FHIR Questionnaire)

### 1. Well-Visit Template (Age 0-1 Year)
**Questionnaire Structure**:
- Section 1: Feeding Assessment (breast/formula/mixed)
- Section 2: Sleep Patterns
- Section 3: Development Checklist (per age)
- Section 4: Physical Exam Findings
- Section 5: Immunization Review
- Section 6: Safety Counseling Topics
- Section 7: Parent Concerns

### 2. Well-Visit Template (Age 1-3 Years)
**Questionnaire Structure**:
- Section 1: Developmental Milestones
- Section 2: Behavior/Discipline
- Section 3: Toilet Training Progress (if applicable)
- Section 4: Nutrition/Feeding
- Section 5: Safety (accident prevention)
- Section 6: Immunization Status
- Section 7: Screening for Lead/TB

### 3. Well-Visit Template (Age 3-5 Years)
**Questionnaire Structure**:
- Section 1: School/Preschool Readiness
- Section 2: Developmental Assessment
- Section 3: Vision/Hearing Screening Results
- Section 4: Behavior/Learning Concerns
- Section 5: Nutrition/Activity
- Section 6: Immunization Catch-up
- Section 7: Safety/Injury Prevention

### 4. Well-Visit Template (Age 5-12 Years)
**Questionnaire Structure**:
- Section 1: School Performance
- Section 2: Physical Activity/Sports
- Section 3: Peer Relationships
- Section 4: Behavioral/Emotional Health
- Section 5: Nutrition/BMI Assessment
- Section 6: Vision/Hearing Screening
- Section 7: Safety Topics (cycling, water, etc.)
- Section 8: Immunization Status

### 5. Well-Visit Template (Age 13-18 Years)
**Questionnaire Structure**:
- Section 1: HEADSS Assessment (structured)
- Section 2: Pubertal Development (Tanner staging)
- Section 3: Immunization Status/Catch-up
- Section 4: Sexual Health/STI Screening
- Section 5: Mental Health/Suicide Risk
- Section 6: Substance Use Screening
- Section 7: School/Career Planning
- Section 8: Sports Physicals (if applicable)

---

## Clinical Decision Support Rules

**Example Rules** (JSON Logic format for rule engine):

### Rule 1: Growth Velocity Flag
```json
{
  "name": "Detect Abnormal Growth Velocity",
  "trigger": "growth_record_created",
  "conditions": {
    "or": [
      {"var": "growth_velocity_assessment"}: "slow",
      {"var": "weight_percentile"}: {"<": 5},
      {"var": "weight_percentile"}: {"!=": "normal", "crossed_percentile_lines": true}
    ]
  },
  "actions": [
    {
      "type": "create_task",
      "title": "Review Growth Velocity with Provider",
      "priority": "high",
      "assigned_to": "care_coordinator"
    },
    {
      "type": "alert",
      "message": "Patient showing abnormal growth pattern - review weight trajectory"
    }
  ]
}
```

### Rule 2: Immunization Overdue
```json
{
  "name": "Immunization Overdue Alert",
  "trigger": "daily_monitor",
  "conditions": {
    "var": "vaccines_overdue"
  },
  "actions": [
    {
      "type": "create_task",
      "title": "Follow-up: Immunization Due",
      "assigned_to": "nurse"
    },
    {
      "type": "patient_notification",
      "message": "Vaccination appointment needed"
    }
  ]
}
```

### Rule 3: Developmental Delay Concern
```json
{
  "name": "Flag Developmental Delay for Referral",
  "trigger": "developmental_screening_completed",
  "conditions": {
    "var": "results_interpretation"}: {"in": ["delay", "concern"]}
  },
  "actions": [
    {
      "type": "create_task",
      "title": "Early Intervention Referral Needed",
      "priority": "high"
    },
    {
      "type": "create_referral",
      "destination": "early_intervention_program"
    }
  ]
}
```

### Rule 4: High Risk HEADSS
```json
{
  "name": "High-Risk HEADSS Requires Action",
  "trigger": "headss_assessment_completed",
  "conditions": {
    "var": "overall_risk_level"}: {"in": ["high", "immediate"]}
  },
  "actions": [
    {
      "type": "create_task",
      "title": "Urgent Mental Health/Safety Assessment"
    },
    {
      "type": "create_safety_plan"
    },
    {
      "type": "alert",
      "severity": "critical"
    }
  ]
}
```

---

## Integration with Existing OB/GYN Module

**Maternal-Infant Linkage**:
- At birth, create pediatric patient record
- Link via linked_maternal_patient_id field
- Import: gestational age, birth weight, delivery complications, newborn data
- Track: Apgar scores, resuscitation needs, initial feeding

**Labor & Delivery Integration**:
- Obstetric complications affecting newborn care → populate pediatric_medical_history
- Maternal infections → neonatal screening/prophylaxis tracking
- Medication exposure in-utero → medication/allergy flags

**Postpartum Transition**:
- Maternal postpartum depression screening → cross-reference with newborn stress assessment
- Breastfeeding support → coordinate between OB/GYN and Pediatrics
- Maternal-infant bonding assessment → shared documentation

---

## Visit Type Definitions by Age Group

**Birth-1 Month**:
- newborn_hospital_visit
- newborn_3_5_day_visit (jaundice check)
- newborn_7_10_day_visit (feeding assessment)

**1-12 Months**:
- infant_1mo_well_visit
- infant_2mo_well_visit_vaccines
- infant_4mo_well_visit_vaccines
- infant_6mo_well_visit_vaccines
- infant_9mo_well_visit_development
- infant_12mo_well_visit_vaccines

**1-5 Years**:
- toddler_15mo_well_visit
- toddler_18mo_well_visit_vaccines_development
- toddler_2yr_well_visit
- toddler_2_5yr_brief_visit
- preschool_3yr_well_visit
- preschool_4yr_well_visit
- preschool_5yr_well_visit_school_readiness

**6-12 Years**:
- school_6yr_entry_physical
- school_annual_well_visit
- school_sick_visit
- school_sports_physical
- school_urgent_care_visit

**13-18 Years**:
- adolescent_annual_well_visit
- adolescent_sports_physical
- adolescent_urgent_visit
- adolescent_mental_health_visit

---

## Key Pediatric Calculators & Algorithms

**1. BMI Percentile Calculation**:
- Input: Age (months), sex, weight (kg), height (cm)
- Output: BMI, percentile, Z-score (CDC LMS method)
- Source data: CDC growth chart coefficients

**2. Growth Velocity Assessment**:
- Compare current measurements to previous 6-12 month trend
- Alert if crossing percentile lines downward
- Track: cm/month, kg/month

**3. Age-Adjusted Vital Sign Interpretation**:
- Map vital signs against age-specific normal ranges
- Flag abnormal if outside age-appropriate range
- Consider context (fever, crying, activity level)

**4. Developmental Milestone Scoring**:
- Per Denver II: Calculate age-adjusted performance
- Generate "caution" vs "delay" vs "normal" interpretation
- Store individual test items with pass/fail status

**5. Immunization Schedule Generation**:
- Input: Current age, completed vaccines
- Output: Due vaccines, recommended timing
- Account for: Medical exemptions, catch-up schedules, spacing requirements

---

## Standards & References

### Clinical Standards Used
- **AAP Bright Futures** (2024 edition) - Well-visit periodicity
- **CDC/ACIP Immunization Schedule** (2024 updates)
- **Denver II** - Developmental screening
- **ASQ-3** - Developmental screening, ages 2-60mo
- **M-CHAT** - Autism spectrum screening
- **HEADSS** - Adolescent psychosocial assessment
- **CRAFFT** - Substance use screening (adolescents)
- **PHQ-9 Modified** - Depression screening

### Growth Standards
- **WHO Growth Charts** (0-24 months)
- **CDC Growth Charts** (2-20 years)
- **CDC Extended BMI Charts** (2022 edition, includes 99th percentile)

### Coding Standards
- **ICD-10-CM** - Diagnoses
- **CPT** - Procedures/services
- **RxNorm** - Medications
- **LOINC** - Lab codes
- **CVX** - Vaccine codes (CDC)

---

## Implementation Priority

### Phase 1: Core Foundations (MVP)
1. Pediatric patient demographics & linkage to maternal records
2. Growth tracking (WHO 0-2y, CDC 2-20y)
3. Well-visit templates (age 0-12 months)
4. Immunization management (CDC/ACIP 2024 schedule)
5. Vital signs capture & age-appropriate flagging
6. Basic developmental milestone tracking

### Phase 2: Assessment Tools
1. Denver II developmental screening
2. HEADSS assessment (age 13+)
3. Lead screening management
4. TB risk assessment
5. Autism screening (M-CHAT)
6. Mental health screening (PHQ-9 modified)

### Phase 3: Advanced Features
1. Newborn screening program coordination
2. Sports physicals
3. Sexual health assessment & STI tracking
4. Substance use screening (CRAFFT)
5. Abuse/trauma screening
6. Social determinants assessment
7. Care coordination & referral management

### Phase 4: Integration & Analytics
1. Clinical decision support rules engine integration
2. Growth velocity analytics & trend detection
3. Immunization compliance reporting
4. Developmental delay dashboards
5. HEADSS risk stratification reporting
6. Integration with early intervention programs
7. Maternal-infant outcome tracking

---

## Unresolved Questions

1. **State-Specific Newborn Screening**: Which states/territories supported in initial rollout? (Screening panels vary by 60+ conditions)
2. **Early Intervention Referral Integration**: Which state early intervention systems to integrate? (IDEA Part C programs vary by state)
3. **School-Based Records**: How to integrate with school health records (IEP, 504 plans)?
4. **Behavioral Health Billing**: What CPT codes needed for development screening, HEADSS assessment, counseling?
5. **Pediatric EHR Certification**: Target for ONC certification or specific pediatric EHR standards?
6. **Growth Chart Calculation Method**: Licensed LMS software or open-source CDC algorithm implementation?
7. **Immunization Registry (IIS) Interface**: Which state immunization information systems to support?
8. **Telehealth for Pediatrics**: Age-specific consent/assent documentation requirements?
9. **Privacy (HIPAA) vs Parental Rights**: How to handle teen confidentiality for sensitive topics (sexual health, substance use)?
10. **Transition to Adult Care**: Workflow for transferring 18-21y patients to adult practices?

---

## Sources & References

### Official Clinical Guidelines
- [AAP Bright Futures Periodicity Schedule 2024](https://www.aap.org/en/practice-management/care-delivery-approaches/periodicity-schedule/)
- [CDC ACIP Immunization Schedule 2024](https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-age.html)
- [CDC Growth Charts](https://www.cdc.gov/growthcharts/cdc-growth-charts.htm)
- [Denver II Developmental Screening](https://www.sciencedirect.com/topics/medicine-and-dentistry/denver-developmental-screening-test)
- [Ages and Stages Questionnaires](https://www.agesandstages.com/) (ASQ-3)

### Pediatric EHR Standards
- [Stanford Medicine Pediatric Primary Care Forms](https://med.stanford.edu/ppc/patient_care/resources/Forms.html)
- [Defining EHR Standards for Child Health - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794090/)
- [HEADSS Template-Based Approach - AAP Hospital Pediatrics](https://publications.aap.org/hospitalpediatrics/article/13/7/588/191489/)

### Vital Signs & Growth
- [Cleveland Clinic Pediatric Vital Signs](https://health.clevelandclinic.org/pediatric-vital-signs)
- [Pediatric Vital Signs Reference Chart - PedsCases](https://www.pedscases.com/pediatric-vital-signs-reference-chart)
- [CDC Growth Charts Training](https://www.cdc.gov/growth-chart-training/hcp/index.html)

### Developmental Screening
- [Denver Developmental Screening Test Overview - ScienceDirect](https://www.sciencedirect.com/topics/medicine-and-dentistry/denver-developmental-screening-test)
- [Developmental Milestones - NCBI StatPearls](https://www.ncbi.nlm.nih.gov/books/NBK557518/)

### Regulatory & Standards
- [HealthyChildren.org Well-Child Care](https://www.healthychildren.org/English/family-life/health-management/Pages/Well-Child-Care-A-Check-Up-for-Success.aspx)
- [CDC Vaccines & Immunizations](https://www.cdc.gov/vaccines/index.html)

---

**Report Generated**: December 21, 2025
**Research Completed**: ✅ All 5 research queries executed
**Status**: Ready for Implementation Planning
