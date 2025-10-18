
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientForm } from '@/components/forms/patient-form';
import type { CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';
import { patientService } from '@/services/patient.service';

export default function NewPatientPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreatePatientRequest | UpdatePatientRequest) => {
    try {
      const patient = await patientService.createPatient(data as CreatePatientRequest, 'current-user-id');
      // Redirect to the patient view page
      navigate(`/patients/${patient.id}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <PatientForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
