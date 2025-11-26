import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const patientId = session.patientId

    if (!patientId) {
      return NextResponse.json({ message: 'Patient ID not found' }, { status: 400 })
    }

    const summary = await PatientPortalService.getPatientBillingSummary(patientId)

    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('Error fetching patient billing data:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}
