# Phase 04: Transformation Engine

**Phase**: 04/07
**Status**: Pending
**Priority**: P1
**Estimated Effort**: 4-5 days
**Dependencies**: Phase 02 (HL7 v2.x Core), Phase 03 (FHIR R4 Core)

## Overview

Implement bidirectional transformation between HL7 v2.x messages and FHIR R4 resources. Support ADT (Patient/Encounter), ORM (MedicationRequest/ServiceRequest), ORU (Observation) message types with configurable field mappings.

## Key Insights from Research

- Microsoft FHIR Converter provides Liquid templates for HL7 → FHIR
- Existing field mapping system in custom-hl7.handler.js (lines 328-447)
- Common transformations: ADT_A01 → Patient+Encounter, ORM_O01 → MedicationRequest, ORU_R01 → Observation
- Need to handle repeating segments (e.g., multiple OBX in ORU)
- Date/time format conversion critical (HL7 YYYYMMDDHHMMSS ↔ FHIR ISO8601)

## Requirements

### Functional
- **HL7 → FHIR**: ADT_A01, ADT_A08, ORM_O01, ORU_R01 to FHIR resources
- **FHIR → HL7**: Patient, Encounter, Observation, MedicationRequest to HL7 messages
- **Mapping Engine**: Configurable field mappings (JSONPath, Liquid templates, custom functions)
- **Data Type Conversion**: HL7 types (TS, DT, TM, ST, TX) ↔ FHIR types (dateTime, date, string, CodeableConcept)
- **Code System Mapping**: HL7 v2 tables ↔ FHIR ValueSets (e.g., HL7 v2 Table 0001 → AdministrativeGender)
- **Identifier System Mapping**: Organization-specific ID systems to FHIR identifier.system

### Non-Functional
- Transform 1000+ messages/sec
- <50ms p95 latency per transformation
- Support for custom segment mappings
- Reversible transformations (roundtrip accuracy >95%)
- Configurable mapping per organization

## Architecture

### Transformation Pipeline

```
HL7 → FHIR Transformation:

┌─────────────────────┐
│ HL7 Message (Parsed)│
│ - messageType       │
│ - segments[]        │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Detect Message Type & Select Mapper      │
│ - ADT^A01 → PatientMapper                │
│ - ADT^A08 → PatientUpdateMapper          │
│ - ORM^O01 → MedicationRequestMapper      │
│ - ORU^R01 → ObservationMapper            │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Load Mapping Configuration               │
│ - Organization-specific overrides        │
│ - Default mappings (bundled)             │
│ - Custom segment handlers                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Extract Source Data (Segments → Object)  │
│ PID-5 → { family: 'Doe', given: 'John' }│
│ PV1-44 → { value: '2023-01-15T10:30' }  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Apply Transformations                    │
│ - Date/time format conversion            │
│ - Code system mapping (HL7 Table → VS)   │
│ - Identifier system assignment           │
│ - Value concatenation/splitting          │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Build FHIR Resource(s)                   │
│ - Patient (from PID)                     │
│ - Encounter (from PV1)                   │
│ - Observation[] (from OBX)               │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Validate FHIR Resources (Optional)       │
│ - Profile validation (US Core, ABDM)    │
│ - Structure validation                   │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Return FHIR Bundle or Single Resource    │
│ - Bundle type=transaction for multi      │
│ - Single resource for simple cases       │
└──────────────────────────────────────────┘

FHIR → HL7 Transformation:

┌─────────────────────┐
│ FHIR Resource       │
│ - resourceType      │
│ - data              │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Detect Resource Type & Select Mapper     │
│ - Patient → ADT^A01 (admit) or ADT^A08   │
│ - Encounter → ADT^A01                    │
│ - Observation → ORU^R01                  │
│ - MedicationRequest → ORM^O01            │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Build HL7 Segments                       │
│ - MSH (header with control ID)           │
│ - PID (from Patient)                     │
│ - PV1 (from Encounter)                   │
│ - OBX[] (from Observation[])             │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Apply Transformations                    │
│ - Date/time to HL7 format                │
│ - CodeableConcept → HL7 CE/CWE           │
│ - HumanName → XPN component              │
│ - Address → XAD component                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Generate HL7 Message String              │
│ - Join segments with \r                  │
│ - Apply MLLP framing (if needed)         │
└──────────────────────────────────────────┘
```

