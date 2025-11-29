import React, { useState, useEffect } from 'react';
import { CalendarIcon, FileText, Video, Phone, Users } from 'lucide-react';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { EnhancedDateTimePicker } from './EnhancedDateTimePicker';
import { QuickDateTimePicker } from './QuickDateTimePicker';
import { PopoverDateTimePicker } from './PopoverDateTimePicker';
import { DateTimeModeSwitcher, DateTimeMode } from './DateTimeModeSwitcher';
import { MultiSelectFormDropdown } from './MultiSelectFormDropdown';

interface AppointmentFormFieldsProps {
  formData: any;
  practitioners: Array<{ id: string; name: string; color?: string; vacations?: any[]; officeHours?: any[] }>;
  patients: Array<{
    id: string;
    name: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
  }>;
  treatmentCategories: string[];
  locations: Array<{ id: string; name: string }>;
  isNewPatient: boolean;
  onFormDataChange: (field: string, value: any) => void;
  onDoctorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPatientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleNewPatient: () => void;
  onOpenPatientDrawer?: () => void;
  onOpenCategoryDrawer?: () => void;
}

export function AppointmentFormFields({
  formData,
  practitioners,
  patients,
  treatmentCategories,
  locations,
  isNewPatient,
  onFormDataChange,
  onDoctorChange,
  onPatientChange,
  onToggleNewPatient,
  onOpenPatientDrawer,
  onOpenCategoryDrawer
}: AppointmentFormFieldsProps) {
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [dateTimeMode, setDateTimeMode] = useState<DateTimeMode>('enhanced');

  // Get selected practitioner
  const selectedPractitioner = practitioners.find(p => p.id === formData.doctorId);

  const handleLocationChange = (value: string) => {
    const selected = locations.find(loc => loc.id === value);
    onFormDataChange('locationId', value);
    onFormDataChange('location', selected?.name || '');
  };

  // Check if a date is a working day
  const isWorkingDay = (date: Date): boolean => {
    if (!selectedPractitioner?.officeHours || formData.isEmergency) return true;

    const dayOfWeek = date.getDay();
    const daySchedule = selectedPractitioner.officeHours.find((h: any) => h.dayOfWeek === dayOfWeek);

    return daySchedule ? daySchedule.isWorking : false;
  };

  // Check if date is during vacation
  const isOnVacation = (date: Date): boolean => {
    if (!selectedPractitioner?.vacations || formData.isEmergency) return false;

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    return selectedPractitioner.vacations.some((vacation: any) => {
      const vacStart = new Date(vacation.startDate);
      vacStart.setHours(0, 0, 0, 0);
      const vacEnd = new Date(vacation.endDate);
      vacEnd.setHours(23, 59, 59, 999);

      return dateOnly >= vacStart && dateOnly <= vacEnd;
    });
  };

  // Get working hours for selected date
  const getWorkingHours = (date: Date): { start: string; end: string } | null => {
    if (!selectedPractitioner?.officeHours || formData.isEmergency) return null;

    const dayOfWeek = date.getDay();
    const daySchedule = selectedPractitioner.officeHours.find((h: any) => h.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isWorking) return null;

    return {
      start: daySchedule.startTime,
      end: daySchedule.endTime
    };
  };

  // Get available time slots (15-minute intervals)
  const getAvailableTimeSlots = (): string[] => {
    if (!formData.date || !selectedPractitioner?.officeHours || formData.isEmergency) {
      // Generate all time slots for emergency or no restrictions
      const slots: string[] = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 15) {
          slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
        }
      }
      return slots;
    }

    const selectedDate = new Date(formData.date);
    const workingHours = getWorkingHours(selectedDate);

    if (!workingHours) return [];

    const slots: string[] = [];
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`);

      currentMin += 15;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  // Check if doctor is unavailable for selected date/time
  const isDoctorUnavailable = (): boolean => {
    if (!selectedPractitioner || !formData.date || !formData.time) return false;

    const selectedDate = new Date(`${formData.date}T${formData.time}`);

    // Check if on vacation
    if (isOnVacation(selectedDate)) return true;

    // Check if non-working day
    if (!isWorkingDay(selectedDate)) return true;

    // Check if outside working hours
    const workingHours = getWorkingHours(selectedDate);
    if (workingHours) {
      const [startHour, startMin] = workingHours.start.split(':').map(Number);
      const [endHour, endMin] = workingHours.end.split(':').map(Number);

      const selectedHour = selectedDate.getHours();
      const selectedMin = selectedDate.getMinutes();

      const selectedTimeInMin = selectedHour * 60 + selectedMin;
      const startTimeInMin = startHour * 60 + startMin;
      const endTimeInMin = endHour * 60 + endMin;

      if (selectedTimeInMin < startTimeInMin || selectedTimeInMin >= endTimeInMin) {
        return true;
      }
    }

    return false;
  };

  // Auto-uncheck emergency flag when doctor becomes available
  useEffect(() => {
    // Only auto-uncheck if it's currently checked
    if (formData.isEmergency) {
      const unavailable = isDoctorUnavailable();
      // If doctor is now available, uncheck the emergency flag
      if (!unavailable) {
        onFormDataChange('isEmergency', false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctorId, formData.date, formData.time]);

  // Check if date should be disabled
  const isDateDisabled = (dateStr: string): boolean => {
    if (formData.isEmergency) return false;

    const date = new Date(dateStr);
    return !isWorkingDay(date) || isOnVacation(date);
  };

  // Convert practitioners to SearchableSelect options
  const doctorOptions: SelectOption[] = practitioners.map(p => ({
    value: p.id,
    label: p.name,
    color: p.color,
    textColor: p.color ? '#FFFFFF' : undefined // White text for colored backgrounds
  }));

  // Convert patients to SearchableSelect options
  const patientOptions: SelectOption[] = patients.map(p => {
    // Format subtitle with available patient details
    const details = [];
    if (p.dateOfBirth) {
      const age = Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      details.push(`${age}y, DOB: ${new Date(p.dateOfBirth).toLocaleDateString()}`);
    }
    if (p.gender) details.push(p.gender.charAt(0).toUpperCase() + p.gender.slice(1));
    if (p.phone) details.push(`📞 ${p.phone}`);
    if (p.email) details.push(`📧 ${p.email}`);

    return {
      value: p.id,
      label: p.name,
      subtitle: details.length > 0 ? details.join(' • ') : undefined
    };
  });

  return (
    <div className="space-y-4">
      {/* Doctor */}
      <div>
        {!showAddDoctor ? (
          <SearchableSelect
            label="Doctor"
            required
            options={doctorOptions}
            value={formData.doctorId}
            onChange={(value) => {
              // Simulate event for compatibility
              const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
              onDoctorChange(event);
            }}
            placeholder="Select Doctor"
            showColorInButton
            onAddNew={() => setShowAddDoctor(true)}
            addNewLabel="Create New Practitioner"
          />
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <p className="text-sm text-gray-600">
              Please go to Staff Management to add a new practitioner, then return here.
            </p>
            <button
              type="button"
              onClick={() => setShowAddDoctor(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to selection
            </button>
          </div>
        )}
      </div>

      {/* Patient */}
      <div>
        <SearchableSelect
          label="Patient"
          required
          options={patientOptions}
          value={formData.patientId}
          onChange={(value) => {
            // Simulate event for compatibility
            const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
            onPatientChange(event);
          }}
          placeholder="Select Patient"
          onAddNew={onOpenPatientDrawer}
          addNewLabel="Add New Patient"
        />
      </div>

      {/* Location/Room */}
      <div>
        <SearchableSelect
          label="Location"
          required
          options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
          value={formData.locationId || ''}
          onChange={handleLocationChange}
          placeholder="Select Location"
        />
      </div>

      {/* Appointment Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Appointment Mode<span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onFormDataChange('mode', 'in-person')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
              formData.mode === 'in-person'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">In-Person</span>
          </button>
          <button
            type="button"
            onClick={() => onFormDataChange('mode', 'video-call')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
              formData.mode === 'video-call'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Video className="h-5 w-5" />
            <span className="text-xs font-medium">Video Call</span>
          </button>
          <button
            type="button"
            onClick={() => onFormDataChange('mode', 'voice-call')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
              formData.mode === 'voice-call'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Phone className="h-5 w-5" />
            <span className="text-xs font-medium">Voice Call</span>
          </button>
          <button
            type="button"
            onClick={() => onFormDataChange('mode', 'other')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg border-2 transition-all ${
              formData.mode === 'other'
                ? 'border-gray-500 bg-gray-50 text-gray-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Other</span>
          </button>
        </div>
      </div>

      {/* Practitioner Availability Info */}
      {selectedPractitioner && !formData.isEmergency && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">📅 {selectedPractitioner.name}'s Schedule</h4>
          <div className="space-y-1 text-xs text-blue-800">
            {/* Working Days */}
            {selectedPractitioner.officeHours && selectedPractitioner.officeHours.length > 0 && (
              <div>
                <span className="font-medium">Working Days: </span>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  .map((day, idx) => {
                    const schedule = selectedPractitioner.officeHours?.find((h: any) => h.dayOfWeek === idx);
                    return schedule?.isWorking ? day : null;
                  })
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
            {/* Vacations */}
            {selectedPractitioner.vacations && selectedPractitioner.vacations.length > 0 && (
              <div>
                <span className="font-medium">Upcoming Leaves: </span>
                {selectedPractitioner.vacations.slice(0, 2).map((vac: any, idx: number) => (
                  <span key={idx}>
                    {new Date(vac.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(vac.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {idx < Math.min(selectedPractitioner.vacations?.length || 0, 2) - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Type */}
      <div>
        <SearchableSelect
          label="Appointment Type"
          options={treatmentCategories.map(cat => ({ value: cat, label: cat }))}
          value={formData.treatmentCategory || ''}
          onChange={(value) => onFormDataChange('treatmentCategory', value)}
          placeholder="Select Appointment Type"
          onAddNew={onOpenCategoryDrawer}
          addNewLabel="Add New Appointment Type"
        />
      </div>

      {/* All-Day Event Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">All-Day Event</span>
        </div>
        <button
          type="button"
          onClick={() => onFormDataChange('isAllDay', !formData.isAllDay)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.isAllDay ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.isAllDay ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* All-Day Event Type - Only show if isAllDay is true */}
      {formData.isAllDay && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Type<span className="text-red-500">*</span>
          </label>
          <select
            required={formData.isAllDay}
            value={formData.allDayEventType || 'appointment'}
            onChange={(e) => onFormDataChange('allDayEventType', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="appointment">📅 Regular Appointment</option>
            <option value="leave">🏖️ Leave</option>
            <option value="vacation">✈️ Vacation</option>
            <option value="holiday">🎉 Holiday</option>
            <option value="conference">🎤 Conference</option>
            <option value="training">📚 Training</option>
            <option value="other">📌 Other</option>
          </select>
        </div>
      )}

      {/* Date and Time */}
      {!formData.isAllDay ? (
        <div>
          {/* Label with Mode Switcher on Right */}
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Date &amp; Time<span className="text-red-500">*</span>
            </label>
            <DateTimeModeSwitcher
              mode={dateTimeMode}
              onModeChange={setDateTimeMode}
            />
          </div>

          {/* Render appropriate picker based on mode */}
          {dateTimeMode === 'popover' && (
            <PopoverDateTimePicker
              selectedDate={formData.date}
              selectedTime={formData.time}
              onDateChange={(date) => {
                // Clear time if new date is not available
                if (!formData.isEmergency && isDateDisabled(date)) {
                  onFormDataChange('time', '');
                }
                onFormDataChange('date', date);
              }}
              onTimeChange={(time) => onFormDataChange('time', time)}
              availableTimeSlots={getAvailableTimeSlots()}
              isDateDisabled={isDateDisabled}
              minDate={new Date().toISOString().split('T')[0]}
              disabled={false}
            />
          )}

          {dateTimeMode === 'simple' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date<span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      // Clear time if new date is not available
                      if (!formData.isEmergency && isDateDisabled(newDate)) {
                        onFormDataChange('time', '');
                      }
                      onFormDataChange('date', newDate);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time<span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => onFormDataChange('time', e.target.value)}
                    disabled={!formData.date || (!formData.isEmergency && isDateDisabled(formData.date))}
                    step="900"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {dateTimeMode === 'enhanced' && (
            <EnhancedDateTimePicker
              selectedDate={formData.date}
              selectedTime={formData.time}
              onDateChange={(date) => {
                // Clear time if new date is not available
                if (!formData.isEmergency && isDateDisabled(date)) {
                  onFormDataChange('time', '');
                }
                onFormDataChange('date', date);
              }}
              onTimeChange={(time) => onFormDataChange('time', time)}
              availableTimeSlots={getAvailableTimeSlots()}
              isDateDisabled={isDateDisabled}
              minDate={new Date().toISOString().split('T')[0]}
              disabled={false}
            />
          )}

          {dateTimeMode === 'quick' && (
            <QuickDateTimePicker
              selectedDate={formData.date}
              selectedTime={formData.time}
              onDateChange={(date) => {
                // Clear time if new date is not available
                if (!formData.isEmergency && isDateDisabled(date)) {
                  onFormDataChange('time', '');
                }
                onFormDataChange('date', date);
              }}
              onTimeChange={(time) => onFormDataChange('time', time)}
              availableTimeSlots={getAvailableTimeSlots()}
              isDateDisabled={isDateDisabled}
              minDate={new Date().toISOString().split('T')[0]}
              disabled={false}
            />
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date<span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => onFormDataChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Availability Status Info - Only show for Simple mode */}
      {formData.date && !formData.isEmergency && !formData.isAllDay && selectedPractitioner && dateTimeMode === 'simple' && (
        <div className="rounded-lg border p-3 text-xs">
          {isOnVacation(new Date(formData.date)) && (
            <p className="text-orange-600 flex items-center gap-1">
              ✈️ Practitioner is on vacation this day
            </p>
          )}
          {!isWorkingDay(new Date(formData.date)) && !isOnVacation(new Date(formData.date)) && (
            <p className="text-red-600 flex items-center gap-1">
              🚫 Practitioner is not working on this day
            </p>
          )}
          {isWorkingDay(new Date(formData.date)) && !isOnVacation(new Date(formData.date)) && (
            <p className="text-green-600 flex items-center gap-1">
              ✓ Available - {getWorkingHours(new Date(formData.date))?.start} to {getWorkingHours(new Date(formData.date))?.end}
            </p>
          )}
        </div>
      )}

      {/* Time slot warning for simple mode */}
      {formData.date && !formData.isEmergency && !formData.isAllDay && dateTimeMode === 'simple' && getAvailableTimeSlots().length === 0 && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg border border-red-200 p-2">
          No available time slots for this date
        </p>
      )}

      {/* Duration - Hide for all-day events */}
      {!formData.isAllDay && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration</label>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                min="0"
                value={formData.durationHours}
                onChange={(e) => onFormDataChange('durationHours', parseInt(e.target.value) || 0)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="mt-1 text-xs text-gray-500">Hour(s)</span>
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.durationMinutes}
                onChange={(e) => onFormDataChange('durationMinutes', parseInt(e.target.value) || 0)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="30"
              />
              <span className="mt-1 text-xs text-gray-500">Minute(s)</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onFormDataChange('notes', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Repeat Section - Ultra Clean Design */}
      <div className="space-y-2.5">
        {/* Repeat Checkbox - Inline with subtle styling */}
        <div className="flex items-start gap-3">
          <label className="flex items-center gap-2 cursor-pointer pt-0.5">
            <input
              type="checkbox"
              checked={formData.isRecurring || false}
              onChange={(e) => onFormDataChange('isRecurring', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm font-medium text-gray-800">Repeat</span>
          </label>
        </div>

        {formData.isRecurring && (
          <div className="space-y-2.5 ml-6 animate-in slide-in-from-top-2 duration-200">
            {/* Every - Ultra compact inline layout */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600 font-medium">Every</span>
              <input
                type="number"
                min="1"
                value={formData.recurrenceInterval || 1}
                onChange={(e) => onFormDataChange('recurrenceInterval', parseInt(e.target.value) || 1)}
                className="w-14 h-7 rounded-md border border-gray-300 bg-white px-2 text-sm text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={formData.recurrencePeriod || 'week'}
                onChange={(e) => onFormDataChange('recurrencePeriod', e.target.value)}
                className="h-7 rounded-md border border-gray-300 bg-white px-2.5 pr-7 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3cpath%20fill%3D%22%23666%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3c%2Fsvg%3E')] bg-[length:12px_12px] bg-[center_right_8px] bg-no-repeat"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>

            {/* Days of Week - Beautiful pill buttons */}
            {formData.recurrencePeriod === 'week' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                  const dayValues = [0, 1, 2, 3, 4, 5, 6];
                  const dayValue = dayValues[index];
                  const selectedDays = formData.recurrenceDays || [];
                  const isSelected = selectedDays.includes(dayValue);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const newDays = isSelected
                          ? selectedDays.filter((d: number) => d !== dayValue)
                          : [...selectedDays, dayValue].sort();
                        onFormDataChange('recurrenceDays', newDays);
                      }}
                      className={`
                        h-9 w-9 rounded-lg text-xs font-semibold transition-all duration-150
                        ${isSelected
                          ? 'bg-blue-600 text-white shadow-sm scale-105'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            {/* End On - Clean inline with icon */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">End On</span>
              <div className="relative flex-1">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.recurrenceEndDate || ''}
                  onChange={(e) => onFormDataChange('recurrenceEndDate', e.target.value)}
                  min={formData.date || new Date().toISOString().split('T')[0]}
                  className="w-full h-7 rounded-md border border-gray-300 bg-white pl-8 pr-2 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Choose Date"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chief Complaint - Elegant styling */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Chief Complaint</label>
        <input
          type="text"
          value={formData.chiefComplaint || ''}
          onChange={(e) => onFormDataChange('chiefComplaint', e.target.value)}
          className="block w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder=""
        />
      </div>

      {/* Reason - Elegant multi-line */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
        <textarea
          value={formData.reason || ''}
          onChange={(e) => onFormDataChange('reason', e.target.value)}
          rows={2}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          placeholder=""
        />
      </div>

      {/* Send Form - Multi-select with checkboxes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Send Form</label>
        <MultiSelectFormDropdown
          selectedForms={formData.selectedForms || []}
          onSelectionChange={(selectedIds) => onFormDataChange('selectedForms', selectedIds)}
        />
      </div>

      {/* Emergency Appointment - Only show when doctor is unavailable */}
      {isDoctorUnavailable() && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEmergency}
              onChange={(e) => onFormDataChange('isEmergency', e.target.checked)}
              className="rounded border-red-300 text-red-600 focus:ring-red-500 h-5 w-5"
            />
            <div>
              <span className="text-sm font-medium text-red-900">Emergency Appointment</span>
              <p className="text-xs text-red-700 mt-0.5">
                Override availability restrictions (leaves, working hours)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Email & SMS */}
      <details className="rounded-lg border border-gray-200">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700">
          Email & SMS/WA
        </summary>
        <div className="space-y-3 px-4 pb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.sendEmail}
              onChange={(e) => onFormDataChange('sendEmail', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Send Email Notification</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.sendSMS}
              onChange={(e) => onFormDataChange('sendSMS', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Send SMS/WhatsApp Notification</span>
          </label>
        </div>
      </details>
    </div>
  );
}
