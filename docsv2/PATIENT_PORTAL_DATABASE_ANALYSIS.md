# 🔍 Patient Portal Database Integration Analysis

## Current Implementation Status

### ❌ NOT Saving to ehr-api Database

**Current Status:** Patient portal access data is **ONLY** stored in FHIR (Medplum), **NOT** in the ehr-api PostgreSQL database.

---

## What We're Currently Doing

### 1. Data Storage Location: FHIR Only

**File:** `/src/services/patient-portal.service.ts`

Patient portal credentials are stored in FHIR Patient resource:

```typescript
// Line 669-750: grantPortalAccess method
static async grantPortalAccess(patientId, email, hashedPassword) {
  const patient = await medplum.readResource('Patient', patientId)

  // 1. Add email to telecom
  patient.telecom.push({ system: 'email', value: email })

  // 2. Add email identifier
  patient.identifier.push({ system: 'email', value: email })

  // 3. Add portal tag
  patient.meta.tag.push({ code: 'portal-patient' })

  // 4. Store hashed password in extension
  patient.extension.push({
    url: 'urn:oid:ehrconnect:password',
    valueString: hashedPassword
  })

  // 5. Store grant date in extension
  patient.extension.push({
    url: 'urn:oid:ehrconnect:portal-access-granted',
    valueString: new Date().toISOString()
  })

  // Update FHIR resource
  return await medplum.updateResource(patient)
}
```

### 2. Authentication: Direct FHIR Query

**File:** `/src/lib/auth.ts` (lines 136-141)

```typescript
// Patient authentication queries FHIR directly
const { PatientPortalService } = await import('@/services/patient-portal.service')
const result = await PatientPortalService.authenticatePatient(email, password)

// authenticatePatient method:
// 1. Search FHIR for Patient by email identifier
// 2. Get password from patient.extension
// 3. Compare with bcrypt
```

### 3. No ehr-api Integration

**Current Architecture:**
```
Patient Login
    ↓
NextAuth patient-credentials provider
    ↓
PatientPortalService.authenticatePatient()
    ↓
FHIR Search (Medplum) ← ONLY THIS
    ↓
Success/Failure
```

**No calls to:**
- ❌ `/api/auth/login` (ehr-api)
- ❌ PostgreSQL database
- ❌ Any ehr-api endpoints

---

## What ehr-api Currently Has

### 1. Provider/Staff Authentication System

**File:** `/ehr-api/src/routes/auth.js`

```javascript
// Provider/staff login
router.post('/login', async (req, res) => {
  if (AUTH_PROVIDER !== 'postgres') {
    return res.status(400).json({ error: 'Postgres auth not enabled' })
  }

  const { email, password } = req.body
  const result = await postgresAuthService.login(email, password)
  res.json(result)
})
```

### 2. Users Table (Providers/Staff Only)

**File:** `/ehr-api/src/database/schema.sql` (lines 88-103)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  keycloak_user_id TEXT UNIQUE NOT NULL, -- For Keycloak auth
  status TEXT NOT NULL CHECK (status IN ('invited', 'active', 'disabled', 'suspended')),
  profile JSONB,
  preferences JSONB,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  disabled_at TIMESTAMP,
  disabled_reason TEXT,
  metadata JSONB
);
```

**This table is for providers/staff, NOT patients.**

### 3. No Patient Portal Tables

**Missing from database:**
- ❌ `patient_portal_users` table
- ❌ `patient_portal_access` table
- ❌ `patient_sessions` table
- ❌ `patient_audit_logs` table

---

## Architecture Comparison

### Current (FHIR Only)
```
┌─────────────────────────────────────────┐
│           Patient Portal                │
│         (ehr-web Next.js)               │
└────────────┬────────────────────────────┘
             │
             ↓
      ┌──────────────┐
      │    FHIR      │
      │  (Medplum)   │ ← ALL patient data here
      └──────────────┘

Provider/Staff:
┌─────────────────────────────────────────┐
│        Provider Interface               │
│         (ehr-web Next.js)               │
└────────────┬────────────────────────────┘
             │
             ↓
      ┌──────────────┐
      │   ehr-api    │
      │  PostgreSQL  │ ← Provider data here
      └──────────────┘
