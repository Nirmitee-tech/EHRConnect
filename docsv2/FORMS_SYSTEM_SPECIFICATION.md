# EHR Connect Forms System - Complete Specification

## Overview
FHIR SDC (Structured Data Capture) compliant forms system based on Aidbox architecture, implementing Questionnaire and QuestionnaireResponse resources with full workflow support.

---

## Architecture

### Database Schema (PostgreSQL)

#### 1. `form_templates` Table
Stores form template metadata and FHIR Questionnaire resource.

```sql
- id: UUID (PK)
- org_id: UUID (FK to organizations)
- title: VARCHAR(255)
- description: TEXT
- status: ENUM('draft', 'active', 'retired', 'archived')
- version: VARCHAR(50)
- questionnaire: JSONB (Full FHIR Questionnaire)
- fhir_url: TEXT (Canonical URL)
- category: VARCHAR(50)
- tags: TEXT[]
- specialty_slug: VARCHAR(100)
- theme_id: UUID (FK to form_themes)
- created_by, updated_by: UUID
- created_at, updated_at, published_at, archived_at: TIMESTAMP
- parent_version_id: UUID (FK self-reference)
- is_latest_version: BOOLEAN
- usage_count: INTEGER
- last_used_at: TIMESTAMP
```

#### 2. `form_responses` Table
Stores completed form responses with FHIR QuestionnaireResponse.

```sql
- id: UUID (PK)
- org_id: UUID (FK to organizations)
- form_template_id: UUID (FK to form_templates)
- response: JSONB (Full FHIR QuestionnaireResponse)
- patient_id: UUID
- encounter_id: UUID
- episode_id: UUID
- practitioner_id: UUID
- status: ENUM('in-progress', 'completed', 'amended', 'entered-in-error')
- submitted_by: UUID
- submitted_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

#### 3. `form_themes` Table
Reusable styling themes for form presentation.

```sql
- id: UUID (PK)
- org_id: UUID (FK to organizations, nullable for global)
- name: VARCHAR(100)
- is_global: BOOLEAN
- config: JSONB (colors, fonts, inputs, buttons, branding)
```

#### 4. `form_population_rules` Table
Rules for pre-populating forms with existing data ($populate operation).

```sql
- id: UUID (PK)
- form_template_id: UUID (FK)
- name: VARCHAR(255)
- source_type: VARCHAR(50) (Patient, Observation, Condition, etc.)
- source_query: TEXT (FHIRPath or SQL)
- target_link_id: VARCHAR(255)
- transform_expression: TEXT
- priority, enabled
```

#### 5. `form_extraction_rules` Table
Rules for extracting data from responses to FHIR resources ($extract operation).

```sql
- id: UUID (PK)
- form_template_id: UUID (FK)
- name: VARCHAR(255)
- source_link_id: VARCHAR(255)
- target_resource_type: VARCHAR(50) (Observation, Condition, etc.)
- fhir_path: TEXT
- value_transformation: TEXT
- condition_expression: TEXT
- priority, enabled
```

#### 6. `form_audit_log` Table
Audit trail for all form operations.

---

## FHIR SDC API Endpoints

### 1. Form Template Management

#### List Templates
```
GET /api/forms/templates
Query Params:
  - org_id: UUID
  - status: draft|active|archived
  - category: string
  - specialty_slug: string
  - tags: string[] (comma-separated)
  - search: string (title/description search)
  - page, pageSize

Response: {
  templates: FormTemplate[],
  total: number,
  page: number,
  pageSize: number
}
```

#### Get Template
```
GET /api/forms/templates/:id
Response: FormTemplate with full questionnaire JSONB
```

#### Create Template
```
POST /api/forms/templates
Body: {
  title: string,
  description?: string,
  category: string,
  tags?: string[],
  specialty_slug?: string,
  theme_id?: UUID,
  questionnaire: FHIRQuestionnaire
}
Response: Created template
```

#### Update Template
```
PUT /api/forms/templates/:id
Body: Partial<FormTemplate>
Response: Updated template
```

#### Publish Template
```
POST /api/forms/templates/:id/publish
Response: Template with status='active'
```

#### Archive Template
```
POST /api/forms/templates/:id/archive
Response: Template with status='archived'
```

#### Duplicate Template
```
POST /api/forms/templates/:id/duplicate
Response: New template (draft)
```

#### Export Template
```
GET /api/forms/templates/:id/export
Response: FHIR Questionnaire JSON
```

---

### 2. FHIR SDC Operations

#### $populate - Pre-fill Form
```
POST /api/forms/fhir/Questionnaire/$populate
POST /api/forms/fhir/Questionnaire/:id/$populate

