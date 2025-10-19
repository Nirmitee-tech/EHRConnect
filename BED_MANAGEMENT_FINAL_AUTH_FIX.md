# Bed Management - Final Authentication Fix ✅

## Summary

Fixed the authentication issue by **matching the exact pattern used by the Inventory module**, which uses `next-auth` session and passes `orgId` and `userId` as function parameters rather than retrieving them from localStorage.

## Changes Made

### 1. Updated Bed Management Page (`page.tsx`)

**Added:**
- `useSession` from `next-auth/react`
- `useFacility` context hook
- State management for `orgId` and `userId` from session
- Proper loading states for session authentication

**Pattern:**
```typescript
const { data: session, status } = useSession();
const { currentFacility } = useFacility();

const [orgId, setOrgId] = useState<string | null>(null);
const [userId, setUserId] = useState<string | null>(null);

// Get orgId and userId from session
useEffect(() => {
  if (!session) return;

  if (session.org_id) {
    setOrgId(session.org_id);
  }
  if (session.user_id) {
    setUserId(session.user_id);
  }
}, [session]);

// Load data when orgId is available
useEffect(() => {
  if (orgId) {
    loadData();
  }
}, [orgId, userId]);
```

**API Calls:**
```typescript
const [stats, summary, inpatients] = await Promise.all([
  bedManagementService.getBedOccupancyStats(orgId, userId || undefined),
  bedManagementService.getHospitalizationSummary(orgId, userId || undefined),
  bedManagementService.getCurrentInpatients(orgId, userId || undefined)
]);
```

### 2. Updated Bed Management Service (`bed-management.ts`)

**Changed all functions** to accept `orgId` and `userId` as the first parameters:

**Before:**
```typescript
export async function getBedOccupancyStats(locationId?: string): Promise<BedOccupancyStats> {
  const { orgId, userId } = getAuthContext(); // ❌ localStorage lookup
  // ...
}
```

**After:**
```typescript
export async function getBedOccupancyStats(
  orgId: string,
  userId?: string,
  locationId?: string
): Promise<BedOccupancyStats> {
  const response = await fetch(`${API}/analytics/occupancy?${params}`, {
    headers: getAuthHeaders(orgId, userId), // ✅ Parameters passed in
  });
  // ...
}
```

**Updated Functions (ALL functions now follow this pattern):**
- `getBedOccupancyStats(orgId, userId?, locationId?)`
- `getWardOccupancy(orgId, userId?, locationId?)`
- `getHospitalizationSummary(orgId, userId?, locationId?)`
- `getHospitalizations(orgId, userId?, filters?)`
- `getCurrentInpatients(orgId, userId?, locationId?)`
- `getWards(orgId, userId?, filters?)`
- `getWardById(orgId, userId?, wardId)`
- `createWard(orgId, userId?, wardData)`
- `updateWard(orgId, userId?, wardId, wardData)`
- `getBeds(orgId, userId?, filters?)`
- `getBedById(orgId, userId?, bedId)`
- `createBed(orgId, userId?, bedData)`
- `updateBedStatus(orgId, userId?, request)`
- `getHospitalizationById(orgId, userId?, hospitalizationId)`
- `admitPatient(orgId, userId?, admissionData)`
- `assignBed(orgId, userId?, request)`
- `transferBed(orgId, userId?, request)`
- `dischargePatient(orgId, userId?, request)`
- `getAvailableBeds(orgId, userId?, wardId)`
- `searchAvailableBeds(orgId, userId?, criteria)`
- `getPatientHospitalizationHistory(orgId, userId?, patientId)`

### 3. Headers Generation

The `getAuthHeaders()` function remains the same - it properly creates the headers with `x-org-id` and `x-user-id`:

```typescript
function getAuthHeaders(orgId: string, userId?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-org-id': orgId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
}
```

## Matching Inventory Module Pattern

This exactly matches how the inventory module works:

