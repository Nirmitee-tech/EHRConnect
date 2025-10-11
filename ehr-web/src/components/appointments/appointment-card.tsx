'use client';

import React from 'react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
  compact?: boolean;
}

const statusColors: Record<AppointmentStatus, { bg: string; border: string; text: string }> = {
  'scheduled': { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' },
  'in-progress': { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700' },
  'completed': { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700' },
  'cancelled': { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-700' },
  'no-show': { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700' },
  'rescheduled': { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700' }
};

// Map appointment types to colors
const typeColors: Record<string, string> = {
  'consultation': 'bg-blue-500',
  'follow-up': 'bg-green-500',
  'emergency': 'bg-red-500',
  'routine': 'bg-purple-500',
  'surgery': 'bg-orange-500'
};

export function AppointmentCard({
  appointment,
  onClick,
  className,
  compact = false
}: AppointmentCardProps) {
  const colors = statusColors[appointment.status];

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Determine color: custom color > type color > status color
  const appointmentType = appointment.category || appointment.appointmentType || appointment.type;
  const typeColor = appointmentType ? typeColors[appointmentType] : null;
  const bgColor = appointment.color || typeColor || colors.bg;
  const useColorBg = !!(appointment.color || typeColor);
  const textColor = useColorBg ? 'text-white' : colors.text;
  const borderColor = useColorBg ? '' : colors.border;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'cursor-pointer rounded px-2 py-1.5 text-xs transition-all hover:shadow-md',
          useColorBg ? `${bgColor} text-white` : `${colors.bg} border-l-4 ${colors.border}`,
          className
        )}
      >
        <div className={cn('font-medium truncate', useColorBg ? 'text-white' : colors.text)}>
          {appointment.patientName}
        </div>
        {!appointment.isAllDay && (
          <div className={cn('mt-0.5 text-xs', useColorBg ? 'text-white/90' : 'text-gray-600')}>
            {formatTime(appointment.startTime)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border-l-4 p-3 shadow-sm transition-all hover:shadow-md',
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold truncate', colors.text)}>
            {appointment.patientName}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span className="truncate">{appointment.practitionerName}</span>
            </div>
          </div>
          {appointment.reason && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">
              {appointment.reason}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize">
          {appointment.appointmentType}
        </span>
        <span className={cn('text-xs font-medium capitalize', colors.text)}>
          {appointment.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}
