# Patient Appointments Authentication Fix

## Problem

Patient appointments were visible in the provider view (`/patients/{id}`) but not showing in the patient portal after login. The patient credentials:
- Email: feginy@mailinator.com
- Password: nilkamal0_Y
- FHIR Patient ID: b1fa04de-f51b-4b64-82d2-e580c1c84341

**Root Cause:**
The Medplum FHIR client was not authenticated when making requests on behalf of patients. The global `medplum` client instance had no authentication credentials, so FHIR queries either failed or returned empty results due to access control.

---

## How It Should Work

### Patient Login Flow
1. Patient logs in at `/patient-login`
2. ehr-api validates credentials → POST `/api/patient-portal/login`
3. ehr-api returns:
   ```json
   {
     "success": true,
     "user": {
       "id": "51bff00e-3ca6-4761-85d6-9fada800180e",
       "fhirPatientId": "b1fa04de-f51b-4b64-82d2-e580c1c84341",
       "email": "feginy@mailinator.com"
     },
     "token": "eyJhbGciOiJIUzI1NiIs...",      // JWT access token
     "sessionToken": "5192e942a3bc1d99..."    // Session token
   }
   ```
4. NextAuth stores in session:
   - `session.patientId = "b1fa04de-f51b-4b64-82d2-e580c1c84341"`
   - `session.accessToken = "eyJhbGciOiJIUzI1NiIs..."`
   - `session.sessionToken = "5192e942a3bc1d99..."`

### Appointments Query Flow (Before Fix)
1. Patient visits `/portal/appointments`
2. Page calls API: `GET /api/patient/appointments?filter=upcoming`
3. API route gets session → extracts `patientId`
4. ❌ **PROBLEM:** Calls `medplum.search('Appointment', { patient: 'Patient/xxx' })`
5. ❌ Medplum client has NO authentication
6. ❌ FHIR server denies access or returns empty results
7. ❌ Patient sees no appointments

### Appointments Query Flow (After Fix)
1. Patient visits `/portal/appointments`
2. Page calls API: `GET /api/patient/appointments?filter=upcoming`
3. API route gets session → extracts `patientId` AND `accessToken`
4. ✅ **FIX:** Creates authenticated client: `createPatientMedplumClient(accessToken)`
5. ✅ Medplum client includes `Authorization: Bearer {token}` in requests
6. ✅ FHIR server validates token and returns patient's appointments
7. ✅ Patient sees their appointments

---

## Solution Implemented

### 1. Created Authentication Helper (`/src/lib/medplum-patient.ts`)

```typescript
import { MedplumClient } from '@medplum/core'

export function createPatientMedplumClient(accessToken: string): MedplumClient {
  const client = new MedplumClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    fhirUrlPath: 'fhir/R4',
    clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID || 'medplum-client',
  })

  // Set the access token for authenticated requests
  client.setAccessToken(accessToken)

  return client
}
```

**What this does:**
- Creates a NEW Medplum client instance per request
- Sets the patient's access token on the client
- Ensures FHIR requests include proper authentication

---

### 2. Updated Appointments API Route

**File:** `/src/app/api/patient/appointments/route.ts`

**Before:**
```typescript
const patientId = session.patientId

if (!patientId) {
  return NextResponse.json({ message: 'Patient ID not found' }, { status: 400 })
}

const appointments = await PatientPortalService.getPatientAppointments(
  patientId,
  searchCriteria
)
```

**After:**
```typescript
const patientId = session.patientId
const accessToken = session.accessToken

if (!patientId) {
  return NextResponse.json({ message: 'Patient ID not found' }, { status: 400 })
}

if (!accessToken) {
  return NextResponse.json({ message: 'Access token not found' }, { status: 401 })
}

// Create authenticated Medplum client
const medplum = createPatientMedplumClient(accessToken)

// Build FHIR search parameters
const fhirSearchParams: any = {
  patient: `Patient/${patientId}`,
  _sort: '-date',
  _count: 50,
}

// Apply filters...
const bundle = await medplum.search('Appointment', fhirSearchParams)
const appointments = bundle.entry?.map((e: any) => e.resource) || []
```

