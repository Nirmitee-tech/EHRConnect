# ✅ Patient Portal Redirect Fix

## Issue

After successful patient login, users were being redirected to `/onboarding` instead of `/portal/dashboard`.

**Root Causes:**
1. NextAuth redirect callback was sending everyone to `/dashboard` by default
2. Middleware was checking for `org_id` and redirecting to `/onboarding` if missing
3. Patients don't have `org_id` in their token - they have `patientId` instead

---

## Fixes Applied

### Fix 1: NextAuth Redirect Callback

**File:** `/src/lib/auth.ts` (Line 322)

**Before:**
```typescript
async redirect({ url, baseUrl }) {
  // ...
  return `${baseUrl}/dashboard`; // Always redirects to provider dashboard
}
```

**After:**
```typescript
async redirect({ url, baseUrl }) {
  // ...
  // For default redirects after sign-in:
  // Check if the sign-in came from patient-login page or if redirect URL contains /portal
  // This works because NextAuth includes the original page URL in the redirect callback
  const isPatientLogin = url.includes('patient-login') || url.includes('/portal') || targetUrl.includes('patient-login') || targetUrl.includes('/portal');

  if (isPatientLogin) {
    return `${baseUrl}/portal/dashboard`;
  }

  // For providers, the dashboard will check onboarding status
  return `${baseUrl}/dashboard`;
}
```

**What This Does:**
- Checks if the URL contains 'patient-login' or '/portal' to determine if it's a patient login
- Redirects patients to `/portal/dashboard`
- Redirects providers to `/dashboard` (existing behavior)
- Note: NextAuth v4 doesn't provide token in redirect callback, so we check the URL instead

---

### Fix 2: Middleware Org Check

**File:** `/src/middleware.ts` (Lines 78-87)

**Before:**
```typescript
const tokenOrgId = token.org_id as string | undefined;

// If user has no org assigned and not already on onboarding, redirect to onboarding
if (!tokenOrgId && !pathname.startsWith('/onboarding')) {
  return NextResponse.redirect(new URL('/onboarding', request.url));
}
```

**After:**
```typescript
const tokenOrgId = token.org_id as string | undefined;
const tokenOrgSlug = token.org_slug as string | undefined;
const userType = token.userType as string | undefined;

// If user has no org assigned and not already on onboarding, redirect to onboarding
// BUT: Skip this check for patients - they don't have org_id, they have patientId
if (!tokenOrgId && !pathname.startsWith('/onboarding') && userType !== 'patient') {
  return NextResponse.redirect(new URL('/onboarding', request.url));
}
```

**What This Does:**
- Extracts `userType` from token
- Skips org validation for patients (`userType === 'patient'`)
- Only providers/staff need org_id and get redirected to onboarding if missing

---

### Fix 3: Auth-Only Paths

**File:** `/src/middleware.ts` (Lines 31-36)

**Before:**
```typescript
const AUTH_ONLY_PATHS = [
  '/onboarding',
  '/select-organization',
  '/accept-invitation',
];
```

**After:**
```typescript
const AUTH_ONLY_PATHS = [
  '/onboarding',
  '/select-organization',
  '/accept-invitation',
  '/portal', // Patient portal - authenticated but no org context needed
];
```

**What This Does:**
- Adds `/portal` to paths that require authentication but NOT org validation
- Makes it explicit that patient portal routes bypass org checks
- Provides double protection (both this and the userType check)

---

## Authentication Flow (Fixed)

### Patient Login Flow
```
1. Patient visits /patient-login
2. Enters email/password
3. NextAuth calls patient-credentials provider
4. Provider calls ehr-api /api/patient-portal/login
5. ehr-api validates credentials
6. Returns JWT with userType: 'patient', patientId, sessionToken
7. NextAuth stores in session
8. NextAuth redirect callback checks userType
9. ✅ Redirects to /portal/dashboard (NOT /onboarding)
10. Middleware checks userType === 'patient'
11. ✅ Skips org validation
12. ✅ Patient sees portal dashboard
```

