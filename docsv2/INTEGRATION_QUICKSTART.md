# 🚀 Integration Quickstart Guide

> **Quick reference for developers working with EHRConnect billing and integrations**

## Quick Links

- [Main Guide](../BILLING_INTEGRATION_GUIDE.md)
- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)

## 5-Minute Setup

### 1. Run Database Migration

```bash
cd ehr-api
psql -U medplum -d medplum -f src/database/migrations/003_billing_module.sql
```

### 2. Configure Credentials

```sql
INSERT INTO billing_tenant_settings
  (org_id, claim_md_account_key, claim_md_token, active)
VALUES
  ('your-org-uuid', 'your-account-key', 'your-token', true);
```

### 3. Start Server

```bash
cd ehr-api
npm install
npm run dev

# Backend will be at http://localhost:8000
```

### 4. Test API

```bash
curl -X GET http://localhost:8000/api/billing/dashboard/kpis \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-org-id: YOUR_ORG_ID"
```

## Common Operations

### Check Eligibility

```javascript
const billingService = require('./services/billing.service');

const result = await billingService.checkEligibility(
  orgId,
  {
    patientId: 'patient-123',
    payerId: 'payer-456',
    memberID: 'MEM123456',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-15',
    serviceDate: '2025-01-15'
  },
  userId
);
```

### Submit Claim

```javascript
// 1. Create draft
const claim = await billingService.createClaim(orgId, claimData, userId);

// 2. Validate
const validation = await billingService.validateClaim(orgId, claim.id);

// 3. Submit
if (validation.valid) {
  const result = await billingService.submitClaim(orgId, claim.id, userId);
}
```

### Check Claim Status

```javascript
const status = await claimMDService.checkClaimStatus(orgId, claimMdId);
```

## File Structure

```
ehr-api/
├── src/
│   ├── services/
│   │   ├── claimmd.service.js       # Claim.MD API wrapper
│   │   ├── billing.service.js       # Business logic
│   │   └── billing.jobs.js          # Background jobs
│   ├── routes/
│   │   └── billing.js               # REST API endpoints
│   ├── integrations/
│   │   ├── base-handler.js          # Base integration class
│   │   ├── claimmd.handler.js       # Claim.MD plugin
│   │   └── index.js                 # Handler registry
│   └── database/
│       └── migrations/
│           └── 003_billing_module.sql
```

## Environment Variables

```env
# Claim.MD (Optional - stored in database per org)
CLAIMMD_API_URL=https://api.claim.md/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medplum

# Server
PORT=8000
NODE_ENV=development
```

## Common Issues

### Issue: Background jobs not starting

**Solution**: Check that migrations ran successfully and billing tables exist.

```bash
psql -U medplum -d medplum -c "\dt billing_*"
```

### Issue: "Claim.MD credentials not configured"

**Solution**: Add credentials to billing_tenant_settings table.

```sql
SELECT * FROM billing_tenant_settings WHERE org_id = 'your-org-id';
```

### Issue: ERA files not downloading

**Solution**: Check that remittance background job is running and credentials are valid.

```javascript
// Manually trigger
const billingJobs = require('./services/billing.jobs');
await billingJobs.triggerJob('remittanceFetch');
```

## Development Workflow

### Adding a New Integration

1. **Create Handler File**
   ```bash
   touch ehr-api/src/integrations/myvendor.handler.js
   ```

2. **Extend Base Handler**
   ```javascript
   const BaseIntegrationHandler = require('./base-handler');
   
   class MyVendorHandler extends BaseIntegrationHandler {
     constructor() {
       super('myvendor');
     }
     
     async execute(integration, operation, params) {
       // Implementation
     }
   }
   
   module.exports = new MyVendorHandler();
   ```

3. **Register Handler**
   ```javascript
   // In integrations/index.js
   const myVendorHandler = require('./myvendor.handler');
   integrationService.registerHandler('myvendor', myVendorHandler);
   ```

### Testing

```bash
# Run tests
npm test

# Test specific endpoint
npm run test:api -- --grep "eligibility"

# Manual testing with curl
curl -X POST http://localhost:8000/api/billing/claims \
  -H "Content-Type: application/json" \
  -d @test/fixtures/claim.json
```

## Next Steps

- Read the [full integration guide](../BILLING_INTEGRATION_GUIDE.md)
- Review [API documentation](./api-reference.md)
- Understand [database schema](./database-schema.md)
- Check [deployment guide](./deployment-guide.md)

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Complete guides in `/docs`
- Code Comments: Inline documentation in source files
