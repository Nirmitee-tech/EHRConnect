'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, CheckCircle, AlertCircle, Plus, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';

type Tab = 'diagnosis' | 'procedures' | 'provider' | 'insurance' | 'summary';

interface ClaimLine {
  lineNumber: number;
  serviceDate: string;
  placeOfService: string;
  cptCode: string;
  modifiers: string[];
  icdCodes: string[];
  units: number;
  chargeAmount: number;
  renderingProviderNpi?: string;
}

export default function ClaimEditorPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  const isNew = claimId === 'new';

  const [activeTab, setActiveTab] = useState<Tab>('diagnosis');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    patientId: '',
    encounterId: '',
    payerId: '',
    locationId: '',
    authId: '',
    authNumber: '',
    claimType: 'professional' as 'professional' | 'institutional',
    billingProviderNpi: '',
    renderingProviderNpi: '',
    serviceLocationNpi: '',
    subscriberMemberId: '',
    patientAccountNumber: '',
    serviceDateFrom: new Date().toISOString().split('T')[0],
    serviceDateTo: new Date().toISOString().split('T')[0],
    icdCodes: [] as string[],
    lines: [] as ClaimLine[],
  });

  const [claim, setClaim] = useState<any>(null);
  const [payers, setPayers] = useState<any[]>([]);
  const [icdInput, setIcdInput] = useState('');
  const [icdSuggestions, setIcdSuggestions] = useState<any[]>([]);

  useEffect(() => {
    loadPayers();
    if (!isNew) {
      loadClaim();
    }
  }, []);

  useEffect(() => {
    if (icdInput.length >= 2) {
      searchICDCodes(icdInput);
    } else {
      setIcdSuggestions([]);
    }
  }, [icdInput]);

  const loadPayers = async () => {
    try {
      const data = await billingService.getPayers();
      setPayers(data);
    } catch (error) {
      console.error('Failed to load payers:', error);
    }
  };

  const loadClaim = async () => {
    try {
      const data = await billingService.getClaimDetail(claimId);
      setClaim(data);

      // Populate form
      setFormData({
        patientId: data.patient_id || '',
        encounterId: data.encounter_id || '',
        payerId: data.payer_id || '',
        locationId: data.location_id || '',
        authId: data.auth_id || '',
        authNumber: data.auth_number || '',
        claimType: data.claim_type || 'professional',
        billingProviderNpi: data.billing_provider_npi || '',
        renderingProviderNpi: data.rendering_provider_npi || '',
        serviceLocationNpi: data.service_location_npi || '',
        subscriberMemberId: data.subscriber_member_id || '',
        patientAccountNumber: data.patient_account_number || '',
        serviceDateFrom: data.service_date_from || '',
        serviceDateTo: data.service_date_to || '',
        icdCodes: data.claim_payload?.icdCodes || [],
        lines: data.lines || [],
      });
    } catch (error) {
      console.error('Failed to load claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchICDCodes = async (search: string) => {
    try {
      const data = await billingService.getICDCodes(search, 10);
      setIcdSuggestions(data);
    } catch (error) {
      console.error('Failed to search ICD codes:', error);
    }
  };

  const addICDCode = (code: string) => {
    if (code && !formData.icdCodes.includes(code)) {
      setFormData({ ...formData, icdCodes: [...formData.icdCodes, code] });
      setIcdInput('');
      setIcdSuggestions([]);
    }
  };

  const removeICDCode = (code: string) => {
    setFormData({ ...formData, icdCodes: formData.icdCodes.filter((c) => c !== code) });
  };

  const addLine = () => {
    const newLine: ClaimLine = {
      lineNumber: formData.lines.length + 1,
      serviceDate: formData.serviceDateFrom,
      placeOfService: '11',
      cptCode: '',
      modifiers: [],
      icdCodes: formData.icdCodes,
      units: 1,
      chargeAmount: 0,
    };
    setFormData({ ...formData, lines: [...formData.lines, newLine] });
  };

  const updateLine = (index: number, updates: Partial<ClaimLine>) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], ...updates };
    setFormData({ ...formData, lines: newLines });
  };

  const removeLine = (index: number) => {
    setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== index) });
  };

  const calculateTotalCharge = () => {
    return formData.lines.reduce((sum, line) => sum + (line.chargeAmount * line.units), 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const claimData = {
        ...formData,
        totalCharge: calculateTotalCharge(),
      };

      if (isNew) {
        const result = await billingService.createClaim(claimData);
        alert('Claim saved as draft!');
        router.push(`/billing/claims/${result.id}`);
      } else {
        await billingService.updateClaim(claimId, claimData);
        alert('Claim updated!');
        loadClaim();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save claim');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setErrors([]);
    try {
      const result = await billingService.validateClaim(claimId);
      if (result.valid) {
        alert('Claim is valid and ready to submit!');
        loadClaim();
      } else {
        setErrors(result.errors);
        alert('Claim has validation errors. Please fix them before submitting.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await billingService.submitClaim(claimId);
      alert(`Claim submitted successfully! Control Number: ${result.data.controlNumber}`);
      router.push('/billing/claims');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'diagnosis' as Tab, label: 'Diagnosis', icon: '🩺' },
    { id: 'procedures' as Tab, label: 'Procedures', icon: '💉' },
    { id: 'provider' as Tab, label: 'Provider', icon: '👨‍⚕️' },
    { id: 'insurance' as Tab, label: 'Insurance', icon: '🏥' },
    { id: 'summary' as Tab, label: 'Summary', icon: '📋' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim...</p>
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
          Back to Claims
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create New Claim' : `Edit Claim: ${claim?.claim_number}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isNew ? 'Create a new insurance claim' : 'Edit claim details and submit'}
            </p>
          </div>

          <div className="flex gap-2">
            {!isNew && claim?.status === 'draft' && (
              <Button onClick={handleValidate} variant="outline" disabled={validating}>
                {validating ? 'Validating...' : 'Validate'}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            {!isNew && claim?.status === 'validated' && (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Validation Errors:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {/* Diagnosis Tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnosis Codes (ICD-10)</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add diagnosis codes that support the medical necessity of the services provided.
                </p>

                <div className="relative mb-4">
                  <Label>Search ICD-10 Codes</Label>
                  <Input
                    placeholder="Search by code or description..."
                    value={icdInput}
                    onChange={(e) => setIcdInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (icdInput) addICDCode(icdInput);
                      }
                    }}
                  />
                  {icdSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {icdSuggestions.map((icd) => (
                        <button
                          key={icd.code}
                          type="button"
                          onClick={() => addICDCode(icd.code)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <span className="font-mono font-semibold text-purple-600">{icd.code}</span>
                          <span className="text-gray-600 text-sm ml-2">- {icd.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.icdCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.icdCodes.map((code) => (
                      <span
                        key={code}
                        className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-2 border border-purple-200"
                      >
                        <span className="font-mono font-semibold">{code}</span>
                        <button
                          type="button"
                          onClick={() => removeICDCode(code)}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No diagnosis codes added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Search and add ICD-10 codes above</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Procedures Tab */}
          {activeTab === 'procedures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Procedure Line Items</h2>
                  <p className="text-sm text-gray-600 mt-1">Add services and procedures performed</p>
                </div>
                <Button onClick={addLine} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>

              {formData.lines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPT</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">POS</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lines.map((line, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="date"
                              value={line.serviceDate}
                              onChange={(e) => updateLine(idx, { serviceDate: e.target.value })}
                              className="w-32"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="CPT"
                              value={line.cptCode}
                              onChange={(e) => updateLine(idx, { cptCode: e.target.value })}
                              className="w-24 font-mono"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="11"
                              value={line.placeOfService}
                              onChange={(e) => updateLine(idx, { placeOfService: e.target.value })}
                              className="w-16"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="1"
                              value={line.units}
                              onChange={(e) => updateLine(idx, { units: parseInt(e.target.value) || 1 })}
                              className="w-16"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={line.chargeAmount}
                              onChange={(e) => updateLine(idx, { chargeAmount: parseFloat(e.target.value) || 0 })}
                              className="w-24"
                            />
                          </td>
                          <td className="px-3 py-2 font-semibold text-sm">
                            ${(line.chargeAmount * line.units).toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              onClick={() => removeLine(idx)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={6} className="px-3 py-3 text-right">Total Charge:</td>
                        <td className="px-3 py-3 text-lg text-green-600">
                          ${calculateTotalCharge().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-2">No line items added yet</p>
                  <Button onClick={addLine} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Line Item
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Provider Tab */}
          {activeTab === 'provider' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Provider Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Billing Provider NPI *</Label>
                  <Input
                    required
                    placeholder="10-digit NPI"
                    maxLength={10}
                    value={formData.billingProviderNpi}
                    onChange={(e) => setFormData({ ...formData, billingProviderNpi: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-xs text-gray-500 mt-1">National Provider Identifier for billing</p>
                </div>

                <div>
                  <Label>Rendering Provider NPI</Label>
                  <Input
                    placeholder="10-digit NPI (optional)"
                    maxLength={10}
                    value={formData.renderingProviderNpi}
                    onChange={(e) => setFormData({ ...formData, renderingProviderNpi: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Provider who performed the service</p>
                </div>

                <div>
                  <Label>Service Location NPI</Label>
                  <Input
                    placeholder="10-digit NPI (optional)"
                    maxLength={10}
                    value={formData.serviceLocationNpi}
                    onChange={(e) => setFormData({ ...formData, serviceLocationNpi: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Where service was performed</p>
                </div>
              </div>
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Insurance & Patient Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Patient ID *</Label>
                  <Input
                    required
                    placeholder="FHIR Patient ID"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Encounter ID</Label>
                  <Input
                    placeholder="FHIR Encounter ID (optional)"
                    value={formData.encounterId}
                    onChange={(e) => setFormData({ ...formData, encounterId: e.target.value })}
                  />
                </div>

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
                      <option key={payer.id} value={payer.id}>
                        {payer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Subscriber Member ID *</Label>
                  <Input
                    required
                    placeholder="Insurance member ID"
                    value={formData.subscriberMemberId}
                    onChange={(e) => setFormData({ ...formData, subscriberMemberId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Patient Account Number</Label>
                  <Input
                    placeholder="Internal account number"
                    value={formData.patientAccountNumber}
                    onChange={(e) => setFormData({ ...formData, patientAccountNumber: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Prior Authorization Number</Label>
                  <Input
                    placeholder="If applicable"
                    value={formData.authNumber}
                    onChange={(e) => setFormData({ ...formData, authNumber: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Service Date From *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.serviceDateFrom}
                    onChange={(e) => setFormData({ ...formData, serviceDateFrom: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Service Date To *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.serviceDateTo}
                    onChange={(e) => setFormData({ ...formData, serviceDateTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Summary</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Patient ID</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.patientId || 'Not set'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Payer</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {payers.find(p => p.id === formData.payerId)?.name || 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Service Period</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.serviceDateFrom && formData.serviceDateTo
                        ? `${new Date(formData.serviceDateFrom).toLocaleDateString()} - ${new Date(formData.serviceDateTo).toLocaleDateString()}`
                        : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Diagnosis Codes</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.icdCodes.length > 0 ? (
                        formData.icdCodes.map(code => (
                          <span key={code} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-mono">
                            {code}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">None added</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Line Items</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.lines.length} procedure(s)</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Total Charge</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${calculateTotalCharge().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Ready to Submit?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Review all information above. Click "Validate" to check for errors, then "Submit Claim" to send to the payer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