**Changes:**
- ✅ Extract `accessToken` from session
- ✅ Validate access token is present
- ✅ Create authenticated Medplum client per request
- ✅ Use authenticated client for FHIR queries
- ✅ Added console logging for debugging

---

### 3. Created Debug Endpoint

**File:** `/src/app/api/patient/debug-session/route.ts`

**Purpose:** Debug patient session and test FHIR queries

**What it returns:**
```json
{
  "sessionInfo": {
    "hasSession": true,
    "hasUser": true,
    "userId": "51bff00e-3ca6-4761-85d6-9fada800180e",
    "userEmail": "feginy@mailinator.com",
    "patientId": "b1fa04de-f51b-4b64-82d2-e580c1c84341",
    "userType": "patient",
    "accessToken": "present",
    "sessionToken": "present"
  },
  "appointmentsTest": {
    "query": "patient=Patient/b1fa04de-f51b-4b64-82d2-e580c1c84341",
    "total": 3,
    "entries": 3,
    "appointments": [
      {
        "id": "appt-123",
        "status": "booked",
        "start": "2025-11-05T10:00:00Z"
      }
    ],
    "usingAuthentication": true
  }
}
```

---

## Testing Instructions

### Step 1: Login as Patient

1. Open browser: http://localhost:3000/patient-login
2. Enter credentials:
   - Email: `feginy@mailinator.com`
   - Password: `nilkamal0_Y`
3. Click "Login"
4. Should redirect to: `/portal/dashboard`

### Step 2: Test Debug Endpoint

After logging in, open in a new tab:
```
http://localhost:3000/api/patient/debug-session
```

**Expected Response:**
```json
{
  "sessionInfo": {
    "patientId": "b1fa04de-f51b-4b64-82d2-e580c1c84341",
    "accessToken": "present",
    ...
  },
  "appointmentsTest": {
    "total": 1,  // or however many appointments exist
    "appointments": [...]
  }
}
```

**If you see:**
- ❌ `"accessToken": "missing"` → Session not storing token (auth.ts issue)
- ❌ `"appointmentsTest": { "error": "..." }` → FHIR query failing (check error message)
- ❌ `"total": 0` → Either no appointments OR authentication not working
- ✅ `"total": > 0` with appointments listed → Authentication working!

### Step 3: Test Appointments Page

Navigate to:
```
http://localhost:3000/portal/appointments
```

**Expected:**
- See list of upcoming appointments
- See "Past Appointments" tab
- Appointments should match what's in provider view

### Step 4: Check Browser Console

Open DevTools → Console, check for logs:
```
Searching appointments with params: { patient: 'Patient/xxx', ... }
Appointments found: 3
```

### Step 5: Check Server Logs

In your terminal where Next.js is running, you should see:
```
Searching appointments with params: {
  patient: 'Patient/b1fa04de-f51b-4b64-82d2-e580c1c84341',
  status: 'booked,pending,arrived,checked-in',
  date: 'ge2025-11-02',
  _sort: '-date',
  _count: 50
}
Appointments found: 3
```

---

## Common Issues and Solutions

### Issue 1: `"Access token not found"` (401 error)

**Symptom:** API returns `{ "message": "Access token not found" }`

**Cause:** Session doesn't have `accessToken` field

**Solutions:**
1. Check JWT callback stores `accessToken`:
   ```typescript
   // In /src/lib/auth.ts, JWT callback
   if (user && user.userType === 'patient') {
     token.accessToken = user.accessToken  // ← Must be present
   }
   ```

2. Check session callback copies `accessToken`:
   ```typescript
   // In /src/lib/auth.ts, session callback
   if (token.userType === 'patient') {
     session.accessToken = token.accessToken as string  // ← Must be present
   }
   ```

3. Clear browser cookies and login again

---

### Issue 2: Appointments still not showing (empty array)

**Symptom:** Debug endpoint shows `"total": 0` even though appointments exist

**Possible Causes:**

**A. FHIR Access Control**
- ehr-api might not be properly authenticating with FHIR server
- Check if ehr-api logs show FHIR request failures

