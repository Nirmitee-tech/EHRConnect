import React, { useState } from 'react';
import { CalendarIcon, Clock, User, Plus } from 'lucide-react';

interface AppointmentFormFieldsProps {
  formData: any;
  practitioners: Array<{ id: string; name: string; color?: string; vacations?: any[]; officeHours?: any[] }>;
  patients: Array<{ id: string; name: string }>;
  treatmentCategories: string[];
  locations: string[];
  isNewPatient: boolean;
  onFormDataChange: (field: string, value: any) => void;
  onDoctorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPatientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleNewPatient: () => void;
  onAddLocation: (location: string) => void;
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
  onAddLocation
}: AppointmentFormFieldsProps) {
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      onAddLocation(newLocation.trim());
      onFormDataChange('location', newLocation.trim());
      setNewLocation('');
      setShowAddLocation(false);
    }
  };

  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

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

  // Check if date should be disabled
  const isDateDisabled = (dateStr: string): boolean => {
    if (formData.isEmergency) return false;

    const date = new Date(dateStr);
    return !isWorkingDay(date) || isOnVacation(date);
  };

  return (
    <div className="space-y-4">
      {/* Doctor */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Doctor<span className="text-red-500">*</span>
        </label>
        {!showAddDoctor ? (
          <select
            required
            value={formData.doctorId}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '__add_new__') {
                setShowAddDoctor(true);
              } else {
                onDoctorChange(e);
              }
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Doctor</option>
            {practitioners.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
            <option value="__add_new__" className="font-medium text-blue-600">
              + Create New Practitioner
            </option>
          </select>
        ) : (
          <div className="mt-1 space-y-2">
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
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Patient<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">New Patient</span>
            <button
              type="button"
              onClick={onToggleNewPatient}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isNewPatient ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isNewPatient ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        {!isNewPatient ? (
          <select
            required
            value={formData.patientId}
            onChange={onPatientChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            required
            value={formData.patientName}
            onChange={(e) => onFormDataChange('patientName', e.target.value)}
            placeholder="Enter new patient name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Location/Room */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location<span className="text-red-500">*</span>
        </label>
        {!showAddLocation ? (
          <div className="mt-1 flex gap-2">
            <select
              required
              value={formData.location || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '__add_new__') {
                  setShowAddLocation(true);
                } else {
                  onFormDataChange('location', value);
                }
              }}
              className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
              <option value="__add_new__" className="font-medium text-blue-600">
                + Add New Location
              </option>
            </select>
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter new location name"
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddLocation(false);
                setNewLocation('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
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
                    const schedule = selectedPractitioner.officeHours.find((h: any) => h.dayOfWeek === idx);
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
                    {idx < Math.min(selectedPractitioner.vacations.length, 2) - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treatment Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Treatment Category
        </label>
        {!showAddCategory ? (
          <select
            value={formData.treatmentCategory}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '__add_new__') {
                setShowAddCategory(true);
              } else {
                onFormDataChange('treatmentCategory', value);
              }
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Not Specified</option>
            {treatmentCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="__add_new__" className="font-medium text-blue-600">
              + Add New Category
            </option>
          </select>
        ) : (
          <div className="mt-1 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter new category name"
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value.trim()) {
                      onFormDataChange('treatmentCategory', input.value.trim());
                      setShowAddCategory(false);
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input?.value.trim()) {
                    onFormDataChange('treatmentCategory', input.value.trim());
                    setShowAddCategory(false);
                  }
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCategory(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
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
          <div className="relative mt-1">
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
            <div className="relative mt-1">
              <select
                required={!formData.isAllDay}
                value={formData.time}
                onChange={(e) => onFormDataChange('time', e.target.value)}
                disabled={!formData.date || (!formData.isEmergency && isDateDisabled(formData.date))}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Select time</option>
                {getAvailableTimeSlots().map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

      {/* Emergency Appointment */}
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
