# Country-Specific Configuration System

## Overview

The Country-Specific System enables organizations to configure country-based features, modules, regulatory compliance, and localization settings. This system works alongside the Specialty Pack system to provide comprehensive customization capabilities.

## Architecture

### Database Schema

The system uses five main tables:

1. **country_packs**: Registry of available country-specific feature packs
2. **org_country_settings**: Which country pack is enabled for each organization
3. **country_pack_audits**: Immutable audit trail of all changes
4. **country_modules**: Country-specific modules (e.g., ABHA for India)
5. **org_enabled_modules**: Which modules are enabled per organization

### Key Features

- **Country Packs**: Pre-configured settings for different countries (India, USA, UAE, etc.)
- **Localization**: Language, currency, timezone, date/number formats
- **Regulatory Compliance**: Country-specific regulatory requirements (HIPAA, GDPR, etc.)
- **Modular System**: Enable/disable specific modules per organization
- **Scope-based**: Can be applied at org or location level
- **Audit Trail**: Complete history of all configuration changes

## Available Country Packs

### India (IN)

**Features:**
- ABHA (Ayushman Bharat Health Account) Integration
- ABDM (Ayushman Bharat Digital Mission) Compliance
- CGHS (Central Government Health Scheme)
- ESIC (Employee State Insurance Corporation)
- Digital Health Records
- Telemedicine

**Modules:**
- **abha-m1**: ABHA Number Generation
- **abha-m2**: Health Record Linking
- **abha-m3**: Consent Management
- **ayushman_claims**: Ayushman Bharat Claims Processing

**Localization:**
- Languages: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati
- Currency: INR
- Timezone: Asia/Kolkata
- Date Format: DD/MM/YYYY

### United States (US)

**Features:**
- HIPAA Compliance
- Meaningful Use
- ICD-10 Codes
- CPT Codes
- NPI Integration
- VA Integration
- Medicare/Medicaid

**Modules:**
- **npi_lookup**: National Provider Identifier Lookup
- **va_integration**: Veterans Affairs Integration
- **medicare_claims**: Medicare Claims Processing
- **medicaid_claims**: Medicaid Claims Processing

**Localization:**
- Languages: English, Spanish
- Currency: USD
- Timezone: America/New_York
- Date Format: MM/DD/YYYY

### United Arab Emirates (AE)

**Features:**
- DHA (Dubai Health Authority) Compliance
- HAAD (Health Authority Abu Dhabi) Compliance
- EHS Integration
- Visa Medical Examinations
- Insurance Portal Integration

**Modules:**
- **dha_reporting**: Dubai Health Authority Reporting
- **haad_reporting**: Abu Dhabi Health Department Reporting
- **ehs_integration**: Emirates Health Services Integration
- **visa_medical**: Visa Medical Examination Module

**Localization:**
- Languages: English, Arabic
- Currency: AED
- Timezone: Asia/Dubai
- Date Format: DD/MM/YYYY

## API Endpoints

### Public Endpoints

#### Get Country Context
```
GET /api/countries/context
Headers: x-org-id, x-user-id, x-location-id
```

Returns the enabled country pack, modules, and localization for the current organization.

#### List Available Country Packs
```
GET /api/countries/packs?active=true
```

Returns all available country packs.

#### Get Country Pack Details
```
GET /api/countries/packs/:countryCode
```

Returns details for a specific country pack.

#### Get Country Modules
```
GET /api/countries/packs/:countryCode/modules?active=true
```

Returns all modules available for a country.

### Admin Endpoints (Require Admin Permission)

#### Enable Country Pack
```
PUT /api/admin/orgs/:orgId/country
Headers: x-org-id, x-user-id, x-user-roles
Body: {
  "countryCode": "IN",
  "scope": "org",
  "scopeRefId": null,
  "overrides": {}
}
```

#### Enable/Disable Modules
```
PUT /api/admin/orgs/:orgId/country/modules
Body: {
  "enable": [
    {
      "countryCode": "IN",
      "moduleCode": "abha-m1",
      "config": {},
      "scope": "org"
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

#### Update Module Configuration
```
PATCH /api/admin/orgs/:orgId/country/modules/:moduleCode
Body: {
  "config": {
    "api_endpoint": "https://healthidsbx.abdm.gov.in",
    "client_id": "your-client-id",
    "mode": "sandbox"
  }
}
```

#### Get Audit History
```
GET /api/admin/orgs/:orgId/country/history?countryCode=IN&limit=50
```

## Frontend Integration

### Country Context Provider

Wrap your app with the CountryProvider to access country settings:

```tsx
import { CountryProvider } from '@/contexts/country-context';

