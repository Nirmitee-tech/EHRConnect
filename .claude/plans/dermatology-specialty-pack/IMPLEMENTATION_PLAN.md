# Dermatology Specialty Pack - Implementation Plan

**Plan Name**: dermatology-specialty-pack
**Created**: December 21, 2025
**Status**: Ready for Development
**Research Report**: [251221-dermatology-clinical-workflows-ehr-requirements.md](./reports/251221-dermatology-clinical-workflows-ehr-requirements.md)

---

## Quick Reference

### Key Differences from OB/GYN Pack
| Aspect | OB/GYN | Dermatology |
|--------|--------|-------------|
| **Core Data** | Pregnancies, episodes | Lesions, biopsies, photos |
| **Photography** | Minimal | Extensive (clinical + dermoscopic) |
| **Assessment Tools** | EPDS, NST, BPP | PASI, SCORAD, DLQI, BSA |
| **Procedures** | Labor/delivery, ultrasound | Biopsy, excision, Mohs, cryo |
| **Pathology** | Fetal/newborn data | Histopathology + TNM staging |
| **Tracking** | Pregnancy timeline | Lesion mapping + surveillance |
| **Teledermatology** | Not applicable | High priority |

---

## Implementation Strategy

### Principle: Iterative Specialty Pack Development

Following OB/GYN pattern from codebase:
1. Core tables for primary entities
2. Tracking tables for sequential processes
3. Assessment tool tables with auto-calculation
4. Clinical decision support rules
5. UI components and dashboards

### Technology Stack (Reuse from OB/GYN)
- **Backend**: Node.js Express service in `ehr-api/src/services/dermatology.service.js`
- **Database**: PostgreSQL with UUID primary keys, JSONB for flexible fields
- **Frontend**: Next.js React components in `ehr-web/src/services/dermatology.service.ts`
- **Migrations**: JavaScript migration scripts in `ehr-api/src/migrations/`
- **FHIR**: Map dermatology data to FHIR resources (Observation, Specimen, DiagnosticReport)

---

## Core Tables to Implement (Priority Order)

### Tier 1: Lesion Foundation (Essential)
```
1. dermatology_lesions
   - Core lesion registry with ABCDE scoring
   - Body zone mapping
   - Status tracking

2. dermatology_lesion_photos
   - Photo metadata (DICOM-compliant)
   - Encryption specifications
   - Retention policies

3. dermatology_dermoscopy
   - Dermoscopic findings
   - Pattern classification
   - Risk assessment
```

### Tier 2: Biopsy Workflow (Critical)
```
4. dermatology_biopsies
   - Order and procedure tracking
   - Specimen identification

5. dermatology_biopsy_specimens
   - Specimen chain of custody
   - Lab tracking

6. dermatology_pathology_results
   - Histopathology findings
   - TNM staging for melanoma
   - Result communication
```

### Tier 3: Assessment Tools (High Priority)
```
7. dermatology_assessment_tools
   - Unified PASI, SCORAD, DLQI, BSA storage
   - Auto-calculation support
   - Trending capabilities
```

### Tier 4: Procedures & Operations (Medium Priority)
```
8. dermatology_procedures
   - Unified procedure tracking
   - Excision, cryotherapy, laser
   - Mohs micrographic surgery cases

9. dermatology_melanoma_staging
   - TNM staging details
   - Mutation testing results
   - Follow-up protocols
```

### Tier 5: Supporting Tables (Lower Priority)
```
10. dermatology_biopsy_follow_up
11. dermatology_patient_education
12. dermatology_care_plans
13. dermatology_teledermatology_consultations
```

---

## Database Schema Implementation

### File Structure
```
ehr-api/src/migrations/
├── add-dermatology-tier1-tables.js          # Lesions, photos, dermoscopy
├── add-dermatology-tier2-tables.js          # Biopsy workflow
├── add-dermatology-tier3-tables.js          # Assessment tools
├── add-dermatology-tier4-tables.js          # Procedures
└── add-dermatology-tier5-tables.js          # Supporting tables
```

