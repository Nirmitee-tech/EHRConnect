# Project Overview & Product Development Requirements (PDR)

**Project Name**: EHRConnect
**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Status**: Active Development
**License**: MIT

## Executive Summary

EHRConnect is a comprehensive, FHIR R4-compliant Electronic Health Records (EHR) system designed for modern healthcare organizations. Built with scalability, security, and flexibility at its core, the platform supports multi-tenancy, specialty-specific clinical workflows, country-specific regulatory compliance, and extensive third-party integrations.

## Project Purpose

### Vision
Create a modern, interoperable, and customizable EHR platform that adapts to diverse healthcare settings, specialties, and regulatory environments while maintaining ease of use and clinical efficiency.

### Mission
Provide healthcare organizations with:
- FHIR-compliant health data management
- Specialty-specific clinical workflows without code changes
- Country-specific compliance and localization
- Seamless integration with external health systems
- Patient-centered care delivery tools
- Revenue cycle management capabilities
- Telehealth and remote care solutions

### Value Proposition
- **Clinical Efficiency**: Reduce documentation time with intelligent forms, templates, and automation
- **Interoperability**: FHIR R4 compliance enables seamless data exchange
- **Customization**: Specialty packs and country modules without custom development
- **Cost-Effective**: Open architecture reduces vendor lock-in
- **Scalability**: Multi-tenant architecture supports organizations of all sizes
- **Compliance**: Built-in support for HIPAA, GDPR, and country-specific regulations

## Target Users

### Primary Users

**1. Healthcare Providers**
- Physicians, nurses, medical assistants
- Specialty practitioners (OB/GYN, orthopedics, primary care)
- Administrative staff and front desk personnel
- Medical billing specialists

**2. Healthcare Organizations**
- Private practices (single and multi-location)
- Hospitals and hospital systems
- Specialty clinics
- Telehealth providers
- Community health centers

**3. Patients**
- Active patients seeking care
- Portal users managing appointments and records
- Remote patients using telehealth

**4. System Administrators**
- IT administrators managing infrastructure
- Clinical administrators configuring workflows
- Integration specialists connecting systems

### User Personas

**Persona 1: Dr. Sarah Chen, Primary Care Physician**
- **Needs**: Fast documentation, clear patient history, decision support
- **Pain Points**: Duplicate data entry, cluttered interfaces, slow systems
- **Solution**: SOAP note templates, smart forms, unified patient view, rule-based alerts

**Persona 2: Raj Patel, Practice Administrator**
- **Needs**: Multi-location management, compliance reporting, revenue tracking
- **Pain Points**: Manual billing, audit preparation, disparate systems
- **Solution**: ClaimMD integration, audit logs, dashboard analytics, role-based access

**Persona 3: Maria Rodriguez, OB/GYN Specialist**
- **Needs**: Prenatal tracking, episode-based care, pregnancy-specific forms
- **Pain Points**: Generic EHR doesn't support specialty workflows
- **Solution**: OB/GYN specialty pack with prenatal templates, EDD tracking, episode management

**Persona 4: John Smith, Patient**
- **Needs**: Easy appointment booking, access to medical records, telehealth
- **Pain Points**: Phone call booking only, can't see test results, travel for appointments
- **Solution**: Patient portal, appointment widget, virtual meetings, results viewing

**Persona 5: Priya Sharma, IT Administrator (India)**
- **Needs**: ABDM compliance, data localization, multilingual support
- **Pain Points**: Manual ABHA registration, compliance tracking
- **Solution**: India country pack with ABDM integration, Hindi/English support, audit trails

## Key Features & Capabilities

### 1. FHIR R4 Compliance
- Full FHIR R4 resource support (Patient, Practitioner, Organization, Appointment, Observation, etc.)
- FHIR Questionnaire for dynamic forms
- FHIR Consent for patient consent management
- FHIR AuditEvent for audit logging
- Integration with Medplum FHIR server
- RESTful FHIR API endpoints

