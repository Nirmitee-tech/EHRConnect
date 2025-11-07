'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Edit, Trash2, CalendarIcon, Clock, User, MapPin, FileText, Video, Phone, Users as UsersIcon } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface AppointmentDetailSidebarProps {
  appointment: Appointment | null;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
}

export function AppointmentDetailSidebar({
  appointment,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  onEdit,
  onDelete
}: AppointmentDetailSidebarProps) {
  if (!isOpen || !appointment) return null;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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
      case 'video-call': return 'Video Call';
      case 'voice-call': return 'Voice Call';
      case 'in-person': return 'In-Person';
      default: return 'Other';
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
              <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
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
                    {appointment.status}
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
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(appointment.startTime)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      <span className="text-gray-500 ml-2">({appointment.duration} mins)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Practitioner */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Doctor</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{appointment.practitionerName}</span>
                </div>
              </div>

              {/* Location */}
              {appointment.location && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{appointment.location}</span>
                  </div>
                </div>
              )}

              {/* Appointment Mode */}
              {appointment.mode && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Mode</label>
                  <div className="flex items-center gap-2">
                    {getModeIcon(appointment.mode)}
                    <span className="text-sm text-gray-900">{getModeLabel(appointment.mode)}</span>
                  </div>
                </div>
              )}

              {/* Appointment Type */}
              {appointment.appointmentType && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Appointment Type</label>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{appointment.appointmentType}</span>
                  </div>
                </div>
              )}

              {/* Chief Complaint */}
              {appointment.chiefComplaint && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Chief Complaint</label>
                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {appointment.chiefComplaint}
                  </div>
                </div>
              )}

              {/* Reason */}
              {appointment.reason && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 whitespace-pre-wrap">
                    {appointment.reason}
                  </div>
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
                  <div className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 whitespace-pre-wrap">
                    {appointment.notes}
                  </div>
                </div>
              )}

              {/* Recurring Info */}
              {appointment.isRecurring && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Recurring</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                    <p className="text-sm text-blue-900">
                      Repeats every {appointment.recurrenceInterval || 1} {appointment.recurrencePeriod || 'week'}(s)
                    </p>
                    {appointment.recurrenceEndDate && (
                      <p className="text-xs text-blue-700 mt-1">
                        Until {formatDate(appointment.recurrenceEndDate)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Send Forms */}
              {appointment.selectedForms && appointment.selectedForms.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Forms to Send</label>
                  <div className="flex flex-wrap gap-1.5">
                    {appointment.selectedForms.map((formId, index) => (
                      <span
                        key={formId || index}
                        className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200"
                      >
                        Form {formId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All-Day Event */}
              {appointment.isAllDay && (
                <div className="bg-purple-50 border border-purple-200 rounded-md px-3 py-2">
                  <p className="text-sm text-purple-900">
                    All-Day Event {appointment.allDayEventType && `(${appointment.allDayEventType})`}
                  </p>
                </div>
              )}

              {/* Emergency Flag */}
              {appointment.isEmergency && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <p className="text-sm font-medium text-red-900">⚠️ Emergency Appointment</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(appointment)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Edit
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