```

### Recommended (Integrated)
```
┌─────────────────────────────────────────┐
│           Patient Portal                │
│         (ehr-web Next.js)               │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌──────────┐    ┌──────────────┐
│   FHIR   │    │   ehr-api    │
│(Medplum) │    │  PostgreSQL  │
│          │    │              │
│Clinical  │    │Credentials   │
│Data      │    │Access Control│
│          │    │Audit Logs    │
└──────────┘    └──────────────┘

Provider/Staff:
┌─────────────────────────────────────────┐
│        Provider Interface               │
│         (ehr-web Next.js)               │
└────────────┬────────────────────────────┘
             │
             ↓
      ┌──────────────┐
      │   ehr-api    │
      │  PostgreSQL  │
      └──────────────┘
```

---

## Pros and Cons

### Current Approach (FHIR Only)

**Pros:**
✅ Simple - one data source
✅ FHIR-compliant storage
✅ Already implemented and working
✅ No additional database tables needed

**Cons:**
❌ Inconsistent with provider authentication (uses ehr-api)
❌ No audit logs in PostgreSQL
❌ Harder to query/report on portal usage
❌ Password stored in FHIR extension (non-standard)
❌ No session management in database
❌ Can't leverage ehr-api authentication infrastructure

---

### Recommended Approach (Hybrid)

**Architecture:**
- **FHIR:** Clinical data (demographics, conditions, medications, etc.)
- **PostgreSQL:** Authentication, access control, audit logs, sessions

**Pros:**
✅ Consistent with provider authentication
✅ Proper audit logging
✅ Better security (passwords in dedicated auth system)
✅ Session management
✅ Easy to query portal usage stats
✅ Leverage existing ehr-api infrastructure
✅ Proper role separation (FHIR = clinical, DB = auth)

**Cons:**
❌ More complex integration
❌ Need to create new database tables
❌ Need to create new API endpoints
❌ Data split across two systems

---

## Recommended Implementation

### Phase 1: Database Schema

**New Table:** `patient_portal_users`

```sql
CREATE TABLE IF NOT EXISTS patient_portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Patient identification
  fhir_patient_id TEXT UNIQUE NOT NULL, -- Links to FHIR Patient resource
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Credentials
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hashed

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'suspended', 'pending')),

  -- Access control
  portal_access_granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  portal_access_granted_by UUID REFERENCES users(id), -- Provider who granted access
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,

  -- Security
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMP,
  email_verification_token TEXT,
  email_verified_at TIMESTAMP,

  -- Preferences
  preferences JSONB, -- Notification settings, etc.

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_patient_portal_users_email ON patient_portal_users(email);
CREATE INDEX idx_patient_portal_users_fhir_patient_id ON patient_portal_users(fhir_patient_id);
CREATE INDEX idx_patient_portal_users_org_id ON patient_portal_users(org_id);
CREATE INDEX idx_patient_portal_users_status ON patient_portal_users(status);
```

**New Table:** `patient_portal_sessions`

```sql
CREATE TABLE IF NOT EXISTS patient_portal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_portal_user_id UUID NOT NULL REFERENCES patient_portal_users(id) ON DELETE CASCADE,

  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX idx_patient_portal_sessions_user ON patient_portal_sessions(patient_portal_user_id);
CREATE INDEX idx_patient_portal_sessions_expires ON patient_portal_sessions(expires_at);
```

**New Table:** `patient_portal_audit_logs`

```sql
CREATE TABLE IF NOT EXISTS patient_portal_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_portal_user_id UUID REFERENCES patient_portal_users(id),

  action TEXT NOT NULL, -- 'login', 'logout', 'view_records', 'book_appointment', etc.
  resource_type TEXT, -- 'Appointment', 'MedicationRequest', etc.
  resource_id TEXT,

  ip_address INET,
  user_agent TEXT,

  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_portal_audit_logs_user ON patient_portal_audit_logs(patient_portal_user_id);
CREATE INDEX idx_patient_portal_audit_logs_action ON patient_portal_audit_logs(action);
CREATE INDEX idx_patient_portal_audit_logs_created ON patient_portal_audit_logs(created_at);
```

### Phase 2: API Endpoints

**New File:** `/ehr-api/src/routes/patient-portal.js`

```javascript
const express = require('express');
const router = express.Router();
const patientPortalService = require('../services/patient-portal.service');

// POST /api/patient-portal/grant-access
// Grant portal access to a patient (provider action)
router.post('/grant-access', async (req, res) => {
  // Requires provider authentication
  // Creates patient_portal_user record
  // Links to FHIR patient
});

