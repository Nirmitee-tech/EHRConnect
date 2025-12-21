# Mental Health & Psychiatry EHR Module - Implementation Plan

**Date**: 2025-12-21
**Project**: EHRConnect Psychiatric Specialty Pack
**Status**: Planning Phase
**Scope**: Complete mental health/psychiatry workflows with integrated assessment tools, safety planning, and medication management

---

## Executive Overview

Implementation of comprehensive psychiatry specialty module integrating:
- 8 standardized assessment scales (PHQ-9, GAD-7, PCL-5, MDQ, AUDIT, DAST-10, CAGE-AID, C-SSRS)
- Structured psychiatric workflows (intake → diagnosis → treatment → monitoring)
- Clinical decision support with safety-critical alerts
- Medication management with controlled substance tracking
- FHIR-compliant data structures for interoperability

**Estimated Effort**: 16-20 weeks (4 development phases)
**Team Size**: 2-3 engineers + 1 clinical advisor
**Key Dependencies**: Existing FHIR Questionnaire system, specialty pack framework

---

## Phase 1: Assessment Tools Foundation (4-6 weeks)

### Deliverables

#### 1.1 Assessment Tool Scoring Engines
- **File**: `/ehr-api/src/services/mental-health-assessments.service.js`
- **Scope**:
  - PHQ-9 scoring (0-27 range, 5 severity levels)
  - GAD-7 scoring (0-21 range, 4 severity levels)
  - PCL-5 scoring (0-80 range, 5 severity levels)
  - MDQ scoring (positive/negative screen)
  - AUDIT scoring (4 risk zones)
  - DAST-10 scoring (0-10 range)
  - CAGE-AID scoring (positive/negative screen)
  - C-SSRS risk stratification (low/moderate/high/critical)

**Database Schema**:
```sql
-- Assessment Results Table
CREATE TABLE psychiatric_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  encounter_id UUID REFERENCES encounters(id),
  assessment_type VARCHAR(50) NOT NULL, -- 'PHQ9', 'GAD7', etc
  assessment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  responses JSONB NOT NULL, -- [{item_id, answer_value, item_text}]
  total_score INT,
  severity_level VARCHAR(20),
  interpretation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_psychiatric_assessments_patient ON psychiatric_assessments(patient_id, assessment_date DESC);
CREATE INDEX idx_psychiatric_assessments_org_type ON psychiatric_assessments(org_id, assessment_type);
```

**API Endpoints** (POST `/api/mental-health/assessments/`):
```
POST /api/mental-health/assessments/phq9
POST /api/mental-health/assessments/gad7
POST /api/mental-health/assessments/pcl5
POST /api/mental-health/assessments/mdq
POST /api/mental-health/assessments/audit
POST /api/mental-health/assessments/dast10
POST /api/mental-health/assessments/cage-aid
POST /api/mental-health/assessments/c-ssrs

GET /api/mental-health/assessments/:patientId
GET /api/mental-health/assessments/:patientId/:assessmentType
```

#### 1.2 FHIR Questionnaire Templates for Assessment Tools
- **File**: Seed data at `/ehr-api/database/seed-scripts/mental-health-questionnaires.js`
- **Scope**: FHIR Questionnaire resources for each assessment tool
- **Format**: Structured FHIR Questionnaire with LOINC codes

**Example FHIR Questionnaire Structure** (PHQ-9):
```json
{
  "resourceType": "Questionnaire",
  "id": "phq-9",
  "title": "Patient Health Questionnaire-9",
  "status": "active",
  "version": "1.0.0",
  "code": [{
    "system": "http://loinc.org",
    "code": "44261-6",
    "display": "Patient Health Questionnaire-9: Depression Screening"
  }],
  "item": [
    {
      "linkId": "phq9-1",
      "text": "Little interest or pleasure in doing things",
      "type": "choice",
      "answerValueSet": "#phq-score-values",
      "required": true
    },
    // ... 8 more items
  ],
  "valueSet": {
    "resourceType": "ValueSet",
    "id": "phq-score-values",
    "compose": {
      "include": [{
        "concept": [
          {"code": "0", "display": "Not at all"},
          {"code": "1", "display": "Several days"},
          {"code": "2", "display": "More than half the days"},
          {"code": "3", "display": "Nearly every day"}
        ]
      }]
    }
  }
}
```

