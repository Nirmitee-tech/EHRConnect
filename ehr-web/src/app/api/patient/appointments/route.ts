import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPatientMedplumClient } from '@/lib/medplum-patient'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get patient ID and access token from session
    const patientId = session.patientId
    const accessToken = session.accessToken

    if (!patientId) {
      return NextResponse.json(
        { message: 'Patient ID not found' },
        { status: 400 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Access token not found' },
        { status: 401 }
      )
    }

    // Get filter from query params
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'upcoming'

    // Build FHIR search parameters based on filter
    const now = new Date()
    const fhirSearchParams: any = {
      patient: `Patient/${patientId}`,
      _sort: '-date',
      _count: 50,
    }

    switch (filter) {
      case 'upcoming':
        fhirSearchParams.status = 'booked,pending,arrived,checked-in'
        fhirSearchParams.date = `ge${now.toISOString().split('T')[0]}`
        break
      case 'past':
        fhirSearchParams.status = 'fulfilled,cancelled,noshow'
        fhirSearchParams.date = `le${now.toISOString().split('T')[0]}`
        break
      case 'all':
        // No date or status filter
        break
      default:
        // Support custom status filter
        fhirSearchParams.status = filter
    }

    console.log('Searching appointments with params:', fhirSearchParams)
    console.log('Patient ID:', patientId)
    console.log('Access token present:', !!accessToken)

    // Query FHIR via ehr-api which handles authentication properly
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // Build query string
    const queryParams = new URLSearchParams(fhirSearchParams as Record<string, string>)
    const fhirUrl = `${apiUrl}/fhir/R4/Appointment?${queryParams.toString()}`

    console.log('Querying FHIR URL:', fhirUrl)

    const response = await fetch(fhirUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('FHIR query failed:', response.status, errorText)
      throw new Error(`FHIR query failed: ${response.statusText}`)
    }

    const bundle = await response.json()

    console.log('FHIR Response - Total:', bundle.total || 0)
    console.log('FHIR Response - Entries:', bundle.entry?.length || 0)

    const appointments = bundle.entry?.map((e: any) => e.resource) || []

    console.log('Returning appointments:', appointments.length)

    // Return in the format the page expects: { appointments: [...] }
    return NextResponse.json({ appointments })
  } catch (error: any) {
    console.error('Error fetching patient appointments:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
