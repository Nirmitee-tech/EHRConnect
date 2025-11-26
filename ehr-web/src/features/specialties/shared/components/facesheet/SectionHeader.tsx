'use client';

import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  icon?: LucideIcon;
  onViewAll?: () => void;
  onAdd?: () => void;
  alert?: boolean;
}

export function SectionHeader({ title, count, icon: Icon, onViewAll, onAdd, alert }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-1.5 border-b border-gray-300 mb-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-gray-500" />}
        <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border ${
            alert ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {count}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-0.5 text-[10px] text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-[10px] text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
