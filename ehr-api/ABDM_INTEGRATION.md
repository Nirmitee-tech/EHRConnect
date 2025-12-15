# ABDM (Ayushman Bharat Digital Mission) Integration

This module provides integration with India's ABDM for ABHA (Ayushman Bharat Health Account) enrollment and health data exchange.

## Features

- **Configurable Multi-Tenant Support**: Multiple organizations can use their own ABDM credentials
- **ABHA Enrollment**: Create ABHA accounts using Aadhaar OTP verification
- **Mobile Verification**: Verify mobile numbers for ABHA accounts
- **Address Management**: Get suggestions and set ABHA addresses
- **Encryption**: RSA-OAEP SHA-1 encryption for sensitive data
- **Session Management**: Automatic token refresh and caching
- **Transaction Logging**: Track all ABDM operations

## Setup

### 1. Run Database Migration

```bash
node src/migrations/add-abdm-tables.js
```

This creates the following tables:
- `integrations` - Store ABDM credentials per organization
- `abha_profiles` - Store ABHA account information
- `abdm_transactions` - Log all ABDM API operations

### 2. Configure ABDM Credentials

Each organization can configure their own ABDM credentials:

**POST** `/api/abdm/config`

```json
{
  "name": "abdm-default",
  "clientId": "SBXID_010974",
  "clientSecret": "819c50ef-6ad7-4680-ae86-d4d3acda2e85",
  "xCmId": "sbx",
  "publicKey": "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAstWB95C5pHLXiYW59qyO...",
  "environment": "sandbox"
}
```

**Parameters:**
- `name` (optional): Identifier for this configuration (default: "abdm-default")
- `clientId` (required): ABDM client ID
- `clientSecret` (required): ABDM client secret
- `xCmId` (optional): X-CM-ID header value (default: "sbx")
- `publicKey` (optional): ABDM public key for encryption (auto-fetched if not provided)
- `environment` (optional): "sandbox" or "production" (default: "sandbox")

**Response:**
```json
{
  "message": "ABDM integration configured successfully",
  "integration": {
    "id": 123,
    "name": "abdm-default",
    "environment": "sandbox",
    "status": "active"
  }
}
```

### 3. Multiple Configurations

Organizations can maintain multiple ABDM configurations for different use cases:

```json
{
  "name": "abdm-clinic-a",
  "clientId": "CLINICA_CLIENT_ID",
  "clientSecret": "CLINICA_SECRET"
}
```

```json
{
  "name": "abdm-hospital-b",
  "clientId": "HOSPITALB_CLIENT_ID",
  "clientSecret": "HOSPITALB_SECRET"
}
```

## API Endpoints

All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Configuration Management

#### List Configurations
**GET** `/api/abdm/config`

Returns all ABDM configurations for the organization.

#### Delete Configuration
**DELETE** `/api/abdm/config/:integrationId`

#### Test Connection
**POST** `/api/abdm/test-connection`

```json
{
  "integrationName": "abdm-default"
}
```

### ABHA Enrollment Flow

#### Step 1: Send OTP to Aadhaar
**POST** `/api/abdm/send-otp`

```json
{
  "aadhaar": "946495363918",
  "integrationName": "abdm-default"
}
```

**Response:**
```json
{
  "success": true,
  "txnId": "3356ff2f-5dc2-4955-8b02-54bb17a2b8b7",
  "message": "OTP sent to Aadhaar registered mobile number ending with ******6634"
}
```

#### Step 2: Verify OTP & Create ABHA
**POST** `/api/abdm/verify-otp`

```json
{
  "txnId": "3356ff2f-5dc2-4955-8b02-54bb17a2b8b7",
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
    "ABHANumber": "91-1234-5678-9012",
    "name": "John Doe",
    "gender": "M",
    "dateOfBirth": "1990-01-01",
    "mobile": "9876543210",
    "email": "john@example.com",
    "preferredAbhaAddress": "johndoe@sbx"
  },
  "tokens": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
    "expiresIn": 1800
  }
}
```

### Mobile Verification

#### Send Mobile OTP
**POST** `/api/abdm/send-mobile-otp`

```json
{
  "mobile": "9876543210",
  "integrationName": "abdm-default"
}
```

#### Verify Mobile OTP
**POST** `/api/abdm/verify-mobile-otp`

```json
{
  "txnId": "transaction-id",
  "otp": "123456",
  "scope": ["abha-enrol", "mobile-verify"],
  "integrationName": "abdm-default"
}
```

