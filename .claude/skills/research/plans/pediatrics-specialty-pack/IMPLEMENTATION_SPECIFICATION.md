# Pediatrics Specialty Pack: Implementation Specification

**Document Date**: December 21, 2025
**Based On**: 251221-pediatric-clinical-workflows-research.md
**Status**: Ready for Development Planning

---

## Executive Overview

Pediatric specialty pack implementation requires 28+ database tables, 22+ FHIR Questionnaire templates, 4 clinical workflow phases, and specialized CDS rules. This differs fundamentally from OB/GYN (pregnancy-centric) by supporting continuous care from birth through adolescence (18+ years) with age-stratified assessments, growth standards, immunization management, and developmental tracking.

**Scope**: Birth to age 18 years (optional: extend to age 21 for transition planning)

---

## Database Migration Strategy

### Table Creation Order (Dependencies)

**Phase 1: Core Tables** (no dependencies)
```sql
-- 1. pediatric_patient_demographics
-- 2. pediatric_growth_records
-- 3. pediatric_vital_signs
-- 4. pediatric_allergies
-- 5. pediatric_medications
-- 6. pediatric_medical_history
-- 7. pediatric_family_history
-- 8. pediatric_social_determinants
```

**Phase 2: Assessment Tables** (depends on patient table)
```sql
-- 9. pediatric_well_visits
-- 10. pediatric_immunizations
-- 11. pediatric_immunization_status
-- 12. pediatric_newborn_screening
-- 13. pediatric_developmental_screening
-- 14. pediatric_headss_assessment
-- 15. pediatric_lead_screening
-- 16. pediatric_tb_risk_assessment
-- 17. pediatric_autism_screening
-- 18. pediatric_behavioral_assessment
-- 19. pediatric_mental_health_screening
-- 20. pediatric_substance_use_screening
-- 21. pediatric_sexual_health_assessment
-- 22. pediatric_injury_prevention
-- 23. pediatric_vision_screening
-- 24. pediatric_hearing_screening
-- 25. pediatric_nutrition_assessment
-- 26. pediatric_sports_physicals
```

**Phase 3: Coordination Tables** (depends on assessment tables)
```sql
-- 27. pediatric_vaccination_schedule_cache
-- 28. pediatric_care_coordination
```

### Migration File Structure

```
ehr-api/src/migrations/
├── YYYYMMDDHHMMSS-create-pediatric-core-tables.js
├── YYYYMMDDHHMMSS-create-pediatric-assessment-tables.js
├── YYYYMMDDHHMMSS-create-pediatric-coordination-tables.js
├── YYYYMMDDHHMMSS-add-pediatric-indexes.js
└── YYYYMMDDHHMMSS-add-pediatric-fhir-mappings.js
```

---

## Schema Definition Details

### Sample Table: pediatric_patient_demographics

```sql
CREATE TABLE pediatric_patient_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL UNIQUE,

  -- Birth Information
  date_of_birth DATE NOT NULL,
  gestational_age_at_birth VARCHAR(10),  -- "39+2", "34+5" format
  birth_weight_grams INTEGER,
  birth_length_cm DECIMAL(5,1),
  birth_head_circumference_cm DECIMAL(5,1),

  -- Apgar Scores
  apgar_score_1min INTEGER CHECK (apgar_score_1min BETWEEN 0 AND 10),
  apgar_score_5min INTEGER CHECK (apgar_score_5min BETWEEN 0 AND 10),

  -- Delivery Details
  delivery_method VARCHAR(50) CHECK (delivery_method IN ('SVD', 'Cesarean', 'Vacuum', 'Forceps', 'VBAC')),
  delivery_facility VARCHAR(255),
  delivery_provider VARCHAR(255),

  -- Linkage to Maternal Record
  linked_maternal_patient_id VARCHAR(255) REFERENCES patients(id),
  maternal_pregnancy_complications JSONB,  -- Array of complication objects
  maternal_medications_during_pregnancy JSONB,

  -- Neonatal Status
  birth_status VARCHAR(50) CHECK (birth_status IN ('live birth', 'stillbirth')),
  nicu_admission BOOLEAN DEFAULT FALSE,
  nicu_length_of_stay_days INTEGER,
  resuscitation_required BOOLEAN DEFAULT FALSE,

  -- Multi-tenant
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pediatric_patient_id ON pediatric_patient_demographics(patient_id);
CREATE INDEX idx_pediatric_dob ON pediatric_patient_demographics(date_of_birth);
CREATE INDEX idx_pediatric_maternal_link ON pediatric_patient_demographics(linked_maternal_patient_id);
```

### Sample Table: pediatric_growth_records