### Key Implementation Details

**Tier 1 Migration** (`add-dermatology-tier1-tables.js`):
- ~200 lines per table (dermatology_lesions, dermatology_lesion_photos, dermatology_dermoscopy)
- Includes proper indexing strategy
- Foreign key constraints to patient_specialty_episodes
- JSONB fields for flexible data
- Encryption markers for HIPAA compliance

**Tier 2 Migration**:
- ~150 lines per table
- Specimen chain-of-custody tracking
- Lab integration fields
- Result communication workflow fields

**Tier 3 Migration**:
- Unified table for multiple assessment types
- Component scores stored as JSONB
- Clinical category lookup
- Trending capability

---

## Service Layer Implementation

### File: `ehr-api/src/services/dermatology.service.js`

**Core Methods by Module**:

#### Lesion Management
```javascript
async createLesion(patientId, episodeId, lesionData)
async updateLesion(lesionId, updates)
async getLesionsByPatient(patientId, episodeId)
async calculateABCDEScore(lesion)
async listSuspiciousLesions(organizationId)
async getBodyMapVisualization(patientId)
```

#### Photo Management
```javascript
async uploadLesionPhoto(lesionId, file, metadata)
async validatePhotoDICOMCompliance(metadata)
async encryptPhotoFile(filePath)
async getPhotosByLesion(lesionId)
async applyRetentionPolicy(photoId)
async auditPhotoAccess(photoId, userId)
```

#### Biopsy Workflow
```javascript
async createBiopsy(patientId, lesionId, biopsyData)
async trackSpecimen(biopsyId, specimenData)
async recordPathologyResult(specimenId, pathologyData)
async communicateResult(resultId, patientId, method)
async scheduleFollowUp(resultId, followUpData)
```

#### Assessment Tools
```javascript
async recordPASIAssessment(patientId, assessmentData)
async recordSCORADAssessment(patientId, assessmentData)
async recordDLQIAssessment(patientId, assessmentData)
async recordBSAAssessment(patientId, assessmentData)
async getTrendingData(patientId, toolType, months)
async generateSeverityAlerts(assessmentId)
```

#### Procedures
```javascript
async createProcedure(patientId, procedureData)
async updateProcedureStatus(procedureId, status)
async getFollowUpDueList(organizationId)
async createMoHSCase(patientId, mohsData)
```

---

## Frontend Components (React/Next.js)

### File Structure
```
ehr-web/src/components/dermatology/
├── LesionDashboard.tsx              # Main dashboard with body map
├── LesionCard.tsx                   # Individual lesion details
├── BodyMap.tsx                      # Interactive anatomical zones
├── ABCDEAssessment.tsx              # ABCDE scoring form
├── PhotoGallery.tsx                 # Lesson photo viewer
├── DermoscopyViewer.tsx             # Dermoscopic image viewer
├── BiopsyWorkflow.tsx               # Biopsy order → result
├── AssessmentCalculators.tsx        # PASI, SCORAD, DLQI, BSA
├── PathologyReportViewer.tsx        # Inline report viewer
├── ProcedureTracker.tsx             # Procedure status dashboard
└── TeledermatologyConsult.tsx       # Remote consultation interface
```

### Key Component Behaviors

**LesionDashboard**:
- Body map with clickable zones
- Color-coded ABCDE risk (green/yellow/red)
- Photo count badges
- Biopsy status indicators
- Quick action buttons (Order biopsy, Schedule follow-up, Add photo)

**PhotoGallery**:
- Timeline view of photos
- Filter by type (clinical vs dermoscopic)
- Magnification labels
- Metadata display
- Secure download (audit logged)