### Mapping Configuration Format

```typescript
interface TransformationMapping {
  id: string;
  name: string;
  version: string;
  sourceFormat: 'hl7v2' | 'fhir';
  targetFormat: 'fhir' | 'hl7v2';
  sourceType: string;           // e.g., 'ADT^A01', 'Patient'
  targetType: string;            // e.g., 'Patient', 'ADT^A01'

  // Field-level mappings
  fieldMappings: FieldMapping[];

  // Custom transformation functions
  customTransforms?: Record<string, TransformFunction>;

  // Post-processing hooks
  postProcess?: (resource: any) => any;
}

interface FieldMapping {
  source: string;               // JSONPath or HL7 field notation
  target: string;               // JSONPath or HL7 field notation
  transform?: TransformSpec;
  required?: boolean;
  defaultValue?: any;
}

interface TransformSpec {
  type: 'date' | 'datetime' | 'code' | 'identifier' | 'name' | 'address' | 'custom';
  params?: Record<string, any>;
  customFunction?: string;      // Reference to custom transform
}

// Example: ADT_A01 → Patient mapping
const ADT_A01_TO_PATIENT: TransformationMapping = {
  id: 'adt-a01-to-patient',
  name: 'ADT A01 to FHIR Patient',
  version: '1.0.0',
  sourceFormat: 'hl7v2',
  targetFormat: 'fhir',
  sourceType: 'ADT^A01',
  targetType: 'Patient',

  fieldMappings: [
    // Identifiers
    {
      source: 'PID-3.1',        // Patient ID
      target: 'identifier[0].value',
      required: true
    },
    {
      source: 'PID-3.4',        // Assigning authority
      target: 'identifier[0].system',
      transform: {
        type: 'identifier',
        params: { mapToUrl: true }
      }
    },

    // Name
    {
      source: 'PID-5.1',        // Family name
      target: 'name[0].family',
      required: true
    },
    {
      source: 'PID-5.2',        // Given name
      target: 'name[0].given[0]',
      required: true
    },
    {
      source: 'PID-5.3',        // Middle name
      target: 'name[0].given[1]'
    },

    // Demographics
    {
      source: 'PID-7',          // Date of birth
      target: 'birthDate',
      transform: { type: 'date' },
      required: true
    },
    {
      source: 'PID-8',          // Gender
      target: 'gender',
      transform: {
        type: 'code',
        params: {
          codeSystem: 'hl7-table-0001',
          targetSystem: 'http://hl7.org/fhir/administrative-gender',
          mapping: {
            'M': 'male',
            'F': 'female',
            'O': 'other',
            'U': 'unknown'
          }
        }
      },
      required: true
    },

    // Contact
    {
      source: 'PID-13',         // Phone number
      target: 'telecom[0].value',
      transform: { type: 'custom', customFunction: 'formatPhone' }
    },
    {
      source: 'PID-13',
      target: 'telecom[0].system',
      defaultValue: 'phone'
    },

    // Address
    {
      source: 'PID-11.1',       // Street
      target: 'address[0].line[0]'
    },
    {
      source: 'PID-11.3',       // City
      target: 'address[0].city'
    },
    {
      source: 'PID-11.4',       // State
      target: 'address[0].state'
    },
    {
      source: 'PID-11.5',       // Zip
      target: 'address[0].postalCode'
    },
    {
      source: 'PID-11.6',       // Country
      target: 'address[0].country'
    }
  ],

  customTransforms: {
    formatPhone: (value: string) => {
      // Remove non-digits
      return value.replace(/\D/g, '');
    }
  },

  postProcess: (patient: Patient) => {
    // Add meta information
    patient.meta = {
      ...patient.meta,
      tag: [{
        system: 'http://ehrconnect.io/fhir/tag',
        code: 'hl7v2-import'
      }]
    };
    return patient;
  }
};
```

### Data Type Conversion Utilities

