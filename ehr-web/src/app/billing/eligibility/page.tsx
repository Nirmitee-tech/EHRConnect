'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle, XCircle, Clock, Search, History, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';
import { BillingHeader } from '@/components/billing/billing-header';

interface EligibilityResult {
  status: string;
  coverage: {
    planName?: string;
    copay?: number;
    deductible?: number;
    deductibleRemaining?: number;
    outOfPocketMax?: number;
    effectiveDate?: string;
    terminationDate?: string;
  };
}

interface EligibilityHistory {
  id: string;
  patient_id: string;
  service_date: string;
  eligibility_status: string;
  coverage_details: any;
  checked_at: string;
  payer_name: string;
  checked_by_name: string;
}

export default function EligibilityCheckPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<EligibilityHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [location, setLocation] = useState('all');

  const [formData, setFormData] = useState({
    patientId: '',
    payerId: '',
    memberID: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    serviceDate: new Date().toISOString().split('T')[0],
  });

  const [payers, setPayers] = useState<any[]>([]);

  useEffect(() => {
    loadPayers();
  }, []);

  const loadPayers = async () => {
    try {
      const data = await billingService.getPayers();
      setPayers(data);
    } catch (error) {
      console.error('Failed to load payers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await billingService.checkEligibility(formData);
      setResult(response.data);

      // Refresh history after check
      if (formData.patientId) {
        loadHistory(formData.patientId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (patientId: string) => {
    try {
      const data = await billingService.getEligibilityHistory(patientId, 10);
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-12 w-12 text-red-600" />;
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-600" />;
      default:
        return <AlertCircle className="h-12 w-12 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'inactive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-6">
      <BillingHeader
        title="Insurance Eligibility Verification"
        subtitle="Check patient insurance eligibility and benefits"
        dateRange={dateRange}
        location={location}
        onDateRangeChange={setDateRange}
        onLocationChange={setLocation}
      />

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 space-y-4">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Eligibility Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Check Eligibility</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  Patient Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Patient ID *</Label>
                    <Input
                      required
                      placeholder="Enter FHIR Patient ID"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">FHIR Patient resource ID</p>
                  </div>

                  <div>
                    <Label>Member ID *</Label>
                    <Input
                      required
                      placeholder="Insurance member ID"
                      value={formData.memberID}
                      onChange={(e) => setFormData({ ...formData, memberID: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      required
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      required
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input
                      required
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Service Date *</Label>
                    <Input
                      required
                      type="date"
                      value={formData.serviceDate}
                      onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  Insurance Information
                </h3>

                <div>
                  <Label>Insurance Payer *</Label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.payerId}
                    onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
                  >
                    <option value="">Select payer...</option>
                    {payers.map((payer) => (
                      <option key={payer.id} value={payer.payer_id || payer.id}>
                        {payer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Eligibility Check Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Check Eligibility
                    </>
                  )}
                </Button>

                {formData.patientId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadHistory(formData.patientId)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          {result ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Eligibility Result</h2>

              <div className={`rounded-xl p-6 border-2 ${getStatusColor(result.status)} mb-6 text-center`}>
                <div className="flex justify-center mb-3">
                  {getStatusIcon(result.status)}
                </div>
                <p className="text-2xl font-bold capitalize">{result.status} Coverage</p>
              </div>

              {result.coverage && (
                <div className="space-y-4">
                  {result.coverage.planName && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Plan Name</p>
                      <p className="text-lg font-semibold text-gray-900">{result.coverage.planName}</p>
                    </div>
                  )}

                  {result.coverage.copay !== undefined && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Copay</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${result.coverage.copay.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {result.coverage.deductible !== undefined && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Deductible</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-semibold text-gray-900">
                          ${result.coverage.deductibleRemaining?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-500">
                          / ${result.coverage.deductible.toFixed(2)} remaining
                        </p>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{
                            width: `${((result.coverage.deductible - (result.coverage.deductibleRemaining || 0)) / result.coverage.deductible) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {result.coverage.outOfPocketMax !== undefined && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Out of Pocket Max</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${result.coverage.outOfPocketMax.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {(result.coverage.effectiveDate || result.coverage.terminationDate) && (
                    <div className="pt-4 border-t">
                      {result.coverage.effectiveDate && (
                        <p className="text-sm text-gray-600">
                          <strong>Effective:</strong> {new Date(result.coverage.effectiveDate).toLocaleDateString()}
                        </p>
                      )}
                      {result.coverage.terminationDate && (
                        <p className="text-sm text-gray-600">
                          <strong>Terminates:</strong> {new Date(result.coverage.terminationDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No Results Yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Fill out the form and click "Check Eligibility" to verify insurance coverage
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {showHistory && history.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-6 w-6" />
              Eligibility History
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>
              Hide History
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Checked</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(item.checked_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(item.service_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.payer_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.eligibility_status)}`}>
                        {item.eligibility_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.coverage_details?.planName || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.checked_by_name || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
