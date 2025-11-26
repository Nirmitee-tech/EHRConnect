import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService, PatientPreferences } from '@/services/patient-portal.service'

async function requirePatientSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!session.patientId) {
    throw new Error('Patient ID not found')
  }

  return session.patientId as string
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!session.patientId) {
      return NextResponse.json({ message: 'Patient ID not found' }, { status: 400 })
    }

    const patientId = session.patientId as string

    const [patient, preferences] = await Promise.all([
      PatientPortalService.getPatientById(patientId),
      PatientPortalService.getPatientPreferences(patientId),
    ])

    return NextResponse.json({
      patient,
      preferences,
      orgId: session.org_id, // Include org_id from session
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Patient ID not found') {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    console.error('Error fetching patient profile:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const patientId = await requirePatientSession()
    const body = await request.json()

    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      preferences,
    }: {
      firstName?: string
      lastName?: string
      phone?: string
      email?: string
      address?: {
        line: string[]
        city?: string
        state?: string
        postalCode?: string
        country?: string
      }
      preferences?: Partial<PatientPreferences>
    } = body

    const profileUpdates: Record<string, unknown> = {}

    if (typeof firstName === 'string') {
      profileUpdates.firstName = firstName
    }
    if (typeof lastName === 'string') {
      profileUpdates.lastName = lastName
    }
    if (typeof phone === 'string') {
      profileUpdates.phone = phone
    }
    if (typeof email === 'string') {
      profileUpdates.email = email
    }
    if (address && Array.isArray(address.line)) {
      profileUpdates.address = address
    }

    if (Object.keys(profileUpdates).length > 0) {
      await PatientPortalService.updatePatientProfile(patientId, profileUpdates as any)
    }

    if (preferences && Object.keys(preferences).length > 0) {
      const currentPreferences = await PatientPortalService.getPatientPreferences(patientId)
      await PatientPortalService.updatePatientPreferences(patientId, {
        ...currentPreferences,
        ...preferences,
      })
    }

    const [patient, updatedPreferences] = await Promise.all([
      PatientPortalService.getPatientById(patientId),
      PatientPortalService.getPatientPreferences(patientId),
    ])

    return NextResponse.json({ patient, preferences: updatedPreferences })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Patient ID not found') {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    console.error('Error updating patient profile:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}
