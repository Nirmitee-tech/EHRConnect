# Mental Health & Psychiatry Module - Database Schema Reference

**Date**: 2025-12-21
**Version**: 1.0.0
**Purpose**: PostgreSQL schema for psychiatric assessment, diagnosis, treatment, and safety management

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 Organizational Context                       │
├─────────────────────────────────────────────────────────────┤
│ organizations → locations → departments                      │
│     ↓                                                         │
│ users (clinicians, admin)                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Patient Mental Health Core                      │
├─────────────────────────────────────────────────────────────┤
│ patients                                                     │
│   ├── psychiatric_assessments (PHQ-9, GAD-7, C-SSRS, etc)  │
│   ├── psychiatric_diagnoses (DSM-5 codes)                  │
│   ├── psychiatric_treatment_plans (SMART goals)            │
│   ├── psychiatric_medications (trials, side effects)       │
│   ├── suicide_risk_assessments (C-SSRS results)            │
│   ├── safety_plans (emergency contacts, coping)            │
│   ├── mental_status_examinations (MSE documentation)       │
│   └── therapy_sessions (individual/group therapy)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Table: psychiatric_assessments

**Purpose**: Store results of standardized mental health assessment tools

**Key Fields**:
- `assessment_type`: PHQ9, GAD7, PCL5, MDQ, AUDIT, DAST10, CAGE_AID, C_SSRS
- `responses`: JSONB containing item-level responses with scores
- `total_score`: Integer score (varies by assessment)
- `severity_level`: Interpretation (mild, moderate, severe, etc.)

**Schema**:
```sql
CREATE TABLE psychiatric_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  encounter_id UUID REFERENCES encounters(id),

  assessment_type VARCHAR(50) NOT NULL,
  assessment_date TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Item-level responses
  responses JSONB NOT NULL,
  -- Example: [
  --   {item_id: 1, item_text: "Little interest or pleasure", answer: 0},
  --   {item_id: 2, item_text: "Feeling down, depressed", answer: 1},
  --   ...
  -- ]

  -- Calculated score
  total_score INT,
  severity_level VARCHAR(20),
  -- For PHQ-9: 'none', 'mild', 'moderate', 'severe'
  -- For GAD-7: 'none', 'mild', 'moderate', 'severe'
  -- For PCL-5: 'none', 'mild', 'moderate', 'severe', 'very_severe'

  interpretation TEXT,
  -- Clinical interpretation of score

  interpreted_by_clinician_id UUID REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Indexes
CREATE INDEX idx_psych_assessments_patient_date
  ON psychiatric_assessments(patient_id, assessment_date DESC);
CREATE INDEX idx_psych_assessments_org_type
  ON psychiatric_assessments(org_id, assessment_type);
CREATE INDEX idx_psych_assessments_encounter
  ON psychiatric_assessments(encounter_id);
```

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "assessment_type": "PHQ9",
  "assessment_date": "2025-12-21T10:30:00Z",
  "responses": [
    {"item_id": 1, "item_text": "Little interest or pleasure", "answer": 2},
    {"item_id": 2, "item_text": "Feeling down, depressed", "answer": 2},
    {"item_id": 3, "item_text": "Trouble falling/staying asleep", "answer": 1},
    {"item_id": 4, "item_text": "Feeling tired or having little energy", "answer": 2},
    {"item_id": 5, "item_text": "Poor appetite or overeating", "answer": 1},
    {"item_id": 6, "item_text": "Feeling bad about yourself", "answer": 2},
    {"item_id": 7, "item_text": "Trouble concentrating", "answer": 1},
    {"item_id": 8, "item_text": "Moving/speaking slowly or restlessness", "answer": 0},
    {"item_id": 9, "item_text": "Thoughts that you'd be better off dead", "answer": 0}
  ],
  "total_score": 11,
  "severity_level": "mild",
  "interpretation": "Patient reports mild depressive symptoms. Recommend psychotherapy and reassessment in 2 weeks."
}
```

---

## Table: suicide_risk_assessments

**Purpose**: Document C-SSRS suicide risk assessment and risk stratification

**Key Fields**:
- `risk_level`: low, moderate, high, critical (MANDATORY)
- `safety_plan_id`: Foreign key to safety_plans table
- `psychiatrist_notified`: Boolean flag for notification

**Schema**:
```sql
CREATE TABLE suicide_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  encounter_id UUID REFERENCES encounters(id),

  assessment_date TIMESTAMP NOT NULL DEFAULT NOW(),

  -- C-SSRS Core Screening Questions
  wish_to_be_dead BOOLEAN,
  active_suicidal_ideation BOOLEAN,
  ideation_with_plan_or_intent BOOLEAN,
  preparatory_behavior BOOLEAN,
  actual_suicide_attempt BOOLEAN,
  nonsuicidal_self_injury BOOLEAN,

  -- Risk Stratification (CRITICAL FIELD)
  risk_level VARCHAR(20) NOT NULL CHECK (
    risk_level IN ('low', 'moderate', 'high', 'critical')
  ),

  -- Severity Dimensions (if ideation present)
  frequency VARCHAR(20),
  -- 'less_than_daily', 'daily_or_more'

  duration VARCHAR(20),
  -- 'brief', 'persistent'

  controllability VARCHAR(20),
  -- 'easily_controlled', 'difficult_to_control'

  deterrents_strength VARCHAR(20),
  -- 'strong', 'weak'

  -- Protective Factors
  reasons_for_living TEXT,

  -- Safety Planning
  safety_plan_id UUID REFERENCES safety_plans(id),
  means_restriction_discussed BOOLEAN,
  emergency_contact_verified BOOLEAN,

  -- Clinical Actions Taken
  psychiatrist_notified BOOLEAN DEFAULT FALSE,
  crisis_resources_provided BOOLEAN DEFAULT FALSE,
  hospitalization_recommended BOOLEAN DEFAULT FALSE,
  emergency_services_contacted BOOLEAN DEFAULT FALSE,

  assessed_by_clinician_id UUID NOT NULL REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Indexes
