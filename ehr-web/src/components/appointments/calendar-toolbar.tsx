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
    if (view === 'day' || view === 'multi-provider') {
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
    if (view === 'day' || view === 'multi-provider') {
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
    <div className="flex items-center justify-between bg-white">
      {/* Left Section: Date & Navigation */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900">
          {formatDisplayDate()}
        </h1>

        {/* Today Button - Inline with date */}
        <button
          onClick={onToday}
          className="h-7 px-3 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        >
          Today
        </button>

        {/* Navigation Arrows - Inline */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handlePrevious}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            title="Next"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Role Selector - Left side with date */}
        {onViewModeChange && (
          <div className="flex items-center gap-0.5 border-l border-gray-300 pl-3">
            <button
              onClick={() => onViewModeChange('admin')}
              className={cn(
                'h-7 px-3 text-xs font-medium rounded transition-colors',
                viewMode === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Admin
            </button>
            <button
              onClick={() => onViewModeChange('doctor')}
              className={cn(
                'h-7 px-3 text-xs font-medium rounded transition-colors',
                viewMode === 'doctor'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Provider
            </button>
          </div>
        )}
      </div>

      {/* Right Section: View Controls */}
      <div className="flex items-center gap-0.5">
        {viewMode === 'doctor' && (
          <button
            onClick={() => onViewChange('dashboard')}
            className={cn(
              'h-7 px-3 text-xs font-medium rounded transition-colors border',
              view === 'dashboard'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
            )}
          >
            Dashboard
          </button>
        )}
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            'h-7 px-3 text-xs font-medium rounded transition-colors border',
            view === 'list'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          )}
        >
          List
        </button>
        <button
          onClick={() => onViewChange('day')}
          className={cn(
            'h-7 px-3 text-xs font-medium rounded transition-colors border',
            view === 'day'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          )}
        >
          Day
        </button>
        {viewMode === 'admin' && (
          <button
            onClick={() => onViewChange('multi-provider')}
            className={cn(
              'h-7 px-3 text-xs font-medium rounded transition-colors border',
              view === 'multi-provider'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
            )}
          >
            Multi-Provider
          </button>
        )}
        <button
          onClick={() => onViewChange('week')}
          className={cn(
            'h-7 px-3 text-xs font-medium rounded transition-colors border',
            view === 'week'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          )}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange('month')}
          className={cn(
            'h-7 px-3 text-xs font-medium rounded transition-colors border',
            view === 'month'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          )}
        >
          Month
        </button>
      </div>
    </div>
  );
}
