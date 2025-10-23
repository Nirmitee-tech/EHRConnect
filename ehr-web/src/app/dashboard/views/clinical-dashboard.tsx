'use client'

import {
  Users, Activity, Heart, Stethoscope, AlertCircle, TrendingUp,
  UserCheck, Clock, Calendar, Pill
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

const COLORS = {
  primary: '#2563EB', success: '#059669', warning: '#D97706', danger: '#DC2626',
  info: '#0891B2', purple: '#7C3AED',
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280' }
}

const patientsByCondition = [
  { condition: 'Hypertension', count: 842, color: COLORS.danger },
  { condition: 'Diabetes', count: 615, color: COLORS.warning },
  { condition: 'Asthma', count: 428, color: COLORS.info },
  { condition: 'CAD', count: 312, color: COLORS.purple },
  { condition: 'COPD', count: 245, color: COLORS.gray[400] },
]

const visitsByType = [
  { month: 'Jan', inPerson: 285, telehealth: 142, followUp: 198 },
  { month: 'Feb', inPerson: 312, telehealth: 168, followUp: 215 },
  { month: 'Mar', inPerson: 298, telehealth: 185, followUp: 189 },
  { month: 'Apr', inPerson: 335, telehealth: 175, followUp: 228 },
  { month: 'May', inPerson: 318, telehealth: 192, followUp: 205 },
  { month: 'Jun', inPerson: 342, telehealth: 208, followUp: 235 },
]

const careGaps = [
  { category: 'Diabetes HbA1c', overdue: 45, dueThisMonth: 28, color: COLORS.danger },
  { category: 'Annual Wellness', overdue: 82, dueThisMonth: 54, color: COLORS.warning },
  { category: 'Immunizations', overdue: 38, dueThisMonth: 65, color: COLORS.info },
  { category: 'Cancer Screening', overdue: 52, dueThisMonth: 41, color: COLORS.purple },
]

const providerProductivity = [
  { name: 'Dr. Smith', patients: 1245, visits: 342, rvu: 4580 },
  { name: 'Dr. Johnson', patients: 1180, visits: 318, rvu: 4240 },
  { name: 'Dr. Williams', patients: 985, visits: 285, rvu: 3890 },
  { name: 'Dr. Brown', patients: 842, visits: 258, rvu: 3520 },
  { name: 'Dr. Davis', patients: 725, visits: 215, rvu: 2980 },
]

interface ClinicalDashboardProps {
  filters?: {
    dateRange: string;
    location: string;
    department: string;
  };
}

export default function ClinicalDashboard({ filters }: ClinicalDashboardProps = {}) {
  return (
    <div className="space-y-4">
      {/* Clinical KPI Cards - Extended to 8 */}
      <div className="grid grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">3,847</div>
            <div className="text-xs opacity-90 mt-0.5">Active Patients</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Today</div>
            </div>
            <div className="text-2xl font-bold">42</div>
            <div className="text-xs opacity-90 mt-0.5">Scheduled Visits</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Stethoscope className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">MTD</div>
            </div>
            <div className="text-2xl font-bold">1,287</div>
            <div className="text-xs opacity-90 mt-0.5">Patient Encounters</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Urgent</div>
            </div>
            <div className="text-2xl font-bold">15</div>
            <div className="text-xs opacity-90 mt-0.5">Care Gaps</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-600 to-rose-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">High Risk</div>
            </div>
            <div className="text-2xl font-bold">128</div>
            <div className="text-xs opacity-90 mt-0.5">Chronic Patients</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">92.8%</div>
            <div className="text-xs opacity-90 mt-0.5">Satisfaction Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Pill className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Active</div>
            </div>
            <div className="text-2xl font-bold">2,145</div>
            <div className="text-xs opacity-90 mt-0.5">Prescriptions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">MTD</div>
            </div>
            <div className="text-2xl font-bold">87.5%</div>
            <div className="text-xs opacity-90 mt-0.5">Chart Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Distribution & Visit Trends */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-4 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Top Chronic Conditions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2.5">
              {patientsByCondition.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 font-medium">{item.condition}</span>
                    <span className="text-xs text-gray-900 font-semibold">{item.count} pts</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(item.count / patientsByCondition[0].count) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-8 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Visit Trends by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={visitsByType}>
                <defs>
                  <linearGradient id="colorInPerson" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTelehealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="inPerson" stackId="1" stroke={COLORS.primary} fill="url(#colorInPerson)" />
                <Area type="monotone" dataKey="telehealth" stackId="1" stroke={COLORS.success} fill="url(#colorTelehealth)" />
                <Area type="monotone" dataKey="followUp" stackId="1" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Care Gaps & Provider Productivity */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-5 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Care Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={careGaps} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Bar dataKey="overdue" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
                <Bar dataKey="dueThisMonth" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-7 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Provider Productivity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Provider</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Panel Size</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Monthly Visits</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">RVU Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {providerProductivity.map((provider, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-900 font-medium">{provider.name}</td>
                      <td className="py-2 px-3 text-center text-gray-700">{provider.patients.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center text-gray-700">{provider.visits}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {provider.rvu.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