```sql
CREATE TABLE pediatric_growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  encounter_id VARCHAR(255),
  visit_date DATE NOT NULL,

  -- Age Context
  age_in_months INTEGER NOT NULL,
  age_in_weeks INTEGER,  -- For infants <12 months

  -- Measurements
  weight_kg DECIMAL(6,2),
  length_cm DECIMAL(6,1),  -- Recumbent (for <2y)
  height_cm DECIMAL(6,1),  -- Standing (for >=2y)
  head_circumference_cm DECIMAL(6,1),

  -- WHO Standards (0-24 months)
  who_weight_for_age_percentile DECIMAL(5,2),
  who_weight_for_age_z_score DECIMAL(5,2),
  who_length_for_age_percentile DECIMAL(5,2),
  who_length_for_age_z_score DECIMAL(5,2),
  who_hc_for_age_percentile DECIMAL(5,2),
  who_hc_for_age_z_score DECIMAL(5,2),

  -- CDC Standards (2-20 years)
  cdc_weight_for_age_percentile DECIMAL(5,2),
  cdc_height_for_age_percentile DECIMAL(5,2),
  cdc_bmi DECIMAL(5,2),
  cdc_bmi_for_age_percentile DECIMAL(5,2),
  cdc_bmi_for_age_z_score DECIMAL(5,2),

  -- Growth Velocity
  growth_velocity_weight_kg_per_month DECIMAL(5,3),
  growth_velocity_length_cm_per_month DECIMAL(5,2),
  growth_velocity_assessment VARCHAR(50) CHECK (growth_velocity_assessment IN ('normal', 'slow', 'accelerated', 'abnormal')),
  percentile_crossing BOOLEAN DEFAULT FALSE,  -- Crossed percentile lines

  -- Chart Type & Method
  chart_type VARCHAR(20) CHECK (chart_type IN ('WHO', 'CDC')),
  measurement_method VARCHAR(50) CHECK (measurement_method IN ('scale', 'length_board', 'stadiometer')),

  -- Provider & Audit
  recorded_by VARCHAR(255),
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_growth_patient ON pediatric_growth_records(patient_id);
CREATE INDEX idx_growth_date ON pediatric_growth_records(visit_date);
CREATE INDEX idx_growth_age ON pediatric_growth_records(age_in_months);
CREATE INDEX idx_growth_abnormal ON pediatric_growth_records(growth_velocity_assessment) WHERE growth_velocity_assessment != 'normal';
```

### Sample Table: pediatric_immunizations

```sql
CREATE TABLE pediatric_immunizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_specialty_episodes(id),

  -- Vaccine Information (CDC/ACIP 2024)
  vaccine_type VARCHAR(50) NOT NULL CHECK (vaccine_type IN (
    'DTaP', 'IPV', 'HepB', 'Hib', 'PCV', 'RV', 'MMR', 'VAR', 'HepA',
    'IIV', 'LAIV', 'RSV', 'COVID-19', 'HPV', 'Meningococcal', 'Tdap',
    'Td', 'Influenza', 'Pneumococcal', 'Mpox', 'JE', 'Yellow Fever'
  )),
  vaccine_name VARCHAR(255) NOT NULL,
  cvx_code VARCHAR(10),  -- CDC vaccine code
  manufacturer VARCHAR(255),
  lot_number VARCHAR(50),
  expiration_date DATE,

  -- Administration Details
  administration_date DATE NOT NULL,
  route VARCHAR(20) CHECK (route IN ('IM', 'SC', 'Oral', 'Intranasal', 'IV', 'ID')),
  site VARCHAR(50) CHECK (site IN ('Left arm', 'Right arm', 'Left thigh', 'Right thigh', 'Other')),

  -- Dose Tracking
  dose_number SMALLINT CHECK (dose_number BETWEEN 1 AND 20),
  dose_series VARCHAR(100),  -- e.g., "2 of 3", "Booster 1"
  target_disease JSONB,  -- Array of diseases this dose protects against

  -- Status & Administration
  status VARCHAR(50) NOT NULL CHECK (status IN (
    'administered', 'not_given', 'deferred', 'refused', 'contraindicated', 'partial'
  )),
  reason_if_not_given VARCHAR(255),

  -- Reactions & Contraindications
  adverse_reaction BOOLEAN DEFAULT FALSE,
  adverse_reaction_type VARCHAR(255),
  adverse_reaction_severity VARCHAR(20) CHECK (adverse_reaction_severity IN ('mild', 'moderate', 'severe')),
  anaphylaxis BOOLEAN DEFAULT FALSE,

  -- Contraindication Tracking
  contraindication_present BOOLEAN DEFAULT FALSE,
  contraindication_reason JSONB,  -- Medical or immunological

  -- Provider & Audit
  provider_id VARCHAR(255),
  provider_name VARCHAR(255),
  org_id UUID NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_immunization_patient ON pediatric_immunizations(patient_id);
CREATE INDEX idx_immunization_date ON pediatric_immunizations(administration_date);
CREATE INDEX idx_immunization_status ON pediatric_immunizations(status);
CREATE INDEX idx_immunization_vaccine ON pediatric_immunizations(vaccine_type);
```