#### 1.3 Frontend Assessment Form Components
- **Files**:
  - `/ehr-web/src/components/mental-health/PHQ9AssessmentForm.tsx`
  - `/ehr-web/src/components/mental-health/GAD7AssessmentForm.tsx`
  - `/ehr-web/src/components/mental-health/CSsrsRiskAssessment.tsx`
  - `/ehr-web/src/components/mental-health/AssessmentResultsDisplay.tsx`

- **Features**:
  - Dynamic form rendering from FHIR Questionnaire
  - Real-time score calculation
  - Severity level display with color coding
  - Trend graphing (historical scores)
  - Printable assessment results

#### 1.4 Testing & Validation
- Unit tests for scoring algorithms (all 8 tools)
- Validate scoring thresholds against clinical references
- Test FHIR Questionnaire parsing & rendering
- Performance testing (sub-100ms scoring)

---

## Phase 2: Clinical Workflows (6-8 weeks)

### Deliverables

#### 2.1 Psychiatric Intake Workflow
- **File**: `/ehr-api/src/services/psychiatric-intake.service.js`
- **Scope**:
  - Initial assessment data capture
  - Assessment tool administration (PHQ-9, GAD-7, C-SSRS, AUDIT, DAST-10)
  - DSM-5 diagnosis recording
  - Risk stratification
  - Treatment planning kickoff

**Workflow Stages**:
```
Stage 1: Triage (Front desk, <5 min)
  → Chief complaint
  → CAGE-AID rapid screen
  → Route to appropriate clinician

Stage 2: Comprehensive Assessment (Clinician, 30-45 min)
  → Demographics/insurance
  → Psychiatric history
  → Substance use (AUDIT/DAST-10)
  → Medical history
  → Assessment battery (PHQ-9/GAD-7/PCL-5/MDQ/C-SSRS)
  → Mental Status Examination

Stage 3: Clinical Formulation (Psychiatrist, 15-20 min)
  → DSM-5 diagnosis coding
  → Medication/therapy recommendations
  → Safety planning (if risk identified)
  → Treatment plan creation
```

#### 2.2 Mental Status Examination (MSE) Template
- **File**: `/ehr-api/src/services/mse-documentation.service.js`
- **Scope**:
  - 12 MSE domains documentation
  - Structured vs. narrative fields
  - Clinical observations standardization
  - FHIR Observation resources for individual findings

**MSE Domains** (EHR implementation):
```
1. Appearance & Behavior (9 fields)
2. Mood & Affect (3 fields)
3. Speech (4 fields)
4. Thought Process (6 fields)
5. Thought Content (9 fields including ideation/delusions/hallucinations)
6. Perception (5 field options)
7. Orientation (4 domains: person, place, time, situation)
8. Consciousness & Attention (2 fields)
9. Memory (3 types: immediate, recent, remote)
10. Cognitive Functioning (4 areas: concentration, calculation, abstraction, insight)
11. Insight & Judgment (2 fields)
12. Reliability (1 field)
```

