# Research Report: Mental Health & Psychiatry EHR Specialty Workflows & Clinical Assessment Tools

**Date**: 2025-12-21
**Version**: 1.0.0
**Status**: Complete
**Token Optimization**: Comprehensive research synthesized for minimal token overhead

---

## Executive Summary

Mental health/psychiatry EHR implementation requires integration of standardized assessment tools (PHQ-9, GAD-7, PCL-5, C-SSRS), structured clinical workflows, and safety-critical features. Key findings:

1. **Assessment Scales**: PHQ-9 (depression), GAD-7 (anxiety), PCL-5 (PTSD), MDQ (bipolar), C-SSRS (suicide risk) are well-validated, publicly available, with established scoring algorithms
2. **FHIR Integration**: FHIR Questionnaire resources support structured data capture; PACIO Cognitive Status IG provides mental functioning observation patterns
3. **Clinical Workflows**: Intake → DSM-5 diagnosis → treatment planning → medication management → outcome monitoring with measurement-based care
4. **Safety Critical**: Suicide risk assessment requires risk stratification (low/moderate/high) with automated safety planning workflows
5. **EHR Standards**: DSM-5-TR compliance, ICD-10 mapping, Electronic Prescribing of Controlled Substances (EPCS) support essential

---

## Research Methodology

**Sources Consulted**: 20+ authoritative sources
**Date Range**: 2021-2025 (current standards with historical context)
**Key Search Terms**:
- Mental health assessment scales (PHQ-9, GAD-7, PCL-5, MDQ, C-SSRS)
- Psychiatric intake workflows, DSM-5 diagnosis
- Mental status examination templates
- Suicide risk assessment, safety planning
- EHR specialty features, clinical decision support

---

## Key Findings

### 1. Standard Mental Health Assessment Tools

#### **PHQ-9 (Patient Health Questionnaire-9) - Depression Screening**

**Specifications**:
- **Questions**: 9-item depression severity scale
- **Domains**: Depressed mood, anhedonia, sleep disturbance, fatigue, appetite changes, guilt/worthlessness, concentration difficulty, psychomotor changes, suicidal ideation
- **Administration**: Self-report, 2-5 minutes
- **Frequency**: Baseline, every 2-4 weeks during treatment, discharge
- **Public Domain**: Yes (available in >80 translations)

**Scoring**:
```
Total Score = Sum of 9 items (0-3 each)
Range: 0-27

Interpretation:
- 0-4: None/minimal depression
- 5-9: Mild depression
- 10-14: Moderate depression
- 15-19: Moderately severe depression
- 20-27: Severe depression

Validation: Cronbach alpha 0.86, reliable screening instrument
Clinical Threshold: Score ≥10 suggests depressive episode
```

**EHR Integration**:
- Auto-calculation of total score
- Risk stratification triggers
- Follow-up reminders at 2-4 week intervals
- Trending/graphing for longitudinal monitoring
- Export as scored PDF for clinical chart

---

#### **GAD-7 (Generalized Anxiety Disorder-7) - Anxiety Screening**

**Specifications**:
- **Questions**: 7-item anxiety severity scale
- **Domains**: Nervousness, uncontrollable worry, trouble relaxing, restlessness, irritability, fear, apprehension
- **Administration**: Self-report, 2 minutes
- **Frequency**: Baseline, every 2-4 weeks during treatment, discharge
- **Comorbidity**: Present in 50-60% of depression cases

**Scoring**:
```
Total Score = Sum of 7 items (0-3 each)
Range: 0-21

Interpretation:
- 0-4: None/minimal anxiety
- 5-9: Mild anxiety
- 10-14: Moderate anxiety
- 15-21: Severe anxiety

Validation: Cronbach alpha 0.91, highly reliable
Clinical Threshold: Score ≥10 suggests anxiety disorder
```

**EHR Integration**:
- Comorbidity detection (PHQ-9 + GAD-7 combination)
- Automated alerts for anxiety-depression comorbidity
- Treatment pathway routing based on combined scores
- Medication adjustment triggers

---

#### **PCL-5 (PTSD Checklist for DSM-5) - PTSD Screening**

**Specifications**:
- **Questions**: 20-item PTSD severity scale
- **Domains**: Re-experiencing, avoidance, negative mood/cognition, arousal/reactivity
- **Administration**: Self-report, 5-10 minutes
- **Frequency**: Baseline, midpoint of treatment, discharge (trauma cases)
- **Clinical Context**: Use after trauma disclosure or when trauma symptoms emerge

**Scoring**:
```
Total Score = Sum of 20 items (0-4 each)
Range: 0-80

Interpretation:
- 0-10: None/minimal PTSD
- 11-20: Mild PTSD
- 21-33: Moderate PTSD
- 34-46: Severe PTSD
- 47-80: Very severe PTSD

Clinical Threshold: Score ≥33 suggests PTSD diagnosis
DSM-5 Criteria: Must have ≥1 re-experiencing, ≥1 avoidance, ≥2 negative mood, ≥2 arousal symptoms + functional impairment
```

**EHR Integration**:
- Conditional display (only for trauma-exposed patients)
- Trauma history assessment triggers
- Evidence-based treatment pathway recommendations
- Symptom domain breakdown for clinical insight

---

#### **MDQ (Mood Disorder Questionnaire) - Bipolar Screening**

**Specifications**:
- **Questions**: 13-item bipolar spectrum screening
- **Domains**: Elevated/expansive mood, increased activity/energy, talkativeness, racing thoughts, distractibility, goal-directed activity, risky behavior
- **Administration**: Self-report, 2-3 minutes
- **Clinical Context**: Screen all mood disorder presentations for bipolar potential

**Scoring**:
```
Part A: Yes/No screening (≥7 symptoms in same period = positive)
Part B: Functional impairment question
Part C: Family history question

Positive Screen = Part A (≥7) + Part B (yes) + Part C (optional but strengthens)

Purpose: Differentiate unipolar from bipolar depression (critical for treatment selection)
Critical: SSRI monotherapy can trigger bipolar switching
```

**EHR Integration**:
- Mandatory bipolar screening in mood disorder intake
- Alert if MDQ+ and SSRI prescribed without mood stabilizer
- Automatic DSM-5 bipolar I vs II subtype tracking
- Family history integration for genetic risk assessment

---

#### **AUDIT (Alcohol Use Disorders Identification Test)**

**Specifications**:
- **Questions**: 10-item alcohol use screening
- **Domains**: Quantity, frequency, dependence symptoms, harm consequences, help-seeking
- **Administration**: Self-report, 2-3 minutes

**Scoring**:
```
Total Score = Sum of 10 items (0-4 each)
Range: 0-40

Interpretation:
- 0-7: Low-risk drinking (Zone 1)
- 8-15: Hazardous drinking (Zone 2) - brief intervention recommended
- 16-19: Harmful drinking (Zone 3) - assessment & counseling
- 20-40: Alcohol dependence (Zone 4) - referral for specialist treatment

Threshold for further assessment: ≥8
```

**EHR Integration**:
- Co-occurring disorder screening (alcohol + mental health)
- Safety alerts (alcohol-psychotropic interactions)
- Substance abuse treatment referral automation
- Medication contraindication checking

