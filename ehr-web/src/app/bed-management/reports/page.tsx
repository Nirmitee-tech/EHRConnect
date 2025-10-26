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
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Percent,
} from 'lucide-react';
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import * as bedManagementService from '@/services/bed-management';
import type {
  BedOccupancyStats,
  WardOccupancyData,
  HospitalizationSummary,
} from '@/types/bed-management';
import { useFacility } from '@/contexts/facility-context';

// Mock data for charts
const occupancyTrendData = [
  { date: 'Jan 1', occupancy: 78, available: 22, target: 85 },
  { date: 'Jan 8', occupancy: 82, available: 18, target: 85 },
  { date: 'Jan 15', occupancy: 85, available: 15, target: 85 },
  { date: 'Jan 22', occupancy: 88, available: 12, target: 85 },
  { date: 'Jan 29', occupancy: 86, available: 14, target: 85 },
  { date: 'Feb 5', occupancy: 90, available: 10, target: 85 },
  { date: 'Feb 12', occupancy: 87, available: 13, target: 85 },
];

const admissionDischargeData = [
  { day: 'Mon', admissions: 12, discharges: 8, transfers: 3 },
  { day: 'Tue', admissions: 15, discharges: 10, transfers: 5 },
  { day: 'Wed', admissions: 18, discharges: 14, transfers: 4 },
  { day: 'Thu', admissions: 14, discharges: 12, transfers: 6 },
  { day: 'Fri', admissions: 16, discharges: 15, transfers: 2 },
  { day: 'Sat', admissions: 10, discharges: 8, transfers: 3 },
  { day: 'Sun', admissions: 8, discharges: 6, transfers: 2 },
];

const bedStatusPieData = [
  { name: 'Occupied', value: 68, color: '#DC2626' },
  { name: 'Available', value: 18, color: '#059669' },
  { name: 'Reserved', value: 8, color: '#F59E0B' },
  { name: 'Maintenance', value: 6, color: '#6B7280' },
];

const lengthOfStayData = [
  { range: '0-2 days', count: 45, avg: 1.5 },
  { range: '3-5 days', count: 68, avg: 4.2 },
  { range: '6-10 days', count: 42, avg: 7.8 },
  { range: '11-20 days', count: 28, avg: 14.5 },
  { range: '20+ days', count: 12, avg: 28.3 },
];

const COLORS = ['#DC2626', '#059669', '#F59E0B', '#6B7280'];

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
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');

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
    <div className="min-h-screen bg-gray-50 -m-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#0F1E56] text-white shadow-lg">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/bed-management')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Bed Management Reports & Analytics</h1>
                <p className="text-xs text-blue-200 mt-0.5">
                  Comprehensive insights and data-driven reports
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-300" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-300" />
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-[160px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="occupancy">Occupancy Analysis</SelectItem>
                      <SelectItem value="flow">Patient Flow</SelectItem>
                      <SelectItem value="los">Length of Stay</SelectItem>
                    </SelectContent>
                  </Select>
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
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards - Gradient Style like main dashboard */}
        <div className="grid gap-3 grid-cols-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  {occupancyRate >= 85 ? '+5.2%' : '+2.1%'}
                </div>
              </div>
              <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
              <div className="text-xs opacity-90 mt-0.5">Occupancy Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <Bed className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  8.3%
                </div>
              </div>
              <div className="text-2xl font-bold">{occupancyStats?.totalBeds || 0}</div>
              <div className="text-xs opacity-90 mt-0.5">Total Beds</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  12.5%
                </div>
              </div>
              <div className="text-2xl font-bold">{summary?.total || 0}</div>
              <div className="text-xs opacity-90 mt-0.5">Total Admissions</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  4.2%
                </div>
              </div>
              <div className="text-2xl font-bold">{summary?.admitted || 0}</div>
              <div className="text-xs opacity-90 mt-0.5">Current Inpatients</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowDownRight className="h-3 w-3" />
                  3.1%
                </div>
              </div>
              <div className="text-2xl font-bold">
                {summary?.averageLos ? parseFloat(summary.averageLos.toString()).toFixed(1) : '0.0'}
              </div>
              <div className="text-xs opacity-90 mt-0.5">Avg Length of Stay</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-600 to-rose-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  6.8%
                </div>
              </div>
              <div className="text-2xl font-bold">{summary?.discharged || 0}</div>
              <div className="text-xs opacity-90 mt-0.5">Discharges</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  5.5%
                </div>
              </div>
              <div className="text-2xl font-bold">{summary?.preAdmit || 0}</div>
              <div className="text-xs opacity-90 mt-0.5">Scheduled</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-5 w-5 opacity-90" />
                <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3 w-3" />
                  2.1hr
                </div>
              </div>
              <div className="text-2xl font-bold">{wardOccupancy.length}</div>
              <div className="text-xs opacity-90 mt-0.5">Active Wards</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Occupancy Trend */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Occupancy Trend - Last 7 Days
              </CardTitle>
              <CardDescription className="text-gray-600">Daily occupancy percentage with target line</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={occupancyTrendData}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorOccupancy)"
                    strokeWidth={2}
                    name="Occupancy %"
                  />
                  <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <PieChart className="h-5 w-5 text-purple-600" />
                Bed Status Distribution
              </CardTitle>
              <CardDescription className="text-gray-600">Current status breakdown of all beds</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={bedStatusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bedStatusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="h-5 w-5 text-green-600" />
                Admissions vs Discharges - Weekly
              </CardTitle>
              <CardDescription className="text-gray-600">Patient flow patterns by day of week</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={admissionDischargeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="admissions" fill="#059669" name="Admissions" />
                  <Bar dataKey="discharges" fill="#dc2626" name="Discharges" />
                  <Bar dataKey="transfers" fill="#f59e0b" name="Transfers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Clock className="h-5 w-5 text-orange-600" />
                Length of Stay Distribution
              </CardTitle>
              <CardDescription className="text-gray-600">Patient distribution by length of stay</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lengthOfStayData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="range" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6366f1" name="Number of Patients" />
                </BarChart>
              </ResponsiveContainer>
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
