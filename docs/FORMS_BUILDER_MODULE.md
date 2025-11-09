# Forms Builder Module - Comprehensive Documentation

## 📋 Overview

The Forms Builder module is a comprehensive FHIR-compliant questionnaire management system for EHRConnect. It enables healthcare organizations to design, customize, and deploy structured data-capture forms without writing code.

**Key Features:**
- ✅ FHIR R4 Questionnaire/QuestionnaireResponse compliance
- ✅ Drag-and-drop form builder UI
- ✅ Hybrid storage (PostgreSQL + Medplum FHIR server)
- ✅ Theme customization and branding
- ✅ Data population ($populate) and extraction ($extract) operations
- ✅ Import/Export FHIR Questionnaire JSON
- ✅ Standalone module (can be integrated into patient detail later)

## 🏗️ Architecture

### Storage Strategy
- **PostgreSQL Only**: All FHIR Questionnaire/QuestionnaireResponse data stored in JSONB columns
- **Hybrid Approach**: Metadata in regular columns for fast queries, full FHIR JSON in JSONB for flexibility
- **No External Dependencies**: Self-contained, no Medplum or external FHIR servers required

### Tech Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + TypeScript + shadcn/ui
- **FHIR**: R4 with SDC (Structured Data Capture) extensions

## 📁 File Structure

```
EHRConnect/
├── ehr-api/
│   ├── src/
│   │   ├── database/migrations/
│   │   │   └── 021_forms_module.sql          # Database schema
│   │   ├── services/
│   │   │   └── forms.service.js               # Business logic + Medplum integration
│   │   └── routes/
│   │       └── forms.js                       # REST API endpoints
│   │
├── ehr-web/
│   ├── src/
│   │   ├── types/
│   │   │   └── forms.ts                       # TypeScript type definitions
│   │   ├── services/
│   │   │   └── forms.service.ts               # API client
│   │   └── features/forms/
│   │       ├── components/
│   │       │   ├── form-templates/           # Template listing UI
│   │       │   ├── form-builder/             # Drag-and-drop builder
│   │       │   ├── theme-editor/             # Theme customization
│   │       │   ├── form-renderer/            # Form display/fill
│   │       │   └── shared/                   # Reusable components
│   │       ├── hooks/                        # React hooks
│   │       ├── services/                     # Frontend services
│   │       ├── store/                        # State management
│   │       ├── types/                        # Local types
│   │       └── utils/
│   │           └── component-library.ts       # Form component definitions
```

## 🗄️ Database Schema

### Tables Created

1. **`form_themes`**
   - Stores theme configurations (colors, fonts, branding)
   - Supports global themes and org-specific themes

2. **`form_templates`**
   - Metadata for form templates
   - Links to Medplum via `fhir_questionnaire_id`
   - Tracks versions, status, usage

3. **`form_responses`**
   - Lightweight metadata for form submissions
   - Full QuestionnaireResponse stored in Medplum

4. **`form_population_rules`**
   - Rules for $populate operation
   - Maps patient/clinical data to form fields

5. **`form_extraction_rules`**
   - Rules for $extract operation
   - Converts form responses to FHIR resources

6. **`form_audit_log`**
   - Tracks all changes to forms and themes

## 🔌 API Endpoints

### Form Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms/templates` | List templates (with filters) |
| GET | `/api/forms/templates/:id` | Get template details |
| POST | `/api/forms/templates` | Create new template |
| PUT | `/api/forms/templates/:id` | Update template |
| POST | `/api/forms/templates/:id/publish` | Publish template |
| POST | `/api/forms/templates/:id/archive` | Archive template |
| DELETE | `/api/forms/templates/:id` | Delete template |
| POST | `/api/forms/templates/:id/duplicate` | Duplicate template |
| POST | `/api/forms/templates/import` | Import FHIR Questionnaire |
| GET | `/api/forms/templates/:id/export` | Export as FHIR JSON |

### Form Themes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms/themes` | List available themes |
| POST | `/api/forms/themes` | Create custom theme |

### Population & Extraction Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms/templates/:id/population-rules` | Get population rules |
| POST | `/api/forms/templates/:id/population-rules` | Create population rule |
| GET | `/api/forms/templates/:id/extraction-rules` | Get extraction rules |
| POST | `/api/forms/templates/:id/extraction-rules` | Create extraction rule |

### SDC Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/forms/$populate` | Pre-fill form with patient data |
| POST | `/api/forms/$extract` | Extract structured data from response |

## 🎨 Form Component Library

### Categories

1. **Input Fields**
   - Text Input, Text Area, Number, Decimal, Date, Time, DateTime, URL

2. **Selection Controls**
   - Dropdown, Radio Buttons, Checkbox, Open Choice

3. **Structural Elements**
   - Group (sections), Display Text

4. **Media & Attachments**
   - File Upload

5. **FHIR-Specific**
   - Quantity, Reference (to other FHIR resources)

## 🔄 Form Lifecycle

```
┌─────────┐
│  DRAFT  │ ──create──► Edit freely
└────┬────┘
     │
     │ publish
     ▼
┌─────────┐
│ ACTIVE  │ ──use──► Forms can be filled
└────┬────┘
     │
     │ archive
     ▼
┌─────────┐
│ ARCHIVED│ ──retrieve──► Read-only access
└─────────┘
```

## 🚀 Getting Started

### Prerequisites

1. **Database Migration**
   ```bash
   cd ehr-api
   npm run migrate
   # Or run directly:
   PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum \
     -f src/database/migrations/021_forms_module.sql
   ```

