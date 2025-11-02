import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get session for provider authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Provider authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { patientId, email, tempPassword, sendEmail } = body

    if (!patientId || !email || !tempPassword) {
      return NextResponse.json(
        { message: 'Patient ID, email, and password are required' },
        { status: 400 }
      )
    }

    // Call ehr-api to grant portal access
    const response = await fetch(`${API_URL}/api/patient-portal/grant-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session.user.id,
        'x-org-id': session.org_id || '',
      },
      body: JSON.stringify({
        fhirPatientId: patientId,
        email,
        password: tempPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to grant portal access')
    }

    // TODO: Send email if requested
    if (sendEmail) {
      console.log('Email sending not implemented yet. Would send to:', email)
    }

    return NextResponse.json(
      {
        message: 'Portal access granted successfully',
        ...data.data,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error granting portal access:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to grant portal access' },
      { status: 500 }
    )
  }
}
