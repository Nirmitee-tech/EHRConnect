# Missing Pieces Implementation - Part 2

Continuation of production-readiness features (Sections 6-13).

---

## 6. RBAC Audit Enhancements

### Enhanced Audit Events Table

Add login/failure tracking to the existing schema:

```sql
-- Add to schema.sql or run as migration

-- Create audit event types enum for better indexing
CREATE TYPE audit_action_type AS ENUM (
  'ORG.CREATED', 'ORG.UPDATED', 'ORG.SUSPENDED',
  'LOCATION.CREATED', 'LOCATION.UPDATED', 'LOCATION.DISABLED',
  'USER.INVITED', 'INVITE.ACCEPTED', 'INVITE.REVOKED',
  'ROLE.CREATED', 'ROLE.UPDATED', 'ROLE.DELETED',
  'ROLE.GRANTED', 'ROLE.REVOKED',
  'USER.DEACTIVATED', 'USER.REACTIVATED',
  'AUTH.LOGIN.SUCCESS', 'AUTH.LOGIN.FAILURE',
  'AUTH.LOGOUT', 'AUTH.FORCED_LOGOUT',
  'AUTH.PASSWORD_RESET_REQUESTED', 'AUTH.PASSWORD_RESET_COMPLETED',
  'PERMISSION.UPDATED', 'SECURITY_VIOLATION'
);

-- Optional: Convert existing action column to use enum
-- ALTER TABLE audit_events ALTER COLUMN action TYPE audit_action_type USING action::audit_action_type;

-- Index for common audit queries
CREATE INDEX IF NOT EXISTS idx_audit_events_action_status 
  ON audit_events(action, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_security 
  ON audit_events(org_id, action) 
  WHERE action LIKE 'AUTH.LOGIN.FAILURE%' OR action = 'SECURITY_VIOLATION';
```

### Login Success/Failure Tracking

**Backend Middleware**: `ehr-api/src/middleware/auth-logger.js`

```javascript
const { query } = require('../database/connection');

async function logLoginAttempt(email, success, reason = null, req) {
  try {
    // Get user and org if exists
    const userResult = await query(
      `SELECT u.id, ra.org_id
       FROM users u
       LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.revoked_at IS NULL
       WHERE u.email = $1
       LIMIT 1`,
      [email]
    );

    const userId = userResult.rows[0]?.id;
    const orgId = userResult.rows[0]?.org_id;

    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, error_message, metadata, ip_address, user_agent
      )
      VALUES ($1, $2, $3, 'User', $4, $5, $6, $7, $8, $9, $10)`,
      [
        orgId,
        userId,
        success ? 'AUTH.LOGIN.SUCCESS' : 'AUTH.LOGIN.FAILURE',
        userId,
        email,
        success ? 'success' : 'failure',
        reason,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
        }),
        req.ip,
        req.headers['user-agent'],
      ]
    );

    // Check for suspicious activity (multiple failed attempts)
    if (!success) {
      await checkSuspiciousActivity(email, req.ip);
    }
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

async function checkSuspiciousActivity(email, ipAddress) {
  const result = await query(
    `SELECT COUNT(*) as failure_count
     FROM audit_events
     WHERE action = 'AUTH.LOGIN.FAILURE'
       AND target_name = $1
       AND created_at > NOW() - INTERVAL '15 minutes'`,
    [email]
  );

  const failureCount = parseInt(result.rows[0].failure_count);

  if (failureCount >= 5) {
    // Log security alert
    await query(
      `INSERT INTO audit_events (
        org_id, action, target_type, target_name,
        status, metadata, ip_address
      )
      SELECT ra.org_id, 'SECURITY_VIOLATION', 'SecurityAlert', $1,
             'failure', $2, $3
      FROM users u
      LEFT JOIN role_assignments ra ON u.id = ra.user_id
      WHERE u.email = $1
      LIMIT 1`,
      [
        email,
        JSON.stringify({
          type: 'MULTIPLE_FAILED_LOGINS',
          count: failureCount,
          window: '15 minutes',
        }),
        ipAddress,
      ]
    );

    // TODO: Integrate with alerting system (email, Slack, etc.)
    console.warn(`Security Alert: ${failureCount} failed login attempts for ${email} from ${ipAddress}`);
  }
}

