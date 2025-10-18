// FHIR R4 Patient and Organization Types

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    lastUpdated?: string;
    versionId?: string;
  };
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  system?: string;
  value?: string;
  period?: {
    start?: string;
    end?: string;
  };
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: {
    start?: string;
    end?: string;
  };
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: {
    start?: string;
    end?: string;
  };
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: {
    start?: string;
    end?: string;
  };
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceased?: boolean | string;
  address?: FHIRAddress[];
  maritalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  managingOrganization?: FHIRReference;
  contact?: Array<{
    relationship?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
    address?: FHIRAddress;
    gender?: 'male' | 'female' | 'other' | 'unknown';
  }>;
  communication?: Array<{
    language: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    preferred?: boolean;
  }>;
}

export interface FHIROrganization extends FHIRResource {
  resourceType: 'Organization';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  type?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  name?: string;
  alias?: string[];
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
  partOf?: FHIRReference;
  contact?: Array<{
    purpose?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
    address?: FHIRAddress;
  }>;
}

// Search result bundle type
export interface FHIRBundle<T = FHIRResource> {
  resourceType: 'Bundle';
  id?: string;
  meta?: {
    lastUpdated?: string;
  };
  type: 'searchset' | 'collection' | 'transaction' | 'batch';
  total?: number;
  link?: Array<{
    relation: string;
    url: string;
  }>;
  entry?: Array<{
    fullUrl?: string;
    resource: T;
    search?: {
      mode: 'match' | 'include';
      score?: number;
    };
  }>;
}

// Utility types for patient management
export interface PatientSummary {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  mrn?: string;
  facilityName?: string;
  facilityId?: string;
  active: boolean;
  lastUpdated?: string;
  age?: number;
  phone?: string;
  email?: string;
}

export interface FacilitySummary {
  id: string;
  name: string;
  type?: string;
  active: boolean;
  parentOrgId?: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  resourceType: string;
  resourceId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  userId: string;
  facilityId: string;
  timestamp: string;
  changes?: Record<string, unknown>;
}
