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
  photo?: Array<{
    contentType?: string;
    data?: string;
    url?: string;
  }>;
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

export interface FHIRRelatedPerson extends FHIRResource {
  resourceType: 'RelatedPerson';
  patient: FHIRReference;
  relationship?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
}

export interface FHIRCoverage extends FHIRResource {
  resourceType: 'Coverage';
  status?: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subscriber?: FHIRReference & { display?: string };
  subscriberId?: string;
  beneficiary: FHIRReference;
  relationship?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  period?: {
    start?: string;
    end?: string;
  };
  payor?: FHIRReference[];
  class?: Array<{
    type: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
      text?: string;
    };
    value: string;
    name?: string;
  }>;
  extension?: Array<{
    url: string;
    valueAttachment?: {
      contentType?: string;
      data?: string;
      url?: string;
    };
    valueBoolean?: boolean;
    valueString?: string;
  }>;
}

export interface FHIRConsent extends FHIRResource {
  resourceType: 'Consent';
  status: 'draft' | 'proposed' | 'active' | 'rejected' | 'inactive' | 'entered-in-error';
  category: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  patient: FHIRReference;
  dateTime?: string;
  performer?: FHIRReference[];
  organization?: FHIRReference[];
  provision?: {
    type?: 'deny' | 'permit';
    period?: {
      start?: string;
      end?: string;
    };
    code?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
  };
  extension?: Array<{
    url: string;
    valueBoolean?: boolean;
    valueCode?: string;
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

// FHIR Communication Resource for Clinical and Patient Instructions
export interface FHIRCommunication extends FHIRResource {
  resourceType: 'Communication';
  identifier?: FHIRIdentifier[];
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  subject?: FHIRReference; // Patient reference
  encounter?: FHIRReference; // Encounter reference
  sent?: string; // DateTime
  received?: string; // DateTime
  recipient?: FHIRReference[]; // Who the communication is for
  sender?: FHIRReference; // Who sent the communication
  payload?: Array<{
    contentString?: string;
    contentAttachment?: {
      contentType?: string;
      data?: string;
      url?: string;
      title?: string;
    };
  }>;
  note?: Array<{
    authorReference?: FHIRReference;
    time?: string;
    text: string;
  }>;
}

// FHIR FamilyMemberHistory Resource for Family Health History
export interface FHIRCodeableConcept {
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface FHIRAge {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRRange {
  low?: {
    value?: number;
    unit?: string;
  };
  high?: {
    value?: number;
    unit?: string;
  };
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRAnnotation {
  authorReference?: FHIRReference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface FHIRFamilyMemberHistory extends FHIRResource {
  resourceType: 'FamilyMemberHistory';
  identifier?: FHIRIdentifier[];
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  status: 'partial' | 'completed' | 'entered-in-error' | 'health-unknown';
  dataAbsentReason?: FHIRCodeableConcept;
  patient: FHIRReference; // Patient reference (required)
  date?: string; // DateTime when history was recorded
  name?: string; // Name of family member
  relationship: FHIRCodeableConcept; // Relationship to patient (required)
  sex?: FHIRCodeableConcept; // Gender of family member
  bornPeriod?: FHIRPeriod;
  bornDate?: string;
  bornString?: string;
  ageAge?: FHIRAge;
  ageRange?: FHIRRange;
  ageString?: string;
  estimatedAge?: boolean;
  deceasedBoolean?: boolean;
  deceasedAge?: FHIRAge;
  deceasedRange?: FHIRRange;
  deceasedDate?: string;
  deceasedString?: string;
  reasonCode?: FHIRCodeableConcept[];
  reasonReference?: FHIRReference[];
  note?: FHIRAnnotation[];
  condition?: Array<{
    code: FHIRCodeableConcept; // Condition suffered by family member
    outcome?: FHIRCodeableConcept; // Result of condition
    contributedToDeath?: boolean;
    onsetAge?: FHIRAge;
    onsetRange?: FHIRRange;
    onsetPeriod?: FHIRPeriod;
    onsetString?: string;
    note?: FHIRAnnotation[];
  }>;
}