**B. Patient ID Mismatch**
- Verify patient ID in session matches FHIR Patient ID
- Check: session shows `b1fa04de-f51b-4b64-82d2-e580c1c84341`
- Check: Provider URL shows `/patients/b1fa04de-f51b-4b64-82d2-e580c1c84341`

**C. Appointment Participant Reference**
- Appointments might reference patient differently
- Check appointment JSON in provider view:
  ```json
  {
    "participant": [
      {
        "actor": {
          "reference": "Patient/b1fa04de-f51b-4b64-82d2-e580c1c84341"
        }
      }
    ]
  }
  ```

**D. ehr-api FHIR Proxy Not Configured**
- ehr-api at `localhost:8000/fhir/R4` might not proxy to Medplum correctly
- Check ehr-api has FHIR proxy endpoints
- Verify `Authorization: Bearer {token}` is forwarded to Medplum

---

### Issue 3: "Unauthorized" or 401 from Medplum

**Symptom:** Error in appointmentsTest: `"Unauthorized"` or `401`

**Cause:** Access token not valid for Medplum FHIR API

**Solutions:**
1. Check if ehr-api validates patient tokens
2. Check if token format is correct (JWT vs session token)
3. Verify ehr-api forwards authentication to Medplum
4. Check token expiration

---

## Next Steps to Apply to Other Routes

The following routes also need the same authentication fix:

### Priority 1 (Used Frequently)
- ✅ `/api/patient/appointments` - FIXED
- 🔄 `/api/patient/dashboard` - Needs fix
- 🔄 `/api/patient/health-records` - Needs fix

### Priority 2 (User-Initiated)
- 🔄 `/api/patient/appointments/book` - Needs fix
- 🔄 `/api/patient/messages/conversations` - Needs fix
- 🔄 `/api/patient/messages/[conversationId]` - Needs fix
- 🔄 `/api/patient/messages/send` - Needs fix
- 🔄 `/api/patient/providers` - Needs fix

### Fix Pattern for Each Route:

```typescript
// 1. Import helper
import { createPatientMedplumClient } from '@/lib/medplum-patient'

// 2. Extract access token from session
const patientId = session.patientId
const accessToken = session.accessToken

// 3. Validate access token
if (!accessToken) {
  return NextResponse.json(
    { message: 'Access token not found' },
    { status: 401 }
  )
}

// 4. Create authenticated client
const medplum = createPatientMedplumClient(accessToken)

// 5. Use authenticated client for FHIR operations
const bundle = await medplum.search('ResourceType', { ... })
```

---

## Files Created/Modified

### Created:
1. `/src/lib/medplum-patient.ts` - Authentication helper
2. `/src/app/api/patient/debug-session/route.ts` - Debug endpoint

### Modified:
1. `/src/app/api/patient/appointments/route.ts` - Added authentication

---

## Related Documentation

- **`PATIENT_AUTH_COMPLETE.md`** - Complete authentication system
- **`PATIENT_API_ROUTES_IMPLEMENTATION.md`** - All API routes
- **`PATIENT_DASHBOARD_API_FIX.md`** - Dashboard API fix

---

**Status:** 🔄 PARTIAL FIX
**Version:** 2.0.6
**Date:** 2025-11-02

**Appointments API now uses authenticated Medplum client. Other routes need same fix.**

## Testing Status

- ✅ Patient can login
- ✅ Session stores patientId and accessToken
- ⏳ **PENDING:** Test if appointments show in portal (requires ehr-api FHIR proxy to work)
- ⏳ **PENDING:** Apply fix to other routes

---

## User Action Required

Please test with these steps:

1. **Login:** http://localhost:3000/patient-login
   - Email: feginy@mailinator.com
   - Password: nilkamal0_Y

2. **Check Debug:** http://localhost:3000/api/patient/debug-session
   - Copy the full JSON response and send it to me

3. **Check Appointments:** http://localhost:3000/portal/appointments
   - Do appointments show now?

4. **Check Console:** Open DevTools → Console tab
   - Any errors?
   - What logs do you see?

This will tell us if the authentication fix works or if ehr-api needs configuration changes.
