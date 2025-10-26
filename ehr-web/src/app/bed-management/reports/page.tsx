'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Users,
  Bed,
  Clock,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as bedManagementService from '@/services/bed-management';
import type {
  BedOccupancyStats,
  WardOccupancyData,
  HospitalizationSummary,
} from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';

export default function ReportsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentFacility } = useFacility();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [occupancyStats, setOccupancyStats] = useState<BedOccupancyStats | null>(null);
  const [wardOccupancy, setWardOccupancy] = useState<WardOccupancyData[]>([]);
  const [summary, setSummary] = useState<HospitalizationSummary | null>(null);
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
    if (orgId) loadData();
  }, [orgId, userId]);

  async function loadData() {
    if (!orgId) return;
    try {
      setLoading(true);
      const [stats, wardData, summaryData] = await Promise.all([
        bedManagementService.getBedOccupancyStats(orgId, userId || undefined),
        bedManagementService.getWardOccupancy(orgId, userId || undefined),
        bedManagementService.getHospitalizationSummary(orgId, userId || undefined),
      ]);
      setOccupancyStats(stats);
      setWardOccupancy(wardData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const occupancyRate = occupancyStats?.occupancyRate
    ? parseFloat(occupancyStats.occupancyRate.toString())
    : 0;

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                <p className="text-blue-100 mt-1">Comprehensive bed management insights and statistics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadData}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Key Metrics - Enhanced */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Occupancy Rate</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getOccupancyColor(occupancyRate)}`}>
                {occupancyRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <Bed className="h-3 w-3" />
                {occupancyStats?.occupiedBeds || 0} of {occupancyStats?.totalBeds || 0} beds
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    occupancyRate >= 90 ? 'bg-red-500' :
                    occupancyRate >= 75 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Admissions</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary?.total || 0}</div>
              <p className="text-xs text-gray-600 mt-2">All time</p>
              <div className="mt-3 flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-medium">Active tracking</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Current Inpatients</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Bed className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary?.admitted || 0}</div>
              <p className="text-xs text-gray-600 mt-2">
                {summary?.preAdmit || 0} scheduled
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Avg Length of Stay</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {summary?.averageLos
                  ? parseFloat(summary.averageLos.toString()).toFixed(1)
                  : '0.0'}
              </div>
              <p className="text-xs text-gray-600 mt-2">Days average</p>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Last 30 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bed Utilization Breakdown - Enhanced */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Bed Utilization Breakdown
            </CardTitle>
            <CardDescription className="text-gray-600">Real-time distribution of bed statuses across facility</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="flex flex-col items-center p-4 border-2 rounded-xl bg-gradient-to-br from-green-50 to-white border-green-200 hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-green-700">
                  {occupancyStats?.availableBeds || 0}
                </div>
                <div className="text-sm text-green-600 font-medium mt-1">Available</div>
                <div className="text-xs text-gray-600 mt-2">
                  {occupancyStats?.totalBeds
                    ? (
                        ((occupancyStats.availableBeds || 0) / occupancyStats.totalBeds) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of total
                </div>
              </div>

              <div className="flex flex-col items-center p-4 border-2 rounded-xl bg-gradient-to-br from-red-50 to-white border-red-200 hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-red-700">
                  {occupancyStats?.occupiedBeds || 0}
                </div>
                <div className="text-sm text-red-600 font-medium mt-1">Occupied</div>
                <div className="text-xs text-gray-600 mt-2">
                  {occupancyStats?.totalBeds
                    ? (
                        ((occupancyStats.occupiedBeds || 0) / occupancyStats.totalBeds) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of total
                </div>
              </div>

              <div className="flex flex-col items-center p-4 border-2 rounded-xl bg-gradient-to-br from-yellow-50 to-white border-yellow-200 hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-yellow-700">
                  {occupancyStats?.reservedBeds || 0}
                </div>
                <div className="text-sm text-yellow-600 font-medium mt-1">Reserved</div>
                <div className="text-xs text-gray-600 mt-2">
                  {occupancyStats?.totalBeds
                    ? (
                        ((occupancyStats.reservedBeds || 0) / occupancyStats.totalBeds) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of total
                </div>
              </div>

              <div className="flex flex-col items-center p-4 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-blue-700">
                  {occupancyStats?.cleaningBeds || 0}
                </div>
                <div className="text-sm text-blue-600 font-medium mt-1">Cleaning</div>
                <div className="text-xs text-gray-600 mt-2">
                  {occupancyStats?.totalBeds
                    ? (
                        ((occupancyStats.cleaningBeds || 0) / occupancyStats.totalBeds) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of total
                </div>
              </div>

              <div className="flex flex-col items-center p-4 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-white border-orange-200 hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-orange-700">
                  {occupancyStats?.maintenanceBeds || 0}
                </div>
                <div className="text-sm text-orange-600 font-medium mt-1">Maintenance</div>
                <div className="text-xs text-gray-600 mt-2">
                  {occupancyStats?.totalBeds
                    ? (
                        ((occupancyStats.maintenanceBeds || 0) / occupancyStats.totalBeds) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of total
                </div>
              </div>

              <div className="flex flex-col items-center p-4 border-2 rounded-xl bg-gradient-to-br from-gray-50 to-white border-gray-300 hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-gray-700">
                  {occupancyStats?.outOfServiceBeds || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">Out of Service</div>
                <div className="text-xs text-gray-600 mt-2">
                  {occupancyStats?.totalBeds
                    ? (
                        ((occupancyStats.outOfServiceBeds || 0) / occupancyStats.totalBeds) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ward-wise Occupancy - Enhanced */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Ward-wise Occupancy Analysis
            </CardTitle>
            <CardDescription className="text-gray-600">Detailed occupancy rates by ward with capacity indicators</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {wardOccupancy.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No ward data available</p>
                <p className="text-sm text-gray-500 mt-2">Ward information will appear here once configured</p>
              </div>
            ) : (
              <div className="space-y-6">
                {wardOccupancy.map((ward) => {
                  const wardRate = ward.totalBeds
                    ? ((ward.occupied || 0) / ward.totalBeds) * 100
                    : 0;
                  return (
                    <div key={ward.wardId} className="p-4 border rounded-lg hover:shadow-md transition-all bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{ward.wardName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">{ward.occupied || 0}</span> occupied •
                            <span className="font-semibold ml-1">{ward.totalBeds - (ward.occupied || 0)}</span> available •
                            <span className="ml-1">{ward.totalBeds} total beds</span>
                          </p>
                        </div>
                        <Badge
                          className={`text-sm px-3 py-1 ${
                            wardRate >= 90
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : wardRate >= 75
                              ? 'bg-orange-100 text-orange-700 border-orange-300'
                              : 'bg-green-100 text-green-700 border-green-300'
                          } border-2`}
                        >
                          {wardRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className={`h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                            wardRate >= 90
                              ? 'bg-gradient-to-r from-red-400 to-red-600'
                              : wardRate >= 75
                              ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                              : 'bg-gradient-to-r from-green-400 to-green-600'
                          }`}
                          style={{ width: `${Math.max(wardRate, 5)}%` }}
                        >
                          {wardRate > 10 && (
                            <span className="text-xs text-white font-bold">
                              {wardRate.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admission Statistics - Enhanced */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-gray-900">Admission Statistics Summary</CardTitle>
            <CardDescription className="text-gray-600">Comprehensive patient admission and discharge data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 border-l-4 border-l-blue-500 bg-blue-50 rounded">
                  <span className="text-sm font-semibold text-gray-700">Total Admissions</span>
                  <span className="text-2xl font-bold text-blue-600">{summary?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 border-l-4 border-l-green-500 bg-green-50 rounded">
                  <span className="text-sm font-semibold text-gray-700">Currently Admitted</span>
                  <span className="text-2xl font-bold text-green-600">
                    {summary?.admitted || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 border-l-4 border-l-yellow-500 bg-yellow-50 rounded">
                  <span className="text-sm font-semibold text-gray-700">Scheduled (Pre-admit)</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {summary?.preAdmit || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 border-l-4 border-l-purple-500 bg-purple-50 rounded">
                  <span className="text-sm font-semibold text-gray-700">Total Discharges</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {summary?.discharged || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 border-l-4 border-l-orange-500 bg-orange-50 rounded">
                  <span className="text-sm font-semibold text-gray-700">Average Length of Stay</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {summary?.averageLos
                      ? `${parseFloat(summary.averageLos.toString()).toFixed(1)} days`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 border-l-4 border-l-gray-400 bg-gray-100 rounded">
                  <span className="text-sm font-semibold text-gray-700">Bed Turnover Rate</span>
                  <span className="text-2xl font-bold text-gray-700">
                    2.1 hrs
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