**Database**:
```sql
CREATE TABLE mental_status_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  encounter_id UUID NOT NULL REFERENCES encounters(id),
  examination_date TIMESTAMP NOT NULL,

  -- Structured fields
  appearance_age_appropriate BOOLEAN,
  appearance_grooming VARCHAR(20), -- 'good', 'fair', 'poor', 'disheveled'
  appearance_hygiene VARCHAR(20),
  appearance_clothing_appropriateness VARCHAR(20),

  mood_subjective VARCHAR(100), -- Patient's own words
  mood_category VARCHAR(20), -- 'depressed', 'euthymic', 'elevated', 'irritable'
  mood_stability VARCHAR(20), -- 'stable', 'labile', 'reactive'
  affect_congruence VARCHAR(20), -- 'appropriate', 'inappropriate'
  affect_range VARCHAR(20), -- 'normal', 'restricted', 'blunted', 'flat', 'expansive'

  speech_rate VARCHAR(20), -- 'normal', 'accelerated', 'slow'
  speech_volume VARCHAR(20),
  speech_articulation VARCHAR(20),
  speech_coherence VARCHAR(20),

  thought_process_organization VARCHAR(20), -- 'logical', 'tangential', 'circumstantial', 'flight_of_ideas'
  thought_content_preoccupations TEXT,
  thought_content_has_obsessions BOOLEAN,
  thought_content_suicidal_ideation VARCHAR(20), -- 'denied', 'present'
  thought_content_homicidal_ideation VARCHAR(20),
  thought_content_delusions VARCHAR(20), -- 'denied', 'present'
  thought_content_delusion_types TEXT,
  thought_content_hallucinations VARCHAR(20),
  thought_content_hallucination_types TEXT,
  thought_content_magical_thinking BOOLEAN,

  perception_findings TEXT,

  orientation_person BOOLEAN,
  orientation_place BOOLEAN,
  orientation_time BOOLEAN,
  orientation_situation BOOLEAN,

  consciousness_level VARCHAR(20), -- 'alert', 'drowsy', 'lethargic'
  attention_status VARCHAR(20), -- 'alert', 'distractible', 'scattered'

  memory_immediate VARCHAR(20), -- 'normal', 'impaired'
  memory_recent VARCHAR(20),
  memory_remote VARCHAR(20),

  concentration_status VARCHAR(20),
  abstraction_ability VARCHAR(20),
  insight_level VARCHAR(20), -- 'good', 'fair', 'poor', 'absent'
  judgment_quality VARCHAR(20), -- 'good', 'fair', 'poor'

  reliability VARCHAR(20), -- 'reliable', 'questionable', 'unreliable'
  reliability_concerns TEXT,

  -- Narrative summary
  mse_summary TEXT,

  documented_by_clinician_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_encounter FOREIGN KEY(encounter_id) REFERENCES encounters(id)
);
```

#### 2.3 DSM-5 Diagnostic Coding System
- **File**: `/ehr-api/src/services/dsm5-diagnosis.service.js`
- **Scope**:
  - ICD-10-CM code lookup (psychiatric diagnoses)
  - DSM-5 specifier support (anxious distress, with guilt, etc.)
  - Diagnostic certainty levels (confirmed, provisional, rule-out)
  - Primary/secondary diagnosis tracking

**Database**:
```sql
CREATE TABLE psychiatric_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  episode_id UUID REFERENCES patient_episodes(id),

  icd10_code VARCHAR(10) NOT NULL,
  icd10_description VARCHAR(500),
  dsm5_diagnostic_name VARCHAR(200),

  -- Specifiers
  severity_level VARCHAR(20), -- 'mild', 'moderate', 'severe'
  specifiers TEXT, -- JSON array of applied specifiers

  onset_date DATE,
  onset_age INT,
  symptom_duration_days INT,

  diagnostic_certainty VARCHAR(20), -- 'confirmed', 'provisional', 'rule_out'
  is_primary BOOLEAN DEFAULT FALSE,

  recorded_by_clinician_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.4 Treatment Plan Builder
- **File**: `/ehr-api/src/services/treatment-plan.service.js`
- **Scope**:
  - SMART goal definition (Specific, Measurable, Achievable, Relevant, Time-bound)
  - Intervention planning (psychiatric meds, psychotherapy, other)
  - Progress tracking against goals
  - Plan review scheduling

**Database**:
```sql
CREATE TABLE psychiatric_treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  created_by_clinician_id UUID NOT NULL,

  plan_date DATE,
  planned_duration_weeks INT,
  review_date DATE,

  -- Goals (SMART format)
  goals JSONB, -- [{goal_id, description, measurable_target, target_date, measurement_method}]

  -- Interventions
  interventions JSONB, -- [{type, name, frequency, provider_id, details}]

  status VARCHAR(20), -- 'active', 'paused', 'completed'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example goals JSON:
{
  "goals": [
    {
      "goal_id": "goal-1",
      "description": "Reduce depressive symptoms",
      "baseline_phq9": 18,
      "measurable_target": "PHQ-9 score <10 (mild or less)",
      "target_date": "2026-02-21",
      "measurement_method": "PHQ-9 administration every 2 weeks",
      "progress_tracking": true
    }
  ]
}
```

#### 2.5 Therapy Session Note Templates
- **Files**:
  - `/ehr-api/src/templates/therapy-session-note-template.js`
  - `/ehr-web/src/components/mental-health/TherapySessionNoteForm.tsx`
- **Scope**:
  - Session documentation with structured fields
  - Therapy type tracking (CBT, DBT, ACT, Psychodynamic, etc.)
  - Intervention documentation
  - Homework assignment & tracking
  - Progress measurement at each session

---

## Phase 3: Advanced Features & Safety (8-10 weeks)

### Deliverables

#### 3.1 Suicide Risk Assessment & Safety Planning
- **File**: `/ehr-api/src/services/suicide-risk.service.js`
- **Scope**:
  - C-SSRS administration & scoring
  - Risk stratification (low/moderate/high/critical)
  - Automated safety plan generation
  - Emergency contact verification
  - Crisis protocol triggers

**Critical Safety Workflow**:
```
1. C-SSRS Positive Screen (any ideation or behavior) → ESCALATE
2. Risk Stratification:
   - LOW: No ideation or passive death wish
     → Standard follow-up (4-6 weeks)
     → Psychoeducation materials

   - MODERATE: Active ideation without plan/intent
     → Increased monitoring (weekly)
     → Safety plan (mandatory)
     → PCP notification
     → Medication review

   - HIGH: Active ideation with plan/intent/behavior
     → Immediate psychiatric evaluation
     → Inpatient admission assessment
     → 24-hour safety plan
     → Family notification

   - CRITICAL: Recent attempt or ongoing intent
     → EMERGENCY PROTOCOL
     → Crisis services activation
     → Involuntary hold evaluation
