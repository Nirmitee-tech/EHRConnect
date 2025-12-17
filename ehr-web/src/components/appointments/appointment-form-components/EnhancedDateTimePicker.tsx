import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface EnhancedDateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  availableTimeSlots: string[];
  isDateDisabled?: (date: string) => boolean;
  minDate?: string;
  disabled?: boolean;
}

interface TimeSlotGroup {
  label: string;
  slots: string[];
}

export function EnhancedDateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  availableTimeSlots,
  isDateDisabled,
  minDate,
  disabled = false
}: EnhancedDateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Track which accordion sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    morning: true,
    afternoon: false,
    evening: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format time to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Group time slots by time of day
  const timeSlotGroups = useMemo((): TimeSlotGroup[] => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    availableTimeSlots.forEach(slot => {
      const [hours] = slot.split(':').map(Number);
      if (hours >= 0 && hours < 12) {
        morning.push(slot);
      } else if (hours >= 12 && hours < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return [
      { label: 'Morning slots', slots: morning },
      { label: 'Afternoon slots', slots: afternoon },
      { label: 'Evening Slots', slots: evening }
    ].filter(group => group.slots.length > 0);
  }, [availableTimeSlots]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Previous month days to fill the first week
    const prevMonthDays = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthTotalDays = prevMonth.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; dateString: string }> = [];

    // Add previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split('T')[0]
      });
    }

    // Add current month days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split('T')[0]
      });
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        dateString: date.toISOString().split('T')[0]
      });
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (dateString: string) => {
    if (disabled) return;
    if (isDateDisabled && isDateDisabled(dateString)) return;
    if (minDate && dateString < minDate) return;
    onDateChange(dateString);
  };

  const handleTimeSlotClick = (time: string) => {
    if (disabled) return;
    onTimeChange(time);
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isDayDisabled = (dateString: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return true;
    if (minDate && dateString < minDate) return true;
    if (isDateDisabled && isDateDisabled(dateString)) return true;
    return false;
  };

  return (
    <div className="space-y-3">
      {/* Selected Date/Time Display */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">
          {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'Select Date'}
        </span>
        {selectedTime && (
          <span className="text-blue-600 font-medium">({formatTime12Hour(selectedTime)})</span>
        )}
      </div>

      {/* Side-by-Side Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calendar Section */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={disabled}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-base font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={disabled}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate === day.dateString;
              const isDisabled = isDayDisabled(day.dateString, day.isCurrentMonth);
              const isTodayDate = isToday(day.dateString);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day.dateString)}
                  disabled={isDisabled || disabled}
                  className={`
                    relative h-10 text-sm rounded-md transition-all
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isSelected ? 'bg-primary text-primary-foreground font-semibold' : ''}
                    ${!isSelected && isTodayDate && day.isCurrentMonth ? 'ring-2 ring-blue-300' : ''}
                    ${!isSelected && !isDisabled && day.isCurrentMonth ? 'hover:bg-gray-100' : ''}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Section */}
        <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
          {selectedDate && timeSlotGroups.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {timeSlotGroups.map((group, idx) => {
                const sectionKey = group.label.toLowerCase().split(' ')[0];
                const isOpen = openSections[sectionKey];

                return (
                  <div key={group.label}>
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="text-sm font-semibold text-gray-700">{group.label}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{group.slots.length} slots</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-3 gap-2">
                          {group.slots.map((slot) => {
                            const isSelected = selectedTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimeSlotClick(slot)}
                                disabled={disabled}
                                className={`
                                  px-2 py-2 text-xs rounded-md border transition-all
                                  ${isSelected
                                    ? 'bg-primary text-primary-foreground border-blue-600 font-medium'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                  }
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                              >
                                {formatTime12Hour(slot)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : selectedDate && timeSlotGroups.length === 0 && !disabled ? (
            <div className="p-4 text-center text-sm text-red-600 bg-red-50">
              No available time slots for this date
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Select a date to view available time slots
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
