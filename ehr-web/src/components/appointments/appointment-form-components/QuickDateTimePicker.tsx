import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface QuickDateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  availableTimeSlots: string[];
  isDateDisabled?: (date: string) => boolean;
  minDate?: string;
  disabled?: boolean;
}

export function QuickDateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  availableTimeSlots,
  isDateDisabled,
  minDate,
  disabled = false
}: QuickDateTimePickerProps) {
  // Format time to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-3">
      {/* Date Input */}
      <div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            required
            value={selectedDate}
            onChange={(e) => {
              const newDate = e.target.value;
              // Clear time if new date is not available
              if (!disabled && isDateDisabled && isDateDisabled(newDate)) {
                onTimeChange('');
              }
              onDateChange(newDate);
            }}
            min={minDate}
            disabled={disabled}
            className="block w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Time Dropdown */}
      <div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            required
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={!selectedDate || disabled || availableTimeSlots.length === 0}
            className="block w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500 appearance-none"
          >
            <option value="">Select Time</option>
            {availableTimeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {formatTime12Hour(slot)}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {selectedDate && availableTimeSlots.length === 0 && !disabled && (
          <p className="mt-1.5 text-xs text-red-600">
            No available time slots for this date
          </p>
        )}
      </div>

      {/* Selected Preview */}
      {selectedDate && selectedTime && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
          <p className="text-sm text-primary">
            <span className="font-medium">Selected:</span>{' '}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}{' '}
            at {formatTime12Hour(selectedTime)}
          </p>
        </div>
      )}
    </div>
  );
}
