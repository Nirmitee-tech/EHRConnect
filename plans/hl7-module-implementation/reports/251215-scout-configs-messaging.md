# Configuration Scout Report: Messaging Infrastructure & Integrations
**Date:** 2025-12-15
**Scope:** Root configuration files, Docker Compose, package.json, environment files
**Status:** Complete - No RabbitMQ/Kafka/SQS found. Real-time communication via Socket.io + REST APIs

---

## Executive Summary

EHRConnect uses a **direct synchronous integration pattern** rather than message queues. Communication architecture combines:
- **Real-time events:** Socket.io (WebSocket-based)
- **Async notifications:** Email/SMS via external providers
- **Integrations:** REST API-based handlers with orchestration layer
- **Database:** PostgreSQL for state management & transaction logging

---

## 1. INFRASTRUCTURE STACK

### Core Services (docker-compose.yml)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **PostgreSQL 15** | postgres:15 | 5432 | Primary data store, ABDM data, integration configs |
| **Redis 7** | redis:7-alpine | 6379 | Caching, sessions, real-time events |
| **Keycloak 26** | quay.io/keycloak/keycloak:26.0 | 8080 | Authentication & authorization |
| **Medplum Server** | medplum/medplum-server:latest | 8103 | FHIR-compliant clinical data server |
| **Medplum App** | medplum/medplum-app:latest | 3001 | FHIR admin interface |
| **Mailhog** | mailhog/mailhog:latest | 8025 | Email testing (SMTP: 1025) |

**Note:** No message brokers (RabbitMQ, Kafka, SQS) configured in any environment.

---

## 2. DATABASE CONFIGURATION

### PostgreSQL Setup
- **Database:** `medplum` (dev/staging) | `ehr_production` (prod)
- **User:** `medplum` / `ehr_prod_user`
- **Connection:** Port 5432, local/internal Docker network
- **Init scripts:**
  - `init-db.sql` - Primary data schemas
  - `init-keycloak-db.sql` - Keycloak realm DB

### Redis Configuration
- **Purpose:** Session caching, real-time event distribution
- **Connection:** `redis://redis:6379` (Docker) | `redis://localhost:6379` (Dev)
- **No persistence mode for real-time events** (events processed synchronously)

---

## 3. MESSAGING & NOTIFICATION INFRASTRUCTURE

### Email Notifications
- **Service:** `/ehr-api/src/services/email.service`
- **Method:** SMTP via configurable providers
- **Dev:** Mailhog (localhost:1025 for testing)
- **Prod:** External SMTP configuration via environment variables
- **Route:** `/api/notification-settings/providers`

### SMS Notifications
- **Service:** `/ehr-api/src/services/sms.service`
- **Provider:** Twilio (dependency in package.json: `twilio: ^5.10.6`)
- **Configuration:** Stored in `notification_providers` table
- **Admin API:** UI-based provider management

### Real-Time Events
- **Technology:** Socket.io 4.8.1 (dependency: `socket.io: ^4.8.1`)
- **Service:** `/ehr-api/src/services/socket.service`
- **Transport:** WebSocket + fallback to polling
- **Use Cases:** Task updates, notifications, virtual meeting events
- **Integration:** HTTP server wraps Express app for WebSocket support

### Database-Backed Notification Queue
```sql
-- Task Webhooks (persistent event configuration)
TABLE: task_webhooks
- org_id (organization identifier)
- events (array of event types: created, updated, completed, etc.)
- filters (JSON: status, priority, category, assignee)
- webhook_url (destination endpoint)
- is_active (enable/disable)
```

---

## 4. INTEGRATION INFRASTRUCTURE

### Architecture: Integration Orchestrator Pattern
**File:** `/ehr-api/src/services/integration-orchestrator.service.js`

```
┌─────────────────────────────────┐
│ HTTP Request to Integration API │
└────────────────┬────────────────┘
                 │
         ┌───────▼────────┐
         │ Org ID Context │
         └───────┬────────┘
                 │
    ┌────────────▼─────────────┐
    │ Integration Orchestrator  │
    │ (Handler Registry)        │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ Handler Selection by Vendor    │
    │ (abdm, claimmd, epic, etc.)   │
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ Handler Execution             │
    │ (REST call to external API)   │
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ Database Logging              │
    │ (Transaction Records)         │
    └───────────────────────────────┘
```

**Key Features:**
- Handler registration system for multi-vendor support
- 5-minute integration config cache
- Fallback support for multi-vendor scenarios
- Organization-scoped configuration isolation

### Registered Integration Handlers

#### 1. **ABDM (Ayushman Bharat Digital Mission)**
- **Handler:** `/ehr-api/src/integrations/abdm.handler.js`
- **Service:** `/ehr-api/src/services/abdm.service.js`
- **Routes:** `/api/abdm/*`
- **Features:**
  - Multi-tenant ABDM credential management
  - ABHA (Ayushman Bharat Health Account) enrollment
  - Aadhaar OTP verification
  - RSA-OAEP SHA-1 encryption for sensitive data
  - Session token management with auto-refresh
  - Transaction logging (table: `abdm_transactions`)