### 2. Multi-Tenant Architecture
- Organization-level data isolation
- Location and department scoping
- Role-based access control (RBAC)
- Keycloak SSO integration
- Custom branding per organization
- Shared infrastructure, isolated data

### 3. Specialty Pack System
**Modular specialty workflows loaded at runtime**:
- **General Primary Care**: SOAP notes, intake forms, annual physicals
- **OB/GYN & Prenatal**: Pregnancy tracking, IVF, postpartum care
- **Orthopedics**: Surgical tracking, rehabilitation protocols
- **Wound Care**: Wound assessment, treatment plans

**Pack Components**:
- FHIR Questionnaire templates
- Visit type definitions
- Clinical workflows
- KPI dashboards
- Custom navigation items

### 4. Country-Specific Compliance
**Country pack system**:
- **India**: ABDM/ABHA integration (M1/M2/M3), Indian medical codes
- **United States**: HIPAA compliance, NPI lookup, Medicare/Medicaid
- **United Arab Emirates**: DHA/HAAD compliance, UAE regulations

**Features**:
- Regulatory compliance flags
- Localization (language, currency, timezone, formats)
- Data residency support
- Country-specific modules
- Audit trails for compliance

### 5. Dynamic Form Builder
- Visual drag-and-drop form builder
- FHIR Questionnaire-based architecture
- Form versioning with change tracking
- Draft and published states
- Form template library
- Conditional logic support
- Multi-section forms
- Field validation rules

### 6. Universal Rule Engine
- Visual rule builder with guided steps
- JSON Logic-based rule evaluation
- Event-driven triggers (patient admission, lab results, etc.)
- Automated task creation
- Clinical decision support
- Alert and notification triggers
- Rule testing and simulation
- Rule versioning

### 7. Patient Management
- Comprehensive patient demographics
- FHIR Patient resources
- Episode-based care tracking
- Patient timeline and history
- Multiple concurrent episodes
- Family relationships
- Insurance information
- Consent management

### 8. Appointment Scheduling
- Multi-provider scheduling
- Specialty-specific visit types
- Recurring appointment templates
- Patient self-scheduling widget
- Automated reminders (SMS/email)
- Virtual meeting integration
- Waitlist management
- Appointment search and filtering

### 9. Clinical Encounters
- Episode-scoped encounters
- SOAP note templates
- Vital signs capture
- Diagnosis coding (ICD-10)
- Procedure coding (CPT)
- Medication prescribing
- Lab orders and results
- Clinical notes and attachments

### 10. Telehealth Platform
- 100ms video conferencing integration
- Virtual waiting rooms
- Screen sharing and chat
- Meeting recording
- Guest access for patients
- Pre-meeting checks (camera/mic)
- In-meeting controls
- Post-meeting notes

### 11. Patient Portal
- Patient registration and login
- Appointment booking widget
- Medical records viewing
- Medication list
- Lab results access
- Document download
- Secure messaging (future)
- Payment portal (future)

### 12. Billing & Revenue Cycle Management
- ClaimMD integration for claims submission
- ICD-10 and CPT code management
- Charge capture
- Insurance verification
- Claim tracking and status
- Payment posting
- ERA/EOB processing
- Denial management

### 13. Inventory Management
- Product catalog
- Stock level tracking
- Purchase order management
- Vendor management
- Low stock alerts
- Usage tracking
- Expiry date monitoring
- Reorder point automation

### 14. Task Management
- Task creation and assignment
- Priority levels
- Due dates and reminders
- Status tracking (pending, in-progress, completed)
- Rule-based task automation
- Task templates
- Bulk task operations
- Task analytics

### 15. Audit & Compliance
- Comprehensive audit logging
- FHIR AuditEvent resources
- User action tracking
- Data access logs
- PHI access monitoring
- Compliance reporting
- Immutable audit trails
- Audit search and filtering

### 16. Internationalization (i18n)
- Multi-language support (English, Hindi, Arabic ready)
- Language detection
- RTL support preparation
- Translation management
- Currency formatting
- Date/time localization
- Number formatting

### 17. Real-Time Communication
- Socket.IO integration
- Live notifications
- Real-time dashboard updates
- Chat messaging infrastructure
- Presence indicators
- Event broadcasting

