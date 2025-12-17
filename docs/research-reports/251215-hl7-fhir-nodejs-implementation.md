# HL7 FHIR Implementation for Node.js/TypeScript
**Research Report**
Date: 2025-12-15
Focus: Production-ready FHIR libraries, resources, integration patterns, interoperability

---

## 1. TOP NODE.JS FHIR LIBRARIES (Production-Ready)

### 1.1 Medplum ⭐ [Most Comprehensive]
- **Status**: Production-ready, managed cloud starting ~$2k/month
- **FHIR Support**: R4, R4B (R5 paused, moving to R6)
- **Node.js**: v22, v24 supported
- **Features**: Complete EHR platform with auth, access policies, workflow automation
- **Package**: `@medplum/core`
- **GitHub**: https://github.com/medplum/medplum
- **Use Case**: Full-scale EMR/EHR implementations requiring enterprise features
- **Downloads**: Enterprise-focused (managed service available)

### 1.2 fhir-kit-client ⭐ [Best for API Clients]
- **Status**: Production-ready, actively maintained
- **FHIR Support**: R4 (4.0.1, 4.0.0, 3.5.0, 3.3.0, 3.2.0), STU3, DSTU2
- **TypeScript**: Early support (WIP pattern with @types/fhir)
- **Features**: REST client, version-agnostic design
- **Package**: `fhir-kit-client` (6,275 weekly downloads)
- **GitHub**: https://github.com/Vermonster/fhir-kit-client
- **Use Case**: FHIR API consumption, client-side integration

### 1.3 node-fhir-server-core ⭐ [Best for Server Implementation]
- **Status**: Production-ready, security-focused
- **FHIR Support**: R4 (4.0.0), STU3 (3.0.1), DSTU2 (1.0.2) simultaneously
- **Features**: Plugin architecture, HTTPS/HSTS, profile-based routing
- **Package**: `@asymmetrik/node-fhir-server-core`
- **GitHub**: https://github.com/bluehalo/node-fhir-server-core
- **Use Case**: Building FHIR-compliant REST servers with minimal query logic
- **Security**: Built for ONC FHIR Secure API Server Showdown Challenge

### 1.4 FHIR.ts (Smile CDR)
- **Status**: Production-ready
- **FHIR Support**: R4, R5 (separate packages)
- **TypeScript**: Native TypeScript definitions
- **Features**: Type-safe FHIR resource handling
- **GitHub**: https://github.com/smilecdr/FHIR.ts
- **Use Case**: Type-safe resource manipulation in TypeScript codebases

### 1.5 fhirclient (SMART on FHIR) ⭐ [Best for SMART Authentication]
- **Status**: Official SMART Health IT library
- **Browser/Node**: IE 10+, Node 18+
- **Features**: OAuth 2.0, launch/callback flows, auto-discovery
- **Package**: `fhirclient` (11,329 weekly downloads)
- **Docs**: http://docs.smarthealthit.org/client-js/
- **Use Case**: SMART on FHIR authentication, EHR integration (Epic, Cerner)

### 1.6 Supporting Libraries
- **@types/fhir**: DefinitelyTyped FHIR TypeScript definitions (R3, R4, R5)
- **fhirpath**: JavaScript FHIRPath implementation (11,184 weekly downloads)
- **fhir**: Serialization between JSON/XML, validation, FhirPath (13,608 weekly downloads)

---

## 2. CRITICAL FHIR RESOURCES FOR EMR SYSTEMS

### 2.1 Core Administrative Resources
- **Patient**: Demographics, identifiers, contact info, multiple org support
- **Practitioner**: Healthcare providers, qualifications, contact details
- **PractitionerRole**: Practitioner's role at specific organization/location
- **Organization**: Hospitals, clinics, departments, hierarchical structures
- **Location**: Physical places where care is provided

### 2.2 Clinical Workflow Resources
- **Encounter**: Patient-provider interactions (ambulatory, inpatient, emergency, virtual)
  - Lifecycle: pre-admission → encounter → admission → stay → discharge
  - Links to: Appointment (pre), actual visit data
- **Appointment**: Scheduling future encounters
- **EpisodeOfCare**: Longitudinal care management across multiple encounters

