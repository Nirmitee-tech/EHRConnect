'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type FhirParticipant = {
  actor?: {
    reference?: string
    display?: string
  }
  status?: string
}

type FhirAppointment = {
  id: string
  status?: string
  start?: string
  end?: string
  comment?: string
  description?: string
  minutesDuration?: number
  serviceType?: Array<{ text?: string }>
  reasonCode?: Array<{ text?: string }>
  participant?: FhirParticipant[]
  note?: Array<{ text?: string }>
  supportingInformation?: Array<{ display?: string; reference?: string }>
}

function getStatusBadge(status?: string) {
  const normalized = status?.toLowerCase() ?? ''
  const variants: Record<string, { label: string; className: string }> = {
    booked: { label: 'Booked', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-900 border-yellow-200' },
    arrived: { label: 'Arrived', className: 'bg-green-100 text-green-800 border-green-200' },
    'checked-in': {
      label: 'Checked In',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    fulfilled: { label: 'Completed', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
    noshow: { label: 'No Show', className: 'bg-red-100 text-red-800 border-red-200' },
  }

  return (
    variants[normalized] ?? {
      label: status ?? 'Unknown',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    }
  )
}

function getVisitType(appointment: FhirAppointment) {
  const appointmentType = appointment.serviceType?.[0]?.text?.toLowerCase() ?? ''

  if (appointmentType.includes('video') || appointmentType.includes('virtual')) {
    return { icon: Video, label: 'Video visit', pillClass: 'bg-purple-100 text-purple-700' }
  }

  if (appointmentType.includes('phone')) {
    return { icon: Phone, label: 'Phone visit', pillClass: 'bg-blue-100 text-blue-700' }
  }

  return { icon: MapPin, label: 'In-person visit', pillClass: 'bg-gray-100 text-gray-700' }
}

export default function AppointmentDetailsPage({
  params,
}: {
  params: Promise<Record<string, string | string[] | undefined>>
}) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [appointment, setAppointment] = useState<FhirAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        const rawId = resolvedParams?.id
        const normalizedId = Array.isArray(rawId) ? rawId[0] : rawId

        if (cancelled) {
          return
        }

        if (!normalizedId) {
          setError('Appointment ID is required.')
          setLoading(false)
          setAppointmentId(null)
          return
        }

        setAppointmentId(normalizedId)
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to resolve appointment params:', err)
          setError('Unable to determine appointment ID.')
          setLoading(false)
          setAppointmentId(null)
        }
      }
    }

    resolveParams()

    return () => {
      cancelled = true
    }
  }, [params])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated' || !session?.patientId) {
      router.push('/patient-login')
      return
    }

    if (!appointmentId) {
      return
    }

    let cancelled = false

    const fetchAppointment = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/patient/appointments/${encodeURIComponent(appointmentId)}`
        )

        if (cancelled) {
          return
        }

        if (response.status === 404) {
          setError('Appointment not found.')
          setAppointment(null)
          return
        }

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setError(
            data?.message ||
              'There was a problem loading this appointment. Please try again later.'
          )
          setAppointment(null)
          return
        }

        const data = await response.json()
        setAppointment(data.appointment)
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Unable to load appointment details.'
          setError(message)
          setAppointment(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchAppointment()

    return () => {
      cancelled = true
    }
  }, [appointmentId, router, session?.patientId, status])

  const statusBadge = useMemo(() => {
    if (!appointment) {
      return { label: 'Loading', className: 'bg-gray-100 text-gray-700 border-gray-200' }
    }
    return getStatusBadge(appointment.status)
  }, [appointment])

  const visitType = useMemo(() => {
    if (!appointment) {
      return getVisitType({ id: '' } as FhirAppointment)
    }
    return getVisitType(appointment)
  }, [appointment])

  const practitioner = useMemo(
    () =>
      appointment?.participant?.find((participant) =>
        participant.actor?.reference?.startsWith('Practitioner/')
      ),
    [appointment?.participant]
  )

  const patientParticipant = useMemo(
    () =>
      appointment?.participant?.find((participant) =>
        participant.actor?.reference?.startsWith('Patient/')
      ),
    [appointment?.participant]
  )

  const location = useMemo(
    () =>
      appointment?.participant?.find((participant) =>
        participant.actor?.reference?.startsWith('Location/')
      ),
    [appointment?.participant]
  )

  const startDate = appointment?.start ? new Date(appointment.start) : null
  const endDate = appointment?.end ? new Date(appointment.end) : null

  if (status === 'loading') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href="/portal/appointments">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to appointments
          </Link>
        </Button>
        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : appointment ? (
        <>
          <div className="flex flex-col gap-6 lg:flex-row">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-500">Appointment with</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {practitioner?.actor?.display ?? 'Healthcare Provider'}
                  </span>
                  <span className="text-sm font-medium">
                    {appointment.serviceType?.[0]?.text ?? 'General consultation'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {startDate ? format(startDate, 'EEEE, MMMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-base font-semibold text-gray-900">
                        {startDate && endDate
                          ? `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`
                          : 'TBD'}
                      </p>
                      {appointment.minutesDuration && (
                        <p className="text-sm text-gray-500">
                          {appointment.minutesDuration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <visitType.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Visit type</p>
                      <p className="text-base font-semibold text-gray-900">{visitType.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-base font-semibold text-gray-900">
                        {location?.actor?.display ?? 'To be announced'}
                      </p>
                    </div>
                  </div>
                </div>

                {appointment.comment && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      Provider notes
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{appointment.comment}</p>
                  </div>
                )}

                {appointment.reasonCode?.[0]?.text && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Reason for visit
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{appointment.reasonCode[0].text}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:w-80">
              <CardHeader>
                <CardTitle className="text-lg">Attendees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <User className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">You</p>
                    <p className="text-xs text-gray-500">
                      {patientParticipant?.status || 'Pending'}
                    </p>
                  </div>
                </div>

                {practitioner && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <User className="w-4 h-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {practitioner.actor?.display ?? 'Provider'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {practitioner.status ? `Status: ${practitioner.status}` : 'Invited'}
                      </p>
                    </div>
                  </div>
                )}

                {appointment.note?.length ? (
                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                    <p className="font-medium mb-1">Additional notes</p>
                    <p>{appointment.note[0].text}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need to reschedule or cancel?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                If you need to make changes to this appointment, please contact our care team at
                least 24 hours in advance. You can call the clinic directly or send a secure message
                through the portal.
              </p>
              <Button variant="outline" asChild>
                <Link href="/portal/messages/compose">Message care team</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">
              We could not find details for this appointment. Please go back to the appointments list
              and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
