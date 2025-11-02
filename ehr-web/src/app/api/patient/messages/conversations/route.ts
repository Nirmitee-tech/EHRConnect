import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientPortalService } from '@/services/patient-portal.service'

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
      return NextResponse.json(
        { message: 'Patient ID not found' },
        { status: 400 }
      )
    }

    const messages = await PatientPortalService.getPatientMessages(patientId)

    // Group messages into conversations by sender/recipient
    const conversationsMap = new Map()

    messages.forEach((message: any) => {
      const senderId = message.sender?.reference || 'unknown'
      const recipientId = message.recipient?.[0]?.reference || 'unknown'

      // Create conversation ID (normalize patient to always be first)
      const patientRef = `Patient/${patientId}`
      const otherParty = senderId === patientRef ? recipientId : senderId
      const conversationId = otherParty

      if (!conversationsMap.has(conversationId)) {
        conversationsMap.set(conversationId, {
          id: conversationId,
          otherParty: otherParty,
          lastMessage: message,
          messageCount: 0,
          unreadCount: 0,
        })
      }

      const conversation = conversationsMap.get(conversationId)
      conversation.messageCount++

      // Update last message if this one is newer
      if (new Date(message.sent || 0) > new Date(conversation.lastMessage.sent || 0)) {
        conversation.lastMessage = message
      }
    })

    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json(conversations)
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
