# Phase 02: HL7 v2.x Core

**Phase**: 02/07
**Status**: Pending
**Priority**: P0 (Blocker)
**Estimated Effort**: 3-4 days
**Dependencies**: Phase 01 (Module Foundation)

## Overview

Implement production-grade HL7 v2.x parsing, generation, validation, and MLLP transport layer (both client and server). Migrate existing simulated HL7 handler to real TCP/TLS connections.

## Key Insights from Research

- Existing handler has parsing/generation logic but simulated transport (lines 110-154 in custom-hl7.handler.js)
- Field mapping system already exists (lines 328-447)
- Support for ADT, ORM, ORU message types configured (line 24)
- MLLP framing: `0x0B` (start) + message + `0x1C 0x0D` (end)
- Standard port 2575, TLS optional but recommended

## Requirements

### Functional
- **Parser**: Extract segments, fields, components, repetitions, handle escape sequences
- **Generator**: Build MSH, PID, PV1, OBX, ORC segments from structured data
- **Validator**: Check required segments, field cardinality, data types, code systems
- **MLLP Server**: Accept connections, auto-ACK, route to queue
- **MLLP Client**: Connection pooling, reconnect, timeout handling
- **Message Types**: ADT_A01, ADT_A08, ORM_O01, ORU_R01, ACK

### Non-Functional
- Parse 10,000 msgs/sec (single core)
- <100ms p95 latency for send + ACK
- Support HL7 v2.3, v2.4, v2.5, v2.5.1, v2.6
- TLS 1.2+ for secure transport
- Graceful connection shutdown (no message loss)

## Architecture

### Component Design

```
HL7 Module Architecture:

┌─────────────────────────────────────────────────────────┐
│                   MLLP Server (Port 2575)                │
│  - TCP Server with TLS support                           │
│  - Connection pooling (max 100 concurrent)               │
│  - Auto-ACK generation (AA/AE/AR)                        │
└────────────────────┬────────────────────────────────────┘
                     │ Incoming HL7 Messages
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Message Parser                         │
│  - Extract delimiters (|^~\&)                           │
│  - Segment splitting (MSH, PID, PV1, etc.)              │
│  - Field/component/repetition parsing                   │
│  - Escape sequence handling (\F\, \S\, etc.)           │
└────────────────────┬────────────────────────────────────┘
                     │ Parsed HL7Message object
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Message Validator                      │
│  - Required segment checks (MSH mandatory)              │
│  - Field cardinality (required, optional, repeating)    │
│  - Data type validation (date, time, numeric, coded)    │
│  - Cross-segment consistency                            │
└────────────────────┬────────────────────────────────────┘
                     │ Valid HL7Message
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Message Queue (Redis)                  │
│  Queue: hl7.inbound                                      │
│  - Priority: Critical (1), High (2), Normal (3)         │
│  - Job data: { message, source, timestamp, orgId }      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Queue Workers                          │
│  - Process messages asynchronously                       │
│  - Transform to FHIR (Phase 04)                         │
│  - Trigger events (Phase 05)                            │
│  - Persist to database                                  │
└─────────────────────────────────────────────────────────┘

Outbound Flow:
┌─────────────────────────────────────────────────────────┐
│              Message Generator                           │
│  - Build MSH with control ID                            │
│  - Add segments based on message type                   │
│  - Apply field mappings                                 │
│  - Format with delimiters                               │
└────────────────────┬────────────────────────────────────┘
                     │ Raw HL7 string
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MLLP Client                            │
│  - Connection pool (2-10 connections)                   │
│  - Wrap with MLLP framing (0x0B...0x1C0x0D)            │
│  - Send over TCP/TLS                                    │
│  - Wait for ACK (with timeout)                          │
│  - Retry on failure (exponential backoff)               │
└─────────────────────────────────────────────────────────┘
```

### Parser Implementation Details

**Escape Sequence Handling**:
```
\F\ = Field separator (|)
\S\ = Component separator (^)
\T\ = Subcomponent separator (&)
\R\ = Repetition separator (~)
\E\ = Escape character (\)
\Xdd\ = Hexadecimal code
\.br\ = Line break
```

**Segment Parsing Algorithm**:
```
1. Split by \r\n or \r or \n
2. First segment must be MSH
3. Extract delimiters from MSH[3] and MSH[4-7]
4. For each segment:
   - Split by field separator
   - For each field:
     - Split by repetition separator (~)
     - Split by component separator (^)
     - Split by subcomponent separator (&)
5. Unescape special characters
```

### MLLP Protocol Implementation

