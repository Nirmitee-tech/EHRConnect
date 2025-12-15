# System Architecture

**Last Updated**: 2025-12-15
**Version**: 1.0.0
**Project**: EHRConnect

## Overview

EHRConnect implements a modern, three-tier web architecture with a React-based frontend, Node.js backend API, and PostgreSQL database. The system is designed for multi-tenancy, FHIR R4 compliance, and extensive healthcare integrations.

## Architectural Pattern

### Pattern Classification
**Primary Pattern**: Three-Tier Web Architecture
**Secondary Patterns**:
- Multi-Tenant SaaS Architecture
- Microservices-Ready Modular Monolith
- Event-Driven Architecture (Socket.IO, Webhooks)
- Repository Pattern (Services layer)

### Design Philosophy
- **Separation of Concerns**: Clear boundaries between presentation, business logic, and data
- **Multi-Tenancy**: Organization-level data isolation
- **FHIR Compliance**: Healthcare interoperability standard
- **Modular Design**: Specialty and country packs loaded at runtime
- **Security First**: HIPAA/GDPR compliance, RBAC, audit logging
- **Scalability**: Horizontal scaling, caching, stateless services

## System Components

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Client Layer                              │
├──────────────────────────────────────────────────────────────┤
│  Web Browser (Desktop/Mobile)                                 │
│  - EHR Web Application (Next.js)                              │
│  - Patient Portal                                             │
│  - Admin Dashboard                                            │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTPS (REST API + WebSocket)
┌─────────────────────┴────────────────────────────────────────┐
│                  Application Layer                            │
├──────────────────────────────────────────────────────────────┤
│  ehr-web (Frontend - Port 3000)                               │
│  - Next.js 15 App Router                                      │
│  - React 19 Components                                        │
│  - TypeScript                                                 │
│  - Context Providers                                          │
│  - API Client Services                                        │
│                                                               │
│  ehr-api (Backend - Port 8000)                                │
│  - Express.js Server                                          │
│  - RESTful API Endpoints                                      │
│  - Socket.IO Server                                           │
│  - Business Logic Services                                    │
│  - Integration Handlers                                       │
└─────────────────────┬────────────────────────────────────────┘
                      │ SQL Queries
┌─────────────────────┴────────────────────────────────────────┐
│                     Data Layer                                │
├──────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Primary)                                │
│  - Multi-tenant data (org_id isolation)                       │
│  - FHIR resources                                             │
│  - Clinical data                                              │
│  - Audit logs                                                 │
│                                                               │
│  Redis Cache                                                  │
│  - Session storage                                            │
│  - API response caching                                       │
│  - Rate limiting                                              │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                  External Systems                              │
├───────────────────────────────────────────────────────────────┤
│  Identity & Access:        FHIR:           Integrations:       │
│  - Keycloak (SSO/IAM)     - Medplum       - ClaimMD (Billing) │
│                                            - ABDM (India)      │
│                                            - 100ms (Video)     │
│                                            - Twilio (SMS)      │
└───────────────────────────────────────────────────────────────┘
```

### Frontend Architecture (ehr-web)

**Technology Stack**:
- Next.js 15.5 (App Router)
- React 19.1
- TypeScript 5
- Tailwind CSS 4
- Zustand (state management)
- SWR (data fetching)

**Structure**:
```
ehr-web/src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Route group for authenticated routes
│   ├── auth/                # Authentication pages
│   ├── portal/              # Patient portal
│   └── api/                 # API routes (Next.js API)
│
├── components/              # Reusable UI components
│   ├── forms/              # Form components
│   │   ├── StepNavigator.tsx       # Multi-step navigation sidebar
│   │   ├── StepEditor.tsx          # Step configuration editor
│   │   ├── WizardProgress.tsx      # Progress bar component
│   │   ├── StepNavigationControls.tsx  # Next/Previous buttons
│   │   └── preview/                # Preview components
│   ├── layouts/            # Layout components
│   └── ui/                 # Base UI components
│
├── contexts/                # React Context providers
│   ├── AuthSessionProvider
│   ├── SpecialtyProvider
│   ├── CountryProvider
│   └── FacilityProvider
│
├── services/                # API client services
│   ├── auth.service.ts
│   ├── patient.service.ts
│   ├── appointment.service.ts
│   └── ... (20+ services)
│
├── types/                   # TypeScript type definitions
│   ├── patient.ts
│   ├── specialty.ts
│   ├── country.ts
│   └── ... (10+ type files)
│
├── hooks/                   # Custom React hooks
│   ├── use-patients.ts
│   ├── use-auth.ts
│   └── use-specialty.ts
│
└── utils/                   # Utility functions
    ├── date.ts
    ├── format.ts
    └── validation.ts
