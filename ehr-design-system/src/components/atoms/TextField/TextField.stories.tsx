import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Atoms/TextField',
  component: TextField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'TextField component following Atlassian Design System patterns. Provides a comprehensive text input interface with support for variants, sizes, icons, adornments, validation, and healthcare-specific use cases.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Enter your full name',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        variant="default"
        label="Default variant"
        placeholder="Enter text"
        defaultValue="Default input"
      />
      <TextField 
        variant="success"
        label="Success variant"
        placeholder="Enter text"
        defaultValue="Valid input"
      />
      <TextField 
        variant="warning"
        label="Warning variant"
        placeholder="Enter text"
        defaultValue="Warning input"
      />
      <TextField 
        variant="danger"
        label="Danger variant"
        placeholder="Enter text"
        error="This field has an error"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        size="sm"
        label="Small text field"
        placeholder="Small input"
        defaultValue="Small text"
      />
      <TextField 
        size="md"
        label="Medium text field (default)"
        placeholder="Medium input"
        defaultValue="Medium text"
      />
      <TextField 
        size="lg"
        label="Large text field"
        placeholder="Large input"
        defaultValue="Large text"
      />
    </div>
  ),
};

export const InputTypes: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        type="text"
        label="Text input"
        placeholder="Enter text"
      />
      <TextField 
        type="email"
        label="Email address"
        placeholder="user@example.com"
      />
      <TextField 
        type="password"
        label="Password"
        placeholder="Enter password"
      />
      <TextField 
        type="number"
        label="Age"
        placeholder="25"
      />
      <TextField 
        type="tel"
        label="Phone number"
        placeholder="(555) 123-4567"
      />
      <TextField 
        type="url"
        label="Website"
        placeholder="https://example.com"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        label="Search patients"
        placeholder="Search by name or ID"
        startIcon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
      <TextField 
        label="Email with validation"
        type="email"
        placeholder="Enter email address"
        defaultValue="valid@example.com"
        variant="success"
        endIcon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
      />
      <TextField 
        label="Password with visibility"
        type="password"
        placeholder="Enter password"
        endIcon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />
    </div>
  ),
};

