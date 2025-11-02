'use client'

import { useEffect, useState } from 'react'
import { Shield, BellRing, Globe, RefreshCcw, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import type { Patient } from '@medplum/fhirtypes'
import type { PatientPreferences } from '@/services/patient-portal.service'
import { DEFAULT_PATIENT_PREFERENCES } from '@/services/patient-portal.service'

interface SettingsState {
  patient: Patient
  preferences: PatientPreferences
}

const resolvePreferences = (prefs?: PatientPreferences | null) => ({
  ...DEFAULT_PATIENT_PREFERENCES,
  ...(prefs || {}),
})

export default function PatientSettingsPage() {
  const { toast } = useToast()

  const [settings, setSettings] = useState<SettingsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/profile')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load settings')
      }

      const data = (await response.json()) as SettingsState
      setSettings({
        patient: data.patient,
        preferences: resolvePreferences(data.preferences),
      })
    } catch (err) {
      console.error('Error loading settings:', err)
      const message = err instanceof Error ? err.message : 'Unable to load settings right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = (updates: Partial<PatientPreferences>) => {
    setSettings((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...updates,
        },
      }
    })
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError(null)
      const response = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: settings.preferences }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Failed to save settings')
      }

      const data = (await response.json()) as SettingsState
      setSettings({
        patient: data.patient,
        preferences: resolvePreferences(data.preferences),
      })

      toast({
        title: 'Preferences saved',
        description: 'Your communication and security preferences have been updated.',
      })
    } catch (err) {
      console.error('Error saving settings:', err)
      const message = err instanceof Error ? err.message : 'Unable to save settings right now.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const patientPhone = settings?.patient.telecom?.find((contact) => contact.system === 'phone')?.value

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">
            Manage notification preferences, login security, and connected experiences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving || !settings}>
            <Save className="w-4 h-4 mr-2" />
            Save preferences
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : settings ? (
        <>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                Login & security
              </CardTitle>
              <CardDescription>
                We keep your account secure by monitoring login activity and requiring strong authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Two-factor authentication</p>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security when signing in to the patient portal.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Coming soon
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Login notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive an email if someone signs in to your account from a new device.
                  </p>
                </div>
                <Button
                  variant={settings.preferences.emailNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updatePreferences({
                      emailNotifications: !settings.preferences.emailNotifications,
                    })
                  }
                >
                  {settings.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BellRing className="w-5 h-5 text-blue-600" />
                Notification preferences
              </CardTitle>
              <CardDescription>
                Configure how we notify you about appointments, messages, and telehealth visits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">SMS updates</p>
                  <p className="text-sm text-gray-600">
                    Text alerts to {patientPhone || 'your mobile number'} for critical updates.
                  </p>
                </div>
                <Button
                  variant={settings.preferences.smsNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updatePreferences({
                      smsNotifications: !settings.preferences.smsNotifications,
                    })
                  }
                >
                  {settings.preferences.smsNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Appointment reminders</p>
                  <p className="text-sm text-gray-600">
                    Receive reminders for upcoming visits via email and text.
                  </p>
                </div>
                <Button
                  variant={settings.preferences.appointmentReminders ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updatePreferences({
                      appointmentReminders: !settings.preferences.appointmentReminders,
                    })
                  }
                >
                  {settings.preferences.appointmentReminders ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Telehealth reminders</p>
                  <p className="text-sm text-gray-600">
                    Pre-visit instructions and join links sent before virtual appointments.
                  </p>
                </div>
                <Button
                  variant={settings.preferences.telehealthReminders ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updatePreferences({
                      telehealthReminders: !settings.preferences.telehealthReminders,
                    })
                  }
                >
                  {settings.preferences.telehealthReminders ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-blue-600" />
                Connected experiences
              </CardTitle>
              <CardDescription>
                Control whether anonymized data can be used for research and quality programs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Share health trends</p>
                  <p className="text-sm text-gray-600">
                    Allow anonymous usage of your health data to power research and quality programs.
                  </p>
                </div>
                <Button
                  variant={settings.preferences.shareHealthData ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updatePreferences({
                      shareHealthData: !settings.preferences.shareHealthData,
                    })
                  }
                >
                  {settings.preferences.shareHealthData ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">Weekly summary email</p>
                  <p className="text-sm text-gray-600">
                    Receive a weekly digest of upcoming appointments, medications, and messages.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Coming soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
