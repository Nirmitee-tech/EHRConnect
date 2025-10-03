import React, { useState, ReactNode } from 'react'
import { cn } from '../../../lib/utils'

export interface SidebarNavItemProps {
  /** Item title */
  title: string
  /** Icon element */
  icon?: ReactNode
  /** Whether the item is active/selected */
  isActive?: boolean
  /** Child items for expandable navigation */
  children?: ReactNode
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  title,
  icon,
  isActive = false,
  children,
  onClick,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = !!children

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
    onClick?.()
  }

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        className={cn(
          'w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <span className="truncate">{title}</span>
        </div>
        {hasChildren && (
          <svg
            className={cn(
              "h-4 w-4 transition-transform duration-200 flex-shrink-0 ml-2",
              isExpanded ? "rotate-180" : ""
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Submenu */}
      {hasChildren && isExpanded && (
        <div className="mt-1 ml-6 space-y-1 pl-2">
          {children}
        </div>
      )}
    </div>
  )
}

SidebarNavItem.displayName = 'SidebarNavItem'

export interface SidebarNavSubItemProps {
  /** Item title */
  title: string
  /** Icon element */
  icon?: ReactNode
  /** Whether the item is active/selected */
  isActive?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

export const SidebarNavSubItem: React.FC<SidebarNavSubItemProps> = ({
  title,
  icon,
  isActive = false,
  onClick,
  className
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full group flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer',
        isActive
          ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/50 dark:text-blue-200'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
        className
      )}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span className="truncate">{title}</span>
    </div>
  )
}

SidebarNavSubItem.displayName = 'SidebarNavSubItem'
