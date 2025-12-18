'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users, Mail, Shield, MapPin, Calendar, Building2, UserPlus,
  Search, Filter, X, MoreVertical, Check, Clock, XCircle,
  Briefcase, ChevronDown, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: Array<{
    role_key: string;
    role_name: string;
    scope: string;
  }>;
  locations: Array<{
    location_id: string;
    location_name: string;
    location_type: string;
  }>;
  departments: Array<{
    department_id: string;
    department_name: string;
  }>;
  last_login_at: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role_keys: string[];
  scope: string;
  status: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

interface RoleCategory {
  key: string;
  name: string;
  description: string;
  scope_level: string;
}

interface RolesGrouped {
  administration: RoleCategory[];
  clinical: RoleCategory[];
  diagnostic: RoleCategory[];
  billing_finance: RoleCategory[];
  care_coordination: RoleCategory[];
  technical: RoleCategory[];
  analytics: RoleCategory[];
  patient_portal: RoleCategory[];
  other: RoleCategory[];
}

export default function TeamManagementPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'invite'>('invite');
  const [userContext, setUserContext] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.email) {
      if (!session.org_id) {
        fetchUserContext();
      } else {
        loadData();
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
        if (context.org_id) {
          loadDataWithContext(context.org_id, context.user_id);
        }
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  const loadDataWithContext = async (orgId: string, userId: string) => {
    await Promise.all([
      loadTeamMembers(orgId, userId),
      loadInvitations(orgId, userId),
      loadStats(orgId, userId)
    ]);
  };

  const loadData = async () => {
    if (!session?.org_id) return;
    await Promise.all([
      loadTeamMembers(session.org_id, session.user?.id || ''),
      loadInvitations(session.org_id, session.user?.id || ''),
      loadStats(session.org_id, session.user?.id || '')
    ]);
  };

  const loadTeamMembers = async (orgId: string, userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.team_members || []);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async (orgId: string, userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/invitations`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const loadStats = async (orgId: string, userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team/stats`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.roles?.some(role => role.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInvitations = invitations.filter(inv =>
    inv.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Manage your organization's team members, roles, departments, and locations
          </p>
        </div>
        <Button
          onClick={() => {
            setDrawerMode('invite');
            setShowDrawer(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === 'members' ? "Search by name, email, or role..." : "Search by email..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'members'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Team Members
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'invitations'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending ({invitations.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.total_members}</div>
                <div className="text-xs text-gray-600">Total Members</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.active_members}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.total_locations}</div>
                <div className="text-xs text-gray-600">Locations</div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.total_departments}</div>
                <div className="text-xs text-gray-600">Departments</div>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'members' && (
        <TeamMembersView members={filteredMembers} loading={loading} />
      )}

      {activeTab === 'invitations' && (
        <InvitationsView
          invitations={filteredInvitations}
          onRevoke={() => {
            const orgId = session?.org_id || userContext?.org_id;
            const userId = session?.user?.id || userContext?.user_id;
            if (orgId && userId) {
              loadInvitations(orgId, userId);
            }
          }}
        />
      )}

      {/* Drawer for inviting */}
      {showDrawer && (
        <InviteDrawer
          session={session}
          userContext={userContext}
          onClose={() => setShowDrawer(false)}
          onSuccess={() => {
            setShowDrawer(false);
            const orgId = session?.org_id || userContext?.org_id;
            const userId = session?.user?.id || userContext?.user_id;
            if (orgId && userId) {
              loadInvitations(orgId, userId);
            }
          }}
        />
      )}
    </div>
  );
}

// Team Members View Component
function TeamMembersView({ members, loading }: { members: TeamMember[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading team members...</span>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">No team members found</h3>
        <p className="text-sm text-gray-600">Start by inviting your first team member</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member, index) => (
              <tr
                key={member.id}
                className="hover:bg-gray-50 transition-colors"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                      {member.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {member.roles?.slice(0, 2).map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {role.role_name}
                      </span>
                    ))}
                    {member.roles?.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{member.roles.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {member.locations?.length > 0 ? (
                      <>
                        {member.locations.slice(0, 1).map((loc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3" />
                            {loc.location_name}
                          </span>
                        ))}
                        {member.locations.length > 1 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{member.locations.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Org-wide</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {member.departments?.length > 0 ? (
                      <>
                        {member.departments.slice(0, 1).map((dept, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded flex items-center gap-1"
                          >
                            <Building2 className="h-3 w-3" />
                            {dept.department_name}
                          </span>
                        ))}
                        {member.departments.length > 1 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{member.departments.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {member.last_login_at
                      ? new Date(member.last_login_at).toLocaleDateString()
                      : <span className="text-gray-400">Never</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Invitations View Component
function InvitationsView({
  invitations,
  onRevoke,
}: {
  invitations: Invitation[];
  onRevoke: () => void;
}) {
  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Mail className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">No pending invitations</h3>
        <p className="text-sm text-gray-600">All invitations have been accepted or expired</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scope
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitations.map((inv, index) => (
              <tr
                key={inv.id}
                className="hover:bg-gray-50 transition-colors"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{inv.email}</div>
                      <div className="text-xs text-gray-500">Invited</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {inv.role_keys.slice(0, 2).map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {role.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {inv.role_keys.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{inv.role_keys.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {inv.scope === 'ORG' && 'Organization'}
                    {inv.scope === 'LOCATION' && 'Location'}
                    {inv.scope === 'DEPARTMENT' && 'Department'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(inv.expires_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Invite Drawer Component (Continued in next message due to length...)
interface InviteDrawerProps {
  session: any;
  userContext: any;
  onClose: () => void;
  onSuccess: () => void;
}

function InviteDrawer({ session, userContext, onClose, onSuccess }: InviteDrawerProps) {
  const [formData, setFormData] = useState({
    email: '',
    role_keys: ['CLINICIAN'],
    scope: 'ORG' as 'ORG' | 'LOCATION' | 'DEPARTMENT',
    location_ids: [] as string[],
    department_ids: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rolesGrouped, setRolesGrouped] = useState<RolesGrouped | null>(null);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);

  const orgId = session?.org_id || userContext?.org_id;
  const actingUserId = session?.user?.id || userContext?.user_id;

  useEffect(() => {
    if (orgId && actingUserId) {
      loadRoles();
      loadLocations();
      loadDepartments();
    }
  }, [orgId, actingUserId]);

  const loadRoles = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roles/grouped`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': actingUserId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRolesGrouped(data.grouped);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/locations?activeOnly=true`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': actingUserId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/departments`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': actingUserId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.scope === 'LOCATION' && formData.location_ids.length === 0) {
      setError('Select at least one location for location-scoped access');
      setLoading(false);
      return;
    }

    if (formData.scope === 'DEPARTMENT' && formData.department_ids.length === 0) {
      setError('Select at least one department for department-scoped access');
      setLoading(false);
      return;
    }

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/invitations`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
          'x-user-id': actingUserId || '',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const result = await response.json();

      // Show accept URL in dev mode
      if (result.accept_url) {
        console.log('='.repeat(80));
        console.log('INVITATION SENT');
        console.log('='.repeat(80));
        console.log(`Accept URL: ${result.accept_url}`);
        console.log('='.repeat(80));
      }

      alert('Invitation sent successfully!');
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

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              Send an invitation to join your organization
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
                placeholder="colleague@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Select Role(s) *</Label>
              {rolesGrouped && (
                <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {Object.entries(rolesGrouped).map(([categoryKey, roles]) => (
                    <div key={categoryKey}>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        {categories[categoryKey]}
                      </p>
                      <div className="space-y-1 ml-2">
                        {roles.map((role) => (
                          <label
                            key={role.key}
                            className="flex items-start gap-2 cursor-pointer hover:bg-white p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={formData.role_keys.includes(role.key)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    role_keys: [...formData.role_keys, role.key],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    role_keys: formData.role_keys.filter((k) => k !== role.key),
                                  });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{role.name}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Access Scope</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.scope}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'ORG' || value === 'LOCATION' || value === 'DEPARTMENT') {
                    setFormData({
                      ...formData,
                      scope: value as 'ORG' | 'LOCATION' | 'DEPARTMENT',
                      location_ids: value === 'LOCATION' ? formData.location_ids : [],
                      department_ids: value === 'DEPARTMENT' ? formData.department_ids : [],
                    });
                  }
                }}
              >
                <option value="ORG">Organization Wide</option>
                <option value="LOCATION">Specific Locations</option>
                <option value="DEPARTMENT">Specific Departments</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.scope === 'ORG' && 'Access to all locations and departments'}
                {formData.scope === 'LOCATION' && 'Access limited to selected locations'}
                {formData.scope === 'DEPARTMENT' && 'Access limited to selected departments'}
              </p>
            </div>

            {formData.scope === 'LOCATION' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Select Locations *</Label>
                  {availableLocations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.location_ids.length === availableLocations.length) {
                          // Deselect all
                          setFormData({ ...formData, location_ids: [] });
                        } else {
                          // Select all
                          setFormData({
                            ...formData,
                            location_ids: availableLocations.map((loc) => loc.id),
                          });
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {formData.location_ids.length === availableLocations.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                  {availableLocations.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-3">No active locations available</p>
                      <a
                        href="/settings/locations"
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <MapPin className="h-4 w-4" />
                        Create New Location
                      </a>
                    </div>
                  ) : (
                    availableLocations.map((location) => (
                      <label
                        key={location.id}
                        className="flex items-start gap-2 cursor-pointer hover:bg-white p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={formData.location_ids.includes(location.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                location_ids: [...formData.location_ids, location.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                location_ids: formData.location_ids.filter(
                                  (id) => id !== location.id
                                ),
                              });
                            }
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{location.name}</p>
                          {location.location_type && (
                            <p className="text-xs text-gray-500">
                              {location.location_type.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {availableLocations.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.location_ids.length} of {availableLocations.length} location(s) selected
                  </p>
                )}
              </div>
            )}

            {formData.scope === 'DEPARTMENT' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Select Departments *</Label>
                  {availableDepartments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.department_ids.length === availableDepartments.length) {
                          // Deselect all
                          setFormData({ ...formData, department_ids: [] });
                        } else {
                          // Select all
                          setFormData({
                            ...formData,
                            department_ids: availableDepartments.map((dept) => dept.id),
                          });
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {formData.department_ids.length === availableDepartments.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                  {availableDepartments.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-3">No departments available</p>
                      <a
                        href="/settings/departments"
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Building2 className="h-4 w-4" />
                        Create New Department
                      </a>
                    </div>
                  ) : (
                    availableDepartments.map((department) => (
                      <label
                        key={department.id}
                        className="flex items-start gap-2 cursor-pointer hover:bg-white p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={formData.department_ids.includes(department.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                department_ids: [...formData.department_ids, department.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                department_ids: formData.department_ids.filter(
                                  (id) => id !== department.id
                                ),
                              });
                            }
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{department.name}</p>
                          {department.code && (
                            <p className="text-xs text-gray-500">Code: {department.code}</p>
                          )}
                          {department.description && (
                            <p className="text-xs text-gray-500">{department.description}</p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {availableDepartments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.department_ids.length} of {availableDepartments.length} department(s) selected
                  </p>
                )}
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Invitation:</strong> User will receive an email with a secure link to
                set up their account. Invitation expires in 7 days.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <Button type="button" onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || formData.role_keys.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