Body (FHIR Parameters): {
  resourceType: "Parameters",
  parameter: [
    {
      name: "subject",
      valueReference: { reference: "Patient/xxx" }
    },
    {
      name: "questionnaire",
      resource: { /* Questionnaire */ }
    },
    {
      name: "context",
      part: [
        { name: "name", valueString: "patient" },
        { name: "type", valueString: "Patient" },
        { name: "content", valueReference: { reference: "Patient/xxx" } }
      ]
    },
    {
      name: "local",
      valueBoolean: true
    }
  ]
}

Response (FHIR Parameters): {
  resourceType: "Parameters",
  parameter: [
    {
      name: "response",
      resource: { /* Pre-filled QuestionnaireResponse */ }
    },
    {
      name: "issues",
      resource: { /* OperationOutcome */ }
    }
  ]
}
```

**Population Methods:**
1. **Observation-based**: Maps observations to questionnaire items
2. **Expression-based**: Uses FHIRPath expressions to extract values
3. **Rule-based**: Custom rules from `form_population_rules` table

#### $populatelink - Generate Signed Form Link
```
POST /api/forms/fhir/Questionnaire/:id/$populatelink

Body (FHIR Parameters): {
  resourceType: "Parameters",
  parameter: [
    { name: "subject", valueReference: { reference: "Patient/xxx" } },
    { name: "allow-amend", valueBoolean: true },
    { name: "redirect-on-submit", valueUrl: "https://..." },
    { name: "expiration", valueDateTime: "2025-..." },
    { name: "theme", valueString: "theme-id" },
    { name: "read-only", valueBoolean: false }
  ]
}

Response (FHIR Parameters): {
  resourceType: "Parameters",
  parameter: [
    {
      name: "link",
      valueUrl: "https://app.ehrconnect.com/forms/fill/signed-token"
    }
  ]
}
```

#### $extract - Extract Data to FHIR Resources
```
POST /api/forms/fhir/QuestionnaireResponse/$extract
POST /api/forms/fhir/QuestionnaireResponse/:id/$extract

Body (FHIR Parameters): {
  resourceType: "Parameters",
  parameter: [
    {
      name: "questionnaire-response",
      resource: { /* QuestionnaireResponse */ }
    }
  ]
}

Response (FHIR Bundle): {
  resourceType: "Bundle",
  type: "transaction",
  entry: [
    {
      resource: { /* Observation */ },
      request: { method: "POST", url: "Observation" }
    },
    {
      resource: { /* Condition */ },
      request: { method: "POST", url: "Condition" }
    }
  ]
}
```

**Extraction Methods:**
1. **Observation-based**: Creates Observation resources
2. **Definition-based**: Uses Questionnaire item definitions
3. **Rule-based**: Custom rules from `form_extraction_rules` table

---

### 3. Form Response Management

#### Submit Response
```
POST /api/forms/responses
Body: {
  form_template_id: UUID,
  response: FHIRQuestionnaireResponse,
  patient_id?: UUID,
  encounter_id?: UUID,
  practitioner_id?: UUID,
  status: 'in-progress' | 'completed'
}
Response: Created response
```

#### List Responses
```
GET /api/forms/responses
Query Params:
  - org_id: UUID
  - form_template_id: UUID
  - patient_id: UUID
  - encounter_id: UUID
  - status: string
  - from_date, to_date: ISO date
  - page, pageSize

