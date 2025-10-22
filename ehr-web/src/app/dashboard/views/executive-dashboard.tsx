'use client'

import {
  Users, FileText, DollarSign, TrendingUp, Clock, CheckCircle,
  XCircle, AlertTriangle, Bell, Activity, CreditCard, Building2,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart
} from 'recharts'

const COLORS = {
  primary: '#2563EB',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0891B2',
  purple: '#7C3AED',
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280' }
}

const revenueData = [
  { month: 'Jan', revenue: 450000, target: 420000, expenses: 280000 },
  { month: 'Feb', revenue: 520000, target: 450000, expenses: 295000 },
  { month: 'Mar', revenue: 480000, target: 480000, expenses: 302000 },
  { month: 'Apr', revenue: 610000, target: 500000, expenses: 315000 },
  { month: 'May', revenue: 550000, target: 520000, expenses: 298000 },
  { month: 'Jun', revenue: 670000, target: 550000, expenses: 325000 },
]

const payerMix = [
  { name: 'Medicare', value: 35, amount: 945000, color: COLORS.primary },
  { name: 'Medicaid', value: 25, amount: 675000, color: COLORS.purple },
  { name: 'Commercial', value: 30, amount: 810000, color: COLORS.info },
  { name: 'Self-Pay', value: 10, amount: 270000, color: COLORS.gray[400] },
]

const departmentRevenue = [
  { dept: 'Cardiology', revenue: 850000, visits: 1245, avg: 682 },
  { dept: 'Orthopedics', revenue: 720000, visits: 985, avg: 731 },
  { dept: 'Primary Care', revenue: 540000, visits: 2150, avg: 251 },
  { dept: 'Pediatrics', revenue: 420000, visits: 1680, avg: 250 },
  { dept: 'Neurology', revenue: 380000, visits: 540, avg: 704 },
]

const cashFlowData = [
  { week: 'Week 1', inflow: 165000, outflow: 98000 },
  { week: 'Week 2', inflow: 178000, outflow: 105000 },
  { week: 'Week 3', inflow: 155000, outflow: 92000 },
  { week: 'Week 4', inflow: 192000, outflow: 110000 },
]

export default function ExecutiveDashboard() {
  return (
    <div className="space-y-4">
      {/* KPI Cards with Theme Colors - Extended to 8 */}
      <div className="grid grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 opacity-90" />
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                <ArrowUpRight className="h-3 w-3" />
                18.5%
              </div>
            </div>
            <div className="text-2xl font-bold">$2.7M</div>
            <div className="text-xs opacity-90 mt-0.5">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 opacity-90" />
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                <ArrowUpRight className="h-3 w-3" />
                12.3%
              </div>
            </div>
            <div className="text-2xl font-bold">$945K</div>
            <div className="text-xs opacity-90 mt-0.5">Net Income</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 opacity-90" />
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                <ArrowUpRight className="h-3 w-3" />
                8.1%
              </div>
            </div>
            <div className="text-2xl font-bold">3,847</div>
            <div className="text-xs opacity-90 mt-0.5">Active Patients</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 opacity-90" />
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                <ArrowDownRight className="h-3 w-3" />
                3.2d
              </div>
            </div>
            <div className="text-2xl font-bold">38</div>
            <div className="text-xs opacity-90 mt-0.5">Days in A/R</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                Excellent
              </div>
            </div>
            <div className="text-2xl font-bold">96.5%</div>
            <div className="text-xs opacity-90 mt-0.5">Collection Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-600 to-rose-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 opacity-90" />
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                <ArrowUpRight className="h-3 w-3" />
                14%
              </div>
            </div>
            <div className="text-2xl font-bold">589</div>
            <div className="text-xs opacity-90 mt-0.5">Active Claims</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                MTD
              </div>
            </div>
            <div className="text-2xl font-bold">35.2%</div>
            <div className="text-xs opacity-90 mt-0.5">Profit Margin</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-5 w-5 opacity-90" />
              <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
                <ArrowUpRight className="h-3 w-3" />
                5.7%
              </div>
            </div>
            <div className="text-2xl font-bold">$1.8M</div>
            <div className="text-xs opacity-90 mt-0.5">Cash on Hand</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Performance */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-7 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900">Revenue vs Target</CardTitle>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Above Target
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={2} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="target" stroke={COLORS.warning} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Bar dataKey="expenses" fill={COLORS.gray[300]} radius={[4, 4, 0, 0]} opacity={0.6} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-5 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Payer Mix Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={payerMix} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                  {payerMix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(value, name, props) => [`${value}% ($${(props.payload.amount/1000).toFixed(0)}K)`, props.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
              {payerMix.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs text-gray-900 font-medium">${(item.amount/1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance & Cash Flow */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-7 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Department Revenue Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departmentRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-5 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Weekly Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="inflow" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Alerts */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            Executive Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 rounded border border-emerald-200 bg-emerald-50/50">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Revenue Target Exceeded</p>
                <p className="text-xs text-gray-600 mt-0.5">Q2 revenue surpassed target by $145,000 (18.5%)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded border border-blue-200 bg-blue-50/50">
              <Activity className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Patient Volume Growing</p>
                <p className="text-xs text-gray-600 mt-0.5">New patient registrations up 12.3% this quarter</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded border border-amber-200 bg-amber-50/50">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Operating Costs Rising</p>
                <p className="text-xs text-gray-600 mt-0.5">Expenses increased 4.8% vs last quarter - review needed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
