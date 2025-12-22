# Research Report: Wound Care Specialty EHR Implementation

**Research Conducted**: 2025-12-21
**Status**: Complete - Ready for Implementation Planning

---

## Executive Summary

Wound care EHR implementation requires sophisticated assessment frameworks, multi-dimensional documentation, and clinical decision support integration. Research identifies five established assessment methodologies (TIME, MEASURE, PUSH, Braden, BWAT) across clinical specialties (pressure injuries, diabetic foot ulcers, venous/arterial ulcers). Implementation demands 12+ database tables, structured photo documentation with HIPAA compliance, healing progress tracking with algorithmic monitoring, and integration with WOCN Society clinical guidelines. Key deliverable: comprehensive schema supporting tissue composition tracking, infection detection, dressing selection decision trees, and risk stratification across wound types.

---

## Research Methodology

- **Sources Consulted**: 25+ authoritative sources
- **Date Range**: 2018-2025 (emphasis on 2023-2025 updates)
- **Key Search Terms**: TIME framework, MEASURE assessment, PUSH/Braden/BWAT scoring, NPUAP staging, Wagner classification, wound care EHR, photo documentation, healing tracking, clinical decision support, WOCN algorithms

---

## Key Findings

### 1. Wound Assessment Frameworks

#### TIME Framework (2002, Extended 2018)
**Structure**: Tissue - Infection/Inflammation - Moisture - Edge (+ Surrounding skin in TIMES variant)

**Components**:
- **Tissue (T)**: Assessment and debridement of non-viable/foreign material (necrotic tissue, biofilm, slough, exudate, debris)
- **Infection/Inflammation (I)**: Etiologic assessment, topical antiseptic/systemic antibiotic need, inappropriate inflammation management
- **Moisture (M)**: Exudate assessment and management (aetiology + volume control)
- **Edge (E)**: Wound edge advancement evaluation and surrounding skin assessment
- **Surrounding skin (S)**: Periwound skin condition assessment

**2018 Evolution**: TIMERS added two new elements for comprehensive modern assessment.

**Clinical Use**: Applied at every wound contact for rapid systematic assessment; primary framework for wound bed preparation principles.

**EHR Implication**: Requires five mandatory assessment sections with standardized documentation fields.

#### MEASURE Framework (2003)
**Mnemonic Structure**: Measure - Exudate - Appearance - Suffering - Undermining - Reevaluate - Edge

**Field Definitions**:
- **Measure**: Length, width, depth, area calculation (planimetry/digital tracing)
- **Exudate**: Quantity (none/scant/moderate/copious) and type (serous/sanguineous/serosanguineous/purulent)
- **Appearance**: Wound bed tissue composition (% granulation/slough/eschar), epithelial tissue, exposed structures
- **Suffering**: Pain assessment (location, severity 0-10, character: sharp/dull/throbbing)
- **Undermining**: Presence, location (clock-face orientation), depth in cm
- **Reevaluate**: Monitoring schedule (frequency based on wound type/severity)
- **Edge**: Edge condition (attached/unattached/rolled/macerated/callused) + periwound assessment

**Clinical Use**: Comprehensive initial assessment and documentation framework; standardized for inter-clinician communication.

**EHR Implication**: Seven-element documentation structure with detailed field specifications and measurement units.

### 2. Assessment Scoring Tools

#### PUSH (Pressure Ulcer Scale for Healing)
- **Score Range**: 0-17
- **Development**: Validated assessment tool widely used 2022-2025
- **Scoring Components**:
  - Wound size/area
  - Exudate amount
  - Tissue type
- **Clinical Use**: Tracks pressure injury healing progression; quick and reliable (<5 min)
- **EHR Integration**: Automated scoring calculator from three parameters

#### Braden Scale
- **Score Range**: 6-23 (lower = higher risk)
- **Risk Categories**:
  - Score ≥19: No risk
  - 15-18: Mild risk
  - 13-14: Moderate risk
  - 10-12: High risk
  - ≤9: Severe risk
