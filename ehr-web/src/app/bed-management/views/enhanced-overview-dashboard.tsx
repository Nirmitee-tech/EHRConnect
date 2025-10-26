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
  Building2,
  MapPin,
  Calendar,
  Bell,
  CheckCircle2,
  XCircle
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

export default function EnhancedOverviewDashboard({ orgId, userId }: OverviewDashboardProps) {
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
          <p className="text-gray-600">Loading dashboard data...</p>
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
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const occupancyRate = occupancyStats?.occupancyRate
    ? parseFloat(occupancyStats.occupancyRate.toString())
    : 0;

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' };
    if (rate >= 75) return { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' };
    return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' };
  };

  const colorScheme = getOccupancyColor(occupancyRate);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${colorScheme.bg} animate-pulse`}></div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Dashboard Overview</h2>
            <p className="text-sm text-gray-600">Real-time bed management insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push('/bed-management/admit')}
          >
            <Plus className="h-4 w-4" />
            Quick Admit
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/bed-management/floor-plan')}
          >
            <Bed className="h-4 w-4" />
            Floor Plan
          </Button>
        </div>
      </div>

      {/* Key Metrics with Animations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`border-l-4 ${colorScheme.border} bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Beds</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bed className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{occupancyStats?.totalBeds || 0}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
                {occupancyStats?.availableBeds || 0} available now
              </p>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((occupancyStats?.availableBeds || 0) / (occupancyStats?.totalBeds || 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${colorScheme.border} bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Occupancy Rate</CardTitle>
            <div className={`p-2 ${colorScheme.text.replace('text', 'bg').replace('600', '100')} rounded-lg`}>
              <Activity className={`h-4 w-4 ${colorScheme.text}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${colorScheme.text}`}>
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {occupancyStats?.occupiedBeds || 0} of {occupancyStats?.totalBeds || 0} occupied
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`${colorScheme.bg} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-200 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Patients</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{hospitalizationSummary?.admitted || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Calendar className="h-3 w-3 mr-1" />
                {hospitalizationSummary?.preAdmit || 0} scheduled
              </Badge>
            </div>
            <div className="mt-3 flex items-center text-xs text-purple-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span className="font-medium">Active admissions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-200 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Length of Stay</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {hospitalizationSummary?.averageLos
                ? parseFloat(hospitalizationSummary.averageLos.toString()).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs text-gray-600 mt-2">days average</p>
            <div className="mt-3 flex items-center text-xs text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {occupancyRate >= 85 && (
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white shadow-md">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600 animate-pulse" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">High Occupancy Alert</h4>
                <p className="text-sm text-gray-600">
                  Current occupancy at {occupancyRate.toFixed(1)}% - Consider reviewing capacity planning
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/bed-management/analytics')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Bed Status Grid */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Real-time Bed Status</CardTitle>
              <CardDescription className="text-gray-600">
                Live breakdown across all {occupancyStats?.totalBeds || 0} beds
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-green-700 mb-1">
                  {occupancyStats?.availableBeds || 0}
                </div>
                <div className="text-sm text-green-600 font-medium mb-1">Available</div>
                <div className="text-xs text-gray-600">Ready for use</div>
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-red-700 mb-1">
                  {occupancyStats?.occupiedBeds || 0}
                </div>
                <div className="text-sm text-red-600 font-medium mb-1">Occupied</div>
                <div className="text-xs text-gray-600">In active use</div>
                <XCircle className="h-4 w-4 text-red-600 mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-yellow-700 mb-1">
                  {occupancyStats?.reservedBeds || 0}
                </div>
                <div className="text-sm text-yellow-600 font-medium mb-1">Reserved</div>
                <div className="text-xs text-gray-600">Booked ahead</div>
                <Calendar className="h-4 w-4 text-yellow-600 mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-blue-700 mb-1">
                  {occupancyStats?.cleaningBeds || 0}
                </div>
                <div className="text-sm text-blue-600 font-medium mb-1">Cleaning</div>
                <div className="text-xs text-gray-600">Being sanitized</div>
                <Sparkles className="h-4 w-4 text-blue-600 mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-orange-700 mb-1">
                  {occupancyStats?.maintenanceBeds || 0}
                </div>
                <div className="text-sm text-orange-600 font-medium mb-1">Maintenance</div>
                <div className="text-xs text-gray-600">Under repair</div>
                <Activity className="h-4 w-4 text-orange-600 mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-gray-700 mb-1">
                  {occupancyStats?.outOfServiceBeds || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium mb-1">Out of Service</div>
                <div className="text-xs text-gray-600">Not available</div>
                <AlertCircle className="h-4 w-4 text-gray-600 mt-2" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Inpatients - Takes 2 columns */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Inpatients
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {currentInpatients.length} patient{currentInpatients.length !== 1 ? 's' : ''} currently admitted
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => router.push('/bed-management/admit')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Admission
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentInpatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No current inpatients</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push('/bed-management/admit')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Admit First Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {currentInpatients.slice(0, 8).map((admission) => (
                  <Card
                    key={admission.id}
                    className="border hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                    onClick={() => router.push(`/patients/${admission.patientId}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{admission.patientName}</h4>
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
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              {admission.currentBed?.bedNumber || 'No bed'}
                            </span>
                            {admission.currentWard && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {admission.currentWard.name}
                              </span>
                            )}
                            {admission.attendingDoctorName && (
                              <span>Dr. {admission.attendingDoctorName}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="w-full flex items-center justify-between h-auto py-4 px-4 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-white rounded-lg hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/analytics')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-gray-900">Analytics</div>
                  <div className="text-xs text-gray-600">Charts & insights</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </button>

            <button
              className="w-full flex items-center justify-between h-auto py-4 px-4 border-2 border-green-300 bg-gradient-to-r from-green-50 to-white rounded-lg hover:shadow-lg hover:border-green-400 transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/demo')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-50">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                    Demo Floor Plan
                    <Badge variant="default" className="text-xs bg-green-600 text-white ml-1">Try</Badge>
                  </div>
                  <div className="text-xs text-gray-600">Interactive demo</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-green-600" />
            </button>

            <button
              className="w-full flex items-center justify-between h-auto py-4 px-4 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-white rounded-lg hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/floor-plan')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
                  <Bed className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-gray-900">Floor Plan</div>
                  <div className="text-xs text-gray-600">Visual bed layout</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-purple-600" />
            </button>

            <button
              className="w-full flex items-center justify-between h-auto py-4 px-4 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-white rounded-lg hover:shadow-lg hover:border-orange-400 transition-all cursor-pointer"
              onClick={() => router.push('/bed-management/wards')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-gray-900">Configuration</div>
                  <div className="text-xs text-gray-600">Wards & beds setup</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-orange-600" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
