'use client';

import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
  icon: LucideIcon;
  message: string;
  showButton?: boolean;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

/**
 * Reusable Placeholder Tab Component
 * - Used for tabs that don't have full functionality yet
 * - Displays a centered empty state with icon and message
 * - Optionally shows an "Add" button in the header
 * - All data from Zustand (no API calls)
 */
export function PlaceholderTab({
  title,
  icon: Icon,
  message,
  showButton = false,
  buttonLabel = 'Add',
  onButtonClick
}: PlaceholderTabProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {showButton && onButtonClick && (
          <button
            onClick={onButtonClick}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </button>
        )}
      </div>
      <div className="text-center py-12 text-gray-500">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