**AssessmentCalculators**:
- Real-time scoring as user enters data
- Historical comparison graphs
- Auto-calculation from photo analysis (if AI enabled)
- Alert highlighting for concerning scores

**BiopsyWorkflow**:
- Linear timeline: Order → Specimen → Result → Communication → Follow-up
- Specimen tracking with lab status
- Pathology report inline viewer
- Result notification preference capture

---

## Clinical Decision Support Rules

### Rule Engine Configuration

**File**: `.claude/plans/dermatology-specialty-pack/rules/`

#### Rule 1: Melanoma Suspicion
```javascript
{
  name: 'melanoma_suspicion_alert',
  trigger: 'lesion_updated',
  conditions: [
    { field: 'abcde_risk_score', operator: '>=', value: 4 },
    { field: 'biopsy_status', operator: '!=', value: 'completed' }
  ],
  OR: [
    { field: 'ugly_duckling_present', operator: '=', value: true }
  ],
  actions: [
    { type: 'CREATE_ALERT', priority: 'HIGH', message: 'Lesion meets criteria for melanoma suspicion. Recommend biopsy.' },
    { type: 'CREATE_TASK', assignee: 'ordering_provider', message: 'Review suspicious lesion - recommend urgent biopsy' },
    { type: 'NOTIFY', target: 'provider', method: 'immediate' }
  ]
}
```

#### Rule 2: Biopsy Result Communication Due
```javascript
{
  name: 'biopsy_result_communication_overdue',
  trigger: 'schedule_check',
  conditions: [
    { field: 'result_communicated_to_patient', operator: '=', value: false },
    { field: 'days_since_result_date', operator: '>=', value: 7 }
  ],
  actions: [
    { type: 'CREATE_TASK', assignee: 'ordering_provider', message: 'Contact patient with biopsy results' },
    { type: 'NOTIFY', target: 'provider', method: 'email' }
  ]
}
```

#### Rule 3: PASI Disease Flare
```javascript
{
  name: 'pasi_disease_flare',
  trigger: 'assessment_completed',
  conditions: [
    { field: 'assessment_type', operator: '=', value: 'pasi' },
    { field: 'new_score_minus_prior_score', operator: '>', value: 10 }
  ],
  actions: [
    { type: 'CREATE_ALERT', priority: 'MEDIUM', message: 'Significant psoriasis flare detected' },
    { type: 'CREATE_RECOMMENDATION', message: 'Consider systemic therapy evaluation' }
  ]
}
```

---

## HIPAA Compliance Strategy

### Photo Management Encryption
```
Implementation:
- Use AWS S3 with AES-256 encryption at rest
- Enable default encryption on bucket
- TLS 1.3 enforced for all transfers
- CloudFront with HTTPS for delivery
- Signed URLs expire after 1 hour

Database:
- file_path field marked ENCRYPTED in schema
- Use Sequelize encryptedField or Vault integration
- Audit logging of all access attempts
```

### Audit Trail for PHI Access
```
Log every access to:
- Photo views (lesion_id, user_id, timestamp)
- Pathology result views
- Patient data downloads
- Attempted unauthorized access

Retention: 6 years minimum
```

### Data Classification
```
PII + PHI (Highest):
- Lesion photos (especially if face/identifiable areas)
- Patient names in pathology reports

PHI (High):
- Pathology results
- Assessment scores
- Biopsy indication/findings

Standard Data (Medium):
- Clinical procedure codes
- Assessment tool names
- System configuration
```

---

## Integration Points

### External Lab Integration
```
Inbound:
- Pathology results via HL7 ORU^R01 messages
- Specimen tracking updates
- Status notifications (received, processed)

Outbound:
- Biopsy orders via HL7 ORM^O01 messages
- Specimen information
- Clinical history
```

### FHIR Mapping
```
Lesion → Observation (Clinical Finding)
Biopsy → Specimen + Procedure
Pathology → DiagnosticReport
Photos → Media (Observation)
Assessment → Observation (Score)
```