- **Six Subscales**:
  1. Sensory perception (1-4 points)
  2. Moisture (1-4 points)
  3. Activity (1-4 points)
  4. Mobility (1-4 points)
  5. Nutrition (1-4 points)
  6. Friction/shear (1-3 points)
- **Primary Use**: Pressure injury risk assessment/prevention (not healing tracking)
- **Clinical Threshold**: <18 = "at risk" for PrI development
- **2024 Updates**: Registered Nurses' Association of Ontario updated guidelines for 4th edition

#### BWAT (Bates-Jensen Wound Assessment Tool)
- **Score Range**: 13-65 (higher = more severe)
- **Item Count**: 13 scored items (formerly 15-item PSST)
- **Validity**: One of most common, valid, reliable wound assessment tools for adults
- **Scoring Items**: Wound size, depth, edges, undermining, necrotic tissue type/amount, exudate type/amount, surrounding skin, granulation tissue appearance
- **Clinical Use**: Comprehensive wound healing status assessment; tracks healing trajectory
- **Frequency**: Typically weekly for acute wounds, biweekly-monthly for chronic

### 3. Wound Classification Systems

#### NPUAP Pressure Injury Staging
**Stage System** (Arabic numerals, "Injury" terminology from 2016 revision):

- **Stage 1**: Intact skin + nonblanchable erythema (localized discolored area)
- **Stage 2**: Partial thickness skin loss with exposed dermis (may appear as blister/abrasion)
- **Stage 3**: Full thickness skin loss penetrating subcutaneous tissue (NOT through fascia)
- **Stage 4**: Full thickness + tissue loss (exposed/palpable fascia, muscle, tendon, ligament, cartilage, bone)
- **Unstageable**: Full thickness obscured by eschar/slough (cannot assess depth)
- **Deep Tissue Pressure Injury (DTPI)**: Nonblanchable deep red/maroon/purple discoloration (precursor to Stage 3-4)

**Anatomical Locations Tracked**: Sacrum, coccyx, heels, ischial tuberosities, greater trochanters, malleoli (internal/external), ears, occipital regions.

#### Wagner Diabetic Foot Ulcer Classification
**Six-Grade System** (0-5):

- **Grade 0**: No open lesions (may have deformity or cellulitis)
- **Grade 1**: Superficial diabetic ulcer (partial or full thickness skin only)
- **Grade 2**: Ulcer extending to ligament, tendon, joint capsule, or deep fascia (no abscess/osteomyelitis)
- **Grade 3**: Deep ulcer with abscess, osteomyelitis, or joint sepsis
- **Grade 4**: Gangrene localized to forefoot or heel portion
- **Grade 5**: Extensive gangrene involving entire foot

**Clinical Context**: Used with vascular assessment (ABI), neuropathy screening, offloading device selection.

#### Additional Classification Systems
- **CEAP Classification** (Venous Leg Ulcers): C0-C6 severity classes
- **Fontaine/Rutherford Classification** (Arterial Ulcers): Severity stages
- **University of Texas Classification** (Diabetic Foot Ulcers): Two-axis system (depth + infection/ischemia)
- **CDC/SSI Classification** (Surgical Wounds): Superficial/deep incisional + organ/space infections

### 4. Tissue Composition Assessment

**Wound Bed Assessment Elements** (% composition):
- **Granulation Tissue**: Percentage healthy red/pink tissue (ideal = 100% for healing phase)
- **Slough**: Yellow/tan devitalized tissue percentage
- **Eschar**: Black/brown hardened tissue percentage
- **Necrotic Tissue**: Dead tissue requiring debridement
- **Epithelial Tissue**: Pink healing edges (% of wound perimeter)
- **Exposed Structures**: Bone, tendon, muscle, cartilage assessment

