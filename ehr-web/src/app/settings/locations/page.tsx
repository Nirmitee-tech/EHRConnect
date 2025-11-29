'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MapPin, Plus, Search, Edit2, Building2, Phone, Mail, Clock, Globe, X, Save, Loader2, CheckCircle, AlertCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from '@/contexts/location-context';

interface Location {
  id: string;
  name: string;
  code?: string;
  location_type: string;
  address?: string;
  timezone?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  active: boolean;
  created_at: string;
}

export default function LocationsManagementPage() {
  const { data: session } = useSession();
  const { refreshLocations: refreshLocationSwitcher } = useLocation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.email) {
      if (!session.org_id) {
        fetchUserContext();
      } else {
        loadLocations(session.org_id, session.user?.id || '');
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
          loadLocations(context.org_id, context.user_id);
        }
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  const loadLocations = async (orgId: string, userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/locations`,
        {
          headers: {
            'x-org-id': orgId,
            'x-user-id': userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowDrawer(true);
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingLocation(null);
  };

  const handleSuccess = async () => {
    const orgId = session?.org_id || userContext?.org_id;
    const userId = session?.user?.id || userContext?.user_id;
    if (orgId && userId) {
      loadLocations(orgId, userId);
      // Also refresh the location switcher
      await refreshLocationSwitcher();
    }
    handleCloseDrawer();
  };

  const filteredLocations = locations.filter(location => {
    const searchLower = searchTerm.toLowerCase();

    // Handle address as object or string
    const addressString = typeof location.address === 'object'
      ? [location.address?.line1, location.address?.line2, location.address?.city, location.address?.state].filter(Boolean).join(' ')
      : (location.address || '');

    return (
      location.name?.toLowerCase().includes(searchLower) ||
      location.code?.toLowerCase().includes(searchLower) ||
      addressString.toLowerCase().includes(searchLower)
    );
  });

  const activeLocations = filteredLocations.filter(l => l.active);
  const inactiveLocations = filteredLocations.filter(l => !l.active);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Manage your organization's physical locations and facilities
            </p>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search locations by name, code, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{locations.length}</div>
              <div className="text-xs text-gray-600">Total Locations</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{activeLocations.length}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{inactiveLocations.length}</div>
              <div className="text-xs text-gray-600">Inactive</div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Locations List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-sm text-gray-600">Loading locations...</span>
          </div>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No locations found</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm ? 'No locations match your search criteria.' : 'Get started by adding your first location'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Location
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLocations.map((location, index) => (
                  <tr
                    key={location.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                          {location.name?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                          {location.code && (
                            <div className="text-xs text-gray-500">Code: {location.code}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                        {location.location_type?.replace(/_/g, ' ') || 'Facility'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {typeof location.address === 'object'
                          ? [location.address?.line1, location.address?.city, location.address?.state].filter(Boolean).join(', ') || '—'
                          : location.address || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {location.contact_phone && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {location.contact_phone}
                          </div>
                        )}
                        {location.contact_email && (
                          <div className="text-xs text-blue-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {location.contact_email}
                          </div>
                        )}
                        {!location.contact_phone && !location.contact_email && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          location.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {location.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => handleEdit(location)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Location Drawer */}
      {showDrawer && (
        <LocationDrawer
          session={session}
          userContext={userContext}
          location={editingLocation}
          onClose={handleCloseDrawer}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// Location Drawer Component
interface LocationDrawerProps {
  session: any;
  userContext: any;
  location: Location | null;
  onClose: () => void;
  onSuccess: () => void;
}

function LocationDrawer({ session, userContext, location, onClose, onSuccess }: LocationDrawerProps) {
  const isEditing = !!location;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to convert address object to string for display
  const getAddressString = (addr: any): string => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    // If it's an object, format it nicely
    const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean);
    return parts.join(', ');
  };

  const [formData, setFormData] = useState({
    name: location?.name || '',
    code: location?.code || '',
    location_type: location?.location_type || 'hospital',
    address: getAddressString(location?.address) || '',
    timezone: location?.timezone || 'Asia/Kolkata',
    contact_email: location?.contact_email || '',
    contact_phone: location?.contact_phone || '',
    contact_person: location?.contact_person || '',
    active: location?.active ?? true,
  });

  const orgId = session?.org_id || userContext?.org_id;
  const userId = session?.user?.id || userContext?.user_id;

  const locationTypes = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'diagnostic_center', label: 'Diagnostic Center' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'branch', label: 'Branch Office' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/locations/${location.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${orgId}/locations`;

      // Prepare data - address needs to be an object for JSONB field
      const payload = {
        ...formData,
        address: typeof formData.address === 'string'
          ? { line1: formData.address }
          : formData.address
      };

      const response = await fetch(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
          'x-user-id': userId || '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save location');
      }

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
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Location' : 'Add New Location'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Update location details' : 'Create a new physical location or facility'}
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-medium mb-1 block">Location Name *</Label>
              <Input
                type="text"
                required
                placeholder="Main Hospital"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Location Code</Label>
                <Input
                  type="text"
                  placeholder="MH01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Optional unique identifier</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">Location Type *</Label>
                <select
                  required
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {locationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Address</Label>
              <textarea
                placeholder="123 Healthcare Ave, Medical District, City, State, ZIP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Timezone</Label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>

              <div>
                <Label className="text-sm font-medium mb-1 block">Contact Person</Label>
                <Input
                  type="text"
                  placeholder="Dr. John Doe"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Email</Label>
                  <Input
                    type="email"
                    placeholder="location@hospital.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Active Location
              </Label>
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
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Location' : 'Create Location'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
