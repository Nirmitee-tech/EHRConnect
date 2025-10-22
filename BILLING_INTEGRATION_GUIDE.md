# 🏥 EHRConnect Billing Integration - Complete Architecture Guide

> **Comprehensive documentation for Claim.MD integration, billing module architecture, and extensible integration framework**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Claim.MD Integration Approach](#claimmd-integration-approach)
3. [Complete Billing Flows](#complete-billing-flows)
4. [Database Architecture](#database-architecture)
5. [API Reference](#api-reference)
6. [Background Jobs & Automation](#background-jobs--automation)
7. [Integration Framework](#integration-framework)
8. [Setup & Deployment](#setup--deployment)
9. [Development Guidelines](#development-guidelines)
10. [Future Roadmap](#future-roadmap)

---

## Overview

EHRConnect implements a **production-ready, enterprise-grade billing module** with full Claim.MD API integration. The system follows a **hybrid architecture** combining:

- **Direct Service Integration** for Claim.MD (tightly coupled billing operations)
- **Plugin-Based Integration Framework** for extensible third-party integrations

### Key Features

✅ **Complete Claims Management**
- Draft creation, validation, submission (837P/837I)
- Real-time status synchronization
- Payment posting and reconciliation
- Denial management and appeals

✅ **Eligibility Verification**
- Real-time insurance verification (270/271 transactions)
- Historical eligibility tracking
- Coverage detail extraction (copay, deductible, benefits)

✅ **Prior Authorization**
- Authorization request submission
- Automated status tracking
- Approval/denial workflow
- Valid date management

✅ **Electronic Remittance (ERA)**
- Automated ERA file fetching (835 files)
- Intelligent claim matching
- Payment posting to ledger
- Adjustment code processing

✅ **Background Automation**
- Claim status synchronization (every 30 min)
- ERA file processing (hourly)
- Prior authorization updates (every 30 min)
- Data cleanup and archival

---

## Claim.MD Integration Approach

### What is Claim.MD?

**Claim.MD** is a medical clearinghouse providing:
- Electronic claims submission to 5000+ payers
- Real-time eligibility verification
- ERA/835 processing
- Web portal + REST API access
- Transparent pricing ($30-$120/month based on volume)
- U.S.-based support team

### Why Claim.MD?

1. **No Special Software**: Works entirely via API
2. **Comprehensive Coverage**: 5000+ insurance payers supported
3. **Real-time Processing**: Immediate eligibility checks and claim status
4. **Cost-Effective**: Pay per claim or unlimited plans
5. **Standards Compliant**: Full support for 837/835 EDI standards

### Integration Architecture

```
┌──────────────────┐
│   Frontend UI    │  Next.js + TypeScript
│  (ehr-web)       │
└────────┬─────────┘
         │
         │ REST API Calls
         │
┌────────▼─────────┐
│   API Routes     │  Express.js
│  (billing.js)    │  30+ Endpoints
└────────┬─────────┘
         │
         │ Business Logic
         │
┌────────▼─────────┐
│ Billing Service  │  Transaction Management
│                  │  Data Validation
└────────┬─────────┘
         │
         │ External API Calls
         │
┌────────▼─────────┐
│ Claim.MD Service │  API Integration
│                  │  Retry Logic
│                  │  Error Handling
└────────┬─────────┘
         │
         │ HTTPS/REST
         │
┌────────▼─────────┐
│  Claim.MD API    │  https://api.claim.md/v1
│                  │
└──────────────────┘

         Parallel
         
┌──────────────────┐
│ Background Jobs  │  Automated Sync
│                  │  - Claims
│                  │  - ERA
│                  │  - Prior Auth
└──────────────────┘
         │
         │ Scheduled Tasks
         │
┌────────▼─────────┐
│   PostgreSQL     │  14 Tables
│   Database       │  3 Views
└──────────────────┘
```

### Multi-Tenant Architecture

Each organization has:
- **Isolated credentials** in `billing_tenant_settings`
- **Separate data** filtered by `org_id`
- **Independent configuration** (API URLs, webhooks)
- **Custom fee schedules** and billing rules

---

## Complete Billing Flows

### Flow 1: Eligibility Verification

```
┌─────────────┐
│ 1. Patient  │
│ Registration│
└──────┬──────┘
       │
       │ Insurance Info
       │
┌──────▼───────────────┐
│ 2. Trigger           │
│ Eligibility Check    │
└──────┬───────────────┘
       │
       │ API Call
       │
┌──────▼───────────────┐
│ 3. Claim.MD API      │
│ (270 Transaction)    │
└──────┬───────────────┘
       │
       │ Response (271)
       │
┌──────▼───────────────┐
│ 4. Parse Coverage    │
│ - Plan Name          │
│ - Copay             │
│ - Deductible        │
│ - Benefits          │
└──────┬───────────────┘
       │
       │ Store Result
       │
┌──────▼───────────────┐
│ 5. Database         │
│ eligibility_history │
└──────┬───────────────┘
       │
       │ Return to User
       │
┌──────▼───────────────┐
│ 6. Display Coverage │
│ Details             │
└─────────────────────┘
```

**Key Components:**
- **Service**: `claimMDService.checkEligibility()`
- **Database**: `billing_eligibility_history` table
- **API Endpoint**: `POST /api/billing/eligibility/check`

### Flow 2: Prior Authorization

```
┌─────────────┐
│ 1. Provider │
│ Requests    │
│ Prior Auth  │
└──────┬──────┘
       │
       │ CPT + ICD codes
       │
┌──────▼───────────────┐
│ 2. Validation        │
│ - Required fields    │
│ - Code validity      │
└──────┬───────────────┘
       │
       │ Submit to Claim.MD
       │
┌──────▼───────────────┐
│ 3. Prior Auth API    │
│ Create Request       │
└──────┬───────────────┘
       │
       │ Auth Number Assigned
       │
┌──────▼───────────────┐
│ 4. Store in DB       │
│ Status: PENDING      │
└──────┬───────────────┘
       │
       │ Background Job (every 30 min)
       │
┌──────▼───────────────┐
│ 5. Status Sync       │
│ Check with payer     │
└──────┬───────────────┘
       │
       │ Update Status
       │
┌──────▼───────────────┐
│ 6. Final Status      │
│ APPROVED / DENIED    │
└─────────────────────┘
```

**Key Components:**
- **Service**: `claimMDService.submitPriorAuthorization()`
- **Database**: `billing_prior_authorizations` table
- **Background Job**: `syncPriorAuthStatuses()`
- **API Endpoint**: `POST /api/billing/prior-auth/submit`

### Flow 3: Claims Submission (Complete Lifecycle)

```
┌─────────────┐
│ 1. DRAFT    │ Create claim with line items
└──────┬──────┘
       │
       │ Validate
       │
┌──────▼──────┐
│ 2. VALIDATED│ Business rules passed
└──────┬──────┘
       │
       │ Submit to Claim.MD
       │
┌──────▼──────┐
│ 3. SUBMITTED│ Sent to clearinghouse
└──────┬──────┘      (Gets claim_md_id)
       │
       │ Clearinghouse processing
       │
┌──────▼──────┐
│ 4. ACCEPTED │ Payer received claim
└──────┬──────┘      (Gets control_number)
       │
       │ Payer adjudication
       │
┌──────▼──────────────┐
│ 5a. PAID            │ Payment received via ERA
│     OR              │
│ 5b. DENIED          │ Rejected with reason codes
│     OR              │
│ 5c. PARTIALLY PAID  │ Some lines paid
└─────────────────────┘
```

**Detailed Steps:**

#### Step 1: Draft Creation

```javascript
POST /api/billing/claims

{
  "patientId": "patient-123",
  "payerId": "payer-456",
  "claimType": "professional",
  "billingProviderNpi": "1234567890",
  "subscriberMemberId": "MEM123456",
  "serviceDateFrom": "2025-01-15",
  "serviceDateTo": "2025-01-15",
  "totalCharge": 175.00,
  "lines": [
    {
      "serviceDate": "2025-01-15",
      "cptCode": "99213",
      "icdCodes": ["E11.9"],
      "units": 1,
      "chargeAmount": 150.00
    }
  ]
}
```

#### Step 2: Validation

```javascript
POST /api/billing/claims/:id/validate

// Validates:
// - Billing provider NPI (10 digits)
// - Subscriber member ID (required)
// - Service dates (valid range)
// - Total charge > 0
// - CPT/ICD code validity
```

#### Step 3: Submission

```javascript
POST /api/billing/claims/:id/submit

// Builds 837 payload and sends to Claim.MD
// Returns: { claimMdId, controlNumber, status }
```

#### Step 4: Status Tracking

**Background Job** (every 30 minutes):
```javascript
// Automatically checks status for all submitted claims
syncClaimStatuses()
  - Queries Claim.MD for updates
  - Updates local database
  - Records status history
```

#### Step 5: Payment Processing

When ERA file arrives:
```javascript
// Background job (hourly)
fetchRemittanceFiles()
  - Downloads ERA files
  - Parses 835 data
  - Matches to claims
  - Posts payments to ledger
```

### Flow 4: Electronic Remittance Advice (ERA)

```
┌─────────────────┐
│ 1. Payer Sends  │
│ ERA File (835)  │
└────────┬────────┘
         │
         │ Available on Claim.MD
         │
┌────────▼────────────┐
│ 2. Background Job   │
│ Fetches ERA Files   │
│ (Hourly)            │
└────────┬────────────┘
         │
         │ Download & Parse
         │
┌────────▼────────────┐
│ 3. Parse 835 Data   │
│ - Check number      │
│ - Payment amount    │
│ - Claim details     │
│ - Adjustments       │
└────────┬────────────┘
         │
         │ Match to Claims
         │
┌────────▼────────────┐
│ 4. Remittance DB    │
│ Store in:           │
│ - billing_remittance│
│ - remittance_lines  │
└────────┬────────────┘
         │
         │ Review (optional)
         │
┌────────▼────────────┐
│ 5. Post Payment     │
│ Update:             │
│ - Claim totals      │
│ - Payment ledger    │
│ - Patient balance   │
└─────────────────────┘
```

**Key Components:**
- **Background Job**: `fetchRemittanceFiles()` - Hourly
- **Service**: `claimMDService.downloadRemittanceFile()`
- **Business Logic**: `billingService.postRemittancePayment()`
- **Tables**: `billing_remittance`, `billing_remittance_lines`, `billing_payment_ledger`

---

## Database Architecture

### Schema Overview (14 Tables + 3 Views)

```
Master Data (5 tables)
├── billing_cpt_codes         # CPT procedure codes
├── billing_icd_codes         # ICD-10 diagnosis codes  
├── billing_modifiers         # CPT modifiers
├── billing_providers         # Healthcare providers (NPI)
└── billing_payers            # Insurance companies

Configuration (2 tables)
├── billing_tenant_settings   # Claim.MD credentials per org
└── billing_fee_schedules     # CPT pricing per payer/org

Transactions (5 tables)
├── billing_eligibility_history    # Insurance verification logs
├── billing_prior_authorizations   # Prior auth requests
├── billing_claims                 # Claim headers (837)
├── billing_claim_lines            # Claim line items
└── billing_remittance             # ERA files (835)

Financial (2 tables)
├── billing_remittance_lines  # ERA line item details
└── billing_payment_ledger    # Accounting journal

Audit (1 table)
└── billing_claim_status_history   # Status change log
```

### Key Table Details

#### billing_claims (Central Table)

```sql
CREATE TABLE billing_claims (
  id UUID PRIMARY KEY,
  claim_number TEXT UNIQUE,        -- Internal: CLM-timestamp-random
  claim_md_id TEXT UNIQUE,         -- Claim.MD ID
  control_number TEXT,             -- Payer ICN
  
  -- References
  org_id UUID,                     -- Multi-tenant isolation
  patient_id TEXT,                 -- FHIR Patient ID
  payer_id UUID,                   -- Foreign key to billing_payers
  auth_id UUID,                    -- Prior authorization reference
  
  -- Header info
  claim_type TEXT,                 -- 'professional' or 'institutional'
  billing_provider_npi TEXT,
  subscriber_member_id TEXT,
  
  -- Financial
  total_charge DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  total_adjustment DECIMAL(10,2),
  patient_responsibility DECIMAL(10,2),
  
  -- Dates
  service_date_from DATE,
  service_date_to DATE,
  submission_date TIMESTAMP,
  paid_date TIMESTAMP,
  
  -- Status
  status TEXT,                     -- draft, validated, submitted, etc.
  
  -- Payloads
  claim_payload JSONB,             -- Original 837 data
  response_payload JSONB,          -- Claim.MD/payer response
  
  -- Metadata
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### billing_eligibility_history

```sql
CREATE TABLE billing_eligibility_history (
  id UUID PRIMARY KEY,
  org_id UUID,
  patient_id TEXT,
  payer_id UUID,
  member_id TEXT,
  service_date DATE,
  eligibility_status TEXT,         -- active, inactive, unknown
  coverage_details JSONB,          -- Plan, copay, deductible
  response_raw JSONB,              -- Full Claim.MD response
  checked_at TIMESTAMP
);
```

#### billing_payment_ledger (Accounting Journal)

```sql
CREATE TABLE billing_payment_ledger (
  id UUID PRIMARY KEY,
  org_id UUID,
  patient_id TEXT,
  claim_id UUID,
  remittance_id UUID,
  
  transaction_type TEXT,           -- payment, adjustment, refund
  transaction_date DATE,
  amount DECIMAL(10,2),
  
  payer_type TEXT,                 -- insurance, patient, other
  description TEXT,
  
  posted_by UUID,
  posted_at TIMESTAMP
);
```

### Database Views (Reporting)

#### v_billing_claims_summary
```sql
-- Aggregated claim view with payer info
SELECT
  c.id, c.claim_number, c.status,
  c.total_charge, c.total_paid,
  p.name as payer_name,
  o.name as org_name
FROM billing_claims c
JOIN billing_payers p ON c.payer_id = p.id
JOIN organizations o ON c.org_id = o.id;
```

#### v_billing_unpaid_claims
```sql
-- Claims with outstanding balance
SELECT
  claim_number,
  total_charge,
  total_paid,
  (total_charge - COALESCE(total_paid, 0)) as balance,
  CURRENT_DATE - submission_date as days_outstanding
FROM billing_claims
WHERE status NOT IN ('paid', 'cancelled')
  AND (total_charge - COALESCE(total_paid, 0)) > 0;
```

---

## API Reference

### Base URL
```
http://localhost:8000/api/billing
```

### Authentication
```
Headers:
  Authorization: Bearer <access_token>
  x-org-id: <organization_uuid>
```

### Eligibility Endpoints

#### Check Eligibility
```http
POST /eligibility/check
Content-Type: application/json

{
  "patientId": "patient-123",
  "payerId": "payer-456", 
  "memberID": "MEM123456",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-01-15",
  "serviceDate": "2025-01-15"
}

Response:
{
  "success": true,
  "data": {
    "status": "active",
    "coverage": {
      "planName": "PPO Gold",
      "copay": 30,
      "deductible": 2000,
      "deductibleRemaining": 500
    }
  }
}
```

#### Get Eligibility History
```http
GET /eligibility/history/:patientId?limit=10

Response:
[
  {
    "id": "uuid",
    "service_date": "2025-01-15",
    "eligibility_status": "active",
    "coverage_details": {...},
    "payer_name": "Blue Cross",
    "checked_at": "2025-01-15T10:30:00Z"
  }
]
```

### Prior Authorization Endpoints

#### Submit Prior Auth
```http
POST /prior-auth/submit

{
  "patientId": "patient-123",
  "payerId": "payer-456",
  "providerNPI": "1234567890",
  "cptCodes": ["99213", "36415"],
  "icdCodes": ["E11.9"],
  "notes": "Routine follow-up"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "authNumber": "AUTH-2025-001",
    "status": "pending"
  }
}
```

#### List Prior Auths
```http
GET /prior-auth?patientId=patient-123&status=pending

Response:
[
  {
    "id": "uuid",
    "auth_number": "AUTH-2025-001",
    "status": "pending",
    "cpt_codes": ["99213"],
    "requested_date": "2025-01-15",
    "payer_name": "Medicare"
  }
]
```

### Claims Endpoints

#### Create Claim
```http
POST /claims

{
  "patientId": "patient-123",
  "payerId": "payer-456",
  "claimType": "professional",
  "billingProviderNpi": "1234567890",
  "subscriberMemberId": "MEM123456",
  "serviceDateFrom": "2025-01-15",
  "serviceDateTo": "2025-01-15",
  "totalCharge": 175.00,
  "lines": [
    {
      "serviceDate": "2025-01-15",
      "cptCode": "99213",
      "icdCodes": ["E11.9"],
      "units": 1,
      "chargeAmount": 150.00
    }
  ]
}

Response:
{
  "id": "claim-uuid",
  "claimNumber": "CLM-1737065400-ABC123",
  "status": "draft"
}
```

#### Validate Claim
```http
POST /claims/:id/validate

Response:
{
  "valid": true,
  "errors": []
}
```

#### Submit Claim
```http
POST /claims/:id/submit

Response:
{
  "success": true,
  "data": {
    "claimMdId": "cmd-12345",
    "controlNumber": "ICN-67890",
    "status": "Accepted"
  }
}
```

#### Get Claim Status
```http
GET /claims/:claimMdId/status

Response:
{
  "status": "paid",
  "paidAmount": 150.00,
  "adjustmentAmount": 25.00,
  "patientResponsibility": 0
}
```

### Dashboard & Reports

#### Get KPIs
```http
GET /dashboard/kpis?startDate=2025-01-01&endDate=2025-01-31

Response:
{
  "totalBilled": 50000.00,
  "totalCollected": 42000.00,
  "collectionRate": 84.0,
  "denialRate": 8.5,
  "avgPaymentLag": 18,
  "claimsByStatus": [
    {"status": "paid", "count": 150},
    {"status": "submitted", "count": 45}
  ]
}
```

---

## Background Jobs & Automation

### Job Scheduler

**File**: `ehr-api/src/services/billing.jobs.js`

### Job Configuration

```javascript
// Claim status sync - every 30 minutes
scheduleJob('claimStatusSync', 30 * 60 * 1000, syncClaimStatuses);

// ERA fetch - hourly
scheduleJob('remittanceFetch', 60 * 60 * 1000, fetchRemittanceFiles);

// Prior auth sync - every 30 minutes  
scheduleJob('priorAuthSync', 30 * 60 * 1000, syncPriorAuthStatuses);
```

### Job Details

#### 1. syncClaimStatuses()

**Purpose**: Update claim statuses from Claim.MD

**Frequency**: Every 30 minutes

**Process**:
1. Get all orgs with active Claim.MD credentials
2. For each org, find claims in 'submitted' or 'accepted' status
3. Call Claim.MD status API for each claim
4. Update claim status, totals, and history
5. Rate-limit with 500ms delay between requests

**SQL Query**:
```sql
SELECT id, claim_md_id
FROM billing_claims
WHERE org_id = $1
  AND claim_md_id IS NOT NULL
  AND status IN ('submitted', 'accepted')
  AND (updated_at < NOW() - INTERVAL '1 hour')
ORDER BY submission_date ASC
LIMIT 50
```

#### 2. fetchRemittanceFiles()

**Purpose**: Download and process ERA files

**Frequency**: Hourly

**Process**:
1. Get all orgs with active credentials
2. Query Claim.MD for available ERA files (last 7 days)
3. Check if file already downloaded
4. Download and parse 835 data
5. Match payments to claims
6. Store in remittance tables

**ERA Processing**:
```javascript
downloadRemittanceFile(orgId, fileId)
  -> parseERA835(content)
  -> matchToClaims()
  -> storeRemittanceLines()
```

#### 3. syncPriorAuthStatuses()

**Purpose**: Update prior authorization statuses

**Frequency**: Every 30 minutes

**Process**:
1. Find pending prior auths (last 90 days)
2. Check status with Claim.MD
3. Update database with new status
4. Record status transitions

### Manual Job Triggers

```javascript
// For testing or admin use
billingJobs.triggerJob('claimStatusSync');
billingJobs.triggerJob('remittanceFetch');
```

### Job Status API

```http
GET /api/billing/jobs/status

Response:
{
  "claimStatusSync": {
    "running": false,
    "lastRun": "2025-01-15T10:30:00Z"
  },
  "remittanceFetch": {
    "running": true,
    "lastRun": "2025-01-15T10:00:00Z"
  }
}
```

---

## Integration Framework

### Plugin Architecture

EHRConnect uses a **base handler pattern** for extensible integrations:

```
BaseIntegrationHandler (Abstract)
  ├── ClaimMDHandler (Billing)
  ├── StripeHandler (Payments)
  ├── EpicHandler (EHR)
  ├── 100msHandler (Telehealth)
  └── CustomHL7Handler (HL7/FHIR)
```

### Base Handler Interface

```javascript
class BaseIntegrationHandler {
  async initialize(integration)
  async execute(integration, operation, params)
  async testConnection(integration)
  async healthCheck(integration)
  async handleWebhook(integration, payload, headers)
  async cleanup(integrationId)
}
```

### Creating a Claim.MD Handler

**File**: `ehr-api/src/integrations/claimmd.handler.js`

```javascript
const BaseIntegrationHandler = require('./base-handler');
const claimMDService = require('../services/claimmd.service');

class ClaimMDHandler extends BaseIntegrationHandler {
  constructor() {
    super('claimmd');
  }

  async initialize(integration) {
    await super.initialize(integration);
    
    const client = {
      accountKey: integration.credentials.accountKey,
      token: integration.credentials.token,
      apiUrl: integration.credentials.apiUrl
    };
    
    this.setClient(integration.id, client);
  }

  async execute(integration, operation, params) {
    switch (operation) {
      case 'checkEligibility':
        return await claimMDService.checkEligibility(
          integration.orgId,
          params
        );
        
      case 'submitClaim':
        return await claimMDService.submitClaim(
          integration.orgId,
          params.claimId
        );
        
      case 'fetchRemittance':
        return await claimMDService.fetchRemittanceFiles(
          integration.orgId,
          params.startDate,
          params.endDate
        );
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async testConnection(integration) {
    try {
      const credentials = await claimMDService.getTenantCredentials(
        integration.orgId
      );
      return credentials.active;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new ClaimMDHandler();
```

### Integration Categories

**Organized by domain**:

```
integrations/
├── billing/          # Medical billing clearinghouses
│   ├── claimmd.handler.js
│   ├── availity.handler.js
│   └── emdeon.handler.js
├── ehr/             # EHR system integrations
│   ├── epic.handler.js
│   ├── cerner.handler.js
│   └── allscripts.handler.js
├── payment/         # Payment processors
│   ├── stripe.handler.js
│   ├── square.handler.js
│   └── paypal.handler.js
└── telehealth/      # Video conferencing
    ├── 100ms.handler.js
    └── zoom.handler.js
```

### Multi-Vendor Support

**Failover Strategy**:

```javascript
class IntegrationOrchestrator {
  async executeWithFailover(orgId, category, operation, params) {
    const integrations = await this.getActiveIntegrations(
      orgId, 
      category
    );
    
    for (const integration of integrations) {
      try {
        return await this.execute(
          orgId,
          integration.vendor_id,
          operation,
          params
        );
      } catch (error) {
        console.warn(`Failover: ${integration.vendor_id} failed`);
        // Try next integration
      }
    }
    
    throw new Error(`All ${category} integrations failed`);
  }
}
```

---

## Setup & Deployment

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 12+
- **Claim.MD Account** (sandbox or production)

### Step 1: Database Migration

```bash
cd ehr-api
psql -U medplum -d medplum -f src/database/migrations/003_billing_module.sql
```

### Step 2: Configure Claim.MD Credentials

```sql
-- For each organization
INSERT INTO billing_tenant_settings
  (org_id, claim_md_account_key, claim_md_token, active)
VALUES
  ('<org-uuid>', 'your-account-key', 'your-api-token', true);
```

### Step 3: Seed Master Data (Optional)

```bash
cd ehr-api/src/scripts
node seed-billing-masters.js
```

**Or manually**:

```sql
-- CPT codes
INSERT INTO billing_cpt_codes (code, description, category) VALUES
  ('99213', 'Office visit, 15 min', 'E&M'),
  ('99214', 'Office visit, 25 min', 'E&M');

-- ICD-10 codes
INSERT INTO billing_icd_codes (code, description) VALUES
  ('E11.9', 'Type 2 diabetes'),
  ('I10', 'Essential hypertension');

-- Payers
INSERT INTO billing_payers (name, payer_id, payer_type) VALUES
  ('Medicare', 'MEDICARE', 'medicare'),
  ('Blue Cross', 'BCBS', 'commercial');
```

### Step 4: Start Services

```bash
# Backend API
cd ehr-api
npm install
npm run dev

# Frontend
cd ehr-web
npm install
npm run dev
```

### Step 5: Verify Setup

```bash
# Check background jobs started
# Console should show:
# ✅ Scheduled claimStatusSync to run every 1800s
# ✅ Scheduled remittanceFetch to run every 3600s
# ✅ Scheduled priorAuthSync to run every 1800s

# Test eligibility endpoint
curl -X POST http://localhost:8000/api/billing/eligibility/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "x-org-id: <org-id>" \
  -d '{
    "patientId": "test-patient",
    "payerId": "