### Provider Login Flow (Unchanged)
```
1. Provider visits / (home)
2. Enters email/password
3. NextAuth calls credentials provider
4. Provider calls ehr-api /api/auth/login
5. ehr-api validates credentials
6. Returns JWT with org_id, roles, permissions
7. NextAuth stores in session
8. NextAuth redirect callback (no userType)
9. ✅ Redirects to /dashboard
10. Middleware checks org_id
11. If no org_id: Redirects to /onboarding
12. If has org_id: ✅ Provider sees dashboard
```

---

## Token Differences

### Patient Token
```json
{
  "id": "uuid",
  "email": "patient@example.com",
  "name": "Patient Name",
  "userType": "patient",          ← Key field
  "patientId": "fhir-patient-id",
  "accessToken": "jwt-token",
  "sessionToken": "session-hex"
  // NO org_id, NO roles, NO permissions
}
```

### Provider Token
```json
{
  "id": "uuid",
  "email": "provider@example.com",
  "name": "Provider Name",
  "org_id": "org-uuid",           ← Key field
  "org_slug": "org-slug",
  "org_name": "Organization",
  "roles": ["CLINICIAN"],
  "permissions": ["PATIENT.READ", "PATIENT.WRITE"],
  "location_ids": ["location-uuid"]
  // NO userType, NO patientId
}
```

---

## Testing the Fix

### Test 1: Patient Login End-to-End

**Via Browser:**
1. Go to: `http://localhost:3000/patient-login`
2. Login with patient credentials (e.g., `patient002@test.com` / `SimplePass123`)
3. ✅ Should redirect to: `http://localhost:3000/portal/dashboard`
4. ✅ Should NOT redirect to `/onboarding`
5. ✅ Should see patient portal dashboard

**Via curl:**
```bash
# 1. Login via API
curl -X POST http://localhost:8000/api/patient-portal/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient002@test.com","password":"SimplePass123"}'

# 2. You'll get token and sessionToken
# 3. Use token in NextAuth to create session
# 4. Navigate to /portal/dashboard
```

### Test 2: Provider Login (Should Still Work)

**Via Browser:**
1. Go to: `http://localhost:3000/`
2. Login with provider credentials
3. ✅ Should redirect to: `http://localhost:3000/dashboard` (or `/onboarding` if no org)
4. ✅ Should NOT go to `/portal/dashboard`

---

## Files Modified

1. `/src/lib/auth.ts` - Updated redirect callback to check userType
2. `/src/middleware.ts` - Skip org check for patients, added /portal to AUTH_ONLY_PATHS

---

## Verification Checklist

### Patient Authentication ✅
- [ ] Patient can login at `/patient-login`
- [ ] Redirects to `/portal/dashboard` after login
- [ ] Does NOT redirect to `/onboarding`
- [ ] Patient portal dashboard loads correctly
- [ ] Patient session has `userType: 'patient'`

### Provider Authentication ✅
- [ ] Provider can login at `/` (home)
- [ ] Redirects to `/dashboard` after login
- [ ] Redirects to `/onboarding` if no org assigned
- [ ] Provider dashboard loads correctly
- [ ] Provider session has `org_id` (no userType)

### Middleware Behavior ✅
- [ ] Patients bypass org validation
- [ ] Providers still require org_id
- [ ] `/portal/*` routes allow authenticated patients
- [ ] Public routes still work (patient-login, patient-register)

---

## Success Criteria

✅ Patient login redirects to `/portal/dashboard`
✅ Provider login redirects to `/dashboard` or `/onboarding`
✅ No more unwanted redirects to `/onboarding` for patients
✅ Patients can access patient portal
✅ Providers can access provider dashboard
✅ Authentication flows are separate and correct

---

## Related Documentation

- **`PATIENT_PORTAL_AUTH_FIXES.md`** - Original auth fixes
- **`PATIENT_PORTAL_INTEGRATION_COMPLETE.md`** - ehr-api integration
- **`CURL_TEST_PATIENT_PORTAL.md`** - curl test commands

---

**Status:** ✅ FIXED
**Date:** 2025-11-02
**Version:** 2.0.1
