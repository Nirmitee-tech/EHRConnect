'use client';

import { ClaimForm } from '@/components/billing/ClaimForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClaimFormData, ClaimProvider, ClaimInsurance, EligibilityCheck } from '@/types/claim';
import { useEffect, useState } from 'react';
import billingService from '@/services/billing.service';
import { fhirService } from '@/lib/medplum';

export default function CreateClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get params from URL
  const patientId = searchParams.get('patientId');
  const appointmentId = searchParams.get('appointmentId');
  const appointmentDate = searchParams.get('appointmentDate');

  // State
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [providers, setProviders] = useState<ClaimProvider[]>([]);
  const [insurances, setInsurances] = useState<ClaimInsurance[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityCheck | undefined>(undefined);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">No Patient Selected</p>
          <p className="text-sm text-gray-600 mt-2">Please select a patient from an appointment or patient record.</p>
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
      <ClaimForm
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