---

#### **DAST-10 (Drug Abuse Screening Test)**

**Specifications**:
- **Questions**: 10-item substance use screening
- **Domains**: Frequency, compulsion, social impact, health impact, control loss, help-seeking
- **Administration**: Self-report, 2-3 minutes
- **Scope**: Non-alcohol drugs (cannabis, cocaine, opioids, stimulants, etc.)

**Scoring**:
```
Total Score = Sum of 10 items (yes=1, no=0)
Range: 0-10

Interpretation:
- 0-2: No substance abuse likelihood
- 3-5: Low-mild substance abuse likelihood
- 6-8: Moderate substance abuse likelihood
- 9-10: Severe substance abuse likelihood

Clinical Action Thresholds:
- ≥3: Requires detailed substance use assessment
- ≥6: Referral to substance use disorder treatment
```

**EHR Integration**:
- Automatic AUDIT + DAST-10 screening combo for psychiatric cases
- Substance type granularity tracking (cannabis, opioids, stimulants, hallucinogens)
- Medication interactions with active substance use
- Addiction medicine consultation triggers

---

#### **CAGE-AID (Substance Abuse Screening)**

**Specifications**:
- **Questions**: 4-item brief substance abuse screening
- **Domains**: Cut-down, annoyance, guilt, eye-opener (adapted for all substances)
- **Administration**: Verbal screening, 1 minute
- **Clinical Context**: Quick screening in busy psychiatric settings

**Scoring**:
```
Positive Screen = ≥2 affirmative answers
Each "yes" = 1 point
Range: 0-4

Interpretation:
- 0-1: Low risk (no intervention)
- ≥2: Positive screen (requires full DAST-10 or detailed assessment)
```

**EHR Integration**:
- Rapid triage screening before full assessment
- Verbal intake documentation support
- Conditional routing to substance use assessment forms

---

#### **C-SSRS (Columbia-Suicide Severity Rating Scale) - Suicide Risk Assessment**

**Specifications**:
- **Questions**: 6 questions (plain-language, anyone can administer)
- **Domains**: Suicidal ideation presence, frequency, intensity, suicidal behavior history
- **Administration**: Clinician-administered or self-report, 2-5 minutes
- **Critical Feature**: Gold-standard for suicide risk in clinical settings

**Questions & Scoring**:
```
1. Wish to be dead (Y/N)
2. Non-specific active suicidal thoughts (Y/N)
3. Active suicidal ideation with any method/plan/intent (Y/N)
4. Preparatory actions or behavior (Y/N)
5. Actual suicide attempt (Y/N)
6. Non-suicidal self-injury (Y/N)

Risk Stratification:
- LOW RISK: No ideation or passive death wish only
- MODERATE RISK: Active ideation without specific plan/intent
- HIGH RISK: Active ideation with plan/intent/behavior
- CRITICAL: Recent attempt, ongoing intent, preparation

Severity Rating (if ideation present):
- Frequency: less than once a day / once a day or more
- Duration: brief/persistent
- Controllability: easily controlled / difficult to control
- Deterrents: strong / weak
- Reason for ideation: revenge/escape/curiosity
```

**EHR Integration - CRITICAL SAFETY FEATURES**:
```
Risk Level → Automated Actions:

LOW RISK:
- Standard follow-up scheduling (4-6 weeks)
- Psychoeducation materials
- Coping resources list

MODERATE RISK:
- Increased monitoring (weekly or bi-weekly)
- Safety planning template (see below)
- Emergency contact verification
- Collaborative care alert to PCP
- Medication review for serotonergic adequacy
- Substance use screen (alcohol increases risk 10x)

HIGH RISK:
- Immediate psychiatric evaluation required (flag)
- Inpatient admission assessment (CRITICAL)
- 24-hour monitoring plan
- Emergency contact activation
- Means restriction counseling
- Family notification (with patient consent)
- Crisis hotline numbers (988 - US National Suicide Prevention Lifeline)
- Hospitalization documentation

CRITICAL/ACUTE:
- EMERGENCY PROTOCOL ACTIVATION
- Direct emergency services notification
- Involuntary hold evaluation
- ICU psychiatric consultation
- Continuous monitoring until stabilization
```

---

### 2. Safety Planning Workflow

**Safety Plan Template** (integrated in EHR):

```
Patient Name: _______________  Date: ______________  Risk Level: □ Low  □ Moderate  □ High

1. WARNING SIGNS
Internal signs that suicidal crisis may be developing:
- [Patient-identified internal warning signs]

2. INTERNAL COPING STRATEGIES
Things I can do on my own to cope:
- Distraction activities
- Physical activities
- Social activities
- Relaxation techniques

3. EXTERNAL COPING STRATEGIES
People and social settings that I can use to cope:
- Safe person to call: ___________
- Safe place to go: ______________
- Support group/activity: ________

4. PEOPLE TO CONTACT DURING A CRISIS
Social supports (excluding emergency services):
1. Name: ______  Phone: ______  Relationship: ______
2. Name: ______  Phone: ______  Relationship: ______
3. Name: ______  Phone: ______  Relationship: ______

5. PROFESSIONAL CONTACTS & CRISIS SERVICES
- Primary therapist: ______  Phone: ______
- Psychiatrist: ______  Phone: ______
- Crisis line: 988 (US)
- Emergency services: 911
- Hospital ER: ______  Phone: ______

6. MEANS SAFETY
Steps I can take to reduce access to means:
- Remove medications
- Secure firearms with trusted friend/family
- Reduce alcohol access
- Other: __________

7. REASONS FOR LIVING
Things that make life worth living:
- [Patient-identified values, goals, relationships]

8. AGREED-UPON PLAN IF CRISIS OCCURS
What I will do: ___________
What therapist/doctor will do: __________
Follow-up appointment: __________ Date/Time

Patient Signature: _______________  Provider Signature: _______________
Review Date: __________  Next Safety Plan Update: __________
```

**Workflow Integration**:
- Auto-populate from patient record
- Emergency contact verification via phone/SMS
- Printed wallet card for patient
- Copy sent to emergency contacts (with consent)
- Quarterly review scheduled

---

### 3. Psychiatric Intake Assessment Workflow

**Phase 1: Screening & Triage** (Front desk, <5 min)
```
□ Chief complaint documented
□ Safety screening (CAGE-AID rapid)
□ Acute distress assessment
□ Route to appropriate level of care
```

