# 🧪 Patient Portal API - Curl Test Commands

## Prerequisites

1. **ehr-api running:** `http://localhost:8000`
2. **Database migrated:** Patient portal tables created
3. **Test data:** You need a FHIR patient ID and provider user ID/org ID

---

## Test Scenarios

### Scenario 1: Grant Portal Access (Provider Action)

**Endpoint:** `POST /api/patient-portal/grant-access`

**Description:** Provider grants portal access to a patient

**Required Headers:**
- `x-user-id`: Provider user ID who is granting access
- `x-org-id`: Organization ID

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/patient-portal/grant-access \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_PROVIDER_USER_ID" \
  -H "x-org-id: YOUR_ORG_ID" \
  -d '{
    "fhirPatientId": "YOUR_FHIR_PATIENT_ID",
    "email": "patient@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Portal access granted successfully",
  "data": {
    "id": "uuid",
    "fhirPatientId": "YOUR_FHIR_PATIENT_ID",
    "email": "patient@example.com",
    "status": "active",
    "portalAccessGrantedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

---

### Scenario 2: Check Portal Access

**Endpoint:** `GET /api/patient-portal/check-access`

**Description:** Check if a patient has portal access

**curl Command:**
```bash
curl -X GET "http://localhost:8000/api/patient-portal/check-access?fhirPatientId=YOUR_FHIR_PATIENT_ID" \
  -H "Content-Type: application/json"
```

**Expected Response - Has Access (200):**
```json
{
  "hasAccess": true,
  "email": "patient@example.com",
  "status": "active",
  "grantedAt": "2025-11-02T12:00:00.000Z",
  "lastLoginAt": null
}
```

**Expected Response - No Access (200):**
```json
{
  "hasAccess": false
}
```

---

### Scenario 3: Patient Login

**Endpoint:** `POST /api/patient-portal/login`

**Description:** Patient logs in with email and password

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/patient-portal/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "fhirPatientId": "YOUR_FHIR_PATIENT_ID",
    "email": "patient@example.com",
    "orgId": "YOUR_ORG_ID",
    "userType": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "64-char-hex-string"
}
```

**Expected Response - Invalid Credentials (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Expected Response - Account Locked (401):**
```json
{
  "error": "Account is locked. Try again in 15 minutes."
}
```

---

### Scenario 4: Validate Session

**Endpoint:** `POST /api/patient-portal/validate-session`

**Description:** Validate a patient session token

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/patient-portal/validate-session \
  -H "Content-Type: application/json" \
  -H "x-session-token: YOUR_SESSION_TOKEN" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN"
  }'
```

**Expected Response - Valid (200):**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "fhirPatientId": "YOUR_FHIR_PATIENT_ID",
    "email": "patient@example.com",
    "orgId": "YOUR_ORG_ID",
    "userType": "patient"
  }
}
```

**Expected Response - Invalid (401):**
```json
{
  "error": "Invalid or expired session"
}
```

---

### Scenario 5: Change Password

**Endpoint:** `POST /api/patient-portal/change-password`

**Description:** Patient changes their password

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/patient-portal/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "patientPortalUserId": "YOUR_PATIENT_PORTAL_USER_ID",
    "oldPassword": "SecurePassword123!",
    "newPassword": "NewSecurePassword456!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Expected Response - Wrong Old Password (400):**
```json
{
  "error": "Current password is incorrect"
}
```

---

### Scenario 6: Logout

**Endpoint:** `POST /api/patient-portal/logout`

**Description:** Patient logs out (invalidates session)

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/patient-portal/logout \
  -H "Content-Type: application/json" \
  -H "x-session-token: YOUR_SESSION_TOKEN" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Scenario 7: Revoke Portal Access (Provider Action)

**Endpoint:** `POST /api/patient-portal/revoke-access`

**Description:** Provider revokes patient portal access

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/patient-portal/revoke-access \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_PROVIDER_USER_ID" \
  -d '{
    "fhirPatientId": "YOUR_FHIR_PATIENT_ID"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Portal access revoked successfully"
}
```

---

### Scenario 8: Get Portal Statistics (Admin/Provider)

**Endpoint:** `GET /api/patient-portal/stats`

**Description:** Get portal usage statistics for organization

**curl Command:**
```bash
curl -X GET http://localhost:8000/api/patient-portal/stats \
  -H "Content-Type: application/json" \
  -H "x-org-id: YOUR_ORG_ID"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": "10",
    "active_users": "8",
    "users_who_logged_in": "5",
    "active_last_30_days": "4",
    "active_last_7_days": "2"
  }
}
```

