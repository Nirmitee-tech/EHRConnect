'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

export function CalendarToolbar({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  onToday,
  viewMode = 'admin',
  onViewModeChange
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
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          {formatDisplayDate()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* View Mode Selector */}
        {onViewModeChange && (
          <div className="flex rounded-lg border border-gray-300 bg-white mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('admin')}
              className={cn(
                'h-9 rounded-r-none border-r text-xs px-3',
                viewMode === 'admin' && 'bg-blue-100 text-blue-700 font-medium'
              )}
            >
              Admin View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('doctor')}
              className={cn(
                'h-9 rounded-l-none text-xs px-3',
                viewMode === 'doctor' && 'bg-blue-100 text-blue-700 font-medium'
              )}
            >
              Doctor View
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-9"
        >
          Today
        </Button>

        <div className="ml-2 flex rounded-lg border border-gray-300 bg-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('day')}
            className={cn(
              'h-9 rounded-r-none border-r',
              view === 'day' && 'bg-gray-100'
            )}
          >
            Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('week')}
            className={cn(
              'h-9 rounded-none border-r',
              view === 'week' && 'bg-gray-100'
            )}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('month')}
            className={cn(
              'h-9 rounded-l-none',
              view === 'month' && 'bg-gray-100'
            )}
          >
            Month
          </Button>
        </div>
      </div>
    </div>
  );
}
