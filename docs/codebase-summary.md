# Codebase Summary

**Last Updated**: 2025-12-15
**Version**: 1.0.0
**Repository**: EHRConnect

## Overview

EHRConnect is a comprehensive, FHIR-compliant Electronic Health Records (EHR) system built with modern web technologies. The system provides a complete healthcare management platform with multi-tenancy, specialty-specific workflows, country-specific compliance, and extensive integration capabilities.

## Project Structure

```
EHRConnect/
├── ehr-api/                      # Backend API (Node.js + Express + PostgreSQL)
│   └── src/
│       ├── config/              # Configuration files
│       ├── constants/           # Application constants
│       ├── controllers/         # Request handlers (7 controllers)
│       ├── database/            # Database setup and migrations
│       │   ├── migrations/      # SQL migration files (30+ migrations)
│       │   └── seed-scripts/    # Database seeding scripts
│       ├── integrations/        # External system integrations (14 handlers)
│       ├── middleware/          # Express middleware (9 middleware)
│       ├── routes/              # API route definitions (38+ routes)
│       ├── services/            # Business logic layer (40+ services)
│       ├── scripts/             # Utility scripts
│       └── utils/               # Utility functions
│
├── ehr-web/                      # Frontend Application (Next.js 15 + React 19)
│   └── src/
│       ├── app/                 # Next.js App Router pages (30+ routes)
│       │   ├── dashboard/       # Main dashboard
│       │   ├── patients/        # Patient management
│       │   ├── appointments/    # Appointment scheduling
│       │   ├── encounters/      # Clinical encounters
│       │   ├── forms/           # Form builder & management
│       │   ├── rules/           # Rule engine
│       │   ├── tasks/           # Task management
│       │   ├── admin/           # Admin panel
│       │   ├── portal/          # Patient portal
│       │   ├── meeting/         # Telehealth meetings
│       │   ├── billing/         # Billing & RCM
│       │   ├── inventory/       # Inventory management
│       │   └── auth/            # Authentication
│       ├── components/          # Reusable React components
│       │   └── forms/           # Form components (StepNavigator, StepEditor, WizardProgress)
│       ├── contexts/            # React Context providers
│       ├── services/            # API client services
│       ├── stores/              # Zustand state stores (form-builder-store)
│       ├── types/               # TypeScript type definitions
│       ├── utils/               # Utility functions
│       └── hooks/               # Custom React hooks (use-form-preview)
│
├── ehr-design-system/            # Shared UI component library
├── ehr-integration-gateway/     # Integration service (future)
├── keycloak/                    # Keycloak identity provider configs
├── keycloak-theme/              # Custom Keycloak theme
├── medplum/                     # Medplum FHIR server configs
├── scripts/                     # Deployment and setup scripts
├── infra/                       # Infrastructure configs
└── docs/                        # Project documentation
```

## Technology Stack

### Backend (ehr-api)

**Runtime & Framework**:
- Node.js v18+ (JavaScript)
- Express.js 4.18 (Web framework)
- Socket.IO 4.8 (Real-time communication)

**Database**:
- PostgreSQL 8.11 (Primary database)
- Redis 5.9 (Caching & sessions)
- Sequelize 6.37 (ORM)

**Authentication & Security**:
- Keycloak (Identity & access management)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT handling)
- helmet (Security headers)

**Integrations**:
- Axios 1.12 (HTTP client)
- Twilio 5.10 (SMS/voice)
- Nodemailer 7.0 (Email)

**Validation & Schema**:
- Joi 17.9 (Request validation)
- AJV 8.12 (JSON Schema validation)

**Testing**:
- Jest 29.6 (Test framework)
- Supertest 6.3 (API testing)

### Frontend (ehr-web)

**Framework**:
- Next.js 15.5 (React framework with App Router)
- React 19.1 (UI library)
- TypeScript 5 (Type safety)

**UI Components**:
- @nirmitee.io/design-system (Custom design system)
- Radix UI (Headless UI components)
- Tailwind CSS 4 (Utility-first styling)
- Lucide React (Icon library)

**FHIR & Healthcare**:
- @medplum/core 4.4 (FHIR client)
- @medplum/react 4.4 (FHIR React components)

**Telehealth**:
- @100mslive/react-sdk 0.10 (Video conferencing)

**State Management**:
- Zustand 5.0 (Lightweight state, form builder store)
- React Context (Global state)
- SWR 2.3 (Data fetching & caching)
- localStorage persistence (form builder state)

