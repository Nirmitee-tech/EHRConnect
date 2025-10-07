# Comprehensive Permission System Guide

## Overview

This guide covers the complete permission system implementation with:
- ✅ Granular permissions (read, write, create, edit, delete, submit, approve, print, send)
- ✅ Permission matrix UI for role management
- ✅ Component-level permission gates with wildcard support (`*`)
- ✅ Page-level permission guards
- ✅ Multi-tenant support with org-specific role customization
- ✅ Copy-on-write for system roles
- ✅ Real-time permission updates via Socket.IO
- ✅ Session management with live permission sync

---

## Architecture

### Backend Components

1. **Permission Constants** (`ehr-api/src/constants/permissions.js`)
   - Permission actions and resources
   - Default system roles
   - Feature-permission mappings
   - Wildcard matching utilities

2. **Enhanced RBAC Service** (`ehr-api/src/services/rbac.service.enhanced.js`)
   - Copy-on-write for system roles
   - Permission CRUD operations
   - Real-time notification integration

3. **Socket.IO Service** (`ehr-api/src/services/socket.service.js`)
   - Real-time permission broadcasts
   - User and org-specific rooms
   - Connection management

4. **Database Schema** (`ehr-api/src/database/migrations/002_enhanced_permissions.sql`)
   - Org-specific roles support
   - Permission change tracking
   - Automatic notification triggers

5. **API Endpoints** (`ehr-api/src/routes/rbac.enhanced.js`)
   - Permission matrix management
   - Role CRUD with copy-on-write
   - Permission checking endpoints

### Frontend Components

1. **Permission Types** (`ehr-web/src/types/permissions.ts`)
   - TypeScript definitions
   - Permission utilities
   - Type-safe permission strings

2. **usePermissions Hook** (`ehr-web/src/hooks/usePermissions.ts`)
   - Real-time permission updates
   - Socket.IO integration
   - Permission checking functions

3. **PermissionGate Component** (`ehr-web/src/components/permissions/PermissionGate.tsx`)
   - Component-level permission control
   - Wildcard support
   - Custom logic support

4. **PermissionMatrix Component** (`ehr-web/src/components/permissions/PermissionMatrix.tsx`)
   - Visual permission editor
   - Bulk selection
   - Search and filter

5. **ProtectedRoute Component** (`ehr-web/src/components/permissions/ProtectedRoute.tsx`)
   - Page-level protection
   - Automatic redirects
   - Custom fallbacks

---

## Setup Instructions

### 1. Database Migration

Run the enhanced permissions migration:

```bash
cd ehr-api
psql -h localhost -U your_user -d your_database -f src/database/migrations/002_enhanced_permissions.sql
```

This will:
- Add org-specific role support
- Create permission change tracking
- Set up auto-notification triggers
- Initialize default system roles

### 2. Backend Configuration

Update your `.env` file:

```env
# Socket.IO Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
JWT_SECRET=your-jwt-secret-key

# API Configuration
PORT=8000
```

The Socket.IO service is automatically initialized in `ehr-api/src/index.js`.

### 3. Frontend Configuration

Update `ehr-web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=your-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

### 4. Install Dependencies

Already installed, but for reference:

```bash
# Backend
cd ehr-api
npm install socket.io cors

# Frontend
cd ehr-web
npm install socket.io-client
```

---

## Usage Guide

### 1. Using Permission Gates (Component-Level)

**Basic Usage:**

```tsx
import { PermissionGate } from '@/components/permissions/PermissionGate'

// Single permission
<PermissionGate permission="patients:read">
  <PatientList />
</PermissionGate>

// Multiple permissions (ANY)
<PermissionGate permission={["patients:read", "patients:write"]}>
  <PatientEditor />
</PermissionGate>

// Multiple permissions (ALL required)
<PermissionGate
  permission={["patients:read", "patients:write"]}
  requireAll
>
  <AdvancedPatientEditor />
</PermissionGate>

// Wildcard permissions
<PermissionGate permission="patients:*">
  <PatientFullAccess />
</PermissionGate>

// All permissions on all resources
<PermissionGate permission="*:*">
  <SuperAdminPanel />
