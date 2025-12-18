'use client';

import React, { useState } from 'react';
import { X, Phone, MapPin, MessageCircle, CreditCard, Clock, Edit3, UserX, UserCheck, XCircle, Copy, FileText, CheckCircle, Receipt, Mail, Bell, BellPlus, Send, FileDown, Pill, Calendar, Video } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { EncounterService } from '@/services/encounter.service';
import { useRouter } from 'next/navigation';
import { InstantMeetingButton } from '@/components/virtual-meetings/instant-meeting-button';
import { LiveCallIndicator } from '@/components/appointments/live-call-indicator';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';

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
  const { t, i18n } = useTranslation('common');
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);

  if (!isOpen || !appointment) return null;

  // Contact Actions
  const handleCall = () => {
    toast.info(t('appointments.toast_initiating_call', { phone: '+91 9767377819' }));
    // In production: window.location.href = 'tel:+919767377819';
  };

  const handleMessage = () => {
    toast.success(t('appointments.toast_opening_whatsapp'));
    // In production: window.open('https://wa.me/919767377819', '_blank');
  };

  const handleEmail = () => {
    toast.info(t('appointments.toast_opening_email_client'));
    // In production: window.location.href = 'mailto:patient@email.com';
  };

  const handleMap = () => {
    toast.info(t('appointments.toast_opening_maps'));
    // In production: window.open('https://maps.google.com/?q=patient+address', '_blank');
  };

  const handleSMS = () => {
    toast.success(t('appointments.toast_sms_reminder_sent'));
    // In production: API call to send SMS
  };

  // Reminder Actions
  const handleSetReminder = () => {
    toast.success(t('appointments.toast_reminder_set'));
    // In production: API call to set reminder
  };

  const handleScheduleFollowUp = () => {
    toast.info(t('appointments.toast_opening_followup_scheduling'));
    // Navigate to appointments page with pre-fill
    router.push('/appointments?action=create&patientId=' + appointment.patientId);
  };

  // Patient Actions
  const handleSendPrescription = () => {
    toast.info(t('appointments.toast_opening_prescription_form'));
    router.push(`/prescriptions/create?patientId=${appointment.patientId}&appointmentId=${appointment.id}`);
  };

  const handleSendLabResults = () => {
    toast.info(t('appointments.toast_opening_lab_results'));
    router.push(`/lab-results?patientId=${appointment.patientId}`);
  };

  const handleSendDocuments = () => {
    toast.info(t('appointments.toast_opening_document_manager'));
    router.push(`/patients/${appointment.patientId}/documents`);
  };

  const handleShareVideoLink = () => {
    if (meetingCode) {
      const link = `${window.location.origin}/meeting/${meetingCode}`;
      navigator.clipboard.writeText(link);
      toast.success(t('appointments.toast_video_link_copied'));
    } else {
      toast.warning(t('appointments.toast_no_active_video_call'));
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

  const locale = i18n.language || 'en';
  const timeFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale]
  );
  const shortDateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
    [locale]
  );

  const formatTime = (date: Date | string) => timeFormatter.format(new Date(date));

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(d);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      return t('appointments.today');
    }
    return shortDateFormatter.format(d);
  };

  const getStatusLabel = (status: string) => {
    const statusKeyByStatus: Record<string, string> = {
      scheduled: 'appointment_form.scheduled',
      confirmed: 'appointment_form.confirmed',
      cancelled: 'appointment_form.cancelled',
      completed: 'appointment_form.completed',
      'no-show': 'appointment_form.no_show',
      rescheduled: 'appointment_form.rescheduled',
      'in-progress': 'appointment_form.in_progress',
      waitlist: 'appointment_form.waitlist',
    };

    const key = statusKeyByStatus[status];
    if (key) return t(key);
    return status;
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
      alert(t('appointments.alert_completion_failed'));
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
      alert(t('appointments.alert_completed_successfully'));
      setShowConfirmDialog(false);
      onClose();
      // Trigger parent refresh to update appointment list
      onAppointmentUpdated?.();
    } catch (error) {
      console.error('Error completing encounter:', error);
      alert(t('appointments.alert_complete_failed'));
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
      alert(t('appointments.alert_video_call_ended_autocomplete'));

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
      return { label: t('appointments.badge_video_visit'), color: 'bg-purple-100 text-purple-700' };
    }
    if (type.includes('urgent') || type.includes('emergency')) {
      return { label: t('appointments.badge_urgent'), color: 'bg-red-100 text-red-700' };
    }
    if (type.includes('follow') || type.includes('followup')) {
      return { label: t('appointments.badge_follow_up'), color: 'bg-blue-100 text-blue-700' };
    }
    return { label: t('appointments.badge_in_person'), color: 'bg-gray-100 text-gray-700' };
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
            title={t('common.close')}
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Status - Segmented Control */}
        <div className="border-b border-gray-200 px-3 py-2 bg-white">
          <div className="text-[10px] font-medium text-gray-500 mb-1.5">{t('appointments.quick_status')}</div>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                onCheckIn(appointment);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-all"
              title={t('appointments.tooltip_mark_checked_in')}
            >
              <UserCheck className="h-3 w-3" />
              {t('appointments.check_in')}
            </button>
            <button
              onClick={() => {
                onMissed(appointment);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-all"
              title={t('appointments.tooltip_mark_no_show')}
            >
              <UserX className="h-3 w-3" />
              {t('appointment_form.no_show')}
            </button>
            <button
              onClick={() => {
                onCancel(appointment);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 transition-all"
              title={t('appointments.cancel_this_appointment')}
            >
              <XCircle className="h-3 w-3" />
              {t('appointments.cancel')}
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
              <div className="text-xs font-semibold text-gray-700">{t('appointments.contact')}</div>
              <div className="text-[11px] text-gray-500">+91 9767377819</div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <button
                onClick={handleCall}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all"
                title={t('appointments.tooltip_call_patient')}
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">{t('appointments.call')}</span>
              </button>
              <button
                onClick={handleMessage}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-theme-accent text-white rounded-md hover:opacity-90 transition-all"
                title={t('appointments.tooltip_send_whatsapp')}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">{t('appointments.message')}</span>
              </button>
              <button
                onClick={handleEmail}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
                title={t('appointments.tooltip_send_email')}
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">{t('appointments.email')}</span>
              </button>
              <button
                onClick={handleMap}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
                title={t('appointments.tooltip_view_location')}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium">{t('appointments.map')}</span>
              </button>
            </div>
            <button
              onClick={handleSMS}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-theme-secondary/10 text-theme-secondary border border-theme-secondary/20 rounded-md hover:bg-theme-secondary/20 transition-all text-[11px] font-medium"
              title={t('appointments.send_sms_reminder')}
            >
              <Send className="h-3 w-3" />
              {t('appointments.send_sms_reminder')}
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
                  {appointment.appointmentType || t('appointment_form.general_consultation')}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${appointment.status === 'scheduled' ? 'bg-slate-100 text-slate-700' :
                  appointment.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-600'
                }`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{formatTime(appointment.startTime)}</span>
                <span>{formatDate(appointment.startTime)}</span>
              </div>
              <span>•</span>
              <span>{appointment.duration} {t('appointment_form.duration_minutes')}</span>
            </div>
          </div>

          {/* Billing Card - Compact */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">{t('appointments.payment_due')}</div>
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
                  title={t('appointments.create_superbill')}
                >
                  <Receipt className="h-3 w-3" />
                  {t('appointments.superbill')}
                </button>
              )}
              <button
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all text-[11px] font-medium"
                title={t('appointments.collect_payment')}
              >
                <CreditCard className="h-3 w-3" />
                {t('appointments.collect')}
              </button>
            </div>
          </div>

          {/* Reminders Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700">{t('appointments.reminders')}</div>
              <Bell className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="space-y-1.5">
              <button
                onClick={handleSetReminder}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-all text-[11px] font-medium"
                title={t('appointments.tooltip_set_appointment_reminder')}
              >
                <BellPlus className="h-3 w-3" />
                <span>{t('appointments.set_reminder_one_hour')}</span>
              </button>
              <button
                onClick={handleScheduleFollowUp}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-all text-[11px] font-medium"
                title={t('appointments.tooltip_schedule_follow_up')}
              >
                <Calendar className="h-3 w-3" />
                <span>{t('appointments.schedule_follow_up')}</span>
              </button>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">{t('appointments.patient_actions')}</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleSendPrescription}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-all text-[11px] font-medium"
                title={t('appointments.tooltip_send_prescription')}
              >
                <Pill className="h-3 w-3" />
                {t('appointments.prescription')}
              </button>
              <button
                onClick={handleSendLabResults}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-theme-accent/10 text-theme-accent border border-theme-accent/20 rounded-md hover:bg-theme-accent/20 transition-all text-[11px] font-medium"
                title={t('appointments.tooltip_send_lab_results')}
              >
                <FileDown className="h-3 w-3" />
                {t('appointments.lab_results')}
              </button>
              <button
                onClick={handleSendDocuments}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-theme-secondary/10 text-theme-secondary border border-theme-secondary/20 rounded-md hover:bg-theme-secondary/20 transition-all text-[11px] font-medium"
                title={t('appointments.tooltip_send_documents')}
              >
                <FileText className="h-3 w-3" />
                {t('appointments.documents')}
              </button>
              <button
                onClick={handleShareVideoLink}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-all text-[11px] font-medium"
                title={t('appointments.tooltip_share_video_link')}
              >
                <Video className="h-3 w-3" />
                {t('appointments.video_link')}
              </button>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">{t('appointment_form.notes')}</div>
            <textarea
              className="w-full px-2.5 py-2 text-[11px] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder={t('appointments.notes_placeholder')}
              defaultValue={appointment.notes}
            />
          </div>

          {/* Appointment Management Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">{t('appointments.management')}</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onEdit(appointment);
                  onClose();
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-700 text-[11px] font-medium"
                title={t('appointments.tooltip_edit_appointment')}
              >
                <Edit3 className="h-3 w-3" />
                {t('common.edit')}
              </button>
              <button
                onClick={() => {
                  onCopy(appointment);
                  onClose();
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-700 text-[11px] font-medium"
                title={t('appointments.tooltip_duplicate_appointment')}
              >
                <Copy className="h-3 w-3" />
                {t('common.duplicate')}
              </button>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">{t('appointments.quick_links')}</div>
            <div className="space-y-1">
              <button
                onClick={handleViewPatientRecord}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center justify-between group"
              >
                <span>{t('appointments.view_patient_record')}</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-xs">→</span>
              </button>
              <button
                onClick={handleViewMedicalHistory}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center justify-between group"
              >
                <span>{t('appointments.view_medical_history')}</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-xs">→</span>
              </button>
              <button
                onClick={handleViewPrescriptions}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md transition-all flex items-center justify-between group"
              >
                <span>{t('appointments.prescriptions')}</span>
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
                title={t('appointments.tooltip_begin_documenting_visit')}
              >
                <FileText className="h-3.5 w-3.5" />
                {t('appointments.start_encounter')}
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
                title={t('appointments.tooltip_join_video_call')}
              >
                <Video className="h-3.5 w-3.5" />
                {t('appointments.join_video_call')}
              </button>
            )}

            <button
              onClick={handleCompleteAppointment}
              disabled={isCompleting}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-theme-accent text-white rounded-md hover:opacity-90 transition-all font-medium text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('appointments.tooltip_mark_completed')}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isCompleting ? t('appointments.processing') : t('appointments.complete_appointment')}
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
                  {t('appointments.complete_appointment')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('appointments.confirm_complete_description')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDocumentVisit}
                disabled={isCompleting}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50"
              >
                {t('appointments.document_visit')}
              </button>
              <button
                onClick={handleCompleteDirectly}
                disabled={isCompleting}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {isCompleting ? t('appointments.completing') : t('appointments.complete_now')}
              </button>
            </div>

            <button
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCompleting}
              className="w-full mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </>
      )}
    </>
  );
}
