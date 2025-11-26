import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

async function resolveParams(context: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const resolved = await context.params
  const rawId = resolved?.id
  return Array.isArray(rawId) ? rawId[0] : rawId
}

export async function PATCH(
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

    const relatedPersonId = await resolveParams(context)

    if (!relatedPersonId) {
      return NextResponse.json({ message: 'Family record id is required' }, { status: 400 })
    }

    const body = await request.json()

    const updated = await PatientPortalService.updateFamilyMemberAccess(patientId, {
      relatedPersonId,
      active: body.active ?? true,
      notes: body.notes,
    })

    return NextResponse.json({ familyMember: updated })
  } catch (error: any) {
    console.error('Error updating family access:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update caregiver' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const relatedPersonId = await resolveParams(context)

    if (!relatedPersonId) {
      return NextResponse.json({ message: 'Family record id is required' }, { status: 400 })
    }

    const updated = await PatientPortalService.updateFamilyMemberAccess(patientId, {
      relatedPersonId,
      active: false,
      notes: 'Revoked via patient portal',
    })

    return NextResponse.json({ familyMember: updated })
  } catch (error: any) {
    console.error('Error revoking family access:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to revoke caregiver' },
      { status: 500 }
    )
  }
}
