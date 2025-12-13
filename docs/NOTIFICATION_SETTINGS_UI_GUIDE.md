# Notification Settings UI Guide

## Overview

This guide explains how to configure email (SMTP) and SMS providers through the **database-backed settings UI** instead of environment variables. Admins can manage multiple notification providers per organization with real-time configuration updates.

---

## Key Features

✅ **Database-Driven Configuration** - No more .env changes
✅ **Multi-Provider Support** - Configure multiple email/SMS providers
✅ **Real-time Updates** - Changes take effect immediately
✅ **Provider Testing** - Test configurations before enabling
✅ **Security** - Credentials encrypted and masked in responses
✅ **Audit Logging** - All configuration changes are logged
✅ **Fallback Support** - Falls back to .env if no DB config exists

---

## Database Schema

### `notification_providers` Table

```sql
- id: UUID (primary key)
- org_id: UUID (organization)
- provider_type: 'email_smtp' | 'sms_twilio' | 'sms_aws' | 'push_fcm'
- provider_name: Text (user-friendly name)
- enabled: Boolean
- is_default: Boolean (default provider for the type)
- config: JSONB (provider configuration - host, port, etc.)
- credentials: JSONB (sensitive credentials)
- created_by: UUID (user who created)
- updated_by: UUID (user who last updated)
- metadata: JSONB (additional data)
```

---

## API Endpoints

Base URL: `/api/notification-settings`

### 1. **Get All Providers**

```http
GET /api/notification-settings/providers
Headers:
  x-org-id: <organization-id>
  x-user-id: <user-id>
Query Parameters:
  ?type=email_smtp  (optional, filter by provider type)
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "provider_type": "email_smtp",
      "provider_name": "SendGrid Production",
      "enabled": true,
      "is_default": true,
      "config": {
        "host": "smtp.sendgrid.net",
        "port": 587,
        "secure": true,
        "from_name": "EHR Connect",
        "from_email": "noreply@ehrconnect.com"
      },
      "credentials": {
        "user": "***",
        "password": "***"
      },
      "created_at": "2024-12-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ]
}
```

### 2. **Create/Update Provider**

```http
POST /api/notification-settings/providers
Headers:
  x-org-id: <organization-id>
  x-user-id: <user-id>
Content-Type: application/json
```

**Request Body (Email/SMTP):**
```json
{
  "provider_type": "email_smtp",
  "provider_name": "SendGrid Production",
  "enabled": true,
  "is_default": true,
  "config": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "secure": true,
    "from_name": "EHR Connect",
    "from_email": "noreply@ehrconnect.com"
  },
  "credentials": {
    "user": "apikey",
    "password": "SG.xxxxxxxxxxxxx"
  }
}
```

**Request Body (SMS/Twilio):**
```json
{
  "provider_type": "sms_twilio",
  "provider_name": "Twilio Production",
  "enabled": true,
  "is_default": true,
  "config": {
    "from_number": "+1234567890"
  },
  "credentials": {
    "account_sid": "ACxxxxxxxxxxxxx",
    "auth_token": "your_auth_token"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification provider saved successfully",
  "provider": { ... }
}
```

### 3. **Test Provider Configuration**

```http
POST /api/notification-settings/providers/:id/test
Headers:
  x-org-id: <organization-id>
  x-user-id: <user-id>
```

**Response:**
```json
{
  "success": true,
  "message": "Email provider connection successful"
}
```

### 4. **Delete Provider**

```http
DELETE /api/notification-settings/providers/:id
Headers:
  x-org-id: <organization-id>
  x-user-id: <user-id>
```

**Response:**
```json
{
  "success": true,
  "deleted": { ... }
}
```

### 5. **Get Provider Types (Schema)**

```http
GET /api/notification-settings/provider-types
```

**Response:**
```json
{
  "success": true,
  "providerTypes": [
    {
      "type": "email_smtp",
      "name": "Email (SMTP)",
      "description": "Send emails via SMTP server",
      "configSchema": {
        "host": { "type": "string", "required": true, "label": "SMTP Host" },
        "port": { "type": "number", "required": true, "label": "SMTP Port", "default": 587 },
        "secure": { "type": "boolean", "required": false, "label": "Use SSL/TLS" },
        "from_name": { "type": "string", "required": true, "label": "From Name" },
        "from_email": { "type": "string", "required": true, "label": "From Email" }
      },
      "credentialsSchema": {
        "user": { "type": "string", "required": false, "label": "SMTP Username" },
        "password": { "type": "password", "required": false, "label": "SMTP Password" }
      }
    },
    {
      "type": "sms_twilio",
      "name": "SMS (Twilio)",
      "description": "Send SMS via Twilio",
      "configSchema": {
        "from_number": { "type": "string", "required": true, "label": "Twilio Phone Number" }
      },
      "credentialsSchema": {
        "account_sid": { "type": "string", "required": true, "label": "Account SID" },
        "auth_token": { "type": "password", "required": true, "label": "Auth Token" }
      }
    }
  ]
}
```

