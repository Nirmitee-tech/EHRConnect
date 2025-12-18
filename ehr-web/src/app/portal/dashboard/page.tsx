'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Activity,
  AlertCircle,
  ChevronRight,
  Plus,
  Video,
  Pill,
  Shield,
  Heart,
  TrendingUp,
  Droplets,
  Thermometer,
  Wind,
  Brain,
  Moon,
  Footprints,
  Sparkles,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface DashboardData {
  upcomingAppointments: any[]
  recentEncounters: any[]
  medications: any[]
  allergies: any[]
  conditions: any[]
  vitalSigns: any[]
  unreadMessages: number
  pendingDocuments: number
}

export default function PatientDashboardV2() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patient/dashboard')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentStatus = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      booked: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', text: 'Confirmed' },
      pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', text: 'Pending' },
      arrived: { color: 'bg-green-100 text-green-700 border-green-200', text: 'Arrived' },
      fulfilled: { color: 'bg-gray-100 text-gray-700 border-gray-200', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700 border-red-200', text: 'Cancelled' },
    }

    return statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', text: status }
  }

  const getTimeUntilAppointment = (start: string) => {
    const now = new Date()
    const appointmentDate = new Date(start)
    const diff = appointmentDate.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'soon'
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const nextAppointment = dashboardData?.upcomingAppointments?.[0]
  const hasActiveConditions = (dashboardData?.conditions?.length || 0) > 0
  const hasAllergies = (dashboardData?.allergies?.length || 0) > 0

  // Get latest vitals for wellness cards
  const getLatestVital = (code: string) => {
    return dashboardData?.vitalSigns?.find((v: any) =>
      v.code?.coding?.[0]?.code === code || v.code?.text?.toLowerCase().includes(code.toLowerCase())
    )
  }

  const bloodPressure = getLatestVital('blood-pressure') || getLatestVital('85354-9')
  const heartRate = getLatestVital('heart-rate') || getLatestVital('8867-4')
  const temperature = getLatestVital('temperature') || getLatestVital('8310-5')
  const oxygenSat = getLatestVital('oxygen') || getLatestVital('2708-6')

  return (
    <div className="space-y-4">
      {/* Welcome Section - Navy Theme #1B2156 */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-lg" style={{ backgroundColor: '#1B2156' }}>
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold mb-0.5">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
            </h1>
            <p className="text-lg sm:text-xl font-bold text-white">
              {session?.user?.name?.split(' ')[0] || 'Patient'}! 👋
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Wellness Tracker Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            Wellness Tracker
          </h2>
          <Link href="/portal/health-records/vitals" className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: '#1B2156' }}>
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Heart Rate */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <p className="text-[11px] text-gray-600 font-semibold mb-0.5">Heart Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {heartRate?.valueQuantity?.value || '72'}
                <span className="text-[11px] text-gray-500 ml-0.5 font-medium">bpm</span>
              </p>
              <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full" />
                Normal
              </p>
            </CardContent>
          </Card>

          {/* Blood Pressure */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #1B2156, #2C3E8C)' }}>
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <p className="text-[11px] text-gray-600 font-semibold mb-0.5">Blood Pressure</p>
              <p className="text-xl font-bold text-gray-900">
                {bloodPressure?.component?.[0]?.valueQuantity?.value || '120'}
                <span className="text-sm text-gray-500">/</span>
                {bloodPressure?.component?.[1]?.valueQuantity?.value || '80'}
              </p>
              <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full" />
                Normal
              </p>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <p className="text-[11px] text-gray-600 font-semibold mb-0.5">Temperature</p>
              <p className="text-xl font-bold text-gray-900">
                {temperature?.valueQuantity?.value || '98.6'}
                <span className="text-[11px] text-gray-500 ml-0.5 font-medium">°F</span>
              </p>
              <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full" />
                Normal
              </p>
            </CardContent>
          </Card>

          {/* Oxygen Saturation */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <p className="text-[11px] text-gray-600 font-semibold mb-0.5">Oxygen Sat</p>
              <p className="text-xl font-bold text-gray-900">
                {oxygenSat?.valueQuantity?.value || '98'}
                <span className="text-[11px] text-gray-500 ml-0.5 font-medium">%</span>
              </p>
              <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full" />
                Normal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions - Compact */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/portal/appointments/book">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#1B2156' }}>
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Book Visit</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portal/messages/compose">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Message</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portal/health-records">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Records</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portal/billing">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Billing</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Next Appointment Highlight */}
      {nextAppointment && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Upcoming Appointment</CardTitle>
                  <CardDescription className="text-xs">
                    {getTimeUntilAppointment(nextAppointment.start)}
                  </CardDescription>
                </div>
              </div>
              <Badge className={`${getAppointmentStatus(nextAppointment.status).color} border`}>
                {getAppointmentStatus(nextAppointment.status).text}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <p className="font-semibold text-gray-900 mb-1">
                {nextAppointment.participant?.find((p: any) => p.actor?.reference?.includes('Practitioner'))?.actor?.display || 'Healthcare Provider'}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {nextAppointment.serviceType?.[0]?.text || 'General Visit'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium">{format(new Date(nextAppointment.start), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium">{format(new Date(nextAppointment.start), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="default" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30" asChild>
                <Link href={`/portal/appointments/${nextAppointment.id}`}>
                  View Details
                </Link>
              </Button>
              {nextAppointment.appointmentType?.text === 'virtual' && (
                <Button variant="outline" className="flex-1 border-cyan-600 text-cyan-600 hover:bg-cyan-50" asChild>
                  <Link href={`/portal/appointments/${nextAppointment.id}/join`}>
                    <Video className="w-4 h-4 mr-2" />
                    Join
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Alerts - Compact */}
      {(hasActiveConditions || hasAllergies) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {hasAllergies && (
            <Alert className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30 flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm mb-1">Active Allergies</h3>
                  <AlertDescription className="text-xs text-amber-800">
                    {dashboardData?.allergies?.length} documented.{' '}
                    <Link href="/portal/health-records/allergies" className="underline font-semibold">
                      View
                    </Link>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {hasActiveConditions && (
            <Alert className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-sm mb-1">Active Conditions</h3>
                  <AlertDescription className="text-xs text-blue-800">
                    {dashboardData?.conditions?.length} being monitored.{' '}
                    <Link href="/portal/health-records/conditions" className="underline font-semibold">
                      View
                    </Link>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </div>
      )}

      {/* Medications & Messages - Compact Side by Side */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Current Medications */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                Medications
              </CardTitle>
              <Link href="/portal/health-records/medications" className="text-xs text-purple-600 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData?.medications && dashboardData.medications.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.medications.slice(0, 3).map((med: any, idx: number) => (
                  <div
                    key={med.id || idx}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/30">
                      <Pill className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {med.medicationCodeableConcept?.text || med.medicationReference?.display || 'Medication'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {med.dosageInstruction?.[0]?.text || 'As directed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active medications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages & Health Summary */}
        <div className="space-y-3">
          {/* Messages */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                  Messages
                  {dashboardData && dashboardData.unreadMessages > 0 && (
                    <Badge variant="destructive" className="ml-1">{dashboardData.unreadMessages}</Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50" asChild>
                <Link href="/portal/messages">
                  View Messages
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Health Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Health Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                <span className="text-sm text-gray-700 font-medium">Medications</span>
                <span className="font-bold text-purple-600">{dashboardData?.medications?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                <span className="text-sm text-gray-700 font-medium">Allergies</span>
                <span className="font-bold text-amber-600">{dashboardData?.allergies?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                <span className="text-sm text-gray-700 font-medium">Conditions</span>
                <span className="font-bold text-blue-600">{dashboardData?.conditions?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Skeleton className="h-28 w-full rounded-3xl" />
      <div>
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}
