# Pediatrics Specialty Pack Research - Executive Summary

**Research Date**: December 21, 2025
**Status**: Completed & Documented
**Documents**: 2 comprehensive reports generated

---

## Quick Facts

| Category | Value |
|----------|-------|
| **Database Tables Required** | 28 core tables |
| **Clinical Workflow Phases** | 4 phases (Newborn → Adolescent) |
| **Age Coverage** | Birth to 18 years (21 years optional) |
| **Well-Visit Types** | 22+ distinct visit types |
| **Vaccine Types** | 23+ vaccine types (CDC/ACIP 2024) |
| **Assessment Tools** | 12+ standardized instruments |
| **FHIR Questionnaires** | 20+ forms required |
| **Integration Points** | 5 major (OB/GYN maternal linkage, scheduling, rules, forms, templates) |
| **Geographic Scope** | USA (AAP/CDC focus; state variations for newborn screening) |

---

## Key Findings

### 1. Vital Workflow Phases

**Phase 1: Newborn (Birth-1 Month)**
- Hospital birth record linkage to maternal OB/GYN
- Newborn screening (heel stick, 24-48 hours)
- Jaundice assessment (AAP phototherapy guidelines)
- Initial feeding assessment
- Apgar/vital signs documentation
- Critical: Maternal delivery complications → neonatal care decisions

**Phase 2: Infant (1-12 Months)**
- 6 well-visits per AAP Bright Futures schedule
- Growth monitoring (WHO standards for <24mo)
- Immunizations (6 vaccine visits with CDC/ACIP 2024 schedule)
- Denver II developmental screening at 9 months
- Hearing/vision screening at 12 months

**Phase 3: Early Childhood (1-5 Years)**
- 7 well-visits with age-specific assessments
- Transition to CDC growth charts at age 2
- Lead screening mandatory (12, 24 months per CDC)
- TB risk assessment
- Autism screening (M-CHAT at 18-24 months)
- ASQ-3 developmental screening at 18, 30 months

**Phase 4: School & Adolescent (6-18 Years)**
- Annual well-visits with increasing complexity
- HEADSS assessment beginning age 13 (Home, Education, Activities, Drugs, Sexual, Suicide/mood)
- Mental health screening (depression, anxiety, suicidality)
- Sexual health assessment
- Substance use screening (CRAFFT tool age 13+)
- Sports physicals
- Immunization catch-up (HPV, meningococcal, COVID-19)

### 2. Vital Signs Standards (Age-Dependent)

| Age | Heart Rate | Respiratory | SBP | DBP |
|-----|-----------|------------|-----|-----|
| **Newborn** | 100-160 | 30-60 | 60-90 | 20-60 |
| **6mo** | 100-160 | 25-40 | 80-100 | 55-65 |
| **2y** | 90-150 | 20-30 | 95-105 | 60-70 |
| **5y** | 80-120 | 20-25 | 95-110 | 60-75 |
| **10y** | 70-110 | 18-22 | 100-120 | 60-75 |
| **16y** | 60-100 | 12-20 | 100-135 | 65-85 |

**Clinical Implementation**: Age-dependent thresholds critical for alerting; context (crying, activity) matters more than absolute values.

### 3. Growth Standards

**WHO (Birth to 2 Years)**
- Weight-for-age, length-for-age, head circumference percentiles
- Use recumbent length measurement
- Critical for early malnutrition/failure-to-thrive detection

**CDC (2-20 Years)**
- Height-for-age, weight-for-age, BMI-for-age percentiles
- Use standing height after age 2
- Extended BMI charts (2022) include up to 99.99th percentile

**BMI-for-Age Categories** (age/sex-specific):
- Underweight: <5th percentile
- Healthy: 5th-<85th percentile
- Overweight: 85th-<95th percentile
- Obese: ≥95th percentile
- Severely obese: ≥120% of 95th percentile

**Database Implementation**: Store Z-scores, percentiles, and growth velocity; trigger alerts for crossing percentile lines downward or extreme values.

### 4. Immunization Management (CDC/ACIP 2024)

**Major Vaccine Groups**:
- **Infancy**: HepB (birth, 1-2mo, 6-18mo), RV (2,4,6mo), DTaP (2,4,6mo, 15-18mo, 4-6y), Hib, PCV, IPV, IIV, MMR, VAR, HepA
- **2024 Updates**: Meningococcal (Penbraya) ages 10-25y serogroups A,B,C,W,Y; Updated pneumococcal recommendations (PCV15, PCV20, PPSV23)
- **Adolescent**: HPV, Meningococcal, COVID-19 catch-up boosters