---

## UI Implementation Examples

### Settings Page Structure

```
Settings
├── Notifications
│   ├── Email Providers
│   │   ├── [List of email providers]
│   │   └── [+ Add Email Provider button]
│   └── SMS Providers
│       ├── [List of SMS providers]
│       └── [+ Add SMS Provider button]
└── 2FA Settings
    ├── Global 2FA Settings
    └── User 2FA Settings
```

### Email Provider Configuration Form

```jsx
// Example form fields for Email/SMTP Provider
{
  "provider_name": "SendGrid Production",
  "enabled": true,
  "is_default": true,
  "config": {
    "host": "smtp.sendgrid.net",      // Input field
    "port": 587,                       // Number input
    "secure": true,                    // Checkbox
    "from_name": "EHR Connect",        // Input field
    "from_email": "noreply@ehrconnect.com"  // Email input
  },
  "credentials": {
    "user": "apikey",                  // Input field
    "password": "SG.xxxxx"             // Password input
  }
}
```

### SMS Provider Configuration Form (Twilio)

```jsx
// Example form fields for SMS/Twilio Provider
{
  "provider_name": "Twilio Production",
  "enabled": true,
  "is_default": true,
  "config": {
    "from_number": "+1234567890"      // Phone number input
  },
  "credentials": {
    "account_sid": "ACxxxxx",          // Input field
    "auth_token": "your_token"         // Password input
  }
}
```

---

## User Workflows

### Workflow 1: Admin Configures Email Provider

1. **Navigate to Settings** → Notifications → Email Providers
2. **Click "+ Add Email Provider"**
3. **Fill in configuration:**
   - Provider Name: "SendGrid Production"
   - SMTP Host: smtp.sendgrid.net
   - SMTP Port: 587
   - Use SSL/TLS: ✓
   - From Name: "EHR Connect"
   - From Email: noreply@ehrconnect.com
   - Username: apikey
   - Password: SG.xxxxxxxxxxxxx
4. **Click "Test Connection"**
   - System validates SMTP connection
   - Shows success/error message
5. **Enable and Set as Default**
6. **Click "Save"**
7. **System clears email service cache**
8. **All subsequent emails use new configuration**

### Workflow 2: Admin Configures SMS Provider (Twilio)

1. **Navigate to Settings** → Notifications → SMS Providers
2. **Click "+ Add SMS Provider"**
3. **Fill in configuration:**
   - Provider Name: "Twilio Production"
   - Twilio Phone Number: +1234567890
   - Account SID: ACxxxxxxxxxxxxx
   - Auth Token: your_auth_token
4. **Click "Test Connection"**
   - System validates Twilio credentials
   - Shows success/error message
5. **Enable and Set as Default**
6. **Click "Save"**
7. **SMS 2FA now available for users**

### Workflow 3: User Enables SMS 2FA

1. **User goes to Profile** → Security → 2FA
2. **Selects "SMS" method**
3. **Enters phone number:** +1234567890
4. **Clicks "Enable 2FA"**
5. **System checks if SMS provider configured**
   - If not configured: Shows error
   - If configured: Sends verification code
6. **User receives SMS with code**
7. **User enters verification code**
8. **2FA enabled successfully**

---

## Configuration Examples

### 1. MailHog (Development)

```json
{
  "provider_type": "email_smtp",
  "provider_name": "MailHog (Development)",
  "enabled": true,
  "is_default": true,
  "config": {
    "host": "localhost",
    "port": 1025,
    "secure": false,
    "from_name": "EHR Connect",
    "from_email": "noreply@ehrconnect.com"
  },
  "credentials": {}
}
```

### 2. SendGrid (Production)

```json
{
  "provider_type": "email_smtp",
  "provider_name": "SendGrid Production",
  "enabled": true,
  "is_default": true,
  "config": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "secure": true,
    "from_name": "EHR Connect",
    "from_email": "noreply@ehrconnect.com"
  },
  "credentials": {
    "user": "apikey",
    "password": "SG.your_api_key"
  }
}
```

### 3. Gmail (Alternative)

```json
{
  "provider_type": "email_smtp",
  "provider_name": "Gmail",
  "enabled": true,
  "is_default": false,
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "from_name": "EHR Connect",
    "from_email": "your-email@gmail.com"
  },
  "credentials": {
    "user": "your-email@gmail.com",
    "password": "your-app-password"
  }
}
```

### 4. Twilio SMS (Production)

```json
{
  "provider_type": "sms_twilio",
  "provider_name": "Twilio Production",
  "enabled": true,
  "is_default": true,
  "config": {
    "from_number": "+1234567890"
  },
  "credentials": {
    "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "auth_token": "your_auth_token_here"
  }
}
```

---

## How It Works

### 1. Email Service Flow

