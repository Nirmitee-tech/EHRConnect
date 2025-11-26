'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  Trash2,
  RefreshCcw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { PatientNotification } from '@/services/patient-portal.service'

type NotificationItem = PatientNotification & { read?: boolean }

const ICONS: Record<PatientNotification['type'], typeof Calendar> = {
  appointment: Calendar,
  message: MessageSquare,
  document: FileText,
}

const BADGE_VARIANT: Record<PatientNotification['type'], string> = {
  appointment: 'bg-blue-100 text-blue-700 border-blue-200',
  message: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  document: 'bg-purple-100 text-purple-700 border-purple-200',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/notifications')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load notifications')
      }

      const data = (await response.json()) as { notifications?: PatientNotification[] }
      setNotifications(
        (data.notifications || []).map((item) => ({
          ...item,
          read: false,
        }))
      )
    } catch (err) {
      console.error('Error loading notifications:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load notifications right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay informed about appointments, new documents, and messages from your care team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadNotifications}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={markAllRead} disabled={notifications.length === 0}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
          <Button variant="ghost" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6 flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {unreadCount} unread notifications
            </p>
            <p className="text-xs text-gray-600">
              We&apos;ll send alerts for upcoming appointments, new lab results, secure messages, and more.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Bell className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">
              You&apos;ll receive notifications here as soon as there&apos;s an update from your care team.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type]
            const distance = notification.date
              ? formatDistanceToNow(new Date(notification.date), { addSuffix: true })
              : ''

            return (
              <Card
                key={notification.id}
                className={`border ${
                  notification.read ? 'border-gray-200' : 'border-blue-200'
                } transition-all`}
              >
                <CardContent className="p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge
                          className={`${BADGE_VARIANT[notification.type]} border uppercase`}
                        >
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge className="bg-blue-500 text-white">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {notification.date && <span>{distance}</span>}
                        {notification.status && (
                          <span className="uppercase tracking-wider">{notification.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {notification.link ? (
                      <Button asChild size="sm" variant="default">
                        <Link href={notification.link}>Open</Link>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((item) =>
                            item.id === notification.id ? { ...item, read: !item.read } : item
                          )
                        )
                      }
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {notification.read ? 'Mark unread' : 'Mark read'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
