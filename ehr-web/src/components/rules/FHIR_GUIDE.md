# FHIR-Aware Rule Builder - Complete Guide

## 🏥 Overview

The Rule Builder now supports **comprehensive FHIR resources** covering all major healthcare data types. Create rules from basic demographics to complex multi-system clinical protocols.

## 📚 Supported FHIR Resources

### 1. Patient Demographics
- Age, Gender, Birth Date
- Marital Status, Language
- Deceased Status

### 2. Vital Signs & Observations (80+ fields)
- Blood Pressure (Systolic/Diastolic)
- Heart Rate, Respiratory Rate
- Temperature, Oxygen Saturation
- Weight, Height, BMI

### 3. Laboratory Results
- Blood Glucose, HbA1c
- Cholesterol (Total, LDL, HDL)
- Creatinine, eGFR
- Lab Interpretations (Normal/High/Low)

### 4. Medications
- Medication Codes (RxNorm)
- Status, Intent, Dosage
- Medication Class queries

### 5. Conditions/Diagnoses
- ICD-10 / SNOMED Codes
- Severity, Clinical Status
- Onset Age, Category

### 6. Procedures
- CPT / SNOMED Codes
- Status, Performed Date

### 7. Allergies & Intolerances
- Allergen Codes
- Category (food, medication, environment)
- Criticality (low, high)

### 8. Encounters & Visits
- Type, Class (ambulatory, emergency, inpatient)
- Status, Priority

### 9. Appointments
- Status, Service Type
- Priority

### 10. Computed Variables
- Time-based aggregates (24h avg BP, 7d avg glucose)
- Risk scores (fall risk, medication adherence)
- Derived metrics

## 📖 Rule Examples by Complexity

### ⭐ BASIC (Single Condition)

#### 1. Senior Patient Flag
```
WHEN: patient.age >= 65
ACTION: Flag for geriatric assessment
USE CASE: Age-based screening
```

#### 2. High Blood Pressure Alert
```
WHEN: observation.bp_systolic > 140 OR observation.bp_diastolic > 90
ACTION: Alert provider
RATIONALE: Stage 2 hypertension (AHA guidelines)
```

#### 3. Active Medication Check
```
WHEN: medication.status = 'active'
ACTION: Trigger medication reconciliation
```

---

### ⭐⭐ INTERMEDIATE (Multiple Conditions)

#### 4. Diabetes Screening Required
```
WHEN: ALL of:
  - patient.age >= 45
  - observation.bmi >= 25
  - var.days_since_last_visit > 365
ACTION: Order HbA1c screening
RATIONALE: USPSTF recommendations for diabetes screening
```

#### 5. Uncontrolled Hypertension Follow-up
```
WHEN: ALL of:
  - condition.code = 'I10' (Essential HTN)
  - var.bp_systolic_avg_24h > 140
  - medication.status = 'active'
ACTION: Review and adjust medications
RATIONALE: Patients on treatment with elevated BP need adjustment
```

#### 6. Fall Risk Assessment
```
WHEN: ALL of:
  - patient.age >= 65
  - var.fall_risk_score >= 45
  - encounter.type = 'AMB'
ACTION: PT referral + home safety assessment
```

---

### ⭐⭐⭐ ADVANCED (Complex Clinical Logic)

#### 7. Chronic Kidney Disease Monitoring
```
WHEN: ALL of:
  - condition.code CONTAINS 'N18' (CKD)
  - observation.lab_egfr < 60
  - observation.lab_creatinine > 1.5
  - medication.code != 'ace_inhibitor'
ACTION: CDS Hook - Suggest ACE-I/ARB for renal protection
RATIONALE: KDIGO 2024 Guidelines
EVIDENCE: Strong recommendation, high quality
```

#### 8. Early Sepsis Detection (qSOFA)
```
WHEN: ALL of:
  - observation.respiratory_rate >= 22
  - observation.bp_systolic <= 100
  - observation.temperature >= 100.4
  - encounter.class = 'EMER'
ACTION: CRITICAL ALERT - Initiate sepsis protocol
RATIONALE: qSOFA ≥2 indicates high mortality risk
ESCALATION: Page attending + rapid response team
```

