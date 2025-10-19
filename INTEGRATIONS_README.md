# EHRConnect Integration System

Complete integration management system for third-party EHR, billing, payment, and communication platforms.

## Overview

The integration system allows EHRConnect to connect with 90+ external services across 19 categories including:
- **Clinical**: Epic, Cerner, athenahealth, Allscripts, eClinicalWorks
- **Financial**: Change Healthcare, Availity, Waystar, Stripe
- **Communication**: Twilio, Exotel, Plivo
- **Telehealth**: 100ms, Agora, Vonage
- **AI**: OpenAI, Anthropic, AssemblyAI, Deepgram

## Architecture

### Backend (ehr-api)

**Database**: PostgreSQL with two main tables:
- `integrations`: Stores configuration for each integration
- `integration_activity_log`: Audit log for all integration activities

**API Routes** (`/api/integrations`):
- `GET /api/integrations` - List all integrations for an organization
- `GET /api/integrations/:id` - Get single integration
- `POST /api/integrations` - Create new integration
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Delete integration
- `POST /api/integrations/:id/toggle` - Enable/disable integration
- `POST /api/integrations/:id/test` - Test connection
- `GET /api/integrations/health/status` - Get health status
- `POST /api/integrations/health/check` - Trigger health checks

**Service Layer** (`integration.service.js`):
- Manages integration lifecycle
- Handles initialization and teardown
- Executes operations via registered handlers
- Performs health checks
- Logs all activities

### Frontend (ehr-web)

**Pages**:
- `/integrations` - Integration marketplace with 90+ vendors
- Searchable by name, category, business area
- Tabs: All, Clinical, Financial, Operations, Technology
- Visual status indicators (active/inactive/error)

**Components**:
- `IntegrationConfigDrawer` - Sidebar configuration drawer
- `IntegrationConfigForm` - Smart form with wizard support
- `IntegrationConfigWizard` - Multi-step configuration wizard
- `IntegrationLogo` - Logo display with fallback

**API Client** (`lib/api/integrations.ts`):
- TypeScript client for all integration endpoints
- Type-safe interfaces
- Error handling

## Setup Instructions

### 1. Database Setup

Run the migration to create tables:

```bash
cd ehr-api
psql -U your_user -d your_database -f src/migrations/create_integrations_table.sql
```

Or if using your migration system:
```bash
npm run migrate
```

### 2. Backend Configuration

The backend is already configured. The integration routes are registered in `src/index.js`:

```javascript
const integrationsRoutes = require('./routes/integrations');
app.use('/api/integrations', integrationsRoutes);
```

Start the API server:
```bash
cd ehr-api
npm run dev
```

Server runs on `http://localhost:8000`

### 3. Frontend Configuration

Set the API URL in your environment:

```bash
# ehr-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
cd ehr-web
npm run dev
```

Frontend runs on `http://localhost:3000` (or 3002)

### 4. Test the System

1. **Navigate to Integrations Page**:
   Visit `http://localhost:3000/integrations`

2. **Configure an Integration**:
   - Search for "Epic" or any vendor
   - Click "Configure"
   - Fill in the configuration (uses wizard for complex integrations)
   - Click "Complete" to save

3. **Enable the Integration**:
   - Toggle the integration to "enabled"
   - System will attempt to initialize it

4. **Check Health Status**:
   - View status indicators on cards (green = active, red = error)
   - Run health checks via API

## Adding a New Integration

### Example: Adding Twilio Integration

#### 1. Create Handler (ehr-api/src/handlers/twilio.handler.js)

```javascript
class TwilioHandler {
  async initialize(integration) {
    // Initialize Twilio client with credentials
    console.log('Initializing Twilio:', integration.credentials.accountSid);
  }

  async execute(integration, operation, params) {
    switch (operation) {
      case 'sendSMS':
        return await this.sendSMS(integration, params);
      case 'makeCall':
        return await this.makeCall(integration, params);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async sendSMS(integration, { to, message }) {
    // Twilio API call to send SMS
    console.log(`Sending SMS to ${to}: ${message}`);
    return { success: true, messageId: 'SM123...' };
  }

  async testConnection(integration) {
    // Test Twilio connection
    return true;
  }
}

module.exports = new TwilioHandler();
```

#### 2. Register Handler (ehr-api/src/index.js or startup script)

```javascript
const twilioHandler = require('./handlers/twilio.handler');
integrationService.registerHandler('twilio', twilioHandler);
```

#### 3. Create Configuration Schema (ehr-web/src/config/integration-schemas.ts)

```typescript
export const TWILIO_SCHEMA: IntegrationConfigSchema = {
  vendorId: 'twilio',
  requiresMultiStep: false,
  steps: [
    {
      id: 'credentials',
      title: 'Account Credentials',
      fields: [
        {
          key: 'accountSid',
          label: 'Account SID',
          type: 'text',
          required: true,
          placeholder: 'AC...'
        },
        {
          key: 'authToken',
          label: 'Auth Token',
          type: 'password',
          required: true
        }
      ]
    }
  ]
};
```

#### 4. Add to Vendor List (ehr-web/src/types/integration.ts)

```typescript
{
  id: 'twilio',
  name: 'Twilio',
  category: 'communication',
  description: 'SMS, Voice, and Video Communications',
  logo: 'https://www.twilio.com/logo.png',
  website: 'https://www.twilio.com',
  documentation: 'https://www.twilio.com/docs',
  featured: false
}
```

### 5. Use the Integration

