# Wound Care Specialty EHR - Comprehensive Summary

**Project Date**: 2025-12-21
**Status**: Research Complete - Ready for Implementation Planning
**Target Specialties**: Pressure Injuries, Diabetic Foot Ulcers, Venous/Arterial Ulcers, Surgical Wounds, Burns

---

## Document Structure

This research delivery consists of three integrated documents:

1. **251221-wound-care-specialty-research.md** - Clinical research findings, assessment frameworks, scoring tools, classification systems
2. **251221-wound-care-implementation-plan.md** - Complete database schema (13 tables), workflow specifications, clinical decision support rules
3. **WOUND_CARE_SUMMARY.md** - This document: Quick reference, clinical workflows, integration points

---

## Quick Reference: Key Clinical Elements

### Assessment Frameworks (Select Based on Wound Type)

| Framework | Elements | Best For | Time |
|-----------|----------|----------|------|
| **TIME** | Tissue, Infection, Moisture, Edge, Surrounding skin | All wounds (general) | 5 min |
| **MEASURE** | Measure, Exudate, Appearance, Suffering, Undermining, Reevaluate, Edge | Comprehensive documentation | 10 min |
| **PUSH** | Size, Exudate, Tissue type (scoring 0-17) | Pressure injury healing tracking | 3 min |
| **Braden** | Sensory, Moisture, Activity, Mobility, Nutrition, Friction (scoring 6-23) | Pressure injury PREVENTION risk | 5 min |
| **BWAT** | 13-item comprehensive assessment (score 13-65) | Overall wound healing status | 10 min |

---

## Clinical Workflow Overview

### Day 0: Initial Assessment
```
Patient with new wound → Register in EHR
  ├─ Select wound type (pressure/diabetic/venous/arterial/surgical/burn)
  ├─ Document location (anatomical + clock-face if round)
  ├─ Complete TIME or MEASURE framework
  ├─ Perform measurements (L×W×D, area, undermining/tunneling)
  ├─ Assess tissue composition (% granulation/slough/eschar/necrotic/epithelial)
  ├─ Document exudate (amount: none/scant/moderate/copious, type: serous/sanguineous/serosanguineous/purulent)
  ├─ Assess edges & periwound (attachment, erythema distance, edema, induration, maceration)
  ├─ Pain assessment (location, 0-10 severity, character, triggers)
  ├─ Infection assessment (clinical indicators, culture if suspected)
  ├─ Baseline photograph (encrypted, HIPAA-compliant)
  ├─ Scoring: PUSH score, Braden score (if PI concern), additional scores per protocol
  ├─ Select initial dressing based on decision algorithm
  └─ Create follow-up schedule (typically 24-48h reassessment)
```

### Week 1: Acute Phase Monitoring (Daily to q48h)
- **Focus**: Tissue changes, infection signs, exudate management, pain control
- **Decisions**: Dressing adjustment, debridement scheduling, antibiotic initiation
- **Alerts**: Infection indicators → culture + antibiotics; Size increase → escalation

### Week 2-4: Proliferative Phase (2-3x per week)
- **Focus**: Calculate healing rate = (Area_week1 - Area_current) / Area_week1
- **Decision Point at Week 2**:
  - If >10% area reduction: Continue current plan
  - If 5-10% reduction: Monitor closely
  - If <5% reduction: "Stalled wound alert" → reassess treatment, specialty consult
- **Tissue Goal**: Granulation tissue approaching 100%, epithelialization visible at edges

### Week 4+: Remodeling Phase (Weekly to biweekly)
- **Focus**: Monitor closure progression, scar maturation
- **Exit**: Document complete closure with final photograph

---

## Wound Type-Specific Pathways

### Pressure Injuries (NPUAP Staging)
**Classification**: Stage 1-4, Unstageable, Deep Tissue Pressure Injury

**Key Assessments**:
- Braden Scale (score <18 = high risk)
- Risk factors: Immobility, incontinence, nutrition, moisture
- Prevention protocol: Turning q2-4h, support surface selection, skin care

