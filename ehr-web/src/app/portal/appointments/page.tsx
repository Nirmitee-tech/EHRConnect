'use client'

import { useEffect, useMemo, useState } from 'react'
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
  ClipboardCheck,
  BellRing,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export const dynamic = 'force-dynamic'

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

export default function PatientAppointmentsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t } = useTranslation('common')
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [checkInModal, setCheckInModal] = useState<{ open: boolean; appointment: any | null }>({
    open: false,
    appointment: null,
  })
  const [checkInForm, setCheckInForm] = useState({
    contactPhone: '',
    contactEmail: '',
    arrivalMethod: 'in-person',
    symptoms: [] as string[],
    medicationsUpdated: true,
    insuranceConfirmed: true,
    consentsAccepted: true,
    pharmacyPreference: '',
    requiresAssistance: false,
    questions: '',
  })
  const [customSymptom, setCustomSymptom] = useState('')
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false)
  const [reminderModal, setReminderModal] = useState<{ open: boolean; appointment: any | null }>({
    open: false,
    appointment: null,
  })
  const [reminderForm, setReminderForm] = useState({
    channel: 'sms',
    sendAt: '',
    message: '',
  })
  const [submittingReminder, setSubmittingReminder] = useState(false)

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

  const formatDateInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm")

  const hasCompletedCheckIn = (appointment: any) =>
    Array.isArray(appointment.extension) &&
    appointment.extension.some((ext: any) => ext.url === CHECK_IN_EXTENSION_URL)

  const hasActiveReminder = (appointment: any) =>
    Array.isArray(appointment.extension) &&
    appointment.extension.some((ext: any) => ext.url === REMINDER_EXTENSION_URL)

  const canCompleteCheckIn = (appointment: any) => {
    if (!appointment.start) return false
    const start = new Date(appointment.start)
    const now = new Date()
    const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
    return (
      filter !== 'past' &&
      !hasCompletedCheckIn(appointment) &&
      hoursUntil < 48 &&
      hoursUntil > -3
    )
  }

  const openCheckInDialog = (appointment: any) => {
    setCheckInModal({ open: true, appointment })
    setCheckInForm({
      contactPhone: '',
      contactEmail: session?.user?.email || '',
      arrivalMethod: appointment.serviceType?.[0]?.text?.toLowerCase().includes('virtual')
        ? 'virtual'
        : 'in-person',
      symptoms: [],
      medicationsUpdated: true,
      insuranceConfirmed: true,
      consentsAccepted: true,
      pharmacyPreference: '',
      requiresAssistance: false,
      questions: '',
    })
    setCustomSymptom('')
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
    if (!checkInModal.appointment) return
    try {
      setSubmittingCheckIn(true)
      const response = await fetch(
        `/api/patient/appointments/${checkInModal.appointment.id}/check-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkInForm),
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || t('portal_appointments.check_in.error_unable_to_complete'))
      }

      const data = await response.json()
      setAppointments((prev) =>
        prev.map((appointment) => (appointment.id === data.appointment.id ? data.appointment : appointment))
      )
      setCheckInModal({ open: false, appointment: null })
      toast({
        title: t('portal_appointments.check_in.toast_confirmed_title'),
        description: t('portal_appointments.check_in.toast_confirmed_description'),
      })
    } catch (error: any) {
      toast({
        title: t('portal_appointments.check_in.toast_failed_title'),
        description: error.message || t('portal_appointments.check_in.error_unable_to_submit'),
        variant: 'destructive',
      })
    } finally {
      setSubmittingCheckIn(false)
    }
  }

  const openReminderDialog = (appointment: any) => {
    const start = appointment.start ? new Date(appointment.start) : null
    const defaultReminder = start
      ? formatDateInput(new Date(start.getTime() - 60 * 60 * 1000))
      : ''
    setReminderModal({ open: true, appointment })
    setReminderForm({
      channel: appointment.serviceType?.[0]?.text?.toLowerCase().includes('virtual') ? 'email' : 'sms',
      sendAt: defaultReminder,
      message: '',
    })
  }

  const handleReminderSubmit = async () => {
    if (!reminderModal.appointment) return
    if (!reminderForm.sendAt) {
      toast({
        title: t('portal_appointments.reminder.toast_time_required_title'),
        description: t('portal_appointments.reminder.toast_time_required_description'),
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmittingReminder(true)
      const response = await fetch(
        `/api/patient/appointments/${reminderModal.appointment.id}/reminders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...reminderForm,
            sendAt: new Date(reminderForm.sendAt).toISOString(),
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || t('portal_appointments.error_unable_to_schedule_reminder'))
      }

      setReminderModal({ open: false, appointment: null })
      toast({
        title: t('portal_appointments.reminder.toast_scheduled_title'),
        description: t('portal_appointments.reminder.toast_scheduled_description'),
      })
    } catch (error: any) {
      toast({
        title: t('portal_appointments.reminder.toast_failed_title'),
        description: error.message || t('portal_appointments.error_unable_to_schedule_reminder'),
        variant: 'destructive',
      })
    } finally {
      setSubmittingReminder(false)
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (!searchQuery) return true
      const searchLower = searchQuery.toLowerCase()
      const practitioner =
        apt.participant?.find((p: any) => p.actor?.reference?.includes('Practitioner'))?.actor?.display || ''
      const serviceType = apt.serviceType?.[0]?.text || ''
      return (
        practitioner.toLowerCase().includes(searchLower) ||
        serviceType.toLowerCase().includes(searchLower)
      )
    })
  }, [appointments, searchQuery])

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
                          <div className="flex flex-wrap gap-2 pt-1">
                            {hasCompletedCheckIn(appointment) && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Check-in complete
                              </Badge>
                            )}
                            {hasActiveReminder(appointment) && (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                <BellRing className="w-3 h-3 mr-1" />
                                Reminder scheduled
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end">
                          {appointment.status === 'booked' && appointmentType.icon === Video && (
                            <Button
                              size="sm"
                              className="text-white"
                              style={{ backgroundColor: '#1B2156' }}
                              asChild
                            >
                              <Link href={`/portal/telehealth/${appointment.id}`}>
                                <Video className="w-3.5 h-3.5 mr-1.5" />
                                Join Visit
                              </Link>
                            </Button>
                          )}
                          {canCompleteCheckIn(appointment) && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              onClick={() => openCheckInDialog(appointment)}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                              Check in
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-700"
                            onClick={() => openReminderDialog(appointment)}
                          >
                            <BellRing className="w-3.5 h-3.5 mr-1.5" />
                            Reminder
                          </Button>
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

      {/* Digital Check-In */}
      <Dialog
        open={checkInModal.open}
        onOpenChange={(open) =>
          setCheckInModal({ open, appointment: open ? checkInModal.appointment : null })
        }
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
            <div className="space-y-2">
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
            <Button
              variant="outline"
              onClick={() => setCheckInModal({ open: false, appointment: null })}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCheckInSubmit}
              className="w-full sm:w-auto"
              disabled={submittingCheckIn}
            >
              {submittingCheckIn ? t('portal_appointments.check_in.submitting') : t('portal_appointments.check_in.complete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog
        open={reminderModal.open}
        onOpenChange={(open) =>
          setReminderModal({ open, appointment: open ? reminderModal.appointment : null })
        }
      >
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
            <Button
              variant="outline"
              onClick={() => setReminderModal({ open: false, appointment: null })}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleReminderSubmit}
              className="w-full sm:w-auto"
              disabled={submittingReminder}
            >
              {submittingReminder ? t('portal_appointments.reminder.scheduling') : t('portal_appointments.reminder.schedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
