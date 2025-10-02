import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'Atoms/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'TimePicker component following Atlassian Design System patterns. Provides an accessible time selection interface with support for 12/24-hour formats, validation, min/max times, and healthcare-specific use cases for medication schedules, appointment booking, and shift management.',
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
    format24Hour: {
      control: 'boolean',
    },
    step: {
      control: 'number',
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
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {
    label: 'Select time',
    placeholder: 'Choose a time',
  },
};

export const Formats: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        label="12-hour format (default)"
        placeholder="Select time"
        format24Hour={false}
        defaultValue="14:30"
      />
      <TimePicker 
        label="24-hour format"
        placeholder="Select time"
        format24Hour={true}
        defaultValue="14:30"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        size="sm"
        label="Small time picker"
        placeholder="Select time"
        defaultValue="09:00"
      />
      <TimePicker 
        size="md"
        label="Medium time picker (default)"
        placeholder="Select time"
        defaultValue="09:00"
      />
      <TimePicker 
        size="lg"
        label="Large time picker"
        placeholder="Select time"
        defaultValue="09:00"
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        variant="default"
        label="Default variant"
        defaultValue="09:00"
      />
      <TimePicker 
        variant="success"
        label="Success variant"
        defaultValue="09:00"
      />
      <TimePicker 
        variant="warning"
        label="Warning variant"
        defaultValue="09:00"
      />
      <TimePicker 
        variant="danger"
        label="Danger variant"
        defaultValue="09:00"
      />
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        label="Appointment time"
        description="Select your preferred appointment time"
        defaultValue="10:00"
      />
      <TimePicker 
        label="Medication schedule"
        description="Enter the time to take this medication"
        format24Hour={true}
        step={15}
      />
    </div>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        label="Required time"
        description="This field is required"
        required
        error="Please select a time"
      />
      <TimePicker 
        label="Time with constraints"
        description="Must be between 9 AM and 5 PM"
        min="09:00"
        max="17:00"
        error="Time must be within business hours"
      />
    </div>
  ),
};

export const TimeSteps: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        label="1-minute intervals"
        description="Precise timing for procedures"
        step={1}
        defaultValue="14:30"
      />
      <TimePicker 
        label="15-minute intervals"
        description="Standard appointment booking"
        step={15}
        defaultValue="14:30"
      />
      <TimePicker 
        label="30-minute intervals"
        description="Extended appointment slots"
        step={30}
        defaultValue="14:30"
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <TimePicker 
        label="Empty state"
        placeholder="No time selected"
      />
      <TimePicker 
        label="With value"
        defaultValue="14:30"
      />
      <TimePicker 
        label="Disabled"
        defaultValue="14:30"
        disabled
      />
      <TimePicker 
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
        <h3 className="text-lg font-semibold mb-4">Medication Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Morning dose"
            description="Take with breakfast"
            defaultValue="08:00"
            format24Hour={true}
            variant="success"
            step={15}
          />
          <TimePicker 
            label="Evening dose"
            description="Take with dinner"
            defaultValue="18:00"
            format24Hour={true}
            variant="success"
            step={15}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Shift Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Shift start time"
            description="Nurse shift begins"
            min="06:00"
            max="18:00"
            step={30}
            required
          />
          <TimePicker 
            label="Break time"
            description="Scheduled break period"
            min="10:00"
            max="16:00"
            step={15}
            variant="warning"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Appointment Booking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Preferred time"
            description="Patient's preferred appointment time"
            min="09:00"
            max="17:00"
            step={30}
            required
          />
          <TimePicker 
            label="Emergency slot"
            description="Available emergency appointment"
            variant="danger"
            step={15}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Vital Signs Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Last reading time"
            description="When vital signs were last recorded"
            format24Hour={true}
            max="23:59"
            size="sm"
          />
          <TimePicker 
            label="Next scheduled reading"
            description="Next vital signs check"
            format24Hour={true}
            variant="warning"
            size="sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Surgical Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Surgery start time"
            description="Scheduled surgery begin time"
            format24Hour={true}
            min="06:00"
            max="20:00"
            step={15}
            required
            variant="danger"
          />
          <TimePicker 
            label="Pre-op prep time"
            description="Patient preparation start"
            format24Hour={true}
            step={30}
            variant="warning"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Sample collection time"
            description="Blood/specimen collection"
            format24Hour={true}
            min="05:00"
            max="11:00"
            step={15}
            size="sm"
          />
          <TimePicker 
            label="Results ready time"
            description="Expected results availability"
            format24Hour={true}
            step={30}
            variant="success"
            size="sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Response</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimePicker 
            label="Incident time"
            description="When the emergency occurred"
            format24Hour={true}
            required
            variant="danger"
            step={1}
          />
          <TimePicker 
            label="Response time"
            description="Emergency team arrival time"
            format24Hour={true}
            variant="danger"
            step={1}
          />
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [morningMed, setMorningMed] = React.useState<string | undefined>('08:00');
    const [eveningMed, setEveningMed] = React.useState<string | undefined>('20:00');
    const [appointmentTime, setAppointmentTime] = React.useState<string | undefined>();
    
    const formatTime12Hour = (time24: string) => {
      if (!time24) return '';
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    const calculateTimeDifference = (time1: string, time2: string) => {
      const [h1, m1] = time1.split(':').map(Number);
      const [h2, m2] = time2.split(':').map(Number);
      const minutes1 = h1 * 60 + m1;
      const minutes2 = h2 * 60 + m2;
      const diffMinutes = Math.abs(minutes2 - minutes1);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TimePicker 
            label="Morning medication"
            description="Take with breakfast"
            value={morningMed}
            onChange={setMorningMed}
            format24Hour={true}
            variant="success"
            step={15}
          />
          <TimePicker 
            label="Evening medication"
            description="Take with dinner"
            value={eveningMed}
            onChange={setEveningMed}
            format24Hour={true}
            variant="success"
            step={15}
          />
          <TimePicker 
            label="Next appointment"
            description="Schedule follow-up"
            value={appointmentTime}
            onChange={setAppointmentTime}
            min="09:00"
            max="17:00"
            step={30}
            required
          />
        </div>
        
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <h4 className="font-semibold">Schedule Summary:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Morning Medication:</span>{' '}
                {morningMed ? (
                  <span className="text-success">
                    {formatTime12Hour(morningMed)} ({morningMed})
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </div>
              <div>
                <span className="font-medium">Evening Medication:</span>{' '}
                {eveningMed ? (
                  <span className="text-success">
                    {formatTime12Hour(eveningMed)} ({eveningMed})
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Next Appointment:</span>{' '}
                {appointmentTime ? (
                  <span className="text-primary">
                    {formatTime12Hour(appointmentTime)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not scheduled</span>
                )}
              </div>
              {morningMed && eveningMed && (
                <div className="text-muted-foreground">
                  <span className="font-medium">Dosing interval:</span>{' '}
                  {calculateTimeDifference(morningMed, eveningMed)}
                </div>
              )}
            </div>
          </div>
          
          {morningMed && eveningMed && (
            <div className="mt-4 p-3 bg-success/10 rounded-md border border-success/20">
              <div className="flex items-center text-success text-sm">
                <span className="mr-2">✓</span>
                Medication schedule configured with {calculateTimeDifference(morningMed, eveningMed)} between doses
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
};