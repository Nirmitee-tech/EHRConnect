'use client';

/**
 * ============================================================================
 * PUBLIC BOOKING WIDGET
 * ============================================================================
 *
 * This is a public, unauthenticated appointment booking widget that allows
 * patients to book appointments directly through a unique URL.
 *
 * URL STRUCTURE:
 * --------------
 * Base: /widget/booking?org=<org-slug>
 * With Provider Filter: /widget/booking?org=<org-slug>&provider=<provider-id>
 *
 * EXAMPLES:
 * - https://app.ehrconnect.com/widget/booking?org=athena-health
 * - https://app.ehrconnect.com/widget/booking?org=athena-health&provider=dr-john-smith
 *
 * HOW IT WORKS:
 * -------------
 * 1. URL Parameters:
 *    - 'org' (required): Organization slug - restricts widget to that organization
 *    - 'provider' (optional): Provider ID - pre-filters to show only that provider
 *
 * 2. Multi-Step Booking Flow:
 *    Step 1: Patient Information & Appointment Preferences
 *      - Patient enters: name, email, phone, DOB
 *      - Selects: appointment type, duration, mode, location
 *      - System checks if patient exists or creates new patient record
 *
 *    Step 2: Provider & Time Slot Selection
 *      - Shows available providers (filtered by org, optionally by provider param)
 *      - Calendar shows available dates
 *      - Time slots displayed for selected provider
 *      - Real-time availability checking
 *
 *    Step 3: Confirmation
 *      - Review booking details
 *      - Enter reason for visit
 *      - Confirm and create appointment
 *
 * 3. Backend Integration:
 *    All data is fetched from the backend - NO HARDCODED DATA
 *    - GET /api/public/v2/widget/organization/:slug - Organization details (name, logo, settings)
 *    - GET /api/public/v2/widget/appointment-types?org_id=xxx - Appointment types for org
 *    - GET /api/public/v2/widget/locations?org_id=xxx - Locations for org
 *    - GET /api/public/v2/widget/practitioners?org_id=xxx - Providers (filtered if provider param)
 *    - GET /api/public/v2/widget/slots?org_id=xxx&date=YYYY-MM-DD - Available time slots
 *    - POST /api/public/v2/widget/check-or-create-patient - Check/create patient
 *    - POST /api/public/v2/book-appointment - Create appointment
 *
 * 4. Organization Settings:
 *    Organizations can configure booking widget through their settings:
 *    - Appointment types and durations
 *    - Locations
 *    - Min/max booking advance time
 *    - Required fields
 *    - Booking confirmation messages
 *
 * SECURITY & VALIDATION:
 * ----------------------
 * - No authentication required (public widget)
 * - Organization ID extracted from URL slug and validated
 * - All data scoped to specific organization
 * - Provider filtering ensures only org's providers are shown
 * - Slot availability checked in real-time
 * - Patient data validated before submission
 *
 * CUSTOMIZATION:
 * --------------
 * - Branding: Organization name and logo from database
 * - Colors: Can be extended to use org's theme colors
 * - Fields: Configurable through org settings
 * - Appointment types: Org-specific types and durations
 *
 * NOTES:
 * ------
 * - This widget does NOT use NextAuth session (public/unauthenticated)
 * - All API calls use org_id extracted from the org slug parameter
 * - Widget is responsive and mobile-friendly
 * - Loading states and error handling for all API calls
 * - Date/time handling uses user's local timezone
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, ArrowRight, CheckCircle2, ChevronRight, AlertCircle, Loader2, Info, Download, Shield } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  dob: string;
}

interface AppointmentPreferences {
  appointmentType: string;
  duration: string;
  mode: string;
  location: string;
}

interface OrganizationInfo {
  id: string;
  name: string;
  logo_url?: string;
  slug: string;
  booking_settings?: {
    enabled: boolean;
    require_reason: boolean;
    default_duration: number;
    min_advance_hours: number;
    max_advance_days: number;
  };
}

interface AppointmentType {
  code: string;
  display: string;
  duration: number;
  description?: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
  address?: {
    line: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  type?: string;
}

interface Provider {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  qualification: string;
  specialty?: string;
  photo?: string;
  initials: string;
  active: boolean;
  slotsAvailable?: number;
  slots?: Slot[];
}

interface Slot {
  start: string;
  end: string;
  duration: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BookingWidget() {
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // URL Parameters
  const orgSlug = searchParams.get('org');
  const providerFilter = searchParams.get('provider');

  // Step Management
  const [step, setStep] = useState(1);

  // Organization Data
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | null>(null);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Form Data
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    email: '',
    phone: '',
    dob: '',
  });
  const [preferences, setPreferences] = useState<AppointmentPreferences>({
    appointmentType: '',
    duration: '30',
    mode: 'At Clinic',
    location: '',
  });

  // Provider & Slot Selection
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());

  // Confirmation
  const [reason, setReason] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Success State
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // ========================================
  // API CALLS
  // ========================================

  /**
   * Fetch organization details by slug
   * Called on component mount with org parameter from URL
   */
  const fetchOrganization = async () => {
    if (!orgSlug) {
      setError('Organization parameter is missing. Please use a valid booking URL.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/public/v2/widget/organization/${orgSlug}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Organization not found');
      }

      setOrgInfo(data.organization);

      // Set default duration from org settings
      if (data.organization.booking_settings?.default_duration) {
        setPreferences(prev => ({
          ...prev,
          duration: data.organization.booking_settings.default_duration.toString()
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load organization details');
    }
  };

  /**
   * Fetch appointment types for the organization
   */
  const fetchAppointmentTypes = async () => {
    if (!orgInfo?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/public/v2/widget/appointment-types?org_id=${orgInfo.id}`);
      const data = await response.json();

      if (data.success) {
        setAppointmentTypes(data.appointmentTypes);
        // Set first type as default if available
        if (data.appointmentTypes.length > 0 && !preferences.appointmentType) {
          setPreferences(prev => ({
            ...prev,
            appointmentType: data.appointmentTypes[0].code,
            duration: data.appointmentTypes[0].duration.toString()
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching appointment types:', err);
    }
  };

  /**
   * Fetch locations for the organization
   */
  const fetchLocations = async () => {
    if (!orgInfo?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/public/v2/widget/locations?org_id=${orgInfo.id}`);
      const data = await response.json();

      if (data.success) {
        setLocations(data.locations);
        // Set first location as default
        if (data.locations.length > 0 && !preferences.location) {
          setPreferences(prev => ({
            ...prev,
            location: data.locations[0].id
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  /**
   * Fetch practitioners with slot availability for selected date
   */
  const fetchProvidersWithSlots = async () => {
    if (!orgInfo?.id) return;

    setLoadingSlots(true);
    try {
      // Format date as YYYY-MM-DD
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

      // Fetch providers with slots
      const response = await fetch(
        `${API_URL}/api/public/v2/widget/slots?org_id=${orgInfo.id}&date=${dateStr}${providerFilter ? `&provider=${providerFilter}` : ''}`
      );
      const data = await response.json();

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
          slots: p.availableSlots
        }));

        setProviders(providersWithSlots);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  /**
   * Check if patient exists or create new patient
   * Called when moving from Step 1 to Step 2
   */
  const checkOrCreatePatient = async () => {
    if (!orgInfo?.id) return false;

    try {
      const response = await fetch(`${API_URL}/api/public/v2/widget/check-or-create-patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgInfo.id
        },
        body: JSON.stringify({
          name: patientInfo.name,
          email: patientInfo.email,
          phone: patientInfo.phone,
          dob: patientInfo.dob,
          org_id: orgInfo.id
        })
      });

      const data = await response.json();

      if (data.success && data.patient) {
        setPatientId(data.patient.id);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking/creating patient:', err);
      return false;
    }
  };

  /**
   * Create appointment booking
   * Called on final confirmation
   */
  const createAppointment = async () => {
    if (!orgInfo?.id || !patientId || !selectedProvider || !selectedSlot) {
      setError('Missing required information');
      return;
    }

    setSubmitting(true);
    try {
      // Parse the selected slot to get start time
      const selectedSlotObj = providers
        .find(p => p.id === selectedProvider)
        ?.slots?.find(s => s.start === selectedSlot);

      if (!selectedSlotObj) {
        throw new Error('Selected slot not found');
      }

      const response = await fetch(`${API_URL}/api/public/v2/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgInfo.id
        },
        body: JSON.stringify({
          org_id: orgInfo.id,
          patientId: patientId,
          practitionerId: selectedProvider,
          startTime: selectedSlotObj.start,
          endTime: selectedSlotObj.end,
          appointmentType: preferences.appointmentType,
          reason: reason
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      // Success! Show confirmation screen
      setBookingDetails({
        appointmentId: data.appointmentId,
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        providerName: providers.find(p => p.id === selectedProvider)?.name,
        date: new Date(currentYear, currentMonth, selectedDate),
        time: selectedSlot,
        location: locations.find(l => l.id === preferences.location)?.name,
        duration: preferences.duration
      });
      setBookingSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Initialize widget on mount
   * Fetches organization details and related data
   */
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchOrganization();
      setLoading(false);
    };
    initialize();
  }, [orgSlug]);

  /**
   * Fetch appointment types and locations when org info is loaded
   */
  useEffect(() => {
    if (orgInfo) {
      fetchAppointmentTypes();
      fetchLocations();
    }
  }, [orgInfo]);

  /**
   * Fetch providers with slots when date changes (Step 2)
   */
  useEffect(() => {
    if (step === 2 && orgInfo) {
      fetchProvidersWithSlots();
    }
  }, [step, orgInfo, currentMonth, currentYear, selectedDate]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (date: number) => {
    setSelectedDate(date);
    // Reset provider and slot selection when date changes
    setSelectedProvider('');
    setSelectedSlot('');
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate Step 1 fields
      if (!patientInfo.name || !patientInfo.email || !patientInfo.phone || !patientInfo.dob) {
        setError('Please fill in all required fields');
        return;
      }
      if (!preferences.appointmentType || !preferences.location) {
        setError('Please select appointment type and location');
        return;
      }

      // Check or create patient
      setLoading(true);
      const success = await checkOrCreatePatient();
      setLoading(false);

      if (!success) {
        setError('Failed to verify patient information');
        return;
      }

      setError(null);
      setStep(2);
    } else if (step === 2) {
      // Validate Step 2 selections
      if (!selectedProvider || !selectedSlot) {
        setError('Please select a provider and time slot');
        return;
      }

      setError(null);
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    }
  };

  const handleConfirm = async () => {
    if (orgInfo?.booking_settings?.require_reason && !reason.trim()) {
      setError('Please provide a reason for your visit');
      return;
    }

    await createAppointment();
  };

  // Update duration when appointment type changes
  const handleAppointmentTypeChange = (typeCode: string) => {
    const selectedType = appointmentTypes.find(t => t.code === typeCode);
    setPreferences({
      ...preferences,
      appointmentType: typeCode,
      duration: selectedType?.duration.toString() || preferences.duration
    });
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const formatTimeSlot = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatSelectedDate = () => {
    return new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate .ics calendar file for download
  const generateCalendarFile = () => {
    if (!bookingDetails) return;

    const startDate = new Date(bookingDetails.time);
    const endDate = new Date(startDate.getTime() + parseInt(bookingDetails.duration) * 60000);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EHRConnect//Booking Widget//EN
BEGIN:VEVENT
UID:${bookingDetails.appointmentId}@ehrconnect.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Medical Appointment with ${bookingDetails.providerName}
DESCRIPTION:Appointment with ${bookingDetails.providerName} at ${orgInfo?.name}
LOCATION:${bookingDetails.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appointment-${bookingDetails.appointmentId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========================================
  // LOADING & ERROR STATES
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-base text-gray-700 font-semibold">Loading booking widget...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error && !orgInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Error Loading Widget</h2>
          <p className="text-sm text-gray-700 text-center">{error}</p>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Please check your booking URL or contact the organization.
          </p>
        </div>
      </div>
    );
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
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Appointment Confirmed
            </h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              We've sent a confirmation email to <span className="font-semibold text-gray-900">{bookingDetails.patientEmail}</span>
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
                      {bookingDetails.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
                onClick={() => window.location.href = `/widget/booking?org=${orgSlug}`}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Book Another Appointment
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header with Trust Signals */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {orgInfo?.logo_url ? (
              <img
                src={orgInfo.logo_url}
                alt={orgInfo.name}
                className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-blue-100"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {orgInfo?.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{orgInfo?.name}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Secure Online Booking
              </p>
            </div>
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

      {/* Error Banner */}
      {error && orgInfo && (
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
        {/* Step 1: Patient Info & Preferences Combined */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Patient Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Information</h2>
              <p className="text-sm text-gray-600 mb-6">We need this to find or create your medical record</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    Full Name <span className="text-red-500">*</span>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        Required to identify you in our system and for insurance purposes
                      </div>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    Email Address <span className="text-red-500">*</span>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        We'll send appointment confirmations and reminders to this email
                      </div>
                    </div>
                  </label>
                  <input
                    type="email"
                    value={patientInfo.email}
                    onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    placeholder="john.smith@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    Phone Number <span className="text-red-500">*</span>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        For appointment reminders and urgent communications from your provider
                      </div>
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    Date of Birth <span className="text-red-500">*</span>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        Required for patient identification and age-appropriate care
                      </div>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={patientInfo.dob}
                    onChange={(e) => setPatientInfo({ ...patientInfo, dob: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm hover:border-gray-400"
                    required
                  />
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
                  {preferences.appointmentType && appointmentTypes.find(t => t.code === preferences.appointmentType)?.description && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {appointmentTypes.find(t => t.code === preferences.appointmentType)?.description}
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
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  {preferences.location && locations.find(l => l.id === preferences.location)?.address && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {(() => {
                        const addr = locations.find(l => l.id === preferences.location)?.address;
                        return `${addr?.line}, ${addr?.city}, ${addr?.state} ${addr?.postalCode}`;
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
                {formatSelectedDate()} • {locations.find(l => l.id === preferences.location)?.name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 divide-x divide-gray-200">
              {/* Calendar - Moved to LEFT */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Select Date</h3>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180 text-gray-700" />
                    </button>
                    <p className="font-bold text-base text-gray-900">{monthNames[currentMonth]} {currentYear}</p>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                    >
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
                      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
                      const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
                      const today = new Date();
                      const currentDay = today.getDate();
                      const currentMonthToday = today.getMonth();
                      const currentYearToday = today.getFullYear();

                      const cells = [];

                      // Empty cells before month starts
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`empty-${i}`} className="py-2" />);
                      }

                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const isSelected = day === selectedDate;
                        const isPast =
                          currentYear < currentYearToday ||
                          (currentYear === currentYearToday && currentMonth < currentMonthToday) ||
                          (currentYear === currentYearToday && currentMonth === currentMonthToday && day < currentDay);
                        const hasSlots = !isPast;

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
                        );
                      }

                      return cells;
                    })()}
                  </div>
                </div>

                {/* Location Info */}
                {preferences.location && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">APPOINTMENT LOCATION</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {locations.find(l => l.id === preferences.location)?.name}
                        </p>
                        {locations.find(l => l.id === preferences.location)?.address && (
                          <p className="text-xs text-gray-600 mt-1">
                            {(() => {
                              const addr = locations.find(l => l.id === preferences.location)?.address;
                              return `${addr?.line}, ${addr?.city}, ${addr?.state} ${addr?.postalCode}`;
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Providers List - Moved to RIGHT */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Available Providers</h3>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  </div>
                ) : providers.filter(p => (p.slotsAvailable || 0) > 0).length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-base text-gray-700 font-bold">No providers available</p>
                    <p className="text-sm text-gray-500 mt-1">Please try a different date</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {providers.filter(p => (p.slotsAvailable || 0) > 0).map((provider) => (
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
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                (provider.slotsAvailable || 0) > 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                              }`}>
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
                          {selectedProvider === provider.id && (provider.slotsAvailable || 0) > 0 && provider.slots && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-3">Available Times</p>
                              <div className="grid grid-cols-3 gap-2">
                                {provider.slots.map((slot) => (
                                  <button
                                    key={slot.start}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSlot(slot.start);
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
                      {patientInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{patientInfo.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{patientInfo.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">{providers.find(p => p.id === selectedProvider)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">{new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">{selectedSlot && formatTimeSlot(selectedSlot)} ({preferences.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="truncate font-medium text-sm">{locations.find(l => l.id === preferences.location)?.name}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Visit
                  {orgInfo?.booking_settings?.require_reason && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-none hover:border-gray-400"
                  rows={4}
                  placeholder="Please describe the reason for your visit..."
                  required={orgInfo?.booking_settings?.require_reason}
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
  );
}
