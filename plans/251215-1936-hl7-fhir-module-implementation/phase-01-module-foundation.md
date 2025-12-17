# Phase 01: Module Foundation

**Phase**: 01/07
**Status**: Pending
**Priority**: P0 (Blocker)
**Estimated Effort**: 2-3 days
**Dependencies**: None

## Overview

Establish monorepo package structure, TypeScript configuration, core types, base classes, and shared infrastructure (logging, error handling, validation framework).

## Key Insights from Research

- Existing code uses CommonJS (require/module.exports) - maintain compatibility
- EHRConnect uses Express.js backend, Next.js frontend
- Integration handlers follow base class pattern (see `base-handler.js`)
- Multi-tenant with org_id isolation enforced
- Audit logging required for HIPAA compliance
- Redis and PostgreSQL already available

## Requirements

### Functional
- Package structure with sub-exports (`hl7`, `fhir`, `converter`, `events`)
- TypeScript types for HL7 v2.x messages and FHIR R4 resources
- Shared validation framework (Joi/Zod)
- Common error classes with proper error codes
- Base handler pattern for integration orchestrator
- Configuration management (env vars, database)

### Non-Functional
- TypeScript strict mode enabled
- ESLint + Prettier configuration
- 100% type coverage for public APIs
- Zero breaking changes to existing handlers
- <10ms overhead for type/validation layer

## Architecture

### Package Structure
```
packages/hl7-fhir/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── src/
│   ├── index.ts                    # Main exports
│   ├── hl7/
│   │   ├── index.ts               # HL7 v2.x exports
│   │   ├── types.ts               # HL7 message types
│   │   ├── parser.ts              # Message parser
│   │   ├── generator.ts           # Message generator
│   │   ├── validator.ts           # Message validator
│   │   └── client/                # MLLP client (Phase 02)
│   │
│   ├── fhir/
│   │   ├── index.ts               # FHIR R4 exports
│   │   ├── types.ts               # FHIR resource types
│   │   ├── client.ts              # FHIR REST client
│   │   ├── validator.ts           # Resource validator
│   │   └── profiles/              # Validation profiles (Phase 03)
│   │
│   ├── converter/
│   │   ├── index.ts               # Transformation exports
│   │   ├── hl7-to-fhir.ts        # HL7 → FHIR mapping
│   │   ├── fhir-to-hl7.ts        # FHIR → HL7 mapping
│   │   └── mappings/              # Message type mappings (Phase 04)
│   │
│   ├── events/
│   │   ├── index.ts               # Event system exports
│   │   ├── emitter.ts             # Event emitter
│   │   ├── webhook.ts             # Webhook delivery
│   │   └── handlers/              # Event handlers (Phase 05)
│   │
│   ├── core/
│   │   ├── config.ts              # Configuration loader
│   │   ├── logger.ts              # Structured logging
│   │   ├── errors.ts              # Custom error classes
│   │   ├── validation.ts          # Validation framework
│   │   └── base-handler.ts        # Base integration handler
│   │
│   └── utils/
│       ├── date.ts                # Date/time utilities
│       ├── encoding.ts            # HL7 encoding/escaping
│       └── format.ts              # Message formatting
│
├── test/
│   ├── fixtures/                  # Test data
│   ├── unit/                      # Unit tests
│   └── integration/               # Integration tests
│
└── dist/                          # Compiled output (gitignored)
```

### Type System Design

**HL7 v2.x Types**:
```typescript
// Core message structure
interface HL7Message {
  messageType: string;              // e.g., "ADT^A01"
  messageControlId: string;         // MSH-10
  version: string;                  // e.g., "2.5.1"
  timestamp: Date;
  segments: HL7Segment[];
  delimiters: HL7Delimiters;
  rawMessage: string;
}

interface HL7Segment {
  segmentType: string;              // e.g., "PID", "PV1"
  fields: HL7Field[];
  sequenceNumber?: number;
}

interface HL7Field {
  fieldNumber: number;
  value: string;
  components?: HL7Component[];
  repetitions?: HL7Field[];
}

interface HL7Delimiters {
  field: string;                    // |
  component: string;                // ^
  repetition: string;               // ~
  escape: string;                   // \
  subComponent: string;             // &
}

// Message type enums
enum HL7MessageType {
  ADT_A01 = 'ADT^A01',              // Admit patient
  ADT_A08 = 'ADT^A08',              // Update patient info
  ORM_O01 = 'ORM^O01',              // Order message
  ORU_R01 = 'ORU^R01',              // Observation result
  ACK = 'ACK',                      // Acknowledgment
}

// Acknowledgment codes
enum AcknowledgmentCode {
  AA = 'AA',                        // Application Accept
  AE = 'AE',                        // Application Error
  AR = 'AR',                        // Application Reject
  CA = 'CA',                        // Commit Accept
  CE = 'CE',                        // Commit Error
  CR = 'CR',                        // Commit Reject
}
```

