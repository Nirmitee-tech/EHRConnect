'use client';

import React from 'react';
import { Appointment } from '@/types/appointment';
import { Clock, User, MapPin, Stethoscope, Calendar } from 'lucide-react';

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
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  return (
    <div
      className={`relative ${className}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(appointment));
        onDragStart?.(appointment);
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className={`h-full rounded-lg border-l-4 cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}
        style={{ borderLeftColor: borderColor }}
        onClick={onClick}
      >
        <div className="p-3 h-full flex flex-col">
          {/* Header: Patient name and status */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate text-gray-900">
                {appointment.patientName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="font-semibold">{formatTime(startTime)}</span>
                <span>-</span>
                <span className="font-semibold">{formatTime(endTime)}</span>
                <span className="text-gray-400">•</span>
                <span>{appointment.duration} min</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ml-2 ${getStatusBadgeColor(appointment.status)}`}>
              {getStatusLabel(appointment.status)}
            </span>
          </div>

          {/* Details grid */}
          <div className="space-y-1.5 text-xs">
            {/* Provider */}
            <div className="flex items-center gap-1.5 text-gray-700">
              <Stethoscope className="h-3 w-3 flex-shrink-0 text-gray-500" />
              <span className="font-medium truncate">{appointment.practitionerName}</span>
            </div>

            {/* Treatment type */}
            {appointment.appointmentType && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Calendar className="h-3 w-3 flex-shrink-0 text-gray-500" />
                <span className="truncate">{appointment.appointmentType}</span>
              </div>
            )}

            {/* Location */}
            {appointment.location && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <MapPin className="h-3 w-3 flex-shrink-0 text-gray-500" />
                <span className="truncate">{appointment.location}</span>
              </div>
            )}

            {/* Reason/Notes */}
            {appointment.reason && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 line-clamp-2 italic">
                  {appointment.reason}
                </p>
              </div>
            )}
          </div>

          {/* Patient ID badge (if short enough) */}
          {appointment.patientId && (
            <div className="mt-auto pt-2">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/60 rounded text-[10px] text-gray-600 font-mono">
                <User className="h-2.5 w-2.5" />
                {appointment.patientId.substring(0, 8)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
