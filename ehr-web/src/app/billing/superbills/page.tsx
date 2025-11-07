'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import billingService from '@/services/billing.service';

interface Superbill {
  id: string;
  superbill_number: string;
  patient_id: string;
  patient_name: string;
  encounter_id?: string;
  provider_name: string;
  service_date: string;
  total_charge: number;
  diagnosis_count: number;
  procedure_count: number;
  status: 'draft' | 'finalized' | 'billed';
  created_at: string;
}

export default function SuperbillsPage() {
  const router = useRouter();
  const [superbills, setSuperbills] = useState<Superbill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSuperbills();
  }, [statusFilter]);

  const loadSuperbills = async () => {
    try {
      setLoading(true);
      // Fetch all claims without status filter (we'll filter client-side)
      const filters: any = { limit: 100 };
      const data = await billingService.getClaims(filters);

      // Map claims data to superbill format
      const allSuperbills = (Array.isArray(data) ? data : data.data || []).map((claim: any) => ({
        id: claim.id,
        superbill_number: claim.claim_number || 'SB-' + claim.id.slice(0, 8),
        patient_id: claim.patient_id,
        patient_name: claim.patient_name || claim.patient_id,
        encounter_id: claim.encounter_id,
        provider_name: claim.provider_name || 'Provider',
        service_date: claim.service_date_from,
        total_charge: claim.total_charge || 0,
        diagnosis_count: claim.claim_payload?.diagnosisCodes?.length || 0,
        procedure_count: claim.lines?.length || 0,
        status: claim.status === 'submitted' ? 'billed' : claim.status === 'validated' ? 'finalized' : 'draft',
        created_at: claim.created_at
      }));

      // Apply status filter client-side
      const filteredSuperbills = statusFilter === 'all'
        ? allSuperbills
        : allSuperbills.filter((sb: Superbill) => sb.status === statusFilter);

      setSuperbills(filteredSuperbills);
    } catch (error) {
      console.error('Failed to load superbills:', error);
      setSuperbills([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuperbills = superbills.filter((sb) =>
    sb.superbill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sb.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sb.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'finalized': return 'bg-blue-100 text-blue-700';
      case 'billed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Superbills
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Internal billing documents for encounters
            </p>
          </div>
          <button
            onClick={() => router.push('/billing/superbills/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Superbill
          </button>
        </div>
      </div>

      {/* Filters - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search superbills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
            <option value="billed">Billed</option>
          </select>
        </div>
      </div>

      {/* Stats - Compact Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total', count: superbills.length, color: 'text-gray-900' },
          { label: 'Draft', count: superbills.filter(s => s.status === 'draft').length, color: 'text-gray-700' },
          { label: 'Finalized', count: superbills.filter(s => s.status === 'finalized').length, color: 'text-blue-700' },
          { label: 'Billed', count: superbills.filter(s => s.status === 'billed').length, color: 'text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-600 mb-0.5">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Compact Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading superbills...</p>
          </div>
        ) : filteredSuperbills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No Superbills Found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting filters' : 'Create your first superbill'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Superbill #</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Patient</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Provider</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Service Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Dx/Proc</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Charges</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSuperbills.map((sb) => (
                  <tr key={sb.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{sb.superbill_number}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sb.patient_name}</p>
                          <p className="text-xs text-gray-500">{sb.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{sb.provider_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{formatDate(sb.service_date)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                          {sb.diagnosis_count} Dx
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {sb.procedure_count} Proc
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">{formatCurrency(sb.total_charge)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sb.status)}`}>
                        {sb.status.charAt(0).toUpperCase() + sb.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => router.push(`/billing/superbills/${sb.id}`)}
                          className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          View
                        </button>
                        {sb.status === 'draft' && (
                          <button
                            onClick={() => router.push(`/billing/superbills/${sb.id}`)}
                            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {sb.status === 'finalized' && (
                          <button
                            onClick={() => router.push(`/billing/claims/new?superbillId=${sb.id}`)}
                            className="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            Create Claim
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Superbills</strong> are internal billing documents created after encounters. Once finalized, they can be converted to insurance claims for submission.
        </p>
      </div>
    </div>
  );
}
