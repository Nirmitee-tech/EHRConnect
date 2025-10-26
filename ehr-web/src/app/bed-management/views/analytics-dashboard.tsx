'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Bed,
  Users,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
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
  RadialBarChart,
  RadialBar
} from 'recharts';
import * as bedManagementService from '@/services/bed-management';
import type { BedOccupancyStats, HospitalizationSummary } from '@/types/bed-management';

interface AnalyticsDashboardProps {
  orgId: string;
  userId?: string;
}

export default function AnalyticsDashboard({ orgId, userId }: AnalyticsDashboardProps) {
  const [occupancyStats, setOccupancyStats] = useState<BedOccupancyStats | null>(null);
  const [hospitalizationSummary, setHospitalizationSummary] = useState<HospitalizationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId, userId]);

  async function loadData() {
    try {
      setLoading(true);
      const [stats, summary] = await Promise.all([
        bedManagementService.getBedOccupancyStats(orgId, userId),
        bedManagementService.getHospitalizationSummary(orgId, userId)
      ]);
      setOccupancyStats(stats);
      setHospitalizationSummary(summary);
    } catch (err) {
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Mock data for charts (you can replace with real data from API)
  const occupancyTrendData = [
    { date: 'Mon', occupancy: 85, target: 80, available: 15 },
    { date: 'Tue', occupancy: 88, target: 80, available: 12 },
    { date: 'Wed', occupancy: 82, target: 80, available: 18 },
    { date: 'Thu', occupancy: 90, target: 80, available: 10 },
    { date: 'Fri', occupancy: 87, target: 80, available: 13 },
    { date: 'Sat', occupancy: 75, target: 80, available: 25 },
    { date: 'Sun', occupancy: 78, target: 80, available: 22 },
  ];

  const admissionDischargeData = [
    { month: 'Jan', admissions: 145, discharges: 142, transfers: 12 },
    { month: 'Feb', admissions: 152, discharges: 148, transfers: 15 },
    { month: 'Mar', admissions: 168, discharges: 165, transfers: 18 },
    { month: 'Apr', admissions: 159, discharges: 154, transfers: 14 },
    { month: 'May', admissions: 175, discharges: 170, transfers: 20 },
    { month: 'Jun', admissions: 182, discharges: 178, transfers: 16 },
  ];

  const bedStatusData = [
    { name: 'Available', value: occupancyStats?.availableBeds || 45, color: '#10b981' },
    { name: 'Occupied', value: occupancyStats?.occupiedBeds || 120, color: '#ef4444' },
    { name: 'Reserved', value: occupancyStats?.reservedBeds || 15, color: '#f59e0b' },
    { name: 'Cleaning', value: occupancyStats?.cleaningBeds || 8, color: '#3b82f6' },
    { name: 'Maintenance', value: occupancyStats?.maintenanceBeds || 5, color: '#f97316' },
    { name: 'Out of Service', value: occupancyStats?.outOfServiceBeds || 2, color: '#6b7280' },
  ];

  const wardOccupancyData = [
    { ward: 'ICU', beds: 30, occupied: 28, rate: 93 },
    { ward: 'Surgery', beds: 45, occupied: 38, rate: 84 },
    { ward: 'General', beds: 60, occupied: 48, rate: 80 },
    { ward: 'Pediatrics', beds: 25, occupied: 18, rate: 72 },
    { ward: 'Maternity', beds: 35, occupied: 26, rate: 74 },
  ];

  const lengthOfStayData = [
    { range: '< 1 day', count: 45, color: '#10b981' },
    { range: '1-3 days', count: 120, color: '#3b82f6' },
    { range: '4-7 days', count: 85, color: '#f59e0b' },
    { range: '8-14 days', count: 42, color: '#f97316' },
    { range: '> 14 days', count: 18, color: '#ef4444' },
  ];

  const occupancyRate = occupancyStats?.occupancyRate
    ? parseFloat(occupancyStats.occupancyRate.toString())
    : 0;

  const radialData = [
    {
      name: 'Occupancy',
      value: occupancyRate,
      fill: occupancyRate >= 90 ? '#ef4444' : occupancyRate >= 75 ? '#f59e0b' : '#10b981',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Calendar className="h-4 w-4" />
            Custom Period
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Average Occupancy</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+2.5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Length of Stay</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {hospitalizationSummary?.averageLos
                ? parseFloat(hospitalizationSummary.averageLos.toString()).toFixed(1)
                : '4.3'} days
            </div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">-0.3 days</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Bed Turnover Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">2.1 hrs</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">15% faster</span> than target
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Utilization Rate</CardTitle>
            <Bed className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">92.5%</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">Optimal</span> efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Occupancy Trend Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">7-Day Occupancy Trend</CardTitle>
            <CardDescription className="text-gray-600">
              Daily occupancy rates with target comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={occupancyTrendData}>
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                />
                <Legend wrapperStyle={{ color: '#1f2937' }} />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#3b82f6"
                  fill="url(#colorOccupancy)"
                  strokeWidth={2}
                  name="Occupancy %"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target %"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bed Status Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Current Bed Status Distribution</CardTitle>
            <CardDescription className="text-gray-600">
              Real-time breakdown of {occupancyStats?.totalBeds || 195} total beds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={bedStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bedStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-40">
                {bedStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Admissions & Discharges */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Admissions vs Discharges (6 Months)</CardTitle>
            <CardDescription className="text-gray-600">
              Monthly patient flow and transfer trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={admissionDischargeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                />
                <Legend wrapperStyle={{ color: '#1f2937' }} />
                <Bar dataKey="admissions" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Admissions" />
                <Bar dataKey="discharges" fill="#10b981" radius={[8, 8, 0, 0]} name="Discharges" />
                <Bar dataKey="transfers" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Transfers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ward-wise Occupancy */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Ward-wise Occupancy Rates</CardTitle>
            <CardDescription className="text-gray-600">
              Comparison across different wards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wardOccupancyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" domain={[0, 100]} />
                <YAxis dataKey="ward" type="category" stroke="#6b7280" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="#8b5cf6"
                  radius={[0, 8, 8, 0]}
                  name="Occupancy %"
                  label={{ position: 'right', fill: '#1f2937' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Occupancy Gauge */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Current Occupancy</CardTitle>
            <CardDescription className="text-gray-600">Real-time gauge</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-full h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                <path
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  stroke={radialData[0].fill}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${(occupancyRate / 100) * 251.2} 251.2`}
                  className="transition-all duration-700"
                />
              </svg>
            </div>
            <div className="text-center -mt-8">
              <div className="text-4xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-600 mt-1">Current Rate</p>
            </div>
          </CardContent>
        </Card>

        {/* Length of Stay Distribution */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Length of Stay Distribution</CardTitle>
            <CardDescription className="text-gray-600">
              Patient distribution by stay duration (Last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lengthOfStayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Patients">
                  {lengthOfStayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Panel */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700 uppercase">Positive Trend</span>
              </div>
              <p className="text-sm text-gray-700">
                Bed turnover time improved by <strong>15%</strong> this week
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-orange-700 uppercase">Alert</span>
              </div>
              <p className="text-sm text-gray-700">
                ICU occupancy at <strong>93%</strong> - consider capacity planning
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-blue-700 uppercase">Insight</span>
              </div>
              <p className="text-sm text-gray-700">
                Peak admission time: <strong>Weekdays 2-4 PM</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
