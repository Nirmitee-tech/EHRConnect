'use client'

import {
  DollarSign, FileText, Clock, TrendingUp, TrendingDown, XCircle,
  CheckCircle, AlertTriangle, CreditCard, Send, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

const COLORS = {
  primary: '#2563EB', success: '#059669', warning: '#D97706', danger: '#DC2626',
  info: '#0891B2', purple: '#7C3AED',
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280' }
}

const claimsStatus = [
  { name: 'Approved', value: 320, amount: 785000, color: COLORS.success },
  { name: 'Submitted', value: 145, amount: 342000, color: COLORS.info },
  { name: 'Pending', value: 89, amount: 198000, color: COLORS.warning },
  { name: 'Denied', value: 35, amount: 67000, color: COLORS.danger },
  { name: 'Under Review', value: 42, amount: 95000, color: COLORS.purple },
]

const arAgingData = [
  { range: '0-30', amount: 245000, claims: 145, pct: 42 },
  { range: '31-60', amount: 165000, claims: 98, pct: 28 },
  { range: '61-90', amount: 92000, claims: 54, pct: 16 },
  { range: '91-120', amount: 48000, claims: 32, pct: 8 },
  { range: '120+', amount: 35000, claims: 25, pct: 6 },
]

const denialReasons = [
  { reason: 'Missing Information', count: 45, amount: 28500, color: COLORS.danger },
  { reason: 'Authorization Required', count: 32, amount: 19800, color: COLORS.warning },
  { reason: 'Coding Error', count: 28, amount: 17200, color: COLORS.info },
  { reason: 'Duplicate Claim', count: 18, amount: 11400, color: COLORS.purple },
  { reason: 'Other', count: 15, amount: 9500, color: COLORS.gray[400] },
]

const collectionTrend = [
  { week: 'W1', collections: 142000, target: 135000, rate: 94.5 },
  { week: 'W2', collections: 156000, target: 145000, rate: 96.2 },
  { week: 'W3', collections: 138000, target: 140000, rate: 93.8 },
  { week: 'W4', collections: 168000, target: 150000, rate: 97.1 },
]

const payerPerformance = [
  { payer: 'Medicare', claims: 285, approved: 275, denied: 10, avgDays: 28, collectRate: 98.2 },
  { payer: 'Aetna', claims: 142, approved: 135, denied: 7, avgDays: 35, collectRate: 96.5 },
  { payer: 'UHC', claims: 198, approved: 185, denied: 13, avgDays: 42, collectRate: 94.8 },
  { payer: 'Humana', claims: 156, approved: 148, denied: 8, avgDays: 31, collectRate: 97.1 },
  { payer: 'BCBS', claims: 224, approved: 210, denied: 14, avgDays: 38, collectRate: 95.3 },
]

interface RCMDashboardProps {
  filters?: {
    dateRange: string;
    location: string;
    department: string;
  };
}

export default function RCMDashboard({ filters }: RCMDashboardProps = {}) {
  return (
    <div className="space-y-4">
      {/* RCM KPI Cards - Extended to 8 */}
      <div className="grid grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">MTD</div>
            </div>
            <div className="text-2xl font-bold">$1.49M</div>
            <div className="text-xs opacity-90 mt-0.5">Collections</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Target: 95%</div>
            </div>
            <div className="text-2xl font-bold">96.8%</div>
            <div className="text-xs opacity-90 mt-0.5">Clean Claim Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 opacity-90" />
              <TrendingDown className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">38.2</div>
            <div className="text-xs opacity-90 mt-0.5">Avg Days in A/R</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-600 to-rose-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">-0.3%</div>
            </div>
            <div className="text-2xl font-bold">3.2%</div>
            <div className="text-xs opacity-90 mt-0.5">Denial Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">631</div>
            <div className="text-xs opacity-90 mt-0.5">Claims Submitted</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">+2.4%</div>
            </div>
            <div className="text-2xl font-bold">97.5%</div>
            <div className="text-xs opacity-90 mt-0.5">Net Collection Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <RefreshCw className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Today</div>
            </div>
            <div className="text-2xl font-bold">42</div>
            <div className="text-xs opacity-90 mt-0.5">Resubmissions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Send className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Pending</div>
            </div>
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs opacity-90 mt-0.5">Ready to Bill</div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Status & Collection Trend */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-4 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Claims Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={claimsStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value">
                  {claimsStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
              {claimsStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-8 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900">Weekly Collection Performance</CardTitle>
              <span className="text-xs text-emerald-600 font-medium">Avg: 95.4%</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={collectionTrend}>
                <defs>
                  <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(value, name) => [name === 'rate' ? `${value}%` : `$${Number(value).toLocaleString()}`, name === 'rate' ? 'Rate' : name === 'target' ? 'Target' : 'Collections']}
                />
                <Area type="monotone" dataKey="collections" stroke={COLORS.success} strokeWidth={2} fill="url(#colorCollections)" />
                <Line type="monotone" dataKey="target" stroke={COLORS.warning} strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* A/R Aging & Denial Analysis */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-7 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900">Accounts Receivable Aging</CardTitle>
              <span className="text-xs text-gray-500">Total A/R: <span className="font-semibold text-gray-900">$585,000</span></span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={arAgingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  formatter={(value, name) => [name === 'pct' ? `${value}%` : name === 'claims' ? `${value} claims` : `$${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="amount" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-5 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Top Denial Reasons</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2.5">
              {denialReasons.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 font-medium">{item.reason}</span>
                      <span className="text-xs text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(item.count / denialReasons.reduce((sum, r) => sum + r.count, 0)) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">${(item.amount/1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payer Performance Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-gray-900">Payer Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Payer</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Total Claims</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Approved</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Denied</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Avg Days</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {payerPerformance.map((payer, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900 font-medium">{payer.payer}</td>
                    <td className="py-2 px-3 text-center text-gray-700">{payer.claims}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {payer.approved}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">
                        <XCircle className="h-3 w-3" />
                        {payer.denied}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-gray-700">{payer.avgDays} days</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${payer.collectRate}%` }}
                          />
                        </div>
                        <span className="text-gray-900 font-medium">{payer.collectRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