**Debridement Indication Triggers**:
- Any eschar present → evaluate sharp debridement need
- Slough >50% → enzymatic/autolytic debridement protocol
- Necrotic tissue → determine debridement method (sharp/enzymatic/autolytic/biological/mechanical)

### 5. Wound Characteristics Documentation

#### Exudate Assessment
- **Amount Scale**: None → Scant (minimal) → Moderate → Copious (excessive)
- **Type Classification**: Serous (clear/pale yellow) / Sanguineous (red/blood) / Serosanguineous (mixed) / Purulent (yellow/green, infectious indicator)
- **Change Tracking**: Increasing/decreasing exudate trends over time

#### Odor Assessment
- **Scale**: None → Mild → Moderate → Foul (strong malodor)
- **Clinical Significance**: Foul odor + purulent drainage = infection probability increase
- **Biofilm Association**: Persistent odor may indicate biofilm presence

#### Wound Edge Characteristics
- **Attachment**: Edges attached to wound bed (healthy) vs. unattached/rolled (delayed healing)
- **Edge Formation**:
  - Attached: Normal progression
  - Unattached: May indicate delayed epithelialization
  - Rolled/Inverted: May require intervention
  - Macerated: From excessive moisture (moisture imbalance)
  - Callused: Chronic wound indicator

#### Periwound Skin Assessment
- **Erythema**: Redness extent (distance from wound margin)
- **Edema**: Swelling presence/severity
- **Induration**: Firmness/hardness of surrounding tissue
- **Temperature**: Increased warmth (infection indicator)
- **Skin Integrity**: Breakdown, stripping, maceration from adhesive removal
- **Dermatitis**: Contact/irritant dermatitis from dressing materials

#### Pain Assessment
- **Location**: Wound bed vs. periwound vs. both
- **Severity Scale**: 0-10 Numeric Rating Scale
- **Character**: Sharp, dull, throbbing, burning, constant vs. intermittent
- **Trigger Patterns**: Pain with dressing changes, activity, pressure, or spontaneous
- **Medications**: Analgesic effectiveness tracking

### 6. Infection Detection & Management

#### Clinical Infection Indicators
- Erythema (surrounding tissue redness)
- Warmth (increased local temperature)
- Purulent drainage (yellow/green exudate)
- Increased pain (sudden onset)
- Sudden odor increase
- Increased wound size despite treatment
- Fever/systemic signs (in some patients)

#### Wound Culture Protocols
- **Tissue Biopsy**: Gold standard for culture (not swab due to contamination)
- **Swab Technique**: Compressed diagnostic (AAFB - applicator-absorb-fluid-by) for non-invasive assessment
- **Threshold for Treatment**: ≥10^5 CFU/g of tissue = clinically significant infection
- **Culture Frequency**: On infection suspicion, not routine screening for chronic wounds

#### Osteomyelitis Screening
- **Probe-to-Bone Test**: If metal probe reaches bone = presumptive osteomyelitis
- **Imaging**: X-ray assessment for bone involvement
- **Referral Criteria**: Expose bone + positive culture + imaging = vascular surgery consult

#### Antibiotic Therapy Tracking
- **Topical Antibiotics**: Indicated for infected wounds (silver, iodine products)
- **Systemic Antibiotics**: For spreading cellulitis, osteomyelitis, or systemic toxicity
- **Duration Tracking**: Document start date, antibiotic class, response assessment
- **Biofilm Management**: 4-6 week treatment cycles for chronic biofilm wounds

### 7. Healing Progress Monitoring

#### Wound Closure Rate Calculation
**Formula**: (Initial Area - Current Area) / Initial Area × 100 = % area reduction

**Expected Trajectories**:
- Pressure injuries: 10-15% weekly closure rate (positive indicator)
- Diabetic foot ulcers: 5-10% weekly closure rate
- Venous ulcers: 5-8% weekly closure rate
- Arterial ulcers: Variable (depends on revascularization)

