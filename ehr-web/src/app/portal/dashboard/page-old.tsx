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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

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

export default function PatientDashboard() {
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
      booked: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      arrived: { color: 'bg-green-100 text-green-800', text: 'Arrived' },
      fulfilled: { color: 'bg-gray-100 text-gray-800', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
    }

    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status }
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const nextAppointment = dashboardData?.upcomingAppointments?.[0]
  const hasActiveConditions = (dashboardData?.conditions?.length || 0) > 0
  const hasAllergies = (dashboardData?.allergies?.length || 0) > 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Patient'}!
        </h1>
        <p className="text-blue-100">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/portal/appointments/book">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500 group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">Book Appointment</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/messages/compose">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500 group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">Message Doctor</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/health-records">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-500 group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">Health Records</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/billing">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-amber-500 group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">View Bills</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Next Appointment Highlight */}
      {nextAppointment && (
        <Card className="border-l-4 border-l-blue-600 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Next Appointment</CardTitle>
                <CardDescription>
                  {getTimeUntilAppointment(nextAppointment.start)}
                </CardDescription>
              </div>
              <Badge className={getAppointmentStatus(nextAppointment.status).color}>
                {getAppointmentStatus(nextAppointment.status).text}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {nextAppointment.participant?.find((p: any) => p.actor?.reference?.includes('Practitioner'))?.actor?.display || 'Healthcare Provider'}
                </p>
                <p className="text-sm text-gray-600">
                  {nextAppointment.serviceType?.[0]?.text || 'General Visit'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {format(new Date(nextAppointment.start), 'h:mm a')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {format(new Date(nextAppointment.start), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="default" className="flex-1" asChild>
                <Link href={`/portal/appointments/${nextAppointment.id}`}>
                  View Details
                </Link>
              </Button>
              {nextAppointment.appointmentType?.text === 'virtual' && (
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/portal/appointments/${nextAppointment.id}/join`}>
                    <Video className="w-4 h-4 mr-2" />
                    Join Video Call
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Alerts */}
      {(hasActiveConditions || hasAllergies) && (
        <div className="grid md:grid-cols-2 gap-4">
          {hasAllergies && (
            <Alert className="border-amber-200 bg-amber-50">
              <Shield className="h-5 w-5 text-amber-600" />
              <div className="ml-2">
                <h3 className="font-semibold text-amber-900">Active Allergies</h3>
                <AlertDescription className="text-amber-800">
                  You have {dashboardData?.allergies?.length} documented allergy{dashboardData?.allergies?.length !== 1 ? 'ies' : ''}.{' '}
                  <Link href="/portal/health-records/allergies" className="underline font-medium">
                    View details
                  </Link>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {hasActiveConditions && (
            <Alert className="border-blue-200 bg-blue-50">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="ml-2">
                <h3 className="font-semibold text-blue-900">Active Conditions</h3>
                <AlertDescription className="text-blue-800">
                  {dashboardData?.conditions?.length} active condition{dashboardData?.conditions?.length !== 1 ? 's' : ''} being monitored.{' '}
                  <Link href="/portal/health-records/conditions" className="underline font-medium">
                    View details
                  </Link>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments & Medications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portal/appointments">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.upcomingAppointments.slice(0, 3).map((apt: any, idx: number) => (
                    <div
                      key={apt.id || idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {apt.participant?.find((p: any) => p.actor?.reference?.includes('Practitioner'))?.actor?.display || 'Healthcare Provider'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(apt.start), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Button variant="outline" asChild>
                    <Link href="/portal/appointments/book">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>Active prescriptions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portal/health-records/medications">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dashboardData?.medications && dashboardData.medications.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.medications.slice(0, 4).map((med: any, idx: number) => (
                    <div
                      key={med.id || idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {med.medicationCodeableConcept?.text || med.medicationReference?.display || 'Medication'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {med.dosageInstruction?.[0]?.text || 'As directed'}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active medications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Messages, Vitals, Quick Info */}
        <div className="space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                {dashboardData && dashboardData.unreadMessages > 0 && (
                  <Badge variant="destructive">{dashboardData.unreadMessages}</Badge>
                )}
              </CardTitle>
              <CardDescription>Communicate with your care team</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/portal/messages">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Messages
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Vital Signs */}
          {dashboardData?.vitalSigns && dashboardData.vitalSigns.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Recent Vitals
                </CardTitle>
                <CardDescription>Latest measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.vitalSigns.slice(0, 3).map((vital: any, idx: number) => (
                  <div key={vital.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vital.code?.text || vital.code?.coding?.[0]?.display || 'Vital Sign'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vital.effectiveDateTime ? format(new Date(vital.effectiveDateTime), 'MMM d') : 'Recent'}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {vital.valueQuantity?.value} {vital.valueQuantity?.unit}
                    </p>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/portal/health-records/vitals">
                    View All Vitals <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Health Summary */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Health Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Active Medications</span>
                <span className="font-bold text-blue-600">{dashboardData?.medications?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Allergies</span>
                <span className="font-bold text-amber-600">{dashboardData?.allergies?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Conditions</span>
                <span className="font-bold text-purple-600">{dashboardData?.conditions?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Recent Visits</span>
                <span className="font-bold text-green-600">{dashboardData?.recentEncounters?.length || 0}</span>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  )
}