#### 9. Polypharmacy Risk Management
```
WHEN: ALL of:
  - patient.age >= 65
  - var.active_medication_count >= 10
  - observation.lab_creatinine > 1.2
ACTION: Comprehensive medication review by pharmacist
RATIONALE: Polypharmacy + renal impairment = high ADR risk
```

---

### ⭐⭐⭐⭐ EXPERT (Multi-System Protocols)

#### 10. Heart Failure GDMT Optimization
```
WHEN: ALL of:
  - condition.code CONTAINS 'I50' (Heart failure)
  - observation.ejection_fraction < 40 (HFrEF)
  - medication.class_ace_arb = false
  - medication.class_beta_blocker = false
  - observation.bp_systolic >= 100
  - observation.heart_rate >= 70
ACTION: CDS Hook with multiple suggestions:
  1. Add Sacubitril/Valsartan (PARADIGM-HF trial)
  2. Add Carvedilol/Metoprolol
  3. Order baseline labs (BMP)
EVIDENCE: ACC/AHA 2022, ESC 2021 Guidelines
RATIONALE: Four-pillar GDMT reduces mortality
```

#### 11. Stroke Prevention in Atrial Fibrillation
```
WHEN: ALL of:
  - condition.code = 'I48' (Atrial fibrillation)
  - var.cha2ds2_vasc_score >= 2
  - medication.class_anticoagulant = false
  - condition.code != 'active_bleeding'
  - observation.platelet_count > 100000
ACTION: CDS Hook - Anticoagulation recommendation
OPTIONS:
  - Apixaban 5mg BID
  - Rivaroxaban 20mg daily
TOOLS: Link to CHA2DS2-VASc calculator
RATIONALE: Score ≥2 = strong anticoagulation recommendation
```

#### 12. Cancer Survivorship Care Plan
```
WHEN: ALL of:
  - condition.category = 'oncology'
  - procedure.code CONTAINS 'chemo'
  - procedure.status = 'completed'
  - var.days_since_treatment_end = 30
  - document.survivorship_plan = false
ACTION: Multi-step workflow automation:
  1. Generate ASCO survivorship template
  2. Schedule PCP follow-up
  3. Order surveillance imaging
  4. Refer to survivorship clinic
RATIONALE: ASCO/ACS survivorship guidelines
```

#### 13. Maternal Early Warning System
```
WHEN: ANY of:
  - observation.bp_systolic > 160
  - observation.bp_systolic < 90
  - observation.heart_rate > 120
  - observation.respiratory_rate > 30
  - observation.oxygen_saturation < 95
  - observation.temperature > 100.4
ACTION: CRITICAL - Activate maternal rapid response
ESCALATION:
  - Immediate: OB attending + rapid response team
  - Notify: Charge nurse + house supervisor
  - Document: All interventions
RATIONALE: MEWS criteria for maternal safety
```

#### 14. Pediatric Sepsis Bundle Compliance
```
WHEN: ALL of:
  - patient.age < 18
  - condition.code CONTAINS 'sepsis'
  - encounter.class = 'EMER'
  - var.time_since_recognition_min >= 60
  - var.bundle_completed = false
ACTION: Workflow checklist with time limits:
  ☐ Blood culture (30 min)
  ☐ Antibiotics given (60 min)
  ☐ Fluid bolus 20mL/kg (30 min)
  ☐ Lactate measured (60 min)
  ☐ PICU notified (60 min)
METRICS: Track bundle completion rates
RATIONALE: Surviving Sepsis Campaign guidelines
```

---

## 🔍 FHIR Path Examples

### Simple Paths
```javascript
patient.age                          // Direct property
observation.bp_systolic              // Vital sign value
medication.status                    // Status field
```

### Complex Paths (FHIR Standard)
```javascript
Patient.birthDate                                    // ISO date
Observation.valueQuantity.value                      // Numeric value
Observation.component[systolic].valueQuantity.value  // Component
MedicationRequest.medicationCodeableConcept.text     // Display text
Condition.code.coding.code                           // ICD-10/SNOMED
AllergyIntolerance.criticality                       // Criticality
```