</PermissionGate>
```

**With Fallback:**

```tsx
<PermissionGate
  permission="billing:read"
  fallback={<div>You need billing access to view this.</div>}
>
  <BillingDashboard />
</PermissionGate>
```

**Feature-Based Check:**

```tsx
<PermissionGate feature="patients.create">
  <CreatePatientButton />
</PermissionGate>
```

**HOC Usage:**

```tsx
import { requirePermission } from '@/components/permissions/PermissionGate'

const ProtectedComponent = requirePermission(MyComponent, "patients:read")
```

### 2. Using Protected Routes (Page-Level)

**In Page Components:**

```tsx
import { ProtectedRoute } from '@/components/permissions/ProtectedRoute'

export default function PatientsPage() {
  return (
    <ProtectedRoute permission="patients:read">
      <PatientList />
    </ProtectedRoute>
  )
}
```

**With Feature Check:**

```tsx
export default function BillingPage() {
  return (
    <ProtectedRoute feature="billing.view">
      <BillingDashboard />
    </ProtectedRoute>
  )
}
```

**With Custom Fallback:**

```tsx
export default function AdminPage() {
  return (
    <ProtectedRoute
      permission="admin:access"
      fallback={<CustomAccessDenied />}
    >
      <AdminPanel />
    </ProtectedRoute>
  )
}
```

**HOC for Pages:**

```tsx
import { withPermission } from '@/components/permissions/ProtectedRoute'

function AdminPage() {
  return <AdminDashboard />
}

export default withPermission(AdminPage, "admin:access")
```

### 3. Using the usePermissions Hook

**Basic Usage:**

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasFeature,
    loading,
    isConnected
  } = usePermissions()

  if (loading) return <Loading />

  return (
    <div>
      {hasPermission('patients:read') && <PatientList />}
      {hasPermission(['patients:create', 'patients:edit']) && <EditButton />}
      {hasAllPermissions(['billing:read', 'billing:write']) && <BillingPanel />}
      {hasFeature('reports.export') && <ExportButton />}

      <div>Socket Connected: {isConnected ? 'Yes' : 'No'}</div>
    </div>
  )
}
```

**Imperative Check:**

```tsx
import { usePermissionGate } from '@/components/permissions/PermissionGate'

function MyComponent() {
  const { canAccess, loading } = usePermissionGate({
    permission: "patients:read"
  })

  if (!canAccess) {
    return <AccessDenied />
  }

  return <PatientList />
}
```

### 4. Using Permission Matrix UI

**In Role Editor:**

```tsx
import { PermissionMatrix } from '@/components/permissions/PermissionMatrix'
import { useState } from 'react'

function RoleEditor() {
  const [permissions, setPermissions] = useState<Permission[]>([])

  return (
    <div>
      <h2>Edit Role Permissions</h2>
      <PermissionMatrix
        value={permissions}
        onChange={setPermissions}
        showSearch
      />
      <button onClick={() => saveRole(permissions)}>
        Save Role
      </button>
    </div>
  )
}
```

**Read-Only Display:**

```tsx
<PermissionMatrix
  value={role.permissions}
  onChange={() => {}}
  readOnly
/>
```

### 5. Backend API Usage

**Check Permission:**

```javascript
const rbacService = require('./services/rbac.service.enhanced')

// Check single permission
const hasAccess = rbacService.checkPermission(
  userPermissions,
  'patients:read'
)

// Check multiple (ANY)
const hasAnyAccess = rbacService.checkPermission(
  userPermissions,
  ['patients:read', 'patients:write']
)

// Check multiple (ALL)
const hasAllAccess = rbacService.checkAllPermissions(
  userPermissions,
  ['patients:read', 'patients:write']
)
```

**Create Custom Role:**

```javascript
const role = await rbacService.createRole(
  {
    name: 'Custom Nurse',
    description: 'Custom role for ICU nurses',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'patients:edit',
      'observations:*',
      'medications:read',
      'medications:submit'
    ]
  },
  orgId,
  userId
)
```

**Update System Role (Copy-on-Write):**

