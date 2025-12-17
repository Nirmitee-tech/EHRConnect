# Phase 06: Integration with EHRConnect

**Phase**: 06/07
**Status**: Pending
**Priority**: P0 (Blocker)
**Estimated Effort**: 3-4 days
**Dependencies**: Phase 01-05 (All Previous)

## Overview

Integrate HL7/FHIR module with existing EHRConnect infrastructure including Integration Orchestrator, ABDM handler, audit logging, multi-tenancy, RBAC, and migrate existing custom-hl7.handler.js to use new module.

## Key Insights from Research

- Integration Orchestrator pattern at `/ehr-api/src/integrations/index.js`
- Base handler pattern for vendor integrations
- ABDM integration already has FHIR structures (1618 lines)
- Multi-tenant isolation via `org_id` column
- Audit logging in `audit_logs` table
- RBAC middleware enforces permissions
- Socket.IO notifications already in place

## Requirements

### Functional
- **Integration Registration**: Register HL7/FHIR handlers in Integration Orchestrator
- **Configuration Storage**: Store MLLP/FHIR configs in `integration_credentials` table
- **Multi-Tenant Support**: Enforce org_id isolation for all operations
- **RBAC Integration**: Respect existing permission system
- **Audit Logging**: Log all HL7/FHIR operations to `audit_logs`
- **ABDM Sync**: Sync FHIR resources with ABDM when applicable
- **Migration**: Replace custom-hl7.handler.js with new module
- **API Routes**: Expose HL7/FHIR endpoints in ehr-api

### Non-Functional
- Zero downtime migration
- Backward compatibility with existing integrations
- <10ms overhead from integration layer
- Support 100+ organizations with separate configs

## Architecture

### Integration Points

```
EHRConnect Integration Architecture:

┌─────────────────────────────────────────────────────────┐
│              ehr-api (Express Server)                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Integration Orchestrator                      │    │
│  │  - Vendor handler registry                     │    │
│  │  - Connection pooling                          │    │
│  │  - Credential management                       │    │
│  │                                                 │    │
│  │  Registered Handlers:                          │    │
│  │  ✓ ABDM (India digital health)                │    │
│  │  ✓ ClaimMD (billing)                           │    │
│  │  ✓ Epic (EHR)                                  │    │
│  │  ✓ 100ms (video)                               │    │
│  │  ✓ Twilio (SMS)                                │    │
│  │  + HL7 v2.x (NEW)  ← packages/hl7-fhir/hl7   │    │
│  │  + FHIR R4 (NEW)   ← packages/hl7-fhir/fhir  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  RBAC Middleware                               │    │
│  │  - Role checking (PROVIDER, ADMIN, etc.)      │    │
│  │  - Permission validation                       │    │
│  │  - org_id enforcement                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Audit Logger Middleware                       │    │
│  │  - Record all API calls                        │    │
│  │  - PHI access tracking                         │    │
│  │  - Immutable audit trail                       │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          packages/hl7-fhir (New Module)                  │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │  HL7 v2.x       │  │  FHIR R4        │             │
│  │  - MLLP Server  │  │  - REST Client  │             │
│  │  - MLLP Client  │  │  - Validator    │             │
│  │  - Parser       │  │  - Profiles     │             │
│  │  - Generator    │  │                 │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │  Transformation Engine                        │      │
│  │  - HL7 ↔ FHIR mapping                        │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │  Event System                                 │      │
│  │  - Event emitter                              │      │
│  │  - Webhook delivery                           │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Layer                              │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  PostgreSQL Tables                                 │ │
│  │  - integration_credentials (MLLP/FHIR configs)    │ │
│  │  - integration_vendors (handler metadata)         │ │
│  │  - fhir_resources (FHIR resource storage)         │ │
│  │  - audit_logs (comprehensive audit trail)         │ │
│  │  - webhook_subscriptions (event subscriptions)    │ │
│  │  - event_log (event history)                      │ │
│  │  - hl7_message_queue (message processing queue)   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Request Flow Example (FHIR Resource Creation):

1. Frontend: POST /api/fhir/R4/Patient
2. Express middleware stack:
   - CORS
   - Body parser
   - Auth middleware (JWT validation)
   - RBAC middleware (check PROVIDER role)
   - Audit logger (record action)
3. FHIR route handler
4. Call HL7-FHIR module: fhirClient.create()
5. Validate with profile (US Core/ABDM)
6. Store in fhir_resources table (with org_id)
7. Emit event: fhir.created
8. Event listeners:
   - Audit logger (log to audit_logs)
   - Socket.IO (broadcast to org room)
   - Webhook delivery (POST to subscribers)
   - ABDM sync (if applicable)
9. Return FHIR resource to frontend
10. Audit logger records success
```

