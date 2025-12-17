# Phase 03: FHIR R4 Core

**Phase**: 03/07
**Status**: Pending
**Priority**: P0 (Blocker)
**Estimated Effort**: 3-4 days
**Dependencies**: Phase 01 (Module Foundation)

## Overview

Enhance existing FHIR R4 implementation with client library, profile-based validation (US Core, ABDM, Custom), advanced search parameters, batch operations, and integration with Medplum FHIR server.

## Key Insights from Research

- Existing FHIR routes handle Patient, Organization, Practitioner, Appointment, Task (lines 276-286 in fhir.js)
- Basic validation checks resourceType only (lines 13-26)
- Generic resource storage in `fhir_resources` table
- Socket.IO events for appointment changes (lines 107-229)
- Medplum FHIR server available at port 8103

## Requirements

### Functional
- **Client**: REST operations (create, read, update, delete, search) for any resource type
- **Validation**: Profile-based validation (US Core, ABDM profiles, custom)
- **Search**: Support common search parameters (_id, _lastUpdated, _tag, _profile)
- **Advanced Search**: Chaining, reverse chaining, modifiers (:exact, :contains, :missing)
- **Batch/Transaction**: Process Bundle resources atomically
- **History**: Resource versioning and history tracking
- **Profiles**: US Core Patient, Observation, MedicationRequest; ABDM profiles

### Non-Functional
- Support all 145 FHIR R4 resource types
- <50ms p95 latency for read operations
- <200ms p95 latency for search with 100 results
- Profile validation <10ms per resource
- Batch processing up to 100 entries
- 99.9% uptime for FHIR endpoints

## Architecture

### Component Design

```
FHIR Module Architecture:

┌─────────────────────────────────────────────────────────┐
│                FHIR REST API (Express)                   │
│  Routes: /fhir/R4/{ResourceType}                         │
│  - GET /{type} (search)                                  │
│  - GET /{type}/{id} (read)                               │
│  - POST /{type} (create)                                 │
│  - PUT /{type}/{id} (update)                             │
│  - DELETE /{type}/{id} (delete)                          │
│  - POST / (batch/transaction)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                FHIR Client Wrapper                       │
│  - fhir-kit-client for HTTP operations                  │
│  - Connection to Medplum server (optional)              │
│  - Retry logic with exponential backoff                 │
│  - Request/response interceptors                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            FHIR Resource Validator                       │
│  Profile Registry:                                       │
│  - US Core profiles (Patient, Observation, etc.)        │
│  - ABDM profiles (from existing integration)            │
│  - Custom organizational profiles                       │
│                                                          │
│  Validation Levels:                                      │
│  - Structure (required fields, data types)              │
│  - Cardinality (min/max occurrences)                    │
│  - Terminology (CodeableConcept validation)             │
│  - Reference integrity (optional)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Search Parameter Processor                  │
│  Standard Parameters:                                    │
│  - _id, _lastUpdated, _tag, _profile, _sort            │
│  - _count, _offset (pagination)                         │
│  - _include, _revinclude (eager loading)                │
│                                                          │
│  Resource-specific:                                      │
│  - Patient: identifier, name, birthdate, gender         │
│  - Observation: subject, code, date, value              │
│  - Appointment: patient, practitioner, date, status     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         FHIR Resource Storage (PostgreSQL)               │
│  Table: fhir_resources                                   │
│  - id (UUID primary key)                                 │
│  - resource_type (string, indexed)                       │
│  - resource_data (JSONB)                                 │
│  - version_id (integer)                                  │
│  - last_updated (timestamp, indexed)                     │
│  - deleted (boolean, default false)                      │
│  - org_id (UUID, multi-tenant isolation)                │
└─────────────────────────────────────────────────────────┘

Profile Validation Flow:
┌──────────────────┐
│ FHIR Resource    │
│ (JSON)           │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Detect Profile from meta.profile[]         │
│ e.g., "http://hl7.org/fhir/us/core/       │
│        StructureDefinition/us-core-patient"│
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Load Profile Definition                    │
│ - Required fields                          │
│ - Data type constraints                    │
│ - Terminology bindings                     │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Validate Structure                         │
│ - Required elements present                │
│ - Data types correct                       │
│ - Cardinality within bounds                │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Validate Terminology                       │
│ - CodeableConcept from correct ValueSet    │
│ - Coding system matches expected           │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│ Return OperationOutcome                    │
│ - Errors (severity: error)                 │
│ - Warnings (severity: warning)             │
│ - Valid: errors.length === 0               │
└────────────────────────────────────────────┘
```

