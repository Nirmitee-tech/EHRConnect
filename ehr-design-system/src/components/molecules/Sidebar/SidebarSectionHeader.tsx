import React from 'react'
import { cn } from '../../../lib/utils'

export interface SidebarSectionHeaderProps {
  /** Section title */
  title: string
  /** Additional CSS classes */
  className?: string
}

export const SidebarSectionHeader: React.FC<SidebarSectionHeaderProps> = ({
  title,
  className
}) => {
  return (
    <div className={cn('px-4 py-2', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h3>
    </div>
  )
}

SidebarSectionHeader.displayName = 'SidebarSectionHeader'