**Database Requirements**:
- Track vaccine type, dose number, administration date, lot number
- Manage medical/immunological contraindications
- Generate catch-up schedules for delayed vaccinations
- Interface with state immunization registries (IIS)

**Clinical Decision Support**: Auto-alert when vaccines overdue beyond grace period (typically 4 weeks after scheduled date).

### 5. Developmental Screening (Denver II Framework)

**4 Assessment Domains**:
1. **Gross Motor**: Rolling, sitting, standing, walking, running, hopping
2. **Fine Motor-Adaptive**: Grasping, pinching, stacking, scribbling, drawing
3. **Language**: Cooing, babbling, words, phrases, sentences
4. **Personal-Social**: Smiling, waving, playing, sharing, toilet training

**AAP Recommended Screening Ages**: 9, 18, 30 months (Denver II, ASQ-3)

**Delay Definition**: >2 months behind age-expected milestones triggers referral to early intervention.

**Autism Screening**: M-CHAT at 18-24 months (specific questions about social reciprocity, joint attention).

**Database Implementation**: Store screening tool results, item-level pass/fail, age-adjusted interpretation, and auto-trigger early intervention referral for delays.

### 6. HEADSS Adolescent Assessment (Ages 13+)

**6-Domain Screening Framework**:
- **H**ome: Family relationships, safety, substance use in home
- **E**ducation: School performance, attendance, learning disabilities
- **A**ctivities: Extracurricular, peer relationships, gang involvement
- **D**rugs/Alcohol/Tobacco: Current use, frequency, age of first use
- **S**exual History: Relationship status, contraception, STI risk, assault history
- **S**uicide/Self-Harm/Mood: Ideation, attempts, self-harm, depression/anxiety

**Risk Stratification**:
- **Low**: No major concerns, protective factors present
- **Moderate**: 1-2 risk factors, manageable with counseling
- **High**: Multiple risk factors, requires intervention + close follow-up
- **Immediate**: Active suicidal ideation + plan, requires crisis intervention

**Clinical Implementation**: Template-based documentation with cascading logic; immediate referral for high/immediate risk; safety planning protocol.

### 7. Newborn Screening Programs

**Mandatory Core Panel** (all states):
- Sickle cell disease, congenital hypothyroidism, PKU, galactosemia, MSUD, homocystinuria, biotinidase, MCADD

**Extended Screening** (most states):
- Cystic fibrosis, spinal muscular atrophy, SCID, 30+ additional conditions via tandem mass spectrometry

**Timeline**: Heel stick at 24-48 hours, confirmatory testing 1-2 weeks, long-term follow-up per condition.

**Key Implementation**: Automate newborn screening order from delivery record; track specimen collection, result receipt, confirmatory testing, and follow-up.

### 8. Assessment Tools & Screening Instruments

| Age | Tool | Purpose | Frequency |
|-----|------|---------|-----------|
| **18-24mo** | M-CHAT | Autism screening | Once at 18-24mo |
| **2-60mo** | ASQ-3 | Developmental delay | At 2-month intervals |
| **All ages** | Denver II | Developmental milestones | 9, 18, 30mo |
| **6mo+** | Lead screen | Lead exposure | 12, 24mo minimum |
| **12mo+** | TB risk | TB exposure | Annual |
| **3-17y** | NICHQ Vanderbilt | ADHD symptoms | Pre-school/school referral |
| **13+** | HEADSS | Psychosocial risk | Annual |
| **13+** | PHQ-9 Modified | Depression/suicide | Annual + concern |
| **13+** | CRAFFT | Substance use risk | Annual + concern |

### 9. Bright Futures Periodicity Schedule (AAP 2024)

**22 Well-Visit Age Groups**:
- Newborn (birth, 3-5d, 7-10d)
- Infant (1mo, 2mo, 4mo, 6mo, 9mo, 12mo)
- Early childhood (15mo, 18mo, 2y, 2.5y, 3y, 4y, 5y)
- School age (6y entry, annual 7-12y)
- Adolescent (annual 13-18y)

**Each Visit Includes**:
- Physical examination (age-appropriate)
- Growth assessment
- Developmental/behavioral screening (selected ages)
- Vital signs
- Hearing/vision screening (selected ages)
- Immunizations (per CDC/ACIP schedule)
- Anticipatory guidance & parent education

### 10. Integration with Maternal OB/GYN Records

