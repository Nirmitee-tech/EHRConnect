'use client';

import React, { useState } from 'react';
import { Save, X, Loader, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import {
  IntegrationVendor,
  IntegrationConfig,
  IntegrationEnvironment,
  IntegrationCredential
} from '@/types/integration';
import { IntegrationLogo } from './integration-logo';
import { IntegrationConfigWizard } from './integration-config-wizard';
import { getIntegrationSchema } from '@/config/integration-schemas';

interface IntegrationConfigFormProps {
  vendor: IntegrationVendor;
  existingConfig?: IntegrationConfig;
  onSave: (config: IntegrationConfig) => void;
  onCancel: () => void;
}

// Define credential fields for each vendor type
const getVendorCredentials = (vendorId: string): IntegrationCredential[] => {
  const commonFields: IntegrationCredential[] = [
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'password',
      required: true,
      placeholder: 'Enter your API key',
      helpText: 'Your unique API key from the vendor portal'
    },
    {
      key: 'apiSecret',
      label: 'API Secret',
      type: 'password',
      required: true,
      placeholder: 'Enter your API secret',
      helpText: 'Keep this secret secure'
    }
  ];

  // OAuth-based vendors
  if (['openai', 'anthropic', 'assemblyai', 'deepgram'].includes(vendorId)) {
    return [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'sk-...',
        helpText: 'Your API key from the vendor dashboard'
      }
    ];
  }

  // Communication platforms
  if (['twilio', 'exotel', 'plivo'].includes(vendorId)) {
    return [
      {
        key: 'accountSid',
        label: 'Account SID',
        type: 'text',
        required: true,
        placeholder: 'AC...',
        helpText: 'Your account identifier'
      },
      {
        key: 'authToken',
        label: 'Auth Token',
        type: 'password',
        required: true,
        placeholder: 'Enter auth token',
        helpText: 'Authentication token from dashboard'
      }
    ];
  }

  // Video platforms
  if (['100ms', 'agora', 'vonage'].includes(vendorId)) {
    return [
      {
        key: 'appId',
        label: 'App ID',
        type: 'text',
        required: true,
        placeholder: 'Enter application ID',
        helpText: 'Your application identifier'
      },
      {
        key: 'appSecret',
        label: 'App Secret',
        type: 'password',
        required: true,
        placeholder: 'Enter app secret',
        helpText: 'Secret key for authentication'
      }
    ];
  }

  return commonFields;
};

// Define workflow mappings for each category
const getWorkflowMappings = (category: string): string[] => {
  const mappings: Record<string, string[]> = {
    ehr: ['Patient Sync', 'Encounter Sync', 'Document Exchange'],
    claims: ['Claim Submission', 'Claim Status Check', 'ERA Processing'],
    eligibility: ['Real-time Eligibility', 'Pre-authorization', 'Benefit Verification'],
    'hl7-fhir': ['Inbound Messages', 'Outbound Messages', 'Event Notifications'],
    era: ['835 Processing', 'Payment Posting', 'Denial Management'],
    telehealth: ['Video Consultations', 'Virtual Waiting Room', 'Recording'],
    ai: ['Clinical Documentation', 'Transcription', 'Chat Support'],
    communication: ['Appointment Reminders', 'SMS Notifications', 'Voice Calls'],
    analytics: ['Dashboard Metrics', 'Real-time Alerts', 'Report Generation'],
    custom: ['Custom Workflow 1', 'Custom Workflow 2', 'Custom Workflow 3']
  };

  return mappings[category] || [];
};

