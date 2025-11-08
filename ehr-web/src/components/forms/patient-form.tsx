'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Check,
  ChevronDown,
  FileUp,
  Loader2,
  Lock,
  Phone,
  Plus,
  Shield,
  Sparkles,
  Stethoscope,
  Trash2,
  User
} from 'lucide-react';
import { FHIRPatient, PatientSummary } from '@/types/fhir';
import { CreatePatientRequest, UpdatePatientRequest } from '@/services/patient.service';
import { useFacility } from '@/contexts/facility-context';
import { usePatientForm } from '@/hooks/use-patient-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { NoFacilityNotice } from './patient-form-components/NoFacilityNotice';
import { PatientSearch } from './patient-form-components/PatientSearch';
import { PhotoUpload } from './patient-form-components/PhotoUpload';

interface PatientFormProps {
  patient?: FHIRPatient;
  isEditing?: boolean;
  onSubmit: (
    data: CreatePatientRequest | UpdatePatientRequest,
    isUpdate?: boolean,
    patientId?: string
  ) => Promise<void>;
  onCancel: () => void;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

const pronounOptions = ['He/Him', 'She/Her', 'They/Them', 'Prefer to self-describe'];

const maritalStatusOptions = [
  { value: 'S', label: 'Single' },
  { value: 'M', label: 'Married' },
  { value: 'D', label: 'Divorced' },
  { value: 'W', label: 'Widowed' },
  { value: 'U', label: 'Unknown' }
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'hi', label: 'Hindi' }
];