### Address Management

#### Get Address Suggestions
**GET** `/api/abdm/address-suggestions?tToken=<t-token>&integrationName=abdm-default`

#### Set ABHA Address
**POST** `/api/abdm/set-address`

```json
{
  "tToken": "transaction-token",
  "abhaAddress": "johndoe123@sbx",
  "integrationName": "abdm-default"
}
```

### Public Certificate

#### Get ABDM Public Certificate
**GET** `/api/abdm/public-certificate?integrationName=abdm-default`

Returns the ABDM public key used for encryption.

### Transaction History

#### Get Transaction History
**GET** `/api/abdm/transactions?limit=50&offset=0`

Returns audit log of all ABDM operations.

## Integration in Your Application

### Example: ABHA Enrollment Flow

```javascript
// 1. Configure ABDM (one-time setup)
const configResponse = await fetch('/api/abdm/config', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'abdm-default',
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET'
  })
});

// 2. Send OTP
const otpResponse = await fetch('/api/abdm/send-otp', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    aadhaar: '946495363918',
    integrationName: 'abdm-default'
  })
});

const { txnId } = await otpResponse.json();

// 3. User enters OTP from their mobile

// 4. Verify OTP and create ABHA
const verifyResponse = await fetch('/api/abdm/verify-otp', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    txnId: txnId,
    otp: '123456',
    mobile: '9876543210',
    integrationName: 'abdm-default'
  })
});

const { profile, tokens } = await verifyResponse.json();
console.log('ABHA Profile:', profile);
```

## Security Considerations

1. **Encryption**: All sensitive data (Aadhaar, OTP, Mobile) is encrypted using RSA-OAEP with SHA-1 before transmission
2. **Credentials**: ABDM credentials are stored securely in the database
3. **Token Management**: Access tokens are automatically refreshed and cached
4. **Audit Logging**: All operations are logged for compliance
5. **Organization Isolation**: Each organization's data is isolated

## Error Handling

The API returns standard error responses:

```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

Common error codes:
- `400` - Invalid request parameters
- `401` - Unauthorized (invalid token)
- `404` - Integration not found
- `500` - Server or ABDM API error

When ABDM API errors occur, the response includes the ABDM error details:

```json
{
  "error": "ABDM API error",
  "details": {
    "code": "ABDM_ERROR_CODE",
    "message": "Error message from ABDM"
  }
}
```

## Testing

### Using cURL

```bash
# 1. Configure ABDM
curl -X POST http://localhost:8000/api/abdm/config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "SBXID_010974",
    "clientSecret": "819c50ef-6ad7-4680-ae86-d4d3acda2e85"
  }'

# 2. Send OTP
curl -X POST http://localhost:8000/api/abdm/send-otp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "aadhaar": "946495363918"
  }'

# 3. Verify OTP
curl -X POST http://localhost:8000/api/abdm/verify-otp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "txnId": "TRANSACTION_ID",
    "otp": "123456",
    "mobile": "9876543210"
  }'
```

## Environment Configuration

Add these to your `.env` file if needed:

```env
# Database (already configured)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ehrconnect
DB_USER=postgres
DB_PASSWORD=password

# ABDM credentials are configured per organization via API
# No need to add them to .env
```

## Architecture

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ABDM Routes    │  (/api/abdm/*)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ABDM Service   │  (Business Logic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ABDM Handler   │  (Integration Handler)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ABDM API      │  (External API)
└─────────────────┘
```

## File Structure

```
ehr-api/
├── src/
│   ├── integrations/
│   │   └── abdm.handler.js        # Integration handler
│   ├── services/
│   │   └── abdm.service.js        # Business logic
│   ├── routes/
│   │   └── abdm.js                # API routes
│   └── migrations/
│       └── add-abdm-tables.js     # Database setup
└── ABDM_INTEGRATION.md            # This file
```

## Support

For ABDM-specific issues, refer to:
- ABDM Developer Portal: https://sandbox.abdm.gov.in/
- ABDM Documentation: https://sandbox.abdm.gov.in/docs

For integration issues, contact your development team.

## Changelog

### Version 1.0.0 (2025-12-13)
- Initial ABDM integration
- ABHA enrollment via Aadhaar OTP
- Mobile verification
- Address management
- Multi-tenant configuration support
- Transaction logging
- Automatic encryption and token management