### 18. Integration Framework
- Webhook system
- RESTful API
- Integration registry
- Custom integration handlers
- ABDM integration (India)
- ClaimMD integration (US)
- Twilio SMS/Voice
- Email notifications
- Event-driven architecture

## Technical Requirements

### Functional Requirements

**FR1: User Management**
- User registration with email verification
- Multi-factor authentication (TOTP)
- Role-based access control
- Organization and team management
- User invitation system
- Session management
- Password reset workflow

**FR2: Patient Management**
- FHIR Patient resource CRUD operations
- Patient search with fuzzy matching
- Demographics management
- Episode tracking
- Insurance information
- Consent management
- Patient portal access

**FR3: Clinical Documentation**
- Encounter creation and management
- SOAP note templates
- Vital signs capture
- Diagnosis (ICD-10) and procedure (CPT) coding
- Medication prescribing
- Lab order and result management
- Clinical note attachments

**FR4: Appointment Scheduling**
- Multi-provider calendar
- Appointment booking (staff and patient)
- Availability search
- Recurring appointments
- Automated reminders
- Waitlist management
- Check-in workflow

**FR5: Form Management**
- Visual form builder
- FHIR Questionnaire generation
- Form versioning
- Template library
- Dynamic form rendering
- Conditional logic
- Form response capture

**FR6: Rule Engine**
- Visual rule builder
- Event-driven rule execution
- Task automation
- Alert generation
- Clinical decision support
- Rule testing and simulation

**FR7: Billing Operations**
- Charge capture
- Claim generation
- ClaimMD submission
- Claim status tracking
- Payment posting
- Statement generation

**FR8: Telehealth**
- Virtual meeting scheduling
- Video conference rooms
- Guest access links
- Screen sharing
- Meeting recording
- Post-meeting documentation

**FR9: Specialty Workflows**
- Runtime specialty pack loading
- Specialty-specific templates
- Episode-based care
- Custom visit types
- Specialty KPI dashboards

**FR10: Country Compliance**
- Country pack configuration
- ABDM integration (India)
- Regulatory compliance tracking
- Localization
- Data residency enforcement

**FR11: Integration**
- Webhook configuration
- FHIR API access
- Integration handler registration
- Event publishing
- External system authentication

**FR12: Reporting & Analytics**
- Dashboard widgets
- KPI visualization
- Custom report builder
- Data export
- Audit reports

### Non-Functional Requirements

**NFR1: Performance**
- API response time < 500ms (p95)
- Page load time < 3 seconds
- Concurrent users: 1000+ per organization
- Database query optimization
- Redis caching for frequent queries
- Connection pooling

**NFR2: Scalability**
- Horizontal scaling support
- Multi-tenant data isolation
- Efficient database indexing
- Stateless backend services
- Load balancing ready
- Microservices architecture (future)

**NFR3: Security**
- HIPAA compliance
- Data encryption at rest and in transit
- JWT-based authentication
- RBAC authorization
- Audit logging for PHI access
- Rate limiting
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet security headers

**NFR4: Availability**
- 99.9% uptime SLA
- Automated health checks
- Database backup (daily)
- Disaster recovery plan
- Multi-region deployment (future)

**NFR5: Maintainability**
- Modular codebase
- Comprehensive documentation
- Type safety (TypeScript)
- Code comments
- Migration scripts
- Version control (Git)
- Automated testing

**NFR6: Usability**
- Intuitive user interface
- Mobile-responsive design
- Accessibility (WCAG 2.1 AA target)
- Consistent design system
- Keyboard navigation
- Screen reader support

**NFR7: Interoperability**
- FHIR R4 compliance
- HL7 standards adherence
- RESTful API
- Standard terminologies (ICD-10, CPT, LOINC)
- OAuth 2.0 for integrations

**NFR8: Compliance**
- HIPAA (US)
- GDPR (EU)
- PIPL (China - future)
- ABDM (India)
- DHA/HAAD (UAE)
- Audit trail completeness
- Data retention policies

