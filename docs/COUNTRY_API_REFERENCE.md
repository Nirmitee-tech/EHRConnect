# Country-Specific System - API Reference

Quick reference for all country-specific API endpoints.

## Base URL
```
http://localhost:8000/api
```

## Authentication Headers

All requests require these headers:
```
x-org-id: <organization-id>
x-user-id: <user-id>
x-user-roles: ["ADMIN"] // For admin endpoints
x-location-id: <location-id> // Optional
```

---

## Public Endpoints

### Get Country Context

Returns the enabled country pack and modules for the current organization.

```http
GET /countries/context
```

**Response:**
```json
{
  "success": true,
  "context": {
    "orgId": "uuid",
    "countryPack": {
      "countryCode": "IN",
      "countryName": "India",
      "packSlug": "india",
      "features": { "abha": true },
      "modules": { "abha_m1": { "enabled": true } }
    },
    "enabledModules": [
      {
        "moduleCode": "abha-m1",
        "moduleName": "ABHA Number Generation",
        "status": "active",
        "config": { "mode": "sandbox" }
      }
    ],
    "localization": {
      "language": "en",
      "currency": "INR",
      "timezone": "Asia/Kolkata",
      "dateFormat": "DD/MM/YYYY"
    }
  }
}
```

---

### List All Country Packs

Returns all available country packs.

```http
GET /countries/packs?active=true
```

