# Session Size Optimization - Fixing "431 Request Header Fields Too Large"

## Problem

After login/registration, users were experiencing a **"431 Request Header Fields Too Large"** error that caused the entire site to crash. This error occurs when the HTTP request headers exceed the server's configured limit.

### Root Cause

NextAuth stores session data in JWT tokens, which are stored in cookies and sent with every HTTP request. When the session contains large arrays (permissions, roles, location_ids, org_specialties), the JWT token becomes too large, causing:

1. **Cookie size exceeds browser limits** (typically 4KB per cookie)
2. **HTTP header size exceeds server limits** (typically 8KB-16KB total)
3. **431 error** is returned, breaking the entire application

## Solution

We implemented a multi-layered optimization strategy:

### 1. **JWT Token Optimization** (`/src/lib/auth.ts`)

Limited data stored in JWT tokens:

```typescript
// BEFORE (Problematic)
token.roles = profile.realm_access?.roles || [] // Could be 100+ roles
token.permissions = profileWithClaims.permissions // Could be 500+ permissions
token.location_ids = profileWithClaims.location_ids // Could be 50+ locations

// AFTER (Optimized)
token.roles = roles.slice(0, 10) // Limit to 10 roles
token.permissions = permissions.slice(0, 20) // Limit to 20 permissions
token.location_ids = locationIds.slice(0, 10) // Limit to 10 locations
```

#### What was removed/limited:
- ❌ **refreshToken** - Removed (not needed in JWT)
- ❌ **idToken** - Removed (not needed in JWT)
- ❌ **org_logo** - Removed (fetch from API when needed)
- ⚠️ **roles** - Limited to first 10 (was unlimited)
- ⚠️ **permissions** - Limited to first 20 (was unlimited)
- ⚠️ **location_ids** - Limited to first 10 (was unlimited)
- ⚠️ **org_specialties** - Limited to first 5 (was unlimited)

### 2. **Session Optimization** (`/src/lib/auth.ts`)

Further reduced what goes into the session object:

```typescript
// BEFORE (Problematic)
session.roles = token.roles as string[] // All roles
session.permissions = token.permissions as string[] // All permissions
session.location_ids = token.location_ids as string[]
session.org_logo = token.org_logo as string

// AFTER (Optimized)
session.roles = roles.slice(0, 3) // Only first 3 roles
// permissions - NOT in session (fetch from API)
// location_ids - NOT in session (fetch from API)
// org_logo - NOT in session (fetch from API)
```

#### What's in the session:
- ✅ **user.id** - User ID (essential)
- ✅ **user.name** - User name
- ✅ **user.email** - User email
- ✅ **accessToken** - API access token
- ✅ **org_id** - Organization ID (essential)
- ✅ **org_slug** - Organization slug
- ✅ **org_name** - Organization name
- ✅ **onboarding_completed** - Onboarding status
- ✅ **scope** - Permission scope
- ✅ **roles** - First 3 roles only

### 3. **API Endpoint for Full Profile** (`/src/app/api/auth/me/route.ts`)

Created endpoint to fetch complete user data when needed:

```typescript
// GET /api/auth/me
// Returns:
// - All permissions (not limited to 20)
// - All roles (not limited to 10)
// - All location_ids (not limited to 10)
// - Organization logo URL
// - All org specialties
```

### 4. **Custom React Hook** (`/src/hooks/useFullProfile.ts`)

Easy-to-use hook for accessing full user data:

```tsx
import { useFullProfile } from '@/hooks/useFullProfile';

function MyComponent() {
  const { fullProfile, loading, error } = useFullProfile();

  if (loading) return <div>Loading...</div>;

  // Access full data
  console.log(fullProfile.permissions); // All permissions
  console.log(fullProfile.roles); // All roles
  console.log(fullProfile.org_logo); // Organization logo
}
```

## Usage Guidelines

### When to use `useSession()`:

Use NextAuth's `useSession()` for:
- ✅ Checking if user is authenticated
- ✅ Getting basic user info (id, name, email)
- ✅ Getting org_id, org_slug, org_name
- ✅ Checking onboarding status
- ✅ Getting first 3 roles
- ✅ Getting access token

