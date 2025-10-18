import React from 'react';

type AppointmentType = 'single' | 'series' | 'group';

interface AppointmentTypeTabsProps {
  appointmentType: AppointmentType;
  onTypeChange: (type: AppointmentType) => void;
}

export function AppointmentTypeTabs({ appointmentType, onTypeChange }: AppointmentTypeTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200 px-6 py-3">
      <button
        type="button"
        onClick={() => onTypeChange('single')}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          appointmentType === 'single'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Single Appointment
      </button>
      <button
        type="button"
        onClick={() => onTypeChange('series')}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          appointmentType === 'series'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Appointment Series
      </button>
      <button
        type="button"
        onClick={() => onTypeChange('group')}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          appointmentType === 'group'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Group Appointment
      </button>
    </div>
  );
}
