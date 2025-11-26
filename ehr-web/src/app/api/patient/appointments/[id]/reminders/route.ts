import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[] | undefined>> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const patientId = session.patientId

    if (!patientId) {
      return NextResponse.json({ message: 'Patient session missing' }, { status: 400 })
    }

    const resolvedParams = await context.params
    const rawAppointmentId = resolvedParams?.id
    const appointmentId = Array.isArray(rawAppointmentId) ? rawAppointmentId[0] : rawAppointmentId

    if (!appointmentId) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 })
    }

    const payload = await request.json()

    const reminder = await PatientPortalService.scheduleAppointmentReminder(patientId, {
      ...payload,
      appointmentId,
    })

    return NextResponse.json(reminder)
  } catch (error: any) {
    console.error('Error scheduling reminder:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to schedule reminder' },
      { status: 500 }
    )
  }
}
