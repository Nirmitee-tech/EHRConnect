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
    const { recipientId, subject, message } = body

    if (!recipientId || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const communication = await PatientPortalService.sendMessage(
      patientId,
      recipientId,
      subject || 'Message from patient',
      message
    )

    return NextResponse.json(communication)
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
