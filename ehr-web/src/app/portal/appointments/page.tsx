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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-600 mt-0.5">Manage your appointments and schedule new visits</p>
        </div>
        <Button asChild className="w-full sm:w-auto text-white" style={{ backgroundColor: '#1B2156' }}>
          <Link href="/portal/appointments/book">
            <Plus className="w-4 h-4 mr-1.5" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-1.5" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-3">
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
                    className="hover:shadow-md transition-all cursor-pointer border border-gray-200 shadow-sm bg-white"
                    style={{ borderLeftWidth: '3px', borderLeftColor: '#1B2156' }}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Left Section - Appointment Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-gray-900">
                                  {practitioner?.actor?.display || 'Healthcare Provider'}
                                </h3>
                                <Badge className={getStatusColor(appointment.status)} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {appointment.serviceType?.[0]?.text || 'General Visit'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs">{format(new Date(appointment.start), 'EEE, MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs">{format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${appointmentType.color}`}>
                              <appointmentType.icon className="w-3.5 h-3.5" />
                              <span className="text-xs">{appointmentType.text}</span>
                            </div>
                          </div>

                          {location && (
                            <div className="flex items-start gap-1.5 text-xs text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
                              <span>{location.actor?.display}</span>
                            </div>
                          )}

                          {appointment.reasonCode?.[0]?.text && (
                            <div className="mt-1.5 p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-700">
                                <span className="font-semibold">Reason: </span>
                                {appointment.reasonCode[0].text}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex lg:flex-col gap-2 lg:items-end">
                          {appointment.status === 'booked' &&
                            appointmentType.icon === Video && (
                              <Button size="sm" className="text-white" style={{ backgroundColor: '#1B2156' }} asChild>
                                <Link href={`/portal/appointments/${appointment.id}/join`}>
                                  <Video className="w-3.5 h-3.5 mr-1.5" />
                                  Join Call
                                </Link>
                              </Button>
                            )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/portal/appointments/${appointment.id}`}>
                              View Details
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
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
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="py-10">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    No {filter === 'upcoming' ? 'upcoming' : filter === 'past' ? 'past' : ''}{' '}
                    appointments
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {filter === 'upcoming'
                      ? "You don't have any upcoming appointments scheduled."
                      : "You don't have any appointments in this category."}
                  </p>
                  <Button asChild className="text-white" style={{ backgroundColor: '#1B2156' }}>
                    <Link href="/portal/appointments/book">
                      <Plus className="w-4 h-4 mr-1.5" />
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
