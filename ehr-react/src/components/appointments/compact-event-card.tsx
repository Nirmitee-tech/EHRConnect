'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Appointment } from '@/types/appointment';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Calendar, Stethoscope } from 'lucide-react';

interface CompactEventCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export function CompactEventCard({ appointment, onClick }: CompactEventCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<'top' | 'bottom'>('bottom');
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate preview position based on card position in viewport
  useEffect(() => {
    if (showPreview && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If not enough space below (less than 300px), show above
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPreviewPosition('top');
      } else {
        setPreviewPosition('bottom');
      }
    }
  }, [showPreview]);

  // Use practitioner color if available, otherwise fallback to status-based colors
  const practitionerColor = appointment.practitionerColor;
  const isScheduled = appointment.status === 'scheduled';

  const getEventStyle = () => {
    // If practitioner has a color, use it
    if (practitionerColor) {
      return {
        bgColor: practitionerColor,
        border: isScheduled ? 'border-2 border-dashed' : 'border-0',
        textColor: 'text-white',
        isCustomColor: true
      };
    }

    // Otherwise use status-based colors
    switch (appointment.status) {
      case 'scheduled':
        return {
          bgColor: 'bg-red-50/50',
          border: 'border-2 border-dashed border-red-400',
          textColor: 'text-red-800',
          isCustomColor: false
        };
      case 'in-progress':
        return {
          bgColor: 'bg-rose-400',
          border: 'border-0',
          textColor: 'text-white',
          isCustomColor: false
        };
      case 'completed':
        return {
          bgColor: 'bg-emerald-400',
          border: 'border-0',
          textColor: 'text-white',
          isCustomColor: false
        };
      case 'cancelled':
        return {
          bgColor: 'bg-gray-300',
          border: 'border-0',
          textColor: 'text-gray-700',
          isCustomColor: false
        };
      case 'no-show':
        return {
          bgColor: 'bg-orange-300',
          border: 'border-0',
          textColor: 'text-white',
          isCustomColor: false
        };
      default:
        return {
          bgColor: 'bg-rose-400',
          border: 'border-0',
          textColor: 'text-white',
          isCustomColor: false
        };
    }
  };

  const style = getEventStyle();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no-show':
        return 'No Show';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  };

  return (
    <div className="relative">
      <div
        ref={cardRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className={cn(
          'px-2 py-1 rounded cursor-pointer hover:shadow-lg transition-all relative z-10',
          'text-[11px] leading-snug overflow-hidden',
          !style.isCustomColor && style.bgColor,
          style.border,
          !style.isCustomColor && style.textColor,
          style.isCustomColor && 'text-white'
        )}
        style={style.isCustomColor ? {
          backgroundColor: style.bgColor,
          borderColor: style.bgColor
        } : undefined}
      >
        <div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
          <span className="font-semibold flex-shrink-0">
            {formatTime(startTime)}
          </span>
          <span className="truncate font-medium">
            {appointment.patientName || 'Untitled'}
          </span>
        </div>
      </div>

      {/* Hover Preview */}
      {showPreview && (
        <div
          ref={previewRef}
          className={cn(
            'absolute left-0 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            previewPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          {/* Header with title */}
          <div className="flex items-start gap-2 mb-3">
            <div
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
                !style.isCustomColor && style.bgColor
              )}
              style={style.isCustomColor ? { backgroundColor: style.bgColor } : undefined}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate">
                {appointment.patientName}
              </h3>
            </div>
          </div>

          {/* Date and time */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <div className="font-medium">{formatDate(startTime)}</div>
                <div className="text-gray-600">
                  {formatTime(startTime)} to {formatTime(endTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Practitioner */}
          {appointment.practitionerName && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Stethoscope className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{appointment.practitionerName}</span>
            </div>
          )}

          {/* Location */}
          {appointment.location && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{appointment.location}</span>
            </div>
          )}

          {/* Appointment Type */}
          {appointment.appointmentType && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{appointment.appointmentType}</span>
            </div>
          )}

          {/* Reason */}
          {appointment.reason && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic line-clamp-3">
                {appointment.reason}
              </p>
            </div>
          )}

          {/* Status badge */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status:</span>
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  !style.isCustomColor && style.bgColor,
                  !style.isCustomColor && style.textColor,
                  style.isCustomColor && 'text-white'
                )}
                style={style.isCustomColor ? { backgroundColor: style.bgColor } : undefined}
              >
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