CREATE INDEX idx_suicide_risk_patient_date
  ON suicide_risk_assessments(patient_id, assessment_date DESC);
CREATE INDEX idx_suicide_risk_level
  ON suicide_risk_assessments(patient_id, risk_level);
```

**Clinical Workflow Automation**:
```
INSERT trigger on suicide_risk_assessments:
- If risk_level = 'HIGH' or 'CRITICAL' → Auto-create task for psychiatrist
- If risk_level changed from 'LOW' → Notify all clinical staff
- If ideation_with_plan_or_intent = TRUE → Alert emergency services
```

---

## Table: safety_plans

**Purpose**: Document personalized safety plans for patients at risk

**Key Fields**:
- `support_contacts`: JSONB array of emergency contacts
- `professional_contacts`: JSONB array of therapist/psychiatrist info
- `next_review_date`: Scheduled safety plan review

**Schema**:
```sql
CREATE TABLE safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),

  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Safety Plan Components
  warning_signs TEXT NOT NULL,
  -- e.g., "Increased isolation, sleeping more, hopelessness"

  internal_coping_strategies TEXT,
  -- e.g., "Deep breathing exercises, listening to music, journaling"

  external_coping_strategies TEXT,
  -- e.g., "Visiting friend, going to favorite coffee shop, calling therapist"

  -- Emergency Contacts (JSON structure)
  support_contacts JSONB,
  -- [{
  --   "name": "John Smith (friend)",
  --   "phone": "555-1234",
  --   "relationship": "friend",
  --   "notified": true
  -- }]

  professional_contacts JSONB,
  -- [{
  --   "role": "Therapist",
  --   "name": "Dr. Jane Doe",
  --   "phone": "555-5678",
  --   "available_hours": "9am-5pm"
  -- }]

  means_safety_steps TEXT,
  -- e.g., "Remove medications from nightstand, secure firearms with friend"

  reasons_for_living TEXT,
  -- e.g., "My children, my dog, my goals for the future"

  crisis_action_plan TEXT,
  -- Detailed step-by-step crisis response plan

  -- Management & Follow-up
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- 'active', 'reviewed', 'updated'

  last_reviewed_date DATE,
  next_review_date DATE,

  -- Copies & Verification
  patient_has_copy BOOLEAN DEFAULT FALSE,
  emergency_contacts_notified BOOLEAN DEFAULT FALSE,
  emergency_contacts_verified_date TIMESTAMP,

  created_by_clinician_id UUID NOT NULL REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Indexes
CREATE INDEX idx_safety_plans_patient
  ON safety_plans(patient_id, status);
