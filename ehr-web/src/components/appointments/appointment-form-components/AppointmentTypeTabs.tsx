import React from 'react';
import { useTranslation } from '@/i18n/client';

type AppointmentType = 'single' | 'series' | 'group';

interface AppointmentTypeTabsProps {
  appointmentType: AppointmentType;
  onTypeChange: (type: AppointmentType) => void;
}

export function AppointmentTypeTabs({ appointmentType, onTypeChange }: AppointmentTypeTabsProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex gap-2 border-b border-gray-200 px-6 py-3">
      <button
        type="button"
        onClick={() => onTypeChange('single')}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${appointmentType === 'single'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
          }`}
      >
        {t('appointment_form.single')}
      </button>
      <button
        type="button"
        onClick={() => onTypeChange('series')}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${appointmentType === 'series'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
          }`}
      >
        {t('appointment_form.series')}
      </button>
      <button
        type="button"
        onClick={() => onTypeChange('group')}
        className={`rounded-lg px-4 py-2 text-sm font-medium ${appointmentType === 'group'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
          }`}
      >
        {t('appointment_form.group')}
      </button>
    </div>
  );
}