**Stalled Wound Definition**: <5% area reduction per week for 2-4 weeks despite appropriate treatment

#### Healing Phase Assessment
1. **Hemostasis** (immediate): Clotting, fibrin deposition
2. **Inflammatory** (0-4 days): Immune response, cleanup
3. **Proliferative** (4-21 days): Granulation, collagen deposition, epithelialization
4. **Remodeling** (21+ days): Scar maturation, strengthening

**Phase-Based Expectations**:
- Week 1-2: Size reduction + increasing granulation tissue
- Week 3-4: More epithelialization visible
- Week 4+: Rapid closure if >10% weekly reduction rate

#### Complication Alerts
- **Dehiscence** (wound reopening): Size increase after stable period
- **Infection Progression**: Culture positive + systemic signs
- **Necrosis Expansion**: Increasing eschar/slough despite debridement
- **Referral Triggers**:
  - No improvement after 4 weeks standard care → specialist consult
  - Signs of vascular insufficiency → vascular surgery
  - Diabetic neuropathy complications → podiatry/endocrinology
  - Surgical site complications → surgical team notification

### 8. Treatment & Intervention Protocols

#### Debridement Methods
1. **Sharp Debridement**: Surgical removal (fastest, suitable for copious necrotic tissue)
2. **Enzymatic Debridement**: Topical enzymes (collagenase, papain) - slower, targeted
3. **Autolytic Debridement**: Moist wound environment enabling body's enzymes (slowest)
4. **Biological Debridement**: Sterile larvae therapy (for resistant biofilm/necrotic tissue)
5. **Mechanical Debridement**: Wet-to-dry dressings (older method, less preferred)

#### Dressing Selection Decision Trees
**Primary Classification**:
- **Passive/Traditional**: Gauze, non-adherent dressings (cost-effective, frequent changes)
- **Interactive/Modern**: Hydrocolloids, hydrogels, foams, alginates, films, antimicrobials
- **Active/Specialized**: Silver, iodine, honey, collagen, growth factors, bioengineered matrices
- **Negative Pressure**: VAC (Vacuum-Assisted Closure) therapy for deep/large wounds

**Selection Algorithm Factors**:
1. Wound type (pressure/diabetic/venous/arterial/surgical)
2. Wound phase (inflammatory/proliferative/remodeling)
3. Exudate level (none/scant/moderate/copious)
4. Tissue composition (eschar/slough/granulation %)
5. Infection status (clean/colonized/infected)
6. Patient tolerance (comfort, adhesive sensitivity)
7. Frequency of changes (daily/2x/weekly)

#### Specialized Wound Therapies
- **Compression Therapy**: Essential for venous ulcers (20-30 mmHg compression)
- **Offloading Devices**: Diabetic foot ulcers (reduces pressure on heel/forefoot)
- **Hyperbaric Oxygen (HBOT)**: Adjunct therapy for diabetic/arterial ulcers (improves perfusion)
- **Skin Grafting**: Full thickness wounds with large defects
- **Bioengineered Tissue**: Growth factor-containing matrices for chronic wounds
- **Negative Pressure Wound Therapy**: Large/deep wounds, high exudate, surgical dehiscence

### 9. Risk Assessment & Prevention

#### Braden Scale Risk Stratification
- **Score <18**: Implementation of pressure injury prevention protocol
- **Score 10-12**: Aggressive prevention (specialty support surfaces, turning q2h, nutrition)
- **Score ≤9**: Maximum prevention (pressure redistribution surfaces, continuous monitoring)

#### Risk Factors Systematic Assessment
1. **Nutritional Status**: Albumin level, prealbumin, BMI (affects healing capacity)
2. **Vascular Perfusion**: Pulses assessment, ABI (ankle-brachial index), TBI (toe-brachial index)
3. **Neuropathy Screening**: Monofilament testing (diabetic foot risk), protective sensation assessment
4. **Moisture Management**: Incontinence protocols, skin drying, moisture barrier application
5. **Repositioning**: Turning schedules (q2h standard), pressure relief devices
6. **Support Surfaces**: Mattress/cushion selection based on risk level + wound type

