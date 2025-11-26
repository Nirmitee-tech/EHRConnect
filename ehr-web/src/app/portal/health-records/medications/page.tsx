'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Pill, RefreshCcw, Calendar, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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

type FhirReference = {
  display?: string
  reference?: string
}

type FhirDosage = {
  text?: string
}

type FhirPeriod = {
  end?: string
}

type FhirDispenseRequest = {
  validityPeriod?: FhirPeriod
}

type MedicationRequest = {
  id?: string
  identifier?: FhirIdentifier[]
  medicationCodeableConcept?: FhirCodeableConcept
  requester?: FhirReference
  status?: string
  intent?: string
  dosageInstruction?: FhirDosage[]
  authoredOn?: string
  dispenseRequest?: FhirDispenseRequest
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<MedicationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refillDialogOpen, setRefillDialogOpen] = useState(false)
  const [refillMedication, setRefillMedication] = useState<MedicationRequest | null>(null)
  const [refillPharmacy, setRefillPharmacy] = useState('')
  const [refillPhone, setRefillPhone] = useState('')
  const [refillNotes, setRefillNotes] = useState('')
  const [refillQuantity, setRefillQuantity] = useState('')
  const [submittingRefill, setSubmittingRefill] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/health-records')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load medications')
      }

      const data = (await response.json()) as { medications?: MedicationRequest[] }
      setMedications(data.medications || [])
    } catch (err) {
      console.error('Error loading medications:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load medications right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const openRefillDialog = (medication: MedicationRequest) => {
    setRefillMedication(medication)
    setRefillDialogOpen(true)
    setRefillPharmacy('')
    setRefillPhone('')
    setRefillNotes('')
    setRefillQuantity('')
  }

  const submitRefillRequest = async () => {
    if (!refillMedication?.id) {
      toast({
        title: 'Medication missing',
        description: 'Unable to locate medication details.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmittingRefill(true)
      const response = await fetch('/api/patient/medications/refill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationRequestId: refillMedication.id,
          pharmacyName: refillPharmacy,
          pharmacyPhone: refillPhone,
          notes: refillNotes,
          quantityRequested: refillQuantity ? Number(refillQuantity) : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to submit refill request')
      }

      toast({
        title: 'Refill requested',
        description: 'Your care team will review the request shortly.',
      })
      setRefillDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Request failed',
        description: error.message || 'Unable to submit refill request.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingRefill(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">
            Review your active prescriptions, dosages, and prescribing clinicians.
          </p>
        </div>
        <Button variant="outline" onClick={loadMedications} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : medications.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No active medications</h3>
            <p className="text-gray-600">
              Once medications are prescribed, they will appear here with dosage instructions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {medications.map((medication) => (
            <Card key={medication.id || medication.identifier?.[0]?.value}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                    {medication.medicationCodeableConcept?.text || 'Medication'}
                  </CardTitle>
                  <CardDescription>
                    Prescribed by{' '}
                    {medication.requester?.display ||
                      medication.requester?.reference ||
                      'Care team'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {medication.status && (
                    <Badge
                      className={`uppercase ${
                        medication.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {medication.status}
                    </Badge>
                  )}
                  {medication.intent && <Badge variant="outline">{medication.intent}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {medication.dosageInstruction?.[0]?.text && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {medication.dosageInstruction[0].text}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {medication.authoredOn && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Started {format(new Date(medication.authoredOn), 'MMMM d, yyyy')}
                    </div>
                  )}
                  {medication.dispenseRequest?.validityPeriod?.end && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Ends{' '}
                      {format(
                        new Date(medication.dispenseRequest.validityPeriod.end),
                        'MMMM d, yyyy'
                      )}
                    </div>
                  )}
                </div>
                {medication.status === 'active' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openRefillDialog(medication)}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Request refill
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <a
                        href={`/portal/documents?search=${encodeURIComponent(
                          medication.medicationCodeableConcept?.text || ''
                        )}`}
                      >
                        View documents
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={refillDialogOpen} onOpenChange={setRefillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request refill{' '}
              {refillMedication?.medicationCodeableConcept?.text
                ? `for ${refillMedication.medicationCodeableConcept.text}`
                : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="refill-pharmacy">Preferred pharmacy</Label>
              <Input
                id="refill-pharmacy"
                value={refillPharmacy}
                onChange={(event) => setRefillPharmacy(event.target.value)}
                placeholder="Pharmacy name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refill-phone">Pharmacy phone</Label>
              <Input
                id="refill-phone"
                value={refillPhone}
                onChange={(event) => setRefillPhone(event.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refill-quantity">Quantity requested</Label>
              <Input
                id="refill-quantity"
                type="number"
                min="0"
                value={refillQuantity}
                onChange={(event) => setRefillQuantity(event.target.value)}
                placeholder="30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refill-notes">Notes</Label>
              <Textarea
                id="refill-notes"
                value={refillNotes}
                onChange={(event) => setRefillNotes(event.target.value)}
                placeholder="Any additional instructions for your care team"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setRefillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRefillRequest} disabled={submittingRefill}>
              {submittingRefill ? 'Sending...' : 'Submit request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
