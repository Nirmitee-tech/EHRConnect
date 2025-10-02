import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Atoms/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Heading component provides consistent typography hierarchy for titles and headings throughout healthcare applications. Supports semantic HTML elements with flexible styling options.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'muted'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    children: 'Patient Management System',
  },
};

export const Levels: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading level="h1">H1: Primary Care Dashboard</Heading>
      <Heading level="h2">H2: Patient Information</Heading>
      <Heading level="h3">H3: Medical History</Heading>
      <Heading level="h4">H4: Current Medications</Heading>
      <Heading level="h5">H5: Vital Signs</Heading>
      <Heading level="h6">H6: Lab Results</Heading>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading variant="default" level="h2">Default: Electronic Health Records</Heading>
      <Heading variant="primary" level="h2">Primary: Patient Portal Access</Heading>
      <Heading variant="success" level="h2">Success: Treatment Completed</Heading>
      <Heading variant="warning" level="h2">Warning: Prescription Expiring</Heading>
      <Heading variant="danger" level="h2">Critical: Emergency Alert</Heading>
      <Heading variant="muted" level="h2">Muted: Additional Information</Heading>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading size="xs">Extra Small: Patient ID MRN-123456</Heading>
      <Heading size="sm">Small: Appointment Details</Heading>
      <Heading size="md">Medium: Medical Record Summary</Heading>
      <Heading size="lg">Large: Department Overview</Heading>
      <Heading size="xl">Extra Large: Hospital Dashboard</Heading>
      <Heading size="2xl">2XL: Emergency Department</Heading>
      <Heading size="3xl">3XL: EHR Connect</Heading>
      <Heading size="4xl">4XL: Welcome</Heading>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="border border-dashed border-gray-200 p-4">
        <Heading spacing="none">No spacing</Heading>
        <p className="text-sm text-muted-foreground">This paragraph immediately follows the heading.</p>
      </div>
      
      <div className="border border-dashed border-gray-200 p-4">
        <Heading spacing="xs">Extra small spacing</Heading>
        <p className="text-sm text-muted-foreground">This paragraph has minimal spacing from the heading.</p>
      </div>
      
      <div className="border border-dashed border-gray-200 p-4">
        <Heading spacing="sm">Small spacing</Heading>
        <p className="text-sm text-muted-foreground">This paragraph has small spacing from the heading.</p>
      </div>
      
      <div className="border border-dashed border-gray-200 p-4">
        <Heading spacing="md">Medium spacing (default)</Heading>
        <p className="text-sm text-muted-foreground">This paragraph has medium spacing from the heading.</p>
      </div>
      
      <div className="border border-dashed border-gray-200 p-4">
        <Heading spacing="lg">Large spacing</Heading>
        <p className="text-sm text-muted-foreground">This paragraph has large spacing from the heading.</p>
      </div>
      
      <div className="border border-dashed border-gray-200 p-4">
        <Heading spacing="xl">Extra large spacing</Heading>
        <p className="text-sm text-muted-foreground">This paragraph has extra large spacing from the heading.</p>
      </div>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Dashboard Headers</h3>
        <div className="space-y-4 p-6 bg-muted/20 rounded-lg">
          <Heading level="h1" variant="primary">EHR Connect Dashboard</Heading>
          <Heading level="h2" variant="default">Today's Schedule</Heading>
          <Heading level="h3" variant="muted">Upcoming Appointments</Heading>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
        <div className="space-y-4 p-6 border rounded-lg">
          <Heading level="h2" variant="primary">John Doe - MRN: 12345</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Heading level="h3" spacing="sm">Demographics</Heading>
              <p className="text-sm text-muted-foreground">Age: 45, Male</p>
              <p className="text-sm text-muted-foreground">DOB: 05/15/1978</p>
            </div>
            <div>
              <Heading level="h3" spacing="sm">Contact Information</Heading>
              <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
              <p className="text-sm text-muted-foreground">Email: john.doe@email.com</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Records</h3>
        <div className="space-y-6 p-6 border rounded-lg">
          <Heading level="h2" variant="default">Medical History</Heading>
          
          <div>
            <Heading level="h4" variant="success" spacing="sm">Current Medications</Heading>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Lisinopril 10mg - Once daily</li>
              <li>• Metformin 500mg - Twice daily</li>
            </ul>
          </div>
          
          <div>
            <Heading level="h4" variant="warning" spacing="sm">Allergies</Heading>
            <p className="text-sm text-muted-foreground">Penicillin - Severe reaction</p>
          </div>
          
          <div>
            <Heading level="h4" variant="default" spacing="sm">Chronic Conditions</Heading>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Type 2 Diabetes Mellitus</li>
              <li>• Essential Hypertension</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Documentation</h3>
        <div className="space-y-6 p-6 border rounded-lg">
          <Heading level="h2" variant="primary">Progress Notes</Heading>
          
          <div className="space-y-4">
            <div>
              <Heading level="h5" spacing="xs">01/15/2024 - Follow-up Visit</Heading>
              <Heading level="h6" variant="muted" spacing="sm">Dr. Sarah Johnson, MD</Heading>
              <p className="text-sm text-muted-foreground">
                Patient presents for routine diabetes management. HbA1c improved to 7.1%. 
                Blood pressure well controlled on current regimen.
              </p>
            </div>
            
            <div>
              <Heading level="h5" spacing="xs">12/10/2023 - Annual Physical</Heading>
              <Heading level="h6" variant="muted" spacing="sm">Dr. Sarah Johnson, MD</Heading>
              <p className="text-sm text-muted-foreground">
                Complete physical examination. Updated preventive care. 
                Recommended flu vaccination and colonoscopy screening.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Alerts</h3>
        <div className="space-y-4 p-6 bg-red-50 border border-red-200 rounded-lg">
          <Heading level="h2" variant="danger">CRITICAL ALERT</Heading>
          <Heading level="h3" variant="danger" spacing="sm">Drug Interaction Warning</Heading>
          <p className="text-sm">
            Potential severe interaction detected between prescribed Warfarin and patient's current Aspirin therapy.
          </p>
          <Heading level="h4" variant="warning" spacing="sm">Action Required</Heading>
          <p className="text-sm">Review medication list and consult with pharmacist before proceeding.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Results</h3>
        <div className="space-y-4 p-6 border rounded-lg">
          <Heading level="h2" variant="primary">Laboratory Results - 01/15/2024</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Heading level="h5" variant="success" spacing="sm">Normal Range</Heading>
              <p className="text-sm">Hemoglobin: 14.2 g/dL</p>
              <p className="text-sm">White Blood Cell: 6,800/μL</p>
            </div>
            
            <div>
              <Heading level="h5" variant="warning" spacing="sm">Borderline</Heading>
              <p className="text-sm">Cholesterol: 205 mg/dL</p>
              <p className="text-sm">Blood Pressure: 135/85 mmHg</p>
            </div>
            
            <div>
              <Heading level="h5" variant="danger" spacing="sm">Abnormal</Heading>
              <p className="text-sm">HbA1c: 8.2% (High)</p>
              <p className="text-sm">Creatinine: 2.1 mg/dL (Elevated)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const SemanticUsage: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <Heading as="h1" size="3xl" variant="primary" spacing="lg">
          Hospital Management System
        </Heading>
        <p className="text-muted-foreground">
          This uses an h1 tag with custom styling - important for SEO and accessibility
        </p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <Heading level="h2" variant="default" spacing="md">
          Using level prop (renders as h2)
        </Heading>
        <Heading as="div" size="lg" variant="primary" spacing="sm">
          Using as prop (renders as div with heading styles)
        </Heading>
        <p className="text-muted-foreground text-sm mt-2">
          Both approaches allow flexible styling while maintaining semantic structure
        </p>
      </div>
    </div>
  ),
};

export const ResponsiveHeadings: Story = {
  render: () => (
    <div className="space-y-6">
      <Heading 
        level="h1" 
        className="text-lg md:text-2xl lg:text-4xl"
        variant="primary"
      >
        Responsive Healthcare Dashboard
      </Heading>
      
      <Heading 
        level="h2" 
        className="text-base md:text-lg lg:text-xl"
        variant="default"
      >
        Patient Management Portal
      </Heading>
      
      <p className="text-sm text-muted-foreground">
        These headings use responsive classes to adapt to different screen sizes
      </p>
    </div>
  ),
};