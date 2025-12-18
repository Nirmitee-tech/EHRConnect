'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileCheck, Plus, Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import billingService from '@/services/billing.service';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface PriorAuth {
  id: string;
  auth_number: string;
  patient_id: string;
  status: string;
  cpt_codes: string[];
  icd_codes: string[];
  requested_date: string;
  valid_from?: string;
  valid_to?: string;
  payer_name: string;
  requested_by_name: string;
  denial_reason?: string;
}

export default function PriorAuthorizationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [priorAuths, setPriorAuths] = useState<PriorAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPriorAuths();
  }, [statusFilter]);

  const loadPriorAuths = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 100 };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const data = await billingService.getPriorAuthorizations(filters);
      setPriorAuths(data);
    } catch (error) {
      console.error('Failed to load prior authorizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  const filteredPriorAuths = priorAuths.filter((pa) =>
    pa.auth_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pa.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pa.payer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-8 w-8 text-purple-600" />
              Prior Authorizations
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track prior authorization requests
            </p>
          </div>
          <Button
            onClick={() => router.push('/billing/prior-auth/new')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit New Prior Auth
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-2 block text-sm font-medium text-gray-700">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by auth number, patient ID, or payer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700">Status Filter</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prior Auth List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading prior authorizations...</p>
          </div>
        ) : filteredPriorAuths.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No Prior Authorizations Found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Submit a new prior authorization to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={() => router.push('/billing/prior-auth/new')}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit New Prior Auth
              </Button>
            )}
          </div>
        ) : (
          filteredPriorAuths.map((pa) => (
            <div
              key={pa.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {pa.auth_number || 'Pending Auth Number'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(pa.status)}`}>
                        {getStatusIcon(pa.status)}
                        {pa.status.charAt(0).toUpperCase() + pa.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Patient ID</p>
                        <p className="text-sm font-semibold text-gray-900">{pa.patient_id}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payer</p>
                        <p className="text-sm font-semibold text-gray-900">{pa.payer_name}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Requested Date</p>
                        <p className="text-sm text-gray-900">
                          {new Date(pa.requested_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Requested By</p>
                        <p className="text-sm text-gray-900">{pa.requested_by_name || 'System'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">CPT Codes</p>
                        <div className="flex flex-wrap gap-1">
                          {pa.cpt_codes.map((code, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-mono"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">ICD Codes</p>
                        <div className="flex flex-wrap gap-1">
                          {pa.icd_codes.map((code, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-mono"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {pa.status === 'approved' && (pa.valid_from || pa.valid_to) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-green-800">
                          <strong>Valid Period:</strong>{' '}
                          {pa.valid_from && new Date(pa.valid_from).toLocaleDateString()}{' '}
                          {pa.valid_to && `- ${new Date(pa.valid_to).toLocaleDateString()}`}
                        </p>
                      </div>
                    )}

                    {pa.status === 'denied' && pa.denial_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-800">
                          <strong>Denial Reason:</strong> {pa.denial_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => router.push(`/billing/prior-auth/${pa.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}
