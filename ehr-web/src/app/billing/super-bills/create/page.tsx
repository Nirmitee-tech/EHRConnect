'use client';

import { SuperBillForm } from '@/components/billing/SuperBillForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { SuperBillFormData } from '@/types/super-bill';

// Mock data - In real app, fetch from API based on patientId
const MOCK_PATIENT_DATA = {
  patientId: 'A1430',
  patientName: 'Henna West',
  patientDetails: {
    gender: 'Female',
    dob: '21 Oct 1942',
    contactNumber: '(342) 234-5678',
    address: '919 St. Petersburg, 99712'
  },
  insurance: {
    insuranceType: 'Primary',
    payerName: 'Amerihealth',
    planName: 'Aetna',
    insuranceIdNumber: '1254',
    groupId: '456',
    effectiveEndDate: '12/31/2025',
    eligibility: 'Active'
  },
  primaryProvider: {
    firstName: 'Dr. John',
    lastName: 'Smith',
    npiNumber: '1234567890',
    contactNumber: '(555) 123-4567',
    emailId: 'john.smith@clinic.com',
    address: '123 Medical Center Dr, Suite 200'
  }
};

const MOCK_PROVIDERS = [
  { id: '1', name: 'Dr. Clarence Cox', npiNumber: '1245319599' },
  { id: '2', name: 'Dr. Carol Morris', npiNumber: '1432465237' },
  { id: '3', name: 'Dr. Steven Perez', npiNumber: '2134564222' },
  { id: '4', name: 'Dr. Sarah Johnson', npiNumber: '9876543210' },
  { id: '5', name: 'Dr. Michael Brown', npiNumber: '5555555555' },
];

export default function CreateSuperBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || MOCK_PATIENT_DATA.patientId;

  // In real app, fetch patient data based on patientId
  // const { data: patient, loading } = useFetchPatient(patientId);

  const handleSave = async (data: SuperBillFormData) => {
    console.log('Saving super bill:', data);

    // API call example:
    // try {
    //   const response = await fetch('/api/super-bills', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ ...data, status: 'submitted' })
    //   });
    //
    //   if (response.ok) {
    //     router.push('/billing/super-bills');
    //   }
    // } catch (error) {
    //   console.error('Error saving super bill:', error);
    // }

    alert('Super Bill saved successfully!');
    router.push('/appointments'); // Or wherever you want to redirect
  };

  const handleSaveDraft = async (data: SuperBillFormData) => {
    console.log('Saving draft:', data);

    // API call example:
    // try {
    //   await fetch('/api/super-bills/drafts', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ ...data, status: 'draft' })
    //   });
    //   alert('Draft saved successfully!');
    // } catch (error) {
    //   console.error('Error saving draft:', error);
    // }

    alert('Draft saved successfully!');
  };

  const handlePrint = (data: SuperBillFormData) => {
    console.log('Printing:', data);

    // Generate PDF or open print dialog
    window.print();
  };

  return (
    <div className="h-screen">
      <SuperBillForm
        patientId={MOCK_PATIENT_DATA.patientId}
        patientName={MOCK_PATIENT_DATA.patientName}
        patientDetails={MOCK_PATIENT_DATA.patientDetails}
        insurance={MOCK_PATIENT_DATA.insurance}
        primaryProvider={MOCK_PATIENT_DATA.primaryProvider}
        availableProviders={MOCK_PROVIDERS}
        onBack={() => router.back()}
        onSave={handleSave}
        onSaveDraft={handleSaveDraft}
        onPrint={handlePrint}
      />
    </div>
  );
}