**Baby Linkage at Delivery**:
- Import gestational age, birth weight, delivery method
- Flag maternal complications affecting neonatal care
- Import newborn status (APGAR, resuscitation)
- Track maternal infections requiring neonatal prophylaxis

**Postpartum Continuity**:
- Mother's mental health (PPD) → watch for mother-infant bonding issues
- Breastfeeding support → coordinate between OB/GYN and pediatrics
- Maternal recovery complications → affect infant care arrangements

---

## Database Tables: Quick Reference (28 Tables)

### Core Demographics & Status
1. `pediatric_patient_demographics` - Birth info, linkage to mother
2. `pediatric_growth_records` - Weight/length/HC with percentiles
3. `pediatric_vital_signs` - Temperature, HR, RR, BP by visit
4. `pediatric_allergies` - Medication/food allergies
5. `pediatric_medications` - Current medications & prescriptions
6. `pediatric_medical_history` - Diagnoses with ICD-10
7. `pediatric_family_history` - Genetic/hereditary conditions
8. `pediatric_social_determinants` - Housing, food security, insurance

### Well-Visits & Encounters
9. `pediatric_well_visits` - Well-visit encounters by age

### Immunizations
10. `pediatric_immunizations` - Individual vaccine records
11. `pediatric_immunization_status` - Summary of due/overdue/complete

### Newborn & Early Screening
12. `pediatric_newborn_screening` - NBS results tracking
13. `pediatric_developmental_screening` - Denver II, ASQ-3 results

### Behavioral & Mental Health
14. `pediatric_headss_assessment` - Adolescent psychosocial assessment
15. `pediatric_lead_screening` - Lead exposure results
16. `pediatric_tb_risk_assessment` - TB risk & testing
17. `pediatric_autism_screening` - M-CHAT results
18. `pediatric_behavioral_assessment` - ADHD, behavior concerns
19. `pediatric_mental_health_screening` - Depression, anxiety, suicide risk
20. `pediatric_substance_use_screening` - CRAFFT alcohol/drug screening
21. `pediatric_sexual_health_assessment` - Sexual history, STI screening

### Specialized Assessments
22. `pediatric_injury_prevention` - Car seat, helmets, safety
23. `pediatric_vision_screening` - Vision test results
24. `pediatric_hearing_screening` - Hearing test results
25. `pediatric_nutrition_assessment` - Feeding, diet, nutrition counseling
26. `pediatric_sports_physicals` - PPE clearance status

### Coordination & Tracking
27. `pediatric_vaccination_schedule_cache` - Pre-generated vaccine schedules
28. `pediatric_care_coordination` - Referrals, specialist follow-up

---

## Critical Database Features

1. **Age-Dependent Data**:
   - Store age at visit (months, years) for context
   - Flag when using wrong assessment tool (e.g., ASQ-3 for >60mo)
   - Auto-calculate age from DOB for consistency

2. **Percentile Calculations**:
   - Implement CDC LMS (Lambda-Mu-Sigma) algorithm or use lookup tables
   - Cache percentile coefficients in Redis
   - Store both percentile and Z-score

3. **Historical Tracking**:
   - Archive growth records after age 18 (rarely accessed)
   - Index on patient_id + visit_date for quick timeline queries
   - Support growth velocity calculations (weight/month, height/month)

4. **Multi-Tenant Isolation**:
   - All pediatric tables include org_id foreign key
   - Enforce organization-level access controls

5. **FHIR Compliance**:
   - Map pediatric tables to FHIR resources (Observation, Condition, Procedure, QuestionnaireResponse)
   - Immunizations → FHIR Immunization resource
   - Vital signs → FHIR Observation resource

---

## FHIR Questionnaires: Template Count

- **Well-Visit Forms**: 8 (by age group: 0-3d, 7-10d, 1mo, 2mo, 4mo, 6mo, 9mo, 12mo, 15mo, 18mo, 2y, 3y, 4y, 5y, 6y, annual 7-12y, annual 13-18y)
- **Developmental Screening**: 3 (Denver II, ASQ-3, M-CHAT)
- **HEADSS Assessment**: 1 (comprehensive 6-domain)
- **Mental Health**: 2 (PHQ-9 Modified, CRAFFT)
- **Specialized**: 6 (lead screening, TB risk, autism, behavior, nutrition, injury prevention)

**Total**: 20+ questionnaires needed

---

## Clinical Decision Support Rules

