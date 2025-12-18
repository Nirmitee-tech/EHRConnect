'use client';

import { ClaimForm as SuperbillForm } from '@/components/billing/ClaimForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClaimFormData, ClaimProvider, ClaimInsurance, EligibilityCheck } from '@/types/claim';
import { useEffect, useState } from 'react';
import billingService from '@/services/billing.service';
import { fhirService } from '@/lib/medplum';
import { Search, User } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function CreateSuperbillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get params from URL
  const urlPatientId = searchParams?.get('patientId') ?? null;
  const appointmentId = searchParams?.get('appointmentId');
  const appointmentDate = searchParams?.get('appointmentDate');

  // State
  const [patientId, setPatientId] = useState<string | null>(urlPatientId);
  const [loading, setLoading] = useState(!!urlPatientId);
  const [patient, setPatient] = useState<any>(null);
  const [providers, setProviders] = useState<ClaimProvider[]>([]);
  const [insurances, setInsurances] = useState<ClaimInsurance[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityCheck | undefined>(undefined);

  // Patient search state
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  // Search patients effect
  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearchTerm.length < 2) {
        setPatientSearchResults([]);
        return;
      }

      setSearchingPatients(true);
      try {
        const results = await fhirService.search('Patient', {
          _count: 20,
          name: patientSearchTerm
        });

        const patients = results.entry?.map((entry: any) => entry.resource) || [];
        setPatientSearchResults(patients);
      } catch (error) {
        console.error('Error searching patients:', error);
        setPatientSearchResults([]);
      } finally {
        setSearchingPatients(false);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [patientSearchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch patient data from FHIR
      const patientData = await fhirService.getPatientById(patientId!);
      setPatient(patientData);

      // Fetch providers from billing service
      const providersResponse = await billingService.getProviders({ limit: 100 });
      const providersData = providersResponse.data || providersResponse;

      // Map provider data to ClaimProvider format
      const mappedProviders: ClaimProvider[] = (Array.isArray(providersData) ? providersData : []).map((p: any) => ({
        id: p.id || p.npi,
        name: p.name || `${p.firstName} ${p.lastName}`,
        npi: p.npi,
        taxonomyCode: p.taxonomyCode || p.specialty || '207Q00000X',
        taxId: p.taxId || p.tin || '',
        address: {
          street: p.address?.line?.[0] || p.address?.street || '',
          city: p.address?.city || '',
          state: p.address?.state || '',
          zip: p.address?.postalCode || p.address?.zip || ''
        },
        phone: p.phone || p.telecom?.find((t: any) => t.system === 'phone')?.value || ''
      }));
      setProviders(mappedProviders);

      // Fetch patient insurance/coverage from FHIR
      const coverageResponse = await fhirService.search('Coverage', {
        patient: patientId!,
        status: 'active',
        _count: 10
      });

      const coverages = coverageResponse.entry || [];
      const mappedInsurances: ClaimInsurance[] = coverages
        .filter((entry: any) => entry.resource.resourceType === 'Coverage')
        .map((entry: any, index: number) => {
          const coverage = entry.resource;
          const order = coverage.order || (index + 1);

          return {
            payerId: coverage.payor?.[0]?.identifier?.value || `PAY${index + 1}`,
            payerName: coverage.payor?.[0]?.display || 'Unknown Payer',
            memberIdNumber: coverage.subscriberId || '',
            groupNumber: coverage.class?.find((c: any) => c.type?.coding?.[0]?.code === 'group')?.value || '',
            planName: coverage.type?.text || coverage.class?.[0]?.name || 'Unknown Plan',
            policyHolderName: coverage.subscriber?.display || coverage.policyHolder?.display || '',
            policyHolderRelationship: coverage.relationship?.coding?.[0]?.code || 'self',
            insuranceType: order === 1 ? 'primary' : order === 2 ? 'secondary' : 'tertiary',
            priorAuthNumber: coverage.extension?.find((e: any) => e.url?.includes('prior-auth'))?.valueString
          };
        });

      setInsurances(mappedInsurances);

    } catch (error) {
      console.error('Error loading claim data:', error);
      alert('Failed to load claim data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (data: ClaimFormData) => {
    try {
      if (!patient) {
        alert('Patient data not loaded');
        return;
      }

      // Map form data to API format (same as submit but status = draft)
      const claimData: any = {
        patientId: patientId!,
        ...(appointmentId && { encounterId: appointmentId }),
        payerId: data.primaryInsuranceId || 'PENDING',
        claimType: (data.claimType || 'professional') as 'professional' | 'institutional',
        billingProviderNpi: providers.find(p => p.id === data.billingProviderId)?.npi || '',
        renderingProviderNpi: providers.find(p => p.id === data.renderingProviderId)?.npi,
        serviceLocationNpi: providers.find(p => p.id === data.facilityProviderId)?.npi,
        subscriberMemberId: insurances.find(i => i.payerId === data.primaryInsuranceId)?.memberIdNumber || '',
        serviceDateFrom: data.procedureCodes[0]?.dateOfService || appointmentDate || new Date().toISOString().split('T')[0],
        serviceDateTo: data.procedureCodes[data.procedureCodes.length - 1]?.dateOfService || appointmentDate || new Date().toISOString().split('T')[0],
        totalCharge: data.procedureCodes.reduce((sum, p) => sum + (p.chargeAmount * p.units), 0),
        status: 'draft',
        lines: data.procedureCodes.map(proc => ({
          serviceDate: proc.dateOfService,
          placeOfService: proc.placeOfService,
          cptCode: proc.code,
          modifiers: proc.modifiers,
          icdCodes: proc.diagnosisPointers.map(ptr => {
            const diagnosis = data.diagnosisCodes.find(d => d.pointer === ptr);
            return diagnosis?.code || '';
          }).filter(code => code),
          units: proc.units,
          chargeAmount: proc.chargeAmount,
          renderingProviderNpi: providers.find(p => p.id === data.renderingProviderId)?.npi
        })),
        // Store additional form data for later editing
        metadata: {
          diagnosisCodes: data.diagnosisCodes,
          billingProviderId: data.billingProviderId,
          renderingProviderId: data.renderingProviderId,
          referringProviderId: data.referringProviderId,
          facilityProviderId: data.facilityProviderId,
          secondaryInsuranceId: data.secondaryInsuranceId,
          billingNotes: data.billingNotes,
          claimNotes: data.claimNotes
        }
      };

      const result = await billingService.createClaim(claimData);
      alert(`Draft saved successfully! Draft ID: ${result.id || result.claimId}`);
    } catch (error: any) {
      console.error('Error saving draft:', error);
      alert(`Failed to save draft: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (data: ClaimFormData) => {
    try {
      if (!patient) {
        alert('Patient data not loaded');
        return;
      }

      // Map form data to API format
      const claimData: any = {
        patientId: patientId!,
        ...(appointmentId && { encounterId: appointmentId }),
        payerId: data.primaryInsuranceId,
        claimType: (data.claimType || 'professional') as 'professional' | 'institutional',
        billingProviderNpi: providers.find(p => p.id === data.billingProviderId)?.npi || '',
        renderingProviderNpi: providers.find(p => p.id === data.renderingProviderId)?.npi,
        serviceLocationNpi: providers.find(p => p.id === data.facilityProviderId)?.npi,
        subscriberMemberId: insurances.find(i => i.payerId === data.primaryInsuranceId)?.memberIdNumber || '',
        serviceDateFrom: data.procedureCodes[0]?.dateOfService || appointmentDate || new Date().toISOString().split('T')[0],
        serviceDateTo: data.procedureCodes[data.procedureCodes.length - 1]?.dateOfService || appointmentDate || new Date().toISOString().split('T')[0],
        totalCharge: data.procedureCodes.reduce((sum, p) => sum + (p.chargeAmount * p.units), 0),
        status: 'submitted',
        lines: data.procedureCodes.map(proc => ({
          serviceDate: proc.dateOfService,
          placeOfService: proc.placeOfService,
          cptCode: proc.code,
          modifiers: proc.modifiers,
          icdCodes: proc.diagnosisPointers.map(ptr => {
            const diagnosis = data.diagnosisCodes.find(d => d.pointer === ptr);
            return diagnosis?.code || '';
          }).filter(code => code),
          units: proc.units,
          chargeAmount: proc.chargeAmount,
          renderingProviderNpi: providers.find(p => p.id === data.renderingProviderId)?.npi
        }))
      };

      const result = await billingService.createClaim(claimData);
      alert(`Claim submitted successfully! Claim ID: ${result.id || result.claimId}`);
      router.push('/billing/claims');
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      alert(`Failed to submit claim: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSelectPatient = (selectedPatient: any) => {
    setPatientId(selectedPatient.id);
    setPatientSearchTerm('');
    setPatientSearchResults([]);
  };

  const handleCheckEligibility = async () => {
    try {
      if (!patient || insurances.length === 0) {
        alert('Patient or insurance data not available');
        return;
      }

      const primaryInsurance = insurances.find(i => i.insuranceType === 'primary');
      if (!primaryInsurance) {
        alert('No primary insurance found');
        return;
      }

      const names = patient.name?.[0] || {};
      const eligibilityData = {
        patientId: patientId!,
        payerId: primaryInsurance.payerId,
        memberID: primaryInsurance.memberIdNumber,
        firstName: names.given?.[0] || '',
        lastName: names.family || '',
        dateOfBirth: patient.birthDate || '',
        serviceDate: appointmentDate || new Date().toISOString().split('T')[0]
      };

      const result = await billingService.checkEligibility(eligibilityData);

      setEligibility({
        checkDate: new Date().toISOString(),
        status: result.status || 'active',
        planActive: result.planActive !== false,
        copay: result.copay,
        coinsurance: result.coinsurance,
        deductible: result.deductible,
        deductibleMet: result.deductibleMet,
        outOfPocketMax: result.outOfPocketMax,
        outOfPocketMet: result.outOfPocketMet,
        effectiveDate: result.effectiveDate,
        terminationDate: result.terminationDate,
        messages: result.messages || ['Eligibility check completed']
      });

      alert(`Eligibility check completed! Status: ${result.status || 'Active'}`);
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      alert(`Failed to check eligibility: ${error.message || 'Unknown error'}`);
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900">Select Patient</h2>
            <p className="text-sm text-gray-600 mt-1">
              Search and select a patient to create a superbill
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="min-h-[200px]">
            {searchingPatients ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Searching patients...</p>
              </div>
            ) : patientSearchTerm.length >= 2 && patientSearchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No patients found</p>
              </div>
            ) : patientSearchResults.length > 0 ? (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {patientSearchResults.map((patient) => {
                  const name = patient.name?.[0];
                  const fullName = name ? `${name.given?.join(' ')} ${name.family}` : 'Unknown';
                  const dob = patient.birthDate || 'N/A';
                  const gender = patient.gender || 'N/A';
                  const mrn = patient.identifier?.find((id: any) => id.type?.coding?.[0]?.code === 'MR')?.value || patient.id;

                  return (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            MRN: {mrn} | DOB: {dob} | Gender: {gender}
                          </p>
                        </div>
                        <div className="text-blue-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Type at least 2 characters to search</p>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading claim data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-900">Failed to Load Patient</p>
          <p className="text-sm text-gray-600 mt-2">Unable to load patient information.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const patientName = patient.name?.[0] ? `${patient.name[0].given?.join(' ')} ${patient.name[0].family}` : 'Unknown';
  const patientDOB = patient.birthDate || '';
  const patientGender = patient.gender || '';
  const patientPhone = patient.telecom?.find((t: any) => t.system === 'phone')?.value || '';
  const patientAddress = patient.address?.[0] ?
    `${patient.address[0].line?.join(', ')}, ${patient.address[0].city}, ${patient.address[0].state} ${patient.address[0].postalCode}` : '';

  return (
    <div className="h-screen">
      <SuperbillForm
        patientId={patientId}
        patientName={patientName}
        patientDOB={patientDOB}
        patientGender={patientGender}
        patientPhone={patientPhone}
        patientAddress={patientAddress}
        appointmentId={appointmentId || undefined}
        appointmentDate={appointmentDate || new Date().toISOString().split('T')[0]}
        availableProviders={providers}
        availableInsurances={insurances}
        eligibilityData={eligibility}
        onBack={() => router.back()}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        onCheckEligibility={handleCheckEligibility}
      />
    </div>
  );
}
