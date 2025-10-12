'use client';

import React from 'react';
import { Appointment } from '@/types/appointment';
import { Clock, User, MapPin, Stethoscope, Calendar, FileText, Play, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DetailedAppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  onDragStart?: (appointment: Appointment) => void;
  onDragEnd?: () => void;
  className?: string;
}

export function DetailedAppointmentCard({
  appointment,
  onClick,
  onDragStart,
  onDragEnd,
  className = ''
}: DetailedAppointmentCardProps) {
  const router = useRouter();
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handlePatientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (appointment.patientId) {
      router.push(`/patients/${appointment.patientId}`);
    }
  };

  const handleQuickAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    // These actions will be handled by the parent component through onClick
    onClick?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'in-progress':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  };

  // Use practitioner color if available
  const borderColor = appointment.practitionerColor || '#3b82f6';

  // Only allow dragging scheduled appointments
  const isDraggable = appointment.status === 'scheduled';

  return (
    <div
      className={`relative ${className} ${!isDraggable ? 'cursor-not-allowed' : ''}`}
      draggable={isDraggable}
      onDragStart={(e) => {
        if (!isDraggable) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(appointment));
        onDragStart?.(appointment);
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className={`h-full rounded-lg border-l-4 overflow-hidden shadow-sm hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}
        style={{ borderLeftColor: borderColor }}
      >
        <div className="p-3 h-full flex flex-col gap-2">
          {/* Status Badge - First */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getStatusBadgeColor(appointment.status)}`}>
              {getStatusLabel(appointment.status)}
            </span>
            {appointment.patientId && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/60 rounded text-[10px] text-gray-600 font-mono">
                <User className="h-2.5 w-2.5" />
                {appointment.patientId.substring(0, 8)}
              </div>
            )}
          </div>

          {/* Patient Name - Clickable */}
          <div
            onClick={handlePatientClick}
            className="cursor-pointer hover:text-blue-600 transition-colors"
          >
            <h3 className="font-bold text-sm text-gray-900 hover:text-blue-600">
              {appointment.patientName}
            </h3>
          </div>

          {/* Time Information */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Clock className="h-3 w-3 flex-shrink-0 text-gray-500" />
              <span className="font-semibold">{formatTime(startTime)}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold">{formatTime(endTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 pl-5">
              <span className="text-[11px]">Duration: {formatDuration(appointment.duration)}</span>
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Stethoscope className="h-3 w-3 flex-shrink-0 text-gray-500" />
            <span className="font-medium truncate">{appointment.practitionerName}</span>
          </div>

          {/* Appointment Type */}
          {appointment.appointmentType && (
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <Calendar className="h-3 w-3 flex-shrink-0 text-gray-500" />
              <span className="truncate">{appointment.appointmentType}</span>
            </div>
          )}

          {/* Location */}
          {appointment.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <MapPin className="h-3 w-3 flex-shrink-0 text-gray-500" />
              <span className="truncate">{appointment.location}</span>
            </div>
          )}

          {/* Notes/Reason */}
          {appointment.reason && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 line-clamp-2 italic">
                {appointment.reason}
              </p>
            </div>
          )}

          {/* Quick Action Shortcuts based on status */}
          <div className="mt-auto pt-2 border-t border-gray-200">
            <div className="flex gap-1.5">
              {appointment.status === 'scheduled' && (
                <>
                  <button
                    onClick={(e) => handleQuickAction(e, 'start')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-[10px] font-medium"
                    title="Start Encounter"
                  >
                    <Play className="h-3 w-3" />
                    <span>Start</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(e, 'details')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-[10px] font-medium"
                    title="View Details"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Details</span>
                  </button>
                </>
              )}
              {appointment.status === 'in-progress' && (
                <>
                  <button
                    onClick={(e) => handleQuickAction(e, 'complete')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-[10px] font-medium"
                    title="Complete"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(e, 'details')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-[10px] font-medium"
                    title="View Details"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Details</span>
                  </button>
                </>
              )}
              {(appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no-show') && (
                <button
                  onClick={(e) => handleQuickAction(e, 'details')}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-[10px] font-medium"
                  title="View Details"
                >
                  <FileText className="h-3 w-3" />
                  <span>View Details</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
