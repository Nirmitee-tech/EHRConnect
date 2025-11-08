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

    const documents = await PatientPortalService.getPatientDocuments(patientId)

    return NextResponse.json({ documents })
  } catch (error: any) {
    console.error('Error fetching patient documents:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const patientId = session.patientId

    if (!patientId) {
      return NextResponse.json({ message: 'Patient ID not found' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const categoryCode = (formData.get('category') as string) || undefined
    const description = (formData.get('description') as string) || undefined

    const document = await PatientPortalService.uploadPatientDocument(patientId, {
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      data: arrayBuffer,
      categoryCode,
      description,
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading patient document:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}
