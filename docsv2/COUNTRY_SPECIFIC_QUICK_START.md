# Country-Specific System - Quick Start Guide

## Overview

The Country-Specific System allows your EHR to support different countries with their unique:
- Regulatory requirements (HIPAA, GDPR, ABDM, etc.)
- Healthcare identifiers (ABHA for India, NPI for USA, etc.)
- Localization (language, currency, date formats)
- Country-specific modules and integrations

## Quick Setup (5 Minutes)

### Step 1: Run Database Migration

```bash
cd ehr-api
psql -U postgres -d ehrconnect -f src/database/migrations/022_country_specific_system.sql
```

This creates:
- Country packs for India, USA, and UAE
- ABHA modules (M1, M2, M3) for India
- All necessary tables and indexes

### Step 2: Add CountryProvider to Your App

Edit `ehr-web/src/app/layout.tsx`:

```tsx
import { CountryProvider } from '@/contexts/country-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <SpecialtyProvider>
            <CountryProvider>  {/* Add this */}
              {children}
            </CountryProvider>
          </SpecialtyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Step 3: Enable Country Pack for Your Organization

**Option A: Via UI**
1. Navigate to `/admin/settings/country`
2. Select your country (India, USA, or UAE)
3. Click "Enable Country Pack"
4. Enable desired modules

**Option B: Via SQL**
```sql
-- Enable India pack for organization
INSERT INTO org_country_settings (
  org_id, country_code, pack_slug, pack_version,
  enabled, scope, created_by
) VALUES (
  'your-org-id', 'IN', 'india', '1.0.0',
  true, 'org', 'your-user-id'
);

-- Enable ABHA M1 module
INSERT INTO org_enabled_modules (
  org_id, country_code, module_code,
  enabled, scope, config, status, created_by
) VALUES (
  'your-org-id', 'IN', 'abha-m1',
  true, 'org', '{"mode": "sandbox"}'::jsonb, 'active', 'your-user-id'
);
```

### Step 4: Use in Your Components

```tsx
'use client';

import { useCountryContext, useIsModuleEnabled } from '@/contexts/country-context';
import AbhaRegistration from '@/features/countries/india/abha-m1/AbhaRegistration';

export default function PatientRegistration() {
  const { countryPack, localization } = useCountryContext();
  const hasAbha = useIsModuleEnabled('abha-m1');

  return (
    <div>
      <h1>Patient Registration</h1>

      {/* Show country-specific components */}
      {hasAbha && (
        <AbhaRegistration
          orgId={orgId}
          patientId={patientId}
          config={moduleConfig}
          onSuccess={(data) => console.log('ABHA created:', data)}
        />
      )}

      {/* Use localization */}
      <p>Currency: {localization.currency}</p>
      <p>Date Format: {localization.dateFormat}</p>
    </div>
  );
}
```

## India ABHA Integration Setup

### Prerequisites

1. Register at [ABDM Sandbox](https://sandbox.abdm.gov.in)
2. Create a Health Facility account
3. Get Client ID and Client Secret

### Configure ABHA M1 Module

1. Go to `/admin/settings/country`
2. Enable the "abha-m1" module
3. Configure settings:
   - **API Endpoint**: `https://healthidsbx.abdm.gov.in`
   - **Client ID**: Your ABDM Client ID
   - **Client Secret**: Your ABDM Client Secret
   - **Mode**: `sandbox` (for testing)

### Implement Backend APIs

Create these endpoints in your backend (ehr-api):

```javascript
// POST /api/abha/m1/generate-aadhaar-otp
router.post('/abha/m1/generate-aadhaar-otp', async (req, res) => {
  const { aadhaar, patientId } = req.body;

  // Call ABDM API to generate OTP
  const response = await fetch('https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ aadhaar })
  });

  const data = await response.json();
  res.json({ txnId: data.txnId });
});

// POST /api/abha/m1/verify-otp
router.post('/abha/m1/verify-otp', async (req, res) => {
  const { otp, txnId, patientId } = req.body;

  // Call ABDM API to verify OTP and create ABHA
  const response = await fetch('https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/verifyOTP', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ otp, txnId })
  });

  const abhaData = await response.json();

  // Save to your database
  await saveAbhaToPatient(patientId, abhaData);

  res.json({ abha: abhaData });
});
```

### Test in Sandbox

Use ABDM's test data:
- Test Aadhaar numbers are provided in the sandbox
- Test OTPs are provided in the sandbox
- No real Aadhaar verification happens in sandbox mode

## Common Use Cases

### 1. Show ABHA Card in Patient Profile

