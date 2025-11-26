'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { hasPermission } from '@/types/rbac'
import {
  Sidebar,
  SidebarNavItem,
  SidebarNavSubItem,
  SidebarFooter,
  SidebarFooterAction,
  SidebarSearch,
  SidebarSectionHeader
} from '@nirmitee.io/design-system'
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
  const [searchQuery, setSearchQuery] = useState('')

  const userPermissions = session?.permissions || []

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(userPermissions, item.permission)
  )

  // Filter navigation based on search query
  const searchFilteredNavigation = searchQuery
    ? filteredNavigation.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredNavigation

  // Group navigation items by category
  const clinicItems = searchFilteredNavigation.slice(0, 3)
  const managementItems = searchFilteredNavigation.slice(3, 5)
  const systemItems = searchFilteredNavigation.slice(5)

  // Search component
  const searchComponent = (
    <SidebarSearch
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search menu..."
    />
  )

  // Render navigation items
  const navigationContent = (
    <div className="space-y-6">
      {/* Clinic Section */}
      {clinicItems.length > 0 && (
        <div>
          <SidebarSectionHeader title="Clinic" />
          <div className="space-y-1">
            {clinicItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0
        const filteredChildren = hasChildren
          ? item.children!.filter(child => !child.permission || hasPermission(userPermissions, child.permission))
          : []

        const navItem = (
          <SidebarNavItem
            key={item.href}
            title={item.title}
            icon={<item.icon className="h-5 w-5" />}
            isActive={pathname === item.href}
          >
            {filteredChildren.length > 0 && filteredChildren.map((child) => (
              <Link key={child.href} href={child.href}>
                <SidebarNavSubItem
                  title={child.title}
                  icon={<child.icon className="h-4 w-4" />}
                  isActive={pathname === child.href}
                />
              </Link>
            ))}
          </SidebarNavItem>
        )

              return hasChildren ? (
                navItem
              ) : (
                <Link key={item.href} href={item.href}>
                  {navItem}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Management Section */}
      {managementItems.length > 0 && (
        <div>
          <SidebarSectionHeader title="Management" />
          <div className="space-y-1">
            {managementItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const filteredChildren = hasChildren
                ? item.children!.filter(child => !child.permission || hasPermission(userPermissions, child.permission))
                : []

              const navItem = (
                <SidebarNavItem
                  key={item.href}
                  title={item.title}
                  icon={<item.icon className="h-5 w-5" />}
                  isActive={pathname === item.href}
                >
                  {filteredChildren.length > 0 && filteredChildren.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <SidebarNavSubItem
                        title={child.title}
                        icon={<child.icon className="h-4 w-4" />}
                        isActive={pathname === child.href}
                      />
                    </Link>
                  ))}
                </SidebarNavItem>
              )

              return hasChildren ? (
                navItem
              ) : (
                <Link key={item.href} href={item.href}>
                  {navItem}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* System Section */}
      {systemItems.length > 0 && (
        <div>
          <SidebarSectionHeader title="System" />
          <div className="space-y-1">
            {systemItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const filteredChildren = hasChildren
                ? item.children!.filter(child => !child.permission || hasPermission(userPermissions, child.permission))
                : []

              const navItem = (
                <SidebarNavItem
                  key={item.href}
                  title={item.title}
                  icon={<item.icon className="h-5 w-5" />}
                  isActive={pathname === item.href}
                >
                  {filteredChildren.length > 0 && filteredChildren.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <SidebarNavSubItem
                        title={child.title}
                        icon={<child.icon className="h-4 w-4" />}
                        isActive={pathname === child.href}
                      />
                    </Link>
                  ))}
                </SidebarNavItem>
              )

              return hasChildren ? (
                navItem
              ) : (
                <Link key={item.href} href={item.href}>
                  {navItem}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  // User avatar
  const userAvatar = (
    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
      <span className="text-sm font-medium text-white">
        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
      </span>
    </div>
  )

  // Footer content
  const footerContent = (
    <SidebarFooter
      avatar={userAvatar}
      userName={session?.user?.name || session?.user?.email || 'User'}
      userRole={session?.roles?.join(', ') || 'User'}
      actions={
        <SidebarFooterAction
          icon={<LogOut className="h-4 w-4" />}
          label="Sign out"
          onClick={() => signOut()}
        />
      }
    />
  )

  // Top bar content
  const topBarContent = (
    <>
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            EHR Connect Admin
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Welcome, {session?.user?.name || session?.user?.email}
        </div>
      </div>
    </>
  )

  return (
    <Sidebar
      logo={<Activity className="h-8 w-8 text-blue-600" />}
      brandName="EHR Connect"
      search={searchComponent}
      navigation={navigationContent}
      footer={footerContent}
      topBar={topBarContent}
    >
      {children}
    </Sidebar>
  )
}