### US Core Profile Support

**Profiles to Implement**:
- US Core Patient Profile v6.1.0
- US Core Observation Profile v6.1.0
- US Core MedicationRequest Profile v6.1.0
- US Core Condition Profile v6.1.0
- US Core Procedure Profile v6.1.0
- US Core Encounter Profile v6.1.0

**US Core Patient Profile Requirements**:
```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "identifier": [  // Required (1..*)
    {
      "system": "...",
      "value": "..."
    }
  ],
  "name": [  // Required (1..*)
    {
      "family": "...",  // Required
      "given": ["..."]  // Required (1..*)
    }
  ],
  "gender": "...",  // Required
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
      "extension": [...]  // Required
    },
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
      "extension": [...]  // Required
    }
  ]
}
```

### ABDM Profile Support

**Leverage Existing Integration**:
- ABDM Health ID (ABHA) as Patient.identifier
- ABDM Health Facility Registry (HFR) for Organization
- ABDM Healthcare Professional Registry (HPR) for Practitioner
- Consent Manager integration for data sharing

**ABDM Patient Profile**:
```json
{
  "resourceType": "Patient",
  "meta": {
    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
  },
  "identifier": [
    {
      "type": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
          "code": "MR"
        }]
      },
      "system": "https://healthid.ndhm.gov.in",
      "value": "22-1234-5678-9012"  // ABHA Number
    }
  ]
}
```

## Related Code Files

**Extend Existing**:
- `/Users/developer/Projects/EHRConnect/ehr-api/src/routes/fhir.js` (entire file - add validation)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/controllers/patient.js`
- `/Users/developer/Projects/EHRConnect/ehr-api/src/controllers/organization.js`
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/abdm.handler.js` (lines 1-1618 - ABDM profiles)

**New Files to Create**:
- `packages/hl7-fhir/src/fhir/client.ts`
- `packages/hl7-fhir/src/fhir/validator.ts`
- `packages/hl7-fhir/src/fhir/search.ts`
- `packages/hl7-fhir/src/fhir/profiles/us-core/patient.ts`
- `packages/hl7-fhir/src/fhir/profiles/us-core/observation.ts`
- `packages/hl7-fhir/src/fhir/profiles/abdm/patient.ts`
- `packages/hl7-fhir/src/fhir/profiles/registry.ts`

## Implementation Steps

1. **Install FHIR Libraries** (30 mins)
   - `fhir-kit-client` for REST client
   - `@types/fhir` for TypeScript types
   - `@asymmetrik/node-fhir-server-core` (optional, evaluate)
   - `fhir-works-on-aws` packages (optional, evaluate)

2. **Implement FHIR Client** (3 hours)
   - Wrap fhir-kit-client with retry logic
   - Support Medplum connection (optional mode)
   - Request/response interceptors for logging
   - OAuth2 authentication support
   - Error handling and OperationOutcome parsing

3. **Build Profile Registry** (3 hours)
   - Load profile definitions (US Core, ABDM)
   - Profile detection from meta.profile[]
   - Fallback to base FHIR R4 spec
   - Custom profile registration API
   - Profile versioning support

4. **Implement Validator** (6 hours)
   - Structure validation (required fields, types)
   - Cardinality validation (min/max occurrences)
   - Terminology validation (CodeableConcept, ValueSet)
   - Reference validation (optional, configurable)
   - Generate OperationOutcome with detailed errors
   - Unit tests with valid/invalid resources

5. **Enhance Search Implementation** (5 hours)
   - Port logic from existing fhir.js routes
   - Add common search parameters (_id, _lastUpdated, etc.)
   - Implement resource-specific parameters
   - Add search modifiers (:exact, :contains, :missing)
   - Implement _include and _revinclude
   - Pagination support (_count, _offset)
   - Search result ranking and sorting

