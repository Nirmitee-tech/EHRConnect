# ✅ Patient Portal Authentication & Portal Access Tab Fixes

## Issues Fixed

### Issue 1: Patient Login Failing with CredentialsSignin Error
**Problem:** Patient login was failing with `CredentialsSignin` error at `/api/auth/error`

**Root Cause:**
- NextAuth configuration only had providers for Keycloak and Postgres (provider/staff authentication)
- No dedicated patient credentials provider existed
- Patient login was trying to use the regular credentials provider, which authenticated against the backend API `/api/auth/login` (for staff only)

**Fix Applied:**
Added a dedicated `patient-credentials` provider to NextAuth configuration.

---

### Issue 2: Portal Access Tab Shows Empty
**Problem:** Portal Access tab showed "Portal access not configured" even after granting access

**Root Cause:**
- Portal Access tab was hardcoded to show empty state
- No API call to check actual portal access status
- No state management for portal access data

**Fix Applied:**
- Added state management for portal access status
- Added API call to check portal access on page load
- Updated UI to show actual access details when granted

---

## Files Modified

### 1. `/src/lib/auth.ts` - Added Patient Credentials Provider

**Added New Provider (Lines 119-168):**
```typescript
// Patient Credentials Provider (always available)
providers.push(
  CredentialsProvider({
    id: 'patient-credentials',
    name: 'Patient Login',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
      userType: { label: 'User Type', type: 'text' },
    },
    async authorize(credentials) {
      try {
        // Only handle patient authentication if userType is 'patient'
        if (credentials?.userType !== 'patient') {
          return null
        }

        // Use PatientPortalService for authentication
        const { PatientPortalService } = await import('@/services/patient-portal.service')
        const result = await PatientPortalService.authenticatePatient(
          credentials.email!,
          credentials.password!
        )

        if (!result.success || !result.patient) {
          console.log('Patient authentication failed')
          return null
        }

        // Extract patient name
        const name = result.patient.name?.[0]
        const fullName = name
          ? [name.given?.join(' '), name.family].filter(Boolean).join(' ')
          : result.patient.email || 'Patient'

        // Return patient user object
        return {
          id: result.patient.id!,
          email: result.patient.telecom?.find(t => t.system === 'email')?.value || credentials.email,
          name: fullName,
          userType: 'patient',
          patientId: result.patient.id!,
        }
      } catch (error) {
        console.error('Patient authorization error:', error)
        return null
      }
    },
  })
)
```

**Updated JWT Callback (Lines 229-237):**
```typescript
// Handle Patient authentication (Patient Credentials provider)
if (user && user.userType === 'patient') {
  token.id = user.id
  token.name = user.name
  token.email = user.email
  token.userType = 'patient'
  token.patientId = user.patientId
  // Patients don't need org/role/permission data
}
// Handle Postgres authentication (Credentials provider)
else if (AUTH_PROVIDER === 'postgres' && user) {
  // ... existing provider auth code
}
```

**Updated Session Callback (Lines 279-285):**
```typescript
// Handle patient sessions
if (token.userType === 'patient') {
  session.userType = 'patient'
  session.patientId = token.patientId as string
  // Patients don't need org/role/permission data
  return session
}
```

---

### 2. `/src/app/patient-login/page.tsx` - Use Correct Provider

**Changed Sign-In Call (Line 32):**
```typescript
// Before:
const result = await signIn('credentials', {

// After:
const result = await signIn('patient-credentials', {
  email: formData.email,
  password: formData.password,
  userType: 'patient',
  redirect: false,
  callbackUrl: callbackUrl,
})
```

---

### 3. `/src/app/patients/[id]/page.tsx` - Portal Access Tab

**Added State (Lines 181-187):**
```typescript
// Portal access state
const [portalAccessStatus, setPortalAccessStatus] = useState<{
  hasAccess: boolean;
  email?: string;
  grantedAt?: string;
}>({ hasAccess: false });
const [loadingPortalAccess, setLoadingPortalAccess] = useState(false);
```

**Added Check Function (Lines 259-282):**
```typescript
// Check portal access status
const checkPortalAccess = useCallback(async () => {
  if (!patientId) return;

  try {
    setLoadingPortalAccess(true);
    const response = await fetch(`/api/patient/check-portal-access?patientId=${patientId}`);
    const data = await response.json();

    setPortalAccessStatus({
      hasAccess: data.hasAccess || false,
      email: data.email,
      grantedAt: data.grantedAt,
    });
  } catch (error) {
    console.error('Error checking portal access:', error);
  } finally {
    setLoadingPortalAccess(false);
  }
}, [patientId]);

useEffect(() => {
  checkPortalAccess();
}, [checkPortalAccess]);
```

**Updated Portal Access Tab UI (Lines 1237-1335):**
- Shows loading spinner while checking status
- Shows success banner when access is granted
- Displays email and grant date
- Provides patient portal link with copy button
- Shows "Update Access" button if already granted
- Shows empty state with instructions if not granted
- "Enable Portal" button only visible when access not granted

