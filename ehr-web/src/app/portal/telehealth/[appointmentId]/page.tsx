'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HMSRoomProvider } from '@100mslive/react-sdk'
import { MeetingRoom } from '@/components/virtual-meetings/meeting-room'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Video, AlertTriangle } from 'lucide-react'

type JoinResponse = {
  meetingId: string
  meetingCode: string
  authToken: string
  roomUrl?: string
  telehealth?: {
    meetingCode: string
    publicLink?: string
  }
}

export default function TelehealthJoinPage() {
  const params = useParams<{ appointmentId: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const [joinData, setJoinData] = useState<JoinResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      if (!params.appointmentId) return
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/patient/telehealth/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId: params.appointmentId }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.message || 'Unable to join telehealth session')
        }

        const data = (await response.json()) as JoinResponse
        setJoinData(data)
      } catch (err) {
        console.error('Telehealth join failed:', err)
        setError(err instanceof Error ? err.message : 'Unable to join telehealth session.')
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [params.appointmentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !joinData) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error || 'Telehealth session not available.'}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/portal/telehealth')}>
          Back to telehealth
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Video className="w-5 h-5 text-purple-600" />
            Telehealth visit
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          We will connect you securely with your care team. Please keep this tab open.
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <HMSRoomProvider>
          <MeetingRoom
            authToken={joinData.authToken}
            meetingId={joinData.meetingId}
            displayName={session?.user?.name || 'Patient'}
            patientName={session?.user?.name || 'Patient'}
            onLeave={() => router.push('/portal/telehealth')}
            isHost={false}
          />
        </HMSRoomProvider>
      </div>
    </div>
  )
}
