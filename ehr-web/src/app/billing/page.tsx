'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, Clock,
  FileText, Users, Calendar, ArrowRight, Download, Filter,
  CheckCircle, XCircle, AlertTriangle, Building2, CreditCard,
  BarChart3, PieChart, Activity, RefreshCw, Eye, Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import billingService from '@/services/billing.service';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function BillingDashboard() {
  const { data: session } = useSession()
  const [dateRange, setDateRange] = useState('30d')
  const [location, setLocation] = useState('all')
  const [loading, setLoading] = useState(false)
  const [apiKpis, setApiKpis] = useState<any>(null)

  const userName = session?.user?.name?.split(' ')[0] || 'CFO'

  // Load real data from API
  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      let startDate = new Date();

      if (dateRange === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (dateRange === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const data = await billingService.getDashboardKPIs(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setApiKpis(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Financial Overview Data
  const financialOverview = {
    totalRevenue: apiKpis?.totalBilled || 4850000,
    revenueChange: 12.5,
    collections: apiKpis?.totalCollected || 4235000,
    collectionsChange: 8.3,
    outstandingAR: 1850000,
    arChange: -5.2,
    daysInAR: apiKpis?.avgPaymentLag || 38.2,
    daysChange: -2.1,
    netCollectionRate: apiKpis?.collectionRate || 97.5,
    rateChange: 1.2
  }

  // Critical Alerts
  const criticalAlerts = [
    {
      id: 1,
      type: 'critical',
      title: 'High-Value Claims at Risk',
      amount: 285000,
      count: 47,
      description: '47 claims worth $285K aging past 60 days',
      action: 'Review Now',
      dueDate: 'Today'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Denial Rate Increasing',
      amount: 125000,
      count: 89,
      description: '89 denials this week - 15% increase from last week',
      action: 'Analyze Trends',
      dueDate: 'This Week'
    },
    {
      id: 3,
      type: 'info',
      title: 'Ready to Bill Claims',
      amount: 345000,
      count: 156,
      description: '156 claims ready for submission ($345K)',
      action: 'Submit Now',
      dueDate: 'Today'
    }
  ]

  // Revenue Trend Data
  const revenueTrend = [
    { month: 'Jan', revenue: 4200, collections: 3800, target: 4500 },
    { month: 'Feb', revenue: 4350, collections: 3950, target: 4500 },
    { month: 'Mar', revenue: 4500, collections: 4100, target: 4500 },
    { month: 'Apr', revenue: 4650, collections: 4200, target: 4500 },
    { month: 'May', revenue: 4800, collections: 4350, target: 4500 },
    { month: 'Jun', revenue: 4850, collections: 4235, target: 4500 }
  ]

  // A/R Aging Distribution
  const arAgingData = [
    { name: '0-30 days', value: 950000, percentage: 51.4, color: '#10B981' },
    { name: '31-60 days', value: 480000, percentage: 25.9, color: '#3B82F6' },
    { name: '61-90 days', value: 250000, percentage: 13.5, color: '#F59E0B' },
    { name: '90+ days', value: 170000, percentage: 9.2, color: '#EF4444' }
  ]

  // Payer Mix
  const payerMixData = [
    { name: 'Medicare', value: 35, amount: 1697500, color: '#3B82F6' },
    { name: 'Medicaid', value: 20, amount: 970000, color: '#8B5CF6' },
    { name: 'Commercial', value: 35, amount: 1697500, color: '#10B981' },
    { name: 'Self-Pay', value: 10, amount: 485000, color: '#F59E0B' }
  ]

  // Top Payers by Performance
  const topPayers = [
    { name: 'UnitedHealthcare', claims: 245, approved: 228, denied: 12, pending: 5, avgDays: 28, amount: 875000, rate: 93.1 },
    { name: 'Anthem BCBS', claims: 198, approved: 185, denied: 8, pending: 5, avgDays: 32, amount: 695000, rate: 93.4 },
    { name: 'Aetna', claims: 167, approved: 155, denied: 7, pending: 5, avgDays: 30, amount: 582000, rate: 92.8 },
    { name: 'Cigna', claims: 142, approved: 132, denied: 6, pending: 4, avgDays: 29, amount: 498000, rate: 93.0 },
    { name: 'Humana', claims: 128, approved: 118, denied: 7, pending: 3, avgDays: 35, amount: 445000, rate: 92.2 }
  ]

  // Denial Reasons
  const denialReasons = [
    { reason: 'Missing Information', count: 28, amount: 42000, trend: 'up' },
    { reason: 'Authorization Required', count: 22, amount: 35000, trend: 'up' },
    { reason: 'Coding Error', count: 18, amount: 28000, trend: 'down' },
    { reason: 'Timely Filing', count: 12, amount: 15000, trend: 'stable' },
    { reason: 'Duplicate Claim', count: 9, amount: 5000, trend: 'down' }
  ]

  // Priority Actions
  const priorityActions = [
    {
      id: 1,
      priority: 'high',
      category: 'Collections',
      title: 'Follow up on 47 high-value aging claims',
      count: 47,
      amount: 285000,
      impact: 'Critical',
      eta: '4 hours',
      assignedTo: 'Collections Team'
    },
    {
      id: 2,
      priority: 'high',
      category: 'Denials',
      title: 'Review and appeal 28 denials for missing info',
      count: 28,
      amount: 42000,
      impact: 'High',
      eta: '2 hours',
      assignedTo: 'Denial Management'
    },
    {
      id: 3,
      priority: 'medium',
      category: 'Billing',
      title: 'Submit 156 ready-to-bill claims',
      count: 156,
      amount: 345000,
      impact: 'High',
      eta: '1 hour',
      assignedTo: 'Billing Team'
    },
    {
      id: 4,
      priority: 'medium',
      category: 'Authorization',
      title: 'Process 22 authorization requests',
      count: 22,
      amount: 35000,
      impact: 'Medium',
      eta: '3 hours',
      assignedTo: 'Auth Team'
    }
  ]

  // KPI Cards Data
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${(financialOverview.totalRevenue / 1000000).toFixed(2)}M`,
      change: financialOverview.revenueChange,
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      subtitle: 'Current Month',
      detail: 'vs last month'
    },
    {
      title: 'Collections',
      value: `$${(financialOverview.collections / 1000000).toFixed(2)}M`,
      change: financialOverview.collectionsChange,
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-700',
      subtitle: 'Current Month',
      detail: 'vs last month'
    },
    {
      title: 'Outstanding A/R',
      value: `$${(financialOverview.outstandingAR / 1000000).toFixed(2)}M`,
      change: financialOverview.arChange,
      trend: 'down',
      icon: Clock,
      color: 'from-amber-600 to-amber-700',
      subtitle: 'Total Receivables',
      detail: 'vs last month'
    },
    {
      title: 'Days in A/R',
      value: financialOverview.daysInAR.toFixed(1),
      change: financialOverview.daysChange,
      trend: 'down',
      icon: Calendar,
      color: 'from-purple-600 to-purple-700',
      subtitle: 'Average Days',
      detail: 'vs last month'
    },
    {
      title: 'Net Collection Rate',
      value: `${financialOverview.netCollectionRate}%`,
      change: financialOverview.rateChange,
      trend: 'up',
      icon: Target,
      color: 'from-indigo-600 to-indigo-700',
      subtitle: 'Collection Efficiency',
      detail: 'Target: 95%'
    }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading && !apiKpis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      {/* Sticky Header with Sidebar Color */}
      <div className="sticky top-0 z-50 bg-[#0F1E56] text-white shadow-lg">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">
                Billing & Revenue Dashboard
              </h1>
              <p className="text-xs text-blue-200 mt-0.5">
                Executive Financial Overview
              </p>
            </div>

            <div className="flex items-center gap-6">
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
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-300" />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="main">Main Campus</SelectItem>
                      <SelectItem value="north">North Clinic</SelectItem>
                      <SelectItem value="south">South Clinic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-right border-l border-white/20 pl-6">
                <div className="text-xs text-blue-200 uppercase tracking-wider">System Status</div>
                <div className="flex items-center gap-1.5 text-white text-xs font-medium mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  All Systems Operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 space-y-4">

        {/* Critical Alerts */}
        <div className="grid grid-cols-3 gap-3">
          {criticalAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 shadow-sm ${
                alert.type === 'critical'
                  ? 'border-l-red-500 bg-red-50 border border-red-200'
                  : alert.type === 'warning'
                  ? 'border-l-amber-500 bg-amber-50 border border-amber-200'
                  : 'border-l-blue-500 bg-blue-50 border border-blue-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  {alert.type === 'critical' ? (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-1 ${
                      alert.type === 'critical'
                        ? 'text-red-900'
                        : alert.type === 'warning'
                        ? 'text-amber-900'
                        : 'text-blue-900'
                    }`}>
                      {alert.title}
                    </h3>
                    <p className={`text-xs ${
                      alert.type === 'critical'
                        ? 'text-red-700'
                        : alert.type === 'warning'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(alert.amount)}
                  </div>
                  <Button
                    size="sm"
                    className={
                      alert.type === 'critical'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : alert.type === 'warning'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  >
                    {alert.action} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-3">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <Card key={index} className={`bg-gradient-to-br ${kpi.color} border-0 shadow-md hover:shadow-lg transition-all cursor-pointer`}>
                <CardContent className="p-3 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-5 w-5 opacity-90" />
                    <div className={`flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs opacity-90 mt-0.5">{kpi.subtitle}</div>
                  <div className="text-xs opacity-75 mt-1">{kpi.detail}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Revenue & Collections Trend */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Revenue & Collections Trend</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">6-month performance overview</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value * 1000)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (K)"
                />
                <Area
                  type="monotone"
                  dataKey="collections"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCollections)"
                  name="Collections (K)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target (K)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* A/R Aging & Payer Mix */}
        <div className="grid grid-cols-2 gap-3">
          {/* A/R Aging */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">A/R Aging Distribution</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Total: {formatCurrency(financialOverview.outstandingAR)}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {arAgingData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-12 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payer Mix */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">Revenue by Payer Mix</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Current distribution</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payerMixData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-12 text-right">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900">Priority Actions - Billing Team</CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2">
              {priorityActions.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                    action.priority === 'high'
                      ? 'bg-red-50 border-l-red-500 border border-red-200'
                      : 'bg-amber-50 border-l-amber-500 border border-amber-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{action.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        action.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {action.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="font-semibold text-gray-900">{formatCurrency(action.amount)}</span>
                      <span>•</span>
                      <span>{action.count} items</span>
                      <span>•</span>
                      <span>Due: {action.eta}</span>
                    </div>
                  </div>
                  <Button size="sm" className={
                    action.priority === 'high'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }>
                    Action <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Payers Performance */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Top Payers Performance</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Approval rates and payment turnaround</p>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payer</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Claims</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Approved</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Denied</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Pending</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Days</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topPayers.map((payer, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{payer.name}</div>
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-900 font-medium">
                        {payer.claims}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {payer.approved}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {payer.denied}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {payer.pending}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-600">
                        {payer.avgDays} days
                      </td>
                      <td className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payer.amount)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                          payer.rate >= 93
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {payer.rate}%
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Denial Reasons */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Top Denial Reasons</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Focus areas for process improvement</p>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {denialReasons.map((denial, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{denial.reason}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          denial.trend === 'up'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : denial.trend === 'down'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {denial.trend === 'up' && '↑ Increasing'}
                        {denial.trend === 'down' && '↓ Decreasing'}
                        {denial.trend === 'stable' && '→ Stable'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{denial.count} claims</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(denial.amount)}</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Address Issues
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Quick Actions</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Access key billing functions</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => window.location.href = '/billing/claims'}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium text-gray-900">Claims</span>
              </button>

              <button
                onClick={() => window.location.href = '/billing/eligibility'}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium text-gray-900">Eligibility</span>
              </button>

              <button
                onClick={() => window.location.href = '/billing/prior-auth/new'}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <span className="font-medium text-gray-900">Prior Auth</span>
              </button>

              <button
                onClick={() => window.location.href = '/billing/remittance'}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
              >
                <CreditCard className="h-8 w-8 text-amber-600 mb-2" />
                <span className="font-medium text-gray-900">Payments</span>
              </button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
