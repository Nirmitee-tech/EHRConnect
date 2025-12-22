# Dermatology Specialty Pack - Research Summary

**Research Completed**: December 21, 2025
**Research Type**: Comprehensive Clinical Workflows & EHR Requirements
**Status**: Complete - Ready for Development

---

## What Was Delivered

### 1. Comprehensive Research Report
**File**: `reports/251221-dermatology-clinical-workflows-ehr-requirements.md`

Full clinical requirements including:
- **Clinical Workflow Phases**: 5-phase encounter flow (consultation → assessment → decision → intervention → follow-up)
- **Lesion Assessment Standards**: ABCDE rule with scoring, ugly duckling sign, risk calculations
- **Assessment Tools**: PASI (psoriasis), SCORAD (atopic dermatitis), DLQI (quality of life), BSA (body surface area) with formulas
- **Biopsy Workflows**: End-to-end from order → specimen → pathology → result → communication → follow-up
- **Photo Management**: HIPAA-compliant storage, DICOM metadata, encryption, retention policies
- **Disease Staging**: Melanoma TNM (AJCC 8th edition), non-melanoma staging, mutation testing
- **Procedures**: Mohs, cryotherapy, laser, excision with tracking requirements
- **Clinical Decision Support**: 7 rule templates for alerts and automation
- **Database Schema**: 15+ tables with detailed field specifications, validation rules, indexes

### 2. Implementation Plan
**File**: `IMPLEMENTATION_PLAN.md`

Actionable implementation roadmap including:
- **Tier-based approach**: 5 implementation tiers from core lesion management to supporting tables
- **Technology stack**: Reuse OB/GYN patterns (Node.js, PostgreSQL, React, FHIR)
- **Service layer design**: Detailed methods for each module
- **UI components**: 11 key React components with behaviors
- **Clinical rules configuration**: Example rule JSON for top 3 scenarios
- **Security strategy**: HIPAA compliance, encryption, audit trails
- **Testing approach**: Unit, integration, performance, security tests
- **Success metrics**: Completion criteria by tier, performance benchmarks
- **Risk mitigation**: 5 identified risks with mitigations
- **Timeline**: 8 weeks iterative development

---

## Key Research Findings

### Dermatology vs OB/GYN Differences

| Dimension | OB/GYN | Dermatology |
|-----------|--------|-------------|
| **Primary Entity** | Pregnancy episode | Lesion (mole/skin growth) |
| **Data Volume** | ~20 tables, moderate photo volume | 15+ tables, high photo volume |
| **Photography** | Optional ultrasound images | Essential (clinical + dermoscopic) |
| **Assessments** | EPDS (depression), NST (fetal) | PASI, SCORAD, DLQI, BSA |
| **Critical Path** | Prenatal → Labor → Postpartum | Lesion → Biopsy → Pathology → Treatment |
| **Compliance Risk** | Patient safety, birth outcomes | Cancer detection, HIPAA photo compliance |
| **Telemetry** | Fetal monitoring | Photo examination, remote diagnosis |

### Core Lesion Management

**ABCDE Rule with Scoring**:
- Asymmetry (0-3), Border irregularity (0-3), Color variation (1-6), Diameter (mm), Evolving (yes/no)
- Risk score calculation: Sum of components with thresholds
- Alert triggered when score ≥4

**Body Map System**:
- 12-14 anatomical zones (head, chest, back, arms, legs, hands, feet, genitalia, nails)
- Each lesion numbered sequentially for tracking
- Linkage to photos and biopsies

**Photo Management - HIPAA Critical**:
- Minimum 800x600 resolution for teledermatology
- DICOM metadata including patient ID, body part, laterality, magnification
- AES-256 encryption at rest, TLS 1.3 in transit
- Audit logging of all access
- Retention policies (3-year, 7-year, or permanent)
- Cannot be deleted per compliance requirements

### Assessment Tools

**PASI (Psoriasis)**: 0-72 scale
- Components: Redness, thickness, scaliness × 4 body regions
- Clinical thresholds: <2 (minimal), 2-10 (mild), 11-20 (moderate), >30 (severe)

**SCORAD (Atopic Dermatitis)**: 0-103 scale
- Components: Extent (% BSA), intensity (redness/edema/oozing/excoriation/lichenification), symptoms (pruritus/sleep)
- Clinical thresholds: <16 (mild), 16-40 (moderate), >40 (severe)