**Server Side**:
```typescript
class MLLPServer {
  private server: net.Server;
  private connections: Map<string, net.Socket> = new Map();

  async start(config: MLLPServerConfig): Promise<void> {
    this.server = net.createServer((socket) => {
      const connId = `${socket.remoteAddress}:${socket.remotePort}`;
      this.connections.set(connId, socket);

      let buffer = '';

      socket.on('data', async (data) => {
        buffer += data.toString('binary');

        // Extract MLLP-framed messages
        const MLLP_START = '\x0B';
        const MLLP_END = '\x1C\x0D';

        let startIdx = buffer.indexOf(MLLP_START);
        while (startIdx !== -1) {
          const endIdx = buffer.indexOf(MLLP_END, startIdx);
          if (endIdx === -1) break; // Incomplete message

          const hl7Message = buffer.substring(startIdx + 1, endIdx);
          buffer = buffer.substring(endIdx + 2);

          // Process message
          await this.handleMessage(socket, hl7Message, connId);

          startIdx = buffer.indexOf(MLLP_START);
        }
      });

      socket.on('error', (err) => {
        logger.error('Socket error', { connId, error: err });
        this.connections.delete(connId);
      });

      socket.on('close', () => {
        this.connections.delete(connId);
      });
    });

    this.server.listen(config.port, config.host);
  }

  private async handleMessage(
    socket: net.Socket,
    hl7Message: string,
    connId: string
  ): Promise<void> {
    try {
      // Parse message
      const parsed = await hl7Parser.parse(hl7Message);

      // Validate
      const validation = await hl7Validator.validate(parsed);

      // Generate ACK
      const ack = validation.valid
        ? this.generateACK(parsed, 'AA')
        : this.generateACK(parsed, 'AE', validation.errors);

      // Send ACK immediately
      socket.write(`\x0B${ack}\x1C\x0D`);

      // Queue for async processing (if valid)
      if (validation.valid) {
        await messageQueue.add('hl7.inbound', {
          message: parsed,
          source: connId,
          timestamp: new Date().toISOString(),
          orgId: this.extractOrgId(parsed)
        });
      }
    } catch (err) {
      // Send NACK
      const nack = this.generateACK({ messageControlId: 'ERROR' }, 'AR');
      socket.write(`\x0B${nack}\x1C\x0D`);
      logger.error('Message handling error', { connId, error: err });
    }
  }

  private generateACK(
    message: HL7Message,
    ackCode: 'AA' | 'AE' | 'AR',
    errors?: string[]
  ): string {
    const timestamp = formatHL7DateTime(new Date());
    const controlId = `ACK${Date.now()}`;

    let ack = `MSH|^~\\&|EHRConnect|EHR|${message.sendingApplication}|${message.sendingFacility}|${timestamp}||ACK|${controlId}|P|2.5.1\r`;
    ack += `MSA|${ackCode}|${message.messageControlId}`;

    if (errors && errors.length > 0) {
      ack += `|${errors.join('; ')}`;
    }

    return ack;
  }
}
```

**Client Side**:
```typescript
class MLLPClient {
  private pool: ConnectionPool;

  async send(
    config: MLLPClientConfig,
    hl7Message: string
  ): Promise<HL7Message> {
    const socket = await this.pool.acquire(config);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new MLLPTimeoutError('ACK timeout'));
      }, config.timeout || 30000);

      let buffer = '';

      socket.once('data', (data) => {
        clearTimeout(timeout);
        buffer += data.toString('binary');

        // Extract ACK
        const MLLP_START = '\x0B';
        const MLLP_END = '\x1C\x0D';
        const startIdx = buffer.indexOf(MLLP_START);
        const endIdx = buffer.indexOf(MLLP_END);

        if (startIdx !== -1 && endIdx !== -1) {
          const ack = buffer.substring(startIdx + 1, endIdx);
          resolve(hl7Parser.parse(ack));
          this.pool.release(socket);
        } else {
          reject(new HL7ParseError('Invalid ACK format'));
          this.pool.release(socket);
        }
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(new MLLPConnectionError(err.message));
        this.pool.destroy(socket);
      });

      // Send message with MLLP framing
      const framed = `\x0B${hl7Message}\x1C\x0D`;
      socket.write(framed);
    });
  }
}
```

## Related Code Files

**Migrate from**:
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` (lines 156-227: parser)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` (lines 229-286: generator)
- `/Users/developer/Projects/EHRConnect/ehr-api/src/integrations/custom-hl7.handler.js` (lines 288-326: validator)

**New Files to Create**:
- `packages/hl7-fhir/src/hl7/parser.ts`
- `packages/hl7-fhir/src/hl7/generator.ts`
- `packages/hl7-fhir/src/hl7/validator.ts`
- `packages/hl7-fhir/src/hl7/client/mllp-client.ts`
- `packages/hl7-fhir/src/hl7/client/mllp-server.ts`
- `packages/hl7-fhir/src/hl7/client/connection-pool.ts`
- `packages/hl7-fhir/src/hl7/segments/msh.ts`
- `packages/hl7-fhir/src/hl7/segments/pid.ts`
- `packages/hl7-fhir/src/hl7/segments/pv1.ts`

## Implementation Steps

1. **Install HL7 Libraries** (30 mins)
   - `node-hl7-client` and `node-hl7-server`
   - Alternative: `hl7-mllp` by PantelisGeorgiadis
   - Evaluate and choose (recommend node-hl7-client for TypeScript)

