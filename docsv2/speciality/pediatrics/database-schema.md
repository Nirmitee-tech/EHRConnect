# Pediatrics Database Schema

## Overview

The Pediatrics specialty module uses 28 PostgreSQL tables to manage comprehensive pediatric patient data from birth through 18 years of age.

## Core Tables

### 1. pediatric_patient_demographics
Stores birth data and maternal linkage information.

**Key Fields:**
- `patient_id` (VARCHAR) - FHIR Patient ID
- `birth_weight_grams` (INTEGER)
- `birth_length_cm` (NUMERIC)
- `birth_head_circumference_cm` (NUMERIC)
- `gestational_age_weeks` (INTEGER)
- `gestational_age_days` (INTEGER)
- `linked_maternal_patient_id` (VARCHAR) - Links to mother's record
- `apgar_1min`, `apgar_5min` (INTEGER)
- `multiple_birth` (BOOLEAN)

**Indexes:**
- `idx_peds_demo_patient` on `patient_id`
- `idx_peds_demo_maternal` on `linked_maternal_patient_id`

### 2. pediatric_growth_records
Tracks growth measurements with WHO/CDC percentiles.

**Key Fields:**
- `measurement_date` (DATE)
- `age_months` (NUMERIC)
- `weight_kg`, `weight_percentile`, `weight_zscore`
- `length_height_cm`, `length_height_percentile`, `length_height_zscore`
- `head_circumference_cm`, `head_circumference_percentile`
- `bmi`, `bmi_percentile`, `bmi_category`
- `growth_chart_type` ('WHO' or 'CDC')

**Indexes:**
- `idx_peds_growth_patient` on `patient_id`
- `idx_peds_growth_date` on `measurement_date`

### 3. pediatric_vital_signs
Age-stratified vital signs with automatic flagging.

**Key Fields:**
- `age_group` (VARCHAR) - newborn, infant, toddler, preschool, school-age, adolescent
- `heart_rate`, `heart_rate_flag`
- `respiratory_rate`, `respiratory_rate_flag`
- `systolic_bp`, `diastolic_bp`, `bp_flag`
- `temperature_celsius`, `oxygen_saturation`, `pain_score`

### 4. pediatric_well_visits
Well-child visit tracking per AAP Bright Futures.

**Key Fields:**
- `visit_date` (DATE)
- `visit_type` (VARCHAR) - 22+ types
- `age_at_visit_months` (NUMERIC)
- `developmental_milestones` (JSONB)
- `physical_exam` (JSONB)
- `anticipatory_guidance_provided` (JSONB)
- `next_visit_due` (DATE)

### 5. pediatric_immunizations
Vaccine administration records.

**Key Fields:**
- `vaccine_name`, `vaccine_code`, `cvx_code`
- `dose_number`, `series_doses`
- `administration_date`, `expiration_date`
- `lot_number`, `manufacturer`
- `route`, `site`, `dose_amount`
- `vis_date`, `vis_provided`, `consent_obtained`
- `adverse_reactions` (TEXT)

### 6. pediatric_immunization_status
Tracks immunization completion status.

**Key Fields:**
- `vaccine_series` (VARCHAR)
- `doses_completed`, `doses_required` (INTEGER)
- `status` - 'up_to_date', 'due', 'overdue', 'contraindicated'
- `next_due_date` (DATE)
- `catch_up_schedule` (JSONB)

## Screening Tables

### 7-14. Developmental & Health Screenings

- **pediatric_newborn_screening**: State NHS panel results (60+ conditions)
- **pediatric_developmental_screening**: Denver II, ASQ-3 assessments
- **pediatric_autism_screening**: M-CHAT results
- **pediatric_lead_screening**: Blood lead levels (12, 24 months)
- **pediatric_tb_risk_assessment**: TST/IGRA testing
- **pediatric_behavioral_assessment**: NICHQ Vanderbilt, ADHD
- **pediatric_mental_health_screening**: PHQ-9 Modified for adolescents
- **pediatric_substance_use_screening**: CRAFFT assessment

All screening tables include:
- Risk level categorization
- Referral recommendations
- Follow-up tracking

### 15. pediatric_headss_assessment
Adolescent psychosocial assessment (13-18 years).

**Domains (JSONB fields):**
- `home_environment`
- `education_employment`
- `activities_peers`
- `drugs_alcohol_tobacco`
- `sexuality`
- `suicide_safety`
- `overall_risk_level` - low, moderate, high, immediate

## Clinical Management Tables

### 16-22. Clinical Data

- **pediatric_nutrition_assessment**: Feeding type, dietary intake
- **pediatric_vision_screening**: Visual acuity, photoscreening
- **pediatric_hearing_screening**: OAE, tympanometry
- **pediatric_injury_prevention**: Car seat safety, fall prevention
- **pediatric_sexual_health_assessment**: STI screening, contraception
- **pediatric_medications**: Age-appropriate dosing calculations
- **pediatric_allergies**: Allergen tracking with severity

### 23-28. History & Coordination

- **pediatric_medical_history**: Conditions with ICD-10 codes
- **pediatric_family_history**: Hereditary conditions
- **pediatric_social_determinants**: Housing, food security, insurance
- **pediatric_vaccination_schedule_cache**: Pre-calculated due vaccines
- **pediatric_sports_physicals**: Clearance status, cardiovascular screening
- **pediatric_care_coordination**: Referrals, early intervention services

## Data Types & Constraints

### Common Patterns

- All tables include `org_id` (UUID) for multi-tenancy
- All tables have `created_at`, `updated_at` timestamps
- Foreign keys reference `patient_specialty_episodes(id)`
- JSONB fields store structured clinical data
- CHECK constraints enforce value domains
- Indexes on patient_id, dates, and status fields

### JSONB Structure Examples

**Growth Chart Data:**
```json
{
  "weightKg": 7.8,
  "percentile": 50,
  "zscore": 0,
  "chartType": "WHO"
}
```

**Developmental Milestones:**
```json
{
  "grossMotor": {"status": "normal", "details": "Walks independently"},
  "fineMotor": {"status": "normal", "details": "Uses pincer grasp"},
  "language": {"status": "normal", "details": "10+ words"},
  "personalSocial": {"status": "normal", "details": "Waves bye-bye"}
}
```

**HEADSS Assessment:**
```json
{
  "home": {
    "livingWith": "Both parents",
    "safeEnvironment": true,
    "conflicts": "None reported"
  },
  "education": {
    "grade": "10th",
    "performance": "Average",
    "attendance": "Good"
  },
  "activities": {
    "sports": ["Soccer"],
    "hobbies": ["Reading", "Gaming"],
    "peerRelationships": "Good"
  }
}
```

## Migration

Run the migration:
```bash
cd ehr-api
node src/migrations/add-pediatrics-tables.js up
```

Rollback:
```bash
node src/migrations/add-pediatrics-tables.js down
```

## Performance Considerations

- Indexes on frequently queried fields (patient_id, dates, status)
- JSONB GIN indexes for structured data searches (optional)
- Partitioning by org_id for large-scale deployments
- Regular VACUUM ANALYZE for query optimization

## Security

- Row-level security (RLS) policies by org_id
- Encrypted at rest (PostgreSQL TDE)
- Audit logging via triggers
- PHI/PII data handling per HIPAA requirements
