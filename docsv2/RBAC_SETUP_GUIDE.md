# RBAC System Setup Guide

## Quick Start

This guide will help you set up the dynamic RBAC system for your multi-tenant healthcare platform.

## Prerequisites

- PostgreSQL 12+ database
- Keycloak instance running
- Node.js 18+ for API server
- Next.js application configured

---

## Step 1: Database Setup

### Apply the Schema

```bash
# Connect to your PostgreSQL database
psql -U medplum -d medplum -h localhost

# Run the schema file
\i ehr-api/src/database/schema.sql
```

This creates:
- `roles` table with system roles
- `role_assignments` table
- `audit_events` table
- All necessary indexes and triggers
- Views for common queries

### Verify System Roles

```sql
SELECT key, name, scope_level, is_system 
FROM roles 
WHERE is_system = true;
```

You should see 6 system roles:
- PLATFORM_ADMIN
- ORG_OWNER
- ORG_ADMIN
- CLINICIAN
- FRONT_DESK
- AUDITOR

---

## Step 2: Keycloak Configuration

### Create Client Scope

1. Go to Keycloak Admin Console
2. Navigate to your realm → Client Scopes
3. Click "Create" and name it `org-claims`
4. Set Protocol to `openid-connect`

### Add Protocol Mappers

Add these 4 mappers to the `org-claims` scope:

#### Mapper 1: org_id
- Name: `org_id`
- Mapper Type: `User Attribute`
- User Attribute: `org_id`
- Token Claim Name: `org_id`
- Claim JSON Type: `String`
- Add to ID token: ✅
- Add to access token: ✅

#### Mapper 2: org_slug
- Name: `org_slug`
- Mapper Type: `User Attribute`
- User Attribute: `org_slug`
- Token Claim Name: `org_slug`
- Claim JSON Type: `String`
- Add to ID token: ✅
- Add to access token: ✅

#### Mapper 3: location_ids
- Name: `location_ids`
- Mapper Type: `User Attribute`
- User Attribute: `location_ids`
- Token Claim Name: `location_ids`
- Claim JSON Type: `String`
- Multivalued: ✅
- Add to ID token: ✅
- Add to access token: ✅

#### Mapper 4: permissions
- Name: `permissions`
- Mapper Type: `User Attribute`
- User Attribute: `permissions`
- Token Claim Name: `permissions`
- Claim JSON Type: `String`
- Multivalued: ✅
- Add to ID token: ✅
- Add to access token: ✅

### Assign Client Scope to Client

1. Go to Clients → Your Client (e.g., `nx-web`)
2. Click "Client Scopes" tab
3. Add `org-claims` to "Assigned Default Client Scopes"

---

## Step 3: API Server Configuration

### Install Dependencies

```bash
cd ehr-api
npm install pg
```

### Environment Variables

Add to `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medplum
DB_USER=medplum
DB_PASSWORD=your_password_here
```

### Register RBAC Routes

Update `ehr-api/src/index.js`:

```javascript
const rbacRoutes = require('./routes/rbac');

// ... existing code ...

app.use('/api/rbac', rbacRoutes);
```

### Start API Server

```bash
npm start
```

---

## Step 4: Frontend Configuration

### Environment Variables

Add to `ehr-web/.env.local`:

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ehrconnect
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nx-web
KEYCLOAK_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

---

## Step 5: Test the Setup

### 1. Test Database Connection

```bash
cd ehr-api
node -e "
const { pool } = require('./src/database/connection');
pool.query('SELECT key, name FROM roles LIMIT 5')
  .then(r => console.log('Roles:', r.rows))
  .catch(e => console.error('Error:', e))
  .finally(() => pool.end());
"
```

### 2. Test API Endpoints

Start the API server and test:

```bash
# Get all roles
curl http://localhost:3001/api/rbac/roles \
  -H "x-user-id: test-user" \
  -H "x-org-id: test-org" \
  -H "x-user-roles: [\"ORG_ADMIN\"]"
```

### 3. Test Frontend RBAC

Create a test component in `ehr-web/src/app/test-rbac/page.tsx`:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, getUserPermissions } from '@/lib/rbac';