---

## 💡 Best Practices

### 1. Start with Templates
- Choose appropriate complexity level (Basic → Expert)
- Customize template to your needs
- Test with sample data

### 2. Use Computed Variables
```javascript
// Instead of:
observation.bp_systolic > 140 (single reading)

// Use:
var.bp_systolic_avg_24h > 140 (24-hour average)
```

### 3. Consider Clinical Context
```javascript
// Bad: Age-only check
patient.age > 65

// Good: Age + relevant factors
patient.age > 65 AND
var.fall_risk_score > 45 AND
var.active_medication_count > 5
```

### 4. Add Evidence & Rationale
- Reference guidelines (ACC/AHA, USPSTF, etc.)
- Cite trials (PARADIGM-HF, EMPHASIS-HF)
- Document clinical reasoning

### 5. Set Appropriate Actions
- **Alerts** - Time-sensitive notifications
- **Tasks** - Workflow items with due dates
- **CDS Hooks** - Order-time suggestions
- **Workflow Automation** - Multi-step processes

---

## 🎯 Creating Rules

### Using Templates
1. Click "Templates" button
2. Browse by level: Basic → Expert
3. Read use case and rationale
4. Click "Use This Template"
5. Customize as needed

### Using AI Assistant
1. Click "AI Assistant" mode
2. Speak or type your rule:
   ```
   "Create alert when patient over 65 has
   high blood pressure over 140/90"
   ```
3. AI generates rule structure
4. Review and refine

### Using Guided Mode
1. Click "Guided" mode
2. Follow step-by-step wizard:
   - Select field (Patient Age)
   - Choose operator (>=)
   - Enter value (65)
3. Add more conditions
4. Preview rule

---

## 📊 Field Categories

1. **Patient Demographics** (6 fields)
2. **Vital Signs & Observations** (10+ fields)
3. **Laboratory Results** (10+ fields)
4. **Medications** (5 fields)
5. **Diagnoses & Conditions** (5 fields)
6. **Procedures** (3 fields)
7. **Allergies & Intolerances** (4 fields)
8. **Encounters & Visits** (4 fields)
9. **Appointments** (3 fields)
10. **Computed Variables** (6+ fields)

**Total: 80+ FHIR-mapped fields**

---

## 🚀 Advanced Patterns

### Time-Based Rules
```javascript
// Check if value changed recently
var.days_since_last_visit > 365

// Time-window aggregates
var.bp_systolic_avg_24h > 140
var.glucose_avg_7d > 180
```

### Multi-Condition Logic
```javascript
// Complex AND/OR combinations
(patient.age > 65 AND var.fall_risk_score > 45)
OR
(condition.code CONTAINS 'osteoporosis')
```

### Medication Class Queries
```javascript
// Check medication classes
medication.class_anticoagulant = false
medication.class_ace_arb = true
medication.class_beta_blocker = true
```

### Risk Score Calculations
```javascript
// Use computed risk scores
var.cha2ds2_vasc_score >= 2
var.fall_risk_score >= 45
var.med_adherence_score < 70
```

---

## 🔗 Integration Points

### Clinical Decision Support (CDS)
- Order-time suggestions
- Patient-view cards
- Evidence-based recommendations

### Workflow Automation
- Multi-step task creation
- Role-based assignment
- Time-tracked checklists

### Population Health
- Screening reminders
- Gap-in-care identification
- Quality measure tracking

---

## 📚 Additional Resources

- **FHIR Specification**: https://hl7.org/fhir
- **Clinical Guidelines**: ACC/AHA, USPSTF, KDIGO
- **Risk Calculators**: CHA2DS2-VASc, qSOFA, MEWS
- **Evidence Base**: Clinical trials, meta-analyses

---

## 🤝 Contributing

To add new FHIR resources:

1. Update `fhir-fields.config.ts`
2. Add field definitions with FHIR paths
3. Create example rules in `rule-examples.config.ts`
4. Test with real FHIR data
5. Document clinical rationale

---

**Built for Healthcare. Powered by FHIR. Validated by Clinicians.** 🏥