## Success Metrics

### Adoption Metrics
- Number of organizations onboarded
- Active users per organization
- Patient portal registrations
- Appointment booking rate (online vs phone)
- Telehealth session volume
- Form completion rate

### Performance Metrics
- Average API response time: < 500ms
- Page load time: < 3 seconds
- System uptime: > 99.9%
- Concurrent users supported: 1000+
- Database query performance: < 200ms (p95)

### Quality Metrics
- Bug report rate: < 5 per release
- Test coverage: > 70%
- Security vulnerabilities: 0 critical, < 3 high
- Code review completion: 100%
- Documentation coverage: > 80%

### Clinical Efficiency Metrics
- Average encounter documentation time: 20% reduction
- Form completion time: 30% reduction
- Appointment no-show rate: 15% reduction (via reminders)
- Billing claim submission time: 50% reduction
- Task completion rate: > 90%

### User Satisfaction Metrics
- Provider satisfaction score: > 4.0/5.0
- Patient portal satisfaction: > 4.2/5.0
- Admin usability score: > 4.0/5.0
- Support ticket resolution time: < 24 hours
- Feature request implementation rate: > 60%

### Business Metrics
- Revenue cycle improvement: 25% reduction in days to payment
- Claim denial rate: < 5%
- Inventory cost reduction: 15%
- Patient retention rate: > 85%
- Referral rate: > 30%

## Technical Architecture

### System Architecture
```
┌─────────────────────────────────────────────────┐
│           EHRConnect Frontend (ehr-web)          │
│     Next.js 15 + React 19 + TypeScript           │
│     Port: 3000                                    │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS/API Calls
┌───────────────────┴─────────────────────────────┐
│          EHRConnect Backend (ehr-api)            │
│     Node.js + Express + PostgreSQL               │
│     Port: 8000                                    │
├──────────────────────────────────────────────────┤
│  Routes → Controllers → Services → Database       │
│  Middleware: Auth, RBAC, Audit, Rate Limit       │
└───────┬──────────────────────┬───────────────────┘
        │                      │
        │                      │ WebSocket
┌───────┴────────┐     ┌──────┴──────┐
│   PostgreSQL    │     │   Redis     │
│   (Primary DB)  │     │   (Cache)   │
└────────────────┘     └─────────────┘

┌─────────────────────────────────────────────────┐
│              External Systems                    │
├──────────────┬──────────────┬───────────────────┤
│  Keycloak    │  Medplum     │  Integrations     │
│  (SSO/IAM)   │  (FHIR)      │  (ClaimMD, ABDM)  │
└──────────────┴──────────────┴───────────────────┘
```

### Core Components

**1. Backend Services (ehr-api/src/services/)**
- Authentication & Authorization
- Patient & Provider Management
- Appointment Scheduling
- Clinical Documentation
- Form Management
- Rule Engine
- Billing & RCM
- Inventory Management
- Task Management
- Integration Orchestration
- Audit Logging
- Notification System

**2. Frontend Application (ehr-web/src/)**
- Next.js App Router pages
- Reusable React components
- Context providers for global state
- API client services
- Custom hooks
- TypeScript type definitions

**3. Database Layer (PostgreSQL)**
- Multi-tenant data isolation
- FHIR resource storage
- Audit tables
- Specialty and country settings
- Integration configurations

**4. Caching Layer (Redis)**
- Session storage
- API response caching
- Rate limiting counters
- Real-time data

**5. Authentication Layer (Keycloak)**
- Single Sign-On (SSO)
- User management
- Role mapping
- OAuth 2.0 provider

**6. FHIR Server (Medplum)**
- FHIR R4 resource storage
- FHIR API endpoints
- Resource validation
- Terminology services

### Technology Stack

**Backend**:
- Node.js 18+, Express.js 4.18
- PostgreSQL 8.11, Sequelize 6.37
- Redis 5.9, Socket.IO 4.8
- Keycloak, JWT, bcryptjs
- Jest 29.6, Supertest 6.3

