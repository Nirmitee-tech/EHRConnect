import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Code } from './Code';

const meta: Meta<typeof Code> = {
  title: 'Atoms/Code',
  component: Code,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Code component for displaying inline code snippets with copy functionality. Perfect for API references, medical codes, patient IDs, and technical documentation in healthcare applications.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    copyable: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Default: Story = {
  args: {
    children: 'npm install',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <p>Default: <Code variant="default">GET /api/patients</Code></p>
      <p>Primary: <Code variant="primary">POST /api/appointments</Code></p>
      <p>Success: <Code variant="success">200 OK</Code></p>
      <p>Warning: <Code variant="warning">429 Rate Limited</Code></p>
      <p>Danger: <Code variant="danger">500 Internal Error</Code></p>
      <p>Outline: <Code variant="outline">PATCH /api/records</Code></p>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <p>Small: <Code size="sm">patient.id</Code></p>
      <p>Medium: <Code size="md">patient.medicalRecordNumber</Code></p>
      <p>Large: <Code size="lg">const diagnosis = 'hypertension'</Code></p>
    </div>
  ),
};

export const Copyable: Story = {
  render: () => (
    <div className="space-y-4">
      <p>Copy patient ID: <Code copyable>MRN-123456789</Code></p>
      <p>Copy API key: <Code copyable variant="primary">sk_test_4eC39HqLyjWDarjtT1zdp7dc</Code></p>
      <p>Copy prescription: <Code copyable variant="success">RX-2024-001234</Code></p>
    </div>
  ),
};

export const HealthcareExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Identifiers</h3>
        <div className="space-y-3">
          <p>Medical Record Number: <Code copyable variant="primary">MRN-987654321</Code></p>
          <p>Patient ID: <Code copyable>PAT-2024-5678</Code></p>
          <p>Insurance Policy: <Code copyable variant="success">INS-ABC-123456</Code></p>
          <p>Prescription Number: <Code copyable variant="warning">RX-2024-001234</Code></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">ICD-10 Diagnostic Codes</h3>
        <div className="space-y-3">
          <p>Essential Hypertension: <Code copyable variant="danger">I10</Code></p>
          <p>Type 2 Diabetes: <Code copyable variant="warning">E11.9</Code></p>
          <p>Acute Bronchitis: <Code copyable>J20.9</Code></p>
          <p>Annual Physical: <Code copyable variant="success">Z00.00</Code></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">CPT Procedure Codes</h3>
        <div className="space-y-3">
          <p>Office Visit: <Code copyable variant="primary">99213</Code></p>
          <p>Blood Panel: <Code copyable>80053</Code></p>
          <p>EKG: <Code copyable variant="warning">93000</Code></p>
          <p>X-Ray Chest: <Code copyable>71020</Code></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medication Codes</h3>
        <div className="space-y-3">
          <p>Lisinopril 10mg: <Code copyable variant="success">NDC-12345-678-90</Code></p>
          <p>Metformin 500mg: <Code copyable variant="primary">NDC-98765-432-10</Code></p>
          <p>Aspirin 81mg: <Code copyable>NDC-11111-222-33</Code></p>
          <p>Ibuprofen 200mg: <Code copyable variant="warning">NDC-44444-555-66</Code></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lab Values & References</h3>
        <div className="space-y-3">
          <p>Hemoglobin: <Code variant="success">14.2 g/dL</Code> (Normal: <Code size="sm">12.0-15.5</Code>)</p>
          <p>Glucose: <Code variant="warning">145 mg/dL</Code> (Normal: <Code size="sm">70-100</Code>)</p>
          <p>Cholesterol: <Code variant="danger">245 mg/dL</Code> (Target: <Code size="sm">&lt;200</Code>)</p>
          <p>Blood Pressure: <Code variant="warning">140/90 mmHg</Code></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
        <div className="space-y-3">
          <p>Get Patient: <Code copyable variant="primary">GET /api/v1/patients/{id}</Code></p>
          <p>Create Appointment: <Code copyable variant="success">POST /api/v1/appointments</Code></p>
          <p>Update Record: <Code copyable variant="warning">PUT /api/v1/records/{id}</Code></p>
          <p>Delete Note: <Code copyable variant="danger">DELETE /api/v1/notes/{id}</Code></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">System Commands</h3>
        <div className="space-y-3">
          <p>Backup Database: <Code copyable variant="primary">pg_dump ehrconnect &gt; backup.sql</Code></p>
          <p>Start Service: <Code copyable variant="success">systemctl start ehr-service</Code></p>
          <p>Check Logs: <Code copyable>tail -f /var/log/ehr/app.log</Code></p>
          <p>Restart Server: <Code copyable variant="warning">sudo systemctl restart nginx</Code></p>
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [copyCount, setCopyCount] = React.useState(0);
    const [lastCopied, setLastCopied] = React.useState('');

    const handleCopy = (text: string) => {
      setCopyCount(prev => prev + 1);
      setLastCopied(text);
    };

    const medicalCodes = [
      { code: 'MRN-987654321', label: 'Medical Record Number', variant: 'primary' as const },
      { code: 'I10', label: 'Essential Hypertension', variant: 'danger' as const },
      { code: '99213', label: 'Office Visit - Level 3', variant: 'success' as const },
      { code: 'NDC-12345-678-90', label: 'Lisinopril 10mg', variant: 'warning' as const },
      { code: 'RX-2024-001234', label: 'Prescription Number', variant: 'default' as const },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Interactive Medical Code References</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click the copy button next to any code to copy it to your clipboard
          </p>
          
          <div className="space-y-3">
            {medicalCodes.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <div className="mt-1">
                    <Code 
                      copyable 
                      variant={item.variant}
                      onCopy={() => handleCopy(item.code)}
                    >
                      {item.code}
                    </Code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Copy Statistics</h4>
          <div className="text-sm space-y-1">
            <p>Total copies: <Code variant="primary">{copyCount}</Code></p>
            <p>Last copied: {lastCopied ? <Code variant="success">{lastCopied}</Code> : 'None'}</p>
          </div>
          
          {copyCount > 0 && (
            <div className="mt-3 p-2 bg-success/10 rounded border border-success/20 text-success text-sm">
              ✅ Codes copied successfully! Use them in your EHR system or documentation.
            </div>
          )}
        </div>
      </div>
    );
  },
};