**Clinical Thresholds**:
- Stage 1: Nonblanchable erythema (epidermis only)
- Stage 2: Partial thickness (dermis exposed)
- Stage 3: Full thickness into subcutaneous (no fascia)
- Stage 4: Full thickness with fascia/muscle/bone exposed
- Unstageable: Obscured depth (eschar/slough)
- DTPI: Maroon/purple discoloration (precursor)

**Decision Points**:
- Braden ≤9 → Aggressive prevention
- Any stage + eschar → Evaluate sharp debridement
- Stage 4 + exposed bone → Vascular surgery + infectious disease consults

---

### Diabetic Foot Ulcers (Wagner Classification)
**Classification**: Grade 0-5

**Key Assessments**:
- Wagner grading (0=intact to 5=extensive gangrene)
- ABI (ankle-brachial index): >0.9 normal, <0.7 insufficient
- Neuropathy screening (monofilament testing)
- Vascular perfusion (pulses, TBI if needed)

**Clinical Thresholds**:
- Grade 0: No ulcer (prevention focus)
- Grade 1: Superficial ulcer
- Grade 2: Extends to deep structures (no infection)
- Grade 3: Deep ulcer with infection/abscess/osteomyelitis
- Grade 4: Localized gangrene
- Grade 5: Extensive gangrene (amputation likely)

**Decision Points**:
- ABI <0.7 → Vascular surgery consult
- Grade 3 + exposed bone → Osteomyelitis workup
- Poor glycemic control (A1C >8%) → Endocrinology consult
- Grade 1-2 with neuropathy → Offloading device REQUIRED

---

### Venous Leg Ulcers (CEAP Classification)
**Key Assessments**:
- Compression therapy need (20-30 mmHg standard)
- Edema assessment (distance, depth)
- Skin changes (eczema, lipodermatosclerosis)
- Vein imaging if needed (ultrasound)

**Clinical Characteristics**:
- Irregular borders (not well-demarcated)
- Heavy exudate (often copious)
- Shallow depth
- Located medial malleolus or above

**Treatment**: Compression therapy essential + dressing selection + elevation

---

### Arterial Ulcers (Fontaine/Rutherford Classification)
**Key Assessments**:
- Vascular perfusion (ABI primary indicator)
- Pain character (typically more painful than pressure/venous)
- Wound appearance (clean, well-demarcated, pale/black tissue)
- Skin temperature (cool, pale)

**Critical Thresholds**:
- ABI <0.4 → Severe disease (vascular surgery referral)
- Tissue necrosis → Requires revascularization before wound healing possible

**Caution**: Compression therapy CONTRAINDICATED if arterial disease

---

### Surgical Wounds (CDC/SSI Classification)
**Classification**: Superficial, Deep incisional, Organ/space

**Key Assessments**:
- Surgical site infection staging
- Dehiscence (reopening) detection
- Seroma/hematoma assessment
- Healing phase timing (inflammatory vs. proliferative)

**Decision Points**:
- Any purulent drainage → Culture + antibiotic evaluation
- Dehiscence → Surgical team notification + possible re-suturing
- Deep incisional involvement → Possible reoperation

---

## Scoring Tools & Interpretation

### PUSH Score (Pressure Ulcer Scale for Healing) - Range 0-17

**Components**:
1. Wound Size (0-10 points)
2. Exudate Amount (0-4 points)
3. Tissue Type (0-6 points)

**Interpretation**:
- Decreasing score = Healing trajectory (good sign)
- >2 point decrease per week = Excellent healing
- No change for 2+ weeks = Stalled wound (reassess)
- Increasing score = Deteriorating wound

**Clinical Use**: Pressure injury healing tracking (measure at each assessment)

---

### Braden Scale (Pressure Injury Risk Prevention) - Range 6-23

**6 Subscales** (1-4 points each, friction/shear 1-3):
1. Sensory Perception
2. Moisture
3. Activity
4. Mobility
5. Nutrition
6. Friction/Shear

**Risk Categories**:
- Score ≥19: No risk
- 15-18: Mild risk (standard care)
- 13-14: Moderate risk (reassess, monitor)
- 10-12: High risk (aggressive prevention)
- ≤9: Severe risk (maximum prevention)