**Critical Rules** (minimum 8):
1. Growth velocity abnormality → flag failure to thrive
2. Developmental delay → auto-refer to early intervention
3. Immunization overdue → schedule appointment, notify parent
4. High-risk HEADSS → safety plan + mental health referral
5. Suicidal ideation + plan → crisis intervention + parent notification
6. Lead elevation → follow-up testing + environmental assessment
7. Positive autism screening → developmental specialist referral
8. ADHD symptoms → behavioral assessment + provider review

---

## Implementation Phases

### Phase 1: Core (2 weeks)
- Database schema (28 tables)
- Service layer (growth, immunizations, core assessments)
- Unit tests

### Phase 2: API & Forms (2 weeks)
- REST API endpoints (6 route files)
- FHIR Questionnaires (20+ templates)
- Integration tests

### Phase 3: Frontend (2 weeks)
- Dashboard components
- Well-visit forms
- Growth charts
- Immunization tracking

### Phase 4: CDS & Automation (1 week)
- Configure 8+ rules
- Safety planning workflow
- Referral automation

### Phase 5: Integration & Testing (1-2 weeks)
- OB/GYN maternal linkage
- State immunization registry interface
- Clinical validation with pediatricians
- Performance optimization

---

## Key Differences from OB/GYN Pack

| Aspect | OB/GYN | Pediatrics |
|--------|--------|-----------|
| **Duration** | 9-10 months (pregnancy) | 18+ years (entire childhood) |
| **Primary Focus** | Pregnancy episodes | Age-stratified development |
| **Vital Signs** | Adult ranges | Age-dependent ranges (varies 2x) |
| **Growth Tracking** | Weight gain targets | Percentile-based (WHO/CDC) |
| **Key Assessments** | EPDS, labor/delivery | Denver II, HEADSS, immunizations |
| **Immunizations** | Postpartum only | Core clinical function (22+ vaccines) |
| **Risk Screening** | Pregnancy complications | Suicide, substance abuse, sexual health |
| **Maternal Linkage** | Primary focus (pregnancy) | Integration point (newborn linkage) |
| **Patient Autonomy** | Limited (patient primary) | Evolves (parent → teen → adult) |

---

## Unresolved Questions for Implementation

1. **State Newborn Screening Variation**: Support all 50 states (60+ different condition panels) or start with national core panel?
2. **Early Intervention (IDEA Part C)**: Integrate with specific state programs or generic referral workflow?
3. **School Records Integration**: IEP/504 plan import or separate system?
4. **Pediatric Billing Codes**: What CPT codes for developmental screening, HEADSS, counseling?
5. **Growth Chart Licensing**: Licensed CDC/WHO software or implement open-source LMS algorithm?
6. **State Immunization Registries**: Which IIS systems to integrate with initially?
7. **Telehealth Teen Consent**: Age of consent for virtual visits without parent present?
8. **Privacy Tiers**: How to balance HIPAA teen confidentiality (sensitive topics) with parental access?
9. **Adult Transition**: Workflow for transferring 18-21y patients to adult practices?
10. **Performance Benchmarks**: Growth percentile calculation acceptable latency (<100ms vs <500ms)?

---

## Quick Start Implementation Path

**Week 1**: Database schema + basic service layer
**Week 2**: API endpoints + FHIR forms
**Week 3**: Frontend UI components
**Week 4**: Clinical decision support rules
**Week 5**: OB/GYN integration + testing
**Week 6**: Clinical validation + optimization

---

## Reference Documents Generated

1. **251221-pediatric-clinical-workflows-research.md** (13,000+ words)
   - Comprehensive clinical workflow analysis
   - Complete vital signs/growth standards
   - Assessment tools & screening protocols
   - Integration points & CDS rules

2. **IMPLEMENTATION_SPECIFICATION.md** (8,000+ words)
   - Detailed database schema with SQL
   - Sample service code
   - API endpoint structure
   - Well-visit templates
   - Implementation checklist

---

## Recommendations

✅ **Immediate (MVP)**:
- Implement core 28 tables
- Build growth tracking + immunization management
- Create well-visit forms (0-2 years)
- Basic CDS rules (growth, immunizations)

✅ **Phase 2 (Expansion)**:
- HEADSS assessment (age 13+)
- Mental health screening tools
- Developmental delay referrals
- Advanced CDS rules

✅ **Phase 3 (Advanced)**:
- Newborn screening coordination
- State immunization registry integration
- Care coordination referral system
- Behavioral health tools

---

**Status**: Ready for Development Team Review
**Files Location**: `/Users/developer/Projects/EHRConnect/.claude/skills/research/plans/pediatrics-specialty-pack/`
**Next Step**: Technical architecture review + development planning
