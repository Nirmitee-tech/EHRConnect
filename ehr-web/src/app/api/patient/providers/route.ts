import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { medplum } from '@/lib/medplum'

type FhirReference = {
  reference?: string
}

type FhirCareTeamParticipant = {
  member?: FhirReference
}

type FhirCareTeam = {
  participant?: FhirCareTeamParticipant[]
}

type FhirPractitioner = Record<string, unknown>

type FhirBundleEntry<Resource> = {
  resource?: Resource
}

type FhirBundle<Resource> = {
  entry?: Array<FhirBundleEntry<Resource>>
}

export async function GET(request: NextRequest) {
  try {
    void request
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

    // Fetch practitioners/providers
    // First, try to get practitioners associated with patient's care team
    const careTeamBundle = (await medplum.search('CareTeam', {
      patient: `Patient/${patientId}`,
      _count: 10,
    })) as FhirBundle<FhirCareTeam>

    const providerIds = new Set<string>()

    // Extract practitioner references from care teams
    careTeamBundle.entry?.forEach((entry) => {
      const careTeam = entry.resource
      careTeam?.participant?.forEach((participant) => {
        const reference = participant.member?.reference
        if (reference?.startsWith('Practitioner/')) {
          providerIds.add(reference)
        }
      })
    })

    // If no care team found, get all active practitioners (for new patients)
    if (providerIds.size === 0) {
      const practitionersBundle = (await medplum.search('Practitioner', {
        active: 'true',
        _count: 50,
      })) as FhirBundle<FhirPractitioner>

      const providers =
        practitionersBundle.entry?.map((entry) => entry.resource).filter(Boolean) ?? []

      return NextResponse.json({ providers })
    }

    // Fetch full practitioner resources
    const providers = await Promise.all(
      Array.from(providerIds).map(async (reference): Promise<FhirPractitioner | null> => {
        try {
          const practitioner = (await medplum.readReference({ reference })) as FhirPractitioner
          // Return the full FHIR resource for maximum flexibility
          return practitioner
        } catch (error) {
          console.error('Error fetching practitioner:', error)
          return null
        }
      })
    )

    const validProviders = providers.filter(
      (provider): provider is FhirPractitioner => provider !== null
    )

    return NextResponse.json({ providers: validProviders })
  } catch (error: unknown) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch providers',
      },
      { status: 500 }
    )
  }
}
