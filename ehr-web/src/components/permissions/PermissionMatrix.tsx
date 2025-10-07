'use client'

import { useState, useEffect, useMemo } from 'react'
import { Permission, PermissionAction, PermissionResource } from '@/types/permissions'

interface PermissionMatrixProps {
  /** Selected permissions */
  value: Permission[]
  /** Callback when permissions change */
  onChange: (permissions: Permission[]) => void
  /** Whether the matrix is read-only */
  readOnly?: boolean
  /** Resources to display (default: all) */
  resources?: string[]
  /** Actions to display (default: all) */
  actions?: PermissionAction[]
  /** Whether to show search/filter */
  showSearch?: boolean
  /** Custom resource labels */
  resourceLabels?: Record<string, string>
}

const ALL_ACTIONS: PermissionAction[] = [
  PermissionAction.READ,
  PermissionAction.CREATE,
  PermissionAction.EDIT,
  PermissionAction.DELETE,
  PermissionAction.SUBMIT,
  PermissionAction.APPROVE,
  PermissionAction.PRINT,
  PermissionAction.SEND,
]

const DEFAULT_RESOURCES = Object.values(PermissionResource).filter(
  r => r !== PermissionResource.PLATFORM
)

/**
 * PermissionMatrix - Visual permission editor with checkbox matrix
 *
 * Displays a matrix of resources (rows) x actions (columns) with checkboxes
 * Supports wildcard permissions and bulk selection
 */
export function PermissionMatrix({
  value,
  onChange,
  readOnly = false,
  resources = DEFAULT_RESOURCES,
  actions = ALL_ACTIONS,
  showSearch = true,
  resourceLabels = {},
}: PermissionMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set(value))

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedPermissions(new Set(value))
  }, [value])

  // Filter resources based on search
  const filteredResources = useMemo(() => {
    if (!searchTerm) return resources

    return resources.filter(resource => {
      const label = getResourceLabel(resource)
      return label.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [resources, searchTerm, resourceLabels])

  // Get resource display label
  function getResourceLabel(resource: string): string {
    if (resourceLabels[resource]) {
      return resourceLabels[resource]
    }
    return resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Get action display label
  function getActionLabel(action: PermissionAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1)
  }

  // Check if permission is selected (including wildcard matching)
  function isPermissionSelected(resource: string, action: PermissionAction): boolean {
    const specificPerm = `${resource}:${action}` as Permission
    const resourceWildcard = `${resource}:*` as Permission
    const actionWildcard = `*:${action}` as Permission
    const allWildcard = `*:*` as Permission

    return (
      selectedPermissions.has(specificPerm) ||
      selectedPermissions.has(resourceWildcard) ||
      selectedPermissions.has(actionWildcard) ||
      selectedPermissions.has(allWildcard)
    )
  }

  // Toggle a specific permission
  function togglePermission(resource: string, action: PermissionAction) {
    if (readOnly) return

    const newPermissions = new Set(selectedPermissions)
    const permission = `${resource}:${action}` as Permission

    if (newPermissions.has(permission)) {
      newPermissions.delete(permission)
    } else {
      newPermissions.add(permission)
    }

    setSelectedPermissions(newPermissions)
    onChange(Array.from(newPermissions))
  }

  // Toggle all actions for a resource
  function toggleResourceAll(resource: string) {
    if (readOnly) return

    const resourceWildcard = `${resource}:*` as Permission
    const newPermissions = new Set(selectedPermissions)

    if (newPermissions.has(resourceWildcard)) {
      // Remove wildcard and all specific permissions for this resource
      newPermissions.delete(resourceWildcard)
      actions.forEach(action => {
        newPermissions.delete(`${resource}:${action}` as Permission)
      })
    } else {
      // Add wildcard permission
      newPermissions.add(resourceWildcard)
      // Remove specific permissions (wildcard covers them)
      actions.forEach(action => {
        newPermissions.delete(`${resource}:${action}` as Permission)
      })
    }

    setSelectedPermissions(newPermissions)
    onChange(Array.from(newPermissions))
  }

  // Toggle all resources for an action
  function toggleActionAll(action: PermissionAction) {
    if (readOnly) return

    const actionWildcard = `*:${action}` as Permission
    const newPermissions = new Set(selectedPermissions)

    if (newPermissions.has(actionWildcard)) {
      newPermissions.delete(actionWildcard)
    } else {
      newPermissions.add(actionWildcard)
    }

    setSelectedPermissions(newPermissions)
    onChange(Array.from(newPermissions))
  }

  // Check if all actions are selected for a resource
  function isResourceFullySelected(resource: string): boolean {
    const resourceWildcard = `${resource}:*` as Permission
    if (selectedPermissions.has(resourceWildcard)) return true

    return actions.every(action => isPermissionSelected(resource, action))
  }

  // Check if all resources are selected for an action
  function isActionFullySelected(action: PermissionAction): boolean {
    const actionWildcard = `*:${action}` as Permission
    return selectedPermissions.has(actionWildcard)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Matrix */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Resource
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => readOnly ? null : toggleResourceAll('*')}
                  className="font-medium hover:text-gray-700"
                  disabled={readOnly}
                >
                  All
                </button>
              </th>
              {actions.map(action => (
                <th
                  key={action}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => toggleActionAll(action)}
                    className="font-medium hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={readOnly}
                    title={`Toggle ${action} for all resources`}
                  >
                    {getActionLabel(action)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResources.map(resource => (
              <tr key={resource} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  {getResourceLabel(resource)}
                </td>
                <td className="px-2 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={isResourceFullySelected(resource)}
                    onChange={() => toggleResourceAll(resource)}
                    disabled={readOnly}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Toggle all permissions for ${getResourceLabel(resource)}`}
                  />
                </td>
                {actions.map(action => (
                  <td key={`${resource}-${action}`} className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isPermissionSelected(resource, action)}
                      onChange={() => togglePermission(resource, action)}
                      disabled={readOnly}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`${resource}:${action}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected permissions summary */}
      <div className="text-sm text-gray-600">
        <strong>{selectedPermissions.size}</strong> permissions selected
        {selectedPermissions.has('*:*' as Permission) && (
          <span className="ml-2 text-blue-600 font-medium">(Full Access)</span>
        )}
      </div>
    </div>
  )
}

/**
 * Simple permission list display (read-only)
 */
export function PermissionList({ permissions }: { permissions: Permission[] }) {
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, string[]> = {}

    permissions.forEach(perm => {
      const [resource, action] = perm.split(':')
      if (!groups[resource]) {
        groups[resource] = []
      }
      groups[resource].push(action)
    })

    return groups
  }, [permissions])

  return (
    <div className="space-y-2">
      {Object.entries(groupedPermissions).map(([resource, actions]) => (
        <div key={resource} className="flex items-start gap-2">
          <span className="font-medium text-gray-700 min-w-[200px]">
            {resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
          </span>
          <span className="text-gray-600">
            {actions.includes('*') ? (
              <span className="text-blue-600 font-medium">All Actions</span>
            ) : (
              actions.join(', ')
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
