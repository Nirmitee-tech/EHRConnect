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

const symptomOptions = [
  { value: 'Cough', labelKey: 'portal_appointments.check_in.symptom_cough' },
  { value: 'Fever', labelKey: 'portal_appointments.check_in.symptom_fever' },
  { value: 'Pain', labelKey: 'portal_appointments.check_in.symptom_pain' },
  { value: 'Follow-up question', labelKey: 'portal_appointments.check_in.symptom_follow_up_question' },
  { value: 'Medication refill', labelKey: 'portal_appointments.check_in.symptom_medication_refill' },
] as const

const arrivalOptions = [
  { value: 'in-person', labelKey: 'portal_appointments.check_in.arrival_in_person' },
  { value: 'car', labelKey: 'portal_appointments.check_in.arrival_car' },
  { value: 'virtual', labelKey: 'portal_appointments.check_in.arrival_virtual' },
] as const

function getStatusBadge(status?: string) {
  const normalized = status?.toLowerCase() ?? ''
  const variants: Record<string, { labelKey: string; className: string }> = {
    booked: { labelKey: 'portal_appointments.status_booked', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    pending: { labelKey: 'portal_appointments.status_pending', className: 'bg-yellow-100 text-yellow-900 border-yellow-200' },
    arrived: { labelKey: 'portal_appointments.status_arrived', className: 'bg-green-100 text-green-800 border-green-200' },
    'checked-in': {
      labelKey: 'portal_appointments.status_checked_in',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    fulfilled: { labelKey: 'portal_appointments.status_completed', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    cancelled: { labelKey: 'portal_appointments.status_cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
    noshow: { labelKey: 'portal_appointments.status_no_show', className: 'bg-red-100 text-red-800 border-red-200' },
  }

  return variants[normalized] ?? { labelKey: 'portal_appointments.status_unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' }
}

function getVisitType(appointment: FhirAppointment) {
  const appointmentType = appointment.serviceType?.[0]?.text?.toLowerCase() ?? ''

  if (appointmentType.includes('video') || appointmentType.includes('virtual')) {
    return { icon: Video, kind: 'video' as const, labelKey: 'portal_appointments.visit_type_video', pillClass: 'bg-purple-100 text-purple-700' }
  }

  if (appointmentType.includes('phone')) {
    return { icon: Phone, kind: 'phone' as const, labelKey: 'portal_appointments.visit_type_phone', pillClass: 'bg-blue-100 text-blue-700' }
  }

  return { icon: MapPin, kind: 'in_person' as const, labelKey: 'portal_appointments.visit_type_in_person', pillClass: 'bg-gray-100 text-gray-700' }
}

export default function AppointmentDetailsPage({
  params,
}: {
  params: Promise<Record<string, string | string[] | undefined>>
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { t } = useTranslation('common')

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
          setError(t('portal_appointments.error_appointment_id_required'))
          setLoading(false)
          setAppointmentId(null)
          return
        }

        setAppointmentId(normalizedId)
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to resolve appointment params:', err)
          setError(t('portal_appointments.error_unable_to_determine_appointment_id'))
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
          setError(t('portal_appointments.error_appointment_not_found'))
          setAppointment(null)
          return
        }

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setError(
            data?.message ||
              t('portal_appointments.error_loading_appointment')
          )
          setAppointment(null)
          return
        }

        const data = await response.json()
        setAppointment(data.appointment)
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : t('portal_appointments.error_unable_to_load_appointment_details')
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
      return { label: t('common.loading'), className: 'bg-gray-100 text-gray-700 border-gray-200' }
    }
    const badge = getStatusBadge(appointment.status)
    return { ...badge, label: t(badge.labelKey) }
  }, [appointment, t])

  const visitType = useMemo(() => {
    if (!appointment) {
      return getVisitType({ id: '' } as FhirAppointment)
    }
    return getVisitType(appointment)
  }, [appointment])

  const arrivalLabelByValue = useMemo(() => {
    const map: Record<string, string> = {}
    for (const option of arrivalOptions) {
      map[option.value] = t(option.labelKey)
    }
    return map
  }, [t])

  const symptomLabelByValue = useMemo(() => {
    const map: Record<string, string> = {}
    for (const option of symptomOptions) {
      map[option.value] = t(option.labelKey)
    }
    return map
  }, [t])

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
  const isTelehealthVisit = visitType.kind === 'video'
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
        throw new Error(data?.message || t('portal_appointments.check_in.error_unable_to_complete'))
      }

      toast({
        title: t('portal_appointments.check_in.toast_completed_title'),
        description: t('portal_appointments.check_in.toast_completed_description'),
      })
      setCheckInModal({ open: false })
      setRefreshKey((key) => key + 1)
    } catch (err) {
      console.error('Check-in failed:', err)
      toast({
        title: t('portal_appointments.check_in.toast_failed_title'),
        description: err instanceof Error ? err.message : t('portal_appointments.check_in.error_unable_to_submit'),
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
        throw new Error(data?.message || t('portal_appointments.error_unable_to_schedule_reminder'))
      }

      toast({
        title: t('portal_appointments.reminder.toast_scheduled_title'),
        description: t('portal_appointments.reminder.toast_scheduled_description'),
      })
      setReminderModal({ open: false })
      setRefreshKey((key) => key + 1)
    } catch (err) {
      console.error('Reminder failed:', err)
      toast({
        title: t('portal_appointments.reminder.toast_failed_title'),
        description:
          err instanceof Error ? err.message : t('portal_appointments.error_unable_to_schedule_reminder'),
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
            {t('portal_appointments.back_to_appointments')}
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
                  <span className="text-sm font-medium text-gray-500">{t('portal_appointments.appointment_with')}</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {practitioner?.actor?.display ?? t('portal_appointments.healthcare_provider')}
                  </span>
                  <span className="text-sm font-medium">
                    {appointment.serviceType?.[0]?.text ?? t('appointment_form.general_consultation')}
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
                      <p className="text-sm text-gray-500">{t('common.date')}</p>
                      <p className="text-base font-semibold text-gray-900">
                        {startDate ? format(startDate, 'EEEE, MMMM d, yyyy') : t('portal_appointments.tbd')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('common.time')}</p>
                      <p className="text-base font-semibold text-gray-900">
                        {startDate && endDate
                          ? `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`
                          : t('portal_appointments.tbd')}
                      </p>
                      {appointment.minutesDuration && (
                        <p className="text-sm text-gray-500">
                          {appointment.minutesDuration} {t('appointment_form.duration_minutes')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <visitType.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('portal_appointments.visit_type')}</p>
                      <p className="text-base font-semibold text-gray-900">{t(visitType.labelKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('portal_appointments.location')}</p>
                      <p className="text-base font-semibold text-gray-900">
                        {location?.actor?.display ?? t('portal_appointments.to_be_announced')}
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
                    {t('portal_appointments.check_in.card_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  {hasCompletedCheckIn ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        {checkInData?.checkedInAt
                          ? t('portal_appointments.check_in.completed_with_date', {
                              date: format(new Date(checkInData.checkedInAt), 'MMM d, h:mma'),
                            })
                          : t('portal_appointments.check_in.completed')}
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                        {checkInData?.arrivalMethod && (
                          <p>
                            {t('portal_appointments.check_in.arrival_method_label')}{' '}
                            <span className="font-semibold">
                              {arrivalLabelByValue[checkInData.arrivalMethod] ??
                                checkInData.arrivalMethod.replace('-', ' ')}
                            </span>
                          </p>
                        )}
                        {checkInData?.symptoms?.length ? (
                          <p>
                            {t('portal_appointments.check_in.symptoms_label')}{' '}
                            <span className="font-semibold">
                              {checkInData.symptoms
                                .map((symptom: string) => symptomLabelByValue[symptom] ?? symptom)
                                .join(', ')}
                            </span>
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
                        {t('portal_appointments.check_in.instructions')}
                      </p>
                      <Button
                        className="w-full"
                        disabled={!canCompleteCheckIn}
                        onClick={openCheckInDialog}
                        title={
                          canCompleteCheckIn
                            ? t('portal_appointments.check_in.title')
                            : t('portal_appointments.check_in.available_within_48_hours')
                        }
                      >
                        {t('portal_appointments.check_in.complete_button')}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-blue-600" />
                    {t('portal_appointments.reminder.card_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  {reminderData ? (
                    <>
                      <p className="flex items-center gap-2 text-blue-700">
                        <AlertCircle className="w-4 h-4" />
                        {t('portal_appointments.reminder.via_scheduled_for', {
                          channel:
                            reminderData.channel === 'email'
                              ? t('portal_appointments.reminder.channel_email')
                              : t('portal_appointments.reminder.channel_sms'),
                          when: reminderData.sendAt
                            ? format(new Date(reminderData.sendAt), 'MMM d, h:mma')
                            : t('portal_appointments.reminder.your_visit'),
                        })}
                      </p>
                      {reminderData.message && (
                        <p className="text-gray-600 italic">“{reminderData.message}”</p>
                      )}
                    </>
                  ) : (
                    <p>{t('portal_appointments.reminder.none_scheduled')}</p>
                  )}
                  <Button variant="outline" className="w-full" onClick={openReminderDialog}>
                    {reminderData
                      ? t('portal_appointments.reminder.reschedule')
                      : t('portal_appointments.reminder.schedule')}
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
            <DialogTitle>{t('portal_appointments.check_in.title')}</DialogTitle>
            <DialogDescription>
              {t('portal_appointments.check_in.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="checkin-phone">{t('portal_appointments.check_in.mobile_number')}</Label>
              <Input
                id="checkin-phone"
                value={checkInForm.contactPhone}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, contactPhone: event.target.value }))
                }
                placeholder={t('portal_appointments.check_in.mobile_number_placeholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkin-email">{t('portal_appointments.check_in.email')}</Label>
              <Input
                id="checkin-email"
                type="email"
                value={checkInForm.contactEmail}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                }
                placeholder={t('portal_appointments.check_in.email_placeholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('portal_appointments.check_in.arrival_method')}</Label>
              <Select
                value={checkInForm.arrivalMethod}
                onValueChange={(value) =>
                  setCheckInForm((prev) => ({ ...prev, arrivalMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('portal_appointments.check_in.arrival_method_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {arrivalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('portal_appointments.check_in.symptoms_or_goals')}</Label>
              <div className="grid gap-2">
                {symptomOptions.map((symptom) => (
                  <label
                    key={symptom.value}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={checkInForm.symptoms.includes(symptom.value)}
                      onCheckedChange={() => toggleSymptom(symptom.value)}
                    />
                    {t(symptom.labelKey)}
                  </label>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('portal_appointments.check_in.add_another')}
                    value={customSymptom}
                    onChange={(event) => setCustomSymptom(event.target.value)}
                  />
                  <Button variant="outline" onClick={addCustomSymptom}>
                    {t('portal_appointments.check_in.add')}
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkin-pharmacy">{t('portal_appointments.check_in.preferred_pharmacy')}</Label>
              <Input
                id="checkin-pharmacy"
                value={checkInForm.pharmacyPreference}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, pharmacyPreference: event.target.value }))
                }
                placeholder={t('portal_appointments.check_in.preferred_pharmacy_placeholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkin-questions">{t('portal_appointments.check_in.questions')}</Label>
              <Textarea
                id="checkin-questions"
                value={checkInForm.questions}
                onChange={(event) =>
                  setCheckInForm((prev) => ({ ...prev, questions: event.target.value }))
                }
                placeholder={t('portal_appointments.check_in.questions_placeholder')}
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
                {t('portal_appointments.check_in.insurance_confirmed')}
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
                {t('portal_appointments.check_in.medications_updated')}
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
                {t('portal_appointments.check_in.consents_accepted')}
              </label>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setCheckInModal({ open: false })}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCheckInSubmit} disabled={submittingCheckIn}>
              {submittingCheckIn ? t('portal_appointments.check_in.submitting') : t('portal_appointments.check_in.complete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderModal.open} onOpenChange={(open) => setReminderModal({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('portal_appointments.reminder.title')}</DialogTitle>
            <DialogDescription>
              {t('portal_appointments.reminder.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>{t('portal_appointments.reminder.channel')}</Label>
              <Select
                value={reminderForm.channel}
                onValueChange={(value) =>
                  setReminderForm((prev) => ({ ...prev, channel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('portal_appointments.reminder.channel_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">{t('portal_appointments.reminder.channel_sms')}</SelectItem>
                  <SelectItem value="email">{t('portal_appointments.reminder.channel_email')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminder-time">{t('portal_appointments.reminder.send_at')}</Label>
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
              <Label htmlFor="reminder-message">{t('portal_appointments.reminder.message_optional')}</Label>
              <Textarea
                id="reminder-message"
                value={reminderForm.message}
                onChange={(event) =>
                  setReminderForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder={t('portal_appointments.reminder.message_placeholder')}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setReminderModal({ open: false })}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleReminderSubmit} disabled={submittingReminder}>
              {submittingReminder ? t('portal_appointments.reminder.scheduling') : t('portal_appointments.reminder.schedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
