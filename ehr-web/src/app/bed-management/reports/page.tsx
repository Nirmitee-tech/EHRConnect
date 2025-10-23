'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
          <p className="text-muted-foreground">Loading reports...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Occupancy trends and utilization reports</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {occupancyStats?.occupiedBeds || 0} of {occupancyStats?.totalBeds || 0} beds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Inpatients</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.admitted || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.preAdmit || 0} scheduled
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
              {summary?.averageLos
                ? parseFloat(summary.averageLos.toString()).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Bed Utilization Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Bed Utilization Breakdown</CardTitle>
          <CardDescription>Current distribution of bed statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {occupancyStats?.availableBeds || 0}
              </div>
              <div className="text-sm text-green-600">Available</div>
              <div className="text-xs text-muted-foreground mt-1">
                {occupancyStats?.totalBeds
                  ? (
                      ((occupancyStats.availableBeds || 0) / occupancyStats.totalBeds) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex flex-col items-center p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {occupancyStats?.occupiedBeds || 0}
              </div>
              <div className="text-sm text-red-600">Occupied</div>
              <div className="text-xs text-muted-foreground mt-1">
                {occupancyStats?.totalBeds
                  ? (
                      ((occupancyStats.occupiedBeds || 0) / occupancyStats.totalBeds) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex flex-col items-center p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">
                {occupancyStats?.reservedBeds || 0}
              </div>
              <div className="text-sm text-yellow-600">Reserved</div>
              <div className="text-xs text-muted-foreground mt-1">
                {occupancyStats?.totalBeds
                  ? (
                      ((occupancyStats.reservedBeds || 0) / occupancyStats.totalBeds) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex flex-col items-center p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {occupancyStats?.cleaningBeds || 0}
              </div>
              <div className="text-sm text-blue-600">Cleaning</div>
              <div className="text-xs text-muted-foreground mt-1">
                {occupancyStats?.totalBeds
                  ? (
                      ((occupancyStats.cleaningBeds || 0) / occupancyStats.totalBeds) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex flex-col items-center p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {occupancyStats?.maintenanceBeds || 0}
              </div>
              <div className="text-sm text-orange-600">Maintenance</div>
              <div className="text-xs text-muted-foreground mt-1">
                {occupancyStats?.totalBeds
                  ? (
                      ((occupancyStats.maintenanceBeds || 0) / occupancyStats.totalBeds) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 border-gray-200">
              <div className="text-2xl font-bold text-gray-700">
                {occupancyStats?.outOfServiceBeds || 0}
              </div>
              <div className="text-sm text-gray-600">Out of Service</div>
              <div className="text-xs text-muted-foreground mt-1">
                {occupancyStats?.totalBeds
                  ? (
                      ((occupancyStats.outOfServiceBeds || 0) / occupancyStats.totalBeds) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ward-wise Occupancy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ward-wise Occupancy
          </CardTitle>
          <CardDescription>Occupancy rates by ward</CardDescription>
        </CardHeader>
        <CardContent>
          {wardOccupancy.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ward data available
            </div>
          ) : (
            <div className="space-y-4">
              {wardOccupancy.map((ward) => {
                const wardRate = ward.totalBeds
                  ? ((ward.occupied || 0) / ward.totalBeds) * 100
                  : 0;
                return (
                  <div key={ward.wardId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{ward.wardName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ward.occupied || 0} / {ward.totalBeds} beds occupied
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          wardRate >= 90
                            ? 'bg-red-50 text-red-700'
                            : wardRate >= 75
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-green-50 text-green-700'
                        }
                      >
                        {wardRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          wardRate >= 90
                            ? 'bg-red-500'
                            : wardRate >= 75
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${wardRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admission Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Admission Statistics</CardTitle>
          <CardDescription>Patient admission summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Total Admissions</span>
                <span className="text-lg font-bold">{summary?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Currently Admitted</span>
                <span className="text-lg font-bold text-blue-600">
                  {summary?.admitted || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Scheduled (Pre-admit)</span>
                <span className="text-lg font-bold text-yellow-600">
                  {summary?.preAdmit || 0}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Total Discharges</span>
                <span className="text-lg font-bold text-green-600">
                  {summary?.discharged || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Cancelled</span>
                <span className="text-lg font-bold text-gray-600">
                  N/A
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Average Length of Stay</span>
                <span className="text-lg font-bold">
                  {summary?.averageLos
                    ? `${parseFloat(summary.averageLos.toString()).toFixed(1)} days`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