---

## End-to-End Test Flow

### Step 1: Setup Test Data

**Get test FHIR patient ID:**
```bash
# Find a patient in your FHIR server (Medplum)
# Or create one through the provider interface
FHIR_PATIENT_ID="your-fhir-patient-id-here"
```

**Get provider credentials:**
```bash
# Get from your users table
PROVIDER_USER_ID="your-provider-user-id"
ORG_ID="your-org-id"
```

### Step 2: Grant Access

```bash
curl -X POST http://localhost:8000/api/patient-portal/grant-access \
  -H "Content-Type: application/json" \
  -H "x-user-id: $PROVIDER_USER_ID" \
  -H "x-org-id: $ORG_ID" \
  -d "{
    \"fhirPatientId\": \"$FHIR_PATIENT_ID\",
    \"email\": \"testpatient@example.com\",
    \"password\": \"TestPassword123!\"
  }"
```

### Step 3: Verify Access Granted

```bash
curl -X GET "http://localhost:8000/api/patient-portal/check-access?fhirPatientId=$FHIR_PATIENT_ID"
```

### Step 4: Patient Login

```bash
curl -X POST http://localhost:8000/api/patient-portal/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testpatient@example.com",
    "password": "TestPassword123!"
  }' | jq .
```

**Save the session token:**
```bash
SESSION_TOKEN=$(curl -X POST http://localhost:8000/api/patient-portal/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testpatient@example.com",
    "password": "TestPassword123!"
  }' | jq -r '.sessionToken')

echo "Session Token: $SESSION_TOKEN"
```

### Step 5: Validate Session

```bash
curl -X POST http://localhost:8000/api/patient-portal/validate-session \
  -H "Content-Type: application/json" \
  -H "x-session-token: $SESSION_TOKEN" \
  -d "{\"sessionToken\": \"$SESSION_TOKEN\"}" | jq .
```

### Step 6: Check Portal Stats

```bash
curl -X GET http://localhost:8000/api/patient-portal/stats \
  -H "x-org-id: $ORG_ID" | jq .
```

### Step 7: Logout

```bash
curl -X POST http://localhost:8000/api/patient-portal/logout \
  -H "Content-Type: application/json" \
  -H "x-session-token: $SESSION_TOKEN" \
  -d "{\"sessionToken\": \"$SESSION_TOKEN\"}" | jq .
```

---

## Database Verification

### Check patient_portal_users table
```bash
PGPASSWORD=medplum123 psql -U medplum -d medplum -h localhost -c "SELECT * FROM patient_portal_users;"
```

### Check patient_portal_sessions table
```bash
PGPASSWORD=medplum123 psql -U medplum -d medplum -h localhost -c "SELECT * FROM patient_portal_sessions;"
```

### Check patient_portal_audit_logs table
```bash
PGPASSWORD=medplum123 psql -U medplum -d medplum -h localhost -c "SELECT * FROM patient_portal_audit_logs ORDER BY created_at DESC LIMIT 10;"
```

---

## Common Error Scenarios

### 1. Grant Access - Missing Headers
```bash
curl -X POST http://localhost:8000/api/patient-portal/grant-access \
  -H "Content-Type: application/json" \
  -d '{
    "fhirPatientId": "test-patient",
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** 401 Unauthorized - "Provider authentication required"

### 2. Login - Wrong Password
```bash
curl -X POST http://localhost:8000/api/patient-portal/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testpatient@example.com",
    "password": "WrongPassword"
  }'
```
**Expected:** 401 Unauthorized - "Invalid email or password"

### 3. Login - Account Locked (5+ failed attempts)
After 5 failed login attempts, account is locked for 15 minutes.

---

## Troubleshooting

### API Not Responding
```bash
# Check if ehr-api is running
curl http://localhost:8000/health
```

### Database Connection Issues
```bash
# Test database connection
PGPASSWORD=medplum123 psql -U medplum -d medplum -h localhost -c "SELECT 1;"
```

### Check API Logs
```bash
# ehr-api logs should show:
# - Patient portal routes registered
# - Database connections
# - Request/response logs
```

---

## Success Criteria

✅ Grant access creates record in `patient_portal_users`
✅ Check access returns correct status
✅ Patient can login with correct credentials
✅ Login creates session in `patient_portal_sessions`
✅ Session validation works
✅ Failed logins are tracked (audit logs)
✅ Account locks after 5 failed attempts
✅ Password change invalidates sessions
✅ Logout removes session
✅ Portal stats return correct counts

---

**Ready to test!** 🚀