export default function App({ children }) {
  return (
    <CountryProvider>
      {children}
    </CountryProvider>
  );
}
```

### Hooks

#### useCountryContext()
```tsx
const {
  countryPack,
  enabledModules,
  localization,
  loading,
  error,
  refreshContext,
  hasCountryPack
} = useCountryContext();
```

#### useIsModuleEnabled(moduleCode)
```tsx
const hasAbhaM1 = useIsModuleEnabled('abha-m1');
```

#### useCountryModule(moduleCode)
```tsx
const abhaModule = useCountryModule('abha-m1');
// Returns module config, status, component paths, etc.
```

#### useLocalization()
```tsx
const { language, currency, timezone, dateFormat } = useLocalization();
```

### Conditional Rendering

```tsx
import { useIsModuleEnabled } from '@/contexts/country-context';

export default function PatientProfile() {
  const hasAbhaM1 = useIsModuleEnabled('abha-m1');

  return (
    <div>
      <h1>Patient Profile</h1>

      {hasAbhaM1 && (
        <AbhaSection />
      )}
    </div>
  );
}
```

## ABHA Integration (India)

### Overview

ABHA (Ayushman Bharat Health Account) is India's digital health identity system under the Ayushman Bharat Digital Mission (ABDM). It provides a unique 14-digit health ID for every citizen.

### Modules

#### ABHA M1: Health ID Creation

**Purpose**: Create and verify ABHA numbers using Aadhaar or Mobile OTP

**Component**: `/features/countries/india/abha-m1/AbhaRegistration.tsx`

**Features**:
- Aadhaar-based registration
- Mobile-based registration
- OTP verification
- Health ID generation

**Usage**:
```tsx
import AbhaRegistration from '@/features/countries/india/abha-m1/AbhaRegistration';

<AbhaRegistration
  orgId={orgId}
  patientId={patientId}
  config={moduleConfig}
  onSuccess={(abhaData) => console.log('ABHA created:', abhaData)}
  onError={(error) => console.error('Error:', error)}
/>
```

#### ABHA M2: Health Records Linking

**Purpose**: Link patient health records with ABHA address for sharing

**Component**: `/features/countries/india/abha-m2/HealthRecordLinking.tsx`

**Features**:
- Link health records to ABHA
- Share records across HIPs
- Care context management
- Record discovery

**API Requirements**:
- Health Information Provider (HIP) ID
- ABDM Gateway credentials
- Care context registration

#### ABHA M3: Consent Management

**Purpose**: Manage patient consent for health information sharing

**Component**: `/features/countries/india/abha-m3/ConsentManagement.tsx`

**Features**:
- Create consent requests
- Approve/deny consent
- Revoke consent
- Consent artifact management
- Purpose-based access control

**Consent Purposes**:
- `CAREMGT`: Care Management
- `BTG`: Break the Glass (Emergency)
- `PUBHLTH`: Public Health
- `HPAYMT`: Healthcare Payment
- `DSRCH`: Disease Specific Research
- `PATRQT`: Patient Requested

### ABDM API Integration

#### Prerequisites

1. Register on [ABDM Sandbox](https://sandbox.abdm.gov.in)
2. Obtain Client ID and Client Secret
3. Register as Health Information Provider (HIP) for M2
4. Register as Consent Manager for M3

#### Configuration

Navigate to **Admin > Settings > Country Modules** and configure:

- **API Endpoint**: `https://healthidsbx.abdm.gov.in` (Sandbox) or Production URL
- **Client ID**: Your ABDM Client ID
- **Client Secret**: Your ABDM Client Secret
- **Mode**: `sandbox` or `production`

#### Backend Implementation Required

The frontend components expect the following backend APIs to be implemented:

**ABHA M1 APIs**:
- `POST /api/abha/m1/generate-aadhaar-otp`
- `POST /api/abha/m1/generate-mobile-otp`
- `POST /api/abha/m1/verify-otp`

