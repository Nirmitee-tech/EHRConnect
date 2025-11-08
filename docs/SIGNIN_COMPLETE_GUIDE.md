# Complete Sign-In & Registration Guide

## Overview

The EHR system now has **adaptive authentication** that automatically switches between Postgres (email/password) and Keycloak (SSO) based on the `AUTH_PROVIDER` environment variable.

---

## ✅ How Sign-In Works Now

### Adaptive Sign-In Flow

The sign-in page **automatically detects** which authentication provider is configured and shows the appropriate UI:

```
User visits /auth/signin or clicks "Sign In"
  ↓
NextAuth checks AUTH_PROVIDER
  ↓
If AUTH_PROVIDER=postgres → Show email/password form
If AUTH_PROVIDER=keycloak → Show "Sign in with Keycloak" button
```

---

## Sign-In Pages

### 1. Landing Page (`/`)

**Features:**
- Detects if user is already authenticated → redirects to dashboard
- "Sign In" button → redirects to `/api/auth/signin` (NextAuth default) or custom `/auth/signin`
- "Register Your Organization" button → redirects to `/register`

**Code:**
```typescript
// Home page automatically adapts
const handleSignIn = async () => {
  signIn(); // NextAuth automatically uses configured provider
};
```

### 2. Custom Sign-In Page (`/auth/signin/page.tsx`)

**Created:** ✅ **NEW**

**Features:**
- ✅ Detects auth provider automatically using `getProviders()`
- ✅ Shows email/password form for Postgres mode
- ✅ Shows "Sign in with Keycloak" button for Keycloak mode
- ✅ Displays error messages from URL params
- ✅ Remembers callback URL for post-login redirect
- ✅ Beautiful, responsive design

**UI States:**

| Auth Provider | UI Shown |
|---------------|----------|
| `postgres` | Email/password form with "Forgot password?" link |
| `keycloak` | "Sign in with Keycloak" button |
| `loading` | Loading spinner |
| `unknown` | Configuration error message |

---

## Postgres Authentication (Email/Password)

### Sign-In Flow

```
1. User enters email & password
   ↓
2. Frontend calls signIn('credentials', { email, password })
   ↓
3. NextAuth calls CredentialsProvider authorize()
   ↓
4. Backend POST /api/auth/login
   ↓
5. Verify password with bcrypt
   ↓
6. Generate JWT token (24h expiry)
   ↓
7. Return user data + token
   ↓
8. NextAuth creates session
   ↓
9. Redirect to dashboard
```

### Sign-In Page Code

```typescript
// /auth/signin/page.tsx
const handleCredentialsSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    setError('Invalid email or password');
  } else if (result?.ok) {
    window.location.href = callbackUrl;
  }
};
```

### Backend Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "org_id": "org-uuid",
    "org_name": "Test Clinic",
    "org_slug": "test-clinic",
    "onboarding_completed": false,
    "scope": "ORG",
    "location_ids": [],
    "roles": ["ORG_ADMIN"],
    "permissions": ["org:read", "org:edit", ...]
  },
  "token": "eyJhbGc..."
}
```

---

## Keycloak Authentication (SSO)

### Sign-In Flow

```
1. User clicks "Sign in with Keycloak"
   ↓
2. Frontend calls signIn('keycloak')
   ↓
3. Redirect to Keycloak login page
   ↓
4. User authenticates with Keycloak
   ↓
5. Keycloak redirects back with OAuth2 code
   ↓
6. NextAuth exchanges code for tokens
   ↓
7. NextAuth creates session with Keycloak data
   ↓
8. Redirect to dashboard
```

### Sign-In Page Code

```typescript
// /auth/signin/page.tsx
const handleKeycloakSignIn = () => {
  signIn('keycloak', { callbackUrl });
};
```

---

## Registration with All Fields ✅ FIXED

### Problem You Identified

❌ **Before:** Registration only saved `name` and `slug`
✅ **After:** Registration now saves ALL fields:

- `legal_name`
- `contact_phone`
- `address` (full object)
- `timezone`
- `terms_accepted`
- `baa_accepted`

### Updated Registration Flow

```
User fills 4-step form
  ↓
Frontend sends ALL fields to /api/auth/register
  ↓