**FHIR R4 Types**:
```typescript
// Leverage @types/fhir for standard types
import { Bundle, Patient, Observation, MedicationRequest } from 'fhir/r4';

// Custom extensions
interface EHRConnectExtension {
  url: string;
  valueString?: string;
  valueReference?: Reference;
  valueCodeableConcept?: CodeableConcept;
}

// Operation outcomes
interface FHIROperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: { text: string };
    diagnostics?: string;
  }>;
}
```

### Error Handling Design

```typescript
// Base error class
class HL7FHIRError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class HL7ParseError extends HL7FHIRError {
  constructor(message: string, details?: any) {
    super(message, 'HL7_PARSE_ERROR', 400, details);
  }
}

class HL7ValidationError extends HL7FHIRError {
  constructor(message: string, details?: any) {
    super(message, 'HL7_VALIDATION_ERROR', 400, details);
  }
}

class FHIRValidationError extends HL7FHIRError {
  constructor(message: string, details?: any) {
    super(message, 'FHIR_VALIDATION_ERROR', 400, details);
  }
}

class TransformationError extends HL7FHIRError {
  constructor(message: string, details?: any) {
    super(message, 'TRANSFORMATION_ERROR', 422, details);
  }
}

class MLLPConnectionError extends HL7FHIRError {
  constructor(message: string, details?: any) {
    super(message, 'MLLP_CONNECTION_ERROR', 503, details);
  }
}
```

### Configuration Design

```typescript
interface HL7FHIRConfig {
  // MLLP Server
  mllp: {
    server: {
      enabled: boolean;
      host: string;                 // Default: 0.0.0.0
      port: number;                 // Default: 2575
      tls: {
        enabled: boolean;
        cert?: string;
        key?: string;
        ca?: string;
      };
      maxConnections: number;       // Default: 100
      timeout: number;              // Default: 30000ms
    };
    client: {
      pool: {
        min: number;                // Default: 2
        max: number;                // Default: 10
        idleTimeout: number;        // Default: 60000ms
      };
      reconnect: {
        enabled: boolean;
        maxAttempts: number;        // Default: 5
        delay: number;              // Default: 1000ms
      };
    };
  };

  // Message Queue (Redis/Bull)
  queue: {
    redis: {
      host: string;
      port: number;
      db: number;                   // Default: 0
      password?: string;
    };
    concurrency: number;            // Default: 10
    jobTimeout: number;             // Default: 60000ms
    removeOnComplete: boolean;      // Default: true
    removeOnFail: boolean;          // Default: false
  };

  // Validation
  validation: {
    hl7: {
      strictMode: boolean;          // Default: false
      validateSegments: boolean;    // Default: true
      requiredFields: string[];     // e.g., ['MSH-10']
    };
    fhir: {
      profile: string;              // 'us-core' | 'abdm' | 'custom'
      strictMode: boolean;          // Default: false
      validateReferences: boolean;  // Default: false
    };
  };

  // Event System
  events: {
    enabled: boolean;
    webhook: {
      enabled: boolean;
      retry: {
        maxAttempts: number;        // Default: 5
        backoff: 'exponential' | 'linear';
        initialDelay: number;       // Default: 2000ms
      };
      timeout: number;              // Default: 10000ms
    };
    socketIO: {
      enabled: boolean;
      namespace: string;            // Default: '/hl7-fhir'
    };
  };

  // Audit Logging
  audit: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    destination: 'database' | 'file' | 'both';
    retention: number;              // Days, default: 90
  };
}
```

## Related Code Files

