'use client';

import { useEffect, useMemo, useState } from 'react';
import { FHIRPatient } from '@/types/fhir';
import { ValidationError } from '@/utils/form-validation';
import { CreatePatientRequest } from '@/services/patient.service';

export type FieldErrors = ValidationError;

export interface ProviderInfoForm {
  primaryProviderId: string;
  providerLocationId: string;
  registrationDate: string;
  referredBy: string;
}

export interface DemographicsForm {
  photo: string;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  pronouns: string;
  maritalStatus: string;
  occupation: string;
  employer: string;
  timeZone: string;
  language: string;
  race: string;
  ethnicity: string;
  religion: string;
  bloodGroup: string;
  ssn: string;
  hospitalId: string;
  healthId: string;
  mrn: string;
  preferredCommunication: string;
  disabilityStatus: string;
}

export interface PostalAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactForm {
  mobileNumber: string;
  homeNumber: string;
  email: string;
  faxNumber: string;
  address: PostalAddress;
  preferredContactTime: string;
}

export interface EmergencyContactForm {
  relationship: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
}

export interface InsuranceForm {
  insuranceType: string;
  insuranceName: string;
  planType: string;
  planName: string;
  memberId: string;
  groupId: string;
  groupName: string;
  effectiveStart: string;
  effectiveEnd: string;
  relationshipToInsured: string;
  insuredFirstName: string;
  insuredLastName: string;
  insuredAddress: PostalAddress;
  insuredPhone: string;
  insuredEmail: string;
  cardImage: string;
}

export interface PreferencesForm {
  pharmacy: string;
  lab: string;
  radiology: string;
  preferredDoctorGender: string;
  preferredHospital: string;
  preferredContactMethod: string;
}

export type PatientStatus = 'active' | 'inactive';

export interface ConsentForm {
  consentEmail: boolean;
  consentCall: boolean;
  consentMessage: boolean;
  allowDataSharing: boolean;
  patientStatus: PatientStatus;
  dataCaptureDate: string;
  signature: string;
}

export interface ClinicalForm {
  allergies: string;
  chronicConditions: string;
  smokingStatus: string;
  alcoholUse: string;
  heightCm: string;
  weightKg: string;
  bmi: string;
}

export interface PatientFormData {
  provider: ProviderInfoForm;
  demographics: DemographicsForm;
  contact: ContactForm;
  emergencyContacts: EmergencyContactForm[];
  insurance: InsuranceForm;
  preferences: PreferencesForm;
  consent: ConsentForm;
  clinical: ClinicalForm;
}

const today = new Date().toISOString().split('T')[0];

const blankAddress: PostalAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US'
};

const blankEmergencyContact: EmergencyContactForm = {
  relationship: '',
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: ''
};

const detectedTimezone =
  typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

const initialFormData: PatientFormData = {
  provider: {
    primaryProviderId: '',
    providerLocationId: '',
    registrationDate: today,
    referredBy: ''
  },
  demographics: {
    photo: '',
    prefix: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: 'male',
    pronouns: '',
    maritalStatus: '',
    occupation: '',
    employer: '',
    timeZone: detectedTimezone,
    language: 'en',
    race: '',
    ethnicity: '',
    religion: '',
    bloodGroup: '',
    ssn: '',
    hospitalId: '',
    healthId: '',
    mrn: '',
    preferredCommunication: 'email',
    disabilityStatus: ''
  },
  contact: {
    mobileNumber: '',
    homeNumber: '',
    email: '',
    faxNumber: '',
    address: { ...blankAddress },
    preferredContactTime: ''
  },
  emergencyContacts: [], // Optional - start with empty array
  insurance: {
    insuranceType: '',
    insuranceName: '',
    planType: '',
    planName: '',
    memberId: '',
    groupId: '',
    groupName: '',
    effectiveStart: '',
    effectiveEnd: '',
    relationshipToInsured: 'self',
    insuredFirstName: '',
    insuredLastName: '',
    insuredAddress: { ...blankAddress },
    insuredPhone: '',
    insuredEmail: '',
    cardImage: ''
  },
  preferences: {
    pharmacy: '',
    lab: '',
    radiology: '',
    preferredDoctorGender: '',
    preferredHospital: '',
    preferredContactMethod: 'email'
  },
  consent: {
    consentEmail: true,
    consentCall: true,
    consentMessage: false,
    allowDataSharing: false,
    patientStatus: 'active',
    dataCaptureDate: today,
    signature: ''
  },
  clinical: {
    allergies: '',
    chronicConditions: '',
    smokingStatus: '',
    alcoholUse: '',
    heightCm: '',
    weightKg: '',
    bmi: ''
  }
};

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);

