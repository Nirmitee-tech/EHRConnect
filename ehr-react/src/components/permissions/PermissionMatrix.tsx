'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Permission } from '@/types/permissions'
import { PermissionAction, PermissionResource } from '@/types/permissions'
import { Search, CheckCircle2, XCircle, Filter, ChevronDown, ChevronRight, Info, HelpCircle } from 'lucide-react'

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
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'unselected'>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Clinical', 'Medication', 'Diagnostics', 'Financial', 'Administration', 'Data']))

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedPermissions(new Set(value))
  }, [value])

  // Resource descriptions
  const RESOURCE_DESCRIPTIONS: Record<string, string> = {
    'patients': 'Patient demographic information, contact details, and medical records',
    'appointments': 'Scheduling and managing patient appointments',
    'encounters': 'Clinical visits and interactions with patients',
    'observations': 'Vital signs, measurements, and clinical observations',
    'diagnoses': 'Medical diagnoses and conditions',
    'procedures': 'Medical procedures, surgeries, and treatments',
    'clinical_notes': 'Doctor notes, progress notes, and clinical documentation',
    'medications': 'Medication lists and administration records',
    'prescriptions': 'Prescribing and managing prescriptions',
    'allergies': 'Patient allergies and adverse reactions',
    'immunizations': 'Vaccination records and immunization history',
    'lab_orders': 'Laboratory test orders and requisitions',
    'lab_results': 'Laboratory test results and reports',
    'imaging_orders': 'Radiology and imaging test orders',
    'imaging_results': 'Radiology reports and imaging results',
    'billing': 'Patient billing, charges, and financial records',
    'invoices': 'Invoice generation and management',
    'payments': 'Payment processing and receipts',
    'insurance': 'Insurance information and coverage details',
    'claims': 'Insurance claims submission and tracking',
    'org': 'Organization settings and configuration',
    'locations': 'Facility locations and departments',
    'departments': 'Department management and organization',
    'staff': 'Staff members, practitioners, and users',
    'roles': 'User roles and role management',
    'permissions': 'Permission configuration and access control',
    'settings': 'System settings and preferences',
    'reports': 'Report generation and analytics',
    'audit': 'Audit logs and compliance tracking',
    'integrations': 'External system integrations and APIs',
    'notifications': 'System notifications and alerts',
    'patient_demographics': 'Basic patient information like name, DOB, gender',
    'patient_history': 'Patient medical history and past records',
    'forms': 'Clinical forms and questionnaires',
  }

  // Get resource display label
  const getResourceLabel = useCallback((resource: string): string => {
    if (resourceLabels[resource]) {
      return resourceLabels[resource]
    }
    return resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }, [resourceLabels])

  // Get action display label
  function getActionLabel(action: PermissionAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1)
  }

  // Get resource description
  const getResourceDescription = (resource: string): string => {
    return RESOURCE_DESCRIPTIONS[resource] || 'Manage this resource'
  }

  // Check if permission is selected (including wildcard matching)
  const isPermissionSelected = useCallback((resource: string, action: PermissionAction): boolean => {
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
  }, [selectedPermissions])

  // Filter resources based on search and filter mode
  const filteredResources = useMemo(() => {
    let filtered = resources

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(resource => {
        const label = getResourceLabel(resource)
        return label.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Apply selection filter
    if (filterMode === 'selected') {
      filtered = filtered.filter(resource => {
        return actions.some(action => isPermissionSelected(resource, action))
      })
    } else if (filterMode === 'unselected') {
      filtered = filtered.filter(resource => {
        return !actions.some(action => isPermissionSelected(resource, action))
      })
    }

    return filtered
  }, [resources, searchTerm, filterMode, actions, getResourceLabel, isPermissionSelected])

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

  // Group resources by category for better organization
  const groupedResources = useMemo(() => {
    const groups: Record<string, string[]> = {
      'Clinical': ['patients', 'appointments', 'encounters', 'observations', 'diagnoses', 'procedures', 'clinical_notes'],
      'Medication': ['medications', 'prescriptions', 'allergies', 'immunizations'],
      'Diagnostics': ['lab_orders', 'lab_results', 'imaging_orders', 'imaging_results'],
      'Financial': ['billing', 'invoices', 'payments', 'insurance', 'claims'],
      'Administration': ['org', 'locations', 'departments', 'staff', 'roles', 'permissions', 'settings'],
      'Data': ['reports', 'audit', 'integrations', 'notifications'],
    }

    // Categorize filtered resources
    const categorized: Record<string, string[]> = {}
    const uncategorized: string[] = []

    filteredResources.forEach(resource => {
      let found = false
      for (const [category, categoryResources] of Object.entries(groups)) {
        if (categoryResources.includes(resource)) {
          if (!categorized[category]) categorized[category] = []
          categorized[category].push(resource)
          found = true
          break
        }
      }
      if (!found) uncategorized.push(resource)
    })

    if (uncategorized.length > 0) {
      categorized['Other'] = uncategorized
    }

    return categorized
  }, [filteredResources])

  const permissionStats = useMemo(() => {
    const total = resources.length * actions.length
    const selected = selectedPermissions.size
    const percentage = Math.round((selected / total) * 100)
    return { total, selected, percentage }
  }, [selectedPermissions, resources, actions])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(groupedResources)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showSearch && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('selected')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterMode === 'selected'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Selected
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unselected')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterMode === 'unselected'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <XCircle className="h-4 w-4" />
              Unselected
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-600 mb-1">Permissions Selected</p>
            <p className="text-2xl font-bold text-gray-900">
              {permissionStats.selected}
              <span className="text-sm font-normal text-gray-500 ml-1">/ {permissionStats.total}</span>
            </p>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div>
            <p className="text-xs text-gray-600 mb-1">Coverage</p>
            <p className="text-2xl font-bold text-blue-600">{permissionStats.percentage}%</p>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div>
            <p className="text-xs text-gray-600 mb-1">Resources</p>
            <p className="text-2xl font-bold text-gray-900">{filteredResources.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Collapse All
          </button>
          {selectedPermissions.has('*:*' as Permission) && (
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
              🌟 Full Access Granted
            </div>
          )}
        </div>
      </div>

      {/* Matrix - Grouped by Category */}
      <div className="space-y-3">
        {Object.entries(groupedResources).map(([category, categoryResources]) => {
          const isExpanded = expandedCategories.has(category)
          const categoryPermissionCount = categoryResources.reduce((count, resource) => {
            return count + actions.filter(action => isPermissionSelected(resource, action)).length
          }, 0)
          const totalCategoryPermissions = categoryResources.length * actions.length

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200 hover:from-gray-100 hover:to-gray-150 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                  <Filter className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    {category}
                  </h3>
                  <span className="text-xs font-normal text-gray-500">
                    ({categoryResources.length} resources)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {categoryPermissionCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        {categoryPermissionCount} / {totalCategoryPermissions} selected
                      </span>
                    </div>
                  )}
                  {categoryPermissionCount === 0 && (
                    <span className="text-xs text-gray-400">No permissions selected</span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                      Resource
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        type="button"
                        onClick={() => readOnly ? null : toggleResourceAll('*')}
                        className="font-medium hover:text-gray-700"
                        disabled={readOnly}
                        title="Select all permissions"
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
                  {categoryResources.map(resource => {
                    const hasAnyPermission = actions.some(action => isPermissionSelected(resource, action))
                    const description = getResourceDescription(resource)
                    return (
                      <tr
                        key={resource}
                        className={`hover:bg-blue-50 transition-colors ${hasAnyPermission ? 'bg-green-50/30' : ''}`}
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit">
                          <div className="flex items-center gap-2 group">
                            {hasAnyPermission && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            <span className="flex-shrink-0">{getResourceLabel(resource)}</span>
                            <div className="relative flex-shrink-0">
                              <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
                              <div className="absolute left-0 top-6 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                <div className="font-semibold mb-1">{getResourceLabel(resource)}</div>
                                <div className="text-gray-300">{description}</div>
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isResourceFullySelected(resource)}
                            onChange={() => toggleResourceAll(resource)}
                            disabled={readOnly}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title={`Toggle all permissions for ${getResourceLabel(resource)}`}
                          />
                        </td>
                        {actions.map(action => {
                          const isSelected = isPermissionSelected(resource, action)
                          return (
                            <td
                              key={`${resource}-${action}`}
                              className={`px-4 py-3 text-center ${isSelected ? 'bg-blue-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermission(resource, action)}
                                disabled={readOnly}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                title={`${resource}:${action}`}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No resources found matching your filters</p>
        </div>
      )}
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
