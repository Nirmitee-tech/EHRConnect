import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography component based on Atlassian Design System principles, optimized for healthcare interfaces. Provides consistent text styling with semantic variants for medical contexts.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'heading-xxl', 'heading-xl', 'heading-large', 'heading-medium', 'heading-small', 'heading-xs', 'heading-xxs',
        'body-large', 'body-large-medium', 'body-large-bold', 'body-default', 'body-default-medium', 'body-default-bold',
        'body-small', 'body-small-medium', 'body-small-bold', 'vital', 'vital-label', 'dosage', 'patient-id', 'code'
      ],
    },
    color: {
      control: 'select',
      options: [
        'default', 'muted', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'inverse',
        'heart-rate', 'blood-pressure', 'temperature', 'oxygen-sat', 'blood-glucose'
      ],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
    transform: {
      control: 'select',
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label'],
    },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    variant: 'body-default',
    color: 'default',
    align: 'left',
    transform: 'none',
    as: 'p',
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {};

export const AllHeadings: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="heading-xxl" as="h1">
          Heading XXL - Patient Dashboard Overview
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          35px, Medium weight - Used for main page titles
        </Typography>
      </div>
      
      <div>
        <Typography variant="heading-xl" as="h2">
          Heading XL - Medical Record Section
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          29px, Semibold weight - Used for major sections
        </Typography>
      </div>
      
      <div>
        <Typography variant="heading-large" as="h3">
          Heading Large - Vital Signs Monitor
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          24px, Medium weight - Used for subsections
        </Typography>
      </div>
      
      <div>
        <Typography variant="heading-medium" as="h4">
          Heading Medium - Patient Information
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          20px, Medium weight - Used for card titles
        </Typography>
      </div>
      
      <div>
        <Typography variant="heading-small" as="h5">
          Heading Small - Medication List
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          16px, Semibold weight - Used for component headers
        </Typography>
      </div>
      
      <div>
        <Typography variant="heading-xs" as="h6">
          Heading XS - Lab Results
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          14px, Semibold weight - Used for small headers
        </Typography>
      </div>
      
      <div>
        <Typography variant="heading-xxs" as="h6">
          Heading XXS - Form Labels
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          12px, Semibold weight - Used for tiny headers and labels
        </Typography>
      </div>
    </div>
  ),
};

export const BodyText: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <div>
        <Typography variant="body-large">
          Body Large - This is the primary reading text size for detailed medical descriptions, 
          patient notes, and comprehensive clinical documentation.
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          16px, Normal weight - Best for long-form medical content
        </Typography>
      </div>
      
      <div>
        <Typography variant="body-large-medium">
          Body Large Medium - Used for emphasized medical information that requires 
          attention while maintaining excellent readability.
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          16px, Medium weight - For important medical details
        </Typography>
      </div>
      
      <div>
        <Typography variant="body-default">
          Body Default - The standard text size for most interface elements, form labels, 
          button text, and general healthcare application content.
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          14px, Normal weight - Most common text size
        </Typography>
      </div>
      
      <div>
        <Typography variant="body-small">
          Body Small - Used for supplementary information, metadata, timestamps, 
          and secondary details in medical interfaces.
        </Typography>
        <Typography variant="body-small" color="muted" className="mt-1">
          12px, Normal weight - For less important information
        </Typography>
      </div>
    </div>
  ),
};

export const MedicalSpecific: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <Typography variant="heading-medium" className="mb-4">
          Vital Signs Monitor
        </Typography>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Typography variant="vital-label" color="heart-rate">
              Heart Rate
            </Typography>
            <Typography variant="vital" color="heart-rate" className="mt-1">
              72
            </Typography>
            <Typography variant="body-small" color="muted">
              bpm
            </Typography>
          </div>
          
          <div className="text-center">
            <Typography variant="vital-label" color="blood-pressure">
              Blood Pressure
            </Typography>
            <Typography variant="vital" color="blood-pressure" className="mt-1">
              120/80
            </Typography>
            <Typography variant="body-small" color="muted">
              mmHg
            </Typography>
          </div>
          
          <div className="text-center">
            <Typography variant="vital-label" color="temperature">
              Temperature
            </Typography>
            <Typography variant="vital" color="temperature" className="mt-1">
              98.6
            </Typography>
            <Typography variant="body-small" color="muted">
              °F
            </Typography>
          </div>
          
          <div className="text-center">
            <Typography variant="vital-label" color="oxygen-sat">
              O2 Saturation
            </Typography>
            <Typography variant="vital" color="oxygen-sat" className="mt-1">
              98
            </Typography>
            <Typography variant="body-small" color="muted">
              %
            </Typography>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <Typography variant="heading-medium" className="mb-4">
          Patient Information
        </Typography>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Typography variant="body-default" color="muted">
              Patient ID:
            </Typography>
            <Typography variant="patient-id">
              MRN-2024-001234
            </Typography>
          </div>
          
          <div className="flex justify-between items-center">
            <Typography variant="body-default" color="muted">
              Dosage Instructions:
            </Typography>
            <Typography variant="dosage" color="primary">
              500mg twice daily
            </Typography>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Typography variant="body-default" color="default">
            Default Text Color
          </Typography>
          <Typography variant="body-default" color="muted">
            Muted Text Color
          </Typography>
          <Typography variant="body-default" color="primary">
            Primary Text Color
          </Typography>
          <Typography variant="body-default" color="secondary">
            Secondary Text Color
          </Typography>
        </div>
        
        <div>
          <Typography variant="body-default" color="success">
            Success Text Color
          </Typography>
          <Typography variant="body-default" color="warning">
            Warning Text Color
          </Typography>
          <Typography variant="body-default" color="danger">
            Danger Text Color
          </Typography>
          <Typography variant="body-default" color="info">
            Info Text Color
          </Typography>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <Typography variant="body-default" color="inverse">
          Inverse Text Color (on dark backgrounds)
        </Typography>
      </div>
    </div>
  ),
};

export const TextAlignment: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-default" align="left">
        Left aligned text (default) - Most common alignment for reading content.
      </Typography>
      <Typography variant="body-default" align="center">
        Center aligned text - Used for headings and special emphasis.
      </Typography>
      <Typography variant="body-default" align="right">
        Right aligned text - Often used for numerical data and labels.
      </Typography>
      <Typography variant="body-default" align="justify" className="max-w-md">
        Justified text - Creates even margins on both sides, useful for formal medical documentation and reports where consistent formatting is important.
      </Typography>
    </div>
  ),
};

export const TextTransform: Story = {
  render: () => (
    <div className="space-y-2">
      <Typography variant="body-default" transform="none">
        Normal case text - Default appearance
      </Typography>
      <Typography variant="body-default" transform="uppercase">
        Uppercase text - For emphasis and headers
      </Typography>
      <Typography variant="body-default" transform="lowercase">
        LOWERCASE TEXT - Converting from caps
      </Typography>
      <Typography variant="body-default" transform="capitalize">
        capitalize each word - For titles and names
      </Typography>
    </div>
  ),
};

export const CodeText: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Typography variant="body-default">
          Patient API endpoint:
        </Typography>
        <Typography variant="code" className="bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
          {'/api/v1/patients/{patientId}/vitals'}
        </Typography>
      </div>
      
      <div>
        <Typography variant="body-default">
          SQL Query for lab results:
        </Typography>
        <Typography variant="code" className="bg-gray-100 p-3 rounded mt-2 block whitespace-pre">
          {`SELECT lab_result_id, test_name, value, unit\nFROM lab_results\nWHERE patient_id = ? AND date >= ?`}
        </Typography>
      </div>
    </div>
  ),
};