```

**Database**:
```sql
CREATE TABLE suicide_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  encounter_id UUID REFERENCES encounters(id),

  assessment_date TIMESTAMP NOT NULL DEFAULT NOW(),

  -- C-SSRS Core Questions
  wish_to_be_dead BOOLEAN,
  active_suicidal_ideation BOOLEAN,
  ideation_with_plan_or_intent BOOLEAN,
  preparatory_behavior BOOLEAN,
  actual_suicide_attempt BOOLEAN,
  nonsuicidal_self_injury BOOLEAN,

  -- Risk Stratification
  risk_level VARCHAR(20) NOT NULL, -- 'low', 'moderate', 'high', 'critical'

  -- Severity Dimensions
  frequency VARCHAR(20), -- 'less_than_daily', 'daily_or_more'
  duration VARCHAR(20), -- 'brief', 'persistent'
  controllability VARCHAR(20),
  deterrents_strength VARCHAR(20),

  -- Safety Planning
  safety_plan_id UUID REFERENCES safety_plans(id),
  means_restriction_discussed BOOLEAN,
  emergency_contact_verified BOOLEAN,

  -- Clinical Actions
  psychiatrist_notified BOOLEAN,
  crisis_resources_provided BOOLEAN,
  hospitalization_recommended BOOLEAN,

  assessed_by_clinician_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),

  plan_date DATE NOT NULL,

  -- Plan Components
  warning_signs TEXT NOT NULL,
  internal_coping_strategies TEXT,
  external_coping_strategies TEXT,
  support_contacts JSONB, -- [{name, phone, relationship}]
  professional_contacts JSONB, -- [{role, name, phone}]
  means_safety_steps TEXT,
  reasons_for_living TEXT,
  crisis_action_plan TEXT,

  -- Management
  status VARCHAR(20), -- 'active', 'reviewed', 'updated'
  last_reviewed_date DATE,
  next_review_date DATE,

  patient_has_copy BOOLEAN,
  emergency_contacts_notified BOOLEAN,

  created_by_clinician_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Critical Alerts in CDS**:
```javascript
// Alert: Suicide Risk Escalation
{
  id: "suicide-risk-escalation",
  severity: "CRITICAL",
  trigger: (patient) => {
    const latestCSSRS = getLatestCSsrs(patient.id);
    const previousCSSRS = getPreviousCSsrs(patient.id);
    return previousCSSRS?.risk_level === 'LOW' && latestCSSRS?.risk_level !== 'LOW';
  },
  message: "SUICIDE RISK ESCALATION: Immediate action required",
  actions: [
    "Notify all clinical staff immediately",
    "Schedule emergency psychiatric evaluation",
    "Generate/review safety plan",
    "Verify emergency contact"
  ]
}

// Alert: SSRI Black Box (Age <25 or High Suicide Risk)
{
  id: "ssri-black-box-warning",
  severity: "WARNING",
  trigger: (patient) => {
    const isYoungAdult = patientAge(patient) < 25;
    const isHighRisk = getLatestCSsrs(patient.id)?.risk_level === 'HIGH';
    const hasSSRI = hasPrescription(patient.id, 'SSRI');
    return (isYoungAdult || isHighRisk) && hasSSRI;
  },
  message: "Black box warning: SSRIs increase suicidal thoughts in young adults and high-risk patients",
  actions: [
    "Schedule close follow-up (1 week phone check-in minimum)",
    "Detailed patient education provided",
    "Document informed consent"
  ]
}
```