**DLQI (Quality of Life)**: 0-30 scale
- 10 patient-reported questions about skin disease impact
- Thresholds: 0-1 (no impact), 2-5 (small), 6-10 (moderate), 11-20 (very large), 21-30 (extreme)

**BSA (Body Surface Area)**: 0-100% scale
- ≥10% typically triggers systemic therapy consideration
- Methods: Rule of 9s, hand rule, photographic analysis

### Biopsy Tracking

**Workflow Stages**:
1. **Pre-biopsy**: Clinical photo, differential diagnosis, consent
2. **Procedure**: Punch/shave/excisional, specimen identification, anesthesia
3. **Specimen Management**: Container type, fixative, lab tracking number, shipping
4. **Pathology Processing**: Reception, processing, reporting
5. **Result Communication**: Patient notification (phone/in-person preferred), provider notification, discussion documentation
6. **Follow-Up**: Treatment plan, additional testing, surveillance

**Pathology Fields**:
- Final diagnosis, histopathologic findings
- Special stains (Melan-A, S-100, HMB-45)
- Breslow thickness (melanoma) to 0.1mm precision
- Clark level (I-V), ulceration status, mitotic rate
- TNM staging, margin status, margin distance

### Skin Cancer Staging

**Melanoma TNM (AJCC 8th Edition)**:
- **T Stage**: Based on Breslow thickness (0.8mm, 1.0mm, 2.0mm thresholds), ulceration, mitotic rate
- **N Stage**: Regional lymph node involvement (0, 1, 2-3 nodes; micro- vs macrometastasis)
- **M Stage**: Distant metastasis (skin/subcutaneous, lung, other); LDH status
- **Overall Stage**: 0-IV based on TNM combination
- **Molecular Testing**: BRAF, NRAS, KIT mutations for treatment selection

### Clinical Decision Support

**7 High-Priority Rules**:
1. Melanoma suspicion (ABCDE score ≥4 or ugly duckling)
2. PASI disease progression (flare detection)
3. Pathology malignancy alert (urgent oncology referral)
4. Biopsy result communication due (7 days overdue)
5. Follow-up assessment overdue (scheduling reminder)
6. DLQI quality of life impact (mental health referral)
7. Phototherapy eligibility (PASI >10 or SCORAD >40)

### Dermatology Procedures

**Categories**:
- **Diagnostic**: Punch, shave, excisional biopsies
- **Therapeutic**: Excision, Mohs micrographic surgery, cryotherapy, laser
- **Mohs Specific**: Stage-based specimen mapping, margin clearing tracking

**Procedure Tracking Fields**:
- Indication, location, size, anesthesia
- Duration, complications, sutures
- Infection status, scarring assessment
- Follow-up requirements

---

## Database Design Summary

### 15+ Tables Organized in 5 Tiers

**Tier 1 (Lesion Foundation)** - 3 tables
- dermatology_lesions: Core lesion registry with ABCDE scoring
- dermatology_lesion_photos: Photo metadata, encryption, HIPAA compliance
- dermatology_dermoscopy: Dermoscopic findings and risk assessment

**Tier 2 (Biopsy Workflow)** - 3 tables
- dermatology_biopsies: Biopsy order and procedure
- dermatology_biopsy_specimens: Specimen tracking and chain of custody
- dermatology_pathology_results: Histopathology findings, staging, communication

**Tier 3 (Assessment Tools)** - 1 table
- dermatology_assessment_tools: Unified PASI, SCORAD, DLQI, BSA with auto-calculation

**Tier 4 (Procedures)** - 2 tables
- dermatology_procedures: Unified procedure tracking
- dermatology_melanoma_staging: TNM staging details

**Tier 5 (Supporting)** - 6+ tables
- dermatology_biopsy_follow_up, dermatology_patient_education, dermatology_care_plans
- dermatology_teledermatology_consultations, dermatology_procedures_complications, etc.

### Index Strategy

**High-Traffic Queries**:
- `idx_lesions_patient` (patient dashboard)
- `idx_lesions_abcde_score` WHERE score ≥ 4 (suspicious lesions list)
- `idx_biopsies_status` (pending biopsy dashboard)
- `idx_pathology_breslow` (melanoma thickness trends)

**Audit & Compliance**:
- `idx_lesion_photos_date` (retention policy enforcement)
- `idx_lesions_evolving` WHERE status = TRUE (change tracking)

---

## Implementation Priorities