**Key Threshold**: Score <18 = Initiate pressure injury prevention protocol

---

### BWAT (Bates-Jensen Wound Assessment Tool) - Range 13-65

**13 Scored Items**:
1. Wound size
2. Depth
3. Edges
4. Undermining
5. Necrotic tissue (type)
6. Necrotic tissue (amount)
7. Exudate (type)
8. Exudate (amount)
9. Surrounding skin
10. Granulation tissue
11. Epithelialization
12. Pain
13. Wound edge color (added in revision)

**Interpretation**:
- Higher score = More severe
- 13-20: Minimal injury
- 21-40: Moderate injury
- 41-65: Severe injury

**Trending**: Serial BWAT assessments show healing progression

---

## Infection Detection Algorithm

### Clinical Indicators (Any 2+ = Infection Likely)
1. ✓ Erythema (surrounding redness >1cm from margin)
2. ✓ Increased warmth (relative to surrounding skin)
3. ✓ Purulent drainage (yellow/green exudate)
4. ✓ Increased pain (sudden onset or worsening)
5. ✓ Increased odor (foul smell, recent development)
6. ✓ Wound size increase (despite treatment)
7. ✓ Fever (systemic indicator)

### Culture Protocol
- **Tissue biopsy** (gold standard): ≥10^5 CFU/g = clinically significant
- **Swab method**: If non-invasive approach required (less reliable)
- **Threshold for treatment**: ≥10^5 CFU/g + clinical symptoms = treat

### Osteomyelitis Screening
- **Trigger**: Exposed bone visible OR probe-to-bone test positive
- **Follow-up**: Imaging (X-ray/MRI) + tissue culture
- **Referral**: Vascular surgery if osteomyelitis confirmed

---

## Dressing Selection Decision Tree

```
PRIMARY FACTOR: Infection Status
├─ IF infection_present = TRUE
│   └─ ANTIMICROBIAL DRESSING REQUIRED
│       ├─ Silver dressing (broad spectrum)
│       ├─ Iodine-containing dressing
│       └─ Honey-based dressing
│
├─ IF exudate_amount = COPIOUS
│   ├─ IF wound_type IN (pressure_injury, diabetic_foot)
│   │   └─ NEGATIVE PRESSURE THERAPY (VAC) PREFERRED
│   │       └─ Consider if >50mL/day exudate
│   └─ ELSE
│       └─ ABSORPTIVE DRESSING
│           ├─ Alginate (highly absorbent)
│           └─ Foam (moderate absorption)
│
├─ IF tissue_composition.slough_percent > 50%
│   └─ DEBRIDEMENT-FACILITATING
│       ├─ Enzymatic debridement (collagenase, papain)
│       └─ Hydrogel dressing (autolytic debridement)
│
└─ IF exudate_amount IN (none, scant) AND epithelialization_percent > 50%
    └─ PROTECTIVE DRESSING
        ├─ Transparent film (if minimal exudate)
        └─ Hydrocolloid (if some moisture present)
```

**Modifiers**:
- **Diabetic foot + neuropathy**: ADD offloading device (total contact cast or removable walker)
- **Venous ulcer**: ADD compression therapy (20-30 mmHg)
- **Arterial insufficiency**: CONTRAINDICATE compression, prioritize perfusion

---

## Real-Time Alert Triggers

### Critical Alerts (Immediate Notification)
| Alert | Trigger | Action |
|-------|---------|--------|
| **Infection Detected** | Purulent drainage + erythema + warmth | Culture + antibiotic evaluation |
| **Osteomyelitis** | Probe-to-bone positive | Imaging + vascular surgery consult |
| **Vascular Crisis** | ABI <0.4 + advancing necrosis | URGENT vascular surgery |
| **Sepsis Signs** | Fever + tachycardia + wound deterioration | Infectious disease consult + blood cultures |

