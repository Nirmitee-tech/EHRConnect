'use client';

import React, { useState } from 'react';
import type { Appointment } from '@/types/appointment';
import { CompactEventCard } from './compact-event-card';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
}

export function MonthView({
  currentDate,
  appointments,
  onAppointmentClick,
  onDateClick
}: MonthViewProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from Sunday (getDay() returns 0 for Sunday)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // End on Saturday
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString();
    });

    // Sort by start time
    return dateAppointments.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });
  };

  const monthDates = getMonthDates();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleDateExpansion = (dateString: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateString)) {
      newExpanded.delete(dateString);
    } else {
      newExpanded.add(dateString);
    }
    setExpandedDates(newExpanded);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-gray-300">
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn(
              'border-r border-gray-300 py-3 px-4 text-sm font-semibold text-gray-700',
              'last:border-r-0'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7" style={{ gridAutoRows: '1fr' }}>
          {monthDates.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            const isCurrentMonth = date.getMonth() === currentMonth;
            const dayAppointments = getAppointmentsForDate(date);
            const dateString = date.toDateString();
            const isExpanded = expandedDates.has(dateString);

            // Determine how many events to show
            const maxVisibleEvents = 3;
            const visibleAppointments = isExpanded
              ? dayAppointments
              : dayAppointments.slice(0, maxVisibleEvents);
            const hiddenCount = dayAppointments.length - maxVisibleEvents;

            return (
              <div
                key={idx}
                className={cn(
                  'relative min-h-[120px] border-b border-r border-gray-300 p-2',
                  'transition-colors',
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                  'last:border-r-0'
                )}
              >
                {/* Date number and overflow indicator */}
                <div className="mb-1.5 flex items-start justify-between">
                  <button
                    onClick={() => onDateClick?.(date)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                      'transition-colors hover:bg-gray-100',
                      isToday && 'bg-blue-600 text-white hover:bg-blue-700',
                      !isToday && isCurrentMonth && 'text-gray-900',
                      !isToday && !isCurrentMonth && 'text-gray-400'
                    )}
                  >
                    {date.getDate()}
                  </button>

                  {/* Overflow count badge in corner (like Google Calendar) */}
                  {!isExpanded && hiddenCount > 0 && (
                    <button
                      onClick={(e) => toggleDateExpansion(dateString, e)}
                      className={cn(
                        'text-[11px] font-medium text-blue-600 hover:text-blue-700',
                        'hover:underline transition-colors'
                      )}
                    >
                      +{hiddenCount}
                    </button>
                  )}
                </div>

                {/* Appointments */}
                <div className="space-y-1">
                  {visibleAppointments.map((apt) => (
                    <CompactEventCard
                      key={apt.id}
                      appointment={apt}
                      onClick={() => onAppointmentClick?.(apt)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
