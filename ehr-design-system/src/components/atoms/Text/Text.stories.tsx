import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Text component provides consistent typography for body content, descriptions, and general text throughout healthcare applications. Supports multiple variants, sizes, and semantic HTML elements.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'muted', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg'],
    },
    leading: {
      control: 'select',
      options: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'small', 'strong', 'em', 'code', 'pre'],
    },
    truncate: {
      control: 'boolean',
    },
    maxLines: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'This is a default text component for healthcare applications.',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-3">
      <Text variant="default">Default: Patient information successfully updated.</Text>
      <Text variant="primary">Primary: Important medical information requires attention.</Text>
      <Text variant="success">Success: Treatment plan has been completed successfully.</Text>
      <Text variant="warning">Warning: Prescription expires in 3 days - renewal needed.</Text>
      <Text variant="danger">Critical: Emergency contact required immediately.</Text>
      <Text variant="muted">Muted: Additional notes and supplementary information.</Text>
      <Text variant="secondary">Secondary: Supporting details and context.</Text>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-3">
      <Text size="xs">Extra Small: Patient ID MRN-123456</Text>
      <Text size="sm">Small: Last updated 2 hours ago</Text>
      <Text size="md">Medium: Standard body text for patient records and documentation.</Text>
      <Text size="lg">Large: Important notifications and highlighted information.</Text>
      <Text size="xl">Extra Large: Primary content and main descriptions.</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="space-y-3">
      <Text weight="light">Light: Supplementary information and notes</Text>
      <Text weight="normal">Normal: Standard body text for most content</Text>
      <Text weight="medium">Medium: Slightly emphasized content</Text>
      <Text weight="semibold">Semibold: Important information that needs attention</Text>
      <Text weight="bold">Bold: Critical alerts and primary emphasis</Text>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border rounded">
        <Text align="left">Left aligned: Patient demographics and contact information align to the left for easy reading and scanning.</Text>
      </div>
      <div className="p-4 border rounded">
        <Text align="center">Center aligned: Important announcements and system messages are centered for emphasis and attention.</Text>
      </div>
      <div className="p-4 border rounded">
        <Text align="right">Right aligned: Timestamps, dates, and numerical values often align to the right for consistent formatting.</Text>
      </div>
      <div className="p-4 border rounded">
        <Text align="justify">Justified: Clinical notes and detailed medical documentation can use justified alignment for professional presentation and optimal use of space in printed reports.</Text>
      </div>
    </div>
  ),
};

export const LineHeight: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-4 border rounded">
        <Text leading="tight" weight="medium">Tight Leading</Text>
        <Text leading="tight" size="sm">
          This text uses tight line height for compact display. Useful for labels, captions, and space-constrained interfaces where information density is important.
        </Text>
      </div>
      
      <div className="p-4 border rounded">
        <Text leading="normal" weight="medium">Normal Leading</Text>
        <Text leading="normal" size="sm">
          This text uses normal line height for standard readability. Perfect for most body text, patient information, and general content throughout the application.
        </Text>
      </div>
      
      <div className="p-4 border rounded">
        <Text leading="relaxed" weight="medium">Relaxed Leading</Text>
        <Text leading="relaxed" size="sm">
          This text uses relaxed line height for improved readability. Ideal for longer content, clinical notes, and text that needs to be easy to read for extended periods.
        </Text>
      </div>
    </div>
  ),
};

export const SemanticElements: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border rounded">
        <Text as="p" weight="medium">Paragraph (p tag)</Text>
        <Text as="p" size="sm" variant="muted">
          This renders as a paragraph element, perfect for body text and descriptions.
        </Text>
      </div>
      
      <div className="p-4 border rounded">
        <Text as="span" weight="medium">Inline span elements: </Text>
        <Text as="span" variant="primary">Primary text</Text>
        <Text as="span">, </Text>
        <Text as="span" variant="success">success text</Text>
        <Text as="span">, and </Text>
        <Text as="span" variant="warning">warning text</Text>
      </div>
      
      <div className="p-4 border rounded">
        <Text as="small" variant="muted">Small element for fine print and disclaimers</Text>
      </div>
      
      <div className="p-4 border rounded">
        <Text as="strong" variant="danger">Strong element for important information</Text>
      </div>
      
      <div className="p-4 border rounded">
        <Text as="em" variant="primary">Emphasized text using the em element</Text>
      </div>
    </div>
  ),
};