#### ABI (Ankle-Brachial Index) Interpretation
- **>0.9**: Normal perfusion (suitable for most therapies)
- **0.70-0.89**: Mild disease (use cautiously)
- **0.41-0.69**: Moderate-severe disease (arterial insufficiency likely)
- **<0.4**: Severe disease (high amputation risk, vascular surgery referral)

---

## Database Schema Requirements

### Core Tables (12+ minimum)

1. **wounds** (primary entity)
   - wound_id (PK), patient_id (FK), wound_type_id (FK), location, date_opened, date_closed
   - is_active, current_phase, healing_trajectory

2. **wound_types**
   - type_id (PK), type_name (pressure/diabetic/venous/arterial/surgical), classification_system_id
   - clinical_pathway_id, default_assessment_frequency

3. **wound_assessments** (temporal tracking)
   - assessment_id (PK), wound_id (FK), assessment_date, clinician_id (FK)
   - assessment_framework (TIME/MEASURE/custom)

4. **assessment_measurements**
   - measurement_id (PK), assessment_id (FK)
   - length_cm, width_cm, depth_cm, area_cm2, perimeter_cm
   - undermining_present, undermining_location_clock, undermining_depth_cm
   - tunneling_present, tunneling_location_clock, tunneling_depth_cm

5. **tissue_composition**
   - tissue_id (PK), assessment_id (FK)
   - granulation_percent, slough_percent, eschar_percent, necrotic_percent
   - epithelial_tissue_percent, exposed_structures (bone/tendon/muscle/cartilage)

6. **wound_characteristics**
   - char_id (PK), assessment_id (FK)
   - exudate_amount (none/scant/moderate/copious), exudate_type (serous/sanguineous/serosanguineous/purulent)
   - odor_level (none/mild/moderate/foul)
   - edge_attachment, edge_type, edge_color, maceration_present
   - periwound_erythema_distance_mm, periwound_edema, periwound_induration
   - periwound_temperature_relative (normal/warm/hot), periwound_skin_integrity

7. **pain_assessment**
   - pain_id (PK), assessment_id (FK)
   - location (wound_bed/periwound/both), severity_0_10, character, trigger_pattern
   - medication_used, analgesic_effectiveness_0_10

8. **infection_tracking**
   - infection_id (PK), assessment_id (FK), wound_id (FK)
   - clinical_infection_indicators (bitmask: erythema, warmth, purulent, pain, odor, size_increase, fever)
   - culture_date, culture_type (biopsy/swab), organism_id (FK), cfu_count
   - antibiotic_prescribed_date, antibiotic_class, duration_days, response_assessment

9. **scoring_assessments**
   - score_id (PK), assessment_id (FK)
   - push_score, braden_score, bwat_score, custom_scores
   - healing_trajectory_index

10. **wound_treatments**
    - treatment_id (PK), wound_id (FK), start_date, end_date
    - treatment_type (debridement/dressing/compression/offloading/hbot/surgical)
    - dressing_product_id (FK), change_frequency, clinical_rationale

11. **wound_photos** (HIPAA-compliant storage references)
    - photo_id (PK), wound_id (FK), assessment_id (FK), photo_date
    - photo_location_encrypted, photo_hash (for integrity), ruler_present, distance_cm
    - lighting_condition, wound_area_marked, encrypted_metadata

12. **clinical_alerts** (real-time monitoring)
    - alert_id (PK), wound_id (FK), alert_type (infection/stalled/dehiscence/referral_needed)
    - alert_severity (info/warning/critical), created_date, resolved_date, action_taken

13. **risk_assessment_results** (for prevention/progression)
    - risk_id (PK), patient_id (FK), assessment_date
    - braden_score, braden_risk_category, nutritional_status, vascular_status
    - neuropathy_screening_result, prevention_plan_id (FK)