**Authentication**:
- next-auth 4.24 (Authentication)
- keycloak-js 26.2 (Keycloak integration)

**Forms & Data**:
- React Query Builder 8.12 (Visual query builder)
- Monaco Editor 4.7 (Code editor)

**Charts & Visualization**:
- Recharts 3.3 (Chart library)

**Internationalization**:
- i18next 25.6 (i18n framework)
- react-i18next 16.3 (React bindings)

### Infrastructure

**Containerization**:
- Docker & Docker Compose
- Multi-stage builds for optimization

**Identity & Access**:
- Keycloak 26.2 (SSO & IAM)

**FHIR Server**:
- Medplum (FHIR R4 compliant server)

**Database**:
- PostgreSQL (Production database)
- Redis (Cache & sessions)

## Core Technologies

- **Repomix**: 4.77M tokens, 19.3M chars across 2,031 files
- **Lines of Code**: ~577,498 lines (XML compaction)

## Key Directories & Modules

### Backend Services (ehr-api/src/services/)

**Core Services** (40+ services):
- `abdm.service.js` - ABDM (India) integration
- `audit.service.js` - Audit logging
- `auth.service.js` - Authentication
- `bed-management.js` - Hospital bed management
- `billing.service.js` - Billing operations
- `claimmd.service.js` - ClaimMD integration
- `country-registry.service.js` - Country-specific features
- `dashboard.service.js` - Dashboard data
- `email.service.js` - Email notifications
- `episode.service.js` - Patient episodes
- `forms.service.js` - Form management
- `forms-versioning.service.js` - Form versioning
- `integration.service.js` - Integration orchestration
- `inventory.service.js` - Inventory management
- `keycloak.service.js` - Keycloak integration
- `mfa.service.js` - Multi-factor authentication
- `notification.service.js` - Notifications
- `patient.service.js` - Patient operations
- `practitioner.service.js` - Provider management
- `rule-engine.service.js` - Rules engine
- `session.service.js` - Session management
- `socket.service.js` - Real-time communication
- `specialty-registry.service.js` - Specialty packs
- `task.service.js` - Task management
- `translation.service.js` - Internationalization
- `virtual-meetings.service.js` - Telehealth

### Backend Routes (ehr-api/src/routes/)

**API Endpoints** (38+ route files):
- FHIR Resources: Patient, Practitioner, Organization, Appointment, Observation, etc.
- Admin: Organizations, Users, Roles, Audit, Dashboard
- Clinical: Patients, Encounters, Forms, Tasks, Episodes
- Scheduling: Appointments, Virtual Meetings, Bed Management
- Billing: Billing, ClaimMD, Inventory
- Integration: ABDM, Data Mapper, Webhooks
- System: Auth, MFA, Notifications, Translations
- Specialty: Specialty Packs, Country Settings, Rules

### Backend Middleware (ehr-api/src/middleware/)

- `auth.js` - JWT authentication
- `authenticate.js` - Keycloak authentication
- `rbac.js` - Role-based access control
- `audit-logger.js` - Audit trail logging
- `rate-limit.js` - API rate limiting
- `cache-invalidation.js` - Cache management
- `org-isolation.js` - Multi-tenant isolation

### Backend Integrations (ehr-api/src/integrations/)

