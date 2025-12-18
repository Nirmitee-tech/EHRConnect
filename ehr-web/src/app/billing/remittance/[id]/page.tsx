'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import billingService from '@/services/billing.service';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface RemittanceDetail {
  id: string;
  remittance_number: string;
  payment_method: string;
  payment_amount: number;
  payment_date: string;
  status: string;
  received_at: string;
  payer_name: string;
  posted_by_name?: string;
  posted_at?: string;
  lines: RemittanceLine[];
}

interface RemittanceLine {
  id: string;
  claim_number: string;
  billed_amount: number;
  allowed_amount: number;
  paid_amount: number;
  adjustment_amount: number;
  patient_responsibility: number;
  adjustment_codes: any;
  remark_codes: string[];
}

export default function RemittanceDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const remittanceId = params?.id;

  const [remittance, setRemittance] = useState<RemittanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (remittanceId) {
      loadRemittance();
    }
  }, [remittanceId]);

  const loadRemittance = async () => {
    if (!remittanceId) {
      return;
    }
    try {
      const data = await billingService.getRemittanceDetail(remittanceId);
      setRemittance(data);
    } catch (error) {
      console.error('Failed to load remittance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPayment = async () => {
    if (!confirm('Are you sure you want to post this payment to the ledger? This action cannot be undone.')) {
      return;
    }

    if (!remittanceId) {
      return;
    }
    setPosting(true);
    try {
      await billingService.postRemittance(remittanceId);
      alert('Payment posted successfully!');
      loadRemittance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to post payment');
    } finally {
      setPosting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'posted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reconciled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading remittance...</p>
        </div>
      </div>
    );
  }

  if (!remittance) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Remittance not found</p>
          <Button onClick={() => router.back()} className="mt-4" variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Remittances
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ERA Details</h1>
            <p className="text-gray-600 mt-1">{remittance.remittance_number}</p>
          </div>

          {remittance.status === 'received' && (
            <Button
              onClick={handlePostPayment}
              disabled={posting}
              className="bg-green-600 hover:bg-green-700"
            >
              {posting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Post to Ledger
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payment Summary</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(remittance.status)}`}>
            {remittance.status.charAt(0).toUpperCase() + remittance.status.slice(1)}
          </span>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-2">Payer</p>
            <p className="text-lg font-semibold text-gray-900">{remittance.payer_name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-2">Payment Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(remittance.payment_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-2">Payment Method</p>
            <p className="text-lg font-semibold text-gray-900">{remittance.payment_method.toUpperCase()}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-2">Total Payment</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(remittance.payment_amount)}</p>
          </div>
        </div>

        {remittance.posted_at && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Posted on {new Date(remittance.posted_at).toLocaleString()}
                {remittance.posted_by_name && ` by ${remittance.posted_by_name}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Claim Line Items</h2>

        {remittance.lines && remittance.lines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Billed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allowed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adjustment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Patient Resp.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {remittance.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {line.claim_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(line.billed_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-blue-600">
                      {formatCurrency(line.allowed_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {formatCurrency(line.paid_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-orange-600">
                      {formatCurrency(line.adjustment_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-purple-600">
                      {formatCurrency(line.patient_responsibility)}
                    </td>
                    <td className="px-4 py-3">
                      {line.adjustment_codes && Array.isArray(line.adjustment_codes) && line.adjustment_codes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {line.adjustment_codes.map((code: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-mono"
                              title={`${code.group_code || ''} - $${code.amount || 0}`}
                            >
                              {code.code || code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                      {line.remark_codes && line.remark_codes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {line.remark_codes.map((code, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-4 text-right text-gray-900">Totals:</td>
                  <td className="px-4 py-4 text-right text-gray-900">
                    {formatCurrency(remittance.lines.reduce((sum, line) => sum + line.billed_amount, 0))}
                  </td>
                  <td className="px-4 py-4 text-right text-blue-600">
                    {formatCurrency(remittance.lines.reduce((sum, line) => sum + line.allowed_amount, 0))}
                  </td>
                  <td className="px-4 py-4 text-right text-green-600">
                    {formatCurrency(remittance.lines.reduce((sum, line) => sum + line.paid_amount, 0))}
                  </td>
                  <td className="px-4 py-4 text-right text-orange-600">
                    {formatCurrency(remittance.lines.reduce((sum, line) => sum + line.adjustment_amount, 0))}
                  </td>
                  <td className="px-4 py-4 text-right text-purple-600">
                    {formatCurrency(remittance.lines.reduce((sum, line) => sum + line.patient_responsibility, 0))}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No line items found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      {remittance.status === 'received' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Ready to Post</p>
              <p className="text-sm text-blue-700 mt-1">
                Click "Post to Ledger" to apply these payments to the claims and update the payment ledger.
                This will mark the claims as paid and create accounting journal entries.
              </p>
            </div>
          </div>
        </div>
      )}

      {remittance.status === 'posted' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Payment Posted</p>
              <p className="text-sm text-green-700 mt-1">
                This payment has been successfully posted to the ledger. All associated claims have been updated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