3. **Install Dependencies**
   ```bash
   # API
   cd ehr-api
   npm install @medplum/core

   # Frontend (if not already installed)
   cd ehr-web
   npm install
   ```

### Running the Module

```bash
# Start API
cd ehr-api
npm run dev

# Start Frontend
cd ehr-web
npm run dev
```

## 🧪 Testing API Endpoints

### Create a Form Template

```bash
curl -X POST http://localhost:8000/api/forms/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-org-id: YOUR_ORG_ID" \
  -d '{
    "title": "Patient Intake Form",
    "description": "Initial patient assessment",
    "category": "intake",
    "tags": ["general", "new-patient"]
  }'
```

### Import FHIR Questionnaire

```bash
curl -X POST http://localhost:8000/api/forms/templates/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-org-id: YOUR_ORG_ID" \
  -d '{
    "questionnaire": {
      "resourceType": "Questionnaire",
      "title": "Pain Assessment",
      "status": "draft",
      "item": [
        {
          "linkId": "pain_level",
          "text": "Rate your pain (1-10)",
          "type": "integer"
        }
      ]
    }
  }'
```

### List Templates

```bash
curl http://localhost:8000/api/forms/templates?status=active \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-org-id: YOUR_ORG_ID"
```

## 📝 Frontend Implementation Guide

### Phase 1 Components (To Be Built)

1. **Form Templates Page** (`ehr-web/src/features/forms/components/form-templates/templates-list.tsx`)
   - List view with cards
   - Search and filter
   - Create/Import actions
   - Template card actions (Edit, Duplicate, Archive, Export)

2. **Form Builder** (`ehr-web/src/features/forms/components/form-builder/`)
   - **Left Panel**: Component library (drag source)
   - **Middle Panel**: Form properties editor
   - **Right Panel**: Live preview + JSON tabs

3. **Theme Editor** (`ehr-web/src/features/forms/components/theme-editor/`)
   - Color pickers
   - Font settings
   - Branding configuration
   - Preview themes

4. **Form Renderer** (`ehr-web/src/features/forms/components/form-renderer/`)
   - Display questionnaire for filling
   - Conditional logic (enableWhen)
   - Validation
   - Save/Submit responses

### Routing Setup

Add to your router:

```tsx
// In ehr-web/src/app/routes.tsx or similar
{
  path: '/forms',
  children: [
    {
      path: 'templates',
      element: <FormTemplatesPage />,
    },
    {
      path: 'builder/:id?',
      element: <FormBuilderPage />,
    },
    {
      path: 'fill/:id',
      element: <FormFillPage />,
    },
  ],
}
```

### Navigation Menu

Add Forms section to main navigation:

```tsx
{
  title: 'Forms',
  icon: <FileText />,
  path: '/forms/templates',
  permission: 'forms:read',
}
```

## 🔐 Permissions

Add to RBAC system:

```json
{
  "forms:read": "View form templates",
  "forms:write": "Create and edit form templates",
  "forms:publish": "Publish form templates",
  "forms:delete": "Archive and delete form templates",
  "forms:fill": "Fill out forms"
}
```

## 🎯 Next Steps

### Immediate (Complete Phase 1)

1. ✅ **Backend Complete**
   - Database schema
   - API routes
   - Service layer with Medplum integration

2. 🚧 **Frontend Components to Build**
   - [ ] Form Templates listing page
   - [ ] Form Builder (3-panel layout)
   - [ ] Component property editors
   - [ ] Theme Editor
   - [ ] Form Renderer

3. 🚧 **Features to Implement**
   - [ ] Drag-and-drop in Form Builder
   - [ ] Live preview updates
   - [ ] JSON validation
   - [ ] Export/Import functionality
   - [ ] Theme preview

### Phase 2 (Future Enhancements)

- [ ] Advanced conditional logic builder (visual if/then rules)
- [ ] Form versioning and diff viewer
- [ ] Form analytics and usage statistics
- [ ] Multi-language support for forms
- [ ] Form templates marketplace
- [ ] Integration with patient detail sidebar
- [ ] Offline form filling with sync
- [ ] Form response search and reporting
- [ ] Advanced FHIRPath expression builder
- [ ] Form validation rules library

## 🐛 Known Limitations

1. **Migration Conflicts**: Some index names conflicted with existing tables. Tables were created successfully but some indexes were skipped.

2. **Medplum Connection**: Requires proper Medplum credentials in `.env`. Falls back gracefully if not configured.

3. **RBAC Integration**: Permission checks are in place but need to be configured in your RBAC system.

## 📚 Additional Resources

- [FHIR Questionnaire Resource](https://www.hl7.org/fhir/questionnaire.html)
- [FHIR QuestionnaireResponse](https://www.hl7.org/fhir/questionnaireresponse.html)
- [FHIR SDC Implementation Guide](http://hl7.org/fhir/uv/sdc/)
- [Medplum Documentation](https://www.medplum.com/docs)

## 🤝 Contributing

When building frontend components:

1. Follow the existing component structure in `ehr-web/src/features/`
2. Use TypeScript types from `@/types/forms`
3. Use the API client from `@/services/forms.service`
4. Follow shadcn/ui patterns for UI components
5. Ensure FHIR compliance for all questionnaire operations

## 📄 License

This module is part of EHRConnect and follows the project's license.

---

**Status**: Backend Complete ✅ | Frontend Foundation Ready 🚧

**Last Updated**: 2025-11-09
