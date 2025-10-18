
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  User,
  MapPin,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  Globe,
  Sparkles,
  Check,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';

interface FormData {
  org_name: string;
  owner_email: string;
  owner_name: string;
  owner_password: string;
  confirm_password: string;
  legal_name: string;
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
  terms_accepted: boolean;
  baa_accepted: boolean;
}

type StepId = 'organization' | 'owner' | 'address' | 'legal';

interface Step {
  id: StepId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  {
    id: 'organization',
    title: 'Organization',
    description: 'Tell us about your healthcare organization',
    icon: Building2
  },
  {
    id: 'owner',
    title: 'Your Account',
    description: 'Create your admin credentials',
    icon: User
  },
  {
    id: 'address',
    title: 'Location',
    description: 'Where is your organization based?',
    icon: MapPin
  },
  {
    id: 'legal',
    title: 'Compliance',
    description: 'Review and accept legal agreements',
    icon: Shield
  },
];

// Input Component with Validation - Moved outside to prevent re-creation
interface InputValidationProps {
  label: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  value: string;
  hasError: boolean;
  isValid: boolean;
  errorMessage?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputWithValidation: React.FC<InputValidationProps> = ({
  label,
  name,
  icon: Icon,
  value,
  hasError,
  isValid,
  errorMessage,
  onChange,
  onBlur,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-slate-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#667eea]" />}
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            text-sm transition-all duration-200 border-2
            ${hasError
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50'
              : isValid
              ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100 bg-emerald-50/30'
              : 'border-slate-200 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/10 bg-white hover:border-slate-300'
            }
          `}
          {...props}
        />
        {hasError && (
          <AlertCircle className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
        )}
        {isValid && (
          <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>
      {hasError && errorMessage && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    org_name: '',
    owner_email: '',
    owner_name: '',
    owner_password: '',
    confirm_password: '',
    legal_name: '',
    contact_phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    },
    timezone: 'Asia/Kolkata',
    terms_accepted: false,
    baa_accepted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Real-time validation
  const validateField = (name: string, value: string, data: FormData = formData): string => {
    switch (name) {
      case 'owner_email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value
          ? 'Please enter a valid email address'
          : '';
      case 'owner_password':
        if (value.length > 0 && value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 0 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          return 'Include uppercase, lowercase, and numbers';
        return '';
      case 'confirm_password':
        return value && value !== data.owner_password
          ? 'Passwords do not match'
          : '';
      case 'contact_phone':
        return value && !/^[\d\s\+\-()]+$/.test(value)
          ? 'Please enter a valid phone number'
          : '';
      case 'org_name':
        return value && value.length < 3
          ? 'Organization name must be at least 3 characters'
          : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => {
      let updated: FormData;

      if (name.startsWith('address.')) {
        const [, child] = name.split('.') as [string, keyof FormData['address']];
        updated = {
          ...prev,
          address: { ...prev.address, [child]: value }
        };
      } else {
        updated = { ...prev, [name as keyof FormData]: value } as FormData;
      }

      if (touchedFields[name]) {
        const error = validateField(name, value, updated);
        setFieldErrors(prevErrors => ({ ...prevErrors, [name]: error }));
      }

      if (name === 'owner_password' && touchedFields.confirm_password) {
        const confirmError = validateField('confirm_password', updated.confirm_password, updated);
        setFieldErrors(prevErrors => ({ ...prevErrors, confirm_password: confirmError }));
      }

      return updated;
    });
  };

  const handleFieldBlur = (name: string, value: string) => {
    const updatedTouched = { ...touchedFields, [name]: true };
    setTouchedFields(updatedTouched);

    const currentData = name.startsWith('address.')
      ? {
          ...formData,
          address: {
            ...formData.address,
            [name.split('.')[1] as keyof FormData['address']]: value
          }
        }
      : ({ ...formData, [name as keyof FormData]: value } as FormData);

    const error = validateField(name, value, currentData);
    setFieldErrors(prev => ({ ...prev, [name]: error }));

    if (name === 'owner_password' && updatedTouched.confirm_password) {
      const confirmError = validateField('confirm_password', currentData.confirm_password, currentData);
      setFieldErrors(prev => ({ ...prev, confirm_password: confirmError }));
    }
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Organization
        return !!(formData.org_name && formData.contact_phone && formData.timezone);
      case 1: // Owner
        return !!(
          formData.owner_name &&
          formData.owner_email &&
          formData.owner_password &&
          formData.confirm_password &&
          formData.owner_password === formData.confirm_password &&
          !fieldErrors.owner_email &&
          !fieldErrors.owner_password
        );
      case 2: // Address
        return true; // Optional
      case 3: // Legal
        return formData.terms_accepted && formData.baa_accepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStepValid(currentStep)) {
      setError('Please complete all required fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: formData.org_name,
          owner_email: formData.owner_email,
          owner_name: formData.owner_name,
          owner_password: formData.owner_password,
          legal_name: formData.legal_name || formData.org_name,
          contact_phone: formData.contact_phone,
          address: formData.address,
          timezone: formData.timezone,
          terms_accepted: formData.terms_accepted,
          baa_accepted: formData.baa_accepted,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const result = await response.json();

      // Show success and redirect
      window.location.href = '/onboarding?registered=true&slug=' + result.organization.slug;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render input fields using the outer InputWithValidation component
  const renderInput = (
    label: string,
    name: string,
    icon?: React.ComponentType<{ className?: string }>,
    props?: { type?: string; required?: boolean; placeholder?: string; minLength?: number }
  ) => {
    const value = name.includes('.')
      ? formData.address[name.split('.')[1] as keyof typeof formData.address]
      : formData[name as keyof FormData];
    const hasError = !!(touchedFields[name] && fieldErrors[name]);
    const isValid = !!(touchedFields[name] && !fieldErrors[name] && value);

    return (
      <InputWithValidation
        label={label}
        name={name}
        icon={icon}
        value={value as string}
        hasError={hasError}
        isValid={isValid}
        errorMessage={fieldErrors[name]}
        onChange={(e) => handleFieldChange(name, e.target.value)}
        onBlur={(e) => handleFieldBlur(name, e.target.value)}
        {...props}
      />
    );
  };

  // Vertical Stepper Component
  const VerticalStepper = () => (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step.id} className="relative">
            <div className={`
              flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer
              ${isActive
                ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-300 shadow-md'
                : isCompleted
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200'
                : 'bg-white border-2 border-slate-200 hover:border-slate-300'
              }
            `}>
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-300'
                  : isCompleted
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-400'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`
                  text-base font-bold transition-colors truncate
                  ${isActive ? 'text-violet-700' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}
                `}>
                  {step.title}
                </h3>
                <p className={`
                  text-xs transition-colors truncate
                  ${isActive ? 'text-violet-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}
                `}>
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="ml-6 h-4 w-0.5 bg-gradient-to-b from-slate-200 to-transparent"></div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Modern Summary Card
  const LivePreview = () => {
    const getInitials = (name: string) => {
      if (!name) return '';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const formatAddress = () => {
      const parts = [
        formData.address.line1,
        formData.address.city,
        formData.address.state,
        formData.address.postal_code
      ].filter(Boolean);
      return parts.join(', ');
    };

    return (
      <div className="space-y-4">
        {/* Modern Business Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">Enterprise</span>
                </div>
              </div>
            </div>

            {/* Logo Badge - Overlapping */}
            <div className="px-6 -mt-12">
              <div className={`
                w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold
                shadow-xl border-4 border-white transition-all duration-500
                ${formData.org_name
                  ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white scale-100'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 scale-95'
                }
              `}>
                {formData.org_name ? getInitials(formData.org_name) : <Building2 className="w-12 h-12" />}
              </div>
            </div>

            <div className="px-6 pt-4 pb-6">
              {/* Organization Name */}
              <h3 className={`
                text-2xl font-bold mb-1 transition-colors
                ${formData.org_name ? 'text-slate-900' : 'text-slate-300'}
              `}>
                {formData.org_name || 'Your Organization'}
              </h3>

              {/* Legal Name */}
              {formData.legal_name && formData.legal_name !== formData.org_name && (
                <p className="text-sm text-slate-500 font-medium mb-4">
                  {formData.legal_name}
                </p>
              )}

              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {formData.contact_phone && (
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{formData.contact_phone}</p>
                    </div>
                  </div>
                )}

                {formData.owner_email && (
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{formData.owner_email}</p>
                    </div>
                  </div>
                )}

                {formatAddress() && (
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Location</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{formatAddress()}</p>
                    </div>
                  </div>
                )}

                <div className="col-span-2 flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Timezone</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {formData.timezone.split('/')[1]?.replace('_', ' ') || formData.timezone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Administrator Badge */}
              {formData.owner_name && (
                <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-base font-bold shadow-lg">
                      {getInitials(formData.owner_name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-slate-900">{formData.owner_name}</p>
                        <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-1 rounded-lg">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">System Administrator</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Badge */}
              {(formData.terms_accepted && formData.baa_accepted) && (
                <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">HIPAA Compliant & Secure</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Setup Progress */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-600" />
              <h4 className="text-sm font-bold text-slate-900">Setup Progress</h4>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${formData.org_name ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50 border-2 border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.org_name ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                {formData.org_name ? <Check className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Organization Profile</p>
                <p className="text-xs text-slate-500">Basic info & contact details</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${formData.owner_name && formData.owner_email ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50 border-2 border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.owner_name && formData.owner_email ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                {formData.owner_name && formData.owner_email ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Admin Account</p>
                <p className="text-xs text-slate-500">Your credentials & access</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${formData.address.city ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50 border-2 border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.address.city ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                {formData.address.city ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Physical Location</p>
                <p className="text-xs text-slate-500">Address & service area</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${formData.terms_accepted && formData.baa_accepted ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50 border-2 border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.terms_accepted && formData.baa_accepted ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                {formData.terms_accepted && formData.baa_accepted ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Compliance</p>
                <p className="text-xs text-slate-500">Legal & security agreements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-300" />
            <h4 className="text-sm font-bold">What You Get</h4>
          </div>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
              <span>Unlimited patient records</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
              <span>Real-time data synchronization</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
              <span>Advanced security & encryption</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
              <span>24/7 dedicated support</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 mb-4 shadow-lg shadow-violet-300">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Organization
            </h1>
            <p className="text-base text-slate-600">
              Enterprise healthcare platform • HIPAA compliant • Built for scale
            </p>
          </div>

          {/* Three Column Layout: Stepper | Form | Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_380px] gap-6 items-start">
            {/* Left: Vertical Stepper */}
            <div className="hidden lg:block lg:sticky lg:top-6">
              <VerticalStepper />
            </div>

            {/* Center: Form */}
            <Card className="border-2 border-slate-200 shadow-xl bg-white">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Error:</strong> {error}
                      </div>
                    </div>
                  )}

                  {/* Step Content */}
                  <div>
                    {/* Step 0: Organization */}
                    {currentStep === 0 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                            <Building2 className="w-6 h-6 text-violet-600" />
                            Organization Information
                          </h2>
                          <p className="text-sm text-slate-500">Tell us about your healthcare organization</p>
                        </div>

                        <div className="space-y-4">
                          {renderInput("Organization Name", "org_name", Building2, { type: "text", required: true, placeholder: "e.g., Sushruth Care Hospital" })}

                          {renderInput("Legal Name (Optional)", "legal_name", undefined, { type: "text", placeholder: "Official registered name" })}

                          <div className="grid grid-cols-2 gap-4">
                            {renderInput("Contact Phone", "contact_phone", Phone, { type: "tel", required: true, placeholder: "+91 98765 43210" })}

                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-violet-500" />
                                Timezone
                              </Label>
                              <select
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all bg-white hover:border-slate-300"
                              >
                                <option value="Asia/Kolkata">🇮🇳 Asia/Kolkata (IST)</option>
                                <option value="America/New_York">🇺🇸 America/New_York (EST)</option>
                                <option value="Europe/London">🇬🇧 Europe/London (GMT)</option>
                                <option value="Asia/Dubai">🇦🇪 Asia/Dubai (GST)</option>
                                <option value="Asia/Singapore">🇸🇬 Asia/Singapore (SGT)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 1: Owner */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                            <User className="w-6 h-6 text-violet-600" />
                            Administrator Account
                          </h2>
                          <p className="text-sm text-slate-500">Create your admin credentials</p>
                        </div>

                        <div className="space-y-4">
                          {renderInput('Full Name', 'owner_name', User, {
                            type: 'text',
                            required: true,
                            placeholder: 'Dr. John Doe',
                          })}

                          {renderInput('Email Address', 'owner_email', Mail, {
                            type: 'email',
                            required: true,
                            placeholder: 'admin@hospital.com',
                          })}

                          <div className="grid grid-cols-2 gap-4">
                            {renderInput('Password', 'owner_password', Lock, {
                              type: 'password',
                              required: true,
                              minLength: 8,
                              placeholder: '••••••••',
                            })}

                            {renderInput('Confirm Password', 'confirm_password', Lock, {
                              type: 'password',
                              required: true,
                              minLength: 8,
                              placeholder: '••••••••',
                            })}
                          </div>

                          <div className="bg-violet-50 border-2 border-violet-200 px-4 py-3 rounded-lg text-sm text-violet-900">
                            <strong className="font-bold">Password requirements:</strong> 8+ characters, uppercase, lowercase, and numbers
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Address */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                            <MapPin className="w-6 h-6 text-violet-600" />
                            Location Details
                          </h2>
                          <p className="text-sm text-slate-500">Physical address (optional but recommended)</p>
                        </div>

                        <div className="space-y-4">
                          {renderInput('Address Line 1', 'address.line1', MapPin, {
                            type: 'text',
                            placeholder: 'Street address',
                          })}

                          {renderInput('Address Line 2', 'address.line2', undefined, {
                            type: 'text',
                            placeholder: 'Suite, building, floor',
                          })}

                          <div className="grid grid-cols-2 gap-4">
                            {renderInput('City', 'address.city', undefined, {
                              type: 'text',
                              placeholder: 'City',
                            })}

                            {renderInput('State', 'address.state', undefined, {
                              type: 'text',
                              placeholder: 'State',
                            })}

                            {renderInput('Postal Code', 'address.postal_code', undefined, {
                              type: 'text',
                              placeholder: 'PIN/ZIP',
                            })}

                            {renderInput('Country', 'address.country', undefined, {
                              type: 'text',
                              placeholder: 'Country',
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Legal */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                            <Shield className="w-6 h-6 text-violet-600" />
                            Legal & Compliance
                          </h2>
                          <p className="text-sm text-slate-500">Review and accept terms</p>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                required
                                checked={formData.terms_accepted}
                                onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                                className="w-5 h-5 mt-0.5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                                  Terms & Conditions
                                </span>
                                <p className="text-sm text-slate-600 mt-1">
                                  I accept the{' '}
                                  <a href="/terms" target="_blank" className="text-blue-600 underline font-semibold">
                                    Terms of Service
                                  </a>
                                </p>
                              </div>
                            </label>
                          </div>

                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                required
                                checked={formData.baa_accepted}
                                onChange={(e) => setFormData({ ...formData, baa_accepted: e.target.checked })}
                                className="w-5 h-5 mt-0.5 rounded border-2 border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-200 cursor-pointer"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-bold text-slate-900 group-hover:text-purple-700 flex items-center gap-2">
                                  Business Associate Agreement
                                  <span className="text-xs font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-lg">HIPAA</span>
                                </span>
                                <p className="text-sm text-slate-600 mt-1">
                                  Required for compliance •{' '}
                                  <a href="/baa" target="_blank" className="text-purple-600 underline font-semibold">
                                    Read BAA
                                  </a>
                                </p>
                              </div>
                            </label>
                          </div>

                          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 px-4 py-3 rounded-xl">
                            <div className="flex items-start gap-3">
                              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-emerald-900">
                                <strong className="font-bold">Your data is secure:</strong> End-to-end encryption, HIPAA & GDPR compliant
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t-2 border-slate-100">
                    <Button
                      type="button"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="px-5 py-2.5 text-sm font-bold disabled:opacity-30 border-2"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        className="px-6 py-2.5 text-sm bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold shadow-lg shadow-violet-300 disabled:opacity-50"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading || !isStepValid(currentStep)}
                        className="px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-300 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Complete Setup
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t-2 border-slate-100 text-center">
                  <p className="text-sm text-slate-600">
                    Already registered?{' '}
                    <a
                      href="/"
                      className="text-violet-600 font-bold hover:text-violet-700 hover:underline"
                    >
                      Sign in here
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right: Live Preview */}
            <div className="lg:sticky lg:top-6 h-fit">
              <LivePreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
