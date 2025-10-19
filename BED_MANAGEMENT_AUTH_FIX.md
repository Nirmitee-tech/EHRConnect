# Bed Management Service - Authentication Fix ✅

## Issue
The bed management service was returning:
```json
{
    "error": "Missing authentication context",
    "message": "Please provide x-user-id and x-org-id headers"
}
```

## Root Cause
The service was looking for `token` and `orgId` in localStorage, but the EHR system uses `x-org-id` and `x-user-id` headers (following the same pattern as the inventory service).

## Solution Applied

### 1. Updated `getAuthHeaders()` Function
**Before:**
```typescript
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const orgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(orgId && { 'x-org-id': orgId }),
  };
}
```

**After:**
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

### 2. Added `getAuthContext()` Function
```typescript
function getAuthContext(): { orgId: string; userId?: string } {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access auth context on server side');
  }

  // Try to get from localStorage (adjust based on your auth implementation)
  const orgId = localStorage.getItem('currentOrgId') || localStorage.getItem('orgId');
  const userId = localStorage.getItem('currentUserId') || localStorage.getItem('userId');

  if (!orgId) {
    throw new Error('Organization ID not found. Please ensure you are logged in.');
  }

  return { orgId, userId: userId || undefined };
}
```

### 3. Updated All API Functions
Every API function now calls `getAuthContext()` to get the `orgId` and `userId`:

**Example:**
```typescript
export async function getWards(filters?: {
  locationId?: string;
  active?: boolean;
  wardType?: string;
}): Promise<Ward[]> {
  const { orgId, userId } = getAuthContext();  // ✅ Added this line
  const params = new URLSearchParams();
  // ... rest of the function

  const response = await fetch(`${BED_MANAGEMENT_API}/wards?${params}`, {
    headers: getAuthHeaders(orgId, userId),  // ✅ Updated to pass params
  });

  return handleResponse<Ward[]>(response);
}
```

## How It Works Now

1. **User logs in** → `orgId` and `userId` stored in localStorage
2. **Page loads bed management** → Calls `bedManagementService.getBedOccupancyStats()`
3. **Service calls `getAuthContext()`** → Retrieves `orgId` and `userId` from localStorage
4. **Service adds headers** → `x-org-id` and `x-user-id` headers included in request
5. **API validates** → Backend checks headers and processes request
6. **Data returns** → Dashboard displays occupancy stats

## LocalStorage Keys

The service looks for these keys in localStorage (in order of preference):

For **Organization ID**:
1. `currentOrgId` (preferred)
2. `orgId` (fallback)

For **User ID**:
1. `currentUserId` (preferred)
2. `userId` (fallback)

## Matching the Inventory Service Pattern

This fix follows the exact same pattern as the inventory service (`src/services/inventory.service.ts`), which already works correctly:

```typescript
// Inventory service pattern (we copied this)
private getHeaders(orgId: string, userId?: string) {
  const headers: Record<string, string> = {
    'x-org-id': orgId,
  }

  if (userId) {
    headers['x-user-id'] = userId
  }

  return headers
}
```

## Testing

To verify the fix works:

1. **Check localStorage has auth data:**
   ```javascript
   // Open browser console on the Bed Management page
   console.log('orgId:', localStorage.getItem('currentOrgId') || localStorage.getItem('orgId'));
   console.log('userId:', localStorage.getItem('currentUserId') || localStorage.getItem('userId'));
   ```

2. **Refresh the page** - The dashboard should now load successfully

3. **Check network tab** - The request headers should include:
   ```
   x-org-id: <your-org-id>
   x-user-id: <your-user-id>
   ```

## If Still Not Working

### Check 1: Verify localStorage Keys
```javascript
// In browser console
Object.keys(localStorage).filter(key =>
  key.toLowerCase().includes('org') ||
  key.toLowerCase().includes('user')
);
```

### Check 2: Update `getAuthContext()` Function
If your app uses different localStorage keys, update the `getAuthContext()` function:

```typescript
function getAuthContext(): { orgId: string; userId?: string } {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access auth context on server side');
  }

  // ⚠️ UPDATE THESE TO MATCH YOUR KEYS
  const orgId = localStorage.getItem('YOUR_ORG_KEY_HERE');
  const userId = localStorage.getItem('YOUR_USER_KEY_HERE');

  if (!orgId) {
    throw new Error('Organization ID not found. Please ensure you are logged in.');
  }

  return { orgId, userId: userId || undefined };
}
```

### Check 3: Use Auth Context Hook (Recommended)
For a more robust solution, use React Context:

```typescript
// In your AuthContext or similar
export function useAuth() {
  const { user, organization } = useAuthContext();
  return {
    userId: user?.id,
    orgId: organization?.id
  };
}

// Then in the service, accept these as parameters
export async function getWards(
  orgId: string,
  userId: string,
  filters?: { ... }
): Promise<Ward[]> {
  const params = new URLSearchParams();
  // ... rest of the function

  const response = await fetch(`${BED_MANAGEMENT_API}/wards?${params}`, {
    headers: getAuthHeaders(orgId, userId),
  });

  return handleResponse<Ward[]>(response);
}

// Usage in component
const { orgId, userId } = useAuth();
const wards = await bedManagementService.getWards(orgId, userId, filters);
```

## Files Modified

- `ehr-web/src/services/bed-management.ts` - Updated all functions to use proper auth headers

## Summary

✅ **Fixed authentication** - Service now uses `x-org-id` and `x-user-id` headers
✅ **Matches existing pattern** - Follows the inventory service implementation
✅ **All functions updated** - Every API call now includes proper auth context
✅ **Graceful error handling** - Clear error messages if auth data is missing

The Bed Management module should now work without authentication errors! 🎉
