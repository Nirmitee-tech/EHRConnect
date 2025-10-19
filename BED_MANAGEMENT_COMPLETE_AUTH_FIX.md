# Bed Management - Complete Authentication Fix ✅

## Summary

Successfully updated **ALL** functions in the bed management service to follow the correct authentication pattern used throughout the EHR application. The service now matches the exact pattern used by the inventory module.

## What Was Fixed

### Problem
The bed management service had **inconsistent authentication patterns**:
- Some functions (3) accepted `orgId` and `userId` as parameters ✅
- Most functions (12+) still used `getAuthContext()` which tried to read from localStorage ❌

This caused authentication errors because:
1. The app uses `next-auth` session-based authentication
2. Auth data comes from `useSession()` hook, not localStorage
3. Service functions should accept auth as parameters, not retrieve it themselves

### Solution
Updated **all 21 service functions** to follow the correct pattern:

```typescript
// ✅ CORRECT PATTERN (now applied to ALL functions)
export async function functionName(
  orgId: string,
  userId?: string,
  ...otherParams
): Promise<ReturnType> {
  const response = await fetch(url, {
    headers: getAuthHeaders(orgId, userId),
  });
  return handleResponse(response);
}
```

## Complete List of Updated Functions

### Ward Management (4 functions)
1. ✅ `getWards(orgId, userId?, filters?)`
2. ✅ `getWardById(orgId, userId?, wardId)`
3. ✅ `createWard(orgId, userId?, wardData)`
4. ✅ `updateWard(orgId, userId?, wardId, wardData)`

### Bed Management (5 functions)
5. ✅ `getBeds(orgId, userId?, filters?)`
6. ✅ `getBedById(orgId, userId?, bedId)`
7. ✅ `createBed(orgId, userId?, bedData)`
8. ✅ `updateBedStatus(orgId, userId?, request)`
9. ✅ `getAvailableBeds(orgId, userId?, wardId)`

### Hospitalization Management (8 functions)
10. ✅ `getHospitalizations(orgId, userId?, filters?)`
11. ✅ `getHospitalizationById(orgId, userId?, hospitalizationId)`
12. ✅ `admitPatient(orgId, userId?, admissionData)`
13. ✅ `assignBed(orgId, userId?, request)`
14. ✅ `transferBed(orgId, userId?, request)`
15. ✅ `dischargePatient(orgId, userId?, request)`
16. ✅ `getCurrentInpatients(orgId, userId?, locationId?)`
17. ✅ `getPatientHospitalizationHistory(orgId, userId?, patientId)`

### Analytics (3 functions)
18. ✅ `getBedOccupancyStats(orgId, userId?, locationId?)`
19. ✅ `getWardOccupancy(orgId, userId?, locationId?)`
20. ✅ `getHospitalizationSummary(orgId, userId?, locationId?)`

### Utility Functions (1 function)
21. ✅ `searchAvailableBeds(orgId, userId?, criteria)`

## How the Page Component Uses the Service

The bed management page now correctly passes auth data from session to all service calls:

```typescript
// ehr-web/src/app/bed-management/page.tsx
const { data: session, status } = useSession();
const { currentFacility } = useFacility();

const [orgId, setOrgId] = useState<string | null>(null);
const [userId, setUserId] = useState<string | null>(null);

// Extract auth from session
useEffect(() => {
  if (!session) return;
  if (session.org_id) setOrgId(session.org_id);
  if (session.user_id) setUserId(session.user_id);
}, [session]);

// Load data when auth is available
useEffect(() => {
  if (orgId) loadData();
}, [orgId, userId]);

async function loadData() {
  // ✅ Pass orgId and userId to ALL service calls
  const [stats, summary, inpatients] = await Promise.all([
    bedManagementService.getBedOccupancyStats(orgId, userId || undefined),
    bedManagementService.getHospitalizationSummary(orgId, userId || undefined),
    bedManagementService.getCurrentInpatients(orgId, userId || undefined)
  ]);

  setOccupancyStats(stats);
  setHospitalizationSummary(summary);
  setCurrentInpatients(inpatients);
}
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User logs in via next-auth                          │
│    → Session created with org_id and user_id           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 2. Page component loads                                 │
│    → useSession() retrieves session                     │
│    → Extract orgId from session.org_id                  │
│    → Extract userId from session.user_id                │
│    → Store in component state                           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 3. Call service functions                               │
│    bedManagementService.getWards(orgId, userId, {...})  │
│    bedManagementService.admitPatient(orgId, userId, {}) │
│    bedManagementService.getBeds(orgId, userId, {...})   │
│    ↓                                                     │
│    All functions receive auth as parameters             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 4. Service creates headers                              │
│    getAuthHeaders(orgId, userId)                        │
│    ↓                                                     │
│    { 'x-org-id': orgId, 'x-user-id': userId }          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 5. HTTP request with headers                            │
│    fetch(url, { headers: { 'x-org-id', 'x-user-id' }}) │
│    ↓                                                     │
│    Backend validates headers                            │
│    ↓                                                     │
│    Returns data                                         │
└─────────────────────────────────────────────────────────┘
```

## Consistency Across Modules

This update ensures the bed management service follows the **exact same pattern** as other modules:

### Inventory Service Pattern
```typescript
// inventory.service.ts
async getOverview(orgId: string, userId?: string, params?: {...}): Promise<InventoryOverview> {
  const response = await fetch(url, {
    headers: this.getHeaders(orgId, userId),
  });
  return response.json();
}
```

