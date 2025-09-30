'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PatientForm } from '@/components/forms/patient-form';
import { patientService, CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';

export default function NewPatientPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreatePatientRequest | UpdatePatientRequest) => {
    try {
      const patient = await patientService.createPatient(data as CreatePatientRequest, 'current-user-id');
      // Redirect to the patient view page
      router.push(`/patients/${patient.id}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleCancel = () => {
    router.push('/patients');
  };

  return (
    <PatientForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