**Frontend**:
- Next.js 15.5, React 19.1, TypeScript 5
- Tailwind CSS 4, Radix UI
- @medplum/react 4.4, @100mslive/react-sdk
- next-auth 4.24, Zustand 5.0
- SWR 2.3, i18next 25.6

**Infrastructure**:
- Docker & Docker Compose
- Dokploy (deployment platform)
- Nginx (reverse proxy)
- PostgreSQL (database)
- Redis (cache)

**Integrations**:
- ABDM (India health records)
- ClaimMD (medical billing)
- 100ms (video conferencing)
- Twilio (SMS/voice)
- Nodemailer (email)

### Data Flow

**1. Patient Encounter Flow**
```
Patient Check-In → Create/Update Patient Resource → Start Encounter
→ Fill SOAP Note → Add Diagnosis/Procedures → Prescribe Medications
→ Order Labs → Close Encounter → Generate Billing Charges → Submit Claim
```

**2. Form Response Flow**
```
Load Form Template → Render FHIR Questionnaire → Capture Responses
→ Validate Responses → Create QuestionnaireResponse → Store in FHIR
→ Trigger Rules (if configured) → Generate Tasks/Alerts
```

**3. Rule Execution Flow**
```
Event Occurs (e.g., Lab Result Received) → Rule Engine Evaluates Conditions
→ Conditions Met → Execute Actions (Create Task, Send Alert)
→ Audit Log Entry → Notification to User
```

**4. Telehealth Flow**
```
Schedule Appointment → Generate Meeting Link → Send to Patient
→ Patient Joins → Provider Joins → Conduct Video Consult
→ End Meeting → Document Encounter → Follow-up Tasks
```

## Use Cases

### UC1: Patient Registration
**Actor**: Front desk staff
**Goal**: Register new patient
**Flow**:
1. Navigate to Patients page
2. Click "Add Patient"
3. Fill demographics form
4. Add insurance information
5. Capture consent
6. Save patient
7. System creates FHIR Patient resource
8. Patient appears in patient list

**Outcome**: Patient registered with unique ID

### UC2: Appointment Scheduling
**Actor**: Scheduling coordinator
**Goal**: Schedule patient appointment
**Flow**:
1. Search for patient
2. Select patient
3. Choose specialty/provider
4. Select appointment type
5. Search available slots
6. Select date/time
7. Confirm appointment
8. System sends confirmation (email/SMS)

**Outcome**: Appointment booked, confirmation sent

### UC3: Clinical Encounter Documentation
**Actor**: Physician
**Goal**: Document patient visit
**Flow**:
1. Check patient in
2. Start encounter
3. Fill SOAP note template
4. Add vitals
5. Add diagnosis (ICD-10 codes)
6. Add procedures (CPT codes)
7. Prescribe medications
8. Order labs
9. Close encounter
10. System generates billing charges

**Outcome**: Encounter documented, charges generated

### UC4: Form Creation
**Actor**: Clinical administrator
**Goal**: Create intake form for new specialty
**Flow**:
1. Navigate to Forms module
2. Click "Create Form"
3. Add form metadata (title, description)
4. Add sections
5. Add questions with validation rules
6. Configure conditional logic
7. Preview form
8. Publish form
9. System generates FHIR Questionnaire

**Outcome**: Form available for use

### UC5: Rule-Based Task Automation
**Actor**: Administrator
**Goal**: Automate follow-up tasks
**Flow**:
1. Navigate to Rules module
2. Create new rule
3. Define trigger (e.g., "Lab result critical")
4. Define conditions (e.g., "HbA1c > 9")
5. Define action (e.g., "Create task for care coordinator")
6. Test rule
7. Activate rule
8. System monitors events and executes rule

**Outcome**: Tasks auto-created when conditions met

### UC6: Telehealth Consultation
**Actor**: Provider and Patient
**Goal**: Conduct virtual visit
**Flow**:
1. Provider schedules telehealth appointment
2. System generates meeting link
3. Patient receives link via email/SMS
4. Patient clicks link, joins waiting room
5. Provider joins meeting
6. Conduct video consultation
7. Provider documents encounter
8. End meeting
9. System archives recording (if enabled)

