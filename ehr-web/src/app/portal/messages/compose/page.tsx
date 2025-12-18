'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Send,
  Loader2,
  Users,
  ArrowLeft,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface ProviderOption {
  id: string
  name: string
  specialty?: string
}

interface ProviderApiModel {
  id: string
  name: string
  specialty?: string
}

export default function ComposeMessagePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedProvider, setSelectedProvider] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoadingProviders(true)
      const response = await fetch('/api/patient/providers')
      let data: { providers?: ProviderApiModel[] } | null = null
      try {
        data = (await response.json()) as { providers?: ProviderApiModel[] }
      } catch {
        data = null
      }
      const providerList = data?.providers || []
      setProviders(
        providerList.map((provider) => ({
          id: provider.id,
          name: provider.name,
          specialty: provider.specialty,
        }))
      )
    } catch (err) {
      console.error('Error loading providers:', err)
      setError('Unable to load provider list. Please try again later.')
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedProvider || !subject.trim() || !message.trim()) {
      setError('Please choose a provider, add a subject, and write your message.')
      return
    }

    try {
      setSending(true)
      setError(null)

      const response = await fetch('/api/patient/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedProvider,
          subject,
          message,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Failed to send message')
      }

      toast({
        title: 'Message sent',
        description: 'Your care team will respond within one business day.',
      })
      router.push('/portal/messages')
    } catch (err) {
      console.error('Error sending message:', err)
      const message = err instanceof Error ? err.message : 'Unable to send message right now.'
      setError(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm">
          <Link href="/portal/messages">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to inbox
          </Link>
        </Button>
        <span className="text-sm text-gray-500">Compose message</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            New message to care team
          </CardTitle>
          <CardDescription>
            This message will be securely delivered to your selected provider and care team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="provider">Choose provider</Label>
                <div className="relative mt-1">
                  <select
                    id="provider"
                    value={selectedProvider}
                    onChange={(event) => setSelectedProvider(event.target.value)}
                    disabled={loadingProviders}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your provider</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                        {provider.specialty ? ` — ${provider.specialty}` : ''}
                      </option>
                    ))}
                  </select>
                  <Users className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Subject of your message"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your question or concern"
                rows={8}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">
                Do not include urgent medical concerns. Call 911 for emergencies.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4" />
                Typically replies within 1 business day.
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/portal/messages')}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
