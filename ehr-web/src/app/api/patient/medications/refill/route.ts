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

    const payload = await request.json()

    const task = await PatientPortalService.requestMedicationRefill(patientId, payload)

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    console.error('Error submitting refill request:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to submit refill request' },
      { status: 500 }
    )
  }
}