### Must-Have (MVP)
1. Lesion registry with ABCDE scoring
2. Photo upload with basic metadata
3. Biopsy order to pathology result workflow
4. Basic dashboard with lesion list
5. Clinical alert rules (top 3)

### Should-Have (v1.1)
1. Assessment tools (PASI, SCORAD, DLQI)
2. Trending dashboards
3. Procedure tracking
4. Teledermatology integration
5. Advanced body map visualization

### Nice-to-Have (Future)
1. AI-powered lesion analysis
2. Automated photo comparison
3. Integration with pathology lab API
4. Mobile app for patient photos
5. Molecular testing integration

---

## HIPAA Compliance Checklist

✅ **Data Classification**
- Lesion photos = PII + PHI (highest sensitivity)
- Pathology results = PHI (high sensitivity)
- Assessment scores = standard data (medium sensitivity)

✅ **Photo Storage**
- AES-256 encryption at rest (S3 default encryption)
- TLS 1.3 for all transfers
- 128-bit minimum for teledermatology
- DICOM metadata included (patient, location, laterality, magnification)

✅ **Access Control**
- Audit logging of all photo/pathology access
- User authentication with session management
- Role-based access (provider vs. staff vs. admin)

✅ **Retention**
- Automatic enforcement of retention policies
- Deletion prevented for compliant records
- 6-year audit trail retention