export const TruncationAndClamping: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="max-w-md p-4 border rounded">
        <Text weight="medium" spacing="sm">Single Line Truncation</Text>
        <Text truncate>
          This is a very long text that will be truncated with an ellipsis when it exceeds the container width. Perfect for patient names, addresses, or other data that might be too long to display fully.
        </Text>
      </div>
      
      <div className="max-w-md p-4 border rounded">
        <Text weight="medium" spacing="sm">Multi-line Clamping (2 lines)</Text>
        <Text maxLines={2}>
          This is a longer text that demonstrates multi-line clamping. It will show up to 2 lines and then be truncated with an ellipsis. This is useful for preview text, descriptions, or summaries where you want to show some content but limit the vertical space used.
        </Text>
      </div>
      
      <div className="max-w-md p-4 border rounded">
        <Text weight="medium" spacing="sm">Multi-line Clamping (3 lines)</Text>
        <Text maxLines={3}>
          This is an even longer text example that demonstrates how multi-line clamping works with three lines. This technique is particularly useful in healthcare applications for patient summaries, medical histories, or clinical notes where you want to provide a preview of the content without taking up too much space in lists or cards.
        </Text>
      </div>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Patient Information Card</h3>
        <div className="p-6 border rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <Text size="lg" weight="semibold">John Michael Doe</Text>
              <Text variant="muted" size="sm">MRN: 123456789</Text>
            </div>
            <Text variant="success" size="sm" weight="medium">Active</Text>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text size="sm" weight="medium" spacing="xs">Demographics</Text>
              <Text size="sm" variant="muted">Age: 45 years old</Text>
              <Text size="sm" variant="muted">DOB: May 15, 1978</Text>
              <Text size="sm" variant="muted">Gender: Male</Text>
            </div>
            <div>
              <Text size="sm" weight="medium" spacing="xs">Contact</Text>
              <Text size="sm" variant="muted">Phone: (555) 123-4567</Text>
              <Text size="sm" variant="muted">Email: john.doe@email.com</Text>
            </div>
          </div>
          
          <div>
            <Text size="sm" weight="medium" spacing="xs">Address</Text>
            <Text size="sm" variant="muted" maxLines={2}>
              123 Healthcare Drive, Medical Plaza Suite 456, Cityville, State 12345-6789
            </Text>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Alerts & Status</h3>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text variant="danger" weight="semibold" spacing="xs">🚨 CRITICAL ALLERGY ALERT</Text>
            <Text variant="danger" size="sm">
              Patient has severe penicillin allergy - anaphylactic reaction documented
            </Text>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text variant="warning" weight="semibold" spacing="xs">⚠️ Medication Warning</Text>
            <Text variant="warning" size="sm">
              Current prescription for Lisinopril expires in 3 days - renewal required
            </Text>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <Text variant="success" weight="semibold" spacing="xs">✅ Treatment Completed</Text>
            <Text variant="success" size="sm">
              Physical therapy course completed successfully - follow-up in 3 months
            </Text>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clinical Documentation</h3>
        <div className="p-6 border rounded-lg">
          <div className="mb-4">
            <Text weight="semibold" spacing="xs">Progress Note - January 15, 2024</Text>
            <Text variant="muted" size="sm">Dr. Sarah Johnson, MD - Internal Medicine</Text>
          </div>
          
          <div className="space-y-4">
            <div>
              <Text size="sm" weight="medium" spacing="xs">Chief Complaint:</Text>
              <Text size="sm" leading="relaxed">
                Patient presents for routine diabetes management and blood pressure monitoring.
              </Text>
            </div>
            
            <div>
              <Text size="sm" weight="medium" spacing="xs">Assessment:</Text>
              <Text size="sm" leading="relaxed">
                Type 2 diabetes well controlled with current medication regimen. 
                HbA1c improved from 8.2% to 7.1% since last visit. Blood pressure 
                remains stable on Lisinopril 10mg daily.
              </Text>
            </div>
            
            <div>
              <Text size="sm" weight="medium" spacing="xs">Plan:</Text>
              <Text size="sm" leading="relaxed">
                Continue current diabetes medications. Schedule follow-up in 3 months. 
                Patient education on dietary modifications reinforced.
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Results Summary</h3>
        <div className="p-6 border rounded-lg">
          <div className="mb-4">
            <Text weight="semibold">Laboratory Results - January 15, 2024</Text>
            <Text variant="muted" size="sm">Quest Diagnostics - Report ID: LAB-2024-001234</Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-green-50 rounded">
              <Text variant="success" size="sm" weight="medium" spacing="xs">Normal Results</Text>
              <Text size="xs" variant="muted">Hemoglobin: 14.2 g/dL</Text>
              <Text size="xs" variant="muted">WBC Count: 6,800/μL</Text>
              <Text size="xs" variant="muted">Platelet Count: 250,000/μL</Text>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded">
              <Text variant="warning" size="sm" weight="medium" spacing="xs">Borderline</Text>
              <Text size="xs" variant="muted">Total Cholesterol: 205 mg/dL</Text>
              <Text size="xs" variant="muted">Blood Pressure: 135/85 mmHg</Text>
            </div>
            
            <div className="p-3 bg-red-50 rounded">
              <Text variant="danger" size="sm" weight="medium" spacing="xs">Abnormal - Action Needed</Text>
              <Text size="xs" variant="muted">HbA1c: 8.2% (Target: &lt;7%)</Text>
              <Text size="xs" variant="muted">Creatinine: 2.1 mg/dL (Elevated)</Text>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Appointment Schedule</h3>
        <div className="space-y-3">
          {[
            { time: '9:00 AM', patient: 'Sarah Wilson', type: 'Annual Physical', status: 'confirmed' },
            { time: '9:30 AM', patient: 'Michael Chen', type: 'Follow-up', status: 'pending' },
            { time: '10:00 AM', patient: 'Empty Slot', type: 'Available', status: 'available' },
            { time: '10:30 AM', patient: 'Lisa Rodriguez', type: 'Consultation', status: 'confirmed' },
          ].map((appointment, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Text size="sm" weight="medium" className="min-w-[70px]">
                  {appointment.time}
                </Text>
                <div>
                  <Text size="sm" weight="medium">{appointment.patient}</Text>
                  <Text size="xs" variant="muted">{appointment.type}</Text>
                </div>
              </div>
              <Text 
                size="xs" 
                weight="medium"
                variant={
                  appointment.status === 'confirmed' ? 'success' :
                  appointment.status === 'pending' ? 'warning' : 'muted'
                }
              >
                {appointment.status.toUpperCase()}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System Messages</h3>
        <div className="space-y-3">
          <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
            <Text variant="primary" size="sm" weight="medium" spacing="xs">
              System Maintenance Notice
            </Text>
            <Text size="sm" leading="relaxed">
              Scheduled maintenance will occur on Saturday, January 20th from 2:00 AM to 6:00 AM EST. 
              The system will be temporarily unavailable during this time.
            </Text>
            <Text size="xs" variant="muted">Posted: 2 hours ago</Text>
          </div>
          
          <div className="p-4 border-l-4 border-l-green-500 bg-green-50">
            <Text variant="success" size="sm" weight="medium" spacing="xs">
              Security Update Completed
            </Text>
            <Text size="sm" leading="relaxed">
              Security patches have been successfully applied to all systems. 
              No action required from users.
            </Text>
            <Text size="xs" variant="muted">Posted: 1 day ago</Text>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Screen Reader Friendly Text</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <Text size="sm" weight="medium">Patient Information</Text>
          <Text size="sm" as="span">Patient ID: </Text>
          <Text size="sm" as="strong" variant="primary">MRN-123456789</Text>
          
          <Text size="sm" as="span">Status: </Text>
          <Text size="sm" as="span" variant="success" weight="medium" aria-label="Patient status is active">
            Active
          </Text>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">High Contrast for Accessibility</h3>
        <div className="p-4 bg-gray-900 text-white rounded-lg space-y-2">
          <Text className="text-white" weight="medium">High Contrast Mode</Text>
          <Text className="text-gray-300" size="sm">
            This demonstrates how text appears in high contrast mode for accessibility
          </Text>
        </div>
      </div>
    </div>
  ),
};