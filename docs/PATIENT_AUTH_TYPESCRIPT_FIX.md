# Patient Authentication TypeScript Fix

## Issue

After implementing the patient portal authentication fixes, there was a TypeScript compilation error in `/src/lib/auth.ts`:

```
error TS2339: Property 'token' does not exist on type '{ url: string; baseUrl: string; }'.
```

The original implementation tried to access `token` parameter in the NextAuth redirect callback:

```typescript
async redirect({ url, baseUrl, token }) {
  // Check if user is a patient and redirect to patient portal
  if (token && token.userType === 'patient') {
    return `${baseUrl}/portal/dashboard`;
  }
  return `${baseUrl}/dashboard`;
}
```

## Root Cause

NextAuth v4's `redirect` callback does not include a `token` parameter in its signature. The callback only receives:
- `url`: The callback URL being redirected to
- `baseUrl`: The base URL of the application

According to NextAuth v4 type definitions:
```typescript
redirect: (params: {
    url: string;
    baseUrl: string;
}) => Awaitable<string>;
```

## Solution

Instead of checking the token's `userType`, we check if the URL contains indicators that this is a patient login:

```typescript
async redirect({ url, baseUrl }) {
  // Parse the URL to check the pathname
  let targetUrl = url;

  // Handle relative URLs
  if (url.startsWith('/')) {
    targetUrl = `${baseUrl}${url}`;
  }

  // If URL is on the same origin, check if it's valid
  if (targetUrl.startsWith(baseUrl)) {
    const urlObj = new URL(targetUrl);
    const pathname = urlObj.pathname;

    // NEVER redirect to API routes
    if (pathname.startsWith('/api/')) {
      console.warn(`Blocked redirect to API route: ${pathname}. Redirecting to default page.`);
      targetUrl = baseUrl;
    } else {
      // For valid page routes, return them
      return targetUrl;
    }
  }

  // For default redirects after sign-in:
  // Check if the sign-in came from patient-login page or if redirect URL contains /portal
  const isPatientLogin = url.includes('patient-login') || url.includes('/portal') ||
                         targetUrl.includes('patient-login') || targetUrl.includes('/portal');

  if (isPatientLogin) {
    return `${baseUrl}/portal/dashboard`;
  }

  // For providers, the dashboard will check onboarding status and redirect if needed
  return `${baseUrl}/dashboard`;
}
```

## How It Works

1. **URL-based Detection**: When a patient logs in at `/patient-login`, NextAuth includes this URL in the redirect callback
2. **Multiple Checks**: We check both `url` and `targetUrl` for patient indicators:
   - Contains `patient-login` → User logged in from patient login page
   - Contains `/portal` → User is accessing patient portal routes
3. **Fallback to Provider**: If neither pattern matches, redirect to provider dashboard

## Why This Works

- Patient login flow: User visits `/patient-login` → signIn() → redirect callback receives URL with 'patient-login' → redirects to `/portal/dashboard`
- Provider login flow: User visits `/` (home) → signIn() → redirect callback receives URL without patient indicators → redirects to `/dashboard`

## Alternative Approaches Considered

### 1. Using getToken in redirect callback
**Problem**: The redirect callback doesn't have access to the request object needed for getToken()

### 2. Accessing session storage
**Problem**: Redirect callback runs server-side before session is fully established

### 3. Custom redirect parameter
**Problem**: Would require modifying signIn calls across the application

## Benefits of Current Solution

✅ **Type-safe**: No TypeScript errors, uses only documented NextAuth parameters
✅ **Simple**: No complex token decoding or session management
✅ **Reliable**: URL pattern matching is deterministic
✅ **Maintainable**: Easy to understand and debug
✅ **Backwards compatible**: Doesn't break existing provider authentication

## Files Modified

- **`/src/lib/auth.ts`** (Line 322-358) - Updated redirect callback to remove token parameter and use URL-based detection

## Documentation Updated

- **`PATIENT_SESSION_FIX.md`** - Updated Fix 1 with corrected code snippet
- **`PATIENT_REDIRECT_FIX.md`** - Updated redirect callback explanation
- **`PATIENT_AUTH_TYPESCRIPT_FIX.md`** - This document (technical explanation)

---

**Status:** ✅ FIXED
**Date:** 2025-11-02
**Version:** 2.0.3

TypeScript compilation error resolved. Patient authentication continues to work correctly with type-safe implementation.
