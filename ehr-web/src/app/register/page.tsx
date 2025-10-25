'use client';

import { useState } from 'react';
import { Activity, Building2, User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Check, AlertCircle, ArrowRight, Upload, X, Sparkles, Heart, Brain, Baby, Bone, Stethoscope } from 'lucide-react';
import Image from 'next/image';

interface FormData {
  org_type: string;
  org_name: string;
  legal_name: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
  contact_phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  timezone: string;
  specialties: string[];
  logo_file: File | null;
  logo_preview: string;
  terms_accepted: boolean;
  baa_accepted: boolean;
}

const ORG_TYPES = [
  { value: 'hospital', label: 'Hospital', icon: Building2, description: 'Inpatient and emergency care facility' },
  { value: 'clinic', label: 'Clinic', icon: Stethoscope, description: 'Outpatient medical services' },
  { value: 'diagnostic_center', label: 'Diagnostic Center', icon: Activity, description: 'Imaging and lab services' },
  { value: 'pharmacy', label: 'Pharmacy', icon: Heart, description: 'Medication dispensing and counseling' },
  { value: 'nursing_home', label: 'Nursing Home', icon: User, description: 'Long-term care facility' },
  { value: 'lab', label: 'Laboratory', icon: Brain, description: 'Medical testing and analysis' },
];