### Sample Table: pediatric_headss_assessment

```sql
CREATE TABLE pediatric_headss_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(255) NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_specialty_episodes(id),

  -- Assessment Metadata
  assessment_date DATE NOT NULL,
  age_at_assessment INTEGER,  -- In years
  age_at_assessment_months INTEGER,
  provider_id VARCHAR(255),

  -- H - Home Environment
  home_living_situation VARCHAR(100) CHECK (home_living_situation IN (
    'Both parents', 'One parent', 'Foster care', 'Relative care', 'Homeless', 'Other'
  )),
  home_family_relationships_concern BOOLEAN,
  home_family_relationships_details TEXT,
  home_domestic_violence_screening BOOLEAN,  -- Abuse screening
  home_substance_use_in_home BOOLEAN,
  home_food_insecurity BOOLEAN,
  home_notes TEXT,

  -- E - Education/Employment
  education_school_attendance VARCHAR(20) CHECK (education_school_attendance IN ('Regular', 'Frequent absences', 'Truancy')),
  education_academic_performance VARCHAR(20) CHECK (education_academic_performance IN ('Excellent', 'Good', 'Average', 'Struggling', 'Failing')),
  education_grade_or_employment VARCHAR(100),
  education_discipline_history BOOLEAN,
  education_suspension_expulsion BOOLEAN,
  education_learning_disabilities BOOLEAN,
  education_bullying_concern BOOLEAN,
  education_notes TEXT,

  -- A - Activities & Peers
  activities_extracurricular JSONB,  -- Array of activities
  activities_peer_relationships VARCHAR(20) CHECK (activities_peer_relationships IN ('Healthy', 'Some concerns', 'Significant concerns')),
  activities_gang_involvement BOOLEAN,
  activities_close_friends_positive BOOLEAN,
  activities_recreational_activities JSONB,
  activities_notes TEXT,

  -- D - Drugs/Alcohol/Tobacco
  drug_tobacco_use BOOLEAN,
  drug_tobacco_frequency VARCHAR(50),
  drug_tobacco_age_of_first_use INTEGER,
  drug_alcohol_use BOOLEAN,
  drug_alcohol_frequency VARCHAR(50),
  drug_alcohol_age_of_first_use INTEGER,
  drug_marijuana_use BOOLEAN,
  drug_marijuana_frequency VARCHAR(50),
  drug_other_drugs_use BOOLEAN,
  drug_other_drugs_list JSONB,  -- Array of substances
  drug_substance_abuse_concern BOOLEAN,
  drug_notes TEXT,

  -- S - Sexual History
  sexual_relationship_status VARCHAR(50) CHECK (sexual_relationship_status IN (
    'No relationships', 'Dating', 'In relationship', 'Sexually active single'
  )),
  sexual_activity_status BOOLEAN,
  sexual_age_of_first_sexual_activity INTEGER,
  sexual_number_of_partners INTEGER,
  sexual_contraception_use BOOLEAN,
  sexual_contraception_type VARCHAR(100),
  sexual_sti_screening_requested BOOLEAN,
  sexual_pregnancy_screening BOOLEAN,
  sexual_pregnancy_status VARCHAR(20),
  sexual_sexual_orientation VARCHAR(50),
  sexual_gender_identity VARCHAR(100),
  sexual_consensual_experiences BOOLEAN DEFAULT TRUE,
  sexual_non_consensual_experiences BOOLEAN DEFAULT FALSE,
  sexual_assault_disclosure BOOLEAN,
  sexual_notes TEXT,

  -- S - Suicide/Self-Harm/Mood
  suicide_mood_assessment VARCHAR(50) CHECK (suicide_mood_assessment IN (
    'Happy', 'Okay', 'Sad', 'Anxious', 'Angry', 'Mixed'
  )),
  suicide_suicidal_ideation BOOLEAN,
  suicide_suicidal_plan BOOLEAN,
  suicide_suicidal_timeline VARCHAR(100),  -- "Immediate", "Days", "Weeks"
  suicide_previous_attempts BOOLEAN,
  suicide_previous_attempts_count INTEGER,
  suicide_self_harm_behaviors BOOLEAN,
  suicide_self_harm_methods JSONB,  -- Array: cutting, burning, etc.
  suicide_depression_screening_score DECIMAL(5,2),  -- PHQ-9 modified
  suicide_anxiety_symptoms BOOLEAN,
  suicide_protective_factors JSONB,  -- Supportive people, reasons to live
  suicide_notes TEXT,

  -- Overall Risk Assessment
  overall_risk_level VARCHAR(50) NOT NULL CHECK (overall_risk_level IN (
    'low', 'moderate', 'high', 'immediate'
  )),
  immediate_intervention_needed BOOLEAN DEFAULT FALSE,

  -- Clinical Response
  interventions_recommended JSONB,  -- Array of intervention objects
  referrals_made JSONB,  -- Mental health, substance use, etc.
  safety_plan_created BOOLEAN DEFAULT FALSE,
  safety_plan_details TEXT,
  crisis_contact_info_provided BOOLEAN,

  -- Multi-tenant
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_headss_patient ON pediatric_headss_assessment(patient_id);
CREATE INDEX idx_headss_date ON pediatric_headss_assessment(assessment_date);
CREATE INDEX idx_headss_risk_level ON pediatric_headss_assessment(overall_risk_level);
CREATE INDEX idx_headss_immediate ON pediatric_headss_assessment(immediate_intervention_needed) WHERE immediate_intervention_needed = TRUE;
CREATE INDEX idx_headss_high_risk ON pediatric_headss_assessment(overall_risk_level) WHERE overall_risk_level IN ('high', 'immediate');
```

