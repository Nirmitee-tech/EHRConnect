# Registration Guide - Postgres Authentication

## Overview

The EHR system now supports **user registration** with Postgres authentication. Users can sign up with email/password and automatically create an organization.

## ✅ Registration Works!

### Test Results

```bash
# ✅ Registration successful
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@clinic.com",
    "password": "Doctor123!",
    "name": "Dr. Jane Smith",
    "organization": {
      "name": "Smith Medical Clinic",
      "slug": "smith-clinic"
    }
  }'

# Response:
{
  "user": {
    "id": "3b1d92f8-44ab-411b-9fa7-c9bbc139e994",
    "email": "doctor@clinic.com",
    "name": "Dr. Jane Smith",
    "org_id": "c48f2a63-bd65-44d7-94a9-7178bfbeaf23"
  }
}

# ✅ Login successful
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@clinic.com","password":"Doctor123!"}'

# Response includes:
# - User ID, name, email
# - Organization ID, name, slug
# - Roles: ["ORG_ADMIN"]
# - 12 permissions
# - JWT token
```

---

## Features

### 1. Automated User Creation
- ✅ User account created with hashed password
- ✅ Email must be unique
- ✅ Password validated (min 8 chars, uppercase, lowercase, numbers)

### 2. Automated Organization Setup
- ✅ Organization created with unique slug
- ✅ Organization status set to 'active'
- ✅ Onboarding marked as incomplete (for onboarding flow)
- ✅ Creator assigned as organization owner

### 3. Automated Role Assignment
- ✅ User automatically assigned ORG_ADMIN role
- ✅ All admin permissions granted
- ✅ Organization-level scope

### 4. Security Features
- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ Duplicate email detection
- ✅ Duplicate org slug detection
- ✅ Transaction safety (all or nothing)

---

## API Endpoints

### `POST /api/auth/register`

Register a new user and organization.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",          // Required, unique
  "password": "SecurePass123!",         // Required, min 8 chars
  "name": "User Name",                  // Required
  "organization": {                     // Optional
    "name": "Organization Name",        // Required if provided
    "slug": "org-slug"                  // Required if provided, unique
  }
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "org_id": "org-uuid"
  }
}
```

**Error Responses:**
- `400` - User already exists
- `400` - Organization slug already exists
- `400` - Invalid input (missing required fields)
- `500` - Server error

---

## Registration Flow

### 1. User Visits Registration Page

```
http://localhost:3000/register
```

**UI Features:**
- 4-step wizard (Organization, Account, Location, Compliance)
- Real-time field validation
- Live preview of organization card
- Password strength indicator
- Terms & conditions checkboxes

### 2. User Fills Out Form

**Step 1: Organization**
- Organization name
- Contact phone
- Timezone

**Step 2: Account**
- Full name
- Email address
- Password
- Confirm password

**Step 3: Location (Optional)**
- Address details

**Step 4: Compliance**
- Accept Terms & Conditions
- Accept Business Associate Agreement (HIPAA)

### 3. Form Submission

Frontend calls:
```typescript
const response = await fetch(`${API_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: formData.owner_email,
    password: formData.owner_password,
    name: formData.owner_name,
    organization: {
      name: formData.org_name,
      slug: generateSlug(formData.org_name)
    }
  })
})
```

### 4. Backend Processing

**Transaction Steps:**
1. Check if email exists → Reject if exists
2. Check if org slug exists → Reject if exists
3. Hash password with bcrypt
4. Create organization record
5. Create user record with password_hash
6. Update organization.created_by with user ID
7. Assign ORG_ADMIN role to user
8. Commit transaction

### 5. Redirect to Login

After successful registration:
```javascript
alert('Registration successful! Please sign in with your credentials.')
window.location.href = '/api/auth/signin'
```

---

## Database Changes

### Users Table
```sql
-- Added for password auth
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Made nullable for postgres-only users
ALTER TABLE users ALTER COLUMN keycloak_user_id DROP NOT NULL;
```

### Organizations Table
```sql
-- Onboarding flag
INSERT INTO organizations (name, slug, contact_email, status, created_by, onboarding_completed)
VALUES (..., ..., ..., 'active', user_id, false);
```

### Role Assignments Table
```sql
-- Automatic admin role
INSERT INTO role_assignments (user_id, role_id, org_id, scope)
VALUES (user_id, admin_role_id, org_id, 'ORG');
```

---

## Password Requirements

### Validation Rules
- **Minimum length:** 8 characters
- **Uppercase:** At least 1 uppercase letter
- **Lowercase:** At least 1 lowercase letter
- **Numbers:** At least 1 digit
- **Matching:** Password and confirm password must match

### Examples

✅ **Valid Passwords:**
- `Password123`
- `SecurePass1!`
- `MyClinic2024`

❌ **Invalid Passwords:**
- `pass` (too short)
- `password` (no uppercase, no numbers)
- `PASSWORD123` (no lowercase)
- `Password` (no numbers)

---

## Error Handling

### Common Errors

#### 1. User Already Exists
```json
{
  "error": "User already exists"
}
```
**Solution:** Use a different email address

#### 2. Organization Slug Already Exists
```json
{
  "error": "Organization slug already exists"
}
```
**Solution:** Choose a different organization name (slug is auto-generated)

#### 3. Invalid Password
```json
{
  "error": "Password must be at least 8 characters"
}
```
**Solution:** Follow password requirements

---

## Security Considerations

### Password Storage
- ✅ Passwords hashed with bcrypt (cost factor 10)
- ✅ Never stored in plaintext
- ✅ Not logged or exposed in API responses

### Duplicate Detection
- ✅ Email uniqueness enforced at database level
- ✅ Org slug uniqueness enforced at database level
- ✅ Transaction ensures atomic operations

### Role Assignment
- ✅ First user automatically becomes ORG_ADMIN
- ✅ Admin permissions include:
  - `org:read`, `org:edit`
  - `locations:*`, `departments:*`, `staff:*`
  - `roles:read`, `roles:edit`
  - `settings:*`
  - `patients:read`, `appointments:read`, `reports:read`
  - `audit:read`

---

## Testing

### Manual Testing

1. **Navigate to registration page:**
   ```
   http://localhost:3000/register
   ```

2. **Fill out the form:**
   - Organization: "Test Hospital"
   - Name: "Dr. John Doe"
   - Email: "test@example.com"
   - Password: "TestPass123!"

3. **Complete all steps and submit**

4. **Verify registration:**
   ```bash
   # Check user was created
   PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c \
     "SELECT email, name FROM users WHERE email = 'test@example.com';"

   # Check org was created
   PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c \
     "SELECT name, slug FROM organizations WHERE slug = 'test-hospital';"

   # Check role assignment
   PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c \
     "SELECT u.email, r.key, ra.scope
      FROM users u
      JOIN role_assignments ra ON u.id = ra.user_id
      JOIN roles r ON ra.role_id = r.id
      WHERE u.email = 'test@example.com';"
   ```

5. **Test login:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPass123!"}'
   ```

### Automated Testing

```bash
# Test successful registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auto-test@example.com",
    "password": "AutoTest123!",
    "name": "Auto Test User",
    "organization": {
      "name": "Auto Test Org",
      "slug": "auto-test-org"
    }
  }'