Backend creates organization with:
  - name, slug, legal_name
  - contact_phone, contact_email
  - address (JSONB)
  - timezone
  - metadata {terms_accepted, baa_accepted, registration_source}
  ↓
Backend creates user with password_hash
  ↓
Backend assigns ORG_ADMIN role
  ↓
User redirected to sign-in
```

### Registration Request (Complete)

```json
{
  "email": "admin@clinic.com",
  "password": "SecurePass123!",
  "name": "Dr. Admin",
  "organization": {
    "name": "My Clinic",
    "slug": "my-clinic",
    "legal_name": "My Clinic LLC",           // ✅ NOW SAVED
    "contact_phone": "+1 555-123-4567",      // ✅ NOW SAVED
    "address": {                             // ✅ NOW SAVED
      "line1": "123 Main St",
      "line2": "Suite 100",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94102",
      "country": "USA"
    },
    "timezone": "America/Los_Angeles",       // ✅ NOW SAVED
    "terms_accepted": true,                  // ✅ NOW SAVED
    "baa_accepted": true                     // ✅ NOW SAVED
  }
}
```

### Database Storage

**organizations table:**
```sql
INSERT INTO organizations (
  name,                    -- 'My Clinic'
  slug,                    -- 'my-clinic'
  legal_name,              -- 'My Clinic LLC' ✅
  contact_email,           -- 'admin@clinic.com'
  contact_phone,           -- '+1 555-123-4567' ✅
  address,                 -- JSONB full address ✅
  timezone,                -- 'America/Los_Angeles' ✅
  status,                  -- 'active'
  created_by,              -- user_id
  onboarding_completed,    -- false
  metadata                 -- JSONB with terms/baa ✅
) VALUES (...);
```

**metadata JSONB:**
```json
{
  "terms_accepted": true,
  "baa_accepted": true,
  "registration_source": "self_registration"
}
```

---

## Testing

### Test Complete Registration

```bash
# Register with ALL fields
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User",
    "organization": {
      "name": "Test Org",
      "slug": "test-org",
      "legal_name": "Test Org LLC",
      "contact_phone": "+1 555-999-8888",
      "address": {
        "line1": "456 Test Ave",
        "city": "Test City",
        "state": "TS",
        "postal_code": "12345",
        "country": "USA"
      },
      "timezone": "America/New_York",
      "terms_accepted": true,
      "baa_accepted": true
    }
  }'

# Verify organization data was saved
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c \
  "SELECT name, legal_name, contact_phone, address, timezone, metadata
   FROM organizations
   WHERE slug = 'test-org';"

# Expected: All fields populated ✅
```

### Test Sign-In (Postgres Mode)

```bash
# Via API
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Via Web UI
# 1. Navigate to http://localhost:3000
# 2. Click "Sign In"
# 3. Enter email: test@example.com
# 4. Enter password: TestPass123!
# 5. Click "Sign In"
# 6. Redirected to dashboard ✅
```

### Test Sign-In (Keycloak Mode)

```bash
# 1. Update .env files
#    AUTH_PROVIDER=keycloak

# 2. Start Keycloak
docker-compose up -d keycloak

# 3. Restart services
# API and web app

# 4. Navigate to http://localhost:3000
# 5. Click "Sign In"
# 6. Click "Sign in with Keycloak"
# 7. Redirected to Keycloak login
# 8. Enter Keycloak credentials
# 9. Redirected back to dashboard ✅
```

---

## UI Features

### Sign-In Page Features

✅ **Adaptive UI** - Automatically shows correct form based on provider
✅ **Error Handling** - Clear error messages from URL params
✅ **Loading States** - Shows loading spinner during authentication
✅ **Callback URL** - Remembers where user wanted to go
✅ **Forgot Password** - Link for password reset (Postgres mode)
✅ **Register Link** - Directs to registration page
✅ **Test Account Info** - Shows test credentials for development
✅ **Beautiful Design** - Gradient backgrounds, shadow effects

### Registration Page Features

✅ **4-Step Wizard** - Organization → Account → Location → Compliance
✅ **Real-time Validation** - Instant feedback on field errors
✅ **Password Strength** - Visual indicator and requirements
✅ **Live Preview** - Organization card updates as you type
✅ **Progress Tracking** - Visual progress through steps
✅ **Terms & Conditions** - HIPAA/BAA acceptance
✅ **All Fields Saved** - Legal name, phone, address, timezone, terms

---

## Configuration

### Environment Variables

**ehr-api/.env:**
```bash
# Set authentication provider
AUTH_PROVIDER=postgres  # or 'keycloak'

