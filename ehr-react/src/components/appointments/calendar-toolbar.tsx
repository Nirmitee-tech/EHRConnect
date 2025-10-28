'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import type { CalendarView } from '@/types/appointment';
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
    // Always show full date for healthcare context
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    return currentDate.toLocaleDateString('en-US', options);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    // Dashboard view doesn't have navigation
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    // Dashboard view doesn't have navigation
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      {/* Left Section: Date Display */}
      <div className="flex items-center gap-4">
        {/* Date Display - Clear and prominent for healthcare */}
        <h1 className="text-lg font-bold text-gray-900">
          {formatDisplayDate()}
        </h1>
      </div>

      {/* Right Section: Compact Control Group */}
      <div className="flex items-center gap-2">
        {/* Primary Navigation Group */}
        <div className="flex items-center gap-1">
          {/* Today Button */}
          <button
            onClick={onToday}
            className="h-9 px-4 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Today
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            title="Next"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center border-l border-gray-300 pl-2 gap-1">
          {/* View Type Buttons */}
          {viewMode === 'doctor' && (
            <button
              onClick={() => onViewChange('dashboard')}
              className={cn(
                'h-9 px-4 text-sm font-semibold rounded-lg transition-colors',
                view === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => onViewChange('day')}
            className={cn(
              'h-9 px-4 text-sm font-semibold rounded-lg transition-colors',
              view === 'day'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            Day
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={cn(
              'h-9 px-4 text-sm font-semibold rounded-lg transition-colors',
              view === 'week'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            Week
          </button>
          <button
            onClick={() => onViewChange('month')}
            className={cn(
              'h-9 px-4 text-sm font-semibold rounded-lg transition-colors',
              view === 'month'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            Month
          </button>
        </div>

        {/* Role Selector */}
        {onViewModeChange && (
          <div className="flex items-center border-l border-gray-300 pl-2 gap-1">
            <button
              onClick={() => onViewModeChange('admin')}
              className={cn(
                'h-9 px-4 text-sm font-semibold rounded-lg transition-colors',
                viewMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Admin View
            </button>
            <button
              onClick={() => onViewModeChange('doctor')}
              className={cn(
                'h-9 px-4 text-sm font-semibold rounded-lg transition-colors',
                viewMode === 'doctor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Provider View
            </button>
          </div>
        )}

        {/* Actions */}
        {onPrintSchedule && (
          <div className="flex items-center border-l border-gray-300 pl-2">
            <button
              onClick={onPrintSchedule}
              className="h-9 px-4 flex items-center gap-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Print Schedule"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