# Expected: 200 OK with user object

# Test duplicate email
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auto-test@example.com",
    "password": "AutoTest123!",
    "name": "Duplicate User",
    "organization": {
      "name": "Another Org",
      "slug": "another-org"
    }
  }'

# Expected: 400 with "User already exists"

# Test login after registration
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auto-test@example.com",
    "password": "AutoTest123!"
  }'

# Expected: 200 OK with token and user details
```

---

## Integration with Auth System

### Registration Only Works in Postgres Mode

```bash
# Set in ehr-api/.env
AUTH_PROVIDER=postgres

# Set in ehr-web/.env.local
AUTH_PROVIDER=postgres
```

### Keycloak Mode
When `AUTH_PROVIDER=keycloak`:
- Registration endpoint returns error: "Postgres authentication not enabled"
- Users must be created in Keycloak admin console
- Frontend should hide registration UI

---

## Future Enhancements

### Possible Improvements

1. **Email Verification**
   - Send verification email after registration
   - Require email verification before first login

2. **Invitation-Based Registration**
   - Users join via invitation link
   - Pre-filled organization info

3. **Multi-Step Onboarding**
   - Collect more details after registration
   - Setup locations, departments, etc.

4. **Social Login Integration**
   - Google Sign-In
   - Microsoft SSO
   - Apple Sign-In

5. **Password Reset Flow**
   - Email-based password reset
   - Security questions
   - OTP verification

---

## Troubleshooting

### Registration Button Not Working

**Check:**
1. AUTH_PROVIDER is set to 'postgres' in both .env files
2. API server is running on port 8000
3. Database connection is working

### "User already exists" Error

**Solution:**
- Use a different email address
- OR delete existing user from database:
  ```sql
  DELETE FROM users WHERE email = 'user@example.com';
  ```

### "Organization slug already exists" Error

**Solution:**
- Frontend auto-generates slug from org name
- Try a different organization name
- OR delete existing org from database:
  ```sql
  DELETE FROM organizations WHERE slug = 'org-slug';
  ```

### Registration Succeeds But Login Fails

**Check:**
1. Password was properly hashed
   ```sql
   SELECT password_hash FROM users WHERE email = 'user@example.com';
   -- Should return a bcrypt hash like $2a$10$...
   ```

2. User status is 'active'
   ```sql
   SELECT status FROM users WHERE email = 'user@example.com';
   -- Should return 'active'
   ```

3. Role assignment exists
   ```sql
   SELECT * FROM role_assignments WHERE user_id = (
     SELECT id FROM users WHERE email = 'user@example.com'
   );
   -- Should return at least one row
   ```

---

## Summary

✅ **Registration API works** - Creates user, org, and role assignment
✅ **Registration UI works** - Beautiful multi-step wizard
✅ **Login after registration works** - Full session with permissions
✅ **Security is solid** - Bcrypt hashing, unique constraints, transactions
✅ **Error handling is comprehensive** - Clear error messages

**Registration is production-ready for Postgres authentication mode!** 🎉
