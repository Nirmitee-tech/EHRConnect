import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type GrantPortalAccessPayload = {
  patientId?: string
  email?: string
  tempPassword?: string
  sendEmail?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Provider authentication required' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as GrantPortalAccessPayload
    const { patientId, email, tempPassword, sendEmail } = body

    if (!patientId || !email || !tempPassword) {
      return NextResponse.json(
        { message: 'Patient ID, email, and password are required' },
        { status: 400 }
      )
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      'x-org-id': session.org_id ?? '',
    })

    if (session.user.id) {
      headers.set('x-user-id', session.user.id)
    }

    const response = await fetch(`${API_URL}/api/patient-portal/grant-access`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fhirPatientId: patientId,
        email,
        password: tempPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to grant portal access')
    }

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
  } catch (error: unknown) {
    console.error('Error granting portal access:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to grant portal access',
      },
      { status: 500 }
    )
  }
}