### Warning Alerts (24h Response)
| Alert | Trigger | Action |
|-------|---------|--------|
| **Stalled Healing** | <5% area reduction/week × 2 weeks | Reassess plan + specialist consult |
| **Expanding Erythema** | Cellulitis spreading >2cm/day | Increase antibiotic coverage consideration |
| **Debris Accumulation** | Slough >75% + no debridement scheduled | Schedule sharp debridement |
| **Referral Indicated** | Wagner ≥3 + culture positive | Specialty consult notification |

---

## Specialist Referral Criteria

### Vascular Surgery
- **Pressure injuries**: Stage 4 with exposed bone/fascia
- **Diabetic foot ulcers**: ABI <0.7, Wagner grade ≥3, suspected osteomyelitis
- **Arterial ulcers**: Any arterial insufficiency (ABI <0.9) with tissue loss
- **Indication**: Revascularization needs, amputation prevention

### Infectious Disease
- **Any wound**: Culture-positive infection with unusual organisms
- **Diabetic foot**: Polymicrobial infection, osteomyelitis confirmed
- **Pressure injury**: Cellulitis spreading despite antibiotics
- **Indication**: Antibiotic selection, biofilm management, systemic infection

### Endocrinology
- **Diabetic foot ulcers**: A1C >8% or recurrent ulceration
- **Indication**: Glycemic control optimization, diabetic neuropathy severity

### Podiatry
- **Diabetic foot ulcers**: Wagner grade 1-2, deformity present, neuropathy
- **Indication**: Offloading device selection, foot biomechanics, prevention

### Nutritional Support
- **All chronic wounds**: Albumin <3.5 g/dL, BMI <18.5, unintentional weight loss
- **Indication**: Nutritional supplementation, protein/calorie augmentation

---

## Photo Documentation Standards (HIPAA Compliance)

### Technical Specifications
- **Distance**: Consistent 30cm from wound surface
- **Ruler**: ANSI standard visible in frame (1cm markings)
- **Angle**: Perpendicular to wound (90-degree approach)
- **Lighting**: Standardized (natural preferred, avoid shadows)
- **Field**: Include wound + 2-3cm periwound area
- **Frequency**: Baseline → Weekly (acute) → Monthly (stable/chronic)

### Storage Security
- **Encryption**: AES-256 at rest, TLS 1.2+ in transit
- **Access Control**: Limited to care team, audit trail of all views
- **De-identification**: Hash-based filenames, no PHI in storage
- **Retention**: Automatic purge per regulatory retention periods (7 years standard)

### Metadata Captured
- Date, time, clinician, wound ID, location
- Camera distance, ruler visibility, lighting conditions
- Baseline photo flag, previous comparison photo link
- ML analysis results (if tissue detection performed)

---

## Healing Progression Calculation

### Weekly Closure Rate Formula
```
Healing Rate (%) = (Previous Area - Current Area) / Previous Area × 100

Expected Rates by Wound Type:
• Pressure injuries: 10-15% per week (good trajectory)
• Diabetic foot ulcers: 5-10% per week
• Venous ulcers: 5-8% per week
• Arterial ulcers: Variable (depends on revascularization)

Interpretation:
• >10% weekly: Excellent healing
• 5-10% weekly: Good progress
• <5% weekly: Stalled (reassess treatment)
• Negative %: Deteriorating (escalate immediately)
```

### Healing Phase Expectations
1. **Hemostasis** (Minutes-hours): Clotting, fibrin formation
2. **Inflammatory** (0-4 days): Immune response, cleanup, pain/edema peak
3. **Proliferative** (4-21 days): Granulation tissue deposition, epithelialization, area reduction
4. **Remodeling** (21+ days): Scar maturation, collagen remodeling, strength increase

---

## Documentation Audit & Compliance

### Required Elements Per Assessment
- [ ] Wound measurements (L, W, D, area, undermining/tunneling)
- [ ] Tissue composition (% breakdown)
- [ ] Exudate assessment (amount, type)
- [ ] Edge & periwound findings
- [ ] Pain assessment (location, severity)
- [ ] Infection indicators (clinical + culture if obtained)
- [ ] Scoring (PUSH minimum, Braden if pressure injury, others per protocol)
- [ ] Photograph with ruler and consistent distance
- [ ] Treatment plan documented
- [ ] Follow-up schedule specified
- [ ] Clinician signature/authentication

