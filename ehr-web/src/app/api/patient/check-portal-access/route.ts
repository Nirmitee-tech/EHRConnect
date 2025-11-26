import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { message: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Call ehr-api to check portal access
    const response = await fetch(
      `${API_URL}/api/patient-portal/check-access?fhirPatientId=${patientId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to check portal access')
    }

    return NextResponse.json({
      hasAccess: data.hasAccess,
      email: data.email,
      grantedAt: data.grantedAt,
      status: data.status,
    })
  } catch (error: any) {
    console.error('Error checking portal access:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to check portal access' },
      { status: 500 }
    )
  }
}
