'use client'

import { useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { AlertTriangle, ArrowUpRight, Loader2, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardDataMode, DashboardSection, DashboardSnapshotPayload, DashboardSummaryMetric } from '@/types/dashboard'
import { getDemoDashboard } from '@/data/dashboard-demo'

const TIME_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '60d', label: 'Last 60 days' },
  { value: 'qtd', label: 'Quarter to date' },
  { value: 'ytd', label: 'Year to date' }
]

type LocationOption = { id: string; name: string }

type RoleLevel = 'executive' | 'clinical' | 'operations' | 'billing' | 'patient' | 'general'

function deriveRoleLevel(session: ReturnType<typeof useSession>['data']): RoleLevel {
  const roles = (session?.roles || []).map(role => role.toUpperCase())
  const permissions = (session?.permissions || []).map(permission => permission.toLowerCase())

  if (roles.some(role => ['PLATFORM_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'SUPER ADMINISTRATOR', 'ADMINISTRATOR'].includes(role))) {
    return 'executive'
  }

  if (roles.some(role => ['CLINICIAN', 'PRACTITIONER', 'PROVIDER', 'PHYSICIAN', 'NURSE'].includes(role))) {
    return 'clinical'
  }

  if (roles.some(role => ['FRONT_DESK', 'RECEPTIONIST', 'OPERATIONS', 'CARE_COORDINATOR'].includes(role))) {
    return 'operations'
  }

  if (roles.some(role => ['BILLING', 'FINANCE', 'RCM', 'REVENUE', 'ACCOUNTING'].includes(role))) {
    return 'billing'
  }

  if (roles.some(role => ['PATIENT', 'MEMBER', 'PORTAL_USER'].includes(role))) {
    return 'patient'
  }

  if (permissions.some(permission => permission.startsWith('billing') || permission.includes('payments'))) {
    return 'billing'
  }

  if (permissions.some(permission => permission.startsWith('appointments') || permission.startsWith('patients'))) {
    return 'clinical'
  }

  return 'general'
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDateRange(range: string) {
  const end = new Date()
  const start = new Date(end)

  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '14d':
      start.setDate(end.getDate() - 14)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '60d':
      start.setDate(end.getDate() - 60)
      break
    case 'qtd': {
      const month = end.getMonth()
      const quarterStartMonth = Math.floor(month / 3) * 3
      start.setMonth(quarterStartMonth, 1)
      start.setHours(0, 0, 0, 0)
      break
    }
    case 'ytd':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
    default:
      start.setDate(end.getDate() - 30)
  }

  return {
    start: formatDate(start),
    end: formatDate(end)
  }
}

function getStatusStyles(status?: string) {
  switch (status) {
    case 'positive':
    case 'on_track':
    case 'trending_up':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'warning':
    case 'needs_attention':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100'
  }
}

function getRowStatusClass(status?: string) {
  switch (status) {
    case 'positive':
      return 'bg-emerald-50/60'
    case 'warning':
    case 'needs_attention':
      return 'bg-amber-50/60'
    default:
      return ''
  }
}

function formatMetricValue(metric: DashboardSummaryMetric) {
  if (metric.displayValue) {
    return metric.displayValue
  }
  if (typeof metric.value === 'number') {
    if (metric.value % 1 === 0) {
      return metric.value.toLocaleString()
    }
    return metric.value.toFixed(2)
  }
  return '—'
}

function getMetricChangeDisplay(metric: DashboardSummaryMetric) {
  if (metric.changeDisplay) {
    return metric.changeDisplay
  }

  if (metric.change === undefined || metric.change === null) {
    return null
  }

  const absolute = Math.abs(metric.change)
  const formatted = absolute >= 100 ? absolute.toFixed(0) : absolute.toFixed(absolute < 10 ? 1 : 0)
  return `${formatted}%`
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardSnapshotPayload | null>(null)
  const [dataMode, setDataMode] = useState<DashboardDataMode>('actual')
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [availableLocations, setAvailableLocations] = useState<LocationOption[]>([])

  const roleLevel = useMemo(() => deriveRoleLevel(session), [session])
  const orgId = (session as any)?.org_id as string | undefined

  useEffect(() => {
    if (session?.accessToken) {
      if (!orgId) {
        window.location.href = '/onboarding'
        return
      }
      checkOnboardingStatus(orgId)
    }
  }, [session, orgId])

  useEffect(() => {
    if (!session || checkingOnboarding) {
      return
    }
    loadDashboard(dataMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, dataMode, timeRange, selectedLocation, roleLevel, checkingOnboarding])

  const checkOnboardingStatus = async (organizationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${organizationId}/onboarding-status`
      )

      if (response.ok) {
        const data = await response.json()
        if (!data.onboarding_completed) {
          window.location.href = '/onboarding'
          return
        }
      }

      setCheckingOnboarding(false)
    } catch (err) {
      console.error('Error checking onboarding status:', err)
      setCheckingOnboarding(false)
    }
  }

  const loadDashboard = async (mode: DashboardDataMode) => {
    if (!session) {
      return
    }

    setLoadingDashboard(true)
    setError(null)

    try {
      const { start, end } = getDateRange(timeRange)
      const params = new URLSearchParams({
        roleLevel,
        dataMode: mode,
        from: start,
        to: end
      })

      if (orgId) {
        params.set('orgId', orgId)
      }
      if (selectedLocation !== 'all' && selectedLocation) {
        params.set('locationId', selectedLocation)
      }

      const headers = new Headers()
      headers.set('Content-Type', 'application/json')
      if (session.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`)
      }
      if (orgId) {
        headers.set('x-org-id', orgId)
      }
      if (session.userId) {
        headers.set('x-user-id', session.userId)
      }
      if (session.roles) {
        headers.set('x-user-roles', JSON.stringify(session.roles))
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/overview?${params.toString()}`,
        {
          method: 'GET',
          headers
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to load dashboard metrics: ${response.status}`)
      }

      const payload = (await response.json()) as DashboardSnapshotPayload & {
        filters?: { availableLocations?: LocationOption[] }
      }

      setDashboardData(payload)

      const locations = payload.filters?.availableLocations || []
      setAvailableLocations(locations)

      if (selectedLocation !== 'all' && locations.length > 0 && !locations.some(location => location.id === selectedLocation)) {
        setSelectedLocation('all')
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError('Unable to load live metrics. Displaying demo insights so work can continue.')
      const fallback = getDemoDashboard(roleLevel)
      setDashboardData({
        ...fallback,
        meta: {
          ...fallback.meta,
          fallbackUsed: true,
          fallbackReasons: ['client_fallback']
        }
      })
      setAvailableLocations([])
    } finally {
      setLoadingDashboard(false)
    }
  }

  const handleModeToggle = (mode: DashboardDataMode) => {
    if (mode === dataMode) {
      return
    }
    setDataMode(mode)
  }

  if (status === 'loading' || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>EHR Connect - Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Please sign in to access the EHR system.
            </p>
            <Button onClick={() => signIn('keycloak')} className="w-full">
              Sign In with Keycloak
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const meta = dashboardData?.meta
  const summary = dashboardData?.summary || []
  const sections = dashboardData?.sections || []
  const insights = dashboardData?.insights || []

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{meta?.title || 'Organization Dashboard'}</h1>
          <p className="text-gray-600">
            {meta?.description || 'Actionable insights tailored to your responsibilities.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome, {session.user?.name || session.user?.email}{' '}
            {orgId ? `· Org ID: ${orgId}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex items-center gap-2">
            <Button
              variant={dataMode === 'actual' ? 'default' : 'outline'}
              onClick={() => handleModeToggle('actual')}
              size="sm"
            >
              Actual Data
            </Button>
            <Button
              variant={dataMode === 'demo' ? 'default' : 'outline'}
              onClick={() => handleModeToggle('demo')}
              size="sm"
            >
              Demo Data
            </Button>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-medium">Role Lens:</span>
              <span className="capitalize">{roleLevel}</span>
            </div>
            {meta?.period?.start && meta?.period?.end && (
              <div>
                Period: {meta.period.start} → {meta.period.end}
              </div>
            )}
            {meta?.fallbackUsed && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Using fallback snapshot
              </div>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 py-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Time Range</label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={timeRange}
              onChange={event => setTimeRange(event.target.value)}
            >
              {TIME_RANGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Location</label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedLocation}
              onChange={event => setSelectedLocation(event.target.value)}
            >
              <option value="all">All Locations</option>
              {availableLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">{error}</p>
              <p className="text-xs text-amber-700">
                Toggle back to “Actual Data” once integrations are ready to stream live metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summary.map(metric => {
            const changeDisplay = getMetricChangeDisplay(metric)
            const showSign = !metric.changeDisplay && metric.changeDirection

            return (
              <Card key={metric.id} className="border border-slate-100">
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight">
                      {formatMetricValue(metric)}
                    </p>
                    {changeDisplay && (
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        {metric.changeDirection === 'down' ? (
                          <ArrowUpRight className="h-3 w-3 rotate-180 text-rose-500" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        )}
                        <span className={metric.changeDirection === 'down' ? 'text-rose-600' : 'text-emerald-600'}>
                          {showSign ? (metric.changeDirection === 'down' ? '-' : '+') : ''}
                          {changeDisplay}
                        </span>
                        {metric.changeLabel && (
                          <span className="text-muted-foreground">{metric.changeLabel}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {metric.status && (
                    <span className={`inline-flex w-fit items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusStyles(metric.status)}`}>
                      {metric.status.replace('_', ' ')}
                    </span>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {loadingDashboard && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating dashboard...
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {sections.map(section => (
            <DashboardSectionCard key={section.id} section={section} loading={loadingDashboard} />
          ))}
        </div>
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground">No insights available for this selection yet.</p>
              )}
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className={`rounded-lg border p-4 text-sm ${getStatusStyles(insight.severity)}`}
                >
                  <p className="font-medium text-slate-900">{insight.title}</p>
                  <p className="mt-1 text-slate-700">{insight.body}</p>
                  {insight.recommendedAction && (
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-600">
                      Recommended: {insight.recommendedAction}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}

function DashboardSectionCard({ section, loading }: { section: DashboardSection; loading: boolean }) {
  return (
    <Card className="border border-slate-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
        {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {section.type === 'table' && section.table && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {section.table.columns.map(column => (
                    <th key={column.key} className="px-3 py-2 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {section.table.rows.map((row, index) => (
                  <tr
                    key={`${section.id}-${index}`}
                    className={`transition-colors hover:bg-slate-50/60 ${getRowStatusClass(row.status as string)}`}
                  >
                    {section.table?.columns.map(column => (
                      <td key={column.key} className="px-3 py-2 text-sm text-slate-700">
                        {row[column.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section.type === 'worklist' && section.items && (
          <ul className="space-y-3 text-sm">
            {section.items.map((item, index) => (
              <li key={`${section.id}-item-${index}`} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.due && (
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.due}</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {item.impact && <span>Impact: {item.impact}</span>}
                  {item.owner && <span>Owner: {item.owner}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}

        {section.type === 'actions' && section.actions && (
          <div className="flex flex-wrap gap-2">
            {section.actions.map((action, index) => (
              <Button
                key={`${section.id}-action-${index}`}
                variant={action.variant === 'primary' ? 'default' : action.variant === 'ghost' ? 'ghost' : 'outline'}
                size="sm"
                asChild={!!action.href}
              >
                {action.href ? <a href={action.href}>{action.label}</a> : <span>{action.label}</span>}
              </Button>
            ))}
          </div>
        )}

        {section.type === 'metrics' && section.metrics && (
          <div className="grid gap-3 md:grid-cols-2">
            {section.metrics.map(metric => (
              <div key={`${section.id}-${metric.id}`} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-semibold">{formatMetricValue(metric)}</p>
              </div>
            ))}
          </div>
        )}

        {section.actions && section.actions.length > 0 && section.type !== 'actions' && (
          <div className="flex flex-wrap gap-2 pt-2">
            {section.actions.map((action, index) => (
              <Button
                key={`${section.id}-inline-${index}`}
                variant={action.variant === 'primary' ? 'default' : action.variant === 'ghost' ? 'ghost' : 'outline'}
                size="sm"
                asChild={!!action.href}
              >
                {action.href ? <a href={action.href}>{action.label}</a> : <span>{action.label}</span>}
              </Button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Refreshing data…
          </div>
        )}
      </CardContent>
    </Card>
  )
}