**Phase 2: Comprehensive Intake** (Clinician, 30-45 min)
```
DEMOGRAPHICS & INSURANCE
□ Demographics confirmed
□ Insurance verified
□ Emergency contact documented
□ Consent forms signed

PRESENTING PROBLEM
□ Chief complaint with duration
□ Current symptoms
□ Functional impairment level
□ Precipitating factors

PSYCHIATRIC HISTORY
□ Previous psychiatric diagnoses
□ Previous psychiatric hospitalizations
□ Previous suicide attempts/self-harm
□ Previous medication trials (responses, tolerability)
□ Previous therapy (types, duration, effectiveness)
□ History of trauma/abuse
□ Family psychiatric history

SUBSTANCE USE HISTORY (DAST-10/AUDIT)
□ Alcohol use pattern & consequences
□ Cannabis use (frequency, dependence symptoms)
□ Stimulant use (cocaine, methamphetamine, prescription)
□ Opioid use (heroin, prescription)
□ Hallucinogens
□ Benzodiazepines
□ Treatment history

MEDICAL HISTORY
□ Thyroid disease (depression screen)
□ Chronic pain conditions
□ Seizure disorder
□ Neurological conditions
□ Medications list (all)
□ Allergies/adverse reactions
□ Substance allergies

SOCIAL HISTORY
□ Living situation
□ Family relationships
□ Occupation/work stress
□ Education level
□ Financial stressors
□ Legal issues
□ Cultural background/spiritual beliefs

ASSESSMENT TOOLS (digital intake)
□ PHQ-9 (depression)
□ GAD-7 (anxiety)
□ MDQ (bipolar screening)
□ PCL-5 (if trauma history: yes)
□ C-SSRS (suicide risk) - MANDATORY
□ MMSE or MoCA (if cognitive concerns)

MENTAL STATUS EXAMINATION (MSE)
See section 4 below

CLINICAL IMPRESSION & FORMULATION
□ Chief diagnoses (DSM-5 codes)
□ Rule-outs
□ Diagnostic clarity (confirmed/provisional)
□ Biopsychosocial formulation
□ Safety assessment summary
□ Functional assessment (GAF score)

TREATMENT PLAN
□ Diagnostic recommendations
□ Medication recommendations (if psychiatrist)
□ Psychotherapy type & frequency
□ Substance abuse treatment (if needed)
□ Medical follow-ups (if needed)
□ Safety plan (if risk identified)
□ Follow-up appointment scheduled
```

**Phase 3: DSM-5 Diagnostic Coding**

EHR must support:
- Primary diagnosis with ICD-10-CM code
- Secondary/comorbid diagnoses
- Diagnostic modifiers (e.g., bipolar I disorder, current episode depressed, with anxious distress, moderate severity)
- Duration of symptoms (≥2 weeks for depression, ≥6 months for dysthymia, etc.)
- Substance-induced exclusion checking
- Medical condition exclusion checking

```
Example Entry:
PRIMARY: Major Depressive Disorder, Single Episode, Moderate (F32.1)
- Onset: 3 months ago
- Precipitant: Job loss
- Severity: Moderate (PHQ-9 = 14)
- Specifiers: With anxious distress (GAD-7 = 12)

SECONDARY: Generalized Anxiety Disorder (F41.1)
- Onset: 2 months ago
- Severity: Moderate (GAD-7 = 12)

RULE OUT: Bipolar II disorder (MDQ negative)
RULE OUT: Substance-induced depression (AUDIT = 6, within normal limits)
RULE OUT: Medical condition-induced (Thyroid TSH normal)

FUNCTIONAL ASSESSMENT: GAF = 55 (moderate difficulty)
```

---

### 4. Mental Status Examination (MSE) Template

**EHR Documentation Structure**:

```
APPEARANCE & BEHAVIOR
□ Age appearance matches stated age
□ Grooming: □ Good  □ Fair  □ Poor  □ Disheveled
□ Hygiene: □ Good  □ Fair  □ Poor  □ Odorous
□ Clothing: □ Appropriate  □ Inappropriate  □ Bizarre
□ Physical stigmata: □ None  □ Tattoos  □ Scars  □ Other: ______
□ Distinguishing features: ________________
□ Posture: □ Upright  □ Slumped  □ Agitated  □ Restless
□ Gait: □ Normal  □ Shuffling  □ Ataxic  □ Other: ______
□ Eye contact: □ Normal  □ Avoidant  □ Excessive  □ Suspicious
□ Mannerisms: □ None  □ Tics  □ Tremor  □ Self-soothing  □ Other: ______

MOOD & AFFECT
Mood (patient's subjective emotional state):
□ Depressed  □ Euthymic  □ Elevated  □ Irritable  □ Anxious  □ Labile  □ Flat
Patient's own words: "I feel ________________"
Stability: □ Stable  □ Labile  □ Reactive

Affect (observed emotional expression):
□ Appropriate (mood-congruent)  □ Inappropriate (incongruent)
□ Restricted  □ Blunted  □ Flat  □ Expansive  □ Labile
Examples: __________________

SPEECH
Rate: □ Normal  □ Accelerated  □ Slow  □ Halting  □ Mutism
Volume: □ Normal  □ Loud  □ Soft  □ Variable
Articulation: □ Clear  □ Slurred  □ Dysarthric
Coherence: □ Coherent  □ Tangential  □ Circumstantial  □ Incoherent

THOUGHT PROCESS (organization & flow)
□ Logical & goal-directed
□ Tangential (goes off track but eventually returns)
□ Circumstantial (detailed/slow path to point)
□ Flight of ideas (rapid shifting, barely connected)
□ Loosening of associations (illogical connections)
□ Incoherence (unintelligible, word salad)
□ Blocking (sudden interruption)
□ Perseveration (repetitive theme)

THOUGHT CONTENT (what patient thinks about)
Preoccupations: □ None  □ Obsessions  □ Ruminations  □ Worries
Suicidal ideation: □ Denied  □ Present (see C-SSRS score above)
Homicidal ideation: □ Denied  □ Present (specify target & plan)
Delusions: □ Denied  □ Present:
  □ Persecutory (being harmed)
  □ Grandiose (special powers)
  □ Reference (directed at them)
  □ Control (thoughts controlled externally)
  □ Somatic (body is diseased)
  □ Erotomanic (loved by famous person)
  □ Nihilistic (part of body doesn't exist)
Hallucinations: □ Denied  □ Present:
  □ Auditory (voices): _________________
  □ Visual: ___________________________
  □ Olfactory: ________________________
  □ Gustatory: ________________________
  □ Tactile: __________________________
Insight into hallucinations: □ None  □ Poor  □ Good
Magical thinking: □ Denied  □ Present
Phobias: □ None  □ Present: ______________

PERCEPTION
□ Normal  □ Depersonalization  □ Derealization  □ Illusions  □ Hallucinations (see above)

ORIENTATION & CONSCIOUSNESS
Orientation to:
□ Person (name): Y/N
□ Place (location): Y/N
□ Time (date/season/year): Y/N
□ Situation (why here): Y/N

Level of consciousness:
□ Alert  □ Drowsy  □ Lethargic  □ Stuporous  □ Comatose
Attention: □ Alert  □ Distractible  □ Scattered  □ Fluctuating

MEMORY
Immediate (digit span):
□ Normal (can repeat 5-7 digits)  □ Impaired: ______

Recent (events last few days/weeks):
□ Intact  □ Impaired
Examples tested: ________________

Remote (personal/historical):
□ Intact  □ Impaired
Examples tested: ________________

COGNITIVE FUNCTIONING
Concentration: □ Normal  □ Impaired (easily distractible)
Calculation (serial 7s or 100-7-93): □ Intact  □ Impaired
Abstraction (proverb interpretation):
  Proverb: "A rolling stone gathers no moss"
  Response: ________________________
  □ Concrete  □ Adequately abstract

INSIGHT
□ Good (aware of illness & need for treatment)
□ Fair (somewhat aware)
□ Poor (denies illness)
□ Absent (complete denial)

JUDGMENT
□ Good (appropriate problem-solving)
□ Fair (some difficulty with complex decisions)
□ Poor (risky decision-making)
Tested by: ____________________

RELIABILITY
□ Reliable/credible historian
□ Questionable (inconsistent, evasive)
□ Unreliable (significantly distorted account)
Reasons for concern: ____________

NEUROLOGICAL SIGNS (if indicated)
□ Tremor  □ Muscle rigidity  □ Tardive dyskinesia  □ Akathisia  □ Other: ____
```

