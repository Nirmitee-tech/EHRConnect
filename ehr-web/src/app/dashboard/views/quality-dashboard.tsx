'use client'

import {
  Shield, TrendingUp, Award, CheckCircle, AlertTriangle, Star,
  FileCheck, Users, Activity, Target, BarChart3, TrendingDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Scatter,
  ScatterChart, ZAxis
} from 'recharts'

const COLORS = {
  primary: '#2563EB', success: '#059669', warning: '#D97706', danger: '#DC2626',
  info: '#0891B2', purple: '#7C3AED',
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280' }
}

const hedisMetrics = [
  { measure: 'Diabetes HbA1c Control', target: 85, achieved: 89, lastMonth: 87, trend: 'up', patients: 842 },
  { measure: 'Breast Cancer Screening', target: 75, achieved: 82, lastMonth: 80, trend: 'up', patients: 615 },
  { measure: 'Colorectal Screening', target: 70, achieved: 68, lastMonth: 71, trend: 'down', patients: 428 },
  { measure: 'Blood Pressure Control', target: 80, achieved: 84, lastMonth: 82, trend: 'up', patients: 1245 },
  { measure: 'Immunization Status', target: 90, achieved: 92, lastMonth: 91, trend: 'up', patients: 3847 },
  { measure: 'Depression Screening', target: 75, achieved: 78, lastMonth: 76, trend: 'up', patients: 985 },
]

const qualityScoresTrend = [
  { month: 'Jan', overall: 82, clinical: 85, safety: 88, patient: 79, cost: 80 },
  { month: 'Feb', overall: 84, clinical: 86, safety: 89, patient: 81, cost: 82 },
  { month: 'Mar', overall: 83, clinical: 87, safety: 87, patient: 80, cost: 81 },
  { month: 'Apr', overall: 86, clinical: 88, safety: 90, patient: 83, cost: 84 },
  { month: 'May', overall: 87, clinical: 89, safety: 91, patient: 84, cost: 85 },
  { month: 'Jun', overall: 89, clinical: 91, safety: 92, patient: 86, cost: 87 },
]

const safetyMetrics = [
  { category: 'Medication Safety', score: 92, fullMark: 100, incidents: 2 },
  { category: 'Fall Prevention', score: 88, fullMark: 100, incidents: 5 },
  { category: 'Infection Control', score: 95, fullMark: 100, incidents: 1 },
  { category: 'Documentation', score: 91, fullMark: 100, incidents: 8 },
  { category: 'Patient ID', score: 97, fullMark: 100, incidents: 0 },
  { category: 'Hand Hygiene', score: 89, fullMark: 100, incidents: 12 },
]

const patientSatisfaction = [
  { aspect: 'Provider Communication', score: 4.8, responses: 1245, benchmark: 4.5 },
  { aspect: 'Wait Time', score: 4.2, responses: 1189, benchmark: 4.0 },
  { aspect: 'Staff Courtesy', score: 4.7, responses: 1312, benchmark: 4.6 },
  { aspect: 'Facility Cleanliness', score: 4.9, responses: 1298, benchmark: 4.7 },
  { aspect: 'Appointment Scheduling', score: 4.5, responses: 1156, benchmark: 4.3 },
  { aspect: 'Billing Experience', score: 4.1, responses: 982, benchmark: 3.9 },
]

const outcomeMetrics = [
  { measure: '30-Day Readmission', value: 12.3, target: 15, trend: 'down', better: 'lower' },
  { measure: 'Hospital Acquired Infections', value: 1.8, target: 2.5, trend: 'down', better: 'lower' },
  { measure: 'Medication Reconciliation', value: 94.5, target: 90, trend: 'up', better: 'higher' },
  { measure: 'Preventable ER Visits', value: 8.2, target: 10, trend: 'down', better: 'lower' },
  { measure: 'Care Plan Adherence', value: 87.3, target: 85, trend: 'up', better: 'higher' },
  { measure: 'Discharge Instructions', value: 96.8, target: 95, trend: 'up', better: 'higher' },
]

const complianceScorecard = [
  { area: 'Medicare Star Ratings', score: 4.5, max: 5, status: 'Excellent' },
  { area: 'MIPS Performance', score: 92, max: 100, status: 'High' },
  { area: 'Joint Commission', score: 98, max: 100, status: 'Accredited' },
  { area: 'NCQA Recognition', score: 88, max: 100, status: 'Level 3' },
]

interface DashboardProps {
  filters?: {
    dateRange: string
    location: string
    department: string
  }
}

