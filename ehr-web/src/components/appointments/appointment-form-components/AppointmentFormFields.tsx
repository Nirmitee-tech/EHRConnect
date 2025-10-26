import React, { useState, useEffect } from 'react';
import { CalendarIcon, Clock, User, Plus, MapPin, FileText } from 'lucide-react';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';

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
  locations: string[];
  isNewPatient: boolean;
  onFormDataChange: (field: string, value: any) => void;
  onDoctorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPatientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleNewPatient: () => void;
  onAddLocation: (location: string) => void;
  onOpenPatientDrawer?: () => void;
  onOpenLocationDrawer?: () => void;
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
  onAddLocation,
  onOpenPatientDrawer,
  onOpenLocationDrawer,
  onOpenCategoryDrawer
}: AppointmentFormFieldsProps) {
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  // Get selected practitioner
  const selectedPractitioner = practitioners.find(p => p.id === formData.doctorId);

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
          options={locations.map(loc => ({ value: loc, label: loc }))}
          value={formData.location || ''}
          onChange={(value) => onFormDataChange('location', value)}
          placeholder="Select Location"
          onAddNew={onOpenLocationDrawer}
          addNewLabel="Add New Location"
        />
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

      {/* Treatment Category */}
      <div>
        <SearchableSelect
          label="Treatment Category"
          options={treatmentCategories.map(cat => ({ value: cat, label: cat }))}
          value={formData.treatmentCategory || ''}
          onChange={(value) => onFormDataChange('treatmentCategory', value)}
          placeholder="Select Category"
          onAddNew={onOpenCategoryDrawer}
          addNewLabel="Add New Category"
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
          {formData.date && !formData.isEmergency && selectedPractitioner && (
            <div className="mt-1.5">
              {isOnVacation(new Date(formData.date)) && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  ✈️ Practitioner is on vacation this day
                </p>
              )}
              {!isWorkingDay(new Date(formData.date)) && !isOnVacation(new Date(formData.date)) && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  🚫 Practitioner is not working on this day
                </p>
              )}
              {isWorkingDay(new Date(formData.date)) && !isOnVacation(new Date(formData.date)) && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  ✓ Available - {getWorkingHours(new Date(formData.date))?.start} to {getWorkingHours(new Date(formData.date))?.end}
                </p>
              )}
            </div>
          )}
        </div>
        {!formData.isAllDay && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time<span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="time"
                required={!formData.isAllDay}
                value={formData.time}
                onChange={(e) => onFormDataChange('time', e.target.value)}
                disabled={!formData.date || (!formData.isEmergency && isDateDisabled(formData.date))}
                step="900"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
              />
            </div>
            {formData.date && !formData.isEmergency && getAvailableTimeSlots().length === 0 && (
              <p className="mt-1.5 text-xs text-red-600">
                No available time slots for this date
              </p>
            )}
          </div>
        )}
      </div>

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