export const WithAdornments: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        label="Weight"
        type="number"
        placeholder="70"
        endAdornment="kg"
      />
      <TextField 
        label="Height"
        type="number"
        placeholder="175"
        endAdornment="cm"
      />
      <TextField 
        label="Price"
        type="number"
        placeholder="100"
        startAdornment="$"
      />
      <TextField 
        label="Dosage"
        type="number"
        placeholder="500"
        endAdornment="mg"
      />
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        label="Patient ID"
        description="Unique identifier assigned to the patient"
        placeholder="Enter patient ID"
      />
      <TextField 
        label="Emergency contact"
        description="Person to contact in case of emergency"
        placeholder="Contact name and phone"
      />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        label="Valid field"
        variant="success"
        defaultValue="correct@example.com"
        description="Email format is correct"
      />
      <TextField 
        label="Warning field"
        variant="warning"
        defaultValue="test@gmail.com"
        description="Consider using a professional email address"
      />
      <TextField 
        label="Error field"
        variant="danger"
        defaultValue="invalid-email"
        error="Please enter a valid email address"
      />
      <TextField 
        label="Required field"
        placeholder="This field is required"
        required
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <TextField 
        label="Normal state"
        placeholder="Enter text"
      />
      <TextField 
        label="Focused state"
        placeholder="This field is focused"
        autoFocus
      />
      <TextField 
        label="Disabled state"
        placeholder="This field is disabled"
        defaultValue="Cannot edit this"
        disabled
      />
      <TextField 
        label="Read-only state"
        defaultValue="This is read-only"
        readOnly
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="First Name"
            placeholder="John"
            required
          />
          <TextField 
            label="Last Name"
            placeholder="Doe"
            required
          />
          <TextField 
            label="Date of Birth"
            type="date"
            required
          />
          <TextField 
            label="Social Security Number"
            placeholder="***-**-1234"
            type="password"
            description="Last 4 digits only"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            startIcon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
            required
          />
          <TextField 
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            startIcon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Medical Record Number"
            placeholder="MRN-123456"
            description="Unique medical record identifier"
            startAdornment="MRN"
            required
          />
          <TextField 
            label="Primary Care Physician"
            placeholder="Dr. Smith"
            description="Current primary care provider"
          />
          <TextField 
            label="Insurance Policy Number"
            placeholder="Policy number"
            description="Health insurance policy ID"
            required
          />
          <TextField 
            label="Emergency Contact Phone"
            type="tel"
            placeholder="(555) 987-6543"
            variant="warning"
            description="Emergency contact phone number"
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Vital Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TextField 
            label="Height"
            type="number"
            placeholder="175"
            endAdornment="cm"
            description="Patient height in centimeters"
          />
          <TextField 
            label="Weight"
            type="number"
            placeholder="70"
            endAdornment="kg"
            description="Current weight in kilograms"
          />
          <TextField 
            label="Blood Pressure"
            placeholder="120/80"
            endAdornment="mmHg"
            description="Systolic/Diastolic pressure"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Dosages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Aspirin Dosage"
            type="number"
            placeholder="81"
            endAdornment="mg"
            description="Daily aspirin dose"
            variant="success"
          />
          <TextField 
            label="Blood Glucose"
            type="number"
            placeholder="120"
            endAdornment="mg/dL"
            description="Current blood glucose level"
            variant="warning"
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [patientData, setPatientData] = React.useState({
      firstName: '',
      lastName: '',
      mrn: '',
      email: '',
      phone: '',
      emergencyContact: ''
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
      const newErrors = { ...errors };
      
      switch (name) {
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = 'Please enter a valid email address';
          } else {
            delete newErrors.email;
          }
          break;
        case 'phone':
          if (value && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
            newErrors.phone = 'Please use format: (555) 123-4567';
          } else {
            delete newErrors.phone;
          }
          break;
        case 'mrn':
          if (value && value.length < 6) {
            newErrors.mrn = 'MRN must be at least 6 characters';
          } else {
            delete newErrors.mrn;
          }
          break;
        default:
          if (!value.trim()) {
            newErrors[name] = 'This field is required';
          } else {
            delete newErrors[name];
          }
      }
      
      setErrors(newErrors);
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPatientData(prev => ({ ...prev, [field]: value }));
      validateField(field, value);
    };

    const isFormValid = Object.keys(errors).length === 0 && 
      patientData.firstName && 
      patientData.lastName && 
      patientData.mrn;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="First Name"
            placeholder="John"
            value={patientData.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            required
          />
          <TextField 
            label="Last Name"
            placeholder="Doe"
            value={patientData.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            required
          />
          <TextField 
            label="Medical Record Number"
            placeholder="MRN-123456"
            value={patientData.mrn}
            onChange={handleChange('mrn')}
            error={errors.mrn}
            startAdornment="MRN"
            description="Unique medical record identifier"
            required
          />
          <TextField 
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            value={patientData.email}
            onChange={handleChange('email')}
            error={errors.email}
            startIcon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <TextField 
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            value={patientData.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
            description="Format: (555) 123-4567"
            startIcon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
          <TextField 
            label="Emergency Contact"
            placeholder="Jane Doe (555) 987-6543"
            value={patientData.emergencyContact}
            onChange={handleChange('emergencyContact')}
            description="Emergency contact name and phone"
            variant="warning"
          />
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Patient Registration Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span>{' '}
              {patientData.firstName && patientData.lastName 
                ? `${patientData.firstName} ${patientData.lastName}`
                : <span className="text-muted-foreground">Not provided</span>
              }
            </div>
            <div>
              <span className="font-medium">MRN:</span>{' '}
              {patientData.mrn || <span className="text-muted-foreground">Not assigned</span>}
            </div>
            <div>
              <span className="font-medium">Email:</span>{' '}
              {patientData.email || <span className="text-muted-foreground">Not provided</span>}
            </div>
            <div>
              <span className="font-medium">Phone:</span>{' '}
              {patientData.phone || <span className="text-muted-foreground">Not provided</span>}
            </div>
            <div className="md:col-span-2">
              <span className="font-medium">Emergency Contact:</span>{' '}
              {patientData.emergencyContact || <span className="text-muted-foreground">Not provided</span>}
            </div>
          </div>
          
          <div className={`mt-4 p-3 rounded border text-sm ${
            isFormValid 
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-warning/10 border-warning/20 text-warning'
          }`}>
            {isFormValid ? (
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                Patient registration form is complete and valid
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                Please complete required fields and fix any validation errors
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};