CREATE INDEX idx_safety_plans_review_due
  ON safety_plans(next_review_date) WHERE status = 'active';
```

---

## Table: psychiatric_diagnoses

**Purpose**: Track DSM-5 psychiatric diagnoses with ICD-10 coding

**Key Fields**:
- `icd10_code`: Standard ICD-10-CM code
- `dsm5_specifiers`: Additional clinical details (e.g., "with anxious distress")
- `diagnostic_certainty`: confirmed, provisional, rule_out

**Schema**:
```sql
CREATE TABLE psychiatric_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_episodes(id),

  -- ICD-10 Coding
  icd10_code VARCHAR(10) NOT NULL,
  -- e.g., "F32.1" (Major Depressive Disorder, Single Episode, Moderate)

  icd10_description VARCHAR(500),
  dsm5_diagnostic_name VARCHAR(200),
  -- e.g., "Major Depressive Disorder"

  -- DSM-5 Specifiers
  severity_level VARCHAR(20),
  -- 'mild', 'moderate', 'severe'

  specifiers TEXT,
  -- e.g., "with anxious distress, with psychotic features"

  -- Diagnostic Information
  onset_date DATE,
  onset_age INT,
  symptom_duration_days INT,

  diagnostic_certainty VARCHAR(20) NOT NULL DEFAULT 'provisional',
  -- 'confirmed', 'provisional', 'rule_out'

  is_primary BOOLEAN DEFAULT FALSE,
  -- Primary vs. secondary diagnosis

  -- Clinical Context
  recorded_by_clinician_id UUID NOT NULL REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Indexes
CREATE INDEX idx_diagnoses_patient_primary
  ON psychiatric_diagnoses(patient_id, is_primary);
CREATE INDEX idx_diagnoses_icd10
  ON psychiatric_diagnoses(icd10_code);
```

**Sample Data**:
```json
{
  "icd10_code": "F32.1",
  "icd10_description": "Major Depressive Disorder, Single Episode, Moderate",
  "dsm5_diagnostic_name": "Major Depressive Disorder",
  "severity_level": "moderate",
  "specifiers": "with anxious distress, with guilt",
  "onset_date": "2025-09-15",
  "symptom_duration_days": 98,
  "diagnostic_certainty": "confirmed",
  "is_primary": true
}
```

---

## Table: psychiatric_treatment_plans

**Purpose**: Document comprehensive treatment plans with SMART goals

**Key Fields**:
- `goals`: JSONB array of treatment goals
- `interventions`: JSONB array of planned interventions
- `planned_duration_weeks`: Expected treatment duration

**Schema**:
```sql
CREATE TABLE psychiatric_treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_episodes(id),

  created_by_clinician_id UUID NOT NULL REFERENCES practitioners(id),

  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  planned_duration_weeks INT,
  review_date DATE,

  -- SMART Goals (Specific, Measurable, Achievable, Relevant, Time-bound)
  goals JSONB NOT NULL,
  -- [{
  --   "goal_id": "goal-1",
  --   "description": "Reduce depressive symptoms",
  --   "baseline_score": 18,
  --   "baseline_assessment_type": "PHQ9",
  --   "measurable_target": "PHQ-9 score <10",
  --   "target_date": "2026-02-21",
  --   "measurement_method": "PHQ-9 every 2 weeks",
  --   "current_progress": 45
  -- }]

  -- Interventions
  interventions JSONB NOT NULL,
  -- [{
  --   "intervention_id": "int-1",
  --   "type": "medication",
  --   "name": "Sertraline 50mg daily",
  --   "provider_id": "...",
  --   "frequency": "daily",
  --   "details": "SSRI for depression and anxiety"
  -- }, {
  --   "intervention_id": "int-2",
  --   "type": "psychotherapy",
  --   "name": "Cognitive-Behavioral Therapy",
  --   "provider_id": "...",
  --   "frequency": "weekly",
  --   "duration": "12 weeks"
  -- }]

  -- Plan Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- 'active', 'paused', 'completed'

  patient_engaged BOOLEAN DEFAULT FALSE,
  -- Patient participation & understanding confirmed

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Indexes
CREATE INDEX idx_treatment_plans_patient_active
  ON psychiatric_treatment_plans(patient_id, status);
