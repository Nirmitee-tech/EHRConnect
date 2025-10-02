import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Atoms/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'DatePicker component following Atlassian Design System patterns. Provides an accessible date selection interface with support for validation, min/max dates, and healthcare-specific use cases.',
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
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    label: 'Select date',
    placeholder: 'Choose a date',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <DatePicker 
        size="sm"
        label="Small date picker"
        placeholder="Select date"
      />
      <DatePicker 
        size="md"
        label="Medium date picker (default)"
        placeholder="Select date"
      />
      <DatePicker 
        size="lg"
        label="Large date picker"
        placeholder="Select date"
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <DatePicker 
        variant="default"
        label="Default variant"
        defaultValue={new Date()}
      />
      <DatePicker 
        variant="success"
        label="Success variant"
        defaultValue={new Date()}
      />
      <DatePicker 
        variant="warning"
        label="Warning variant"
        defaultValue={new Date()}
      />
      <DatePicker 
        variant="danger"
        label="Danger variant"
        defaultValue={new Date()}
      />
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <DatePicker 
        label="Date of birth"
        description="Enter your date of birth for medical records"
      />
      <DatePicker 
        label="Appointment date"
        description="Select your preferred appointment date"
        defaultValue={new Date()}
      />
    </div>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <div className="space-y-6">
      <DatePicker 
        label="Required date"
        description="This field is required"
        required
        error="Please select a date"
      />
      <DatePicker 
        label="Date with constraints"
        description="Must be within the last 30 days"
        min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        max={new Date()}
        error="Date must be within the last 30 days"
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <DatePicker 
        label="Empty state"
        placeholder="No date selected"
      />
      <DatePicker 
        label="With value"
        defaultValue={new Date()}
      />
      <DatePicker 
        label="Disabled"
        defaultValue={new Date()}
        disabled
      />
      <DatePicker 
        label="Required field"
        required
        description="This field must be filled"
      />
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker 
            label="Date of birth"
            description="Patient's date of birth"
            required
            max={new Date()}
          />
          <DatePicker 
            label="Date of admission"
            description="Hospital admission date"
            defaultValue={new Date()}
            max={new Date()}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medical History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker 
            label="Last physical exam"
            description="Date of most recent physical examination"
            max={new Date()}
          />
          <DatePicker 
            label="Last vaccination"
            description="Date of most recent vaccination"
            max={new Date()}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Appointment Scheduling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker 
            label="Preferred appointment date"
            description="Select your preferred date for the appointment"
            min={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
            required
          />
          <DatePicker 
            label="Follow-up appointment"
            description="Schedule follow-up within 2 weeks"
            min={new Date(Date.now() + 24 * 60 * 60 * 1000)}
            max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker 
            label="Start date"
            description="When to begin medication"
            defaultValue={new Date()}
            variant="success"
          />
          <DatePicker 
            label="End date"
            description="When to stop medication"
            min={new Date()}
            variant="warning"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker 
            label="Lab test date"
            description="Date when lab tests were conducted"
            max={new Date()}
            required
            size="sm"
          />
          <DatePicker 
            label="Results available date"
            description="Expected date for results"
            min={new Date()}
            size="sm"
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
    const [appointmentDate, setAppointmentDate] = React.useState<Date | undefined>();
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker 
            label="Patient's date of birth"
            description="Required for medical records"
            value={selectedDate}
            onChange={setSelectedDate}
            required
            max={new Date()}
          />
          <DatePicker 
            label="Next appointment"
            description="Schedule follow-up visit"
            value={appointmentDate}
            onChange={setAppointmentDate}
            min={new Date(Date.now() + 24 * 60 * 60 * 1000)}
          />
        </div>
        
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold">Selected Information:</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Date of Birth:</span>{' '}
              {selectedDate ? formatDate(selectedDate) : 'Not selected'}
            </div>
            <div>
              <span className="font-medium">Next Appointment:</span>{' '}
              {appointmentDate ? formatDate(appointmentDate) : 'Not scheduled'}
            </div>
            {selectedDate && (
              <div className="text-muted-foreground">
                Age: {Math.floor((Date.now() - selectedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};