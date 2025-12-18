'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = React.useState(selectedDate || new Date());

  // Sync display month when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const selectedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const currentDisplayMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);

      if (selectedMonth.getTime() !== currentDisplayMonth.getTime()) {
        setDisplayMonth(selectedDate);
      }
    }
  }, [selectedDate]);

  const getMonthDates = () => {
    if (!displayMonth) return [];

    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();

    // Get first and last day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Find what day of week the month starts (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Find how many days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;

    // Start date (may be in previous month)
    const startDate = new Date(year, month, 1 - daysFromPrevMonth);

    // We need 6 rows of 7 days = 42 days total
    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayMonth(newDate);
  };

  const monthDates = getMonthDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = displayMonth.getMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full rounded-lg bg-white p-4">
      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDates.map((date, idx) => {
          const dateOnly = new Date(date);
          dateOnly.setHours(0, 0, 0, 0);

          const todayOnly = new Date(today);
          todayOnly.setHours(0, 0, 0, 0);

          const selectedDateOnly = selectedDate ? new Date(selectedDate) : null;
          if (selectedDateOnly) {
            selectedDateOnly.setHours(0, 0, 0, 0);
          }

          const isToday = dateOnly.getTime() === todayOnly.getTime();
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isSelected = selectedDateOnly && dateOnly.getTime() === selectedDateOnly.getTime();

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(date)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                isToday && !isSelected && 'bg-blue-100 text-blue-700 font-bold',
                isSelected && 'bg-primary text-primary-foreground hover:opacity-90 font-bold',
                !isSelected && !isToday && isCurrentMonth && 'hover:bg-gray-100',
                !isSelected && !isToday && !isCurrentMonth && 'hover:bg-gray-50'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
