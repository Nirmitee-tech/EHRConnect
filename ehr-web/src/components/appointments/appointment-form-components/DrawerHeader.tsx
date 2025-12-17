import React from 'react';
import { X } from 'lucide-react';

type TabType = 'appointment' | 'task' | 'unavailable';

interface DrawerHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onClose: () => void;
}

export function DrawerHeader({ activeTab, onTabChange, onClose }: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <div className="flex gap-6">
        <button
          type="button"
          onClick={() => onTabChange('appointment')}
          className={`pb-2 text-sm font-semibold ${activeTab === 'appointment'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600'
            }`}
        >
          Appointment
        </button>
        <button
          type="button"
          onClick={() => onTabChange('task')}
          className={`pb-2 text-sm font-semibold ${activeTab === 'task'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600'
            }`}
        >
          Task
        </button>
        <button
          type="button"
          onClick={() => onTabChange('unavailable')}
          className={`pb-2 text-sm font-semibold ${activeTab === 'unavailable'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600'
            }`}
        >
          Doctor/Staff Unavailable
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
