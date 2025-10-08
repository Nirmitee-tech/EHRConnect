'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileCheck, ArrowLeft, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';
import { useRouter } from 'next/navigation';

export default function NewPriorAuthPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [authNumber, setAuthNumber] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    encounterId: '',
    payerId: '',
    providerNPI: '',
    cptCodes: [] as string[],
    icdCodes: [] as string[],
    units: 1,
    serviceLocation: '',
    notes: '',
  });

  const [cptInput, setCptInput] = useState('');
  const [icdInput, setIcdInput] = useState('');
  const [payers, setPayers] = useState<any[]>([]);
  const [cptSuggestions, setCptSuggestions] = useState<any[]>([]);
  const [icdSuggestions, setIcdSuggestions] = useState<any[]>([]);

  useEffect(() => {
    loadPayers();
  }, []);

  useEffect(() => {
    if (cptInput.length >= 2) {
      searchCPTCodes(cptInput);
    } else {
      setCptSuggestions([]);
    }
  }, [cptInput]);

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

  const searchCPTCodes = async (search: string) => {
    try {
      const data = await billingService.getCPTCodes(search, 10);
      setCptSuggestions(data);
    } catch (error) {
      console.error('Failed to search CPT codes:', error);
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

  const addCPTCode = (code: string) => {
    if (code && !formData.cptCodes.includes(code)) {
      setFormData({ ...formData, cptCodes: [...formData.cptCodes, code] });
      setCptInput('');
      setCptSuggestions([]);
    }
  };

  const removeCPTCode = (code: string) => {
    setFormData({ ...formData, cptCodes: formData.cptCodes.filter((c) => c !== code) });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await billingService.submitPriorAuthorization(formData);
      setSuccess(true);
      setAuthNumber(response.data.authNumber);

      setTimeout(() => {
        router.push('/billing/prior-auth');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit prior authorization');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prior Authorization Submitted!</h2>
          <p className="text-lg text-gray-600 mb-2">
            Your prior authorization request has been submitted successfully.
          </p>
          {authNumber && (
            <p className="text-lg font-semibold text-purple-600 mb-6">
              Authorization Number: {authNumber}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-8">
            You will be redirected to the prior authorizations list shortly...
          </p>
          <Button onClick={() => router.push('/billing/prior-auth')} className="bg-purple-600 hover:bg-purple-700">
            Go to Prior Authorizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-purple-600" />
            Submit Prior Authorization
          </h1>
          <p className="text-gray-600 mt-1">
            Request prior authorization for medical services
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient & Encounter Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              Patient & Encounter Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
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
                <Label>Encounter ID (Optional)</Label>
                <Input
                  placeholder="FHIR Encounter ID"
                  value={formData.encounterId}
                  onChange={(e) => setFormData({ ...formData, encounterId: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Provider & Payer Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              Provider & Payer Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Provider NPI *</Label>
                <Input
                  required
                  placeholder="10-digit NPI number"
                  maxLength={10}
                  value={formData.providerNPI}
                  onChange={(e) => setFormData({ ...formData, providerNPI: e.target.value.replace(/\D/g, '') })}
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
                    <option key={payer.id} value={payer.payer_id || payer.id}>
                      {payer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              Service Details
            </h2>

            {/* CPT Codes */}
            <div>
              <Label>CPT Codes * (Procedure Codes)</Label>
              <div className="relative">
                <Input
                  placeholder="Search CPT codes (e.g., 99213, office visit)..."
                  value={cptInput}
                  onChange={(e) => setCptInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (cptInput) addCPTCode(cptInput);
                    }
                  }}
                />
                {cptSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {cptSuggestions.map((cpt) => (
                      <button
                        key={cpt.code}
                        type="button"
                        onClick={() => addCPTCode(cpt.code)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <span className="font-mono font-semibold text-blue-600">{cpt.code}</span>
                        <span className="text-gray-600 text-sm ml-2">- {cpt.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formData.cptCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.cptCodes.map((code) => (
                    <span
                      key={code}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2 border border-blue-200"
                    >
                      <span className="font-mono font-semibold">{code}</span>
                      <button
                        type="button"
                        onClick={() => removeCPTCode(code)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {formData.cptCodes.length === 0 && (
                <p className="text-xs text-red-600 mt-1">At least one CPT code is required</p>
              )}
            </div>

            {/* ICD Codes */}
            <div>
              <Label>ICD Codes * (Diagnosis Codes)</Label>
              <div className="relative">
                <Input
                  placeholder="Search ICD codes (e.g., E11.9, diabetes)..."
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

              {formData.icdCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.icdCodes.map((code) => (
                    <span
                      key={code}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg flex items-center gap-2 border border-purple-200"
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
              )}
              {formData.icdCodes.length === 0 && (
                <p className="text-xs text-red-600 mt-1">At least one ICD code is required</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Units</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <Label>Service Location (Optional)</Label>
                <Input
                  placeholder="e.g., Office, Hospital, Home"
                  value={formData.serviceLocation}
                  onChange={(e) => setFormData({ ...formData, serviceLocation: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">
              Additional Information
            </h2>

            <div>
              <Label>Clinical Notes (Optional)</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[120px]"
                placeholder="Provide any additional clinical information to support the prior authorization request..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Submission Failed</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.cptCodes.length === 0 || formData.icdCodes.length === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Submit Prior Authorization
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
