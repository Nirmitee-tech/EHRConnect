'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Plus, Edit, Trash2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface Role {
  id: string;
  key: string;
  name: string;
  description: string;
  scope_level: string;
  permissions: string[];
  is_system: boolean;
}

export default function RolesPermissionsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rbac/roles?includeSystem=true&includeCustom=true`,
        {
          headers: {
            'x-org-id': session?.org_id || '',
            'x-user-id': session?.user?.id || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-600" />
              {t('roles.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('roles.manage_roles')}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('roles.create_role')}
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('roles.no_roles_found')}</p>
          </div>
        ) : (
          roles.map((role) => {
            const isExpanded = expandedRoles.has(role.id);
            const hasWildcard = role.permissions?.some((p) => p.includes('*'));

            return (
              <div
                key={role.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
                        {role.is_system && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                            System Role
                          </span>
                        )}
                        {hasWildcard && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Wildcard
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{role.description}</p>
                      <p className="text-xs text-gray-500">
                        <strong>Scope:</strong> {role.scope_level} •{' '}
                        <strong>Permissions:</strong> {role.permissions?.length || 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleExpanded(role.id)}
                        variant="outline"
                        size="sm"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                      {!role.is_system && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold text-gray-900 mb-3">Permissions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions?.map((perm, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                              perm.includes('*')
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRoleModal
          session={session}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRoles();
          }}
        />
      )}
    </div>
  );
}

function CreateRoleModal({ session, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    scope_level: 'LOCATION',
    permissions: [] as string[],
    permissionInput: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addPermission = () => {
    if (formData.permissionInput.trim()) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, formData.permissionInput.trim()],
        permissionInput: '',
      });
    }
  };

  const removePermission = (index: number) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rbac/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': session.org_id,
          'x-user-id': session.user.id || '',
        },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description,
          scope_level: formData.scope_level,
          permissions: formData.permissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      alert('Role created successfully!');
      onSuccess();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('roles.create_custom_role')}</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{t('roles.role_key')} *</Label>
              <Input
                required
                placeholder={t('roles.role_key_placeholder')}
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              />
            </div>

            <div>
              <Label>{t('roles.role_name')} *</Label>
              <Input
                required
                placeholder={t('roles.role_name_placeholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>{t('roles.role_description')}</Label>
            <Input
              placeholder={t('roles.role_description_placeholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Scope Level *</Label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={formData.scope_level}
              onChange={(e) => setFormData({ ...formData, scope_level: e.target.value })}
            >
              <option value="ORG">Organization Wide</option>
              <option value="LOCATION">Location Specific</option>
              <option value="DEPARTMENT">Department Specific</option>
            </select>
          </div>

          <div>
            <Label>{t('roles.assign_permissions')} *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder={t('roles.permissions_placeholder')}
                value={formData.permissionInput}
                onChange={(e) => setFormData({ ...formData, permissionInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPermission();
                  }
                }}
              />
              <Button type="button" onClick={addPermission} variant="outline">
                Add
              </Button>
            </div>

            {formData.permissions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2"
                  >
                    {perm}
                    <button
                      type="button"
                      onClick={() => removePermission(idx)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.permissions.length === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
