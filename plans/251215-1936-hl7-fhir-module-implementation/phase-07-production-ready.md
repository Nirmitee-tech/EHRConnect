# Phase 07: Production Ready

**Phase**: 07/07
**Status**: Pending
**Priority**: P1
**Estimated Effort**: 4-5 days
**Dependencies**: All Previous Phases

## Overview

Production-grade features including message queuing with retry/backoff, comprehensive monitoring and alerting, performance optimization, graceful shutdown, deployment automation, security hardening, and compliance requirements (HIPAA, GDPR).

## Key Insights from Research

- Redis already available for queuing (Bull/BullMQ)
- PostgreSQL for audit logs and event history
- Existing health check endpoint pattern
- Docker-based deployment with Dokploy
- Multi-environment support (dev, staging, prod)
- 90-day audit log retention required

## Requirements

### Functional
- **Message Queue**: Redis-based queue with priority, retry, DLQ
- **Retry Logic**: Exponential backoff for failed operations
- **Monitoring**: Metrics, health checks, alerting
- **Graceful Shutdown**: Drain queues, close connections without message loss
- **Performance**: Caching, connection pooling, query optimization
- **Deployment**: Docker images, CI/CD pipeline, zero-downtime
- **Compliance**: HIPAA audit logs, GDPR data export, consent management

### Non-Functional
- 99.9% uptime SLA
- <100ms p95 latency for read operations
- <500ms p95 latency for write operations
- Process 10,000+ messages/min
- Queue backlog <1000 messages under normal load
- Zero message loss on graceful shutdown
- <5 second graceful shutdown time
- 90-day audit retention
- Daily backups with 30-day retention

## Architecture

### Production Architecture

```
Production Deployment Architecture:

┌─────────────────────────────────────────────────────────┐
│                Load Balancer (Nginx)                     │
│  - SSL/TLS termination                                   │
│  - Rate limiting (100 req/sec per IP)                   │
│  - Health check routing                                  │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  ehr-api (1)    │     │  ehr-api (2)    │
│  Port 8000      │     │  Port 8001      │
│  - Express      │     │  - Express      │
│  - FHIR API     │     │  - FHIR API     │
│  - HL7 Queue    │     │  - HL7 Queue    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┬───────────────────┐
         │                       │                   │
         ▼                       ▼                   ▼
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  MLLP Server    │  │  PostgreSQL      │  │  Redis          │
│  Port 2575      │  │  - Primary DB    │  │  - Queue        │
│  - Dedicated    │  │  - Replicas (2)  │  │  - Cache        │
│  - TLS          │  │  - Connection    │  │  - Session      │
│  - Auto-ACK     │  │    pooling       │  │                 │
└─────────────────┘  └──────────────────┘  └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  Backup Service │
                     │  - Daily full   │
                     │  - Hourly incr  │
                     │  - 30-day ret   │
                     └─────────────────┘

Queue Architecture:

┌──────────────────────────────────────────────────────────┐
│                   Redis Queues (Bull)                     │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │ hl7.inbound    │  │ hl7.outbound   │  │ hl7.dlq    │ │
│  │ Priority: 1-5  │  │ Priority: 1-5  │  │ Manual     │ │
│  │ Concurrency:10 │  │ Concurrency:5  │  │ Review     │ │
│  └───────┬────────┘  └───────┬────────┘  └────────────┘ │
│          │                   │                            │
│          ▼                   ▼                            │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │ webhooks       │  │ transformations│                  │
│  │ Retry: 5x      │  │ Timeout: 60s   │                 │
│  │ Backoff: Exp   │  │ Retry: 3x      │                 │
│  └────────────────┘  └────────────────┘                 │
└──────────────────────────────────────────────────────────┘

Monitoring Stack:

┌──────────────────────────────────────────────────────────┐
│                   Application Metrics                     │
│  - Request count, latency, error rate                    │
│  - Queue depth, processing rate                          │
│  - MLLP connections, throughput                          │
│  - Database query times                                  │
│  - Cache hit/miss ratio                                  │
└────────────────────┬─────────────────────────────────────┘
                     │ Export to
                     ▼
┌──────────────────────────────────────────────────────────┐
│              Prometheus (Time-series DB)                  │
│  - Scrape /metrics endpoint every 15s                    │
│  - Store metrics for 30 days                             │
│  - Alert rules for anomalies                             │
└────────────────────┬─────────────────────────────────────┘
                     │ Visualize in
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  Grafana Dashboards                       │
│  - HL7 Message Processing Dashboard                      │
│  - FHIR API Performance Dashboard                        │
│  - Queue Health Dashboard                                │
│  - System Resource Dashboard                             │
└──────────────────────────────────────────────────────────┘

Alerting Flow:

┌──────────────────────────────────────────────────────────┐
│                   Alert Conditions                        │
│  - Queue depth > 1000 (warning)                          │
│  - Queue depth > 5000 (critical)                         │
│  - Error rate > 5% (warning)                             │
│  - Error rate > 10% (critical)                           │
│  - p95 latency > 500ms (warning)                         │
│  - MLLP server down (critical)                           │
│  - Database connection pool exhausted (critical)         │
└────────────────────┬─────────────────────────────────────┘
                     │ Notify via
                     ▼
┌──────────────────────────────────────────────────────────┐
│                 Alerting Channels                         │
│  - PagerDuty (critical alerts)                           │
│  - Slack (warning + critical)                            │
│  - Email (daily summaries)                               │
└──────────────────────────────────────────────────────────┘
```