module.exports = { logLoginAttempt };
```

### Permission Update Logging

Enhance RBAC service to log permission changes:

```javascript
// Add to rbac.service.js

async updateRole(roleId, updates, org_id, updated_by_user_id) {
  // ... existing code ...

  // Enhanced audit log with before/after comparison
  await this._createAuditLog(client, {
    org_id,
    actor_user_id: updated_by_user_id,
    action: 'PERMISSION.UPDATED',
    target_type: 'Role',
    target_id: roleId,
    target_name: result.rows[0].name,
    status: 'success',
    metadata: { 
      updates,
      previous: { 
        name: existingRole.name,
        permissions: existingRole.permissions 
      },
      new: {
        name: result.rows[0].name,
        permissions: result.rows[0].permissions
      },
      changes: comparePermissions(existingRole.permissions, result.rows[0].permissions)
    }
  });
}

function comparePermissions(oldPerms, newPerms) {
  const oldSet = new Set(JSON.parse(oldPerms));
  const newSet = new Set(JSON.parse(newPerms));
  
  return {
    added: Array.from(newSet).filter(p => !oldSet.has(p)),
    removed: Array.from(oldSet).filter(p => !newSet.has(p)),
  };
}
```

---

## 7. Multi-Location Edge Cases

### Location Switcher Component

**File**: `ehr-web/src/components/location-switcher.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function LocationSwitcher() {
  const { data: session } = useSession();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  // Load user's accessible locations
  useEffect(() => {
    loadLocations();
  }, [session]);

  const loadLocations = async () => {
    if (!session?.org_id) return;

    const response = await fetch(`/api/orgs/${session.org_id}/locations?activeOnly=true`);
    const data = await response.json();
    
    // Filter by user's assigned locations
    const userLocationIds = session.location_ids || [];
    const accessible = data.locations.filter((loc: any) => 
      userLocationIds.length === 0 || userLocationIds.includes(loc.id)
    );
    
    setAvailableLocations(accessible);
    
    // Default to all accessible locations
    if (selectedLocations.length === 0) {
      setSelectedLocations(accessible.map((l: any) => l.id));
    }
  };

  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Filter by Location</h3>
      
      {availableLocations.length === 0 ? (
        <p className="text-sm text-gray-500">Access to all locations</p>
      ) : (
        <div className="space-y-2">
          {availableLocations.map(location => (
            <label key={location.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedLocations.includes(location.id)}
                onChange={() => toggleLocation(location.id)}
                className="mr-2"
              />
              <span className="text-sm">{location.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Handle Disabled Location

**Backend Service**: Add to `organization.service.js`

```javascript
async disableLocation(locationId, disabledBy, reason) {
  return await transaction(async (client) => {
    // Get location and affected users
    const locationResult = await client.query(
      `SELECT l.*, o.name as org_name
       FROM locations l
       JOIN organizations o ON l.org_id = o.id
       WHERE l.id = $1`,
      [locationId]
    );

    if (locationResult.rows.length === 0) {
      throw new Error('Location not found');
    }

    const location = locationResult.rows[0];

    // Get users assigned to this location only
    const usersResult = await client.query(
      `SELECT DISTINCT u.id, u.email, u.name, u.keycloak_user_id
       FROM users u
       JOIN role_assignments ra ON u.id = ra.user_id
       WHERE ra.location_id = $1 
         AND ra.scope = 'LOCATION'
         AND ra.revoked_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM role_assignments ra2
         WHERE ra2.user_id = u.id 
           AND ra2.org_id = ra.org_id
           AND (ra2.scope = 'ORG' OR ra2.location_id != $1)
           AND ra2.revoked_at IS NULL
       )`,
      [locationId]
    );

    // Disable location
    await client.query(
      `UPDATE locations
       SET active = false, deactivated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [locationId]
    );

    // Handle users with access ONLY to this location
    for (const user of usersResult.rows) {
      // Option 1: Revoke their access (they lose access to system)
      await client.query(
        `UPDATE role_assignments
         SET revoked_at = CURRENT_TIMESTAMP,
             revoked_by = $1,
             revocation_reason = $2
         WHERE user_id = $3 AND location_id = $4`,
        [disabledBy, `Location ${location.name} was disabled`, user.id, locationId]
      );

      // Update Keycloak to remove location_id and recalculate permissions
      const remainingLocations = await this.getUserLocationIds(user.id, location.org_id);
      const permissions = await rbacService.getUserPermissions(user.id, location.org_id);
      
      await KeycloakService.updateUserAttributes(user.keycloak_user_id, {
        location_ids: remainingLocations,
        permissions: permissions,
      });

      // Option 2: Keep their data readable but no new access
      // This would require adding a 'read_only' flag to role_assignments
    }

    // Audit log
    await client.query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata
      )
      VALUES ($1, $2, 'LOCATION.DISABLED', 'Location', $3, $4, 'success', $5)`,
      [
        location.org_id,
        disabledBy,
        locationId,
        location.name,
        JSON.stringify({ 
          reason, 
          affected_users: usersResult.rows.length,
          user_emails: usersResult.rows.map(u => u.email)
        }),
      ]
    );

    return {
      success: true,
      affected_users: usersResult.rows.length,
      message: `Location disabled. ${usersResult.rows.length} users affected.`,
    };
  });
}

async getUserLocationIds(userId, orgId) {
  const result = await query(
    `SELECT DISTINCT location_id
     FROM role_assignments
     WHERE user_id = $1 AND org_id = $2 
       AND scope = 'LOCATION'
       AND revoked_at IS NULL`,
    [userId, orgId]
  );
  
  return result.rows.map(r => r.location_id).filter(Boolean);
}
```

---

## 8. Compliance Gaps (HIPAA/GDPR)

### PII Redaction in Audit Logs

**File**: `ehr-api/src/utils/pii-redaction.js`

```javascript
/**
 * Redact PII from audit log metadata
 * HIPAA/GDPR compliant logging
 */

const PII_FIELDS = ['ssn', 'dob', 'phone', 'address', 'medical_record_number'];
const PHI_FIELDS = ['diagnosis', 'medication', 'test_results', 'clinical_notes'];

function redactPII(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const redacted = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Redact PII fields
    if (PII_FIELDS.some(field => lowerKey.includes(field))) {
      redacted[key] = '[REDACTED-PII]';
    }
    // Redact PHI fields
    else if (PHI_FIELDS.some(field => lowerKey.includes(field))) {
      redacted[key] = '[REDACTED-PHI]';
    }
    // Mask email partially
    else if (lowerKey.includes('email') && typeof value === 'string') {
      redacted[key] = maskEmail(value);
    }
    // Recursively process nested objects
    else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactPII(value);
    }
    else {
      redacted[key] = value;
    }
  }

  return redacted;
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return '[REDACTED]';
  
  const masked = local.length > 2
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : '***';
  
  return `${masked}@${domain}`;
}

module.exports = { redactPII, maskEmail };
```

Use in audit logging:

```javascript
const { redactPII } = require('../utils/pii-redaction');

async function _createAuditLog(client, logData) {
  // Redact PII from metadata before storing
  const redactedMetadata = redactPII(logData.metadata);
  
  await client.query(
    `INSERT INTO audit_events (...)
     VALUES (... , $8, ...)`,
    [..., JSON.stringify(redactedMetadata), ...]
  );
}
```

### Data Retention Policy

**File**: `ehr-api/src/jobs/cleanup-audit-logs.js`

```javascript
const { query } = require('../database/connection');

/**
 * Cleanup old audit logs based on org retention policy
 * Run as cron job (e.g., daily)
 */
async function cleanupAuditLogs() {
  try {
    // Get organizations with retention policies
    const orgsResult = await query(
      `SELECT os.org_id, os.value->>'retention_days' as retention_days
       FROM organization_settings os
       WHERE os.category = 'data_retention'
         AND os.key = 'audit_log_retention'
         AND os.value->>'retention_days' IS NOT NULL`
    );

    let totalDeleted = 0;

    for (const org of orgsResult.rows) {
      const retentionDays = parseInt(org.retention_days);
      
      // Default to 7 years for HIPAA compliance if not set
      const daysToKeep = retentionDays || 2555;

      const result = await query(
        `DELETE FROM audit_events
         WHERE org_id = $1
           AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * $2
           AND action NOT IN ('AUTH.LOGIN.FAILURE', 'SECURITY_VIOLATION')
         RETURNING id`,
        [org.org_id, daysToKeep]
      );

      totalDeleted += result.rows.length;
      
      console.log(`Deleted ${result.rows.length} audit logs for org ${org.org_id}`);
    }

    console.log(`Total audit logs cleaned up: ${totalDeleted}`);
    return { success: true, deleted: totalDeleted };
  } catch (error) {
    console.error('Audit log cleanup error:', error);
    throw error;
  }
}

// Export for cron job or API trigger
module.exports = { cleanupAuditLogs };
```

### Encryption Policy Documentation

**File**: `COMPLIANCE.md`

```markdown
# Compliance & Security

## Encryption

### Data at Rest
- Database: PostgreSQL with encryption enabled (AES-256)
- Backups: Encrypted with AWS KMS or equivalent
- File storage: Server-side encryption for any uploaded files

### Data in Transit
- All API calls: HTTPS/TLS 1.2+ only
- Database connections: SSL/TLS required
- Internal services: mTLS for service-to-service

## Audit Trail

### Retention
- Default: 7 years (HIPAA requirement)
- Configurable per organization
- Security events: Never deleted

### PII/PHI Protection
- Automatic redaction in logs
- Email masking
- No PHI in error messages or stack traces

## Access Control

### Password Policy
- Minimum 8 characters
- Complexity enforced by Keycloak
- 90-day rotation recommended
- No password reuse (last 5)

### Session Management
- 8-hour session timeout (healthcare standard)
- Automatic logout on role revocation
- IP-based anomaly detection

### MFA (Coming Soon)
- TOTP support
- SMS backup codes
- Required for platform admins

## HIPAA Compliance

- BAA signed during registration
- PHI access logging
- Minimum necessary access (RBAC)
- Breach notification procedures documented

## GDPR Compliance

- Right to erasure (user deletion)
- Right to portability (data export)
- Consent management
- Data processing agreements
```

---

## 9. Custom Role Management UX

### Role Management UI Component

**File**: `ehr-web/src/app/t/[orgSlug]/roles/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function RolesPage({ params }: { params: { orgSlug: string } }) {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const response = await fetch('/api/rbac/roles');
    const data = await response.json();
    setRoles(data.roles);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Custom Role
        </button>
      </div>

      <div className="grid gap-4">
        {roles.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={() => setSelectedRole(role)}
            onDelete={() => handleDeleteRole(role.id)}
          />
        ))}
      </div>

      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadRoles();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function RoleCard({ role, onEdit, onDelete }: any) {
  const [expanded, setExpanded] = useState(false);
  const hasWildcard = role.permissions.some((p: string) => p.includes('*'));

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{role.name}</h3>
            {role.is_system && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">System</span>
            )}
            {hasWildcard && (
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                ⚠️ Wildcard
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            Scope: {role.scope_level} • {role.permissions.length} permissions
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {expanded ? 'Hide' : 'Show'} Permissions
          </button>
          {!role.is_system && (
            <>
              <button
                onClick={onEdit}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Permissions:</h4>
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((perm: string) => (
              <span
                key={perm}
                className={`text-xs px-2 py-1 rounded ${
                  perm.includes('*')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

Due to length, I'll complete sections 10-13 in the next response with attempt_completion.
