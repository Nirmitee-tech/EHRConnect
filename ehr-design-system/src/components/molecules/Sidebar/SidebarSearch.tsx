import React from 'react'
import { cn } from '../../../lib/utils'

export interface SidebarSearchProps {
  /** Search value */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'block w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3',
          'text-sm placeholder-gray-400',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500',
          'transition-colors duration-200'
        )}
        placeholder={placeholder}
      />
    </div>
  )
}

SidebarSearch.displayName = 'SidebarSearch'
