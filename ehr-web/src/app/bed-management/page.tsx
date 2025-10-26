'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bed,
  Plus,
  Activity,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFacility } from '@/contexts/facility-context';
import * as bedManagementService from '@/services/bed-management';
import type { BedOccupancyStats, HospitalizationSummary, Hospitalization } from '@/types/bed-management';

export default function BedManagementPage() {
  const { data: session, status } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [occupancyStats, setOccupancyStats] = useState<BedOccupancyStats | null>(null);
  const [hospitalizationSummary, setHospitalizationSummary] = useState<HospitalizationSummary | null>(null);
  const [currentInpatients, setCurrentInpatients] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoadingSession = status === 'loading';

  // Get orgId and userId from session (matches inventory pattern)
  useEffect(() => {
    if (!session) {
      setOrgId(null);
      setUserId(null);
      return;
    }

    if (session.org_id) {
      setOrgId(session.org_id);
      setUserId((session.user as any)?.id || session.user?.email || null);
    }
  }, [session]);

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId, userId]);

  async function loadData() {
    if (!orgId) return;

    try {
      setLoading(true);
      setError(null);

      const [stats, summary, inpatients] = await Promise.all([
        bedManagementService.getBedOccupancyStats(orgId, userId || undefined),
        bedManagementService.getHospitalizationSummary(orgId, userId || undefined),
        bedManagementService.getCurrentInpatients(orgId, userId || undefined)
      ]);

      setOccupancyStats(stats);
      setHospitalizationSummary(summary);
      setCurrentInpatients(inpatients);
    } catch (err) {
      console.error('Error loading bed management data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  if (isLoadingSession || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoadingSession ? 'Loading session...' : 'Loading bed management data...'}
          </p>
        </div>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please log in to access the bed management system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const occupancyRate = occupancyStats?.occupancyRate
    ? parseFloat(occupancyStats.occupancyRate.toString())
    : 0;
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bed Management</h1>
          <p className="text-muted-foreground">
            Monitor bed occupancy, manage admissions, and track inpatient care
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 text-white"
          onClick={() => window.location.href = '/bed-management/admit'}
        >
          <Plus className="h-4 w-4" />
          Admit Patient
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyStats?.totalBeds || 0}</div>
            <p className="text-xs text-muted-foreground">
              {occupancyStats?.availableBeds || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getOccupancyColor(occupancyRate)}`}>
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {occupancyStats?.occupiedBeds || 0} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Inpatients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitalizationSummary?.admitted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {hospitalizationSummary?.preAdmit || 0} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Length of Stay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hospitalizationSummary?.averageLos
                ? parseFloat(hospitalizationSummary.averageLos.toString()).toFixed(1)
                : '0.0'} days
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bed Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Bed Status Overview</CardTitle>
          <CardDescription>Current status of all beds in the facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {occupancyStats?.availableBeds || 0}
              </div>
              <div className="text-sm text-green-600">Available</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {occupancyStats?.occupiedBeds || 0}
              </div>
              <div className="text-sm text-red-600">Occupied</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">
                {occupancyStats?.reservedBeds || 0}
              </div>
              <div className="text-sm text-yellow-600">Reserved</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {occupancyStats?.cleaningBeds || 0}
              </div>
              <div className="text-sm text-blue-600">Cleaning</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {occupancyStats?.maintenanceBeds || 0}
              </div>
              <div className="text-sm text-orange-600">Maintenance</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50 border-gray-200">
              <div className="text-2xl font-bold text-gray-700">
                {occupancyStats?.outOfServiceBeds || 0}
              </div>
              <div className="text-sm text-gray-600">Out of Service</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Inpatients */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inpatients</CardTitle>
          <CardDescription>
            Patients currently admitted to the facility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentInpatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No current inpatients</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentInpatients.slice(0, 10).map((admission) => (
                <div
                  key={admission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{admission.patientName}</h4>
                      {admission.patientMrn && (
                        <Badge variant="outline" className="text-xs">
                          MRN: {admission.patientMrn}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          admission.priority === 'emergency' ? 'destructive' :
                          admission.priority === 'urgent' ? 'default' :
                          'secondary'
                        }
                      >
                        {admission.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {admission.currentBed?.bedNumber || 'No bed assigned'}
                      </span>
                      {admission.currentWard && (
                        <span>{admission.currentWard.name}</span>
                      )}
                      {admission.attendingDoctorName && (
                        <span>Dr. {admission.attendingDoctorName}</span>
                      )}
                      <span>
                        Admitted: {new Date(admission.admissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}

              {currentInpatients.length > 10 && (
                <Button variant="outline" className="w-full">
                  View All {currentInpatients.length} Inpatients
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-green-50"
          onClick={() => window.location.href = '/bed-management/demo'}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Demo Floor Plan
              <Badge variant="default" className="text-xs bg-green-600">Try Now</Badge>
            </CardTitle>
            <CardDescription>Interactive demo with mock data - Click beds to admit patients!</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-blue-50"
          onClick={() => window.location.href = '/bed-management/floor-plan'}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Floor Plan View
              <Badge variant="default" className="text-xs bg-blue-600">Real Data</Badge>
            </CardTitle>
            <CardDescription>Interactive room layout with your actual beds - Click to admit patients!</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/bed-management/visual'}
        >
          <CardHeader>
            <CardTitle className="text-lg">Visual Bed Management</CardTitle>
            <CardDescription>Interactive room layout with operations panel</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/bed-management/wards'}
        >
          <CardHeader>
            <CardTitle className="text-lg">Ward Configuration</CardTitle>
            <CardDescription>Manage wards, rooms, and bed setup</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/bed-management/map'}
        >
          <CardHeader>
            <CardTitle className="text-lg">Bed Status Map</CardTitle>
            <CardDescription>Visual map of all beds and their status</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/bed-management/reports'}
        >
          <CardHeader>
            <CardTitle className="text-lg">Reports & Analytics</CardTitle>
            <CardDescription>Occupancy trends and utilization reports</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
