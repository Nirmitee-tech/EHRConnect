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

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    onClick?.()
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
          className
        )}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span>{title}</span>
        </div>
        {hasChildren && (
          <svg 
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded ? "rotate-180" : ""
            )}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      
      {/* Submenu */}
      {hasChildren && isExpanded && (
        <div className="mt-1 ml-6 space-y-1">
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
    <button
      onClick={onClick}
      className={cn(
        'group flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50',
        className
      )}
    >
      {icon}
      <span>{title}</span>
    </button>
  )
}

SidebarNavSubItem.displayName = 'SidebarNavSubItem'
