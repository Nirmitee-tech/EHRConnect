import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxGroup, type CheckboxGroupOption } from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Molecules/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CheckboxGroup component for managing multiple related checkboxes, following Atlassian Design System patterns. Supports controlled and uncontrolled modes with comprehensive accessibility features.',
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
type Story = StoryObj<typeof CheckboxGroup>;

const basicOptions: CheckboxGroupOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    options: basicOptions,
    label: 'Select options',
  },
};

export const Orientations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical (Default)</h3>
        <CheckboxGroup
          options={basicOptions}
          label="Vertical layout"
          orientation="vertical"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal</h3>
        <CheckboxGroup
          options={basicOptions}
          label="Horizontal layout"
          orientation="horizontal"
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
        <CheckboxGroup
          options={basicOptions}
          label="Small size"
          size="sm"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Medium (Default)</h3>
        <CheckboxGroup
          options={basicOptions}
          label="Medium size"
          size="md"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Large</h3>
        <CheckboxGroup
          options={basicOptions}
          label="Large size"
          size="lg"
        />
      </div>
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => {
    const optionsWithDesc: CheckboxGroupOption[] = [
      { 
        value: 'notifications', 
        label: 'Email notifications',
        description: 'Receive important updates via email'
      },
      { 
        value: 'sms', 
        label: 'SMS alerts',
        description: 'Get critical alerts via text message'
      },
      { 
        value: 'push', 
        label: 'Push notifications',
        description: 'Receive notifications on your mobile device'
      },
    ];

    return (
      <CheckboxGroup
        options={optionsWithDesc}
        label="Notification preferences"
        description="Choose how you'd like to receive notifications"
      />
    );
  },
};

export const WithError: Story = {
  render: () => (
    <CheckboxGroup
      options={basicOptions}
      label="Required selection"
      description="You must select at least one option"
      error="Please select at least one option"
      required
    />
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Specialties</h3>
        <CheckboxGroup
          options={[
            { value: 'cardiology', label: 'Cardiology', description: 'Heart and cardiovascular system' },
            { value: 'neurology', label: 'Neurology', description: 'Brain and nervous system' },
            { value: 'orthopedics', label: 'Orthopedics', description: 'Bones, joints, and muscles' },
            { value: 'dermatology', label: 'Dermatology', description: 'Skin, hair, and nails' },
            { value: 'oncology', label: 'Oncology', description: 'Cancer treatment and care' },
          ]}
          label="Areas of expertise"
          description="Select your medical specializations"
          orientation="vertical"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Symptoms Checklist</h3>
        <CheckboxGroup
          options={[
            { value: 'fever', label: 'Fever', variant: 'warning' },
            { value: 'cough', label: 'Persistent cough', variant: 'warning' },
            { value: 'chest_pain', label: 'Chest pain', variant: 'danger' },
            { value: 'shortness_breath', label: 'Shortness of breath', variant: 'danger' },
            { value: 'fatigue', label: 'Fatigue' },
            { value: 'headache', label: 'Headache' },
          ]}
          label="Current symptoms"
          description="Check all symptoms you are currently experiencing"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Allergies</h3>
        <CheckboxGroup
          options={[
            { value: 'penicillin', label: 'Penicillin', variant: 'danger' },
            { value: 'shellfish', label: 'Shellfish', variant: 'danger' },
            { value: 'latex', label: 'Latex', variant: 'warning' },
            { value: 'pollen', label: 'Pollen' },
            { value: 'dust', label: 'Dust mites' },
            { value: 'none', label: 'No known allergies', variant: 'success' },
          ]}
          label="Known allergies"
          description="Select all known allergies (critical for medication safety)"
          required
          error="Allergy information is required for patient safety"
          orientation="horizontal"
          size="sm"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Discharge Instructions</h3>
        <CheckboxGroup
          options={[
            { value: 'medication_reviewed', label: 'Medication list reviewed with patient' },
            { value: 'follow_up_scheduled', label: 'Follow-up appointment scheduled' },
            { value: 'emergency_signs', label: 'Emergency warning signs explained' },
            { value: 'care_instructions', label: 'Home care instructions provided' },
            { value: 'questions_answered', label: 'All patient questions answered' },
          ]}
          label="Discharge checklist"
          description="Confirm all items are completed before patient discharge"
          required
        />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [values, setValues] = React.useState<string[]>([]);
    
    const medicalOptions: CheckboxGroupOption[] = [
      { value: 'vitals', label: 'Vital signs check', description: 'Temperature, BP, HR, RR' },
      { value: 'assessment', label: 'Patient assessment', description: 'Physical examination completed' },
      { value: 'medication', label: 'Medication administration', description: 'All scheduled meds given' },
      { value: 'documentation', label: 'Chart documentation', description: 'Notes updated in EMR' },
      { value: 'family', label: 'Family communication', description: 'Updates provided to family' },
    ];

    return (
      <div className="space-y-4">
        <CheckboxGroup
          options={medicalOptions}
          value={values}
          onChange={setValues}
          label="Nursing care checklist"
          description="Track completed care tasks for this shift"
        />
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Selected tasks:</h4>
          {values.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tasks completed yet</p>
          ) : (
            <ul className="text-sm space-y-1">
              {values.map(value => {
                const option = medicalOptions.find(opt => opt.value === value);
                return (
                  <li key={value} className="flex items-center">
                    <span className="text-success mr-2">✓</span>
                    {option?.label}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            Progress: {values.length}/{medicalOptions.length} tasks completed
          </div>
        </div>
      </div>
    );
  },
};