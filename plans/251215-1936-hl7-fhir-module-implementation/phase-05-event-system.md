# Phase 05: Event System

**Phase**: 05/07
**Status**: Pending
**Priority**: P1
**Estimated Effort**: 2-3 days
**Dependencies**: Phase 02 (HL7 v2.x Core), Phase 03 (FHIR R4 Core)

## Overview

Build event-driven architecture for HL7/FHIR message processing with event emitters, listeners, webhook delivery system with retry logic, and integration with existing Socket.IO notifications.

## Key Insights from Research

- Existing Socket.IO events for appointments (lines 107-229 in fhir.js)
- Event naming pattern: `resourceType:action` (e.g., `appointment:created`)
- Organization-level room namespacing: `org:${orgId}`
- No webhook system currently implemented
- Need async event processing to avoid blocking main thread

## Requirements

### Functional
- **Event Types**: `hl7.received`, `hl7.sent`, `hl7.error`, `fhir.created`, `fhir.updated`, `fhir.deleted`
- **Event Emitter**: Publish events to subscribers (in-process and external)
- **Event Listeners**: Register handlers for specific event types
- **Webhooks**: HTTP POST to external URLs with retry logic
- **Socket.IO Integration**: Real-time notifications to connected clients
- **Event History**: Persist events for audit and replay
- **Filtering**: Organization-level, resource-type, message-type filters

### Non-Functional
- Process 10,000+ events/sec
- Webhook delivery <5s p95 (including retries)
- Exponential backoff: 2s, 4s, 8s, 16s, 32s
- Max 5 retry attempts
- Event persistence for 90 days
- Zero event loss (at-least-once delivery)

## Architecture

### Component Design

```
Event System Architecture:

┌─────────────────────────────────────────────────────────┐
│                  Event Sources                           │
│  - MLLP Server (HL7 message received)                   │
│  - MLLP Client (HL7 message sent)                       │
│  - FHIR REST API (resource created/updated/deleted)     │
│  - Transformation Engine (conversion completed)         │
└────────────────────┬────────────────────────────────────┘
                     │ emit(event)
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Event Emitter (Central Hub)                │
│  - EventEmitter2 (wildcards, namespaces)                │
│  - Event validation and enrichment                      │
│  - Automatic event persistence                          │
└────────┬───────────────────────────┬────────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│  In-Process          │   │  External Subscribers         │
│  Event Listeners     │   │  (Webhooks, Queue)           │
│  - Audit Logger      │   │                               │
│  - Metrics Collector │   │  ┌────────────────────────┐  │
│  - Task Creator      │   │  │ Webhook Delivery       │  │
│  - FHIR Sync         │   │  │ - HTTP POST            │  │
└──────────────────────┘   │  │ - Retry with backoff   │  │
                           │  │ - DLQ for failures     │  │
                           │  └────────────────────────┘  │
                           │                               │
                           │  ┌────────────────────────┐  │
                           │  │ Socket.IO Broadcast    │  │
                           │  │ - Room-based           │  │
                           │  │ - Real-time push       │  │
                           │  └────────────────────────┘  │
                           └──────────────────────────────┘

Event Flow Example (HL7 Message Received):

1. MLLP Server receives ADT^A01 message
2. Parser validates and extracts data
3. Emit event: hl7.received
   {
     eventType: 'hl7.received',
     messageType: 'ADT^A01',
     messageControlId: 'MSG12345',
     orgId: 'org-uuid',
     timestamp: '2023-01-15T10:30:00Z',
     data: { parsed HL7 message }
   }
4. Event Hub persists to database
5. Event Hub notifies listeners:
   a. Audit Logger → writes to audit_logs table
   b. Transformation Service → converts to FHIR
   c. Webhook Delivery → POSTs to registered URLs
   d. Socket.IO → broadcasts to org:org-uuid room
6. If webhook fails, retry with exponential backoff
7. After 5 attempts, move to DLQ for manual review
```

### Event Schema

