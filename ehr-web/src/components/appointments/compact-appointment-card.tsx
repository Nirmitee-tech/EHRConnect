'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Appointment } from '@/types/appointment';
import { Clock, Play, CheckCircle, XCircle, FileText, MoreVertical, User, MapPin, Phone, ActivitySquare, Video, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCalendarSettings } from '@/hooks/useCalendarSettings';

interface CompactAppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  onDragStart?: (appointment: Appointment, offsetY?: number) => void;
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
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { autoNavigateToEncounter } = useCalendarSettings();

  // Always use the latest appointment times for display
  const startTime = React.useMemo(() => new Date(appointment.startTime), [appointment.startTime]);
  const endTime = React.useMemo(() => new Date(appointment.endTime), [appointment.endTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle hover with delay
  const handleMouseEnter = () => {
    setShowActions(true);
    // Show tooltip after 800ms hover
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 800);
  };

  const handleMouseLeave = () => {
    setShowActions(false);
    setShowTooltip(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handlePatientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (appointment.patientId) {
      router.push(`/patients/${appointment.patientId}`);
    }
  };

  const handleOpenEncounter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (appointment.encounterId) {
      router.push(`/encounters/${appointment.encounterId}`);
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
      case 'encounter':
        handleOpenEncounter(e);
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

  const getModeIcon = (mode?: string) => {
    switch (mode) {
      case 'video-call':
        return <Video className="h-3 w-3 text-green-600" />;
      case 'voice-call':
        return <Phone className="h-3 w-3 text-purple-600" />;
      case 'in-person':
        return <Users className="h-3 w-3 text-blue-600" />;
      default:
        return null;
    }
  };

  // Use practitioner color if available
  const borderColor = appointment.practitionerColor || '#3b82f6';

  // Allow dragging for all appointments (scheduled, in-progress, completed, cancelled)
  // This allows users to reschedule any appointment regardless of status
  const isDraggable = true;

  return (
    <div
      ref={cardRef}
      className={`relative group ${className} ${!isDraggable ? 'cursor-not-allowed' : ''}`}
      style={{
        zIndex: showTooltip || showActions ? 50 : 'auto'
      }}
      draggable={isDraggable}
      onDragStart={(e) => {
        if (!isDraggable) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(appointment));
        // Calculate where on the appointment card the user grabbed it
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        onDragStart?.(appointment, offsetY);
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`h-full rounded border-l-[3px] overflow-visible shadow-sm hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer relative ${getStatusColor(appointment.status)}`}
        style={{ borderLeftColor: borderColor }}
      >
        <div className="px-1.5 py-1 h-full flex flex-col justify-start relative">
          {/* Status indicator dot and active encounter badge */}
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusBadgeColor(appointment.status)}`} />
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide">
                {appointment.status === 'in-progress' ? 'Live' : appointment.status === 'scheduled' ? 'Scheduled' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Video Call Badge - Prominent */}
              {appointment.mode === 'video-call' && (
                <div className="flex items-center gap-0.5 px-1 py-0.5 bg-theme-accent text-white rounded text-[8px] font-bold">
                  <Video className="h-2.5 w-2.5" />
                  <span>VIDEO</span>
                </div>
              )}
              {appointment.mode === 'voice-call' && (
                <div className="flex items-center gap-0.5 px-1 py-0.5 bg-theme-secondary text-white rounded text-[8px] font-bold">
                  <Phone className="h-2.5 w-2.5" />
                  <span>CALL</span>
                </div>
              )}
              {appointment.encounterId && (
                <div className="flex items-center gap-0.5 px-1 py-0.5 bg-theme-accent text-white rounded text-[8px] font-bold animate-pulse">
                  <ActivitySquare className="h-2 w-2" />
                  <span>ENCOUNTER</span>
                </div>
              )}
            </div>
          </div>

          {/* Patient Name - Clickable, bold, larger */}
          <div
            onClick={handlePatientClick}
            className="cursor-pointer hover:text-blue-600 transition-colors mb-0.5"
          >
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-[11px] text-gray-900 hover:text-blue-600 truncate leading-tight">
                {appointment.patientName}
              </h3>
              {appointment.mode && getModeIcon(appointment.mode)}
            </div>
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
                      className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[8px] font-medium hover:opacity-90 transition-colors"
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
                      className="flex-1 flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-theme-accent text-white rounded text-[8px] font-medium hover:opacity-90 transition-colors"
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

      {/* Hover Tooltip with Details and Quick Actions */}
      {showTooltip && (
        <div
          className="fixed w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 pointer-events-auto"
          style={{
            zIndex: 9999,
            left: `${(cardRef.current?.getBoundingClientRect().right ?? 0) + 8}px`,
            top: `${cardRef.current?.getBoundingClientRect().top ?? 0}px`
          }}
          onMouseEnter={() => {
            // Keep tooltip open when hovering over it
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
            setShowTooltip(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Patient Info */}
          <div className="border-b border-gray-200 pb-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-sm text-gray-900">{appointment.patientName}</h3>
            </div>
            {appointment.patientAge && (
              <div className="text-xs text-gray-600 ml-6">Age: {appointment.patientAge}</div>
            )}
            {appointment.patientPhone && (
              <div className="flex items-center gap-1 text-xs text-gray-600 ml-6">
                <Phone className="h-3 w-3" />
                {appointment.patientPhone}
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">
                {formatTime(startTime)} - {formatTime(endTime)}
              </span>
              <span className="text-gray-500">({appointment.duration} min)</span>
            </div>

            {appointment.appointmentType && (
              <div className="flex items-center gap-2 text-xs">
                <FileText className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{appointment.appointmentType}</span>
              </div>
            )}

            {appointment.location && (
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{appointment.location}</span>
              </div>
            )}

            {appointment.practitionerName && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">Dr. {appointment.practitionerName}</span>
              </div>
            )}

            {appointment.mode && (
              <div className="flex items-center gap-2 text-xs">
                {getModeIcon(appointment.mode)}
                <span className="text-gray-700 capitalize">{appointment.mode.replace('-', ' ')}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${getStatusBadgeColor(appointment.status)}`} />
              <span className="text-gray-700 font-medium capitalize">{appointment.status.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 pt-2">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quick Actions</div>
            <div className="flex flex-wrap gap-1.5">
              {/* Active Encounter Button - Highlighted */}
              {appointment.encounterId && (
                <button
                  onClick={(e) => handleAction(e, 'encounter')}
                  className="flex items-center gap-1 px-2 py-1 bg-theme-accent text-white rounded text-xs font-bold hover:opacity-90 transition-colors ring-2 ring-theme-accent/50 ring-offset-1 animate-pulse"
                >
                  <ActivitySquare className="h-3 w-3" />
                  Open Encounter
                </button>
              )}

              {appointment.status === 'scheduled' && (
                <>
                  <button
                    onClick={(e) => handleAction(e, 'start')}
                    className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90 transition-colors"
                  >
                    <Play className="h-3 w-3" fill="currentColor" />
                    Start
                  </button>
                  <button
                    onClick={(e) => handleAction(e, 'cancel')}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-400 text-white rounded text-xs font-medium hover:bg-gray-500 transition-colors"
                  >
                    <XCircle className="h-3 w-3" />
                    Cancel
                  </button>
                </>
              )}
              {appointment.status === 'in-progress' && (
                <button
                  onClick={(e) => handleAction(e, 'complete')}
                  className="flex items-center gap-1 px-2 py-1 bg-theme-accent text-white rounded text-xs font-medium hover:opacity-90 transition-colors"
                >
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </button>
              )}
              <button
                onClick={(e) => handleAction(e, 'details')}
                className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-3 w-3" />
                Details
              </button>
              {appointment.patientId && (
                <button
                  onClick={handlePatientClick}
                  className="flex items-center gap-1 px-2 py-1 bg-theme-secondary text-white rounded text-xs font-medium hover:opacity-90 transition-colors"
                >
                  <User className="h-3 w-3" />
                  Patient
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
