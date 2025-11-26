import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get patient ID from session
    const patientId = session.patientId

    if (!patientId) {
      return NextResponse.json(
        { message: 'Patient ID not found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { practitionerId, serviceType, start, end, reason } = body

    if (!practitionerId || !serviceType || !start || !end) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const appointment = await PatientPortalService.bookAppointment(patientId, {
      practitionerId,
      serviceType,
      start,
      end,
      reason,
    })

    return NextResponse.json(appointment)
  } catch (error: any) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to book appointment' },
      { status: 500 }
    )
  }
}
