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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Custom Role
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Roles ({roles.length})
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'system'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              System ({systemRoles.length})
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'custom'
                  ? 'bg-blue-600 text-white'
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* System Roles Section */}
      {(filter === 'all' || filter === 'system') && systemRoles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-blue-600"></span>
            System Roles
            <span className="text-sm font-normal text-gray-500">
              (Default roles available to all organizations)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => router.push(`/settings/roles/${role.id}`)}
                onCopy={() => router.push(`/settings/roles/${role.id}/copy`)}
              />
            ))}
          </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Custom Role
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => router.push(`/settings/roles/${role.id}`)}
                  isCustom
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
  onEdit,
  onCopy,
  isCustom = false,
}: {
  role: Role
  onEdit: () => void
  onCopy?: () => void
  isCustom?: boolean
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
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
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded">
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
          onClick={onEdit}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        {onCopy && !isCustom && (
          <button
            onClick={onCopy}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Copy & Customize
          </button>
        )}
      </div>
    </div>
  )
}
