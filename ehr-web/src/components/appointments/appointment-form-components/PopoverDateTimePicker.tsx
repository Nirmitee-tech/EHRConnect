import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { EnhancedDateTimePicker } from './EnhancedDateTimePicker';

interface PopoverDateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  availableTimeSlots: string[];
  isDateDisabled?: (date: string) => boolean;
  minDate?: string;
  disabled?: boolean;
}

export function PopoverDateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  availableTimeSlots,
  isDateDisabled,
  minDate,
  disabled = false
}: PopoverDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0, width: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Calculate popover position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 8, // 8px gap
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Format time to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Format display text
  const getDisplayText = (): string => {
    if (selectedDate && selectedTime) {
      const date = new Date(selectedDate + 'T00:00:00');
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `${dateStr} at ${formatTime12Hour(selectedTime)}`;
    }
    if (selectedDate) {
      const date = new Date(selectedDate + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' - Select time';
    }
    return 'Select date and time';
  };

  // No automatic close on click outside - user must click X or Done button

  // Don't auto-close - let user manually close with X or Done button

  return (
    <div className="relative">
      {/* Input Field */}
      <div
        ref={inputRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(true);
        }}
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer
          ${isOpen
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Icon */}
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="h-5 w-5" />
          <Clock className="h-5 w-5" />
        </div>

        {/* Display Text */}
        <div className="flex-1">
          <span className={`text-sm ${selectedDate && selectedTime ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            {getDisplayText()}
          </span>
        </div>

        {/* Clear Button */}
        {(selectedDate || selectedTime) && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDateChange('');
              onTimeChange('');
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Required Indicator */}
        {!selectedDate || !selectedTime ? (
          <span className="text-red-500 text-xs font-medium">*</span>
        ) : null}
      </div>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop for mobile - visual only, doesn't close on click */}
          <div className="fixed inset-0 bg-black/20 z-[9998] lg:hidden" />

          {/* Popover Content */}
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              width: `${popoverPosition.width}px`,
              minWidth: '600px',
              maxWidth: '90vw'
            }}
            className="z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Select Date & Time</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <EnhancedDateTimePicker
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={onDateChange}
                onTimeChange={onTimeChange}
                availableTimeSlots={availableTimeSlots}
                isDateDisabled={isDateDisabled}
                minDate={minDate}
                disabled={disabled}
              />
            </div>

            {/* Footer with Done Button - Always visible at bottom */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`w-full py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  selectedDate && selectedTime
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedDate && selectedTime ? 'Done' : 'Close'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
