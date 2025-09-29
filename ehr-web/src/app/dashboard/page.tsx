'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fhirService } from '@/lib/medplum'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [patients, setPatients] = useState<any[]>([])
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.accessToken) {
      loadFHIRData()
    }
  }, [session])

  const loadFHIRData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load some basic FHIR data
      const [patientsResult, practitionersResult] = await Promise.allSettled([
        fhirService.getPatients({ _count: 5 }),
        fhirService.getPractitioners({ _count: 5 })
      ])

      if (patientsResult.status === 'fulfilled') {
        setPatients(patientsResult.value.entry?.map(e => e.resource) || [])
      }

      if (practitionersResult.status === 'fulfilled') {
        setPractitioners(practitionersResult.value.entry?.map(e => e.resource) || [])
      }
    } catch (err) {
      setError('Failed to load FHIR data: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
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
            <Button 
              onClick={() => signIn('keycloak')}
              className="w-full"
            >
              Sign In with Keycloak
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">EHR Connect Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {session.user?.name || session.user?.email}
          </p>
        </div>
        <Button 
          onClick={() => signOut()}
          variant="outline"
        >
          Sign Out
        </Button>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User:</strong> {session.user?.email || 'N/A'}
            </div>
            <div>
              <strong>Roles:</strong> {session.roles?.join(', ') || 'None'}
            </div>
            <div>
              <strong>FHIR User:</strong> {session.fhirUser || 'N/A'}
            </div>
            <div>
              <strong>Has Access Token:</strong> {session.accessToken ? 'Yes' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FHIR Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Patients</CardTitle>
            <Button 
              onClick={loadFHIRData}
              disabled={loading}
              size="sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-600 text-sm mb-4">
                {error}
              </div>
            )}
            
            {patients.length > 0 ? (
              <div className="space-y-2">
                {patients.map((patient, index) => (
                  <div key={patient.id || index} className="border-b pb-2">
                    <div className="font-medium">
                      {patient.name?.[0]?.family || 'Unknown'}, {patient.name?.[0]?.given?.join(' ') || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">
                      DOB: {patient.birthDate || 'N/A'} | Gender: {patient.gender || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No patients found or FHIR server not accessible</p>
            )}
          </CardContent>
        </Card>

        {/* Practitioners */}
        <Card>
          <CardHeader>
            <CardTitle>Available Practitioners</CardTitle>
          </CardHeader>
          <CardContent>
            {practitioners.length > 0 ? (
              <div className="space-y-2">
                {practitioners.map((practitioner, index) => (
                  <div key={practitioner.id || index} className="border-b pb-2">
                    <div className="font-medium">
                      {practitioner.name?.[0]?.family || 'Unknown'}, {practitioner.name?.[0]?.given?.join(' ') || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Specialty: {practitioner.qualification?.[0]?.code?.text || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No practitioners found or FHIR server not accessible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Next.js App: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${session.accessToken ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
              <span>Keycloak Auth: {session.accessToken ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${patients.length > 0 || practitioners.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
              <span>FHIR Server: {patients.length > 0 || practitioners.length > 0 ? 'Connected' : 'Pending'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