**Query Parameters:**
- `active` (boolean) - Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "packs": [
    {
      "country_code": "IN",
      "country_name": "India",
      "region": "Asia",
      "pack_slug": "india",
      "pack_version": "1.0.0",
      "default_currency": "INR",
      "features": { "abha": true }
    }
  ]
}
```

---

### Get Country Pack Details

Returns details for a specific country pack.

```http
GET /countries/packs/:countryCode
```

**Example:**
```bash
GET /countries/packs/IN
```

**Response:**
```json
{
  "success": true,
  "pack": {
    "country_code": "IN",
    "country_name": "India",
    "regulatory_body": "National Health Authority (NHA)",
    "data_residency_required": true,
    "default_language": "en",
    "supported_languages": ["en", "hi", "ta"],
    "default_currency": "INR",
    "features": {
      "abha": true,
      "ayushman_bharat": true
    }
  }
}
```

---

### Get Country Modules

Returns all modules available for a country.

```http
GET /countries/packs/:countryCode/modules?active=true
```

**Example:**
```bash
GET /countries/packs/IN/modules
```

**Response:**
```json
{
  "success": true,
  "countryCode": "IN",
  "modules": [
    {
      "module_code": "abha-m1",
      "module_name": "ABHA Number Generation (M1)",
      "module_type": "identity",
      "description": "Create and verify ABHA numbers",
      "version": "1.0.0",
      "component_path": "/features/countries/india/abha-m1/AbhaRegistration.tsx",
      "beta": false
    }
  ]
}
```

---

## Admin Endpoints

Require `ADMIN`, `SUPER_ADMIN`, `ORG_OWNER`, or `org:manage_settings` role.

### Enable Country Pack

Enable a country pack for the organization.

```http
PUT /admin/orgs/:orgId/country
```

**Request Body:**
```json
{
  "countryCode": "IN",
  "scope": "org",
  "scopeRefId": null,
  "overrides": {
    "customSetting": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid",
  "orgId": "uuid",
  "countryCode": "IN",
  "packSlug": "india",
  "packVersion": "1.0.0",
  "enabled": true
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:8000/api/admin/orgs/abc-123/country" \
  -H "Content-Type: application/json" \
  -H "x-org-id: abc-123" \
  -H "x-user-id: user-123" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{
    "countryCode": "IN",
    "scope": "org"
  }'
```

---

### Enable/Disable Modules

Enable or disable country-specific modules.

```http
PUT /admin/orgs/:orgId/country/modules
```

**Request Body:**
```json
{
  "enable": [
    {
      "countryCode": "IN",
      "moduleCode": "abha-m1",
      "config": {
        "api_endpoint": "https://healthidsbx.abdm.gov.in",
        "mode": "sandbox"
      },
      "scope": "org",
      "scopeRefId": null
    },
    {
      "countryCode": "IN",
      "moduleCode": "abha-m2",
      "config": { "mode": "sandbox" }
    }
  ],
  "disable": [
    {
      "moduleCode": "old-module",
      "scope": "org"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "enabled": [
    {
      "id": "uuid",
      "orgId": "uuid",
      "moduleCode": "abha-m1",
      "enabled": true
    }
  ],
  "disabled": [
    {
      "orgId": "uuid",
      "moduleCode": "old-module",
      "enabled": false
    }
  ],
  "errors": []
}
```

**Note:** Returns 207 Multi-Status if there are partial failures.

**cURL Example:**
```bash
curl -X PUT "http://localhost:8000/api/admin/orgs/abc-123/country/modules" \
  -H "Content-Type: application/json" \
  -H "x-org-id: abc-123" \
  -H "x-user-id: user-123" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{
    "enable": [
      {
        "countryCode": "IN",
        "moduleCode": "abha-m1",
        "config": {
          "mode": "sandbox",
          "api_endpoint": "https://healthidsbx.abdm.gov.in",
          "client_id": "your-client-id",
          "client_secret": "your-secret"
        }
      }
    ]
  }'
```

---

### Update Module Configuration

Update the configuration of an enabled module.

```http
PATCH /admin/orgs/:orgId/country/modules/:moduleCode
```

**Request Body:**
```json
{
  "config": {
    "api_endpoint": "https://healthidsbx.abdm.gov.in",
    "client_id": "new-client-id",
    "mode": "production"
  },
  "scope": "org",
  "scopeRefId": null
}
```

**Response:**
```json
{
  "success": true,
  "orgId": "uuid",
  "moduleCode": "abha-m1",
  "config": {
    "api_endpoint": "https://healthidsbx.abdm.gov.in",
    "mode": "production"
  }
}
```

**cURL Example:**
```bash
curl -X PATCH "http://localhost:8000/api/admin/orgs/abc-123/country/modules/abha-m1" \
  -H "Content-Type: application/json" \
  -H "x-org-id: abc-123" \
  -H "x-user-id: user-123" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{
    "config": {
      "mode": "production",
      "api_endpoint": "https://healthid.abdm.gov.in"
    }
  }'
```

---

### Get Audit History

Retrieve audit history of country pack changes.

```http
GET /admin/orgs/:orgId/country/history?countryCode=IN&limit=50
```

**Query Parameters:**
- `countryCode` (string, optional) - Filter by country code
- `limit` (number, optional) - Number of records (default: 50)

**Response:**
```json
{
  "success": true,
  "orgId": "uuid",
  "countryCode": "IN",
  "history": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "country_code": "IN",
      "pack_slug": "india",
      "action": "enabled",
      "actor_id": "uuid",
      "actor_name": "John Doe",
      "actor_email": "john@example.com",
      "created_at": "2025-11-23T10:00:00Z",
      "metadata": {
        "enabled": true
      }
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/admin/orgs/abc-123/country/history?limit=10" \
  -H "x-org-id: abc-123" \
  -H "x-user-roles: [\"ADMIN\"]"
```

---

### Clear Cache

Clear the country pack cache (use with caution).

```http
DELETE /admin/countries/cache
```

**Response:**
```json
{
  "success": true,
  "message": "Country pack cache cleared successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/api/admin/countries/cache" \
  -H "x-user-roles: [\"ADMIN\"]"
```

---

### Get Cache Statistics

Get cache statistics (for debugging).

```http
GET /admin/countries/cache/stats
```

**Response:**
```json
{
  "success": true,
  "cache": {
    "size": 5,
    "keys": [
      "country:india",
      "country:usa"
    ]
  }
}
```

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `207 Multi-Status` - Partial success (some operations failed)
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Example Error Responses

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required to manage country settings"
}
```

**404 Not Found:**
```json
{
  "error": "Country pack not found: XX"
}
```

**207 Multi-Status (Partial Failure):**
```json
{
  "success": false,
  "enabled": [
    { "moduleCode": "abha-m1", "enabled": true }
  ],
  "disabled": [],
  "errors": [
    {
      "action": "enable",
      "moduleCode": "invalid-module",
      "error": "Module not found"
    }
  ]
}
```

---

## Complete Examples

### Complete Flow: Enable India Pack with ABHA M1

```bash
# 1. Get available countries
curl -X GET "http://localhost:8000/api/countries/packs"

# 2. Get India pack details
curl -X GET "http://localhost:8000/api/countries/packs/IN"

# 3. Get India modules
curl -X GET "http://localhost:8000/api/countries/packs/IN/modules"

# 4. Enable India pack
curl -X PUT "http://localhost:8000/api/admin/orgs/abc-123/country" \
  -H "Content-Type: application/json" \
  -H "x-org-id: abc-123" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{"countryCode": "IN", "scope": "org"}'

# 5. Enable ABHA M1 module
curl -X PUT "http://localhost:8000/api/admin/orgs/abc-123/country/modules" \
  -H "Content-Type: application/json" \
  -H "x-org-id: abc-123" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{
    "enable": [{
      "countryCode": "IN",
      "moduleCode": "abha-m1",
      "config": {
        "mode": "sandbox",
        "api_endpoint": "https://healthidsbx.abdm.gov.in",
        "client_id": "your-client-id",
        "client_secret": "your-secret"
      }
    }]
  }'

# 6. Verify context
curl -X GET "http://localhost:8000/api/countries/context" \
  -H "x-org-id: abc-123"

# 7. Check audit history
curl -X GET "http://localhost:8000/api/admin/orgs/abc-123/country/history" \
  -H "x-org-id: abc-123" \
  -H "x-user-roles: [\"ADMIN\"]"
```

---

## Testing with Postman

### Import Collection

Create a Postman collection with these variables:
- `base_url`: `http://localhost:8000/api`
- `org_id`: Your organization ID
- `user_id`: Your user ID
- `user_roles`: `["ADMIN"]`

### Pre-request Script

Add this to collection pre-request:
```javascript
pm.request.headers.add({
  key: 'x-org-id',
  value: pm.variables.get('org_id')
});
pm.request.headers.add({
  key: 'x-user-id',
  value: pm.variables.get('user_id')
});
pm.request.headers.add({
  key: 'x-user-roles',
  value: pm.variables.get('user_roles')
});
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:
- 100 requests per minute for public endpoints
- 50 requests per minute for admin endpoints
- Cache responses for 5 minutes

---

## Webhooks (Future)

Planned webhook events:
- `country_pack.enabled`
- `country_pack.disabled`
- `module.enabled`
- `module.disabled`
- `module.config_updated`

---

## SDK (Future)

Planned SDKs:
- JavaScript/TypeScript
- Python
- Java
- Go

Example usage:
```typescript
import { CountryClient } from '@ehrconnect/country-sdk';

const client = new CountryClient({
  baseUrl: 'http://localhost:8000/api',
  orgId: 'abc-123',
  apiKey: 'your-api-key'
});

// Get context
const context = await client.getContext();

// Enable module
await client.enableModule('abha-m1', {
  mode: 'sandbox'
});
```

---

## Support

For API issues:
- Check the error response for details
- Review audit logs
- Verify authentication headers
- Check permissions

Documentation:
- Full Guide: `docs/COUNTRY_SPECIFIC_SYSTEM.md`
- Quick Start: `docs/COUNTRY_SPECIFIC_QUICK_START.md`
