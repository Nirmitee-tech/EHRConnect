import React from 'react'
import { cn } from '../../../lib/utils'

export interface LoadingStateProps {
  /** Loading message to display */
  message?: string
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show fullscreen */
  fullScreen?: boolean
  /** Additional CSS classes */
  className?: string
}

const spinnerSizes = {
  sm: 'w-8 h-8 border-2',
  md: 'w-16 h-16 border-4',
  lg: 'w-24 h-24 border-[6px]'
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = true,
  className
}) => {
  const containerClasses = fullScreen
    ? 'flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'
    : 'flex items-center justify-center p-8'

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center">
        <div 
          className={cn(
            spinnerSizes[size],
            'border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'
          )}
          role="status"
          aria-label="Loading"
        />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

LoadingState.displayName = 'LoadingState'
