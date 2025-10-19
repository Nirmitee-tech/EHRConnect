'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, Bed as BedIcon, ArrowLeft } from 'lucide-react';
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
import type { Bed, CreateBedRequest, Ward, BedType, BedStatus } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';

export default function BedsPage() {
  const { data: session } = useSession();
  const { currentFacility } = useFacility();
  const searchParams = useSearchParams();
  const wardId = searchParams?.get('wardId');

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [formData, setFormData] = useState<Partial<CreateBedRequest>>({
    bedNumber: '',
    bedType: 'standard',
    wardId: wardId || '',
    hasOxygen: false,
    hasSuction: false,
    hasMonitor: false,
    hasIvPole: false,
    isElectric: false,
    notes: '',
  });

  // Get auth from session
  useEffect(() => {
    if (!session) return;
    if (session.org_id) {
      setOrgId(session.org_id);
      setUserId((session.user as any)?.id || session.user?.email || null);
    }
  }, [session]);

  // Load beds and wards
  useEffect(() => {
    if (orgId) {
      loadWards();
      if (wardId) {
        loadBeds(wardId);
      }
    }
  }, [orgId, userId, wardId]);

  async function loadWards() {
    if (!orgId) return;
    try {
      // Load all wards for the organization (don't filter by facility yet)
      const data = await bedManagementService.getWards(orgId, userId || undefined, {});
      console.log('Loaded wards:', data); // Debug log
      setWards(data);
      if (wardId) {
        const ward = data.find((w: Ward) => w.id === wardId);
        setSelectedWard(ward || null);
      }
    } catch (error) {
      console.error('Error loading wards:', error);
      alert('Failed to load wards. Please refresh the page.');
    }
  }

  async function loadBeds(selectedWardId?: string) {
    if (!orgId) return;
    try {
      setLoading(true);
      const filters: any = {};
      // Only filter by ward if specified, don't filter by location
      // since we want to show all beds for the organization or ward
      if (selectedWardId) {
        filters.wardId = selectedWardId;
      }
      const data = await bedManagementService.getBeds(orgId, userId || undefined, filters);
      console.log('Loaded beds:', data); // Debug log
      setBeds(data);
    } catch (error) {
      console.error('Error loading beds:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingBed(null);
    setFormData({
      bedNumber: '',
      bedType: 'standard',
      wardId: wardId || '',
      hasOxygen: false,
      hasSuction: false,
      hasMonitor: false,
      hasIvPole: false,
      isElectric: false,
      notes: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(bed: Bed) {
    setEditingBed(bed);
    setFormData({
      bedNumber: bed.bedNumber,
      bedType: bed.bedType,
      wardId: bed.wardId,
      roomId: bed.roomId,
      hasOxygen: bed.hasOxygen,
      hasSuction: bed.hasSuction,
      hasMonitor: bed.hasMonitor,
      hasIvPole: bed.hasIvPole,
      isElectric: bed.isElectric,
      genderRestriction: bed.genderRestriction,
      notes: bed.notes || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;

    try {
      if (!formData.wardId) {
        alert('Please select a ward');
        return;
      }

      const bedData: CreateBedRequest = {
        bedNumber: formData.bedNumber!,
        bedType: formData.bedType as BedType,
        wardId: formData.wardId,
        roomId: formData.roomId,
        hasOxygen: formData.hasOxygen,
        hasSuction: formData.hasSuction,
        hasMonitor: formData.hasMonitor,
        hasIvPole: formData.hasIvPole,
        isElectric: formData.isElectric,
        genderRestriction: formData.genderRestriction,
        notes: formData.notes,
      };

      if (editingBed) {
        // Update not implemented in service, would need to add
        alert('Update bed functionality not yet implemented');
      } else {
        await bedManagementService.createBed(orgId, userId || undefined, bedData);
      }

      setIsDialogOpen(false);
      loadBeds(wardId || formData.wardId);
    } catch (error) {
      console.error('Error saving bed:', error);
      alert('Failed to save bed. Please try again.');
    }
  }

  const getBedStatusColor = (status: BedStatus) => {
    const colors: Record<BedStatus, string> = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      out_of_service: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading beds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bed Management
              {selectedWard && <span className="text-primary"> - {selectedWard.name}</span>}
            </h1>
            <p className="text-muted-foreground">Manage beds and their assignments</p>
          </div>
        </div>
        <Button size="lg" className="gap-2 text-white" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Bed
        </Button>
      </div>

      {/* Ward Filter */}
      {!wardId && wards.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="wardFilter" className="whitespace-nowrap">
                Filter by Ward:
              </Label>
              <Select
                value={selectedWard?.id || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedWard(null);
                    loadBeds();
                  } else {
                    const ward = wards.find((w) => w.id === value);
                    setSelectedWard(ward || null);
                    loadBeds(value);
                  }
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name} ({ward.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beds Grid */}
      {beds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BedIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No beds configured</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {selectedWard
                ? `Add beds to ${selectedWard.name}`
                : 'Select a ward and add beds'}
            </p>
            <Button onClick={openCreateDialog} className="text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Bed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {beds.map((bed) => (
            <Card key={bed.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {bed.bedNumber}
                      {!bed.active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className={getBedStatusColor(bed.status)}>
                        {bed.status}
                      </Badge>
                      <span className="ml-2 text-xs">{bed.bedType}</span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(bed)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {bed.ward && (
                    <div className="text-muted-foreground">
                      Ward: <span className="font-medium text-foreground">{bed.ward.name}</span>
                    </div>
                  )}
                  {bed.room && (
                    <div className="text-muted-foreground">
                      Room: <span className="font-medium text-foreground">{bed.room.roomNumber}</span>
                    </div>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {bed.hasOxygen && (
                      <Badge variant="outline" className="text-xs">O₂</Badge>
                    )}
                    {bed.hasSuction && (
                      <Badge variant="outline" className="text-xs">Suction</Badge>
                    )}
                    {bed.hasMonitor && (
                      <Badge variant="outline" className="text-xs">Monitor</Badge>
                    )}
                    {bed.hasIvPole && (
                      <Badge variant="outline" className="text-xs">IV Pole</Badge>
                    )}
                    {bed.isElectric && (
                      <Badge variant="outline" className="text-xs">Electric</Badge>
                    )}
                  </div>

                  {/* Current Patient */}
                  {bed.currentPatientName && (
                    <div className="pt-2 border-t">
                      <div className="font-medium text-foreground">
                        {bed.currentPatientName}
                      </div>
                      {bed.occupiedSince && (
                        <div className="text-xs text-muted-foreground">
                          Since: {new Date(bed.occupiedSince).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
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
              {editingBed ? 'Edit Bed' : 'Add New Bed'}
            </DialogTitle>
            <DialogDescription>
              {editingBed
                ? 'Update bed information'
                : 'Add a new bed to the ward'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Ward Selection */}
              <div className="grid gap-2">
                <Label htmlFor="wardId">Ward *</Label>
                <Select
                  value={formData.wardId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, wardId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        No wards available. Please create a ward first.
                      </div>
                    ) : (
                      wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name} ({ward.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Bed Number & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedNumber">Bed Number *</Label>
                  <Input
                    id="bedNumber"
                    required
                    value={formData.bedNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, bedNumber: e.target.value })
                    }
                    placeholder="e.g., 101-A"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bedType">Bed Type *</Label>
                  <Select
                    value={formData.bedType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bedType: value as BedType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="pediatric">Pediatric</SelectItem>
                      <SelectItem value="bariatric">Bariatric</SelectItem>
                      <SelectItem value="isolation">Isolation</SelectItem>
                      <SelectItem value="stretcher">Stretcher</SelectItem>
                      <SelectItem value="cot">Cot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Features */}
              <div className="grid gap-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasOxygen"
                      checked={formData.hasOxygen}
                      onChange={(e) =>
                        setFormData({ ...formData, hasOxygen: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="hasOxygen" className="font-normal">
                      Oxygen Supply
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasSuction"
                      checked={formData.hasSuction}
                      onChange={(e) =>
                        setFormData({ ...formData, hasSuction: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="hasSuction" className="font-normal">
                      Suction
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasMonitor"
                      checked={formData.hasMonitor}
                      onChange={(e) =>
                        setFormData({ ...formData, hasMonitor: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="hasMonitor" className="font-normal">
                      Patient Monitor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasIvPole"
                      checked={formData.hasIvPole}
                      onChange={(e) =>
                        setFormData({ ...formData, hasIvPole: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="hasIvPole" className="font-normal">
                      IV Pole
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isElectric"
                      checked={formData.isElectric}
                      onChange={(e) =>
                        setFormData({ ...formData, isElectric: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="isElectric" className="font-normal">
                      Electric Bed
                    </Label>
                  </div>
                </div>
              </div>

              {/* Gender Restriction */}
              <div className="grid gap-2">
                <Label htmlFor="genderRestriction">Gender Restriction</Label>
                <Select
                  value={formData.genderRestriction || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genderRestriction: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Restriction</SelectItem>
                    <SelectItem value="male">Male Only</SelectItem>
                    <SelectItem value="female">Female Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes about this bed"
                  rows={3}
                />
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
                {editingBed ? 'Update Bed' : 'Add Bed'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
