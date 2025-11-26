import { IntegrationConfigSchema } from '@/types/integration';

// Epic FHIR Integration - Multi-step with OAuth
export const EPIC_SCHEMA: IntegrationConfigSchema = {
  vendorId: 'epic',
  requiresMultiStep: true,
  oauth: {
    enabled: true,
    authUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    scopes: ['patient/*.read', 'user/*.read', 'launch', 'online_access']
  },
  steps: [
    {
      id: 'app-registration',
      title: 'App Registration',
      description: 'Register your application in Epic App Orchard',
      fields: [
        {
          key: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          placeholder: 'Enter your Epic Client ID',
          helpText: 'Obtained from Epic App Orchard after app registration'
        },
        {
          key: 'clientSecret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          placeholder: 'Enter your Client Secret',
          helpText: 'Keep this confidential and secure'
        },
        {
          key: 'redirectUri',
          label: 'Redirect URI',
          type: 'url',
          required: true,
          placeholder: 'https://yourdomain.com/callback',
          helpText: 'Must match the redirect URI registered in Epic App Orchard'
        }
      ]
    },
    {
      id: 'fhir-endpoint',
      title: 'FHIR Endpoint Configuration',
      description: 'Configure your Epic FHIR endpoint',
      fields: [
        {
          key: 'fhirBaseUrl',
          label: 'FHIR Base URL',
          type: 'url',
          required: true,
          placeholder: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
          helpText: 'Your organization\'s Epic FHIR R4 base URL'
        },
        {
          key: 'organizationId',
          label: 'Organization ID',
          type: 'text',
          required: false,
          placeholder: 'Enter Epic Organization ID',
          helpText: 'Optional: Used for multi-tenant configurations'
        }
      ]
    },
    {
      id: 'data-access',
      title: 'Data Access Scopes',
      description: 'Select which FHIR resources to access',
      fields: [
        {
          key: 'enablePatientData',
          label: 'Enable Patient Demographics',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Access patient demographic information'
        },
        {
          key: 'enableEncounters',
          label: 'Enable Encounters',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Access encounter/visit data'
        },
        {
          key: 'enableObservations',
          label: 'Enable Observations (Labs/Vitals)',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          helpText: 'Access lab results and vital signs'
        },
        {
          key: 'enableMedications',
          label: 'Enable Medications',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          helpText: 'Access medication lists and orders'
        }
      ]
    }
  ],
  testing: {
    enabled: true,
    testEndpoint: '/metadata',
    testMethod: 'GET'
  }
};

// Stripe Payment Integration - Simple with webhook
export const STRIPE_SCHEMA: IntegrationConfigSchema = {
  vendorId: 'stripe',
  requiresMultiStep: false,
  steps: [
    {
      id: 'api-keys',
      title: 'API Keys',
      description: 'Enter your Stripe API keys',
      fields: [
        {
          key: 'publishableKey',
          label: 'Publishable Key',
          type: 'text',
          required: true,
          placeholder: 'pk_test_...',
          helpText: 'Your Stripe publishable key (safe to expose in frontend)'
        },
        {
          key: 'secretKey',
          label: 'Secret Key',
          type: 'password',
          required: true,
          placeholder: 'sk_test_...',
          helpText: 'Keep this secret and never expose it in frontend code'
        }
      ]
    }
  ],
  webhooks: {
    enabled: true,
    fields: [
      {
        key: 'webhookSecret',
        label: 'Webhook Signing Secret',
        type: 'password',
        required: false,
        placeholder: 'whsec_...',
        helpText: 'Used to verify webhook signatures from Stripe'
      },
      {
        key: 'webhookEvents',
        label: 'Webhook Events',
        type: 'select',
        required: false,
        options: [
          { label: 'Payment Succeeded', value: 'payment_intent.succeeded' },
          { label: 'Payment Failed', value: 'payment_intent.payment_failed' },
          { label: 'Charge Refunded', value: 'charge.refunded' },
          { label: 'Customer Created', value: 'customer.created' }
        ],
        helpText: 'Select events to listen for'
      }
    ]
  },
  testing: {
    enabled: true,
    testEndpoint: '/v1/balance',
    testMethod: 'GET'
  }
};

