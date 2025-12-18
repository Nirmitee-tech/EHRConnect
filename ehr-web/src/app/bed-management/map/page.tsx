'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as bedManagementService from '@/services/bed-management';
import type { Ward, Bed as BedType } from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function BedStatusMapPage() {
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('all');
  const [beds, setBeds] = useState<BedType[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [orgId, userId, selectedWardId]);

  async function loadWards() {
    if (!orgId) return;
    try {
      const data = await bedManagementService.getWards(orgId, userId || undefined, {
        locationId: currentFacility?.id,
        active: true,
      });
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  }

  async function loadBeds() {
    if (!orgId) return;
    try {
      setLoading(true);
      const filters: any = {
        locationId: currentFacility?.id,
        active: true,
      };
      if (selectedWardId !== 'all') {
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

  const getBedStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      occupied: 'bg-red-500',
      reserved: 'bg-yellow-500',
      cleaning: 'bg-blue-500',
      maintenance: 'bg-orange-500',
      out_of_service: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-300';
  };

  const getBedStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Available',
      occupied: 'Occupied',
      reserved: 'Reserved',
      cleaning: 'Cleaning',
      maintenance: 'Maintenance',
      out_of_service: 'Out of Service',
    };
    return labels[status] || status;
  };

  // Group beds by ward
  const bedsByWard = beds.reduce((acc, bed) => {
    const wardId = bed.wardId || 'unassigned';
    if (!acc[wardId]) {
      acc[wardId] = [];
    }
    acc[wardId].push(bed);
    return acc;
  }, {} as Record<string, BedType[]>);

  if (loading && beds.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bed status map...</p>
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
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bed Status Map</h1>
            <p className="text-muted-foreground">Visual overview of all bed statuses</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={loadBeds}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <Select value={selectedWardId} onValueChange={setSelectedWardId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {['available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'out_of_service'].map(
              (status) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${getBedStatusColor(status)}`} />
                  <span className="text-sm">{getBedStatusLabel(status)}</span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bed Map */}
      {beds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No beds found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(bedsByWard).map(([wardId, wardBeds]) => {
            const ward = wards.find((w) => w.id === wardId);
            return (
              <Card key={wardId}>
                <CardHeader>
                  <CardTitle>
                    {ward?.name || 'Unassigned Beds'}
                    <Badge variant="outline" className="ml-2">
                      {wardBeds.length} beds
                    </Badge>
                  </CardTitle>
                  {ward && (
                    <CardDescription>
                      {ward.wardType} • Floor {ward.floor || 'N/A'} • Building{' '}
                      {ward.building || 'N/A'}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {wardBeds.map((bed) => (
                      <div
                        key={bed.id}
                        className="relative group cursor-pointer"
                        title={`${bed.bedNumber} - ${getBedStatusLabel(bed.status)}`}
                      >
                        <div
                          className={`
                            ${getBedStatusColor(bed.status)}
                            aspect-square rounded-lg flex items-center justify-center
                            text-white font-semibold text-sm
                            hover:shadow-lg transition-all
                            ${bed.status === 'available' ? 'hover:scale-110' : ''}
                          `}
                        >
                          {bed.bedNumber}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <div className="font-semibold">{bed.bedNumber}</div>
                          <div className="text-gray-300">{getBedStatusLabel(bed.status)}</div>
                          {bed.bedType && (
                            <div className="text-gray-300">{bed.bedType}</div>
                          )}
                          {bed.room && (
                            <div className="text-gray-300">Room {bed.room.roomNumber}</div>
                          )}
                          {bed.currentPatientId && (
                            <div className="text-yellow-300 mt-1">Patient assigned</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
