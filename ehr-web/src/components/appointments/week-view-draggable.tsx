'use client';

import React, { useState, useRef } from 'react';
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

  // Optional: Debug logging (commented out for production)
  // React.useEffect(() => {
  //   console.log('WeekView - Appointments:', appointments.length);
  // }, [appointments]);

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

  const getAppointmentsForDateAndTime = (date: Date, timeSlot: string) => {
    const [hour] = timeSlot.split(':').map(Number);

    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const aptHour = aptDate.getHours();

      const dateMatches = aptDate.toDateString() === date.toDateString();
      const hourMatches = aptHour === hour;
      return dateMatches && hourMatches;
    });
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

  const weekDates = getWeekDates();
  const timeSlots = getTimeSlots();
  const today = new Date();

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
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))]">
          {timeSlots.map((time, timeIdx) => {
            const [hour] = time.split(':').map(Number);
            
            return (
              <React.Fragment key={timeIdx}>
                {/* Time label */}
                <div className="border-b border-r border-gray-200 bg-gray-50 p-2 text-right text-xs text-gray-500">
                  {time}
                </div>

                {/* Day columns */}
                {weekDates.map((date, dateIdx) => {
                  const dayAppointments = getAppointmentsForDateAndTime(date, time);
                  const isToday = date.toDateString() === today.toDateString();
                  const isDraggedOver = dragOver?.date.toDateString() === date.toDateString() && dragOver.hour === hour;
                  const inCreateRange = isInCreateRange(date, hour);

                  return (
                    <div
                      key={dateIdx}
                      className={`relative min-h-[60px] border-b border-r border-gray-200 p-1 last:border-r-0 transition-colors ${
                        isToday ? 'bg-blue-50/30' : 'bg-white'
                      } ${isDraggedOver ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : ''} ${
                        inCreateRange ? 'bg-green-100 ring-2 ring-inset ring-green-400' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, date, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, date, hour)}
                      onMouseDown={(e) => handleMouseDown(e, date, hour)}
                      onMouseEnter={() => handleMouseEnter(date, hour)}
                    >
                      {dayAppointments.map((apt) => (
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
                      
                      {/* Visual hint for empty slots */}
                      {dayAppointments.length === 0 && !isCreating && (
                        <div className="flex h-full items-center justify-center text-xs text-gray-300 opacity-0 hover:opacity-100 transition-opacity">
                          Click & drag to create
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Instructions overlay */}
      {isCreating && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50">
          Drag to set appointment duration • Release to create
        </div>
      )}
    </div>
  );
}
