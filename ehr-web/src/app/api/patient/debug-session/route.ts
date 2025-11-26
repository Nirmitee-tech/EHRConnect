import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPatientMedplumClient } from '@/lib/medplum-patient'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get patient ID and access token from session
    const patientId = session.patientId
    const accessToken = session.accessToken

    // Test FHIR query for appointments
    let appointmentsTest = null
    if (patientId && accessToken) {
      try {
        // Create authenticated Medplum client
        const medplum = createPatientMedplumClient(accessToken)

        const now = new Date()
        const appointmentsBundle = await medplum.search('Appointment', {
          patient: `Patient/${patientId}`,
          _sort: '-date',
          _count: 10,
        })

        appointmentsTest = {
          query: `patient=Patient/${patientId}`,
          total: appointmentsBundle.total || 0,
          entries: appointmentsBundle.entry?.length || 0,
          appointments: appointmentsBundle.entry?.map((e: any) => ({
            id: e.resource.id,
            status: e.resource.status,
            start: e.resource.start,
          })) || [],
          usingAuthentication: true,
        }
      } catch (error: any) {
        appointmentsTest = {
          error: error.message,
          stack: error.stack,
          usingAuthentication: true,
        }
      }
    } else {
      appointmentsTest = {
        error: 'Missing patientId or accessToken',
        hasPatientId: !!patientId,
        hasAccessToken: !!accessToken,
      }
    }

    return NextResponse.json({
      sessionInfo: {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        patientId: session.patientId,
        userType: session.userType,
        accessToken: session.accessToken ? 'present' : 'missing',
        sessionToken: session.sessionToken ? 'present' : 'missing',
      },
      appointmentsTest,
      fullSession: session,
    })
  } catch (error: any) {
    console.error('Debug session error:', error)
    return NextResponse.json(
      { message: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
