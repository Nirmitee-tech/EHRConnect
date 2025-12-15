# Dual Authentication System - Setup Guide

This EHR system supports **two authentication providers** that can be seamlessly switched using a single environment variable:

1. **Postgres Authentication** - Simple email/password authentication stored in PostgreSQL
2. **Keycloak Authentication** - Enterprise SSO with OAuth2/OIDC

## Quick Start

### Switch Authentication Provider

Change the `AUTH_PROVIDER` environment variable in both `.env` files:

```bash
# For Postgres authentication (email/password)
AUTH_PROVIDER=postgres

# For Keycloak authentication (SSO)
AUTH_PROVIDER=keycloak
```

**Required files to update:**
- `/ehr-api/.env` - Backend authentication provider
- `/ehr-web/.env.local` - Frontend authentication provider

## Configuration Guide

### Option 1: Postgres Authentication (Recommended for Development)

**Advantages:**
- Simple setup, no external services required
- Fast development iteration
- Direct password management
- No Keycloak dependency

**Setup Steps:**

1. **Set environment variables**

   Edit `ehr-api/.env`:
   ```env
   AUTH_PROVIDER=postgres
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   ```

   Edit `ehr-web/.env.local`:
   ```env
   AUTH_PROVIDER=postgres
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=3tsL8bYQkYyQVwnwSYc2DvF3+fYYRfAf3Bh40dN6Ztk=
   ```

2. **Run database migration**

   ```bash
   cd ehr-api
   PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -f src/database/migrations/010_add_password_auth.sql
   ```

3. **Restart services**

   ```bash
   # Restart API
   cd ehr-api
   npm run dev

   # Restart Web App (in a new terminal)
   cd ehr-web
   npm run dev
   ```

4. **Create test user with password**

   ```bash
   # Option A: Using API endpoint
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "SecurePass123!",
       "name": "Admin User",
       "organization": {
         "name": "Test Clinic",
         "slug": "test-clinic"
       }
     }'

   # Option B: Direct SQL (for existing users)
   PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c "
   UPDATE users
   SET password_hash = crypt('YourPassword123!', gen_salt('bf'))
   WHERE email = 'existing@example.com';"
   ```

5. **Login**
   - Navigate to `http://localhost:3000`
   - Use email/password to sign in
   - System will use NextAuth Credentials provider

**API Endpoints (Postgres Mode):**
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/provider` - Get current auth provider

---

### Option 2: Keycloak Authentication (Recommended for Production)

**Advantages:**
- Enterprise-grade SSO
- Multi-factor authentication
- Advanced security features
- Social login integration
- Centralized user management

**Setup Steps:**

1. **Set environment variables**

   Edit `ehr-api/.env`:
   ```env
   AUTH_PROVIDER=keycloak
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=ehr-realm
   KEYCLOAK_ADMIN_USER=admin
   KEYCLOAK_ADMIN_PASSWORD=admin123
   KEYCLOAK_CLIENT_ID=admin-cli
   ```

   Edit `ehr-web/.env.local`:
   ```env
   AUTH_PROVIDER=keycloak
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=ehr-realm
   KEYCLOAK_CLIENT_ID=nextjs-client
   KEYCLOAK_CLIENT_SECRET=nextjs-secret-key
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=3tsL8bYQkYyQVwnwSYc2DvF3+fYYRfAf3Bh40dN6Ztk=
   ```

2. **Start Keycloak (using Docker)**

   ```bash
   docker-compose up -d keycloak postgres
   ```

3. **Configure Keycloak realm**
   - Import realm configuration from `keycloak/realm-export.json`
   - Or manually configure client and mappers

4. **Restart services**

   ```bash
   # Restart API
   cd ehr-api
   npm run dev

   # Restart Web App (in a new terminal)
   cd ehr-web
   npm run dev
   ```

5. **Login**
   - Navigate to `http://localhost:3000`
   - Click "Sign in with Keycloak"
   - System will redirect to Keycloak login page

---

## Architecture Overview

