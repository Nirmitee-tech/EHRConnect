'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Video,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Wifi,
  Headset,
  Monitor,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type TelehealthAppointment = {
  id: string
  start?: string
  end?: string
  minutesDuration?: number
  serviceType?: Array<{ text?: string }>
  reasonCode?: Array<{ text?: string }>
  participant?: Array<{
    actor?: { reference?: string; display?: string }
  }>
}

type PageProps = {
  params: Promise<Record<string, string | string[] | undefined>>
}

export default function JoinTelehealthPage({ params }: PageProps) {
  const router = useRouter()
  const [appointment, setAppointment] = useState<TelehealthAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        const rawId = resolvedParams?.id
        const normalizedId = Array.isArray(rawId) ? rawId[0] : rawId

        if (!isActive) {
          return
        }

        if (!normalizedId) {
          setError('Appointment ID is required')
          setLoading(false)
          setAppointmentId(null)
          return
        }

        setAppointmentId(normalizedId)
      } catch (err) {
        console.error('Failed to resolve appointment params:', err)
        if (isActive) {
          setError('Unable to determine appointment ID')
          setLoading(false)
          setAppointmentId(null)
        }
      }
    }

    resolveParams()

    return () => {
      isActive = false
    }
  }, [params])

  const loadAppointment = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/patient/appointments/${encodeURIComponent(id)}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Appointment not found. It may have been cancelled or moved.')
          return
        }
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load appointment')
      }

      const data = (await response.json()) as { appointment: TelehealthAppointment }
      setAppointment(data.appointment)
    } catch (err) {
      console.error('Error loading telehealth appointment:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load telehealth appointment right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!appointmentId) {
      return
    }
    loadAppointment(appointmentId)
  }, [appointmentId, loadAppointment])

  const handleLaunch = () => {
    if (!appointmentId) {
      return
    }
    setLaunching(true)
    setTimeout(() => {
      setLaunching(false)
      router.push(`/portal/appointments/${appointmentId}`)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">Unable to join telehealth visit</p>
            </div>
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/portal/appointments">Back to appointments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const start = appointment.start ? new Date(appointment.start) : null
  const end = appointment.end ? new Date(appointment.end) : null
  const provider = appointment.participant?.find((participant) =>
    participant.actor?.reference?.startsWith('Practitioner/')
  )
  const durationLabel = appointment.minutesDuration
    ? `${appointment.minutesDuration} minutes`
    : start && end
    ? `${Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))} minutes`
    : '30 minutes'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm">
          <Link href={`/portal/appointments/${appointment.id}`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to details
          </Link>
        </Button>
        <span className="text-sm text-gray-500">Join telehealth visit</span>
      </div>

      <Card className="border border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="w-5 h-5 text-purple-600" />
            Telehealth visit
          </CardTitle>
          <CardDescription>
            {start ? format(start, 'EEEE, MMMM d, yyyy · h:mma') : 'Scheduled soon'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Provider</p>
            <p className="text-base font-semibold text-gray-900">
              {provider?.actor?.display || 'Healthcare provider'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">Reason for visit</p>
              <p className="mt-1 text-sm text-gray-700">
                {appointment.reasonCode?.[0]?.text ||
                  appointment.serviceType?.[0]?.text ||
                  'Telehealth consultation'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">Duration</p>
              <p className="mt-1 text-sm text-gray-700">
                {durationLabel}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-purple-800">
              Join link becomes active 15 minutes before the visit starts.
            </p>
            <div className="space-y-2 text-sm text-purple-700">
              <p>Make sure you have:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Stable internet connection (3 Mbps or higher)</li>
                <li>Webcam and microphone enabled</li>
                <li>Quiet, private location for your conversation</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button className="w-full sm:w-auto" onClick={handleLaunch} disabled={launching}>
              {launching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join visit
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              Test device (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="w-5 h-5 text-blue-600" />
            Prepare for your virtual visit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <Wifi className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Check your connection</p>
              <p>
                Restart your router if needed and close other apps that might slow down your internet.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Headset className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Audio & camera</p>
              <p>
                Use headphones for better sound, and ensure your webcam is uncovered and working properly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Need to reschedule?</p>
              <p>
                Message your care team or call the clinic at least 24 hours in advance to reschedule
                this telehealth visit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