#### 3.2 Medication Management System
- **File**: `/ehr-api/src/services/psychiatric-medication.service.js`
- **Scope**:
  - Medication trial tracking (start → efficacy assessment → adjustment)
  - Side effect monitoring
  - Drug interaction checking
  - Therapeutic drug level monitoring (lithium, etc.)
  - Controlled substance safety (PDMP integration, benzodiazepine protocols)

**Database**:
```sql
CREATE TABLE psychiatric_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),

  medication_name VARCHAR(100) NOT NULL,
  medication_class VARCHAR(50), -- 'SSRI', 'SNRI', 'Antipsychotic', 'Mood_Stabilizer', 'Stimulant', 'Benzodiazepine'

  dose_mg DECIMAL(10,2),
  frequency VARCHAR(50),
  route VARCHAR(20), -- 'oral', 'iv', 'im', 'td' (transdermal)

  start_date DATE NOT NULL,
  end_date DATE,

  indication VARCHAR(200),

  -- Trial Tracking
  baseline_assessment_score INT, -- PHQ-9/GAD-7 baseline
  current_assessment_score INT,
  assessment_type VARCHAR(20), -- 'PHQ9', 'GAD7', etc

  expected_improvement_date DATE, -- 4-6 weeks from start

  -- Side Effects
  side_effects TEXT,
  side_effect_severity VARCHAR(20), -- 'mild', 'moderate', 'severe'
  side_effects_impact_on_adherence VARCHAR(20),

  -- Adherence
  adherence_level VARCHAR(20), -- 'good', 'partial', 'poor'

  -- Special Considerations
  is_controlled_substance BOOLEAN DEFAULT FALSE,
  requires_tdm BOOLEAN DEFAULT FALSE, -- Therapeutic drug monitoring
  tdm_frequency VARCHAR(50), -- e.g., "quarterly"
  last_tdm_date DATE,
  last_tdm_level DECIMAL(10,2),
  therapeutic_range VARCHAR(50), -- e.g., "0.5-1.2 mEq/L for lithium"

  prescriber_id UUID NOT NULL REFERENCES practitioners(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Medication Trial Monitoring Workflow**:
```
Week 1-2 (Titration):
  ✓ Check adherence & side effects
  ✓ Monitor suicidal ideation (especially SSRIs)
  ✓ Adjust dose as indicated

Week 4 (Response Assessment):
  ✓ Administer same assessment tool (PHQ-9/GAD-7)
  ✓ Compare to baseline
  ✓ ≥50% improvement? → Continue current dose
  ✓ <25% improvement? → Escalate dose or switch

Week 6-8 (Efficacy Determination):
  ✓ Adequate response? → Continue + maintenance monitoring
  ✓ Partial response? → Dose escalation or augmentation
  ✓ No response? → Switch to different medication

Ongoing (Maintenance):
  ✓ Monthly for first 3 months
  ✓ Quarterly once stabilized
  ✓ Annual physical exam with metabolic labs
  ✓ Lithium: Quarterly drug levels + renal/thyroid
