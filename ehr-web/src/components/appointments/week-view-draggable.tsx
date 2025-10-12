'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { DraggableAppointmentCard } from './draggable-appointment-card';

interface WeekViewDraggableProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentDrop?: (appointment: Appointment, newDate: Date, newHour: number) => void;
  onCreateAppointment?: (date: Date, startHour: number, endHour: number) => void;
  onAppointmentResize?: (appointment: Appointment, newStartTime: Date, newEndTime: Date) => void;
}

export function WeekViewDraggable({
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentDrop,
  onCreateAppointment,
  onAppointmentResize
}: WeekViewDraggableProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOver, setDragOver] = useState<{date: Date; hour: number} | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{date: Date; hour: number} | null>(null);
  const [createEnd, setCreateEnd] = useState<{date: Date; hour: number} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [resizingAppointment, setResizingAppointment] = useState<{appointment: Appointment; edge: 'top' | 'bottom'} | null>(null);
  const [resizePreview, setResizePreview] = useState<{newStart?: Date; newEnd?: Date} | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Global mouse move handler for smooth resizing
  useEffect(() => {
    if (!resizingAppointment) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!gridContainerRef.current) return;

      const { appointment, edge } = resizingAppointment;
      const aptStart = new Date(appointment.startTime);
      const aptEnd = new Date(appointment.endTime);

      // Get grid container bounds
      const gridRect = gridContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - gridRect.top;

      // Calculate which hour and minute we're at (60px per hour)
      const totalMinutes = Math.max(0, Math.min(1440, (relativeY / 60) * 60)); // 0-1440 minutes (24 hours)
      const snappedMinutes = Math.round(totalMinutes / 15) * 15; // Snap to 15-minute intervals

      const hours = Math.floor(snappedMinutes / 60);
      const minutes = snappedMinutes % 60;

      // Get the date from the appointment
      const appointmentDate = new Date(appointment.startTime);
      const newTime = new Date(appointmentDate);
      newTime.setHours(hours, minutes, 0, 0);

      if (edge === 'top') {
        // Dragging top edge - change start time
        const currentEndTime = resizePreview?.newEnd || aptEnd;
        const maxStart = new Date(currentEndTime);
        maxStart.setMinutes(maxStart.getMinutes() - 15);

        if (newTime.getTime() <= maxStart.getTime()) {
          setResizePreview({ newStart: newTime, newEnd: currentEndTime });
        }
      } else {
        // Dragging bottom edge - change end time
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
  }, [resizingAppointment, resizePreview]);

  const getWeekDates = () => {
    const dates: Date[] = [];
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = current.getDay();

    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    // Generate all 7 days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const getTimeSlots = () => {
    const slots: string[] = [];
    // Show full 24 hours to accommodate all appointment times
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour}:00`);
    }
    return slots;
  };

  // Get all appointments for a specific date (not just a time slot)
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      // Skip all-day events - they're shown separately
      if (apt.isAllDay) return false;

      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);

      // Skip appointments with invalid dates
      if (isNaN(aptStart.getTime()) || isNaN(aptEnd.getTime())) {
        return false;
      }

      // Normalize dates for comparison (remove time component)
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      const aptDateOnly = new Date(aptStart);
      aptDateOnly.setHours(0, 0, 0, 0);

      // Check if appointment is on this date
      return aptDateOnly.getTime() === compareDate.getTime();
    });
  };

  // Calculate appointment positioning and dimensions
  const calculateAppointmentStyle = (appointment: Appointment) => {
    const aptStart = new Date(appointment.startTime);
    const aptEnd = new Date(appointment.endTime);

    // Calculate start position in pixels from midnight
    const startHour = aptStart.getHours();
    const startMinutes = aptStart.getMinutes();
    const startPosition = (startHour * 60 + startMinutes) * (60 / 60); // 60px per hour

    // Calculate duration in pixels
    const durationMs = aptEnd.getTime() - aptStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const height = (durationMinutes / 60) * 60; // 60px per hour

    return {
      top: startPosition,
      height: Math.max(height, 30) // Minimum height of 30px
    };
  };

  // Detect overlapping appointments and calculate horizontal offset
  const calculateAppointmentLayout = (dateAppointments: Appointment[]) => {
    if (dateAppointments.length === 0) {
      return new Map<string, { column: number; totalColumns: number; overlappingWith: Set<string> }>();
    }

    // Sort by start time, then by duration (longer first)
    const sorted = [...dateAppointments].sort((a, b) => {
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

  const handleDragOver = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    // Update drag over state
    if (!dragOver || dragOver.date.toDateString() !== date.toDateString() || dragOver.hour !== hour) {
      setDragOver({ date, hour });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving the entire grid area
    const target = e.currentTarget;
    const relatedTarget = e.relatedTarget as HTMLElement;

    if (!relatedTarget || !target.contains(relatedTarget)) {
      setDragOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();

    if (draggedAppointment) {
      onAppointmentDrop?.(draggedAppointment, date, hour);
    }

    setDraggedAppointment(null);
    setDragOver(null);
  };

  // Resize handlers
  const handleResizeStart = (appointment: Appointment, edge: 'top' | 'bottom', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingAppointment({ appointment, edge });
    setResizePreview({});
  };

  const handleResizeMove = (e: React.MouseEvent, date: Date, hour: number) => {
    if (!resizingAppointment) return;

    const { appointment, edge } = resizingAppointment;
    const aptStart = new Date(appointment.startTime);
    const aptEnd = new Date(appointment.endTime);

    // Calculate new time based on mouse position within the hour slot
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentInCell = relativeY / rect.height;
    const minutesInHour = Math.floor(percentInCell * 60);

    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutesInHour / 15) * 15;

    const newTime = new Date(date);
    newTime.setHours(hour, snappedMinutes, 0, 0);

    if (edge === 'top') {
      // Dragging top edge - change start time
      // Use the current preview end time if available, otherwise use original end time
      const currentEndTime = resizePreview?.newEnd || aptEnd;

      // Don't allow start to go past end minus 15 minutes
      const maxStart = new Date(currentEndTime);
      maxStart.setMinutes(maxStart.getMinutes() - 15);

      if (newTime.getTime() <= maxStart.getTime()) {
        setResizePreview({ newStart: newTime, newEnd: currentEndTime });
      }
    } else {
      // Dragging bottom edge - change end time
      // Use the current preview start time if available, otherwise use original start time
      const currentStartTime = resizePreview?.newStart || aptStart;

      // Don't allow end to go before start plus 15 minutes
      const minEnd = new Date(currentStartTime);
      minEnd.setMinutes(minEnd.getMinutes() + 15);

      if (newTime.getTime() >= minEnd.getTime()) {
        setResizePreview({ newStart: currentStartTime, newEnd: newTime });
      }
    }
  };

  const handleResizeEnd = () => {
    if (resizingAppointment && resizePreview && (resizePreview.newStart || resizePreview.newEnd)) {
      const { appointment } = resizingAppointment;
      const newStartTime = resizePreview.newStart || new Date(appointment.startTime);
      const newEndTime = resizePreview.newEnd || new Date(appointment.endTime);

      // Only call if times actually changed
      if (newStartTime.getTime() !== new Date(appointment.startTime).getTime() ||
          newEndTime.getTime() !== new Date(appointment.endTime).getTime()) {
        onAppointmentResize?.(appointment, newStartTime, newEndTime);
      }
    }

    setResizingAppointment(null);
    setResizePreview(null);
  };

  // Click and drag to create appointments
  const handleMouseDown = (e: React.MouseEvent, date: Date, hour: number) => {
    // Only start if clicking in empty space (not on an appointment)
    if ((e.target as HTMLElement).closest('[draggable="true"]')) {
      return;
    }
    
    setIsCreating(true);
    setCreateStart({ date, hour });
    setCreateEnd({ date, hour });
  };

  const handleMouseEnter = (date: Date, hour: number) => {
    if (isCreating && createStart) {
      // Only allow creating on same date
      if (date.toDateString() === createStart.date.toDateString()) {
        setCreateEnd({ date, hour });
      }
    }
  };

  const handleMouseUp = () => {
    if (isCreating && createStart && createEnd) {
      const startHour = Math.min(createStart.hour, createEnd.hour);
      const endHour = Math.max(createStart.hour, createEnd.hour) + 1; // +1 to include the end hour
      
      onCreateAppointment?.(createStart.date, startHour, endHour);
    }
    
    setIsCreating(false);
    setCreateStart(null);
    setCreateEnd(null);
  };

  const isInCreateRange = (date: Date, hour: number) => {
    if (!isCreating || !createStart || !createEnd) return false;

    if (date.toDateString() !== createStart.date.toDateString()) return false;

    const minHour = Math.min(createStart.hour, createEnd.hour);
    const maxHour = Math.max(createStart.hour, createEnd.hour);

    return hour >= minHour && hour <= maxHour;
  };

  const weekDates = React.useMemo(() => getWeekDates(), [currentDate]);
  const timeSlots = getTimeSlots();
  const today = new Date();

  // Pre-calculate appointments for each date
  const appointmentsByDate = React.useMemo(() => {
    const map = new Map<string, Appointment[]>();
    weekDates.forEach(date => {
      const dateStr = date.toDateString();
      const dateApts = getAppointmentsForDate(date);
      map.set(dateStr, dateApts);

      // Debug logging
      if (dateApts.length > 0) {
        console.log(`📅 ${dateStr}: ${dateApts.length} appointments`, dateApts.map(a => ({
          name: a.patientName,
          start: new Date(a.startTime).toLocaleTimeString(),
          end: new Date(a.endTime).toLocaleTimeString()
        })));
      }
    });
    return map;
  }, [appointments, currentDate]);

  // Pre-calculate layout for each date
  const layoutByDate = React.useMemo(() => {
    const map = new Map<string, Map<string, { column: number; totalColumns: number }>>();
    weekDates.forEach(date => {
      const dateStr = date.toDateString();
      const dateApts = appointmentsByDate.get(dateStr) || [];
      const layout = calculateAppointmentLayout(dateApts);
      map.set(dateStr, layout);

      // Debug logging
      if (dateApts.length > 1) {
        console.log(`📐 ${dateStr} layout:`, Array.from(layout.entries()).map(([id, info]) => ({
          id: id.substring(0, 8),
          column: info.column,
          totalColumns: info.totalColumns
        })));
      }
    });
    return map;
  }, [appointmentsByDate, currentDate]);

  // Auto-scroll to current time on mount and when week changes
  useEffect(() => {
    const scrollToCurrentTime = () => {
      if (scrollContainerRef.current) {
        // Check if today is in current week view
        const todayInView = weekDates.some(date => date.toDateString() === today.toDateString());

        if (todayInView) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinutes = now.getMinutes();

          // Calculate the position: each hour slot is 60px tall (min-h-[60px])
          const totalMinutesFromMidnight = currentHour * 60 + currentMinutes;
          const pixelPosition = (totalMinutesFromMidnight / 60) * 60; // Convert to pixels

          // Get container height to calculate offset
          const containerHeight = scrollContainerRef.current.clientHeight;

          // Center the current time in the view, or show 2 hours above if not enough space
          const offset = Math.min(200, containerHeight / 3);
          const scrollPosition = Math.max(0, pixelPosition - offset);

          // Use requestAnimationFrame for smooth scrolling after render
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
              });
            }
          });
        }
      }
    };

    // Delay to ensure DOM is fully rendered
    const timer = setTimeout(scrollToCurrentTime, 150);

    return () => clearTimeout(timer);
  }, [currentDate]); // Re-scroll when date changes to different week

  // Filter all-day events
  const allDayEvents = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return apt.isAllDay && weekDates.some(date => date.toDateString() === aptDate.toDateString());
  });

  const getAllDayEventsForDate = (date: Date) => {
    return allDayEvents.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Calculate position of current time indicator
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    // Each hour slot is 60px tall
    return hours * 60 + (minutes / 60) * 60;
  };

  const isCurrentTimeVisible = () => {
    const today = new Date();
    return weekDates.some(date => date.toDateString() === today.toDateString());
  };

  const getTodayColumnIndex = () => {
    const today = new Date();
    return weekDates.findIndex(date => date.toDateString() === today.toDateString());
  };

  const scrollToNow = () => {
    if (scrollContainerRef.current && isCurrentTimeVisible()) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      const totalMinutesFromMidnight = currentHour * 60 + currentMinutes;
      const pixelPosition = (totalMinutesFromMidnight / 60) * 60;

      const containerHeight = scrollContainerRef.current.clientHeight;
      const offset = Math.min(200, containerHeight / 3);
      const scrollPosition = Math.max(0, pixelPosition - offset);

      scrollContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

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
      {/* Week header */}
      <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b border-gray-200 bg-gray-50">
        <div className="border-r border-gray-200 p-2"></div>
        {weekDates.map((date, idx) => {
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center border-r border-gray-200 p-2 last:border-r-0"
            >
              <div className="text-xs font-medium text-gray-500 uppercase">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900'
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b border-gray-200 bg-gray-50/50">
          <div className="border-r border-gray-200 py-2 px-2 text-right text-[10px] font-semibold text-gray-500 uppercase">
            All Day
          </div>
          {weekDates.map((date, idx) => {
            const dayAllDayEvents = getAllDayEventsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div
                key={idx}
                className={`relative min-h-[50px] border-r border-gray-200 p-1 last:border-r-0 ${
                  isToday ? 'bg-blue-50/40' : 'bg-white'
                }`}
              >
                <div className="flex flex-col gap-1">
                  {dayAllDayEvents.map((apt) => {
                    // Determine event type and styling
                    const eventType = apt.allDayEventType || 'appointment';

                    // Define colors and icons for different event types
                    const eventStyles: Record<string, { bg: string; text: string; icon: string; border: string }> = {
                      'leave': { bg: 'bg-orange-500', text: 'text-white', icon: '🏖️', border: 'border-orange-600' },
                      'vacation': { bg: 'bg-purple-500', text: 'text-white', icon: '✈️', border: 'border-purple-600' },
                      'holiday': { bg: 'bg-red-500', text: 'text-white', icon: '🎉', border: 'border-red-600' },
                      'conference': { bg: 'bg-blue-500', text: 'text-white', icon: '🎤', border: 'border-blue-600' },
                      'training': { bg: 'bg-green-500', text: 'text-white', icon: '📚', border: 'border-green-600' },
                      'other': { bg: 'bg-gray-500', text: 'text-white', icon: '📌', border: 'border-gray-600' },
                      'appointment': { bg: '', text: 'text-white', icon: '📅', border: '' }
                    };

                    const style = eventStyles[eventType] || eventStyles.appointment;

                    // For regular appointments, use practitioner color
                    const isHexColor = typeof apt.practitionerColor === 'string' && apt.practitionerColor.startsWith('#');
                    const useCustomColor = eventType === 'appointment' && apt.practitionerColor;
                    const bgColor = useCustomColor ? (isHexColor ? null : apt.practitionerColor) : null;

                    return (
                      <div
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className={`cursor-pointer rounded px-2 py-1.5 text-[11px] font-medium shadow-sm hover:shadow-md transition-all border-l-4 ${
                          useCustomColor && !isHexColor ? bgColor : style.bg
                        } ${style.text} ${style.border}`}
                        style={useCustomColor && isHexColor ? {
                          backgroundColor: apt.practitionerColor,
                          borderLeftColor: apt.practitionerColor
                        } : undefined}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('application/json', JSON.stringify(apt));
                          handleDragStart(apt);
                        }}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{style.icon}</span>
                          <span className="truncate flex-1">{apt.patientName}</span>
                          {eventType !== 'appointment' && (
                            <span className="text-[9px] opacity-90 uppercase font-semibold">
                              {eventType}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
        <div ref={gridContainerRef} className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] relative" style={{ minHeight: '1440px' }}>
          {/* Time labels and grid cells */}
          {timeSlots.map((time, timeIdx) => {
            const [hour] = time.split(':').map(Number);

            return (
              <React.Fragment key={timeIdx}>
                {/* Time label */}
                <div className="border-b border-r border-gray-200 bg-gray-50 p-2 text-right text-xs text-gray-500 h-[60px]">
                  {time}
                </div>

                {/* Day columns - empty cells for grid */}
                {weekDates.map((date, dateIdx) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isDraggedOver = dragOver?.date.toDateString() === date.toDateString() && dragOver.hour === hour;
                  const inCreateRange = isInCreateRange(date, hour);

                  return (
                    <div
                      key={dateIdx}
                      className={`relative h-[60px] border-b border-r border-gray-200 last:border-r-0 transition-colors ${
                        isToday ? 'bg-blue-50/30' : 'bg-white'
                      } ${isDraggedOver ? 'bg-blue-100' : ''} ${
                        inCreateRange ? 'bg-green-100 ring-2 ring-inset ring-green-400' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, date, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, date, hour)}
                      onMouseDown={(e) => handleMouseDown(e, date, hour)}
                      onMouseEnter={(e) => {
                        handleMouseEnter(date, hour);
                        if (resizingAppointment) {
                          handleResizeMove(e, date, hour);
                        }
                      }}
                      onMouseUp={resizingAppointment ? handleResizeEnd : undefined}
                    >
                      {/* Visual indicator for drag over */}
                      {isDraggedOver && (
                        <div className="absolute inset-0 border-2 border-blue-500 bg-blue-100/50 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Appointments overlay - absolutely positioned */}
          {/* Disable pointer events on appointment overlay while dragging to allow drops */}
          {weekDates.map((date, dateIdx) => {
            const dateStr = date.toDateString();
            const dateAppointments = appointmentsByDate.get(dateStr) || [];
            const layout = layoutByDate.get(dateStr);

            // Debug logging for rendering
            if (dateAppointments.length > 0 && dateStr === 'Mon Oct 13 2025') {
              console.log(`🎨 RENDERING ${dateAppointments.length} appointments for ${dateStr}:`, {
                appointments: dateAppointments.map(a => ({
                  id: a.id.substring(0, 8),
                  name: a.patientName,
                  style: calculateAppointmentStyle(a),
                  layout: layout?.get(a.id)
                }))
              });
            }

            return (
              <div
                key={`appointments-${dateIdx}`}
                className="absolute pointer-events-none"
                style={{
                  left: `calc(80px + ${dateIdx} * (100% - 80px) / 7)`,
                  width: `calc((100% - 80px) / 7)`,
                  top: 0,
                  height: '100%'
                }}
              >
                {dateAppointments.map((apt) => {
                  const isBeingResized = resizingAppointment?.appointment.id === apt.id;
                  const baseStyle = calculateAppointmentStyle(apt);

                  // Apply resize preview if this appointment is being resized
                  let style = baseStyle;
                  if (isBeingResized && resizePreview) {
                    const previewStart = resizePreview.newStart || new Date(apt.startTime);
                    const previewEnd = resizePreview.newEnd || new Date(apt.endTime);

                    const startHour = previewStart.getHours();
                    const startMinutes = previewStart.getMinutes();
                    const top = (startHour * 60 + startMinutes);

                    const durationMs = previewEnd.getTime() - previewStart.getTime();
                    const durationMinutes = durationMs / (1000 * 60);
                    const height = Math.max((durationMinutes / 60) * 60, 30);

                    style = { top, height };
                  }

                  const layoutInfo = layout?.get(apt.id);

                  // Check if this is the appointment being dragged
                  const isDragging = draggedAppointment?.id === apt.id;

                  const appointmentElement = (
                    <div className="relative h-full group">
                      {/* Main appointment card */}
                      <div
                        className="h-full"
                        onClick={(e) => {
                          // Only trigger click if not resizing
                          if (!resizingAppointment) {
                            onAppointmentClick?.(apt);
                          }
                        }}
                      >
                        <DraggableAppointmentCard
                          appointment={apt}
                          onClick={undefined}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          className="h-full"
                          spanning
                        />
                      </div>

                      {/* Top resize handle - only show if appointment is tall enough */}
                      {style.height >= 45 && (
                        <div
                          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-start justify-center"
                          onMouseDown={(e) => handleResizeStart(apt, 'top', e)}
                          title="Drag to change start time"
                        >
                          <div className="w-8 h-1 bg-blue-500/50 rounded-full mt-1" />
                        </div>
                      )}

                      {/* Bottom resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-end justify-center"
                        onMouseDown={(e) => handleResizeStart(apt, 'bottom', e)}
                        title="Drag to change end time"
                      >
                        <div className="w-8 h-1 bg-blue-500/50 rounded-full mb-1" />
                      </div>
                    </div>
                  );

                  if (!layoutInfo) {
                    // Single appointment, no overlap
                    return (
                      <div
                        key={apt.id}
                        className={`absolute pointer-events-auto ${isDragging ? 'opacity-50' : ''} ${isBeingResized ? 'opacity-70' : ''}`}
                        style={{
                          top: `${style.top}px`,
                          height: `${style.height}px`,
                          left: '2px',
                          right: '2px',
                          zIndex: isDragging || isBeingResized ? 1000 : 10
                        }}
                      >
                        {appointmentElement}
                      </div>
                    );
                  }

                  // Multiple overlapping appointments
                  const columnWidth = 100 / layoutInfo.totalColumns;
                  const leftPercent = (layoutInfo.column * 100) / layoutInfo.totalColumns;

                  return (
                    <div
                      key={apt.id}
                      className={`absolute pointer-events-auto ${isDragging ? 'opacity-50' : ''} ${isBeingResized ? 'opacity-70' : ''}`}
                      style={{
                        top: `${style.top}px`,
                        height: `${style.height}px`,
                        left: `calc(${leftPercent}% + 1px)`,
                        width: `calc(${columnWidth}% - 2px)`,
                        zIndex: isDragging || isBeingResized ? 1000 : 10 + layoutInfo.column
                      }}
                    >
                      {appointmentElement}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Current Time Indicator - Red Line */}
          {isCurrentTimeVisible() && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${getCurrentTimePosition()}px` }}
            >
              {/* Time label */}
              <div className="absolute left-0 w-[80px] flex items-center justify-end pr-2">
                <span className="bg-red-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                  {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>
              {/* Red line across all columns */}
              <div className="absolute left-[80px] right-0 flex">
                <div className="h-0.5 bg-red-600 shadow-sm" style={{ width: '100%' }}>
                  {/* Circle indicator at the start of today's column */}
                  {getTodayColumnIndex() !== -1 && (
                    <div
                      className="absolute -top-1 w-2.5 h-2.5 bg-red-600 rounded-full shadow-sm"
                      style={{
                        left: `calc(${(getTodayColumnIndex() / 7) * 100}% + 4px)`
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions overlay */}
      {isCreating && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50">
          Drag to set appointment duration • Release to create
        </div>
      )}

      {/* Scroll to Now button - only show when viewing today */}
      {isCurrentTimeVisible() && (
        <button
          onClick={scrollToNow}
          className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-30 flex items-center gap-2 transition-colors"
          title="Scroll to current time"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Now
        </button>
      )}
    </div>
  );
}