export function IntegrationConfigForm({
  vendor,
  existingConfig,
  onSave,
  onCancel
}: IntegrationConfigFormProps) {
  const [environment, setEnvironment] = useState<IntegrationEnvironment>(
    existingConfig?.environment || 'sandbox'
  );
  const [apiEndpoint, setApiEndpoint] = useState(existingConfig?.apiEndpoint || '');
  const [credentials, setCredentials] = useState<Record<string, string>>(
    existingConfig?.credentials || {}
  );
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>(
    existingConfig?.usageMappings.filter(m => m.enabled).map(m => m.workflow) || []
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saving, setSaving] = useState(false);

  // Check if this integration has a custom schema
  const integrationSchema = getIntegrationSchema(vendor.id);
  const hasCustomSchema = integrationSchema.vendorId !== 'default';

  const credentialFields = getVendorCredentials(vendor.id);
  const workflowOptions = getWorkflowMappings(vendor.category);

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleWorkflowToggle = (workflow: string) => {
    setSelectedWorkflows(prev =>
      prev.includes(workflow)
        ? prev.filter(w => w !== workflow)
        : [...prev, workflow]
    );
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Randomly succeed/fail for demo
    const success = Math.random() > 0.3;
    setTestResult(success ? 'success' : 'error');
    setTesting(false);
  };

  const handleWizardComplete = async (wizardData: Record<string, string | boolean | number>) => {
    setSaving(true);

    // Convert wizard data to credentials format
    const wizardCredentials: Record<string, string> = {};
    Object.entries(wizardData).forEach(([key, value]) => {
      wizardCredentials[key] = String(value);
    });

    // Extract apiEndpoint if provided in wizard data
    const endpoint = wizardCredentials.apiEndpoint ||
                     wizardCredentials.fhirBaseUrl ||
                     apiEndpoint ||
                     'https://api.example.com';

    // Create config object
    const config: IntegrationConfig = {
      id: existingConfig?.id || `int_${Date.now()}`,
      vendorId: vendor.id,
      enabled: existingConfig?.enabled || false,
      environment,
      apiEndpoint: endpoint,
      credentials: wizardCredentials,
      usageMappings: workflowOptions.map(workflow => ({
        id: `map_${workflow.toLowerCase().replace(/\s+/g, '_')}`,
        workflow,
        enabled: selectedWorkflows.includes(workflow)
      })),
      healthStatus: 'inactive',
      lastTestedAt: testResult === 'success' ? new Date() : existingConfig?.lastTestedAt,
      createdAt: existingConfig?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: existingConfig?.createdBy || 'current-user-id',
      updatedBy: 'current-user-id'
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    onSave(config);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = credentialFields
      .filter(field => field.required && !credentials[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!apiEndpoint) {
      alert('Please enter an API endpoint');
      return;
    }

    setSaving(true);

    // Create config object
    const config: IntegrationConfig = {
      id: existingConfig?.id || `int_${Date.now()}`,
      vendorId: vendor.id,
      enabled: existingConfig?.enabled || false,
      environment,
      apiEndpoint,
      credentials,
      usageMappings: workflowOptions.map(workflow => ({
        id: `map_${workflow.toLowerCase().replace(/\s+/g, '_')}`,
        workflow,
        enabled: selectedWorkflows.includes(workflow)
      })),
      healthStatus: 'inactive',
      lastTestedAt: testResult === 'success' ? new Date() : existingConfig?.lastTestedAt,
      createdAt: existingConfig?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: existingConfig?.createdBy || 'current-user-id',
      updatedBy: 'current-user-id'
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    onSave(config);
  };

  // Prepare initial data for wizard from existing config
  const wizardInitialData: Record<string, string | boolean | number> = existingConfig
    ? { ...existingConfig.credentials, environment }
    : {};

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-3">
          <IntegrationLogo
            name={vendor.name}
            logo={vendor.logo}
            category={vendor.category}
            className="w-16 h-16 rounded-lg flex-shrink-0 text-base"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{vendor.description}</p>
            <div className="flex flex-wrap gap-3">
              {vendor.documentation && (
                <a
                  href={vendor.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Documentation
                </a>
              )}
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conditional rendering: Custom wizard or default form */}
      {hasCustomSchema ? (
        <IntegrationConfigWizard
          schema={integrationSchema}
          onComplete={handleWizardComplete}
          onCancel={onCancel}
          initialData={wizardInitialData}
        />
      ) : (

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Environment Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environment <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEnvironment('sandbox')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                environment === 'sandbox'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Sandbox</div>
              <div className="text-xs text-gray-500">Test environment</div>
            </button>
            <button
              type="button"
              onClick={() => setEnvironment('production')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                environment === 'production'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">Production</div>
              <div className="text-xs text-gray-500">Live environment</div>
            </button>
          </div>
        </div>

        {/* API Endpoint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Endpoint <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The base URL for API requests
          </p>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Authentication</h4>
          {credentialFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type}
                value={credentials[field.key] || ''}
                onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required={field.required}
              />
              {field.helpText && (
                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>

        {/* Workflow Mappings */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Usage Mappings</h4>
          <p className="text-sm text-gray-500 mb-4">
            Select which workflows should use this integration
          </p>
          <div className="space-y-2">
            {workflowOptions.map((workflow) => (
              <label
                key={workflow}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedWorkflows.includes(workflow)}
                  onChange={() => handleWorkflowToggle(workflow)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">{workflow}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Test Connection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Test Connection</h4>
            {testResult && (
              <div className={`flex items-center gap-1 text-sm ${
                testResult === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Connection successful
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Connection failed
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Verify that your credentials are correct before saving
          </p>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !apiEndpoint || credentialFields.some(f => f.required && !credentials[f.key])}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
