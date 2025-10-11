'use client';

import React from 'react';
import { Appointment } from '@/types/appointment';
import { AppointmentCard } from './appointment-card';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function WeekView({ currentDate, appointments, onAppointmentClick }: WeekViewProps) {
  const getWeekDates = () => {
    const dates: Date[] = [];
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    start.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
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
      
      return (
        aptDate.toDateString() === date.toDateString() &&
        aptHour === hour
      );
    });
  };

  const weekDates = getWeekDates();
  const timeSlots = getTimeSlots();
  const today = new Date();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50">
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

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          {timeSlots.map((time, timeIdx) => (
            <React.Fragment key={timeIdx}>
              {/* Time label */}
              <div className="border-b border-r border-gray-200 bg-gray-50 p-2 text-right text-xs text-gray-500">
                {time}
              </div>

              {/* Day columns */}
              {weekDates.map((date, dateIdx) => {
                const dayAppointments = getAppointmentsForDateAndTime(date, time);
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={dateIdx}
                    className={`relative min-h-[60px] border-b border-r border-gray-200 p-1 last:border-r-0 ${
                      isToday ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                  >
                    {dayAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onClick={() => onAppointmentClick?.(apt)}
                        className="mb-1"
                      />
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
