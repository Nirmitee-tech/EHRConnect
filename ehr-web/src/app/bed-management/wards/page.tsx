'use client';

import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Bed, MapPin, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import * as bedManagementService from '@/services/bed-management';
import type { Ward, CreateWardRequest } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';
import { CreateLocationSidebar } from '@/components/location/create-location-sidebar';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function WardsPage() {
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLocationSidebarOpen, setIsLocationSidebarOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [formData, setFormData] = useState<Partial<CreateWardRequest> & { floor?: string }>({
    name: '',
    code: '',
    wardType: 'general',
    description: '',
    capacity: 10,
    floor: '',
    building: '',
    active: true,
    locationId: '',
  });

  // Get auth from session
  useEffect(() => {
    if (!session) return;
    if (session.org_id) {
      setOrgId(session.org_id);
      setUserId((session.user as any)?.id || session.user?.email || null);
    }
  }, [session]);

  // Load wards and locations
  useEffect(() => {
    if (orgId) {
      loadWards();
      loadLocations();
    }
  }, [orgId, userId]);

  async function loadWards() {
    if (!orgId) return;
    try {
      setLoading(true);
      const data = await bedManagementService.getWards(orgId, userId || undefined, {
        locationId: currentFacility?.id,
      });
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLocations() {
    if (!orgId) return;
    try {
      // Fetch locations from the inventory masters API (it has locations)
      const response = await fetch(
        `${API_URL}/api/inventory/masters/locations?org_id=${orgId}&active=true`,
        {
          headers: {
            'x-org-id': orgId,
            ...(userId && { 'x-user-id': userId }),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped
        const locationsList = Array.isArray(data) ? data : [];
        setLocations(locationsList);
        // Set default location if not already set
        if (locationsList.length > 0 && !formData.locationId) {
          setFormData((prev) => ({ ...prev, locationId: locationsList[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  }

  function handleLocationCreated(newLocation: any) {
    // Add the new location to the list
    setLocations((prev) => [...prev, { id: newLocation.id, name: newLocation.name }]);
    // Auto-select the newly created location
    setFormData((prev) => ({ ...prev, locationId: newLocation.id }));
  }

  function openCreateDialog() {
    setEditingWard(null);
    setFormData({
      name: '',
      code: '',
      wardType: 'general',
      description: '',
      capacity: 10,
      floor: '',
      building: '',
      active: true,
      locationId: locations.length > 0 ? locations[0].id : '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(ward: Ward) {
    setEditingWard(ward);
    setFormData({
      name: ward.name,
      code: ward.code,
      wardType: ward.wardType,
      description: ward.description || '',
      capacity: ward.capacity,
      floor: ward.floor || '',
      building: ward.building || '',
      active: ward.active,
      locationId: ward.locationId || (locations.length > 0 ? locations[0].id : ''),
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;

    try {
      if (!formData.locationId) {
        alert('Please select a location');
        return;
      }

      const wardData: CreateWardRequest = {
        name: formData.name!,
        code: formData.code!,
        wardType: formData.wardType as any,
        locationId: formData.locationId,
        capacity: formData.capacity!,
        description: formData.description,
        floorNumber: formData.floor,
        building: formData.building,
        active: formData.active,
      };

      if (editingWard) {
        await bedManagementService.updateWard(
          orgId,
          userId || undefined,
          editingWard.id,
          wardData
        );
      } else {
        await bedManagementService.createWard(orgId, userId || undefined, wardData);
      }

      setIsDialogOpen(false);
      loadWards();
    } catch (error) {
      console.error('Error saving ward:', error);
      alert('Failed to save ward. Please try again.');
    }
  }

  const getWardTypeColor = (wardType: string) => {
    const colors: Record<string, string> = {
      icu: 'bg-red-100 text-red-800',
      general: 'bg-blue-100 text-blue-800',
      private: 'bg-purple-100 text-purple-800',
      semi_private: 'bg-purple-50 text-purple-700',
      emergency: 'bg-orange-100 text-orange-800',
      pediatric: 'bg-pink-100 text-pink-800',
      maternity: 'bg-pink-100 text-pink-800',
      isolation: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[wardType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ward Configuration</h1>
          <p className="text-muted-foreground">Manage wards, rooms, and bed setup</p>
        </div>
        <Button size="lg" className="gap-2 text-white" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Create Ward
        </Button>
      </div>

      {/* Wards Grid */}
      {wards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No wards configured</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Get started by creating your first ward
            </p>
            <Button onClick={openCreateDialog} className="text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Ward
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wards.map((ward) => (
            <Card key={ward.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {ward.name}
                      {!ward.active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className={getWardTypeColor(ward.wardType)}>
                        {ward.wardType}
                      </Badge>
                      <span className="ml-2 text-xs">Code: {ward.code}</span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(ward)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-semibold">{ward.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Beds:</span>
                      <span className="font-semibold">{ward.totalBeds || 0}</span>
                    </div>
                  </div>

                  {/* Location */}
                  {(ward.building || ward.floor) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {ward.building && `Building ${ward.building}`}
                        {ward.building && ward.floor && ' • '}
                        {ward.floor && `Floor ${ward.floor}`}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {ward.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ward.description}
                    </p>
                  )}

                  {/* Occupancy Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Occupancy</span>
                      <span>
                        {ward.occupiedBeds || 0} / {ward.totalBeds || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            ward.totalBeds
                              ? ((ward.occupiedBeds || 0) / ward.totalBeds) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Manage Beds Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/bed-management/beds?wardId=${ward.id}`;
                    }}
                  >
                    Manage Beds
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWard ? 'Edit Ward' : 'Create New Ward'}
            </DialogTitle>
            <DialogDescription>
              {editingWard
                ? 'Update the ward information'
                : 'Add a new ward to your facility'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="locationId">Location / Facility *</Label>
                <Select
                  value={formData.locationId}
                  onValueChange={(value) => {
                    if (value === '__create_new__') {
                      setIsLocationSidebarOpen(true);
                    } else {
                      setFormData({ ...formData, locationId: value });
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="__create_new__"
                      className="text-primary font-medium border-t mt-1 pt-1"
                    >
                      + Create New Location
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Ward Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., General Ward A"
                />
              </div>

              {/* Code & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Ward Code *</Label>
                  <Input
                    id="code"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., GEN-A"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wardType">Ward Type *</Label>
                  <Select
                    value={formData.wardType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, wardType: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="semi_private">Semi-Private</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="pediatric">Pediatric</SelectItem>
                      <SelectItem value="maternity">Maternity</SelectItem>
                      <SelectItem value="isolation">Isolation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Building & Floor */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) =>
                      setFormData({ ...formData, building: e.target.value })
                    }
                    placeholder="e.g., Main"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional information about this ward"
                  rows={3}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="active" className="font-normal">
                  Ward is active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="text-white">
                {editingWard ? 'Update Ward' : 'Create Ward'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Location Creation Sidebar */}
      <CreateLocationSidebar
        open={isLocationSidebarOpen}
        onOpenChange={setIsLocationSidebarOpen}
        onLocationCreated={handleLocationCreated}
        orgId={orgId || ''}
        userId={userId}
      />
    </div>
  );
}
