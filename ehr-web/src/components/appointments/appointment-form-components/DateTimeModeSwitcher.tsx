import React from 'react';
import { Calendar, Grid3x3, List, MousePointerClick } from 'lucide-react';

export type DateTimeMode = 'simple' | 'enhanced' | 'quick' | 'popover';

interface DateTimeModeSwitcherProps {
  mode: DateTimeMode;
  onModeChange: (mode: DateTimeMode) => void;
}

export function DateTimeModeSwitcher({ mode, onModeChange }: DateTimeModeSwitcherProps) {
  const modes = [
    {
      value: 'popover' as DateTimeMode,
      label: 'Popover',
      icon: MousePointerClick,
      description: 'Click to expand picker'
    },
    {
      value: 'enhanced' as DateTimeMode,
      label: 'Enhanced',
      icon: Grid3x3,
      description: 'Calendar with time slots'
    },
    {
      value: 'quick' as DateTimeMode,
      label: 'Quick',
      icon: Calendar,
      description: 'Dropdown selection'
    },
    {
      value: 'simple' as DateTimeMode,
      label: 'Simple',
      icon: List,
      description: 'Basic date/time inputs'
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
