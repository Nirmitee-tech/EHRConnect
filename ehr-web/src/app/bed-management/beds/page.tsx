'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Bed as BedIcon,
  ArrowLeft,
  Search,
  Filter,
  Check,
  X,
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import * as bedManagementService from '@/services/bed-management';
import type { Bed, CreateBedRequest, Ward, BedType, BedStatus } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';

export default function BedsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentFacility } = useFacility();
  const searchParams = useSearchParams();
  const wardIdParam = searchParams?.get('wardId');

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWardId, setSelectedWardId] = useState<string>(wardIdParam || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bedTypeFilter, setBedTypeFilter] = useState<string>('all');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [formData, setFormData] = useState<Partial<CreateBedRequest>>({
    bedNumber: '',
    bedType: 'standard',
    wardId: wardIdParam || '',
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

  // Load data
  useEffect(() => {
    if (orgId) {
      loadWards();
      loadBeds();
    }
  }, [orgId, userId]);

  async function loadWards() {
    if (!orgId) return;
    try {
      const data = await bedManagementService.getWards(orgId, userId || undefined, {});
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  }

  async function loadBeds() {
    if (!orgId) return;
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedWardId && selectedWardId !== 'all') {
        filters.wardId = selectedWardId;
      }
      const data = await bedManagementService.getBeds(orgId, userId || undefined, filters);
      setBeds(data);
    } catch (error) {
      console.error('Error loading beds:', error);
    } finally {
      setLoading(false);
    }
  }

  // Reload beds when ward filter changes
  useEffect(() => {
    if (orgId) {
      loadBeds();
    }
  }, [selectedWardId]);

  // Filtered beds based on search and filters
  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          bed.bedNumber.toLowerCase().includes(query) ||
          bed.bedType.toLowerCase().includes(query) ||
          bed.ward?.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && bed.status !== statusFilter) {
        return false;
      }

      // Bed type filter
      if (bedTypeFilter !== 'all' && bed.bedType !== bedTypeFilter) {
        return false;
      }

      return true;
    });
  }, [beds, searchQuery, statusFilter, bedTypeFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    return {
      total: filteredBeds.length,
      available: filteredBeds.filter((b) => b.status === 'available').length,
      occupied: filteredBeds.filter((b) => b.status === 'occupied').length,
      cleaning: filteredBeds.filter((b) => b.status === 'cleaning').length,
      maintenance: filteredBeds.filter((b) => b.status === 'maintenance').length,
    };
  }, [filteredBeds]);

  function openCreateDialog() {
    setEditingBed(null);
    setFormData({
      bedNumber: '',
      bedType: 'standard',
      wardId: selectedWardId !== 'all' ? selectedWardId : '',
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
      hasOxygen: bed.hasOxygen,
      hasSuction: bed.hasSuction,
      hasMonitor: bed.hasMonitor,
      hasIvPole: bed.hasIvPole,
      isElectric: bed.isElectric,
      notes: bed.notes || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;

    try {
      if (editingBed) {
        // TODO: Implement updateBed in bed-management service
        alert('Update bed functionality not yet implemented');
        // await bedManagementService.updateBed(orgId, userId || undefined, editingBed.id, formData);
      } else {
        await bedManagementService.createBed(
          orgId,
          userId || undefined,
          formData as CreateBedRequest
        );
      }
      setIsDialogOpen(false);
      loadBeds();
    } catch (error: any) {
      console.error('Error saving bed:', error);
      alert(error.message || 'Failed to save bed');
    }
  }

  async function handleDelete(bedId: string) {
    if (!orgId) return;
    if (!confirm('Are you sure you want to delete this bed?')) return;

    try {
      // TODO: Implement deleteBed in bed-management service
      alert('Delete bed functionality not yet implemented');
      // await bedManagementService.deleteBed(orgId, userId || undefined, bedId);
      // loadBeds();
    } catch (error: any) {
      console.error('Error deleting bed:', error);
      alert(error.message || 'Failed to delete bed');
    }
  }

  function getBedStatusColor(status: BedStatus): string {
    const colors: Record<BedStatus, string> = {
      available: 'bg-green-500',
      occupied: 'bg-red-500',
      reserved: 'bg-yellow-500',
      cleaning: 'bg-blue-500',
      maintenance: 'bg-orange-500',
      out_of_service: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  }

  function getBedStatusText(status: BedStatus): string {
    const text: Record<BedStatus, string> = {
      available: 'Available',
      occupied: 'Occupied',
      reserved: 'Reserved',
      cleaning: 'Cleaning',
      maintenance: 'Maintenance',
      out_of_service: 'Out of Service',
    };
    return text[status] || status;
  }

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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bed Management</h1>
            <p className="text-muted-foreground">Manage beds and their assignments</p>
          </div>
        </div>
        <Button size="lg" className="gap-2 text-white" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Bed
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Beds</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Occupied</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.occupied}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cleaning</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.cleaning}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Maintenance</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.maintenance}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search beds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Ward Filter */}
            <Select value={selectedWardId} onValueChange={setSelectedWardId}>
              <SelectTrigger>
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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>

            {/* Bed Type Filter */}
            <Select value={bedTypeFilter} onValueChange={setBedTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="icu">ICU</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="pediatric">Pediatric</SelectItem>
                <SelectItem value="bariatric">Bariatric</SelectItem>
                <SelectItem value="isolation">Isolation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Beds Grid */}
      {filteredBeds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BedIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No beds found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {beds.length === 0
                ? 'Add beds to get started'
                : 'Try adjusting your filters'}
            </p>
            {beds.length === 0 && (
              <Button onClick={openCreateDialog} className="text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Bed
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBeds.map((bed) => (
            <Card key={bed.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BedIcon className="h-5 w-5" />
                      {bed.bedNumber}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {bed.ward?.name || 'Unknown Ward'}
                    </CardDescription>
                  </div>
                  <Badge className={`${getBedStatusColor(bed.status)} text-white`}>
                    {getBedStatusText(bed.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{bed.bedType}</Badge>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {bed.hasOxygen && (
                      <Badge variant="secondary" className="text-xs">
                        Oxygen
                      </Badge>
                    )}
                    {bed.hasSuction && (
                      <Badge variant="secondary" className="text-xs">
                        Suction
                      </Badge>
                    )}
                    {bed.hasMonitor && (
                      <Badge variant="secondary" className="text-xs">
                        Monitor
                      </Badge>
                    )}
                    {bed.hasIvPole && (
                      <Badge variant="secondary" className="text-xs">
                        IV Pole
                      </Badge>
                    )}
                    {bed.isElectric && (
                      <Badge variant="secondary" className="text-xs">
                        Electric
                      </Badge>
                    )}
                  </div>

                  {/* Patient Info if occupied */}
                  {bed.status === 'occupied' && bed.currentPatientName && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium">Current Patient:</p>
                      <p className="text-sm text-muted-foreground">{bed.currentPatientName}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(bed)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bed.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <DialogTitle>{editingBed ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
            <DialogDescription>
              {editingBed
                ? 'Update bed information and features'
                : 'Add a new bed to the ward with its features'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Ward Selection */}
              <div className="grid gap-2">
                <Label htmlFor="wardId">Ward *</Label>
                <Select
                  value={formData.wardId}
                  onValueChange={(value) => setFormData({ ...formData, wardId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name} ({ward.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bed Number */}
              <div className="grid gap-2">
                <Label htmlFor="bedNumber">Bed Number *</Label>
                <Input
                  id="bedNumber"
                  value={formData.bedNumber}
                  onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                  placeholder="e.g., 101, A-12"
                  required
                />
              </div>

              {/* Bed Type */}
              <div className="grid gap-2">
                <Label htmlFor="bedType">Bed Type *</Label>
                <Select
                  value={formData.bedType}
                  onValueChange={(value: BedType) => setFormData({ ...formData, bedType: value })}
                  required
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

              {/* Features */}
              <div className="grid gap-3">
                <Label>Features</Label>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasOxygen"
                      checked={formData.hasOxygen}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasOxygen: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasOxygen" className="font-normal cursor-pointer">
                      Oxygen Supply
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSuction"
                      checked={formData.hasSuction}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasSuction: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasSuction" className="font-normal cursor-pointer">
                      Suction
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasMonitor"
                      checked={formData.hasMonitor}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasMonitor: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasMonitor" className="font-normal cursor-pointer">
                      Monitor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasIvPole"
                      checked={formData.hasIvPole}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasIvPole: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasIvPole" className="font-normal cursor-pointer">
                      IV Pole
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isElectric"
                      checked={formData.isElectric}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isElectric: checked as boolean })
                      }
                    />
                    <Label htmlFor="isElectric" className="font-normal cursor-pointer">
                      Electric Bed
                    </Label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
