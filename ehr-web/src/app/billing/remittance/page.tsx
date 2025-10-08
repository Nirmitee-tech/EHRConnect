'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Receipt, Download, Eye, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import billingService from '@/services/billing.service';
import { useRouter } from 'next/navigation';

interface Remittance {
  id: string;
  remittance_number: string;
  payment_method: string;
  payment_amount: number;
  payment_date: string;
  status: string;
  received_at: string;
  payer_name: string;
  posted_by_name?: string;
}

export default function RemittancePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRemittances();
  }, [statusFilter]);

  const loadRemittances = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 100 };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const data = await billingService.getRemittances(filters);
      setRemittances(data);
    } catch (error) {
      console.error('Failed to load remittances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNew = async () => {
    setFetching(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await billingService.fetchRemittanceFiles(startDate, endDate);
      alert('ERA fetch initiated! New files will appear shortly.');
      setTimeout(() => loadRemittances(), 2000);
    } catch (error) {
      alert('Failed to fetch ERA files');
    } finally {
      setFetching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'posted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reconciled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Clock className="h-4 w-4" />;
      case 'posted':
      case 'reconciled':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: any = {
      eft: 'EFT',
      check: 'Check',
      credit_card: 'Credit Card',
      other: 'Other',
    };
    return labels[method] || method;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="h-8 w-8 text-indigo-600" />
              Electronic Remittance Advice (ERA)
            </h1>
            <p className="text-gray-600 mt-1">
              View and post payment remittances from insurance payers
            </p>
          </div>
          <Button
            onClick={handleFetchNew}
            disabled={fetching}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {fetching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Fetching...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Fetch New ERA Files
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-gray-700">Status Filter:</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="posted">Posted</option>
            <option value="reconciled">Reconciled</option>
            <option value="disputed">Disputed</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Total: <span className="font-semibold">{remittances.length}</span> ERA files
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Received',
            count: remittances.filter(r => r.status === 'received').length,
            amount: remittances.filter(r => r.status === 'received').reduce((sum, r) => sum + r.payment_amount, 0),
            color: 'blue'
          },
          {
            label: 'Posted',
            count: remittances.filter(r => r.status === 'posted').length,
            amount: remittances.filter(r => r.status === 'posted').reduce((sum, r) => sum + r.payment_amount, 0),
            color: 'green'
          },
          {
            label: 'Reconciled',
            count: remittances.filter(r => r.status === 'reconciled').length,
            amount: remittances.filter(r => r.status === 'reconciled').reduce((sum, r) => sum + r.payment_amount, 0),
            color: 'purple'
          },
          {
            label: 'Total Amount',
            count: remittances.length,
            amount: remittances.reduce((sum, r) => sum + r.payment_amount, 0),
            color: 'indigo'
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>
              {formatCurrency(stat.amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.count} ERA files</p>
          </div>
        ))}
      </div>

      {/* Remittance List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading remittances...</p>
          </div>
        ) : remittances.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No Remittances Found</p>
            <p className="text-sm text-gray-500 mt-2">
              {statusFilter !== 'all'
                ? 'Try adjusting your filter'
                : 'Fetch ERA files from Claim.MD to get started'}
            </p>
            {statusFilter === 'all' && (
              <Button
                onClick={handleFetchNew}
                disabled={fetching}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Fetch ERA Files
              </Button>
            )}
          </div>
        ) : (
          remittances.map((remittance) => (
            <div
              key={remittance.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{remittance.remittance_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(remittance.status)}`}>
                        {getStatusIcon(remittance.status)}
                        {remittance.status.charAt(0).toUpperCase() + remittance.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {getPaymentMethodLabel(remittance.payment_method)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payer</p>
                        <p className="text-sm font-semibold text-gray-900">{remittance.payer_name}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Date</p>
                        <p className="text-sm text-gray-900">
                          {new Date(remittance.payment_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Received</p>
                        <p className="text-sm text-gray-900">
                          {new Date(remittance.received_at).toLocaleDateString()}
                        </p>
                      </div>

                      {remittance.posted_by_name && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Posted By</p>
                          <p className="text-sm text-gray-900">{remittance.posted_by_name}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(remittance.payment_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => router.push(`/billing/remittance/${remittance.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {remittance.status === 'received' && (
                      <Button
                        onClick={() => router.push(`/billing/remittance/${remittance.id}`)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Post Payment
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
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}
