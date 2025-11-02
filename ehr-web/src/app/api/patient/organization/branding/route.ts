import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { medplum } from '@/lib/medplum'
import type { Organization, Patient } from '@medplum/fhirtypes'

const DEFAULT_BRANDING = {
  name: 'EHRConnect',
  displayName: 'EHRConnect',
  logoUrl: null,
  primaryColor: 'bg-blue-800'
}

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
      return NextResponse.json({ branding: DEFAULT_BRANDING })
    }

    // Fetch patient to get their managing organization
    const patient = await medplum.readResource('Patient', patientId)

    if (!patient.managingOrganization?.reference) {
      return NextResponse.json({ branding: DEFAULT_BRANDING })
    }

    // Extract organization ID from reference (format: "Organization/id")
    const orgId = patient.managingOrganization.reference.replace('Organization/', '')

    // Fetch organization details
    const organization: Organization = await medplum.readResource('Organization', orgId)

    // Extract branding information from organization
    const branding = {
      name: organization.name || 'Healthcare Organization',
      displayName: organization.alias?.[0] || organization.name || 'Healthcare Organization',
      // Logo URL might be stored in an extension or identifier
      logoUrl: organization.extension?.find(ext =>
        ext.url === 'http://ehrconnect.com/fhir/StructureDefinition/organization-logo'
      )?.valueUrl || null,
      // Primary color might be stored in an extension
      primaryColor: organization.extension?.find(ext =>
        ext.url === 'http://ehrconnect.com/fhir/StructureDefinition/organization-primary-color'
      )?.valueString || 'bg-blue-800'
    }

    return NextResponse.json({ branding })
  } catch (error: any) {
    console.error('Error fetching organization branding:', error)
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch organization branding',
        branding: DEFAULT_BRANDING
      },
      { status: 200 } // Return 200 with default branding instead of error
    )
  }
}
