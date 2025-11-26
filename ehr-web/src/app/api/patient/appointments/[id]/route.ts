import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type AppointmentParticipant = {
  actor?: {
    reference?: string
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Record<string, string | string[] | undefined>> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const resolvedParams = await context.params
    const rawAppointmentId = resolvedParams?.id
    const appointmentId = Array.isArray(rawAppointmentId)
      ? rawAppointmentId[0]
      : rawAppointmentId

    if (!appointmentId) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const fhirUrl = `${apiUrl}/fhir/R4/Appointment/${encodeURIComponent(appointmentId)}`

    const response = await fetch(fhirUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
      },
      cache: 'no-store',
    })

    if (response.status === 404) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch appointment:', response.status, errorText)
      return NextResponse.json(
        { message: 'Failed to fetch appointment' },
        { status: response.status }
      )
    }

    const appointment = await response.json()

    const hasPatientAccess = Array.isArray(appointment.participant)
      && appointment.participant.some(
        (participant: AppointmentParticipant) =>
          participant.actor?.reference === `Patient/${patientId}` ||
          participant.actor?.reference === patientId
      )

    if (!hasPatientAccess) {
      return NextResponse.json(
        { message: 'Appointment does not belong to the authenticated patient' },
        { status: 403 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error: unknown) {
    console.error('Error fetching appointment details:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch appointment details',
      },
      { status: 500 }
    )
  }
}
