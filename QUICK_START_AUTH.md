# Quick Start Guide - Dual Authentication System

## Overview

Your EHR system now supports **two authentication methods** controlled by a single environment variable:

- **Postgres Authentication** (Simple email/password)
- **Keycloak Authentication** (Enterprise SSO)

## Current Configuration

✅ **Currently Running: Postgres Authentication**

The system is already configured and running with Postgres authentication. Here's what's been set up:

### Test Account

```
Email: admin@test.com
Password: TestPass123!
Organization: Test Clinic
Role: ORG_ADMIN
```

## Switching Authentication Methods

### To Use Postgres Auth (Current Setup)

**Environment Variables:**
```bash
# In ehr-api/.env
AUTH_PROVIDER=postgres

# In ehr-web/.env.local
AUTH_PROVIDER=postgres
```

**Benefits:**
- ✅ No external dependencies (no Keycloak needed)
- ✅ Simple email/password login
- ✅ Fast development
- ✅ Direct password management

**To Login:**
```bash
# Via API
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestPass123!"}'

# Via Web UI
# Navigate to http://localhost:3000 and use email/password form
```

### To Switch to Keycloak Auth

**1. Update environment variables:**

```bash
# In ehr-api/.env
AUTH_PROVIDER=keycloak

# In ehr-web/.env.local
AUTH_PROVIDER=keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=ehr-realm
KEYCLOAK_CLIENT_ID=nextjs-client
KEYCLOAK_CLIENT_SECRET=nextjs-secret-key
```

**2. Start Keycloak:**
```bash
docker-compose up -d keycloak
```

**3. Restart services:**
```bash
# Kill and restart API
pkill -f "node.*index.js"
cd ehr-api && npm run dev

# Restart web app
cd ehr-web && npm run dev
```

**4. Login via Keycloak:**
- Navigate to http://localhost:3000
- Click "Sign in with Keycloak" button
- System redirects to Keycloak login page

## API Endpoints

### Check Current Provider
```bash
curl http://localhost:8000/api/auth/provider

# Response:
# {
#   "provider": "postgres",
#   "supportsPasswordAuth": true
# }
```

### Login (Postgres mode only)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestPass123!"}'
```

### Register New User (Postgres mode only)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "New User",
    "organization": {
      "name": "My Clinic",
      "slug": "my-clinic"
    }
  }'
```

### Change Password (Postgres mode only)
```bash
curl -X POST http://localhost:8000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "oldPassword": "TestPass123!",
    "newPassword": "NewPass123!"
  }'
```

## Testing

### Test Postgres Authentication

```bash
# 1. Verify auth provider is set to postgres
curl http://localhost:8000/api/auth/provider

# 2. Login with test account
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestPass123!"}'

# 3. You should receive a response with user data and JWT token
```

### Test Keycloak Authentication

```bash
# 1. Start Keycloak
docker-compose up -d keycloak

# 2. Update AUTH_PROVIDER=keycloak in both .env files

# 3. Restart services

# 4. Navigate to http://localhost:3000 and test Keycloak login
```

## Creating Additional Users

### Postgres Mode

**Option 1: Via API**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@clinic.com",
    "password": "Doctor123!",
    "name": "Dr. Smith"
  }'
```

**Option 2: Via SQL**
```bash
# Generate password hash
node -e "console.log(require('bcryptjs').hashSync('YourPassword', 10))"

# Insert user
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c "
INSERT INTO users (email, name, password_hash, status)
VALUES ('user@example.com', 'User Name', 'HASHED_PASSWORD', 'active');
"
```

### Keycloak Mode

1. Access Keycloak admin console: http://localhost:8080/admin
2. Login: `admin` / `admin123`
3. Navigate to `ehr-realm` > Users
4. Click "Add user" and fill in details

## Architecture

```
┌─────────────────────────────────────────┐
│         Environment Variable            │
│       AUTH_PROVIDER=postgres            │
│           or                            │
│       AUTH_PROVIDER=keycloak            │
└─────────────┬───────────────────────────┘
              │
              ├──────────────┬──────────────┐
              │              │              │
         ┌────▼────┐    ┌───▼────┐   ┌────▼────┐
         │Frontend │    │Backend │   │Database │
         │(NextAuth│    │ (API)  │   │(Postgres│
         │  auth.ts│    │auth.js │   │ users)  │
         └─────────┘    └────────┘   └─────────┘
              │              │              │
    ┌─────────┴──────────────┴──────────────┴─────┐
    │     Postgres: Email/Password Auth            │
    │     - CredentialsProvider                    │
    │     - POST /api/auth/login                   │
    │     - JWT tokens                             │
    └──────────────────────────────────────────────┘
              OR
    ┌──────────────────────────────────────────────┐
    │     Keycloak: OAuth2/OIDC SSO                │
    │     - KeycloakProvider                       │
    │     - Redirect to Keycloak                   │
    │     - OAuth2 tokens                          │
    └──────────────────────────────────────────────┘
```

## Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,              -- For postgres auth (nullable)
  keycloak_user_id TEXT UNIQUE,   -- For Keycloak auth (nullable)
  status TEXT NOT NULL,
  ...
);
```

**Users can have:**
- `password_hash` only (Postgres-only user)
- `keycloak_user_id` only (Keycloak-only user)
- Both (Hybrid user - can use either method)

## Troubleshooting

### "Postgres authentication not enabled"
- Check `AUTH_PROVIDER=postgres` in `ehr-api/.env`
- Restart the API server

### "Invalid email or password"
- Verify user exists: `SELECT email FROM users WHERE email = 'admin@test.com';`
- Check password hash exists: `SELECT password_hash FROM users WHERE email = 'admin@test.com';`

### "Password authentication not configured for this user"
- User doesn't have a password_hash set
- Set password via SQL: `UPDATE users SET password_hash = crypt('password', gen_salt('bf')) WHERE email = '...';`

### Login works but session doesn't persist
- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check `NEXTAUTH_URL` matches your domain

## Security Notes

### Postgres Mode
- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens expire after 24 hours
- Audit logs for all auth events

### Keycloak Mode
- OAuth2/OIDC standard
- Built-in 2FA/MFA support
- Centralized session management
- Advanced password policies

## Next Steps

1. ✅ **Test the login** - Use the test account to verify everything works
2. ✅ **Create additional users** - Add users for your team
3. ⚠️ **Customize the UI** - Update login pages to match your branding
4. ⚠️ **Set up production** - Follow the production deployment guide
5. ⚠️ **Enable 2FA** - For Keycloak mode, configure multi-factor authentication

## Support Files

- `AUTHENTICATION_SETUP.md` - Complete setup and configuration guide
- `ehr-api/src/routes/auth.js` - Authentication routes
- `ehr-api/src/services/postgres-auth.service.js` - Postgres auth logic
- `ehr-web/src/lib/auth.ts` - NextAuth configuration

## Questions?

Refer to `AUTHENTICATION_SETUP.md` for detailed documentation including:
- Migration guides
- Production deployment
- UI customization
- Advanced configuration
