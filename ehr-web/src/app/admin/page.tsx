'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hasPermission } from '@/types/rbac'
import {
  Users,
  Hospital,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalPatients: number
  todayAppointments: number
  pendingRecords: number
  systemHealth: 'healthy' | 'warning' | 'error'
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPatients: 0,
    todayAppointments: 0,
    pendingRecords: 0,
    systemHealth: 'healthy'
  })
  const [loading, setLoading] = useState(true)

  const userPermissions = session?.permissions || []

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // In a real app, this would fetch from your APIs
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalUsers: 24,
          totalPatients: 1247,
          todayAppointments: 18,
          pendingRecords: 3,
          systemHealth: 'healthy'
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      permission: 'users:read',
      href: '/admin/users'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: Hospital,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      permission: 'patients:read',
      href: '/admin/patients'
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments.toLocaleString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      permission: 'appointments:read',
      href: '/admin/appointments'
    },
    {
      title: 'Pending Records',
      value: stats.pendingRecords.toLocaleString(),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      permission: 'records:read',
      href: '/admin/records'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'user_created',
      message: 'New user Dr. Sarah Johnson was created',
      time: '2 minutes ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'appointment_scheduled',
      message: 'Appointment scheduled for John Doe',
      time: '15 minutes ago',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'record_updated',
      message: 'Medical record updated for Patient ID: 12345',
      time: '1 hour ago',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'system_alert',
      message: 'System backup completed successfully',
      time: '2 hours ago',
      icon: Activity,
      color: 'text-gray-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {session?.user?.name || session?.user?.email}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => {
          const canView = !card.permission || hasPermission(userPermissions, card.permission)
          const Icon = card.icon

          if (!canView) return null

          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FHIR Server</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authentication</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Server</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" size="sm" className="w-full">
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {hasPermission(userPermissions, 'users:create') && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hasPermission(userPermissions, 'users:create') && (
                <Button className="h-12">
                  <Users className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
              {hasPermission(userPermissions, 'patients:create') && (
                <Button variant="outline" className="h-12">
                  <Hospital className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              )}
              {hasPermission(userPermissions, 'appointments:create') && (
                <Button variant="outline" className="h-12">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              )}
              {hasPermission(userPermissions, 'system:settings') && (
                <Button variant="outline" className="h-12">
                  <Activity className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
