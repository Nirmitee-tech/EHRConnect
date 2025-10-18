export type IntegrationCategory =
  | 'ehr'
  | 'claims'
  | 'eligibility'
  | 'hl7-fhir'
  | 'era'
  | 'rcm'
  | 'billing'
  | 'payment'
  | 'telehealth'
  | 'ai'
  | 'communication'
  | 'crm'
  | 'erp'
  | 'inventory'
  | 'laboratory'
  | 'pharmacy'
  | 'imaging'
  | 'analytics'
  | 'custom';

export type IntegrationEnvironment = 'sandbox' | 'production';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'testing';

export interface IntegrationVendor {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logo?: string;
  website?: string;
  documentation?: string;
}

export interface IntegrationCredential {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'number' | 'select' | 'textarea' | 'file' | 'checkbox' | 'oauth';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[]; // For select fields
  defaultValue?: string | number | boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  dependsOn?: {
    field: string;
    value: string | number | boolean;
  };
}

export interface IntegrationStep {
  id: string;
  title: string;
  description?: string;
  fields: IntegrationCredential[];
  optional?: boolean;
}

export interface IntegrationConfigSchema {
  vendorId: string;
  requiresMultiStep: boolean;
  steps?: IntegrationStep[];
  webhooks?: {
    enabled: boolean;
    fields?: IntegrationCredential[];
  };
  testing?: {
    enabled: boolean;
    testEndpoint?: string;
    testMethod?: 'GET' | 'POST';
  };
  oauth?: {
    enabled: boolean;
    authUrl?: string;
    tokenUrl?: string;
    scopes?: string[];
  };
}

export interface IntegrationUsageMapping {
  id: string;
  workflow: string;
  enabled: boolean;
}

export interface IntegrationConfig {
  id: string;
  vendorId: string;
  facilityId?: string;
  enabled: boolean;
  environment: IntegrationEnvironment;
  apiEndpoint: string;
  credentials: Record<string, string>; // Encrypted in backend
  usageMappings: IntegrationUsageMapping[];
  healthStatus: IntegrationStatus;
  lastTestedAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  timestamp: Date;
  action: string;
  status: 'success' | 'error';
  message: string;
  userId?: string;
}

export interface IntegrationCategoryInfo {
  id: IntegrationCategory;
  name: string;
  description: string;
  icon: string;
  vendors: IntegrationVendor[];
}

export const INTEGRATION_CATEGORIES: IntegrationCategoryInfo[] = [
  {
    id: 'ehr',
    name: 'EHR / EMR Systems',
    description: 'Electronic health records',
    icon: '🏥',
    vendors: []
  },
  {
    id: 'rcm',
    name: 'Revenue Cycle Management',
    description: 'End-to-end RCM platforms',
    icon: '💳',
    vendors: []
  },
  {
    id: 'billing',
    name: 'Medical Billing',
    description: 'Billing & coding systems',
    icon: '🧾',
    vendors: []
  },
  {
    id: 'claims',
    name: 'Claims & Clearinghouse',
    description: 'Claim submission & processing',
    icon: '📋',
    vendors: []
  },
  {
    id: 'eligibility',
    name: 'Eligibility Verification',
    description: 'Insurance verification',
    icon: '🔍',
    vendors: []
  },
  {
    id: 'payment',
    name: 'Payment Processing',
    description: 'Payment gateways',
    icon: '💰',
    vendors: []
  },
  {
    id: 'era',
    name: 'ERA / Remittance',
    description: '835 processing',
    icon: '📬',
    vendors: []
  },
  {
    id: 'hl7-fhir',
    name: 'HL7/FHIR Integration',
    description: 'Interoperability platforms',
    icon: '🔗',
    vendors: []
  },
  {
    id: 'laboratory',
    name: 'Laboratory Systems',
    description: 'Lab orders & results',
    icon: '🔬',
    vendors: []
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Systems',
    description: 'E-prescribing & dispensing',
    icon: '💊',
    vendors: []
  },
  {
    id: 'imaging',
    name: 'Medical Imaging',
    description: 'PACS & radiology systems',
    icon: '📷',
    vendors: []
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Medical supplies & assets',
    icon: '📦',
    vendors: []
  },
  {
    id: 'erp',
    name: 'ERP Systems',
    description: 'Enterprise resource planning',
    icon: '🏢',
    vendors: []
  },
  {
    id: 'crm',
    name: 'CRM Systems',
    description: 'Customer relationship mgmt',
    icon: '👥',
    vendors: []
  },
  {
    id: 'telehealth',
    name: 'Telehealth',
    description: 'Virtual care platforms',
    icon: '📞',
    vendors: []
  },
  {
    id: 'ai',
    name: 'AI & ML Tools',
    description: 'Artificial intelligence',
    icon: '🤖',
    vendors: []
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'SMS/Voice/Email',
    icon: '📲',
    vendors: []
  },
  {
    id: 'analytics',
    name: 'Analytics & BI',
    description: 'Business intelligence',
    icon: '📊',
    vendors: []
  },
  {
    id: 'custom',
    name: 'Custom APIs',
    description: 'Custom integrations',
    icon: '🔧',
    vendors: []
  }
];