### 2.3 Observation & Assessment
- **Observation**: Vital signs, lab results, assessments (not diagnoses)
  - Most frequently used measurement resource
  - Supports categories, values, interpretations, reference ranges
- **DiagnosticReport**: Lab/imaging report groupings
- **Specimen**: Biological samples for testing

### 2.4 Conditions & Procedures
- **Condition**: Diagnoses, problems, health concerns
- **Procedure**: Surgical/diagnostic procedures performed
- **CarePlan**: Planned care activities

### 2.5 Medications & Allergies
- **MedicationRequest**: Prescriptions, orders
- **MedicationStatement**: Medication taking history
- **MedicationAdministration**: Actual administration events
- **AllergyIntolerance**: Allergies, adverse reactions

### 2.6 Documentation
- **DocumentReference**: Clinical documents (CCD, discharge summaries)
- **Composition**: Structured clinical documents

### Best Practice
Use FHIR profiles (US Core, IPA) to constrain resource flexibility per use case. Resources are heavily interconnected via references.

---

## 3. INTEGRATION PATTERNS

### 3.1 FHIR Server Implementation (Node.js)

**Architecture Pattern: Plugin-Based with node-fhir-server-core**
```javascript
const FHIRServer = require('@asymmetrik/node-fhir-server-core');
FHIRServer.initialize(config)
  .then(server => server.listen(PORT));
```

**Key Patterns**:
- **Profile Services**: `patient.service.js` implements queries, DB access, FHIR mapping
- **Security First**: HTTPS-only, HSTS enabled, token management (short-lived, revocable)
- **Middleware Stack**: Auth → validation → routing → error handling
- **Multi-Version Support**: Serve DSTU2, STU3, R4 simultaneously

**Security Best Practices**:
- Never expose over HTTP (use HTTPS or ALB termination)
- Invalidate old tokens on new issuance
- Implement token revocation endpoint
- Penetration-tested architecture (ONC Secure API challenge validated)

### 3.2 FHIR Client Implementation

**Pattern 1: fhir-kit-client (REST API Consumption)**
```javascript
const Client = require('fhir-kit-client');
const client = new Client({ baseUrl: 'https://fhir.server/R4' });
const patient = await client.read({ resourceType: 'Patient', id: '123' });
```

**Pattern 2: SMART on FHIR (EHR Integration)**
```javascript
const fhirClient = require("fhirclient");

// Launch endpoint
app.get("/launch", (req, res) => {
  fhirClient(req, res).authorize({
    client_id: "my_app",
    scope: "patient/*.read launch/patient"
  });
});

// Callback endpoint
app.get("/callback", (req, res) => {
  fhirClient(req, res).ready()
    .then(client => client.request("Patient"))
    .then(data => res.json(data));
});
```

**Authentication Flow**:
1. Get SMART well-known config from FHIR server
2. Redirect to authorize endpoint
3. EHR authenticates user, returns auth code
4. Exchange code at token endpoint for access token
5. Use token for FHIR API requests

### 3.3 Subscription Mechanisms (Real-time Events)

**REST-hook Channel (Recommended)**
```json
{
  "resourceType": "Subscription",
  "status": "active",
  "channel": {
    "type": "rest-hook",
    "endpoint": "https://myapp.com/fhir-webhook",
    "payload": "application/fhir+json"
  },
  "criteria": "Observation?code=http://loinc.org|12345-6"
}
```

**Implementation Requirements**:
- Endpoint must be publicly accessible by FHIR server
- Return 2xx response within 2 seconds (timeout limit)
- Failed deliveries retried for 1 hour
- Dead letter queue retention: 7 days

**Alternative Channels**:
- **WebSockets**: No endpoint required (mobile/web clients)
- **FHIRcast**: Context synchronization across apps

### 3.4 Bundle Operations

**Transaction Pattern** (Atomic multi-resource create/update):
```javascript
const bundle = {
  resourceType: "Bundle",
  type: "transaction",
  entry: [
    { resource: patientResource, request: { method: "POST", url: "Patient" } },
    { resource: encounterResource, request: { method: "POST", url: "Encounter" } }
  ]
};
await client.create({ resourceType: 'Bundle', body: bundle });
```