**FHIR Representation**:

```
Questionnaire resource capturing MSE structure
QuestionnaireResponse storing examination findings
Observation resources for specific findings (e.g., suicidal ideation severity)
LOINC codes for standardized mental status observations
```

---

### 5. Medication Management Workflow

**Core Components**:

**Phase 1: Medication Review & Planning**
```
□ Current medications listed (from pharmacy/patient)
□ Dosages, frequencies, routes documented
□ Previous medication trials reviewed
□ Response/tolerability to each documented
□ Contraindications checked
□ Drug interaction screening (automated)
□ Pregnancy status/potential (⚠ teratogenic risk)
□ CYP450 interactions identified (genetic factors)
□ Substance interactions (alcohol, illicit drugs)
```

**Phase 2: Treatment Initiation**
```
1. PSYCHIATRIC DIAGNOSIS → Evidence-Based Medication Selection
   - Depression/anxiety: SSRIs first-line (sertraline, escitalopram)
   - Bipolar: Mood stabilizers (lithium, valproate, lamotrigine)
   - Psychosis: Antipsychotics (aripiprazole, risperidone, quetiapine)
   - ADHD: Stimulants (methylphenidate, amphetamine)
   - Substance use: Opioid maintenance (methadone, buprenorphine)

2. PRESCRIBING CHECKLIST
   □ Diagnosis-appropriate selection
   □ Dose starting (usually lower than maintenance)
   □ Titration schedule (dose escalation over weeks)
   □ Expected timeline to symptom improvement (4-6 weeks)
   □ Side effects counseling provided
   □ Drug interactions verified (automated alert)
   □ Controlled substance handling (EPCS - Electronic Prescribing of Controlled Substances)
   □ Insurance pre-authorization (if needed)
   □ Patient education documented
   □ Follow-up timing established

3. SPECIAL CONSIDERATIONS
   - Suicidal ideation + SSRI: Monitor closely first 2 weeks (black box warning)
   - Bipolar depression: SSRI alone can trigger manic switch (use mood stabilizer)
   - Benzodiazepine prescribing: High abuse/dependence potential
     • Avoid long-term use (creates dependence)
     • Taper schedule required at discontinuation
     • Screen for substance use disorder before prescribing
     • Limit to acute agitation/anxiety crisis
   - Antipsychotics: Monitor metabolic effects (weight, glucose, lipids)
   - Lithium: Requires therapeutic drug monitoring (0.5-1.2 mEq/L)
```

**Phase 3: Medication Trial Monitoring**
```
BASELINE (before starting):
□ Vital signs (BP, HR)
□ Weight
□ Fasting glucose (for metabolic monitoring)
□ Lipid panel (for metabolic effects)
□ EKG (for some antipsychotics - QTc prolongation risk)
□ Renal function (for lithium)

WEEK 1-2 (titration phase):
□ Symptom improvement tracking (PHQ-9/GAD-7 trending)
□ Adverse effects documentation
□ Suicidal ideation reassessment (especially SSRIs)
□ Dosage adjustment if needed
□ Contact method (phone check-in recommended)

WEEK 4 (expected therapeutic window):
□ Symptom improvement sufficient?
   - YES → Continue current dose
   - NO → Consider dose escalation or medication change

WEEK 8 (response assessment):
□ Clinical response determination
   - Adequate response (≥50% symptom reduction): Continue medication
   - Partial response: Increase dose OR augment with 2nd agent
   - Non-response: Switch medication

ONGOING (maintenance monitoring):
□ Monthly for first 3 months
□ Then quarterly once stabilized
□ Annual physical with vital signs, weight, labs
□ Lithium: Quarterly drug levels + renal/thyroid function
□ Antipsychotics: Annual metabolic panel (weight, glucose, lipids)
```

**Phase 4: Controlled Substance Prescribing (EPCS)**

Critical safety features:
```
BENZODIAZEPINES (e.g., alprazolam, lorazepam):
□ DEA-registered prescriber
□ PDMP (Prescription Drug Monitoring Program) check for pill-seeking
□ Controlled substance agreement signed
□ Patient education on dependence risk
□ Dosing limits (max dose based on indication)
□ Duration limits (acute anxiety/agitation only)
□ Alcohol/substance interaction counseling
□ Taper schedule at discontinuation (avoid seizures)

STIMULANTS (e.g., methylphenidate, amphetamine - ADHD):
□ ADHD diagnosis verified
□ Baseline cardiovascular assessment (BP, HR, EKG if indicated)
□ PDMP check
□ Controlled substance agreement
□ Regular follow-up (monthly initially)
□ Monitoring: HR, BP, appetite, sleep
□ School/work performance documentation

OPIOID MAINTENANCE (buprenorphine, methadone):
□ Licensed opioid treatment program (for methadone)
□ Opioid Use Disorder diagnosis confirmed
□ Baseline urine drug screen
□ PDMP check
□ Comprehensive pain assessment
□ Psychosocial assessment
□ Counseling coordination
□ Regular lab monitoring (LFTs, etc.)
```

**EHR Integration Features**:
- Automated drug interaction screening (via pharmacology database)
- CYP450 enzyme interaction flagging
- Therapeutic drug level reminders (lithium, etc.)
- Side effect tracking dashboard
- PDMP integration for controlled substance safety
- Treatment response trending (PHQ-9/GAD-7 graphed over time)
- Medication adherence reminders
- Refill management & insurance authorization
- Taper scheduling at discontinuation

---

### 6. Therapy Session Note Template

**Progress Note Structure** (integration with encounter documentation):