2. **Implement Parser** (4 hours)
   - Port logic from custom-hl7.handler.js (lines 156-227)
   - Add escape sequence handling
   - Support all HL7 versions (2.3-2.6)
   - Handle malformed messages gracefully
   - Unit tests with real-world messages

3. **Implement Generator** (3 hours)
   - Port logic from custom-hl7.handler.js (lines 229-286)
   - Template system for common message types
   - Field mapping integration
   - Proper escape sequence encoding
   - Unit tests for each message type

4. **Implement Validator** (4 hours)
   - Port logic from custom-hl7.handler.js (lines 288-326)
   - Add segment validation rules (MSH, PID, PV1, etc.)
   - Field cardinality checks
   - Data type validation (date, time, numeric, coded)
   - Configurable strictness levels
   - Unit tests with valid/invalid messages

5. **Build MLLP Server** (6 hours)
   - TCP server with TLS support
   - Connection limit enforcement
   - MLLP framing/deframing
   - Auto-ACK generation (AA/AE/AR)
   - Graceful shutdown (drain connections)
   - Health check endpoint
   - Integration test with HL7 client tool

6. **Build MLLP Client** (5 hours)
   - Connection pooling (min 2, max 10)
   - Auto-reconnect with backoff
   - TLS configuration
   - Timeout handling
   - Send + wait for ACK pattern
   - Retry mechanism (3 attempts)
   - Integration test with HL7 server

7. **Create Segment Builders** (3 hours)
   - `segments/msh.ts` - Message Header
   - `segments/pid.ts` - Patient Identification
   - `segments/pv1.ts` - Patient Visit
   - `segments/obx.ts` - Observation Result
   - `segments/orc.ts` - Order Control
   - Fluent API for segment construction

8. **Integrate with Queue** (2 hours)
   - Setup Bull queue for inbound messages
   - Queue processor for async handling
   - Dead letter queue for failures
   - Retry policy configuration

9. **Add Monitoring and Metrics** (2 hours)
   - Message throughput counter
   - Parse error rate
   - Connection pool metrics
   - ACK/NACK ratio tracking

10. **Testing** (4 hours)
    - Unit tests (80%+ coverage)
    - Integration tests (MLLP client-server)
    - Load test (10K msgs/sec)
    - Error scenario tests

11. **Documentation** (2 hours)
    - API reference for parser/generator/validator
    - MLLP configuration guide
    - Message type support matrix
    - Troubleshooting guide

## Todo List

- [ ] Install node-hl7-client and node-hl7-server
- [ ] Implement HL7 parser with escape sequence handling
- [ ] Implement HL7 generator with templates
- [ ] Implement HL7 validator with segment rules
- [ ] Build MLLP server with auto-ACK
- [ ] Build MLLP client with connection pooling
- [ ] Create segment builder utilities (MSH, PID, PV1, etc.)
- [ ] Integrate with Redis Bull queue
- [ ] Add monitoring and metrics
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests (client-server)
- [ ] Perform load testing (10K msgs/sec)
- [ ] Test with real HL7 feeds (Epic, Cerner)
- [ ] Document API and configuration
- [ ] Update existing custom-hl7.handler.js to use new module

## Success Criteria

- [ ] Parse 10,000+ messages/sec on single core
- [ ] Generate all supported message types (ADT, ORM, ORU, ACK)
- [ ] Validator catches all common errors
- [ ] MLLP server accepts 100+ concurrent connections
- [ ] MLLP client sends/receives with <100ms p95 latency
- [ ] Zero message loss on graceful shutdown
- [ ] TLS 1.2+ support for secure transport
- [ ] Integration test passes with Epic/Cerner simulators
- [ ] 80%+ code coverage on unit tests
- [ ] Documentation complete with examples

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| MLLP connection drops during send | High | Retry logic, transaction IDs, queue persistence |
| Parser fails on non-standard segments | Medium | Lenient mode, log unknown segments, continue processing |
| Performance bottleneck on parsing | Medium | Optimize hot path, use binary buffers, benchmark regularly |
| ACK timeout causes duplicate sends | High | Idempotency keys, deduplication on receive side |

## Security Considerations

- TLS 1.2+ required for production MLLP
- Certificate validation (no self-signed in prod)
- Connection rate limiting (prevent DoS)
- Input validation (prevent injection via escape sequences)
- Audit log all message sends/receives
- PHI encryption at rest (queue storage)

## Next Steps

After completion, proceed to:
- **Phase 03**: FHIR R4 Core (REST client, resource handlers)
- **Phase 04**: Transformation Engine (HL7 ↔ FHIR mapping)

## Unresolved Questions

1. Support for HL7 v3 (CDA) in addition to v2.x?
2. Message archival to S3/cold storage after N days?
3. Multi-datacenter MLLP routing strategy?
4. Custom segment definitions (Zxx segments)?
5. Real-time message monitoring dashboard requirements?
