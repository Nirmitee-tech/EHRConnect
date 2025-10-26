'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Drawer, DrawerContent } from '@nirmitee.io/design-system';
import { PatientForm } from '@/components/forms/patient-form';
import { EncounterForm } from '@/components/forms/encounter-form';
import { FHIRPatient } from '@/types/fhir';
import { CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';
import { patientService } from '@/services/patient.service';

interface PatientDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: FHIRPatient;
  isEditing?: boolean;
  onSuccess?: (createdPatientId?: string) => void;
  skipEncounter?: boolean; // Skip encounter form and just close after patient creation
}

type WorkflowStep = 'patient-form' | 'encounter-form';

interface CreatedPatientData {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  mrn?: string;
  phone?: string;
  email?: string;
}

export function PatientDrawer({
  open,
  onOpenChange,
  patient,
  isEditing = false,
  onSuccess,
  skipEncounter = false
}: PatientDrawerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('patient-form');
  const [createdPatient, setCreatedPatient] = useState<CreatedPatientData | null>(null);

  // Generate MRN (Medical Record Number)
  const generateMRN = (): string => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MRN-${timestamp}-${random}`;
  };

  const handleSubmit = async (data: CreatePatientRequest | UpdatePatientRequest, isUpdate?: boolean, patientId?: string) => {
    try {
      setIsSubmitting(true);
      
      if ((isEditing && 'id' in data) || (isUpdate && patientId)) {
        await patientService.updatePatient(data as UpdatePatientRequest, 'current-user');
        
        // If updating from search, move to encounter form with existing patient data
        if (isUpdate && patientId) {
          const updateData = data as UpdatePatientRequest;
          const age = updateData.dateOfBirth 
            ? Math.floor((Date.now() - new Date(updateData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : undefined;

          setCreatedPatient({
            id: patientId,
            name: updateData.firstName || '',
            age,
            gender: updateData.gender,
            mrn: updateData.mrn || undefined,
            phone: updateData.phone || undefined,
            email: updateData.email || undefined
          });

          setCurrentStep('encounter-form');
        } else {
          onOpenChange(false);
          
          if (onSuccess) {
            onSuccess();
          } else {
            router.refresh();
          }
        }
      } else {
        // Create new patient and generate MRN
        const mrn = generateMRN();
        const patientData = data as CreatePatientRequest & { hospitalId?: string };
        
        // Update patient data with MRN if not provided
        if (!patientData.hospitalId) {
          patientData.hospitalId = mrn;
        }
        
        const createdPatientResponse = await patientService.createPatient(patientData as CreatePatientRequest, 'current-user');

        // Calculate age from date of birth
        const age = patientData.dateOfBirth
          ? Math.floor((Date.now() - new Date(patientData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : undefined;

        // Store created patient data for encounter form
        setCreatedPatient({
          id: createdPatientResponse.id || '',
          name: patientData.firstName,
          age,
          gender: patientData.gender,
          mrn: patientData.hospitalId,
          phone: patientData.phone,
          email: patientData.email
        });

        // If skipEncounter flag is set, close drawer and call onSuccess
        if (skipEncounter) {
          onOpenChange(false);
          setCurrentStep('patient-form');
          const patientId = createdPatientResponse.id || '';
          setCreatedPatient(null);

          if (onSuccess) {
            onSuccess(patientId); // Pass the created patient ID
          }
        } else {
          // Move to encounter form
          setCurrentStep('encounter-form');
        }
      }
    } catch (error) {
      console.error('Failed to save patient:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEncounterSubmit = async (encounterData: {
    practitioner: string;
    location: string;
    encounterClass: string;
  }) => {
    try {
      // TODO: Create FHIR Encounter resource
      console.log('Creating encounter:', encounterData, 'for patient:', createdPatient);
      
      // Close drawer
      onOpenChange(false);
      setCurrentStep('patient-form');
      
      // Navigate to patient detail page
      if (createdPatient?.id) {
        router.push(`/patients/${createdPatient.id}`);
      }
      
      setCreatedPatient(null);
    } catch (error) {
      console.error('Failed to create encounter:', error);
      throw error;
    }
  };

  const handleBack = () => {
    setCurrentStep('patient-form');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCurrentStep('patient-form');
    setCreatedPatient(null);
  };

  return (
    <Drawer open={open} onOpenChange={(open) => {
      if (!open) {
        handleCancel();
      }
      onOpenChange(open);
    }}>
      <DrawerContent side="right" size="3xl" className="overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">
                {currentStep === 'encounter-form' ? 'Create Encounter' : (isEditing ? 'Edit Patient' : 'New Patient')}
              </h2>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          {currentStep === 'patient-form' ? (
            <PatientForm
              patient={patient}
              isEditing={isEditing}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          ) : currentStep === 'encounter-form' && createdPatient ? (
            <EncounterForm
              patient={createdPatient}
              onBack={handleBack}
              onStartVisit={handleEncounterSubmit}
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
