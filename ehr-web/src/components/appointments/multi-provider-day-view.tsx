'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, GripVertical } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { format, addDays, subDays, startOfDay, isSameDay, parseISO, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface Practitioner {
  id: string;
  name: string;
  color?: string;
  specialization?: string;
}

interface MultiProviderDayViewProps {
  appointments: Appointment[];
  practitioners: Practitioner[];
  currentDate?: Date; // Add currentDate prop to sync with parent
  onDateChange?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (practitionerId: string, time: Date) => void;
  onAppointmentDrop?: (appointment: Appointment, newDate: Date, newHour: number, newPractitionerId: string) => void;
  onAppointmentResize?: (appointment: Appointment, newStartTime: Date, newEndTime: Date) => void;
}

export function MultiProviderDayView({
  appointments,
  practitioners,
  currentDate,
  onDateChange,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentDrop,
  onAppointmentResize
}: MultiProviderDayViewProps) {
  // Use currentDate from props if provided, otherwise use internal state
  const [internalDate, setInternalDate] = useState<Date>(new Date());
  const selectedDate = currentDate || internalDate;
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ practitionerId: string; time: Date } | null>(null);
  const [resizingAppointment, setResizingAppointment] = useState<{ apt: Appointment; edge: 'top' | 'bottom' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Generate time slots (8 AM to 8 PM in 30-minute intervals)
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const baseDate = startOfDay(selectedDate);

    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(baseDate);
        slotTime.setHours(hour, minute, 0, 0);
        slots.push(slotTime);
      }
    }

    return slots;
  }, [selectedDate]);

  // Filter appointments for selected date
  const dayAppointments = useMemo(() => {
    console.log('📆 Filtering appointments for date:', selectedDate.toLocaleDateString(), {
      totalAppointments: appointments.length,
      selectedDate: selectedDate.toISOString()
    });

    const filtered = appointments.filter(apt => {
      const aptDate = apt.startTime instanceof Date ? apt.startTime : parseISO(apt.startTime as string);
      const matches = isSameDay(aptDate, selectedDate);

      if (!matches) {
        console.log('  ❌ Filtered out:', {
          patient: apt.patientName,
          appointmentDate: aptDate.toLocaleDateString(),
          selectedDate: selectedDate.toLocaleDateString()
        });
      }

      return matches;
    });

    console.log('✅ Filtered to', filtered.length, 'appointments for', selectedDate.toLocaleDateString());

    return filtered;
  }, [appointments, selectedDate]);

  // Group appointments by practitioner
  const appointmentsByPractitioner = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    practitioners.forEach(p => {
      grouped[p.id] = dayAppointments.filter(apt => apt.practitionerId === p.id);
    });

    console.log('👥 Multi-Provider View Data:', {
      totalPractitioners: practitioners.length,
      practitioners: practitioners.map(p => ({ id: p.id, name: p.name })),
      totalAppointments: dayAppointments.length,
      appointmentsByPractitioner: Object.entries(grouped).map(([practitionerId, apts]) => ({
        practitionerId,
        practitionerName: practitioners.find(p => p.id === practitionerId)?.name,
        appointmentCount: apts.length,
        appointments: apts.map(a => ({ patient: a.patientName, practitionerId: a.practitionerId }))
      }))
    });

    return grouped;
  }, [dayAppointments, practitioners]);

  // Navigation handlers
  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    if (!currentDate) {
      setInternalDate(newDate);
    }
    onDateChange?.(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    if (!currentDate) {
      setInternalDate(newDate);
    }
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    if (!currentDate) {
      setInternalDate(today);
    }
    onDateChange?.(today);
  };

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = appointment.startTime instanceof Date
      ? appointment.startTime
      : parseISO(appointment.startTime as string);
    const endTime = appointment.endTime instanceof Date
      ? appointment.endTime
      : parseISO(appointment.endTime as string);

    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();

    // Calculate position from 8 AM (starting hour)
    const startMinutesFromBase = (startHour - 8) * 60 + startMinute;
    const endMinutesFromBase = (endHour - 8) * 60 + endMinute;
    const durationMinutes = endMinutesFromBase - startMinutesFromBase;

    // Each hour is 60px tall (30px per 30-min slot)
    const top = (startMinutesFromBase / 30) * 30; // 30px per slot
    const height = Math.max((durationMinutes / 30) * 30, 30); // Minimum 30px

    return { top, height };
  };

  // Get current time position
  const getCurrentTimePosition = () => {
    if (!isToday(selectedDate)) return null;

    const now = currentTime;
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Only show if within business hours (8 AM - 8 PM)
    if (hour < 8 || hour >= 20) return null;

    const minutesFromBase = (hour - 8) * 60 + minute;
    const top = (minutesFromBase / 30) * 30;

    return top;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 border-blue-600';
      case 'in-progress':
        return 'bg-green-500 border-green-600';
      case 'completed':
        return 'bg-gray-400 border-gray-500';
      case 'cancelled':
        return 'bg-red-400 border-red-500';
      case 'no-show':
        return 'bg-orange-400 border-orange-500';
      case 'waitlist':
        return 'bg-yellow-400 border-yellow-500';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    // Add a visual cue
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedAppointment(null);
    setHoveredSlot(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, practitionerId: string, slotTime: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSlot({ practitionerId, time: slotTime });
  };

  const handleDrop = (e: React.DragEvent, practitionerId: string, slotTime: Date) => {
    e.preventDefault();

    if (!draggedAppointment || !onAppointmentDrop) return;

    const hour = slotTime.getHours() + (slotTime.getMinutes() / 60);
    onAppointmentDrop(draggedAppointment, slotTime, hour, practitionerId);

    setDraggedAppointment(null);
    setHoveredSlot(null);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, appointment: Appointment, edge: 'top' | 'bottom') => {
    e.stopPropagation();
    setResizingAppointment({ apt: appointment, edge });
  };

  useEffect(() => {
    if (!resizingAppointment) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !onAppointmentResize) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // Calculate which time slot this corresponds to
      const minuteFromTop = (y / 30) * 30; // 30px per 30-min slot
      const hour = Math.floor(minuteFromTop / 60) + 8;
      const minute = (minuteFromTop % 60);

      const newTime = new Date(selectedDate);
      newTime.setHours(hour, minute, 0, 0);

      const startTime = resizingAppointment.apt.startTime instanceof Date
        ? resizingAppointment.apt.startTime
        : parseISO(resizingAppointment.apt.startTime as string);
      const endTime = resizingAppointment.apt.endTime instanceof Date
        ? resizingAppointment.apt.endTime
        : parseISO(resizingAppointment.apt.endTime as string);

      if (resizingAppointment.edge === 'top') {
        // Resizing from top (changing start time)
        if (newTime < endTime) {
          onAppointmentResize(resizingAppointment.apt, newTime, endTime);
        }
      } else {
        // Resizing from bottom (changing end time)
        if (newTime > startTime) {
          onAppointmentResize(resizingAppointment.apt, startTime, newTime);
        }
      }
    };

    const handleMouseUp = () => {
      setResizingAppointment(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingAppointment, onAppointmentResize, selectedDate]);

  const currentTimeTop = getCurrentTimePosition();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm transition-opacity duration-200">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Multi-Provider Day View</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousDay}
              className="p-1.5 rounded-lg hover:bg-white/80 transition-all hover:shadow-sm"
              title="Previous Day"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-all hover:shadow-sm"
            >
              Today
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-white/80 transition-all hover:shadow-sm"
              title="Next Day"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <div className="inline-flex min-w-full relative">
          {/* Time Column */}
          <div className="sticky left-0 z-20 bg-white border-r border-gray-200 shadow-sm">
            <div className="h-12 px-4 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            {timeSlots.map((time, index) => (
              <div
                key={index}
                className="h-[30px] px-4 border-b border-gray-100 flex items-center text-xs font-medium text-gray-600"
                style={{ minWidth: '80px' }}
              >
                {format(time, 'h:mm a')}
              </div>
            ))}
          </div>

          {/* Provider Columns */}
          <div className="flex-1 flex relative">
            {practitioners.map((practitioner, pIndex) => (
              <div
                key={practitioner.id}
                className={cn(
                  "border-r border-gray-200 relative transition-all hover:bg-gray-50/50",
                  pIndex === 0 && "border-l"
                )}
                style={{ minWidth: '220px', flex: 1 }}
              >
                {/* Provider Header */}
                <div
                  className="h-12 px-4 border-b border-gray-200 flex flex-col justify-center sticky top-0 z-10 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${practitioner.color || '#3B82F6'} 0%, ${practitioner.color || '#3B82F6'}dd 100%)`,
                    color: 'white'
                  }}
                >
                  <div className="font-semibold text-sm truncate">{practitioner.name}</div>
                  {practitioner.specialization && (
                    <div className="text-xs opacity-90 truncate">{practitioner.specialization}</div>
                  )}
                </div>

                {/* Time Slots Grid */}
                <div className="relative">
                  {timeSlots.map((time, index) => {
                    const isHovered = hoveredSlot?.practitionerId === practitioner.id &&
                                     hoveredSlot?.time.getTime() === time.getTime();

                    return (
                      <div
                        key={index}
                        className={cn(
                          "h-[30px] border-b border-gray-100 transition-all cursor-pointer",
                          isHovered && "bg-blue-100 ring-2 ring-blue-400 ring-inset",
                          !isHovered && "hover:bg-blue-50"
                        )}
                        onClick={() => onTimeSlotClick?.(practitioner.id, time)}
                        onDragOver={(e) => handleDragOver(e, practitioner.id, time)}
                        onDrop={(e) => handleDrop(e, practitioner.id, time)}
                      />
                    );
                  })}

                  {/* Current Time Indicator */}
                  {currentTimeTop !== null && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none"
                      style={{ top: `${currentTimeTop}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 animate-pulse" />
                        <div className="flex-1 h-0.5 bg-red-500" />
                      </div>
                    </div>
                  )}

                  {/* Appointments Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10 transition-all duration-200">
                    {appointmentsByPractitioner[practitioner.id]?.map((appointment) => {
                      const { top, height } = getAppointmentStyle(appointment);
                      const statusColor = getStatusColor(appointment.status);
                      const isDragging = draggedAppointment?.id === appointment.id;

                      return (
                        <div
                          key={appointment.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, appointment)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg border-2 shadow-md overflow-hidden cursor-move pointer-events-auto group transition-all",
                            statusColor,
                            isDragging && "opacity-50 scale-95",
                            !isDragging && "hover:shadow-xl hover:scale-[1.02] hover:z-20"
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            minHeight: '30px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(appointment);
                          }}
                        >
                          {/* Resize Handle - Top */}
                          {onAppointmentResize && (
                            <div
                              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                              onMouseDown={(e) => handleResizeStart(e, appointment, 'top')}
                            >
                              <div className="h-1 bg-white/50 mx-auto w-8 rounded-full mt-0.5" />
                            </div>
                          )}

                          {/* Appointment Content */}
                          <div className="p-2 h-full overflow-hidden text-white flex flex-col">
                            <div className="flex items-start gap-1">
                              <GripVertical className="h-3 w-3 opacity-50 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">
                                  {appointment.patientName}
                                </div>
                                {height > 40 && (
                                  <>
                                    {appointment.appointmentType && (
                                      <div className="text-xs opacity-90 truncate">
                                        {appointment.appointmentType}
                                      </div>
                                    )}
                                    {height > 60 && appointment.reason && (
                                      <div className="text-xs opacity-75 truncate mt-0.5">
                                        {appointment.reason}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Resize Handle - Bottom */}
                          {onAppointmentResize && (
                            <div
                              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                              onMouseDown={(e) => handleResizeStart(e, appointment, 'bottom')}
                            >
                              <div className="h-1 bg-white/50 mx-auto w-8 rounded-full mb-0.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state if no practitioners */}
            {practitioners.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No practitioners available</p>
                  <p className="text-xs text-gray-400 mt-1">Add practitioners to see their schedules</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-6 text-xs flex-wrap">
          <span className="font-semibold text-gray-700">Status Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500 border border-blue-600 shadow-sm"></div>
            <span className="text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500 border border-green-600 shadow-sm"></div>
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-400 border border-gray-500 shadow-sm"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-400 border border-red-500 shadow-sm"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-400 border border-yellow-500 shadow-sm"></div>
            <span className="text-gray-600">Waitlist</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-gray-500">
            <GripVertical className="h-3 w-3" />
            <span className="text-xs">Drag to reschedule • Resize handles on hover</span>
          </div>
        </div>
      </div>
    </div>
  );
}
