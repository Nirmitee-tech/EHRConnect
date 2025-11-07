'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Plus, Search, Filter, Eye, Edit, Send, RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';
import { useRouter } from 'next/navigation';
import { BillingHeader } from '@/components/billing/billing-header';

interface Claim {
  id: string;
  claim_number: string;
  claim_md_id: string;
  patient_id: string;
  payer_name: string;
  status: string;
  service_date_from: string;
  service_date_to: string;
  total_charge: number;
  total_paid: number;
  submission_date: string;
  created_at: string;
  rejection_reason?: string;
  denial_reason?: string;
}

export default function ClaimsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [location, setLocation] = useState('all');

  useEffect(() => {
    loadClaims();
  }, [statusFilter]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 100 };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const data = await billingService.getClaims(filters);
      setClaims(data);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'validated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'denied':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <DollarSign className="h-4 w-4" />;
      case 'denied':
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      case 'submitted':
      case 'accepted':
        return <Send className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredClaims = claims.filter((claim) =>
    claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.payer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      <BillingHeader
        title="Claims Management"
        subtitle="Create, submit, and track insurance claims"
        dateRange={dateRange}
        location={location}
        onDateRangeChange={setDateRange}
        onLocationChange={setLocation}
      >
        <Button
          onClick={() => router.push('/billing/claims/new')}
          size="sm"
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Claim
        </Button>
      </BillingHeader>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 space-y-4">

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-2 block text-sm font-medium text-gray-700">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by claim number, patient ID, or payer..."
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
              <option value="draft">Draft</option>
              <option value="validated">Validated</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="paid">Paid</option>
              <option value="denied">Denied</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Claims', count: claims.length, color: 'blue' },
          { label: 'Draft', count: claims.filter(c => c.status === 'draft').length, color: 'gray' },
          { label: 'Submitted', count: claims.filter(c => ['submitted', 'accepted'].includes(c.status)).length, color: 'yellow' },
          { label: 'Paid', count: claims.filter(c => c.status === 'paid').length, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No Claims Found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create a new claim to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={() => router.push('/billing/claims/new')}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Claim
              </Button>
            )}
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{claim.claim_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                      {claim.claim_md_id && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-mono">
                          {claim.claim_md_id}
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Patient ID</p>
                        <p className="text-sm font-semibold text-gray-900">{claim.patient_id}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payer</p>
                        <p className="text-sm font-semibold text-gray-900">{claim.payer_name}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Service Date</p>
                        <p className="text-sm text-gray-900">
                          {new Date(claim.service_date_from).toLocaleDateString()}
                          {claim.service_date_from !== claim.service_date_to &&
                            ` - ${new Date(claim.service_date_to).toLocaleDateString()}`
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created</p>
                        <p className="text-sm text-gray-900">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Charge</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(claim.total_charge)}</p>
                      </div>

                      {claim.total_paid > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Paid</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(claim.total_paid)}</p>
                        </div>
                      )}

                      {claim.status === 'paid' && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Outstanding</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatCurrency(claim.total_charge - claim.total_paid)}
                          </p>
                        </div>
                      )}
                    </div>

                    {(claim.rejection_reason || claim.denial_reason) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Reason:</strong> {claim.rejection_reason || claim.denial_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => router.push(`/billing/claims/${claim.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>

                    {claim.status === 'draft' && (
                      <Button
                        onClick={() => router.push(`/billing/claims/${claim.id}`)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}

                    {claim.status === 'validated' && (
                      <Button
                        onClick={async () => {
                          try {
                            await billingService.submitClaim(claim.id);
                            loadClaims();
                          } catch (error) {
                            alert('Failed to submit claim');
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    )}

                    {['denied', 'rejected'].includes(claim.status) && (
                      <Button
                        onClick={() => router.push(`/billing/claims/${claim.id}`)}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resubmit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