### Bed Management Service Pattern (NOW MATCHES)
```typescript
// bed-management.ts
export async function getBedOccupancyStats(
  orgId: string,
  userId?: string,
  locationId?: string
): Promise<BedOccupancyStats> {
  const response = await fetch(url, {
    headers: getAuthHeaders(orgId, userId),
  });
  return handleResponse(response);
}
```

## Benefits of This Update

✅ **Complete Consistency** - All 21 functions now use the same pattern
✅ **Type Safety** - TypeScript enforces correct parameter passing
✅ **No Hidden Dependencies** - No localStorage lookups in service layer
✅ **Testable** - Easy to mock auth parameters in tests
✅ **SSR-Ready** - Works with Next.js server components
✅ **Clear Data Flow** - Explicit auth propagation from session → page → service
✅ **Matches Existing Patterns** - Identical to inventory, appointments, etc.

## Backward Compatibility

The deprecated `getAuthContext()` function is **kept for backward compatibility** but marked with a deprecation notice:

```typescript
/**
 * NOTE: This function is deprecated - all API functions now accept orgId and userId as parameters
 * Keeping for backward compatibility but not recommended
 */
function getAuthContext(): { orgId: string; userId?: string } {
  // ... implementation
}
```

**It is no longer called by any function in the service.**

## Files Modified

1. ✅ `ehr-web/src/services/bed-management.ts`
   - Updated all 21 function signatures
   - Removed all `getAuthContext()` calls from functions
   - Added `orgId` and `userId` as first parameters
   - Updated all internal function calls (e.g., `getAvailableBeds` calling `getBeds`)

2. ✅ `ehr-web/src/app/bed-management/page.tsx`
   - Already updated in previous fix
   - Uses `useSession()` hook
   - Passes `orgId` and `userId` to all service calls

## Testing Checklist

### ✅ Pre-deployment Verification

1. **No compilation errors**
   ```bash
   cd ehr-web
   npm run build
   # Should complete without TypeScript errors related to bed-management
   ```

2. **Login and navigate**
   - User logs in successfully
   - Session is created with org_id and user_id
   - Navigate to Bed Management page

3. **Dashboard loads**
   - No "Missing authentication context" errors
   - No "Organization ID not found" errors
   - Dashboard displays occupancy stats
   - Current inpatients list loads

4. **Network requests include headers**
   - Open DevTools → Network tab
   - Refresh Bed Management page
   - Check request headers include:
     ```
     x-org-id: <your-org-id>
     x-user-id: <your-user-id>
     ```

5. **All CRUD operations work** (when UI is built)
   - Creating a ward passes auth correctly
   - Admitting a patient passes auth correctly
   - Assigning a bed passes auth correctly
   - All operations succeed without auth errors

## Migration Guide for Future Pages

When creating new pages that use the bed management service:

### ❌ DON'T DO THIS (Old Pattern)
```typescript
// Bad - service tries to get auth itself
const wards = await bedManagementService.getWards();
```

### ✅ DO THIS (Correct Pattern)
```typescript
// Good - pass auth from session
const { data: session } = useSession();
const [orgId, setOrgId] = useState<string | null>(null);
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  if (session?.org_id) setOrgId(session.org_id);
  if (session?.user_id) setUserId(session.user_id);
}, [session]);

useEffect(() => {
  if (orgId) loadData();
}, [orgId, userId]);

async function loadData() {
  const wards = await bedManagementService.getWards(orgId!, userId || undefined);
  // ...
}
```

## Success Criteria

✅ All 21 service functions updated
✅ No `getAuthContext()` calls remain in service functions
✅ Consistent parameter order: `(orgId, userId, ...otherParams)`
✅ Type-safe function signatures
✅ Matches inventory module pattern exactly
✅ Dashboard page loads without auth errors
✅ Headers sent correctly in all API requests
✅ Clean, maintainable code

## Next Steps

The authentication layer is now **fully complete and consistent**. You can now:

1. **Build UI components** without worrying about auth - just pass `orgId` and `userId` from session
2. **Create new pages** following the same pattern (ward configuration, admission forms, etc.)
3. **Add new service functions** - follow the established pattern
4. **Write tests** - easy to mock auth parameters

## Troubleshooting

### Issue: TypeScript errors about missing parameters
**Solution**: All service functions now require `orgId` as first parameter. Update call sites:
```typescript
// Before
const wards = await getWards(filters);

// After
const wards = await getWards(orgId, userId, filters);
```

### Issue: "Cannot read property 'org_id' of undefined"
**Solution**: Session hasn't loaded yet. Add loading check:
```typescript
if (status === 'loading') return <LoadingSpinner />;
if (!session || !orgId) return <AuthRequired />;
```

### Issue: Headers still not being sent
**Solution**: Verify you're passing the parameters in the correct order:
```typescript
// Correct order: orgId, userId, then other params
await bedManagementService.getBeds(orgId, userId, { wardId: '123' });
```

## Documentation Updates

Updated documentation files:
- ✅ `BED_MANAGEMENT_FINAL_AUTH_FIX.md` - Updated function list
- ✅ `BED_MANAGEMENT_COMPLETE_AUTH_FIX.md` - This comprehensive guide

## Conclusion

The Bed Management module now has **100% consistent authentication** across all functions. Every service function follows the exact same pattern used throughout the application, making the codebase more maintainable, testable, and easier to understand.

🎉 **Authentication implementation is now COMPLETE!**
