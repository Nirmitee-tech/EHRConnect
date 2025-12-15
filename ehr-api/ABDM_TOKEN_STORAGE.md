# ABDM Token Storage Solution

## Overview

This document describes the permanent token storage solution for ABDM integration, which stores X-Tokens, T-Tokens, and Refresh Tokens in the PostgreSQL database for long-term persistence.

## Problem

Previously, tokens were only stored in React state, which meant:
1. Tokens were lost on page refresh
2. No token reuse across sessions
3. Manual token management required for Postman testing
4. Incorrect header format (`X-Token` instead of `X-token: Bearer`)

## Solution

### Database Schema

Added columns to `abha_profiles` table:

```sql
ALTER TABLE abha_profiles
ADD COLUMN x_token TEXT,
ADD COLUMN x_token_expires_at TIMESTAMP,
ADD COLUMN t_token TEXT,
ADD COLUMN refresh_token TEXT,
ADD COLUMN token_updated_at TIMESTAMP;
```

### Token Types

1. **X-Token (Auth Token)**
   - Used for profile operations (get profile, download card, email verification)
   - Expires after 30 minutes (1800 seconds)
   - Format: `X-token: Bearer <token>`
   - Stored with expiry timestamp

2. **T-Token (Transaction Token)**
   - Used during enrollment process only
   - For setting ABHA address
   - Short-lived

3. **Refresh Token**
   - Long-lived token for refreshing X-Token
   - Stored for future token renewal

## Implementation

### 1. Service Layer (abdm.service.js)

#### Store Profile with Tokens
```javascript
await storeAbhaProfile(organizationId, profile, tokens);
```

Automatically called during:
- `verifyOtpAndEnroll()` - After successful enrollment
- Stores profile + all tokens in one transaction

#### Update Tokens
```javascript
await updateProfileTokens(organizationId, abhaNumber, tokens);
```

Called during:
- `verifyLoginOtp()` - After login to refresh X-Token

#### Retrieve Tokens
```javascript
const tokens = await getStoredTokens(organizationId, abhaNumber);
// Returns: { xToken, xTokenExpiresAt, xTokenValid, tToken, refreshToken }
```

### 2. Handler Layer (abdm.handler.js)

Fixed header format for all profile operations:

**Before:**
```javascript
headers: {
  'X-Token': params.xToken
}
```

**After:**
```javascript
headers: {
  'X-token': `Bearer ${params.xToken}`
}
```

Updated methods:
- `getProfile()`
- `downloadAbhaCard()`
- `sendEmailVerification()`

### 3. API Routes (abdm.js)

New endpoint to retrieve stored tokens:

```bash
GET /api/abdm/stored-tokens/:abhaNumber
```

Returns:
```json
{
  "success": true,
  "tokens": {
    "xToken": "eyJhbGci...",
    "xTokenExpiresAt": "2025-12-14T14:30:00.000Z",
    "xTokenValid": true,
    "tToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenUpdatedAt": "2025-12-14T14:00:00.000Z"
  }
}
```

## Usage

### For Frontend (React)

Tokens are automatically stored after enrollment:

```typescript
// After successful enrollment
const response = await ABDM.verifyOTP(txnId, otp, mobile, 'abdm-default', { session });
// Tokens are now stored in database
// response.tokens contains { token, tToken, refreshToken, expiresIn }
```

### For Postman Testing

1. Complete enrollment flow in UI
2. Copy tokens from API Response Viewer
3. Use tokens in Postman with correct header format:

```bash
curl --location 'https://abhasbx.abdm.gov.in/abha/api/v3/profile/account' \
--header 'X-token: Bearer eyJhbGci...' \
--header 'REQUEST-ID: uuid-here' \
--header 'TIMESTAMP: 2025-12-14T13:23:34.855Z' \
--header 'Authorization: Bearer <gateway-token>'
```

### Retrieve Stored Tokens

```bash
GET /api/abdm/stored-tokens/91-7345-1816-0779
```

## Token Lifecycle

1. **Enrollment** → `verifyOtpAndEnroll()`
   - Profile created
   - Tokens stored (X-Token, T-Token, Refresh Token)
   - X-Token expiry calculated and stored

2. **Login** → `loginWithAbhaAddress()` + `verifyLoginOtp()`
   - New X-Token generated
   - Tokens updated in database
   - Old X-Token replaced

3. **Profile Operations** → `getProfile()`, `downloadAbhaCard()`
   - Uses stored X-Token
   - Header format: `X-token: Bearer <token>`
   - Validates token expiry

4. **Token Refresh** (Future)
   - Use stored refresh token
   - Get new X-Token
   - Update database

## Benefits

✅ **Persistence** - Tokens survive page refresh and server restart
✅ **Reusability** - Same token used across sessions until expiry
✅ **Postman Ready** - Easy to retrieve and test externally
✅ **Correct Format** - Fixed header format (`X-token: Bearer`)
✅ **Expiry Tracking** - Know when tokens need refresh
✅ **Multi-Tenant** - Tokens isolated by org_id

## Migration

Run the migration:
```bash
node src/migrations/add-abdm-token-storage.js
```

Result:
- 5 new columns added to `abha_profiles`
- Existing profiles unaffected
- New enrollments automatically store tokens

## Testing

1. **Enroll a new ABHA account**
   - Tokens stored automatically

2. **Verify token storage**
   ```bash
   GET /api/abdm/stored-tokens/91-XXXX-XXXX-XXXX
   ```

3. **Test profile retrieval**
   ```bash
   GET /api/abdm/profile?xToken=<stored-token>
   ```

4. **Check expiry**
   - `xTokenValid` field shows if token is still valid

## Error Handling

- **Token expired**: Check `xTokenValid` field, re-login if false
- **No tokens found**: User needs to login to generate new tokens
- **Invalid token**: ABDM API returns 401, require re-authentication

## Future Enhancements

1. **Automatic token refresh** using refresh token
2. **Token rotation** on each use
3. **Multiple device support** with token revocation
4. **Token activity logs** for security auditing
