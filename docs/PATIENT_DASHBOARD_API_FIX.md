# Patient Dashboard API Fix

## Issue

When accessing the patient portal dashboard at `/portal/dashboard`, the API endpoint returned an error:

```
GET http://localhost:3000/api/patient/dashboard
Status: 400 Bad Request
Response: {"message":"Patient ID not found"}
```

## Root Cause

The patient dashboard API route (`/src/app/api/patient/dashboard/route.ts`) was trying to get `patientId` from the wrong location in the session object:

**Incorrect Code (Line 18):**
```typescript
const patientId = (session.user as any).patientId
```

This was looking for `session.user.patientId` (nested inside user object), but patient sessions store the `patientId` at the top level of the session object as `session.patientId`.

### Session Structure

Patient sessions are structured as:
```typescript
{
  user: {
    id: "portal-user-uuid",
    name: "patient@example.com",
    email: "patient@example.com"
  },
  userType: "patient",
  patientId: "fhir-patient-id",    // ← At top level, NOT in user
  accessToken: "jwt-token...",
  sessionToken: "session-hex..."
}
```

## Fix Applied

Updated the dashboard API route to access `patientId` from the correct location:

**File:** `/src/app/api/patient/dashboard/route.ts` (Line 18)

**Before:**
```typescript
// Get patient ID from session (you'll need to add this to the session)
const patientId = (session.user as any).patientId

if (!patientId) {
  return NextResponse.json(
    { message: 'Patient ID not found' },
    { status: 400 }
  )
}
```

**After:**
```typescript
// Get patient ID from session - it's stored at top level, not in user object
const patientId = session.patientId

if (!patientId) {
  return NextResponse.json(
    { message: 'Patient ID not found' },
    { status: 400 }
  )
}
```

## How It Works Now

1. **Patient logs in** → Session created with `patientId` at top level
2. **Dashboard page loads** → Calls `/api/patient/dashboard`
3. **API route executes:**
   - Gets session via `getServerSession(authOptions)`
   - Accesses `session.patientId` (top level)
   - ✅ Finds patient ID
   - Calls `PatientPortalService.getPatientDashboard(patientId)`
   - Fetches FHIR data from Medplum:
     * Upcoming appointments
     * Recent encounters
     * Active medications
     * Allergies
     * Conditions
     * Vital signs
     * Unread messages count
     * Pending documents count
4. **API returns dashboard data** → Dashboard renders with patient information

## Related Session Fields

The patient session includes these fields at the top level:

```typescript
session.userType      // 'patient'
session.patientId     // FHIR Patient resource ID
session.accessToken   // JWT for ehr-api
session.sessionToken  // Session token for ehr-api
```

These are **NOT** nested in `session.user` - they are direct properties of the session object.

## Testing

### Test 1: Check Session Structure
```javascript
// In browser console while logged in as patient
fetch('/api/auth/session')
  .then(r => r.json())
  .then(session => {
    console.log('Session:', session)
    console.log('Patient ID (correct):', session.patientId)
    console.log('Patient ID (incorrect):', session.user?.patientId) // undefined
  })
```

### Test 2: Test Dashboard API
```bash
# After patient login, call dashboard API
curl http://localhost:3000/api/patient/dashboard \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Should return:
{
  "upcomingAppointments": [...],
  "recentEncounters": [...],
  "medications": [...],
  "allergies": [...],
  "conditions": [...],
  "vitalSigns": [...],
  "unreadMessages": 0,
  "pendingDocuments": 0
}
```

### Test 3: Verify Dashboard Loads
1. Login as patient at `/patient-login`
2. Should redirect to `/portal/dashboard`
3. Dashboard should load with:
   - Welcome message with patient name
   - Upcoming appointments section
   - Recent encounters
   - Active medications
   - Allergies
   - Conditions
   - No "Patient ID not found" error

## Other API Routes Checked

I verified that other patient API routes are correctly implemented:

- ✅ **`/api/patient/register/route.ts`** - Doesn't access session.patientId
- ✅ **`/api/patient/grant-portal-access/route.ts`** - Gets patientId from request body
- ✅ **`/api/patient/check-portal-access/route.ts`** - Gets patientId from query params

Only the dashboard route had this issue.

## Impact

**Before Fix:**
- ❌ Patient dashboard API always returned "Patient ID not found"
- ❌ Dashboard couldn't load patient data
- ❌ Patient portal was unusable

**After Fix:**
- ✅ Patient dashboard API correctly identifies patient
- ✅ Dashboard loads appointments, medications, etc.
- ✅ Patient portal fully functional

## Files Modified

- **`/src/app/api/patient/dashboard/route.ts`** (Line 18) - Fixed patientId access

## Related Documentation

- **`PATIENT_AUTH_COMPLETE.md`** - Complete patient authentication system
- **`PATIENT_SESSION_FIX.md`** - Session structure and detection fixes
- **`PATIENT_REDIRECT_FIX.md`** - Redirect fixes

---

**Status:** ✅ FIXED
**Date:** 2025-11-02
**Version:** 2.0.4

Patient dashboard API now correctly accesses patient ID from session and returns complete patient data.