const calculateAge = (dob: string): string => {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const todayDate = new Date();
  let age = todayDate.getFullYear() - birth.getFullYear();
  const monthDiff = todayDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? `${age}` : '';
};

const calculateBMI = (heightCm: string, weightKg: string): string => {
  const height = parseFloat(heightCm);
  const weight = parseFloat(weightKg);
  if (!height || !weight) return '';
  const meters = height / 100;
  if (!meters) return '';
  const bmi = weight / (meters * meters);
  return Number.isFinite(bmi) ? bmi.toFixed(1) : '';
};

export function usePatientForm(patient?: FHIRPatient, facilityId?: string) {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      const name = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
      const email = patient.telecom?.find(t => t.system === 'email')?.value;
      const phone = patient.telecom?.find(t => t.system === 'phone')?.value;
      const homePhone = patient.telecom?.find(t => t.system === 'phone' && t.use === 'home')?.value;
      const mrn = patient.identifier?.find(id => id.type?.coding?.some(c => c.code === 'MR'))?.value;
      const address = patient.address?.[0];
      const photo = patient.photo?.[0]?.url || patient.photo?.[0]?.data || '';

      setFormData(prev => ({
        ...prev,
        demographics: {
          ...prev.demographics,
          photo,
          prefix: name?.prefix?.[0] || prev.demographics.prefix,
          firstName: name?.given?.[0] || '',
          middleName: name?.given?.[1] || '',
          lastName: name?.family || '',
          dateOfBirth: patient.birthDate || '',
          gender: patient.gender || prev.demographics.gender,
          mrn: mrn || ''
        },
        contact: {
          ...prev.contact,
          mobileNumber: phone || '',
          homeNumber: homePhone || '',
          email: email || '',
          address: {
            line1: address?.line?.[0] || '',
            line2: address?.line?.[1] || '',
            city: address?.city || '',
            state: address?.state || '',
            postalCode: address?.postalCode || '',
            country: address?.country || 'US'
          }
        }
      }));
    }
  }, [patient]);

  const calculatedAge = useMemo(
    () => calculateAge(formData.demographics.dateOfBirth),
    [formData.demographics.dateOfBirth]
  );

  const calculatedBMI = useMemo(
    () => calculateBMI(formData.clinical.heightCm, formData.clinical.weightKg),
    [formData.clinical.heightCm, formData.clinical.weightKg]
  );

  useEffect(() => {
    setFormData(prev =>
      prev.clinical.bmi === calculatedBMI
        ? prev
        : { ...prev, clinical: { ...prev.clinical, bmi: calculatedBMI } }
    );
  }, [calculatedBMI]);

  const clearError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateProviderField = <K extends keyof ProviderInfoForm>(field: K, value: ProviderInfoForm[K]) => {
    setFormData(prev => ({
      ...prev,
      provider: { ...prev.provider, [field]: value }
    }));
    clearError(`provider.${String(field)}`);
  };

  const updateDemographicsField = <K extends keyof DemographicsForm>(
    field: K,
    value: DemographicsForm[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      demographics: { ...prev.demographics, [field]: value }
    }));
    clearError(`demographics.${String(field)}`);
  };

  const updateContactField = <K extends keyof ContactForm>(field: K, value: ContactForm[K]) => {
    if (field === 'address') return;
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
    clearError(`contact.${String(field)}`);
  };

  const updateContactAddress = <K extends keyof PostalAddress>(field: K, value: PostalAddress[K]) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        address: { ...prev.contact.address, [field]: value }
      }
    }));
    clearError(`contact.address.${String(field)}`);
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { ...blankEmergencyContact }]
    }));
  };

  const updateEmergencyContact = <K extends keyof EmergencyContactForm>(
    index: number,
    field: K,
    value: EmergencyContactForm[K]
  ) => {
    setFormData(prev => {
      const contacts = [...prev.emergencyContacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, emergencyContacts: contacts };
    });
    clearError(`emergencyContacts.${index}.${String(field)}`);
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const updateInsuranceField = <K extends keyof InsuranceForm>(field: K, value: InsuranceForm[K]) => {
    if (field === 'insuredAddress') return;
    setFormData(prev => ({
      ...prev,
      insurance: { ...prev.insurance, [field]: value }
    }));
    clearError(`insurance.${String(field)}`);
  };

  const updateInsuranceAddress = <K extends keyof PostalAddress>(
    field: K,
    value: PostalAddress[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        insuredAddress: { ...prev.insurance.insuredAddress, [field]: value }
      }
    }));
    clearError(`insurance.insuredAddress.${String(field)}`);
  };

  const updatePreferencesField = <K extends keyof PreferencesForm>(
    field: K,
    value: PreferencesForm[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
    clearError(`preferences.${String(field)}`);
  };

  const updateConsentField = <K extends keyof ConsentForm>(field: K, value: ConsentForm[K]) => {
    setFormData(prev => ({
      ...prev,
      consent: { ...prev.consent, [field]: value }
    }));
    clearError(`consent.${String(field)}`);
  };

  const updateClinicalField = <K extends keyof ClinicalForm>(field: K, value: ClinicalForm[K]) => {
    setFormData(prev => ({
      ...prev,
      clinical: { ...prev.clinical, [field]: value }
    }));
    clearError(`clinical.${String(field)}`);
  };

  const updatePhoto = (photo: string) => {
    updateDemographicsField('photo', photo);
  };

  const updateInsuranceCardImage = (cardImage: string) => {
    updateInsuranceField('cardImage', cardImage);
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (!facilityId) {
      nextErrors.facility = 'patient_form.validation.select_facility';
    }

    if (!formData.provider.primaryProviderId) {
      nextErrors['provider.primaryProviderId'] = 'patient_form.validation.primary_provider_required';
    }
    if (!formData.provider.providerLocationId) {
      nextErrors['provider.providerLocationId'] = 'patient_form.validation.provider_location_required';
    }
    if (!formData.provider.registrationDate) {
      nextErrors['provider.registrationDate'] = 'patient_form.validation.registration_date_required';
    }

    if (!formData.demographics.firstName) {
      nextErrors['demographics.firstName'] = 'patient_form.validation.first_name_required';
    }
    if (!formData.demographics.lastName) {
      nextErrors['demographics.lastName'] = 'patient_form.validation.last_name_required';
    }
    if (!formData.demographics.dateOfBirth) {
      nextErrors['demographics.dateOfBirth'] = 'patient_form.validation.dob_required';
    }
    if (!formData.demographics.gender) {
      nextErrors['demographics.gender'] = 'patient_form.validation.gender_required';
    }

    if (!formData.contact.mobileNumber) {
      nextErrors['contact.mobileNumber'] = 'patient_form.validation.mobile_number_required';
    }
    if (!formData.contact.email) {
      nextErrors['contact.email'] = 'patient_form.validation.email_required';
    }
    if (!formData.contact.address.line1) {
      nextErrors['contact.address.line1'] = 'patient_form.validation.address_line1_required';
    }
    if (!formData.contact.address.city) {
      nextErrors['contact.address.city'] = 'patient_form.validation.city_required';
    }
    if (!formData.contact.address.state) {
      nextErrors['contact.address.state'] = 'patient_form.validation.state_required';
    }
    if (!formData.contact.address.postalCode) {
      nextErrors['contact.address.postalCode'] = 'patient_form.validation.postal_code_required';
    }
    if (!formData.contact.address.country) {
      nextErrors['contact.address.country'] = 'patient_form.validation.country_required';
    }

    // Emergency contacts are optional, but if any field is filled, validate the contact
    formData.emergencyContacts.forEach((contact, index) => {
      const hasAnyField = contact.relationship || contact.firstName || contact.lastName ||
                          contact.mobileNumber || contact.email;

      // Only validate if user has started filling out this contact
      if (hasAnyField) {
        if (!contact.relationship) {
          nextErrors[`emergencyContacts.${index}.relationship`] = 'patient_form.validation.relationship_required';
        }
        if (!contact.firstName) {
          nextErrors[`emergencyContacts.${index}.firstName`] = 'patient_form.validation.first_name_required';
        }
        if (!contact.lastName) {
          nextErrors[`emergencyContacts.${index}.lastName`] = 'patient_form.validation.last_name_required';
        }
        if (!contact.mobileNumber) {
          nextErrors[`emergencyContacts.${index}.mobileNumber`] = 'patient_form.validation.mobile_number_required';
        }
      }
    });

    // Insurance is optional, but if any field is filled, validate the insurance section
    const hasAnyInsuranceField = formData.insurance.insuranceType ||
                                  formData.insurance.insuranceName ||
                                  formData.insurance.memberId ||
                                  formData.insurance.effectiveStart ||
                                  formData.insurance.effectiveEnd;

    if (hasAnyInsuranceField) {
      if (!formData.insurance.insuranceType) {
        nextErrors['insurance.insuranceType'] = 'patient_form.validation.insurance_type_required';
      }
      if (!formData.insurance.insuranceName) {
        nextErrors['insurance.insuranceName'] = 'patient_form.validation.insurance_name_required';
      }
      if (!formData.insurance.memberId) {
        nextErrors['insurance.memberId'] = 'patient_form.validation.member_id_required';
      }
      // Start and end dates are optional even if insurance is provided
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const prepareSubmitData = (): CreatePatientRequest => {
    if (!facilityId) {
      throw new Error('No facility selected');
    }

    // Filter out empty emergency contacts - only include contacts with actual data
    const filteredContacts = formData.emergencyContacts.filter(
      contact => contact.firstName || contact.lastName || contact.mobileNumber
    );

    return {
      facilityId,
      provider: formData.provider,
      demographics: {
        ...formData.demographics,
        age: calculatedAge
      },
      contact: formData.contact,
      emergencyContacts: filteredContacts, // Optional - can be empty array
      insurance: formData.insurance,
      preferences: formData.preferences,
      consent: {
        ...formData.consent,
        dataCaptureDate: formData.consent.dataCaptureDate || today
      },
      clinical: {
        ...formData.clinical,
        allergiesList: splitList(formData.clinical.allergies),
        chronicConditionsList: splitList(formData.clinical.chronicConditions),
        bmi: calculatedBMI
      }
    };
  };

  return {
    formData,
    errors,
    loading,
    calculatedAge,
    calculatedBMI,
    setLoading,
    setErrors,
    setFormData,
    updateProviderField,
    updateDemographicsField,
    updateContactField,
    updateContactAddress,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
    updateInsuranceField,
    updateInsuranceAddress,
    updatePreferencesField,
    updateConsentField,
    updateClinicalField,
    updatePhoto,
    updateInsuranceCardImage,
    validate,
    prepareSubmitData
  };
}