```javascript
// Updating a system role automatically creates org-specific copy
const updatedRole = await rbacService.updateRole(
  systemRoleId,
  {
    permissions: [
      ...existingPermissions,
      'lab_results:approve' // Add new permission
    ]
  },
  orgId,
  userId
)
// This creates an org-specific copy with parent_role_id set
```

**Assign Role:**

```javascript
const assignment = await rbacService.assignRole(
  {
    user_id: userId,
    org_id: orgId,
    role_id: roleId,
    scope: 'LOCATION',
    location_id: locationId
  },
  assignedByUserId
)
// Automatically triggers Socket.IO notification to user
```

---

## Real-Time Updates

The system automatically broadcasts permission changes via Socket.IO:

### Events Emitted:

1. **permission-changed** - When user's permissions change
2. **role-changed** - When a role is updated (affects all users with that role)
3. **role-assignment-changed** - When a role is assigned to someone in the org
4. **role-revocation** - When a role is revoked

### Client Handling:

The `usePermissions` hook automatically:
- Connects to Socket.IO
- Listens for permission events
- Refreshes permissions when changes occur
- Updates UI instantly

**Manual Control:**

```tsx
const { refreshPermissions } = usePermissions({
  autoRefresh: false // Disable auto-refresh
})

// Manually refresh when needed
await refreshPermissions()
```

---

## Permission Structure

### Format

Permissions follow the pattern: `resource:action`

- `patients:read` - Read patients
- `patients:*` - All actions on patients
- `*:read` - Read all resources
- `*:*` - Full access (super admin)

### Actions

- `read` - View/read data
- `create` - Create new records
- `edit` - Modify existing records
- `delete` - Delete records
- `write` - Generic write (create + edit)
- `submit` - Submit for review/approval
- `approve` - Approve submitted items
- `reject` - Reject submitted items
- `print` - Print documents
- `send` - Send/share documents
- `export` - Export data
- `import` - Import data

### Resources

See `PERMISSION_RESOURCES` in `ehr-api/src/constants/permissions.js` for full list:

- Organization: `org`, `locations`, `departments`, `staff`, `roles`
- Clinical: `patients`, `appointments`, `encounters`, `observations`
- Documentation: `clinical_notes`, `prescriptions`, `reports`
- Financial: `billing`, `invoices`, `payments`, `claims`
- System: `audit`, `settings`, `integrations`

---

## Multi-Tenant Features

### Default System Roles

System roles are shared across all organizations:
- PLATFORM_ADMIN
- ORG_OWNER
- ORG_ADMIN
- CLINICIAN
- NURSE
- FRONT_DESK
- LAB_TECHNICIAN
- PHARMACIST
- BILLING_CLERK
- AUDITOR
- VIEWER

### Org-Specific Customization

Organizations can:

1. **Create custom roles** (stored with `org_id`)
2. **Copy system roles** for customization:
   - Original system role preserved
   - Org gets a copy with `parent_role_id` set
   - Modifications tracked with `is_modified` flag
3. **Default roles remain unchanged** for other orgs

### Copy-on-Write Flow

```
1. User updates system role "CLINICIAN"
2. System detects it's a system role
3. Creates org-specific copy:
   - key: "CLINICIAN"
   - org_id: user's org
   - parent_role_id: original CLINICIAN id
   - is_modified: false
4. Applies modifications to the copy
5. Sets is_modified: true
6. Original "CLINICIAN" unchanged for other orgs
```

---

## API Reference

### Enhanced RBAC Endpoints

**Base URL:** `/api/rbac/v2`

#### GET /permission-matrix
Get permission matrix structure for UI

#### GET /roles
Get all roles (system + org-custom)

Query params:
- `includeSystem`: true/false
- `includeCustom`: true/false

#### GET /roles/:id
Get single role by ID or key

#### POST /roles
Create custom role

Body:
```json
{
  "name": "Custom Role",
  "description": "Description",
  "scope_level": "LOCATION",
  "permissions": ["patients:read", "patients:write"]
}
```

#### PATCH /roles/:id
Update role (auto copy-on-write for system roles)

Body:
```json
{
  "permissions": ["patients:*", "appointments:read"]
}
```

#### POST /roles/:id/copy
Explicitly copy system role for org

#### DELETE /roles/:id
Delete custom role (cannot delete system roles)

