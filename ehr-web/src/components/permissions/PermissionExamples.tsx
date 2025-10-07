'use client'

/**
 * Permission System Examples
 *
 * This file demonstrates various ways to use the permission system.
 * Copy and adapt these examples for your own components.
 */

import { PermissionGate, requirePermission, usePermissionGate } from './PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'

// ============================================
// Example 1: Basic Component-Level Protection
// ============================================

export function PatientListExample() {
  return (
    <PermissionGate permission="patients:read">
      <div className="p-4">
        <h2 className="text-xl font-bold">Patient List</h2>
        <p>Only visible if user has patients:read permission</p>
      </div>
    </PermissionGate>
  )
}

// ============================================
// Example 2: Multiple Permissions (ANY)
// ============================================

export function PatientEditorExample() {
  return (
    <PermissionGate permission={['patients:edit', 'patients:write']}>
      <div className="p-4">
        <h2 className="text-xl font-bold">Edit Patient</h2>
        <p>Visible if user has either patients:edit OR patients:write</p>
      </div>
    </PermissionGate>
  )
}

// ============================================
// Example 3: Multiple Permissions (ALL)
// ============================================

export function AdvancedBillingExample() {
  return (
    <PermissionGate
      permission={['billing:read', 'billing:write', 'invoices:create']}
      requireAll
    >
      <div className="p-4">
        <h2 className="text-xl font-bold">Advanced Billing</h2>
        <p>Visible only if user has ALL three permissions</p>
      </div>
    </PermissionGate>
  )
}

// ============================================
// Example 4: Wildcard Permissions
// ============================================

export function PatientFullAccessExample() {
  return (
    <PermissionGate permission="patients:*">
      <div className="p-4">
        <h2 className="text-xl font-bold">Patient Management</h2>
        <p>All patient operations available (patients:*)</p>
        <div className="space-x-2 mt-4">
          <button>Create</button>
          <button>Edit</button>
          <button>Delete</button>
          <button>Export</button>
        </div>
      </div>
    </PermissionGate>
  )
}

// ============================================
// Example 5: With Fallback
// ============================================

export function ProtectedFeatureWithFallback() {
  return (
    <PermissionGate
      permission="reports:export"
      fallback={
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-gray-600">
            You need export permissions to access this feature.
            Contact your administrator.
          </p>
        </div>
      }
    >
      <div className="p-4">
        <h2 className="text-xl font-bold">Export Reports</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Export to PDF
        </button>
      </div>
    </PermissionGate>
  )
}

// ============================================
// Example 6: Feature-Based Check
// ============================================

export function CreatePatientButton() {
  return (
    <PermissionGate feature="patients.create">
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Create New Patient
      </button>
    </PermissionGate>
  )
}

// ============================================
// Example 7: Using the Hook Directly
// ============================================

export function ConditionalRenderingExample() {
  const { hasPermission, hasAllPermissions, hasFeature, permissions } = usePermissions()

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Conditional Rendering</h2>

      {/* Simple permission check */}
      {hasPermission('patients:read') && (
        <button>View Patients</button>
      )}

      {/* Multiple permission check */}
      {hasPermission(['patients:create', 'patients:edit']) && (
        <button>Create or Edit Patient</button>
      )}

      {/* Require all permissions */}
      {hasAllPermissions(['billing:read', 'billing:write']) && (
        <button>Manage Billing</button>
      )}

      {/* Feature check */}
      {hasFeature('reports.export') && (
        <button>Export Report</button>
      )}

      {/* Display all permissions */}
      <div className="text-sm text-gray-600">
        <strong>Your permissions:</strong>
        <ul className="list-disc list-inside">
          {permissions.slice(0, 5).map(perm => (
            <li key={perm}>{perm}</li>
          ))}
          {permissions.length > 5 && <li>...and {permissions.length - 5} more</li>}
        </ul>
      </div>
    </div>
  )
}

// ============================================
// Example 8: Imperative Check with Hook
// ============================================

export function ImperativeCheckExample() {
  const { canAccess, loading } = usePermissionGate({
    permission: 'admin:access'
  })

  if (loading) {
    return <div>Loading permissions...</div>
  }

  if (!canAccess) {
    return <div>Access Denied</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Admin Panel</h2>
      <p>You have admin access!</p>
    </div>
  )
}

// ============================================
// Example 9: Complex Custom Logic
// ============================================

export function CustomLogicExample() {
  return (
    <PermissionGate
      customCheck={(permissions) => {
        // Custom logic: needs either full admin OR specific combination
        const hasFullAdmin = permissions.includes('*:*')
        const hasSpecificAccess =
          permissions.includes('patients:read') &&
          permissions.includes('appointments:read') &&
          permissions.includes('billing:read')

        return hasFullAdmin || hasSpecificAccess
      }}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p>Custom permission logic applied</p>
      </div>
    </PermissionGate>
  )
}

// ============================================
// Example 10: HOC Pattern
// ============================================

function AdminPanel() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Admin Panel</h2>
      <p>This component is protected by HOC</p>
    </div>
  )
}

// Wrap component with permission requirement
export const ProtectedAdminPanel = requirePermission(
  AdminPanel,
  'admin:access',
  {
    fallback: <div>Access Denied</div>
  }
)

// ============================================
// Example 11: Granular Button Permissions
// ============================================

export function PatientActionsExample() {
  return (
    <div className="p-4 space-x-2">
      <PermissionGate permission="patients:read">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          View
        </button>
      </PermissionGate>

      <PermissionGate permission="patients:create">
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </PermissionGate>

      <PermissionGate permission="patients:edit">
        <button className="bg-yellow-600 text-white px-4 py-2 rounded">
          Edit
        </button>
      </PermissionGate>

      <PermissionGate permission="patients:delete">
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Delete
        </button>
      </PermissionGate>

      <PermissionGate permission="patients:print">
        <button className="bg-gray-600 text-white px-4 py-2 rounded">
          Print
        </button>
      </PermissionGate>

      <PermissionGate permission="patients:send">
        <button className="bg-purple-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </PermissionGate>
    </div>
  )
}

// ============================================
// Example 12: Real-time Connection Status
// ============================================

export function ConnectionStatusExample() {
  const { isConnected, refreshPermissions, permissions } = usePermissions()

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">
          {isConnected ? 'Connected' : 'Disconnected'} - Real-time updates {isConnected ? 'active' : 'inactive'}
        </span>
      </div>

      <button
        onClick={refreshPermissions}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Refresh Permissions
      </button>

      <p className="mt-4 text-sm text-gray-600">
        You have {permissions.length} permissions
      </p>
    </div>
  )
}

// ============================================
// Example 13: Loading State Handling
// ============================================

export function LoadingStateExample() {
  return (
    <PermissionGate
      permission="reports:read"
      showLoading
      loadingComponent={
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }
    >
      <div className="p-4">
        <h2 className="text-xl font-bold">Reports</h2>
        <p>Content loaded after permission check</p>
      </div>
    </PermissionGate>
  )
}
