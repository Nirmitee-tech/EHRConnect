'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileCheck, ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import billingService from '@/services/billing.service';

interface PriorAuthDetail {
  id: string;
  auth_number: string;
  patient_id: string;
  encounter_id?: string;
  payer_id: string;
  payer_name?: string;
  provider_npi: string;
  cpt_codes: string[];
  icd_codes: string[];
  units?: number;
  service_location?: string;
  status: string;
  requested_date: string;
  valid_from?: string;
  valid_to?: string;
  denial_reason?: string;
  notes?: string;
  request_payload?: any;
  response_payload?: any;
  requested_by_name?: string;
  readiness_score?: number;
  readiness_passed?: boolean;
  readiness_notes?: string;
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'denied':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'expired':
      return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'denied':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'expired':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function PriorAuthDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<PriorAuthDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDetail = async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      setError('');
      const data = await billingService.getPriorAuthDetail(params.id);
      setDetail(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load prior authorization');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    if (!detail?.auth_number) return;
    try {
      setRefreshing(true);
      setError('');
      await billingService.checkPriorAuthStatus(detail.auth_number);
      await loadDetail();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      loadDetail();
    }
  }, [params?.id]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck className="h-8 w-8 text-purple-600" />
          Prior Authorization Detail
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      ) : !detail ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-600">
          Not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detail.auth_number || 'Pending Auth Number'}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColor(detail.status)}`}>
                    {statusIcon(detail.status)}
                    {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                  </span>
                  {typeof detail.readiness_score === 'number' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${detail.readiness_passed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      Readiness {detail.readiness_score}/5
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Requested on {new Date(detail.requested_date).toLocaleDateString()}
                  {detail.requested_by_name ? ` • Requested by ${detail.requested_by_name}` : ''}
                </p>
              </div>
              <Button onClick={refreshStatus} disabled={refreshing || !detail.auth_number} variant="outline">
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <InfoBlock label="Patient ID" value={detail.patient_id} />
              <InfoBlock label="Encounter ID" value={detail.encounter_id || '—'} />
              <InfoBlock label="Payer" value={detail.payer_name || detail.payer_id} />
              <InfoBlock label="Provider NPI" value={detail.provider_npi} />
              <InfoBlock label="Service Location" value={detail.service_location || '—'} />
              <InfoBlock label="Units" value={detail.units || 1} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <InfoBlock
                label="CPT Codes"
                value={
                  <TagList items={detail.cpt_codes} colorClass="bg-blue-50 text-blue-700 border-blue-200" />
                }
              />
              <InfoBlock
                label="ICD Codes"
                value={
                  <TagList items={detail.icd_codes} colorClass="bg-purple-50 text-purple-700 border-purple-200" />
                }
              />
            </div>

            {detail.status === 'approved' && (detail.valid_from || detail.valid_to) && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <strong>Valid:</strong>{' '}
                {detail.valid_from && new Date(detail.valid_from).toLocaleDateString()} {' - '}
                {detail.valid_to && new Date(detail.valid_to).toLocaleDateString()}
              </div>
            )}

            {detail.status === 'denied' && detail.denial_reason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <strong>Denial Reason:</strong> {detail.denial_reason}
              </div>
            )}

            {detail.notes && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{detail.notes}</p>
              </div>
            )}

            {detail.readiness_notes && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <strong>Readiness Notes:</strong> {detail.readiness_notes}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Payload</h3>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-auto">
              {JSON.stringify(detail.request_payload, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Latest Response</h3>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-auto">
              {JSON.stringify(detail.response_payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function TagList({ items, colorClass }: { items: string[]; colorClass: string }) {
  if (!items?.length) return <span className="text-sm text-gray-600">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`px-2 py-1 text-xs rounded border font-mono ${colorClass}`}>
          {item}
        </span>
      ))}
    </div>
  );
}