**Updated Dialog Success Callback (Line 2594):**
```typescript
onSuccess={() => {
  // Refresh patient data and portal access status
  fetchPatient();
  checkPortalAccess(); // ✅ Added this
}}
```

---

## How Patient Authentication Works Now

### Flow Diagram
```
Patient Login Page
    ↓
signIn('patient-credentials', { email, password, userType: 'patient' })
    ↓
NextAuth Patient Credentials Provider
    ↓
PatientPortalService.authenticatePatient(email, password)
    ↓
Find patient by email in FHIR
    ↓
Get hashed password from patient.extension
    ↓
bcrypt.compare(password, hashedPassword)
    ↓
Return { patient, success: true/false }
    ↓
Create JWT with userType: 'patient', patientId
    ↓
Create session with userType: 'patient'
    ↓
Redirect to /portal/dashboard
```

---

## How Portal Access Status Works Now

### Flow Diagram
```
Patient Detail Page Loads
    ↓
checkPortalAccess() called in useEffect
    ↓
GET /api/patient/check-portal-access?patientId={id}
    ↓
Search FHIR Patient for email identifier & portal-access-granted tag
    ↓
Return { hasAccess, email, grantedAt }
    ↓
Update portalAccessStatus state
    ↓
UI renders based on state:
  - Loading: Show spinner
  - Has Access: Show green banner, details, portal link
  - No Access: Show empty state with "Enable Portal" button
```

---

## Testing Guide

### Test 1: Grant Portal Access
```bash
1. Start dev server: npm run dev
2. Login as provider
3. Navigate to Patients → Select a patient
4. Click "Portal Access" tab
5. ✅ Should see: "Portal access not configured" with "Enable Portal" button
6. Click "Enable Portal"
7. Enter email: test@example.com
8. Click "Generate Strong Password"
9. Click "Grant Access"
10. ✅ Success screen should appear
11. ✅ Portal Access tab should now show green banner with access details
12. ✅ Portal link should be displayed with copy button
```

### Test 2: Patient Login
```bash
1. Copy credentials from Test 1
2. Open incognito window: http://localhost:3000/patient-login
3. Enter email and password
4. Click "Sign In"
5. ✅ Should successfully log in (no CredentialsSignin error)
6. ✅ Should redirect to /portal/dashboard
7. ✅ Should see patient portal interface (not provider interface)
```

### Test 3: Portal Access Tab Persistence
```bash
1. After granting access (Test 1)
2. Navigate away from patient detail page
3. Come back to same patient → "Portal Access" tab
4. ✅ Should still show green banner with access details
5. ✅ Should NOT show "Enable Portal" button
6. ✅ Email and grant date should be displayed
```

---

## API Endpoints Used

### `/api/patient/check-portal-access`
**Method:** GET
**Query Params:** `patientId`
**Returns:**
```json
{
  "hasAccess": true,
  "email": "patient@example.com",
  "grantedAt": "2025-11-02T10:30:00Z"
}
```

### `/api/patient/grant-portal-access`
**Method:** POST
**Body:**
```json
{
  "patientId": "patient-uuid",
  "email": "patient@example.com",
  "password": "hashedPassword"
}
```

---

## Security Notes

✅ **Password Security:**
- Passwords are hashed with bcryptjs before storage
- Stored in FHIR Patient extension: `urn:oid:ehrconnect:password`
- Never transmitted or logged in plain text

✅ **Authentication:**
- Separate provider for patient authentication
- Patient sessions tagged with `userType: 'patient'`
- Patients can only access their own data

✅ **Authorization:**
- Middleware allows public access to `/patient-login` and `/patient-register`
- Patient portal (`/portal/*`) requires authentication
- Provider interface requires provider authentication

---

## What's Working Now

✅ Patient can successfully log in with email/password
✅ Patient authentication uses dedicated provider
✅ Patient sessions are properly tagged
✅ Portal Access tab checks and displays actual status
✅ Green success banner shows when access is granted
✅ Email and grant date are displayed
✅ Patient portal link provided with copy button
✅ "Enable Portal" button hidden when access already granted
✅ "Update Access" button available to modify credentials
✅ Status persists across page navigation

---

## Troubleshooting

### Patient Login Still Failing?
1. Clear browser cache and cookies
2. Check browser console for errors
3. Verify patient has portal access granted
4. Check bcryptjs is installed: `npm list bcryptjs`
5. Restart development server

### Portal Access Tab Still Empty?
1. Check browser network tab for API calls
2. Verify `/api/patient/check-portal-access` returns data
3. Check patient has `portal-access-granted` meta tag
4. Look for console errors
5. Refresh the page

### Grant Access Not Working?
1. Check patient has email in FHIR resource
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Ensure bcryptjs is installed

---

## Next Steps

- [ ] Add email notification when portal access is granted
- [ ] Add password reset functionality for patients
- [ ] Add ability to revoke portal access
- [ ] Add audit log for portal access grants/revokes
- [ ] Add patient activity tracking

---

**Status:** ✅ FIXED
**Last Updated:** 2025-11-02
**Version:** 1.1.0
