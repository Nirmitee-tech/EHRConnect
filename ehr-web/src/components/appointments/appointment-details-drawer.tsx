'use client';

import React, { useState } from 'react';
import { X, Phone, MapPin, MessageCircle, CreditCard, Clock, Edit3, UserX, UserCheck, XCircle, Copy, FileText, CheckCircle, Receipt, Mail, Bell, BellPlus, Send, FileDown, Pill, Calendar, Video } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { EncounterService } from '@/services/encounter.service';
import { useRouter } from 'next/navigation';
import { InstantMeetingButton } from '@/components/virtual-meetings/instant-meeting-button';
import { LiveCallIndicator } from '@/components/appointments/live-call-indicator';
import { useToast } from '@/hooks/useToast';

interface AppointmentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onMissed: (appointment: Appointment) => void;
  onCheckIn: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onCopy: (appointment: Appointment) => void;
  onStartEncounter?: (appointment: Appointment) => void;
  onAppointmentUpdated?: () => void;
  onCreateSuperbill?: (appointment: Appointment) => void;
}

export function AppointmentDetailsDrawer({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onMissed,
  onCheckIn,
  onCancel,
  onCopy,
  onStartEncounter,
  onAppointmentUpdated,
  onCreateSuperbill
}: AppointmentDetailsDrawerProps) {
  const router = useRouter();
  const toast = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);

  if (!isOpen || !appointment) return null;

  // Contact Actions
  const handleCall = () => {
    toast.info('Initiating call to +91 9767377819...');
    // In production: window.location.href = 'tel:+919767377819';
  };

  const handleMessage = () => {
    toast.success('Opening WhatsApp...');
    // In production: window.open('https://wa.me/919767377819', '_blank');
  };

  const handleEmail = () => {
    toast.info('Opening email client...');
    // In production: window.location.href = 'mailto:patient@email.com';
  };

  const handleMap = () => {
    toast.info('Opening maps to patient location...');
    // In production: window.open('https://maps.google.com/?q=patient+address', '_blank');
  };

  const handleSMS = () => {
    toast.success('SMS reminder sent successfully!');
    // In production: API call to send SMS
  };

  // Reminder Actions
  const handleSetReminder = () => {
    toast.success('Reminder set for 1 hour before appointment');
    // In production: API call to set reminder
  };

  const handleScheduleFollowUp = () => {
    toast.info('Opening follow-up scheduling...');
    // Navigate to appointments page with pre-fill
    router.push('/appointments?action=create&patientId=' + appointment.patientId);
  };

  // Patient Actions
  const handleSendPrescription = () => {
    toast.info('Opening prescription form...');
    router.push(`/prescriptions/create?patientId=${appointment.patientId}&appointmentId=${appointment.id}`);
  };

  const handleSendLabResults = () => {
    toast.info('Opening lab results...');
    router.push(`/lab-results?patientId=${appointment.patientId}`);
  };

  const handleSendDocuments = () => {
    toast.info('Opening document manager...');
    router.push(`/patients/${appointment.patientId}/documents`);
  };

  const handleShareVideoLink = () => {
    if (meetingCode) {
      const link = `${window.location.origin}/meeting/${meetingCode}`;
      navigator.clipboard.writeText(link);
      toast.success('Video link copied to clipboard!');
    } else {
      toast.warning('No active video call. Please start a video call first.');
    }
  };

  // Quick Links
  const handleViewPatientRecord = () => {
    router.push(`/patients/${appointment.patientId}`);
    onClose();
  };

  const handleViewMedicalHistory = () => {
    router.push(`/patients/${appointment.patientId}/history`);
    onClose();
  };

  const handleViewPrescriptions = () => {
    router.push(`/patients/${appointment.patientId}/prescriptions`);
    onClose();
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(d);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      return 'today';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleCompleteAppointment = async () => {
    setIsCompleting(true);
    try {
      // Check if an encounter exists for this appointment
      const { medplum } = await import('@/lib/medplum');
      const encounters = await medplum.searchResources('Encounter', {
        appointment: `Appointment/${appointment.id}`
      });

      if (encounters.length > 0) {
        // Encounter exists, show confirmation dialog
        setEncounterId(encounters[0].id!);
        setShowConfirmDialog(true);
      } else {
        // No encounter exists, create a minimal one
        const newEncounter = await EncounterService.createFromAppointment(appointment);
        setEncounterId(newEncounter.id);
        setShowConfirmDialog(true);
      }
    } catch (error) {
      console.error('Error checking/creating encounter:', error);
      alert('Failed to process appointment completion. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDocumentVisit = () => {
    if (encounterId) {
      router.push(`/encounters/${encounterId}`);
      onClose();
    }
  };

  const handleCompleteDirectly = async () => {
    if (!encounterId) return;

    try {
      setIsCompleting(true);
      await EncounterService.complete(encounterId);
      alert('Appointment completed successfully!');
      setShowConfirmDialog(false);
      onClose();
      // Trigger parent refresh to update appointment list
      onAppointmentUpdated?.();
    } catch (error) {
      console.error('Error completing encounter:', error);
      alert('Failed to complete appointment. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Auto-complete appointment when call ends
  const handleCallEnded = async () => {
    if (!autoCompleteEnabled) return;

    console.log('Call ended, auto-completing appointment...');

    try {
      // Auto-complete the appointment
      await handleCompleteAppointment();

      // Show notification
      alert('Video call ended. Appointment has been marked as completed.');

      // Refresh the appointment list
      onAppointmentUpdated?.();
    } catch (error) {
      console.error('Failed to auto-complete appointment:', error);
    }
  };

  const handleJoinLiveCall = () => {
    if (meetingCode) {
      const meetingUrl = `/meeting/${meetingCode}`;
      window.open(meetingUrl, '_blank');
    }
  };

  // Get patient initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get appointment type badge
  const getAppointmentTypeBadge = () => {
    const type = appointment.appointmentType?.toLowerCase() || 'general';
    if (type.includes('video') || type.includes('virtual') || type.includes('telehealth')) {
      return { label: 'Video Visit', color: 'bg-purple-100 text-purple-700' };
    }
    if (type.includes('urgent') || type.includes('emergency')) {
      return { label: 'Urgent', color: 'bg-red-100 text-red-700' };
    }
    if (type.includes('follow') || type.includes('followup')) {
      return { label: 'Follow-up', color: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'In-Person', color: 'bg-gray-100 text-gray-700' };
  };

  const appointmentBadge = getAppointmentTypeBadge();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-50 shadow-xl z-50 overflow-y-auto flex flex-col">
        {/* Header - Patient Info */}
        <div className="border-b border-gray-200 px-3 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            {/* Patient Avatar with Initials */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {getInitials(appointment.patientName)}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{appointment.patientName}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-500">#{appointment.id.substring(0, 8).toUpperCase()}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${appointmentBadge.color}`}>
                  {appointmentBadge.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Close"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Status - Segmented Control */}
        <div className="border-b border-gray-200 px-3 py-2 bg-white">
          <div className="text-[10px] font-medium text-gray-500 mb-1.5">Quick Status</div>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                onCheckIn(appointment);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-all"
              title="Mark patient as checked in"
            >
              <UserCheck className="h-3 w-3" />
              Check-In
            </button>
            <button
              onClick={() => {
                onMissed(appointment);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-all"
              title="Mark appointment as no-show"
            >
              <UserX className="h-3 w-3" />
              No-Show
            </button>
            <button
              onClick={() => {
                onCancel(appointment);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 transition-all"
              title="Cancel this appointment"
            >
              <XCircle className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </div>

        {/* Live Call Indicator */}
        {meetingCode && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <div className="border-b border-gray-200 px-3 py-2 bg-white">
            <LiveCallIndicator
              meetingCode={meetingCode}
              onMeetingEnded={handleCallEnded}
              onJoinCall={handleJoinLiveCall}
            />
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          {/* Contact Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700">Contact</div>
              <div className="text-[11px] text-gray-500">+91 9767377819</div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <button
                onClick={handleCall}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all"
                title="Call patient"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">Call</span>
              </button>
              <button
                onClick={handleMessage}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-theme-accent text-white rounded-md hover:opacity-90 transition-all"
                title="Send WhatsApp message"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">Message</span>
              </button>
              <button
                onClick={handleEmail}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
                title="Send email"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">Email</span>
              </button>
              <button
                onClick={handleMap}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
                title="View location"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">Map</span>
              </button>
            </div>
            <button
              onClick={handleSMS}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-theme-secondary/10 text-theme-secondary border border-theme-secondary/20 rounded-md hover:bg-theme-secondary/20 transition-all text-[11px] font-medium"
              title="Send SMS"
            >
              <Send className="h-3 w-3" />
              Send SMS Reminder
            </button>
          </div>

          {/* Appointment Details Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-semibold text-gray-900 mb-0.5">
                  {appointment.practitionerName}
                </div>
                <div className="text-[11px] text-gray-600">
                  {appointment.appointmentType || 'General Consultation'}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${appointment.status === 'scheduled' ? 'bg-slate-100 text-slate-700' :
                  appointment.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-600'
                }`}>
                {appointment.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{formatTime(appointment.startTime)}</span>
                <span>{formatDate(appointment.startTime)}</span>
              </div>
              <span>•</span>
              <span>{appointment.duration} mins</span>
            </div>
          </div>

          {/* Billing Card - Compact */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">Payment Due</div>
                <div className="text-xl font-bold text-gray-900">₹ 0.00</div>
              </div>
              <CreditCard className="h-5 w-5 text-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {onCreateSuperbill && (
                <button
                  onClick={() => {
                    onCreateSuperbill(appointment);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all text-[11px] font-medium"
                  title="Create superbill"
                >
                  <Receipt className="h-3 w-3" />
                  Superbill
                </button>
              )}
              <button
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all text-[11px] font-medium"
                title="Collect payment"
              >
                <CreditCard className="h-3 w-3" />
                Collect
              </button>
            </div>
          </div>

          {/* Reminders Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700">Reminders</div>
              <Bell className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="space-y-1.5">
              <button
                onClick={handleSetReminder}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-all text-[11px] font-medium"
                title="Set appointment reminder"
              >
                <BellPlus className="h-3 w-3" />
                <span>Set Reminder (1hr before)</span>
              </button>
              <button
                onClick={handleScheduleFollowUp}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-all text-[11px] font-medium"
                title="Schedule follow-up"
              >
                <Calendar className="h-3 w-3" />
                <span>Schedule Follow-up</span>
              </button>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Patient Actions</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleSendPrescription}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-all text-[11px] font-medium"
                title="Send prescription"
              >
                <Pill className="h-3 w-3" />
                Prescription
              </button>
              <button
                onClick={handleSendLabResults}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-theme-accent/10 text-theme-accent border border-theme-accent/20 rounded-md hover:bg-theme-accent/20 transition-all text-[11px] font-medium"
                title="Send lab results"
              >
                <FileDown className="h-3 w-3" />
                Lab Results
              </button>
              <button
                onClick={handleSendDocuments}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-theme-secondary/10 text-theme-secondary border border-theme-secondary/20 rounded-md hover:bg-theme-secondary/20 transition-all text-[11px] font-medium"
                title="Send documents"
              >
                <FileText className="h-3 w-3" />
                Documents
              </button>
              <button
                onClick={handleShareVideoLink}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-all text-[11px] font-medium"
                title="Share video link"
              >
                <Video className="h-3 w-3" />
                Video Link
              </button>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Notes</div>
            <textarea
              className="w-full px-2.5 py-2 text-[11px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add notes about this appointment..."
              defaultValue={appointment.notes}
            />
          </div>

          {/* Appointment Management Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Management</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onEdit(appointment);
                  onClose();
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-700 text-[11px] font-medium"
                title="Edit appointment details"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => {
                  onCopy(appointment);
                  onClose();
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-700 text-[11px] font-medium"
                title="Copy appointment"
              >
                <Copy className="h-3 w-3" />
                Duplicate
              </button>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Quick Links</div>
            <div className="space-y-1">
              <button
                onClick={handleViewPatientRecord}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center justify-between group"
              >
                <span>View Patient Record</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-xs">→</span>
              </button>
              <button
                onClick={handleViewMedicalHistory}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center justify-between group"
              >
                <span>View Medical History</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-xs">→</span>
              </button>
              <button
                onClick={handleViewPrescriptions}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center justify-between group"
              >
                <span>Prescriptions</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-xs">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar - Bottom */}
        {(appointment.status === 'scheduled' || appointment.status === 'in-progress') && (
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2.5 space-y-1.5 shadow-lg">
            {onStartEncounter && appointment.status === 'scheduled' && (
              <button
                onClick={() => {
                  onStartEncounter(appointment);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all font-medium text-xs shadow-sm"
                title="Begin documenting this patient visit"
              >
                <FileText className="h-3.5 w-3.5" />
                Start Encounter
              </button>
            )}

            {!meetingCode && (
              <InstantMeetingButton
                appointmentId={appointment.id}
                patientId={appointment.patientId}
                practitionerId={appointment.practitionerId}
                variant="appointment"
                fullWidth={true}
                onMeetingCreated={(meeting) => setMeetingCode(meeting.meetingCode)}
              />
            )}

            {meetingCode && (
              <button
                onClick={handleJoinLiveCall}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all font-medium text-xs shadow-sm"
                title="Join HIPAA-compliant video consultation"
              >
                <Video className="h-3.5 w-3.5" />
                Join Video Call
              </button>
            )}

            <button
              onClick={handleCompleteAppointment}
              disabled={isCompleting}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-theme-accent text-white rounded-md hover:opacity-90 transition-all font-medium text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mark this appointment as completed"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isCompleting ? 'Processing...' : 'Complete Appointment'}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-[70] p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Complete Appointment
                </h3>
                <p className="text-sm text-gray-600">
                  An encounter has been created for this appointment. Would you like to document this visit now or complete the appointment directly?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDocumentVisit}
                disabled={isCompleting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                Document Visit
              </button>
              <button
                onClick={handleCompleteDirectly}
                disabled={isCompleting}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {isCompleting ? 'Completing...' : 'Complete Now'}
              </button>
            </div>

            <button
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCompleting}
              className="w-full mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </>
  );
}