**Outcome**: Virtual visit completed, documented

### UC7: Billing Claim Submission
**Actor**: Billing specialist
**Goal**: Submit insurance claim
**Flow**:
1. Navigate to completed encounters
2. Review charges
3. Verify insurance information
4. Generate claim
5. Submit to ClaimMD
6. Track claim status
7. Receive payment posting
8. Close claim

**Outcome**: Claim submitted and paid

### UC8: Patient Portal Access
**Actor**: Patient
**Goal**: Book appointment and view records
**Flow**:
1. Navigate to patient portal
2. Register/login
3. View upcoming appointments
4. Book new appointment
5. View medical records
6. View lab results
7. Download documents

**Outcome**: Patient self-service completed

## Constraints & Limitations

### Technical Constraints
- Requires modern web browsers (Chrome, Firefox, Safari, Edge)
- Minimum screen resolution: 1280x720
- Node.js 18+ runtime
- PostgreSQL 12+ database
- Redis 6+ for caching
- Keycloak 20+ for SSO

### Operational Constraints
- Internet connectivity required
- SMTP server for email notifications
- Twilio account for SMS (optional)
- 100ms account for telehealth (optional)
- ClaimMD account for billing (optional)
- ABDM credentials for India (optional)

### Design Constraints
- Multi-tenant architecture limits certain customizations
- FHIR compliance restricts some data model changes
- Specialty pack system requires structured pack format
- Country pack system requires adherence to schema

### Regulatory Constraints
- HIPAA compliance (US)
- GDPR compliance (EU)
- ABDM compliance (India)
- Data residency requirements vary by country

## Risks & Mitigation

### Risk 1: Data Security Breach
**Impact**: Critical
**Likelihood**: Low
**Mitigation**: Encryption, RBAC, audit logging, penetration testing, security training

### Risk 2: FHIR Interoperability Issues
**Impact**: High
**Likelihood**: Medium
**Mitigation**: Medplum FHIR server, extensive testing, conformance validation

### Risk 3: Performance Degradation
**Impact**: High
**Likelihood**: Medium
**Mitigation**: Redis caching, database indexing, connection pooling, load testing

### Risk 4: Integration Failures
**Impact**: Medium
**Likelihood**: Medium
**Mitigation**: Retry logic, error handling, monitoring, fallback mechanisms

### Risk 5: Regulatory Non-Compliance
**Impact**: Critical
**Likelihood**: Low
**Mitigation**: Compliance reviews, audit trails, legal consultation, certifications

### Risk 6: User Adoption Resistance
**Impact**: Medium
**Likelihood**: High
**Mitigation**: User training, intuitive UX, incremental rollout, support resources

## Future Roadmap

### Phase 1: Foundation (Complete)
- ✅ FHIR R4 compliance
- ✅ Multi-tenancy
- ✅ Specialty pack system
- ✅ Country pack system
- ✅ Form builder
- ✅ Rule engine
- ✅ Telehealth
- ✅ Patient portal
- ✅ Billing integration

### Phase 2: Enhancement (Current - Q1 2026)
- 🔄 Advanced clinical decision support
- 🔄 Mobile application (React Native)
- 🔄 Enhanced telehealth (breakout rooms, polls)
- 🔄 Advanced analytics and reporting
- 🔄 HL7 v2 integration
- 🔄 CCD/CCDA document generation

### Phase 3: Expansion (Q2-Q3 2026)
- 📋 Additional specialty packs (Cardiology, Pediatrics, Dental)
- 📋 Additional country packs (Canada, Australia, UK)
- 📋 Patient engagement tools (secure messaging, education)
- 📋 Population health management
- 📋 Care coordination tools
- 📋 Medication reconciliation

### Phase 4: Advanced Features (Q4 2026+)
- 📋 AI-powered clinical documentation
- 📋 Predictive analytics
- 📋 Voice-to-text documentation
- 📋 Blockchain for consent management
- 📋 IoT device integration (wearables, monitors)
- 📋 Advanced interoperability (FHIR subscriptions, bulk data)