```typescript
interface HL7FHIREvent {
  id: string;                   // UUID
  eventType: EventType;
  timestamp: Date;
  orgId: string;
  source: EventSource;

  // Event-specific data
  messageType?: string;         // For HL7 events
  messageControlId?: string;    // For HL7 events
  resourceType?: string;        // For FHIR events
  resourceId?: string;          // For FHIR events

  data: any;                    // Event payload
  metadata?: Record<string, any>;

  // Delivery tracking
  attempts?: number;
  lastAttemptAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
}

enum EventType {
  // HL7 Events
  HL7_RECEIVED = 'hl7.received',
  HL7_SENT = 'hl7.sent',
  HL7_ERROR = 'hl7.error',
  HL7_PARSED = 'hl7.parsed',
  HL7_VALIDATED = 'hl7.validated',

  // FHIR Events
  FHIR_CREATED = 'fhir.created',
  FHIR_UPDATED = 'fhir.updated',
  FHIR_DELETED = 'fhir.deleted',
  FHIR_SEARCHED = 'fhir.searched',

  // Transformation Events
  TRANSFORM_STARTED = 'transform.started',
  TRANSFORM_COMPLETED = 'transform.completed',
  TRANSFORM_FAILED = 'transform.failed',

  // System Events
  CONNECTION_OPENED = 'connection.opened',
  CONNECTION_CLOSED = 'connection.closed',
}

enum EventSource {
  MLLP_SERVER = 'mllp-server',
  MLLP_CLIENT = 'mllp-client',
  FHIR_API = 'fhir-api',
  TRANSFORMER = 'transformer',
  QUEUE_WORKER = 'queue-worker',
}

interface WebhookSubscription {
  id: string;
  orgId: string;
  name: string;
  url: string;
  events: EventType[];          // Filter by event types
  filters?: {
    messageTypes?: string[];    // e.g., ['ADT^A01', 'ORM^O01']
    resourceTypes?: string[];   // e.g., ['Patient', 'Observation']
  };
  secret?: string;              // HMAC signature
  active: boolean;
  retryConfig?: {
    maxAttempts: number;
    backoffType: 'exponential' | 'linear';
    initialDelay: number;
  };
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Webhook Delivery Implementation

```typescript
class WebhookDelivery {
  private queue: Queue;

  constructor(redisConfig: RedisConfig) {
    this.queue = new Queue('webhooks', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000  // Start with 2s
        },
        removeOnComplete: true,
        removeOnFail: false  // Keep failures for review
      }
    });

    this.queue.process(async (job) => {
      return await this.deliver(job.data);
    });
  }

  async enqueue(subscription: WebhookSubscription, event: HL7FHIREvent): Promise<void> {
    // Check if event matches subscription filters
    if (!this.matchesFilters(subscription, event)) {
      return;
    }

    await this.queue.add({
      subscriptionId: subscription.id,
      subscriptionUrl: subscription.url,
      event: event,
      secret: subscription.secret,
      headers: subscription.headers
    }, {
      jobId: `${subscription.id}:${event.id}`,
      priority: this.calculatePriority(event.eventType)
    });
  }

  private async deliver(job: WebhookJob): Promise<void> {
    const startTime = Date.now();

    try {
      const payload = JSON.stringify(job.event);
      const signature = this.generateSignature(payload, job.secret);

      const response = await fetch(job.subscriptionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-EHRConnect-Signature': signature,
          'X-EHRConnect-Event': job.event.eventType,
          'X-EHRConnect-Delivery': job.event.id,
          ...job.headers
        },
        body: payload,
        signal: AbortSignal.timeout(10000)  // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Log successful delivery
      await this.logDelivery(job, 'success', Date.now() - startTime);

    } catch (error) {
      // Log failure
      await this.logDelivery(job, 'failed', Date.now() - startTime, error.message);
      throw error;  // Let Bull handle retry
    }
  }

  private generateSignature(payload: string, secret?: string): string {
    if (!secret) return '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  private matchesFilters(subscription: WebhookSubscription, event: HL7FHIREvent): boolean {
    // Check event type
    if (!subscription.events.includes(event.eventType)) {
      return false;
    }

    // Check message type filter (HL7)
    if (subscription.filters?.messageTypes && event.messageType) {
      if (!subscription.filters.messageTypes.includes(event.messageType)) {
        return false;
      }
    }

    // Check resource type filter (FHIR)
    if (subscription.filters?.resourceTypes && event.resourceType) {
      if (!subscription.filters.resourceTypes.includes(event.resourceType)) {
        return false;
      }
    }

    return true;
  }

  private calculatePriority(eventType: EventType): number {
    // Critical events get higher priority
    const priorityMap = {
      [EventType.HL7_ERROR]: 1,
      [EventType.FHIR_DELETED]: 1,
      [EventType.HL7_RECEIVED]: 2,
      [EventType.FHIR_CREATED]: 2,
      [EventType.FHIR_UPDATED]: 3,
    };
    return priorityMap[eventType] || 5;
  }
}
```

### Socket.IO Integration

```typescript
class SocketIOEventBroadcaster {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async broadcast(event: HL7FHIREvent): Promise<void> {
    // Broadcast to organization room
    const room = `org:${event.orgId}`;

