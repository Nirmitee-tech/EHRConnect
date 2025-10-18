'use client';

import React, { useState } from 'react';
import type { Appointment } from '@/types/appointment';
import { Clock, Play, CheckCircle, XCircle, FileText, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalendarSettings } from '@/hooks/useCalendarSettings';

interface CompactAppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  onDragStart?: (appointment: Appointment) => void;
  onDragEnd?: () => void;
  className?: string;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  onStartEncounter?: (appointmentId: string) => void;
}

export function CompactAppointmentCard({
  appointment,
  onClick,
  onDragStart,
  onDragEnd,
  className = '',
  onStatusChange,
  onStartEncounter
}: CompactAppointmentCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const { autoNavigateToEncounter } = useCalendarSettings();
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePatientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (appointment.patientId) {
      navigate(`/patients/${appointment.patientId}`);
    }
  };

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();

    switch (action) {
      case 'start':
        // If autoNavigateToEncounter is enabled, use the full encounter flow
        // Otherwise, just update the status to in-progress
        if (autoNavigateToEncounter) {
          onStartEncounter?.(appointment.id);
        } else {
          onStatusChange?.(appointment.id, 'in-progress');
        }
        break;
      case 'complete':
        onStatusChange?.(appointment.id, 'completed');
        break;
      case 'cancel':
        onStatusChange?.(appointment.id, 'cancelled');
        break;
      case 'details':
        onClick?.();
        break;
    }
    setShowActions(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'bg-red-50 border-red-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Use practitioner color if available
  const borderColor = appointment.practitionerColor || '#3b82f6';

  // Only allow dragging scheduled appointments
  const isDraggable = appointment.status === 'scheduled';

  return (
    <div
      className={`relative group ${className} ${!isDraggable ? 'cursor-not-allowed' : ''}`}
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
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`h-full rounded border-l-[3px] overflow-visible shadow-sm hover:shadow-md transition-all cursor-pointer relative ${getStatusColor(appointment.status)}`}
        style={{ borderLeftColor: borderColor }}
      >
        <div className="px-1.5 py-1 h-full flex flex-col justify-start relative">
          {/* Status indicator dot */}
          <div className="flex items-center gap-1 mb-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusBadgeColor(appointment.status)}`} />
            <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide">
              {appointment.status === 'in-progress' ? 'Live' : appointment.status === 'scheduled' ? 'Scheduled' : ''}
            </span>
          </div>

          {/* Patient Name - Clickable, bold, larger */}
          <div
            onClick={handlePatientClick}
            className="cursor-pointer hover:text-blue-600 transition-colors mb-0.5"
          >
            <h3 className="font-bold text-[11px] text-gray-900 hover:text-blue-600 truncate leading-tight">
              {appointment.patientName}
            </h3>
          </div>

          {/* Time - compact */}
          <div className="flex items-center gap-0.5 text-[9px] text-gray-600 mb-0.5">
            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="font-medium">{formatTime(startTime)}</span>
            <span className="text-gray-400">-</span>
            <span className="font-medium">{formatTime(endTime)}</span>
          </div>

          {/* Appointment Type - if space allows */}
          {appointment.appointmentType && (
            <div className="text-[9px] text-gray-600 truncate">
              {appointment.appointmentType}
            </div>
          )}

          {/* Location - if space allows */}
          {appointment.location && (
            <div className="text-[9px] text-gray-500 truncate">
              📍 {appointment.location}
            </div>
          )}

          {/* Bottom Action Buttons - Always visible */}
          <div className="mt-auto pt-1 border-t border-gray-200/50">
            {!showActions && (
              <div className="flex items-center gap-0.5 justify-end">
                {appointment.status === 'scheduled' && (
                  <>
                    <div className="text-[8px] text-gray-400 px-1">Start</div>
                    <div className="text-[8px] text-gray-400 px-1">Cancel</div>
                  </>
                )}
                {appointment.status === 'in-progress' && (
                  <>
                    <div className="text-[8px] text-gray-400 px-1">Complete</div>
                    <div className="text-[8px] text-gray-400 px-1">Details</div>
                  </>
                )}
                {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                  <div className="text-[8px] text-gray-400 px-1">Details</div>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex items-center gap-0.5">
                {appointment.status === 'scheduled' && (
                  <>
                    <button
                      onClick={(e) => handleAction(e, 'start')}
                      className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-blue-600 text-white rounded text-[8px] font-medium hover:bg-blue-700 transition-colors"
                      title="Start Encounter"
                    >
                      <Play className="h-2 w-2" fill="currentColor" />
                      Start
                    </button>
                    <button
                      onClick={(e) => handleAction(e, 'cancel')}
                      className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-gray-400 text-white rounded text-[8px] font-medium hover:bg-gray-500 transition-colors"
                      title="Cancel Appointment"
                    >
                      <XCircle className="h-2 w-2" />
                      Cancel
                    </button>
                  </>
                )}
                {appointment.status === 'in-progress' && (
                  <>
                    <button
                      onClick={(e) => handleAction(e, 'complete')}
                      className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-600 text-white rounded text-[8px] font-medium hover:bg-green-700 transition-colors"
                      title="Complete Appointment"
                    >
                      <CheckCircle className="h-2 w-2" />
                      Complete
                    </button>
                    <button
                      onClick={(e) => handleAction(e, 'details')}
                      className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-gray-400 text-white rounded text-[8px] font-medium hover:bg-gray-500 transition-colors"
                      title="View Details"
                    >
                      <FileText className="h-2 w-2" />
                      Details
                    </button>
                  </>
                )}
                {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                  <button
                    onClick={(e) => handleAction(e, 'details')}
                    className="w-full flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-gray-400 text-white rounded text-[8px] font-medium hover:bg-gray-500 transition-colors"
                    title="View Details"
                  >
                    <FileText className="h-2 w-2" />
                    Details
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