const SPECIALTIES: Record<string, Array<{ value: string; label: string; icon: any }>> = {
  hospital: [
    { value: 'general_practice', label: 'General Medicine', icon: Stethoscope },
    { value: 'emergency_medicine', label: 'Emergency Medicine', icon: AlertCircle },
    { value: 'surgery', label: 'Surgery', icon: Activity },
    { value: 'pediatrics', label: 'Pediatrics', icon: Baby },
    { value: 'cardiology', label: 'Cardiology', icon: Heart },
    { value: 'orthopedics', label: 'Orthopedics', icon: Bone },
    { value: 'neurology', label: 'Neurology', icon: Brain },
    { value: 'obstetrics', label: 'Obstetrics & Gynecology', icon: User },
  ],
  clinic: [
    { value: 'general_practice', label: 'General Practice', icon: Stethoscope },
    { value: 'family_medicine', label: 'Family Medicine', icon: User },
    { value: 'pediatrics', label: 'Pediatrics', icon: Baby },
    { value: 'internal_medicine', label: 'Internal Medicine', icon: Activity },
    { value: 'dermatology', label: 'Dermatology', icon: Heart },
    { value: 'ophthalmology', label: 'Ophthalmology', icon: AlertCircle },
  ],
  diagnostic_center: [
    { value: 'radiology', label: 'Radiology (X-Ray, CT, MRI)', icon: Activity },
    { value: 'ultrasound', label: 'Ultrasound', icon: Stethoscope },
    { value: 'pathology', label: 'Pathology', icon: Brain },
    { value: 'cardiology', label: 'Cardiac Imaging (Echo, ECG)', icon: Heart },
  ],
  pharmacy: [
    { value: 'retail_pharmacy', label: 'Retail Pharmacy', icon: Stethoscope },
    { value: 'clinical_pharmacy', label: 'Clinical Pharmacy', icon: Activity },
    { value: 'compounding', label: 'Compounding', icon: Brain },
    { value: 'specialty_pharmacy', label: 'Specialty Pharmacy', icon: Heart },
  ],
  nursing_home: [
    { value: 'geriatric_care', label: 'Geriatric Care', icon: User },
    { value: 'rehabilitation', label: 'Rehabilitation', icon: Activity },
    { value: 'palliative_care', label: 'Palliative Care', icon: Heart },
    { value: 'memory_care', label: 'Memory Care', icon: Brain },
  ],
  lab: [
    { value: 'clinical_pathology', label: 'Clinical Pathology', icon: Activity },
    { value: 'molecular_diagnostics', label: 'Molecular Diagnostics', icon: Brain },
    { value: 'microbiology', label: 'Microbiology', icon: Stethoscope },
    { value: 'hematology', label: 'Hematology', icon: Heart },
  ],
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    org_type: '',
    org_name: '',
    legal_name: '',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    contact_phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
    },
    timezone: 'America/New_York',
    specialties: [],
    logo_file: null,
    logo_preview: '',
    terms_accepted: false,
    baa_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo file size must be less than 2MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        logo_file: file,
        logo_preview: URL.createObjectURL(file)
      }));
      setError('');
    }
  };

  const handleRemoveLogo = () => {
    if (formData.logo_preview) {
      URL.revokeObjectURL(formData.logo_preview);
    }
    setFormData(prev => ({
      ...prev,
      logo_file: null,
      logo_preview: ''
    }));
  };

  const toggleSpecialty = (value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter(s => s !== value)
        : [...prev.specialties, value]
    }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slug = formData.org_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // For now, we'll store logo as base64 in metadata
      // In production, you'd upload to S3/Cloudinary
      let logoDataUrl = '';
      if (formData.logo_file) {
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.logo_file!);
        });
      }

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.owner_email,
          password: formData.owner_password,
          name: formData.owner_name,
          organization: {
            name: formData.org_name,
            slug: slug,
            legal_name: formData.legal_name || formData.org_name,
            org_type: formData.org_type,
            contact_phone: formData.contact_phone,
            address: formData.address,
            timezone: formData.timezone,
            specialties: formData.specialties,
            logo_url: logoDataUrl,
            terms_accepted: formData.terms_accepted,
            baa_accepted: formData.baa_accepted,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      alert('🎉 Your clinic has been created successfully! Please sign in with your credentials.');
      window.location.href = '/auth/signin';
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Organization Type', icon: Building2 },
    { number: 2, title: 'Details', icon: Stethoscope },
    { number: 3, title: 'Services', icon: Activity },
    { number: 4, title: 'Your Account', icon: User },
    { number: 5, title: 'Location', icon: MapPin },
  ];

  const getOrgTypeLabel = () => {
    const orgType = ORG_TYPES.find(t => t.value === formData.org_type);
    return orgType?.label || 'Organization';
  };

  const getOrgNamePlaceholder = () => {
    switch(formData.org_type) {
      case 'hospital': return 'e.g., City General Hospital';
      case 'clinic': return 'e.g., Community Health Clinic';
      case 'diagnostic_center': return 'e.g., Advanced Diagnostic Center';
      case 'pharmacy': return 'e.g., Main Street Pharmacy';
      case 'nursing_home': return 'e.g., Sunrise Care Home';
      case 'lab': return 'e.g., Precision Medical Laboratory';
      default: return 'e.g., Your Healthcare Facility';
    }
  };

  const currentSpecialties = formData.org_type ? SPECIALTIES[formData.org_type] || [] : [];

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Left Side - Live Preview Card */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 max-w-lg w-full">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Your {getOrgTypeLabel()} is Taking Shape!
            </h1>
            <p className="text-xl text-blue-100">
              Watch your {getOrgTypeLabel().toLowerCase()} come to life as you complete the setup
            </p>
          </div>

          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Logo Preview */}
            <div className="flex items-center gap-4">
              {formData.logo_preview ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-200 shadow-md">
                  <img src={formData.logo_preview} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {formData.org_name || `Your ${getOrgTypeLabel()} Name`}
                </h2>
                {formData.legal_name && (
                  <p className="text-sm text-gray-500 truncate">{formData.legal_name}</p>
                )}
              </div>
            </div>

            {/* Organization Type Preview */}
            {formData.org_type && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Type</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                  {getOrgTypeLabel()}
                </div>
              </div>
            )}

            {/* Specialties Preview */}
            {formData.specialties.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map(spec => {
                    const specialty = currentSpecialties.find(s => s.value === spec);
                    return (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {specialty && <specialty.icon className="w-4 h-4" />}
                        {specialty?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Info Preview */}
            {formData.contact_phone && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Contact</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{formData.contact_phone}</span>
                </div>
                {formData.owner_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{formData.owner_email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Location Preview */}
            {(formData.address.city || formData.address.state) && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Location</p>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    {formData.address.line1 && <div>{formData.address.line1}</div>}
                    {(formData.address.city || formData.address.state) && (
                      <div>
                        {formData.address.city}{formData.address.city && formData.address.state ? ', ' : ''}{formData.address.state} {formData.address.postal_code}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Preview */}
            {formData.owner_name && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Administrator</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData.owner_name}</p>
                    <p className="text-xs text-gray-500">Organization Admin</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Setup Progress</p>
                <p className="text-sm font-bold text-blue-600">{Math.round((step / 5) * 100)}%</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${(step / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative overflow-hidden">
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-float" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-[60%] right-[10%] w-24 h-24 bg-indigo-100 rounded-full opacity-25 animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
          <div className="absolute top-[30%] right-[25%] w-16 h-16 bg-purple-100 rounded-full opacity-20 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        </div>

        <div className="mx-auto w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gray-900">EHR Connect</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                    step >= s.number
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Step {step} of {steps.length}: {steps[step - 1].title}
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
              {step === 1 && 'What type of organization are you?'}
              {step === 2 && `Tell us about your ${getOrgTypeLabel().toLowerCase()}`}
              {step === 3 && 'What services do you offer?'}
              {step === 4 && 'Create your admin account'}
              {step === 5 && 'Almost there!'}
            </h1>
            <p className="text-base text-gray-600">
              {step === 1 && 'This helps us customize your experience'}
              {step === 2 && 'We\'ll use this to personalize your workspace'}
              {step === 3 && 'Select all that apply to your practice'}
              {step === 4 && 'This will be your login credentials'}
              {step === 5 && 'Just a few more details'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Organization Type Selection */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {ORG_TYPES.map((orgType) => {
                    const Icon = orgType.icon;
                    const isSelected = formData.org_type === orgType.value;
                    return (
                      <button
                        key={orgType.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, org_type: orgType.value, specialties: [] }))}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="w-full">
                          <p className={`text-base font-semibold text-center mb-1 ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {orgType.label}
                          </p>
                          <p className={`text-xs text-center ${
                            isSelected ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {orgType.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {!formData.org_type && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    Please select your organization type to continue
                  </p>
                )}

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.org_type}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Organization + Logo */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Logo Upload */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    {getOrgTypeLabel()} Logo <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  {!formData.logo_preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center py-4">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Upload your logo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={formData.logo_preview}
                        alt="Logo preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-blue-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="org_name" className="block text-base font-medium text-gray-700 mb-2">
                    {getOrgTypeLabel()} Name
                  </label>
                  <input
                    id="org_name"
                    name="org_name"
                    type="text"
                    value={formData.org_name}
                    onChange={handleChange}
                    placeholder={getOrgNamePlaceholder()}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="legal_name" className="block text-base font-medium text-gray-700 mb-2">
                    Legal Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="legal_name"
                    name="legal_name"
                    type="text"
                    value={formData.legal_name}
                    onChange={handleChange}
                    placeholder={`e.g., ${formData.org_name || getOrgTypeLabel()} LLC`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="contact_phone" className="block text-base font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-lg transition-all text-base"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all text-base shadow-md hover:shadow-lg"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Specialties/Services */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {currentSpecialties.map((specialty) => {
                    const Icon = specialty.icon;
                    const isSelected = formData.specialties.includes(specialty.value);
                    return (
                      <button
                        key={specialty.value}
                        type="button"
                        onClick={() => toggleSpecialty(specialty.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className={`text-sm font-medium text-center ${
                          isSelected ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {specialty.label}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {formData.specialties.length === 0 && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    Please select at least one specialty to continue
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-lg transition-all text-base"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={formData.specialties.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Account */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="owner_name" className="block text-base font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="owner_name"
                    name="owner_name"
                    type="text"
                    value={formData.owner_name}
                    onChange={handleChange}
                    placeholder="Dr. John Doe"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="owner_email" className="block text-base font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="owner_email"
                    name="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={handleChange}
                    placeholder="john@hospital.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="owner_password" className="block text-base font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="owner_password"
                      name="owner_password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.owner_password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-lg transition-all text-base"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all text-base shadow-md hover:shadow-lg"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Location & Terms */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="address.line1" className="block text-base font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    id="address.line1"
                    name="address.line1"
                    type="text"
                    value={formData.address.line1}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-base font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="New York"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-base font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="NY"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address.postal_code" className="block text-base font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    id="address.postal_code"
                    name="address.postal_code"
                    type="text"
                    value={formData.address.postal_code}
                    onChange={handleChange}
                    placeholder="10001"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                </div>

                {/* Terms */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="baa_accepted"
                      checked={formData.baa_accepted}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I accept the{' '}
                      <a href="/baa" className="text-blue-600 hover:text-blue-700 underline">
                        Business Associate Agreement (BAA)
                      </a>
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-lg transition-all text-base"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Creating Your Clinic...' : 'Create Clinic'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Already have an account?{' '}
              <a
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-20px) translateX(10px);
            }
            50% {
              transform: translateY(-40px) translateX(-10px);
            }
            75% {
              transform: translateY(-20px) translateX(5px);
            }
          }
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