### Inventory Page Pattern:
```typescript
// inventory/page.tsx
const { data: session, status } = useSession();
const [orgId, setOrgId] = useState<string | null>(null);
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  if (!session) return;
  if (session.org_id) setOrgId(session.org_id);
  if (session.user_id) setUserId(session.user_id);
}, [session]);

// API calls with parameters
const overview = await inventoryApi.getOverview(orgId!, userId);
```

### Inventory Service Pattern:
```typescript
// inventory.service.ts
async getOverview(orgId: string, userId?: string, params?: {...}): Promise<InventoryOverview> {
  const response = await fetch(url, {
    headers: this.getHeaders(orgId, userId),
  });
  return response.json();
}
```

## How It Works Now

```
┌─────────────────────────────────────────────────────┐
│ 1. User logs in via next-auth                       │
│    → Session contains org_id and user_id            │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 2. Bed Management Page loads                        │
│    → useSession() hook gets session data            │
│    → Extract orgId and userId from session          │
│    → Store in component state                       │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 3. Call service functions with auth params          │
│    getBedOccupancyStats(orgId, userId)              │
│    ↓                                                 │
│    Service adds headers: x-org-id, x-user-id        │
│    ↓                                                 │
│    Fetch API call to backend                        │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 4. Backend validates headers                        │
│    → Checks x-org-id header exists                  │
│    → Checks x-user-id header (optional)             │
│    → Processes request                              │
│    → Returns data                                   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 5. Page displays data                               │
│    → Occupancy stats                                │
│    → Current inpatients                             │
│    → Hospitalization summary                        │
└─────────────────────────────────────────────────────┘
```

## Session Object Structure

The `next-auth` session object contains:

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    // ...
  },
  org_id: string;      // ✅ Used for x-org-id header
  user_id: string;     // ✅ Used for x-user-id header
  // ...
}
```

## Testing

1. **Verify you're logged in:**
   - Check that the dashboard or other pages work
   - Session should be active

2. **Navigate to Bed Management:**
   - Click "Bed Management" in sidebar
   - Should show loading spinner briefly
   - Then display dashboard with data (or empty state if no data)

3. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Refresh Bed Management page
   - Look for requests to `/api/bed-management/analytics/*`
   - Check Request Headers should include:
     ```
     x-org-id: <your-org-id>
     x-user-id: <your-user-id>
     ```

4. **Verify No Errors:**
   - No "Missing authentication context" errors
   - No "Organization ID not found" errors
   - Data loads successfully

## Files Modified

1. ✅ `ehr-web/src/app/bed-management/page.tsx`
   - Added `useSession` and `useFacility` hooks
   - Added session-based auth context
   - Pass `orgId` and `userId` to all service calls
   - Added loading and auth error states

2. ✅ `ehr-web/src/services/bed-management.ts`
   - Updated all function signatures to accept `orgId` and `userId` as parameters
   - Removed localStorage lookups from service functions
   - Kept `getAuthContext()` for backward compatibility but marked as deprecated

## Benefits of This Approach

✅ **Consistent** - Matches existing patterns (inventory, etc.)
✅ **Type-safe** - TypeScript ensures correct parameter passing
✅ **Explicit** - No hidden dependencies on localStorage
✅ **Testable** - Easy to mock auth parameters
✅ **SSR-friendly** - Works with Next.js server components
✅ **Maintainable** - Clear data flow from session to service

## Troubleshooting

### Issue: Still seeing "Organization ID not found"
**Solution:** Make sure you're logged in. Check session:
```typescript
console.log('Session:', session);
console.log('org_id:', session?.org_id);
console.log('user_id:', session?.user_id);
```

### Issue: Session is undefined
**Solution:** The `SessionProvider` must wrap your app. Check `app/layout.tsx` or `app/providers.tsx`

### Issue: Headers not being sent
**Solution:** Check that the service functions are being called with the correct parameters from the page component.

## Success Criteria

✅ No authentication errors
✅ Data loads on page refresh
✅ Headers sent correctly in requests
✅ Matches inventory module behavior
✅ Clean, maintainable code

The Bed Management module now uses the exact same authentication pattern as the rest of the application! 🎉
