'use client';

import { useState, useEffect } from 'react';
import { FHIRPatient } from '@/types/fhir';
import { ValidationError, validatePatientForm } from '@/utils/form-validation';

interface Address {
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PatientFormData {
  photo: string;
  prefix: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  relation: string;
  hospitalId: string;
  healthId: string;
  email: string;
  phone: string;
  mrn: string;
  address: Address;
}

const initialFormData: PatientFormData = {
  photo: '',
  prefix: 'Mr',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  relation: 'S/o',
  hospitalId: '',
  healthId: '',
  email: '',
  phone: '',
  mrn: '',
  address: {
    line: [''],
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  }
};

export function usePatientForm(patient?: FHIRPatient, facilityId?: string) {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationError>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      const name = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
      const address = patient.address?.[0];
      const email = patient.telecom?.find(t => t.system === 'email')?.value;
      const phone = patient.telecom?.find(t => t.system === 'phone')?.value;
      const mrn = patient.identifier?.find(
        id => id.type?.coding?.some(c => c.code === 'MR')
      )?.value;

      setFormData({
        photo: '',
        prefix: name?.prefix?.[0] || 'Mr',
        firstName: name?.given?.[0] || '',
        lastName: name?.family || '',
        dateOfBirth: patient.birthDate || '',
        gender: patient.gender || 'male',
        relation: 'S/o',
        hospitalId: '',
        healthId: '',
        email: email || '',
        phone: phone || '',
        mrn: mrn || '',
        address: {
          line: address?.line || [''],
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          country: address?.country || 'US'
        }
      });
    }
  }, [patient]);

  const updateField = <K extends keyof PatientFormData>(
    field: K,
    value: PatientFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateAddress = <K extends keyof Address>(field: K, value: string) => {
    if (field === 'line') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, line: [value] }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    }
  };

  const validate = (): boolean => {
    const validationErrors = validatePatientForm({
      firstName: formData.firstName,
      lastName: formData.relation || 'Unknown',
      dateOfBirth: formData.dateOfBirth,
      email: formData.email,
      facilityId
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const prepareSubmitData = () => {
    const hasAddress = formData.address.line[0] || formData.address.city || formData.address.state;
    
    // Build full name with prefix
    const fullName = `${formData.prefix} ${formData.firstName}`.trim();

    const identifiers = [];
    
    // Add hospital ID if provided
    if (formData.hospitalId) {
      identifiers.push({
        system: 'http://hospital.org/identifiers',
        value: formData.hospitalId.trim(),
        type: 'hospital-id'
      });
    }
    
    // Add health ID if provided
    if (formData.healthId) {
      identifiers.push({
        system: 'http://health.gov/identifiers',
        value: formData.healthId.trim(),
        type: 'health-id'
      });
    }

    return {
      firstName: fullName,
      lastName: formData.relation || '',
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      mrn: formData.mrn.trim() || formData.hospitalId.trim() || undefined,
      facilityId: facilityId!,
      address: hasAddress ? {
        line: formData.address.line.filter(l => l.trim()),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        postalCode: formData.address.postalCode.trim(),
        country: formData.address.country
      } : undefined,
      identifiers: identifiers.length > 0 ? identifiers : undefined
    };
  };

  return {
    formData,
    errors,
    loading,
    setLoading,
    setErrors,
    updateField,
    updateAddress,
    validate,
    prepareSubmitData
  };
}
