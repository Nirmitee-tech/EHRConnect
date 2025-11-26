'use client'

import { useEffect, useState } from 'react'
import { Activity, RefreshCcw, AlertTriangle, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

type FhirIdentifier = {
  value?: string
}

type FhirCoding = {
  display?: string
}

type FhirCodeableConcept = {
  text?: string
  coding?: FhirCoding[]
}

type FhirReference = {
  display?: string
  reference?: string
}

type FhirAnnotation = {
  text?: string
}

type Condition = {
  id?: string
  identifier?: FhirIdentifier[]
  code?: FhirCodeableConcept
  asserter?: FhirReference
  clinicalStatus?: FhirCodeableConcept
  category?: FhirCodeableConcept[]
  severity?: FhirCodeableConcept
  onsetDateTime?: string
  abatementDateTime?: string
  note?: FhirAnnotation[]
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/health-records')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load conditions')
      }

      const data = (await response.json()) as { conditions?: Condition[] }
      setConditions(data.conditions || [])
    } catch (err) {
      console.error('Error loading conditions:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load condition history right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conditions & Diagnoses</h1>
          <p className="text-gray-600">
            Review active and historical diagnoses documented by your care team.
          </p>
        </div>
        <Button variant="outline" onClick={loadConditions} disabled={loading}>
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
      ) : conditions.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conditions documented</h3>
            <p className="text-gray-600">
              Diagnoses and ongoing conditions will appear here once recorded in your chart.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition) => (
            <Card key={condition.id || condition.identifier?.[0]?.value}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                    {condition.code?.text || 'Condition'}
                  </CardTitle>
                  <CardDescription>
                    Managed by{' '}
                    {condition.asserter?.display || condition.asserter?.reference || 'care team'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {condition.clinicalStatus?.text && (
                    <Badge
                      className={`uppercase ${
                        condition.clinicalStatus.text.toLowerCase() === 'active'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {condition.clinicalStatus.text}
                    </Badge>
                  )}
                  {condition.category?.[0]?.text && (
                    <Badge variant="outline">{condition.category[0].text}</Badge>
                  )}
                  {condition.severity?.text && (
                    <Badge variant="outline">{condition.severity.text}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="grid gap-3 sm:grid-cols-2">
                  {condition.onsetDateTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Onset {format(new Date(condition.onsetDateTime), 'MMMM d, yyyy')}
                    </div>
                  )}
                  {condition.abatementDateTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Resolved {format(new Date(condition.abatementDateTime), 'MMMM d, yyyy')}
                    </div>
                  )}
                </div>
                {condition.note?.[0]?.text && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {condition.note[0].text}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