// Sample vendors for each category
export const SAMPLE_VENDORS: IntegrationVendor[] = [
  // EHR Systems
  {
    id: 'epic',
    name: 'Epic',
    category: 'ehr',
    description: 'Leading EHR with FHIR R4 APIs for patient and clinical data',
    website: 'https://fhir.epic.com',
    documentation: 'https://fhir.epic.com/Documentation',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Epic_Systems.svg/1600px-Epic_Systems.svg.png?20220204054501'
  },
  {
    id: 'cerner',
    name: 'Oracle Health (Cerner)',
    category: 'ehr',
    description: 'Oracle Health EHR with SMART on FHIR integration',
    website: 'https://fhir.cerner.com',
    documentation: 'https://fhir.cerner.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Oracle_Health_logo.png'
  },
  {
    id: 'athenahealth',
    name: 'athenahealth',
    category: 'ehr',
    description: 'Cloud-based EHR with 800+ API endpoints for practice management',
    website: 'https://www.athenahealth.com',
    documentation: 'https://docs.athenahealth.com/api',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Athenahealth.svg/500px-Athenahealth.svg.png'
  },
  {
    id: 'allscripts',
    name: 'Veradigm (Allscripts)',
    category: 'ehr',
    description: 'Veradigm Connect with Unity APIs for secure data exchange',
    website: 'https://www.veradigm.com',
    documentation: 'https://developer.allscripts.com',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Allscripts_logo.svg/500px-Allscripts_logo.svg.png'
  },
  {
    id: 'eclinicalworks',
    name: 'eClinicalWorks',
    category: 'ehr',
    description: 'Ambulatory EHR with FHIR and HL7 integration capabilities',
    website: 'https://www.eclinicalworks.com',
    documentation: 'https://www.eclinicalworks.com/products-services/interoperability/',
    logo: 'https://www.eclinicalworks.com/wp-content/uploads/2014/08/main-logo.png.webp'
  },

  {
    id: 'DrChrono',
    name: 'DrChrono',
    category: 'ehr',
    description: 'EHR and medical billing platform for practices',
    website: 'https://www.eclinicalworks.com',
    documentation: 'https://www.eclinicalworks.com/products-services/interoperability/',
    logo: 'https://framerusercontent.com/images/u0BXQLwOSByDagHSY2JlcQyUOcE.png?width=80&height=80'
  },
  


  {
    id: 'meditech',
    name: 'MEDITECH',
    category: 'ehr',
    description: 'Hospital EHR system with Expanse platform and FHIR support',
    website: 'https://www.meditech.com',
    logo: 'https://framerusercontent.com/images/15txGvTe460ymKMVFXQ2wG4IM.png?width=80&height=80'
  },
  {
    id: 'nextgen',
    name: 'NextGen Healthcare',
    category: 'ehr',
    description: 'Ambulatory EHR and practice management solution',
    website: 'https://www.nextgen.com',
    logo: 'https://nextgen.widen.net/content/mcckjhwu0f/original/NG_Logo_Final_RGB.svg?u=yye1mp'
  },

  // Claims & Clearinghouse
  {
    id: 'claim-md',
    name: 'Clain MD',
    category: 'claims',
    description: 'Revenue cycle management and claims processing platform',
    website: 'https://www.changehealthcare.com',
    logo: 'https://www.claim.md/_next/static/media/claim_md_logo.bfbfa7d1.png'
  },
  {
    id: 'change-healthcare',
    name: 'Change Healthcare',
    category: 'claims',
    description: 'Revenue cycle management and claims processing platform',
    website: 'https://www.changehealthcare.com',
    logo: 'https://www.claim.md/_next/static/media/claim_md_logo.bfbfa7d1.png'
  },
  {
    id: 'availity',
    name: 'Availity',
    category: 'claims',
    description: 'Real-time healthcare network with 8.8M+ daily transactions',
    website: 'https://www.availity.com',
    documentation: 'https://developer.availity.com'
  },
  {
    id: 'waystar',
    name: 'Waystar',
    category: 'claims',
    description: 'Cloud-based revenue cycle management and clearinghouse',
    website: 'https://www.waystar.com'
  },
  {
    id: 'claimmd',
    name: 'Office Ally',
    category: 'claims',
    description: 'Practice management and clearinghouse services',
    website: 'https://www.officeally.com'
  },

  // Eligibility
  {
    id: 'availity-elig',
    name: 'Availity Eligibility',
    category: 'eligibility',
    description: 'Real-time insurance eligibility verification (270/271)',
    website: 'https://www.availity.com',
    documentation: 'https://developer.availity.com'
  },
  {
    id: 'change-elig',
    name: 'Change Healthcare Eligibility',
    category: 'eligibility',
    description: 'Automated eligibility and benefits verification',
    website: 'https://www.changehealthcare.com'
  },

  // HL7/FHIR
  {
    id: 'mirth',
    name: 'Mirth Connect',
    category: 'hl7-fhir',
    description: 'Open-source HL7 interface engine for healthcare integration',
    website: 'https://www.nextgen.com/products-and-services/integration-engine'
  },
  {
    id: 'hapi-fhir',
    name: 'HAPI FHIR',
    category: 'hl7-fhir',
    description: 'Open-source FHIR server implementation',
    website: 'https://hapifhir.io',
    documentation: 'https://hapifhir.io/hapi-fhir/docs/'
  },
  {
    id: 'redox',
    name: 'Redox',
    category: 'hl7-fhir',
    description: 'Cloud-based healthcare integration platform',
    website: 'https://www.redoxengine.com'
  },

  // ERA
  {
    id: 'change-era',
    name: 'Change Healthcare ERA',
    category: 'era',
    description: 'Electronic remittance advice (835) processing',
    website: 'https://www.changehealthcare.com'
  },
  {
    id: 'availity-era',
    name: 'Availity ERA',
    category: 'era',
    description: 'Automated payment posting from ERAs',
    website: 'https://www.availity.com'
  },

  // Telehealth
  {
    id: 'twilio-video',
    name: 'Twilio Video',
    category: 'telehealth',
    description: 'HIPAA-eligible programmable video for telehealth',
    website: 'https://www.twilio.com',
    documentation: 'https://www.twilio.com/docs/video'
  },
  {
    id: '100ms',
    name: '100ms',
    category: 'telehealth',
    description: 'Live video infrastructure for virtual care',
    website: 'https://www.100ms.live'
  },
  {
    id: 'agora',
    name: 'Agora',
    category: 'telehealth',
    description: 'Real-time engagement platform for telehealth',
    website: 'https://www.agora.io'
  },
  {
    id: 'doxy',
    name: 'Doxy.me',
    category: 'telehealth',
    description: 'Simple, HIPAA-compliant telemedicine platform',
    website: 'https://doxy.me'
  },

  // AI
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    description: 'GPT-4 and GPT-3.5 for clinical documentation and chat',
    website: 'https://openai.com',
    documentation: 'https://platform.openai.com/docs'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'ai',
    description: 'Advanced AI for medical analysis and documentation',
    website: 'https://www.anthropic.com',
    documentation: 'https://docs.anthropic.com'
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    category: 'ai',
    description: 'Medical speech-to-text and transcription AI',
    website: 'https://www.assemblyai.com',
    documentation: 'https://www.assemblyai.com/docs'
  },
  {
    id: 'deepgram',
    name: 'Deepgram',
    category: 'ai',
    description: 'Real-time voice AI for healthcare conversations',
    website: 'https://deepgram.com'
  },

  // Communication
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    description: 'HIPAA-compliant SMS, voice, and video communication',
    website: 'https://www.twilio.com',
    documentation: 'https://www.twilio.com/docs'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'communication',
    description: 'Email delivery and patient communication platform',
    website: 'https://sendgrid.com'
  },
  {
    id: 'messagebird',
    name: 'MessageBird',
    category: 'communication',
    description: 'Omnichannel patient communication platform',
    website: 'https://www.messagebird.com'
  },

  // Analytics
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'analytics',
    description: 'Healthcare infrastructure monitoring and observability',
    website: 'https://www.datadoghq.com'
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'analytics',
    description: 'Open-source analytics and monitoring dashboards',
    website: 'https://grafana.com'
  },
  {
    id: 'tableau',
    name: 'Tableau',
    category: 'analytics',
    description: 'Healthcare data visualization and business intelligence',
    website: 'https://www.tableau.com'
  },

  // RCM (Revenue Cycle Management)
  {
    id: 'athenahealth-rcm',
    name: 'athenahealth RCM',
    category: 'rcm',
    description: 'Comprehensive revenue cycle management platform',
    website: 'https://www.athenahealth.com'
  },
  {
    id: 'kareo',
    name: 'Kareo',
    category: 'rcm',
    description: 'Cloud-based medical billing and RCM',
    website: 'https://www.kareo.com'
  },
  {
    id: 'advancedmd',
    name: 'AdvancedMD',
    category: 'rcm',
    description: 'Integrated practice management and RCM',
    website: 'https://www.advancedmd.com'
  },
  {
    id: 'zirmed',
    name: 'Zirmed',
    category: 'rcm',
    description: 'Healthcare revenue cycle automation',
    website: 'https://www.zirmed.com'
  },

  // Medical Billing
  {
    id: 'drchrono',
    name: 'DrChrono',
    category: 'billing',
    description: 'Medical billing and practice management',
    website: 'https://www.drchrono.com'
  },
  {
    id: 'practicefusion',
    name: 'Practice Fusion',
    category: 'billing',
    description: 'Cloud-based EHR with billing',
    website: 'https://www.practicefusion.com'
  },
  {
    id: 'collectmd',
    name: 'CollectMD',
    category: 'billing',
    description: 'Medical billing and claims management',
    website: 'https://www.collectmd.com'
  },

  // Payment Gateways
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'Payment processing for healthcare transactions',
    website: 'https://stripe.com',
    documentation: 'https://stripe.com/docs',
    logo: '/logos/integrations/stripe.png'
  },
  {
    id: 'square',
    name: 'Square',
    category: 'payment',
    description: 'Payment gateway and POS system',
    website: 'https://squareup.com',
    logo: '/logos/integrations/square.png'
  },
  {
    id: 'paypal',
    name: 'PayPal Healthcare',
    category: 'payment',
    description: 'Online payment processing',
    website: 'https://www.paypal.com',
    logo: '/logos/integrations/paypal.png'
  },
  {
    id: 'authorize-net',
    name: 'Authorize.Net',
    category: 'payment',
    description: 'Payment gateway for medical practices',
    website: 'https://www.authorize.net'
  },
  {
    id: 'instamed',
    name: 'InstaMed',
    category: 'payment',
    description: 'Healthcare-specific payment network',
    website: 'https://www.instamed.com'
  },

  // Laboratory Systems
  {
    id: 'labcorp',
    name: 'LabCorp',
    category: 'laboratory',
    description: 'Laboratory orders and results integration',
    website: 'https://www.labcorp.com'
  },
  {
    id: 'quest',
    name: 'Quest Diagnostics',
    category: 'laboratory',
    description: 'Lab test ordering and result delivery',
    website: 'https://www.questdiagnostics.com'
  },
  {
    id: 'relayhealth',
    name: 'RelayHealth',
    category: 'laboratory',
    description: 'Lab connectivity and ordering',
    website: 'https://www.relayhealth.com'
  },

  // Pharmacy Systems
  {
    id: 'surescripts',
    name: 'Surescripts',
    category: 'pharmacy',
    description: 'E-prescribing and medication history network',
    website: 'https://surescripts.com'
  },
  {
    id: 'ncpdp',
    name: 'NCPDP',
    category: 'pharmacy',
    description: 'Pharmacy standards and connectivity',
    website: 'https://www.ncpdp.org'
  },
  {
    id: 'covermy meds',
    name: 'CoverMyMeds',
    category: 'pharmacy',
    description: 'Electronic prior authorization',
    website: 'https://www.covermymeds.com'
  },

  // Medical Imaging
  {
    id: 'intelerad',
    name: 'Intelerad',
    category: 'imaging',
    description: 'Enterprise imaging and PACS',
    website: 'https://www.intelerad.com'
  },
  {
    id: 'sectra',
    name: 'Sectra',
    category: 'imaging',
    description: 'Medical imaging IT and PACS',
    website: 'https://medical.sectra.com'
  },
  {
    id: 'nuance-powerscribe',
    name: 'Nuance PowerScribe',
    category: 'imaging',
    description: 'Radiology reporting and speech recognition',
    website: 'https://www.nuance.com'
  },

  // Interoperability Platforms
  {
    id: 'zus-health',
    name: 'Zus Health',
    category: 'hl7-fhir',
    description: 'Shared health data platform with unified patient records',
    website: 'https://zushealth.com',
    documentation: 'https://docs.zushealth.com',
    logo: '/logos/integrations/zus-health.png'
  },
  {
    id: 'particle-health',
    name: 'Particle Health',
    category: 'hl7-fhir',
    description: 'FHIR-based health data aggregation',
    website: 'https://www.particlehealth.com',
    logo: '/logos/integrations/particle-health.png'
  },
  {
    id: 'health-gorilla',
    name: 'Health Gorilla',
    category: 'hl7-fhir',
    description: 'Nationwide health data network',
    website: 'https://www.healthgorilla.com',
    logo: '/logos/integrations/health-gorilla.png'
  },

  // CRM Systems
  {
    id: 'salesforce-health',
    name: 'Salesforce Health Cloud',
    category: 'crm',
    description: 'Healthcare CRM and patient engagement',
    website: 'https://www.salesforce.com/products/health-cloud'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'CRM and marketing automation',
    website: 'https://www.hubspot.com'
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'crm',
    description: 'Customer service and support platform',
    website: 'https://www.zendesk.com'
  },
  {
    id: 'freshworks',
    name: 'Freshworks',
    category: 'crm',
    description: 'CRM and customer engagement suite',
    website: 'https://www.freshworks.com'
  },

  // ERP Systems
  {
    id: 'sap-healthcare',
    name: 'SAP for Healthcare',
    category: 'erp',
    description: 'Enterprise resource planning for healthcare',
    website: 'https://www.sap.com'
  },
  {
    id: 'oracle-cloud',
    name: 'Oracle Cloud ERP',
    category: 'erp',
    description: 'Cloud ERP for healthcare organizations',
    website: 'https://www.oracle.com'
  },
  {
    id: 'microsoft-dynamics',
    name: 'Microsoft Dynamics 365',
    category: 'erp',
    description: 'Business applications and ERP',
    website: 'https://dynamics.microsoft.com'
  },
  {
    id: 'netsuite',
    name: 'NetSuite',
    category: 'erp',
    description: 'Cloud business management suite',
    website: 'https://www.netsuite.com'
  },

  // Inventory Management
  {
    id: 'mckesson',
    name: 'McKesson',
    category: 'inventory',
    description: 'Medical supply chain and inventory management',
    website: 'https://www.mckesson.com'
  },
  {
    id: 'cardinal-health',
    name: 'Cardinal Health',
    category: 'inventory',
    description: 'Healthcare inventory and distribution',
    website: 'https://www.cardinalhealth.com'
  },
  {
    id: 'omnicell',
    name: 'Omnicell',
    category: 'inventory',
    description: 'Automated medication and supply dispensing',
    website: 'https://www.omnicell.com'
  },
  {
    id: 'medline',
    name: 'Medline',
    category: 'inventory',
    description: 'Medical supplies and inventory solutions',
    website: 'https://www.medline.com'
  },

  // Custom
  {
    id: 'rest-api',
    name: 'Custom REST API',
    category: 'custom',
    description: 'Connect any custom REST endpoint with flexible configuration'
  },
  {
    id: 'graphql',
    name: 'Custom GraphQL',
    category: 'custom',
    description: 'GraphQL API integration with custom schema support'
  },
  {
    id: 'soap',
    name: 'Custom SOAP API',
    category: 'custom',
    description: 'Legacy SOAP web service integration'
  }
];
