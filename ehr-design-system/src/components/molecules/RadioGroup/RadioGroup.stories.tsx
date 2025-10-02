import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, type RadioGroupOption } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Molecules/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'RadioGroup component for managing multiple related radio options, following Atlassian Design System patterns. Supports controlled and uncontrolled modes with comprehensive accessibility features, labels, descriptions, and error handling.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
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
type Story = StoryObj<typeof RadioGroup>;

const basicOptions: RadioGroupOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    options: basicOptions,
    label: 'Choose an option',
    defaultValue: 'option1',
  },
};

export const Orientations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical (Default)</h3>
        <RadioGroup
          options={basicOptions}
          label="Vertical layout"
          orientation="vertical"
          defaultValue="option1"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal</h3>
        <RadioGroup
          options={basicOptions}
          label="Horizontal layout"
          orientation="horizontal"
          defaultValue="option2"
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Small</h3>
        <RadioGroup
          options={basicOptions}
          label="Small radio buttons"
          size="sm"
          defaultValue="option1"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium (Default)</h3>
        <RadioGroup
          options={basicOptions}
          label="Medium radio buttons"
          size="md"
          defaultValue="option2"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large</h3>
        <RadioGroup
          options={basicOptions}
          label="Large radio buttons"
          size="lg"
          defaultValue="option3"
        />
      </div>
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => {
    const optionsWithDesc: RadioGroupOption[] = [
      { 
        value: 'email', 
        label: 'Email notifications',
        description: 'Receive updates via email'
      },
      { 
        value: 'sms', 
        label: 'SMS notifications',
        description: 'Receive updates via text message'
      },
      { 
        value: 'none', 
        label: 'No notifications',
        description: 'Do not receive any notifications'
      },
    ];

    return (
      <RadioGroup
        options={optionsWithDesc}
        label="Notification preference"
        description="Choose how you'd like to receive notifications"
        defaultValue="email"
      />
    );
  },
};

export const WithVariants: Story = {
  render: () => {
    const variantOptions: RadioGroupOption[] = [
      { 
        value: 'low', 
        label: 'Low Priority',
        description: 'Non-urgent matter',
        variant: 'success'
      },
      { 
        value: 'medium', 
        label: 'Medium Priority',
        description: 'Standard priority'
      },
      { 
        value: 'high', 
        label: 'High Priority',
        description: 'Urgent attention required',
        variant: 'warning'
      },
      { 
        value: 'critical', 
        label: 'Critical Priority',
        description: 'Immediate action required',
        variant: 'danger'
      },
    ];

    return (
      <RadioGroup
        options={variantOptions}
        label="Priority Level"
        description="Select the urgency level for this request"
        defaultValue="medium"
      />
    );
  },
};

export const WithError: Story = {
  render: () => (
    <RadioGroup
      options={basicOptions}
      label="Required selection"
      description="You must select one option"
      error="Please select an option"
      required
    />
  ),
};

