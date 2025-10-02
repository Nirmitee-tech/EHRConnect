import React, { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

export interface SidebarFooterProps {
  /** User avatar element or initial */
  avatar?: ReactNode
  /** User name */
  userName: string
  /** User role or subtitle */
  userRole?: string
  /** Action buttons */
  actions?: ReactNode
  /** Additional CSS classes */
  className?: string
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  avatar,
  userName,
  userRole,
  actions,
  className
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center space-x-3">
        {avatar}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {userName}
          </p>
          {userRole && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userRole}
            </p>
          )}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}

SidebarFooter.displayName = 'SidebarFooter'

export interface SidebarFooterActionProps {
  /** Icon element */
  icon?: ReactNode
  /** Action label */
  label: string
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

export const SidebarFooterAction: React.FC<SidebarFooterActionProps> = ({
  icon,
  label,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors',
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

SidebarFooterAction.displayName = 'SidebarFooterAction'