```
ENCOUNTER: Therapy Session - Individual Psychotherapy

SESSION INFO
Date: ________  Time: ________  Duration: _____ min
Therapist: ____________  Patient: ____________
Session #: ____  Total sessions in current course: ____
Modality: □ Individual  □ Couple  □ Family  □ Group
Type: □ CBT  □ DBT  □ ACT  □ Psychodynamic  □ Interpersonal  □ Other: ____

CLINICAL STATUS
Mood: □ Euthymic  □ Elevated  □ Depressed  □ Irritable
Affect: □ Appropriate  □ Restricted  □ Blunted  □ Labile
Suicidal ideation: □ Denied  □ Present (specify severity)
Homicidal ideation: □ Denied  □ Present
Substance use since last session: □ None  □ Minimal  □ Significant
Medication adherence: □ Good  □ Partial  □ Poor

PRESENTING CONCERNS/AGENDA
What patient wanted to discuss:
- ________________
- ________________
- ________________

SUBJECTIVE NARRATIVE
What happened this week/since last session:
[Free text clinical narrative]

INTERVENTION/THERAPY PROCESS
Therapeutic techniques used:
□ Psychoeducation  □ Cognitive restructuring  □ Behavioral activation
□ Exposure therapy  □ Skill-building  □ Validation
□ Processing/exploration  □ Encouragement to action
□ Other: ____

Specific interventions:
[Description of what was done]

HOMEWORK/BETWEEN-SESSION WORK
Assigned:
- [Task/assignment]
- [Task/assignment]

Previous homework completion: □ Full  □ Partial  □ Not attempted
[Details if not completed]

CLINICAL PROGRESS & MEASUREMENT
PHQ-9 (if administered): _____ (↑ improved / → stable / ↓ worsened)
GAD-7 (if administered): _____ (↑ improved / → stable / ↓ worsened)
GAF (functional): Score _____ (↑ improving / → stable / ↓ declining)

Symptom targets tracking:
- [Symptom goal]: ________________ (progress: _%)
- [Symptom goal]: ________________ (progress: _%)

ASSESSMENT
Progress toward treatment goals: □ Good  □ Adequate  □ Slow  □ None
Motivation for change: □ High  □ Moderate  □ Low
Risk level: □ Low  □ Moderate  □ High (re-assess C-SSRS if elevated)
Barriers to progress: _________________
Strengths/resilience factors: _________________

PLAN
Continue current treatment: □ Yes  □ No
Next session: __________ (date/time)
Frequency: □ Weekly  □ Bi-weekly  □ Monthly
Duration estimate: __________ (e.g., 8-12 sessions)
Coordination with psychiatrist: □ Yes  □ No
Coordination with other providers: ____________

Changes to treatment plan:
□ No changes
□ Medication change discussed (to psychiatrist)
□ Therapy modality adjustment: ________________
□ Other: ____

SAFETY ASSESSMENT (every session)
Suicidal risk current session: □ Low  □ Moderate  □ High
Actions taken (if risk elevated):
□ Safety plan reviewed
□ Emergency contacts verified
□ Psychiatrist notified
□ Higher level of care considered

PATIENT EDUCATION
Topics discussed:
□ Symptom management
□ Medication adherence
□ Healthy coping strategies
□ Sleep hygiene
□ Exercise/nutrition
□ Social support building
□ Other: ____

PROVIDER SIGNATURE: ________________  Date/Time: ____________
SUPERVISION/REVIEW (if applicable): ________________  Date: ____________
```

---

### 7. Treatment Plan Documentation

**Initial Treatment Plan** (first psychiatric visit):

```
PATIENT: ____________  DOB: __________  MRN: __________
DATE CREATED: __________  REVIEW DATE: __________ (30 days)
CLINICIAN: ____________  (Psychiatrist/APRN/licensed therapist)

DIAGNOSES
Primary: __________________ (ICD-10: ____)  Severity: □ Mild  □ Moderate  □ Severe
Secondary: ________________ (ICD-10: ____)
Axis V - GAF Score: ______ (functional level)

TREATMENT GOALS (SMART - Specific, Measurable, Achievable, Relevant, Time-bound)

GOAL 1: Mood Improvement
- Specific: Reduce depressive symptoms
- Measurable: PHQ-9 score from _____ to <10 (mild or less)
- Target date: __________ (e.g., 8 weeks)
- Progress measurement: PHQ-9 every 2 weeks

GOAL 2: Anxiety Reduction
- Specific: Reduce anxiety symptoms
- Measurable: GAD-7 score from _____ to <5 (minimal)
- Target date: __________ (e.g., 8-12 weeks)
- Progress measurement: GAD-7 every 2 weeks

GOAL 3: Functional Improvement
- Specific: Return to work/school/daily activities
- Measurable: Attend work/school ≥5 days/week
- Target date: __________ (e.g., 4-6 weeks)
- Progress measurement: Weekly review in therapy

GOAL 4: [Patient-specific goal]
- Specific: ________________
- Measurable: ________________
- Target date: __________
- Progress measurement: __________

INTERVENTIONS

1. PSYCHIATRIC MEDICATION MANAGEMENT
   Type: ______________ (e.g., SSRI - sertraline)
   Dose: __________ mg  Frequency: __________ (e.g., daily at bedtime)
   Rationale: Evidence-based for depression with anxiety
   Monitoring: PHQ-9/GAD-7 every 2 weeks
   Follow-up appointment: __________
   Emergency: Contact psychiatrist if suicidal ideation develops

2. INDIVIDUAL PSYCHOTHERAPY
   Type: ______________ (e.g., Cognitive-Behavioral Therapy)
   Frequency: __________ (e.g., 1x weekly)
   Duration: __________ (e.g., 12 weeks minimum)
   Goals: Cognitive restructuring, behavioral activation, coping skills
   Therapist: ______________

3. SUBSTANCE USE INTERVENTION (if applicable)
   Type: ______________ (e.g., motivational interviewing, group counseling)
   Frequency: __________
   Program: ______________
   Referral: To ______________ (agency name)

4. SOCIAL/ENVIRONMENTAL INTERVENTIONS
   - Sleep hygiene education
   - Exercise/physical activity: Target 150 min/week moderate activity
   - Social support activation (involve family/friends)
   - Work/disability evaluation (if unable to work)
   - Housing/financial assessment (if applicable)

5. PSYCHIATRIC ILLNESS EDUCATION
   Topics to cover:
   □ Diagnosis (what is depression/anxiety?)
   □ Symptom triggers
   □ Medication effects & side effects
   □ Therapy process & expectations
   □ Relapse prevention
   □ When to seek emergency care

RISK ASSESSMENT & MANAGEMENT

Suicidal Risk Level: □ Low  □ Moderate  □ High
Current risk factors:
- ________________
- ________________

Protective factors:
- ________________
- ________________

Safety Plan: □ Completed  □ In progress  Date: __________
Means restriction: □ Not needed  □ Discussed  □ Implemented
Emergency contacts documented: □ Yes  □ No
Crisis plan: □ Outlined  □ Formal written plan

SUBSTANCE USE

AUDIT score: ______  DAST-10 score: ______
Current use: ________________
Substance use treatment: □ Not needed  □ Recommended  □ Referred to: ____

MEDICATION REVIEWS

Current medications: [auto-populated from pharmacy list]
- [Med]: [Dose/frequency], [indication]
- [Med]: [Dose/frequency], [indication]

Allergy/adverse reactions: ________________

COORDINATION OF CARE

Primary Care Provider: ________________  Contact: __________
Other specialists: ________________
Referrals made:
- ________________ (agency, reason)
- ________________ (agency, reason)

Communication frequency: □ Per visit  □ Quarterly  □ Annually
Release of information signed: □ Yes  □ No  Date: __________

FOLLOW-UP

Next psychiatry appointment: __________ (within 1-2 weeks)
Next therapy appointment: __________ (within 1 week)
Labs/tests ordered: ________________
Communication with patient/family: Reviewed treatment plan, discussed goals, addressed questions

PATIENT/LEGAL GUARDIAN PARTICIPATION
Patient understanding of plan: □ Good  □ Fair  □ Poor
Patient agrees with plan: □ Yes  □ No  □ Partial
Signature: ________________  Date: __________
Parent/Guardian (if applicable): ________________  Date: __________

CLINICIAN SIGNATURE: ________________  License #: __________  Date: __________

PLAN REVIEW & UPDATES
Review Date: __________  Status: □ On track  □ Needs adjustment
Updated by: ____________  Date: __________
Changes made: ________________

[Repeat review section every 30 days minimum]
```

