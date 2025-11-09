'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface EpisodeIndicatorProps {
  specialtySlug: string;
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * EpisodeIndicator Component
 * Shows a visual indicator when a patient has an active episode
 */
export function EpisodeIndicator({
  specialtySlug,
  isActive,
  color = '#10B981',
  size = 'sm',
  className = '',
}: EpisodeIndicatorProps) {
  if (!isActive) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      title={`Active ${specialtySlug} episode`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full animate-pulse`}
        style={{ backgroundColor: color }}
      />
      {size !== 'sm' && (
        <Activity className="h-3 w-3 text-gray-500" />
      )}
    </div>
  );
}