CREATE INDEX idx_treatment_plans_review_due
  ON psychiatric_treatment_plans(review_date) WHERE status = 'active';
```

---

## Table: psychiatric_medications

**Purpose**: Track psychiatric medications, trials, side effects, and response

**Key Fields**:
- `medication_class`: SSRI, SNRI, Mood Stabilizer, Antipsychotic, Stimulant, etc.
- `baseline_assessment_score`: PHQ-9/GAD-7 at start
- `requires_tdm`: Therapeutic drug monitoring flag (lithium, clozapine)

**Schema**:
```sql
CREATE TABLE psychiatric_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),

  medication_name VARCHAR(100) NOT NULL,
  medication_class VARCHAR(50) NOT NULL,
  -- 'SSRI', 'SNRI', 'TCA', 'Mood_Stabilizer', 'Antipsychotic', 'Stimulant', 'Benzodiazepine', 'Anxiolytic'

  -- Dosing
  dose_mg DECIMAL(10,2),
  frequency VARCHAR(50),
  -- e.g., "50mg once daily", "25mg three times daily"

  route VARCHAR(20),
  -- 'oral', 'iv', 'im', 'td' (transdermal)

  start_date DATE NOT NULL,
  end_date DATE,

  -- Clinical Indication
  indication VARCHAR(200),
  -- e.g., "Major Depressive Disorder with Anxiety"

  -- Trial Tracking
  baseline_assessment_score INT,
  baseline_assessment_type VARCHAR(20),
  -- Type of assessment (PHQ9, GAD7, etc.)

  current_assessment_score INT,
  current_assessment_date DATE,

  expected_improvement_date DATE,
  -- 4-6 weeks from start for most antidepressants

  percent_improvement INT,
  -- Calculated: ((baseline - current) / baseline) * 100

  -- Side Effects
  side_effects TEXT,
  side_effect_severity VARCHAR(20),
  -- 'mild', 'moderate', 'severe'

  side_effects_impact_on_adherence VARCHAR(20),
  -- 'none', 'minimal', 'moderate', 'significant'

  -- Adherence
  adherence_level VARCHAR(20),
  -- 'good', 'partial', 'poor'

  -- Special Considerations
  is_controlled_substance BOOLEAN DEFAULT FALSE,
  -- Benzodiazepines, stimulants, etc.

  requires_therapeutic_monitoring BOOLEAN DEFAULT FALSE,
  -- Lithium, clozapine, etc.

  therapeutic_range VARCHAR(50),
  -- e.g., "0.5-1.2 mEq/L" for lithium

  tdm_frequency VARCHAR(50),
  -- e.g., "quarterly" for lithium

  last_tdm_date DATE,
  last_tdm_level DECIMAL(10,2),
  tdm_unit VARCHAR(20),
  -- e.g., "mEq/L", "ng/mL"

  prescriber_id UUID NOT NULL REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Indexes
CREATE INDEX idx_psych_medications_patient_active
  ON psychiatric_medications(patient_id) WHERE end_date IS NULL;
CREATE INDEX idx_psych_medications_controlled
  ON psychiatric_medications(patient_id) WHERE is_controlled_substance = TRUE;
CREATE INDEX idx_psych_medications_tdm_due
  ON psychiatric_medications(last_tdm_date) WHERE requires_therapeutic_monitoring = TRUE;