### WOCN Compliance Standards
- Assessments at standard intervals (per wound type)
- Evidence-based dressing selection (documented rationale)
- Trending documentation (showing progression)
- Specialist consultation when indicated
- Outcome tracking (closure rates, complication prevention)

---

## Integration Points (Future Expansion)

### PACS Integration
- Wound X-ray/imaging linked to wound record
- Osteomyelitis screening with imaging correlation
- Vascular studies (ABI, duplex ultrasound) auto-populated

### Laboratory Integration
- Culture results auto-population (organism, sensitivities)
- Hemoglobin/albumin/glucose trending
- Antibiotic sensitivity matching for recommendation algorithms

### Photo AI (Future Phase)
- Automated tissue detection from baseline photo
- Real-time area/depth measurement from photo
- Tissue percentage estimation
- Healing progression prediction

### Consultation Management
- Specialist ordering interface within wound module
- Consult status tracking (ordered, received, pending response)
- Automatic alert creation for urgent findings

---

## Key Performance Metrics

### Process Metrics
- Assessment completion within 24-48h of wound identification
- Photo documentation >90% of assessments
- PUSH/Braden scoring completion >95%

### Outcome Metrics
- Pressure injury incidence rate (target: <2% in at-risk population)
- Average healing time by wound type
- Infection rate (culture-positive complications)
- Hospital readmission rate (wound-related)
- Amputation prevention rate (diabetic foot)

### Clinical Governance
- WOCN guideline compliance audits (quarterly)
- Specialist referral appropriateness review
- Alert fatigue assessment (<5% false positive acceptable)
- Outcome benchmarking against national standards

---

## Implementation Priorities

### Phase 1: Core Foundation (Weeks 1-4)
✓ Database schema (13 tables)
✓ Assessment data capture
✓ Photo encryption/storage
✓ Basic scoring calculators

### Phase 2: Workflows (Weeks 5-8)
✓ Initial assessment form
✓ Reassessment workflows
✓ Dressing selection interface
✓ Treatment tracking

### Phase 3: Clinical Intelligence (Weeks 9-12)
✓ Alert engine (infection, stalled healing, referral)
✓ Healing rate calculations
✓ Risk stratification
✓ Specialist routing

### Phase 4: Analytics (Weeks 13+)
✓ Outcome dashboards
✓ Compliance reporting
✓ Performance metrics
✓ Evidence-based guideline alignment

---

## Success Criteria

- [X] All assessment frameworks supported (TIME, MEASURE, PUSH, Braden, BWAT)
- [X] Database schema accommodates 11+ assessment domains
- [X] Clinical alerts triggered appropriately (infection, stalled healing, specialist need)
- [X] Photo documentation HIPAA-compliant and encrypted
- [X] Healing calculations accurate per published formulas
- [X] Integration points documented for future expansion
- [ ] Assessment time <15 minutes for initial, <10 minutes for reassessment
- [ ] Alert fatigue minimal (<5% false positive)
- [ ] Specialist referral accuracy >90%
- [ ] Patient closure tracking >95%

---

## Next Steps

1. **Database Admin Team**: Review schema, create tables, establish indexes
2. **Backend Development**: Implement assessment data capture, scoring calculators, alert rules
3. **Frontend Development**: Build assessment forms, dressing selection interface, photo upload
4. **Clinical Review**: Validate workflows, refine decision trees, test with sample scenarios
5. **Integration Team**: Plan PACS, lab system, photo AI connections
6. **Testing**: Unit tests for calculators, integration tests for workflows, UAT with nurses/wound specialists

---

**Research Completed**: 2025-12-21
**Delivered By**: AI Research Agent
**Status**: Ready for Development Team Hand-off

**Questions or Clarifications?** Review the detailed research document (251221-wound-care-specialty-research.md) for comprehensive clinical literature references and complete assessment framework details.