### Integration Handler Implementation

```typescript
// ehr-api/src/integrations/hl7.handler.ts
import { HL7Parser, HL7Generator, MLLPClient } from '@ehrconnect/hl7-fhir/hl7';
import BaseIntegrationHandler from './base-handler';

class HL7Handler extends BaseIntegrationHandler {
  private mllpClient: MLLPClient;
  private parser: HL7Parser;
  private generator: HL7Generator;

  constructor() {
    super('hl7-v2x');
  }

  async initialize(integration: Integration): Promise<void> {
    await super.initialize(integration);

    const config = {
      host: integration.credentials.endpointUrl,
      port: integration.credentials.port || 2575,
      tls: {
        enabled: integration.credentials.tlsEnabled || false,
        cert: integration.credentials.tlsCert,
        key: integration.credentials.tlsKey,
      },
      timeout: 30000,
    };

    this.mllpClient = new MLLPClient(config);
    this.parser = new HL7Parser();
    this.generator = new HL7Generator();

    this.setClient(integration.id, {
      mllpClient: this.mllpClient,
      parser: this.parser,
      generator: this.generator,
      config: config,
    });

    console.log(`✓ HL7 v2.x client initialized for ${integration.id}`);
  }

  async execute(integration: Integration, operation: string, params: any): Promise<any> {
    const client = this.getClient(integration.id);

    switch (operation) {
      case 'sendMessage':
        return await this.sendMessage(client, params);
      case 'parseMessage':
        return await this.parseMessage(client, params.hl7Message);
      case 'generateMessage':
        return await this.generateMessage(client, params);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async testConnection(integration: Integration): Promise<boolean> {
    const client = this.getClient(integration.id);
    return await client.mllpClient.testConnection();
  }

  private async sendMessage(client: any, params: any): Promise<any> {
    const hl7Message = await client.generator.generate(params);
    const ack = await client.mllpClient.send(hl7Message);
    return await client.parser.parse(ack);
  }

  private async parseMessage(client: any, hl7Message: string): Promise<any> {
    return await client.parser.parse(hl7Message);
  }

  private async generateMessage(client: any, params: any): Promise<any> {
    return await client.generator.generate(params);
  }
}

module.exports = new HL7Handler();
```

### Database Schema Extensions