---

## FHIR Questionnaire Templates

### Sample: Well-Visit Template (0-12 Months)

```json
{
  "resourceType": "Questionnaire",
  "id": "pediatric-well-visit-0-12mo",
  "url": "http://example.com/fhir/Questionnaire/pediatric-well-visit-0-12mo",
  "version": "1.0.0",
  "title": "Pediatric Well-Visit: 0-12 Months",
  "description": "AAP Bright Futures well-visit assessment for infants 0-12 months",
  "status": "active",
  "subjectType": ["Patient"],
  "item": [
    {
      "linkId": "section-feeding",
      "type": "group",
      "title": "Feeding & Nutrition",
      "item": [
        {
          "linkId": "feeding-type",
          "type": "choice",
          "text": "Current feeding method",
          "answerValueSet": "http://example.com/ValueSet/feeding-types",
          "required": true,
          "enableWhen": [
            {
              "question": "patient-age-months",
              "operator": "<=",
              "answerInteger": 12
            }
          ]
        },
        {
          "linkId": "breastfeeding-duration",
          "type": "string",
          "text": "How long has patient been breastfed? (if applicable)",
          "enableWhen": [
            {
              "question": "feeding-type",
              "operator": "=",
              "answerCoding": {
                "code": "breast"
              }
            }
          ]
        },
        {
          "linkId": "formula-type",
          "type": "choice",
          "text": "Formula type (if bottle-feeding)",
          "answerValueSet": "http://example.com/ValueSet/formula-types",
          "enableWhen": [
            {
              "question": "feeding-type",
              "operator": "=",
              "answerCoding": {
                "code": "formula"
              }
            }
          ]
        }
      ]
    },
    {
      "linkId": "section-development",
      "type": "group",
      "title": "Developmental Milestones",
      "item": [
        {
          "linkId": "dev-gross-motor",
          "type": "string",
          "text": "Describe gross motor milestones achieved"
        },
        {
          "linkId": "dev-fine-motor",
          "type": "string",
          "text": "Describe fine motor milestones achieved"
        },
        {
          "linkId": "dev-language",
          "type": "string",
          "text": "Describe language milestones achieved"
        },
        {
          "linkId": "dev-social",
          "type": "string",
          "text": "Describe social/behavioral milestones achieved"
        }
      ]
    },
    {
      "linkId": "section-safety",
      "type": "group",
      "title": "Safety Assessment",
      "item": [
        {
          "linkId": "safety-car-seat",
          "type": "boolean",
          "text": "Is child using appropriate car seat for age/weight?"
        },
        {
          "linkId": "safety-sleep-position",
          "type": "choice",
          "text": "Sleep position",
          "answerValueSet": "http://example.com/ValueSet/sleep-positions"
        },
        {
          "linkId": "safety-crib-environment",
          "type": "boolean",
          "text": "Crib meets safe sleep guidelines (firm mattress, no pillows/blankets)?"
        }
      ]
    }
  ]
}
```

---

## Service Layer Structure

### File: pediatric.service.js

