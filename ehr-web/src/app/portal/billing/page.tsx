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
import type { Coverage, ExplanationOfBenefit, Invoice } from '@medplum/fhirtypes'

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
                <Button size="sm" variant="default" className="mt-2">
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
                          <Button variant="default" size="sm">
                            {balance && balance > 0 ? (
                              <>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Pay now
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Paid
                              </>
                            )}
                          </Button>
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
    </div>
  )
}