---

## Clinical Decision Support Rules

### Healing Progress Alerts
- **Trigger**: <5% area reduction per week for 2 weeks
- **Action**: "Reassess wound care plan - consider specialist consultation"
- **Calculation**: (Previous_Area - Current_Area) / Previous_Area >= 0.05

### Infection Detection Algorithm
- **Trigger Conditions**:
  - Culture count ≥10^5 CFU/g AND clinical symptoms present
  - Purulent exudate + increased pain/odor + expanding erythema
- **Action**: "Antibiotic therapy recommended - contact prescriber"
- **Escalation**: Fever + expanding cellulitis → urgent contact

### Osteomyelitis Screening Alert
- **Trigger**: Probe-to-bone positive on assessment
- **Associated**: Diabetic foot ulcer OR pressure injury Stage 4
- **Action**: "Probable osteomyelitis - imaging + vascular surgery consult required"

### Specialty Referral Criteria
1. **Vascular Surgery**: ABI <0.7, arterial insufficiency signs, gangrene present
2. **Infectious Disease**: Multidrug-resistant organisms, persistent infection despite antibiotics
3. **Endocrinology**: Diabetic foot ulcer + poor glycemic control (A1C >8%)
4. **Podiatry**: Diabetic neuropathy with ulceration, deformity, offloading device need
5. **Surgical Consultation**: Surgical site infection, dehiscence, fascial involvement

### Dressing Selection Decision Tree
```
IF exudate_amount = copious AND wound_type = pressure THEN
  recommend_negative_pressure_therapy OR alginate_dressing
ELSEIF tissue_composition.slough_percent > 50 THEN
  recommend_enzymatic_or_autolytic_debridement
ELSEIF infection_present = true THEN
  recommend_silver_or_iodine_antimicrobial_dressing
ELSEIF exudate_amount = scant AND epithelialization_percent > 50 THEN
  recommend_film_or_hydrocolloid_dressing
ELSEIF wound_type = diabetic_foot AND neuropathy_present THEN
  recommend_offloading_device + foam_dressing
```

### Risk Stratification for Prevention
- **Braden ≤9**: Daily skin inspection + q2h turning + pressure redistribution surface
- **Braden 10-12**: q2-4h turning + support surface selection + moisture management
- **Braden 13-14**: Positioning schedule + assess support surfaces
- **Braden ≥15**: Standard care + education on risk

---

## Photo Documentation Standards

### HIPAA-Compliant Storage Requirements
- Encryption at rest (AES-256 minimum)
- Encrypted in transit (TLS 1.2+)
- Separate database for encrypted reference pointers
- Immutable audit trail of access
- Automatic purge/retention policies per regulations
- De-identified file naming (hash-based, no patient identifiers)

### Technical Specifications
- **Distance Consistency**: Standardized 30cm from wound surface
- **Ruler Inclusion**: Measurement scale visible in frame (ANSI standard, 1cm markings)
- **Lighting**: Standardized (natural light preferred, avoid shadows, consistent angle)
- **Angle**: Perpendicular to wound surface (90-degree approach)
- **Field of View**: Include wound margins + 2-3cm periwound area
- **Frequency**: Baseline → weekly (acute/infected) → biweekly (stable) → monthly (chronic)

### Metadata Captured
- Assessment_date, clinician_id, wound_id, location_anatomical
- Camera_distance, ruler_visible, lighting_conditions
- Photo_quality_score (for ML processing readiness)
- Comparison_baseline_photo_id (for tracking progression)

### Healing Progression Visualization
- Overlay comparison (side-by-side baseline → current)
- Area calculation from photo (with planimetry tools)
- Tissue type color analysis (granulation red vs. slough yellow vs. eschar black)
- Perimeter tracing for measurement verification

---

## Wound Assessment Flow (Clinical Workflow)