```

---

## Table: mental_status_examinations

**Purpose**: Structured documentation of Mental Status Examination (MSE)

**Schema**:
```sql
CREATE TABLE mental_status_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  encounter_id UUID NOT NULL REFERENCES encounters(id),

  examination_date TIMESTAMP NOT NULL DEFAULT NOW(),

  -- APPEARANCE & BEHAVIOR
  appearance_age_appropriate BOOLEAN,
  appearance_grooming VARCHAR(20), -- 'good', 'fair', 'poor', 'disheveled'
  appearance_hygiene VARCHAR(20),
  appearance_clothing VARCHAR(20), -- 'appropriate', 'inappropriate', 'bizarre'

  -- MOOD & AFFECT
  mood_subjective VARCHAR(500), -- Patient's own words
  mood_category VARCHAR(20), -- 'depressed', 'euthymic', 'elevated', 'irritable'
  mood_stability VARCHAR(20),
  affect_congruence VARCHAR(20),
  affect_range VARCHAR(20),

  -- SPEECH
  speech_rate VARCHAR(20),
  speech_volume VARCHAR(20),
  speech_articulation VARCHAR(20),

  -- THOUGHT PROCESS & CONTENT
  thought_process VARCHAR(20),
  thought_content_suicidal VARCHAR(20),
  thought_content_homicidal VARCHAR(20),
  thought_content_delusions VARCHAR(20),
  thought_content_hallucinations VARCHAR(20),

  -- ORIENTATION
  orientation_person BOOLEAN,
  orientation_place BOOLEAN,
  orientation_time BOOLEAN,
  orientation_situation BOOLEAN,

  -- MEMORY & COGNITION
  memory_immediate VARCHAR(20),
  memory_recent VARCHAR(20),
  memory_remote VARCHAR(20),
  concentration_status VARCHAR(20),

  -- INSIGHT & JUDGMENT
  insight_level VARCHAR(20),
  judgment_quality VARCHAR(20),

  -- Summary Narrative
  mse_summary TEXT,

  documented_by_clinician_id UUID NOT NULL REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_encounter FOREIGN KEY(encounter_id) REFERENCES encounters(id)
);

-- Index
CREATE INDEX idx_mse_encounter ON mental_status_examinations(encounter_id);
```

---

## Table: therapy_session_notes

**Purpose**: Document individual/group psychotherapy sessions

**Schema**:
```sql
CREATE TABLE therapy_session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  encounter_id UUID NOT NULL REFERENCES encounters(id),

  therapy_type VARCHAR(50),
  -- 'CBT', 'DBT', 'ACT', 'Psychodynamic', 'Interpersonal', 'Behavioral'

  session_number INT,
  session_date TIMESTAMP DEFAULT NOW(),
  duration_minutes INT,

  -- Clinical Status
  mood_at_session VARCHAR(50),
  suicidal_ideation_at_session VARCHAR(20),
  -- 'denied', 'present_mild', 'present_moderate', 'present_high'

  -- Session Content
  presenting_concerns TEXT,
  interventions_used TEXT,
  techniques_applied TEXT,

  -- Homework/Between-Session Work
  homework_assigned TEXT,
  previous_homework_completion VARCHAR(20),
  -- 'full', 'partial', 'not_attempted'

  -- Progress
  progress_toward_goals INT, -- Percentage
  symptom_changes TEXT,

  -- Follow-up
  next_session_scheduled_date DATE,
  therapist_id UUID NOT NULL REFERENCES practitioners(id),

  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_encounter FOREIGN KEY(encounter_id) REFERENCES encounters(id)
);
```

---

## Clinical Decision Support Rules Table

**Purpose**: Store configurable rules for mental health alerts

**Schema**:
```sql
CREATE TABLE mental_health_cds_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id), -- NULL = system rules

  rule_name VARCHAR(200) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL,
  -- 'medication_alert', 'safety_alert', 'treatment_recommendation', 'risk_stratification'

  trigger_condition VARCHAR(1000) NOT NULL,
  -- JSON Logic-based condition evaluation

  alert_message TEXT NOT NULL,
  recommended_action TEXT,

  severity VARCHAR(20) NOT NULL,
  -- 'info', 'warning', 'critical'

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id)
);

-- Critical System Rules (seed data)
INSERT INTO mental_health_cds_rules VALUES
(
  'suicide-risk-escalation',
  NULL,
  'Suicide Risk Escalation',
  'safety_alert',
  '{"and": [
    {"!=": [{"var": "previous_risk_level"}, {"var": "current_risk_level"}]},
    {"in": [{"var": "current_risk_level"}, ["MODERATE", "HIGH", "CRITICAL"]]}
  ]}',
  'CRITICAL ALERT: Suicide risk escalation detected. Immediate action required.',
  'Notify all clinical staff immediately. Schedule emergency psychiatric evaluation. Review/create safety plan.',
  'CRITICAL',
  TRUE
),
(
  'ssri-black-box-warning',
  NULL,
  'SSRI Black Box Warning',
  'medication_alert',
  '{"and": [
    {"or": [
      {"<": [{"var": "patient_age"}, 25]},
      {"==": [{"var": "suicide_risk_level"}, "HIGH"]}
    ]},
    {"==": [{"var": "medication_class"}, "SSRI"]}
  ]}',
  'Black box warning: SSRIs increase suicidal thoughts in patients <25 years or with high suicide risk.',
  'Schedule close follow-up (1 week phone check-in). Provide detailed patient education. Document informed consent.',
  'WARNING',
  TRUE
);
```

---

## Sample Queries

### Patient Mental Health Dashboard
```sql
-- Latest assessment scores for a patient
SELECT
  assessment_type,
  total_score,
  severity_level,
  assessment_date
