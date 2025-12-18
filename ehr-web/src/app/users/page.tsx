'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, Mail, Shield, MapPin, Calendar, 
  MoreVertical, UserPlus, Search, Filter, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface User {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: any[];
  locations: string[];
  last_login_at: string;
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'invite'>('create');
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.email) {
      // If org_id is not in session, fetch user context
      if (!session.org_id) {
        fetchUserContext();
      } else {
        loadUsers();
      }
    }
  }, [session]);

  const fetchUserContext = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user-context?email=${encodeURIComponent(session?.user?.email || '')}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const context = await response.json();
        setUserContext(context);
        // Load users once we have the context
        if (context.org_id) {
          loadUsersWithOrgId(context.org_id, context.user_id);
        }
      } else {
        console.error('Failed to fetch user context');
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  const loadUsersWithOrgId = async (orgId: string, userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/users`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${session?.org_id}/users`,
        {
          headers: {
            'x-org-id': session?.org_id || '',
            'x-user-id': session?.user?.id || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (mode: 'create' | 'invite') => {
    setDrawerMode(mode);
    setShowDrawer(true);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              {t('users.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('users.user_management')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => openDrawer('create')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('users.create_account')}
            </Button>
            <Button
              onClick={() => openDrawer('invite')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              {t('users.send_invitation')}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t('users.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t('common.filter')}
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No users found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by creating accounts or inviting team members
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => openDrawer('create')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </Button>
                    <Button
                      onClick={() => openDrawer('invite')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {role.role_name || role.role_key}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Drawer */}
      {showDrawer && (
        <UserDrawer
          mode={drawerMode}
          session={session}
          userContext={userContext}
          onClose={() => setShowDrawer(false)}
          onSuccess={() => {
            setShowDrawer(false);
            if (session?.org_id) {
              loadUsers();
            } else if (userContext?.org_id) {
              loadUsersWithOrgId(userContext.org_id, userContext.user_id);
            }
          }}
        />
      )}
    </div>
  );
}

interface UserDrawerProps {
  mode: 'create' | 'invite';
  session: any;
  userContext: any;
  onClose: () => void;
  onSuccess: () => void;
}

function UserDrawer({ mode, session, userContext, onClose, onSuccess }: UserDrawerProps) {
  interface DrawerFormState {
    email: string;
    name: string;
    password: string;
    confirm_password: string;
    role_keys: string[];
    scope: 'ORG' | 'LOCATION';
    location_ids: string[];
  }

  const initialFormState: DrawerFormState = {
    email: '',
    name: '',
    password: '',
    confirm_password: '',
    role_keys: ['CLINICIAN'],
    scope: 'ORG',
    location_ids: [],
  };

  const [formData, setFormData] = useState<DrawerFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [availableLocations, setAvailableLocations] = useState<Array<{
    id: string;
    name: string;
    location_type?: string;
    address?: Record<string, unknown>;
    active?: boolean;
  }>>([]);

  const orgId = session?.org_id || userContext?.org_id;
  const actingUserId = session?.user?.id || userContext?.user_id;
  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!orgId || !actingUserId) {
      return;
    }

    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        setLocationsError(null);

        const headers: Record<string, string> = {
          'x-org-id': orgId,
          'x-user-id': actingUserId,
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/locations?activeOnly=true`,
          { headers }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load locations');
        }

        const data = await response.json();
        setAvailableLocations(data.locations || []);
      } catch (err) {
        console.error('Error loading locations:', err);
        setLocationsError(err instanceof Error ? err.message : 'Failed to load locations');
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, [orgId, actingUserId, accessToken]);

  const toggleLocation = (locationId: string) => {
    setFormData(prev => {
      const exists = prev.location_ids.includes(locationId);
      const nextIds = exists
        ? prev.location_ids.filter(id => id !== locationId)
        : [...prev.location_ids, locationId];
      return { ...prev, location_ids: nextIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'create' && formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.scope === 'LOCATION' && formData.location_ids.length === 0) {
      setError('Select at least one location for location-scoped access');
      setLoading(false);
      return;
    }

    try {
      // Use org_id from session or userContext
      if (!orgId) {
        throw new Error('Organization ID not found');
      }

      const endpoint = mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/users`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/invitations`;

      const payload = mode === 'create'
        ? {
            email: formData.email,
            name: formData.name,
            password: formData.password,
            role_keys: formData.role_keys,
            scope: formData.scope,
            location_ids: formData.location_ids,
          }
        : {
            email: formData.email,
            role_keys: formData.role_keys,
            scope: formData.scope,
            location_ids: formData.location_ids,
          };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
        'x-user-id': actingUserId || '',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const result = await response.json();
      alert(result.message || 'Success!');
      onSuccess();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create User Account' : 'Send Staff Invitation'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'create' 
                ? 'User can login immediately with provided credentials' 
                : 'User will receive email to set up their account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-medium mb-1 block">Email Address *</Label>
              <Input
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {mode === 'create' && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Full Name *</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Dr. John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">Password *</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">Confirm Password *</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <Label className="text-sm font-medium mb-1 block">Role *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.role_keys[0]}
                onChange={(e) => setFormData({ ...formData, role_keys: [e.target.value] })}
              >
                <option value="CLINICIAN">Clinician</option>
                <option value="FRONT_DESK">Front Desk</option>
                <option value="ORG_ADMIN">Organization Admin</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Access Scope</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.scope}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'ORG' || value === 'LOCATION') {
                    setFormData(prev => ({
                      ...prev,
                      scope: value,
                      location_ids: value === 'LOCATION' ? prev.location_ids : [],
                    }));
                  }
                }}
              >
                <option value="ORG">Organization Wide</option>
                <option value="LOCATION">Specific Locations</option>
              </select>
            </div>

            {formData.scope === 'LOCATION' && (
              <div>
                <Label className="text-sm font-medium mb-1 block">Locations *</Label>
                <div className="border rounded-md p-3 max-h-56 overflow-y-auto space-y-3 bg-gray-50">
                  {locationsLoading ? (
                    <p className="text-sm text-gray-600">Loading locations…</p>
                  ) : locationsError ? (
                    <p className="text-sm text-red-600">{locationsError}</p>
                  ) : availableLocations.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      No active locations found. Create locations before assigning staff.
                    </p>
                  ) : (
                    availableLocations.map(location => {
                      const isSelected = formData.location_ids.includes(location.id);
                      return (
                        <label
                          key={location.id}
                          className="flex items-start gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={() => toggleLocation(location.id)}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{location.name}</p>
                            {location.location_type && (
                              <p className="text-xs text-gray-500">
                                {location.location_type.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                {formData.location_ids.length === 0 && !locationsLoading && availableLocations.length > 0 && (
                  <p className="text-xs text-red-600 mt-2">Select at least one location.</p>
                )}
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                {mode === 'create' ? (
                  <>
                    <strong>Direct Creation:</strong> User will be created immediately 
                    and can login right away with the provided credentials.
                  </>
                ) : (
                  <>
                    <strong>Invitation:</strong> User will receive an email with a secure 
                    link to set up their account. Invitation expires in 7 days.
                  </>
                )}
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 text-white ${
              mode === 'create' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : mode === 'create' ? 'Create Account' : 'Send Invitation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
