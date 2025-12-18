'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  CreditCard,
  Shield,
  Receipt,
  DollarSign,
  RefreshCcw,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

type FhirIdentifier = {
  value?: string
}

type FhirCoding = {
  code?: string
  display?: string
}

type FhirCodeableConcept = {
  text?: string
  coding?: FhirCoding[]
}

type FhirMoney = {
  value?: number
}

type FhirReference = {
  display?: string
  reference?: string
  identifier?: FhirIdentifier[]
}

type FhirPeriod = {
  start?: string
  end?: string
}

type FhirCoverageClass = {
  type?: FhirCodeableConcept
  value?: string
}

type Coverage = {
  id?: string
  identifier?: FhirIdentifier[]
  payor?: FhirReference[]
  status?: string
  subscriberId?: string
  beneficiary?: FhirReference
  period?: FhirPeriod
  class?: FhirCoverageClass[]
}

type ExplanationOfBenefitTotal = {
  amount?: FhirMoney
}

type ExplanationOfBenefit = {
  id?: string
  identifier?: FhirIdentifier[]
  status?: string
  type?: FhirCodeableConcept
  claim?: {
    identifier?: FhirIdentifier[]
  }
  created?: string
  provider?: FhirReference
  paymentAmount?: FhirMoney
  total?: ExplanationOfBenefitTotal[]
}

type Invoice = {
  id?: string
  identifier?: FhirIdentifier[]
  status?: string
  type?: FhirCodeableConcept
  date?: string
  subject?: FhirReference
  totalGross?: FhirMoney
  totalBalance?: FhirMoney
}

