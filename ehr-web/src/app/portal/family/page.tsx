'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Shield,
  MapPin,
  RefreshCcw,
  HeartHandshake,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

type FhirIdentifier = {
  value?: string
}

type FhirCoding = {
  display?: string
}

type FhirCodeableConcept = {
  text?: string
  coding?: FhirCoding[]
}

type FhirHumanName = {
  text?: string
  family?: string
  given?: string[]
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
}

type RelatedPerson = {
  id?: string
  identifier?: FhirIdentifier[]
  name?: FhirHumanName[]
  active?: boolean
  relationship?: FhirCodeableConcept[]
  telecom?: FhirContactPoint[]
  address?: FhirAddress
}

type FamilyMember = RelatedPerson

export default function FamilyAccessPage() {
  const { toast } = useToast()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    relationship: '',
    email: '',
    phone: '',
    accessLevel: 'view',
    notes: '',
  })
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [changingAccessId, setChangingAccessId] = useState<string | null>(null)

  useEffect(() => {
    loadFamilyMembers()
  }, [])

  const loadFamilyMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/family')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load family access list')
      }

      const data = (await response.json()) as { familyMembers?: FamilyMember[] }
      setFamilyMembers(data.familyMembers || [])
    } catch (err) {
      console.error('Error loading family members:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load family access information right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSubmit = async () => {
    if (!inviteForm.fullName.trim() || !inviteForm.relationship.trim()) {
      toast({
        title: 'Missing information',
        description: 'Name and relationship are required.',
        variant: 'destructive',
      })
      return
    }

    try {
      setInviteSubmitting(true)
      const response = await fetch('/api/patient/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to invite caregiver')
      }

      await loadFamilyMembers()
      setInviteDialogOpen(false)
      setInviteForm({
        fullName: '',
        relationship: '',
        email: '',
        phone: '',
        accessLevel: 'view',
        notes: '',
      })
      toast({ title: 'Invitation sent', description: 'We emailed the caregiver instructions.' })
    } catch (err) {
      console.error('Invite caregiver failed:', err)
      toast({
        title: 'Invite failed',
        description:
          err instanceof Error ? err.message : 'Unable to invite caregiver right now.',
        variant: 'destructive',
      })
    } finally {
      setInviteSubmitting(false)
    }
  }

  const handleAccessToggle = async (member: FamilyMember, active: boolean) => {
    const relatedPersonId = member.id || member.identifier?.[0]?.value
    if (!relatedPersonId) return

    try {
      setChangingAccessId(relatedPersonId)
      const response = await fetch(`/api/patient/family/${relatedPersonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, notes: 'Updated via patient portal' }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to update access')
      }

      await loadFamilyMembers()
      toast({
        title: active ? 'Access restored' : 'Access revoked',
        description: member.name?.[0]?.text || 'Caregiver access updated.',
      })
    } catch (err) {
      console.error('Update caregiver access failed:', err)
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to update access right now.',
        variant: 'destructive',
      })
    } finally {
      setChangingAccessId(null)
    }
  }

  const activeMembers = useMemo(
    () => familyMembers.filter((member) => member.active !== false),
    [familyMembers]
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family & Caregiver Access</h1>
          <p className="text-gray-600">
            Manage trusted family members who can view and help manage your health information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadFamilyMembers}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite caregiver
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                HIPAA-compliant family access control
              </p>
              <p className="text-sm text-gray-600">
                Only trusted individuals you approve can see your records. You can revoke access at any time.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="uppercase">
            Active caregivers: {activeMembers.length}
          </Badge>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : familyMembers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No caregivers added</h3>
            <p className="text-gray-600 mb-4">
              Invite a trusted family member or caregiver to view your records and help manage your health.
            </p>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite caregiver
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {familyMembers.map((member, index) => {
            const memberId = member.id || member.identifier?.[0]?.value || `member-${index}`
            const isActive = member.active !== false
            const phoneContact = member.telecom?.find((contact) => contact.system === 'phone')
            const emailContact = member.telecom?.find((contact) => contact.system === 'email')
            return (
            <Card key={memberId}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {member.name?.[0]?.text || member.name?.[0]?.family || 'Family member'}
                      </h3>
                      {member.active === false ? (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200 uppercase">
                          Inactive
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      {member.relationship?.map((rel, index) => (
                        <Badge key={index} variant="outline">
                          {rel.text || rel.coding?.[0]?.display || 'Authorized contact'}
                        </Badge>
                      ))}
                    </div>
                    {member.telecom?.length ? (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {member.telecom.map((contact, index) => {
                          if (!contact.value) return null
                          return (
                            <span key={index} className="flex items-center gap-2">
                              {contact.system === 'phone' ? (
                                <Phone className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Mail className="w-4 h-4 text-gray-500" />
                              )}
                              {contact.value}
                            </span>
                          )
                        })}
                      </div>
                    ) : null}
                    {member.address && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {[
                          member.address.line?.join(', '),
                          member.address.city,
                          member.address.state,
                          member.address.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 min-w-[220px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className={
                        isActive
                          ? 'border-red-200 text-red-600 hover:text-red-700'
                          : 'border-emerald-200 text-emerald-700 hover:text-emerald-800'
                      }
                      disabled={changingAccessId === memberId}
                      onClick={() => handleAccessToggle(member, !isActive)}
                    >
                      {changingAccessId === memberId ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <HeartHandshake className="w-4 h-4 mr-2" />
                      )}
                      {isActive ? 'Revoke access' : 'Restore access'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setInviteForm({
                          fullName: member.name?.[0]?.text || member.name?.[0]?.family || '',
                          relationship: member.relationship?.[0]?.text || '',
                          email: emailContact?.value || '',
                          phone: phoneContact?.value || '',
                          accessLevel: isActive ? 'full' : 'view',
                          notes: '',
                        })
                        setInviteDialogOpen(true)
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Resend invitation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )})}
        </div>
      )}

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite caregiver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="caregiver-name">Full name</Label>
              <Input
                id="caregiver-name"
                value={inviteForm.fullName}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                placeholder="Caregiver name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="caregiver-relationship">Relationship</Label>
              <Input
                id="caregiver-relationship"
                value={inviteForm.relationship}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, relationship: event.target.value }))
                }
                placeholder="Parent, spouse, friend..."
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="caregiver-email">Email</Label>
                <Input
                  id="caregiver-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) =>
                    setInviteForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="caregiver@email.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="caregiver-phone">Phone</Label>
                <Input
                  id="caregiver-phone"
                  value={inviteForm.phone}
                  onChange={(event) =>
                    setInviteForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Access level</Label>
              <Select
                value={inviteForm.accessLevel}
                onValueChange={(value) =>
                  setInviteForm((prev) => ({ ...prev, accessLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only (medical records)</SelectItem>
                  <SelectItem value="full">Full access (messages & scheduling)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="caregiver-notes">Notes (optional)</Label>
              <Textarea
                id="caregiver-notes"
                value={inviteForm.notes}
                onChange={(event) =>
                  setInviteForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder="Any special instructions for your caregiver"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteSubmit} disabled={inviteSubmitting}>
              {inviteSubmitting ? 'Sending...' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