---

### 8. Outcome Monitoring & Measurement-Based Care

**Standardized Assessment Administration**:

```
Intake (baseline):
□ PHQ-9 (depression)
□ GAD-7 (anxiety)
□ PCL-5 (PTSD - if trauma history)
□ MDQ (bipolar screening)
□ C-SSRS (suicide risk)
□ AUDIT/DAST-10 (substance use)
□ Functional assessment (GAF score)

Ongoing Monitoring (every 2-4 weeks):
□ PHQ-9 (if depression diagnosis)
□ GAD-7 (if anxiety diagnosis)
□ C-SSRS (ongoing suicide monitoring)
□ Medication side effects screen

Quarterly (3 months):
□ Full outcome battery (repeat intake assessments)
□ Functional review (GAF)
□ Medication effectiveness evaluation
□ Treatment plan adjustment

Discharge/Termination:
□ Final outcome battery (same instruments as intake)
□ Progress documentation (pre-treatment scores vs. final scores)
□ Relapse prevention planning
□ Follow-up scheduling (if needed)
```

**Outcome Tracking Dashboard** (EHR feature):

```
DEPRESSION TREATMENT RESPONSE:
[Graph showing PHQ-9 scores over time]
- Week 0: PHQ-9 = 18 (moderate)
- Week 2: PHQ-9 = 16 (no change, increase dose?)
- Week 4: PHQ-9 = 12 (moderate improvement)
- Week 8: PHQ-9 = 6 (remission)
- Week 12: PHQ-9 = 5 (maintained)

CLINICAL DECISIONS:
- If ≥50% improvement by week 4: Continue current treatment
- If <25% improvement by week 4: Consider dose escalation or medication change
- If no improvement by week 6: Consider switching medications or adding augmentation

ANXIETY TRACKING:
[Similar graph for GAD-7]

SUICIDE RISK TREND:
[Flagged if C-SSRS score rises or remains in high-risk range]

FUNCTIONAL IMPROVEMENT:
[GAF score trending toward <50 recovery goal]

MEDICATION RESPONSE:
[Side effects emerging? Efficacy timeline met?]
```

---

## Implementation Standards & Clinical Decision Support

### Database Schema Essentials

**Core Mental Health Tables**:

