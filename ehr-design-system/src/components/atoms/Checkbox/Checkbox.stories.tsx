import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Checkbox component following Atlassian Design System patterns. Supports different sizes, variants, labels, descriptions, and error states.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    indeterminate: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Default checkbox',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="md" label="Medium checkbox (default)" />
      <Checkbox size="lg" label="Large checkbox" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox variant="default" label="Default variant" defaultChecked />
      <Checkbox variant="success" label="Success variant" defaultChecked />
      <Checkbox variant="warning" label="Warning variant" defaultChecked />
      <Checkbox variant="danger" label="Danger variant" defaultChecked />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate defaultChecked />
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
      <Checkbox label="Disabled indeterminate" disabled indeterminate defaultChecked />
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <Checkbox 
        label="Enable notifications" 
        description="Receive email notifications about important updates"
      />
      <Checkbox 
        label="Save medical history" 
        description="Keep a record of all patient interactions and treatments"
        defaultChecked
      />
      <Checkbox 
        label="Share anonymous data" 
        description="Help improve our services by sharing anonymized usage data"
      />
    </div>
  ),
};

export const WithErrors: Story = {
  render: () => (
    <div className="space-y-6">
      <Checkbox 
        label="Accept terms and conditions" 
        description="You must agree to the terms to continue"
        error="This field is required"
        variant="danger"
      />
      <Checkbox 
        label="Verify patient identity"
        description="Confirm patient ID matches medical records"
        error="Patient ID verification failed"
        variant="danger"
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Consent Form</h3>
        <div className="space-y-4">
          <Checkbox 
            label="Consent to treatment" 
            description="I consent to receive the recommended medical treatment"
            variant="success"
            defaultChecked
          />
          <Checkbox 
            label="Share medical records" 
            description="Allow sharing of medical records with consulting specialists"
          />
          <Checkbox 
            label="Emergency contact authorization" 
            description="Authorize staff to contact emergency contacts if needed"
            defaultChecked
          />
          <Checkbox 
            label="Insurance verification" 
            description="I verify that my insurance information is correct and current"
            error="Please verify your insurance details"
            variant="warning"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medical History Checklist</h3>
        <div className="space-y-4">
          <Checkbox 
            label="Diabetes" 
            description="Type 1 or Type 2 diabetes mellitus"
            variant="warning"
            defaultChecked
          />
          <Checkbox 
            label="Hypertension" 
            description="High blood pressure or taking blood pressure medication"
            variant="danger"
            defaultChecked
          />
          <Checkbox 
            label="Heart disease" 
            description="Any form of cardiovascular disease"
          />
          <Checkbox 
            label="Allergies" 
            description="Known drug or environmental allergies"
            variant="danger"
            defaultChecked
          />
          <Checkbox 
            label="Previous surgeries" 
            description="Any surgical procedures in the past"
            indeterminate
            defaultChecked
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Administration</h3>
        <div className="space-y-4">
          <Checkbox 
            label="Morning medications administered" 
            description="8:00 AM dose - Lisinopril 10mg, Metformin 500mg"
            variant="success"
            size="sm"
            defaultChecked
          />
          <Checkbox 
            label="Afternoon medications administered" 
            description="2:00 PM dose - Insulin 15 units"
            variant="success"
            size="sm"
            defaultChecked
          />
          <Checkbox 
            label="Evening medications administered" 
            description="8:00 PM dose - Metformin 500mg"
            variant="warning"
            size="sm"
            error="Medication delayed - patient refused"
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checkedItems, setCheckedItems] = React.useState({
      item1: false,
      item2: true,
      item3: false,
      item4: true,
    });

    const handleChange = (key: string) => (checked: boolean) => {
      setCheckedItems(prev => ({
        ...prev,
        [key]: checked,
      }));
    };

    const allChecked = Object.values(checkedItems).every(Boolean);
    const someChecked = Object.values(checkedItems).some(Boolean);
    const indeterminate = someChecked && !allChecked;

    return (
      <div className="space-y-4">
        <Checkbox
          label="Select all"
          checked={allChecked}
          indeterminate={indeterminate}
          onCheckedChange={(checked) => {
            const newState = checked === true;
            setCheckedItems({
              item1: newState,
              item2: newState,
              item3: newState,
              item4: newState,
            });
          }}
        />
        
        <div className="ml-6 space-y-2 border-l-2 border-border pl-4">
          <Checkbox
            label="Vital signs check"
            checked={checkedItems.item1}
            onCheckedChange={handleChange('item1')}
          />
          <Checkbox
            label="Medication review"
            checked={checkedItems.item2}
            onCheckedChange={handleChange('item2')}
          />
          <Checkbox
            label="Patient assessment"
            checked={checkedItems.item3}
            onCheckedChange={handleChange('item3')}
          />
          <Checkbox
            label="Documentation complete"
            checked={checkedItems.item4}
            onCheckedChange={handleChange('item4')}
          />
        </div>
      </div>
    );
  },
};