- **Database Tables:**
  - `integrations` - Org credentials
  - `abha_profiles` - ABHA account mappings
  - `abdm_transactions` - Audit trail
  - `abdm_tokens` - Token storage for refresh

#### 2. **Claim.MD (Billing Integration)**
- **Handler:** `/ehr-api/src/integrations/claimmd.handler.js`
- **Service:** `/ehr-api/src/services/claimmd.service.js`
- **Environment Config:**
  - `CLAIMMD_API_URL=https://api.claim.md/v1`
- **Database:**
  - Table: `billing_tenant_settings`
  - Fields: `claim_md_account_key`, `claim_md_token`, `claim_md_api_url`, `settings`
- **Features:**
  - Claims submission & tracking
  - ERA (Electronic Remittance Advice) processing
  - Denial management
  - Automated posting

#### 3. **Epic EHR**
- **Handler:** `/ehr-api/src/integrations/epic.handler.js`
- **Purpose:** Interoperability with Epic EHR systems
- **Status:** Handler registered, awaiting full documentation

#### 4. **Custom HL7**
- **Handler:** `/ehr-api/src/integrations/custom-hl7.handler.js`
- **Purpose:** HL7 v2.x message processing
- **Status:** Handler exists, can be extended for HL7 module

---

## 5. API GATEWAY & ENDPOINT CONFIGURATION

### Application URLs (Environment-based)
```env
# Development
NEXT_PUBLIC_API_URL=https://api-dev.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io
ALLOWED_ORIGINS=https://ehr-dev.nirmitee.io

# Production
NEXT_PUBLIC_API_URL=https://api.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.nirmitee.io
ALLOWED_ORIGINS=https://ehr.nirmitee.io,https://app.nirmitee.io
```

### CORS Configuration
- **Implementation:** `src/index.js` lines 66-91
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Credentials:** Enabled (cookies, auth headers)
- **Headers:** Content-Type, Authorization, Accept, Origin, User-Agent, Referer, X-Org-Id

### Authentication Flow
1. **Keycloak OAuth2/OIDC:** Primary auth provider
2. **NextAuth:** Web client session management
3. **JWT Tokens:** API authentication
4. **X-Org-Id Header:** Organization context in requests

---

## 6. EXTERNAL SERVICE INTEGRATIONS

### Configured External Services
| Service | Type | Configuration | Usage |
|---------|------|---------------|-------|
| **Claim.MD** | Billing API | `CLAIMMD_API_URL` env var | Claims, ERA, denials |
| **ABDM** | Healthcare Gateway | OAuth2 credentials + encryption keys | ABHA enrollment, health data exchange |
| **Twilio** | SMS/Voice | SDK in dependencies | Phone verification, SMS notifications |
| **Medplum** | FHIR Server | Docker service + OAuth2 | Clinical data store |
| **Keycloak** | Identity Provider | Docker service + OAuth2 | User authentication |

---

## 7. NOTIFICATION PROVIDERS INFRASTRUCTURE

### Notification Settings Tables
```sql
-- notification_providers
- id (UUID)
- org_id (Organization)
- type (email, sms, push, webhook)
- name (Display name)
- provider (Service name)
- credentials (Encrypted JSON)
- is_active (Boolean)
- created_at, updated_at

-- notification_settings
- org_id
- provider_id
- event_type (email, sms, webhook)
- configuration (Feature toggles)
```

### Supported Provider Types
- Email (SMTP)
- SMS (Twilio)
- Push notifications
- Webhooks

---

## 8. PACKAGE.json DEPENDENCIES ANALYSIS

### Key Messaging-Related Dependencies
```json
{
  "socket.io": "^4.8.1",          // Real-time events
  "redis": "^5.9.0",               // Cache & session store
  "express": "^4.18.2",            // REST API framework
  "twilio": "^5.10.6",             // SMS/Voice provider
  "nodemailer": "^7.0.11",         // Email transport
  "jsonwebtoken": "^9.0.2",        // JWT auth tokens
  "cors": "^2.8.5",                // CORS handling
  "helmet": "^7.0.0",              // Security headers
  "axios": "^1.12.2",              // HTTP client (integration calls)
  "pg": "^8.11.3",                 // PostgreSQL driver
  "sequelize": "^6.37.7",          // ORM
  "json-logic-js": "^2.0.5"        // Rule engine for task filters
}
```

**Note:** No message broker libraries (amqplib, kafka-node, aws-sdk for SQS).

---

## 9. ENVIRONMENT CONFIGURATION SUMMARY

### Development Environment (.env.dev.example)
```env
DB_HOST=localhost          # Local database
REDIS_URL=redis://localhost:6379
KEYCLOAK_URL=https://auth-dev.nirmitee.io
CLAIMMD_API_URL=https://api.claim.md/v1
NODE_ENV=development
```

### Production Environment (.env.prod.example)
```env
DB_HOST=postgres           # Docker network reference
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=CHANGE_ME_STRONG_REDIS_PASSWORD
KEYCLOAK_ADMIN_PASSWORD=CHANGE_ME_VERY_STRONG_ADMIN_PASSWORD_MIN_32_CHARS
NEXTAUTH_SECRET=CHANGE_ME_CRYPTOGRAPHICALLY_SECURE_SECRET_MIN_32_CHARS
JWT_SECRET=CHANGE_ME_CRYPTOGRAPHICALLY_SECURE_JWT_SECRET_MIN_32_CHARS
NODE_ENV=production
```