```sql
-- Assessment Results
CREATE TABLE psychiatric_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  assessment_type VARCHAR(50), -- 'PHQ9', 'GAD7', 'PCL5', 'MDQ', 'AUDIT', 'DAST10', 'CAGE_AID', 'C_SSRS', 'MSE', 'MMSE'
  assessment_date TIMESTAMP NOT NULL,
  total_score INT,
  severity_level VARCHAR(20), -- 'none', 'mild', 'moderate', 'severe', 'very_severe'
  responses JSONB, -- Question-level responses with scoring
  interpreted_by_clinician_id UUID,
  clinical_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id),
  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id)
);

-- C-SSRS Suicide Risk Assessment (specialized)
CREATE TABLE suicide_risk_assessments (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  assessment_date TIMESTAMP NOT NULL,

  -- C-SSRS Core Questions
  wish_to_be_dead BOOLEAN,
  active_suicidal_ideation BOOLEAN,
  suicidal_ideation_with_plan_intent BOOLEAN,
  preparatory_behavior BOOLEAN,
  actual_suicide_attempt BOOLEAN,

  -- Risk Stratification
  risk_level VARCHAR(20), -- 'low', 'moderate', 'high', 'critical'

  -- Severity Dimensions (if ideation present)
  frequency VARCHAR(20), -- 'less_than_daily', 'daily_or_more'
  duration VARCHAR(20), -- 'brief', 'persistent'
  controllability VARCHAR(20), -- 'easily_controlled', 'difficult_to_control'
  deterrents_strength VARCHAR(20), -- 'strong', 'weak'

  -- Protective Factors
  reasons_for_living TEXT, -- Patient-identified

  -- Safety Planning
  safety_plan_completed BOOLEAN,
  means_restriction_discussed BOOLEAN,
  emergency_contact_verified BOOLEAN,

  -- Actions Taken
  psychiatrist_notified BOOLEAN,
  crisis_resources_provided BOOLEAN,
  hospitalization_recommended BOOLEAN,

  assessed_by_clinician_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id),
  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id)
);

-- Psychiatric Diagnoses (DSM-5)
CREATE TABLE psychiatric_diagnoses (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  episode_id UUID,

  diagnosis_code VARCHAR(10), -- ICD-10 code
  diagnosis_description TEXT,
  dsm5_specifiers VARCHAR(500), -- e.g., "with anxious distress, moderate severity"

  onset_date DATE,
  onset_age INT,
  symptom_duration_days INT,

  severity_level VARCHAR(20), -- 'mild', 'moderate', 'severe'

  diagnostic_confidence VARCHAR(20), -- 'confirmed', 'provisional', 'rule_out'

  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id),
  CONSTRAINT fk_org FOREIGN KEY(org_id) REFERENCES organizations(id)
);

-- Mental Health Treatment Plans
CREATE TABLE psychiatric_treatment_plans (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  created_by_clinician_id UUID NOT NULL,

  plan_date DATE,
  planned_duration_days INT,
  review_date DATE,

  -- Treatment Goals (SMART)
  goals JSONB, -- Array of goal objects with {goal_id, description, measurable_target, target_date, metric}

  -- Interventions
  interventions JSONB, -- Array of {type, frequency, provider, details}

  estimated_improvement_timeline_weeks INT,

  patient_engaged BOOLEAN,
  status VARCHAR(20), -- 'active', 'paused', 'completed'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Psychiatric Medications (specialized tracking)
CREATE TABLE psychiatric_medications (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,

  medication_name VARCHAR(100),
  medication_class VARCHAR(50), -- 'SSRI', 'SNRI', 'TCA', 'Mood_Stabilizer', 'Antipsychotic', 'Stimulant', 'Benzodiazepine'

  dose_mg DECIMAL(10,2),
  frequency VARCHAR(50), -- 'daily', 'twice daily', etc.
  start_date DATE,
  end_date DATE,

  indication VARCHAR(200), -- Diagnosis treated with this med

  -- Trial Tracking
  baseline_score INT, -- Starting PHQ-9/GAD-7/etc
  current_score INT,

  expected_symptom_improvement_date DATE, -- 4-6 weeks from start

  side_effects TEXT, -- Documented side effects
  adherence VARCHAR(20), -- 'good', 'partial', 'poor'

  -- Special Considerations
  is_controlled_substance BOOLEAN,
  requires_therapeutic_monitoring BOOLEAN,
  therapeutic_level_range VARCHAR(50), -- For lithium, etc
  last_drug_level_drawn DATE,
  last_drug_level_value DECIMAL(10,2),

  prescriber_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Therapy Session Notes (encounter-related)
CREATE TABLE therapy_session_notes (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  encounter_id UUID NOT NULL,

  therapy_type VARCHAR(50), -- 'CBT', 'DBT', 'ACT', 'Psychodynamic', 'Interpersonal'

  session_number INT,

  mood_at_session VARCHAR(20),
  suicidal_ideation_at_session VARCHAR(20), -- 'denied', 'present_low', 'present_moderate', 'present_high'

  presenting_concerns TEXT,
  interventions_used TEXT, -- Clinical techniques applied

  homework_assigned TEXT,
  homework_completion_status VARCHAR(20),

  progress_toward_goals INT, -- Percentage

  next_session_scheduled_date DATE,

  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_encounter FOREIGN KEY(encounter_id) REFERENCES encounters(id)
);

-- Safety Plans (critical feature)
CREATE TABLE safety_plans (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  patient_id UUID NOT NULL,

  plan_date DATE,

  warning_signs TEXT,
  internal_coping_strategies TEXT,
  external_coping_strategies TEXT,
  support_contacts JSONB, -- [{name, phone, relationship}]
  professional_contacts JSONB, -- [{role, name, phone}]
  means_safety_steps TEXT,
  reasons_for_living TEXT,

  crisis_action_plan TEXT,

  status VARCHAR(20), -- 'active', 'reviewed', 'updated'
  last_reviewed_date DATE,
  next_review_date DATE,

  patient_has_copy BOOLEAN,
  emergency_contacts_verified BOOLEAN,
  emergency_contacts_notified BOOLEAN,

  created_by_clinician_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- Clinical Decision Support Rules (Mental Health)
CREATE TABLE mental_health_decision_rules (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,

  rule_name VARCHAR(200),
  rule_type VARCHAR(50), -- 'medication_alert', 'safety_alert', 'treatment_recommendation', 'risk_stratification'

  trigger_condition VARCHAR(500), -- e.g., "PHQ9_SCORE >= 15 AND SSRI_PRESCRIBED"

  alert_message TEXT,
  recommended_action TEXT,

  severity VARCHAR(20), -- 'info', 'warning', 'critical'

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Examples of Critical Rules:
/*
1. SSRI BLACK BOX WARNING:
   Trigger: SSRI prescribed AND (age < 25 OR C_SSRS_RISK = 'HIGH')
   Alert: "Black box warning: SSRIs increase suicidal thoughts in young adults/high-risk patients. Close monitoring required"
   Action: Schedule 1-week follow-up call, educate patient

2. BIPOLAR SWITCHING ALERT:
   Trigger: MDQ_POSITIVE AND SSRI_PRESCRIBED AND MOOD_STABILIZER_ABSENT
   Alert: "SSRI monotherapy in bipolar disorder can trigger manic switch"
   Action: Recommend mood stabilizer consultation

3. CONTROLLED SUBSTANCE SAFETY:
   Trigger: BENZODIAZEPINE_PRESCRIBED AND SUBSTANCE_USE_DISORDER_HISTORY
   Alert: "High abuse potential in SUD patient"
   Action: Structured agreement, PDMP check, close monitoring

4. MEDICATION INTERACTION:
   Trigger: ALCOHOL_USE_CURRENT AND SEDATING_MEDICATION_PRESCRIBED
   Alert: "Risk of severe CNS depression, respiratory depression"
   Action: Counseling on interaction, consider non-sedating alternative

5. THERAPEUTIC DRUG LEVEL MONITORING:
   Trigger: LITHIUM_PRESCRIBED AND DAYS_SINCE_LAST_LEVEL > 90
   Alert: "Lithium level monitoring due (therapeutic range 0.5-1.2)"
   Action: Order plasma lithium level, renal function, TSH

6. SUICIDE RISK ESCALATION:
   Trigger: C_SSRS_RISK_LEVEL CHANGED from LOW to MODERATE/HIGH
   Alert: "Suicide risk escalation detected"
   Action: Immediate clinician notification, safety plan review, psychiatrist notification

7. TREATMENT NON-RESPONSE:
   Trigger: PHQ9_REDUCTION < 25% at 4 WEEKS and MEDICATION_TRIAL_ACTIVE
   Alert: "Inadequate response to current medication. Consider dose escalation or switch"
   Action: Psychiatrist clinical review, medication adjustment planning

8. FUNCTIONAL DECLINE:
   Trigger: GAF_SCORE DECREASED BY > 5 POINTS or ENCOUNTERING HOSPITALIZATION
   Alert: "Significant functional decline detected"
   Action: Immediate assessment, consider higher level of care
*/
```

---

### Clinical Decision Support Rules (Mental Health Module)

**Critical Alerts**:

1. **Suicide Risk Escalation** (CRITICAL)
   - Trigger: C-SSRS risk level increases
   - Action: Flag to all clinical staff, emergency notification
   - Automation: Safety plan auto-generation, emergency contact activation

2. **SSRI Black Box Warning** (WARNING)
   - Trigger: SSRI prescribed + age <25 OR high suicide risk
   - Action: Detailed patient education, close monitoring schedule (weekly phone check-ins)
   - Documentation: Informed consent documented

3. **Bipolar Switching Risk** (WARNING)
   - Trigger: MDQ positive + SSRI prescribed without mood stabilizer
   - Action: Alert to prescriber, mood stabilizer recommendation
   - Prevention: Check for manic/hypomanic symptoms at each visit

4. **Controlled Substance Safety** (WARNING)
   - Trigger: Benzodiazepine OR stimulant prescribed + substance use history
   - Action: PDMP check, structured agreement, close monitoring
   - Duration: Benzodiazepines limited to acute use only (<2-4 weeks)

5. **Medication Non-Response** (INFO)
   - Trigger: <25% symptom improvement by week 4, OR <50% by week 6
   - Action: Psychiatrist clinical review, dose escalation OR medication switch
   - Timing: Adequate trial = 4-6 weeks at therapeutic dose

6. **Drug Interactions** (WARNING/CRITICAL)
   - CYP450 interactions (auto-flagged)
   - Serotonin syndrome (SSRI + MAOI, etc)
   - CNS depression (alcohol + benzodiazepines/sedating meds)
   - QTc prolongation (antipsychotics + other QT-prolonging drugs)

7. **Functional Decline** (CRITICAL)
   - Trigger: GAF score drops >5 points, OR patient reports inability to work/self-care
   - Action: Immediate assessment, higher level of care consideration
   - Safety: C-SSRS reassessment mandatory

8. **Lab Monitoring Overdue** (INFO)
   - Trigger: Lithium (every 3 months), Clozapine (weekly CBC), Antipsychotics (annual metabolic)
   - Action: Order labs, notify prescriber
   - Automation: Alerts repeat quarterly for lithium, annually for antipsychotics

---

## Comparative Analysis: Psychiatric EHR Tools & Platforms

