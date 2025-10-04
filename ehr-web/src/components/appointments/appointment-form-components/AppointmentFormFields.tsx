import React from 'react';
import { CalendarIcon, Clock, User } from 'lucide-react';

interface AppointmentFormFieldsProps {
  formData: any;
  practitioners: Array<{ id: string; name: string }>;
  patients: Array<{ id: string; name: string }>;
  treatmentCategories: string[];
  isNewPatient: boolean;
  onFormDataChange: (field: string, value: any) => void;
  onDoctorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPatientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleNewPatient: () => void;
}

export function AppointmentFormFields({
  formData,
  practitioners,
  patients,
  treatmentCategories,
  isNewPatient,
  onFormDataChange,
  onDoctorChange,
  onPatientChange,
  onToggleNewPatient
}: AppointmentFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Center/Facility */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Center<span className="text-red-500">*</span>
        </label>
        <select
          value={formData.centerId}
          onChange={(e) => onFormDataChange('centerId', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select Center</option>
          <option value="center1">Main Center</option>
          <option value="center2">Branch Center</option>
        </select>
      </div>

      {/* Doctor */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Doctor<span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.doctorId}
          onChange={onDoctorChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select Doctor</option>
          {practitioners.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
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

      {/* Operatory */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Operatory</label>
        <select
          value={formData.operatory}
          onChange={(e) => onFormDataChange('operatory', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select Operatory</option>
          <option value="op1">Room 1</option>
          <option value="op2">Room 2</option>
          <option value="op3">Room 3</option>
        </select>
      </div>

      {/* Treatment Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Treatment Category
        </label>
        <select
          value={formData.treatmentCategory}
          onChange={(e) => onFormDataChange('treatmentCategory', e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Not Specified</option>
          {treatmentCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

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
              onChange={(e) => onFormDataChange('date', e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time<span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => onFormDataChange('time', e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Duration */}
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
