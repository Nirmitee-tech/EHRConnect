# HL7 v2.x + FHIR R4 Module Implementation Plan

**Plan ID**: 251215-1936-hl7-fhir-module-implementation
**Created**: 2025-12-15
**Status**: Planning
**Priority**: High
**Module Location**: `packages/hl7-fhir/`

## Overview

Comprehensive implementation of HL7 v2.x and FHIR R4 integration module as monorepo package, with production-grade MLLP transport, message queuing, transformation engine, event system, and full integration with existing EHRConnect infrastructure.

## Current State Assessment

**Existing Assets**:
- Basic HL7 v2.x handler (507 lines) - parsing, generation, validation, field mapping (simulated transport)
- FHIR R4 REST API (632 lines) - Full CRUD + search for Patient, Organization, Practitioner, Appointment, Task
- ABDM Integration (1618 lines) - India digital health with 56 operations
- Event System - Webhooks + Socket.IO notifications
- Infrastructure: PostgreSQL 15, Redis 7, Keycloak 26, Medplum FHIR Server

**Critical Gaps**:
- No real MLLP transport (currently simulated)
- No message queuing (synchronous only)
- Limited validation (basic structure checks)
- No retry/backoff mechanism
- Missing audit logging for compliance

## Implementation Phases

| Phase | Status | Priority | Estimated Effort | Dependencies |
|-------|--------|----------|------------------|--------------|
| [Phase 01: Module Foundation](./phase-01-module-foundation.md) | Pending | P0 | 2-3 days | None |
| [Phase 02: HL7 v2.x Core](./phase-02-hl7-v2x-core.md) | Pending | P0 | 3-4 days | Phase 01 |
| [Phase 03: FHIR R4 Core](./phase-03-fhir-r4-core.md) | Pending | P0 | 3-4 days | Phase 01 |
| [Phase 04: Transformation Engine](./phase-04-transformation-engine.md) | Pending | P1 | 4-5 days | Phase 02, 03 |
| [Phase 05: Event System](./phase-05-event-system.md) | Pending | P1 | 2-3 days | Phase 02, 03 |
| [Phase 06: Integration](./phase-06-integration.md) | Pending | P0 | 3-4 days | All Previous |
| [Phase 07: Production Ready](./phase-07-production-ready.md) | Pending | P1 | 4-5 days | All Previous |

**Total Estimated Effort**: 21-28 days

## Architecture Decision Records

### ADR-001: Module Structure
**Decision**: Monorepo workspace package at `packages/hl7-fhir/`
**Rationale**: Single module with sub-exports provides better cohesion, easier maintenance, and shared infrastructure (queue, validation, audit)
**Exports**:
- `@ehrconnect/hl7-fhir/hl7` - HL7 v2.x parser, generator, MLLP client/server
- `@ehrconnect/hl7-fhir/fhir` - FHIR R4 client, resource handlers
- `@ehrconnect/hl7-fhir/converter` - HL7 ↔ FHIR transformation
- `@ehrconnect/hl7-fhir/events` - Event listeners, webhooks

### ADR-002: MLLP Transport
**Decision**: Use `node-hl7-client` + `node-hl7-server` libraries
**Rationale**: TypeScript support, zero dependencies, TLS support, active maintenance
**Config**: Server port 2575 (HL7 default), auto-ACK with AA (accept), async processing

### ADR-003: Message Queue
**Decision**: Use Redis (Bull/BullMQ) for message queue
**Rationale**: Already in infrastructure, proven performance, supports delayed jobs, priority queues
**Queues**: `hl7.inbound`, `hl7.outbound`, `hl7.dlq` (dead letter queue)

### ADR-004: Event Architecture
**Decision**: Extend existing Socket.IO + webhook system
**Rationale**: Proven pattern in codebase, no new infrastructure needed
**Events**: `hl7.received`, `hl7.sent`, `hl7.error`, `fhir.created`, `fhir.updated`
**Webhook**: Exponential backoff (2s, 4s, 8s, 16s, 32s), 5 attempts max

### ADR-005: Integration Pattern
**Decision**: Register handlers in existing Integration Orchestrator
**Rationale**: Consistent with ABDM, Epic, ClaimMD integrations
**Storage**: Use `integration_credentials` table for configs, existing transaction log for audit

### ADR-006: FHIR Validation
**Decision**: Support multiple profile sets (US Core, ABDM, Custom)
**Rationale**: Multi-region compliance requirements
**Implementation**: Profile-based validation with configurable strictness levels

## Success Criteria

- [ ] MLLP server accepts connections on port 2575
- [ ] MLLP client sends/receives messages with TLS support
- [ ] Message queue processes 1000+ msgs/min
- [ ] HL7 ↔ FHIR transformation for ADT_A01, ADT_A08, ORM_O01, ORU_R01
- [ ] Webhook delivery with retry logic
- [ ] Integration with existing audit logging
- [ ] Zero downtime message processing (graceful shutdown)
- [ ] <100ms p95 latency for message parsing
- [ ] Comprehensive error handling and DLQ

## Quick Links

- [System Architecture](/Users/developer/Projects/EHRConnect/docs/system-architecture.md)
- [Development Rules](/Users/developer/Projects/EHRConnect/.claude/workflows/development-rules.md)
- [Existing HL7 Handler](/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js)
- [Existing FHIR Routes](/Users/developer/Projects/EHRConnect/ehr-api/src/routes/fhir.js)
- [Integration Orchestrator](/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/index.js)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| MLLP connection stability | High | Connection pooling, auto-reconnect, health checks |
| Message ordering | Medium | Queue priority, FIFO guarantees where required |
| Data loss during processing | High | At-least-once delivery, DLQ for failures |
| Performance degradation under load | Medium | Horizontal scaling, queue throttling, circuit breaker |
| Transformation accuracy | High | Comprehensive test suite, validation layers |

## Unresolved Questions

1. Support for HL7 v3 (CDA documents) in future phases?
2. Message archival strategy (retention period, cold storage)?
3. Multi-region deployment with data residency requirements?
4. Support for custom HL7 segments beyond standard?
5. Integration with Epic/Cerner via direct MLLP vs REST API?
