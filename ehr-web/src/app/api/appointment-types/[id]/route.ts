import { NextRequest, NextResponse } from 'next/server';
import { AppointmentType } from '@/types/staff';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${FHIR_BASE_URL}/fhir/R4/Basic/${id}`, {
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointment type: ${response.statusText}`);
    }

    const resource = await response.json();
    const extensions = resource.extension || [];

    const appointmentType: AppointmentType = {
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

    return NextResponse.json(appointmentType);
  } catch (error) {
    console.error('Error fetching appointment type:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentType: AppointmentType = await request.json();

    const fhirResource = {
      resourceType: 'Basic',
      id,
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

    const response = await fetch(`${FHIR_BASE_URL}/fhir/R4/Basic/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(fhirResource)
    });

    if (!response.ok) {
      throw new Error(`Failed to update appointment type: ${response.statusText}`);
    }

    const updated = await response.json();

    return NextResponse.json({
      ...appointmentType,
      id: updated.id
    });
  } catch (error) {
    console.error('Error updating appointment type:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${FHIR_BASE_URL}/fhir/R4/Basic/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete appointment type: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment type:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
