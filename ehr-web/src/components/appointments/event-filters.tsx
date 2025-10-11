'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface EventCategory {
  id: string;
  label: string;
  color: string;
  checked: boolean;
}

interface EventFiltersProps {
  className?: string;
  categories: EventCategory[];
  onCategoryToggle: (categoryId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function EventFilters({
  className,
  categories,
  onCategoryToggle,
  searchQuery = '',
  onSearchChange
}: EventFiltersProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Filter Checkboxes */}
      <div className="space-y-1.5">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-1.5">
            <Checkbox
              id={category.id}
              checked={category.checked}
              onCheckedChange={() => onCategoryToggle(category.id)}
              className="h-3 w-3"
            />
            <label
              htmlFor={category.id}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer select-none"
            >
              <span
                className={cn('h-2 w-2 rounded', category.color)}
              />
              {category.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
