import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const patientId = session.patientId

    if (!patientId) {
      return NextResponse.json({ message: 'Patient ID missing' }, { status: 400 })
    }

    const body = await request.json()

    if (!body?.appointmentId) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 })
    }

    const telehealth = await PatientPortalService.getTelehealthMetadata(
      patientId,
      body.appointmentId
    )

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const response = await fetch(`${apiUrl}/api/virtual-meetings/join/${telehealth.meetingCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: session.user.name || 'Patient',
        userType: 'guest',
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new Error(errorBody?.error || 'Failed to generate telehealth token')
    }

    const joinPayload = await response.json()

    return NextResponse.json({
      ...joinPayload,
      telehealth: {
        meetingCode: telehealth.meetingCode,
        publicLink: telehealth.publicLink,
      },
    })
  } catch (error: any) {
    console.error('Error preparing telehealth session:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to join telehealth visit' },
      { status: 500 }
    )
  }
}
