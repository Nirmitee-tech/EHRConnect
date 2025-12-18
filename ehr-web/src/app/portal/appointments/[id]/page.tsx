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
  ClipboardCheck,
  BellRing,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

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
  extension?: Array<{
    url?: string
    valueString?: string
  }>
}
const CHECK_IN_EXTENSION_URL = 'urn:oid:ehrconnect:appointment-checkin'
const REMINDER_EXTENSION_URL = 'urn:oid:ehrconnect:appointment-reminder'

const symptomOptions = ['Cough', 'Fever', 'Pain', 'Follow-up question', 'Medication refill']
const arrivalOptions = [
  { value: 'in-person', label: 'In person (waiting room)' },
  { value: 'car', label: 'I will wait in my car' },
  { value: 'virtual', label: 'Telehealth / virtual visit' },
]

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
  const { toast } = useToast()

  const [appointment, setAppointment] = useState<FhirAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [checkInModal, setCheckInModal] = useState<{ open: boolean }>({ open: false })
  const [checkInForm, setCheckInForm] = useState({
    contactPhone: '',
    contactEmail: '',
    arrivalMethod: 'in-person',
    symptoms: [] as string[],
    medicationsUpdated: true,
    insuranceConfirmed: true,
    consentsAccepted: true,
    pharmacyPreference: '',
    questions: '',
  })
  const [customSymptom, setCustomSymptom] = useState('')
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false)
  const [reminderModal, setReminderModal] = useState<{ open: boolean }>({ open: false })
  const [reminderForm, setReminderForm] = useState({
    channel: 'sms',
    sendAt: '',
    message: '',
  })
  const [submittingReminder, setSubmittingReminder] = useState(false)

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
  }, [appointmentId, refreshKey, router, session?.patientId, status])

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

  const checkInData = useMemo(() => {
    const raw = appointment?.extension?.find((ext: any) => ext.url === CHECK_IN_EXTENSION_URL)
    if (!raw?.valueString) return null
    try {
      return JSON.parse(raw.valueString as string)
    } catch (err) {
      console.error('Failed to parse check-in data:', err)
      return null
    }
  }, [appointment?.extension])

  const reminderData = useMemo(() => {
    const raw = appointment?.extension?.find((ext: any) => ext.url === REMINDER_EXTENSION_URL)
    if (!raw?.valueString) return null
    try {
      return JSON.parse(raw.valueString as string)
    } catch (err) {
      console.error('Failed to parse reminder data:', err)
      return null
    }
  }, [appointment?.extension])

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
  const isTelehealthVisit = visitType.label === 'Video visit'
  const canJoinTelehealth = startDate
    ? (() => {
        const now = new Date()
        const diffMinutes = (startDate.getTime() - now.getTime()) / (1000 * 60)
        return diffMinutes <= 15 && diffMinutes > -120
      })()
    : false
  const hasCompletedCheckIn = !!checkInData
  const canCompleteCheckIn =
    !hasCompletedCheckIn &&
    startDate
      ? (() => {
          const now = new Date()
          const diffMinutes = (startDate.getTime() - now.getTime()) / (1000 * 60)
          return diffMinutes < 48 && diffMinutes > -3
        })()
      : false

  const formatDateInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm")

  const openCheckInDialog = () => {
    setCheckInForm({
      contactPhone: checkInData?.contactPhone || '',
      contactEmail: checkInData?.contactEmail || session?.user?.email || '',
      arrivalMethod: checkInData?.arrivalMethod || (isTelehealthVisit ? 'virtual' : 'in-person'),
      symptoms: checkInData?.symptoms || [],
      medicationsUpdated: checkInData?.medicationsUpdated ?? true,
      insuranceConfirmed: checkInData?.insuranceConfirmed ?? true,
      consentsAccepted: checkInData?.consentsAccepted ?? true,
      pharmacyPreference: checkInData?.pharmacyPreference || '',
      questions: checkInData?.questions || '',
    })
    setCustomSymptom('')
    setCheckInModal({ open: true })
  }

  const toggleSymptom = (symptom: string) => {
    setCheckInForm((prev) => {
      const exists = prev.symptoms.includes(symptom)
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter((item) => item !== symptom) : [...prev.symptoms, symptom],
      }
    })
  }

  const addCustomSymptom = () => {
    if (!customSymptom.trim()) return
    setCheckInForm((prev) => ({
      ...prev,
      symptoms: [...prev.symptoms, customSymptom.trim()],
    }))
    setCustomSymptom('')
  }

  const handleCheckInSubmit = async () => {
    if (!appointmentId) return
    try {
      setSubmittingCheckIn(true)
      const response = await fetch(`/api/patient/appointments/${appointmentId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInForm),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to complete digital check-in')
      }

      toast({ title: 'Check-in completed', description: 'Thanks! Your care team has been notified.' })
      setCheckInModal({ open: false })
      setRefreshKey((key) => key + 1)
    } catch (err) {
      console.error('Check-in failed:', err)
      toast({
        title: 'Check-in failed',
        description: err instanceof Error ? err.message : 'Unable to submit check-in.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingCheckIn(false)
    }
  }

  const openReminderDialog = () => {
    const defaultReminder =
      reminderData?.sendAt ||
      (startDate ? formatDateInput(new Date(startDate.getTime() - 60 * 60 * 1000)) : '')
    setReminderForm({
      channel: reminderData?.channel || (isTelehealthVisit ? 'email' : 'sms'),
      sendAt: defaultReminder,
      message: reminderData?.message || '',
    })
    setReminderModal({ open: true })
  }

  const handleReminderSubmit = async () => {
    if (!appointmentId) return
    if (!reminderForm.sendAt) {
      toast({
        title: 'Reminder time required',
        description: 'Choose when we should send the reminder.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmittingReminder(true)
      const response = await fetch(`/api/patient/appointments/${appointmentId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reminderForm,
          sendAt: new Date(reminderForm.sendAt).toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to schedule reminder')
      }

      toast({ title: 'Reminder scheduled', description: 'We will nudge you before the visit.' })
      setReminderModal({ open: false })
      setRefreshKey((key) => key + 1)
    } catch (err) {
      console.error('Reminder failed:', err)
      toast({
        title: 'Reminder failed',
        description: err instanceof Error ? err.message : 'Unable to schedule reminder.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingReminder(false)
    }
  }

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

            <div className="space-y-4 lg:w-80">
              {isTelehealthVisit && (
                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                      <Video className="w-4 h-4" />
                      Telehealth visit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <p>
                      Join with your camera and microphone. The join link activates 15 minutes before
                      the scheduled start time.
                    </p>
                    <Button
                      className="w-full"
                      asChild
                      disabled={!canJoinTelehealth}
                      title={
                        canJoinTelehealth
                          ? 'Join telehealth room'
                          : 'Available 15 minutes before the visit'
                      }
                    >
                      <Link href={`/portal/telehealth/${appointment.id}`}>Join telehealth room</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/portal/telehealth">View telehealth tips</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    Digital check-in
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  {hasCompletedCheckIn ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        Completed {checkInData?.checkedInAt ? format(new Date(checkInData.checkedInAt), 'MMM d, h:mma') : ''}
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                        {checkInData?.arrivalMethod && (
                          <p>
                            Arrival method:{' '}
                            <span className="font-semibold capitalize">{checkInData.arrivalMethod.replace('-', ' ')}</span>
                          </p>
                        )}
                        {checkInData?.symptoms?.length ? (
                          <p>
                            Symptoms:{' '}
                            <span className="font-semibold">{checkInData.symptoms.join(', ')}</span>
                          </p>
                        ) : null}
                        {checkInData?.questions && (
                          <p className="text-gray-600">{checkInData.questions}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Complete digital check-in to confirm your contact, insurance, and arrival plan
                        ahead of time.
                      </p>
                      <Button
                        className="w-full"
                        disabled={!canCompleteCheckIn}
                        onClick={openCheckInDialog}
                        title={
                          canCompleteCheckIn
                            ? 'Complete digital check-in'
                            : 'Available within 48 hours of your visit'
                        }
                      >
                        Complete check-in
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-blue-600" />
                    Appointment reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  {reminderData ? (
                    <>
                      <p className="flex items-center gap-2 text-blue-700">
                        <AlertCircle className="w-4 h-4" />
                        Reminder via {reminderData.channel?.toUpperCase()} scheduled for{' '}
                        {reminderData.sendAt
                          ? format(new Date(reminderData.sendAt), 'MMM d, h:mma')
                          : 'your visit'}
                      </p>
                      {reminderData.message && (
                        <p className="text-gray-600 italic">“{reminderData.message}”</p>
                      )}
                    </>
                  ) : (
                    <p>No reminders scheduled yet.</p>
                  )}
                  <Button variant="outline" className="w-full" onClick={openReminderDialog}>
                    {reminderData ? 'Reschedule reminder' : 'Schedule reminder'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
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

      {/* Digital Check-in Dialog */}
      <Dialog
        open={checkInModal.open}
        onOpenChange={(open) => setCheckInModal({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete digital check-in</DialogTitle>
            <DialogDescription>
              Confirm your details so the care team knows you&apos;re ready.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="checkin-phone">Mobile number</Label>
              <Input
                id="checkin-phone"
                value={checkInForm.contactPhone}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, contactPhone: event.target.value }))
                }
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkin-email">Email</Label>
              <Input
                id="checkin-email"
                type="email"
                value={checkInForm.contactEmail}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                }
                placeholder="you@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Arrival method</Label>
              <Select
                value={checkInForm.arrivalMethod}
                onValueChange={(value) =>
                  setCheckInForm((prev) => ({ ...prev, arrivalMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose arrival method" />
                </SelectTrigger>
                <SelectContent>
                  {arrivalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Symptoms or goals</Label>
              <div className="grid gap-2">
                {symptomOptions.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={checkInForm.symptoms.includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                    />
                    {symptom}
                  </label>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add another"
                    value={customSymptom}
                    onChange={(event) => setCustomSymptom(event.target.value)}
                  />
                  <Button variant="outline" onClick={addCustomSymptom}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkin-pharmacy">Preferred pharmacy</Label>
              <Input
                id="checkin-pharmacy"
                value={checkInForm.pharmacyPreference}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, pharmacyPreference: event.target.value }))
                }
                placeholder="Pharmacy name or phone"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkin-questions">Questions for your care team</Label>
              <Textarea
                id="checkin-questions"
                value={checkInForm.questions}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, questions: event.target.value }))
                }
                placeholder="Anything you want us to know before the visit?"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Checkbox
                  checked={checkInForm.insuranceConfirmed}
                  onCheckedChange={(checked) =>
                    setCheckInForm((prev) => ({
                      ...prev,
                      insuranceConfirmed: Boolean(checked),
                    }))
                  }
                />
                My insurance and contact info are up to date
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Checkbox
                  checked={checkInForm.medicationsUpdated}
                  onCheckedChange={(checked) =>
                    setCheckInForm((prev) => ({
                      ...prev,
                      medicationsUpdated: Boolean(checked),
                    }))
                  }
                />
                My medication list is current
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Checkbox
                  checked={checkInForm.consentsAccepted}
                  onCheckedChange={(checked) =>
                    setCheckInForm((prev) => ({
                      ...prev,
                      consentsAccepted: Boolean(checked),
                    }))
                  }
                />
                I accept the visit policies and consent to treatment
              </label>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setCheckInModal({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleCheckInSubmit} disabled={submittingCheckIn}>
              {submittingCheckIn ? 'Submitting...' : 'Complete check-in'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderModal.open} onOpenChange={(open) => setReminderModal({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a reminder</DialogTitle>
            <DialogDescription>
              We&apos;ll remind you ahead of the visit using your preferred channel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select
                value={reminderForm.channel}
                onValueChange={(value) =>
                  setReminderForm((prev) => ({ ...prev, channel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">Text message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminder-time">Send at</Label>
              <Input
                id="reminder-time"
                type="datetime-local"
                value={reminderForm.sendAt}
                onChange={(event) =>
                  setReminderForm((prev) => ({ ...prev, sendAt: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminder-message">Message (optional)</Label>
              <Textarea
                id="reminder-message"
                value={reminderForm.message}
                onChange={(event) =>
                  setReminderForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder="We already provide a default reminder, but you can personalize it."
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setReminderModal({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleReminderSubmit} disabled={submittingReminder}>
              {submittingReminder ? 'Scheduling...' : 'Schedule reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
