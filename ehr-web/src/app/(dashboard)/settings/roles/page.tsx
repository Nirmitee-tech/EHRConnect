'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Role, RoleScopeLevel } from '@/types/permissions'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function RolesManagementPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'system' | 'custom'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  async function fetchRoles() {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rbac/v2/roles`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && {
            'Authorization': `Bearer ${session.accessToken}`,
            'x-org-id': (session as any).org_id || '',
            'x-user-id': (session as any).userId || '',
          }),
        },
      })

      if (!res.ok) throw new Error('Failed to fetch roles')

      const data = await res.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roles
    .filter(role => {
      if (filter === 'system') return role.is_system && !role.org_id
      if (filter === 'custom') return role.org_id !== null
      return true
    })
    .filter(role => {
      if (!searchTerm) return true
      return (
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

  const systemRoles = filteredRoles.filter(r => r.is_system && !r.org_id)
  const customRoles = filteredRoles.filter(r => r.org_id !== null)

  function getScopeBadgeColor(scope: RoleScopeLevel) {
    switch (scope) {
      case RoleScopeLevel.PLATFORM:
        return 'bg-purple-100 text-purple-800'
      case RoleScopeLevel.ORG:
        return 'bg-blue-100 text-blue-800'
      case RoleScopeLevel.LOCATION:
        return 'bg-green-100 text-green-800'
      case RoleScopeLevel.DEPARTMENT:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-2">
              Manage system roles and create custom roles for your organization
            </p>
          </div>
          <button
            onClick={() => router.push('/settings/roles/new')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
          >
            + Create Custom Role
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Roles ({roles.length})
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'system'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              System ({systemRoles.length})
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'custom'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Custom ({customRoles.length})
            </button>
          </div>

          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          {/* View Switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'card'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              title="Card View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* System Roles Section */}
      {(filter === 'all' || filter === 'system') && systemRoles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary/70"></span>
            System Roles
            <span className="text-sm font-normal text-gray-500">
              (Default roles available to all organizations)
            </span>
          </h2>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onViewDetails={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                  onCopy={() => router.push(`/settings/roles/new?copy=${role.id}`)}
                  expanded={expandedRoleId === role.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {systemRoles.map((role) => (
                <RoleListItem
                  key={role.id}
                  role={role}
                  onViewDetails={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                  onCopy={() => router.push(`/settings/roles/new?copy=${role.id}`)}
                  expanded={expandedRoleId === role.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Roles Section */}
      {(filter === 'all' || filter === 'custom') && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green-600"></span>
            Custom Roles
            <span className="text-sm font-normal text-gray-500">
              (Organization-specific roles)
            </span>
          </h2>
          {customRoles.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No custom roles yet</p>
              <button
                onClick={() => router.push('/settings/roles/new')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Create Your First Custom Role
              </button>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onViewDetails={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                  isCustom
                  expanded={expandedRoleId === role.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {customRoles.map((role) => (
                <RoleListItem
                  key={role.id}
                  role={role}
                  onViewDetails={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                  isCustom
                  expanded={expandedRoleId === role.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RoleCard({
  role,
  onViewDetails,
  onCopy,
  isCustom = false,
  expanded = false,
}: {
  role: Role
  onViewDetails: () => void
  onCopy?: () => void
  isCustom?: boolean
  expanded?: boolean
}) {
  function getScopeBadgeColor(scope: RoleScopeLevel) {
    switch (scope) {
      case RoleScopeLevel.PLATFORM:
        return 'bg-purple-100 text-purple-800'
      case RoleScopeLevel.ORG:
        return 'bg-blue-100 text-blue-800'
      case RoleScopeLevel.LOCATION:
        return 'bg-green-100 text-green-800'
      case RoleScopeLevel.DEPARTMENT:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`bg-white border rounded-lg transition-all ${expanded ? 'border-primary shadow-lg' : 'border-gray-200 hover:shadow-lg'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{role.name}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScopeBadgeColor(role.scope_level)}`}>
              {role.scope_level}
            </span>
          </div>
          {!isCustom && role.is_system && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              System
            </span>
          )}
          {isCustom && role.parent_role_id && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
              Modified
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {role.description || 'No description'}
        </p>

        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Permissions</div>
          <div className="text-sm font-medium text-gray-900">
            {role.permissions.length} permissions
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:opacity-90 transition-colors flex items-center justify-center gap-2"
          >
            {expanded ? 'Hide Details' : 'View Details'}
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {onCopy && !isCustom && (
            <button
              onClick={onCopy}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions ({role.permissions.length})</h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {role.permissions.map((permission, idx) => (
              <div key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono text-gray-700">
                {permission}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RoleListItem({
  role,
  onViewDetails,
  onCopy,
  isCustom = false,
  expanded = false,
}: {
  role: Role
  onViewDetails: () => void
  onCopy?: () => void
  isCustom?: boolean
  expanded?: boolean
}) {
  function getScopeBadgeColor(scope: RoleScopeLevel) {
    switch (scope) {
      case RoleScopeLevel.PLATFORM:
        return 'bg-purple-100 text-purple-800'
      case RoleScopeLevel.ORG:
        return 'bg-blue-100 text-blue-800'
      case RoleScopeLevel.LOCATION:
        return 'bg-green-100 text-green-800'
      case RoleScopeLevel.DEPARTMENT:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`bg-white border rounded-lg transition-all ${expanded ? 'border-primary shadow-lg' : 'border-gray-200 hover:shadow-md'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900">{role.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getScopeBadgeColor(role.scope_level)}`}>
                  {role.scope_level}
                </span>
                {!isCustom && role.is_system && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    System
                  </span>
                )}
                {isCustom && role.parent_role_id && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                    Modified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-1">
                {role.description || 'No description'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Permissions</div>
              <div className="text-sm font-medium text-gray-900">
                {role.permissions.length}
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={onViewDetails}
              className="px-3 py-2 text-sm bg-primary text-white rounded hover:opacity-90 transition-colors flex items-center gap-1"
            >
              {expanded ? 'Hide' : 'View'}
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {onCopy && !isCustom && (
              <button
                onClick={onCopy}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions ({role.permissions.length})</h4>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {role.permissions.map((permission, idx) => (
              <div key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono text-gray-700">
                {permission}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