    // Transform event for client consumption
    const clientEvent = this.transformForClient(event);

    this.io.to(room).emit(event.eventType, clientEvent);

    // Also emit to specific resource room if applicable
    if (event.resourceType && event.resourceId) {
      const resourceRoom = `${event.resourceType}:${event.resourceId}`;
      this.io.to(resourceRoom).emit(event.eventType, clientEvent);
    }
  }

  private transformForClient(event: HL7FHIREvent): any {
    // Remove sensitive data, transform for frontend
    return {
      id: event.id,
      eventType: event.eventType,
      timestamp: event.timestamp,
      messageType: event.messageType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      // Don't send full data, just summary
      summary: this.generateSummary(event)
    };
  }

  private generateSummary(event: HL7FHIREvent): string {
    switch (event.eventType) {
      case EventType.HL7_RECEIVED:
        return `HL7 ${event.messageType} message received`;
      case EventType.FHIR_CREATED:
        return `${event.resourceType} created`;
      case EventType.FHIR_UPDATED:
        return `${event.resourceType} updated`;
      default:
        return event.eventType;
    }
  }
}
```

## Related Code Files

**Extend Existing**:
- `/Users/developer/Projects/EHRConnect/ehr-api/src/routes/fhir.js` (lines 107-229: Socket.IO events)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/services/socket.service.js`

**New Files to Create**:
- `packages/hl7-fhir/src/events/index.ts`
- `packages/hl7-fhir/src/events/emitter.ts`
- `packages/hl7-fhir/src/events/webhook.ts`
- `packages/hl7-fhir/src/events/socket-io.ts`
- `packages/hl7-fhir/src/events/listeners/audit-logger.ts`
- `packages/hl7-fhir/src/events/listeners/metrics-collector.ts`
- `ehr-api/src/database/migrations/YYYYMMDDHHMMSS-create_webhook_subscriptions_table.js`
- `ehr-api/src/database/migrations/YYYYMMDDHHMMSS-create_event_log_table.js`

## Implementation Steps

1. **Design Event Schema** (2 hours)
   - Define event types enum
   - Define event data structure
   - Design webhook subscription model
   - Design database tables

2. **Implement Event Emitter** (3 hours)
   - Use EventEmitter2 for wildcards
   - Event validation
   - Automatic persistence
   - Namespace support (org-level isolation)

3. **Build Webhook Delivery System** (5 hours)
   - Queue-based delivery (Bull)
   - Retry logic with exponential backoff
   - HMAC signature generation
   - Timeout handling
   - DLQ for permanent failures

4. **Integrate with Socket.IO** (3 hours)
   - Broadcast events to org rooms
   - Resource-specific rooms
   - Transform events for client
   - Rate limiting per connection

