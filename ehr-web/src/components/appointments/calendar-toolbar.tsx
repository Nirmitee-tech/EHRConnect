'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { CalendarView } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface CalendarToolbarProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onToday: () => void;
  viewMode?: 'admin' | 'doctor';
  onViewModeChange?: (mode: 'admin' | 'doctor') => void;
  onPrintSchedule?: () => void;
}

export function CalendarToolbar({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  onToday,
  viewMode = 'admin',
  onViewModeChange,
  onPrintSchedule
}: CalendarToolbarProps) {
  const formatDisplayDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      weekday: view === 'week' || view === 'day' ? 'long' : undefined
    };
    return currentDate.toLocaleDateString('en-US', options);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 shadow-sm">
      {/* Left Section: Date Display */}
      <div className="flex items-center gap-3">
        {/* Date Display - Prominent */}
        <h2 className="text-xl font-semibold text-gray-900">
          {formatDisplayDate()}
        </h2>
      </div>

      {/* Right Section: All Controls */}
      <div className="flex items-center gap-2">
        {/* Today Button - First */}
        <button
          onClick={onToday}
          className="h-8 px-3 text-xs font-semibold text-gray-700 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
        >
          Today
        </button>

        {/* Navigation Arrows - After Today */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={handlePrevious}
            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors border-r border-gray-300"
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Next"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* View Type Selector - Day/Week/Month */}
        <div className="flex items-center rounded-md border border-gray-300 h-8 overflow-hidden">
          <button
            onClick={() => onViewChange('day')}
            className={cn(
              'h-full px-3 text-xs font-semibold transition-colors border-r border-gray-300',
              view === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Day
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={cn(
              'h-full px-3 text-xs font-semibold transition-colors border-r border-gray-300',
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Week
          </button>
          <button
            onClick={() => onViewChange('month')}
            className={cn(
              'h-full px-3 text-xs font-semibold transition-colors',
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Month
          </button>
        </div>

        {/* View Mode Selector - Admin/Doctor */}
        {onViewModeChange && (
          <>
            {/* Divider */}
            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center rounded-md border border-gray-300 h-8 overflow-hidden">
              <button
                onClick={() => onViewModeChange('admin')}
                className={cn(
                  'h-full px-3 text-xs font-semibold transition-colors border-r border-gray-300',
                  viewMode === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                Admin
              </button>
              <button
                onClick={() => onViewModeChange('doctor')}
                className={cn(
                  'h-full px-3 text-xs font-semibold transition-colors',
                  viewMode === 'doctor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                Doctor
              </button>
            </div>
          </>
        )}

        {/* Print Schedule Button */}
        {onPrintSchedule && (
          <>
            {/* Divider */}
            <div className="h-6 w-px bg-gray-300" />

            <button
              onClick={onPrintSchedule}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
              title="Print Schedule"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </>
        )}
      </div>
    </div>
  );
}