## Dependencies & Integration

### Required Dependencies
- Node.js runtime
- PostgreSQL database
- Redis cache
- Web browser (modern)

### Optional Dependencies
- Keycloak (SSO, recommended)
- Medplum (FHIR server, recommended)
- ClaimMD (billing, optional)
- 100ms (telehealth, optional)
- Twilio (SMS, optional)
- ABDM (India, optional)

### Integrations
- FHIR R4 API
- HL7 v2 (future)
- ClaimMD EDI
- ABDM gateways
- OAuth 2.0 providers
- Webhook endpoints

## Compliance & Standards

### Healthcare Standards
- FHIR R4
- HL7 v2 (future)
- ICD-10 (diagnosis codes)
- CPT (procedure codes)
- LOINC (lab codes)
- RxNorm (medications)
- SNOMED CT (clinical terminology)

### Regulatory Compliance
- HIPAA (US)
- GDPR (EU)
- PIPL (China - future)
- ABDM (India)
- DHA/HAAD (UAE)

### Security Standards
- OWASP Top 10
- OAuth 2.0
- JWT
- TLS 1.3
- AES-256 encryption

### Coding Standards
- YANGI (You Aren't Gonna Need It)
- KISS (Keep It Simple, Stupid)
- DRY (Don't Repeat Yourself)
- Conventional commits
- TypeScript strict mode

## Glossary

- **FHIR**: Fast Healthcare Interoperability Resources
- **EHR**: Electronic Health Records
- **PHI**: Protected Health Information
- **RBAC**: Role-Based Access Control
- **SSO**: Single Sign-On
- **SOAP**: Subjective, Objective, Assessment, Plan (clinical note format)
- **ICD-10**: International Classification of Diseases, 10th Revision
- **CPT**: Current Procedural Terminology
- **LOINC**: Logical Observation Identifiers Names and Codes
- **HIPAA**: Health Insurance Portability and Accountability Act
- **GDPR**: General Data Protection Regulation
- **ABDM**: Ayushman Bharat Digital Mission (India)
- **ABHA**: Ayushman Bharat Health Account (India health ID)
- **DHA**: Dubai Health Authority
- **HAAD**: Health Authority Abu Dhabi
- **RCM**: Revenue Cycle Management
- **ERA**: Electronic Remittance Advice
- **EOB**: Explanation of Benefits
- **NPI**: National Provider Identifier

## Appendix

### Related Documentation
- [Codebase Summary](./codebase-summary.md)
- [Code Standards](./code-standards.md)
- [System Architecture](./system-architecture.md)
- [Project Roadmap](./project-roadmap.md)
- [Country-Specific Implementation](../COUNTRY_SPECIFIC_IMPLEMENTATION_SUMMARY.md)
- [Specialty Implementation](../SPECIALTY_IMPLEMENTATION_SUMMARY.md)

### External Resources
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Medplum Documentation](https://www.medplum.com/docs)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Next.js Documentation](https://nextjs.org/docs)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)

### Support & Community
- GitHub Repository: (To be added)
- Documentation Site: (To be added)
- Support Email: (To be added)
- Community Forum: (To be added)

## Unresolved Questions

1. **Production Deployment**: What is the target cloud provider for production (AWS, Azure, GCP)?
2. **Certification**: Which certification paths are priorities (ONC, Drummond, CCHIT)?
3. **Backup Strategy**: What is the backup frequency and retention policy?
4. **Disaster Recovery**: What is the RTO (Recovery Time Objective) and RPO (Recovery Point Objective)?
5. **Licensing Model**: Will this be open-source, proprietary, or dual-licensed?
6. **Mobile Strategy**: iOS/Android native apps or React Native?
7. **HL7 v2**: Which HL7 message types are priorities (ADT, ORM, ORU)?
8. **AI Features**: Which AI capabilities are near-term priorities?
9. **Multi-Region**: Which regions/countries are expansion priorities?
10. **API Rate Limits**: What are the API rate limit tiers for different user types?
