'use client';

import { useState, useEffect } from 'react';
import {
  Bed,
  Plus,
  Activity,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as bedManagementService from '@/services/bed-management';
import type { BedOccupancyStats, HospitalizationSummary, Hospitalization } from '@/types/bed-management';
import { useRouter } from 'next/navigation';

interface OverviewDashboardProps {
  orgId: string;
  userId?: string;
}

export default function OverviewDashboard({ orgId, userId }: OverviewDashboardProps) {
  const router = useRouter();
  const [occupancyStats, setOccupancyStats] = useState<BedOccupancyStats | null>(null);
  const [hospitalizationSummary, setHospitalizationSummary] = useState<HospitalizationSummary | null>(null);
  const [currentInpatients, setCurrentInpatients] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        bedManagementService.getBedOccupancyStats(orgId, userId),
        bedManagementService.getHospitalizationSummary(orgId, userId),
        bedManagementService.getCurrentInpatients(orgId, userId)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
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
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyStats?.totalBeds || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {occupancyStats?.availableBeds || 0} available now
            </p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600 font-medium">
                {occupancyStats?.availableBeds || 0} ready
              </span>
            </div>
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
            <p className="text-xs text-muted-foreground mt-1">
              {occupancyStats?.occupiedBeds || 0} beds occupied
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  occupancyRate >= 90 ? 'bg-red-600' :
                  occupancyRate >= 75 ? 'bg-orange-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Inpatients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitalizationSummary?.admitted || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hospitalizationSummary?.preAdmit || 0} scheduled admissions
            </p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-blue-600 font-medium">
                +{hospitalizationSummary?.preAdmit || 0} incoming
              </span>
            </div>
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
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">days average</p>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bed Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Bed Status</CardTitle>
          <CardDescription>Current status distribution across all beds in your facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-green-50 border-green-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-green-700">
                {occupancyStats?.availableBeds || 0}
              </div>
              <div className="text-sm text-green-600 font-medium mt-1">Available</div>
              <div className="text-xs text-muted-foreground mt-1">Ready for use</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-red-50 border-red-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-red-700">
                {occupancyStats?.occupiedBeds || 0}
              </div>
              <div className="text-sm text-red-600 font-medium mt-1">Occupied</div>
              <div className="text-xs text-muted-foreground mt-1">In active use</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-yellow-50 border-yellow-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-yellow-700">
                {occupancyStats?.reservedBeds || 0}
              </div>
              <div className="text-sm text-yellow-600 font-medium mt-1">Reserved</div>
              <div className="text-xs text-muted-foreground mt-1">Booked ahead</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-blue-700">
                {occupancyStats?.cleaningBeds || 0}
              </div>
              <div className="text-sm text-blue-600 font-medium mt-1">Cleaning</div>
              <div className="text-xs text-muted-foreground mt-1">Being sanitized</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-orange-50 border-orange-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-orange-700">
                {occupancyStats?.maintenanceBeds || 0}
              </div>
              <div className="text-sm text-orange-600 font-medium mt-1">Maintenance</div>
              <div className="text-xs text-muted-foreground mt-1">Under repair</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-gray-700">
                {occupancyStats?.outOfServiceBeds || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1">Out of Service</div>
              <div className="text-xs text-muted-foreground mt-1">Not available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Inpatients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Inpatients</CardTitle>
                <CardDescription>
                  Currently admitted patients ({currentInpatients.length})
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/bed-management/admit')}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Admission
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentInpatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No current inpatients</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/bed-management/admit')}
                >
                  Admit First Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentInpatients.slice(0, 8).map((admission) => (
                  <div
                    key={admission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/patients/${admission.patientId}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{admission.patientName}</h4>
                        {admission.patientMrn && (
                          <Badge variant="outline" className="text-xs">
                            {admission.patientMrn}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            admission.priority === 'emergency' ? 'destructive' :
                            admission.priority === 'urgent' ? 'default' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {admission.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {admission.currentBed?.bedNumber || 'No bed'}
                        </span>
                        {admission.currentWard && (
                          <span>{admission.currentWard.name}</span>
                        )}
                        {admission.attendingDoctorName && (
                          <span className="truncate">Dr. {admission.attendingDoctorName}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump to frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-4"
              onClick={() => router.push('/bed-management/floor-plan')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Bed className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Floor Plan View</div>
                  <div className="text-xs text-muted-foreground">Interactive bed layout</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-auto py-4"
              onClick={() => router.push('/bed-management/demo')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    Demo Floor Plan
                    <Badge variant="default" className="text-xs bg-green-600">Try It</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Interactive demo with sample data</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-auto py-4"
              onClick={() => router.push('/bed-management/visual')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Visual Management</div>
                  <div className="text-xs text-muted-foreground">Room layout with operations</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-auto py-4"
              onClick={() => router.push('/bed-management/wards')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Ward Configuration</div>
                  <div className="text-xs text-muted-foreground">Manage wards & bed setup</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-auto py-4"
              onClick={() => router.push('/bed-management/reports')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Reports & Analytics</div>
                  <div className="text-xs text-muted-foreground">Occupancy trends & insights</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