```

#### 3.3 Psychiatric Outcome Monitoring Dashboard
- **Files**:
  - `/ehr-api/src/services/outcome-monitoring.service.js`
  - `/ehr-web/src/components/mental-health/OutcomeMonitoringDashboard.tsx`
- **Scope**:
  - Real-time assessment trending (PHQ-9, GAD-7, PCL-5, C-SSRS)
  - Graphical progress visualization
  - Treatment response classification
  - Automated recommendations based on response
  - Population health metrics (remission rate, response rate, etc.)

#### 3.4 Clinical Decision Support Rules (8+ rules)
- **File**: `/ehr-api/src/rules/mental-health-cds-rules.json`
- **Scope**: Safety alerts, medication interactions, treatment recommendations

**Critical Rules**:
1. Suicide Risk Escalation (CRITICAL)
2. SSRI Black Box Warning (WARNING)
3. Bipolar Switching Risk (WARNING)
4. Controlled Substance Abuse Potential (WARNING)
5. Medication Non-Response (INFO)
6. Drug Interactions - Serotonin Syndrome (CRITICAL)
7. Benzodiazepine Duration Limit (WARNING)
8. Medication Level Monitoring Overdue (INFO)

---

## Phase 4: Integration & Optimization (4-6 weeks)

### Deliverables

#### 4.1 FHIR Interoperability
- FHIR Observation resources for assessment results
- FHIR PlanDefinition for treatment plans
- FHIR Procedure for therapy sessions
- FHIR MedicationStatement for medication management
- API endpoints for FHIR resource export/import

#### 4.2 Telehealth Integration
- Post-therapy session note capture
- Video recording references in clinical notes
- Synchronous assessment administration

#### 4.3 Group Therapy Tracking
- Group session management
- Individual attendance tracking
- Group-level outcome metrics
- Session notes with individual/group progress

#### 4.4 Performance & Security
- Query optimization for assessment history (add indexes)
- Encryption of sensitive data (suicide risk assessments, means)
- Audit logging for all risk assessments
- Rate limiting on assessment endpoints
- Cache frequently accessed assessment definitions

#### 4.5 Testing & Documentation
- Comprehensive test coverage (unit, integration, E2E)
- Clinical workflow validation with psychiatrist
- User documentation & training materials
- Data migration plan (if integrating existing patients)

---

## API Specifications Summary

### Assessment Management
```
POST   /api/mental-health/assessments/:type
GET    /api/mental-health/assessments/:patientId
GET    /api/mental-health/assessments/:patientId/:type
GET    /api/mental-health/assessments/:patientId/history
GET    /api/mental-health/assessments/:patientId/trend
```

### Psychiatric Intake
```
POST   /api/mental-health/intake
GET    /api/mental-health/intake/:patientId
PUT    /api/mental-health/intake/:intakeId
```

### Diagnoses
```
POST   /api/mental-health/diagnoses
GET    /api/mental-health/diagnoses/:patientId
PUT    /api/mental-health/diagnoses/:diagnosisId
GET    /api/mental-health/diagnoses/:patientId/current
```

### Treatment Plans
```
POST   /api/mental-health/treatment-plans
GET    /api/mental-health/treatment-plans/:patientId
PUT    /api/mental-health/treatment-plans/:planId
POST   /api/mental-health/treatment-plans/:planId/progress
```

### Medications
```
POST   /api/mental-health/medications
GET    /api/mental-health/medications/:patientId
PUT    /api/mental-health/medications/:medicationId
GET    /api/mental-health/medications/:patientId/trial-response
POST   /api/mental-health/medications/:medicationId/side-effects
```

### Safety Planning
```
POST   /api/mental-health/safety-plans
GET    /api/mental-health/safety-plans/:patientId
PUT    /api/mental-health/safety-plans/:planId
POST   /api/mental-health/safety-plans/:planId/verify-contacts
```

### Suicide Risk Assessment
```
POST   /api/mental-health/suicide-risk
GET    /api/mental-health/suicide-risk/:patientId/latest
GET    /api/mental-health/suicide-risk/:patientId/history
POST   /api/mental-health/suicide-risk/:assessmentId/actions
```

### Outcomes
```
GET    /api/mental-health/outcomes/:patientId
GET    /api/mental-health/outcomes/:patientId/dashboard
GET    /api/mental-health/outcomes/population/metrics
```

---

## Technology Stack & Architecture

### Backend Components
- **Language**: TypeScript/Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (multi-tenant schema)
- **Caching**: Redis (assessment definitions, trending calculations)
- **Clinical Data Standards**: FHIR R4, LOINC, ICD-10-CM

### Frontend Components
- **Framework**: Next.js 15 + React 19
- **UI Components**: Radix UI + Tailwind CSS
- **Graphing**: Recharts or similar for outcome trending
- **Forms**: FHIR Questionnaire renderer

### External Integrations
- **PDMP** (Prescription Drug Monitoring Program) for controlled substances
- **Drug Database** (RxNorm, DrugBank) for interactions
- **ICD-10 Lookup** service

---

## Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Clinical validation delays | High | Medium | Engage psychiatrist early, iterative reviews |
| Assessment tool licensing issues | Medium | Low | Verify public domain status upfront |
| HIPAA compliance for sensitive data | Critical | Low | Security review, encryption, audit logging |
| Integration with existing specialty packs | High | Medium | Design modular approach, clear dependencies |
| Medication interaction data accuracy | High | Low | Use validated drug databases, clinical review |
| Suicide risk alert false positives | High | Medium | Establish clear clinical thresholds, review by clinician |

---

## Success Criteria & Metrics

### Functional Criteria
- ✅ All 8 assessment tools scoring accurately (validated against clinical references)
- ✅ Psychiatric intake workflow reduces documentation time by 30%
- ✅ Safety planning auto-generated within 2 minutes of risk assessment
- ✅ Medication trial tracking with automated recommendations operational
- ✅ FHIR Questionnaire resources for all assessments interoperable

### Clinical Criteria
- ✅ Psychiatrist validation of workflows and templates
- ✅ DSM-5 diagnostic coding accuracy (reviewed by clinical advisor)
- ✅ Safety alert testing with psychiatrist
- ✅ Zero critical safety issues in testing

### Performance Criteria
- ✅ Assessment scoring < 100ms
- ✅ Treatment plan creation < 5 minutes (clinician time)
- ✅ API response time < 500ms (p95)
- ✅ Outcome dashboard loads in < 2 seconds

---

## Unresolved Implementation Questions

1. **Perinatal Integration**: Separate module for perinatal mental health (PPD/PPA, EPDS) or combine with general psychiatry?

2. **Genetic/Pharmacogenomics**: Should EHR support CYP450 genotyping for medication selection optimization?

3. **Group Therapy**: Full implementation with attendance tracking, or basic support?

4. **Substance Use Treatment**: Full MAT (Medication-Assisted Treatment) module or reference to external SUD programs?

5. **Quality Metrics**: Which population health metrics to track? (remission rate, treatment dropout, medication adherence)

6. **Machine Learning**: Future suicide risk prediction models? Priority level?

7. **Lab Ordering**: Auto-order lab work (lithium levels, metabolic panels) or manual ordering?

8. **EPCS Signature**: Digital signature support via third-party E-signature service?

9. **International Compliance**: ICD-11 support needed? Priority timeline?

10. **Mobile App**: Mental health features in mobile app? Separate or synchronized?

---

## Timeline & Milestones

```
Week 1-4:   Phase 1 - Assessment Tools Foundation
            ✓ Scoring engines built & tested
            ✓ FHIR Questionnaire templates
            ✓ Frontend form components
            ✓ Unit tests passing