✅ **Data Security**
- Device access control (photos don't leave office unwiped)
- Encryption in transit for electronic communications
- Signed URLs expire after 1 hour for downloads

---

## Clinical Workflow Example: Suspicious Lesion

```
1. CONSULTATION PHASE
   Patient arrives with "new pigmented lesion on back"
   → Create new lesion record #1, body_zone='back_lower'

2. ASSESSMENT PHASE
   Provider examines lesion
   → Record: asymmetry=2, border_irregularity=3, color_variation=4, diameter=8mm, evolving=true
   → ABCDE score = 2+3+(4*0.5)+1+1 = 8.0 (HIGH RISK)
   → Capture clinical photo (body_map type)
   → Perform dermoscopy
   → Capture dermoscopic images (10x magnification)
   → Record dermoscopic findings: "asymmetric pattern, irregular dots, blue-gray areas"

3. DECISION PHASE
   Provider evaluates ABCDE score (8 ≥ 4 threshold)
   → ALERT TRIGGERED: "Melanoma suspicion - recommend biopsy"
   → System creates TASK: "Order punch biopsy from lesion #1"
   → Provider consents patient, documents indication

4. INTERVENTION PHASE
   Procedure scheduled for next week
   → Create biopsy record: type='punch', indication='evaluation of pigmented lesion for possible melanoma'
   → Procedure performed: punch_diameter=5mm, anesthesia='local_lidocaine'
   → Create specimen: container='formalin', specimen_id='LAB-2025-12345'
   → Specimen sent to external pathology lab

5. RESULT MANAGEMENT PHASE
   Lab receives specimen, processes, reports findings
   → Pathology result imported: final_diagnosis='melanoma, superficial spreading type'
   → breslow_thickness_mm=1.2, clark_level='III', ulceration_present=false, mitotic_rate=2.5
   → TNM staging calculated: T2a (1.0-2.0mm, no ulceration)
   → N0M0 assumed (clinical staging pre-sentinel node biopsy)
   → Stage IB determined

6. COMMUNICATION PHASE
   ALERT TRIGGERED: "Malignant pathology - urgent oncology referral"
   → Task created: "Contact patient with malignancy diagnosis"
   → Provider calls patient (preferred method), documents discussion
   → result_communicated_to_patient=true, communication_date=today
   → Automatic oncology referral initiated

7. FOLLOW-UP PHASE
   Follow-up plan: Sentinel node biopsy, possible wide local excision
   → Create follow-up record: treatment_category='surgical'
   → Schedule appointment with surgical oncology
   → next_assessment_date=2 weeks
```

---

## Technical Implementation Notes

### Backend Architecture
```
ehr-api/
├── services/
│   └── dermatology.service.js
│       ├── Lesion management (CRUD, ABCDE calc)
│       ├── Photo management (upload, encryption, audit)
│       ├── Biopsy workflow (order to result)
│       ├── Assessment tools (PASI, SCORAD, DLQI, BSA)
│       └── Procedure tracking
├── routes/
│   └── dermatology.js (Express endpoints)
└── migrations/
    ├── add-dermatology-tier1-tables.js
    ├── add-dermatology-tier2-tables.js
    └── ... (5 migration files total)
```

### Frontend Architecture
```
ehr-web/
├── components/dermatology/
│   ├── LesionDashboard.tsx (main interface)
│   ├── BodyMap.tsx (clickable anatomical zones)
│   ├── ABCDEAssessment.tsx (scoring form)
│   ├── PhotoGallery.tsx (clinical + dermoscopic)
│   ├── BiopsyWorkflow.tsx (order to result)
│   ├── AssessmentCalculators.tsx (PASI/SCORAD/DLQI/BSA)
│   ├── PathologyReportViewer.tsx (inline PDF)
│   ├── ProcedureTracker.tsx (tracking dashboard)
│   └── TeledermatologyConsult.tsx (remote visit)
└── services/
    └── dermatology.service.ts (API client)
```

### Database Design Principles
- UUID primary keys (consistency with OB/GYN)
- JSONB for flexible structured data (differential diagnoses, complications, etc.)
- Proper indexing for high-frequency queries
- Encryption markers for HIPAA-sensitive fields
- Foreign key constraints to maintain referential integrity
- Timestamps (created_at, updated_at) for audit trails
- org_id for multi-tenant data isolation

---

## Expected Data Model Complexity

**Comparative Analysis** (vs OB/GYN):

| Metric | OB/GYN | Dermatology | Notes |
|--------|--------|-------------|-------|
| **Core Tables** | 25 | 15+ | Dermatology has fewer but more complex biopsy tracking |
| **Photo Tables** | 1 | 1 | Similar, but dermatology has DICOM compliance requirements |
| **Assessment Tools** | 1 (EPDS) | 1 (unified) | Dermatology has 4 different scoring systems in one table |
| **Procedure Tables** | 5 | 2-3 | Simpler procedures in dermatology |
| **Average Row Complexity** | Medium | High | Dermatology has more JSONB fields for flexibility |
| **Estimated Rows/Patient/Year** | 50-100 | 200-500 | Higher lesion tracking volume |

---

## Key Decision Points for Development Team

1. **Photo Storage Backend**: AWS S3, Azure Blob, or self-hosted?
2. **Lab Integration Priority**: Which pathology labs to integrate with first?
3. **Assessment Tool AI**: Should system include automated PASI scoring from photos?
4. **Teledermatology**: Synchronous (video) or asynchronous (photo submission)?
5. **Mobile Support**: App for patient photo capture or web-only initially?
6. **Comparative Analysis**: Should system auto-detect lesion changes between visits?
7. **Mole Mapping**: Advanced segmentation/tracking or manual zones only?

---

## Resource Requirements

**Development Team**:
- 1-2 Full-stack developers (Node.js/React)
- 1 Clinical advisor (dermatologist or PA) for validation
- 1 Security/HIPAA specialist for photo handling compliance
- Database architect (can be part-time)

**Timeline**: 8-10 weeks (iterative sprints)

**Infrastructure**:
- PostgreSQL database (existing)
- Photo storage (S3 or equivalent, ~100GB minimum)
- File encryption library (NaCl, libsodium, or similar)
- External pathology lab APIs/HL7 integration

---

## Next Actions

1. ✅ **Research Complete** - Comprehensive report delivered
2. 📋 **Clinical Review** - Have dermatologist validate workflows and assessment rules
3. 🏗️ **Architecture Approval** - Approve database schema and tier-based implementation
4. 💻 **Development Kickoff** - Start Tier 1 (lesion management) implementation
5. 🧪 **Security Audit** - Third-party review of photo handling HIPAA compliance
6. 🔗 **Lab Integration** - Establish connections with pathology providers
7. 📱 **UI/UX Design** - Create mockups for lesion dashboard and assessment tools
8. 📊 **Testing Plan** - Comprehensive test strategy including security and performance

---

## Resource Files

| File | Purpose | Location |
|------|---------|----------|
| Research Report | Full clinical workflows, database schema, implementation details | `reports/251221-dermatology-clinical-workflows-ehr-requirements.md` |
| Implementation Plan | Development roadmap, sprints, timelines, technical details | `IMPLEMENTATION_PLAN.md` |
| This Summary | Executive overview and key findings | `SUMMARY.md` |

---

**Report Status**: ✅ Complete - Ready for Development Approval
**Delivery Date**: December 21, 2025
**Research Depth**: Comprehensive (25+ authoritative sources)
**Actionability**: High - Detailed implementation specifications ready