export const DisabledStates: Story = {
  render: () => {
    const mixedOptions: RadioGroupOption[] = [
      { value: 'available', label: 'Available option' },
      { value: 'disabled', label: 'Disabled option', disabled: true },
      { value: 'another', label: 'Another available option' },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Individual Disabled Options</h3>
          <RadioGroup
            options={mixedOptions}
            label="Mixed availability"
            description="Some options may not be available"
            defaultValue="available"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Entire Group Disabled</h3>
          <RadioGroup
            options={basicOptions}
            label="Disabled radio group"
            description="All options are disabled"
            disabled
            defaultValue="option1"
          />
        </div>
      </div>
    );
  },
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Gender</h3>
        <RadioGroup
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' },
          ]}
          label="Gender"
          description="Select patient's gender identity"
          orientation="horizontal"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Allergy Severity</h3>
        <RadioGroup
          options={[
            { 
              value: 'mild', 
              label: 'Mild',
              description: 'Minor reactions, no respiratory symptoms',
              variant: 'success'
            },
            { 
              value: 'moderate', 
              label: 'Moderate',
              description: 'Noticeable symptoms, some discomfort',
              variant: 'warning'
            },
            { 
              value: 'severe', 
              label: 'Severe',
              description: 'Significant symptoms, medical attention needed',
              variant: 'danger'
            },
            { 
              value: 'anaphylactic', 
              label: 'Anaphylactic',
              description: 'Life-threatening reaction, immediate emergency care',
              variant: 'danger'
            },
          ]}
          label="Allergy Reaction Severity"
          description="Describe the typical severity of allergic reactions"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Smoking Status</h3>
        <RadioGroup
          options={[
            { 
              value: 'never', 
              label: 'Never smoker',
              description: 'Has never smoked or smoked less than 100 cigarettes',
              variant: 'success'
            },
            { 
              value: 'former', 
              label: 'Former smoker',
              description: 'Previously smoked but quit',
              variant: 'warning'
            },
            { 
              value: 'current', 
              label: 'Current smoker',
              description: 'Currently smoking tobacco products',
              variant: 'danger'
            },
          ]}
          label="Smoking History"
          description="Patient's smoking status for risk assessment"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Insurance Coverage</h3>
        <RadioGroup
          options={[
            { value: 'private', label: 'Private Insurance', description: 'Employer or individual private plan' },
            { value: 'medicare', label: 'Medicare', description: 'Federal health insurance program' },
            { value: 'medicaid', label: 'Medicaid', description: 'State-federal health insurance program' },
            { value: 'self-pay', label: 'Self-Pay', description: 'No insurance, paying out of pocket' },
            { value: 'other', label: 'Other', description: 'Other insurance type' },
          ]}
          label="Primary Insurance"
          description="Select the patient's primary insurance coverage"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Discharge Disposition</h3>
        <RadioGroup
          options={[
            { 
              value: 'home', 
              label: 'Home',
              description: 'Patient discharged to home with self-care',
              variant: 'success'
            },
            { 
              value: 'home-health', 
              label: 'Home with Home Health',
              description: 'Home discharge with professional home health services'
            },
            { 
              value: 'skilled-nursing', 
              label: 'Skilled Nursing Facility',
              description: 'Transfer to skilled nursing facility for extended care'
            },
            { 
              value: 'rehabilitation', 
              label: 'Rehabilitation Facility',
              description: 'Transfer to inpatient rehabilitation facility'
            },
            { 
              value: 'hospice', 
              label: 'Hospice',
              description: 'Comfort care for end-of-life',
              variant: 'warning'
            },
          ]}
          label="Planned Discharge Disposition"
          description="Where will the patient go after discharge?"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Mental Health Screening</h3>
        <RadioGroup
          options={[
            { 
              value: 'excellent', 
              label: 'Excellent',
              description: 'Very positive mood, no mental health concerns',
              variant: 'success'
            },
            { 
              value: 'good', 
              label: 'Good',
              description: 'Generally positive mood with minor concerns'
            },
            { 
              value: 'fair', 
              label: 'Fair',
              description: 'Some mood concerns or stress',
              variant: 'warning'
            },
            { 
              value: 'poor', 
              label: 'Poor',
              description: 'Significant mental health concerns',
              variant: 'danger'
            },
            { 
              value: 'prefer-not-answer', 
              label: 'Prefer not to answer',
              description: 'Patient declines to answer'
            },
          ]}
          label="Overall Mental Health"
          description="How would you rate your overall mental health?"
          size="sm"
        />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [diagnosis, setDiagnosis] = React.useState('');
    const [severity, setSeverity] = React.useState('');
    const [treatment, setTreatment] = React.useState('');
    
    const diagnosisOptions: RadioGroupOption[] = [
      { value: 'hypertension', label: 'Hypertension', description: 'High blood pressure' },
      { value: 'diabetes', label: 'Type 2 Diabetes', description: 'Blood sugar management disorder' },
      { value: 'asthma', label: 'Asthma', description: 'Respiratory airway condition' },
      { value: 'arthritis', label: 'Osteoarthritis', description: 'Joint inflammation and pain' },
    ];

    const severityOptions: RadioGroupOption[] = [
      { 
        value: 'mild', 
        label: 'Mild',
        description: 'Minimal impact on daily activities',
        variant: 'success'
      },
      { 
        value: 'moderate', 
        label: 'Moderate',
        description: 'Some limitation in daily activities',
        variant: 'warning'
      },
      { 
        value: 'severe', 
        label: 'Severe',
        description: 'Significant impact on quality of life',
        variant: 'danger'
      },
    ];

    const treatmentOptions: RadioGroupOption[] = [
      { value: 'medication', label: 'Medication Only', description: 'Pharmaceutical management' },
      { value: 'lifestyle', label: 'Lifestyle Changes', description: 'Diet and exercise modifications' },
      { value: 'combined', label: 'Combined Approach', description: 'Medication plus lifestyle changes' },
      { value: 'surgical', label: 'Surgical Intervention', description: 'Surgical treatment option' },
    ];

    const getDiagnosisCode = (diagnosis: string) => {
      const codes = {
        hypertension: 'I10',
        diabetes: 'E11.9',
        asthma: 'J45.9',
        arthritis: 'M19.90'
      };
      return codes[diagnosis as keyof typeof codes] || '';
    };

    const getRecommendation = () => {
      if (diagnosis && severity && treatment) {
        if (severity === 'severe' && treatment !== 'combined' && treatment !== 'surgical') {
          return '⚠️ Consider more aggressive treatment approach for severe condition';
        }
        if (severity === 'mild' && treatment === 'surgical') {
          return '💡 Surgical intervention may not be necessary for mild condition';
        }
        return '✅ Treatment plan appears appropriate for condition severity';
      }
      return '';
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RadioGroup
            options={diagnosisOptions}
            value={diagnosis}
            onValueChange={(value) => {
              setDiagnosis(value);
              setSeverity(''); // Reset dependent fields
              setTreatment('');
            }}
            label="Primary Diagnosis"
            description="Select the primary condition"
            required
          />
          
          <RadioGroup
            options={severityOptions}
            value={severity}
            onValueChange={setSeverity}
            label="Condition Severity"
            description="Assess the severity level"
            disabled={!diagnosis}
          />
          
          <RadioGroup
            options={treatmentOptions}
            value={treatment}
            onValueChange={setTreatment}
            label="Treatment Approach"
            description="Select treatment method"
            disabled={!severity}
          />
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Clinical Assessment Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Primary Diagnosis:</span>{' '}
              {diagnosis ? (
                <>
                  {diagnosisOptions.find(d => d.value === diagnosis)?.label}
                  {getDiagnosisCode(diagnosis) && (
                    <span className="text-muted-foreground ml-2">({getDiagnosisCode(diagnosis)})</span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Not selected</span>
              )}
            </div>
            
            <div>
              <span className="font-medium">Severity:</span>{' '}
              {severity ? (
                <span className={`capitalize ${
                  severity === 'mild' ? 'text-success' :
                  severity === 'moderate' ? 'text-warning' :
                  'text-danger'
                }`}>
                  {severity}
                </span>
              ) : (
                <span className="text-muted-foreground">Not assessed</span>
              )}
            </div>
            
            <div>
              <span className="font-medium">Treatment Plan:</span>{' '}
              {treatment ? (
                treatmentOptions.find(t => t.value === treatment)?.label
              ) : (
                <span className="text-muted-foreground">Not selected</span>
              )}
            </div>
            
            {getRecommendation() && (
              <div className={`mt-3 p-2 rounded border text-sm ${
                getRecommendation().includes('⚠️') 
                  ? 'bg-warning/10 border-warning/20 text-warning-foreground'
                  : getRecommendation().includes('💡')
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-success/10 border-success/20 text-success'
              }`}>
                {getRecommendation()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};