| Feature | SimplePractice | ICANotes | Valant | Calysta | Practice Fusion |
|---------|---|---|---|---|---|
| PHQ-9/GAD-7 Scoring | ✓ Auto-calc | ✓ Auto-calc | ✓ Auto-calc | ✓ Auto-calc | ✓ Auto-calc |
| Safety Planning | ✓ Template | ✓ Template | ✓ Template | ✓ Template | ✓ Template |
| MSE Templates | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| DSM-5 Coding | ✓ ICD-10 | ✓ ICD-10 | ✓ ICD-10 | ✓ ICD-10 | ✓ ICD-10 |
| Rx (EPCS) | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| PDMP Integration | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| Psychiatric Notes | ✓ Specialized | ✓ Specialized | ✓ Specialized | ✓ Specialized | ✓ Specialized |
| Group Therapy Tracking | Limited | ✓ Yes | ✓ Yes | ✓ Yes | Limited |
| Substance Use Screening | ✓ AUDIT/DAST | ✓ AUDIT/DAST | ✓ AUDIT/DAST | ✓ AUDIT/DAST | Basic |
| Outcome Trending | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| Crisis Protocol | Basic | ✓ Advanced | ✓ Advanced | ✓ Advanced | Basic |
| FHIR Compliance | Partial | Partial | Partial | Partial | Partial |
| Multi-tenant Support | Partial | Partial | ✓ Yes | Partial | Partial |
| Cost (Annual) | $$-$$$ | $$-$$$ | $$$-$$$$ | $$-$$$ | $$-$$$ |

---

## Relevant Clinical References & Standards

**Government/Professional Guidelines**:
- DSM-5-TR (American Psychiatric Association) - diagnosis coding standard
- ICD-10-CM (WHO) - coding standard
- FDA Black Box Warnings - medication safety
- SAMHSA Treatment Improvement Protocols (TIPs) - evidence-based treatment
- NICE Guidelines - UK mental health guidelines

**Assessment Tool Sources**:
- [Columbia Protocol for Suicide Assessment](https://cssrs.columbia.edu/)
- [LOINC Codes for Mental Health Assessments](https://loinc.org/)
- [Mental Health America Screening Tools](https://screening.mhanational.org/)

**FHIR Standards**:
- [PACIO Cognitive Status Implementation Guide](https://build.fhir.org/ig/HL7/fhir-pacio-cognitive-status/)
- [US Core Screening & Assessments](https://build.fhir.org/ig/HL7/US-Core/screening-and-assessments.html)
- [FHIR Questionnaire & QuestionnaireResponse](https://www.hl7.org/fhir/questionnaire.html)

---

## EHRConnect Mental Health Module - Implementation Roadmap

### Phase 1: Foundation (4-6 weeks)
- ✅ Assessment tool integration (PHQ-9, GAD-7, C-SSRS)
- ✅ Psychiatric intake form (FHIR Questionnaire-based)
- ✅ DSM-5 diagnosis coding support
- ✅ Safety planning template
- ✅ Basic medication tracking

### Phase 2: Clinical Workflows (6-8 weeks)
- ✅ MSE template with structured documentation
- ✅ Treatment plan builder (SMART goals)
- ✅ Therapy session note templates
- ✅ Medication management dashboard
- ✅ Basic clinical decision support rules

### Phase 3: Advanced Features (8-10 weeks)
- ✅ Outcome monitoring dashboard
- ✅ PCL-5/MDQ/AUDIT/DAST-10 integration
- ✅ PDMP integration for controlled substances
- ✅ Group therapy tracking
- ✅ Safety alert automation

### Phase 4: Integration & Optimization (4-6 weeks)
- ✅ FHIR Observation resources for assessments
- ✅ EHR-to-EHR interoperability via FHIR
- ✅ Telehealth integration (video therapy notes)
- ✅ Medication interaction checking
- ✅ Performance optimization

---

## Unresolved Questions

1. **Integration with Existing OB/GYN Module**: How should perinatal mental health (EPDS, PPD/PPA) integrate with psychiatric module? Separate specialty pack or unified?

2. **Group Therapy Tracking**: What granularity needed for group attendance, individual progress tracking, and outcome measurement?

3. **Substance Use Treatment Integration**: Full substance abuse module (MAT dosing, UDS, etc) or reference to SUD programs?

4. **Telehealth Integration**: Should telehealth session recordings include psychiatric assessment data? Privacy/HIPAA implications?

5. **Machine Learning Opportunities**: Suicide risk prediction models, medication response prediction, treatment matching algorithms - priority level?

6. **International Standards**: PSI-DSM vs. ICD-11? Priority for non-US markets?

7. **Electronic Prescribing of Controlled Substances (EPCS)**: Full e-signature support or referral to pharmacy systems?

8. **Medication Level Monitoring**: Should system auto-order lab work (lithium levels, antipsychotic metabolic panel) or just flag overdue?

9. **Insurance Pre-authorization**: Integration with insurance for psychiatric medication/therapy authorization?

10. **Quality Metrics/Dashboards**: Which metrics to track? (e.g., % depression remission, average response time to crisis, treatment adherence rates)

---

## Sources & References

### Official Assessment Tools
- [Columbia Suicide Severity Rating Scale (C-SSRS)](https://www.columbiapsychiatry.org/research-labs/columbia-suicide-severity-rating-scale-c-ssrs)
- [Patient Health Questionnaire (PHQ) Instruments](https://www.phqscreeners.com/)
- [LOINC Mental Health Assessments](https://loinc.org/)

### FHIR & Standards
- [PACIO Cognitive Status Implementation Guide](https://build.fhir.org/ig/HL7/fhir-pacio-cognitive-status/)
- [FHIR R4 Questionnaire Resource](https://hl7.org/fhir/R4/questionnaire.html)
- [US Core Screening & Assessments](https://build.fhir.org/ig/HL7/US-Core/screening-and-assessments.html)

### Clinical References
- [Psychiatry.org - DSM-5-TR Assessment Measures](https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures)
- [Zero Suicide Institute - C-SSRS Resource](https://zerosuicide.edc.org/resources/resource-database/columbia-suicide-severity-rating-scale-c-ssrs)
- [National Institute of Mental Health (NIMH) - Treatment Guidance](https://www.nimh.nih.gov/)

### Implementation Guidance
- [Mental Health EHR Features Best Practices](https://www.ehrinpractice.com/ehr-features-behavioral-mental-health.html)
- [Building DSM-5 Compliant EHR Templates](https://www.thinkitive.com/blog/building-templates-that-actually-match-dsm-5-requirements/)
- [Psychiatric Evaluation Template & Examples](https://www.osmind.org/blog/how-to-conduct-a-comprehensive-and-efficient-initial-psychiatric-evaluation)

### Evidence-Based Treatment
- [SAMHSA Treatment Improvement Protocols](https://www.samhsa.gov/publications/treatment-improvement-protocols)
- [Measurement Based Care Principles](https://practicebetter.io/blog/top-3-mental-health-assessment-forms-for-measurement-based-care)
- [Structured Clinical Interview for DSM-5 (SCID-5)](https://www.appi.org/products/structured-clinical-interview-for-dsm-5-scid-5)

---

**Report Generated**: 2025-12-21
**Status**: Complete & Ready for Implementation Planning
**Next Step**: Validate requirements with clinical stakeholders, create detailed schema & API specifications
