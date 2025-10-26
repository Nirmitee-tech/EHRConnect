'use client';

import { Loader2 } from 'lucide-react';
import { FHIRPatient, PatientSummary } from '@/types/fhir';
import { CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';
import { useFacility } from '@/contexts/facility-context';
import { usePatientForm } from '@/hooks/use-patient-form';
import { Button } from '@nirmitee.io/design-system';
import { useState, useEffect } from 'react';
import { NoFacilityNotice } from './patient-form-components/NoFacilityNotice';
import { PatientSearch } from './patient-form-components/PatientSearch';
import { PersonalDetailsSection } from './patient-form-components/PersonalDetailsSection';
import { ContactDetailsSection } from './patient-form-components/ContactDetailsSection';

interface PatientFormProps {
  patient?: FHIRPatient;
  isEditing?: boolean;
  onSubmit: (data: CreatePatientRequest | UpdatePatientRequest, isUpdate?: boolean, patientId?: string) => Promise<void>;
  onCancel: () => void;
}

export function PatientForm({ patient, isEditing = false, onSubmit, onCancel }: PatientFormProps) {
  const { currentFacility } = useFacility();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

  const {
    formData,
    errors,
    loading,
    setLoading,
    setErrors,
    updateField,
    updateAddress,
    validate,
    prepareSubmitData
  } = usePatientForm(patient, currentFacility?.id);

  const [photoPreview, setPhotoPreview] = useState<string>(formData.photo || '');

  useEffect(() => {
    setPhotoPreview(formData.photo || '');
  }, [formData.photo]);

  const handlePhotoChange = (photo: string) => {
    setPhotoPreview(photo);
    updateField('photo', photo);
  };

  const handleSelectPatient = (selectedPatient: PatientSummary) => {
    updateField('firstName', selectedPatient.name);

    if (selectedPatient.gender && ['male', 'female', 'other', 'unknown'].includes(selectedPatient.gender)) {
      updateField('gender', selectedPatient.gender as 'male' | 'female' | 'other' | 'unknown');
    }

    if (selectedPatient.dateOfBirth) {
      updateField('dateOfBirth', selectedPatient.dateOfBirth);
    }

    if (selectedPatient.phone) {
      updateField('phone', selectedPatient.phone);
    }

    if (selectedPatient.email) {
      updateField('email', selectedPatient.email);
    }

    setSelectedPatientId(selectedPatient.id);
    setIsUpdatingExisting(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !currentFacility) return;

    setLoading(true);
    setErrors({});

    try {
      const submitData = prepareSubmitData();
      console.log('Submitting patient data with photo:', submitData.photo ? 'Yes (' + submitData.photo.length + ' bytes)' : 'No');

      if (isUpdatingExisting && selectedPatientId) {
        await onSubmit({
          ...submitData,
          id: selectedPatientId
        } as UpdatePatientRequest, true, selectedPatientId);
      } else if (isEditing && patient) {
        await onSubmit({
          ...submitData,
          id: patient.id!
        } as UpdatePatientRequest, true, patient.id);
      } else {
        await onSubmit(submitData as CreatePatientRequest, false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save patient. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!currentFacility && <NoFacilityNotice />}

      <form onSubmit={handleSubmit} className="space-y-3">
        <PatientSearch onSelectPatient={handleSelectPatient} />

        <PersonalDetailsSection
          formData={formData}
          errors={errors}
          onUpdateField={updateField as any}
          photoPreview={photoPreview}
          onPhotoChange={handlePhotoChange}
        />

        <ContactDetailsSection
          formData={formData}
          errors={errors}
          onUpdateField={updateField as any}
          onUpdateAddress={updateAddress as any}
        />

        {(errors.submit || errors.facility) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{errors.submit || errors.facility}</p>
          </div>
        )}
      </form>

      {/* Sticky Footer Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !currentFacility}
            className="flex-1 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 text-sm font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUpdatingExisting || isEditing ? 'Update' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