```typescript
class DataTypeConverter {
  // HL7 Timestamp (YYYYMMDDHHMMSS) → FHIR dateTime (ISO8601)
  static hl7DateTimeToFhir(hl7DateTime: string): string {
    // 20230115103000 → 2023-01-15T10:30:00Z
    const year = hl7DateTime.substring(0, 4);
    const month = hl7DateTime.substring(4, 6);
    const day = hl7DateTime.substring(6, 8);
    const hour = hl7DateTime.substring(8, 10) || '00';
    const minute = hl7DateTime.substring(10, 12) || '00';
    const second = hl7DateTime.substring(12, 14) || '00';

    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }

  // HL7 Date (YYYYMMDD) → FHIR date (YYYY-MM-DD)
  static hl7DateToFhir(hl7Date: string): string {
    const year = hl7Date.substring(0, 4);
    const month = hl7Date.substring(4, 6);
    const day = hl7Date.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  // FHIR dateTime → HL7 Timestamp
  static fhirDateTimeToHL7(fhirDateTime: string): string {
    // 2023-01-15T10:30:00Z → 20230115103000
    return fhirDateTime
      .replace(/[-:TZ]/g, '')
      .substring(0, 14);
  }

  // HL7 XPN (Extended Person Name) → FHIR HumanName
  static hl7XPNToFhirName(xpn: string, delimiter: string = '^'): HumanName {
    const parts = xpn.split(delimiter);
    return {
      family: parts[0] || undefined,
      given: [parts[1], parts[2]].filter(Boolean),
      prefix: parts[5] ? [parts[5]] : undefined,
      suffix: parts[4] ? [parts[4]] : undefined
    };
  }

  // HL7 CWE/CE (Coded Element) → FHIR CodeableConcept
  static hl7CWEToCodeableConcept(cwe: string, delimiter: string = '^'): CodeableConcept {
    const parts = cwe.split(delimiter);
    return {
      coding: [{
        code: parts[0],
        display: parts[1],
        system: parts[2] || undefined
      }],
      text: parts[1]
    };
  }

  // FHIR HumanName → HL7 XPN
  static fhirNameToHL7XPN(name: HumanName, delimiter: string = '^'): string {
    return [
      name.family || '',
      name.given?.[0] || '',
      name.given?.[1] || '',
      name.suffix?.[0] || '',
      name.prefix?.[0] || ''
    ].join(delimiter);
  }

  // FHIR CodeableConcept → HL7 CWE
  static codeableConceptToHL7CWE(concept: CodeableConcept, delimiter: string = '^'): string {
    const coding = concept.coding?.[0];
    return [
      coding?.code || '',
      coding?.display || concept.text || '',
      coding?.system || ''
    ].join(delimiter);
  }
}
```

## Related Code Files

**Reference Existing**:
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` (lines 328-447: field mapping)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` (lines 472-478: date formatting)

**New Files to Create**:
- `packages/hl7-fhir/src/converter/index.ts`
- `packages/hl7-fhir/src/converter/hl7-to-fhir.ts`
- `packages/hl7-fhir/src/converter/fhir-to-hl7.ts`
- `packages/hl7-fhir/src/converter/data-types.ts`
- `packages/hl7-fhir/src/converter/code-systems.ts`
- `packages/hl7-fhir/src/converter/mappings/adt-a01-patient.ts`
- `packages/hl7-fhir/src/converter/mappings/adt-a08-patient.ts`
- `packages/hl7-fhir/src/converter/mappings/orm-o01-medication-request.ts`
- `packages/hl7-fhir/src/converter/mappings/oru-r01-observation.ts`
- `packages/hl7-fhir/src/converter/mappings/patient-adt-a01.ts`

## Implementation Steps

1. **Research Microsoft FHIR Converter** (2 hours)
   - Evaluate Liquid template approach
   - Extract common transformation patterns
   - Decide: Use library or custom implementation

2. **Implement Data Type Converters** (4 hours)
   - Date/time converters (HL7 ↔ FHIR)
   - Name converters (XPN ↔ HumanName)
   - Address converters (XAD ↔ Address)
   - Code converters (CWE/CE ↔ CodeableConcept)
   - Identifier converters
   - Unit tests for each converter

3. **Build Code System Mapping** (3 hours)
   - HL7 v2 Table 0001 (Gender) → AdministrativeGender
   - HL7 v2 Table 0002 (Marital Status) → MaritalStatus
   - HL7 v2 Table 0007 (Admission Type) → ActEncounterCode
   - LOINC codes preservation
   - Custom code system registry

4. **Implement Mapping Engine** (5 hours)
   - Load mapping configurations
   - JSONPath evaluation for source/target
   - Transform function execution
   - Custom function registry
   - Post-processing hooks
   - Error handling (partial failures)

