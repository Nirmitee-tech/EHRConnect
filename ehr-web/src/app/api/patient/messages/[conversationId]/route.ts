import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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
      return NextResponse.json(
        { message: 'Patient ID not found' },
        { status: 400 }
      )
    }

    const conversationId = params.conversationId

    // Get all messages
    const allMessages = await PatientPortalService.getPatientMessages(patientId)

    // Filter messages for this conversation
    const patientRef = `Patient/${patientId}`
    const conversationMessages = allMessages.filter((message: any) => {
      const senderId = message.sender?.reference || ''
      const recipientId = message.recipient?.[0]?.reference || ''

      // Message is part of conversation if it involves the patient and the other party
      return (
        (senderId === patientRef && recipientId === conversationId) ||
        (senderId === conversationId && recipientId === patientRef)
      )
    })

    // Sort by date
    conversationMessages.sort((a: any, b: any) => {
      const dateA = new Date(a.sent || 0).getTime()
      const dateB = new Date(b.sent || 0).getTime()
      return dateA - dateB
    })

    return NextResponse.json(conversationMessages)
  } catch (error: any) {
    console.error('Error fetching conversation messages:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