Response: {
  responses: FormResponse[],
  total: number
}
```

#### Get Response
```
GET /api/forms/responses/:id
Response: FormResponse with full QuestionnaireResponse JSONB
```

#### Update Response (for in-progress)
```
PUT /api/forms/responses/:id
Body: { response: FHIRQuestionnaireResponse, status?: string }
Response: Updated response
```

#### Amend Response (for completed)
```
POST /api/forms/responses/:id/amend
Body: { response: FHIRQuestionnaireResponse }
Response: Response with status='amended'
```

---

## Frontend Components

### 1. Form Builder (`/forms/builder`)
- **Four-panel layout**
  - Left: Items tree / Components library (with tabs)
  - Center: Properties panel
  - Right: Live preview
  - Bottom: Debug console (Questionnaire JSON, Response, Population, Extraction, Expressions)
- **Features**:
  - Visual component library (14 types)
  - Drag-and-drop item management
  - Real-time preview
  - JSON validation
  - Version control
  - Theme selection

### 2. Form Preview (`/forms/preview/:id`)
- **Standalone preview page**
- Renders form exactly as end-users will see it
- Theme application
- Response capture (mock mode)
- Device preview modes (desktop, tablet, mobile)

### 3. Form Filler (`/forms/fill/:token`)
- **Public form filling interface**
- Pre-populated with $populate data
- Progressive save (draft responses)
- Validation on submit
- Conditional logic support
- File upload support

### 4. Response Viewer (`/forms/responses/:id`)
- **Read-only view of completed responses**
- Shows all answers with question context
- Timeline of amendments
- Extracted resources view
- Audit trail
- Export to PDF

### 5. Form Templates List (`/forms`)
- **Compact table view**
- Search and filter
- Status badges
- Usage statistics
- Quick actions (Preview, Share, Edit, Duplicate, Archive)

---

## Workflow Examples

### Workflow 1: Create and Fill Form

1. **Build Form**
   - User creates form in builder
   - Adds questions (text, choice, date, etc.)
   - Configures properties
   - Saves as draft

2. **Publish Form**
   - Review in preview
   - Publish (status → 'active')

3. **Generate Link**
   - Call `$populatelink` with patient reference
   - System generates signed URL
   - Send link to patient via email/SMS

4. **Patient Fills Form**
   - Opens link in browser
   - Form pre-filled with patient data
   - Patient completes remaining fields
   - Submits

5. **Capture Response**
   - System saves QuestionnaireResponse
   - Status set to 'completed'
   - Triggers $extract operation

6. **Extract Data**
   - Applies extraction rules
   - Creates Observations/Conditions
   - Links to patient record

### Workflow 2: Clinical Encounter Form

1. **Select Form**
   - Practitioner opens encounter
   - Selects appropriate form template

2. **Pre-populate**
   - System calls `$populate`
   - Loads patient vitals, medications, allergies
   - Shows pre-filled form

3. **Complete During Visit**
   - Practitioner fills remaining fields
   - Saves as in-progress (auto-save every 30s)
   - Submits when done

4. **Extract to EHR**
   - Observations created for vitals
   - Conditions updated if diagnoses changed
   - Linked to encounter

---

## Implementation Priority

### Phase 1: Core (Week 1) ✅
- [x] Database schema (already exists)
- [x] Form builder UI (completed)
- [x] Basic CRUD APIs

### Phase 2: Submission (Week 2)
- [ ] Preview functionality
- [ ] Form filler component
- [ ] Response submission API
- [ ] Response viewer

### Phase 3: FHIR SDC (Week 3)
- [ ] $populate implementation
- [ ] $populatelink implementation
- [ ] $extract implementation
- [ ] Population rules engine

### Phase 4: Advanced (Week 4)
- [ ] Conditional logic (enableWhen)
- [ ] Calculated expressions
- [ ] File uploads
- [ ] PDF export
- [ ] Analytics dashboard

---

## Technical Stack

### Backend
- **Node.js + Express** (existing)
- **PostgreSQL** (for metadata and responses)
- **FHIR Questionnaire/QuestionnaireResponse** (JSONB storage)

### Frontend
- **Next.js 14** (existing)
- **React** components
- **Tailwind CSS** (existing)
- **Form state management**: React Hook Form or Formik

### Standards Compliance
- **FHIR R4**
- **FHIR SDC Implementation Guide**
- **ISO 27001** (data security)
- **HIPAA** (PHI handling)

---

## Security Considerations

1. **Authentication**: NextAuth.js (existing)
2. **Authorization**: Role-based access control
3. **Signed Links**: JWT tokens with expiration
4. **Data Encryption**: At-rest (PostgreSQL) and in-transit (TLS)
5. **Audit Logging**: All operations logged to `form_audit_log`
6. **PHI Protection**: HIPAA-compliant data handling

---

## Performance Optimization

1. **Caching**:
   - Redis cache for active templates
   - CDN for static form assets

2. **Database**:
   - Indexes on frequently queried fields
   - JSONB GIN indexes for questionnaire search

3. **Frontend**:
   - Code splitting
   - Lazy loading for form components
   - Virtual scrolling for long forms

---

## Testing Strategy

1. **Unit Tests**: All API endpoints
2. **Integration Tests**: Full workflows
3. **E2E Tests**: Cypress for form filling
4. **FHIR Validation**: Against official schemas
5. **Load Testing**: Response submission performance

---

## Monitoring & Analytics

1. **Form Metrics**:
   - Submission rates
   - Completion times
   - Abandonment rates
   - Error rates

2. **Usage Analytics**:
   - Most used templates
   - Response volumes
   - User engagement

3. **System Health**:
   - API response times
   - Database query performance
   - Error logs

---

## Migration Path

1. **Existing Forms**: Import from current system
2. **Legacy Data**: Bulk import historical responses
3. **Training**: Documentation and video tutorials
4. **Rollout**: Gradual deployment by organization

---

## Support & Documentation

1. **API Documentation**: OpenAPI/Swagger
2. **User Guide**: Form builder walkthrough
3. **Developer Guide**: FHIR SDC integration
4. **Video Tutorials**: Screen recordings
5. **Support Portal**: Ticket system
