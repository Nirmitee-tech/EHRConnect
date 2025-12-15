# 2FA (Two-Factor Authentication) Implementation Guide

## Overview

This document describes the comprehensive 2FA system implemented for EHR Connect. The system supports **email-based** 2FA with flexible configuration at both **global (organization)** and **user** levels.

## Features

✅ **Email-based 2FA** with verification codes
✅ **Global organization settings** - Enable/disable 2FA for entire organization
✅ **User-level settings** - Individual users can enable/disable 2FA
✅ **Three enforcement levels**: `disabled`, `optional`, `mandatory`
✅ **Retry logic** with exponential backoff for email delivery
✅ **Professional email templates** with branding
✅ **Security features**: Rate limiting, attempt tracking, code expiry
✅ **Audit logging** for all 2FA-related events
✅ **MailHog integration** for local testing

---

## Architecture

### Database Schema

#### 1. `global_2fa_settings` - Organization-level 2FA configuration
```sql
- org_id: Organization ID (unique)
- enabled: Boolean - Is 2FA active for this org?
- enforcement_level: 'disabled' | 'optional' | 'mandatory'
- allowed_methods: JSONB array - ['email', 'sms', 'totp'] (currently only email)
- grace_period_days: Integer - Grace period before enforcement
- config: JSONB - Additional configuration
- updated_by: User who last updated settings
```

#### 2. `user_2fa_settings` - Per-user 2FA preferences
```sql
- user_id: User ID (unique)
- enabled: Boolean - Has user enabled 2FA?
- method: 'email' | 'sms' | 'totp'
- verified: Boolean - Has the user completed setup?
- backup_email: Text - Backup email for recovery
- last_used_at: Timestamp - Last successful 2FA verification
```

#### 3. `mfa_codes` - Generated verification codes
```sql
- user_id: User ID
- code: 6-digit code
- method: 'email' | 'sms' | 'totp'
- purpose: 'login' | 'setup' | 'verify' | 'backup'
- expires_at: Timestamp (default: 10 minutes)
- verified_at: Timestamp - When code was used
- attempts: Integer - Failed verification attempts
- max_attempts: Integer (default: 3)
- email_sent: Boolean - Email delivery status
- email_retry_count: Integer - Number of retry attempts
```

---

## Backend Implementation

### Services

#### 1. **Email Service** (`src/services/email.service.js`)
- Nodemailer integration with SMTP
- Automatic retry with exponential backoff (up to 3 attempts)
- Professional HTML email templates
- Support for MailHog (dev) and production SMTP servers

**Key Methods:**
```javascript
sendMFACode(user, code, purpose)           // Send verification code
sendMFACodeWithTracking(...)               // Send + update database
send2FASetupConfirmation(user)            // Setup complete notification
send2FADisabledNotification(user)          // Disabled notification
```

#### 2. **MFA Service** (`src/services/mfa.service.js`)
- Code generation (6-digit numeric)
- Code verification with attempt tracking
- 2FA requirement checking
- Settings management (user & global)

**Key Methods:**
```javascript
is2FARequired(userId, orgId)               // Check if 2FA is required
generateAndSendCode(userId, purpose)       // Generate & email code
verifyCode(userId, code, purpose)          // Verify code
enable2FA(userId, method)                  // Enable for user
verify2FASetup(userId, code)               // Complete setup
disable2FA(userId)                         // Disable for user
getGlobalSettings(orgId)                   // Get org settings
updateGlobalSettings(orgId, settings)      // Update org settings
```

#### 3. **Postgres Auth Service** (`src/services/postgres-auth.service.js`)
- Updated to support 2FA flow
- Login now checks 2FA requirements
- New method: `completeMFALogin(userId)`

---

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### 1. **Login** - `POST /api/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (2FA Required):
{
  "requiresMFA": true,
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "codeId": "uuid",
  "expiresAt": "2024-12-01T10:20:00Z",
  "sentTo": "u***@example.com",
  "message": "Please enter the verification code sent to your email"
}

Response (2FA Not Required):
{
  "user": { ... },
  "token": "jwt_token"
}
```

#### 2. **Verify MFA** - `POST /api/auth/verify-mfa`
```json
Request:
{
  "userId": "uuid",
  "code": "123456"
}

Response:
{
  "user": { ... },
  "token": "jwt_token"
}
```

### MFA Management Endpoints (`/api/mfa`)

#### 3. **Check 2FA Requirement** - `POST /api/mfa/check`
```json
Request:
{
  "userId": "uuid",
  "orgId": "uuid"
}