export default function QualityDashboard({ filters }: DashboardProps) {
  return (
    <div className="space-y-4">
      {/* Extended KPI Cards - 8 metrics */}
      <div className="grid grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs opacity-90 mt-0.5">Quality Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">+5%</div>
            </div>
            <div className="text-2xl font-bold">87%</div>
            <div className="text-xs opacity-90 mt-0.5">HEDIS Compliance</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Excellent</div>
            </div>
            <div className="text-2xl font-bold">92</div>
            <div className="text-xs opacity-90 mt-0.5">Safety Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">4.5+</div>
            </div>
            <div className="text-2xl font-bold">4.6</div>
            <div className="text-xs opacity-90 mt-0.5">Patient Rating</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="h-5 w-5 opacity-90" />
              <TrendingUp className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">98%</div>
            <div className="text-xs opacity-90 mt-0.5">Chart Completion</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-600 to-rose-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 opacity-90" />
              <TrendingDown className="h-4 w-4 bg-white/20 rounded p-0.5" />
            </div>
            <div className="text-2xl font-bold">12.3%</div>
            <div className="text-xs opacity-90 mt-0.5">Readmission Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">Level 3</div>
            </div>
            <div className="text-2xl font-bold">88</div>
            <div className="text-xs opacity-90 mt-0.5">NCQA Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-600 to-pink-700 border-0 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 opacity-90" />
              <div className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">4.5★</div>
            </div>
            <div className="text-2xl font-bold">92</div>
            <div className="text-xs opacity-90 mt-0.5">MIPS Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends & Safety Radar & Compliance */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Quality Score Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={qualityScoresTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="overall" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4 }} name="Overall" />
                <Line type="monotone" dataKey="clinical" stroke={COLORS.success} strokeWidth={2} dot={{ r: 3 }} name="Clinical" />
                <Line type="monotone" dataKey="safety" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 3 }} name="Safety" />
                <Line type="monotone" dataKey="patient" stroke={COLORS.info} strokeWidth={2} dot={{ r: 3 }} name="Patient" />
                <Line type="monotone" dataKey="cost" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 3 }} name="Cost" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Safety Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={safetyMetrics}>
                <PolarGrid stroke={COLORS.gray[200]} />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: COLORS.gray[500] }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: COLORS.gray[500] }} />
                <Radar name="Score" dataKey="score" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Compliance Scorecard</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {complianceScorecard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-gray-50">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-700">{item.area}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-10 text-right">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HEDIS Measures & Outcome Metrics */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-7 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">HEDIS Quality Measures Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2.5">
              {hedisMetrics.map((metric, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 font-medium">{metric.measure}</span>
                      <span className="text-xs text-gray-500">({metric.patients} pts)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Target: {metric.target}%</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${metric.achieved >= metric.target ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {metric.achieved}%
                        </span>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                        )}
                        <span className="text-xs text-gray-500">({metric.lastMonth}%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${metric.achieved >= metric.target ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${metric.achieved}%` }}
                    />
                    <div
                      className="absolute top-0 w-0.5 h-2 bg-gray-400"
                      style={{ left: `${metric.target}%` }}
                      title={`Target: ${metric.target}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-5 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Clinical Outcome Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2">
              {outcomeMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-700">{metric.measure}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-gray-500">Target: {metric.target}{metric.better === 'lower' ? ' or below' : '+'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {metric.trend === 'down' ? (
                      <TrendingDown className={`h-3.5 w-3.5 ${metric.better === 'lower' ? 'text-emerald-600' : 'text-red-600'}`} />
                    ) : (
                      <TrendingUp className={`h-3.5 w-3.5 ${metric.better === 'higher' ? 'text-emerald-600' : 'text-red-600'}`} />
                    )}
                    <span className={`text-sm font-bold ${(metric.better === 'lower' && metric.value <= metric.target) ||
                        (metric.better === 'higher' && metric.value >= metric.target)
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                      }`}>
                      {metric.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Satisfaction & Quality Alerts */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900">Patient Satisfaction Scores</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={patientSatisfaction} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} />
                <YAxis dataKey="aspect" type="category" tick={{ fontSize: 10, fill: COLORS.gray[500] }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: `1px solid ${COLORS.gray[200]}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Bar dataKey="score" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                <Line type="monotone" dataKey="benchmark" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-6 border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              Quality Improvement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded border border-amber-200 bg-amber-50/50">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Colorectal Screening Below Target</p>
                  <p className="text-xs text-gray-600 mt-0.5">68% vs 70% target - need 12 more completions this month</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">428 eligible patients</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">-2% from last month</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded border border-emerald-200 bg-emerald-50/50">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">High HEDIS Performance</p>
                  <p className="text-xs text-gray-600 mt-0.5">5 of 6 measures exceeding benchmarks - overall +5% improvement</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">87% compliance rate</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Top quartile performance</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded border border-primary/20 bg-primary/5">
                <Star className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Patient Satisfaction Trending Up</p>
                  <p className="text-xs text-gray-600 mt-0.5">Average rating increased from 4.4 to 4.6 - all categories improved</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">1,245 responses</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">+0.2 improvement</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
