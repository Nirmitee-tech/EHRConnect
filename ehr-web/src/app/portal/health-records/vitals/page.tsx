'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  HeartPulse,
  Thermometer,
  Activity,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { Observation, ObservationComponent } from '@medplum/fhirtypes'

export default function VitalSignsPage() {
  const [vitals, setVitals] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVitals()
  }, [])

  const loadVitals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/health-records')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load vital signs')
      }

      const data = (await response.json()) as { observations?: Observation[] }
      setVitals(data.observations || [])
    } catch (err) {
      console.error('Error loading vital signs:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load vital signs right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const latestVitals = useMemo(() => {
    const map = new Map<string, Observation>()
    vitals.forEach((observation) => {
      const code = observation.code?.text || observation.code?.coding?.[0]?.code
      const effectiveDate = observation.effectiveDateTime
      if (!code || !effectiveDate) return

      if (!map.has(code) || new Date(effectiveDate) > new Date(map.get(code).effectiveDateTime)) {
        map.set(code, observation)
      }
    })
    return Array.from(map.values())
  }, [vitals])

  const renderValue = (observation: Observation) => {
    const valueQuantity = observation.valueQuantity
    if (valueQuantity) {
      return `${valueQuantity.value} ${valueQuantity.unit}`
    }

    if (observation.component) {
      return observation.component
        .map(
          (component: ObservationComponent | undefined) =>
            component?.code?.text && component.valueQuantity
              ? `${component.code.text}: ${component.valueQuantity.value ?? ''} ${
                  component.valueQuantity.unit ?? ''
                }`
              : null
        )
        .filter(Boolean)
        .join(' · ')
    }

    return 'Not available'
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vital Signs</h1>
          <p className="text-gray-600">
            Track recent measurements recorded during visits including blood pressure, heart rate, and temperature.
          </p>
        </div>
        <Button variant="outline" onClick={loadVitals} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : vitals.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <HeartPulse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No vital signs recorded</h3>
            <p className="text-gray-600">
              Vital sign readings will appear here after your care team records them during visits.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Latest measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {latestVitals.map((observation) => (
                <div
                  key={observation.id || observation.identifier?.[0]?.value}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {observation.code?.text || 'Observation'}
                    </p>
                    <Badge variant="outline">
                      {observation.effectiveDateTime
                        ? format(new Date(observation.effectiveDateTime), 'MMM d')
                        : 'Recent'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{renderValue(observation)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {vitals.map((observation) => (
              <Card key={observation.id || observation.identifier?.[0]?.value}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {observation.code?.text?.toLowerCase().includes('temperature') ? (
                        <Thermometer className="w-5 h-5 text-orange-600" />
                      ) : observation.code?.text?.toLowerCase().includes('pressure') ? (
                        <Activity className="w-5 h-5 text-purple-600" />
                      ) : (
                        <HeartPulse className="w-5 h-5 text-rose-600" />
                      )}
                      {observation.code?.text || 'Vital sign'}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Recorded{' '}
                      {observation.effectiveDateTime
                        ? format(new Date(observation.effectiveDateTime), 'MMMM d, yyyy h:mma')
                        : 'recently'}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {observation.status ? observation.status.toUpperCase() : 'RECORDED'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {renderValue(observation)}
                  </div>
                  {observation.note?.[0]?.text && (
                    <p className="text-xs text-gray-500">Note: {observation.note[0].text}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