### Queue Configuration

```typescript
// Queue setup with Bull
import Queue from 'bull';

const queueConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 1, // Separate DB for queues
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2s
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: false, // Keep failures for analysis
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30s
    maxStalledCount: 2, // Retry stalled jobs twice
    guardInterval: 5000,
    retryProcessDelay: 5000,
  },
};

// Create queues
const hl7InboundQueue = new Queue('hl7.inbound', queueConfig);
const hl7OutboundQueue = new Queue('hl7.outbound', queueConfig);
const webhookQueue = new Queue('webhooks', queueConfig);
const transformationQueue = new Queue('transformations', queueConfig);
const dlq = new Queue('hl7.dlq', {
  ...queueConfig,
  defaultJobOptions: {
    ...queueConfig.defaultJobOptions,
    attempts: 1, // No retries in DLQ
  },
});

// Queue processors
hl7InboundQueue.process(10, async (job) => {
  // Concurrency: 10
  return await processInboundMessage(job.data);
});

hl7OutboundQueue.process(5, async (job) => {
  // Concurrency: 5
  return await processOutboundMessage(job.data);
});

// Queue event listeners
hl7InboundQueue.on('failed', async (job, err) => {
  logger.error('Job failed', { jobId: job.id, error: err });

  // Move to DLQ after max attempts
  if (job.attemptsMade >= job.opts.attempts) {
    await dlq.add('failed-inbound', {
      originalJob: job.data,
      error: err.message,
      attempts: job.attemptsMade,
      failedAt: new Date().toISOString(),
    });
  }
});

hl7InboundQueue.on('stalled', async (job) => {
  logger.warn('Job stalled', { jobId: job.id });
  // Job will be automatically reprocessed
});

// Graceful shutdown
async function gracefulShutdown() {
  logger.info('Graceful shutdown initiated...');

  // Pause new jobs
  await hl7InboundQueue.pause();
  await hl7OutboundQueue.pause();

  // Wait for active jobs to complete (max 5s)
  await Promise.race([
    Promise.all([
      hl7InboundQueue.whenCurrentJobsFinished(),
      hl7OutboundQueue.whenCurrentJobsFinished(),
    ]),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);

  // Close queues
  await hl7InboundQueue.close();
  await hl7OutboundQueue.close();

  logger.info('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### Monitoring and Metrics

```typescript
// Prometheus metrics
import { Counter, Histogram, Gauge } from 'prom-client';

// Request metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// HL7 metrics
const hl7MessageReceived = new Counter({
  name: 'hl7_messages_received_total',
  help: 'Total number of HL7 messages received',
  labelNames: ['message_type', 'org_id'],
});

const hl7MessageSent = new Counter({
  name: 'hl7_messages_sent_total',
  help: 'Total number of HL7 messages sent',
  labelNames: ['message_type', 'org_id'],
});

const hl7ParseErrors = new Counter({
  name: 'hl7_parse_errors_total',
  help: 'Total number of HL7 parse errors',
  labelNames: ['error_type'],
});

