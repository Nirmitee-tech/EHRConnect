import React from 'react';
import { Calendar, Grid3x3, List, MousePointerClick } from 'lucide-react';
import { useTranslation } from '@/i18n/client';

export type DateTimeMode = 'simple' | 'enhanced' | 'quick' | 'popover';

interface DateTimeModeSwitcherProps {
  mode: DateTimeMode;
  onModeChange: (mode: DateTimeMode) => void;
}

export function DateTimeModeSwitcher({ mode, onModeChange }: DateTimeModeSwitcherProps) {
  const { t } = useTranslation('common');

  const modes = [
    {
      value: 'popover' as DateTimeMode,
      label: t('appointment_form.datetime_picker_popover'),
      icon: MousePointerClick,
      description: t('appointment_form.datetime_picker_popover_desc')
    },
    {
      value: 'enhanced' as DateTimeMode,
      label: t('appointment_form.datetime_picker_enhanced'),
      icon: Grid3x3,
      description: t('appointment_form.datetime_picker_enhanced_desc')
    },
    {
      value: 'quick' as DateTimeMode,
      label: t('appointment_form.datetime_picker_quick'),
      icon: Calendar,
      description: t('appointment_form.datetime_picker_quick_desc')
    },
    {
      value: 'simple' as DateTimeMode,
      label: t('appointment_form.datetime_picker_simple'),
      icon: List,
      description: t('appointment_form.datetime_picker_simple_desc')
    }
  ];

  return (
    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {modes.map((modeOption) => {
        const Icon = modeOption.icon;
        const isActive = mode === modeOption.value;

        return (
          <button
            key={modeOption.value}
            type="button"
            onClick={() => onModeChange(modeOption.value)}
            title={modeOption.description}
            className={`
              flex items-center justify-center p-1.5 rounded-md transition-all
              ${isActive
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
