'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Video,
  Laptop,
  Wifi,
  ShieldCheck,
  Phone,
  MessageSquare,
  Clock,
  RefreshCcw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

type FhirIdentifier = {
  value?: string
}

type FhirCoding = {
  text?: string
  code?: string
}

type FhirCodeableConcept = {
  text?: string
  coding?: FhirCoding[]
}

type FhirReference = {
  reference?: string
  display?: string
}

type AppointmentParticipant = {
  actor?: FhirReference
}

type Appointment = {
  id?: string
  identifier?: FhirIdentifier[]
  start?: string
  minutesDuration?: number
  participant?: AppointmentParticipant[]
  reasonCode?: FhirCodeableConcept[]
  serviceType?: FhirCodeableConcept[]
  status?: string
}

type TelehealthSession = Appointment

export default function TelehealthPage() {
  const [sessions, setSessions] = useState<TelehealthSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/telehealth')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load telehealth sessions')
      }

      const data = (await response.json()) as { sessions?: TelehealthSession[] }
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Error loading telehealth sessions:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load telehealth information right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const nextSession = useMemo(() => {
    if (sessions.length === 0) return null
    return sessions
      .slice()
      .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
      .find((session) => (session.start ? new Date(session.start) > new Date() : false))
  }, [sessions])

  const canJoinSession = (session?: TelehealthSession | null) => {
    if (!session?.start) return false
    const start = new Date(session.start)
    const now = new Date()
    const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 15 && diffMinutes > -120
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Telehealth Visits</h1>
          <p className="text-gray-600">
            Prepare for upcoming virtual visits and join your telehealth appointments securely.
          </p>
        </div>
        <Button variant="outline" onClick={loadSessions}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Video className="w-10 h-10 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Telehealth readiness</h2>
                <p className="text-sm text-gray-600">
                  Test your device and connection ahead of your visit to avoid delays.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-white">
                <Laptop className="w-4 h-4 mr-1" /> Camera ready
              </Badge>
              <Badge variant="outline" className="bg-white">
                <Wifi className="w-4 h-4 mr-1" /> Stable connection
              </Badge>
              <Badge variant="outline" className="bg-white">
                <ShieldCheck className="w-4 h-4 mr-1" /> HIPAA compliant
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm">
              Start device test
            </Button>
            <Button variant="outline" size="sm">
              View telehealth tips
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No telehealth visits scheduled</h3>
            <p className="text-gray-600 mb-4">
              When your care team schedules a virtual visit, it will appear here with join details.
            </p>
            <Button variant="outline">Request a virtual visit</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {nextSession && (
            <Card className="border border-purple-200">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
                    <Video className="w-5 h-5" />
                    Next Telehealth Visit
                  </CardTitle>
                  <CardDescription>
                    {nextSession.start
                      ? `Scheduled for ${format(new Date(nextSession.start), 'MMMM d, yyyy h:mma')}`
                      : 'Scheduled soon'}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="uppercase">
                  Starts soon
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Provider:{' '}
                    <span className="font-medium text-gray-900">
                      {nextSession.participant
                        ?.find((person) => person.actor?.reference?.startsWith('Practitioner/'))
                        ?.actor?.display || 'Care team'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Reason:{' '}
                    <span className="font-medium text-gray-900">
                      {nextSession.reasonCode?.[0]?.text || 'Telehealth follow-up'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {nextSession.minutesDuration || 30} minutes
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    asChild
                    disabled={!canJoinSession(nextSession)}
                    title={
                      canJoinSession(nextSession)
                        ? 'Join visit'
                        : 'Join link available 15 minutes before start'
                    }
                  >
                    <Link href={`/portal/telehealth/${nextSession.id}`}>Join visit</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/portal/appointments/${nextSession.id}`}>View details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                Upcoming virtual visits
              </CardTitle>
              <CardDescription>
                Join link becomes available 15 minutes before the scheduled start time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id || session.identifier?.[0]?.value}
                  className="rounded-xl border border-gray-200 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 uppercase">
                      {session.start
                        ? format(new Date(session.start), 'EEEE, MMM d · h:mma')
                        : 'Scheduled soon'}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.reasonCode?.[0]?.text || session.serviceType?.[0]?.text || 'Telehealth visit'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      With{' '}
                      {session.participant
                        ?.find((person) => person.actor?.reference?.startsWith('Practitioner/'))
                        ?.actor?.display || 'care team member'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {session.status && (
                        <Badge variant="outline" className="uppercase">
                          {session.status}
                        </Badge>
                      )}
                      {session.minutesDuration && (
                        <Badge variant="outline">{session.minutesDuration} minutes</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 min-w-[220px]">
                    <Button
                      asChild
                      disabled={!canJoinSession(session)}
                      title={
                        canJoinSession(session)
                          ? 'Join visit'
                          : 'Join link available 15 minutes before start'
                      }
                    >
                      <Link href={`/portal/telehealth/${session.id}`}>Join visit</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/portal/appointments/${session.id}`}>View details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Need to reschedule?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>
                Contact your care team if you need to adjust a telehealth visit. We recommend giving
                at least 24 hours notice to avoid delays in care.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portal/messages/compose">Message care team</Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call clinic
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