Week 5-12:  Phase 2 - Clinical Workflows
            ✓ Psychiatric intake implemented
            ✓ MSE template operational
            ✓ DSM-5 diagnostic coding
            ✓ Treatment planning
            ✓ Therapy notes
            ✓ Integration testing

Week 13-22: Phase 3 - Advanced Features
            ✓ Suicide risk management
            ✓ Safety planning
            ✓ Medication management
            ✓ Outcome monitoring dashboard
            ✓ Clinical decision support rules (8+)
            ✓ Psychiatrist validation

Week 23-28: Phase 4 - Integration & Optimization
            ✓ FHIR interoperability
            ✓ Performance optimization
            ✓ Security hardening
            ✓ Comprehensive testing
            ✓ Documentation
            ✓ UAT & Launch readiness

Total: 28 weeks (7 months) - Development ready to launch
```

---

## Next Steps

1. **Review & Approval**: Obtain stakeholder approval for plan
2. **Clinical Validation**: Engage psychiatrist to validate workflows & templates
3. **Technical Design**: Create detailed API & database schemas
4. **Dependency Planning**: Confirm availability of PDMP, drug interaction databases
5. **Team Allocation**: Assign engineers and clinical advisor
6. **Development Kickoff**: Begin Phase 1 with assessment tools

---

**Report Generated**: 2025-12-21
**Status**: Ready for Approval & Team Allocation
**Contact**: Clinical Project Lead for questions