**Existing to Reference**:
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/base-handler.js` (lines 1-80)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` (lines 1-507)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/routes/fhir.js` (lines 12-27, validation pattern)

**New Files to Create**:
- `packages/hl7-fhir/package.json`
- `packages/hl7-fhir/tsconfig.json`
- `packages/hl7-fhir/src/core/config.ts`
- `packages/hl7-fhir/src/core/logger.ts`
- `packages/hl7-fhir/src/core/errors.ts`
- `packages/hl7-fhir/src/core/validation.ts`
- `packages/hl7-fhir/src/hl7/types.ts`
- `packages/hl7-fhir/src/fhir/types.ts`

## Implementation Steps

1. **Setup Package Structure** (1 hour)
   - Create `packages/hl7-fhir/` directory
   - Initialize `package.json` with dependencies
   - Configure TypeScript (`tsconfig.json`)
   - Setup ESLint + Prettier
   - Add build scripts (tsc, watch mode)

2. **Install Dependencies** (30 mins)
   - Core: `typescript`, `@types/node`, `@types/fhir`
   - Validation: `joi` or `zod`
   - Utilities: `date-fns`, `uuid`
   - Testing: `jest`, `@types/jest`, `ts-jest`
   - HL7 (Phase 02): `node-hl7-client`, `node-hl7-server`
   - FHIR (Phase 03): `fhir-kit-client`
   - Queue (Phase 07): `bull`, `@types/bull`

3. **Create Core Types** (3 hours)
   - `src/hl7/types.ts` - HL7 message structures
   - `src/fhir/types.ts` - FHIR extensions and custom types
   - Export type unions, enums, interfaces

4. **Implement Error Handling** (2 hours)
   - `src/core/errors.ts` - Error class hierarchy
   - Create 10+ specific error types
   - Add error serialization for API responses

5. **Build Configuration System** (2 hours)
   - `src/core/config.ts` - Load from env vars + defaults
   - Validate configuration on startup
   - Support per-org overrides (database storage)

6. **Setup Logging Infrastructure** (2 hours)
   - `src/core/logger.ts` - Structured logging (Winston/Pino)
   - Log levels, formatters, transports
   - Integration with audit logging system

7. **Create Validation Framework** (3 hours)
   - `src/core/validation.ts` - Generic validator interface
   - HL7 message validation schemas
   - FHIR resource validation schemas
   - Composable validation chains

8. **Implement Base Handler** (2 hours)
   - `src/core/base-handler.ts` - Extend existing pattern
   - Add HL7/FHIR specific lifecycle hooks
   - Connection pooling interface

9. **Create Utility Functions** (2 hours)
   - `src/utils/date.ts` - HL7 datetime formatting
   - `src/utils/encoding.ts` - HL7 escape sequences
   - `src/utils/format.ts` - Message pretty-printing

10. **Setup Testing Infrastructure** (2 hours)
    - Configure Jest with TypeScript
    - Create test fixtures (sample HL7 messages, FHIR resources)
    - Write unit tests for core utilities

11. **Add Build and Export Configuration** (1 hour)
    - Configure `src/index.ts` with sub-path exports
    - Setup CommonJS + ESM dual output
    - Test import paths in ehr-api

12. **Documentation** (2 hours)
    - Write README.md with usage examples
    - Document configuration options
    - API reference for core types and errors

## Todo List

- [ ] Create package directory structure
- [ ] Initialize package.json with dependencies
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Setup ESLint + Prettier
- [ ] Define HL7 v2.x types (`hl7/types.ts`)
- [ ] Define FHIR R4 types (`fhir/types.ts`)
- [ ] Implement error class hierarchy (`core/errors.ts`)
- [ ] Build configuration system (`core/config.ts`)
- [ ] Setup logging infrastructure (`core/logger.ts`)
- [ ] Create validation framework (`core/validation.ts`)
- [ ] Implement base handler (`core/base-handler.ts`)
- [ ] Create utility functions (date, encoding, format)
- [ ] Setup Jest testing framework
- [ ] Create test fixtures
- [ ] Write unit tests for core modules
- [ ] Configure exports in package.json
- [ ] Test imports in ehr-api
- [ ] Write documentation (README.md)

## Success Criteria

- [ ] Package builds without TypeScript errors
- [ ] All core types exported correctly
- [ ] Configuration loads from environment variables
- [ ] Logger produces structured JSON output
- [ ] Error classes serialize properly
- [ ] Validation framework handles HL7 and FHIR
- [ ] Base handler extends existing pattern
- [ ] 80%+ test coverage on core modules
- [ ] Documentation covers all public APIs
- [ ] Import successful in ehr-api: `const { HL7Message } = require('@ehrconnect/hl7-fhir/hl7')`

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| TypeScript migration breaks existing code | High | Maintain CommonJS output, gradual migration |
| Configuration complexity | Medium | Sensible defaults, validation on load |
| Performance overhead from types | Low | Zero runtime cost, compile-time only |

## Security Considerations

- No sensitive data in configuration defaults
- Audit log setup for all message access
- Validation prevents injection attacks (escape sequences)
- TLS configuration for MLLP connections

## Next Steps

After completion, proceed to:
- **Phase 02**: HL7 v2.x Core (MLLP transport, parsing, generation)
- **Phase 03**: FHIR R4 Core (REST client, resource handlers)

## Unresolved Questions

1. Use Joi or Zod for validation? (Zod better TypeScript inference)
2. Winston or Pino for logging? (Pino faster, Winston more plugins)
3. Support both CJS and ESM output? (CJS sufficient for now)
4. Per-org configuration hot-reload required?