```sql
-- Add HL7/FHIR vendor to integration_vendors
INSERT INTO integration_vendors (id, name, slug, description, requires_oauth, api_docs_url)
VALUES
  (uuid_generate_v4(), 'HL7 v2.x', 'hl7-v2x', 'HL7 version 2.x message exchange via MLLP', false, 'https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185'),
  (uuid_generate_v4(), 'FHIR R4', 'fhir-r4', 'FHIR R4 REST API', false, 'https://www.hl7.org/fhir/');

-- Add columns to integration_credentials for HL7/FHIR configs
ALTER TABLE integration_credentials
ADD COLUMN IF NOT EXISTS mllp_host VARCHAR(255),
ADD COLUMN IF NOT EXISTS mllp_port INTEGER,
ADD COLUMN IF NOT EXISTS tls_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tls_cert TEXT,
ADD COLUMN IF NOT EXISTS tls_key TEXT,
ADD COLUMN IF NOT EXISTS fhir_server_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS hl7_version VARCHAR(10) DEFAULT '2.5.1',
ADD COLUMN IF NOT EXISTS supported_message_types TEXT[]; -- ['ADT^A01', 'ORM^O01', ...]

-- Create HL7 message queue table
CREATE TABLE IF NOT EXISTS hl7_message_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  message_type VARCHAR(50) NOT NULL,
  message_control_id VARCHAR(100),
  raw_message TEXT NOT NULL,
  parsed_message JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER DEFAULT 3, -- 1 (high) to 5 (low)
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  INDEX idx_hl7_queue_status (status),
  INDEX idx_hl7_queue_org_id (org_id),
  INDEX idx_hl7_queue_created_at (created_at)
);

-- Create webhook subscriptions table (from Phase 05)
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events TEXT[] NOT NULL, -- ['hl7.received', 'fhir.created', ...]
  filters JSONB, -- { messageTypes: [...], resourceTypes: [...] }
  secret VARCHAR(255), -- HMAC secret
  active BOOLEAN DEFAULT true,
  retry_config JSONB, -- { maxAttempts: 5, backoffType: 'exponential', initialDelay: 2000 }
  headers JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_webhook_org_id (org_id),
  INDEX idx_webhook_active (active)
);

-- Create event log table
CREATE TABLE IF NOT EXISTS event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  message_type VARCHAR(50),
  message_control_id VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id UUID,
  data JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_event_log_org_id (org_id),
  INDEX idx_event_log_event_type (event_type),
  INDEX idx_event_log_created_at (created_at),
  INDEX idx_event_log_resource (resource_type, resource_id)
);
```

## Related Code Files

