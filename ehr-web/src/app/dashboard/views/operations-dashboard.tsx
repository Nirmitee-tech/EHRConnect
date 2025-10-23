'use client'

import {
  Clock, Users, Calendar, TrendingUp, AlertCircle, CheckCircle,
  UserX, Phone, MessageSquare, Clipboard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = {
  primary: '#2563EB', success: '#059669', warning: '#D97706', danger: '#DC2626',
  info: '#0891B2', purple: '#7C3AED',
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280' }
}

const appointmentMetrics = [
  { status: 'Completed', count: 342, color: COLORS.success },
  { status: 'Scheduled', count: 189, color: COLORS.info },
  { status: 'No-Show', count: 28, color: COLORS.danger },
  { status: 'Cancelled', count: 45, color: COLORS.warning },
]

const waitTimeData = [
  { day: 'Mon', avgWait: 18, targetWait: 15 },
  { day: 'Tue', avgWait: 22, targetWait: 15 },
  { day: 'Wed', avgWait: 15, targetWait: 15 },
  { day: 'Thu', avgWait: 20, targetWait: 15 },
  { day: 'Fri', avgWait: 25, targetWait: 15 },
]

const staffUtilization = [
  { role: 'Physicians', scheduled: 40, available: 8, utilized: 90 },
  { role: 'Nurses', scheduled: 25, available: 3, utilized: 88 },
  { role: 'Front Desk', scheduled: 12, available: 2, utilized: 83 },
  { role: 'MA', scheduled: 18, available: 2, utilized: 89 },
]

const patientFlowData = [
  { hour: '8 AM', checkIn: 12, inExam: 8, checkout: 10 },
  { hour: '9 AM', checkIn: 18, inExam: 14, checkout: 15 },
  { hour: '10 AM', checkIn: 15, inExam: 16, checkout: 12 },
  { hour: '11 AM', checkIn: 22, inExam: 18, checkout: 20 },
  { hour: '12 PM', checkIn: 8, inExam: 12, checkout: 18 },
  { hour: '1 PM', checkIn: 14, inExam: 10, checkout: 12 },
  { hour: '2 PM', checkIn: 20, inExam: 16, checkout: 14 },
  { hour: '3 PM', checkIn: 18, inExam: 15, checkout: 19 },
]

interface OperationsDashboardProps {
  filters?: {
    dateRange: string;
    location: string;
    department: string;
  };
}

export default function OperationsDashboard({ filters }: OperationsDashboardProps = {}) {
  return (
    <div className="space-y-4">
      {/* Operations KPI Cards - Extended to 8 */}
      <div className="grid grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Today</div>
            </div>
            <div className="text-2xl font-bold">78</div>
            <div className="text-xs opacity-90 mt-0.5">Scheduled Appts</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="text-xs opacity-90 mt-0.5">Show Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Avg</div>
            </div>
            <div className="text-2xl font-bold">19m</div>
            <div className="text-xs opacity-90 mt-0.5">Wait Time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-600 to-rose-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <UserX className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">MTD</div>
            </div>
            <div className="text-2xl font-bold">5.8%</div>
            <div className="text-xs opacity-90 mt-0.5">No-Show Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">88.5%</div>
            <div className="text-xs opacity-90 mt-0.5">Staff Utilization</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Avg</div>
            </div>
            <div className="text-2xl font-bold">2.8m</div>
            <div className="text-xs opacity-90 mt-0.5">Call Answer Time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clipboard className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">15.2m</div>
            <div className="text-xs opacity-90 mt-0.5">Avg Visit Duration</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Today</div>
            </div>
            <div className="text-2xl font-bold">156</div>
            <div className="text-xs opacity-90 mt-0.5">Patient Messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Status & Wait Times */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-4 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Appointment Status Today</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={appointmentMetrics} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="count">
                  {appointmentMetrics.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
              {appointmentMetrics.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.status}</span>
                  </div>
                  <span className="text-gray-900 font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-8 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900">Average Wait Time Trends</CardTitle>
              <span className="text-xs text-amber-600 font-medium">Target: 15 min</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={waitTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: COLORS.gray[500] } }} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="avgWait" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="targetWait" stroke={COLORS.danger} strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Patient Flow & Staff Utilization */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-7 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Real-Time Patient Flow</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={patientFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Bar dataKey="checkIn" fill={COLORS.info} radius={[4, 4, 0, 0]} />
                <Bar dataKey="inExam" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkout" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-5 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Staff Utilization</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {staffUtilization.map((staff, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 font-medium">{staff.role}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">{staff.scheduled - staff.available}/{staff.scheduled}</span>
                      <span className="text-xs text-gray-900 font-semibold">{staff.utilized}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${staff.utilized}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Alerts */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            Operational Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 rounded border border-amber-200 bg-amber-50/50">
              <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Long Wait Times Detected</p>
                <p className="text-xs text-gray-600 mt-0.5">3 patients waiting over 30 minutes in Exam Room 2</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded border border-blue-200 bg-blue-50/50">
              <Users className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">High Capacity Alert</p>
                <p className="text-xs text-gray-600 mt-0.5">Operating at 95% capacity - consider overflow protocols</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded border border-emerald-200 bg-emerald-50/50">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Efficient Morning Flow</p>
                <p className="text-xs text-gray-600 mt-0.5">8-11 AM patient throughput exceeded targets by 12%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
