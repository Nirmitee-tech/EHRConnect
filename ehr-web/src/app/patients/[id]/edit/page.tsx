'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientForm } from '@/components/forms/patient-form';
import { patientService, UpdatePatientRequest, CreatePatientRequest } from '@/services/patient.service';
import { FHIRPatient } from '@/types/fhir';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<FHIRPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const patientData = await patientService.getPatientById(patientId);
      if (!patientData) {
        setError('Patient not found');
        return;
      }
      
      setPatient(patientData);
    } catch (err) {
      setError('Failed to load patient');
      console.error('Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreatePatientRequest | UpdatePatientRequest) => {
    try {
      const updatedPatient = await patientService.updatePatient(data as UpdatePatientRequest, 'current-user-id');
      // Redirect to the patient view page
      router.push(`/patients/${updatedPatient.id}`);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleCancel = () => {
    router.push(`/patients/${patientId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading patient...</p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Patient not found'}
          </p>
          <button 
            onClick={() => router.push('/patients')}
            className="text-primary hover:underline"
          >
            Back to Patients
          </button>
        </Card>
      </div>
    );
  }

  return (
    <PatientForm
      patient={patient}
      isEditing={true}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
