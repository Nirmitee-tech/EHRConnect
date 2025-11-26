# Production Environment Variables Setup

## Issue Fixed
**Problem:** NextAuth Keycloak authentication was failing with `OAuthSignin` error because environment variables with `NEXT_PUBLIC_` prefix get baked into the build at build-time, not runtime.

**Solution:** Use runtime environment variables (without `NEXT_PUBLIC_` prefix) for server-side NextAuth configuration. The code now supports both formats with fallback for backward compatibility.

## Required Environment Variables for Production

### **Critical: Add these to Dokploy/Docker Environment**

```bash
# ========================================
# NextAuth Configuration
# ========================================
NEXTAUTH_URL=https://ehr-dev.nirmitee.io  # ⚠️ MUST be your app URL, NOT Keycloak URL
NEXTAUTH_SECRET=6ePUi4mTJUAIhgGrPq13CO6nMPeDBrgeu0jqXZS+U/Y=

# ========================================
# Keycloak Configuration (Runtime - No rebuild needed)
# ========================================
KEYCLOAK_URL=https://auth-dev.nirmitee.io
KEYCLOAK_REALM=ehr-realm
KEYCLOAK_CLIENT_ID=nextjs-client
KEYCLOAK_CLIENT_SECRET=nextjs-secret-key

# ========================================
# API Configuration
# ========================================
NEXT_PUBLIC_API_URL=https://api-dev.nirmitee.io

# ========================================
# Database Configuration (if needed)
# ========================================
DB_HOST=72.60.205.71
DB_PORT=5432
DB_NAME=ehrconnect
DB_USER=ehruser
DB_PASSWORD=nilkamal0_Y

# ========================================
# JWT Secret
# ========================================
JWT_SECRET=6ePUi4mTJUAIhgGrPq13CO6nMPeDBrgeu0jqXZS+U/Y=

# ========================================
# CORS
# ========================================
ALLOWED_ORIGINS=https://ehr-dev.nirmitee.io
```

## Deployment Steps

### Step 1: Update Environment Variables in Dokploy

1. Login to Dokploy dashboard
2. Navigate to **ehr-web** service
3. Go to **Environment Variables** section
4. Update/Add the variables above
5. **Click Save**

### Step 2: Rebuild and Deploy

Since we changed the code to support runtime env vars, you need to rebuild the Docker image:

```bash
# Option A: Using Dokploy
# Click "Rebuild" button in Dokploy UI

# Option B: Manual Docker build
cd /path/to/EHRConnect/ehr-web
docker build -t jitendratech/ehr-web:dev .
docker push jitendratech/ehr-web:dev

# Then restart the service
docker-compose restart ehr-web
```

### Step 3: Verify Environment Variables

After deployment, check if env vars are loaded correctly:

```bash
# Check the diagnostic endpoint
curl https://ehr-dev.nirmitee.io/api/debug/env

# You should see:
# {
#   "NEXTAUTH_URL": "https://ehr-dev.nirmitee.io",
#   "KEYCLOAK_URL": "https://auth-dev.nirmitee.io",
#   "KEYCLOAK_REALM": "ehr-realm",
#   "KEYCLOAK_CLIENT_ID": "nextjs-client",
#   "KEYCLOAK_CLIENT_SECRET": "***SET***",
#   ...
# }
```

### Step 4: Test Authentication

```bash
# Test signin endpoint
curl -s 'https://ehr-dev.nirmitee.io/api/auth/signin/keycloak' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data-urlencode 'callbackUrl=https://ehr-dev.nirmitee.io/' \
  --data-urlencode 'json=true'

# Expected success response:
# {
#   "url": "https://auth-dev.nirmitee.io/realms/ehr-realm/protocol/openid-connect/auth?client_id=nextjs-client&..."
# }

# If you still see this, env vars are not set:
# {
#   "url": "https://ehr-dev.nirmitee.io/api/auth/error?error=OAuthSignin"
# }
```

### Step 5: Check Docker Logs

```bash
# Check logs for debug output
docker logs <container-id> | grep "🔐"

# You should see:
# 🔐 Keycloak issuer: https://auth-dev.nirmitee.io/realms/ehr-realm
# 🔐 NextAuth URL: https://ehr-dev.nirmitee.io
# 🔐 Client ID: nextjs-client
```

## Keycloak Client Configuration

Ensure the following is configured in Keycloak admin console:

**Client:** `nextjs-client`

**Settings:**
- Access Type: `confidential`
- Standard Flow Enabled: `ON`
- Valid Redirect URIs:
  ```
  https://ehr-dev.nirmitee.io/*
  https://ehr-dev.nirmitee.io/api/auth/callback/keycloak
  ```
- Web Origins:
  ```
  https://ehr-dev.nirmitee.io
  ```
- Valid Post Logout Redirect URIs:
  ```
  https://ehr-dev.nirmitee.io/*
  ```

## Troubleshooting

### Problem: Still getting OAuthSignin error after deployment

**Solution 1:** Verify environment variables are set
```bash
curl https://ehr-dev.nirmitee.io/api/debug/env
```

**Solution 2:** Check Docker logs for errors
```bash
docker logs <container-id> | grep -i error
docker logs <container-id> | grep "❌"
```

**Solution 3:** Restart the container
```bash
docker restart <container-id>
```

### Problem: Environment variables showing as undefined

**Cause:** The new code hasn't been deployed yet (still using old build)

**Solution:** Rebuild the Docker image with the updated code

## Migration from Old Configuration

If you were using `NEXT_PUBLIC_*` prefix before:

**Old (Build-time):**
```bash
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client
```

**New (Runtime - Recommended):**
```bash
KEYCLOAK_URL=https://auth-dev.nirmitee.io
KEYCLOAK_REALM=ehr-realm
KEYCLOAK_CLIENT_ID=nextjs-client
```

The code supports both formats with fallback, so you can keep the old vars during migration.

## Summary of Changes

1. **Updated `/Users/apple/EHRConnect/EHRConnect/ehr-web/src/lib/auth.ts`**
   - Added runtime environment variable support
   - Added fallback to NEXT_PUBLIC_ vars for backward compatibility
   - Added debug logging for troubleshooting

2. **Created `/Users/apple/EHRConnect/EHRConnect/ehr-web/src/app/api/debug/env/route.ts`**
   - Diagnostic endpoint to verify env vars

3. **Updated `.env.local`**
   - Added runtime environment variables
   - Kept legacy vars for backward compatibility

## Next Steps

1. ✅ Code changes are complete
2. ⏳ Commit and push changes
3. ⏳ Rebuild Docker image
4. ⏳ Deploy to production
5. ⏳ Test authentication flow