**ABHA M2 APIs**:
- `POST /api/abha/m2/link-care-context`
- `POST /api/abha/m2/discover-patient`
- `GET /api/abha/m2/care-contexts/:patientId`

**ABHA M3 APIs**:
- `POST /api/abha/m3/consent-request`
- `POST /api/abha/m3/consent-grant`
- `POST /api/abha/m3/consent-revoke`
- `GET /api/abha/m3/consent-requests/:patientId`

These should interface with the ABDM Gateway APIs as per the official documentation.

## Database Migration

Run the migration to set up the country-specific system:

```bash
psql -U your_user -d your_database -f ehr-api/src/database/migrations/022_country_specific_system.sql
```

This will:
- Create all necessary tables
- Seed default country packs (India, USA, UAE)
- Seed India ABHA modules (M1, M2, M3)
- Set up audit triggers
- Configure proper indexes

## Adding New Countries

To add a new country pack:

1. **Insert Country Pack**:
```sql
INSERT INTO country_packs (
  country_code, country_name, region, pack_slug,
  regulatory_body, default_language, default_currency,
  default_timezone, features, modules
) VALUES (
  'GB', 'United Kingdom', 'Europe', 'uk',
  'NHS', 'en', 'GBP', 'Europe/London',
  '{"nhs_integration": true}'::jsonb,
  '{"nhs_lookup": {"enabled": true}}'::jsonb
);
```

2. **Add Country Modules** (if needed):
```sql
INSERT INTO country_modules (
  country_code, module_code, module_name, module_type,
  description, component_path
) VALUES (
  'GB', 'nhs-integration', 'NHS Integration', 'integration',
  'Integrate with NHS systems', '/features/countries/uk/nhs-integration/NHSIntegration.tsx'
);
```

3. **Create React Components**:
```bash
mkdir -p ehr-web/src/features/countries/uk/nhs-integration
```

4. **Update Documentation**

## Security Considerations

1. **Credentials Storage**: Module credentials (API keys, secrets) are stored in the `org_enabled_modules.credentials` JSONB field and should be encrypted at rest.

2. **Data Residency**: Some countries require data to be stored within their borders. The `data_residency_required` flag indicates this requirement.

3. **Compliance**: Each country pack specifies regulatory compliance requirements (HIPAA, GDPR, etc.). Ensure your infrastructure meets these requirements.

4. **Audit Trail**: All configuration changes are logged in `country_pack_audits` for compliance and debugging.

5. **Permissions**: Only users with `ADMIN`, `SUPER_ADMIN`, `ORG_OWNER`, or `org:manage_settings` roles can modify country settings.

## Testing

### Sandbox Mode

Most country modules support sandbox mode for testing:

```typescript
const config = {
  mode: 'sandbox',
  api_endpoint: 'https://sandbox.example.com'
};
```

### ABDM Sandbox

For India's ABHA integration, use:
- **Sandbox URL**: https://sandbox.abdm.gov.in
- **Test Aadhaar Numbers**: Provided by ABDM
- **Test Mobile Numbers**: Provided by ABDM

## Troubleshooting

### Country pack not showing up

1. Check if the country pack is active:
```sql
SELECT * FROM country_packs WHERE country_code = 'IN';
```

2. Check org settings:
```sql
SELECT * FROM org_country_settings WHERE org_id = 'your-org-id';
```

### Module not enabled

1. Verify module is active:
```sql
SELECT * FROM country_modules WHERE module_code = 'abha-m1';
```

2. Check org enabled modules:
```sql
SELECT * FROM org_enabled_modules WHERE org_id = 'your-org-id' AND module_code = 'abha-m1';
```

### API errors

1. Check module configuration in org_enabled_modules
2. Verify credentials are correct
3. Check API endpoint and mode (sandbox vs production)
4. Review audit logs for any configuration changes

## Support

For issues or questions:
- ABDM Documentation: https://abdm.gov.in
- ABDM Support: support@abdm.gov.in
- System Issues: Create an issue in your project repository

## Roadmap

- [ ] Additional country modules for India (CGHS, ESIC)
- [ ] USA: NPI lookup, Medicare integration
- [ ] UAE: DHA/HAAD reporting
- [ ] More countries: Canada, Australia, Singapore
- [ ] Enhanced localization support
- [ ] Multi-language UI components
- [ ] Regional date/time pickers
