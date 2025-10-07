'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Role, Permission, RoleScopeLevel, CreateRoleDTO } from '@/types/permissions'
import { PermissionMatrix } from '@/components/permissions/PermissionMatrix'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function RoleEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const roleId = params.id as string

  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope_level: RoleScopeLevel.LOCATION,
    permissions: [] as Permission[],
  })

  useEffect(() => {
    if (roleId && roleId !== 'new') {
      fetchRole()
    } else {
      setLoading(false)
      setIsEditing(true)
    }
  }, [roleId])

  async function fetchRole() {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/rbac/v2/roles/${roleId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && {
            'Authorization': `Bearer ${session.accessToken}`,
            'x-org-id': (session as any).org_id || '',
            'x-user-id': (session as any).userId || '',
          }),
        },
      })

      if (!res.ok) throw new Error('Failed to fetch role')

      const data = await res.json()
      setRole(data.role)
      setFormData({
        name: data.role.name,
        description: data.role.description || '',
        scope_level: data.role.scope_level,
        permissions: data.role.permissions,
      })
    } catch (error) {
      console.error('Error fetching role:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)

      const url = roleId === 'new'
        ? `${API_URL}/api/rbac/v2/roles`
        : `${API_URL}/api/rbac/v2/roles/${roleId}`

      const method = roleId === 'new' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && {
            'Authorization': `Bearer ${session.accessToken}`,
            'x-org-id': (session as any).org_id || '',
            'x-user-id': (session as any).userId || '',
          }),
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save role')
      }

      alert('Role saved successfully!')
      router.push('/settings/roles')
    } catch (error: any) {
      console.error('Error saving role:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleCopyRole() {
    if (!role) return

    try {
      setSaving(true)

      const res = await fetch(`${API_URL}/api/rbac/v2/roles/${roleId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && {
            'Authorization': `Bearer ${session.accessToken}`,
            'x-org-id': (session as any).org_id || '',
            'x-user-id': (session as any).userId || '',
          }),
        },
      })

      if (!res.ok) throw new Error('Failed to copy role')

      const data = await res.json()
      alert('Role copied successfully!')
      router.push(`/settings/roles/${data.role.id}`)
    } catch (error) {
      console.error('Error copying role:', error)
      alert('Failed to copy role')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const isSystemRole = role?.is_system && !role?.org_id
  const canEdit = !isSystemRole || isEditing

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
            >
              ← Back to Roles
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {roleId === 'new' ? 'Create New Role' : role?.name}
            </h1>
            {role?.is_system && !role?.org_id && (
              <p className="text-sm text-gray-500 mt-1">
                System Role - Create a copy to customize for your organization
              </p>
            )}
            {role?.parent_role_id && (
              <p className="text-sm text-blue-600 mt-1">
                Custom copy of {role.parent_role_name || 'system role'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {isSystemRole && !isEditing && (
              <button
                onClick={handleCopyRole}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Copy & Customize
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Role'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Details Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Role Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!canEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g., Senior Physician"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scope Level *
            </label>
            <select
              value={formData.scope_level}
              onChange={(e) => setFormData({ ...formData, scope_level: e.target.value as RoleScopeLevel })}
              disabled={!canEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value={RoleScopeLevel.PLATFORM}>Platform</option>
              <option value={RoleScopeLevel.ORG}>Organization</option>
              <option value={RoleScopeLevel.LOCATION}>Location</option>
              <option value={RoleScopeLevel.DEPARTMENT}>Department</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!canEdit}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Describe this role and its responsibilities..."
            />
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Permissions</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select the permissions this role should have. Use the checkboxes to grant specific actions,
          or use the "All" column to grant all permissions for a resource.
        </p>

        <PermissionMatrix
          value={formData.permissions}
          onChange={(permissions) => setFormData({ ...formData, permissions })}
          readOnly={!canEdit}
          showSearch
        />
      </div>
    </div>
  )
}