export default function TestRBAC() {
  const { data: session } = useSession();

  const permissions = getUserPermissions(session);
  const canReadPatients = hasPermission(session, 'patients:read');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">RBAC Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Session Info:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({
            org_id: session?.org_id,
            org_slug: session?.org_slug,
            roles: session?.roles,
            location_ids: session?.location_ids
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Permissions:</h2>
        <ul className="list-disc pl-5">
          {permissions.map(p => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Permission Checks:</h2>
        <p>Can read patients: {canReadPatients ? '✅ Yes' : '❌ No'}</p>
      </div>
    </div>
  );
}
```

Visit `http://localhost:3000/test-rbac` after logging in.

---

## Step 6: Create Your First Custom Role

### Using the API

```bash
curl -X POST http://localhost:3001/api/rbac/roles \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -H "x-org-id: your-org-id" \
  -H "x-user-roles: [\"ORG_ADMIN\"]" \
  -d '{
    "key": "PHARMACY_MANAGER",
    "name": "Pharmacy Manager",
    "description": "Manages pharmacy operations and inventory",
    "scope_level": "LOCATION",
    "permissions": [
      "patients:read",
      "prescriptions:*:*",
      "inventory:*:*",
      "pharmacy_orders:*:*"
    ]
  }'
```

### Using a UI Form (Example)

```typescript
async function createCustomRole() {
  const response = await fetch('/api/rbac/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'PHARMACY_MANAGER',
      name: 'Pharmacy Manager',
      description: 'Manages pharmacy operations and inventory',
      scope_level: 'LOCATION',
      permissions: [
        'patients:read',
        'prescriptions:*:*',
        'inventory:*:*',
        'pharmacy_orders:*:*'
      ]
    })
  });

  const { role } = await response.json();
  console.log('Created role:', role);
}
```

---

## Step 7: Assign Role to User

### Update Keycloak User Attributes

When user is provisioned or invited:

```javascript
const KeycloakAdminClient = require('@keycloak/keycloak-admin-client');

const kcAdminClient = new KeycloakAdminClient({
  baseUrl: 'http://localhost:8080',
  realmName: 'ehrconnect',
});

// Authenticate admin client
await kcAdminClient.auth({
  grantType: 'client_credentials',
  clientId: 'admin-cli',
  clientSecret: 'your-admin-secret',
});

// Get user's aggregated permissions from database
const permissions = await rbacService.getUserPermissions(userId, orgId);

// Update Keycloak user
await kcAdminClient.users.update(
  { id: keycloakUserId },
  {
    attributes: {
      org_id: 'org-uuid',
      org_slug: 'hospital-name',
      location_ids: ['location-1-uuid', 'location-2-uuid'],
      permissions: permissions // Array of permission strings
    }
  }
);
```

---

## Verification Checklist

- [ ] Database schema applied successfully
- [ ] System roles are present in `roles` table
- [ ] Keycloak client scope `org-claims` created
- [ ] All 4 protocol mappers configured
- [ ] Client scope assigned to your client
- [ ] API server can connect to database
- [ ] RBAC routes are accessible
- [ ] Frontend can read session claims
- [ ] Permission checking functions work
- [ ] Can create custom roles via API
- [ ] Can assign roles to users
- [ ] Keycloak user attributes sync correctly

---

## Common Issues

### Issue 1: Claims Not Appearing in Token

**Solution**: 
1. Check that client scope is in "Assigned Default Client Scopes"
2. Verify mapper configuration
3. Clear browser session and re-login
4. Inspect JWT token at jwt.io

### Issue 2: Database Connection Failed

**Solution**:
```bash
# Test PostgreSQL connection
psql -U medplum -d medplum -h localhost -c "SELECT 1"

# Check environment variables
echo $DB_HOST
echo $DB_USER
```

### Issue 3: Permission Check Always Returns False

**Solution**:
1. Verify user has role assignments in database
2. Check that role has required permission
3. Verify Keycloak attributes are set
4. Check session object has `permissions` array

### Issue 4: Custom Role Not Visible

**Solution**:
```sql
-- Check if role was created
SELECT * FROM roles WHERE key = 'YOUR_ROLE_KEY';

-- Check org_id matches
SELECT * FROM roles WHERE org_id = 'your-org-id';
```

---

## Next Steps

1. **Build Role Management UI**: Create pages for managing roles and assignments
2. **Implement Onboarding**: Build organization registration and onboarding wizard
3. **Setup Audit Log Viewer**: Create UI to view audit_events
4. **Add Location Management**: Implement location CRUD operations
5. **Staff Invitation System**: Build invitation flow for new staff

---

## Security Best Practices

1. **Never expose database directly**: Always use API layer
2. **Validate permissions server-side**: Client-side checks are UX only
3. **Regular audits**: Review role assignments quarterly
4. **Minimal permissions**: Grant only what's needed
5. **Time-bound access**: Use `expires_at` for temporary access

---

## Support

For issues or questions:
1. Check the [RBAC Implementation Guide](./RBAC_IMPLEMENTATION_GUIDE.md)
2. Review the [PRD document](./PRD_Multi_Tenant_RBAC.md)
3. Check database logs: `SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 10`
4. Contact platform team

---

## Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable SSL/TLS for all connections
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts
- [ ] Review and test all permissions
- [ ] Document custom roles
- [ ] Train administrators
- [ ] Prepare rollback plan

---

## Success! 🎉

Your dynamic RBAC system is now ready. Organizations can now:
- Use predefined system roles
- Create unlimited custom roles
- Assign roles with flexible scoping
- Update permissions without code changes
- Audit all access control changes

Refer to the [RBAC Implementation Guide](./RBAC_IMPLEMENTATION_GUIDE.md) for detailed usage examples.
