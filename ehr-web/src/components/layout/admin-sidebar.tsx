'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/types/rbac'
import {
  Users,
  UserCog,
  Shield,
  Hospital,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  Activity,
  Stethoscope
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  children?: SidebarItem[]
}

const navigation: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    permission: undefined // Dashboard accessible to all authenticated users
  },
  {
    title: 'Patient Management',
    href: '/admin/patients',
    icon: Hospital,
    permission: 'patients:read',
    children: [
      { title: 'All Patients', href: '/admin/patients', icon: Hospital, permission: 'patients:read' },
      { title: 'Add Patient', href: '/admin/patients/new', icon: Hospital, permission: 'patients:create' },
    ]
  },
  {
    title: 'Practitioners',
    href: '/admin/practitioners',
    icon: Stethoscope,
    permission: 'practitioners:read',
    children: [
      { title: 'All Practitioners', href: '/admin/practitioners', icon: Stethoscope, permission: 'practitioners:read' },
      { title: 'Add Practitioner', href: '/admin/practitioners/new', icon: Stethoscope, permission: 'practitioners:create' },
    ]
  },
  {
    title: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
    permission: 'appointments:read',
    children: [
      { title: 'All Appointments', href: '/admin/appointments', icon: Calendar, permission: 'appointments:read' },
      { title: 'Schedule Appointment', href: '/admin/appointments/new', icon: Calendar, permission: 'appointments:create' },
    ]
  },
  {
    title: 'Medical Records',
    href: '/admin/records',
    icon: FileText,
    permission: 'records:read'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: 'users:read',
    children: [
      { title: 'All Users', href: '/admin/users', icon: Users, permission: 'users:read' },
      { title: 'Add User', href: '/admin/users/new', icon: UserCog, permission: 'users:create' },
      { title: 'Roles & Permissions', href: '/admin/roles', icon: Shield, permission: 'roles:read' },
    ]
  },
  {
    title: 'Reports & Analytics',
    href: '/admin/reports',
    icon: BarChart3,
    permission: 'reports:view'
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'system:settings'
  }
]

interface AdminSidebarProps {
  children: React.ReactNode
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const userPermissions = session?.permissions || []

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(userPermissions, item.permission)
  )

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            EHR Connect
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {filteredNavigation.map((item) => (
          <div key={item.href}>
            <div className="relative">
              <Link
                href={item.href}
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.href)
                  }
                  setSidebarOpen(false)
                }}
                className={cn(
                  'group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
                {item.children && (
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedItems.includes(item.href) ? "rotate-180" : ""
                    )}
                  />
                )}
              </Link>
            </div>
            
            {/* Submenu */}
            {item.children && expandedItems.includes(item.href) && (
              <div className="mt-1 ml-6 space-y-1">
                {item.children
                  .filter(child => !child.permission || hasPermission(userPermissions, child.permission))
                  .map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors',
                        pathname === child.href
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.title}</span>
                    </Link>
                  ))
                }
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session?.user?.name || session?.user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {session?.roles?.join(', ') || 'User'}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              EHR Connect
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                EHR Connect Admin
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications, user menu, etc. can be added here */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {session?.user?.name || session?.user?.email}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
