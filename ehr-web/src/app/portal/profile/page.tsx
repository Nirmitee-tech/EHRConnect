'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  RefreshCcw,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { PatientPreferences } from '@/services/patient-portal.service'
import { DEFAULT_PATIENT_PREFERENCES } from '@/services/patient-portal.service'

type FhirIdentifier = {
  system?: string
  value?: string
}

type FhirHumanName = {
  given?: string[]
  family?: string
}

type FhirContactPoint = {
  system?: string
  value?: string
}

type FhirAddress = {
  line?: string[]
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

type Patient = {
  name?: FhirHumanName[]
  telecom?: FhirContactPoint[]
  address?: FhirAddress[]
  birthDate?: string
  identifier?: FhirIdentifier[]
}

interface ProfileResponse {
  patient: Patient
  preferences: PatientPreferences
}

const DEFAULT_ADDRESS = {
  line: [''],
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

export default function PatientProfilePage() {
  const { toast } = useToast()

  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState(DEFAULT_ADDRESS)
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null)

  const resolvePreferences = (prefs?: PatientPreferences | null) => ({
    ...DEFAULT_PATIENT_PREFERENCES,
    ...(prefs || {}),
  })

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/profile')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load profile')
      }

      const data = (await response.json()) as ProfileResponse
      setProfile(data)

      const name = data.patient.name?.[0]
      setFirstName(name?.given?.[0] || '')
      setLastName(name?.family || '')
      setEmail(
        data.patient.telecom?.find((contact) => contact.system === 'email')?.value || ''
      )
      setPhoneNumber(
        data.patient.telecom?.find((contact) => contact.system === 'phone')?.value || ''
      )
      setAddress({
        line: data.patient.address?.[0]?.line || [''],
        city: data.patient.address?.[0]?.city || '',
        state: data.patient.address?.[0]?.state || '',
        postalCode: data.patient.address?.[0]?.postalCode || '',
        country: data.patient.address?.[0]?.country || '',
      })
      setPreferences(resolvePreferences(data.preferences))
    } catch (err) {
      console.error('Error loading profile:', err)
      const message = err instanceof Error ? err.message : 'Unable to load profile right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      const response = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phoneNumber,
          address,
          preferences: resolvePreferences(preferences),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Failed to update profile')
      }

      const data = (await response.json()) as ProfileResponse
      setProfile(data)
      setPreferences(resolvePreferences(data.preferences))
      toast({
        title: 'Profile updated',
        description: 'Your contact information and preferences have been saved.',
      })
    } catch (err) {
      console.error('Error updating profile:', err)
      const message = err instanceof Error ? err.message : 'Unable to update profile right now.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const patient = profile?.patient

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile & Preferences</h1>
          <p className="text-gray-600">
            Keep your contact details and communication preferences up to date.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadProfile} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />
            Save changes
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : patient ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-600" />
                Personal information
              </CardTitle>
              <CardDescription>
                Review your basic details. Your name and date of birth are part of your medical record.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
              <div>
                <Label>Date of birth</Label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {patient.birthDate
                    ? format(new Date(patient.birthDate), 'MMMM d, yyyy')
                    : 'Not on file'}
                </div>
              </div>
              <div>
                <Label>MRN</Label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-gray-500" />
                  {patient.identifier?.find((id) => id.system === 'urn:oid:ehrconnect:mrn')?.value ||
                    'Not assigned'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact information
              </CardTitle>
              <CardDescription>
                We&apos;ll use these details to reach you about appointments and lab results.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Mobile phone</Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <div className="grid gap-3 mt-2">
                  <Input
                    value={address.line[0] || ''}
                    onChange={(event) =>
                      setAddress((prev) => ({ ...prev, line: [event.target.value] }))
                    }
                    placeholder="Street address"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={address.city}
                      onChange={(event) =>
                        setAddress((prev) => ({ ...prev, city: event.target.value }))
                      }
                      placeholder="City"
                    />
                    <Input
                      value={address.state}
                      onChange={(event) =>
                        setAddress((prev) => ({ ...prev, state: event.target.value }))
                      }
                      placeholder="State / Province"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={address.postalCode}
                      onChange={(event) =>
                        setAddress((prev) => ({ ...prev, postalCode: event.target.value }))
                      }
                      placeholder="Postal code"
                    />
                    <Input
                      value={address.country}
                      onChange={(event) =>
                        setAddress((prev) => ({ ...prev, country: event.target.value }))
                      }
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5 text-blue-600" />
                Communication preferences
              </CardTitle>
              <CardDescription>
                Choose how you&apos;d like us to get in touch and share updates about your care.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Appointment reminders</p>
                  <p className="text-sm text-gray-600">
                    Receive reminders for upcoming visits via email and SMS.
                  </p>
                </div>
                <Button
                  variant={preferences?.appointmentReminders ? 'default' : 'outline'}
                  onClick={() => {
                    setPreferences((prev) => {
                      const next = resolvePreferences(prev)
                      return { ...next, appointmentReminders: !next.appointmentReminders }
                    })
                  }}
                >
                  {preferences?.appointmentReminders ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Email notifications</p>
                  <p className="text-sm text-gray-600">Updates about new documents and lab results.</p>
                </div>
                <Button
                  variant={preferences?.emailNotifications ? 'default' : 'outline'}
                  onClick={() => {
                    setPreferences((prev) => {
                      const next = resolvePreferences(prev)
                      return { ...next, emailNotifications: !next.emailNotifications }
                    })
                  }}
                >
                  {preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Text message alerts</p>
                  <p className="text-sm text-gray-600">
                    Receive short SMS updates about appointments and telehealth.
                  </p>
                </div>
                <Button
                  variant={preferences?.smsNotifications ? 'default' : 'outline'}
                  onClick={() => {
                    setPreferences((prev) => {
                      const next = resolvePreferences(prev)
                      return { ...next, smsNotifications: !next.smsNotifications }
                    })
                  }}
                >
                  {preferences?.smsNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Telehealth reminders</p>
                  <p className="text-sm text-gray-600">
                    Day-of tips and connection instructions for video visits.
                  </p>
                </div>
                <Button
                  variant={preferences?.telehealthReminders ? 'default' : 'outline'}
                  onClick={() => {
                    setPreferences((prev) => {
                      const next = resolvePreferences(prev)
                      return { ...next, telehealthReminders: !next.telehealthReminders }
                    })
                  }}
                >
                  {preferences?.telehealthReminders ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Share health data for research</p>
                  <p className="text-sm text-gray-600">
                    Opt in to anonymously share health trends that help improve care.
                  </p>
                </div>
                <Button
                  variant={preferences?.shareHealthData ? 'default' : 'outline'}
                  onClick={() => {
                    setPreferences((prev) => {
                      const next = resolvePreferences(prev)
                      return { ...next, shareHealthData: !next.shareHealthData }
                    })
                  }}
                >
                  {preferences?.shareHealthData ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