// Twilio Communication - Simple configuration
export const TWILIO_SCHEMA: IntegrationConfigSchema = {
  vendorId: 'twilio',
  requiresMultiStep: false,
  steps: [
    {
      id: 'credentials',
      title: 'Account Credentials',
      description: 'Enter your Twilio account details',
      fields: [
        {
          key: 'accountSid',
          label: 'Account SID',
          type: 'text',
          required: true,
          placeholder: 'AC...',
          helpText: 'Found in your Twilio Console dashboard'
        },
        {
          key: 'authToken',
          label: 'Auth Token',
          type: 'password',
          required: true,
          placeholder: 'Your auth token',
          helpText: 'Keep this secret and secure'
        },
        {
          key: 'phoneNumber',
          label: 'Twilio Phone Number',
          type: 'text',
          required: true,
          placeholder: '+1234567890',
          helpText: 'Your Twilio phone number with country code'
        },
        {
          key: 'messagingServiceSid',
          label: 'Messaging Service SID (Optional)',
          type: 'text',
          required: false,
          placeholder: 'MG...',
          helpText: 'Use if you have a messaging service configured'
        }
      ]
    }
  ],
  testing: {
    enabled: true,
    testEndpoint: '/2010-04-01/Accounts',
    testMethod: 'GET'
  }
};

// Availity Claims - Multi-step with complex setup
export const AVAILITY_SCHEMA: IntegrationConfigSchema = {
  vendorId: 'availity',
  requiresMultiStep: true,
  steps: [
    {
      id: 'credentials',
      title: 'API Credentials',
      description: 'Enter your Availity API credentials',
      fields: [
        {
          key: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          placeholder: 'Your Availity Client ID'
        },
        {
          key: 'clientSecret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          placeholder: 'Your Availity Client Secret'
        },
        {
          key: 'orgId',
          label: 'Organization ID',
          type: 'text',
          required: true,
          placeholder: 'Your Availity Organization ID'
        }
      ]
    },
    {
      id: 'payer-ids',
      title: 'Payer IDs',
      description: 'Configure payer identification',
      fields: [
        {
          key: 'payerId',
          label: 'Default Payer ID',
          type: 'text',
          required: true,
          placeholder: 'Enter payer ID',
          helpText: 'Your primary payer identification'
        },
        {
          key: 'npi',
          label: 'Provider NPI',
          type: 'text',
          required: true,
          placeholder: '10-digit NPI',
          helpText: 'National Provider Identifier',
          validation: {
            pattern: '^[0-9]{10}$',
            message: 'NPI must be exactly 10 digits'
          }
        },
        {
          key: 'taxId',
          label: 'Tax ID (TIN)',
          type: 'text',
          required: true,
          placeholder: 'XX-XXXXXXX',
          helpText: 'Provider Tax Identification Number'
        }
      ]
    },
    {
      id: 'transaction-types',
      title: 'Transaction Types',
      description: 'Enable transaction types you need',
      fields: [
        {
          key: 'enableEligibility',
          label: 'Eligibility (270/271)',
          type: 'checkbox',
          required: false,
          defaultValue: true
        },
        {
          key: 'enableClaims',
          label: 'Claims Submission (837)',
          type: 'checkbox',
          required: false,
          defaultValue: true
        },
        {
          key: 'enableClaimStatus',
          label: 'Claim Status (276/277)',
          type: 'checkbox',
          required: false,
          defaultValue: false
        },
        {
          key: 'enableRemittance',
          label: 'Remittance (835)',
          type: 'checkbox',
          required: false,
          defaultValue: false
        }
      ]
    }
  ],
  testing: {
    enabled: true,
    testEndpoint: '/availity/v1/coverages',
    testMethod: 'POST'
  }
};

