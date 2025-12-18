'use client'

/**
 * Patient Portal Appointment Booking
 * ===================================
 * Integrated booking widget with pre-filled patient information
 * Uses the same UI as /widget/booking but with authenticated patient data
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  Info,
  Download,
  Shield,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PatientInfo {
  id: string
  name: string
  email: string
  phone: string
  dob: string
}

interface AppointmentPreferences {
  appointmentType: string
  duration: string
  mode: string
  location: string
}

interface AppointmentType {
  code: string
  display: string
  duration: number
  description?: string
  name?: string
}

interface Location {
  id: string
  name: string
  description?: string
  address?: {
    line: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  phone?: string
  type?: string
}

interface Provider {
  id: string
  name: string
  firstName?: string
  lastName?: string
  qualification: string
  specialty?: string
  photo?: string
  initials: string
  active: boolean
  slotsAvailable?: number
  slots?: Slot[]
}

interface Slot {
  start: string
  end: string
  duration: number
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BookAppointmentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const orgIdFromSession = (session as Record<string, unknown> | null)?.org_id as
    | string
    | undefined
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Step Management
  const [step, setStep] = useState(1)

  // Patient Data (prefilled from session)
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [preferences, setPreferences] = useState<AppointmentPreferences>({
    appointmentType: '',
    duration: '30',
    mode: 'At Clinic',
    location: '',
  })

  // Organization Data
  const [orgId, setOrgId] = useState<string>('')
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // Provider & Slot Selection
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())

  // Confirmation
  const [reason, setReason] = useState<string>('')

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Success State
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  // ========================================
  // API CALLS
  // ========================================

  /**
   * Fetch patient profile from authenticated session
   */
  const fetchPatientProfile = async () => {
    try {
      const response = await fetch('/api/patient/profile')
      const data = await response.json()

      if (!response.ok || !data.patient) {
        throw new Error('Failed to fetch patient profile')
      }

      // Extract patient information
      const patient = data.patient
      const name = patient.name?.[0]
      const telecom = patient.telecom || []

      setPatientInfo({
        id: patient.id,
        name: name ? `${name.given?.[0] || ''} ${name.family || ''}`.trim() : '',
        email: telecom.find((t: any) => t.system === 'email')?.value || '',
        phone: telecom.find((t: any) => t.system === 'phone')?.value || '',
        dob: patient.birthDate || '',
      })

      // Get organization ID from API response (from session)
      const derivedOrgId =
        data.orgId ||
        orgIdFromSession ||
        (patient.managingOrganization?.reference
          ? patient.managingOrganization.reference.match(/Organization\/(.+)/)?.[1]
          : undefined)

      if (derivedOrgId) {
        setOrgId(derivedOrgId)
      } else {
        setError(
          'Your organization is not configured for online booking yet. Please contact support.'
        )
      }
    } catch (err: any) {
      console.error('Error fetching patient profile:', err)
      setError('Failed to load patient information')
    }
  }

  /**
   * Fetch appointment types for the organization
   */
  const fetchAppointmentTypes = async () => {
    if (!orgId) return

    try {
      const response = await fetch(`${API_URL}/api/public/v2/widget/appointment-types?org_id=${orgId}`)
      const data = await response.json()

      if (data.success) {
        setAppointmentTypes(data.appointmentTypes)
        // Set first type as default if available
        if (data.appointmentTypes.length > 0 && !preferences.appointmentType) {
          setPreferences((prev) => ({
            ...prev,
            appointmentType: data.appointmentTypes[0].code,
            duration: data.appointmentTypes[0].duration.toString(),
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching appointment types:', err)
    }
  }

  /**
   * Fetch locations for the organization
   */
  const fetchLocations = async () => {
    if (!orgId) return

    try {
      const response = await fetch(`${API_URL}/api/public/v2/widget/locations?org_id=${orgId}`)
      const data = await response.json()

      if (data.success) {
        setLocations(data.locations)
        // Set first location as default
        if (data.locations.length > 0 && !preferences.location) {
          setPreferences((prev) => ({
            ...prev,
            location: data.locations[0].id,
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }

  /**
   * Fetch practitioners with slot availability for selected date
   */
  const fetchProvidersWithSlots = async () => {
    if (!orgId) return

    setLoadingSlots(true)
    try {
      // Format date as YYYY-MM-DD
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        selectedDate
      ).padStart(2, '0')}`

      // Fetch providers with slots
      const response = await fetch(`${API_URL}/api/public/v2/widget/slots?org_id=${orgId}&date=${dateStr}`)
      const data = await response.json()

      if (data.success && data.practitioners) {
        // Map API response to our Provider interface
        const providersWithSlots: Provider[] = data.practitioners.map((p: any) => ({
          id: p.practitionerId,
          name: p.practitionerName,
          qualification: p.specialty || 'Healthcare Provider',
          specialty: p.specialty,
          initials: p.practitionerName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2),
          active: true,
          slotsAvailable: p.totalSlots,
          slots: p.availableSlots,
        }))

        setProviders(providersWithSlots)
      }
    } catch (err) {
      console.error('Error fetching providers:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

  /**
   * Create appointment booking
   */
  const createAppointment = async () => {
    if (!orgId || !patientInfo?.id || !selectedProvider || !selectedSlot) {
      setError('Missing required information')
      return
    }

    setSubmitting(true)
    try {
      // Parse the selected slot to get start time
      const selectedSlotObj = providers
        .find((p) => p.id === selectedProvider)
        ?.slots?.find((s) => s.start === selectedSlot)

      if (!selectedSlotObj) {
        throw new Error('Selected slot not found')
      }

      const serviceTypeText =
        appointmentTypes.find((type) => type.code === preferences.appointmentType)?.name ||
        preferences.appointmentType

      const response = await fetch('/api/patient/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: selectedProvider,
          serviceType: serviceTypeText,
          start: selectedSlotObj.start,
          end: selectedSlotObj.end,
          reason: reason,
        }),
      })

      const appointment = await response.json()

      if (!response.ok) {
        throw new Error(appointment?.message || 'Failed to create appointment')
      }

      // Success! Show confirmation screen
      setBookingDetails({
        appointmentId: appointment.id,
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        providerName: providers.find((p) => p.id === selectedProvider)?.name,
        date: appointment.start ? new Date(appointment.start) : new Date(currentYear, currentMonth, selectedDate),
        time: appointment.start || selectedSlot,
        location:
          locations.find((l) => l.id === preferences.location)?.name ||
          appointment.participant?.find((participant: any) =>
            participant.actor?.reference?.startsWith('Location/')
          )?.actor?.display ||
          'To be announced',
        duration:
          appointment.minutesDuration?.toString() ||
          preferences.duration ||
          (selectedSlotObj.end && selectedSlotObj.start
            ? `${(new Date(selectedSlotObj.end).getTime() - new Date(selectedSlotObj.start).getTime()) / 60000}`
            : '30'),
      })
      setBookingSuccess(true)

      toast({
        title: 'Appointment Booked!',
        description: 'Your appointment has been successfully scheduled.',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment')
      toast({
        title: 'Booking Failed',
        description: err.message || 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Initialize on mount - fetch patient profile
   */
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      await fetchPatientProfile()
      setLoading(false)
    }
    initialize()
  }, [orgIdFromSession])

  useEffect(() => {
    if (!orgId && orgIdFromSession) {
      setOrgId(orgIdFromSession)
    }
  }, [orgId, orgIdFromSession])

  /**
   * Fetch appointment types and locations when org ID is loaded
   */
  useEffect(() => {
    if (orgId) {
      fetchAppointmentTypes()
      fetchLocations()
    }
  }, [orgId])

  /**
   * Fetch providers with slots when date changes (Step 2)
   */
  useEffect(() => {
    if (step === 2 && orgId) {
      fetchProvidersWithSlots()
    }
  }, [step, orgId, currentMonth, currentYear, selectedDate])

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateSelect = (date: number) => {
    setSelectedDate(date)
    // Reset provider and slot selection when date changes
    setSelectedProvider('')
    setSelectedSlot('')
  }

  const handleNext = async () => {
    if (!orgId) {
      setError('We could not determine your organization. Please contact support.')
      return
    }
    if (step === 1) {
      // Validate Step 1 fields
      if (!preferences.appointmentType || !preferences.location) {
        setError('Please select appointment type and location')
        return
      }

      setError(null)
      setStep(2)
    } else if (step === 2) {
      // Validate Step 2 selections
      if (!selectedProvider || !selectedSlot) {
        setError('Please select a provider and time slot')
        return
      }

      setError(null)
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setError(null)
      setStep(step - 1)
    }
  }

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for your visit')
      return
    }

    await createAppointment()
  }

  // Update duration when appointment type changes
  const handleAppointmentTypeChange = (typeCode: string) => {
    const selectedType = appointmentTypes.find((t) => t.code === typeCode)
    setPreferences({
      ...preferences,
      appointmentType: typeCode,
      duration: selectedType?.duration.toString() || preferences.duration,
    })
  }

  // ========================================
  // RENDER HELPERS
  // ========================================

  const formatTimeSlot = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatSelectedDate = () => {
    return new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Generate .ics calendar file for download
  const generateCalendarFile = () => {
    if (!bookingDetails) return

    const startDate = new Date(bookingDetails.time)
    const endDate = new Date(startDate.getTime() + parseInt(bookingDetails.duration) * 60000)

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EHRConnect//Patient Portal//EN
BEGIN:VEVENT
UID:${bookingDetails.appointmentId}@ehrconnect.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Medical Appointment with ${bookingDetails.providerName}
DESCRIPTION:Appointment with ${bookingDetails.providerName}
LOCATION:${bookingDetails.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `appointment-${bookingDetails.appointmentId}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ========================================
  // LOADING & ERROR STATES
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-base text-gray-700 font-semibold">Loading booking form...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (error && !patientInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Error Loading Profile</h2>
          <p className="text-sm text-gray-700 text-center">{error}</p>
          <button
            onClick={() => router.push('/portal/dashboard')}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  // Success Screen
  if (bookingSuccess && bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Appointment Confirmed</h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              We've sent a confirmation email to{' '}
              <span className="font-semibold text-gray-900">{bookingDetails.patientEmail}</span>
            </p>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-200">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Patient</p>
                  <p className="text-base font-bold text-gray-900">{bookingDetails.patientName}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Provider</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{bookingDetails.providerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Date & Time</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {bookingDetails.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatTimeSlot(bookingDetails.time)} ({bookingDetails.duration} minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Location</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{bookingDetails.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={generateCalendarFile}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Add to Calendar
              </button>

              <button
                onClick={() => router.push('/portal/appointments')}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                View All Appointments
              </button>
            </div>

            {/* Appointment ID */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Confirmation Number</p>
              <p className="text-sm font-mono font-bold text-gray-900">{bookingDetails.appointmentId}</p>
            </div>

            {/* HIPAA Notice */}
            <div className="mt-6 flex items-start gap-2 text-xs text-gray-600">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                Your health information is protected under HIPAA. We will only use your data for healthcare purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-sm text-gray-600">Schedule a visit with your healthcare provider</p>
            </div>
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? 'bg-blue-600 w-16 shadow-md' : s < step ? 'bg-green-500 w-10' : 'bg-gray-200 w-10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && patientInfo && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Patient Info (Prefilled) & Preferences */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Patient Info (Read-only, prefilled) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Information</h2>
              <p className="text-sm text-gray-600 mb-6">Your patient information from your profile</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-900">
                    {patientInfo?.name || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-900">
                    {patientInfo?.email || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-900">
                    {patientInfo?.phone || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-900">
                    {patientInfo?.dob ? format(new Date(patientInfo.dob), 'MMMM d, yyyy') : 'Not provided'}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Update your information in{' '}
                    <a href="/portal/profile" className="text-blue-600 hover:underline font-medium">
                      Profile Settings
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Appointment Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Appointment Details</h2>
              <p className="text-sm text-gray-600 mb-6">Select your appointment preferences</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Appointment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={preferences.appointmentType}
                    onChange={(e) => handleAppointmentTypeChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    required
                  >
                    <option value="">Select type</option>
                    {appointmentTypes.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.display} ({type.duration} min)
                      </option>
                    ))}
                  </select>
                  {preferences.appointmentType &&
                    appointmentTypes.find((t) => t.code === preferences.appointmentType)?.description && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {appointmentTypes.find((t) => t.code === preferences.appointmentType)?.description}
                      </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={`${preferences.duration} min`}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-semibold text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mode</label>
                    <select
                      value={preferences.mode}
                      onChange={(e) => setPreferences({ ...preferences, mode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    >
                      <option value="At Clinic">At Clinic</option>
                      <option value="Telemedicine">Telemedicine</option>
                      <option value="Home Visit">Home Visit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={preferences.location}
                    onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  {preferences.location && locations.find((l) => l.id === preferences.location)?.address && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {(() => {
                        const addr = locations.find((l) => l.id === preferences.location)?.address
                        return `${addr?.line}, ${addr?.city}, ${addr?.state} ${addr?.postalCode}`
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Timezone</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-semibold text-gray-600"
                    disabled
                  >
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Provider & Slot Selection */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-6 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Provider & Time</h2>
              <p className="text-sm text-gray-600 font-medium">
                {formatSelectedDate()} • {locations.find((l) => l.id === preferences.location)?.name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 divide-x divide-gray-200">
              {/* Calendar - LEFT */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Select Date</h3>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-blue-50 rounded-lg transition-all">
                      <ChevronRight className="w-4 h-4 rotate-180 text-gray-700" />
                    </button>
                    <p className="font-bold text-base text-gray-900">
                      {monthNames[currentMonth]} {currentYear}
                    </p>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-blue-50 rounded-lg transition-all">
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-xs font-bold text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {(() => {
                      const daysInMonth = getDaysInMonth(currentMonth, currentYear)
                      const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
                      const today = new Date()
                      const currentDay = today.getDate()
                      const currentMonthToday = today.getMonth()
                      const currentYearToday = today.getFullYear()

                      const cells = []

                      // Empty cells before month starts
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`empty-${i}`} className="py-2" />)
                      }

                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const isSelected = day === selectedDate
                        const isPast =
                          currentYear < currentYearToday ||
                          (currentYear === currentYearToday && currentMonth < currentMonthToday) ||
                          (currentYear === currentYearToday &&
                            currentMonth === currentMonthToday &&
                            day < currentDay)
                        const hasSlots = !isPast

                        cells.push(
                          <button
                            key={day}
                            disabled={isPast}
                            onClick={() => handleDateSelect(day)}
                            className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : hasSlots
                                ? 'text-gray-900 hover:bg-blue-50 hover:text-blue-600'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      }

                      return cells
                    })()}
                  </div>
                </div>

                {/* Location Info */}
                {preferences.location && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                          APPOINTMENT LOCATION
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {locations.find((l) => l.id === preferences.location)?.name}
                        </p>
                        {locations.find((l) => l.id === preferences.location)?.address && (
                          <p className="text-xs text-gray-600 mt-1">
                            {(() => {
                              const addr = locations.find((l) => l.id === preferences.location)?.address
                              return `${addr?.line}, ${addr?.city}, ${addr?.state} ${addr?.postalCode}`
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Providers List - RIGHT */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Available Providers</h3>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  </div>
                ) : providers.filter((p) => (p.slotsAvailable || 0) > 0).length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-base text-gray-700 font-bold">No providers available</p>
                    <p className="text-sm text-gray-500 mt-1">Please try a different date</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {providers
                      .filter((p) => (p.slotsAvailable || 0) > 0)
                      .map((provider) => (
                        <div key={provider.id}>
                          <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedProvider === provider.id
                                ? 'border-blue-600 bg-blue-50 shadow-lg'
                                : (provider.slotsAvailable || 0) > 0
                                ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-md'
                                : 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-50'
                            }`}
                            onClick={() => (provider.slotsAvailable || 0) > 0 && setSelectedProvider(provider.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    (provider.slotsAvailable || 0) > 0
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-300 text-gray-500'
                                  }`}
                                >
                                  {provider.initials}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{provider.name}</p>
                                  <p className="text-xs text-gray-500 font-medium">{provider.qualification}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {(provider.slotsAvailable || 0) > 0 ? (
                                  <span className="text-xs font-semibold text-blue-600">
                                    {provider.slotsAvailable} slots
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 font-semibold">Unavailable</span>
                                )}
                              </div>
                            </div>

                            {/* Time Slots */}
                            {selectedProvider === provider.id &&
                              (provider.slotsAvailable || 0) > 0 &&
                              provider.slots && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-3">Available Times</p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {provider.slots.map((slot) => (
                                      <button
                                        key={slot.start}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedSlot(slot.start)
                                        }}
                                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                                          selectedSlot === slot.start
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                            : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-500'
                                        }`}
                                      >
                                        {formatTimeSlot(slot.start)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h2>

              {/* Summary Card */}
              <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-blue-200">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-base font-bold text-white">
                      {patientInfo?.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{patientInfo?.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{patientInfo?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {providers.find((p) => p.id === selectedProvider)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {selectedSlot && formatTimeSlot(selectedSlot)} ({preferences.duration} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="truncate font-medium text-sm">
                      {locations.find((l) => l.id === preferences.location)?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-none hover:border-gray-400"
                  rows={4}
                  placeholder="Please describe the reason for your visit..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Confirm Booking
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