### Frontend (ehr-web)

**File: `src/lib/auth.ts`**

The authentication configuration dynamically loads providers based on `AUTH_PROVIDER`:

```typescript
// Postgres mode: Uses CredentialsProvider
if (AUTH_PROVIDER === 'postgres') {
  providers.push(CredentialsProvider({
    async authorize(credentials) {
      // Calls POST /api/auth/login
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      return res.json()
    }
  }))
}

// Keycloak mode: Uses KeycloakProvider
if (AUTH_PROVIDER === 'keycloak') {
  providers.push(KeycloakProvider({
    clientId: KEYCLOAK_CLIENT_ID,
    clientSecret: KEYCLOAK_CLIENT_SECRET,
    issuer: keycloakIssuer
  }))
}
```

### Backend (ehr-api)

**Files:**
- `src/routes/auth.js` - Authentication routes
- `src/services/postgres-auth.service.js` - Postgres authentication logic
- `src/services/auth.service.js` - Keycloak authentication logic (existing)

**Key Features:**
- Password hashing with bcrypt (10 rounds)
- JWT token generation (24h expiry)
- Audit logging for all auth events
- Multi-tenant support (org_id, location_ids)
- Role and permission mapping

---

## Database Schema Changes

**Migration: `010_add_password_auth.sql`**

```sql
-- Add password_hash column (nullable for hybrid support)
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Make keycloak_user_id nullable (for postgres-only users)
ALTER TABLE users ALTER COLUMN keycloak_user_id DROP NOT NULL;

-- Add index for faster email lookups
CREATE INDEX idx_users_email_status ON users(email, status);
```

**User Record Examples:**

```sql
-- Postgres-only user
INSERT INTO users (email, name, password_hash, status)
VALUES ('user@example.com', 'John Doe', '$2a$10$hashed...', 'active');

-- Keycloak-only user
INSERT INTO users (email, name, keycloak_user_id, status)
VALUES ('user@example.com', 'Jane Doe', 'kc-uuid-123', 'active');

-- Hybrid user (supports both)
INSERT INTO users (email, name, password_hash, keycloak_user_id, status)
VALUES ('user@example.com', 'Bob Smith', '$2a$10$hashed...', 'kc-uuid-456', 'active');
```

---

## UI Components

The UI automatically adapts based on the authentication provider:

### Login Page

**Postgres mode:**
- Shows email/password form
- "Forgot password?" link
- "Sign up" option (if registration enabled)

**Keycloak mode:**
- Shows "Sign in with Keycloak" button
- Redirects to Keycloak login page
- No local forms needed

**Implementation:**

```typescript
// Check auth provider from API
const { data: authProvider } = await fetch('/api/auth/provider')

if (authProvider.provider === 'postgres') {
  // Render email/password form
  <form onSubmit={handleLogin}>
    <input name="email" type="email" />
    <input name="password" type="password" />
    <button type="submit">Sign In</button>
  </form>
} else {
  // Render Keycloak button
  <button onClick={() => signIn('keycloak')}>
    Sign in with Keycloak
  </button>
}
```

---

## Security Considerations

### Postgres Authentication
- ✅ Passwords hashed with bcrypt (cost factor 10)
- ✅ JWT tokens with 24h expiry
- ✅ Secure password reset flow with time-limited tokens
- ✅ Audit logging for all authentication events
- ⚠️ No built-in 2FA (requires custom implementation)
- ⚠️ Session management handled by JWT only

### Keycloak Authentication
- ✅ OAuth2/OIDC standard compliance
- ✅ Built-in 2FA/MFA support
- ✅ Session management by Keycloak
- ✅ Password policies enforced by Keycloak
- ✅ Account lockout and brute-force protection
- ✅ Social login integration available

---

## Testing

### Test Postgres Authentication

```bash
# 1. Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Response: { "user": {...}, "token": "jwt-token-here" }

# 3. Verify token in NextAuth
# Navigate to http://localhost:3000 and login with test@example.com
```

### Test Keycloak Authentication

