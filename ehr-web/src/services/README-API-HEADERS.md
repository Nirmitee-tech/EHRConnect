# API Headers - Authentication & Multi-Tenancy Guide

## Problem
API calls in new components are failing with error: `"Missing required headers: x-org-id, x-user-id"`

## Root Cause
Backend APIs require these headers for:
- **Authentication**: Identifying which user is making the request
- **Multi-tenancy**: Isolating data by organization
- **Authorization**: Enforcing role-based access control

The old API client was reading from `localStorage`, which may not be populated in new components.

## Solution

### 1. Use the `useApiHeaders` Hook (Recommended)

For React components making API calls:

```typescript
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { obgynService } from '@/services/obgyn.service';

function MyComponent() {
  const headers = useApiHeaders(); // Gets headers from session automatically

  const loadData = async () => {
    // Pass headers to service methods
    const data = await obgynService.getIVFCycles(patientId, episodeId, headers);
    setData(data);
  };

  return <div>...</div>;
}
```

### 2. Use the `useApiClient` Hook (Alternative)

For components using axios directly:

```typescript
import { useApiClient } from '@/hooks/useApiClient';

function MyComponent() {
  const apiClient = useApiClient(); // Pre-configured with session headers

  const loadData = async () => {
    const response = await apiClient.get(`/patients/${patientId}/data`);
    setData(response.data);
  };

  return <div>...</div>;
}
```

### 3. Update Service Method Calls

All service methods in `obgynService`, `appointmentService`, etc. accept an optional `headers` parameter:

**Before (❌ Will fail with "Missing required headers"):**
```typescript
const data = await obgynService.getIVFCycles(patientId, episodeId);
```

**After (✅ Correct):**
```typescript
const headers = useApiHeaders();
const data = await obgynService.getIVFCycles(patientId, episodeId, headers);
```

## Example: Complete Component Update

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { obgynService } from '@/services/obgyn.service';

export function IVFCaseSheet({ patientId, episodeId }: Props) {
  // Get headers from session
  const headers = useApiHeaders();

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycles();
  }, [patientId, episodeId]);

  const loadCycles = async () => {
    try {
      setLoading(true);
      // Pass headers to service call
      const data = await obgynService.getIVFCycles(patientId, episodeId, headers);
      setCycles(data);
    } catch (error) {
      console.error('Error loading cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (cycleData: any) => {
    try {
      // Pass headers to all service calls
      const updated = await obgynService.updateIVFCycle(
        patientId,
        cycleData.id,
        cycleData,
        headers  // ← Don't forget this!
      );
      setCycles(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  return <div>...</div>;
}
```

## Common Patterns

### Pattern 1: Loading Data on Mount
```typescript
const headers = useApiHeaders();

useEffect(() => {
  const loadData = async () => {
    const data = await someService.getData(id, headers);
    setState(data);
  };
  loadData();
}, [id, headers]); // Include headers in dependencies
```

### Pattern 2: Saving Data on User Action
```typescript
const headers = useApiHeaders();

const handleSave = async () => {
  await someService.saveData(patientId, formData, headers);
};
```

### Pattern 3: Server Components (API Routes)
For server components and API routes, headers are automatically set by the middleware:

```typescript
// app/api/patients/route.ts
export async function GET(request: Request) {
  // Headers are already in request.headers from middleware
  const orgId = request.headers.get('x-org-id');
  const userId = request.headers.get('x-user-id');

  // Use them in your logic
  const data = await db.query('SELECT * FROM patients WHERE org_id = $1', [orgId]);
  return Response.json(data);
}
```

## Troubleshooting

### Error: "Missing required headers"
**Cause**: Service method called without headers
**Fix**: Add `const headers = useApiHeaders()` and pass to service calls

### Error: "Cannot read property 'org_id' of undefined"
**Cause**: Session not loaded yet
**Fix**: Add loading check:
```typescript
const { data: session, status } = useSession();
const headers = useApiHeaders();

if (status === 'loading') {
  return <LoadingSpinner />;
}
```

### Error: Headers are empty strings
**Cause**: User not properly authenticated or onboarding not completed
**Fix**: Check session state and redirect if needed:
```typescript
const { data: session } = useSession();

if (!session?.org_id) {
  // User needs to complete onboarding
  router.push('/onboarding');
  return null;
}
```

## Session Structure

The session contains these fields needed for headers:
```typescript
{
  user: {
    id: string;      // → x-user-id
    email: string;
  },
  org_id: string;    // → x-org-id
  org_slug: string;  // → x-org-slug (optional)
  location_ids: string[]; // → x-location-ids (optional)
}
```

## Backward Compatibility

The old `localStorage` approach still works for existing components, but new components should use the session-based approach for better security and reliability.

## Migration Checklist

For each component using `obgynService` or similar:

- [ ] Add `import { useApiHeaders } from '@/hooks/useApiHeaders';`
- [ ] Add `const headers = useApiHeaders();` in component
- [ ] Update all service calls to pass `headers` as last parameter
- [ ] Test that API calls work correctly
- [ ] Remove any hardcoded `localStorage.setItem('orgId', ...)` calls
