'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Appointment } from '@/types/appointment';
import { DetailedAppointmentCard } from './detailed-appointment-card';
import { useCalendarSettings } from '@/hooks/useCalendarSettings';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentDrop?: (appointment: Appointment, newDate: Date, newHour: number) => void;
  onCreateAppointment?: (date: Date, startHour: number, endHour: number) => void;
  onAppointmentResize?: (appointment: Appointment, newStartTime: Date, newEndTime: Date) => void;
}

export function DayView({
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentDrop,
  onCreateAppointment,
  onAppointmentResize
}: DayViewProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<number | null>(null);
  const [createEnd, setCreateEnd] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [resizingAppointment, setResizingAppointment] = useState<{appointment: Appointment; edge: 'top' | 'bottom'} | null>(null);
  const [resizePreview, setResizePreview] = useState<{newStart?: Date; newEnd?: Date} | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Get calendar settings (slot duration)
  const { getTimeSlots: getTimeSlotsFromSettings, slotDuration } = useCalendarSettings();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Global mouse handlers for smooth resizing
  useEffect(() => {
    if (!resizingAppointment) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!gridContainerRef.current) return;

      const { appointment, edge } = resizingAppointment;
      const aptStart = new Date(appointment.startTime);
      const aptEnd = new Date(appointment.endTime);

      const gridRect = gridContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - gridRect.top;

      const totalMinutes = Math.max(0, Math.min(1440, (relativeY / 60) * 60));
      const snappedMinutes = Math.round(totalMinutes / 15) * 15;

      const hours = Math.floor(snappedMinutes / 60);
      const minutes = snappedMinutes % 60;

      const newTime = new Date(currentDate);
      newTime.setHours(hours, minutes, 0, 0);

      if (edge === 'top') {
        const currentEndTime = resizePreview?.newEnd || aptEnd;
        const maxStart = new Date(currentEndTime);
        maxStart.setMinutes(maxStart.getMinutes() - 15);

        if (newTime.getTime() <= maxStart.getTime()) {
          setResizePreview({ newStart: newTime, newEnd: currentEndTime });
        }
      } else {
        const currentStartTime = resizePreview?.newStart || aptStart;
        const minEnd = new Date(currentStartTime);
        minEnd.setMinutes(minEnd.getMinutes() + 15);

        if (newTime.getTime() >= minEnd.getTime()) {
          setResizePreview({ newStart: currentStartTime, newEnd: newTime });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      handleResizeEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizingAppointment, resizePreview, currentDate]);

  // Use dynamic time slots from settings
  const timeSlots = getTimeSlotsFromSettings(0, 24);

  // Get appointments for the current date
  const getDayAppointments = () => {
    return appointments.filter(apt => {
      if (apt.isAllDay) return false;

      const aptStart = new Date(apt.startTime);
      if (isNaN(aptStart.getTime())) return false;

      const compareDate = new Date(currentDate);
      compareDate.setHours(0, 0, 0, 0);

      const aptDateOnly = new Date(aptStart);
      aptDateOnly.setHours(0, 0, 0, 0);

      return aptDateOnly.getTime() === compareDate.getTime();
    });
  };

  // Calculate appointment positioning
  const calculateAppointmentStyle = (appointment: Appointment) => {
    const aptStart = new Date(appointment.startTime);
    const aptEnd = new Date(appointment.endTime);

    const startHour = aptStart.getHours();
    const startMinutes = aptStart.getMinutes();
    const startPosition = (startHour * 60 + startMinutes);

    const durationMs = aptEnd.getTime() - aptStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const height = (durationMinutes / 60) * 60;

    return {
      top: startPosition,
      height: Math.max(height, 30)
    };
  };

  // Detect overlapping appointments and calculate horizontal layout
  const calculateAppointmentLayout = (appointments: Appointment[]) => {
    if (appointments.length === 0) {
      return new Map<string, { column: number; totalColumns: number; overlappingWith: Set<string> }>();
    }

    // Sort by start time, then by duration (longer first)
    const sorted = [...appointments].sort((a, b) => {
      const aStart = new Date(a.startTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      if (aStart !== bStart) return aStart - bStart;

      const aDuration = new Date(a.endTime).getTime() - aStart;
      const bDuration = new Date(b.endTime).getTime() - bStart;
      return bDuration - aDuration;
    });

    // Build overlap groups
    const overlaps = new Map<string, Set<string>>();

    sorted.forEach((apt, i) => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      const aptOverlaps = new Set<string>();

      sorted.forEach((other, j) => {
        if (i === j) return;

        const otherStart = new Date(other.startTime);
        const otherEnd = new Date(other.endTime);

        // Check if appointments overlap
        if (aptStart < otherEnd && aptEnd > otherStart) {
          aptOverlaps.add(other.id);
        }
      });

      overlaps.set(apt.id, aptOverlaps);
    });

    // Assign columns using graph coloring
    const layoutMap = new Map<string, { column: number; totalColumns: number; overlappingWith: Set<string> }>();
    const columnAssignments = new Map<string, number>();

    sorted.forEach(apt => {
      const aptOverlaps = overlaps.get(apt.id) || new Set();

      // Find columns already used by overlapping appointments
      const usedColumns = new Set<number>();
      aptOverlaps.forEach(overlapId => {
        const col = columnAssignments.get(overlapId);
        if (col !== undefined) {
          usedColumns.add(col);
        }
      });

      // Find first available column
      let column = 0;
      while (usedColumns.has(column)) {
        column++;
      }

      columnAssignments.set(apt.id, column);
    });

    // Calculate max columns needed for each appointment's overlap group
    sorted.forEach(apt => {
      const aptOverlaps = overlaps.get(apt.id) || new Set();
      const column = columnAssignments.get(apt.id) || 0;

      // Find max column in this overlap group
      let maxColumn = column;
      aptOverlaps.forEach(overlapId => {
        const col = columnAssignments.get(overlapId);
        if (col !== undefined && col > maxColumn) {
          maxColumn = col;
        }
      });

      const totalColumns = maxColumn + 1;
      layoutMap.set(apt.id, { column, totalColumns, overlappingWith: aptOverlaps });
    });

    return layoutMap;
  };

  const handleDragStart = (appointment: Appointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(hour);
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (draggedAppointment) {
      onAppointmentDrop?.(draggedAppointment, currentDate, hour);
    }
    setDraggedAppointment(null);
    setDragOver(null);
  };

  const handleResizeStart = (appointment: Appointment, edge: 'top' | 'bottom', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingAppointment({ appointment, edge });
    setResizePreview({});
  };

  const handleResizeEnd = () => {
    if (resizingAppointment && resizePreview && (resizePreview.newStart || resizePreview.newEnd)) {
      const { appointment } = resizingAppointment;
      const newStartTime = resizePreview.newStart || new Date(appointment.startTime);
      const newEndTime = resizePreview.newEnd || new Date(appointment.endTime);

      if (newStartTime.getTime() !== new Date(appointment.startTime).getTime() ||
          newEndTime.getTime() !== new Date(appointment.endTime).getTime()) {
        onAppointmentResize?.(appointment, newStartTime, newEndTime);
      }
    }

    setResizingAppointment(null);
    setResizePreview(null);
  };

  const handleMouseDown = (e: React.MouseEvent, hour: number) => {
    if ((e.target as HTMLElement).closest('[draggable="true"]')) {
      return;
    }

    setIsCreating(true);
    setCreateStart(hour);
    setCreateEnd(hour);
  };

  const handleMouseEnter = (hour: number) => {
    if (isCreating && createStart !== null) {
      setCreateEnd(hour);
    }
  };

  const handleMouseUp = () => {
    if (isCreating && createStart !== null && createEnd !== null) {
      const startHour = Math.min(createStart, createEnd);
      const endHour = Math.max(createStart, createEnd) + 1;

      onCreateAppointment?.(currentDate, startHour, endHour);
    }

    setIsCreating(false);
    setCreateStart(null);
    setCreateEnd(null);
  };

  const isInCreateRange = (hour: number) => {
    if (!isCreating || createStart === null || createEnd === null) return false;
    const minHour = Math.min(createStart, createEnd);
    const maxHour = Math.max(createStart, createEnd);
    return hour >= minHour && hour <= maxHour;
  };

  const dayAppointments = getDayAppointments();
  const appointmentLayout = React.useMemo(() => calculateAppointmentLayout(dayAppointments), [dayAppointments]);
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours * 60 + (minutes / 60) * 60;
  };

  // Auto-scroll to current time on mount
  useEffect(() => {
    const scrollToCurrentTime = () => {
      if (scrollContainerRef.current && isToday) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        const totalMinutesFromMidnight = currentHour * 60 + currentMinutes;
        const pixelPosition = (totalMinutesFromMidnight / 60) * 60;

        const containerHeight = scrollContainerRef.current.clientHeight;
        const offset = Math.min(200, containerHeight / 3);
        const scrollPosition = Math.max(0, pixelPosition - offset);

        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        });
      }
    };

    const timer = setTimeout(scrollToCurrentTime, 150);
    return () => clearTimeout(timer);
  }, [currentDate, isToday]);

  // Filter all-day events
  const allDayEvents = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return apt.isAllDay && aptDate.toDateString() === currentDate.toDateString();
  });

  return (
    <div
      className="flex h-full flex-col overflow-hidden select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isCreating) {
          handleMouseUp();
        }
      }}
    >
      {/* Day header with stats */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold shadow-md ${
                  isToday
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200'
                }`}
              >
                {currentDate.getDate()}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {dayAppointments.length} {dayAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2">
            {[
              { label: 'Scheduled', count: dayAppointments.filter(a => a.status === 'scheduled').length, color: 'bg-gray-100 text-gray-700' },
              { label: 'In Progress', count: dayAppointments.filter(a => a.status === 'in-progress').length, color: 'bg-red-100 text-red-700' },
              { label: 'Completed', count: dayAppointments.filter(a => a.status === 'completed').length, color: 'bg-green-100 text-green-700' },
            ].map((stat) => (
              <div key={stat.label} className={`px-3 py-2 rounded-lg ${stat.color}`}>
                <div className="text-xs font-medium opacity-75">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-gray-200 bg-gray-50/30">
          <div className="w-20 border-r border-gray-200 py-1.5 px-2 text-right">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">All Day</span>
          </div>
          <div className="flex-1 p-2 bg-white/50">
            <div className="flex flex-col gap-2">
              {allDayEvents.map((apt) => {
                const eventType = apt.allDayEventType || 'appointment';
                const eventStyles: Record<string, { bg: string; text: string; icon: string }> = {
                  'leave': { bg: 'bg-orange-500', text: 'text-white', icon: '🏖️' },
                  'vacation': { bg: 'bg-purple-500', text: 'text-white', icon: '✈️' },
                  'holiday': { bg: 'bg-red-500', text: 'text-white', icon: '🎉' },
                  'conference': { bg: 'bg-blue-500', text: 'text-white', icon: '🎤' },
                  'training': { bg: 'bg-green-500', text: 'text-white', icon: '📚' },
                  'other': { bg: 'bg-gray-500', text: 'text-white', icon: '📌' },
                  'appointment': { bg: '', text: 'text-white', icon: '📅' }
                };

                const style = eventStyles[eventType] || eventStyles.appointment;
                const useCustomColor = eventType === 'appointment' && apt.practitionerColor;

                return (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick?.(apt)}
                    className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:shadow transition-all ${
                      useCustomColor ? '' : style.bg
                    } ${style.text}`}
                    style={useCustomColor ? {
                      backgroundColor: apt.practitionerColor
                    } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{style.icon}</span>
                      <span className="font-semibold">{apt.patientName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Time grid with appointments */}
      <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-gray-50 to-white" ref={scrollContainerRef}>
        <div ref={gridContainerRef} className="flex relative" style={{ minHeight: '1440px' }}>
          {/* Time labels */}
          <div className="w-24 border-r-2 border-gray-300 bg-white">
            {timeSlots.map((time, idx) => {
              const [hourStr, minStr] = time.split(':');
              const hour = parseInt(hourStr);
              const min = parseInt(minStr);
              const formattedTime = hour === 0 ? `12:${minStr} AM` : hour < 12 ? `${hour}:${minStr} AM` : hour === 12 ? `12:${minStr} PM` : `${hour - 12}:${minStr} PM`;

              // Dynamic height based on slot duration
              const slotHeightPx = 60; // Base height for visual consistency

              return (
                <div key={idx} className="border-b border-gray-200 py-2 px-3 text-right flex items-start justify-end bg-gradient-to-r from-gray-50 to-white" style={{ height: `${slotHeightPx}px` }}>
                  <span className="text-xs font-bold text-gray-700">{formattedTime}</span>
                </div>
              );
            })}
          </div>

          {/* Appointments column */}
          <div className="flex-1 relative">
            {timeSlots.map((time, idx) => {
              const [hourStr] = time.split(':');
              const hour = parseInt(hourStr);
              const isDraggedOver = dragOver === hour;
              const inCreateRange = isInCreateRange(hour);

              const slotHeightPx = 60; // Match time labels height

              return (
                <div
                  key={idx}
                  className={`relative border-b border-gray-200 transition-colors ${
                    isToday ? 'bg-blue-50/10' : 'bg-white'
                  } ${isDraggedOver ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : ''} ${
                    inCreateRange ? 'bg-green-50 ring-2 ring-inset ring-green-400' : ''
                  } hover:bg-gray-50/50`}
                  style={{ height: `${slotHeightPx}px` }}
                  onDragOver={(e) => handleDragOver(e, hour)}
                  onDrop={(e) => handleDrop(e, hour)}
                  onMouseDown={(e) => handleMouseDown(e, hour)}
                  onMouseEnter={() => handleMouseEnter(hour)}
                >
                  {isDraggedOver && (
                    <div className="absolute inset-0 border-2 border-blue-500 bg-blue-100/40 pointer-events-none" />
                  )}
                </div>
              );
            })}

            {/* Appointments overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {dayAppointments.map((apt) => {
                const isBeingResized = resizingAppointment?.appointment.id === apt.id;
                const baseStyle = calculateAppointmentStyle(apt);

                // Calculate style based on 80px per hour
                let style = {
                  top: baseStyle.top * (80/60),
                  height: Math.max(baseStyle.height * (80/60), 60) // Minimum 60px for details
                };

                if (isBeingResized && resizePreview) {
                  const previewStart = resizePreview.newStart || new Date(apt.startTime);
                  const previewEnd = resizePreview.newEnd || new Date(apt.endTime);

                  const startHour = previewStart.getHours();
                  const startMinutes = previewStart.getMinutes();
                  const top = (startHour * 60 + startMinutes) * (80/60);

                  const durationMs = previewEnd.getTime() - previewStart.getTime();
                  const durationMinutes = durationMs / (1000 * 60);
                  const height = Math.max((durationMinutes / 60) * 80, 60);

                  style = { top, height };
                }

                const isDragging = draggedAppointment?.id === apt.id;
                const layoutInfo = appointmentLayout.get(apt.id);

                // Calculate horizontal positioning based on overlap
                let leftStyle: string;
                let widthStyle: string;

                if (!layoutInfo || layoutInfo.totalColumns === 1) {
                  // Single appointment, no overlap
                  leftStyle = '8px';
                  widthStyle = 'calc(100% - 16px)';
                } else {
                  // Multiple overlapping appointments - side by side
                  const columnWidth = 100 / layoutInfo.totalColumns;
                  const leftPercent = (layoutInfo.column * 100) / layoutInfo.totalColumns;
                  leftStyle = `calc(${leftPercent}% + 4px)`;
                  widthStyle = `calc(${columnWidth}% - 8px)`;
                }

                return (
                  <div
                    key={apt.id}
                    className={`absolute pointer-events-auto ${isDragging ? 'opacity-50' : ''} ${isBeingResized ? 'opacity-80 ring-2 ring-blue-500' : ''}`}
                    style={{
                      top: `${style.top}px`,
                      height: `${style.height}px`,
                      left: leftStyle,
                      width: widthStyle,
                      zIndex: isDragging || isBeingResized ? 1000 : 10 + (layoutInfo?.column || 0)
                    }}
                  >
                    <div className="relative h-full group">
                      <DetailedAppointmentCard
                        appointment={apt}
                        onClick={() => {
                          if (!resizingAppointment) {
                            onAppointmentClick?.(apt);
                          }
                        }}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        className="h-full"
                      />

                      {/* Top resize handle */}
                      {style.height >= 80 && (
                        <div
                          className="absolute top-0 left-0 right-0 h-4 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-start justify-center"
                          onMouseDown={(e) => handleResizeStart(apt, 'top', e)}
                          title="Drag to change start time"
                        >
                          <div className="w-12 h-1.5 bg-blue-600 rounded-full mt-1.5 shadow-md" />
                        </div>
                      )}

                      {/* Bottom resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-end justify-center"
                        onMouseDown={(e) => handleResizeStart(apt, 'bottom', e)}
                        title="Drag to change end time"
                      >
                        <div className="w-12 h-1.5 bg-blue-600 rounded-full mb-1.5 shadow-md" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Time Indicator */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${getCurrentTimePosition() * (80/60)}px` }}
              >
                <div className="h-0.5 bg-red-600 shadow-lg" style={{ width: '100%' }}>
                  <div className="absolute -top-1.5 -left-1 w-3 h-3 bg-red-600 rounded-full shadow-lg animate-pulse" />
                  <div className="absolute -top-5 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                    {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      {isCreating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold z-50 flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Drag to set duration • Release to create
        </div>
      )}
    </div>
  );
}
