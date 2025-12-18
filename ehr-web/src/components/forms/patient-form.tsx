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
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';
import { FHIRPatient, PatientSummary, FacilitySummary } from '@/types/fhir';
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
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { staffService } from '@/services/staff.service';
import { facilityService } from '@/services/facility.service';
import { StaffMember, PROVIDER_COLORS, DEFAULT_OFFICE_HOURS } from '@/types/staff';
import { StaffDetailDrawer } from '@/components/staff/staff-detail-drawer';
import { NoFacilityNotice } from './patient-form-components/NoFacilityNotice';
import { PatientSearch } from './patient-form-components/PatientSearch';
import { PhotoUpload } from './patient-form-components/PhotoUpload';

interface PatientFormProps {
  patient?: FHIRPatient;
  isEditing?: boolean;
  compactMode?: boolean;
  onSubmit: (
    data: CreatePatientRequest | UpdatePatientRequest,
    isUpdate?: boolean,
    patientId?: string
  ) => Promise<void>;
  onCancel: () => void;
}

// Gender options - will be translated dynamically in component
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

// Pronoun options - will be translated dynamically in component
const pronounOptions = ['He/Him', 'She/Her', 'They/Them', 'Prefer to self-describe'];

// Marital status options - will be translated dynamically in component
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

// Options that will be translated dynamically in component
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
  { id: 'emergency', title: 'Emergency Contact (Optional)', icon: AlertCircle, required: false },
  { id: 'insurance', title: 'Insurance (Optional)', icon: Shield, required: false },
  { id: 'preferences', title: 'Preferences', icon: Sparkles },
  { id: 'consent', title: 'Privacy & Consent', icon: Lock, required: true },
  { id: 'clinical', title: 'Clinical Context', icon: Activity }
];

type FacilityTypeOption = 'clinic' | 'hospital' | 'lab' | 'pharmacy';

const locationTypeOptions: { value: FacilityTypeOption; label: string }[] = [
  { value: 'clinic', label: 'Clinic' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'pharmacy', label: 'Pharmacy' }
];

const providerSpecialtyOptions = [
  'Family Medicine',
  'Internal Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology'
];

