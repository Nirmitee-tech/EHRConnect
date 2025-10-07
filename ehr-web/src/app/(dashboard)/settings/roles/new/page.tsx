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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
            >
              ← Back to Roles
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
            <p className="text-xs text-gray-600 mt-1">
              Create a custom role tailored to your organization's needs
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || formData.permissions.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Role Details (1/5) */}
        <div className="w-1/5 border-r border-gray-200 bg-white p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Role Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value={RoleScopeLevel.ORG}>Organization</option>
                <option value={RoleScopeLevel.LOCATION}>Location</option>
                <option value={RoleScopeLevel.DEPARTMENT}>Department</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Determines where this role can be assigned
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Describe this role and its responsibilities..."
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{formData.permissions.length}</strong> permissions selected
              </p>
              <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">New Custom Role</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Permission Matrix (4/5) */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Permissions</h2>
              <p className="text-sm text-gray-600 mb-6">
                Select the permissions this role should have. Use the checkboxes to grant specific actions,
                or use the "All" column to grant all permissions for a resource.
              </p>

              <PermissionMatrix
                value={formData.permissions}
                onChange={(permissions) => setFormData({ ...formData, permissions })}
                showSearch
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