5. **Create Built-in Listeners** (4 hours)
   - Audit logger listener
   - Metrics collector listener
   - Task creator listener (integrate with existing task system)
   - FHIR sync listener (for Medplum)

6. **Build Subscription Management API** (3 hours)
   - POST /api/webhooks - Create subscription
   - GET /api/webhooks - List subscriptions
   - PUT /api/webhooks/:id - Update subscription
   - DELETE /api/webhooks/:id - Delete subscription
   - POST /api/webhooks/:id/test - Test webhook delivery

7. **Implement Event History API** (2 hours)
   - GET /api/events - Query event history
   - Filters: eventType, orgId, dateRange, resourceType
   - Pagination support
   - Export to CSV/JSON

8. **Add Event Filtering** (2 hours)
   - Organization-level filters
   - Message type filters (HL7)
   - Resource type filters (FHIR)
   - Custom filter expressions (JSONPath)

9. **Integrate with Existing Systems** (3 hours)
   - Update MLLP server to emit events
   - Update FHIR routes to emit events
   - Update transformation engine to emit events
   - Update existing Socket.IO events to use new system

10. **Testing** (4 hours)
    - Unit tests for event emitter
    - Integration tests for webhook delivery
    - Test retry logic and backoff
    - Test Socket.IO broadcasting
    - Load test (10K events/sec)

11. **Monitoring and Metrics** (2 hours)
    - Event throughput counter
    - Webhook delivery success rate
    - Retry attempt tracking
    - DLQ size monitoring

12. **Documentation** (2 hours)
    - Event types reference
    - Webhook subscription guide
    - Security best practices (HMAC signatures)
    - Troubleshooting delivery failures

## Todo List

- [ ] Design event schema and database tables
- [ ] Implement central event emitter
- [ ] Build webhook delivery system with retry
- [ ] Integrate with Socket.IO for real-time events
- [ ] Create audit logger listener
- [ ] Create metrics collector listener
- [ ] Build subscription management API
- [ ] Implement event history API with filtering
- [ ] Add event filtering (org, message type, resource type)
- [ ] Integrate with MLLP server (emit events)
- [ ] Integrate with FHIR routes (emit events)
- [ ] Integrate with transformation engine (emit events)
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests for webhook delivery
- [ ] Perform load testing (10K events/sec)
- [ ] Add monitoring and metrics
- [ ] Document event types and webhook setup

## Success Criteria

- [ ] Process 10,000+ events/sec without backpressure
- [ ] Webhook delivery <5s p95 (including retries)
- [ ] Exponential backoff works correctly (2s, 4s, 8s, 16s, 32s)
- [ ] Zero event loss (at-least-once delivery)
- [ ] Socket.IO broadcasts to correct rooms
- [ ] Event history queryable with filters
- [ ] Subscription management API functional
- [ ] 80%+ code coverage on unit tests
- [ ] Integration tests pass for all event types
- [ ] Documentation complete with examples

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event flooding (too many events) | High | Rate limiting, backpressure, priority queues |
| Webhook endpoint down | Medium | Retry logic, DLQ, alerting |
| Event loss during system restart | High | Persist events to database, graceful shutdown |
| Performance degradation under load | Medium | Queue-based processing, horizontal scaling |

## Security Considerations

- HMAC signature verification for webhooks
- TLS required for webhook URLs (no HTTP)
- Audit log all event emissions
- Rate limiting on webhook subscriptions
- Organization isolation (can't subscribe to other orgs)
- PHI filtering in Socket.IO events (no full data)

## Next Steps

After completion, proceed to:
- **Phase 06**: Integration (connect to EHRConnect systems)
- **Phase 07**: Production Ready (queuing, monitoring, audit)

## Unresolved Questions

1. Support for custom event types (user-defined)?
2. Event replay mechanism for debugging?
3. Event aggregation (batch multiple events)?
4. Support for Server-Sent Events (SSE) in addition to Socket.IO?
5. Event schema versioning strategy?