const InlineAddButton = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-xs font-medium text-[#3342a5] hover:text-[#2a3686]"
  >
    + Add {label}
  </button>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-600 mt-1">{message}</p> : null;

const RequiredLabel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <Label className={`text-sm font-medium ${className}`}>
    {children}
    <span className="text-red-600 ml-1">*</span>
  </Label>
);

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
  <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors rounded-t-lg ${
        isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#3342a5]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-3.5 w-3.5 text-[#3342a5]" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {required && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
          </div>
          {!isOpen && <p className="text-[11px] text-gray-500">Click to expand</p>}
        </div>
      </div>
      <ChevronDown
        className={`h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
    {isOpen && <div className="px-3 py-3">{children}</div>}
  </div>
);

export function PatientForm({
  patient,
  isEditing = false,
  compactMode = false,
  onSubmit,
  onCancel
}: PatientFormProps) {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

  // In compact mode, auto-expand all required sections for quick entry
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    provider: true,
    patient: true,
    contact: true,
    emergency: compactMode ? true : false,
    insurance: false, // Optional in compact mode
    preferences: false,
    consent: compactMode ? true : false,
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
  const compactHiddenSections = compactMode ? new Set(['preferences', 'clinical']) : null;
  const [providerOptions, setProviderOptions] = useState<SelectOption[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true); // Start as true since we fetch immediately
  const [providerDrawerOpen, setProviderDrawerOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<StaffMember | null>(null);

  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: '',
    type: 'clinic' as FacilityTypeOption,
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: ''
  });

  // Translated options using useMemo
  const translatedGenderOptions = useMemo(() => [
    { value: 'male', label: t('patient_form.male') },
    { value: 'female', label: t('patient_form.female') },
    { value: 'other', label: t('patient_form.other') },
    { value: 'unknown', label: t('patient_form.unknown') }
  ], [t]);

  const translatedPronounOptions = useMemo(() => [
    t('patient_form.he_him'),
    t('patient_form.she_her'),
    t('patient_form.they_them'),
    t('patient_form.prefer_self_describe')
  ], [t]);

  const translatedMaritalStatusOptions = useMemo(() => [
    { value: 'S', label: t('patient_form.single') },
    { value: 'M', label: t('patient_form.married') },
    { value: 'D', label: t('patient_form.divorced') },
    { value: 'W', label: t('patient_form.widowed') },
    { value: 'U', label: t('patient_form.unknown') }
  ], [t]);

  const translatedLocationTypeOptions = useMemo(() => [
    { value: 'clinic' as FacilityTypeOption, label: t('patient_form.clinic') },
    { value: 'hospital' as FacilityTypeOption, label: t('patient_form.hospital') },
    { value: 'lab' as FacilityTypeOption, label: t('patient_form.laboratory') },
    { value: 'pharmacy' as FacilityTypeOption, label: t('patient_form.pharmacy') }
  ], [t]);

  const translatedSectionConfig = useMemo(() => [

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'provider', title: t('patient_form.provider_information'), icon: Stethoscope, required: true },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'patient', title: t('patient_form.patient_details'), icon: User, required: true },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'contact', title: t('patient_form.contact_information'), icon: Phone, required: true },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'emergency', title: t('patient_form.emergency_contact_optional'), icon: AlertCircle, required: false },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'insurance', title: t('patient_form.insurance_optional'), icon: Shield, required: false },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'preferences', title: t('patient_form.preferences'), icon: Sparkles },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'consent', title: t('patient_form.privacy_consent'), icon: Lock, required: true },

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
    { id: 'clinical', title: t('patient_form.clinical_context'), icon: Activity }

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);
  ], [t]);

  // Translated language options
  const translatedLanguageOptions = useMemo(() => [
    { value: 'en', label: t('patient_form.language_english') },
    { value: 'es', label: t('patient_form.language_spanish') },
    { value: 'fr', label: t('patient_form.language_french') },
    { value: 'hi', label: t('patient_form.language_hindi') }
  ], [t]);

  // Translated relationship options
  const translatedRelationshipOptions = useMemo(() => [
    t('patient_form.relationship_spouse'),
    t('patient_form.relationship_parent'),
    t('patient_form.relationship_child'),
    t('patient_form.relationship_sibling'),
    t('patient_form.relationship_friend'),
    t('patient_form.relationship_other')
  ], [t]);

  const mapStaffToOption = (provider: StaffMember): SelectOption => ({
    value: provider.id,
    label: provider.name,
    subtitle: provider.specialty,
    color: provider.color,
    textColor: provider.color ? '#ffffff' : undefined
  });

  const mapFacilityToOption = (facility: FacilitySummary | { id?: string; name?: string }): SelectOption => ({
    value: facility.id || '',
    label: facility.name || 'Unnamed Location'
  });

  useEffect(() => {
    const fetchProviders = async () => {
      if (!currentFacility?.id) {
        console.log('No facility selected, skipping provider fetch');
        setProvidersLoading(false);
        return;
      }

      // Skip if already loaded
      if (providerOptions.length > 0) {
        setProvidersLoading(false);
        return;
      }

      try {
        setProvidersLoading(true);
        console.log('Fetching providers for org:', currentFacility.id);

        // Use StaffService to fetch practitioners (same as staff page)
        const practitioners = await staffService.getPractitioners({
          active: true,
          count: 100
        });

        console.log('Found practitioners:', practitioners.length);

        const options = practitioners.map((p: StaffMember) => ({
          value: p.id,
          label: p.name,
          subtitle: p.specialty || 'General Practitioner',
          color: p.color || '#3B82F6',
          textColor: '#ffffff'
        }));

        console.log('Mapped provider options:', options);
        setProviderOptions(options);
      } catch (error) {
        console.error('Error loading providers:', error);
        setProviderOptions([]);
      } finally {
        setProvidersLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const { facilities } = await facilityService.searchFacilities({
          active: true,
          parentOrgId: currentFacility?.id
        });
        setLocationOptions(facilities.map(mapFacilityToOption));
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchProviders();
    fetchLocations();
  }, [currentFacility?.id]);

  const handleAddProvider = () => {
    // Create new empty staff member
    const newProvider: StaffMember = {
      resourceType: 'Practitioner',
      id: '',
      name: '',
      specialty: '',
      phone: '',
      email: '',
      qualification: 'Medical Doctor',
      active: true,
      employmentType: 'full-time',
      color: PROVIDER_COLORS[0],
      officeHours: DEFAULT_OFFICE_HOURS,
      vacationSchedules: []
    };
    setEditingProvider(newProvider);
    setProviderDrawerOpen(true);
  };

  const handleSaveProvider = async (updatedProvider: StaffMember) => {
    try {
      let savedProvider: StaffMember;

      if (updatedProvider.id) {
        // Update existing provider
        savedProvider = await staffService.updatePractitioner(updatedProvider.id, updatedProvider);
      } else {
        // Create new provider
        savedProvider = await staffService.createPractitioner(updatedProvider);
      }

      const option = mapStaffToOption(savedProvider);
      setProviderOptions(prev => {
        const existing = prev.find(p => p.value === savedProvider.id);
        if (existing) {
          return prev.map(p => p.value === savedProvider.id ? option : p);
        }
        return [...prev, option];
      });

      updateProviderField('primaryProviderId', option.value);
      setProviderDrawerOpen(false);
      setEditingProvider(null);
    } catch (error) {
      console.error('Error saving provider:', error);
      alert('Failed to save provider. Please try again.');
    }
  };

  const handleCreateLocation = async () => {
    if (!locationForm.name) {
      return;
    }

    setLocationSaving(true);
    try {
      const payload = {
        name: locationForm.name,
        type: locationForm.type,
        address:
          locationForm.line1 || locationForm.city || locationForm.state || locationForm.postalCode
            ? {
                line: [locationForm.line1, locationForm.line2].filter(Boolean),
                city: locationForm.city,
                state: locationForm.state,
                postalCode: locationForm.postalCode,
                country: 'US'
              }
            : undefined,
        phone: locationForm.phone || undefined,
        email: locationForm.email || undefined
      };

      const created = await facilityService.createFacility(payload, 'current-user');
      const option = mapFacilityToOption({ id: created.id, name: created.name });
      setLocationOptions(prev => [...prev, option]);
      updateProviderField('providerLocationId', option.value);
      setLocationDialogOpen(false);
      setLocationForm({
        name: '',
        type: 'clinic',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        phone: '',
        email: ''
      });
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setLocationSaving(false);
    }
  };


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

    console.log('Form submission started');
    console.log('Current facility:', currentFacility);

    // Check facility first
    if (!currentFacility) {
      console.error('No facility selected');
      setErrors({ facility: 'Please select a facility before creating a patient.' });
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const isValid = validate();
    console.log('Validation result:', isValid);

    if (!isValid) {
      console.error('Validation failed with errors:', errors);
      // Scroll to top to show error summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = prepareSubmitData();
      console.log('Payload prepared:', payload);
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
        { key: 'consentEmail', label: t('patient_form.consent_email'), value: formData.consent.consentEmail },
        { key: 'consentCall', label: t('patient_form.consent_call'), value: formData.consent.consentCall },
        {
          key: 'consentMessage',
          label: t('patient_form.consent_message'),
          value: formData.consent.consentMessage,
          hint: t('patient_form.phone_verification_required')
        },
        {
          key: 'allowDataSharing',
          label: t('patient_form.allow_data_sharing'),
          value: formData.consent.allowDataSharing
        }
      ] as Array<{ key: keyof typeof formData.consent; label: string; value: boolean; hint?: string }>,
    [formData.consent, t]
  );

  return (
    <div className="space-y-3">
      {!currentFacility && <NoFacilityNotice />}

      <form onSubmit={handleSubmit} className="space-y-3">
        <PatientSearch onSelectPatient={handleSelectPatient} />

        {/* Error Summary Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-2">
                  Cannot Create Patient - Please Fix Errors
                </h3>
                {errors.facility && (
                  <div className="text-sm text-red-800 mb-2 font-medium">{errors.facility}</div>
                )}
                {errors.submit && (
                  <div className="text-sm text-red-800 mb-2 font-medium">{errors.submit}</div>
                )}
                {!errors.facility && !errors.submit && (
                  <div className="text-sm text-red-800">
                    <p className="mb-2">Please complete the following required fields:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs bg-white bg-opacity-50 rounded p-2">
                      {Object.entries(errors).map(([key, value]) => (
                        <li key={key} className="text-red-700">
                          <span className="font-medium">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {compactMode && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{t('patient_form.quick_entry_mode_description')}</span>
          </div>
        )}

        {translatedSectionConfig.map(section => {
          if (compactMode && compactHiddenSections?.has(section.id)) {
            return null;
          }
          return (
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <RequiredLabel>{t('patient_form.primary_provider')}</RequiredLabel>
                      <InlineAddButton label="Provider" onClick={handleAddProvider} />
                    </div>
                    <SearchableSelect
                      options={providerOptions}
                      value={formData.provider.primaryProviderId}
                      onChange={(value) => updateProviderField('primaryProviderId', value)}
                      placeholder={providersLoading ? t('patient_form.loading_providers') : t('patient_form.select_provider')}
                      disabled={providersLoading && providerOptions.length === 0}
                      showColorInButton
                      onAddNew={handleAddProvider}
                      addNewLabel={t('patient_form.add_provider')}
                    />
                    {providersLoading && providerOptions.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading staff list...
                      </p>
                    )}
                    <FieldError message={errors['provider.primaryProviderId']} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <RequiredLabel>{t('patient_form.provider_group_location')}</RequiredLabel>
                      <InlineAddButton label="Location" onClick={() => setLocationDialogOpen(true)} />
                    </div>
                    <SearchableSelect
                      options={locationOptions}
                      value={formData.provider.providerLocationId}
                      onChange={(value) => updateProviderField('providerLocationId', value)}
                      placeholder={locationsLoading ? t('patient_form.loading_locations') : t('patient_form.select_location')}
                      onAddNew={() => setLocationDialogOpen(true)}
                      addNewLabel={t('patient_form.add_location')}
                    />
                    {locationsLoading && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Fetching locations...
                      </p>
                    )}
                    <FieldError message={errors['provider.providerLocationId']} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <RequiredLabel>{t('patient_form.registration_date')}</RequiredLabel>
                    <Input
                      type="date"
                      value={formData.provider.registrationDate}
                      onChange={e => updateProviderField('registrationDate', e.target.value)}
                    />
                    <FieldError message={errors['provider.registrationDate']} />
                  </div>
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">{t('patient_form.referred_by')}</Label>
                      <Input
                        placeholder={t('patient_form.referral_source')}
                        value={formData.provider.referredBy}
                        onChange={e => updateProviderField('referredBy', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {section.id === 'patient' && (
              <div className="space-y-3">
                {!compactMode && (
                  <PhotoUpload photoPreview={photoPreview} onPhotoChange={handlePhotoChange} />
                )}
                <div
                  className={`grid grid-cols-1 gap-3 ${
                    compactMode ? 'md:grid-cols-2' : 'md:grid-cols-4'
                  }`}
                >
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">{t('patient_form.prefix')}</Label>
                      <Select
                        value={formData.demographics.prefix}
                        onValueChange={value => updateDemographicsField('prefix', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('patient_form.prefix_placeholder')} />
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
                  )}
                  <div>
                    <RequiredLabel>{t('patient_form.first_name')}</RequiredLabel>
                    <Input
                      value={formData.demographics.firstName}
                      onChange={e => updateDemographicsField('firstName', e.target.value)}
                    />
                    <FieldError message={errors['demographics.firstName']} />
                  </div>
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">{t('patient_form.middle_name')}</Label>
                      <Input
                        value={formData.demographics.middleName}
                        onChange={e => updateDemographicsField('middleName', e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <RequiredLabel>{t('patient_form.last_name')}</RequiredLabel>
                    <Input
                      value={formData.demographics.lastName}
                      onChange={e => updateDemographicsField('lastName', e.target.value)}
                    />
                    <FieldError message={errors['demographics.lastName']} />
                  </div>
                </div>
                <div
                  className={`grid grid-cols-1 gap-3 ${
                    compactMode ? 'md:grid-cols-2' : 'md:grid-cols-4'
                  }`}
                >
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">{t('patient_form.preferred_name')}</Label>
                      <Input
                        value={formData.demographics.preferredName}
                        onChange={e => updateDemographicsField('preferredName', e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <RequiredLabel>{t('patient_form.date_of_birth')}</RequiredLabel>
                    <Input
                      type="date"
                      value={formData.demographics.dateOfBirth}
                      onChange={e => updateDemographicsField('dateOfBirth', e.target.value)}
                    />
                    <FieldError message={errors['demographics.dateOfBirth']} />
                  </div>
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">{t('patient_form.age')}</Label>
                      <Input value={calculatedAge || '--'} readOnly />
                    </div>
                  )}
                  <div>
                    <RequiredLabel>{t('patient_form.gender')}</RequiredLabel>
                    <Select
                      value={formData.demographics.gender}
                      onValueChange={value =>
                        updateDemographicsField('gender', value as 'male' | 'female' | 'other' | 'unknown')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('patient_form.gender_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {translatedGenderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors['demographics.gender']} />
                  </div>
                </div>
                {!compactMode && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm font-medium">{t('patient_form.pronouns')}</Label>
                        <Select
                          value={formData.demographics.pronouns}
                          onValueChange={value => updateDemographicsField('pronouns', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('patient_form.select_pronouns')} />
                          </SelectTrigger>
                          <SelectContent>
                            {translatedPronounOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{t('patient_form.marital_status')}</Label>
                        <Select
                          value={formData.demographics.maritalStatus}
                          onValueChange={value => updateDemographicsField('maritalStatus', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('patient_form.select_status')} />
                          </SelectTrigger>
                          <SelectContent>
                            {translatedMaritalStatusOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{t('patient_form.occupation')}</Label>
                        <Input
                          value={formData.demographics.occupation}
                          onChange={e => updateDemographicsField('occupation', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm font-medium">{t('patient_form.employer')}</Label>
                        <Input
                          value={formData.demographics.employer}
                          onChange={e => updateDemographicsField('employer', e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{t('patient_form.language')}</Label>
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm font-medium">Disability Status</Label>
                        <Input
                          value={formData.demographics.disabilityStatus}
                          onChange={e => updateDemographicsField('disabilityStatus', e.target.value)}
                        />
                      </div>
                    </div>
                    {!compactMode && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                    )}
                  </>
                )}
              </div>
            )}

            {section.id === 'contact' && (
              <div className="space-y-3">
                <div className={`grid grid-cols-1 gap-3 ${compactMode ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
                  <div>
                    <RequiredLabel>Mobile Number</RequiredLabel>
                    <Input
                      value={formData.contact.mobileNumber}
                      onChange={e => updateContactField('mobileNumber', e.target.value)}
                    />
                    <FieldError message={errors['contact.mobileNumber']} />
                  </div>
                  <div>
                    <RequiredLabel>Email</RequiredLabel>
                    <Input
                      type="email"
                      value={formData.contact.email}
                      onChange={e => updateContactField('email', e.target.value)}
                    />
                    <FieldError message={errors['contact.email']} />
                  </div>
                  {!compactMode && (
                    <>
                      <div>
                        <Label className="text-sm font-medium">Home Number</Label>
                        <Input
                          value={formData.contact.homeNumber}
                          onChange={e => updateContactField('homeNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Fax</Label>
                        <Input
                          value={formData.contact.faxNumber}
                          onChange={e => updateContactField('faxNumber', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
                {!compactMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <RequiredLabel>Address Line 1</RequiredLabel>
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
                )}
                {compactMode && (
                  <div>
                    <RequiredLabel>Address</RequiredLabel>
                    <Input
                      placeholder="Street address"
                      value={formData.contact.address.line1}
                      onChange={e => updateContactAddress('line1', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.line1']} />
                  </div>
                )}
                <div className={`grid grid-cols-1 gap-3 ${compactMode ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
                  <div>
                    <RequiredLabel>City</RequiredLabel>
                    <Input
                      value={formData.contact.address.city}
                      onChange={e => updateContactAddress('city', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.city']} />
                  </div>
                  <div>
                    <RequiredLabel>State</RequiredLabel>
                    <Input
                      value={formData.contact.address.state}
                      onChange={e => updateContactAddress('state', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.state']} />
                  </div>
                  {!compactMode && (
                    <div>
                      <RequiredLabel>Country</RequiredLabel>
                      <Input
                        value={formData.contact.address.country}
                        onChange={e => updateContactAddress('country', e.target.value)}
                      />
                      <FieldError message={errors['contact.address.country']} />
                    </div>
                  )}
                  <div>
                    <RequiredLabel>Zip Code</RequiredLabel>
                    <Input
                      value={formData.contact.address.postalCode}
                      onChange={e => updateContactAddress('postalCode', e.target.value)}
                    />
                    <FieldError message={errors['contact.address.postalCode']} />
                  </div>
                </div>
                {!compactMode && (
                  <div>
                    <Label className="text-sm font-medium">Preferred Contact Time</Label>
                    <Input
                      placeholder="Morning / Afternoon / Evening"
                      value={formData.contact.preferredContactTime}
                      onChange={e => updateContactField('preferredContactTime', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {section.id === 'emergency' && (
              <div className="space-y-6">
                {formData.emergencyContacts.length === 0 && (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">{t('patient_form.no_emergency_contacts')}</p>
                    <p className="text-xs text-gray-600 mb-4">
                      {t('patient_form.emergency_contacts_optional_description')}
                    </p>
                  </div>
                )}
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={`contact-${index}`} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="h-4 w-4 text-[#3342a5]" />
                        Contact #{index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmergencyContact(index)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                    {!compactMode && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <Input
                            value={contact.email}
                            onChange={e => updateEmergencyContact(index, 'email', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmergencyContact}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('patient_form.add_emergency_contact')}
                </Button>
              </div>
            )}

            {section.id === 'insurance' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                  <span>Insurance information is optional. You can add it now or update later.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">Plan Type</Label>
                      <Input
                        value={formData.insurance.planType}
                        onChange={e => updateInsuranceField('planType', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">Plan Name</Label>
                      <Input
                        value={formData.insurance.planName}
                        onChange={e => updateInsuranceField('planName', e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Member ID</Label>
                    <Input
                      value={formData.insurance.memberId}
                      onChange={e => updateInsuranceField('memberId', e.target.value)}
                    />
                    <FieldError message={errors['insurance.memberId']} />
                  </div>
                  {!compactMode && (
                    <div>
                      <Label className="text-sm font-medium">Group ID</Label>
                      <Input
                        value={formData.insurance.groupId}
                        onChange={e => updateInsuranceField('groupId', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {!compactMode && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Group Name</Label>
                      <Input
                        value={formData.insurance.groupName}
                        onChange={e => updateInsuranceField('groupName', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                {!compactMode && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                  </>
                )}
              </div>
            )}

            {section.id === 'preferences' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
        );
        })}

      </form>

      {/* Staff Detail Drawer for adding/editing providers */}
      <StaffDetailDrawer
        isOpen={providerDrawerOpen}
        onClose={() => {
          setProviderDrawerOpen(false);
          setEditingProvider(null);
        }}
        staff={editingProvider}
        onSave={handleSaveProvider}
      />

      <Dialog
        open={locationDialogOpen}
        onOpenChange={(open) => {
          if (!locationSaving) {
            setLocationDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
            <DialogDescription>
              Capture clinic or ward details without leaving the intake flow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Location Name</Label>
              <Input
                value={locationForm.name}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Downtown Clinic"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Select
                value={locationForm.type}
                onValueChange={(value: FacilityTypeOption) =>
                  setLocationForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {translatedLocationTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <Input
                value={locationForm.phone}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555-987-6543"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input
                value={locationForm.email}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="frontdesk@clinic.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Address Line 1</Label>
              <Input
                value={locationForm.line1}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, line1: e.target.value }))}
                placeholder="123 Health St."
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Address Line 2</Label>
              <Input
                value={locationForm.line2}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, line2: e.target.value }))}
                placeholder="Suite 200"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">City</Label>
              <Input
                value={locationForm.city}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">State</Label>
              <Input
                value={locationForm.state}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Postal Code</Label>
              <Input
                value={locationForm.postalCode}
                onChange={(e) =>
                  setLocationForm((prev) => ({ ...prev, postalCode: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocationDialogOpen(false)}
              disabled={locationSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleCreateLocation}
              disabled={locationSaving}
              className="bg-[#3342a5] hover:bg-[#2a3686] text-white"
            >
              {locationSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('patient_form.save_location')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-4">
        <div className="flex flex-col gap-2">
          {!currentFacility && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{t('patient_form.select_facility_warning')}</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !currentFacility}
              className="flex-1 bg-[#3342a5] hover:bg-[#2a3686] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title={!currentFacility ? t('patient_form.select_facility_first') : ''}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isUpdatingExisting || isEditing ? t('patient_form.update_patient') : t('patient_form.create_patient')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