5. **Create ADT_A01 → Patient+Encounter Mapper** (4 hours)
   - PID segment → Patient resource
   - PV1 segment → Encounter resource
   - Handle repeating fields
   - Validate output with US Core profile
   - Unit tests with real ADT messages

6. **Create ORM_O01 → MedicationRequest Mapper** (3 hours)
   - ORC segment → MedicationRequest (header)
   - RXO/RXE segments → dosage instructions
   - Map to FHIR MedicationRequest
   - Unit tests

7. **Create ORU_R01 → Observation[] Mapper** (3 hours)
   - OBX segments → Observation resources (1:1)
   - Handle multiple OBX (repeating)
   - Map units, reference ranges
   - LOINC code preservation
   - Unit tests

8. **Implement Reverse Transformations** (6 hours)
   - Patient → ADT_A01
   - Encounter → ADT_A01 (with PV1)
   - Observation → ORU_R01
   - MedicationRequest → ORM_O01
   - Unit tests for roundtrip accuracy

9. **Add Configuration Management** (3 hours)
   - Store mappings in database (`hl7_fhir_mappings` table)
   - Per-organization overrides
   - Mapping version control
   - API to update mappings

10. **Build Transformation API** (2 hours)
    - POST /api/hl7-fhir/transform
    - Request: `{ source: 'hl7v2', target: 'fhir', data: '...' }`
    - Response: FHIR Bundle or single resource
    - Error handling with detailed diagnostics

11. **Testing** (5 hours)
    - Unit tests for each mapper (80%+ coverage)
    - Integration tests with real HL7 messages
    - Roundtrip accuracy tests (HL7 → FHIR → HL7)
    - Performance tests (1000 transforms/sec)
    - Error scenario tests

12. **Documentation** (2 hours)
    - Mapping configuration guide
    - Supported message types matrix
    - Custom function development guide
    - Troubleshooting common issues

## Todo List

- [ ] Evaluate Microsoft FHIR Converter
- [ ] Implement data type converters
- [ ] Build code system mapping registry
- [ ] Implement mapping engine with JSONPath
- [ ] Create ADT_A01 → Patient mapper
- [ ] Create ADT_A01 → Encounter mapper
- [ ] Create ORM_O01 → MedicationRequest mapper
- [ ] Create ORU_R01 → Observation mapper
- [ ] Implement reverse transformations (FHIR → HL7)
- [ ] Add configuration management (database storage)
- [ ] Build transformation REST API
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests with real data
- [ ] Perform roundtrip accuracy tests
- [ ] Perform performance testing (1000/sec)
- [ ] Document mapping configurations

## Success Criteria

- [ ] Transform ADT_A01 → Patient+Encounter with 100% field coverage
- [ ] Transform ORM_O01 → MedicationRequest accurately
- [ ] Transform ORU_R01 → Observation[] (multiple OBX)
- [ ] Reverse transforms maintain >95% data fidelity
- [ ] Process 1000+ transformations/sec
- [ ] <50ms p95 latency per transformation
- [ ] Custom mappings configurable per organization
- [ ] 80%+ code coverage on unit tests
- [ ] Roundtrip tests pass for all message types
- [ ] Documentation complete with examples

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during transformation | High | Comprehensive test suite, audit logging, validation |
| Custom segments not supported | Medium | Extensible mapping system, custom function support |
| Code system mapping inaccuracies | High | Curated mapping tables, validation, manual review |
| Performance degradation on complex messages | Medium | Optimize hot paths, lazy loading, caching |

## Security Considerations

- Validate all input messages before transformation
- Prevent injection via custom transformation functions
- Audit log all transformations (source + target)
- PHI handling in transformation (no logging of data)
- Code system mapping shouldn't expose org secrets

## Next Steps

After completion, proceed to:
- **Phase 05**: Event System (listeners, webhooks, event-driven)
- **Phase 06**: Integration (connect to EHRConnect systems)

## Unresolved Questions

1. Support for HL7 v3 (CDA) to FHIR transformation?
2. Bidirectional sync strategy (which system is source of truth)?
3. Conflict resolution when data differs in HL7 vs FHIR?
4. Support for custom HL7 Z-segments?
5. Real-time transformation vs batch processing preference?