```

**Data Flow (Frontend)**:
```
User Action → Component Handler
→ Service Layer (API Call)
→ SWR Cache Check
→ Backend API Request
→ Response Processing
→ State Update (Context/Zustand)
→ Component Re-render
```

### Backend Architecture (ehr-api)

**Technology Stack**:
- Node.js 18+
- Express.js 4.18
- PostgreSQL 8.11 + Sequelize 6.37
- Redis 5.9
- Socket.IO 4.8
- JWT Authentication

**Structure**:
```
ehr-api/src/
├── index.js                 # Express server entry point
├── config/                  # Configuration files
├── constants/               # Application constants
│
├── routes/                  # API route definitions (38+ files)
│   ├── fhir.js             # FHIR resources
│   ├── patients.js         # Patient management
│   ├── appointments.js     # Scheduling
│   ├── forms.js            # Form management
│   ├── rules.js            # Rule engine
│   └── ... (35+ route files)
│
├── controllers/             # Request handlers (7 controllers)
│   ├── patient.js
│   ├── appointment.js
│   └── practitioner.js
│
├── services/                # Business logic layer (40+ services)
│   ├── auth.service.js
│   ├── patient.service.js
│   ├── appointment.service.js
│   ├── forms.service.js
│   ├── rule-engine.service.js
│   ├── specialty-registry.service.js
│   ├── country-registry.service.js
│   └── ... (35+ services)
│
├── middleware/              # Express middleware (9 middleware)
│   ├── auth.js             # JWT authentication
│   ├── rbac.js             # Role-based access control
│   ├── audit-logger.js     # Audit trail
│   ├── rate-limit.js       # API rate limiting
│   └── org-isolation.js    # Multi-tenant isolation
│
├── integrations/            # External system handlers (14+ handlers)
│   ├── abdm.handler.js     # India ABDM
│   ├── claimmd.handler.js  # Medical billing
│   ├── twilio.handler.js   # SMS/Voice
│   └── 100ms.handler.js    # Video conferencing
│
├── database/
│   ├── connection.js        # PostgreSQL connection pool
│   ├── migrations/          # Sequelize migrations (30+ files)
│   └── seed-scripts/        # Data seeding scripts
│
└── utils/                   # Utility functions
    ├── validation.js
    ├── encryption.js
    └── format.js
```

**Request Flow (Backend)**:
```
HTTP Request
→ CORS Middleware
→ Body Parser
→ Authentication Middleware (JWT/Keycloak)
→ RBAC Middleware (Role check)
→ Audit Logger (Record action)
→ Route Handler
→ Controller (if present)
→ Service Layer (Business logic)
→ Database Query (PostgreSQL)
→ Response Formatting
→ Audit Logger (Record result)
→ HTTP Response
```

### Database Architecture

**PostgreSQL Schema Organization**:

**Core Tables**:
- `organizations` - Multi-tenant root
- `users` - User accounts
- `user_roles` - RBAC assignments
- `locations` - Organization locations
- `departments` - Department structure

**Clinical Tables**:
- `patients` - Patient demographics
- `practitioners` - Healthcare providers
- `appointments` - Scheduling
- `encounters` - Clinical visits
- `observations` - Vitals, labs
- `medications` - Prescriptions

**Specialty System Tables**:
- `org_specialty_settings` - Enabled specialty packs
- `specialty_pack_audits` - Pack configuration history
- `patient_specialty_episodes` - Episode tracking
- `specialty_visit_types` - Visit type definitions

**Country System Tables**:
- `country_packs` - Available country packs
- `org_country_settings` - Enabled country packs
- `country_modules` - Country-specific modules
- `org_enabled_modules` - Enabled modules per org
- `country_pack_audits` - Configuration history

**Forms System Tables**:
- `forms` - Form definitions
- `form_versions` - Versioning
- `form_responses` - Captured responses
- `form_sections` - Form structure

**Rule Engine Tables**:
- `rules` - Rule definitions
- `rule_conditions` - Rule logic
- `rule_actions` - Automated actions
- `rule_execution_log` - Execution history

**Billing Tables**:
- `billing_codes` - ICD-10, CPT codes
- `charges` - Encounter charges
- `claims` - Insurance claims
- `payments` - Payment tracking

**Audit & Compliance**:
- `audit_logs` - Comprehensive audit trail
- `fhir_audit_events` - FHIR AuditEvent resources
- `user_sessions` - Session tracking
- `mfa_devices` - 2FA devices

**Multi-Tenancy Pattern**:
```sql
-- Every table has org_id for isolation
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  first_name VARCHAR(100),
  -- ... other fields
  CONSTRAINT patients_org_unique UNIQUE (org_id, id)
);

