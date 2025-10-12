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
}

export function WeekViewDraggable({
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentDrop,
  onCreateAppointment
}: WeekViewDraggableProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOver, setDragOver] = useState<{date: Date; hour: number} | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{date: Date; hour: number} | null>(null);
  const [createEnd, setCreateEnd] = useState<{date: Date; hour: number} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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
    e.dataTransfer.dropEffect = 'move';
    setDragOver({ date, hour });
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    
    if (draggedAppointment) {
      onAppointmentDrop?.(draggedAppointment, date, hour);
    }
    
    setDraggedAppointment(null);
    setDragOver(null);
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
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b-2 border-gray-300 bg-gray-50">
          <div className="border-r border-gray-200 p-2 text-right text-xs font-medium text-gray-600">
            All Day
          </div>
          {weekDates.map((date, idx) => {
            const dayAllDayEvents = getAllDayEventsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div
                key={idx}
                className={`min-h-[60px] border-r border-gray-200 p-1 last:border-r-0 ${
                  isToday ? 'bg-blue-50/30' : 'bg-white'
                }`}
              >
                {dayAllDayEvents.map((apt) => (
                  <DraggableAppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onClick={() => onAppointmentClick?.(apt)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="mb-1"
                    compact
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] relative" style={{ minHeight: '1440px' }}>
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
                      className={`h-[60px] border-b border-r border-gray-200 last:border-r-0 transition-colors ${
                        isToday ? 'bg-blue-50/30' : 'bg-white'
                      } ${isDraggedOver ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : ''} ${
                        inCreateRange ? 'bg-green-100 ring-2 ring-inset ring-green-400' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, date, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, date, hour)}
                      onMouseDown={(e) => handleMouseDown(e, date, hour)}
                      onMouseEnter={() => handleMouseEnter(date, hour)}
                    />
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
                  const style = calculateAppointmentStyle(apt);
                  const layoutInfo = layout?.get(apt.id);

                  // Check if this is the appointment being dragged
                  const isDragging = draggedAppointment?.id === apt.id;

                  if (!layoutInfo) {
                    // Single appointment, no overlap
                    return (
                      <div
                        key={apt.id}
                        className={`absolute pointer-events-auto ${isDragging ? 'opacity-50' : ''}`}
                        style={{
                          top: `${style.top}px`,
                          height: `${style.height}px`,
                          left: '2px',
                          right: '2px',
                          zIndex: isDragging ? 1000 : 10
                        }}
                      >
                        <DraggableAppointmentCard
                          appointment={apt}
                          onClick={() => onAppointmentClick?.(apt)}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          className="h-full"
                          spanning
                        />
                      </div>
                    );
                  }

                  // Multiple overlapping appointments
                  const columnWidth = 100 / layoutInfo.totalColumns;
                  const leftPercent = (layoutInfo.column * 100) / layoutInfo.totalColumns;

                  return (
                    <div
                      key={apt.id}
                      className={`absolute pointer-events-auto ${isDragging ? 'opacity-50' : ''}`}
                      style={{
                        top: `${style.top}px`,
                        height: `${style.height}px`,
                        left: `calc(${leftPercent}% + 1px)`,
                        width: `calc(${columnWidth}% - 2px)`,
                        zIndex: isDragging ? 1000 : 10 + layoutInfo.column
                      }}
                    >
                      <DraggableAppointmentCard
                        appointment={apt}
                        onClick={() => onAppointmentClick?.(apt)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        className="h-full"
                        spanning
                      />
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
