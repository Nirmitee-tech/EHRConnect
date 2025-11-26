'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCcw, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type FhirIdentifier = {
  value?: string
}

type FhirCoding = {
  code?: string
  display?: string
}

type CodeableConcept = {
  text?: string
  coding?: FhirCoding[]
}

type FhirReference = {
  display?: string
  reference?: string
}

type AllergyReaction = {
  severity?: string
  manifestation?: Array<CodeableConcept | undefined>
}

type AllergyNote = {
  text?: string
}

type AllergyIntolerance = {
  id?: string
  identifier?: FhirIdentifier[]
  code?: CodeableConcept
  recorder?: FhirReference
  verificationStatus?: CodeableConcept
  reaction?: AllergyReaction[]
  criticality?: string
  category?: string[]
  note?: AllergyNote[]
}

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<AllergyIntolerance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllergies()
  }, [])

  const loadAllergies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/health-records')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load allergies')
      }

      const data = (await response.json()) as { allergies?: AllergyIntolerance[] }
      setAllergies(data.allergies || [])
    } catch (err) {
      console.error('Error loading allergies:', err)
      const message = err instanceof Error ? err.message : 'Unable to load allergies right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Allergies & Sensitivities</h1>
          <p className="text-gray-600">
            These allergies help your care team avoid reactions with medications or treatments.
          </p>
        </div>
        <Button variant="outline" onClick={loadAllergies} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Important safety information</p>
            <p className="text-sm text-gray-700">
              Always inform your care team if you notice new allergies or reactions. Severe allergies
              are highlighted in red.
            </p>
          </div>
        </CardContent>
      </Card>

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
      ) : allergies.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No allergies on record</h3>
            <p className="text-gray-600">
              Let your providers know if you have known allergies so they can add them to your record.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allergies.map((allergy) => {
            const severity = allergy.reaction?.[0]?.severity || allergy.criticality
            const isSevere =
              severity === 'severe' || allergy.criticality === 'high' || allergy.category?.includes('medication')

            return (
              <Card
                key={allergy.id || allergy.identifier?.[0]?.value}
                className={isSevere ? 'border-red-200 bg-red-50/40' : ''}
              >
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldAlert className={`w-5 h-5 ${isSevere ? 'text-red-600' : 'text-amber-600'}`} />
                      {allergy.code?.text || 'Allergy'}
                    </CardTitle>
                    <CardDescription>
                      Noted by{' '}
                      {allergy.recorder?.display || allergy.recorder?.reference || 'care team'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {allergy.verificationStatus?.text && (
                      <Badge variant="outline">{allergy.verificationStatus.text}</Badge>
                    )}
                    {severity && (
                      <Badge
                        className={`uppercase ${
                          isSevere
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {severity}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  {allergy.reaction?.[0]?.manifestation?.length ? (
                    <div>
                      <p className="font-semibold text-gray-900">Reactions</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        {allergy.reaction[0].manifestation.map(
                          (item: CodeableConcept | undefined, index: number) =>
                            item?.text ? <li key={index}>{item.text}</li> : null
                        )}
                      </ul>
                    </div>
                  ) : null}
                  {allergy.note?.[0]?.text && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 flex gap-2">
                      <Info className="w-4 h-4 text-gray-500 mt-1" />
                      <p>{allergy.note[0].text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
