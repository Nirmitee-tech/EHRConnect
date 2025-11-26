/**
 * Country-specific configuration types
 * Similar to specialty types but for country-specific features
 */

export interface CountryPack {
  countryCode: string; // ISO 3166-1 alpha-2: 'IN', 'US', 'AE'
  countryName: string; // 'India', 'United States', 'United Arab Emirates'
  region: string; // 'Asia', 'North America', 'Middle East'
  packSlug: string; // 'india', 'usa', 'uae'
  packVersion: string; // '1.0.0'
  regulatoryBody: string | null; // 'NHA', 'FDA', 'DHA'
  dataResidencyRequired: boolean;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  features: Record<string, boolean>; // Country-specific features
  modules: Record<string, CountryPackModule>; // Available modules
  overrides?: Record<string, any>;
  complianceSettings?: Record<string, any>;
}

export interface CountryPackModule {
  enabled: boolean;
  description: string;
}

export interface CountryModule {
  id: string;
  moduleCode: string; // 'abha-m1', 'abha-m2', 'va-integration'
  moduleName: string;
  moduleType: 'identity' | 'insurance' | 'integration' | 'compliance' | 'billing' | 'reporting';
  description: string;
  version: string;
  config: Record<string, any>;
  status: 'active' | 'testing' | 'disabled' | 'error';
  lastSyncAt?: string;
  componentPath: string; // Path to React component
  settingsComponentPath?: string; // Path to settings component
  requiredIntegrations?: string[];
  requiredPermissions?: string[];
  beta: boolean;
}

export interface Localization {
  language: string; // 'en', 'hi', 'ar'
  currency: string; // 'INR', 'USD', 'AED'
  timezone: string; // 'Asia/Kolkata', 'America/New_York'
  dateFormat: string; // 'DD/MM/YYYY', 'MM/DD/YYYY'
  numberFormat: string; // 'en-IN', 'en-US'
  supportedLanguages?: string[];
}

export interface CountryContext {
  orgId: string;
  countryPack: CountryPack | null;
  enabledModules: CountryModule[];
  localization: Localization;
}

export interface CountryModuleConfig {
  countryCode: string;
  moduleCode: string;
  config?: Record<string, any>;
  scope?: 'org' | 'location' | 'department';
  scopeRefId?: string | null;
}

export interface CountryPackAudit {
  id: string;
  orgId: string;
  countryCode: string;
  packSlug: string;
  packVersion: string;
  action: 'enabled' | 'disabled' | 'updated' | 'reconfigured';
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  createdAt: string;
  scope?: string;
  scopeRefId?: string | null;
  metadata: Record<string, any>;
}

// ABHA (Ayushman Bharat Health Account) specific types for India

export interface AbhaAddress {
  abhaNumber: string; // 14-digit ABHA number
  abhaAddress: string; // username@abdm (e.g., john.doe@abdm)
  name: string;
  gender: 'M' | 'F' | 'O';
  dateOfBirth: string;
  mobile?: string;
  email?: string;
  address?: {
    line: string;
    district: string;
    state: string;
    pincode: string;
  };
  profilePhoto?: string;
  kycVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AbhaM1Config {
  api_endpoint: string;
  client_id: string;
  client_secret?: string; // Sensitive, won't be returned from API
  mode: 'sandbox' | 'production';
}

export interface AbhaM2Config {
  hip_id: string; // Health Information Provider ID
  api_endpoint: string;
  mode: 'sandbox' | 'production';
}

export interface AbhaM3Config {
  cm_id: string; // Consent Manager ID
  api_endpoint: string;
  auto_approve: boolean;
  consent_validity_days: number;
}

export interface AbhaConsentRequest {
  id: string;
  patientId: string;
  patientAbhaAddress: string;
  requesterId: string;
  requesterName: string;
  purpose: 'CAREMGT' | 'BTG' | 'PUBHLTH' | 'HPAYMT' | 'DSRCH' | 'PATRQT';
  hiTypes: string[]; // 'DiagnosticReport', 'Prescription', 'DischargeSummary', etc.
  dateRangeFrom: string;
  dateRangeTo: string;
  expiryDate: string;
  status: 'REQUESTED' | 'GRANTED' | 'DENIED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
  grantedAt?: string;
  deniedAt?: string;
  revokedAt?: string;
}

export interface AbhaHealthRecord {
  id: string;
  careContextReference: string;
  date: string;
  content: string;
  contentType: string; // 'application/pdf', 'application/fhir+json'
  checksum: string;
}

// Props for country-specific components

export interface CountryModuleComponentProps {
  orgId: string;
  patientId?: string;
  practitionerId?: string;
  config: Record<string, any>;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface CountryModuleSettingsProps {
  orgId: string;
  moduleCode: string;
  currentConfig: Record<string, any>;
  onSave: (config: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}
