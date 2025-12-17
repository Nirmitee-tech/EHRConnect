# HL7 v2.x Implementation Research - Node.js/TypeScript

**Date**: 2025-12-15
**Focus**: Production-ready libraries, MLLP transport, message types, architectural patterns

---

## 1. Top Node.js/TypeScript Libraries for HL7 v2.x

### 1.1 **node-hl7-client** + **node-hl7-server** ⭐ RECOMMENDED
- **NPM**: `node-hl7-client`, `node-hl7-server`
- **TypeScript**: Native TypeScript with full type definitions
- **Status**: Active, production-ready (2025)

**Key Features**:
- Zero external dependencies, ultra-fast performance
- Auto-reconnect and retry functionality
- TLS/SSL support
- Supports single and batched messages (MSH, BHS, FHS)
- CommonJS, ESM, TypeScript formats

**Code Example**:
```typescript
import { Server } from 'node-hl7-server';
import { Client } from 'node-hl7-client';

// Server setup
const server = new Server({ port: 3000 });
server.on('message', (message) => {
  console.log('Received:', message.toString());
  // Auto ACK generation
});

// Client setup
const client = new Client({ host: 'localhost', port: 3000 });
await client.sendMessage(hl7Message);
```

**Links**: [GitHub - node-hl7-client](https://github.com/Bugs5382/node-hl7-client), [npm - node-hl7-server](https://www.npmjs.com/package/node-hl7-server)

---

### 1.2 **panates/hl7v2**
- **NPM**: `hl7v2`
- **TypeScript**: Yes
- **Status**: Active

**Key Features**:
- Advanced parser, serializer, validator
- Built-in TCP client/server
- Schema validation support
- Server and client classes included

**Links**: [GitHub - panates/hl7v2](https://github.com/panates/hl7v2)

---

### 1.3 **ts-hl7**
- **NPM**: `ts-hl7`
- **TypeScript**: Native TypeScript client
- **Status**: Active development

**Key Features**:
- Decode, encode, extract data from HL7 messages
- Message transformation (move, copy, delete values)
- Work with segments, fields, components, repetitions
- Schema validation (planned feature, not fully implemented)

**Links**: [GitHub - ts-hl7](https://github.com/amaster507/ts-hl7), [npm - ts-hl7](https://www.npmjs.com/package/ts-hl7)

---

### 1.4 **simple-hl7**
- **NPM**: `simple-hl7`
- **TypeScript**: Partial support
- **Status**: Mature

**Key Features**:
- Express/Connect-based middleware
- Easy HL7 interfaces like Express web servers
- Good for rapid prototyping

**Links**: [npm - simple-hl7](https://www.npmjs.com/package/simple-hl7)

---

### 1.5 **fastify-hl7**
- **NPM**: `fastify-hl7`
- **TypeScript**: Pure TypeScript
- **Status**: Active

**Key Features**:
- Fastify plugin wrapper for node-hl7-client/server
- High-performance Fastify ecosystem integration
- Modern plugin architecture

**Links**: [GitHub - fastify-hl7](https://github.com/Bugs5382/fastify-hl7)

---

## 2. MLLP Transport Implementation

### 2.1 **Recommended MLLP Libraries**

#### **hl7-mllp** (PantelisGeorgiadis) ⭐ RECOMMENDED
- **NPM**: `hl7-mllp`
- **Features**:
  - Both client and server functionality
  - Built-in HL7 message handling
  - Auto ACK generation
  - Proper framing (VT, FS, CR characters)

**Links**: [GitHub - hl7-mllp](https://github.com/PantelisGeorgiadis/hl7-mllp)

#### **@keepsolutions/mllp-node**
- **NPM**: `@keepsolutions/mllp-node`
- **Features**:
  - Server implementation
  - Apache 2.0 licensed
  - Send and receive HL7 messages

**Links**: [npm - @keepsolutions/mllp-node](https://www.npmjs.com/package/@keepsolutions/mllp-node), [GitHub - mllp](https://github.com/keeps/mllp)

#### **http-mllp-node**
- **NPM**: `http-mllp-node`
- **Features**:
  - Express HTTP gateway to MLLP endpoints
  - Useful for REST API → MLLP conversion
  - Bridges HTTP and MLLP protocols

**Links**: [GitHub - http-mllp-node](https://github.com/whitebrick/http-mllp-node)

---

### 2.2 **MLLP Connection Management**

**Best Practices**:
- Auto-reconnect with exponential backoff
- Connection pooling for high throughput
- TLS/SSL for secure transmission
- Keep-alive mechanisms
- Timeout handling (connection, read, write)

**Code Pattern**:
```typescript
import { MLLPServer } from 'hl7-mllp';

const server = new MLLPServer({
  port: 5000,
  tls: true,
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});

server.on('hl7', (message) => {
  // Parse and process
  const ack = generateACK(message);
  return ack;
});
```

---

## 3. HL7 v2.x Message Types for EMR Systems

### 3.1 **ADT - Admit, Discharge, Transfer**
**Purpose**: Patient movement and demographic updates

**Common Events**:
- `ADT^A01` - Patient admission
- `ADT^A02` - Patient transfer
- `ADT^A03` - Patient discharge
- `ADT^A04` - Patient registration
- `ADT^A08` - Patient information update
- `ADT^A11` - Cancel admission
- `ADT^A12` - Cancel transfer
- `ADT^A13` - Cancel discharge

**Structure**:
```
MSH|^~\&|SENDING_APP|SENDING_FACILITY|...
EVN|A01|20251215103000|||
PID|1||123456^^^MRN||DOE^JOHN^A||19800101|M|||...
PV1|1|I|2000^2012^01||||...
```

**Links**: [HL7 ADT Guide](https://www.tactionsoft.com/guide/adt-event-types-hl7/), [Healthcare Integrations Tutorial](https://healthcareintegrations.com/hl7-v2-messages-explained-adt-orm-and-oru-tutorial/)

---

### 3.2 **ORM - Order Entry Messages**
**Purpose**: Manage clinical orders (lab, imaging, medications)

**Common Events**:
- `ORM^O01` - New order
- `ORM^O02` - Cancel order
- `ORM^O03` - Discontinue order

**Use Cases**:
- Lab test orders
- Radiology imaging requests
- Medication orders
- Procedure orders

**Links**: [HL7 ORM Message](https://www.interfaceware.com/hl7-orm), [Healthcare Integrations Tutorial](https://healthcareintegrations.com/hl7-v2-messages-explained-adt-orm-and-oru-tutorial/)

---

### 3.3 **ORU - Observation Result Messages**
**Purpose**: Return clinical results from ancillary systems

**Common Events**:
- `ORU^R01` - Unsolicited observation results
- `ORU^R03` - Dietary results
- `ORU^R32` - Patient immunization records

**Use Cases**:
- Lab test results
- Pathology reports
- Imaging findings
- Vital signs
- EKG results

**Structure**:
```
MSH|^~\&|LAB_SYSTEM|LAB|EMR_SYSTEM|HOSPITAL|...
PID|1||123456^^^MRN||DOE^JOHN^A||...
OBR|1|ORDER123|RESULT456|CBC^COMPLETE BLOOD COUNT|...
OBX|1|NM|WBC^White Blood Count||7.5|10^3/uL|4.5-11.0|N|||F|...
OBX|2|NM|RBC^Red Blood Count||4.8|10^6/uL|4.5-5.5|N|||F|...
```

**Links**: [HL7 ORU Message](https://www.interfaceware.com/hl7-oru), [Healthcare Integrations Tutorial](https://healthcareintegrations.com/hl7-v2-messages-explained-adt-orm-and-oru-tutorial/)

---

### 3.4 **Other Critical Message Types**

- **MDM** (Medical Document Management): Clinical notes, discharge summaries
- **DFT** (Detailed Financial Transaction): Billing and charges
- **SIU** (Scheduling Information Unsolicited): Appointment scheduling
- **BAR** (Add/Change Billing Account): Patient billing information
- **RDE** (Pharmacy/Treatment Encoded Order): Pharmacy orders
- **VXU** (Vaccination Record Update): Immunization data

**Links**: [HL7 Message Types Guide](https://www.tactionsoft.com/guide/hl7-message-types-event-types/), [Comprehensive Guide](https://www.suretysystems.com/insights/a-comprehensive-guide-to-hl7-message-types/)

---

## 4. Architectural Patterns & Best Practices

### 4.1 **Event-Driven Message Processing**

**Pattern**: Microservices with message queues

**Architecture**:
```
MLLP Server → Message Parser → Event Bus → Message Handlers → ACK Generator
                                   ↓
                              [Queue: SQS/RabbitMQ]
                                   ↓
                     [Workers: Transform, Validate, Store]
```

**Benefits**:
- Decoupled processing
- Horizontal scaling
- Fault tolerance
- Async processing

**Example (AWS SQS Integration)**:
```typescript
import { Server } from 'node-hl7-server';
import { SQS } from '@aws-sdk/client-sqs';

const server = new Server({ port: 3000 });
const sqs = new SQS({ region: 'us-east-1' });

server.on('message', async (message) => {
  // Send to SQS for async processing
  await sqs.sendMessage({
    QueueUrl: process.env.HL7_QUEUE_URL,
    MessageBody: message.toString()
  });

  // Return immediate ACK
  return generateACK(message, 'AA');
});
```

**Links**: [HL7 with AWS SQS](https://www.mindbowser.com/hl7-message-processing-nodejs-sqs/), [Node.js HL7 Guide](https://www.appgambit.com/guide/nodejs-hl7-parser-for-health-record-data-aggregation)

---

### 4.2 **Message Transformation & Mapping**

**Pattern**: Transform → Validate → Enrich → Store

**Steps**:
1. Parse incoming HL7 message
2. Transform to internal data model
3. Validate against business rules
4. Enrich with additional data
5. Store in database (MongoDB, PostgreSQL)

**Code Example**:
```typescript
import { parse } from 'hl7v2';

async function processMessage(rawHL7: string) {
  // Parse
  const msg = parse(rawHL7);

  // Transform
  const patient = {
    mrn: msg.get('PID.3.1'),
    firstName: msg.get('PID.5.2'),
    lastName: msg.get('PID.5.1'),
    dob: msg.get('PID.7'),
    gender: msg.get('PID.8')
  };

  // Validate
  await validatePatient(patient);

  // Store
  await db.patients.upsert(patient);
}
```

**Links**: [Node.js HL7 Parser Guide](https://www.appgambit.com/guide/nodejs-hl7-parser-for-health-record-data-aggregation)

---

### 4.3 **ACK/NACK Generation & Error Handling**

**ACK Types**:
- **AA (Application Accept)**: Message received and processed successfully
- **AE (Application Error)**: Processing error occurred
- **AR (Application Reject)**: Message structure invalid (MSH fields 9, 11, 12)

**Pattern**: Immediate ACK + Async Processing

**Implementation**:
```typescript
function generateACK(message: HL7Message, status: 'AA' | 'AE' | 'AR', error?: string): string {
  const msh = message.getSegment('MSH');
  const messageControlId = msh.get(10);

  return `MSH|^~\\&|RECEIVING_APP|RECEIVING_FACILITY|${msh.get(3)}|${msh.get(4)}|${now}||ACK|${uuid()}|P|2.5
MSA|${status}|${messageControlId}|${error || 'Message accepted'}`;
}

server.on('message', async (message) => {
  try {
    // Quick validation
    validateMessageStructure(message);

    // Send to queue for processing
    await queue.send(message);

    // Return immediate ACK
    return generateACK(message, 'AA');
  } catch (err) {
    // Return NACK
    return generateACK(message, 'AE', err.message);
  }
});
```

**Best Practices**:
- Return ACK within 2-5 seconds (per HL7 spec)
- Log all NACK messages
- Implement retry logic with exponential backoff
- Store failed messages in dead-letter queue
- Monitor ACK/NACK ratios

**Links**: [HL7 ACK/NACK Guide](https://datica-2019.netlify.app/blog/hl7-ack-nack/), [HL7 202 ACK Tutorial](https://datica.com/academy/hl7-202-the-hl7-ack-acknowledgement-message), [ACK Guidance](https://confluence.hl7.org/display/CONF/HL7+V2+ACK+Guidance)

---

### 4.4 **Performance & Scalability**

**Benchmarks**:
- 500+ messages/minute (single Node.js instance)
- Zero-dependency libraries faster than heavy frameworks

**Optimization Strategies**:
1. **Connection Pooling**: Reuse MLLP connections
2. **Message Batching**: Process multiple messages together
3. **Horizontal Scaling**: Multiple Node.js instances behind load balancer
4. **Caching**: Cache patient/order lookups
5. **Async Processing**: Decouple ACK from business logic

**Architecture**:
```
Load Balancer (HAProxy/Nginx)
    ↓
[MLLP Server 1] [MLLP Server 2] [MLLP Server 3]
    ↓                ↓                ↓
        Message Queue (SQS/RabbitMQ)
                   ↓
    [Worker Pool: 10-50 workers]
                   ↓
        Database (PostgreSQL/MongoDB)
```

**Links**: [Node.js HL7 Performance](https://www.appgambit.com/guide/nodejs-hl7-parser-for-health-record-data-aggregation)

---

### 4.5 **Monitoring & Observability**

**Key Metrics**:
- Message throughput (messages/min)
- ACK/NACK ratio
- Processing latency (p50, p95, p99)
- Connection health
- Queue depth
- Error rates by message type

**Tools**:
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Sentry for error tracking
- Custom HL7 dashboards

---

## 5. Production Implementation Checklist

- [ ] Choose library: `node-hl7-server` + `node-hl7-client` (recommended)
- [ ] MLLP transport: `hl7-mllp` or built-in server support
- [ ] Message queue: AWS SQS, RabbitMQ, or Redis Streams
- [ ] Database: PostgreSQL for transactional, MongoDB for document storage
- [ ] ACK generation: Implement AA/AE/AR logic
- [ ] Error handling: Dead-letter queue + retry mechanism
- [ ] Monitoring: Prometheus metrics + logging
- [ ] Testing: Unit tests + integration tests with sample HL7 messages
- [ ] Security: TLS/SSL for MLLP, message validation, audit logging
- [ ] Documentation: Message flow diagrams, API docs

---

## Sources

- [GitHub - node-hl7-client](https://github.com/Bugs5382/node-hl7-client)
- [npm - node-hl7-server](https://www.npmjs.com/package/node-hl7-server)
- [GitHub - panates/hl7v2](https://github.com/panates/hl7v2)
- [GitHub - ts-hl7](https://github.com/amaster507/ts-hl7)
- [npm - simple-hl7](https://www.npmjs.com/package/simple-hl7)
- [GitHub - fastify-hl7](https://github.com/Bugs5382/fastify-hl7)
- [GitHub - hl7-mllp](https://github.com/PantelisGeorgiadis/hl7-mllp)
- [npm - @keepsolutions/mllp-node](https://www.npmjs.com/package/@keepsolutions/mllp-node)
- [GitHub - http-mllp-node](https://github.com/whitebrick/http-mllp-node)
- [HL7 V2 Messages Tutorial](https://healthcareintegrations.com/hl7-v2-messages-explained-adt-orm-and-oru-tutorial/)
- [HL7 Message Types Guide](https://www.tactionsoft.com/guide/hl7-message-types-event-types/)
- [HL7 ORU Message](https://www.interfaceware.com/hl7-oru)
- [HL7 ORM Message](https://www.interfaceware.com/hl7-orm)
- [HL7 ADT Guide](https://www.tactionsoft.com/guide/adt-event-types-hl7/)
- [HL7 ACK/NACK Guide](https://datica-2019.netlify.app/blog/hl7-ack-nack/)
- [HL7 202 ACK Tutorial](https://datica.com/academy/hl7-202-the-hl7-ack-acknowledgement-message)
- [HL7 ACK Guidance](https://confluence.hl7.org/display/CONF/HL7+V2+ACK+Guidance)
- [HL7 Message Processing with AWS SQS](https://www.mindbowser.com/hl7-message-processing-nodejs-sqs/)
- [Node.js HL7 Parser Guide](https://www.appgambit.com/guide/nodejs-hl7-parser-for-health-record-data-aggregation/)
- [Comprehensive Guide to HL7 Message Types](https://www.suretysystems.com/insights/a-comprehensive-guide-to-hl7-message-types/)