const raceOptions = ['White', 'Black or African American', 'Asian', 'Native Hawaiian', 'Other'];
const ethnicityOptions = ['Hispanic or Latino', 'Not Hispanic or Latino'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const relationshipOptions = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
const contactMethodOptions = ['email', 'sms', 'phone'];
const smokingStatusOptions = ['Never', 'Former', 'Current'];
const alcoholUseOptions = ['None', 'Occasional', 'Daily'];
const doctorGenderOptions = ['No preference', 'Male', 'Female'];
const patientStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const SectionConfig = [
  { id: 'provider', title: 'Provider Information', icon: Stethoscope, required: true },
  { id: 'patient', title: 'Patient Details', icon: User, required: true },
  { id: 'contact', title: 'Contact Information', icon: Phone, required: true },
  { id: 'emergency', title: 'Emergency Contact', icon: AlertCircle, required: true },
  { id: 'insurance', title: 'Insurance', icon: Shield, required: true },
  { id: 'preferences', title: 'Preferences', icon: Sparkles },
  { id: 'consent', title: 'Privacy & Consent', icon: Lock, required: true },
  { id: 'clinical', title: 'Clinical Context', icon: Activity }
];

const InlineAddButton = ({ label }: { label: string }) => (
  <button
    type="button"
    className="text-xs font-medium text-primary hover:text-primary/80"
  >
    + Add {label}
  </button>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-600 mt-1">{message}</p> : null;

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: typeof User;
  isOpen: boolean;
  required?: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

const AccordionSection = ({
  id,
  title,
  icon: Icon,
  isOpen,
  required,
  onToggle,
  children
}: AccordionSectionProps) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
        isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {required && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">Click to {isOpen ? 'collapse' : 'expand'}</p>
        </div>
      </div>
      <ChevronDown
        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
    {isOpen && <div className="px-4 py-5">{children}</div>}
  </div>
);

export function PatientForm({
  patient,
  isEditing = false,
  onSubmit,
  onCancel
}: PatientFormProps) {
  const { currentFacility } = useFacility();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    provider: true,
    patient: true,
    contact: true,
    emergency: false,
    insurance: false,
    preferences: false,
    consent: false,
    clinical: false
  });

  const {
    formData,
    errors,
    loading,
    calculatedAge,
    calculatedBMI,
    setLoading,
    setErrors,
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
  } = usePatientForm(patient, currentFacility?.id);

  const photoPreview = formData.demographics.photo;

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePhotoChange = (photo: string) => {
    updatePhoto(photo);
  };

  const handleInsuranceCardUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateInsuranceCardImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPatient = (selectedPatient: PatientSummary) => {
    const [firstName = '', ...rest] = selectedPatient.name?.split(' ') || [];
    const lastName = rest.pop() || '';

    updateDemographicsField('firstName', firstName);
    updateDemographicsField('lastName', lastName);

    if (selectedPatient.gender && ['male', 'female', 'other', 'unknown'].includes(selectedPatient.gender)) {
      updateDemographicsField('gender', selectedPatient.gender as any);
    }

    if (selectedPatient.dateOfBirth) {
      updateDemographicsField('dateOfBirth', selectedPatient.dateOfBirth);
    }

    if (selectedPatient.phone) {
      updateContactField('mobileNumber', selectedPatient.phone);
    }

    if (selectedPatient.email) {
      updateContactField('email', selectedPatient.email);
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
      const payload = prepareSubmitData();
      if (isUpdatingExisting && selectedPatientId) {
        await onSubmit(
          {
            ...payload,
            id: selectedPatientId
          } as UpdatePatientRequest,
          true,
          selectedPatientId
        );
      } else if (isEditing && patient) {
        await onSubmit(
          {
            ...payload,
            id: patient.id!
          } as UpdatePatientRequest,
          true,
          patient.id
        );
      } else {
        await onSubmit(payload as CreatePatientRequest, false);
      }
    } catch (error) {
      console.error('Error submitting patient form:', error);
      setErrors({ submit: 'Failed to save patient. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const consentDetails = useMemo(
    () =>
      [
        { key: 'consentEmail', label: 'Consent to Email', value: formData.consent.consentEmail },
        { key: 'consentCall', label: 'Consent to Call', value: formData.consent.consentCall },
        {
          key: 'consentMessage',
          label: 'Consent to Message (SMS)',
          value: formData.consent.consentMessage,
          hint: 'Phone verification required'
        },
        {
          key: 'allowDataSharing',
          label: 'Allow Data Sharing',
          value: formData.consent.allowDataSharing
        }
      ] as Array<{ key: keyof typeof formData.consent; label: string; value: boolean; hint?: string }>,
    [formData.consent]
  );

  return (
    <div className="space-y-4">
      {!currentFacility && <NoFacilityNotice />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PatientSearch onSelectPatient={handleSelectPatient} />

        {SectionConfig.map(section => (
          <AccordionSection
            key={section.id}
            id={section.id}
            title={section.title}
            icon={section.icon}
            isOpen={!!expandedSections[section.id]}
            required={section.required}
            onToggle={toggleSection}
          >
            {section.id === 'provider' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Primary Provider</Label>
                      <InlineAddButton label="Provider" />
                    </div>
                    <Input
                      placeholder="Search provider"
                      value={formData.provider.primaryProviderId}
                      onChange={e => updateProviderField('primaryProviderId', e.target.value)}
                    />
                    <FieldError message={errors['provider.primaryProviderId']} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Provider Group Location</Label>
                      <InlineAddButton label="Location" />
                    </div>
                    <Input
                      placeholder="Select clinic location"
                      value={formData.provider.providerLocationId}
                      onChange={e => updateProviderField('providerLocationId', e.target.value)}
                    />
                    <FieldError message={errors['provider.providerLocationId']} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Registration Date</Label>
                    <Input
                      type="date"
                      value={formData.provider.registrationDate}
                      onChange={e => updateProviderField('registrationDate', e.target.value)}
                    />
                    <FieldError message={errors['provider.registrationDate']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Referred By</Label>
                    <Input
                      placeholder="Referral source"
                      value={formData.provider.referredBy}
                      onChange={e => updateProviderField('referredBy', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {section.id === 'patient' && (
              <div className="space-y-4">
                <PhotoUpload photoPreview={photoPreview} onPhotoChange={handlePhotoChange} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Prefix</Label>
                    <Select
                      value={formData.demographics.prefix}
                      onValueChange={value => updateDemographicsField('prefix', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Prefix" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Mr', 'Mrs', 'Ms', 'Dr'].map(prefix => (
                          <SelectItem key={prefix} value={prefix}>
                            {prefix}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">First Name</Label>
                    <Input
                      value={formData.demographics.firstName}
                      onChange={e => updateDemographicsField('firstName', e.target.value)}
                    />
                    <FieldError message={errors['demographics.firstName']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Middle Name</Label>
                    <Input
                      value={formData.demographics.middleName}
                      onChange={e => updateDemographicsField('middleName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Name</Label>
                    <Input
                      value={formData.demographics.lastName}
                      onChange={e => updateDemographicsField('lastName', e.target.value)}
                    />
                    <FieldError message={errors['demographics.lastName']} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preferred Name</Label>
                    <Input
                      value={formData.demographics.preferredName}
                      onChange={e => updateDemographicsField('preferredName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.demographics.dateOfBirth}
                      onChange={e => updateDemographicsField('dateOfBirth', e.target.value)}
                    />
                    <FieldError message={errors['demographics.dateOfBirth']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Age</Label>
                    <Input value={calculatedAge || '--'} readOnly />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <Select
                      value={formData.demographics.gender}
                      onValueChange={value =>
                        updateDemographicsField('gender', value as 'male' | 'female' | 'other' | 'unknown')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors['demographics.gender']} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Pronouns</Label>
                    <Select
                      value={formData.demographics.pronouns}
                      onValueChange={value => updateDemographicsField('pronouns', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pronouns" />
                      </SelectTrigger>
                      <SelectContent>
                        {pronounOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Marital Status</Label>
                    <Select
                      value={formData.demographics.maritalStatus}
                      onValueChange={value => updateDemographicsField('maritalStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Occupation</Label>
                    <Input
                      value={formData.demographics.occupation}
                      onChange={e => updateDemographicsField('occupation', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Employer</Label>
                    <Input
                      value={formData.demographics.employer}
                      onChange={e => updateDemographicsField('employer', e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Language</Label>
                      <InlineAddButton label="Language" />
                    </div>
                    <Select
                      value={formData.demographics.language}
                      onValueChange={value => updateDemographicsField('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Preferred language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Time Zone</Label>
                    <Input
                      value={formData.demographics.timeZone}
                      onChange={e => updateDemographicsField('timeZone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Race</Label>
                      <InlineAddButton label="Race" />
                    </div>
                    <Select
                      value={formData.demographics.race}
                      onValueChange={value => updateDemographicsField('race', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select race" />
                      </SelectTrigger>
                      <SelectContent>
                        {raceOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Ethnicity</Label>
                      <InlineAddButton label="Ethnicity" />
                    </div>
                    <Select
                      value={formData.demographics.ethnicity}
                      onValueChange={value => updateDemographicsField('ethnicity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        {ethnicityOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Religion</Label>
                    <Input
                      value={formData.demographics.religion}
                      onChange={e => updateDemographicsField('religion', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Blood Group</Label>
                    <Select
                      value={formData.demographics.bloodGroup}
                      onValueChange={value => updateDemographicsField('bloodGroup', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroupOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SSN / National ID</Label>
                    <Input
                      value={formData.demographics.ssn}
                      onChange={e => updateDemographicsField('ssn', e.target.value)}
                      placeholder="***-**-****"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Communication</Label>
                    <Select
                      value={formData.demographics.preferredCommunication}
                      onValueChange={value => updateDemographicsField('preferredCommunication', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactMethodOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Disability Status</Label>
                    <Input
                      value={formData.demographics.disabilityStatus}
                      onChange={e => updateDemographicsField('disabilityStatus', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Hospital ID</Label>
                    <Input
                      value={formData.demographics.hospitalId}
                      onChange={e => updateDemographicsField('hospitalId', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Health ID</Label>
                    <Input
                      value={formData.demographics.healthId}
                      onChange={e => updateDemographicsField('healthId', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">MRN</Label>
                    <Input
                      value={formData.demographics.mrn}
                      onChange={e => updateDemographicsField('mrn', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {section.id === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Mobile Number</Label>
                    <Input
                      value={formData.contact.mobileNumber}
                      onChange={e => updateContactField('mobileNumber', e.target.value)}
                    />
                    <FieldError message={errors['contact.mobileNumber']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Home Number</Label>
                    <Input
                      value={formData.contact.homeNumber}
                      onChange={e => updateContactField('homeNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={formData.contact.email}
                      onChange={e => updateContactField('email', e.target.value)}
                    />
                    <FieldError message={errors['contact.email']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fax</Label>
                    <Input
                      value={formData.contact.faxNumber}
                      onChange={e => updateContactField('faxNumber', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Address Line 1</Label>
                    <Input
                      value={formData.contact.address.line1}
                      onChange={e => updateContactAddress('line1', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.line1']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address Line 2</Label>
                    <Input
                      value={formData.contact.address.line2}
                      onChange={e => updateContactAddress('line2', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">City</Label>
                    <Input
                      value={formData.contact.address.city}
                      onChange={e => updateContactAddress('city', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.city']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State</Label>
                    <Input
                      value={formData.contact.address.state}
                      onChange={e => updateContactAddress('state', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.state']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Country</Label>
                    <Input
                      value={formData.contact.address.country}
                      onChange={e => updateContactAddress('country', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.country']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Zip Code</Label>
                    <Input
                      value={formData.contact.address.postalCode}
                      onChange={e => updateContactAddress('postalCode', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.postalCode']} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preferred Contact Time</Label>
                  <Input
                    placeholder="Morning / Afternoon / Evening"
                    value={formData.contact.preferredContactTime}
                    onChange={e => updateContactField('preferredContactTime', e.target.value)}
                  />
                </div>
              </div>
            )}

            {section.id === 'emergency' && (
              <div className="space-y-6">
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={`contact-${index}`} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="h-4 w-4 text-primary" />
                        Contact #{index + 1}
                      </div>
                      {formData.emergencyContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmergencyContact(index)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Relationship</Label>
                        <Select
                          value={contact.relationship}
                          onValueChange={value => updateEmergencyContact(index, 'relationship', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {relationshipOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={errors[`emergencyContacts.${index}.relationship`]} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">First Name</Label>
                        <Input
                          value={contact.firstName}
                          onChange={e => updateEmergencyContact(index, 'firstName', e.target.value)}
                        />
                        <FieldError message={errors[`emergencyContacts.${index}.firstName`]} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input
                          value={contact.lastName}
                          onChange={e => updateEmergencyContact(index, 'lastName', e.target.value)}
                        />
                        <FieldError message={errors[`emergencyContacts.${index}.lastName`]} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Mobile Number</Label>
                        <Input
                          value={contact.mobileNumber}
                          onChange={e => updateEmergencyContact(index, 'mobileNumber', e.target.value)}
                        />
                        <FieldError message={errors[`emergencyContacts.${index}.mobileNumber`]} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                          value={contact.email}
                          onChange={e => updateEmergencyContact(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmergencyContact}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Emergency Contact
                </Button>
              </div>
            )}

            {section.id === 'insurance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Insurance Type</Label>
                      <InlineAddButton label="Insurance Type" />
                    </div>
                    <Input
                      placeholder="Private / Medicare / Other"
                      value={formData.insurance.insuranceType}
                      onChange={e => updateInsuranceField('insuranceType', e.target.value)}
                    />
                    <FieldError message={errors['insurance.insuranceType']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insurance Name</Label>
                    <Input
                      value={formData.insurance.insuranceName}
                      onChange={e => updateInsuranceField('insuranceName', e.target.value)}
                    />
                    <FieldError message={errors['insurance.insuranceName']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan Type</Label>
                    <Input
                      value={formData.insurance.planType}
                      onChange={e => updateInsuranceField('planType', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Plan Name</Label>
                    <Input
                      value={formData.insurance.planName}
                      onChange={e => updateInsuranceField('planName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member ID</Label>
                    <Input
                      value={formData.insurance.memberId}
                      onChange={e => updateInsuranceField('memberId', e.target.value)}
                    />
                    <FieldError message={errors['insurance.memberId']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Group ID</Label>
                    <Input
                      value={formData.insurance.groupId}
                      onChange={e => updateInsuranceField('groupId', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Group Name</Label>
                    <Input
                      value={formData.insurance.groupName}
                      onChange={e => updateInsuranceField('groupName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Effective Start Date</Label>
                    <Input
                      type="date"
                      value={formData.insurance.effectiveStart}
                      onChange={e => updateInsuranceField('effectiveStart', e.target.value)}
                    />
                    <FieldError message={errors['insurance.effectiveStart']} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Effective End Date</Label>
                    <Input
                      type="date"
                      value={formData.insurance.effectiveEnd}
                      onChange={e => updateInsuranceField('effectiveEnd', e.target.value)}
                    />
                    <FieldError message={errors['insurance.effectiveEnd']} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Relationship to Insured</Label>
                    <Select
                      value={formData.insurance.relationshipToInsured}
                      onValueChange={value => updateInsuranceField('relationshipToInsured', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {['self', 'spouse', 'child', 'other'].map(option => (
                          <SelectItem key={option} value={option}>
                            {option.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insured First Name</Label>
                    <Input
                      value={formData.insurance.insuredFirstName}
                      onChange={e => updateInsuranceField('insuredFirstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insured Last Name</Label>
                    <Input
                      value={formData.insurance.insuredLastName}
                      onChange={e => updateInsuranceField('insuredLastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Insured Phone</Label>
                    <Input
                      value={formData.insurance.insuredPhone}
                      onChange={e => updateInsuranceField('insuredPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insured Email</Label>
                    <Input
                      value={formData.insurance.insuredEmail}
                      onChange={e => updateInsuranceField('insuredEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Insured Address Line 1</Label>
                    <Input
                      value={formData.insurance.insuredAddress.line1}
                      onChange={e => updateInsuranceAddress('line1', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insured Address Line 2</Label>
                    <Input
                      value={formData.insurance.insuredAddress.line2}
                      onChange={e => updateInsuranceAddress('line2', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">City</Label>
                    <Input
                      value={formData.insurance.insuredAddress.city}
                      onChange={e => updateInsuranceAddress('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State</Label>
                    <Input
                      value={formData.insurance.insuredAddress.state}
                      onChange={e => updateInsuranceAddress('state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Country</Label>
                    <Input
                      value={formData.insurance.insuredAddress.country}
                      onChange={e => updateInsuranceAddress('country', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Zip Code</Label>
                    <Input
                      value={formData.insurance.insuredAddress.postalCode}
                      onChange={e => updateInsuranceAddress('postalCode', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload Insurance Card</Label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="insurance-card-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
                    >
                      <FileUp className="h-4 w-4" />
                      Upload Card
                    </label>
                    <input
                      id="insurance-card-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleInsuranceCardUpload}
                    />
                    {formData.insurance.cardImage && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {section.id === 'preferences' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Preferred Pharmacy</Label>
                      <InlineAddButton label="Pharmacy" />
                    </div>
                    <Input
                      placeholder="Search pharmacies"
                      value={formData.preferences.pharmacy}
                      onChange={e => updatePreferencesField('pharmacy', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Lab</Label>
                    <Input
                      placeholder="Search labs"
                      value={formData.preferences.lab}
                      onChange={e => updatePreferencesField('lab', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Radiology</Label>
                    <Input
                      placeholder="Search radiology centers"
                      value={formData.preferences.radiology}
                      onChange={e => updatePreferencesField('radiology', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preferred Doctor Gender</Label>
                    <Select
                      value={formData.preferences.preferredDoctorGender}
                      onValueChange={value => updatePreferencesField('preferredDoctorGender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorGenderOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Hospital</Label>
                    <Input
                      value={formData.preferences.preferredHospital}
                      onChange={e => updatePreferencesField('preferredHospital', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Contact Method</Label>
                    <Select
                      value={formData.preferences.preferredContactMethod}
                      onValueChange={value => updatePreferencesField('preferredContactMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactMethodOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {section.id === 'consent' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consentDetails.map(item => (
                    <div key={item.key} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
                      <Checkbox
                        id={item.key}
                        checked={item.value}
                        onCheckedChange={checked =>
                          updateConsentField(item.key as keyof typeof formData.consent, Boolean(checked))
                        }
                      />
                      <div className="text-sm">
                        <label htmlFor={item.key} className="font-medium text-gray-900">
                          {item.label}
                        </label>
                        {item.hint && <p className="text-xs text-gray-500">{item.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Status</Label>
                    <Select
                      value={formData.consent.patientStatus}
                      onValueChange={value => updateConsentField('patientStatus', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Data Capture Date</Label>
                    <Input
                      type="date"
                      value={formData.consent.dataCaptureDate}
                      onChange={e => updateConsentField('dataCaptureDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Signature / Consent</Label>
                    <Input
                      placeholder="Captured via signature pad"
                      value={formData.consent.signature}
                      onChange={e => updateConsentField('signature', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {section.id === 'clinical' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Allergies</Label>
                    <Textarea
                      placeholder="Separate allergies with commas"
                      value={formData.clinical.allergies}
                      onChange={e => updateClinicalField('allergies', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Chronic Conditions</Label>
                    <Textarea
                      placeholder="e.g., Diabetes, Asthma"
                      value={formData.clinical.chronicConditions}
                      onChange={e => updateClinicalField('chronicConditions', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Smoking Status</Label>
                    <Select
                      value={formData.clinical.smokingStatus}
                      onValueChange={value => updateClinicalField('smokingStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {smokingStatusOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Alcohol Use</Label>
                    <Select
                      value={formData.clinical.alcoholUse}
                      onValueChange={value => updateClinicalField('alcoholUse', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {alcoholUseOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Height (cm)</Label>
                    <Input
                      type="number"
                      value={formData.clinical.heightCm}
                      onChange={e => updateClinicalField('heightCm', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Weight (kg)</Label>
                    <Input
                      type="number"
                      value={formData.clinical.weightKg}
                      onChange={e => updateClinicalField('weightKg', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BMI</Label>
                    <Input value={calculatedBMI || '--'} readOnly />
                  </div>
                </div>
              </div>
            )}
          </AccordionSection>
        ))}

        {(errors.submit || errors.facility) && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errors.submit || errors.facility}</span>
          </div>
        )}
      </form>

      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !currentFacility}
            className="flex-1 bg-primary text-white"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUpdatingExisting || isEditing ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </div>
    </div>
  );
}