6. **Implement Batch/Transaction** (4 hours)
   - Parse Bundle with type=batch or type=transaction
   - Process entries sequentially or atomically
   - Handle dependencies between entries
   - Rollback on transaction failure
   - Generate batch-response or transaction-response
   - Unit tests with complex bundles

7. **Add History Support** (3 hours)
   - Version tracking in fhir_resources table
   - GET /{type}/{id}/_history endpoint
   - GET /{type}/{id}/_history/{vid} endpoint
   - Bundle with type=history response
   - Audit trail integration

8. **Implement US Core Profiles** (4 hours)
   - Patient profile with race/ethnicity extensions
   - Observation profile with category requirements
   - MedicationRequest profile
   - Condition profile
   - Unit tests for each profile

9. **Implement ABDM Profiles** (3 hours)
   - Patient profile with ABHA identifier
   - Organization profile with HFR ID
   - Practitioner profile with HPR ID
   - Leverage existing ABDM handler (abdm.handler.js)
   - Unit tests with ABDM data

10. **Enhance Existing Routes** (3 hours)
    - Add profile validation to POST/PUT endpoints
    - Enhance search with new parameters
    - Add batch/transaction endpoint
    - Update error responses to OperationOutcome
    - Maintain backward compatibility

11. **Testing** (4 hours)
    - Unit tests (80%+ coverage)
    - Integration tests with Medplum server
    - Profile validation tests (US Core, ABDM)
    - Search parameter tests
    - Batch/transaction tests
    - Load test (1000 req/sec)

12. **Documentation** (2 hours)
    - FHIR client API reference
    - Profile support matrix
    - Search parameter guide
    - Batch/transaction examples
    - Integration guide for Medplum

## Todo List

- [ ] Install fhir-kit-client and @types/fhir
- [ ] Implement FHIR client with retry logic
- [ ] Build profile registry system
- [ ] Implement structure validator
- [ ] Implement cardinality validator
- [ ] Implement terminology validator
- [ ] Enhance search with common parameters
- [ ] Add search modifiers and _include support
- [ ] Implement batch/transaction processing
- [ ] Add history tracking endpoints
- [ ] Implement US Core Patient profile
- [ ] Implement US Core Observation profile
- [ ] Implement ABDM Patient profile
- [ ] Enhance existing FHIR routes with validation
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests with Medplum
- [ ] Perform load testing
- [ ] Document API and profiles

## Success Criteria

- [ ] Client successfully connects to Medplum server
- [ ] Profile validation catches all US Core violations
- [ ] Search supports 20+ common parameters
- [ ] Batch/transaction processes 100 entries atomically
- [ ] History tracking returns all versions
- [ ] <50ms p95 latency for read operations
- [ ] <200ms p95 latency for search with 100 results
- [ ] <10ms per resource validation overhead
- [ ] 80%+ code coverage on unit tests
- [ ] Integration tests pass with Medplum
- [ ] Documentation complete with examples

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Profile validation too strict | Medium | Configurable strictness levels, warning vs error |
| Search performance on large datasets | High | Database indexes, query optimization, caching |
| Medplum connection dependency | Low | Fallback to direct PostgreSQL storage |
| Breaking changes to existing API | High | Backward compatibility layer, versioned endpoints |

## Security Considerations

- OAuth2/OIDC authentication for FHIR endpoints
- RBAC enforcement (provider can't access other orgs)
- Audit logging for all CRUD operations
- PHI encryption at rest (database level)
- Input validation prevents injection attacks
- Reference validation prevents unauthorized access
- Rate limiting to prevent abuse

## Next Steps

After completion, proceed to:
- **Phase 04**: Transformation Engine (HL7 ↔ FHIR mapping)
- **Phase 05**: Event System (listeners, webhooks)

## Unresolved Questions

1. Support for FHIR R5 in addition to R4?
2. GraphQL API for FHIR resources?
3. SMART on FHIR app integration requirements?
4. CQL (Clinical Quality Language) for decision support?
5. Bulk data export ($export operation) needed?
