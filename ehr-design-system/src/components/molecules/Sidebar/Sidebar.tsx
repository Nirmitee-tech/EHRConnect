import React, { useState, ReactNode } from 'react'
import { cn } from '../../../lib/utils'

export interface SidebarProps {
  /** Brand logo element */
  logo?: ReactNode
  /** Brand name */
  brandName: string
  /** Navigation content */
  navigation: ReactNode
  /** Footer content (user profile, etc.) */
  footer?: ReactNode
  /** Main content to render alongside sidebar */
  children: ReactNode
  /** Top bar content */
  topBar?: ReactNode
  /** Additional CSS classes */
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  logo,
  brandName,
  navigation,
  footer,
  children,
  topBar,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={cn('flex h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {logo}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {brandName}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navigation}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {footer}
          </div>
        )}
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {logo}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {brandName}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation}
          </nav>
          {footer && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {topBar}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

Sidebar.displayName = 'Sidebar'