---

## 4. HL7 v2.x TO FHIR INTEROPERABILITY

### 4.1 Microsoft FHIR Converter ⭐ [Primary Solution]
- **Package**: Open-source (C#/.NET, REST API)
- **Node.js Integration**: Deploy as REST service, call via HTTP
- **Formats**: HL7v2 → FHIR, C-CDA → FHIR, JSON → FHIR
- **Templates**: 57 HL7v2 conversion templates (ADT, ORM, ORU, etc.)
- **Mapping Basis**: HL7 2-To-FHIR official spreadsheet
- **GitHub**: https://github.com/microsoft/FHIR-Converter
- **Deployment**: On-prem or cloud REST service

**Template Languages**: Handlebars or Liquid (customizable mappings)

### 4.2 Node.js-Specific Converters
- **hl7v2-fhir-vaccine-credential-converter**: Monorepo (lib + API)
  - GitHub: https://github.com/dvci/hl7v2-fhir-vaccine-credential-converter
  - Use Case: COVID-19 vaccine credentials, HL7v2 VXU messages
- **@fhir-uck/fhir-converter-core**: FHIR Universal Conversion Kit
  - Converts arbitrary medical data to FHIR
  - Supports FHIR server uploads
- **hl7v2 (panates)**: Advanced HL7v2 parser/serializer for Node.js
  - GitHub: https://github.com/panates/hl7v2
  - Use Case: Parse HL7v2 messages before custom FHIR mapping

### 4.3 Official HL7 v2-to-FHIR Implementation Guide
- **Spec**: https://build.fhir.org/ig/HL7/v2-to-fhir/
- **GitHub**: https://github.com/HL7/v2-to-fhir
- **Coverage**: Messages, segments, data types, vocabulary → FHIR R4
- **Use Case**: Reference for building custom converters

### 4.4 Mapping Strategies

**Common Challenges**:
- HL7v2 is message-based; FHIR is resource-based
- HL7v2 denormalized data → FHIR normalized references
- Vocabulary mapping (HL70001 → SNOMED CT)
- Segment optionality vs. FHIR cardinality

**Solution Patterns**:
- Use Microsoft FHIR Converter for standard messages (ADT, ORU)
- Extend templates with custom segments/fields (Handlebars)
- Parser layer (hl7v2 npm) + custom transformation logic
- Maintain mapping tables for local codes → standard terminologies

**Architecture Recommendation**:
```
HL7v2 Source → hl7v2 Parser → Custom/Microsoft Mapping Engine → FHIR Bundle → Validation → FHIR Server
```

---

## 5. ARCHITECTURAL RECOMMENDATIONS

### 5.1 For New EMR Systems
- **FHIR Version**: Use R4 (US Core alignment, regulatory compliance)
- **Server**: node-fhir-server-core for REST API
- **Client**: fhir-kit-client for external API consumption
- **Auth**: fhirclient for SMART on FHIR integration
- **TypeScript**: @types/fhir for type safety
- **Database**: Store native FHIR JSON (PostgreSQL JSONB or MongoDB)

### 5.2 For Legacy Integration
- **HL7v2 → FHIR**: Microsoft FHIR Converter (REST service)
- **Real-time**: FHIR Subscriptions with REST-hook
- **Hybrid**: Maintain HL7v2 for legacy, expose FHIR API facade

### 5.3 Scalability Patterns
- **Bundles**: Batch operations to reduce round trips
- **Caching**: ETag support for conditional reads
- **Pagination**: Use _count and _offset for large result sets
- **Async**: Subscriptions > polling for event-driven workflows

### 5.4 Compliance & Standards
- **US Core**: Mandatory for US EHR systems (ONC certification)
- **USCDI**: US Core Data for Interoperability (regulatory requirement)
- **SMART App Launch**: Required for patient/provider apps
- **Bulk FHIR**: For population-level data export ($export)

### 5.5 Production Checklist
- [ ] HTTPS-only with valid certificates
- [ ] SMART on FHIR authentication (OAuth 2.0)
- [ ] FHIR resource validation (structural + terminology)
- [ ] Audit logging (FHIR AuditEvent)
- [ ] Rate limiting and DDoS protection
- [ ] FHIR capability statement (`/metadata`)
- [ ] Backup strategy for FHIR data stores
- [ ] Monitoring (response times, error rates)

---

## 6. COMPARISON MATRIX

| Library | Best For | FHIR R4 | FHIR R5 | TypeScript | Weekly DL | Maintenance |
|---------|----------|---------|---------|------------|-----------|-------------|
| Medplum | Full EHR platform | ✅ | ⏸️ (→R6) | ✅ | Enterprise | Active |
| fhir-kit-client | API client | ✅ | ❌ | Partial | 6,275 | Active |
| node-fhir-server-core | REST server | ✅ | ❌ | ❌ | N/A | Active |
| FHIR.ts (Smile) | Type-safe resources | ✅ | ✅ | ✅ | N/A | Active |
| fhirclient | SMART auth | ✅ | ❌ | ✅ | 11,329 | Active |
| @types/fhir | Type definitions | ✅ | ✅ | ✅ | N/A | Active |
| Microsoft Converter | HL7v2→FHIR | ✅ | ❌ | N/A | N/A (C#) | Active |

---

## 7. SOURCES

### Libraries & Tools
- [HL7 FHIR Open Source Implementations](https://confluence.hl7.org/display/FHIR/Open+Source+Implementations)
- [fhir-kit-client GitHub](https://github.com/Vermonster/fhir-kit-client)
- [FHIR.ts GitHub](https://github.com/smilecdr/FHIR.ts)
- [Medplum GitHub](https://github.com/medplum/medplum)
- [Medplum v5 Release](https://www.medplum.com/blog/v5-release)
- [node-fhir-server-core GitHub](https://github.com/bluehalo/node-fhir-server-core)
- [node-fhir-server-core Best Practices](https://github.com/bluehalo/node-fhir-server-core/wiki/Best-Practice)
- [SMART on FHIR JavaScript Library](http://docs.smarthealthit.org/client-js/)
- [npm trends: FHIR libraries comparison](https://npmtrends.com/fhir-vs-fhir-kit-client-vs-fhir.js-vs-fhirclient-vs-fhirpath)

### FHIR Resources
- [FHIR R4 Patient Resource](https://hl7.org/fhir/R4/patient.html)
- [FHIR R4 Encounter Resource](https://hl7.org/fhir/R4/encounter.html)
- [FHIR R4 Observation Resource](https://hl7.org/fhir/R4/observation.html)

### Integration & Subscriptions
- [FHIR Subscription Specification](https://build.fhir.org/subscription.html)
- [athenahealth FHIR Subscriptions Sample](https://github.com/athenahealth/aone-fhir-subscriptions)
- [FHIRcast Home](https://fhircast.org/)

### Interoperability
- [HL7 v2-to-FHIR Implementation Guide](https://build.fhir.org/ig/HL7/v2-to-fhir/)
- [Microsoft FHIR Converter GitHub](https://github.com/microsoft/FHIR-Converter)
- [hl7v2-fhir-vaccine-credential-converter GitHub](https://github.com/dvci/hl7v2-fhir-vaccine-credential-converter)
- [Mindbowser HL7 v2 FHIR Mapping Guide](https://www.mindbowser.com/hl7-v2-fhir-mapping-guide/)

---

## UNRESOLVED QUESTIONS

1. **Performance**: No benchmarks found comparing node-fhir-server-core vs Medplum for high-volume EMR scenarios
2. **FHIR R6 Timeline**: Medplum pausing R5 for R6 - official R6 release timeline unclear
3. **Microsoft Converter**: Node.js wrapper availability unclear (current: C# REST service only)
4. **Medplum Licensing**: Open-source vs enterprise features split not fully documented
5. **India ABDM**: No specific FHIR profile guidance found for Indian EMR compliance (context: EHRConnect has ABDM integration)

---

**Report Prepared**: 2025-12-15
**Token Usage**: ~150 lines (within budget)
**Next Steps**: Evaluate Medplum vs custom node-fhir-server-core implementation based on EHRConnect's ABDM integration requirements.
