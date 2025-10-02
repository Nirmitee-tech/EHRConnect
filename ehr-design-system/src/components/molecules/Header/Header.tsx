import React, { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

export interface HeaderProps {
  /** Title text */
  title: string
  /** Subtitle or additional info (e.g., date) */
  subtitle?: string
  /** Search component */
  search?: ReactNode
  /** Action buttons */
  actions?: ReactNode
  /** Icon buttons */
  iconButtons?: ReactNode
  /** Status badge or indicator */
  statusBadge?: ReactNode
  /** User profile component */
  userProfile?: ReactNode
  /** Whether header should be sticky */
  sticky?: boolean
  /** Additional CSS classes */
  className?: string
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  search,
  actions,
  iconButtons,
  statusBadge,
  userProfile,
  sticky = true,
  className
}) => {
  return (
    <header 
      className={cn(
        'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
        sticky && 'sticky top-0 z-50',
        className
      )}
    >
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left section: Title and subtitle */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </span>
            )}
          </div>

          {/* Center section: Search */}
          {search && (
            <div className="flex-1 max-w-md">
              {search}
            </div>
          )}

          {/* Right section: Actions and user */}
          <div className="flex items-center gap-2">
            {actions}
            {iconButtons}
            {statusBadge}
            {userProfile}
          </div>
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'

export interface HeaderIconButtonProps {
  /** Icon element */
  icon: ReactNode
  /** Whether to show a notification badge */
  badge?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon,
  badge = false,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        className
      )}
    >
      {icon}
      {badge && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white dark:ring-gray-800" />
      )}
    </button>
  )
}

HeaderIconButton.displayName = 'HeaderIconButton'

export interface HeaderStatusBadgeProps {
  /** Badge label */
  label: string
  /** Badge color variant */
  variant?: 'success' | 'warning' | 'error' | 'info'
  /** Whether to show animated dot */
  animated?: boolean
  /** Additional CSS classes */
  className?: string
}

const badgeVariants = {
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white'
}

export const HeaderStatusBadge: React.FC<HeaderStatusBadgeProps> = ({
  label,
  variant = 'success',
  animated = false,
  className
}) => {
  return (
    <div 
      className={cn(
        badgeVariants[variant],
        'px-3 py-1 rounded-md text-xs font-medium',
        className
      )}
    >
      <span className="flex items-center gap-1.5">
        {animated && (
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        )}
        {label}
      </span>
    </div>
  )
}

HeaderStatusBadge.displayName = 'HeaderStatusBadge'
