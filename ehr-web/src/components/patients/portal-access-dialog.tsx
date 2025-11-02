'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react'

interface PortalAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientEmail?: string
  patientName?: string
  onSuccess?: () => void
}

export function PortalAccessDialog({
  open,
  onOpenChange,
  patientId,
  patientEmail = '',
  patientName = '',
  onSuccess,
}: PortalAccessDialogProps) {
  const [email, setEmail] = useState(patientEmail)
  const [tempPassword, setTempPassword] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [credentialsCopied, setCredentialsCopied] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string
    password: string
    loginUrl: string
  } | null>(null)

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setTempPassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !tempPassword) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/patient/grant-portal-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          email,
          tempPassword,
          sendEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to grant portal access')
      }

      setSuccess(true)
      setCreatedCredentials({
        email,
        password: tempPassword,
        loginUrl: `${window.location.origin}/patient-login`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    if (!createdCredentials) return

    const text = `Patient Portal Access Credentials

Patient Name: ${patientName}

Login URL: ${createdCredentials.loginUrl}
Email: ${createdCredentials.email}
Temporary Password: ${createdCredentials.password}

Please change your password after first login.`

    navigator.clipboard.writeText(text)
    setCredentialsCopied(true)
    setTimeout(() => setCredentialsCopied(false), 2000)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation completes
    setTimeout(() => {
      setSuccess(false)
      setError('')
      setTempPassword('')
      setCreatedCredentials(null)
      setCredentialsCopied(false)
    }, 200)
  }

  if (success && createdCredentials) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Portal Access Granted!
            </DialogTitle>
            <DialogDescription>
              Patient portal access has been successfully created
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {sendEmail
                  ? 'An email with login instructions has been sent to the patient.'
                  : 'Please provide these credentials to the patient.'}
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Login URL</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {createdCredentials.loginUrl}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                <p className="text-sm font-mono text-gray-900">
                  {createdCredentials.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Temporary Password</p>
                <p className="text-sm font-mono text-gray-900 font-semibold">
                  {createdCredentials.password}
                </p>
              </div>
            </div>

            <Button
              onClick={copyCredentials}
              variant="outline"
              className="w-full"
            >
              {credentialsCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Credentials
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Patient should change their password after first login
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grant Portal Access</DialogTitle>
          <DialogDescription>
            Create patient portal login credentials for {patientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              This email will be used for portal login and notifications
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tempPassword">Temporary Password *</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={generatePassword}
                className="h-auto p-0 text-xs"
              >
                Generate Strong Password
              </Button>
            </div>
            <Input
              id="tempPassword"
              type="text"
              placeholder="Create a temporary password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              required
              disabled={loading}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Patient will be prompted to change this on first login
            </p>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              disabled={loading}
            />
            <div className="space-y-1">
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Send invitation email
              </label>
              <p className="text-xs text-gray-500">
                Email patient with login instructions and credentials
              </p>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Note:</strong> The patient will receive access to view their health
              records, book appointments, and message their care team.
            </AlertDescription>
          </Alert>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Access...
              </>
            ) : (
              'Grant Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