```bash
# 1. Ensure Keycloak is running
docker-compose ps keycloak

# 2. Access Keycloak admin console
open http://localhost:8080/admin
# Login: admin / admin123

# 3. Create test user in ehr-realm

# 4. Navigate to http://localhost:3000 and click "Sign in with Keycloak"
```

---

## Troubleshooting

### Issue: "Missing required environment variables"

**Solution:** Ensure AUTH_PROVIDER matches the configured environment variables:
- If `AUTH_PROVIDER=postgres`, you don't need Keycloak variables
- If `AUTH_PROVIDER=keycloak`, all Keycloak variables must be set

### Issue: "Password authentication not configured for this user"

**Solution:** The user doesn't have a password_hash. Either:
1. Set a password via SQL: `UPDATE users SET password_hash = crypt('password', gen_salt('bf')) WHERE email = '...'`
2. Use the password reset flow
3. Switch to Keycloak authentication

### Issue: NextAuth session not persisting

**Solution:**
1. Clear browser cookies
2. Ensure NEXTAUTH_SECRET is set and consistent
3. Check NEXTAUTH_URL matches your domain

### Issue: CORS errors with API

**Solution:** Ensure `ALLOWED_ORIGINS` in `ehr-api/.env` includes your frontend URL:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Migration Guide

### From Keycloak to Postgres

1. Export users from Keycloak
2. Set passwords for all users (force password reset on first login)
3. Update AUTH_PROVIDER=postgres
4. Restart services

### From Postgres to Keycloak

1. Import users into Keycloak
2. Map user emails to Keycloak user IDs
3. Update AUTH_PROVIDER=keycloak
4. Restart services
5. Users will need to reset passwords in Keycloak

---

## Production Deployment

### Environment Variables Checklist

**Required for both modes:**
- ✅ NEXTAUTH_URL (production domain)
- ✅ NEXTAUTH_SECRET (generate with `openssl rand -base64 32`)

**Postgres mode:**
- ✅ AUTH_PROVIDER=postgres
- ✅ JWT_SECRET (generate with `openssl rand -base64 32`)
- ✅ DATABASE_URL (production database)

**Keycloak mode:**
- ✅ AUTH_PROVIDER=keycloak
- ✅ KEYCLOAK_URL (production Keycloak URL)
- ✅ KEYCLOAK_REALM
- ✅ KEYCLOAK_CLIENT_ID
- ✅ KEYCLOAK_CLIENT_SECRET

### Docker Configuration

Update `docker-compose.yml` to conditionally start Keycloak:

```yaml
services:
  keycloak:
    # Only start if AUTH_PROVIDER=keycloak
    profiles: ["keycloak"]
    image: quay.io/keycloak/keycloak:26.0
    # ... rest of config
```

Then start services:

```bash
# Postgres mode
docker-compose up -d

# Keycloak mode
docker-compose --profile keycloak up -d
```

---

## FAQ

**Q: Can I use both authentication methods simultaneously?**
A: Yes! Users can have both `password_hash` and `keycloak_user_id`. The active provider is determined by AUTH_PROVIDER.

**Q: How do I migrate from one provider to another without downtime?**
A: Set up hybrid users (both password_hash and keycloak_user_id), then switch AUTH_PROVIDER during a maintenance window.

**Q: Which provider should I use for production?**
A: Keycloak for enterprise deployments requiring SSO, MFA, and advanced security. Postgres for simpler deployments or MVPs.

**Q: Can I customize the login UI?**
A: Yes! The UI checks `AUTH_PROVIDER` and renders appropriate forms. Customize in `src/app/auth/signin/page.tsx` (or create this page if it doesn't exist).

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs keycloak` or API server logs
3. Verify environment variables are set correctly
4. Check that database migrations have been applied

## Next Steps

1. ✅ Set AUTH_PROVIDER in both .env files
2. ✅ Run database migration (if using postgres mode)
3. ✅ Restart services
4. ✅ Test login with both providers
5. ✅ Create test users and verify authentication flow
