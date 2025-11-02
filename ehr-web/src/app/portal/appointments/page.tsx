'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  Filter,
  Search,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export default function PatientAppointmentsPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patient/appointments?filter=${filter}`)
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      booked: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      arrived: 'bg-green-100 text-green-800 border-green-200',
      fulfilled: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'checked-in': 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getAppointmentType = (appointment: any) => {
    const typeText = appointment.appointmentType?.text?.toLowerCase() || ''
    if (typeText.includes('video') || typeText.includes('virtual')) {
      return { icon: Video, text: 'Video Call', color: 'text-purple-600' }
    }
    if (typeText.includes('phone')) {
      return { icon: Phone, text: 'Phone Call', color: 'text-blue-600' }
    }
    return { icon: MapPin, text: 'In Person', color: 'text-gray-600' }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const practitioner = apt.participant?.find((p: any) =>
      p.actor?.reference?.includes('Practitioner')
    )?.actor?.display || ''
    const serviceType = apt.serviceType?.[0]?.text || ''
    return (
      practitioner.toLowerCase().includes(searchLower) ||
      serviceType.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and schedule new visits</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/portal/appointments/book">
            <Plus className="w-5 h-5 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 h-auto">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-100">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const appointmentType = getAppointmentType(appointment)
                const practitioner = appointment.participant?.find((p: any) =>
                  p.actor?.reference?.includes('Practitioner')
                )
                const location = appointment.participant?.find((p: any) =>
                  p.actor?.reference?.includes('Location')
                )

                return (
                  <Card
                    key={appointment.id}
                    className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Section - Appointment Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {practitioner?.actor?.display || 'Healthcare Provider'}
                                </h3>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600">
                                {appointment.serviceType?.[0]?.text || 'General Visit'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              {format(new Date(appointment.start), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {format(new Date(appointment.start), 'h:mm a')} -{' '}
                              {format(new Date(appointment.end), 'h:mm a')}
                            </div>
                            <div className={`flex items-center gap-2 ${appointmentType.color}`}>
                              <appointmentType.icon className="w-4 h-4" />
                              {appointmentType.text}
                            </div>
                          </div>

                          {location && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                              <span>{location.actor?.display}</span>
                            </div>
                          )}

                          {appointment.reasonCode?.[0]?.text && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Reason: </span>
                                {appointment.reasonCode[0].text}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex lg:flex-col gap-2 lg:items-end">
                          {appointment.status === 'booked' &&
                            appointmentType.icon === Video && (
                              <Button variant="default" size="sm" asChild>
                                <Link href={`/portal/appointments/${appointment.id}/join`}>
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Call
                                </Link>
                              </Button>
                            )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/portal/appointments/${appointment.id}`}>
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No {filter === 'upcoming' ? 'upcoming' : filter === 'past' ? 'past' : ''}{' '}
                    appointments
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'upcoming'
                      ? "You don't have any upcoming appointments scheduled."
                      : "You don't have any appointments in this category."}
                  </p>
                  <Button asChild>
                    <Link href="/portal/appointments/book">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