Response:
{
  "success": true,
  "required": true,
  "reason": "mandatory",
  "needsSetup": false
}
```

#### 4. **Send MFA Code** - `POST /api/mfa/send-code`
```json
Request:
{
  "userId": "uuid",
  "purpose": "login"  // or "setup", "verify"
}

Response:
{
  "success": true,
  "codeId": "uuid",
  "expiresAt": "2024-12-01T10:20:00Z",
  "sentTo": "u***@example.com"
}
```

#### 5. **Enable 2FA** - `POST /api/mfa/enable`
```json
Request:
{
  "method": "email"
}

Response:
{
  "success": true,
  "message": "2FA setup initiated. Please verify your email.",
  "codeId": "uuid",
  "expiresAt": "2024-12-01T10:20:00Z",
  "sentTo": "u***@example.com"
}
```

#### 6. **Verify Setup** - `POST /api/mfa/setup/verify`
```json
Request:
{
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "2FA has been successfully enabled"
}
```

#### 7. **Disable 2FA** - `POST /api/mfa/disable`
```json
Response:
{
  "success": true,
  "message": "2FA has been disabled"
}
```

#### 8. **Get User Settings** - `GET /api/mfa/settings`
```json
Response:
{
  "success": true,
  "settings": {
    "enabled": true,
    "method": "email",
    "verified": true,
    "last_used_at": "2024-12-01T09:30:00Z"
  }
}
```

#### 9. **Get Global Settings** - `GET /api/mfa/global-settings`
```json
Response:
{
  "success": true,
  "settings": {
    "enabled": true,
    "enforcement_level": "optional",
    "allowed_methods": ["email"],
    "grace_period_days": 7,
    "config": {}
  }
}
```

#### 10. **Update Global Settings** - `PUT /api/mfa/global-settings` (Admin Only)
```json
Request:
{
  "enabled": true,
  "enforcement_level": "mandatory",
  "allowed_methods": ["email"],
  "grace_period_days": 7
}

Response:
{
  "success": true,
  "message": "Global 2FA settings updated successfully",
  "settings": { ... }
}
```

---

## Configuration

### Environment Variables

Add to `ehr-api/.env`:

```bash
# Email Configuration (MailHog for local development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=EHR Connect
SMTP_FROM_EMAIL=noreply@ehrconnect.com

# 2FA Configuration
MFA_CODE_EXPIRY_MINUTES=10
MFA_CODE_LENGTH=6
MFA_MAX_ATTEMPTS=3
```

### Production SMTP Configuration

For production, update the SMTP settings:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

---

## Setup Instructions

### 1. Start Docker Services

```bash
cd /Users/developer/Projects/EHRConnect
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- **MailHog SMTP** (port 1025)
- **MailHog Web UI** (port 8025) - http://localhost:8025

### 2. Run Database Migration

```bash
cd ehr-api
npm run migrate
```

This creates:
- `global_2fa_settings` table
- `user_2fa_settings` table
- `mfa_codes` table
- Default global settings for existing organizations

### 3. Start API Server

```bash
npm run dev
```

Server starts on http://localhost:8000

### 4. Test Email Delivery

Visit **MailHog Web UI**: http://localhost:8025

All emails sent during development will appear here.

---

## User Workflows

### Workflow 1: User Enables 2FA (Optional Mode)

1. **User requests 2FA enable**
   ```
   POST /api/mfa/enable
   ```

2. **System generates code & sends email**
   - 6-digit code generated
   - Email sent with verification code
   - User receives email in MailHog

3. **User enters verification code**
   ```
   POST /api/mfa/setup/verify
   { "code": "123456" }
   ```

4. **System confirms setup**
   - User's 2FA marked as `verified: true`
   - Confirmation email sent

### Workflow 2: Login with 2FA Enabled

1. **User submits login credentials**
   ```
   POST /api/auth/login
   { "email": "user@example.com", "password": "password" }
   ```

2. **System checks 2FA requirement**
   - Password verified ✓
   - 2FA required ✓
   - Returns `{ requiresMFA: true, userId: "..." }`

3. **System sends verification code**
   - Code generated & emailed
   - User receives code

4. **User submits verification code**
   ```
   POST /api/auth/verify-mfa
   { "userId": "uuid", "code": "123456" }
   ```

5. **System verifies & completes login**
   - Code verified ✓
   - JWT token generated
   - User logged in

### Workflow 3: Admin Enforces Mandatory 2FA

1. **Admin updates global settings**
   ```
   PUT /api/mfa/global-settings
   {
     "enabled": true,
     "enforcement_level": "mandatory"
   }
   ```

2. **All users must now use 2FA**
   - Users without 2FA setup are prompted
   - Cannot complete login without setting up 2FA

---

## Enforcement Levels