**Integration Handlers** (14+ handlers):
- ABDM (India's health ID system)
- ClaimMD (Medical billing)
- Twilio (SMS/Voice)
- 100ms (Video conferencing)
- Email (SMTP)
- Webhooks (Generic webhooks)

### Frontend Pages (ehr-web/src/app/)

**Main Application Routes** (30+ routes):
- `/dashboard` - Main dashboard
- `/patients` - Patient list & detail
- `/appointments` - Scheduling
- `/encounters` - Clinical encounters
- `/forms` - Form builder
- `/rules` - Rule engine
- `/tasks` - Task management
- `/portal` - Patient portal
- `/meeting` - Telehealth
- `/billing`, `/rcm` - Revenue cycle
- `/inventory` - Inventory management
- `/admin` - Admin panel
- `/settings` - User settings
- `/auth`, `/register` - Authentication
- `/users`, `/roles`, `/team-management` - User management
- `/audit-logs` - Audit trails
- `/integrations` - Integration management
- `/medical-codes` - ICD/CPT codes
- `/specialty-test` - Specialty testing
- `/patient-flow` - Patient flow management
- `/bed-management` - Bed management
- `/reports` - Reporting
- `/demo` - Demo pages

### Frontend Services (ehr-web/src/services/)

**API Clients**:
- `auth.service.ts` - Authentication
- `patient.service.ts` - Patient operations
- `appointment.service.ts` - Scheduling
- `forms.service.ts` - Form management with multi-step support
- `preview.service.ts` - Form preview rendering
- `specialty.service.ts` - Specialty packs
- `country.service.ts` - Country settings
- `rule.service.ts` - Rules engine
- `task.service.ts` - Task management
- `billing.service.ts` - Billing
- `inventory.service.ts` - Inventory
- `virtual-meetings.service.ts` - Telehealth
- `patient-portal.service.ts` - Patient portal

### Frontend Contexts (ehr-web/src/contexts/)

**Global State Providers**:
- `AuthSessionProvider` - Authentication session
- `SpecialtyProvider` - Specialty context
- `CountryProvider` - Country-specific settings
- `FacilityProvider` - Facility/location context

### Database Migrations (ehr-api/src/database/migrations/)

**Major Migrations** (30+ migrations):
- `20240101000000-initial-schema.js` - Base schema
- `20240101000003-billing_module.js` - Billing tables
- `20240101000021-forms_module.js` - Forms builder
- `20240101000022-country_specific_system.js` - Country settings
- `20240101000013-notifications.js` - Notification system
- `20241130000004-create_universal_rule_engine.js` - Rule engine
- `20241201000001-create_2fa_system.js` - Two-factor auth
- `20241212000001-add-form-versioning-fields.js` - Form versioning

## Key Features

### 1. FHIR Compliance
- Full FHIR R4 support
- Patient, Practitioner, Organization, Appointment resources
- FHIR Questionnaire for forms
- FHIR Consent for patient consent
- Integration with Medplum FHIR server

### 2. Multi-Tenancy
- Organization-level isolation
- Location and department scoping
- Role-based access control (RBAC)
- Keycloak integration for SSO

### 3. Specialty-Specific Workflows
- Modular specialty pack system
- General primary care, OB/GYN, Orthopedics, Wound Care
- Episode-based care tracking
- Specialty-specific forms and templates
- Custom visit types per specialty

### 4. Country-Specific Compliance
- Country pack system (India, USA, UAE)
- Regulatory compliance (HIPAA, GDPR)
- Localization (language, currency, timezone)
- ABDM integration for India (ABHA M1, M2, M3)
- Data residency support

### 5. Form Builder
- Visual form builder
- Multi-step/wizard mode support
- FHIR Questionnaire-based
- Form versioning
- Draft/published states
- Form templates library
- Step navigation with progress tracking
- Auto-save and state persistence

### 6. Universal Rule Engine
- Visual rule builder
- JSON Logic-based rules
- Event-driven triggers
- Task automation
- Clinical decision support

### 7. Telehealth
- 100ms video integration
- Virtual waiting rooms
- Screen sharing & chat
- Recording support
- Guest access for patients

### 8. Patient Portal
- Patient registration & login
- Appointment booking widget
- Medical records access
- Medication list
- Test results viewing

### 9. Billing & RCM
- ClaimMD integration
- ICD-10 & CPT code management
- Insurance claim submission
- Payment tracking
- Invoice generation

### 10. Inventory Management
- Product catalog
- Stock tracking
- Purchase orders
- Vendor management
- Low stock alerts

### 11. Task Management
- Task assignment
- Priority & status tracking
- Rule-based automation
- Due date reminders
- Task templates

### 12. Audit & Compliance
- Comprehensive audit logging
- FHIR AuditEvent resources
- User action tracking
- Compliance reporting
- Data access trails

### 13. Internationalization
- Multi-language support
- i18next integration
- Language detection
- Translation management
- RTL support ready

### 14. Real-Time Features
- Socket.IO integration
- Live notifications
- Real-time updates
- Chat messaging
- Presence indicators

### 15. Integration Framework
- Webhook support
- RESTful API
- Integration registry
- Custom handlers
- Event-driven architecture

## Entry Points

### Backend Entry Point
**File**: `/Users/developer/Projects/EHRConnect/ehr-api/src/index.js`
- Express server initialization
- Middleware setup (CORS, Helmet, Body parsers)
- Route registration (38+ route files)
- Database connection (PostgreSQL pool)
- Socket.IO server initialization
- Port: 8000 (default)

### Frontend Entry Point
**File**: `/Users/developer/Projects/EHRConnect/ehr-web/src/app/layout.tsx`
- Next.js root layout
- Global providers (Auth, Specialty, Country, Facility)
- Global styles
- Font configuration (Geist)

## Main Workflows

### 1. Patient Registration & Check-In
```
Register Patient → Create FHIR Patient → Assign to Episode → Check-In → Encounter
```

### 2. Appointment Scheduling
```
Search Availability → Book Appointment → Send Confirmation → Check-In → Start Encounter
```

### 3. Clinical Encounter
```
Start Encounter → Fill Forms → Add Vitals → Document Notes → Add Diagnosis → Prescribe → Close Encounter
```

### 4. Form Building & Versioning
```
Create Form → Add Sections/Questions → Publish → Create Version → Update Form → Publish New Version
```

### 5. Rule Creation & Automation
```
Create Rule → Define Conditions → Set Actions → Test Rule → Activate → Monitor Triggers
```

### 6. Telehealth Session
```
Schedule Meeting → Generate Link → Patient Joins → Start Video → Conduct Consult → End Meeting → Document
```

### 7. Billing & Claims
```
Complete Encounter → Add Charges → Generate Claim → Submit to ClaimMD → Track Status → Post Payment
```

### 8. Task Automation
```
Rule Trigger → Create Task → Assign to User → Send Notification → Complete Task → Archive
```

## Deployment Architecture

### Development Environment
- Docker Compose
- PostgreSQL container
- Redis container
- Keycloak container
- Backend on port 8000
- Frontend on port 3000

### Production Environment (Dokploy)
- Multi-container deployment
- PostgreSQL managed database
- Redis cache
- Keycloak SSO
- Nginx reverse proxy
- SSL/TLS certificates
- Environment-specific configs (dev, staging, prod)

## Testing Strategy

### Backend Testing
- Jest test framework
- Supertest for API testing
- Unit tests for services
- Integration tests for routes
- Database seeding for tests

### Frontend Testing
- Jest (configured)
- React Testing Library (ready)
- E2E testing (future)

## Security Features

### Authentication
- Keycloak SSO
- JWT tokens
- Session management
- Two-factor authentication (TOTP)
- Password-based auth (fallback)

### Authorization
- Role-based access control (RBAC)
- Organization-level isolation
- Resource-level permissions
- Keycloak role mapping

### Data Protection
- Helmet security headers
- CORS configuration
- Rate limiting
- SQL injection prevention (parameterized queries)
- XSS protection
- Encrypted credentials storage

### Audit Trail
- Comprehensive audit logging
- FHIR AuditEvent resources
- User action tracking
- Immutable audit records

## Performance Optimizations

### Backend
- PostgreSQL connection pooling
- Redis caching
- Indexed database queries
- Efficient FHIR resource querying
- Rate limiting

### Frontend
- Next.js App Router (Server Components)
- SWR data fetching & caching
- Code splitting
- Image optimization
- Lazy loading

## Code Organization Patterns

### Backend Patterns
- MVC-like architecture (Routes → Controllers → Services → Database)
- Service layer for business logic
- Middleware for cross-cutting concerns
- Utility functions for common operations
- Centralized error handling

### Frontend Patterns
- Feature-based organization
- Container/Presentational component split
- Custom hooks for reusable logic
- Context for global state
- Service layer for API calls
- TypeScript for type safety

## File Naming Conventions

### Backend
- `kebab-case.js` for files
- Service files: `*.service.js`
- Route files: `*.routes.js` or `*.js` in routes/
- Controller files: `*.controller.js` or `*.js` in controllers/
- Middleware files: `*.js` in middleware/
- Migration files: `YYYYMMDDHHMMSS-description.js`

### Frontend
- `kebab-case.tsx` or `.ts` for files
- Page files: `page.tsx` in app router
- Layout files: `layout.tsx`
- Component files: `PascalCase.tsx`
- Service files: `*.service.ts`
- Type files: `*.types.ts` or `*.ts` in types/
- Context files: `*-context.tsx`

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `PORT` - Server port
- `KEYCLOAK_URL` - Keycloak server
- `KEYCLOAK_REALM` - Keycloak realm
- `MEDPLUM_BASE_URL` - FHIR server
- `TWILIO_*` - Twilio credentials
- `EMAIL_*` - Email configuration
- `HMS_*` - 100ms credentials

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_URL` - Frontend URL
- `NEXTAUTH_SECRET` - Session secret
- `AUTH_PROVIDER` - Auth method (postgres/keycloak)
- `NEXT_PUBLIC_KEYCLOAK_*` - Keycloak config

## Documentation Structure

### Current Documentation (docs/)
- `project-overview-pdr.md` - Project overview & PDR
- `code-standards.md` - Coding standards
- `codebase-summary.md` - This file
- `system-architecture.md` - Architecture details
- `project-roadmap.md` - Development roadmap

### Legacy Documentation (docsv2/)
- 170+ legacy documentation files
- Feature-specific guides
- Implementation summaries
- Setup instructions
- API references

### Code Documentation
- README files in key directories
- Inline code comments
- JSDoc comments (partial)
- TypeScript type definitions

## Development Workflow

### Git Workflow
- Main branch for production
- Feature branches for development
- Conventional commits
- Pull request reviews

### Database Migrations
- Sequelize CLI for migrations
- Sequential migration numbering
- Up/down migration support
- Seed scripts for initial data

### CI/CD (GitHub Actions)
- Automated testing (configured)
- Docker image building
- Deployment to Dokploy
- Environment-specific workflows

## Dependencies Overview

### Backend Dependencies (20+ key packages)
- express, cors, helmet, dotenv
- pg, sequelize, redis
- jsonwebtoken, bcryptjs
- axios, socket.io
- joi, ajv
- moment, uuid
- nodemailer, twilio

### Frontend Dependencies (25+ key packages)
- next, react, react-dom
- @medplum/core, @medplum/react
- @100mslive/react-sdk
- next-auth, keycloak-js
- zustand, swr
- i18next, react-i18next
- tailwindcss, lucide-react
- recharts, monaco-editor

## Key Configuration Files

- `package.json` - Dependencies & scripts (backend & frontend)
- `docker-compose*.yml` - Container orchestration (8 files)
- `dokploy.config.json` - Deployment configuration
- `medplum.config.json` - FHIR server config
- `.sequelizerc` - Sequelize CLI config
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind CSS config
- `components.json` - Shadcn UI config

## Specialty Packs

### Available Packs
- **General Primary Care** - Default pack, intake forms, SOAP notes, KPIs
- **OB/GYN & Prenatal** - Pregnancy tracking, IVF, postpartum care
- **Orthopedics** - Surgical tracking, rehabilitation
- **Wound Care** - Wound assessment, treatment plans

### Pack Structure
```
specialty-packs/[slug]/[version]/
├── pack.json              # Pack manifest
├── templates/             # FHIR Questionnaires
├── visit-types.json       # Appointment types
├── workflows/             # Clinical workflows
└── reports/               # KPI definitions
```

## Country Packs

### Available Packs
- **India (IN)** - ABDM integration, ABHA modules, Indian compliance
- **United States (US)** - HIPAA, NPI lookup, Medicare/Medicaid
- **United Arab Emirates (AE)** - DHA/HAAD compliance

### ABDM Integration (India)
- **M1**: ABHA Number Generation (Aadhaar/Mobile)
- **M2**: Health Record Linking
- **M3**: Consent Management
- Sandbox mode for testing
- Production ABDM gateway integration

## Integration Points

### External Systems
- **Keycloak** - Identity & access management
- **Medplum** - FHIR server
- **ClaimMD** - Medical billing
- **100ms** - Video conferencing
- **Twilio** - SMS & voice
- **ABDM** - India health records
- **Email SMTP** - Email notifications

### APIs Provided
- RESTful API (Express)
- FHIR R4 API (via Medplum)
- WebSocket API (Socket.IO)
- Webhooks (outgoing)

## Unresolved Questions

1. Production ABDM credentials and endpoint configuration status?
2. ClaimMD integration testing and production deployment status?
3. Medplum vs custom FHIR server decision rationale?
4. Test coverage percentage across backend and frontend?
5. Performance benchmarks and load testing results?
6. Disaster recovery and backup strategy documentation?
7. Multi-region deployment plan for data residency compliance?
8. Frontend E2E testing framework selection and setup?
9. API versioning strategy for breaking changes?
10. Mobile app development plans (React Native/Flutter)?
