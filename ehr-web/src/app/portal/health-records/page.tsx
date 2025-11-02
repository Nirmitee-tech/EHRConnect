'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  FileText,
  Pill,
  Activity,
  Heart,
  Shield,
  Syringe,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Download,
  Share2,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HealthRecordsPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHealthRecords()
  }, [])

  const fetchHealthRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patient/health-records')
      if (!response.ok) throw new Error('Failed to fetch health records')
      const data = await response.json()
      setHealthData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600 mt-1">View and manage your medical information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {healthData?.medications?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Allergies</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {healthData?.allergies?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conditions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {healthData?.conditions?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Immunizations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {healthData?.immunizations?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Syringe className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="medications" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
        </TabsList>

        {/* Medications Tab */}
        <TabsContent value="medications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Medications</CardTitle>
              <CardDescription>Your current prescriptions and medications</CardDescription>
            </CardHeader>
            <CardContent>
              {healthData?.medications && healthData.medications.length > 0 ? (
                <div className="space-y-4">
                  {healthData.medications.map((med: any, idx: number) => (
                    <div
                      key={med.id || idx}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {med.medicationCodeableConcept?.text ||
                                med.medicationReference?.display ||
                                'Medication'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {med.dosageInstruction?.[0]?.text || 'As directed by physician'}
                            </p>
                          </div>
                          <Badge
                            variant={med.status === 'active' ? 'default' : 'secondary'}
                            className="ml-4"
                          >
                            {med.status || 'Active'}
                          </Badge>
                        </div>
                        {med.authoredOn && (
                          <p className="text-xs text-gray-500">
                            Prescribed: {format(new Date(med.authoredOn), 'MMM d, yyyy')}
                          </p>
                        )}
                        {med.dosageInstruction?.[0]?.timing && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {med.dosageInstruction[0].timing.repeat && (
                              <Badge variant="outline" className="text-xs">
                                {med.dosageInstruction[0].timing.repeat.frequency}x per{' '}
                                {med.dosageInstruction[0].timing.repeat.period}{' '}
                                {med.dosageInstruction[0].timing.repeat.periodUnit}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Pill}
                  title="No Medications"
                  description="You don't have any medications recorded"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Known Allergies</CardTitle>
              <CardDescription>Allergies and intolerances you should be aware of</CardDescription>
            </CardHeader>
            <CardContent>
              {healthData?.allergies && healthData.allergies.length > 0 ? (
                <div className="space-y-4">
                  {healthData.allergies.map((allergy: any, idx: number) => (
                    <Alert
                      key={allergy.id || idx}
                      className="border-amber-200 bg-amber-50"
                    >
                      <Shield className="h-5 w-5 text-amber-600" />
                      <div className="ml-2">
                        <h3 className="font-semibold text-amber-900">
                          {allergy.code?.text || 'Unknown Allergen'}
                        </h3>
                        <AlertDescription className="text-amber-800">
                          <div className="flex flex-wrap gap-4 mt-2">
                            <div>
                              <span className="text-sm font-medium">Severity: </span>
                              <Badge
                                variant={
                                  allergy.criticality === 'high' ? 'destructive' : 'secondary'
                                }
                              >
                                {allergy.criticality || 'Unknown'}
                              </Badge>
                            </div>
                            {allergy.reaction?.[0]?.manifestation && (
                              <div>
                                <span className="text-sm font-medium">Reaction: </span>
                                <span className="text-sm">
                                  {allergy.reaction[0].manifestation[0].text}
                                </span>
                              </div>
                            )}
                          </div>
                          {allergy.recordedDate && (
                            <p className="text-xs mt-2">
                              Recorded: {format(new Date(allergy.recordedDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Shield}
                  title="No Known Allergies"
                  description="You don't have any allergies recorded"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Conditions</CardTitle>
              <CardDescription>Active and past health conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {healthData?.conditions && healthData.conditions.length > 0 ? (
                <div className="space-y-4">
                  {healthData.conditions.map((condition: any, idx: number) => (
                    <div
                      key={condition.id || idx}
                      className="p-4 border rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {condition.code?.text || 'Condition'}
                          </h3>
                          {condition.severity && (
                            <p className="text-sm text-gray-600">
                              Severity: {condition.severity.text}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            condition.clinicalStatus?.coding?.[0]?.code === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {condition.clinicalStatus?.coding?.[0]?.code || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        {condition.onsetDateTime && (
                          <span>Onset: {format(new Date(condition.onsetDateTime), 'MMM yyyy')}</span>
                        )}
                        {condition.recordedDate && (
                          <span>Recorded: {format(new Date(condition.recordedDate), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No Conditions"
                  description="You don't have any conditions recorded"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value="vitals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Your recent vital sign measurements</CardDescription>
            </CardHeader>
            <CardContent>
              {healthData?.observations && healthData.observations.length > 0 ? (
                <div className="space-y-6">
                  {/* Group vitals by type */}
                  {Object.entries(
                    healthData.observations.reduce((acc: any, obs: any) => {
                      const type = obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown'
                      if (!acc[type]) acc[type] = []
                      acc[type].push(obs)
                      return acc
                    }, {})
                  ).map(([type, observations]: [string, any]) => (
                    <div key={type} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">{type}</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {observations.slice(0, 6).map((obs: any, idx: number) => (
                          <div key={obs.id || idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {obs.valueQuantity?.value}
                              </span>
                              <span className="text-sm text-gray-600">
                                {obs.valueQuantity?.unit}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {obs.effectiveDateTime &&
                                format(new Date(obs.effectiveDateTime), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No Vital Signs"
                  description="You don't have any vital signs recorded"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Immunizations Tab */}
        <TabsContent value="immunizations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Immunization History</CardTitle>
              <CardDescription>Your vaccination records</CardDescription>
            </CardHeader>
            <CardContent>
              {healthData?.immunizations && healthData.immunizations.length > 0 ? (
                <div className="space-y-4">
                  {healthData.immunizations.map((immunization: any, idx: number) => (
                    <div
                      key={immunization.id || idx}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Syringe className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {immunization.vaccineCode?.text || 'Vaccine'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {immunization.occurrenceDateTime && (
                            <span>
                              Date: {format(new Date(immunization.occurrenceDateTime), 'MMM d, yyyy')}
                            </span>
                          )}
                          {immunization.lotNumber && (
                            <span>Lot: {immunization.lotNumber}</span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={immunization.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {immunization.status || 'Completed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Syringe}
                  title="No Immunizations"
                  description="You don't have any immunizations recorded"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="labs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Results</CardTitle>
              <CardDescription>Your recent lab test results</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileText}
                title="No Lab Results"
                description="You don't have any lab results available yet"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-12 w-64" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