### 1. **Disabled** - 2FA is off for the organization
- No users can use 2FA
- 2FA setup is hidden

### 2. **Optional** (Default)
- Users can choose to enable 2FA
- Login works with or without 2FA
- Users with 2FA enabled must verify

### 3. **Mandatory**
- All users MUST enable 2FA
- Cannot complete login without 2FA setup
- Existing users prompted to set up 2FA on next login

---

## Security Features

### 1. **Code Expiry**
- Codes expire after 10 minutes (configurable)
- Old codes automatically invalidated when new ones are generated

### 2. **Attempt Limiting**
- Maximum 3 attempts per code (configurable)
- After max attempts, code is locked
- User must request a new code

### 3. **Email Masking**
- Email addresses masked in responses: `u***@example.com`
- Prevents email disclosure

### 4. **Audit Logging**
All 2FA events are logged:
- `MFA.ENABLE_INITIATED`
- `MFA.ENABLED`
- `MFA.DISABLED`
- `MFA.GLOBAL_SETTINGS_UPDATED`
- `AUTH.MFA_CHALLENGE_SENT`
- `AUTH.MFA_LOGIN_SUCCESS`

### 5. **Automatic Cleanup**
Expired codes are cleaned up periodically:
```
POST /api/mfa/cleanup
```
(Can be called by a cron job)

---

## Testing

### Local Testing with MailHog

1. **Start services**
   ```bash
   docker-compose up -d
   ```

2. **Access MailHog UI**
   - Open: http://localhost:8025
   - All test emails appear here

3. **Test 2FA flow**
   - Enable 2FA for a user
   - Check MailHog for verification code
   - Complete verification

### API Testing Examples

#### Enable 2FA
```bash
curl -X POST http://localhost:8000/api/mfa/enable \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -d '{"method": "email"}'
```

#### Get User Settings
```bash
curl http://localhost:8000/api/mfa/settings \
  -H "x-user-id: your-user-id"
```

#### Update Global Settings
```bash
curl -X PUT http://localhost:8000/api/mfa/global-settings \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-user-id" \
  -H "x-org-id: org-id" \
  -d '{
    "enabled": true,
    "enforcement_level": "mandatory"
  }'
```

---

## Frontend Integration (TODO)

The backend is complete. Frontend needs to implement:

1. **Settings Page**
   - Toggle to enable/disable 2FA
   - Show current 2FA status
   - Admin section for global settings

2. **Login Flow**
   - Check if `requiresMFA: true` in login response
   - Show verification code input screen
   - Submit code to `/api/auth/verify-mfa`

3. **Setup Flow**
   - "Enable 2FA" button
   - Verification code input
   - Success/error messages

---

## File Structure

```
ehr-api/
├── src/
│   ├── database/
│   │   └── migrations/
│   │       └── 20241201000001-create_2fa_system.js
│   ├── services/
│   │   ├── email.service.js         (Email with retry logic)
│   │   ├── mfa.service.js           (2FA logic)
│   │   └── postgres-auth.service.js (Updated with 2FA)
│   └── routes/
│       ├── auth.js                  (Updated with verify-mfa)
│       └── mfa.js                   (All MFA endpoints)
├── .env                             (Updated with SMTP config)
└── package.json                     (Added nodemailer)

docker-compose.yml                   (Added MailHog service)
```

---

## Troubleshooting

### Issue: Emails not being sent

**Check:**
1. MailHog is running: `docker ps | grep mailhog`
2. SMTP configuration in `.env`
3. Check email service logs in API console

### Issue: Code verification fails

**Check:**
1. Code hasn't expired (10 minutes)
2. Max attempts not exceeded (3)
3. Check `mfa_codes` table for code status

### Issue: 2FA not triggering on login

**Check:**
1. Global settings: `GET /api/mfa/global-settings`
2. User settings: `GET /api/mfa/settings`
3. Enforcement level is not "disabled"

---

## Next Steps

1. ✅ Backend implementation complete
2. ⏳ Run migration when database is ready
3. ⏳ Build frontend components
4. ⏳ Add SMS/TOTP support (future enhancement)
5. ⏳ Add backup codes (future enhancement)

---

## Summary

The 2FA system is **fully implemented on the backend** with:

✅ Database schema (3 tables)
✅ Email service with retry logic
✅ Professional email templates
✅ Complete API endpoints (12 endpoints)
✅ User-level and global settings
✅ Three enforcement levels
✅ Security features (rate limiting, expiry, audit logs)
✅ MailHog integration for testing
✅ Documentation

**Ready to use once you:**
1. Start Docker Compose
2. Run migrations: `npm run migrate`
3. Start API server: `npm run dev`
4. Build frontend UI