const hl7ProcessingDuration = new Histogram({
  name: 'hl7_processing_duration_seconds',
  help: 'Duration of HL7 message processing',
  labelNames: ['message_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Queue metrics
const queueDepth = new Gauge({
  name: 'queue_depth',
  help: 'Current queue depth',
  labelNames: ['queue_name'],
});

const queueProcessingRate = new Counter({
  name: 'queue_processing_rate_total',
  help: 'Number of jobs processed from queue',
  labelNames: ['queue_name', 'status'],
});

// FHIR metrics
const fhirOperations = new Counter({
  name: 'fhir_operations_total',
  help: 'Total number of FHIR operations',
  labelNames: ['operation', 'resource_type', 'status'],
});

// Database metrics
const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['query_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

const dbConnectionPoolSize = new Gauge({
  name: 'db_connection_pool_size',
  help: 'Current database connection pool size',
});

// Metrics middleware
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });

  next();
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  // Update queue depth gauges
  const inboundCount = await hl7InboundQueue.count();
  const outboundCount = await hl7OutboundQueue.count();
  queueDepth.labels('hl7.inbound').set(inboundCount);
  queueDepth.labels('hl7.outbound').set(outboundCount);

  // Update connection pool gauge
  dbConnectionPoolSize.set(db.pool.totalCount);

  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      mllp: await checkMLLP(),
    },
  };

  const allHealthy = Object.values(health.checks).every((check) => check.healthy);
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json(health);
});