// POST /api/patient-portal/login
// Patient login
router.post('/login', async (req, res) => {
  // Authenticate patient
  // Create session
  // Log audit event
});

// POST /api/patient-portal/logout
// Patient logout
router.post('/logout', async (req, res) => {
  // End session
  // Log audit event
});

// GET /api/patient-portal/check-access
// Check if patient has portal access
router.get('/check-access', async (req, res) => {
  // Query patient_portal_users table
});

// POST /api/patient-portal/reset-password
// Request password reset
router.post('/reset-password', async (req, res) => {
  // Generate reset token
  // Send email
});

// POST /api/patient-portal/change-password
// Change password (authenticated)
router.post('/change-password', async (req, res) => {
  // Update password
  // Invalidate sessions
});

module.exports = router;
```

**New File:** `/ehr-api/src/services/patient-portal.service.js`

```javascript
const bcrypt = require('bcrypt');
const { query } = require('../database/connection');

class PatientPortalService {
  async grantPortalAccess(fhirPatientId, email, password, grantedByUserId, orgId) {
    // Hash password
    // Insert into patient_portal_users
    // Return user record
  }

  async authenticatePatient(email, password) {
    // Find patient by email
    // Verify password
    // Check account status
    // Update last_login_at
    // Create session
    // Log audit event
    // Return patient data
  }

  async checkPortalAccess(fhirPatientId) {
    // Query patient_portal_users
    // Return access status
  }

  async revokeAccess(fhirPatientId) {
    // Update status to 'disabled'
    // Invalidate all sessions
    // Log audit event
  }
}

module.exports = new PatientPortalService();
```

### Phase 3: Update ehr-web Integration

**Update:** `/src/lib/auth.ts`

```typescript
// Instead of querying FHIR directly:
const result = await PatientPortalService.authenticatePatient(email, password)

// Call ehr-api:
const res = await fetch(`${API_URL}/api/patient-portal/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const data = await res.json()
// data contains: { user, token, fhirPatientId }
```

**Update:** `/src/app/api/patient/grant-portal-access/route.ts`

```typescript
// Instead of calling PatientPortalService (FHIR):
const updatedPatient = await PatientPortalService.grantPortalAccess(...)

// Call ehr-api:
const res = await fetch(`${API_URL}/api/patient-portal/grant-access`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': providerId,
    'x-org-id': orgId,
  },
  body: JSON.stringify({ fhirPatientId, email, password }),
})
```

---

## Migration Steps

### Step 1: Create Database Tables
```bash
cd ehr-api
# Create migration file
npm run migration:create add-patient-portal-tables
# Add SQL from Phase 1 above
npm run migrate
```

### Step 2: Create ehr-api Endpoints
```bash
# Create service and routes
touch src/services/patient-portal.service.js
touch src/routes/patient-portal.js
# Implement Phase 2 code
# Register routes in index.js
```

### Step 3: Update ehr-web Integration
```bash
cd ehr-web
# Update auth.ts to call ehr-api
# Update grant-portal-access API route
# Test end-to-end
```

### Step 4: Migrate Existing Data (if any)
```bash
# Script to migrate FHIR patient portal data to PostgreSQL
# Read patients with portal-patient tag
# Create patient_portal_users records
```

---

## Recommendation

**I recommend implementing the hybrid approach** for these reasons:

1. **Consistency:** Aligns with how provider authentication works
2. **Security:** Proper audit logs and session management
3. **Scalability:** Easier to add features like password reset, email verification
4. **Reporting:** Can easily query portal usage statistics
5. **Compliance:** Better audit trail for HIPAA compliance

**Timeline:**
- Phase 1 (Database): 1-2 hours
- Phase 2 (API): 3-4 hours
- Phase 3 (Integration): 2-3 hours
- Testing: 2 hours
**Total:** ~1 day

---

## Decision Needed

**Question for you:**

Do you want me to:

**Option A:** Keep current FHIR-only implementation (simpler, already working)

**Option B:** Implement hybrid approach with ehr-api database integration (recommended, more robust)

**Option C:** Something else?

Please let me know which direction you prefer, and I can implement accordingly!

---

**Current Status:** ❌ NOT saving to ehr-api database (FHIR only)
**Recommended:** ✅ Integrate with ehr-api for authentication and audit logs
