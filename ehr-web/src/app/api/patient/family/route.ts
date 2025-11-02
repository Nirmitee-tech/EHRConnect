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

    const familyMembers = await PatientPortalService.getPatientFamilyMembers(patientId)

    return NextResponse.json({ familyMembers })
  } catch (error: any) {
    console.error('Error fetching patient family access:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch family access data' },
      { status: 500 }
    )
  }
}