```tsx
import { useIsModuleEnabled, useCountryModule } from '@/contexts/country-context';

export default function PatientProfile({ patientId }) {
  const hasAbha = useIsModuleEnabled('abha-m1');
  const abhaModule = useCountryModule('abha-m1');

  if (!hasAbha) return null;

  return (
    <div>
      {/* Show ABHA details */}
      <AbhaCard patientId={patientId} />
    </div>
  );
}
```

### 2. Conditional Form Fields Based on Country

```tsx
import { useCountryContext } from '@/contexts/country-context';

export default function PatientForm() {
  const { countryPack } = useCountryContext();

  return (
    <form>
      {/* Common fields */}
      <input name="name" />

      {/* India-specific */}
      {countryPack?.countryCode === 'IN' && (
        <input name="aadhaar" placeholder="Aadhaar Number" />
      )}

      {/* USA-specific */}
      {countryPack?.countryCode === 'US' && (
        <input name="ssn" placeholder="Social Security Number" />
      )}
    </form>
  );
}
```

### 3. Format Dates/Numbers Based on Locale

```tsx
import { useLocalization } from '@/contexts/country-context';

export default function AppointmentsList() {
  const { dateFormat, numberFormat } = useLocalization();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(numberFormat, {
      dateStyle: 'medium'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(numberFormat, {
      style: 'currency',
      currency: localization.currency
    }).format(amount);
  };

  return (
    <div>
      <p>Date: {formatDate(appointment.date)}</p>
      <p>Fee: {formatCurrency(appointment.fee)}</p>
    </div>
  );
}
```

## API Endpoints

### Get Current Country Context
```bash
curl -X GET "http://localhost:8000/api/countries/context" \
  -H "x-org-id: your-org-id"
```

### List All Available Countries
```bash
curl -X GET "http://localhost:8000/api/countries/packs"
```

### Enable Country Pack (Admin)
```bash
curl -X PUT "http://localhost:8000/api/admin/orgs/your-org-id/country" \
  -H "Content-Type: application/json" \
  -H "x-org-id: your-org-id" \
  -H "x-user-roles: [\"ADMIN\"]" \
  -d '{
    "countryCode": "IN",
    "scope": "org"
  }'
```

### Enable Module (Admin)
```bash
curl -X PUT "http://localhost:8000/api/admin/orgs/your-org-id/country/modules" \
  -H "Content-Type: application/json" \
  -H "x-org-id: your-org-id" \
  -d '{
    "enable": [
      {
        "countryCode": "IN",
        "moduleCode": "abha-m1",
        "config": {
          "mode": "sandbox",
          "api_endpoint": "https://healthidsbx.abdm.gov.in"
        }
      }
    ]
  }'
```

## Troubleshooting

### Country pack not showing in UI

1. Check if migration ran successfully:
```sql
SELECT * FROM country_packs;
```

2. Check if API is accessible:
```bash
curl http://localhost:8000/api/countries/packs
```

### ABHA module not working

1. Verify module is enabled:
```sql
SELECT * FROM org_enabled_modules
WHERE org_id = 'your-org-id'
  AND module_code = 'abha-m1';
```

2. Check configuration:
```sql
SELECT config FROM org_enabled_modules
WHERE module_code = 'abha-m1';
```

3. Verify ABDM credentials are correct
4. Check if you're in sandbox mode and using test data

### Context not loading

1. Check browser console for errors
2. Verify session has org_id
3. Check network tab for API calls
4. Ensure CountryProvider is wrapping your app

## Next Steps

1. **Add More Countries**: See `docs/COUNTRY_SPECIFIC_SYSTEM.md` for instructions
2. **Implement ABHA M2**: Health record linking
3. **Implement ABHA M3**: Consent management
4. **Create Custom Modules**: Add country-specific features
5. **Set up Production**: Configure production ABDM credentials

## Resources

- **Full Documentation**: `docs/COUNTRY_SPECIFIC_SYSTEM.md`
- **ABDM Documentation**: https://abdm.gov.in
- **ABDM Sandbox**: https://sandbox.abdm.gov.in
- **Migration File**: `ehr-api/src/database/migrations/022_country_specific_system.sql`
- **API Routes**: `ehr-api/src/routes/countries.js`
- **Context Provider**: `ehr-web/src/contexts/country-context.tsx`

## Support

For issues or questions:
- Check the full documentation in `docs/COUNTRY_SPECIFIC_SYSTEM.md`
- Review the code examples in `ehr-web/src/features/countries/india/`
- Open an issue in your project repository
