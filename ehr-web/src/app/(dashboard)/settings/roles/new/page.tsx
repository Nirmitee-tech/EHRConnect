'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Permission, RoleScopeLevel } from '@/types/permissions'
import { PermissionMatrix } from '@/components/permissions/PermissionMatrix'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function NewRolePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope_level: RoleScopeLevel.LOCATION,
    permissions: [] as Permission[],
  })

  async function handleSave() {
    if (!formData.name || formData.permissions.length === 0) {
      alert('Please provide a name and at least one permission')
      return
    }

    try {
      setSaving(true)

      const res = await fetch(`${API_URL}/api/rbac/v2/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-org-id': (session as any).org_id || '',
          'x-user-id': (session as any).userId || '',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create role')
      }

      alert('Role created successfully!')
      router.push('/settings/roles')
    } catch (error: any) {
      console.error('Error creating role:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
        >
          ← Back to Roles
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Role</h1>
        <p className="text-gray-600 mt-2">
          Create a custom role tailored to your organization's needs
        </p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={RoleScopeLevel.ORG}>Organization</option>
              <option value={RoleScopeLevel.LOCATION}>Location</option>
              <option value={RoleScopeLevel.DEPARTMENT}>Department</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Determines where this role can be assigned
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this role and its responsibilities..."
            />
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Permissions</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select the permissions this role should have. Check individual actions or use "All" to grant all permissions for a resource.
        </p>

        <PermissionMatrix
          value={formData.permissions}
          onChange={(permissions) => setFormData({ ...formData, permissions })}
          showSearch
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !formData.name || formData.permissions.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Creating...' : 'Create Role'}
        </button>
      </div>
    </div>
  )
}