async function checkDatabase() {
  try {
    await db.query('SELECT 1');
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

async function checkRedis() {
  try {
    await redisClient.ping();
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

async function checkMLLP() {
  try {
    // Check if MLLP server is listening
    const connections = mllpServer.getConnectionCount();
    return { healthy: true, connections };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}
```

### Deployment Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  ehr-api:
    image: ehrconnect/ehr-api:latest
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
        max_attempts: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ehrconnect
      - REDIS_URL=redis://redis:6379
    ports:
      - "8000-8001:8000"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - postgres
      - redis

  mllp-server:
    image: ehrconnect/mllp-server:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
    ports:
      - "2575:2575"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ehrconnect
    depends_on:
      - redis
      - postgres

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=ehrconnect
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - ehr-api

volumes:
  postgres_data:
  redis_data:
```

## Related Code Files

**Update Existing**:
- `/Users/developer/Projects/EHRConnect/docker-compose.prod.yml`
- `/Users/developer/Projects/EHRConnect/ehr-api/src/index.js` - Add graceful shutdown

**New Files to Create**:
- `packages/hl7-fhir/src/queue/index.ts`
- `packages/hl7-fhir/src/queue/processors.ts`
- `packages/hl7-fhir/src/monitoring/metrics.ts`
- `packages/hl7-fhir/src/monitoring/health.ts`
- `ehr-api/src/middleware/metrics.js`
- `ehr-api/src/routes/metrics.js`
- `ehr-api/src/routes/health.js`
- `.github/workflows/deploy-production.yml`
- `grafana/dashboards/hl7-fhir-dashboard.json`
- `prometheus/alerts.yml`

## Implementation Steps

1. **Setup Queue Infrastructure** (4 hours)
   - Install Bull/BullMQ
   - Configure Redis connection
   - Create queue instances (inbound, outbound, webhooks, DLQ)
   - Implement queue processors
   - Add queue event listeners

2. **Implement Retry Logic** (3 hours)
   - Exponential backoff configuration
   - Max retry attempts
   - DLQ for permanent failures
   - Retry on specific error types

3. **Add Monitoring and Metrics** (5 hours)
   - Install prom-client
   - Define metrics (counters, histograms, gauges)
   - Add metrics middleware
   - Create /metrics endpoint
   - Export metrics to Prometheus

4. **Create Health Check System** (2 hours)
   - Database health check
   - Redis health check
   - MLLP server health check
   - Aggregate health endpoint

5. **Implement Graceful Shutdown** (3 hours)
   - Handle SIGTERM/SIGINT
   - Pause new jobs
   - Drain active jobs
   - Close connections
   - Exit cleanly

6. **Performance Optimization** (5 hours)
   - Database connection pooling
   - Redis connection pooling
   - Query optimization (indexes)
   - Caching strategy (Redis)
   - MLLP connection pooling

7. **Setup Prometheus and Grafana** (4 hours)
   - Deploy Prometheus server
   - Configure scrape targets
   - Define alert rules
   - Create Grafana dashboards
   - Test alerting

8. **Build CI/CD Pipeline** (4 hours)
   - GitHub Actions workflow
   - Docker image building
   - Automated testing
   - Deployment to staging
   - Production deployment (manual approval)

9. **Security Hardening** (4 hours)
   - TLS for MLLP (cert management)
   - Database encryption at rest
   - Redis password protection
   - Secrets management (vault)
   - Rate limiting (per org, per IP)

10. **Compliance Features** (5 hours)
    - HIPAA audit logging
    - GDPR data export API
    - Data retention policies
    - Consent management
    - Right to be forgotten

11. **Backup and Recovery** (3 hours)
    - Daily PostgreSQL backups
    - Backup to S3/cloud storage
    - Backup verification
    - Recovery testing
    - Disaster recovery plan

12. **Load Testing** (4 hours)
    - Setup k6 or JMeter
    - Test scenarios (10K msg/min)
    - Stress testing
    - Identify bottlenecks
    - Optimize based on results

13. **Documentation** (3 hours)
    - Production deployment guide
    - Monitoring and alerting guide
    - Runbook for common issues
    - Disaster recovery procedures
    - Security best practices

## Todo List

- [ ] Setup Bull queue infrastructure
- [ ] Implement retry logic with exponential backoff
- [ ] Add Prometheus metrics
- [ ] Create health check system
- [ ] Implement graceful shutdown
- [ ] Optimize database queries and indexing
- [ ] Setup Redis caching strategy
- [ ] Deploy Prometheus and Grafana
- [ ] Create Grafana dashboards
- [ ] Configure alerting rules
- [ ] Build CI/CD pipeline (GitHub Actions)
- [ ] Implement TLS for MLLP
- [ ] Setup secrets management
- [ ] Add rate limiting
- [ ] Implement HIPAA audit logging
- [ ] Build GDPR data export API
- [ ] Setup automated backups
- [ ] Test backup recovery
- [ ] Perform load testing (10K msg/min)
- [ ] Document production deployment
- [ ] Document runbooks

## Success Criteria

- [ ] 99.9% uptime achieved
- [ ] Queue processes 10,000+ messages/min
- [ ] <100ms p95 latency for read operations
- [ ] <500ms p95 latency for write operations
- [ ] Zero message loss on graceful shutdown
- [ ] Graceful shutdown completes in <5s
- [ ] All metrics exported to Prometheus
- [ ] Grafana dashboards functional
- [ ] Alerts trigger correctly
- [ ] CI/CD pipeline deploys successfully
- [ ] Load test passes (10K msg/min)
- [ ] Backup and recovery tested
- [ ] HIPAA compliance verified
- [ ] Security audit passed

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Queue backlog overwhelms system | High | Autoscaling, backpressure, priority queues |
| Database connection exhaustion | High | Connection pooling, query optimization |
| Memory leak in long-running process | Medium | Memory profiling, restart policy, monitoring |
| Backup failure | Critical | Backup verification, multiple backup locations |
| Security breach | Critical | Security audit, penetration testing, monitoring |

## Security Considerations

- TLS 1.2+ for all production MLLP connections
- Database encryption at rest (PostgreSQL)
- Redis password authentication
- Secrets stored in vault (not environment variables)
- Rate limiting per organization and per IP
- HIPAA audit logging for all PHI access
- Regular security audits and penetration testing
- Vulnerability scanning in CI/CD
- Container image scanning

## Next Steps

After completion:
- Monitor production metrics
- Gather user feedback
- Plan Phase 08 (Advanced Features)
  - HL7 v3 (CDA) support
  - GraphQL API for FHIR
  - SMART on FHIR
  - Bulk data export
  - Analytics and reporting

## Unresolved Questions

1. Autoscaling strategy (horizontal vs vertical)?
2. Multi-region deployment for disaster recovery?
3. Message archival to cold storage (S3 Glacier)?
4. Real-time analytics dashboard requirements?
5. Support for custom HL7 segments in production?