```typescript
// In your application code
const integrationService = new IntegrationService();

// Send SMS via Twilio
const result = await integrationService.executeIntegration(
  'twilio-integration-id',
  'sendSMS',
  {
    to: '+1234567890',
    message: 'Your appointment is confirmed!'
  }
);
```

## API Examples

### Create Integration

```bash
curl -X POST http://localhost:8000/api/integrations \
  -H "Content-Type: application/json" \
  -H "x-org-id: 2211a660-88f0-4fba-9961-1a43ef3b42d5" \
  -d '{
    "vendor_id": "epic",
    "enabled": false,
    "environment": "sandbox",
    "api_endpoint": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
    "credentials": {
      "clientId": "your-client-id",
      "clientSecret": "your-client-secret"
    },
    "usage_mappings": [
      { "id": "map_patient_sync", "workflow": "Patient Sync", "enabled": true }
    ]
  }'
```

### Get All Integrations

```bash
curl "http://localhost:8000/api/integrations?org_id=2211a660-88f0-4fba-9961-1a43ef3b42d5" \
  -H "x-org-id: 2211a660-88f0-4fba-9961-1a43ef3b42d5"
```

### Toggle Integration

```bash
curl -X POST http://localhost:8000/api/integrations/{id}/toggle \
  -H "Content-Type: application/json" \
  -d '{ "enabled": true }'
```

### Test Connection

```bash
curl -X POST http://localhost:8000/api/integrations/{id}/test
```

## Database Schema

### integrations table

```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL,
    vendor_id VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    environment VARCHAR(20) CHECK (environment IN ('sandbox', 'production')),
    api_endpoint TEXT,
    credentials JSONB DEFAULT '{}',
    usage_mappings JSONB DEFAULT '[]',
    health_status VARCHAR(20) DEFAULT 'inactive',
    last_tested_at TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
```

### integration_activity_log table

```sql
CREATE TABLE integration_activity_log (
    id UUID PRIMARY KEY,
    integration_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);
```

## Configuration Schema System

Integrations can define custom multi-step wizards with validation:

```typescript
{
  vendorId: 'epic',
  requiresMultiStep: true,
  oauth: {
    enabled: true,
    authUrl: 'https://fhir.epic.com/oauth2/authorize',
    scopes: ['patient/*.read']
  },
  steps: [
    {
      id: 'credentials',
      title: 'API Credentials',
      fields: [
        {
          key: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          validation: {
            pattern: '^[A-Za-z0-9_-]{10,}$',
            message: 'Invalid client ID format'
          }
        }
      ]
    }
  ]
}
```

Supported field types:
- `text`, `password`, `url`, `email`, `number`
- `select`, `textarea`, `checkbox`
- `oauth` (coming soon)

## Security Considerations

1. **Credentials**: Store securely in PostgreSQL JSONB
   - TODO: Add encryption at rest
   - TODO: Use secrets manager (AWS Secrets Manager, Vault)

2. **API Authentication**:
   - All routes should be protected with authentication middleware
   - Use org_id from authenticated session

3. **Webhook Signatures**: Verify signatures for inbound webhooks
   - Implement per-vendor signature verification

4. **Environment Separation**: Always use sandbox for testing

5. **Audit Logging**: All activities logged in `integration_activity_log`

## Troubleshooting

### Integration Won't Start

**Check logs**:
```bash
# ehr-api logs
tail -f ehr-api/logs/app.log

# Check if handler is registered
curl http://localhost:8000/api/integrations/{id}
```

**Common issues**:
- Handler not registered for vendor
- Invalid credentials
- API endpoint unreachable

### Frontend Not Loading Integrations

**Check network tab**: Should see request to `http://localhost:8000/api/integrations`

**Check CORS**: ehr-api allows `http://localhost:3000` by default

**Check org_id**: Make sure `ORG_ID` constant in `integrations/page.tsx` matches your organization

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U your_user -d your_database -c "SELECT * FROM integrations LIMIT 1;"

# Check if tables exist
psql -U your_user -d your_database -c "\dt integrations"
```

## Future Enhancements

- [ ] Webhook endpoints for each vendor
- [ ] Rate limiting and retry logic
- [ ] Credential encryption at rest
- [ ] OAuth flow automation
- [ ] Real-time status updates via WebSocket
- [ ] Integration usage metrics and analytics
- [ ] Bulk import/export configurations
- [ ] Integration testing framework
- [ ] Automated health monitoring alerts

## File Structure

```
ehr-api/
├── src/
│   ├── routes/
│   │   └── integrations.js          # API routes
│   ├── services/
│   │   └── integration.service.js   # Business logic
│   ├── handlers/                    # Integration handlers (to be added)
│   │   ├── epic.handler.js
│   │   ├── stripe.handler.js
│   │   └── twilio.handler.js
│   └── migrations/
│       └── create_integrations_table.sql

ehr-web/
├── src/
│   ├── app/
│   │   └── integrations/
│   │       └── page.tsx             # Main UI
│   ├── components/integrations/
│   │   ├── integration-config-drawer.tsx
│   │   ├── integration-config-form.tsx
│   │   ├── integration-config-wizard.tsx
│   │   └── integration-logo.tsx
│   ├── config/
│   │   └── integration-schemas.ts   # Configuration schemas
│   ├── lib/api/
│   │   └── integrations.ts          # API client
│   └── types/
│       └── integration.ts           # TypeScript types
```

## Support

For questions or issues:
1. Check this documentation
2. Review ehr-api logs
3. Test API endpoints directly with curl
4. Check database for integration records
5. Verify handler registration in code

## License

Proprietary - EHRConnect Internal Use Only