```javascript
/**
 * Pediatric Service
 * Manages pediatric-specific clinical data
 */

class PediatricService {
  constructor(pool) {
    this.pool = pool;
  }

  // ============= Growth Management =============

  async recordGrowthMeasurement(data) {
    const {
      patientId,
      visitDate,
      ageInMonths,
      weight,
      length,
      headCircumference,
      chartType,
      recordedBy,
      orgId
    } = data;

    // Calculate percentiles based on age/sex and chart type
    const percentiles = await this.calculateGrowthPercentiles({
      age: ageInMonths,
      weight,
      length,
      headCircumference,
      chartType
    });

    const result = await this.pool.query(
      `INSERT INTO pediatric_growth_records
       (patient_id, visit_date, age_in_months, weight_kg, length_cm,
        head_circumference_cm, cdc_weight_for_age_percentile,
        cdc_height_for_age_percentile, recorded_by, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [patientId, visitDate, ageInMonths, weight, length,
       headCircumference, percentiles.weightPercentile,
       percentiles.heightPercentile, recordedBy, orgId]
    );

    return result.rows[0];
  }

  async getGrowthTrajectory(patientId, limit = 12) {
    const result = await this.pool.query(
      `SELECT * FROM pediatric_growth_records
       WHERE patient_id = $1
       ORDER BY visit_date DESC
       LIMIT $2`,
      [patientId, limit]
    );

    return result.rows.reverse(); // chronological order
  }

  // ============= Immunization Management =============

  async recordImmunization(data) {
    const {
      patientId,
      episodeId,
      vaccineType,
      administrationDate,
      route,
      site,
      doseNumber,
      providerId,
      orgId
    } = data;

    const result = await this.pool.query(
      `INSERT INTO pediatric_immunizations
       (patient_id, episode_id, vaccine_type, administration_date,
        route, site, dose_number, provider_id, status, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [patientId, episodeId, vaccineType, administrationDate,
       route, site, doseNumber, providerId, 'administered', orgId]
    );

    // Update immunization status cache
    await this.updateImmunizationStatusCache(patientId, orgId);

    return result.rows[0];
  }

  async generateImmunizationSchedule(patientId, ageInMonths) {
    // Generate CDC/ACIP 2024 compliant vaccination schedule
    const schedule = this._generateACIPSchedule(ageInMonths);

    // Get administered vaccines
    const administered = await this.pool.query(
      `SELECT vaccine_type, dose_number FROM pediatric_immunizations
       WHERE patient_id = $1 AND status = 'administered'`,
      [patientId]
    );

    // Calculate due/overdue vaccines
    const due = this._calculateDueVaccines(schedule, administered.rows);

    return {
      dueVaccines: due.due,
      overdueVaccines: due.overdue,
      upToDate: due.upToDate,
      nextAppointmentVaccines: due.nextAppointment
    };
  }

  // ============= Developmental Screening =============

  async recordDevelopmentalScreening(data) {
    const {
      patientId,
      episodeId,
      assessmentDate,
      ageInMonths,
      screeningTool,
      scores,
      interpretation,
      referralRecommended,
      recordedBy,
      orgId
    } = data;

    const result = await this.pool.query(
      `INSERT INTO pediatric_developmental_screening
       (patient_id, episode_id, assessment_date, age_in_months,
        screening_tool, gross_motor_score, fine_motor_score,
        language_score, personal_social_score, results_interpretation,
        referral_recommended, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [patientId, episodeId, assessmentDate, ageInMonths,
       screeningTool, scores.grossMotor, scores.fineMotor,
       scores.language, scores.personalSocial, interpretation,
       referralRecommended, orgId]
    );

    // Auto-create referral if delay detected
    if (referralRecommended) {
      await this.createEarlyInterventionReferral(patientId, orgId);
    }

    return result.rows[0];
  }

  // ============= HEADSS Assessment =============

  async recordHEADSSAssessment(data) {
    const {
      patientId,
      episodeId,
      assessmentDate,
      ageAtAssessment,
      home, education, activities, drugs, sexual, suicide,
      providerId,
      orgId
    } = data;

    // Calculate overall risk level
    const riskLevel = this._calculateHEADSSRisk({
      home, education, activities, drugs, sexual, suicide
    });

    const result = await this.pool.query(
      `INSERT INTO pediatric_headss_assessment
       (patient_id, episode_id, assessment_date, age_at_assessment,
        home_living_situation, home_domestic_violence_screening,
        education_school_attendance, education_academic_performance,
        activities_peer_relationships, drug_tobacco_use, drug_alcohol_use,
        sexual_activity_status, suicide_suicidal_ideation,
        overall_risk_level, immediate_intervention_needed, provider_id, org_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [patientId, episodeId, assessmentDate, ageAtAssessment,
       home.livingSituation, home.domesticViolence,
       education.attendance, education.performance,
       activities.peerRelationships, drugs.tobacco, drugs.alcohol,
       sexual.active, suicide.ideation,
       riskLevel, riskLevel === 'immediate', providerId, orgId]
    );

    // Create safety plan if high/immediate risk
    if (riskLevel === 'high' || riskLevel === 'immediate') {
      await this.createSafetyPlan(patientId, riskLevel, orgId);
    }

    return result.rows[0];
  }

  // ============= Utility Methods =============

  async calculateGrowthPercentiles(data) {
    // Implement CDC/WHO growth chart calculation
    // Uses LMS algorithm or lookup tables
    // Returns: percentile, Z-score
  }

  _generateACIPSchedule(ageInMonths) {
    // Return CDC/ACIP 2024 vaccination schedule for age
  }

  _calculateDueVaccines(schedule, administered) {
    // Compare schedule against administered vaccines
    // Return: due, overdue, upToDate arrays
  }

  _calculateHEADSSRisk(assessment) {
    // Evaluate HEADSS domains for risk level
    // Return: 'low' | 'moderate' | 'high' | 'immediate'
  }

  async createSafetyPlan(patientId, riskLevel, orgId) {
    // Create safety plan record and tasks
  }

  async createEarlyInterventionReferral(patientId, orgId) {
    // Auto-create referral for developmental concern
  }
}

module.exports = PediatricService;
```

---

## Clinical Decision Support Rules

### Rule 1: Growth Velocity Flag (JSON Logic)

```json
{
  "id": "ped-rule-001",
  "name": "Detect Abnormal Growth Velocity",
  "description": "Flag when weight drops across percentile lines or falls below 5th percentile",
  "trigger": "growth_record_created",
  "conditions": {
    "or": [
      {
        "and": [
          {"var": "current.weight_percentile"}: {"<": 5},
          {"var": "previous.weight_percentile"}: {">": 15}
        ]
      },
      {
        "var": "growth_velocity_assessment"}: "abnormal"
      }
    ]
  },
  "actions": [
    {
      "type": "create_task",
      "title": "Review Growth Velocity - Possible Failure to Thrive",
      "description": "Patient weight percentile has decreased significantly. Evaluate for medical/nutritional causes.",
      "priority": "high",
      "assignedToRole": "provider"
    },
    {
      "type": "alert",
      "severity": "warning",
      "message": "Abnormal growth velocity detected"
    },
    {
      "type": "add_reminder",
      "reminderText": "Schedule nutrition consultation if trend continues"
    }
  ]
}
```

### Rule 2: Developmental Delay Referral

```json
{
  "id": "ped-rule-002",
  "name": "Developmental Delay - Refer to Early Intervention",
  "description": "Auto-create early intervention referral for developmental delays",
  "trigger": "developmental_screening_completed",
  "conditions": {
    "var": "results_interpretation"}: {"in": ["delay", "concern"]}
  },
  "actions": [
    {
      "type": "create_referral",
      "referralType": "early_intervention",
      "title": "Early Intervention Evaluation",
      "description": "Developmental screening indicates need for evaluation",
      "priority": "high"
    },
    {
      "type": "create_task",
      "title": "Contact Early Intervention Program",
      "description": "Refer to state Early Intervention (Part C) program for evaluation",
      "priority": "high",
      "assignedToRole": "care_coordinator"
    },
    {
      "type": "send_notification",
      "recipientType": "parent",
      "subject": "Your child's development screening results",
      "template": "dev-delay-notification"
    }
  ]
}
```

### Rule 3: Immunization Overdue Alert

```json
{
  "id": "ped-rule-003",
  "name": "Immunization Overdue - Schedule Appointment",
  "description": "Alert when vaccinations are overdue beyond grace period",
  "trigger": "daily_schedule",
  "conditions": {
    "and": [
      {"var": "overdue_vaccines.length"}: {">": 0},
      {"var": "days_since_due"}: {">": 7}
    ]
  },
  "actions": [
    {
      "type": "create_task",
      "title": "Schedule Immunization Appointment",
      "description": "Patient has {{overdue_vaccines.length}} overdue vaccinations",
      "priority": "medium",
      "assignedToRole": "scheduler"
    },
    {
      "type": "send_notification",
      "recipientType": "parent",
      "subject": "Your child's vaccinations are due",
      "template": "immunization-overdue-notification"
    }
  ]
}
```

### Rule 4: High-Risk HEADSS Assessment

```json
{
  "id": "ped-rule-004",
  "name": "High-Risk HEADSS Result - Safety Assessment",
  "description": "Immediate action for high/immediate risk HEADSS results",
  "trigger": "headss_assessment_completed",
  "conditions": {
    "var": "overall_risk_level"}: {"in": ["high", "immediate"]}
  },
  "actions": [
    {
      "type": "create_safety_plan",
      "title": "Safety Plan Required",
      "requiresProviderSignoff": true
    },
    {
      "type": "create_task",
      "title": "Urgent Mental Health Assessment",
      "description": "HEADSS assessment indicates {{overall_risk_level}} risk. Requires immediate evaluation.",
      "priority": "critical",
      "assignedToRole": "provider",
      "dueDate": "today"
    },
    {
      "type": "create_referral",
      "referralType": "mental_health",
      "urgency": "immediate",
      "description": "High-risk HEADSS result requires mental health evaluation"
    },
    {
      "type": "send_notification",
      "recipientType": "provider",
      "severity": "critical",
      "message": "Patient {{patient_name}} has high-risk HEADSS result requiring immediate action"
    }
  ]
}
```

---

## API Endpoint Specification

### Pediatric Routes Structure

```
GET  /api/pediatric/patients/:patientId/growth
POST /api/pediatric/patients/:patientId/growth
GET  /api/pediatric/patients/:patientId/immunizations
POST /api/pediatric/patients/:patientId/immunizations
GET  /api/pediatric/patients/:patientId/immunization-schedule
GET  /api/pediatric/patients/:patientId/developmental-screening
POST /api/pediatric/patients/:patientId/developmental-screening
GET  /api/pediatric/patients/:patientId/headss
POST /api/pediatric/patients/:patientId/headss
GET  /api/pediatric/patients/:patientId/assessments
POST /api/pediatric/patients/:patientId/newborn-screening
GET  /api/pediatric/patients/:patientId/well-visits
POST /api/pediatric/patients/:patientId/well-visits
```

---

## Well-Visit Templates by Age (Abbreviated Specification)

| Age Group | Form ID | Key Sections | Assessment Tools | Vaccines |
|-----------|---------|--------------|------------------|----------|
| 0-3 days | pwv-newborn | Birth data, vitals, feeding | APGAR, jaundice screen | HepB |
| 7-10 days | pwv-1wk | Feeding, jaundice, weight loss | Physical exam | - |
| 1 month | pwv-1mo | Feeding, sleep, development | Vitals, reflexes | HepB |
| 2 months | pwv-2mo | Growth, development, feeding | Vitals, neuro exam | DTaP, IPV, PCV, Hib, RV, HepB |
| 4 months | pwv-4mo | Growth, development, feeding | Denver II screening | DTaP, IPV, PCV, Hib, RV |
| 6 months | pwv-6mo | Growth, development, intro foods | Vitals, physical exam | DTaP, IPV, PCV, Hib, RV, IIV |
| 9 months | pwv-9mo | Growth, development milestones | Denver II (formal), vitals | - |
| 12 months | pwv-12mo | Growth, development, nutrition | Vitals, hearing, vision | Hib, PCV, HepA, MMR, VAR, IIV |
| 18 months | pwv-18mo | Growth, behavior, language | Denver II, ASQ-3, M-CHAT | DTaP, IPV, HepA |
| 2 years | pwv-2yr | Growth (BMI), behavior, toilet train | Vitals, lead screening | - |
| 3 years | pwv-3yr | Preschool readiness, speech | Speech evaluation, behavior | - |
| 4 years | pwv-4yr | Behavior, social skills, academics | Vision/hearing, neuro | - |
| 5 years | pwv-5yr | School entry, academics, behavior | Vision/hearing, physical fitness | - |
| 6+ years | pwv-school | Annual growth, academics, behavior | Vision/hearing, sports phys | Per schedule |
| 13+ years | pwv-adolescent | HEADSS, sexual health, substance use | HEADSS, PHQ-9, CRAFFT | HPV, Meningococcal, COVID-19 |

---

## Implementation Checklist

### Phase 1: Database & Core Services (Weeks 1-2)
- [ ] Create all 28 database tables with indexes
- [ ] Create PediatricService class
- [ ] Implement growth percentile calculations
- [ ] Create immunization schedule generator (CDC/ACIP 2024)
- [ ] Write unit tests for service methods

### Phase 2: API Routes & Endpoints (Weeks 2-3)
- [ ] Create /api/pediatric/growth endpoints
- [ ] Create /api/pediatric/immunizations endpoints
- [ ] Create /api/pediatric/developmental-screening endpoints
- [ ] Create /api/pediatric/headss endpoints
- [ ] Create /api/pediatric/assessments endpoints
- [ ] Integration tests for all endpoints

### Phase 3: FHIR Questionnaires (Week 3)
- [ ] Create 8+ well-visit questionnaire templates
- [ ] Create HEADSS questionnaire
- [ ] Create assessment questionnaires (Denver II, ASQ-3, etc.)
- [ ] Implement conditional logic in questionnaires
- [ ] Add decision support hints

### Phase 4: Frontend Components (Weeks 3-4)
- [ ] Growth tracking chart component
- [ ] Immunization status component
- [ ] Well-visit form components
- [ ] HEADSS assessment form
- [ ] Developmental screening form
- [ ] Dashboard widgets (overdue vaccines, growth trends, etc.)

### Phase 5: Clinical Decision Support (Week 4)
- [ ] Configure 8+ CDS rules
- [ ] Implement rule engine integration
- [ ] Test alert/notification generation
- [ ] Create safety plan workflow
- [ ] Referral automation

### Phase 6: Maternal Linkage (Week 5)
- [ ] Create baby-from-delivery record workflow
- [ ] Link pediatric patient to OB/GYN episode
- [ ] Import delivery data (gestational age, birth weight, complications)
- [ ] Populate newborn screening order automatically

### Phase 7: Testing & Validation (Week 5-6)
- [ ] Unit test coverage > 80%
- [ ] Integration test coverage > 70%
- [ ] Clinical validation with pediatricians
- [ ] Compliance validation (AAP Bright Futures, CDC schedules)
- [ ] Performance testing (growth calculations, schedule generation)

---

## File Locations (By Module)

### Backend Files
```
ehr-api/src/
├── migrations/
│   ├── 251221000001-create-pediatric-core-tables.js
│   ├── 251221000002-create-pediatric-assessment-tables.js
│   └── 251221000003-create-pediatric-indexes.js
├── services/
│   ├── pediatric.service.js (main service, 800+ lines)
│   └── pediatric-helpers.js (growth calculations, etc.)
├── routes/
│   ├── pediatric-growth.js
│   ├── pediatric-immunizations.js
│   ├── pediatric-developmental.js
│   ├── pediatric-headss.js
│   └── pediatric-assessments.js
└── controllers/
    └── pediatric.controller.js (main controller)
```

### Frontend Files
```
ehr-web/src/
├── app/pediatrics/
│   ├── page.tsx (main dashboard)
│   ├── well-visits/page.tsx
│   ├── growth/page.tsx
│   ├── immunizations/page.tsx
│   ├── developmental-screening/page.tsx
│   ├── headss-assessment/page.tsx
│   └── assessments/page.tsx
├── components/
│   ├── pediatrics/
│   │   ├── GrowthChart.tsx
│   │   ├── ImmunizationStatus.tsx
│   │   ├── WellVisitForm.tsx
│   │   ├── HEADSSForm.tsx
│   │   └── DevelopmentalScreening.tsx
│   └── forms/
│       └── PediatricWellVisitTemplate.tsx
└── services/
    └── pediatric.service.ts
```

---

## Integration Points

1. **Maternal OB/GYN Records**:
   - Link baby to mother's delivery record
   - Import gestational age, birth weight, delivery method
   - Track mother's complications affecting neonatal care

2. **Patient Management**:
   - Register patient from delivery record
   - Create specialty episode for pediatrics
   - Link family relationships

3. **Appointment Scheduling**:
   - Well-visit appointment templates by age
   - Auto-schedule based on Bright Futures periodicity
   - Immunization appointment scheduling

4. **Rule Engine**:
   - Growth velocity monitoring
   - Immunization due dates
   - Developmental delay referrals
   - HEADSS risk assessment
   - Safety planning

5. **Forms/Templates**:
   - Load appropriate form based on age/visit type
   - Dynamic questionnaires with conditional logic
   - Form versioning by Bright Futures updates

---

## Performance Considerations

**Growth Percentile Calculation**:
- Cache CDC/WHO coefficient tables in Redis
- Pre-calculate common age/percentile combinations
- Lazy-load extended tables for rare ages

**Immunization Schedule**:
- Cache 2024 ACIP schedule in Redis
- Pre-generate schedule at patient registration
- Update cache on vaccine administration

**Database Queries**:
- Index on patient_id + visit_date for quick lookups
- Separate read/write for history tables
- Archive old growth/vital records after age 18

---

## Compliance & Regulatory

- **AAP Bright Futures**: 2024 edition periodicity schedule
- **CDC/ACIP**: 2024 immunization schedule with 2024 updates
- **WHO Growth Standards**: For infants 0-24 months
- **CDC Growth Charts**: For children 2-20 years
- **HIPAA**: Standard privacy/security for pediatric data
- **State-Specific**: Newborn screening requirements vary by state

---

## Success Criteria

- [ ] All 28 database tables created with proper indexes
- [ ] Growth percentile calculations within 0.1% of CDC tables
- [ ] 100% compliance with AAP Bright Futures periodicity
- [ ] Immunization schedule generation within 99% of CDC ACIP guidance
- [ ] HEADSS assessment completeness > 95%
- [ ] Developmental screening referral sensitivity > 90%
- [ ] API response times < 500ms for all endpoints
- [ ] Frontend load times < 3 seconds
- [ ] Clinical validation approved by pediatrician

---

**Document Prepared**: December 21, 2025
**Status**: Ready for Development Team Review
**Next Step**: Schedule technical review with development team for implementation planning
