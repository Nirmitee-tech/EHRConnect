# ABDM API Reference

Complete reference for all implemented ABDM (Ayushman Bharat Digital Mission) APIs.

## 🔐 Token Management

**All authentication tokens are automatically stored in the PostgreSQL database** for long-term persistence.

### Token Types

1. **X-Token (Auth Token)**
   - Required for profile operations (get profile, download card, email verification)
   - Expires after 30 minutes
   - Format: `X-token: Bearer <token>`
   - ✅ Stored in database with expiry timestamp

2. **T-Token (Transaction Token)**
   - Used during enrollment process only
   - Short-lived, for setting ABHA address
   - ✅ Stored in database

3. **Refresh Token**
   - Long-lived token for session refresh
   - ✅ Stored in database

### Retrieving Stored Tokens

```bash
GET /api/abdm/stored-tokens/:abhaNumber
```

Returns all tokens with expiry status. See [Utility APIs](#get-apabdmstored-tokensabhanumber) for details.

📖 For complete token storage documentation, see [ABDM_TOKEN_STORAGE.md](ABDM_TOKEN_STORAGE.md)

---

## Configuration

### POST /api/abdm/config
Configure ABDM integration for your organization.

**Request:**
```json
{
  "name": "abdm-default",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "xCmId": "sbx",
  "environment": "sandbox"
}
```

**Response:**
```json
{
  "message": "ABDM integration configured successfully",
  "integration": {
    "id": "uuid",
    "name": "abdm-default",
    "environment": "sandbox",
    "status": "active"
  }
}
```

### GET /api/abdm/config
List all ABDM integrations for your organization.

### DELETE /api/abdm/config/:integrationId
Delete an ABDM integration.

---

## ABHA Enrollment

### POST /api/abdm/send-otp
Send OTP to Aadhaar-registered mobile number.

**Request:**
```json
{
  "aadhaar": "123456789012",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "txnId": "transaction-id",
  "message": "OTP sent successfully"
}
```

### POST /api/abdm/verify-otp
Verify OTP and create/retrieve ABHA account.

**Request:**
```json
{
  "txnId": "transaction-id",
  "otp": "123456",
  "mobile": "9876543210",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "ABHANumber": "91-7561-4088-8857",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "M",
    "dateOfBirth": "1990-01-01",
    "mobile": "9876543210",
    "email": "john@example.com",
    "photo": "base64-encoded-photo",
    "isNew": true
  },
  "tokens": {
    "token": "x-token",
    "refreshToken": "refresh-token",
    "expiresIn": 1800
  }
}
```

---

## Mobile Verification

### POST /api/abdm/send-mobile-otp
Send OTP to mobile for verification.

**Request:**
```json
{
  "mobile": "9876543210",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "txnId": "transaction-id",
  "message": "OTP sent successfully"
}
```

### POST /api/abdm/verify-mobile-otp
Verify mobile OTP.

**Request:**
```json
{
  "txnId": "transaction-id",
  "otp": "123456",
  "scope": ["abha-enrol", "mobile-verify"],
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "verification-token"
  }
}
```

---

## ABHA Address Management

### GET /api/abdm/address-suggestions
Get suggested ABHA addresses.

**Query Parameters:**
- `tToken`: T-Token from enrollment
- `integrationName`: (optional) Integration name

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "john.doe@abdm",
    "johndoe123@abdm",
    "jdoe@abdm"
  ]
}
```

### POST /api/abdm/set-address
Set ABHA address.

**Request:**
```json
{
  "tToken": "t-token",
  "abhaAddress": "john.doe@abdm",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "abhaAddress": "john.doe@abdm"
  }
}
```

---

## ABHA Login (For Auth Token)

### POST /api/abdm/login-with-address
Login with ABHA Address to get Auth token for profile operations.

**Request:**
```json
{
  "abhaAddress": "john.doe@abdm",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "txnId": "transaction-id",
  "message": "OTP sent successfully"
}
```

### POST /api/abdm/verify-login-otp
Verify login OTP and get Auth token (X-Token) for profile operations.

**Request:**
```json
{
  "txnId": "transaction-id",
  "otp": "123456",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "token": "auth-x-token",
    "refreshToken": "refresh-token",
    "expiresIn": 1800
  }
}
```

**Note:** This Auth token (X-Token) is required for all profile operations like getting profile, downloading card, etc. The Transaction token (T-Token) from enrollment is only valid for the registration process.

**Important:** The X-Token must be passed with the correct header format:
```
X-token: Bearer <token-value>
```

**✅ Tokens are automatically stored in the database** after enrollment and login for easy retrieval and reuse.

---

## Profile Management

### GET /api/abdm/profile
Get complete ABHA profile details.

**Query Parameters:**
- `xToken`: X-Token from enrollment/authentication
- `integrationName`: (optional) Integration name

**Response:**
```json
{
  "success": true,
  "profile": {
    "ABHANumber": "91-7561-4088-8857",
    "ABHAAddress": "john.doe@abdm",
    "firstName": "John",
    "middleName": "",
    "lastName": "Doe",
    "name": "John Doe",
    "gender": "M",
    "dateOfBirth": "1990-01-01",
    "mobile": "9876543210",
    "email": "john@example.com",
    "profilePhoto": "base64-photo",
    "stateCode": "27",
    "stateName": "Maharashtra",
    "districtCode": "276",
    "districtName": "Mumbai",
    "address": "123 Main St",
    "pincode": "400001"
  }
}
```

### GET /api/abdm/download-card
Download ABHA card as PDF.

**Query Parameters:**
- `xToken`: X-Token from enrollment/authentication
- `integrationName`: (optional) Integration name

**Response:**
```json
{
  "success": true,
  "card": "base64-encoded-pdf",
  "contentType": "application/pdf"
}
```

### POST /api/abdm/send-email-verification
Send email verification link to add/verify email address.

**Request:**
```json
{
  "xToken": "x-token-from-enrollment",
  "email": "user@example.com",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent successfully"
  }
}
```

---

## Utility APIs

### POST /api/abdm/test-connection
Test ABDM connection with configured credentials.

**Request:**
```json
{
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection successful"
}
```

### GET /api/abdm/public-certificate
Get ABDM public certificate for encryption.

**Query Parameters:**
- `integrationName`: (optional) Integration name

**Response:**
```json
{
  "success": true,
  "certificate": "base64-encoded-certificate"
}
```

### POST /api/abdm/encrypt-data
Encrypt data using ABDM public key (utility endpoint).

**Request:**
```json
{
  "data": "123456",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "encrypted": "base64-encrypted-data",
  "original": "123456",
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
}
```

### GET /api/abdm/stored-tokens/:abhaNumber
Get stored authentication tokens for an ABHA profile.

**Parameters:**
- `abhaNumber`: ABHA Number (e.g., "91-7345-1816-0779")

**Response:**
```json
{
  "success": true,
  "tokens": {
    "xToken": "eyJhbGciOiJSUzUxMiJ9...",
    "xTokenExpiresAt": "2025-12-14T14:30:00.000Z",
    "xTokenValid": true,
    "tToken": "eyJhbGciOiJSUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJSUzUxMiJ9...",
    "tokenUpdatedAt": "2025-12-14T14:00:00.000Z"
  }
}
```

**Note:** Tokens are automatically stored in the database during enrollment and login. Use `xTokenValid` to check if the token is still valid.

### GET /api/abdm/transactions
Get ABDM transaction history.

**Query Parameters:**
- `limit`: Number of records (default: 50)
- `offset`: Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "1",
      "operation": "sendOtp",
      "metadata": {
        "txnId": "transaction-id"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

---

## Demo Page

Visit `/integrations/abdm` for a complete interactive demo of all ABDM operations.

The demo page includes:
1. **Configuration** - Configure ABDM credentials with sandbox defaults
2. **ABHA Enrollment** - Complete OTP-based enrollment flow
3. **Set ABHA Address** - Select from suggestions and set ABHA address
4. **Profile Display** - View enrolled ABHA profile with photo
5. **Get Profile** - Fetch complete profile details using X-Token
6. **Download Card** - Download ABHA card as PDF
7. **Mobile Update** - Update mobile number with OTP verification
8. **Email Verification** - Send verification link to email address
9. **API Response Viewer** - Expandable accordions showing complete API responses:
   - **Transaction IDs** with individual copy buttons
   - **All tokens** (X-Token, T-Token, Refresh Token) with copy functionality
   - **Full JSON responses** for debugging
   - **Token expiry information**
   - Perfect for testing in Postman or external tools
10. **Developer Utilities** - Tools for testing and debugging:
    - **Encrypt Tab**: Encrypt data using ABDM public key (RSA-OAEP SHA-1)
    - **Token Inspector Tab**: Decode and inspect JWT tokens (Transaction vs Auth tokens)
    - **Auth Headers Tab**: View and copy all authentication headers automatically sent with requests
    - **cURL Examples Tab**: Ready-to-use cURL commands for Postman testing with actual session values

All operations are pre-configured with test data for easy demonstration.

## All Implemented APIs from Postman Collection

### Core ABHA Operations
✅ **Send OTP** - `/api/abdm/send-otp`
✅ **Create ABHA by verifying OTP** - `/api/abdm/verify-otp`
✅ **Mobile Update - Send OTP** - `/api/abdm/send-mobile-otp`
✅ **Mobile Update - Verify OTP** - `/api/abdm/verify-mobile-otp`
✅ **Email Verification Link** - `/api/abdm/send-email-verification`
✅ **ABHA Address Suggestion API** - `/api/abdm/address-suggestions`
✅ **ABHA Address (Set)** - `/api/abdm/set-address`
✅ **Get Profile Details** - `/api/abdm/profile`
✅ **Download ABHA card** - `/api/abdm/download-card`

### Authentication & Login
✅ **Login with ABHA Address** - `/api/abdm/login-with-address`
✅ **Verify Login OTP** - `/api/abdm/verify-login-otp`

### Configuration & Utilities
✅ **Configure ABDM** - `/api/abdm/config`
✅ **List Integrations** - `GET /api/abdm/config`
✅ **Delete Integration** - `DELETE /api/abdm/config/:integrationId`
✅ **Test Connection** - `/api/abdm/test-connection`
✅ **Get Public Certificate** - `/api/abdm/public-certificate`
✅ **Encrypt Data (Utility)** - `/api/abdm/encrypt-data`
✅ **Get Transaction History** - `/api/abdm/transactions`

---

## Authentication

All endpoints require authentication via the `requireAuth` middleware. Include your session token in the request headers.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

ABDM API errors are passed through with their original status codes and error details.

---

## Environment Support

- **Sandbox**: `https://abhasbx.abdm.gov.in` (for testing)
- **Production**: `https://abha.abdm.gov.in` (requires production credentials)

Configure the environment in your integration settings.