**Update Existing**:
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/index.js` - Register HL7/FHIR handlers
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` - Migrate to new module
- `/Users/developer/Projects/EHRConnect/ehr-api/src/routes/fhir.js` - Use new FHIR validator
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/abdm.handler.js` - Sync with FHIR module

**New Files to Create**:
- `ehr-api/src/integrations/hl7.handler.ts`
- `ehr-api/src/integrations/fhir.handler.ts`
- `ehr-api/src/routes/hl7.js`
- `ehr-api/src/routes/webhooks.js`
- `ehr-api/src/middleware/hl7-audit.js`
- `ehr-api/src/services/hl7-queue-processor.js`
- `ehr-api/src/database/migrations/YYYYMMDDHHMMSS-add_hl7_fhir_to_integration_vendors.js`
- `ehr-api/src/database/migrations/YYYYMMDDHHMMSS-create_hl7_message_queue.js`
- `ehr-api/src/database/migrations/YYYYMMDDHHMMSS-create_webhook_subscriptions.js`
- `ehr-api/src/database/migrations/YYYYMMDDHHMMSS-create_event_log.js`

## Implementation Steps

1. **Create Database Migrations** (2 hours)
   - Add HL7/FHIR vendors to integration_vendors
   - Extend integration_credentials table
   - Create hl7_message_queue table
   - Create webhook_subscriptions table
   - Create event_log table
   - Run migrations

2. **Implement HL7 Integration Handler** (4 hours)
   - Create hl7.handler.ts extending BaseIntegrationHandler
   - Initialize MLLP client with org-specific config
   - Implement execute() method for operations
   - Add connection testing
   - Register in Integration Orchestrator

3. **Implement FHIR Integration Handler** (3 hours)
   - Create fhir.handler.ts extending BaseIntegrationHandler
   - Initialize FHIR client (fhir-kit-client)
   - Implement CRUD operations
   - Add profile validation
   - Register in Integration Orchestrator

4. **Create HL7 API Routes** (3 hours)
   - POST /api/hl7/send - Send HL7 message
   - POST /api/hl7/parse - Parse HL7 message
   - POST /api/hl7/generate - Generate HL7 message
   - GET /api/hl7/queue - View message queue
   - POST /api/hl7/transform - HL7 ↔ FHIR transformation

5. **Update FHIR Routes** (3 hours)
   - Integrate new FHIR validator
   - Add profile-based validation
   - Emit fhir.* events
   - Update error handling to OperationOutcome
   - Maintain backward compatibility

6. **Build Webhook API** (3 hours)
   - POST /api/webhooks - Create subscription
   - GET /api/webhooks - List subscriptions
   - PUT /api/webhooks/:id - Update subscription
   - DELETE /api/webhooks/:id - Delete subscription
   - POST /api/webhooks/:id/test - Test webhook

7. **Implement Queue Processor** (4 hours)
   - Bull queue worker for hl7_message_queue
   - Process messages asynchronously
   - Retry failed messages
   - Move to DLQ after max attempts
   - Emit events on completion/failure

8. **Add Audit Logging Integration** (2 hours)
   - Create hl7-audit.js middleware
   - Log all HL7/FHIR operations
   - Record message send/receive
   - Track transformation operations
   - PHI access logging

9. **ABDM Integration** (3 hours)
   - Sync FHIR Patient with ABDM ABHA
   - Use ABDM profile validation
   - Emit events for ABDM operations
   - Leverage existing abdm.handler.js

10. **Multi-Tenant Configuration** (3 hours)
    - Per-org MLLP server configs
    - Per-org FHIR endpoint configs
    - Per-org webhook subscriptions
    - Configuration UI (admin panel)

11. **Migrate custom-hl7.handler.js** (3 hours)
    - Update to use new HL7 module
    - Preserve existing field mappings
    - Test with existing integrations
    - Deploy with feature flag

12. **Testing** (5 hours)
    - Unit tests for handlers
    - Integration tests with orchestrator
    - Test multi-tenant isolation
    - Test RBAC enforcement
    - Test audit logging
    - Load test with 100 orgs

13. **Documentation** (2 hours)
    - Integration setup guide
    - Configuration reference
    - API documentation
    - Migration guide from old handler

## Todo List

- [ ] Create database migrations (vendors, queue, webhooks, events)
- [ ] Implement HL7 integration handler
- [ ] Implement FHIR integration handler
- [ ] Create HL7 API routes
- [ ] Update FHIR routes with new validator
- [ ] Build webhook API (CRUD + test)
- [ ] Implement queue processor for async processing
- [ ] Add audit logging middleware
- [ ] Integrate with ABDM handler
- [ ] Add multi-tenant configuration management
- [ ] Migrate custom-hl7.handler.js to new module
- [ ] Register handlers in Integration Orchestrator
- [ ] Write unit tests for handlers
- [ ] Write integration tests
- [ ] Test multi-tenant isolation
- [ ] Test RBAC enforcement
- [ ] Perform load testing (100 orgs)
- [ ] Document integration setup

## Success Criteria

- [ ] HL7/FHIR handlers registered in Integration Orchestrator
- [ ] Configs stored in integration_credentials table
- [ ] Multi-tenant isolation enforced (org_id checks)
- [ ] RBAC permissions respected
- [ ] All operations logged to audit_logs
- [ ] ABDM sync works with FHIR resources
- [ ] custom-hl7.handler.js successfully migrated
- [ ] Webhook API functional
- [ ] Queue processor handles messages asynchronously
- [ ] 80%+ code coverage on new code
- [ ] Integration tests pass
- [ ] Load test supports 100+ orgs

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration breaks existing integrations | High | Feature flag, gradual rollout, rollback plan |
| Multi-tenant data leakage | Critical | Row-level security, thorough testing, code review |
| Performance degradation | Medium | Connection pooling, caching, load testing |
| RBAC bypass | High | Security audit, penetration testing |

## Security Considerations

- Enforce org_id isolation at database level (row-level security)
- RBAC checks on all HL7/FHIR endpoints
- TLS required for MLLP connections in production
- Webhook URL validation (no internal IPs)
- HMAC signature for webhook delivery
- Audit log all PHI access
- Rate limiting per organization
- Credential encryption in database

## Next Steps

After completion, proceed to:
- **Phase 07**: Production Ready (monitoring, retry, audit, deployment)

## Unresolved Questions

1. Support for multiple HL7 connections per organization?
2. Configuration versioning and rollback strategy?
3. Cross-org data sharing workflow (consents)?
4. Integration with existing Epic/Cerner handlers?
5. Support for HL7 v3 (CDA) in addition to v2.x?