---

## Testing Strategy

### Unit Tests
- Assessment calculator logic (PASI, SCORAD formulas)
- ABCDE scoring algorithm
- Photo encryption/decryption
- Audit logging

### Integration Tests
- Lesion → Biopsy → Pathology workflow
- Assessment tool scoring and trending
- Clinical decision support rule execution
- Lab result import

### Performance Tests
- Photo upload/download with encryption
- Body map rendering with 50+ lesions
- Assessment trending queries (5+ years data)
- Dashboard load times

### Security Tests
- Photo access audit logging
- Encryption at rest verification
- Unauthorized access prevention
- Data retention policy enforcement

---

## Success Metrics

### Completion Criteria

**Tier 1 Complete** (Week 2-3):
- ✅ Core tables created and indexed
- ✅ Photo upload with HIPAA compliance
- ✅ Body map visualization
- ✅ ABCDE scoring calculator

**Tier 2 Complete** (Week 4-5):
- ✅ Biopsy workflow end-to-end
- ✅ Lab integration working
- ✅ Pathology result import
- ✅ Result communication tracking

**Tier 3 Complete** (Week 6):
- ✅ All assessment tools with calculators
- ✅ Trending dashboard
- ✅ Auto-alert rules

**Tier 4 Complete** (Week 7-8):
- ✅ Procedure tracking
- ✅ Mohs case management
- ✅ Follow-up scheduling

### Performance Benchmarks
- Dashboard load: <2 seconds
- Photo upload: <10MB in <30 seconds
- Assessment calculation: <100ms
- Query 5 years of assessments: <500ms

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Photo storage performance at scale | Medium | High | Use CDN, optimize image formats, implement pagination |
| Lab integration fragmentation | High | Medium | Start with top 3 labs, create HL7 adapter pattern |
| HIPAA compliance gaps | Low | Critical | Third-party security audit, detailed checklist |
| Assessment calculator errors | Medium | Medium | Implement formula validation tests, clinical review |
| Photo metadata loss during import | Medium | Medium | Extract DICOM headers, validate completeness |

---

## File Locations Summary

**Research Report**:
- `/Users/developer/Projects/EHRConnect/.claude/plans/dermatology-specialty-pack/reports/251221-dermatology-clinical-workflows-ehr-requirements.md`

**Implementation Plan** (This File):
- `/Users/developer/Projects/EHRConnect/.claude/plans/dermatology-specialty-pack/IMPLEMENTATION_PLAN.md`

**Database Migrations** (To Be Created):
- `ehr-api/src/migrations/add-dermatology-tier1-tables.js`
- `ehr-api/src/migrations/add-dermatology-tier2-tables.js`
- etc.

**Backend Service** (To Be Created):
- `ehr-api/src/services/dermatology.service.js`
- `ehr-api/src/routes/dermatology.js`

**Frontend Components** (To Be Created):
- `ehr-web/src/components/dermatology/`
- `ehr-web/src/services/dermatology.service.ts`

**Clinical Rules** (To Be Created):
- `.claude/plans/dermatology-specialty-pack/rules/`

---

## Next Steps

1. **Review Research Report** - Validate clinical workflows and data model against local practices
2. **Approve Implementation Plan** - Confirm timeline, resource allocation, priority order
3. **Create Tier 1 Migrations** - Start with lesions, photos, dermoscopy tables
4. **Build Backend Service** - Implement CRUD operations and core business logic
5. **Create Frontend Components** - Build UI for lesion management and dashboards
6. **Implement Clinical Rules** - Deploy decision support alerts
7. **Lab Integration** - Configure pathology result imports
8. **Security Audit** - Verify HIPAA compliance before production

---

**Status**: Ready for implementation approval
**Estimated Timeline**: 8 weeks (iterative sprints)
**Resource Requirement**: 1-2 full-stack developers, 1 clinical advisor for validation