### Phase 1: Initial Assessment (Day 0)
1. Open wound form → Time/MEASURE frameworks
2. Photograph wound (baseline reference)
3. Complete tissue composition assessment
4. Perform scoring (PUSH/Braden/BWAT per wound type)
5. Document infection indicators + culture if indicated
6. Risk assessment (Braden) if pressure injury concern
7. Create treatment plan + dressing selection
8. Schedule follow-up assessment

### Phase 2: Acute Phase (Days 1-7)
1. Reassess frequency: Daily to q48h depending on severity
2. Track exudate changes, tissue progression
3. Monitor pain + adjust analgesics
4. Adjust dressing based on exudate level
5. Document debridement schedule
6. Check healing trajectory (target: 10-15% weekly closure)

### Phase 3: Proliferative Phase (Weeks 2-4)
1. Assessment frequency: 2-3x per week
2. Track granulation tissue increase (goal: approach 100%)
3. Monitor epithelialization at edges
4. Adjust dressing to moist but not macerated environment
5. Calculate healing rate at week 2 → alert if <5% reduction

### Phase 4: Remodeling Phase (Weeks 4+)
1. Assessment frequency: Weekly or biweekly
2. Monitor scar maturation + skin strength
3. Track tensile strength development (gradual loading)
4. Plan discontinuation of wound care when closed
5. Document complete closure with date + final photo

---

## Integration Points

### PACS Integration
- Wound photography integration with radiology PACS
- X-ray/imaging correlation for osteomyelitis assessment
- MRI for deep tissue involvement assessment
- Vascular studies (ABI, duplex ultrasound) linked to wound record

### Consultation Management
- Vascular surgery ordering + tracking within wound module
- Infectious disease consults with culture results auto-population
- Podiatry referrals for diabetic foot ulcers
- Endocrinology integration for glycemic control tracking
- Surgical team notification for surgical site complications

### Nutrition Consults
- Albumin/prealbumin trending
- Caloric/protein requirement calculations
- Integration with dietary services
- Healing capacity assessment based on nutritional status

### Lab Integration
- Automated culture result population
- Hemoglobin/albumin trending
- Glucose trending (for diabetic ulcers)
- Antibiotic sensitivity reporting

---

## Implementation Priorities

### Phase 1: Core Data Model (Foundation)
1. Wound entity + classifications
2. Assessment frameworks (TIME/MEASURE/PUSH)
3. Measurement tables + tissue composition
4. Photo reference storage (encrypted)
5. Scoring calculators (Braden/PUSH/BWAT)

### Phase 2: Clinical Workflows
1. Initial assessment workflow
2. Dressing selection decision support
3. Healing progress monitoring + alerts
4. Infection detection rules
5. Risk stratification (Braden-based prevention)

### Phase 3: Advanced Features
1. PACS integration
2. Consultation tracking
3. Lab result automation
4. AI-powered measurement from photos (planimetry)
5. Healing prediction modeling

### Phase 4: Analytics & Reporting
1. Healing rate dashboards
2. Specialist referral outcomes
3. Complication tracking
4. Evidence-based guideline compliance
5. Outcome benchmarking against WOCN standards

---

## Evidence-Based Guidelines Referenced