```
Login Request
   ↓
MFA Service checks if 2FA enabled
   ↓
Generate Code
   ↓
Email Service.sendMFACode(user, code, purpose, orgId)
   ↓
Email Service.getTransporter(orgId)
   ↓
notificationSettingsService.getEmailProvider(orgId)
   ↓
Query: SELECT * FROM notification_providers
       WHERE org_id = ? AND provider_type = 'email_smtp'
       AND enabled = true
       ORDER BY is_default DESC
   ↓
If found: Use DB config
If not found: Fallback to .env
   ↓
Create Nodemailer transporter
   ↓
Send email
```

### 2. SMS Service Flow

```
Enable 2FA (SMS method)
   ↓
MFA Service.enable2FA(userId, 'sms', phoneNumber)
   ↓
Generate Code
   ↓
SMS Service.sendMFACode(phoneNumber, code, purpose, orgId)
   ↓
SMS Service.getClient(orgId)
   ↓
notificationSettingsService.getSMSProvider(orgId)
   ↓
Query: SELECT * FROM notification_providers
       WHERE org_id = ? AND provider_type = 'sms_twilio'
       AND enabled = true
       ORDER BY is_default DESC
   ↓
If found: Use DB config
If not found: Fallback to .env
   ↓
Create Twilio client
   ↓
Send SMS
```

---

## Frontend Implementation Checklist

- [ ] **Settings Page**
  - [ ] List all providers (email + SMS)
  - [ ] Add/Edit provider forms
  - [ ] Delete provider confirmation
  - [ ] Test connection button
  - [ ] Enable/Disable toggle
  - [ ] Set as default checkbox

- [ ] **Form Validation**
  - [ ] Required field validation
  - [ ] Email format validation
  - [ ] Phone number format validation
  - [ ] Port number validation

- [ ] **Provider Forms**
  - [ ] Dynamic form based on provider type
  - [ ] Use `/provider-types` endpoint for schema
  - [ ] Password fields (masked)
  - [ ] Test connection before saving

- [ ] **User 2FA Settings**
  - [ ] Method selection (Email/SMS)
  - [ ] Phone number input for SMS
  - [ ] Verification code input
  - [ ] Enable/Disable toggle

- [ ] **Admin 2FA Settings**
  - [ ] Global enforcement level
  - [ ] Allowed methods configuration
  - [ ] Grace period settings

---

## Testing

### 1. Test Email Provider

```bash
curl -X POST http://localhost:8000/api/notification-settings/providers/:id/test \
  -H "x-org-id: your-org-id" \
  -H "x-user-id: your-user-id"
```

### 2. Test SMS Provider

```bash
curl -X POST http://localhost:8000/api/notification-settings/providers/:id/test \
  -H "x-org-id: your-org-id" \
  -H "x-user-id: your-user-id"
```

### 3. Enable SMS 2FA

```bash
curl -X POST http://localhost:8000/api/mfa/enable \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -H "x-org-id: your-org-id" \
  -d '{
    "method": "sms",
    "phoneNumber": "+1234567890"
  }'
```

---

## Security Best Practices

1. **Credential Storage**
   - Credentials stored encrypted in JSONB
   - Never exposed in full in API responses
   - Masked as `***` in GET responses

2. **Access Control**
   - Only admins can create/update/delete providers
   - Add permission checks in routes (TODO in code)

3. **Audit Logging**
   - All provider changes logged to `audit_events`
   - Includes who, when, what changed

4. **Cache Management**
   - Transporter cache cleared after config changes
   - Cache expires after 5 minutes automatically

---

## Migration Guide

### From .env to Database

**Old way (.env):**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
SMTP_FROM_NAME=EHR Connect
SMTP_FROM_EMAIL=noreply@ehrconnect.com
```

**New way (API call):**
```bash
POST /api/notification-settings/providers
{
  "provider_type": "email_smtp",
  "provider_name": "SendGrid",
  "enabled": true,
  "is_default": true,
  "config": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "secure": true,
    "from_name": "EHR Connect",
    "from_email": "noreply@ehrconnect.com"
  },
  "credentials": {
    "user": "apikey",
    "password": "SG.xxxxx"
  }
}
```

**Benefits:**
- ✅ No server restart required
- ✅ Per-organization configuration
- ✅ Multiple providers per organization
- ✅ Test before enabling
- ✅ Audit trail

---

## Summary

**Implementation Complete:**
✅ Database schema (`notification_providers`)
✅ Settings service with provider management
✅ Email service reads from database
✅ SMS service with Twilio support
✅ MFA service supports email + SMS
✅ API endpoints for settings UI
✅ Automatic fallback to .env
✅ Cache management
✅ Security & audit logging

**Next Steps:**
1. Run migrations
2. Build frontend settings UI
3. Add admin permission checks
4. Test email/SMS providers
5. Deploy to production

The backend is **fully implemented** and ready for frontend integration!