FROM psychiatric_assessments
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY assessment_date DESC
LIMIT 5;

-- Active diagnoses
SELECT
  icd10_code,
  dsm5_diagnostic_name,
  severity_level,
  created_at
FROM psychiatric_diagnoses
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440001'
  AND diagnostic_certainty = 'confirmed';

-- Current medications
SELECT
  medication_name,
  dose_mg,
  frequency,
  start_date,
  is_controlled_substance
FROM psychiatric_medications
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440001'
  AND end_date IS NULL;

-- Latest suicide risk assessment
SELECT
  risk_level,
  assessment_date,
  wish_to_be_dead,
  active_suicidal_ideation,
  ideation_with_plan_or_intent,
  psychiatrist_notified
FROM suicide_risk_assessments
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY assessment_date DESC
LIMIT 1;

-- Active safety plan
SELECT
  warning_signs,
  reasons_for_living,
  next_review_date,
  status
FROM safety_plans
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440001'
  AND status = 'active';
```

### Population Health Queries
```sql
-- Depression remission rate (PHQ-9 <5 at discharge)
SELECT
  COUNT(*) FILTER (WHERE final_score < 5) AS remitted,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE final_score < 5) / COUNT(*), 2) AS remission_rate
FROM (
  SELECT DISTINCT ON (patient_id)
    patient_id,
    total_score AS final_score
  FROM psychiatric_assessments
  WHERE assessment_type = 'PHQ9'
    AND patient_id IN (
      SELECT patient_id FROM psychiatric_diagnoses
      WHERE icd10_code LIKE 'F32%' -- Depression codes
    )
  ORDER BY patient_id, assessment_date DESC
) AS final_scores;

-- Patients overdue for lithium monitoring
SELECT
  p.id,
  p.first_name,
  p.last_name,
  pm.medication_name,
  pm.last_tdm_date,
  CURRENT_DATE - pm.last_tdm_date AS days_since_tdm
FROM psychiatric_medications pm
JOIN patients p ON pm.patient_id = p.id
WHERE pm.medication_name = 'Lithium'
  AND pm.end_date IS NULL
  AND (pm.last_tdm_date IS NULL OR CURRENT_DATE - pm.last_tdm_date > 90);

-- Suicidal ideation cases requiring follow-up
SELECT
  p.id,
  p.first_name,
  p.last_name,
  sra.risk_level,
  sra.assessment_date,
  sra.psychiatrist_notified
FROM suicide_risk_assessments sra
JOIN patients p ON sra.patient_id = p.id
WHERE sra.risk_level IN ('moderate', 'high', 'critical')
  AND sra.assessment_date >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY sra.assessment_date DESC;
```

---

## Migration Strategy

### Phase 1: Initial Setup
```sql
-- Create all tables with constraints
-- Seed DSM-5 and ICD-10 lookup tables
-- Create indexes and partitions
```

### Phase 2: Data Import (if migrating from legacy system)
```sql
-- Map existing patient data to psychiatric module
-- Import existing diagnoses & medications
-- Convert legacy assessment scores to new format
-- Validate data integrity
```

### Phase 3: Optimization
```sql
-- Analyze query performance
-- Add materialized views for dashboards
-- Partition large tables by date
-- Archive historical data
```

---

## Performance Considerations

### Indexing Strategy
- Primary: Patient + date for assessment queries
- Secondary: Assessment type for filtering
- Unique: ICD-10 code lookup (non-clustered)
- Partial: Active medications (WHERE end_date IS NULL)

### Partitioning (future)
- Partition `psychiatric_assessments` by month (assessment_date)
- Partition `therapy_session_notes` by year
- Improves query performance for large organizations

### Query Optimization
- Use prepared statements
- Connection pooling (max 20 connections)
- Redis caching for assessment definitions
- Materialized views for trending/dashboard data

---

**Schema Version**: 1.0.0
**Last Updated**: 2025-12-21
**Status**: Ready for Implementation
