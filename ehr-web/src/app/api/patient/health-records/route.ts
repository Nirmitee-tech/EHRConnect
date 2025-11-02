import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function GET(request: NextRequest) {
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

    const healthRecords = await PatientPortalService.getPatientHealthRecords(patientId)

    return NextResponse.json(healthRecords)
  } catch (error: any) {
    console.error('Error fetching patient health records:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch health records' },
      { status: 500 }
    )
  }
}
