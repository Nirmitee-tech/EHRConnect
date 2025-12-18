'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Building2, Loader2 } from 'lucide-react';
import { FacilitySummary } from '@/types/fhir';
import { facilityService } from '@/services/facility.service';
import { useFacility } from '@/contexts/facility-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function FacilitiesPage() {
  const router = useRouter();
  const { refreshFacilities } = useFacility();
  const { t } = useTranslation('common');
  
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await facilityService.searchFacilities({
        active: true,
        _count: 100,
        _sort: 'name'
      });
      
      setFacilities(result.facilities);
    } catch (err) {
      setError('Failed to load facilities');
      console.error('Error loading facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = () => {
    router.push('/admin/facilities/new');
  };

  const handleEditFacility = (facilityId: string) => {
    router.push(`/admin/facilities/${facilityId}/edit`);
  };

  const handleDeleteFacility = async (facilityId: string, facilityName: string) => {
    if (!confirm(`Are you sure you want to delete facility "${facilityName}"?`)) {
      return;
    }

    try {
      await facilityService.softDeleteFacility(facilityId, 'current-user-id');
      await loadFacilities();
      await refreshFacilities();
    } catch (err) {
      alert('Failed to delete facility');
      console.error('Error deleting facility:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading facilities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">
            Manage healthcare facilities and locations
          </p>
        </div>
        <Button onClick={handleCreateFacility}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 mb-6 border-destructive">
          <div className="text-destructive">
            <p className="font-medium">Error loading facilities</p>
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      )}

      {/* Facilities List */}
      {facilities.length === 0 && !loading ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Facilities Found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first healthcare facility.
          </p>
          <Button onClick={handleCreateFacility}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Facility
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <Card key={facility.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{facility.name}</h3>
                  {facility.type && (
                    <Badge variant="outline" className="capitalize mb-2">
                      {facility.type}
                    </Badge>
                  )}
                </div>
                <Badge variant={facility.active ? 'default' : 'secondary'}>
                  {facility.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditFacility(facility.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFacility(facility.id, facility.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
