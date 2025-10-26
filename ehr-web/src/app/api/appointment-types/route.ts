import { NextRequest, NextResponse } from 'next/server';
import { AppointmentType } from '@/types/staff';

const FHIR_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Store appointment types as FHIR Basic resources
// In a production system, you might use a database or extend FHIR ValueSet

export async function GET(request: NextRequest) {
  try {
    // Fetch Basic resources with category 'appointment-type'
    const url = `${FHIR_BASE_URL}/fhir/R4/Basic?code=appointment-type&_count=100`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointment types: ${response.statusText}`);
    }

    const bundle = await response.json();

    // Convert FHIR Basic resources to AppointmentType
    const appointmentTypes: AppointmentType[] = (bundle.entry || []).map((entry: any) => {
      const resource = entry.resource;
      const extensions = resource.extension || [];

      return {
        id: resource.id,
        name: resource.subject?.display || '',
        duration: extensions.find((ext: any) => ext.url === 'duration')?.valueInteger || 30,
        color: extensions.find((ext: any) => ext.url === 'color')?.valueString || '#3B82F6',
        category: extensions.find((ext: any) => ext.url === 'category')?.valueString || 'consultation',
        description: resource.text?.div?.replace(/<[^>]*>/g, '') || '',
        requiresPreparation: extensions.find((ext: any) => ext.url === 'requiresPreparation')?.valueBoolean || false,
        preparationInstructions: extensions.find((ext: any) => ext.url === 'preparationInstructions')?.valueString,
        allowedProviders: extensions.find((ext: any) => ext.url === 'allowedProviders')?.valueString?.split(',')
      };
    });

    return NextResponse.json(appointmentTypes);
  } catch (error) {
    console.error('Error fetching appointment types:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentType: AppointmentType = await request.json();

    // Convert AppointmentType to FHIR Basic resource
    const fhirResource = {
      resourceType: 'Basic',
      code: {
        coding: [{
          system: 'http://ehrconnect.io/fhir/CodeSystem/resource-types',
          code: 'appointment-type'
        }]
      },
      subject: {
        display: appointmentType.name
      },
      text: {
        status: 'generated',
        div: `<div xmlns="http://www.w3.org/1999/xhtml">${appointmentType.description || appointmentType.name}</div>`
      },
      extension: [
        {
          url: 'duration',
          valueInteger: appointmentType.duration
        },
        {
          url: 'color',
          valueString: appointmentType.color
        },
        {
          url: 'category',
          valueString: appointmentType.category
        },
        {
          url: 'requiresPreparation',
          valueBoolean: appointmentType.requiresPreparation || false
        },
        appointmentType.preparationInstructions && {
          url: 'preparationInstructions',
          valueString: appointmentType.preparationInstructions
        },
        appointmentType.allowedProviders && {
          url: 'allowedProviders',
          valueString: appointmentType.allowedProviders.join(',')
        }
      ].filter(Boolean)
    };

    const response = await fetch(`${FHIR_BASE_URL}/fhir/R4/Basic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(fhirResource)
    });

    if (!response.ok) {
      throw new Error(`Failed to create appointment type: ${response.statusText}`);
    }

    const created = await response.json();

    return NextResponse.json({
      ...appointmentType,
      id: created.id
    });
  } catch (error) {
    console.error('Error creating appointment type:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