interface BillingSummary {
  coverages: Coverage[]
  explanations: ExplanationOfBenefit[]
  invoices: Invoice[]
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  balanced: 'bg-blue-100 text-blue-700 border-blue-200',
  issued: 'bg-purple-100 text-purple-700 border-purple-200',
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function PatientBillingPage() {
  const [summary, setSummary] = useState<BillingSummary>({
    coverages: [],
    explanations: [],
    invoices: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card')
  const [paymentCardLast4, setPaymentCardLast4] = useState('')
  const [paymentBrand, setPaymentBrand] = useState('')
  const [paying, setPaying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadBilling()
  }, [])

  const loadBilling = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/patient/billing')

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to load billing data')
      }

      const data = (await response.json()) as BillingSummary
      setSummary(data)
    } catch (err) {
      console.error('Error loading billing data:', err)
      const message =
        err instanceof Error ? err.message : 'Unable to load billing information right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const outstandingBalance = useMemo(() => {
    return summary.invoices.reduce((total, invoice) => {
      const balance = invoice.totalBalance?.value ?? invoice.totalGross?.value
      if (typeof balance === 'number') {
        return total + balance
      }
      return total
    }, 0)
  }, [summary.invoices])

  const openPaymentDialog = (invoice?: Invoice) => {
    const invoiceBalance = invoice?.totalBalance?.value ?? invoice?.totalGross?.value ?? 0
    setSelectedInvoice(invoice || null)
    setPaymentAmount(invoiceBalance > 0 ? invoiceBalance.toString() : '')
    setPaymentCardLast4('')
    setPaymentBrand('')
    setPaymentDialogOpen(true)
  }

  const handlePayment = async () => {
    const amountNumber = Number(paymentAmount)
    if (!selectedInvoice) {
      toast({ title: 'Invoice required', description: 'Choose an invoice to pay.', variant: 'destructive' })
      return
    }
    if (!amountNumber || amountNumber <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a payment amount.', variant: 'destructive' })
      return
    }

    try {
      setPaying(true)
      const response = await fetch('/api/patient/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: amountNumber,
          method: paymentMethod,
          last4: paymentCardLast4,
          brand: paymentBrand,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Unable to record payment')
      }

      await loadBilling()
      setPaymentDialogOpen(false)
      toast({ title: 'Payment successful', description: 'Thanks for taking care of your balance.' })
    } catch (err: any) {
      toast({
        title: 'Payment failed',
        description: err.message || 'Unable to process payment right now.',
        variant: 'destructive',
      })
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Coverage</h1>
          <p className="text-gray-600">
            Review insurance coverage, recent explanations of benefits, and current balances.
          </p>
        </div>
        <Button variant="outline" onClick={loadBilling}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6 space-y-2">
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Outstanding Balance
                </p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(outstandingBalance)}</p>
                <p className="text-sm text-gray-600">
                  Total balance across all invoices. Contact billing for payment options.
                </p>
                <Button size="sm" variant="default" className="mt-2" onClick={() => openPaymentDialog()}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make a payment
                </Button>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6 space-y-2">
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
                  Active Coverages
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {summary.coverages.filter((coverage) => coverage.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">
                  Insurance plans currently on file. Ensure details are up to date.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Add new plan
                </Button>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6 space-y-2">
                <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                  Recent EOBs
                </p>
                <p className="text-3xl font-bold text-gray-900">{summary.explanations.length}</p>
                <p className="text-sm text-gray-600">
                  Explanations of Benefits received in the last few months.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Download statements
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Insurance Coverage
                </CardTitle>
                <CardDescription>
                  Active and historical policies. Contact support if anything looks incorrect.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.coverages.length === 0 ? (
                <p className="text-sm text-gray-600">No insurance coverage is currently on file.</p>
              ) : (
                summary.coverages.map((coverage) => (
                  <div
                    key={coverage.id || coverage.identifier?.[0]?.value}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {coverage.payor?.[0]?.display || 'Insurance Plan'}
                          </h3>
                          {coverage.status && (
                            <Badge
                              className={`${STATUS_BADGE[coverage.status] || 'bg-gray-100 text-gray-700 border-gray-200'} border uppercase`}
                            >
                              {coverage.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Member ID:{' '}
                          <span className="font-medium">
                            {coverage.subscriberId || coverage.identifier?.[0]?.value || 'N/A'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Beneficiary:{' '}
                          <span className="font-medium">
                            {coverage.beneficiary?.display || coverage.beneficiary?.reference}
                          </span>
                        </p>
                        {coverage.period?.start && (
                          <p className="text-sm text-gray-600">
                            Coverage period:{' '}
                            {format(new Date(coverage.period.start), 'MMM d, yyyy')} –{' '}
                            {coverage.period.end
                              ? format(new Date(coverage.period.end), 'MMM d, yyyy')
                              : 'Ongoing'}
                          </p>
                        )}
                      </div>
                      {coverage.class?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {coverage.class.map((item, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                              {item.type?.text || 'Class'}: {item.value}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  Recent Explanations of Benefits
                </CardTitle>
                <CardDescription>
                  Breakdown of claims processed by your insurance provider.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.explanations.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No explanations of benefits found. They will appear here once claims are processed.
                </p>
              ) : (
                summary.explanations.map((eob) => {
                  const total = eob.paymentAmount?.value ?? eob.total?.[0]?.amount?.value
                  const statusClass =
                    STATUS_BADGE[eob.status || ''] || 'bg-gray-100 text-gray-700 border-gray-200'

                  return (
                    <div
                      key={eob.id || eob.identifier?.[0]?.value}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {eob.type?.text || 'Explanation of Benefit'}
                            </h3>
                            {eob.status && (
                              <Badge className={`${statusClass} border uppercase`}>{eob.status}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Claim #: {eob.claim?.identifier?.[0]?.value || eob.identifier?.[0]?.value || 'N/A'}
                          </p>
                          {eob.created && (
                            <p className="text-sm text-gray-600">
                              Processed on {format(new Date(eob.created), 'MMMM d, yyyy')}
                            </p>
                          )}
                          {eob.provider?.display && (
                            <p className="text-sm text-gray-600">
                              Provider: <span className="font-medium">{eob.provider.display}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-500 uppercase">Plan Paid</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {formatCurrency(total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Invoices & Payments
                </CardTitle>
                <CardDescription>
                  Statements and balances from visits that require direct payment.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.invoices.length === 0 ? (
                <p className="text-sm text-gray-600">
                  You have no invoices at this time. New statements will appear here.
                </p>
              ) : (
                summary.invoices.map((invoice) => {
                  const totalGross = invoice.totalGross?.value
                  const balance = invoice.totalBalance?.value
                  const statusClass =
                    STATUS_BADGE[invoice.status || ''] || 'bg-gray-100 text-gray-700 border-gray-200'

                  return (
                    <div
                      key={invoice.id || invoice.identifier?.[0]?.value}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invoice.type?.text || 'Invoice'}
                            </h3>
                            {invoice.status && (
                              <Badge className={`${statusClass} border uppercase`}>{invoice.status}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Invoice #: {invoice.identifier?.[0]?.value || invoice.id || 'N/A'}
                          </p>
                          {invoice.date && (
                            <p className="text-sm text-gray-600">
                              Issued on {format(new Date(invoice.date), 'MMMM d, yyyy')}
                            </p>
                          )}
                          {invoice.subject?.display && (
                            <p className="text-sm text-gray-600">
                              Patient: <span className="font-medium">{invoice.subject.display}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Total Charges</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(totalGross)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Balance Due</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(balance)}
                            </p>
                          </div>
                          {balance && balance > 0 ? (
                            <Button variant="default" size="sm" onClick={() => openPaymentDialog(invoice)}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay now
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">
                    Need help understanding your bill?
                  </p>
                  <p className="text-sm text-amber-700/90">
                    Our patient financial services team can explain charges, insurance coverage, and payment plans.
                  </p>
                </div>
              </div>
              <Button variant="outline">Contact billing support</Button>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInvoice && (
              <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">
                  {selectedInvoice.type?.text || 'Invoice'} ·{' '}
                  {selectedInvoice.identifier?.[0]?.value || selectedInvoice.id}
                </p>
                {selectedInvoice.date && (
                  <p>Issued on {format(new Date(selectedInvoice.date), 'MMMM d, yyyy')}</p>
                )}
                <p>
                  Balance:{' '}
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedInvoice.totalBalance?.value ?? selectedInvoice.totalGross?.value
                    )}
                  </span>
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min="1"
                step="0.01"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'ach')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit / Debit Card</SelectItem>
                  <SelectItem value="ach">Bank transfer (ACH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === 'card' ? (
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="payment-brand">Card brand</Label>
                  <Input
                    id="payment-brand"
                    value={paymentBrand}
                    onChange={(event) => setPaymentBrand(event.target.value)}
                    placeholder="Visa, Mastercard..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment-last4">Last 4 digits</Label>
                  <Input
                    id="payment-last4"
                    value={paymentCardLast4}
                    onChange={(event) => setPaymentCardLast4(event.target.value)}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                We will debit the bank account you have on file. Contact billing to update details.
              </p>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={paying}>
              {paying ? 'Processing...' : 'Submit payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