// 100ms Video Integration
export const HUNDREDMS_SCHEMA: IntegrationConfigSchema = {
  vendorId: '100ms',
  requiresMultiStep: true,
  steps: [
    {
      id: 'credentials',
      title: 'API Credentials',
      description: 'Enter your 100ms dashboard credentials',
      fields: [
        {
          key: 'appId',
          label: 'App ID',
          type: 'text',
          required: true,
          placeholder: 'Enter your 100ms App ID',
          helpText: 'Found in your 100ms dashboard under Developer section'
        },
        {
          key: 'appSecret',
          label: 'App Secret',
          type: 'password',
          required: true,
          placeholder: 'Enter your App Secret',
          helpText: 'Keep this confidential and secure'
        },
        {
          key: 'apiEndpoint',
          label: 'API Endpoint',
          type: 'url',
          required: true,
          placeholder: 'https://api.100ms.live/v2',
          helpText: '100ms Management API endpoint',
          defaultValue: 'https://api.100ms.live/v2'
        }
      ]
    },
    {
      id: 'room-config',
      title: 'Room Configuration',
      description: 'Configure default room settings',
      fields: [
        {
          key: 'templateId',
          label: 'Template ID (Optional)',
          type: 'text',
          required: false,
          placeholder: 'Enter template ID',
          helpText: 'Use a specific room template from your 100ms dashboard'
        },
        {
          key: 'defaultRegion',
          label: 'Default Region',
          type: 'select',
          required: false,
          options: [
            { label: 'Auto (Recommended)', value: 'auto' },
            { label: 'United States', value: 'us' },
            { label: 'Europe', value: 'eu' },
            { label: 'India', value: 'in' },
            { label: 'Singapore', value: 'sg' }
          ],
          defaultValue: 'auto',
          helpText: 'Geographic region for hosting rooms'
        },
        {
          key: 'maxDuration',
          label: 'Max Session Duration (minutes)',
          type: 'number',
          required: false,
          placeholder: '60',
          defaultValue: 60,
          helpText: 'Maximum duration for each video session'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features',
      description: 'Enable advanced features',
      fields: [
        {
          key: 'recordingEnabled',
          label: 'Enable Recording',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Allow recording of video consultations (requires HIPAA compliance)'
        },
        {
          key: 'transcriptionEnabled',
          label: 'Enable Transcription',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          helpText: 'Enable automatic transcription of meetings'
        },
        {
          key: 'chatEnabled',
          label: 'Enable Chat',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Allow text chat during video calls'
        },
        {
          key: 'screenShareEnabled',
          label: 'Enable Screen Sharing',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Allow participants to share their screen'
        },
        {
          key: 'virtualBackgroundEnabled',
          label: 'Enable Virtual Backgrounds',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          helpText: 'Allow virtual/blurred backgrounds'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      description: 'Configure security settings',
      fields: [
        {
          key: 'waitingRoomEnabled',
          label: 'Enable Waiting Room',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Participants wait for host to join'
        },
        {
          key: 'endToEndEncryption',
          label: 'End-to-End Encryption',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          helpText: 'Enable E2E encryption for HIPAA compliance'
        },
        {
          key: 'webhookUrl',
          label: 'Webhook URL (Optional)',
          type: 'url',
          required: false,
          placeholder: 'https://yourdomain.com/webhooks/100ms',
          helpText: 'Receive real-time events about sessions'
        }
      ]
    }
  ],
  testing: {
    enabled: true,
    testEndpoint: '/active-rooms',
    testMethod: 'GET'
  }
};

// Default simple schema
export const DEFAULT_SCHEMA: IntegrationConfigSchema = {
  vendorId: 'default',
  requiresMultiStep: false,
  steps: [
    {
      id: 'basic',
      title: 'Basic Configuration',
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'Enter your API key'
        },
        {
          key: 'apiEndpoint',
          label: 'API Endpoint',
          type: 'url',
          required: true,
          placeholder: 'https://api.example.com'
        }
      ]
    }
  ],
  testing: {
    enabled: true
  }
};

// Schema registry
export const INTEGRATION_SCHEMAS: Record<string, IntegrationConfigSchema> = {
  epic: EPIC_SCHEMA,
  stripe: STRIPE_SCHEMA,
  twilio: TWILIO_SCHEMA,
  availity: AVAILITY_SCHEMA,
  '100ms': HUNDREDMS_SCHEMA,
  // Add more as needed
};

// Helper to get schema for a vendor
export function getIntegrationSchema(vendorId: string): IntegrationConfigSchema {
  return INTEGRATION_SCHEMAS[vendorId] || DEFAULT_SCHEMA;
}