-- Index on org_id for performance
CREATE INDEX idx_patients_org_id ON patients(org_id);

-- Row-level security (optional)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY patient_isolation ON patients
  USING (org_id = current_setting('app.current_org_id')::UUID);
```

### Authentication & Authorization

**Authentication Flow**:

**Option 1: Keycloak SSO (Recommended)**:
```
1. User visits login page
2. Redirect to Keycloak
3. User authenticates with Keycloak
4. Keycloak issues OAuth2 tokens
5. Frontend receives tokens
6. Frontend stores access token
7. Backend validates token on each request
8. Backend decodes user info from token
```

**Option 2: PostgreSQL Direct**:
```
1. User submits credentials
2. Backend queries users table
3. Compare bcrypt hashed password
4. Generate JWT token
5. Return JWT to frontend
6. Frontend stores token
7. Backend validates JWT on each request
```

**Authorization (RBAC)**:
```
User → Roles → Permissions

Roles:
- SUPER_ADMIN (system-wide)
- ORG_ADMIN (organization-level)
- PROVIDER (clinical)
- NURSE (clinical, limited)
- FRONT_DESK (scheduling, check-in)
- BILLING (financial)
- PATIENT (portal access)

Middleware checks:
req.user.roles → Check against route requirements
org_id → Ensure user belongs to organization
location_id → Optional location scoping
```

### Integration Architecture

**Integration Framework**:
```
External System Event
→ Webhook Endpoint
→ Integration Handler Registry
→ Handler Processing
→ Business Logic Service
→ Database Update
→ Event Broadcasting (Socket.IO)
→ Notification Service
→ Response to External System
```

**Available Integrations**:

**1. ABDM (India Health Records)**:
- Endpoint: `/api/abdm/*`
- Handler: `abdm.handler.js`
- Features: ABHA creation, health record linking, consent management

**2. ClaimMD (Medical Billing)**:
- Endpoint: `/api/billing/claimmd/*`
- Handler: `claimmd.handler.js`
- Features: Claim submission, status tracking, payment posting

**3. 100ms (Video Conferencing)**:
- Endpoint: `/api/virtual-meetings/*`
- Handler: Virtual meetings service
- Features: Room creation, token generation, recording

**4. Twilio (SMS/Voice)**:
- Service: `twilio.service.js`
- Features: Appointment reminders, 2FA codes, notifications

**5. Email (SMTP)**:
- Service: `email.service.js`
- Features: Appointment confirmations, password resets, reports

### Real-Time Communication

**Socket.IO Architecture**:
```
Backend:
io = socketIO(httpServer)
io.use(authenticateSocket)  // JWT validation
io.on('connection', (socket) => {
  socket.join(`org:${socket.user.orgId}`)
  socket.on('subscribe:patient', (patientId) => {
    socket.join(`patient:${patientId}`)
  })
})

Events:
- appointment:created
- task:assigned
- notification:new
- patient:updated
- encounter:closed

Frontend:
socket = io(API_URL, { auth: { token } })
socket.on('notification:new', (data) => {
  showNotification(data)
})
```

### Caching Strategy

**Redis Caching**:
```
Layer 1: API Response Cache
- Key: `api:${orgId}:${endpoint}:${params}`
- TTL: 5 minutes
- Use: Frequently accessed lists

Layer 2: Session Storage
- Key: `session:${sessionId}`
- TTL: Session duration
- Use: User session data

Layer 3: Rate Limiting
- Key: `ratelimit:${ip}:${endpoint}`
- TTL: 1 minute
- Use: API rate limiting

Layer 4: Specialty/Country Packs
- Key: `pack:${slug}:${version}`
- TTL: 1 hour
- Use: Pack configuration caching
```

### Security Architecture

**Security Layers**:

**1. Network Security**:
- HTTPS/TLS 1.3
- CORS configuration
- Helmet.js security headers
- Rate limiting

**2. Authentication**:
- JWT tokens (access + refresh)
- Keycloak SSO
- 2FA (TOTP)
- Session management

**3. Authorization**:
- Role-based access control (RBAC)
- Resource-level permissions
- Organization isolation

**4. Data Protection**:
- Encryption at rest (PostgreSQL)
- Encryption in transit (TLS)
- Sensitive data encryption (credentials)
- SQL parameterization

**5. Audit & Compliance**:
- Comprehensive audit logging
- FHIR AuditEvent resources
- PHI access tracking
- Immutable audit trail

### Deployment Architecture

**Development Environment**:
```
Docker Compose:
- PostgreSQL container (port 5432)
- Redis container (port 6379)
- Keycloak container (port 8080)
- Medplum container (port 8103)
- Backend runs locally (port 8000)
- Frontend runs locally (port 3000)
```

**Production Environment (Dokploy)**:
```
Load Balancer (Nginx)
→ ehr-web (Next.js) - Multiple instances
→ ehr-api (Express) - Multiple instances
→ PostgreSQL (Managed database)
→ Redis (Managed cache)
→ Keycloak (SSO server)

Features:
- Auto-scaling
- Health checks
- SSL/TLS termination
- Log aggregation
- Backup automation
```

### Performance Optimizations

**Backend Optimizations**:
- PostgreSQL connection pooling (max 20 connections)
- Redis caching for frequent queries
- Database query optimization (indexes, JOINs)
- API response compression
- Rate limiting to prevent abuse

**Frontend Optimizations**:
- Next.js Server Components
- Code splitting and lazy loading
- SWR data fetching with caching
- Image optimization
- Bundle size optimization

**Database Optimizations**:
- Proper indexing strategy
- Query optimization
- Connection pooling
- Prepared statements
- Materialized views (future)

### Monitoring & Observability

**Logging**:
- Application logs (console, files)
- Audit logs (database)
- Access logs (Nginx)
- Error logs (Sentry/future)

**Metrics** (Future):
- API response times
- Database query performance
- Cache hit rates
- Error rates
- User activity

**Health Checks**:
- `/health` endpoint
- Database connectivity
- Redis connectivity
- External service status

## Data Flow Examples

### 1. Patient Registration Flow
```
1. User fills registration form (ehr-web)
2. Form validation (client-side)
3. POST /api/patients (API call)
4. Authentication middleware (JWT check)
5. RBAC middleware (check PROVIDER/ADMIN role)
6. Audit logger (record action)
7. patient.service.create()
8. Validate data (Joi schema)
9. Create FHIR Patient resource
10. INSERT into patients table
11. Return patient object
12. Audit logger (record success)
13. Response to frontend
14. Update UI, show success message
```

### 2. Appointment Scheduling Flow
```
1. User searches available slots (ehr-web)
2. GET /api/appointments/availability
3. appointment.service.getAvailability()
4. Query practitioners' schedules
5. Filter existing appointments
6. Return available slots
7. User selects slot and confirms
8. POST /api/appointments
9. appointment.service.create()
10. Create FHIR Appointment resource
11. INSERT into appointments table
12. Trigger notification service
13. Send SMS/email confirmation (Twilio/SMTP)
14. Broadcast via Socket.IO
15. Response to frontend
16. Update calendar UI
```

### 3. Rule Execution Flow
```
1. Trigger event (e.g., lab result received)
2. Event handler calls rule-engine.service.evaluate()
3. Fetch active rules for event type
4. For each rule:
   a. Evaluate conditions (JSON Logic)
   b. If conditions met:
      - Execute actions (create task, send alert)
      - Log execution
      - Trigger notifications
5. Return execution summary
6. Broadcast updates via Socket.IO
```

## Technology Decisions

### Why Node.js/Express?
- JavaScript across frontend and backend
- Large ecosystem (npm)
- Excellent async I/O for healthcare integrations
- Strong FHIR library support

### Why Next.js/React?
- Server-side rendering for performance
- App Router for modern routing
- React ecosystem maturity
- TypeScript support

### Why PostgreSQL?
- ACID compliance for healthcare data
- JSONB for flexible FHIR resources
- Robust querying capabilities
- Row-level security for multi-tenancy

### Why Redis?
- Fast session storage
- API response caching
- Real-time features support
- Rate limiting

### Why Keycloak?
- Open-source SSO solution
- SAML/OAuth2/OIDC support
- Role management
- Multi-tenant ready

## Scalability Considerations

**Horizontal Scaling**:
- Stateless backend services
- Session storage in Redis (shared)
- Database connection pooling
- Load balancer ready

**Vertical Scaling**:
- Database optimization
- Index tuning
- Query optimization
- Caching strategy

**Future Microservices**:
- Billing service
- Integration service
- Notification service
- Analytics service

## Unresolved Questions

1. Microservices migration timeline and strategy?
2. Multi-region deployment for data residency?
3. CDN implementation for static assets?
4. Message queue (RabbitMQ/Kafka) for async processing?
5. Elasticsearch for advanced search capabilities?
6. GraphQL API layer for mobile apps?
7. Service mesh (Istio) for microservices orchestration?
8. Kubernetes migration from Dokploy?
9. Disaster recovery and failover strategy details?
10. Real-time analytics and business intelligence tools?
