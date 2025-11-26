import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

async function ensurePatient() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const patientId = session.patientId

  if (!patientId) {
    return { error: NextResponse.json({ message: 'Patient ID not found' }, { status: 400 }) }
  }

  return { patientId }
}

export async function GET() {
  const auth = await ensurePatient()
  if ('error' in auth) return auth.error

  try {
    const goals = await PatientPortalService.getPatientGoals(auth.patientId)
    return NextResponse.json({ goals })
  } catch (error: any) {
    console.error('Error loading goals:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to load goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await ensurePatient()
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const goal = await PatientPortalService.savePatientGoal(auth.patientId, body)
    return NextResponse.json({ goal }, { status: body?.id ? 200 : 201 })
  } catch (error: any) {
    console.error('Error saving goal:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to save goal' },
      { status: 500 }
    )
  }
}
