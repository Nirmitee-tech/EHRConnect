'use client';

import React from 'react';
import { Badge } from '@nirmitee.io/design-system';
import { useSpecialtyContext } from '@/contexts/specialty-context';

interface SpecialtyBadgeProps {
  specialtySlug: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * SpecialtyBadge Component
 * Displays a badge for a specialty with its color and icon
 */
export function SpecialtyBadge({
  specialtySlug,
  className = '',
  showIcon = false,
}: SpecialtyBadgeProps) {
  const { getPackBySlug } = useSpecialtyContext();
  const pack = getPackBySlug(specialtySlug);

  if (!pack) {
    return null;
  }

  return (
    <Badge
      className={className}
      style={{
        backgroundColor: pack.color || '#3B82F6',
        color: 'white',
      }}
    >
      {showIcon && pack.icon && <span className="mr-1">{pack.icon}</span>}
      {pack.name || pack.slug}
    </Badge>
  );
}
