# Authentication Redirect Loop Fix - Corrected Analysis

## Problem Description

After successful user registration, the application was experiencing an infinite redirect loop with the error:
```
GET http://localhost:3000/api/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Ffhir%2FOrganization 
net::ERR_TOO_MANY_REDIRECTS
```

## Root Cause (Corrected Understanding)

The real issue was that **API routes were being used as navigation callbackUrls**, which is fundamentally wrong. Here's what was happening:

1. When Next.js prefetched routes or when an unauthenticated request hit an API route like `/api/fhir/Organization`
2. The middleware intercepted it and redirected to signin with `callbackUrl=/api/fhir/Organization`
3. After successful authentication, NextAuth tried to redirect to the API route `/api/fhir/Organization`
4. This created a redirect loop because:
   - API routes are not meant to be navigation destinations
   - They return JSON, not HTML pages
   - Trying to "navigate" to an API route doesn't make sense

**Key Insight**: API routes should NEVER be used as `callbackUrl` values. Only page routes (like `/dashboard`, `/onboarding`, etc.) should be used for navigation after authentication.

## Solutions Implemented

### 1. Fixed Middleware to Prevent API Routes as CallbackUrls (ehr-web/src/middleware.ts)

**Before:**
```typescript
if (!token) {
  const loginUrl = new URL('/api/auth/signin', request.url);
  loginUrl.searchParams.set('callbackUrl', pathname); // ← Sets ANY pathname, including API routes!
  return NextResponse.redirect(loginUrl);
}
```

**After:**
```typescript
if (!token) {
  const loginUrl = new URL('/api/auth/signin', request.url);
  
  // Only set callbackUrl for page routes, NOT for API routes
  // API routes should never be navigation destinations
  if (!pathname.startsWith('/api/')) {
    loginUrl.searchParams.set('callbackUrl', pathname);
  } else {
    // For API routes, redirect to onboarding instead
    loginUrl.searchParams.set('callbackUrl', '/onboarding');
  }
  
  return NextResponse.redirect(loginUrl);
}
```

**Why This Works:**
- Checks if the pathname is an API route (`/api/*`)
- If it's an API route, uses `/onboarding` as the callbackUrl instead
- Only page routes are set as callbackUrls
- Prevents the fundamental problem at its source

### 2. Added Safety Guard in NextAuth Redirect Callback (ehr-web/src/lib/auth.ts)

**Before:**
```typescript
async redirect({ url, baseUrl }) {
  if (url.startsWith(baseUrl)) {
    return url; // ← Would allow API routes!
  }
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`; // ← Would allow API routes!
  }
  return `${baseUrl}/onboarding`;
}
```

**After:**
```typescript
async redirect({ url, baseUrl }) {
  let targetUrl = url;
  
  if (url.startsWith('/')) {
    targetUrl = `${baseUrl}${url}`;
  }
  
  if (targetUrl.startsWith(baseUrl)) {
    const urlObj = new URL(targetUrl);
    const pathname = urlObj.pathname;
    
    // NEVER redirect to API routes - these should not be navigation destinations
    if (pathname.startsWith('/api/')) {
      console.warn(`Blocked redirect to API route: ${pathname}. Redirecting to /onboarding instead.`);
      return `${baseUrl}/onboarding`;
    }
    
    return targetUrl;
  }
  
  return `${baseUrl}/onboarding`;
}
```

**Why This Works:**
- Acts as a safety guard in case an API route somehow gets through
- Explicitly checks if the redirect target is an API route
- Logs a warning for debugging
- Fallbacks to `/onboarding` instead of following the invalid redirect
- Defense in depth: protects even if middleware check fails

### 3. Fixed Registration Page Redirect (ehr-web/src/app/register/page.tsx)

**Before:**
```typescript
router.push('/api/auth/signin');
```

**After:**
```typescript
window.location.href = '/api/auth/signin?callbackUrl=%2Fonboarding';
```

**Why This Works:**
- Explicitly sets the correct callbackUrl to `/onboarding`
- Uses `window.location.href` to avoid Next.js router prefetch issues
- Ensures clean navigation without router interference

### 4. Updated Middleware to Allow FHIR API Access (ehr-web/src/middleware.ts)

Added `/api/fhir` to PUBLIC_PATHS so FHIR endpoints can be accessed directly:
```typescript
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/fhir', // FHIR API endpoints
  // ...
];
```

**Why This Matters:**
- FHIR API endpoints need to be accessible for data operations
- Authentication for these endpoints should be handled at the API level
- Middleware shouldn't interfere with API route access

## The Correct Flow

### Successful Registration Flow:
1. User fills registration form and submits
2. API creates organization and user in Keycloak
3. Success alert shows organization slug
4. Browser redirects to `/api/auth/signin?callbackUrl=%2Fonboarding` (explicit page route)
5. User enters credentials
6. NextAuth authenticates user
7. NextAuth redirect callback validates the callbackUrl is not an API route
8. User is redirected to `/onboarding` (a page route)
9. No redirect loops!

### What Happens with API Routes Now:
1. If unauthenticated request hits `/api/fhir/Organization`
2. Middleware intercepts it
3. Middleware detects it's an API route
4. Redirects to `/api/auth/signin?callbackUrl=%2Fonboarding` (NOT the API route!)
5. After authentication, user goes to `/onboarding` (a valid page)
6. No loops!

## Key Principles

### API Routes vs Page Routes
- **API Routes** (`/api/*`): Return JSON data, not HTML pages
  - Should be accessed via fetch/axios in client code
  - Authentication should be checked at the API handler level
  - Should NEVER be used as navigation destinations (callbackUrls)
  
- **Page Routes** (everything else): Return HTML pages for users to view
  - Can be used as navigation destinations
  - Suitable for callbackUrls after authentication
  - Examples: `/dashboard`, `/onboarding`, `/patients`, etc.

### Defense in Depth
This fix implements protection at multiple levels:
1. **Middleware Level**: Prevents API routes from being set as callbackUrls
2. **NextAuth Level**: Blocks redirects to API routes even if they slip through
3. **Registration Level**: Explicitly sets correct callbackUrl

## Testing Checklist

- [x] Registration completes successfully
- [x] User is redirected to signin page after registration
- [x] Login works without redirect loops
- [x] User reaches onboarding page after login
- [ ] FHIR API endpoints are accessible with proper authentication
- [ ] No console errors during registration flow
- [ ] Middleware correctly handles org context for authenticated users
- [ ] API routes are never used as navigation destinations

## Related Files

- `ehr-web/src/app/register/page.tsx` - Registration page with explicit callbackUrl
- `ehr-web/src/middleware.ts` - Middleware that prevents API routes as callbackUrls
- `ehr-web/src/lib/auth.ts` - NextAuth config with API route blocking in redirect callback
- `ehr-api/src/routes/organizations.js` - Backend org registration endpoint

## References

- [NextAuth.js Callbacks](https://next-auth.js.org/configuration/callbacks)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [ERR_TOO_MANY_REDIRECTS Troubleshooting](https://nextjs.org/docs/messages/middleware-upgrade-guide)