---

## 10. INTEGRATION TRANSACTION LOGGING

### ABDM Transaction Audit Trail
```sql
TABLE: abdm_transactions
- id (UUID)
- org_id, user_id, patient_id
- transaction_type (enum: ENROLLMENT, VERIFICATION, FETCH, CREATE, UPDATE)
- endpoint (API endpoint called)
- request_payload (Full request)
- response_payload (Full response)
- status (success, failed)
- error_message (If failed)
- timestamp
```

### Webhook Event Logging
```sql
TABLE: task_webhooks
- Persistent webhook configurations
- Event filtering by task status, priority, category
- Filter-based selective event delivery
```

---

## 11. API ROUTE SUMMARY

### Core API Routes (Integrated Services)
```
POST   /api/abdm/config              - Configure ABDM credentials
GET    /api/abdm/config              - List org's ABDM configs
GET    /api/abdm/enrollment          - ABHA enrollment status

POST   /api/notification-settings/providers    - Create notification provider
GET    /api/notification-settings/providers    - List org's providers
PUT    /api/notification-settings/providers/:id - Update provider config

GET    /api/integrations/vendors     - List available integration vendors
POST   /api/integrations/:vendor     - Execute integration

GET    /api/tasks                    - List tasks
POST   /api/tasks                    - Create task (triggers webhooks via Socket.io)
PATCH  /api/tasks/:id                - Update task (broadcasts via Socket.io)

POST   /api/billing/claims           - Claim.MD integration
GET    /api/billing/era              - Electronic remittance processing
```

---

## 12. CRITICAL FINDINGS FOR HL7 IMPLEMENTATION

### Current State
1. **No async message queue exists** - All integration calls are synchronous HTTP requests
2. **Transaction logging in place** - ABDM shows pattern for audit trails
3. **Handler pattern established** - `/ehr-api/src/integrations/` directory ready for HL7 handler
4. **Database schema extensible** - Can add `hl7_messages`, `hl7_transactions` tables
5. **Real-time broadcasting ready** - Socket.io infrastructure active for message events

### Recommendations for HL7 Module
1. **Create HL7 Handler** → `/ehr-api/src/integrations/hl7.handler.js`
2. **Add HL7 Service** → `/ehr-api/src/services/hl7.service.js`
3. **Database Tables:**
   - `hl7_messages` - Incoming/outgoing HL7 messages
   - `hl7_segments` - Parsed HL7 segments
   - `hl7_transactions` - Processing audit trail
4. **API Routes** → `/ehr-api/src/routes/hl7.js`
5. **Integration Registry Entry** → Update integration vendors table

### If Async Processing Needed
- **Option 1:** Implement Bull queue (Redis-backed) for background HL7 processing
- **Option 2:** Add simple job queue using PostgreSQL (no external dependencies)
- **Option 3:** Extend current socket.io events for async notifications

---

## 13. DEPLOYMENT CONFIGURATION

### Docker Compose Variants
| File | Environment | Use Case |
|------|-------------|----------|
| `docker-compose.yml` | Development | Local dev with all services |
| `docker-compose.dev.yml` | Development | Dev environment |
| `docker-compose.staging.yml` | Staging | Full production-like setup |
| `docker-compose.prod.yml` | Production | Production deployment |
| `docker-compose.dokploy-*.yml` | Cloud | Dokploy cloud deployment |

### Network Isolation
- All services on Docker network (postgres, redis, keycloak reach each other by hostname)
- External API calls via NEXT_PUBLIC_API_URL environment variable
- Organization isolation via X-Org-Id header

---

## 14. UNRESOLVED QUESTIONS

1. **HL7 Bidirectional Communication:** Is there a requirement for HL7 message subscriptions/push from external systems to EHRConnect?
   - Current architecture supports only pull/request-response

2. **Message Transformation Pipeline:** Should HL7 messages be transformed before storage?
   - Current system stores raw payloads in JSON

3. **EDI Compliance:** Is there specific EDI 834/835 processing needed alongside HL7?
   - Claim.MD handles 835 (ERA), but 834 (enrollment) processing not visible

4. **HL7 Validation Rules:** Should validation be synchronous (return error immediately) or async (log and retry)?
   - Current integrations are synchronous

5. **Archive/Retention Policy:** Long-term storage requirements for HL7 messages?
   - Database structure allows for retention, but policy not defined

---

## Conclusion

EHRConnect uses a **synchronous REST-based integration architecture with Redis-backed real-time events**. The infrastructure is ready for HL7 module implementation via:
- New handler in `/ehr-api/src/integrations/hl7.handler.js`
- Database tables for message storage and audit
- API routes in `/ehr-api/src/routes/hl7.js`
- Registration in integration orchestrator

No message broker infrastructure exists, making it suitable for synchronous HL7 processing or simple queue-based async if needed later.
