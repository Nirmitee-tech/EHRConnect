# Research Report: Comprehensive Cardiology Specialty Clinical Workflows for EHR Implementation

**Research Date**: December 21, 2025
**Report Status**: Complete
**Plan**: Cardiology Specialty Pack Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Research Methodology](#research-methodology)
3. [Clinical Workflow Phases](#clinical-workflow-phases)
4. [Diagnostic Testing & Interpretation](#diagnostic-testing--interpretation)
5. [Cardiovascular Risk Calculators](#cardiovascular-risk-calculators)
6. [Heart Failure Management Framework](#heart-failure-management-framework)
7. [Arrhythmia Management Workflows](#arrhythmia-management-workflows)
8. [Cardiac Device Monitoring](#cardiac-device-monitoring)
9. [Database Schema Requirements](#database-schema-requirements)
10. [Clinical Decision Support Rules](#clinical-decision-support-rules)
11. [Implementation Recommendations](#implementation-recommendations)
12. [References](#references)

---

## Executive Summary

Cardiology specialty implementation in EHRConnect requires sophisticated clinical workflow management integrating diagnostic testing, multi-criteria risk stratification, medication optimization, and real-time device monitoring. Current market analysis (2024-2025) reveals cardiology EHR market growing from $3.36B (2025) to projected $5.44B (2035), driven by diagnostic automation, AI-assisted interpretation, remote monitoring expansion, and guideline-driven clinical decision support.

**Key Requirements Identified**:
- 15+ database tables for cardiology-specific data structures
- 8+ clinical risk calculators (ASCVD, CHA2DS2-VASc, HAS-BLED, GRACE, TIMI, Framingham, Wells, EuroSCORE II)
- Automated GDMT (Guideline-Directed Medical Therapy) optimization for heart failure
- Remote device monitoring integration (pacemakers, ICDs, CRTs)
- Real-time clinical decision support with guideline citations
- ECG/echo PACS integration with structured interpretation
- Multi-phase clinical workflows: consultation → diagnostics → treatment → monitoring

**Technology Recommendations**:
- IHE IDCO (Implantable Device Cardiac Observation) standard for device data integration
- HL7/XML protocol for device interrogation data
- AI-assisted ECG/echo interpretation (similar to IBM Watson Health approach)
- JSON Logic for risk calculator automation
- Socket.IO for real-time device alerts

---

## Research Methodology

**Sources Consulted**: 15+
**Date Range**: 2022-2025
**Search Keywords**:
- Cardiology EHR clinical workflows diagnostic testing protocols
- ASCVD risk calculator ACC AHA guidelines implementation
- Cardiac device monitoring pacemaker ICD remote monitoring EHR integration
- Heart failure management GDMT NYHA ACC guidelines
- Cardiology risk scores CHA2DS2-VASc HAS-BLED GRACE TIMI decision support

**Sources**:
- ACC/AHA official guidelines (2022-2024)
- MDCALC clinical calculators database
- PubMed Central clinical research (cardiology-specific)
- Market analysis (cardiology EHR market 2024-2035)
- Clinical device manufacturers (Biotronik, PaceMate, Vector)
- Leading EHR vendors (Epic/Merge Cardio, NextGen, OMS)

---

## Clinical Workflow Phases

### Phase 1: Initial Consultation & Triage

**Intake Assessment**:
- Chief complaint categorization (chest pain, dyspnea, palpitations, syncope, fatigue)
- Symptom severity (Canadian Cardiovascular Society Class I-IV for angina)
- Risk factor assessment (smoking, diabetes, hypertension, hyperlipidemia)
- Family history of premature CAD (first-degree relative <55M, <65F)
- Prior cardiovascular events (MI, stroke, TIA)
- Current medications review (especially cardioactive drugs)
- Vital signs capture (BP, HR, RR, temp, O2 sat, weight)

**Clinical Triage Decision Tree**:
```
Acute chest pain/dyspnea
→ GRACE/TIMI score calculated
→ Risk stratification (low/intermediate/high)
→ Disposition (admission, observation, discharge with follow-up)

Stable patient
→ ASCVD risk calculation
→ Specialty clinic assignment (HF, CAD, arrhythmia, device, valve)
→ Initial diagnostic workup planned
```

**Database Tables**:
- `cardiology_consultations` (org_id, patient_id, visit_date, chief_complaint, risk_category)
- `symptom_assessments` (consultation_id, symptom_type, severity_1_10, ccs_class)

### Phase 2: Diagnostic Workup

**Testing Tiers**:

**Tier 1 - Point of Care (First Visit)**:
- 12-lead ECG (rhythm analysis, ischemic changes, arrhythmia detection)
- Troponin/BNP labs (acute vs chronic assessment)
- Basic metabolic panel, CBC, lipid panel
- Chest X-ray (if dyspneic)

**Tier 2 - Outpatient Imaging (1-2 weeks)**:
- Transthoracic echocardiography (LVEF, wall motion, valves, diastolic function)
- If high-risk or abnormal echo → stress testing (exercise ECG, nuclear SPECT, stress echo)
- CT coronary angiography (CAC score, plaque assessment for intermediate risk)

**Tier 3 - Advanced Testing (as indicated)**:
- Cardiac catheterization with coronary angiography (if ischemia proven/suspected)
- Intravascular ultrasound (IVUS), fractional flow reserve (FFR), optical coherence tomography (OCT)
- Transesophageal echocardiography (TEE) - endocarditis, stroke source, valve complexity
- Cardiac MRI - myocardial viability, infiltrative disease, arrhythmogenic substrate
- Electrophysiology study - syncope workup, arrhythmia ablation planning

**Result Integration Requirements**:
- ECG machine interface (DICOM standard)
- PACS integration for echo, imaging DICOM files
- Lab interface (LIS) for troponin, BNP, lipids
- Structured interpretation templates for each modality
- Automated alert thresholds (critical troponin, severe LVEF depression)

**Database Tables**:
- `ecg_reports` (patient_id, test_date, rhythm, ischemic_changes, interpreted_by, report_text)
- `echocardiogram_reports` (patient_id, test_date, lvef, wall_segments[], valve_assessments[], qa_score)
- `stress_test_reports` (patient_id, test_type, max_hr, max_bp, symptoms, ecg_changes, interpretation)
- `cardiac_imaging` (patient_id, test_type, modality, dicom_files[], radiologist_report)
- `lab_results_cardio` (patient_id, test_date, troponin, bnp, prognosis_nt_probnp)

### Phase 3: Diagnosis & Treatment Planning

**Diagnosis Formulation**:
- Aggregated data interpretation from all tests
- Differential diagnosis documentation
- Coded diagnoses (ICD-10: I10 hypertension, I50 heart failure, I20 angina, I48 afib, etc.)
- Severity staging (NYHA Class I-IV for HF, CCS Class I-IV for angina)
- Guideline-based treatment pathway assignment

**Treatment Plan Creation**:
- Medication initiation/optimization (with guideline recommendations)
- Procedural planning (PCI, CABG, catheter ablation, device implant)
- Cardiac rehabilitation referral
- Risk factor modification counseling
- Follow-up appointment scheduling

**Database Tables**:
- `cardiology_diagnoses` (patient_id, icd10_code, condition_type, severity_stage, onset_date)
- `treatment_plans` (patient_id, plan_date, primary_diagnosis, medications[], procedures[], referrals[])
- `medication_orders_cardio` (patient_id, drug_name, indication, target_dose, start_date, titration_schedule)

### Phase 4: Medication Management & Optimization

**GDMT Optimization Loop** (especially for heart failure):
1. Baseline GDMT status captured
2. Target doses defined per ACC/AHA guidelines
3. Automated titration schedule created
4. Follow-up labs ordered (potassium, creatinine, BNP for monitoring)
5. Medication tolerance assessment
6. Dose adjustments as tolerated
7. GDMT optimization documented at each visit

**Anti-thrombotic Management**:
- Dual antiplatelet therapy (DAPT) post-PCI (duration tracking: BMS 1mo, DES 6-12mo)
- Anticoagulation for AFib (based on CHA2DS2-VASc score)
- Anticoagulation for mechanical valves, post-MI, HF
- Bleeding risk assessment (HAS-BLED) for anticoagulation intensity

**Database Tables**:
- `medication_adherence` (patient_id, drug_id, date, adherence_percentage, barriers)
- `gdmt_optimization_log` (patient_id, medication_class, previous_dose, new_dose, date, rationale)
- `dapt_tracking` (patient_id, stent_date, stent_type, dapt_duration_days, discontinue_date)

### Phase 5: Intervention & Procedure Tracking

**Procedure Documentation**:
- Catheterization details: vessel anatomy, stenosis percentages (LAD, LCx, RCA)
- PCI specifics: lesion location, stent type (BMS vs DES), TIMI flow, stent size
- CABG details: conduit types (LIMA, saphenous, radial), target vessels
- Ablation: arrhythmia type, lesion locations, energy delivery parameters
- Device implants: device type, manufacturer, model, serial number, lead positions

**Complications Tracking**:
- Procedural complications (dissection, perforation, no-reflow, arrhythmia)
- In-hospital complications (bleeding, infection, MI, stroke)
- 30-day complications (stent thrombosis, restenosis risk factors)

**Database Tables**:
- `catheterization_reports` (patient_id, procedure_date, vessel_anatomy[], stenosis_percent[], angiographic_findings)
- `pci_details` (catheterization_id, lesion_id, stent_type, stent_size, location, timi_flow_before_after)
- `ablation_procedures` (patient_id, procedure_date, arrhythmia_type, approach, lesions_ablated[])
- `cardiac_device_implants` (patient_id, device_type, manufacturer, model, serial_no, implant_date, leads[])

### Phase 6: Monitoring & Follow-up

**Short-term Monitoring** (post-procedure, weeks 1-6):
- Symptom assessment
- Medication tolerance check
- ECG trending (especially post-MI, post-ablation)
- Lab values (troponin serial, BNP, potassium, creatinine)
- Complication surveillance

**Long-term Management** (ongoing):
- Periodic office visits (3-6 month intervals depending on condition)
- Regular ECGs, annual echo (HF patients)
- Annual stress testing (post-MI, post-PCI for symptom assessment)
- Device clinic follow-ups (pacemakers, ICDs annually or per manufacturer)
- Remote monitoring review (if available)
- Medication adherence counseling
- Lifestyle modification reinforcement

**Database Tables**:
- `follow_up_appointments` (patient_id, scheduled_date, visit_type, chief_complaint, findings)
- `monitoring_data` (patient_id, data_type, value, normal_range, date, source)

---

## Diagnostic Testing & Interpretation

### ECG/EKG Analysis

**12-Lead ECG Data Structure**:
```sql
CREATE TABLE ecg_studies (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  study_date TIMESTAMP NOT NULL,

  -- Acquisition parameters
  paper_speed INT, -- 25 or 50 mm/s
  calibration_voltage FLOAT, -- mV/mm

  -- Basic measurements
  heart_rate INT,
  rhythm VARCHAR(50), -- Sinus, Afib, Atrial Flutter, VT, etc.
  pr_interval INT, -- milliseconds
  qrs_duration INT,
  qt_interval INT,
  qtc_interval INT, -- Corrected QT

  -- Axis determination
  qrs_axis VARCHAR(50), -- Normal, LAD, RAD, NWSA, etc.

  -- Waveform analysis
  st_elevation BOOLEAN,
  st_depression BOOLEAN,
  t_wave_inversion BOOLEAN,
  q_waves BOOLEAN, -- Pathologic (>40ms)

  -- Segment/wave interpretation
  segment_location VARCHAR(100), -- Anterior, Inferior, Lateral, etc.
  st_elevation_mm FLOAT,
  st_depression_mm FLOAT,
  t_wave_changes VARCHAR(255),

  -- Interpretive findings
  findings VARCHAR(MAX), -- Detailed interpretation
  clinical_correlation TEXT,

  -- DICOM reference
  dicom_file_path VARCHAR(500),

  -- Automated interpretation
  ai_interpretation TEXT, -- If using AI analysis
  ai_confidence_score FLOAT, -- 0-1 scale

  -- Clinician validation
  interpreted_by UUID,
  interpretation_date TIMESTAMP,
  interpretation_status VARCHAR(50), -- Pending, Preliminary, Final, Overread

  -- Trending
  compared_to_prior_ecg_id UUID REFERENCES ecg_studies(id),
  significant_changes TEXT,

  CONSTRAINT ecg_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (interpreted_by) REFERENCES practitioners(id)
);
```

**Critical ECG Findings for Alerts**:
- STEMI pattern (ST elevation in contiguous leads with reciprocal changes) → Alert: Cath lab activation
- NSTEMI pattern (ST depression, T wave inversion, troponin elevation) → Alert: Urgent evaluation
- Acute afib with RVR (HR >110 with afib) → Alert: Rate control evaluation
- Third-degree AV block → Alert: Pacemaker evaluation urgently needed
- Prolonged QTc (>500ms in males, >520ms females) → Alert: Drug review, electrolyte check
- Peaked T waves with wide QRS (hyperkalemia) → Alert: STAT potassium level

### Echocardiography Analysis

**Echo Report Structure**:
```sql
CREATE TABLE echocardiogram_studies (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  study_date TIMESTAMP NOT NULL,
  study_type VARCHAR(50), -- TTE, TEE, Stress Echo

  -- Ventricular function
  lvef_percent INT, -- Ejection fraction
  lvef_assessment VARCHAR(50), -- Normal, Mildly Reduced, Moderately Reduced, Severely Reduced
  -- Categorization: HFpEF (>=50%), HFmrEF (40-49%), HFrEF (<40%)

  lv_dimensions_diastolic_mm INT,
  lv_dimensions_systolic_mm INT,
  lv_wall_thickness_mm INT,

  -- Wall motion assessment (17-segment model)
  wall_motion_segments JSON, -- {segment: normal|hypokinetic|akinetic|dyskinetic, score: 1-4}
  wall_motion_score_index FLOAT, -- Average of 17 segments (1=normal, 4=dyskinetic)

  -- Diastolic function
  diastolic_function_grade VARCHAR(50), -- Normal, Grade I, II, III, IV
  e_e_prime_ratio FLOAT,
  la_strain_percent FLOAT,

  -- Chamber dimensions
  la_volume_index FLOAT, -- mL/m2
  ra_area_cm2 FLOAT,
  rvsp_mmhg INT, -- Right ventricular systolic pressure

  -- Valve assessments
  aortic_valve JSON, -- {severity: normal|trace|mild|moderate|severe, AVA_cm2, mean_gradient, peak_gradient}
  mitral_valve JSON, -- {stenosis_severity, regurgitation_severity, EROA_cm2}
  tricuspid_valve JSON, -- {regurgitation_severity, EROA}
  pulmonary_valve JSON, -- {regurgitation_severity}

  -- Pericardium
  pericardial_effusion VARCHAR(50), -- None, Trivial, Small, Moderate, Large
  effusion_size_mm INT,
  tamponade_assessment BOOLEAN,

  -- Arrhythmia findings
  arrhythmia_type VARCHAR(100),
  arrhythmia_frequency VARCHAR(50),

  -- Quality assessment
  image_quality VARCHAR(50), -- Excellent, Good, Fair, Poor
  limitations TEXT,

  -- Clinical impression
  findings TEXT,
  clinical_significance TEXT,
  recommendation TEXT,

  -- DICOM reference
  cine_file_path VARCHAR(500),

  -- Clinician validation
  interpreted_by UUID,
  interpretation_date TIMESTAMP,

  CONSTRAINT echo_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (interpreted_by) REFERENCES practitioners(id)
);
```

**Echo Findings → Treatment Decisions**:
- LVEF <40% + symptomatic → HFrEF diagnosis, GDMT initiation, device evaluation
- LVEF 40-49% → HFmrEF, moderate GDMT consideration
- Moderate-severe MR → Valve assessment for repair/replacement candidacy
- RVSP >40 mmHg → Pulmonary hypertension workup
- LA enlargement + afib → Stroke risk reassessment (CHA2DS2-VASc)

### Stress Testing Protocols

**Stress Test Framework**:
```sql
CREATE TABLE stress_test_studies (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  study_date TIMESTAMP NOT NULL,
  test_type VARCHAR(50), -- Exercise ECG, Nuclear SPECT, Stress Echo, Pharmacologic (Adenosine/Dobutamine)

  -- Indication & baseline
  indication TEXT,
  baseline_bp_sys INT, baseline_bp_dias INT,
  baseline_hr INT,
  baseline_ecg_id UUID REFERENCES ecg_studies(id),

  -- Test parameters (Exercise)
  protocol VARCHAR(50), -- Bruce, Modified Bruce, Ramp, etc.
  max_heart_rate INT,
  target_heart_rate_percent INT, -- Usually 85% PMHR
  heart_rate_reserve_achieved BOOLEAN,
  max_systolic_bp INT,
  max_diastolic_bp INT,

  -- Test termination
  test_completed BOOLEAN,
  termination_reason VARCHAR(255), -- Symptom-limited, max HR achieved, ischemia, safety concern, etc.
  symptom_at_termination VARCHAR(100), -- None, Chest pain, Dyspnea, Fatigue, Leg pain
  ecg_changes_during_test BOOLEAN,
  st_changes_severity VARCHAR(50), -- Mild (0.5-1mm), Moderate (1-2mm), Severe (>2mm)

  -- Nuclear/Echo findings (if applicable)
  perfusion_defects JSON, -- {location: anterior|inferior|lateral|septal, severity: mild|moderate|severe, ischemic|fixed}
  wall_motion_changes VARCHAR(255),
  lvef_stress INT, -- Ejection fraction during stress
  lvef_rest INT,

  -- Duke Treadmill Score (for risk stratification)
  duke_score INT, -- Exercise minutes - (5 × ST mm) - (4 × angina severity 0-2)
  duke_risk_category VARCHAR(50), -- Low (<-11), Intermediate (-11 to 4), High (>4)

  -- Interpretation
  findings TEXT,
  ischemia_present BOOLEAN,
  ischemia_extent VARCHAR(50), -- 1-vessel, 2-vessel, 3-vessel, LAD, LCx, RCA
  ischemia_severity VARCHAR(50), -- Mild, Moderate, Severe
  inducible_arrhythmia BOOLEAN,
  arrhythmia_type VARCHAR(100),

  -- Clinical correlation
  interpretation TEXT,
  recommendation TEXT, -- Medical management, Cardiac cath, No further testing

  interpreted_by UUID,
  interpretation_date TIMESTAMP,

  CONSTRAINT stress_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (interpreted_by) REFERENCES practitioners(id)
);
```

**Risk Stratification from Stress Test**:
- Duke Score <-11 (Low risk): Mortality 0.25%/year → Medical management
- Duke Score -11 to 4 (Intermediate): Mortality 1.5%/year → Further testing (CT angiography, cath consideration)
- Duke Score >4 (High risk): Mortality 5.7%/year → Recommend catheterization

### Coronary Angiography & Intervention

**Catheterization Findings**:
```sql
CREATE TABLE coronary_angiograms (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  procedure_date TIMESTAMP NOT NULL,
  indication TEXT,

  -- Coronary anatomy mapping
  lad_dominant BOOLEAN, -- Coronary dominance assessment

  -- Left main
  lm_stenosis_percent INT,
  lm_disease_significant BOOLEAN, -- >=50% stenosis

  -- LAD branches
  lad_proximal_stenosis INT,
  lad_mid_stenosis INT,
  lad_distal_stenosis INT,
  lad_diagonal_branches JSON, -- {d1_stenosis, d2_stenosis, etc.}

  -- LCx branches
  lcx_proximal_stenosis INT,
  lcx_om1_stenosis INT, -- Obtuse marginal 1
  lcx_om2_stenosis INT,
  lcx_distal_stenosis INT,

  -- RCA
  rca_proximal_stenosis INT,
  rca_mid_stenosis INT,
  rca_distal_stenosis INT,
  rca_pda_stenosis INT, -- Posterior descending artery

  -- Collateral vessels
  collateral_vessels_present BOOLEAN,
  collateral_description TEXT,

  -- Angiographic findings
  calcification_present BOOLEAN,
  thrombus_present BOOLEAN,
  dissection_present BOOLEAN,

  -- TIMI flow assessment (0-3 scale for each major vessel)
  lad_timi_flow INT,
  lcx_timi_flow INT,
  rca_timi_flow INT,

  -- Hemodynamics
  aortic_root_pressure INT,
  lv_end_diastolic_pressure INT,
  pulmonary_artery_pressure INT,
  cardiac_output FLOAT,
  cardiac_index FLOAT,

  -- Angiographic findings summary
  findings TEXT,

  -- PCI procedure details (if performed)
  pci_performed BOOLEAN,
  pci_procedure_id UUID REFERENCES pci_procedures(id),

  -- Operator
  performed_by UUID,

  CONSTRAINT cath_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (performed_by) REFERENCES practitioners(id)
);

CREATE TABLE pci_procedures (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  cath_id UUID NOT NULL REFERENCES coronary_angiograms(id),

  -- Target lesion details
  target_vessel VARCHAR(50), -- LAD, LCx, RCA, LM
  lesion_location VARCHAR(100), -- Proximal, mid, distal
  lesion_type VARCHAR(50), -- Type A, B1, B2, C (ACC/AHA classification)

  -- Lesion complexity
  calcification_severity VARCHAR(50), -- None, Mild, Moderate, Severe
  thrombus_burden VARCHAR(50), -- None, Small, Medium, Large
  branch_involvement VARCHAR(50), -- None, Side branch, Main branch

  -- Intervention details
  device_sequence JSON, -- [{sequence: 1, device_type: 'balloon', size_mm: 3.0}, ...]

  -- Balloon angioplasty
  balloon_sizes_mm FLOAT[],
  balloon_pressures_atm INT[],

  -- Stent implantation
  stent_type VARCHAR(50), -- BMS (Bare Metal Stent), DES (Drug Eluting Stent)
  stent_manufacturer VARCHAR(100), -- Medtronic, Abbott, Boston Scientific, etc.
  stent_name VARCHAR(100), -- Vision, Xience, Promus, etc.
  stent_size_mm FLOAT,
  stent_length_mm INT,
  stent_deployment_pressure_atm INT,
  stent_post_dilatation BOOLEAN,

  -- Additional adjunctive devices
  rotablation_performed BOOLEAN,
  thrombectomy_performed BOOLEAN,
  ivus_performed BOOLEAN, -- Intravascular ultrasound
  ffr_performed BOOLEAN, -- Fractional flow reserve
  ffr_value FLOAT, -- 0.0-1.0 scale, >=0.80 considered non-ischemic

  -- Immediate angiographic result
  residual_stenosis_percent INT,
  final_timi_flow INT,
  timi_myocardial_perfusion_grade INT, -- 0-3

  -- Complications
  dissection_present BOOLEAN,
  dissection_type VARCHAR(50), -- A-F per Ellis classification
  perforation_present BOOLEAN,
  no_reflow BOOLEAN,

  -- Success criteria
  procedural_success BOOLEAN, -- <20% residual stenosis, TIMI 3 flow

  -- Medication post-PCI
  dapt_plan_dual_agent VARCHAR(100), -- Aspirin + P2Y12i (Clopidogrel/Ticagrelor/Prasugrel)
  dapt_duration_days INT, -- BMS typically 30 days, DES typically 180-365 days

  CONSTRAINT pci_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

---

## Cardiovascular Risk Calculators

### 1. ASCVD Risk Estimator+ (2013 ACC/AHA)

**Clinical Purpose**: 10-year risk of first atherosclerotic cardiovascular event in adults 40-75 years without known ASCVD.

**Input Variables**:
- Age (years)
- Sex (Male/Female)
- Race (White, African American, other) [Note: 2024 ESC guidelines being updated to remove race-specific coefficients]
- Total cholesterol (mg/dL)
- HDL cholesterol (mg/dL)
- Systolic blood pressure (mmHg)
- Blood pressure medication use (Yes/No)
- Diabetes status (Yes/No)
- Current smoking (Yes/No)

**Calculation Method**: Pooled Cohort Equations (PCE) using logistic regression model.

**Risk Stratification**:
```json
{
  "ascvd_risk_percent": 10.5,
  "risk_category": "intermediate", // Low (<5%), Intermediate (5-7.5%), Borderline (5-7.5%), High (>=7.5%)
  "statin_recommendation": "moderate_to_high",
  "additional_testing": "coronary_artery_calcium_score_for_risk_refinement",
  "guideline_citations": [
    "2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk",
    "2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Prevention Guideline"
  ]
}
```

**EHR Implementation**:
- Auto-calculate at annual wellness visit if age 40-75 without known ASCVD
- Store result linked to encounter
- Generate clinical decision support alert if high-risk
- Track trend over time (annual recalculation)
- Integrate with medication management (statin intensity recommendations)

**Limitations**:
- Derived from primarily white populations
- Doesn't include family history
- Updated 2024 ESC guidelines expanding to age 40-80, different racial approach

**Database Table**:
```sql
CREATE TABLE ascvd_risk_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assessment_date TIMESTAMP NOT NULL,

  -- Input variables
  age_years INT,
  sex VARCHAR(20), -- Male, Female, Other
  race VARCHAR(50), -- White, African American, Other
  total_cholesterol_mg_dl INT,
  hdl_cholesterol_mg_dl INT,
  systolic_bp_mmhg INT,
  on_bp_medication BOOLEAN,
  diabetes_status BOOLEAN,
  current_smoker BOOLEAN,

  -- Calculated result
  ascvd_risk_percent FLOAT,
  risk_category VARCHAR(50), -- Low, Intermediate, Borderline, High

  -- Clinical recommendations
  statin_recommendation VARCHAR(100), -- No statin, Low intensity, Moderate intensity, High intensity
  nonstatins_recommended VARCHAR(MAX), -- PCSK9i, Ezetimibe, etc.

  -- Additional testing if intermediate risk
  cac_score_recommended BOOLEAN,
  cac_score INT, -- If obtained

  -- Clinician review
  reviewed_by UUID,
  reviewed_date TIMESTAMP,
  clinician_notes TEXT,

  CONSTRAINT ascvd_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (reviewed_by) REFERENCES practitioners(id)
);
```

### 2. CHA2DS2-VASc Score (Atrial Fibrillation Stroke Risk)

**Clinical Purpose**: Stratify stroke risk in patients with atrial fibrillation to guide anticoagulation decisions. Score range 0-9.

**Components**:
```
C = Congestive heart failure: 1 point
H = Hypertension: 1 point
A = Age ≥75 years: 2 points (Age 65-74: 1 point)
D = Diabetes: 1 point
S = Stroke/TIA/thromboembolism history: 2 points
V = Vascular disease (CAD, PAD, aortic plaque): 1 point
A = Age 65-74: 1 point (if not already scored as ≥75)
S = Sex female: 1 point
c = additional point from "c" factor
```

**Risk Stratification**:
```
Score 0 (males) or 1 (females): Low risk (<1% stroke/year)
  → No anticoagulation unless other high-risk features

Score 1 (males) or 2 (females): Low-intermediate risk (1-2% stroke/year)
  → Anticoagulation decision individualized

Score ≥2 (males) or ≥3 (females): High risk (≥2% stroke/year)
  → Anticoagulation strongly recommended (unless contraindication)
```

**Anticoagulation Assessment**:
- **First-line oral anticoagulants (OAC)**: DOAC (dabigatran, apixaban, edoxaban, rivaroxaban)
- **Alternative**: Warfarin if DOAC contraindicated
- **Contraindication assessment**: Active bleeding, severe renal disease (Cr Cl <15), dialysis
- **Bleeding risk stratification**: HAS-BLED score (separate calculation below)

**EHR Implementation**:
- Auto-calculate when AFib diagnosis documented
- Recalculate if HF, stroke, or age milestone occurs
- Alert if high-risk without documented OAC
- Track OAC choice, duration, INR (if warfarin)
- Annual review of continued indication

**Database Table**:
```sql
CREATE TABLE cha2ds2vasc_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assessment_date TIMESTAMP NOT NULL,

  -- Components
  chf_present BOOLEAN,
  hypertension_present BOOLEAN,
  age_years INT,
  diabetes_present BOOLEAN,
  prior_stroke_tia_te BOOLEAN, -- Transient ischemic attack, thromboembolism
  vascular_disease_present BOOLEAN, -- CAD, PAD, aortic plaque
  female_sex BOOLEAN,

  -- Calculated score
  cha2ds2vasc_score INT, -- 0-9
  risk_category VARCHAR(50), -- Low, Low-Intermediate, High
  stroke_risk_percent_annually FLOAT,

  -- Anticoagulation recommendation
  anticoagulation_recommended BOOLEAN,
  anticoagulation_type VARCHAR(50), -- DOAC, Warfarin, None
  oac_drug_name VARCHAR(100), -- Apixaban, Dabigatran, etc.
  oac_dose VARCHAR(50),
  oac_start_date DATE,

  -- Bleeding risk (HAS-BLED) assessment
  hasbled_score INT,
  major_bleeding_risk VARCHAR(50),

  -- Clinician review
  reviewed_by UUID,
  reviewed_date TIMESTAMP,
  clinician_decision_documented BOOLEAN, -- Whether provider acted on recommendation

  CONSTRAINT cha2ds2vasc_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (reviewed_by) REFERENCES practitioners(id)
);
```

### 3. HAS-BLED Score (Bleeding Risk on Anticoagulation)

**Clinical Purpose**: Assess risk of major bleeding in AFib patients on oral anticoagulants. Score range 0-9.

**Components**:
```
H = Hypertension: 1 point
A = Abnormal renal/liver function: 1 point each (2 max)
S = Stroke history: 1 point
B = Bleeding history or predisposition: 1 point
L = Labile INR: 1 point (if on warfarin)
E = Age ≥65: 1 point
D = Drugs (antiplatelet, NSAIDs) or alcohol abuse: 1 point each (2 max)
```

**Risk Stratification**:
```
Score 0: Low risk (<2.4% major bleeding/year)
Score 1: Low-intermediate (2.4%)
Score 2: Intermediate (4%)
Score ≥3: High risk (≥4% major bleeding/year)

ACTION:
- Score <3: Safe to initiate/continue OAC
- Score ≥3: Careful reassessment of bleeding risk factors, consider modifiable factors, close monitoring
```

**Bleeding Risk Reduction**:
- Address modifiable factors (HTN control, alcohol reduction, NSAID elimination)
- Consider PPI for GI bleed prevention if high-risk
- Regular renal monitoring
- INR monitoring if warfarin
- Patient education on bleeding signs

**Database Table**:
```sql
CREATE TABLE hasbled_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assessment_date TIMESTAMP NOT NULL,

  -- Components
  hypertension_present BOOLEAN,
  renal_dysfunction BOOLEAN, -- Cr >2.26 mg/dL or eGFR <60
  liver_dysfunction BOOLEAN, -- Cirrhosis or albumin <35
  stroke_history BOOLEAN,
  bleeding_history BOOLEAN, -- Prior major bleed or predisposition
  labile_inr BOOLEAN, -- If on warfarin, TTR <60%
  age_65_or_older BOOLEAN,
  antiplatelet_use BOOLEAN,
  nsaid_use BOOLEAN,
  alcohol_abuse BOOLEAN,

  -- Calculated score
  hasbled_score INT, -- 0-9
  major_bleeding_risk VARCHAR(50), -- Low, Intermediate, High
  annual_bleeding_risk_percent FLOAT,

  -- Risk mitigation
  modifiable_factors_identified VARCHAR(MAX),
  interventions_planned VARCHAR(MAX), -- PPI, NSAID cessation, HTN control, etc.

  -- Clinician review
  reviewed_by UUID,
  reviewed_date TIMESTAMP,

  CONSTRAINT hasbled_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (reviewed_by) REFERENCES practitioners(id)
);
```

### 4. GRACE Score (Acute Coronary Syndrome Risk)

**Clinical Purpose**: Predict in-hospital, 6-month, and 1-year mortality in ACS patients. Range 0-250+.

**Variables**:
- Age (years)
- Killip class (I=normal, II=rales/JVD, III=pulmonary edema, IV=cardiogenic shock)
- Systolic BP (mmHg)
- Heart rate (bpm)
- Creatinine (mg/dL)
- Cardiac biomarker elevation (troponin, CK-MB)
- ST-segment deviation (present/absent)

**Risk Stratification**:
```
Low risk (GRACE score <108): In-hospital mortality <1%, 6-month mortality <1.5%
Intermediate risk (GRACE 108-140): In-hospital mortality 1-2%, 6-month mortality 1.5-3%
High risk (GRACE >140): In-hospital mortality >2%, 6-month mortality >3%
```

**Clinical Application**:
- GRACE score calculated at ACS admission
- Guides risk stratification for ICU admission
- Informs invasive vs conservative strategy
- Determines intensity of monitoring and medications
- Higher scores → Earlier catheterization, more aggressive therapy

**Database Table**:
```sql
CREATE TABLE grace_score_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assessment_date TIMESTAMP NOT NULL,
  acs_type VARCHAR(50), -- STEMI, NSTEMI, UNSTABLE_ANGINA

  -- Input variables
  age_years INT,
  killip_class INT, -- 1, 2, 3, 4
  systolic_bp_mmhg INT,
  heart_rate_bpm INT,
  creatinine_mg_dl FLOAT,
  biomarker_elevated BOOLEAN,
  troponin_ng_ml FLOAT,
  st_segment_deviation BOOLEAN,

  -- Calculated score
  grace_score INT, -- 0-250+
  risk_category VARCHAR(50), -- Low, Intermediate, High
  hospital_mortality_percent FLOAT,
  six_month_mortality_percent FLOAT,
  one_year_mortality_percent FLOAT,

  -- Clinical recommendations
  invasive_strategy_recommended BOOLEAN,
  icu_admission_recommended BOOLEAN,
  early_cath_recommended BOOLEAN, -- Within 2-24 hours for high-risk

  -- Disposition decision
  admission_location VARCHAR(50), -- ICU, Monitored bed, Ward

  CONSTRAINT grace_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### 5. TIMI Risk Score (ACS Risk Stratification)

**Clinical Purpose**: Simplified risk prediction tool for ACS patients. TIMI STEMI score: 0-8, TIMI NSTEMI score: 0-7.

**TIMI Risk Score - NSTEMI/UA**:
```
1 point each for:
- Age ≥65
- ≥3 risk factors for CAD
- Known CAD (stenosis ≥50%)
- ST-segment deviation on ECG
- Cardiac biomarker elevation (troponin, CK-MB)
- Aspirin use in prior 7 days
- Severe angina (≥2 episodes in 24h)
```

**Risk Stratification (NSTEMI)**:
```
Score 0: 4.7% 14-day mortality/MI
Score 1: 8.3%
Score 2: 13.2%
Score 3: 19.9%
Score 4: 26.2%
Score 5: 40.9%
Score 6-7: 56.4%
```

**TIMI Risk Score - STEMI**:
```
1 point each for:
- Age 60-75
- Age >75
- Female sex
- Diabetes/hypertension/angina
- SBP <100 mmHg
- HR >100 bpm
- Killip class II-IV
- Weight <67 kg (147 lbs)
- Anterior MI
- Time to reperfusion >4 hours
```

**EHR Implementation**:
- Calculate at ED arrival for suspected ACS
- Guide disposition (admission level, catheterization timing)
- Track outcomes against predicted risk
- Integrate with GRACE score comparison

**Database Table**:
```sql
CREATE TABLE timi_risk_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assessment_date TIMESTAMP NOT NULL,
  acs_type VARCHAR(50), -- STEMI, NSTEMI, UNSTABLE_ANGINA

  -- NSTEMI/UA Risk factors
  age_geq_65 BOOLEAN,
  three_plus_risk_factors BOOLEAN, -- CAD risk factors
  known_cad_greater_50_percent BOOLEAN,
  st_segment_deviation BOOLEAN,
  cardiac_biomarker_elevated BOOLEAN,
  aspirin_prior_7_days BOOLEAN,
  severe_angina_last_24h BOOLEAN,

  -- STEMI Risk factors (if applicable)
  age_60_to_75 BOOLEAN,
  age_greater_75 BOOLEAN,
  female_sex BOOLEAN,
  diabetes_or_hypertension BOOLEAN,
  systolic_bp_less_100 BOOLEAN,
  heart_rate_greater_100 BOOLEAN,
  killip_class INT,
  weight_lbs INT,
  anterior_mi BOOLEAN,
  time_to_reperfusion_hours INT,

  -- Calculated scores
  timi_nstemi_score INT, -- 0-7
  timi_stemi_score INT, -- 0-8

  -- Risk stratification
  mortality_risk_percent FLOAT,
  mortality_risk_14_day_percent FLOAT,

  -- Recommendations
  high_risk_features BOOLEAN,
  early_invasive_strategy_recommended BOOLEAN,

  CONSTRAINT timi_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### 6. Framingham Risk Score (CHD Risk)

**Clinical Purpose**: 10-year risk of coronary heart disease event. Similar to ASCVD but slightly different coefficients. Age 30-74.

**Variables**:
- Age
- Total cholesterol
- HDL cholesterol
- SBP
- Smoking status
- Diabetes

**Risk Categories**:
- <10%: Low risk
- 10-20%: Intermediate risk
- >20%: High risk

### 7. Wells Score (DVT/PE Risk)

**Clinical Purpose**: Assess probability of DVT or PE to guide diagnostic testing. Calculated when DVT/PE suspected.

**DVT Wells Score Components**:
```
2 points: Active cancer, Immobilization, Surgery <4 weeks ago
1 point: Calf swelling >3cm, Unilateral pitting edema, Unilateral superficial veins, Asymmetric pain
0 points: None of above
```

**Risk Stratification**:
```
Low probability: <2 points (3% DVT prevalence)
High probability: ≥2 points (17% DVT prevalence)
```

### 8. EuroSCORE II (Cardiac Surgery Risk)

**Clinical Purpose**: Predict mortality and morbidity risk for cardiac surgery. Range 0-100%.

**Variables**:
- Age, gender
- Creatinine level
- Ejection fraction
- NYHA class
- Prior cardiac surgery
- Endocarditis
- Critical preoperative state
- Diabetes requiring insulin
- Pulmonary disease
- Neurological dysfunction

**Risk Stratification**:
```
Low: <2% mortality
Intermediate: 2-10% mortality
High: >10% mortality
```

---

## Heart Failure Management Framework

### NYHA Functional Classification

**Stage C (Symptomatic HF)**:
- **NYHA Class I**: Symptoms only with exertion beyond ordinary
- **NYHA Class II**: Comfortable at rest, symptoms with ordinary activity
- **NYHA Class III**: Comfortable at rest, symptoms with minimal activity
- **NYHA Class IV**: Symptoms at rest, unable to perform any activity

### ACC/AHA Staging

**Stage A**: Risk factors present, no structural disease, no symptoms
**Stage B**: Structural disease present, no symptoms (asymptomatic LV dysfunction)
**Stage C**: Structural disease with symptoms (symptomatic HF)
**Stage D**: Advanced HF requiring specialized interventions (cardiogenic shock, recurrent hospitalizations)

### Ejection Fraction Classification

```
HFpEF (Heart Failure with preserved EF): LVEF ≥50%
HFmrEF (Mildly reduced EF): LVEF 40-49%
HFrEF (Reduced EF): LVEF <40%
```

### GDMT (Guideline-Directed Medical Therapy) Optimization

**2022 ACC/AHA/HFSA Guidelines - HFrEF Treatment Algorithm**:

**Initial Therapy (All 4 classes simultaneously at low doses)**:

1. **RAS Inhibition** (First-line):
   - **ARNI (Angiotensin Receptor-Neprilysin Inhibitor)** - PREFERRED for NYHA II-III
     - Sacubitril/Valsartan (Entresto): Start 24/26 mg BID, Target 97/103 mg BID
     - Outcomes: 20% reduction in mortality/HF hospitalization vs enalapril
   - OR **ACE Inhibitor**:
     - Enalapril: Start 2.5 mg BID, Target 10 mg BID
     - Lisinopril: Start 2.5 mg daily, Target 20-40 mg daily
   - OR **ARB**:
     - Valsartan: Start 20 mg BID, Target 80-160 mg BID
     - Losartan: Start 12.5 mg daily, Target 50-150 mg daily

2. **Beta-Blocker** (Proven mortality reduction):
   - **Carvedilol**: Start 3.125 mg BID, Target 25 mg BID
   - **Metoprolol succinate (extended-release)**: Start 12.5-25 mg daily, Target 190 mg daily
   - **Bisoprolol**: Start 1.25 mg daily, Target 10 mg daily
   - Note: Target-dose achievement associated with 34% mortality reduction

3. **Mineralocorticoid Receptor Antagonist (MRA)**:
   - **Spironolactone**: Start 12.5-25 mg daily, Target 25-50 mg daily
   - **Eplerenone**: Start 25 mg daily, Target 50 mg daily
   - Monitor potassium (target <5.5), creatinine

4. **SGLT2 Inhibitor** (Newest class, powerful):
   - **Dapagliflozin**: 10 mg daily (fixed dose)
     - 26% reduction in mortality/hospitalization
     - Works across EF spectrum (HFpEF + HFrEF benefit)
   - **Empagliflozin**: Start 10 mg daily
   - **Sacubitril/Dapagliflozin**: Combined agent under investigation
   - Contraindications: eGFR <20, recurrent DKA

**Titration Protocol**:
- Start all 4 classes at low doses simultaneously
- Uptitrate one class every 1-2 weeks as tolerated
- Acceptable to step-wise titration if tolerability issues
- Don't need to achieve target dose before adding next class
- Continue uptitration to target if tolerated

**Monitoring During GDMT Optimization**:
- Baseline (before initiation): BP, K+, Cr (eGFR), BNP/NT-proBNP
- Week 1-2: Assess symptoms, orthostatic hypotension
- Week 3-4: Labs (K+, Cr), continue titration
- Week 6-8: Full reassessment, repeat BNP
- Monthly until stable on target doses
- Then every 3 months

**Database Table**:
```sql
CREATE TABLE heart_failure_management (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  enrollment_date TIMESTAMP NOT NULL,

  -- HF characterization
  nyha_class INT, -- 1, 2, 3, 4
  acc_aha_stage VARCHAR(50), -- A, B, C, D
  lvef_percent INT,
  hf_type VARCHAR(50), -- HFrEF, HFmrEF, HFpEF
  hf_etiology VARCHAR(100), -- CAD, Hypertension, Idiopathic, Viral, Infiltrative, etc.

  -- GDMT Optimization tracking
  gdmt_goal_arni_acei_arb BOOLEAN,
  gdmt_goal_beta_blocker BOOLEAN,
  gdmt_goal_mra BOOLEAN,
  gdmt_goal_sglt2i BOOLEAN,

  -- All 4 class target achievement
  on_target_dose_arni_acei_arb BOOLEAN,
  on_target_dose_beta_blocker BOOLEAN,
  on_target_dose_mra BOOLEAN,
  on_target_dose_sglt2i BOOLEAN,

  all_four_classes_prescribed BOOLEAN,
  all_four_target_doses BOOLEAN,

  -- Additional therapies
  ivabradine_prescribed BOOLEAN, -- HR >70 if beta-blocker limited
  hydralazine_nitrate_prescribed BOOLEAN, -- African Americans, EF <35

  -- Device therapy candidacy
  crt_candidate BOOLEAN, -- QRS >120ms, NYHA II-IV
  icd_candidate BOOLEAN, -- EF <35%, NYHA II-III
  device_implanted BOOLEAN,
  device_id UUID,

  -- Decompensation tracking
  hospitalizations_last_12m INT,
  ed_visits_last_12m INT,

  -- Lab trends
  baseline_bnp_ng_ml INT,
  baseline_creatinine FLOAT,
  baseline_potassium FLOAT,

  latest_bnp_ng_ml INT,
  latest_assessment_date DATE,
  latest_nyha_class INT,

  -- Clinician
  managing_cardiologist UUID,

  CONSTRAINT hf_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (managing_cardiologist) REFERENCES practitioners(id),
  FOREIGN KEY (device_id) REFERENCES cardiac_device_implants(id)
);

CREATE TABLE gdmt_medication_log (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  hf_management_id UUID NOT NULL REFERENCES heart_failure_management(id),

  medication_class VARCHAR(50), -- ARNI/ACE/ARB, Beta-Blocker, MRA, SGLT2i
  medication_name VARCHAR(100),
  medication_code VARCHAR(50), -- RxNorm code

  initiation_date DATE,
  current_dose VARCHAR(50), -- e.g., "25 mg BID"
  target_dose VARCHAR(50),
  dose_unit VARCHAR(50), -- mg, mcg, etc.

  -- Tolerability
  tolerated BOOLEAN,
  side_effect_if_intolerant VARCHAR(255),

  -- Status
  active BOOLEAN,
  discontinuation_date DATE,
  discontinuation_reason VARCHAR(255),

  -- Adherence assessment
  adherence_percent INT, -- Last month

  CONSTRAINT gdmt_log_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Fluid Status Monitoring

**Congestion Assessment**:
- Daily weights (target: <2-3 lbs gain in 1-2 days warrants evaluation)
- Peripheral edema grade (0-4+ scale)
- Orthopnea (sleeping upright, number of pillows)
- Paroxysmal nocturnal dyspnea (PND) frequency
- Jugular venous pressure (JVP) assessment
- Rales on lung exam

**Diuretic Management**:
- Loop diuretics (furosemide, torsemide, bumetanide) for congestion
- Titrate to euvolemia, not over-diurese (worsens renal function, hypotension)
- Daily intake/output (I&O) monitoring
- Sodium restriction (<2g/day)

**Database Table**:
```sql
CREATE TABLE fluid_status_monitoring (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  assessment_date DATE,

  daily_weight_lbs FLOAT,
  weight_change_from_baseline_lbs FLOAT,

  -- Congestion signs
  peripheral_edema_grade INT, -- 0-4+
  orthopnea_present BOOLEAN,
  pnd_episodes_per_week INT,

  dyspnea_on_exertion_grade INT, -- NYHA-based: 1-4

  -- Exam findings
  jvp_elevation BOOLEAN,
  jvp_cm_above_sternal_angle INT,
  hepatomegaly_present BOOLEAN,
  ascites_present BOOLEAN,
  lung_rales_present BOOLEAN,

  -- Diuretic management
  loop_diuretic_dose_mg FLOAT,
  frequency_daily_times INT,
  recent_dose_adjustment BOOLEAN,

  -- Assessment
  volume_status VARCHAR(50), -- Euvolemic, Congested, Overdiuresed
  clinical_action_needed VARCHAR(255),

  CONSTRAINT fluid_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

---

## Arrhythmia Management Workflows

### Atrial Fibrillation Workflow

**AFib Classification**:
- **Paroxysmal**: Episodes <7 days, self-terminating
- **Persistent**: Lasts >7 days, requires intervention to restore SR
- **Long-standing persistent**: >1 year duration
- **Permanent**: Accepted, no further attempts at SR restoration

**Rate vs Rhythm Control Strategy**:
- **Rhythm Control**: Antiarrhythmic drugs, catheter ablation, cardioversion
  - Preferred for: Symptomatic, exercise-limited, first AFib episode, structural heart disease
  - Drugs: Amiodarone, flecainide, sotalol, dofetilide
- **Rate Control**: Beta-blockers, calcium channel blockers, digoxin (as needed)
  - Resting HR goal: 60-100 bpm; exercise HR goal: 60-100 bpm at moderate exercise

**Anticoagulation Decision**:
- CHA2DS2-VASc score ≥2 (males) or ≥3 (females) → OAC mandatory
- HAS-BLED ≥3 → High bleeding risk, but anticoagulation still indicated with risk mitigation
- DOAC preferred over warfarin for most (no monitoring required, faster onset)

**Ablation Indications**:
- Symptomatic AFib despite rate/rhythm control
- AFib-induced cardiomyopathy (EF improvement expected with ablation)
- First-diagnosed AFib (increasingly offered as first-line)
- Paroxysmal AFib refractory to drugs

**Database Table**:
```sql
CREATE TABLE atrial_fibrillation_management (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  afib_diagnosis_date DATE,

  -- Classification
  afib_type VARCHAR(50), -- Paroxysmal, Persistent, Long-standing, Permanent
  episode_frequency VARCHAR(100),

  -- Symptom assessment
  symptomatic BOOLEAN,
  symptoms VARCHAR(MAX), -- Palpitations, SOB, chest pain, syncope, fatigue
  symptom_severity INT, -- 1-10 scale

  -- Stroke risk assessment (CHA2DS2-VASc)
  cha2ds2vasc_score INT,
  anticoagulation_recommended BOOLEAN,
  anticoagulation_type VARCHAR(50), -- DOAC, Warfarin
  anticoagulation_start_date DATE,

  -- Bleeding risk (HAS-BLED)
  hasbled_score INT,

  -- Rate/Rhythm control strategy
  management_strategy VARCHAR(50), -- RateControl, RhythmControl, Mixed

  -- Rate control medications
  resting_hr_goal_bpm INT,
  exercise_hr_goal_bpm INT,
  current_rate_control_drugs VARCHAR(MAX),

  -- Rhythm control
  on_antiarrhythmic BOOLEAN,
  antiarrhythmic_drug VARCHAR(100),
  antiarrhythmic_dose VARCHAR(50),

  -- Ablation
  ablation_candidate BOOLEAN,
  ablation_indicated BOOLEAN,
  ablation_procedure_id UUID,

  -- Monitoring
  ecg_monitoring_type VARCHAR(50), -- Holter, Event monitor, Wearable
  af_burden_percent FLOAT, -- % time in AFib on monitor

  CONSTRAINT afib_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Ventricular Arrhythmia Workflow

**VT/VF Risk Stratification**:
- Post-MI with EF <35% → ICD for primary prevention
- Prior VT/VF episode → ICD for secondary prevention
- Syncope of unknown origin with inducible VT on EP study → ICD

**ICD/CRT Indications**:
- **ICD**: LVEF <35%, NYHA II-III, despite optimal GDMT, life expectancy >1 year
- **CRT**: LVEF <35%, NYHA II-IV, QRS ≥120 ms (especially LBBB)
- **CRT-D**: CRT + ICD combined for EF <35%

---

## Cardiac Device Monitoring

### Device Types & Registry

**Pacemakers (PM)**:
- Single-chamber pacing (atrium or ventricle only)
- Dual-chamber pacing (atrium + ventricle)
- Rate-response pacing (adjusts rate to activity)
- Indications: Bradycardia, AV block, syncope from conduction abnormality

**Implantable Cardioverter-Defibrillators (ICD)**:
- Single-chamber ICD (ventricular defibrillation only)
- Dual-chamber ICD (atrial + ventricular sensing, VT discrimination)
- Indications: Primary prevention (EF <35%), secondary prevention (prior VT/VF)

**Cardiac Resynchronization Therapy (CRT/CRT-D)**:
- Three leads: Right atrial, right ventricular, left ventricular (coronary sinus placement)
- Biventricular pacing for QRS >120 ms
- Improves LV synchrony, EF improvement 5-10%
- Indications: HFrEF + wide QRS

**Remote Monitoring (RM)**:
- Devices transmit wirelessly to home transmitter
- Data sent to physician portal daily
- Detects arrhythmias, lead problems, battery status
- FDA-approved devices: Medtronic Carelink, Boston Scientific Latitude, Abbott/St. Jude Merlin, Biotronik Home Monitoring

**Database Table**:
```sql
CREATE TABLE cardiac_device_registry (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,

  -- Device classification
  device_type VARCHAR(50), -- Pacemaker, ICD, CRT, CRT-D
  device_class VARCHAR(50), -- Single-chamber, Dual-chamber, Biventricular

  -- Device identification
  manufacturer VARCHAR(100), -- Medtronic, Boston Scientific, Abbott, Biotronik
  device_name VARCHAR(100),
  model_number VARCHAR(50),
  serial_number VARCHAR(100),

  -- Implantation details
  implant_facility VARCHAR(100),
  implant_date DATE,
  implanting_physician UUID REFERENCES practitioners(id),
  operative_notes_ref VARCHAR(500),

  -- Lead information (multiple leads possible)
  leads JSON, -- [{lead_position: 'RA', lead_type: 'active_fix', lead_model: '...', impedance_ohms: ...}, ...]

  -- Programming parameters
  pacing_mode VARCHAR(50), -- VVI, DDD, AAI, CRT modes (BiV, CRT-P, CRT-D)
  lower_rate_limit_bpm INT,
  upper_rate_limit_bpm INT,
  av_delay_ms INT, -- AV interval
  pacing_threshold_volts FLOAT,

  -- Current status
  battery_voltage_volts FLOAT,
  battery_status VARCHAR(50), -- Elective replacement indicator (ERI) approaching?
  battery_longevity_months INT, -- Months until ERI

  -- Remote monitoring
  remote_monitoring_enabled BOOLEAN,
  remote_monitoring_platform VARCHAR(100), -- Carelink, Latitude, Merlin, Home Monitoring
  last_remote_transmission TIMESTAMP,

  -- Alert tracking
  recent_alerts JSON, -- [{date, alert_type, alert_description}, ...]
  lead_integrity_status VARCHAR(50), -- Normal, Concern, Alert
  arrhythmia_episodes INT, -- Count in last 30 days

  -- Upcoming maintenance
  eog_expected_date DATE, -- End of life expected
  replacement_scheduled_date DATE,

  -- Clinical outcomes
  pacing_percentage INT, -- % of time device pacing
  device_benefit_documented BOOLEAN,

  CONSTRAINT device_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (implanting_physician) REFERENCES practitioners(id)
);

CREATE TABLE device_interrogation_reports (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES cardiac_device_registry(id),

  interrogation_date TIMESTAMP NOT NULL,
  interrogation_type VARCHAR(50), -- In-office, Remote

  -- Arrhythmia detection
  atrial_arrhythmia_episodes INT,
  ventricular_arrhythmia_episodes INT,
  inappropriate_shocks INT,
  appropriate_shocks INT,
  atp_therapies_delivered INT, -- Antitachycardia pacing

  -- Lead data
  lead_impedances JSON, -- {lead_position: impedance_ohms}
  pacing_thresholds JSON,
  sensing_amplitudes JSON,

  -- Battery/device status
  battery_voltage_volts FLOAT,
  battery_impedance_ohms INT,
  device_longevity_months INT,

  -- Rhythm/pacing status
  percent_atrial_paced INT,
  percent_ventricular_paced INT,
  heart_rate_averages JSON, -- {daily_max, daily_min, daily_average}

  -- Alerts/advisories
  advisories JSON, -- [{advisory_type, description}]
  safety_alerts_present BOOLEAN,

  -- Clinician review
  reviewed_by UUID,
  reviewed_date TIMESTAMP,
  clinical_action_needed VARCHAR(MAX),

  CONSTRAINT interrogation_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (reviewed_by) REFERENCES practitioners(id)
);
```

### IHE IDCO Integration for Remote Monitoring

**IHE Implantable Device Cardiac Observation (IDCO) Profile**:
- Standard-based transfer of device interrogation data to EHR
- HL7/XML communication protocol
- Automated data import from remote monitoring platforms
- Reduces manual data entry, improves safety (real-time alerts)

**Integration Architecture**:
```
Device Manufacturer Portal (e.g., Carelink)
  ↓ HL7/XML Export via IHE IDCO
Remote Monitoring Service Center
  ↓ API/Webhook
EHRConnect Backend (Integration Handler)
  ↓ Parse and validate
Cardiac Device Registry
  ↓ Store + Alert if needed
Clinician Portal (Display interrogation data)
  ↓ Clinical action
Chart documentation
```

---

## Database Schema Requirements

### Core Cardiology Tables

**1. Cardiology Consultations**
```sql
CREATE TABLE cardiology_consultations (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID REFERENCES encounters(id),

  chief_complaint VARCHAR(255),
  symptom_onset_date DATE,
  symptom_severity INT, -- 1-10 scale

  relevant_history TEXT,
  cardiovascular_risk_factors JSON, -- {hypertension, diabetes, smoking, family_history_cad, etc.}
  prior_cardiac_events JSON, -- {mi_date, stroke_date, afib_diagnosis_date}

  physical_exam JSON, -- {bp, hr, rr, heart_sounds, murmurs, edema, jvp}

  initial_assessment_findings TEXT,
  diagnostic_plan TEXT,

  CONSTRAINT cardio_consult_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

**2. Cardiac Diagnoses**
```sql
CREATE TABLE cardiac_diagnoses (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,

  diagnosis_icd10 VARCHAR(20), -- I10, I50, I20, I48, I63, etc.
  diagnosis_name VARCHAR(255),
  diagnosis_date DATE,
  onset_date DATE,

  -- Severity staging (disease-specific)
  severity_stage VARCHAR(50), -- NYHA, CCS, ACC/AHA HF stage, etc.

  -- Status
  active BOOLEAN DEFAULT TRUE,
  resolved_date DATE,

  -- Clinician documentation
  documented_by UUID REFERENCES practitioners(id),

  CONSTRAINT cardio_dx_org_isolation UNIQUE (org_id, id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

**3-6. Diagnostic Studies** (ECG, Echo, Stress, Cath - already defined above)

**7. Risk Calculator Results** (ASCVD, CHA2DS2-VASc, HAS-BLED, GRACE, TIMI - already defined above)

**8. Heart Failure Management** (already defined above)

**9. Device Registry & Interrogation** (already defined above)

**10-15. Additional specialized tables**:
- `cardiac_procedures` (ablations, device implants, cardioversions)
- `anticoagulation_management` (AFib, mechanical valves, thromboembolism)
- `medication_reconciliation_cardio` (GDMT tracking, DAPT duration)
- `arrhythmia_episodes` (detected AFib/VT events, symptom correlation)
- `symptom_assessment_cardio` (dyspnea, chest pain, palpitations tracking)
- `cardiology_lab_results` (troponin trending, BNP, potassium, renal function)

---

## Clinical Decision Support Rules

### Rule 1: Acute Chest Pain Risk Stratification

**Trigger**: Chest pain chief complaint documented

**Conditions**:
```json
{
  "and": [
    {"field": "chief_complaint", "operator": "contains", "value": "chest"},
    {"field": "symptom_onset", "operator": "is_recent", "minutes": 120}
  ]
}
```

**Actions**:
- Auto-calculate GRACE score from vitals + troponin
- Auto-calculate TIMI score
- Generate alert: "High-risk ACS features detected - consider urgent cardiology evaluation"
- Order stat troponin if not already ordered
- Recommend 12-lead ECG
- Suggest early catheterization if GRACE >140

**Supporting Evidence**: 2014 AHA/ACC Chest Pain Guidelines

### Rule 2: AFib → Stroke Risk & Anticoagulation

**Trigger**: AFib diagnosis documented without prior OAC

**Conditions**:
```json
{
  "and": [
    {"field": "diagnosis_icd10", "operator": "in", "value": ["I48.91", "I48.92", "I48.93"]},
    {"field": "anticoagulation_active", "operator": "is", "value": false}
  ]
}
```

**Actions**:
- Auto-calculate CHA2DS2-VASc score
- Alert if CHA2DS2-VASc ≥2 males or ≥3 females: "Anticoagulation indicated"
- Calculate HAS-BLED score
- Recommend DOAC (apixaban preferred for EF <35%)
- Set follow-up reminder: "Reassess AFib control strategy in 3 months"

**Supporting Evidence**: 2019 AHA/ACC/HRS Focused Update on AFib

### Rule 3: HFrEF → GDMT Optimization

**Trigger**: HFrEF diagnosis (LVEF <40%) documented

**Conditions**:
```json
{
  "and": [
    {"field": "diagnosis_icd10", "operator": "in", "value": ["I50.1"]},
    {"field": "lvef_percent", "operator": "<", "value": 40},
    {"field": "on_all_four_gdmt_classes", "operator": "is", "value": false}
  ]
}
```

**Actions**:
- Alert: "HFrEF confirmed - GDMT optimization recommended"
- Display GDMT checklist: "Initiate ARNI (or ACE/ARB), Beta-blocker, MRA, SGLT2i at low doses"
- Create medications for each class if not present
- Generate 4-week follow-up reminder for labs (K+, Cr)
- Set target vitals: "SBP >90 mmHg required for GDMT tolerability"
- Recommend echocardiogram in 3 months to assess EF response

**Supporting Evidence**: 2022 AHA/ACC/HFSA HF Guidelines

### Rule 4: High ASCVD Risk → Statin Initiation

**Trigger**: ASCVD risk calculation >7.5% annual risk

**Conditions**:
```json
{
  "and": [
    {"field": "ascvd_risk_percent", "operator": ">", "value": 7.5},
    {"field": "on_statin", "operator": "is", "value": false},
    {"field": "age", "operator": ">=", "value": 40},
    {"field": "age", "operator": "<", "value": 75}
  ]
}
```

**Actions**:
- Alert: "High ASCVD risk (10-year risk: X%) - statin therapy recommended"
- Recommend: "High-intensity statin: Atorvastatin 40-80 mg or Rosuvastatin 20-40 mg daily"
- Display LDL goal: "Target LDL <70 mg/dL for high-risk patients"
- Add to medication list
- Schedule lipid panel 4-6 weeks to assess LDL response
- Alert if LDL goal not achieved: "Consider PCSK9 inhibitor or ezetimibe"

**Supporting Evidence**: 2013 ACC/AHA ASCVD Risk Guidelines, 2018 Prevention Guideline Update

### Rule 5: Wide QRS + Low EF → CRT Candidacy

**Trigger**: ECG with QRS ≥120 ms AND LVEF <35% on recent echo

**Conditions**:
```json
{
  "and": [
    {"field": "qrs_duration_ms", "operator": ">=", "value": 120},
    {"field": "lvef_percent", "operator": "<", "value": 35},
    {"field": "nyha_class", "operator": ">=", "value": 2},
    {"field": "crt_implanted", "operator": "is", "value": false}
  ]
}
```

**Actions**:
- Alert: "CRT candidacy criteria met (QRS ≥120 ms, LVEF <35%, NYHA ≥II)"
- Recommend: "Refer for CRT device evaluation"
- Create referral to device clinic
- Note QRS duration for EF improvement tracking (expect 5-10% improvement)
- Schedule 3-month post-implant echo to document EF response

**Supporting Evidence**: 2016 ACC/AHA Device-Based Therapy Guidelines

### Rule 6: Myocardial Infarction → Secondary Prevention Bundle

**Trigger**: MI diagnosis (STEMI or NSTEMI) within past 30 days

**Conditions**:
```json
{
  "and": [
    {"field": "diagnosis_icd10", "operator": "in", "value": ["I21.01", "I21.02", "I21.11", "I21.21"]},
    {"field": "diagnosis_date", "operator": "days_ago", "value": "<=30"}
  ]
}
```

**Actions**:
- Alert: "Acute MI - post-MI secondary prevention bundle recommended"
- Medication checklist:
  - Dual antiplatelet therapy (Aspirin + P2Y12i): Duration per stent type (BMS 1mo, DES 6-12mo)
  - Beta-blocker (e.g., Metoprolol 25 mg BID)
  - ACE-I/ARB (e.g., Lisinopril 10 mg daily)
  - Statin (high-intensity)
- Order labs: Lipid panel, BNP, troponin serial
- Recommend: "Cardiac rehabilitation referral"
- Create follow-up: "Cardiology reassessment in 2-4 weeks"
- Set reminder: "Assess LV function at 3-6 weeks if not already done"

**Supporting Evidence**: 2015 ACC/AHA STEMI Guidelines

### Rule 7: Syncope + Negative Workup → Arrhythmia Evaluation

**Trigger**: Syncope chief complaint + normal initial cardiac workup

**Conditions**:
```json
{
  "and": [
    {"field": "chief_complaint", "operator": "contains", "value": "syncope"},
    {"field": "ecg_normal", "operator": "is", "value": true},
    {"field": "echo_normal", "operator": "is", "value": true},
    {"field": "ep_study_ordered", "operator": "is", "value": false}
  ]
}
```

**Actions**:
- Alert: "Syncope with normal initial workup - consider arrhythmia etiology"
- Recommendation: "Consider event monitor (30-day loop recorder, Holter) to detect paroxysmal arrhythmia"
- If recurrent syncope: "Electrophysiology study recommended for arrhythmia induction"
- Create referral to EP clinic if indicated
- Document syncope risk stratification (Framingham, OESIL criteria)

**Supporting Evidence**: 2017 ACC/AHA/HRS Syncope Guidelines

### Rule 8: Device Battery Near EOL → Replacement Scheduling

**Trigger**: Device battery status shows elective replacement indicator (ERI) or <3 months longevity

**Conditions**:
```json
{
  "and": [
    {"field": "device_battery_status", "operator": "in", "value": ["ERI", "EOL_approaching"]},
    {"field": "replacement_scheduled", "operator": "is", "value": false}
  ]
}
```

**Actions**:
- Alert: "Pacemaker/ICD battery nearing elective replacement indicator (ERI)"
- Recommend: "Schedule device replacement procedure within 4-6 weeks"
- Create appointment reminder for patient
- Document in chart: "Battery expected to reach ERI [DATE]"
- Set post-replacement follow-up: "Device interrogation 1-2 weeks post-procedure"

**Supporting Evidence**: HRS/ACC Device Guidelines

---

## Implementation Recommendations

### Database Implementation Strategy

**Phase 1: Core Tables** (Weeks 1-4)
- `cardiology_consultations`
- `cardiac_diagnoses`
- `ecg_studies`
- `echocardiogram_studies`
- `cardiac_device_registry`

**Phase 2: Risk Calculators** (Weeks 5-8)
- `ascvd_risk_assessments`
- `cha2ds2vasc_assessments`
- `hasbled_assessments`
- `grace_score_assessments`
- `timi_risk_assessments`

**Phase 3: Management Tracking** (Weeks 9-12)
- `heart_failure_management`
- `gdmt_medication_log`
- `atrial_fibrillation_management`
- `anticoagulation_management`
- `cardiac_procedures`

**Phase 4: Monitoring & Integration** (Weeks 13-16)
- `device_interrogation_reports`
- `medication_adherence`
- `fluid_status_monitoring`
- `symptom_assessment_cardio`

### Risk Calculator Implementation

**JSON Logic Execution Model**:
```javascript
// ASCVD Risk Calculator
{
  "if": [
    { ">=": [{ "var": "age" }, 40] },
    { "<": [{ "var": "age" }, 75] },
    { "!": { "var": "known_ascvd" } }
  ],
  "then": {
    "calculateASCVD": {
      "pooledCohortEquation": {
        "male": {
          "coefficients": {...},
          "riskPercent": "{{pce_result}}"
        }
      }
    }
  }
}
```

**Backend Calculation Service**:
```javascript
// services/risk-calculator.service.js
async calculateASCVD(patientData) {
  const { age, sex, race, totalChol, hdl, sbp, onBPMed, diabetes, smoking } = patientData;

  // Pooled Cohort Equations calculation
  const logRisk = this.applyPCECoefficients(sex, race, {
    age, totalChol, hdl, sbp, onBPMed, diabetes, smoking
  });

  const riskPercent = (1 - Math.exp(-logRisk)) * 100;

  // Store in database
  await CardioAssessment.create({
    patient_id, ascvd_risk_percent: riskPercent, risk_category: this.categorizeRisk(riskPercent)
  });

  return { riskPercent, category: ... };
}
```

### Clinical Decision Support Rule Engine

**Rule Execution Flow**:
```
1. Event triggered (e.g., chest pain documented)
2. Rule engine queries applicable rules
3. For each rule, evaluate conditions (JSON Logic)
4. If conditions met, execute actions:
   - Create alerts/notifications
   - Auto-order labs/tests
   - Create follow-up tasks
   - Generate clinical recommendations
5. Log rule execution to audit trail
```

**Rule Definition Example** (stored as JSON):
```json
{
  "rule_id": "acute-chest-pain-risk-stratification",
  "rule_name": "Chest Pain Risk Stratification",
  "trigger": "encounter_created",
  "trigger_filter": { "chief_complaint": {"contains": "chest"} },
  "conditions": {
    "and": [
      {"vitals.systolic_bp": {"<": 180}},
      {"vitals.heart_rate": {">": 50}}
    ]
  },
  "actions": [
    {
      "action_type": "calculate_risk_score",
      "score_type": "GRACE",
      "store_result": true
    },
    {
      "action_type": "create_alert",
      "alert_level": "high",
      "message": "Chest pain with concerning features - urgent cardiology evaluation"
    },
    {
      "action_type": "order_lab",
      "lab_code": "troponin_high_sensitivity",
      "stat": true
    },
    {
      "action_type": "order_imaging",
      "imaging_type": "ECG",
      "stat": true
    }
  ],
  "evidence": {
    "guideline": "2014 AHA/ACC Unstable Angina/NSTEMI Guidelines",
    "citation_url": "https://..."
  }
}
```

### Frontend Components for Cardiology Pack

**Cardiology Dashboard**:
- Risk factor summary (AFib, HF, CAD, PAD)
- ASCVD risk percentage with guideline recommendations
- Device status panel (for implanted devices)
- Recent diagnostic results (ECG, echo trending)
- GDMT optimization checklist
- Upcoming appointments and follow-ups

**Forms & Templates**:
- **Cardiology Consultation Form**: Chief complaint, risk factors, physical exam
- **Echocardiogram Report Template**: Automated calculation of EF category, wall motion scoring
- **GDMT Optimization Tracker**: Multi-step form showing baseline, current dose, target dose for each medication class
- **Device Interrogation Summary**: Automated display of remote monitoring data from IDCO integration

### Integration Points

**1. ECG Machine Integration**:
- DICOM standard file transfer
- Auto-parsing of ECG measurements (HR, PR, QRS, QT, axis)
- Automated interpretation alerts (STEMI, arrhythmia)

**2. PACS/Echo Integration**:
- DICOM SR (Structured Report) import from ultrasound machines
- Structured echo data extraction (LVEF, valve grades, pressures)
- Links to cine videos in PACS

**3. Lab Integration**:
- Troponin, BNP, lipid panel auto-results
- Stat alert for critical values (troponin >normal range, critical potassium)
- Trending graphs

**4. Remote Device Monitoring Integration**:
- IHE IDCO profile implementation
- Daily HL7/XML import from manufacturer portals
- Automated alert on arrhythmia detected, lead problem, battery issue

**5. Medication Management**:
- RxNorm medication codes
- Interaction checking (esp. with anticoagulants)
- Dosing calculator for weight-based drugs

---

## References

### Official Guidelines & Standards

1. **2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure**
   - URL: https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063
   - Key: GDMT optimization, NYHA classification, HF staging, device candidacy

2. **2024 ACC Expert Consensus Decision Pathway for HFrEF**
   - URL: https://www.jacc.org/doi/10.1016/j.jacc.2023.12.024
   - Key: Medication titration sequencing, target doses, monitoring

3. **2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk**
   - URL: https://tools.acc.org/ascvd-risk-estimator-plus/
   - Key: ASCVD risk calculator, pooled cohort equations

4. **2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Prevention Guideline**
   - URL: https://www.ahajournals.org/doi/10.1161/CIR.0000000000000638
   - Key: Risk assessment, statin therapy, lipid targets

5. **2019 AHA/ACC/HRS Focused Update of the 2014 AHA/ACC/HRS Guideline for AFib**
   - Key: Stroke risk (CHA2DS2-VASc), anticoagulation, rate/rhythm control

6. **2016 ACC/AHA/HRS Focused Update of the 2014 Guidelines for the Management of Patients with Atrial Fibrillation**
   - Key: AFib classification, anticoagulation decisions, ablation indications

7. **2017 ACC/AHA/HRS Focused Update of the 2015 ACC/AHA/HRS Focused Update on Syncope**
   - Key: Syncope risk stratification, arrhythmia workup

8. **IHE Implantable Device Cardiac Observation (IDCO) Profile**
   - Key: Device data integration standard, HL7/XML protocol

### Clinical References

- [ASCVD Risk Estimator+ by ACC](https://tools.acc.org/ascvd-risk-estimator-plus/)
- [CHA2DS2-VASc Score Calculator](https://www.chadsvasc.org/)
- [MDCalc Cardiology Calculators](https://www.mdcalc.com/calc/3398/ascvd-atherosclerotic-cardiovascular-disease-2013-risk-calculator-aha-acc)
- [ARUP Consult Risk Calculator Reference](https://arupconsult.com/reference/ahaacc-ascvd-risk-calculator)

### Market Research & EHR Trends

- **Merge Cardio** (Best KLAS 2024 - Score 82.8/100) - Epic-based cardiology module
- **NextGen Healthcare** - 400+ cardiology enhancements with AUC automation
- **OMS EHR** - Integrated device monitoring, wearable integration
- **Cardiology EHR Market Projection**: $3.36B (2025) → $5.44B (2035), CAGR 4.95%
- Key drivers: AI diagnostics, remote monitoring expansion, guideline-driven CDS

### Remote Device Monitoring Solutions

- [PaceMate](https://pacemate.com/) - Research-grade cardiac device data aggregation
- [BIOTRONIK Home Monitoring](https://www.biotronik.com/en-int/products/cardiac-rhythm-management/remote-patient-monitoring-systems/biotronik-home-monitoring)
- [Vector Remote Monitoring Platform](https://vectorremote.com/solutions/the-vector-platform/)
- [Octagos Advanced Cardiac Monitoring](https://www.octagos.com/)
- [Cardiac RMS Remote Monitoring Solutions](https://cardiacrms.com/)

---

## Unresolved Questions

1. **STEMI Cath Lab Activation**: What integration is needed with physical cath lab systems for automated STEMI alerts?

2. **AI ECG Interpretation**: Should EHRConnect integrate with AI-powered ECG interpretation (e.g., FDA-cleared algorithms), and what's the liability model?

3. **Wearable Device Integration**: How should wearable cardiac monitors (Apple Watch, AliveCor, Holter transmitters) be integrated for real-time AFib/arrhythmia detection?

4. **Imaging Workflow**: Should EHRConnect embed DICOM viewing capability or rely on external PACS integration?

5. **Clinical Trial Enrollment**: What mechanism for identifying cardiology patients eligible for clinical trials (based on disease phenotype, EF, risk score)?

6. **Patient Self-Monitoring**: Should patients with HF have direct home BP/weight monitoring data integration with automated congestion alerts?

7. **Medication Adherence Tracking**: How to track real-world GDMT adherence beyond patient report (pharmacy data, pharmacy refill integration)?

8. **Valve Management Complexity**: Does EHRConnect need dedicated modules for structural heart disease (valve disease, TAVI candidacy assessment, mitral clip evaluation)?

9. **Multi-Center Registry Reporting**: Should EHRConnect support automated reporting to national cardiology registries (NCDR, ACC registries)?

10. **Cardiomyopathy Phenotyping**: How to systematically capture and classify cardiomyopathy phenotypes (HFrEF, HFmrEF, HFpEF, infiltrative, restrictive, ischemic vs non-ischemic)?

---

**Report Generated**: December 21, 2025
**Report Status**: Complete & Ready for Implementation Planning
**Next Phase**: Database schema design, risk calculator backend service development, clinical decision support rule engine implementation

