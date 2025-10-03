'use client';

import React from 'react';
import { Appointment } from '@/types/appointment';
import { AppointmentCard } from './appointment-card';

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
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (7 - ((lastDay.getDay() + 6) % 7)));

    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const monthDates = getMonthDates();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r border-gray-200 p-2 text-center text-xs font-semibold text-gray-600 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 auto-rows-fr">
          {monthDates.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            const isCurrentMonth = date.getMonth() === currentMonth;
            const dayAppointments = getAppointmentsForDate(date);

            return (
              <div
                key={idx}
                onClick={() => onDateClick?.(date)}
                className={`relative min-h-[120px] cursor-pointer border-b border-r border-gray-200 p-2 transition-colors hover:bg-gray-50 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${isToday ? 'ring-2 ring-inset ring-blue-500' : ''}`}
              >
                {/* Date number */}
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {/* Appointments */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onClick={(e) => {
                        e?.stopPropagation();
                        onAppointmentClick?.(apt);
                      }}
                      compact
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="rounded bg-gray-100 px-2 py-1 text-center text-xs text-gray-600">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
