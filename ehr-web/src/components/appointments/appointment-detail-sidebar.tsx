'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Edit, Trash2, CalendarIcon, Clock, User, MapPin, FileText, Video, Phone, Users as UsersIcon, Receipt, FileCheck } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';

interface AppointmentDetailSidebarProps {
  appointment: Appointment | null;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onCreateSuperBill?: (appointment: Appointment) => void;
  onCreateClaim?: (appointment: Appointment) => void;
}

export function AppointmentDetailSidebar({
  appointment,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  onEdit,
  onDelete,
  onCreateSuperBill,
  onCreateClaim
}: AppointmentDetailSidebarProps) {
  const { t, i18n } = useTranslation('common');

  if (!isOpen || !appointment) return null;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(i18n.language || 'en', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(i18n.language || 'en', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(d);
  };

  const getModeIcon = (mode?: string) => {
    switch(mode) {
      case 'video-call': return <Video className="h-4 w-4" />;
      case 'voice-call': return <Phone className="h-4 w-4" />;
      case 'in-person': return <UsersIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode?: string) => {
    switch(mode) {
      case 'video-call': return t('appointment_form.mode_video_call');
      case 'voice-call': return t('appointment_form.mode_voice_call');
      case 'in-person': return t('appointment_form.mode_in_person');
      default: return t('appointment_form.mode_other');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return t('appointment_form.scheduled');
      case 'confirmed': return t('appointment_form.confirmed');
      case 'in-progress': return t('appointment_form.in_progress');
      case 'completed': return t('appointment_form.completed');
      case 'cancelled': return t('appointment_form.cancelled');
      case 'waitlist': return t('appointment_form.waitlist');
      case 'no-show': return t('appointment_form.no_show');
      case 'rescheduled': return t('appointment_form.rescheduled');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'waitlist': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-12" : "w-full lg:w-[480px]"
      )}>
        {/* Collapse/Expand Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -left-6 top-20 bg-white border border-gray-200 rounded-l-md p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {!isCollapsed && (
          <div className="h-full flex flex-col">
	            {/* Header */}
	            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
	              <h2 className="text-lg font-semibold text-gray-900">{t('appointment_form.details_title')}</h2>
	              <button
	                onClick={onClose}
	                className="text-gray-400 hover:text-gray-600 transition-colors"
	              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Patient Info */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">{appointment.patientName}</h3>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    getStatusColor(appointment.status)
	                  )}>
	                    {getStatusLabel(appointment.status)}
	                  </span>
	                </div>
	              </div>

              {/* Date & Time */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
	                  </div>
	                  <div>
	                    <p className="text-xs text-gray-500">{t('appointment_form.date')}</p>
	                    <p className="text-sm font-medium text-gray-900">{formatDate(appointment.startTime)}</p>
	                  </div>
	                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                    <Clock className="h-4 w-4 text-green-600" />
	                  </div>
	                  <div>
	                    <p className="text-xs text-gray-500">{t('appointment_form.time')}</p>
	                    <p className="text-sm font-medium text-gray-900">
	                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
	                      <span className="text-gray-500 ml-2">
	                        ({appointment.duration} {t('appointment_form.duration_minutes')})
	                      </span>
	                    </p>
	                  </div>
	                </div>
              </div>

	              {/* Practitioner */}
	              <div>
	                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.doctor')}</label>
	                <div className="flex items-center gap-2">
	                  <User className="h-4 w-4 text-gray-400" />
	                  <span className="text-sm text-gray-900">{appointment.practitionerName}</span>
	                </div>
	              </div>

              {/* Location */}
	              {appointment.location && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.location')}</label>
	                  <div className="flex items-center gap-2">
	                    <MapPin className="h-4 w-4 text-gray-400" />
	                    <span className="text-sm text-gray-900">{appointment.location}</span>
                  </div>
                </div>
              )}

	              {/* Appointment Mode */}
	              {appointment.mode && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.appointment_mode')}</label>
	                  <div className="flex items-center gap-2">
	                    {getModeIcon(appointment.mode)}
	                    <span className="text-sm text-gray-900">{getModeLabel(appointment.mode)}</span>
	                  </div>
                </div>
              )}

              {/* Appointment Type */}
	              {appointment.appointmentType && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.appointment_type')}</label>
	                  <div className="flex items-center">
	                    <span className="text-sm text-gray-900">{appointment.appointmentType}</span>
	                  </div>
	                </div>
	              )}

              {/* Chief Complaint */}
	              {appointment.chiefComplaint && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.chief_complaint')}</label>
	                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
	                    {appointment.chiefComplaint}
	                  </div>
                </div>
              )}

              {/* Reason */}
	              {appointment.reason && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.reason')}</label>
	                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 whitespace-pre-wrap">
	                    {appointment.reason}
	                  </div>
                </div>
              )}

              {/* Notes */}
	              {appointment.notes && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.notes')}</label>
	                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 whitespace-pre-wrap">
	                    {appointment.notes}
	                  </div>
                </div>
              )}

              {/* Recurring Info */}
	              {appointment.isRecurring && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.recurrence')}</label>
	                  <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
	                    <p className="text-sm text-blue-900">
	                      {t('appointment_form.repeats_every', {
	                        interval: appointment.recurrenceInterval || 1,
	                        period: t(`appointment_form.period_${appointment.recurrencePeriod || 'week'}`)
	                      })}
	                    </p>
	                    {appointment.recurrenceEndDate && (
	                      <p className="text-xs text-blue-700 mt-1">
	                        {t('appointment_form.until')} {formatDate(appointment.recurrenceEndDate)}
	                      </p>
	                    )}
	                  </div>
	                </div>
	              )}

              {/* Send Forms */}
	              {appointment.selectedForms && appointment.selectedForms.length > 0 && (
	                <div>
	                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('appointment_form.forms_to_send')}</label>
	                  <div className="flex flex-wrap gap-1.5">
	                    {appointment.selectedForms.map((formId, index) => (
	                      <span
	                        key={formId || index}
	                        className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200"
	                      >
	                        {t('appointment_form.form_id_badge', { id: formId })}
	                      </span>
	                    ))}
	                  </div>
	                </div>
	              )}

              {/* All-Day Event */}
	              {appointment.isAllDay && (
	                <div className="bg-purple-50 border border-purple-200 rounded-md px-3 py-2">
	                  <p className="text-sm text-purple-900">
	                    {t('appointment_form.all_day_event')}{' '}
	                    {appointment.allDayEventType ? `(${t(`appointment_form.event_type_${appointment.allDayEventType}`)})` : null}
	                  </p>
	                </div>
	              )}

              {/* Emergency Flag */}
	              {appointment.isEmergency && (
	                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
	                  <p className="text-sm font-medium text-red-900">⚠️ {t('appointment_form.emergency_appointment')}</p>
	                </div>
	              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-2">
              {/* Billing Actions */}
              <div className="grid grid-cols-2 gap-2">
                {/* Create Super Bill Button */}
	                {onCreateSuperBill && (
	                  <button
	                    onClick={() => onCreateSuperBill(appointment)}
	                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
	                  >
	                    <Receipt className="h-3.5 w-3.5" />
	                    {t('nav.create_superbill')}
	                  </button>
	                )}

                {/* Create Claim Button */}
	                {onCreateClaim && (
	                  <button
	                    onClick={() => onCreateClaim(appointment)}
	                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
	                  >
	                    <FileCheck className="h-3.5 w-3.5" />
	                    {t('nav.create_claim')}
	                  </button>
	                )}
              </div>

              {/* Edit and Delete */}
              <div className="flex gap-3">
	                {onEdit && (
	                  <button
	                    onClick={() => onEdit(appointment)}
	                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
	                  >
	                    <Edit className="h-4 w-4" />
	                    {t('common.edit')}
	                  </button>
	                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(appointment)}
                    className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed View */}
        {isCollapsed && (
          <div className="h-full flex flex-col items-center py-6 gap-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="writing-mode-vertical text-sm font-medium text-gray-600">
              Appointment Details
            </div>
          </div>
        )}
      </div>
    </>
  );
}