#### GET /users/:userId/permissions
Get user's aggregated permissions

#### GET /users/:userId/role-assignments
Get user's role assignments

#### POST /role-assignments
Assign role to user

Body:
```json
{
  "user_id": "uuid",
  "role_id": "uuid",
  "scope": "LOCATION",
  "location_id": "uuid"
}
```

#### DELETE /role-assignments/:id
Revoke role assignment

#### POST /check-permission
Check if current user has permission

Body:
```json
{
  "permission": "patients:read"
}
```

#### POST /check-feature
Check if current user has feature access

Body:
```json
{
  "feature": "patients.create"
}
```

---

## Best Practices

### 1. Use Feature-Based Checks for UI

```tsx
// Good - tied to feature
<PermissionGate feature="patients.create">
  <CreateButton />
</PermissionGate>

// Less flexible - tied to specific permission
<PermissionGate permission="patients:create">
  <CreateButton />
</PermissionGate>
```

### 2. Use Wildcards Judiciously

```tsx
// For role-based sections
<PermissionGate permission="billing:*">
  <BillingSection />
</PermissionGate>

// Avoid overuse in granular controls
// Bad - too broad
<PermissionGate permission="*:*">
  <DeleteButton />
</PermissionGate>

// Good - specific
<PermissionGate permission="patients:delete">
  <DeletePatientButton />
</PermissionGate>
```

### 3. Provide Clear Fallbacks

```tsx
<PermissionGate
  permission="reports:export"
  fallback={
    <Tooltip text="Upgrade to Pro for export access">
      <Button disabled>Export</Button>
    </Tooltip>
  }
>
  <ExportButton />
</PermissionGate>
```

### 4. Leverage Real-Time Updates

The system automatically updates permissions. Ensure critical operations revalidate:

```tsx
async function deletePatient(id: string) {
  const { hasPermission } = usePermissions()

  // Revalidate before critical operation
  if (!hasPermission('patients:delete')) {
    throw new Error('Permission denied')
  }

  await api.delete(`/patients/${id}`)
}
```

---

## Troubleshooting

### Socket.IO Not Connecting

1. Check CORS settings in `ehr-api/src/index.js`
2. Verify `ALLOWED_ORIGINS` in `.env`
3. Check JWT token in Socket.IO auth
4. Look for connection errors in browser console

### Permissions Not Updating

1. Check Socket.IO connection status: `isConnected` from `usePermissions`
2. Verify database triggers are created (migration ran successfully)
3. Check backend logs for Socket.IO emissions
4. Try manual refresh: `refreshPermissions()`

### Copy-on-Write Not Working

1. Verify `org_id` column exists in `roles` table
2. Check unique indexes are created
3. Ensure user has correct `org_id` in session
4. Review `rbac.service.enhanced.js` logs

---

## Security Considerations

1. **Always validate permissions server-side** - Frontend checks are for UX only
2. **Use feature flags** for gradual rollout of new permissions
3. **Audit permission changes** - All changes logged in `audit_events`
4. **Limit wildcard usage** in role definitions
5. **Review org-specific roles** regularly
6. **Monitor Socket.IO connections** for anomalies
7. **Implement rate limiting** on permission check endpoints

---

## Migration from Old System

If you have existing RBAC:

1. Backup your current `roles` and `role_assignments` tables
2. Run the migration script
3. Existing roles will remain unchanged
4. Update frontend components to use new `PermissionGate`
5. Test thoroughly in staging environment
6. Deploy backend first, then frontend

---

## Summary

You now have a complete, production-ready permission system with:

✅ **Granular permissions** - 12 actions across 30+ resources
✅ **Wildcard support** - `*` for flexible access control
✅ **Component-level gates** - Fine-grained UI control
✅ **Page-level guards** - Route protection
✅ **Permission matrix UI** - Visual role editor
✅ **Multi-tenant** - Org-specific customization
✅ **Copy-on-write** - Safe system role modifications
✅ **Real-time updates** - Socket.IO integration
✅ **Type-safe** - Full TypeScript support
✅ **Production-ready** - Audit logs, error handling, testing

The system is now fully operational and ready for production use!
