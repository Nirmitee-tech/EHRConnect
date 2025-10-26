'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { CompactAppointmentCard } from './compact-appointment-card';
import { useCalendarSettings } from '@/hooks/useCalendarSettings';

interface WeekViewDraggableProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentDrop?: (appointment: Appointment, newDate: Date, newHour: number) => void;
  onCreateAppointment?: (date: Date, startTime: Date, endTime: Date) => void;
  onAppointmentResize?: (appointment: Appointment, newStartTime: Date, newEndTime: Date) => void;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  onStartEncounter?: (appointment: Appointment) => void;
}

export function WeekViewDraggable({
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentDrop,
  onCreateAppointment,
  onAppointmentResize,
  onStatusChange,
  onStartEncounter
}: WeekViewDraggableProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0); // Track where on the card the user grabbed
  const [dragOver, setDragOver] = useState<{date: Date; hour: number} | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{date: Date; hour: number; minutes: number} | null>(null);
  const [createEnd, setCreateEnd] = useState<{date: Date; hour: number; minutes: number} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [resizingAppointment, setResizingAppointment] = useState<{appointment: Appointment; edge: 'top' | 'bottom'} | null>(null);
  const [resizePreview, setResizePreview] = useState<{newStart?: Date; newEnd?: Date} | null>(null);
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Get calendar settings for dynamic slot duration
  const { getTimeSlots: getTimeSlotsFromSettings, slotDuration } = useCalendarSettings();

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

      // Calculate total grid height and pixels per minute
      const totalGridHeight = timeSlots.length * 60;
      const totalMinutesInDay = 24 * 60;
      const pixelsPerMinute = totalGridHeight / totalMinutesInDay;

      // Calculate exact minute from midnight based on Y position
      const totalMinutes = Math.max(0, Math.min(1440, relativeY / pixelsPerMinute));

      // Snap to slot duration intervals (e.g., 15, 30, 60 minutes based on org settings)
      const snappedMinutes = Math.round(totalMinutes / slotDuration) * slotDuration;

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
        maxStart.setMinutes(maxStart.getMinutes() - slotDuration);

        if (newTime.getTime() <= maxStart.getTime()) {
          setResizePreview({ newStart: newTime, newEnd: currentEndTime });
        }
      } else {
        // Dragging bottom edge - change end time
        const currentStartTime = resizePreview?.newStart || aptStart;
        const minEnd = new Date(currentStartTime);
        minEnd.setMinutes(minEnd.getMinutes() + slotDuration);

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

  // Generate time slots dynamically based on organization settings
  const timeSlots = React.useMemo(() => {
    return getTimeSlotsFromSettings(0, 24);
  }, [slotDuration]);

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

    // Calculate total grid height: each slot is 60px
    const totalGridHeight = timeSlots.length * 60;
    const totalMinutesInDay = 24 * 60; // 1440 minutes

    // Calculate pixels per minute based on actual grid structure
    const pixelsPerMinute = totalGridHeight / totalMinutesInDay;

    // Calculate start position in pixels from midnight
    const startHour = aptStart.getHours();
    const startMinutes = aptStart.getMinutes();
    const startTotalMinutes = startHour * 60 + startMinutes;
    const startPosition = startTotalMinutes * pixelsPerMinute;

    // Calculate duration in pixels
    const durationMs = aptEnd.getTime() - aptStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const height = durationMinutes * pixelsPerMinute;

    return {
      top: startPosition,
      height: Math.max(height, 30) // Minimum height of 30px for CompactAppointmentCard
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

  const handleDragStart = (appointment: Appointment, offsetY?: number) => {
    setDraggedAppointment(appointment);
    // Store the offset in pixels from the top of the appointment card
    setDragOffset(offsetY || 0);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOffset(0);
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, hour: number, minutes: number = 0) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    // Calculate precise position for visual feedback
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentInCell = relativeY / rect.height;
    const minutesInSlot = Math.floor(percentInCell * slotDuration);
    const totalMinutes = minutes + minutesInSlot;
    const snappedMinutes = Math.round(totalMinutes / slotDuration) * slotDuration;

    // Calculate the snapped hour for visual feedback
    const snappedHour = hour + Math.floor(snappedMinutes / 60);
    const finalMinutes = snappedMinutes % 60;

    // Update drag over state with snapped position
    if (!dragOver ||
        dragOver.date.toDateString() !== date.toDateString() ||
        dragOver.hour !== snappedHour) {
      setDragOver({ date, hour: snappedHour });
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

  const handleDrop = (e: React.DragEvent, date: Date, hour: number, minutes: number = 0) => {
    e.preventDefault();

    if (draggedAppointment && gridContainerRef.current) {
      // Calculate precise drop position based on the entire grid for accuracy
      const gridRect = gridContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - gridRect.top;

      // Subtract the drag offset to account for where the user grabbed the appointment
      // This prevents the appointment from jumping when dropped
      const adjustedY = relativeY - dragOffset;

      // Calculate total grid height and pixels per minute
      const totalGridHeight = timeSlots.length * 60;
      const totalMinutesInDay = 24 * 60;
      const pixelsPerMinute = totalGridHeight / totalMinutesInDay;

      // Calculate exact minute from midnight based on Y position
      const totalMinutesFromMidnight = adjustedY / pixelsPerMinute;

      // Snap to slot duration intervals (e.g., 15, 30, 60 minutes based on org settings)
      const snappedMinutes = Math.round(totalMinutesFromMidnight / slotDuration) * slotDuration;

      // Convert to decimal hour format (e.g., 9.5 for 9:30, 9.25 for 9:15)
      const hourWithMinutes = snappedMinutes / 60;

      // Check for overlapping appointments
      const aptDuration = new Date(draggedAppointment.endTime).getTime() - new Date(draggedAppointment.startTime).getTime();
      const aptDurationMinutes = aptDuration / (1000 * 60);
      const newStart = new Date(date);
      newStart.setHours(0, snappedMinutes, 0, 0);
      const newEnd = new Date(newStart);
      newEnd.setMinutes(newEnd.getMinutes() + aptDurationMinutes);

      // Overlapping appointments are allowed - layout will handle displaying them side-by-side
      onAppointmentDrop?.(draggedAppointment, date, hourWithMinutes);
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

  const handleResizeMove = (e: React.MouseEvent, date: Date, hour: number, minutes: number = 0) => {
    if (!resizingAppointment) return;

    const { appointment, edge } = resizingAppointment;
    const aptStart = new Date(appointment.startTime);
    const aptEnd = new Date(appointment.endTime);

    // Calculate new time based on mouse position within the slot
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentInCell = relativeY / rect.height;
    const minutesInSlot = Math.floor(percentInCell * slotDuration);

    // Snap to slot duration intervals (e.g., 15, 30, 60 minutes based on org settings)
    const totalMinutes = minutes + minutesInSlot;
    const snappedMinutes = Math.round(totalMinutes / slotDuration) * slotDuration;

    const newTime = new Date(date);
    newTime.setHours(hour, snappedMinutes, 0, 0);

    if (edge === 'top') {
      // Dragging top edge - change start time
      // Use the current preview end time if available, otherwise use original end time
      const currentEndTime = resizePreview?.newEnd || aptEnd;

      // Don't allow start to go past end minus minimum slot duration
      const maxStart = new Date(currentEndTime);
      maxStart.setMinutes(maxStart.getMinutes() - slotDuration);

      if (newTime.getTime() <= maxStart.getTime()) {
        setResizePreview({ newStart: newTime, newEnd: currentEndTime });
      }
    } else {
      // Dragging bottom edge - change end time
      // Use the current preview start time if available, otherwise use original start time
      const currentStartTime = resizePreview?.newStart || aptStart;

      // Don't allow end to go before start plus minimum slot duration
      const minEnd = new Date(currentStartTime);
      minEnd.setMinutes(minEnd.getMinutes() + slotDuration);

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
  const handleMouseDown = (e: React.MouseEvent, date: Date, hour: number, minutes: number = 0) => {
    // Only start if clicking in empty space (not on an appointment)
    if ((e.target as HTMLElement).closest('[draggable="true"]')) {
      return;
    }

    setIsCreating(true);
    // Track both hour and minutes for precise time
    setCreateStart({ date, hour, minutes });
    setCreateEnd({ date, hour, minutes });
  };

  const handleMouseEnter = (date: Date, hour: number, minutes: number = 0) => {
    if (isCreating && createStart) {
      // Only allow creating on same date
      if (date.toDateString() === createStart.date.toDateString()) {
        setCreateEnd({ date, hour, minutes });
      }
    }
  };

  const handleMouseUp = () => {
    if (isCreating && createStart && createEnd) {
      // Calculate start time (earlier time slot)
      const startTotalMinutes = createStart.hour * 60 + createStart.minutes;
      const endTotalMinutes = createEnd.hour * 60 + createEnd.minutes;

      const earlierMinutes = Math.min(startTotalMinutes, endTotalMinutes);
      const laterMinutes = Math.max(startTotalMinutes, endTotalMinutes);

      // Create proper Date objects with exact time
      const startTime = new Date(createStart.date);
      startTime.setHours(Math.floor(earlierMinutes / 60), earlierMinutes % 60, 0, 0);

      const endTime = new Date(createStart.date);
      endTime.setHours(Math.floor(laterMinutes / 60), laterMinutes % 60, 0, 0);

      // If start and end are the same slot, add default duration (1 hour or slot duration)
      if (earlierMinutes === laterMinutes) {
        endTime.setMinutes(endTime.getMinutes() + slotDuration);
      }

      onCreateAppointment?.(createStart.date, startTime, endTime);
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
  const today = new Date();

  // Pre-calculate appointments for each date
  const appointmentsByDate = React.useMemo(() => {
    const map = new Map<string, Appointment[]>();
    weekDates.forEach(date => {
      const dateStr = date.toDateString();
      const dateApts = getAppointmentsForDate(date);
      map.set(dateStr, dateApts);
    });
    return map;
  }, [appointments, currentDate]);

  // Pre-calculate layout for each date (memoized for performance)
  const layoutByDate = React.useMemo(() => {
    const map = new Map<string, Map<string, { column: number; totalColumns: number }>>();
    weekDates.forEach(date => {
      const dateStr = date.toDateString();
      const dateApts = appointmentsByDate.get(dateStr) || [];
      const layout = calculateAppointmentLayout(dateApts);
      map.set(dateStr, layout);
    });
    return map;
  }, [appointmentsByDate, currentDate]);

  // Auto-scroll to current time on mount and when week changes
  useEffect(() => {
    const scrollToCurrentTime = () => {
      if (!scrollContainerRef.current) return;

      // Check if today is in current week view
      const todayInView = weekDates.some(date => date.toDateString() === today.toDateString());

      if (todayInView) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // Calculate total grid height: each slot is 60px
        const totalGridHeight = timeSlots.length * 60;
        const totalMinutesInDay = 24 * 60; // 1440 minutes
        const pixelsPerMinute = totalGridHeight / totalMinutesInDay;

        // Calculate the position in pixels from midnight
        const totalMinutesFromMidnight = currentHour * 60 + currentMinutes;
        const pixelPosition = totalMinutesFromMidnight * pixelsPerMinute;

        // Get container height to calculate offset
        const containerHeight = scrollContainerRef.current.clientHeight;

        // Center the current time in the view, or show 2 hours above if not enough space
        const offset = Math.min(200, containerHeight / 3);
        const scrollPosition = Math.max(0, pixelPosition - offset);

        // Use multiple animation frames to ensure DOM is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                top: scrollPosition,
                behavior: 'auto'  // Instant scroll, no animation
              });
            }
          });
        });
      }
    };

    // Delay to ensure DOM is fully rendered - increased delay
    const timer = setTimeout(scrollToCurrentTime, 300);

    return () => clearTimeout(timer);
  }, [currentDate, weekDates, timeSlots]); // Re-scroll when date changes to different week

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

    // Calculate total grid height: each slot is 60px
    const totalGridHeight = timeSlots.length * 60;
    const totalMinutesInDay = 24 * 60; // 1440 minutes

    // Calculate pixels per minute based on actual grid structure
    const pixelsPerMinute = totalGridHeight / totalMinutesInDay;

    // Calculate position in pixels from midnight
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes * pixelsPerMinute;
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

      // Calculate total grid height: each slot is 60px
      const totalGridHeight = timeSlots.length * 60;
      const totalMinutesInDay = 24 * 60; // 1440 minutes
      const pixelsPerMinute = totalGridHeight / totalMinutesInDay;

      const totalMinutesFromMidnight = currentHour * 60 + currentMinutes;
      const pixelPosition = totalMinutesFromMidnight * pixelsPerMinute;

      const containerHeight = scrollContainerRef.current.clientHeight;
      const offset = Math.min(200, containerHeight / 3);
      const scrollPosition = Math.max(0, pixelPosition - offset);

      scrollContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'auto'  // Instant scroll
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
      {/* Week header - Compact */}
      <div className="grid grid-cols-[64px_repeat(7,minmax(100px,1fr))] border-b border-gray-200 bg-white shadow-sm">
        <div className="border-r border-gray-200"></div>
        {weekDates.map((date, idx) => {
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center border-r border-gray-200 py-2 last:border-r-0 ${
                isToday ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isToday
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events row - Compact */}
      {allDayEvents.length > 0 && (
        <div className="grid grid-cols-[64px_repeat(7,minmax(100px,1fr))] border-b border-gray-200 bg-gray-50/30">
          <div className="border-r border-gray-200 py-1.5 px-2 text-right">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">All Day</span>
          </div>
          {weekDates.map((date, idx) => {
            const dayAllDayEvents = getAllDayEventsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div
                key={idx}
                className={`relative min-h-[44px] border-r border-gray-200 p-1 last:border-r-0 ${
                  isToday ? 'bg-blue-50/30' : 'bg-white/50'
                }`}
              >
                <div className="flex flex-col gap-1">
                  {dayAllDayEvents.map((apt) => {
                    const eventType = apt.allDayEventType || 'appointment';
                    // Allow dragging all appointments regardless of status
                    const isDraggable = true;

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

                    const isHexColor = typeof apt.practitionerColor === 'string' && apt.practitionerColor.startsWith('#');
                    const useCustomColor = eventType === 'appointment' && apt.practitionerColor;
                    const bgColor = useCustomColor ? (isHexColor ? null : apt.practitionerColor) : null;

                    // Don't open sidebar for leave/vacation - just show info
                    const shouldOpenSidebar = eventType !== 'leave' && eventType !== 'vacation';

                    return (
                      <div
                        key={apt.id}
                        onClick={() => shouldOpenSidebar && onAppointmentClick?.(apt)}
                        className={`${isDraggable && shouldOpenSidebar ? 'cursor-pointer' : 'cursor-default'} rounded px-1.5 py-1 text-[10px] font-medium shadow-sm hover:shadow transition-all border-l-3 ${
                          useCustomColor && !isHexColor ? bgColor : style.bg
                        } ${style.text} ${style.border}`}
                        style={useCustomColor && isHexColor ? {
                          backgroundColor: apt.practitionerColor,
                          borderLeftColor: apt.practitionerColor
                        } : undefined}
                        draggable={isDraggable}
                        onDragStart={(e) => {
                          if (!isDraggable) {
                            e.preventDefault();
                            return;
                          }
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('application/json', JSON.stringify(apt));
                          // Calculate where on the appointment card the user grabbed it
                          const rect = e.currentTarget.getBoundingClientRect();
                          const offsetY = e.clientY - rect.top;
                          handleDragStart(apt, offsetY);
                        }}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">{style.icon}</span>
                          <span className="truncate flex-1 font-semibold">{apt.patientName}</span>
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

      {/* Time grid - Optimized */}
      <div className="flex-1 overflow-y-auto relative bg-white" ref={scrollContainerRef}>
        <div
          ref={gridContainerRef}
          className="grid grid-cols-[64px_repeat(7,minmax(100px,1fr))] relative"
          style={{
            minHeight: `${timeSlots.length * 60}px` // Total height = number of slots × 60px
          }}
        >
          {/* Time labels and grid cells */}
          {timeSlots.map((time, timeIdx) => {
            const [hourStr, minStr] = time.split(':');
            const hour = parseInt(hourStr);
            const minutes = parseInt(minStr);

            // Format time with AM/PM
            let formattedTime: string;
            if (hour === 0) {
              formattedTime = minutes === 0 ? '12 AM' : `12:${minStr} AM`;
            } else if (hour < 12) {
              formattedTime = minutes === 0 ? `${hour} AM` : `${hour}:${minStr} AM`;
            } else if (hour === 12) {
              formattedTime = minutes === 0 ? '12 PM' : `12:${minStr} PM`;
            } else {
              formattedTime = minutes === 0 ? `${hour - 12} PM` : `${hour - 12}:${minStr} PM`;
            }

            // Keep consistent 60px per slot height for visual consistency
            // The slot duration only affects which time labels are shown, not the grid size
            const slotHeight = 60;

            return (
              <React.Fragment key={timeIdx}>
                {/* Time label - Compact */}
                <div
                  className="border-b border-r border-gray-200 bg-gray-100 py-1 px-2 text-right h-[60px] flex items-start justify-end"
                >
                  <span className="text-[10px] font-semibold text-gray-600">{formattedTime}</span>
                </div>

                {/* Day columns - empty cells for grid */}
                {weekDates.map((date, dateIdx) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isDraggedOver = dragOver?.date.toDateString() === date.toDateString() && dragOver.hour === hour;
                  const inCreateRange = isInCreateRange(date, hour);

                  return (
                    <div
                      key={dateIdx}
                      className={`relative h-[60px] border-b border-r border-gray-200 last:border-r-0 transition-colors duration-100 ease-out ${
                        isToday ? 'bg-blue-50/30' : 'bg-gray-50/50'
                      } ${isDraggedOver ? 'bg-blue-100/70 ring-1 ring-inset ring-blue-400' : ''} ${
                        inCreateRange ? 'bg-green-50 ring-2 ring-inset ring-green-400' : ''
                      } hover:bg-gray-100/60`}
                      onDragOver={(e) => handleDragOver(e, date, hour, minutes)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, date, hour, minutes)}
                      onMouseDown={(e) => handleMouseDown(e, date, hour, minutes)}
                      onMouseEnter={(e) => {
                        handleMouseEnter(date, hour, minutes);
                        if (resizingAppointment) {
                          handleResizeMove(e, date, hour, minutes);
                        }
                      }}
                      onMouseUp={resizingAppointment ? handleResizeEnd : undefined}
                    >
                      {/* Visual indicator for drag over - enhanced for better visibility */}
                      {isDraggedOver && (
                        <div className="absolute inset-0 border-2 border-blue-500 bg-blue-100/40 pointer-events-none rounded shadow-lg transition-all duration-75">
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-200/30 to-transparent" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Appointments overlay - absolutely positioned */}
          {weekDates.map((date, dateIdx) => {
            const dateStr = date.toDateString();
            const dateAppointments = appointmentsByDate.get(dateStr) || [];
            const layout = layoutByDate.get(dateStr);

            return (
              <div
                key={`appointments-${dateIdx}`}
                className="absolute pointer-events-none"
                style={{
                  left: `calc(64px + ${dateIdx} * (100% - 64px) / 7)`,
                  width: `calc((100% - 64px) / 7)`,
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
                    const top = (startHour * 60 + startMinutes); // 1px per minute

                    const durationMs = previewEnd.getTime() - previewStart.getTime();
                    const durationMinutes = durationMs / (1000 * 60);
                    const height = Math.max(durationMinutes, 30); // Minimum 30px for CompactAppointmentCard

                    style = { top, height };
                  }

                  const layoutInfo = layout?.get(apt.id);

                  // Check if this is the appointment being dragged
                  const isDragging = draggedAppointment?.id === apt.id;

                  const appointmentElement = (
                    <div
                      className="relative h-full group"
                      onMouseEnter={() => setHoveredAppointmentId(apt.id)}
                      onMouseLeave={() => setHoveredAppointmentId(null)}
                    >
                      {/* Main appointment card */}
                      <div
                        className="h-full"
                      >
                        <CompactAppointmentCard
                          appointment={apt}
                          onClick={() => {
                            // Only trigger click if not resizing and not leave/vacation
                            const eventType = apt.allDayEventType || 'appointment';
                            const shouldOpenSidebar = eventType !== 'leave' && eventType !== 'vacation';
                            if (!resizingAppointment && shouldOpenSidebar) {
                              onAppointmentClick?.(apt);
                            }
                          }}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          className="h-full"
                          onStatusChange={(id, status) => {
                            if (onStatusChange) {
                              onStatusChange(id, status);
                            }
                          }}
                          onStartEncounter={(id) => {
                            const appointment = appointments.find(a => a.id === id);
                            if (appointment && onStartEncounter) {
                              onStartEncounter(appointment);
                            }
                          }}
                        />
                      </div>

                      {/* Top resize handle - only show if appointment is tall enough */}
                      {style.height >= 40 && (
                        <div
                          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-start justify-center"
                          onMouseDown={(e) => handleResizeStart(apt, 'top', e)}
                          title="Drag to change start time"
                        >
                          <div className="w-8 h-1 bg-blue-500 rounded-full mt-0.5 shadow-sm" />
                        </div>
                      )}

                      {/* Bottom resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 z-50 flex items-end justify-center"
                        onMouseDown={(e) => handleResizeStart(apt, 'bottom', e)}
                        title="Drag to change end time"
                      >
                        <div className="w-8 h-1 bg-blue-500 rounded-full mb-0.5 shadow-sm" />
                      </div>
                    </div>
                  );

                  const isHovered = hoveredAppointmentId === apt.id;

                  if (!layoutInfo) {
                    // Single appointment, no overlap - tighter spacing
                    // When ANY appointment is being dragged, make all OTHER appointments transparent to pointer events
                    const shouldAllowDragThrough = draggedAppointment && !isDragging;
                    const isDraggingOther = draggedAppointment && draggedAppointment.id !== apt.id;

                    return (
                      <div
                        key={apt.id}
                        className={`absolute transition-all duration-150 ease-out ${isBeingResized ? 'ring-2 ring-blue-400' : ''}`}
                        style={{
                          transform: `translate3d(0, ${style.top}px, 0)`,
                          height: `${style.height}px`,
                          left: '1px',
                          right: '1px',
                          zIndex: isDragging || isBeingResized ? 1000 : isHovered ? 100 : 10,
                          // When dragging, make element invisible and non-interactive
                          visibility: isDragging ? 'hidden' : 'visible',
                          // Dim other appointments while dragging for better focus
                          opacity: isDraggingOther ? 0.5 : isBeingResized ? 0.7 : 1,
                          // Allow drag-through when another appointment is being dragged
                          pointerEvents: shouldAllowDragThrough ? 'none' : 'auto',
                          // GPU acceleration hints
                          willChange: isDragging || isBeingResized ? 'transform, opacity' : 'auto'
                        }}
                      >
                        {appointmentElement}
                      </div>
                    );
                  }

                  // Multiple overlapping appointments - tighter spacing
                  const columnWidth = 100 / layoutInfo.totalColumns;
                  const leftPercent = (layoutInfo.column * 100) / layoutInfo.totalColumns;

                  // When ANY appointment is being dragged, make all OTHER appointments transparent to pointer events
                  const shouldAllowDragThrough = draggedAppointment && !isDragging;
                  const isDraggingOther = draggedAppointment && draggedAppointment.id !== apt.id;

                  return (
                    <div
                      key={apt.id}
                      className={`absolute transition-all duration-150 ease-out ${isBeingResized ? 'ring-2 ring-blue-400' : ''}`}
                      style={{
                        transform: `translate3d(0, ${style.top}px, 0)`,
                        height: `${style.height}px`,
                        left: `calc(${leftPercent}% + 1px)`,
                        width: `calc(${columnWidth}% - 1px)`,
                        zIndex: isDragging || isBeingResized ? 1000 : isHovered ? 100 : 10 + layoutInfo.column,
                        // When dragging, make element invisible and non-interactive
                        visibility: isDragging ? 'hidden' : 'visible',
                        // Dim other appointments while dragging for better focus
                        opacity: isDraggingOther ? 0.5 : isBeingResized ? 0.7 : 1,
                        // Allow drag-through when another appointment is being dragged
                        pointerEvents: shouldAllowDragThrough ? 'none' : 'auto',
                        // GPU acceleration hints
                        willChange: isDragging || isBeingResized ? 'transform, opacity' : 'auto'
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
              <div className="absolute left-0 w-[64px] flex items-center justify-end pr-1.5">
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md">
                  {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>
              {/* Red line across all columns */}
              <div className="absolute left-[64px] right-0 flex">
                <div className="h-0.5 bg-red-600 shadow-md" style={{ width: '100%' }}>
                  {/* Circle indicator at the start of today's column */}
                  {getTodayColumnIndex() !== -1 && (
                    <div
                      className="absolute -top-1 w-2.5 h-2.5 bg-red-600 rounded-full shadow-md"
                      style={{
                        left: `calc(${(getTodayColumnIndex() / 7) * 100}% + 3px)`
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions overlay - Compact */}
      {isCreating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold z-50 flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Drag to set duration • Release to create
        </div>
      )}

      {/* Scroll to Now button - Compact and modern */}
      {isCurrentTimeVisible() && (
        <button
          onClick={scrollToNow}
          className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-1.5 rounded-lg shadow-lg hover:shadow-xl text-xs font-bold z-30 flex items-center gap-1.5 transition-all"
          title="Scroll to current time"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Now
        </button>
      )}
    </div>
  );
}