# Required for postgres mode
JWT_SECRET=your-secret-key-min-32-characters

# Required for keycloak mode
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=ehr-realm
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
```

**ehr-web/.env.local:**
```bash
# Set authentication provider
AUTH_PROVIDER=postgres  # or 'keycloak'

# Required for postgres mode
NEXT_PUBLIC_API_URL=http://localhost:8000

# Required for keycloak mode
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=ehr-realm
KEYCLOAK_CLIENT_ID=nextjs-client
KEYCLOAK_CLIENT_SECRET=nextjs-secret-key
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
```

### NextAuth Configuration

**src/lib/auth.ts:**
```typescript
// Automatically selects provider based on AUTH_PROVIDER
const AUTH_PROVIDER = process.env.AUTH_PROVIDER || 'keycloak'

const providers = []

if (AUTH_PROVIDER === 'postgres') {
  providers.push(CredentialsProvider({ ... }))
} else if (AUTH_PROVIDER === 'keycloak') {
  providers.push(KeycloakProvider({ ... }))
}

export const authOptions: NextAuthOptions = {
  providers,
  // ... callbacks handle both providers
}
```

---

## Switching Between Providers

### From Postgres to Keycloak

1. Stop services
2. Update `.env` files: `AUTH_PROVIDER=keycloak`
3. Start Keycloak: `docker-compose up -d keycloak`
4. Restart API and web app
5. Sign-in page automatically shows Keycloak button

### From Keycloak to Postgres

1. Stop services
2. Update `.env` files: `AUTH_PROVIDER=postgres`
3. Stop Keycloak: `docker-compose stop keycloak`
4. Restart API and web app
5. Sign-in page automatically shows email/password form

**No code changes needed!** ✅

---

## Security

### Postgres Mode
- ✅ Passwords hashed with bcrypt (cost 10)
- ✅ JWT tokens expire after 24 hours
- ✅ CSRF protection via NextAuth
- ✅ Secure session cookies
- ✅ Password validation (8+ chars, uppercase, lowercase, numbers)

### Keycloak Mode
- ✅ OAuth2/OIDC standard
- ✅ MFA/2FA support
- ✅ Session management by Keycloak
- ✅ Advanced security features
- ✅ Social login integration

---

## Troubleshooting

### Sign-In Page Shows "Configuration Error"

**Cause:** No auth provider configured or both configured

**Solution:**
1. Check `AUTH_PROVIDER` in `.env` files
2. Ensure only ONE provider is configured
3. Restart services

### "Invalid email or password" Error

**Postgres Mode:**
- Check user exists: `SELECT email FROM users WHERE email = '...'`
- Check password_hash exists: `SELECT password_hash FROM users WHERE email = '...'`
- Check user status: `SELECT status FROM users WHERE email = '...'` (should be 'active')

**Keycloak Mode:**
- Check user exists in Keycloak admin console
- Verify Keycloak realm and client configuration

### Registration Succeeds But Data Missing

**Check database:**
```sql
-- Check organization data
SELECT name, legal_name, contact_phone, address, timezone, metadata
FROM organizations
WHERE slug = 'your-org-slug';

-- All fields should be populated ✅
```

### Sign-In Button Does Nothing

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. API server is running: `curl http://localhost:8000/health`
4. NextAuth configuration is valid

---

## Summary

✅ **Sign-in works** for both Postgres and Keycloak
✅ **Adaptive UI** shows correct form automatically
✅ **Registration saves ALL fields** (legal_name, phone, address, timezone, terms)
✅ **No code changes needed** to switch providers
✅ **Beautiful, responsive design** for both pages
✅ **Comprehensive error handling** with clear messages
✅ **Session management** consistent across both modes

**You can now:**
1. Register with complete organization details
2. Sign in with email/password (Postgres mode)
3. Sign in with Keycloak SSO (Keycloak mode)
4. Switch providers by changing environment variable
5. All data persists correctly in database

**Sign-in and registration are production-ready!** 🎉