```tsx
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Please sign in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### When to use `useFullProfile()`:

Use `useFullProfile()` for:
- ✅ Checking specific permissions (beyond first 20)
- ✅ Getting all user roles (beyond first 3)
- ✅ Getting organization logo
- ✅ Getting all location IDs
- ✅ Getting all org specialties
- ✅ Any other data not in session

```tsx
import { useFullProfile, usePermission } from '@/hooks/useFullProfile';

function MyComponent() {
  const { fullProfile, loading } = useFullProfile();
  const canWritePatients = usePermission('patients:write');

  if (loading) return <div>Loading...</div>;

  if (!canWritePatients) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <img src={fullProfile.org_logo} alt="Logo" />
      <p>You have {fullProfile.permissions.length} permissions</p>
    </div>
  );
}
```

## Migration Guide

If your code was using session data that's no longer available, update it:

### Example 1: Organization Logo

```tsx
// BEFORE (Broken)
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
<img src={session.org_logo} /> // ❌ org_logo not in session

// AFTER (Fixed)
import { useFullProfile } from '@/hooks/useFullProfile';
const { fullProfile } = useFullProfile();
<img src={fullProfile?.org_logo} /> // ✅ Fetched from API
```

### Example 2: Checking Permissions

```tsx
// BEFORE (Incomplete)
const { data: session } = useSession();
const hasPermission = session.permissions?.includes('patients:write');
// ❌ Only checks first 20 permissions

// AFTER (Complete)
import { usePermission } from '@/hooks/useFullProfile';
const hasPermission = usePermission('patients:write');
// ✅ Checks all permissions
```

### Example 3: Getting All Roles

```tsx
// BEFORE (Incomplete)
const { data: session } = useSession();
const roles = session.roles; // ❌ Only first 3 roles

// AFTER (Complete)
import { useFullProfile } from '@/hooks/useFullProfile';
const { fullProfile } = useFullProfile();
const roles = fullProfile?.roles; // ✅ All roles
```

## Performance Considerations

### Session Access (Fast ⚡)
- **No API call** - Data from JWT cookie
- **Immediate** - Available on page load
- **Use for**: Authentication checks, basic user info

### Full Profile Access (Slower 🐢)
- **API call required** - Fetches from backend
- **~100-300ms delay** - Network request
- **Use for**: Detailed permission checks, complete data

### Optimization Tips

1. **Use session first**:
   ```tsx
   const { data: session } = useSession();
   if (!session) return <LoginPrompt />;
   // Session check is instant
   ```

2. **Lazy load full profile**:
   ```tsx
   const { fullProfile } = useFullProfile({ autoFetch: false });
   // Only fetch when needed
   <button onClick={refetch}>Load Details</button>
   ```

3. **Cache full profile**:
   ```tsx
   // Full profile is cached after first fetch
   // Subsequent component renders don't refetch
   ```

## Testing

### Before Deploying

Test with accounts that have:
1. ✅ **Many permissions** (100+ permissions)
2. ✅ **Many roles** (20+ roles)
3. ✅ **Many locations** (50+ location IDs)
4. ✅ **Long specialties list** (10+ specialties)

### Expected Behavior

- ✅ Login succeeds without 431 error
- ✅ Session loads immediately
- ✅ Full profile loads within 300ms
- ✅ All permissions available via `useFullProfile()`
- ✅ Site remains functional after login

## Monitoring

Watch for these metrics:
- **Session cookie size**: Should be < 4KB
- **Total header size**: Should be < 8KB
- **API response time**: `/api/auth/me` should be < 300ms
- **Error rate**: 431 errors should be 0%

## Related Files

- `/src/lib/auth.ts` - JWT and session configuration
- `/src/app/api/auth/me/route.ts` - Full profile API endpoint
- `/src/hooks/useFullProfile.ts` - React hooks for profile access
- `/src/types/next-auth.d.ts` - TypeScript session types

## Further Reading

- [NextAuth JWT Strategy](https://next-auth.js.org/configuration/options#jwt)
- [HTTP 431 Error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/431)
- [Cookie Size Limits](https://stackoverflow.com/questions/640938/what-is-the-maximum-size-of-a-web-browsers-cookies-key)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## Support

If you continue to experience 431 errors:
1. Check session size: `document.cookie.length` in browser console
2. Verify JWT size: Check `next-auth.session-token` cookie
3. Review backend API: Check `/api/auth/me` response size
4. Contact DevOps: May need to increase server header limits (temporary fix)
