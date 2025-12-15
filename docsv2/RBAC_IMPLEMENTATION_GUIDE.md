# Multi-Tenant RBAC Implementation Guide

## Overview

This implementation provides a **fully dynamic, database-driven RBAC (Role-Based Access Control)** system with **NO hardcoded roles or permissions**. All roles and permissions are stored in and fetched from the database, allowing for complete customization per organization.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [System Roles](#system-roles)
4. [Custom Roles](#custom-roles)
5. [Permission System](#permission-system)
6. [API Usage](#api-usage)
7. [Frontend Integration](#frontend-integration)
8. [Keycloak Configuration](#keycloak-configuration)
9. [Examples](#examples)

---

## Architecture

### Key Principles

1. **Database-Driven**: All roles and permissions are stored in PostgreSQL
2. **Multi-Tenant Isolation**: Each organization can have custom roles
3. **Dynamic Loading**: Roles/permissions are loaded at runtime from DB
4. **Wildcard Support**: Permission matching supports wildcards (e.g., `org:*:*`)
5. **Audit Trail**: All RBAC changes are logged in audit_events table

### Components

```
┌─────────────────┐
│   Keycloak      │ ← Identity Provider
│   (Claims)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │ ← Validates org context & JWT
│   (Next.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RBAC Utils    │ ← Permission checking functions
│   (rbac.ts)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │ ← PostgreSQL with roles table
│   (PostgreSQL)  │
└─────────────────┘
```

---

## Database Schema

### Roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,           -- e.g., 'ORG_ADMIN', 'CUSTOM_DOCTOR'
  name TEXT NOT NULL,                 -- Display name
  description TEXT,
  scope_level TEXT NOT NULL,          -- 'PLATFORM', 'ORG', 'LOCATION', 'DEPARTMENT'
  permissions JSONB NOT NULL,         -- Array of permission strings
  is_system BOOLEAN DEFAULT FALSE,    -- True for predefined roles
  org_id UUID,                        -- NULL for system roles, set for custom roles
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Role Assignments Table

```sql
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  role_id UUID NOT NULL,
  scope TEXT NOT NULL,                -- 'ORG', 'LOCATION', 'DEPARTMENT'
  location_id UUID,                   -- If scope = 'LOCATION'
  department_id UUID,                 -- If scope = 'DEPARTMENT'
  assigned_by UUID,
  assigned_at TIMESTAMP,
  expires_at TIMESTAMP,               -- Optional: time-bound access
  revoked_at TIMESTAMP,
  revoked_by UUID,
  revocation_reason TEXT
);
```

---

## System Roles

### Predefined Roles (is_system = true)

These roles are created during database initialization but can have their **permissions updated** by platform admins:

| Role Key | Scope | Default Permissions |
|----------|-------|---------------------|
| `PLATFORM_ADMIN` | PLATFORM | `platform:*:*` (full platform access) |
| `ORG_OWNER` | ORG | `org:*:*`, `locations:*:*`, `staff:*:*`, `roles:*:*` |
| `ORG_ADMIN` | ORG | `org:read`, `org:update`, `locations:*:*`, `staff:*:*` |
| `CLINICIAN` | LOCATION | `patients:*:*`, `encounters:*:*`, `observations:*:*` |
| `FRONT_DESK` | LOCATION | `patients:register`, `appointments:*:*` |
| `AUDITOR` | ORG | `audit:read`, `org:read`, `staff:read` |

**Important**: These roles cannot be deleted but their permissions can be modified via API.

---

## Custom Roles

Organizations can create unlimited custom roles tailored to their needs.

### Creating a Custom Role

```javascript
// API Request
POST /api/rbac/roles
{
  "key": "NURSE_LEAD",
  "name": "Nurse Lead",
  "description": "Senior nurse with additional administrative duties",
  "scope_level": "LOCATION",
  "permissions": [
    "patients:read",
    "patients:update",
    "observations:*:*",
    "staff:read",
    "schedules:manage"
  ]
}
```

### Custom Role Properties

- **Org-Specific**: Custom roles belong to one organization
- **Full Control**: Org admins can create, update, and delete custom roles
- **Permission Flexibility**: Any permission string format is supported
- **Cannot Be Deleted If In Use**: Safety check prevents deletion of assigned roles

---

## Permission System

### Permission Format

```
resource:action:subaction
```

Examples:
- `patients:read` - Read patients
- `patients:create` - Create patients
- `patients:*:*` - All patient operations
- `org:*:*` - All organization operations
- `*:*:*` - Super admin (all permissions)

### Wildcard Matching

The system supports wildcard matching at any level:

| User Permission | Required Permission | Match? |
|----------------|---------------------|--------|
| `patients:*:*` | `patients:read` | ✅ Yes |
| `patients:read` | `patients:*:*` | ❌ No |
| `*:*:*` | `patients:read` | ✅ Yes |
| `org:read` | `org:update` | ❌ No |

### Permission Aggregation

Users can have multiple role assignments. All permissions from all active roles are aggregated:

```
User has:
- Role 1: ["patients:read", "encounters:read"]
- Role 2: ["patients:update", "observations:*:*"]

Effective permissions:
["patients:read", "patients:update", "encounters:read", "observations:*:*"]
```

---

## API Usage

### Get All Roles

```bash
GET /api/rbac/roles?includeSystem=true&includeCustom=true
```

Response:
```json
{
  "roles": [
    {
      "id": "...",
      "key": "ORG_ADMIN",
      "name": "Organization Administrator",
      "scope_level": "ORG",
      "permissions": ["org:read", "org:update", "locations:*:*"],
      "is_system": true,
      "org_id": null
    },
    {
      "id": "...",
      "key": "CUSTOM_DOCTOR_ICU",
      "name": "ICU Doctor",
      "scope_level": "LOCATION",
      "permissions": ["patients:*:*", "critical_care:*:*"],
      "is_system": false,
      "org_id": "org-uuid"
    }
  ]
}
```

### Create Custom Role

```bash
POST /api/rbac/roles
Content-Type: application/json

{
  "key": "LAB_TECHNICIAN",
  "name": "Laboratory Technician",
  "description": "Manage lab tests and results",
  "scope_level": "LOCATION",
  "permissions": [
    "lab_tests:create",
    "lab_tests:update",
    "lab_results:create",
    "lab_results:update",
    "patients:read"
  ]
}
```

### Assign Role to User

```bash
POST /api/rbac/role-assignments
Content-Type: application/json

{
  "user_id": "user-uuid",
  "role_id": "role-uuid",
  "scope": "LOCATION",
  "location_id": "location-uuid",
  "expires_at": null
}
```

### Update Role Permissions

```bash
PATCH /api/rbac/roles/{roleId}
Content-Type: application/json

{
  "permissions": [
    "patients:read",
    "patients:update",
    "new_permission:create"
  ]
}
```

### Get User Permissions

```bash
GET /api/rbac/users/{userId}/permissions
```

Response:
```json
{
  "permissions": [
    "patients:read",
    "patients:update",
    "encounters:*:*",
    "observations:create"
  ]
}
```

### Check Permission

```bash
POST /api/rbac/check-permission
Content-Type: application/json

{
  "permission": "patients:update"
}
```

Response:
```json
{
  "hasPermission": true
}
```

---

## Frontend Integration

### Using RBAC Utilities

```typescript
import { hasPermission, hasRole, authorize } from '@/lib/rbac';
import { useSession } from 'next-auth/react';

function PatientForm() {
  const { data: session } = useSession();

  // Check single permission
  const canEdit = hasPermission(session, 'patients:update');

  // Check multiple permissions
  const canDelete = hasPermission(session, 'patients:delete');

  // Check role
  const isAdmin = hasRole(session, 'ORG_ADMIN');

  // Complex authorization
  const authResult = authorize(session, {
    resourceOrgId: patient.org_id,
    resourceLocationId: patient.location_id,
    requiredPermission: 'patients:update',
    requireOrgMatch: true,
    requireLocationAccess: true
  });

  return (
    <div>
      {canEdit && <button>Edit Patient</button>}
      {canDelete && <button>Delete Patient</button>}
      {!authResult.authorized && <p>Access Denied: {authResult.reason}</p>}
    </div>
  );
}
```

### Conditional Rendering

```typescript
import { hasPermission } from '@/lib/rbac';

function Navigation() {
  const { data: session } = useSession();

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {hasPermission(session, 'patients:read') && (
        <Link href="/patients">Patients</Link>
      )}
      
      {hasPermission(session, 'staff:read') && (
        <Link href="/staff">Staff Management</Link>
      )}
      
      {hasPermission(session, 'roles:read') && (
        <Link href="/roles">Roles & Permissions</Link>
      )}
    </nav>
  );
}
```

---

## Keycloak Configuration

### Client Scopes and Mappers

Create a client scope called `org-claims` with these protocol mappers:

#### 1. Org ID Mapper
```json
{
  "name": "org_id",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "config": {
    "user.attribute": "org_id",
    "claim.name": "org_id",
    "jsonType.label": "String",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

#### 2. Org Slug Mapper
```json
{
  "name": "org_slug",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "config": {
    "user.attribute": "org_slug",
    "claim.name": "org_slug",
    "jsonType.label": "String",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

#### 3. Location IDs Mapper
```json
{
  "name": "location_ids",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "config": {
    "user.attribute": "location_ids",
    "claim.name": "location_ids",
    "jsonType.label": "String",
    "multivalued": "true",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

#### 4. Permissions Mapper
```json
{
  "name": "permissions",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "config": {
    "user.attribute": "permissions",
    "claim.name": "permissions",
    "jsonType.label": "String",
    "multivalued": "true",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

### Setting User Attributes in Keycloak

When a user accepts an invitation or is provisioned:

```javascript
// Set Keycloak user attributes via Admin API
await keycloakAdminClient.users.update(
  { id: keycloakUserId },
  {
    attributes: {
      org_id: 'org-uuid-here',
      org_slug: 'hospital-name',
      location_ids: ['loc-1', 'loc-2'], // Array for multi-valued
      permissions: ['patients:read', 'encounters:*:*'] // Aggregated from roles
    }
  }
);
```

---

## Examples

### Example 1: Creating a Custom "Radiologist" Role

```javascript
// Step 1: Create the role
const response = await fetch('/api/rbac/roles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'RADIOLOGIST',
    name: 'Radiologist',
    description: 'Radiologist with imaging and report permissions',
    scope_level: 'LOCATION',
    permissions: [
      'patients:read',
      'imaging:*:*',
      'radiology_reports:*:*',
      'appointments:read'
    ]
  })
});

const { role } = await response.json();

// Step 2: Assign to a user
await fetch('/api/rbac/role-assignments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'dr-sharma-uuid',
    role_id: role.id,
    scope: 'LOCATION',
    location_id: 'radiology-dept-uuid'
  })
});
```

### Example 2: Updating System Role Permissions

```javascript
// Modify ORG_ADMIN to include billing permissions
await fetch('/api/rbac/roles/ORG_ADMIN', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    permissions: [
      'org:read',
      'org:update',
      'locations:*:*',
      'staff:*:*',
      'audit:read',
      'billing:read',      // New permission
      'billing:update'     // New permission
    ],
    allowSystemRoleUpdate: true
  })
});
```

### Example 3: Time-Bound Role Assignment

```javascript
// Assign temporary access for 30 days
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 30);

await fetch('/api/rbac/role-assignments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'temp-staff-uuid',
    role_id: 'front-desk-role-uuid',
    scope: 'LOCATION',
    location_id: 'reception-uuid',
    expires_at: expiryDate.toISOString()
  })
});
```

---

## Best Practices

### 1. Permission Naming Convention

Use a consistent format: `resource:action:subaction`

```
✅ Good:
- patients:read
- patients:create
- observations:update
- billing:invoices:create

❌ Bad:
- readPatients
- create-patient
- ObservationsUpdate
```

### 2. Minimize Custom Roles

Start with system roles and only create custom roles when truly needed. Overuse of custom roles makes management complex.

### 3. Use Wildcards Sparingly

Wildcard permissions (`*:*:*`) should be reserved for super admins only. Be specific with permissions.

### 4. Regular Audits

Periodically review role assignments and permissions:

```sql
-- Find users with multiple roles
SELECT user_id, COUNT(*) as role_count
FROM role_assignments
WHERE revoked_at IS NULL
GROUP BY user_id
HAVING COUNT(*) > 3;

-- Find roles with wildcard permissions
SELECT key, name, permissions
FROM roles
WHERE permissions::text LIKE '%"*:*:*"%';
```

### 5. Document Custom Roles

Maintain documentation for each custom role explaining:
- Purpose
- Who should have it
- What it allows

---

## Security Considerations

1. **Never Trust Client-Side Checks**: Always validate permissions on the server
2. **Audit All Changes**: Role/permission changes are automatically logged
3. **Principle of Least Privilege**: Grant minimum required permissions
4. **Regular Reviews**: Quarterly reviews of role assignments
5. **Expired Assignments**: Implement automated cleanup of expired assignments

---

## Troubleshooting

### Permission Not Working

1. Check user's role assignments:
```bash
GET /api/rbac/users/{userId}/role-assignments
```

2. Verify aggregated permissions:
```bash
GET /api/rbac/users/{userId}/permissions
```

3. Check if role assignment is expired or revoked

### Custom Role Not Appearing

1. Verify role was created for correct org_id
2. Check `includeCustom=true` in API call
3. Verify user has permission to view custom roles

---

## Conclusion

This RBAC system provides complete flexibility through database-driven roles and permissions. Organizations can customize their access control to match their operational needs without code changes. All modifications are audited and can be managed through the API.

For additional support or feature requests, refer to the PRD document or contact the platform team.