- **WOCN Society**: Clinical tools, algorithms, core curriculum
- **NPUAP** (National Pressure Ulcer Advisory Panel): Pressure injury staging + prevention
- **RNAO** (Registered Nurses' Association of Ontario): 2024 4th edition pressure injury guidelines
- **AHRQ**: Pressure ulcer risk assessment best practices
- **Wound Healing Society**: Chronic wound healing trajectories
- **US Wound Registry**: Real wound data for CDS algorithms

---

## Unresolved Questions

1. **Photo AI Analysis**: What level of automated wound measurement accuracy is required for clinical safety? (Need validation study)
2. **Healing Prediction**: Can machine learning models accurately predict healing trajectory at week 1-2 to guide early intervention?
3. **Integration Scope**: Should PACS integration include full imaging repository or photo-only link?
4. **Specialist Routing**: Which wound characteristics should trigger automatic specialist routing vs. clinical judgment?
5. **Metadata Retention**: What is the recommended retention period for encrypted photo metadata post-closure?
6. **Multi-Wound Tracking**: How should patients with multiple concurrent wounds be tracked (individual workflows or consolidated dashboard)?
7. **Biofilm Detection**: Are there non-invasive clinical indicators (beyond culture) that reliably detect biofilm for EHR alert rules?

---

## Research Sources

### Assessment Framework Literature
- [Extending the TIME concept: what have we learned in the past 10 years? - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7950760/)
- [Wound bed preparation from a clinical perspective - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3495367/)
- [Wound Assessment - StatPearls - NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK482198/)
- [MEASURE: A proposed assessment framework - PubMed](https://pubmed.ncbi.nlm.nih.gov/15230830/)

### Scoring Tools & Clinical Research
- [Bates-Jensen Wound Assessment Tool - RehabMeasures](https://www.sralab.org/rehabilitation-measures/bates-jensen-wound-assessment-tool)
- [Pressure Injuries Long-Term Care Best Practices - RNAO](https://ltctoolkit.rnao.ca/clinical-topics/pressure-ulcer/pressure-ulcers)
- [PUSH Score & Braden Scale - SciELO Brazil](https://www.scielo.br/j/tce/a/bc4HTDK5BXcFQrygJhdjKQj/)

### Classification Systems
- [Wound Assessment Tools: PUSH, NPUAP, Wagner - WoundSource](https://www.woundsource.com/blog/wound-assessment-tools-basic-introduction-push-npuap-and-wagner)
- [Wagner Grading & NPUAP Staging Comparison - PubMed](https://pubmed.ncbi.nlm.nih.gov/37079792/)
- [NPUAP Pressure Injury Staging - Medscape](https://reference.medscape.com/calculator/186/national-pressure-ulcer-advisory-panel-staging-system-npuap)
- [Revised NPUAP Pressure Injury Staging - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5098472/)

### EHR Implementation & CDS
- [Wound Care EMR/EHR Software - OmniMD](https://omnimd.com/specialties/wound-care/)
- [WoundExpert EHR - Net Health](https://www.nethealth.com/wound-expert-ehr/)
- [Best Practices for Wound Assessment & Documentation - WCEI](https://blog.wcei.net/best-practices-wound-assessment-documentation)
- [Wound Care Documentation: The New Rules - Net Health](https://www.nethealth.com/blog/new-rules-wound-care-documentation/)
- [Digital Wound Care - eKare AI](https://ekare.ai/)

### Clinical Algorithms & WOCN
- [WOCN Clinical Tools](https://www.wocn.org/education-resources/professional-resources/clinical-tools/)
- [WOCN Algorithm Platform](https://algorithm.wocn.org/)
- [SOLUTIONS® Wound Care Algorithm - NGC](https://jesse.tg/ngc-archive/summary/10274)
- [Wound Care Algorithms Validation Study - PubMed](https://pubmed.ncbi.nlm.nih.gov/20424292/)
- [Wound Care Five Evidence-Based Practices - American Nurse](https://www.myamericannurse.com/wound-care-five-evidence-based-practices/)

### Machine Learning & CDS
- [Machine Learning for Lower Extremity Wound Decisions - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7720796/)
- [Decision Support for Wound Care & HBO - WoundReference](https://woundreference.com/)
- [Models in Clinical Decision Support for Chronic Wounds - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6238865/)
- [MD Anderson Wound Care Algorithm](https://www.mdanderson.org/documents/for-physicians/algorithms/clinical-management/clin-management-wound-care-web-algorithm.pdf)

---

**Report Completed**: 2025-12-21
**Ready for**: Implementation Planning & Feature Specification
