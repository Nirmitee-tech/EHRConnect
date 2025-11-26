/**
 * FHIR-based Episode Types
 * Based on FHIR R4 EpisodeOfCare resource
 * @see https://www.hl7.org/fhir/episodeofcare.html
 */

/**
 * FHIR EpisodeOfCare Status
 * @see https://www.hl7.org/fhir/valueset-episode-of-care-status.html
 */
export type EpisodeStatus =
  | 'planned'
  | 'waitlist'
  | 'active'
  | 'onhold'
  | 'finished'
  | 'cancelled'
  | 'entered-in-error';

/**
 * FHIR Reference
 */
export interface FHIRReference {
  reference: string; // e.g., "Patient/123" or "Practitioner/456"
  type?: string;
  display?: string;
}

/**
 * FHIR Period
 */
export interface FHIRPeriod {
  start?: string; // ISO datetime
  end?: string; // ISO datetime
}

/**
 * FHIR CodeableConcept
 */
export interface FHIRCodeableConcept {
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

/**
 * FHIR Identifier
 */
export interface FHIRIdentifier {
  system?: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
}

/**
 * Episode Status History
 */
export interface EpisodeStatusHistory {
  status: EpisodeStatus;
  period: FHIRPeriod;
}

/**
 * Episode Diagnosis
 */
export interface EpisodeDiagnosis {
  condition: FHIRReference; // Reference to Condition
  role?: FHIRCodeableConcept; // e.g., "Chief complaint", "Comorbidity"
  rank?: number; // Ranking of diagnosis (e.g., primary = 1)
}

/**
 * FHIR EpisodeOfCare Resource
 * Represents a patient's journey through a specific specialty
 */
export interface FHIREpisodeOfCare {
  resourceType: 'EpisodeOfCare';
  id: string;

  // Business identifiers
  identifier?: FHIRIdentifier[];

  // Episode status
  status: EpisodeStatus;
  statusHistory?: EpisodeStatusHistory[];

  // Episode type/specialty
  type?: FHIRCodeableConcept[]; // Specialty type (OB/GYN, Orthopedics, etc.)

  // Diagnosis
  diagnosis?: EpisodeDiagnosis[];

  // Patient reference
  patient: FHIRReference;

  // Managing organization
  managingOrganization?: FHIRReference;

  // Time period
  period?: FHIRPeriod;

  // Referral request
  referralRequest?: FHIRReference[];

  // Care manager
  careManager?: FHIRReference; // Practitioner managing the episode

  // Care team
  team?: FHIRReference[]; // References to CareTeam resources

  // Associated accounts
  account?: FHIRReference[];

  // Metadata
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
    profile?: string[];
    tag?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
}

/**
 * Simplified Episode for UI (derived from FHIR)
 */
export interface Episode {
  id: string;
  patientId: string;
  specialtySlug: string; // Our specialty pack slug
  status: EpisodeStatus;
  period: {
    start: string;
    end?: string;
  };

  // Care team
  careManager?: {
    id: string;
    name: string;
  };
  careTeam?: Array<{
    id: string;
    name: string;
    role?: string;
  }>;

  // Diagnoses
  diagnoses?: Array<{
    id: string;
    condition: string;
    isPrimary: boolean;
  }>;

  // Specialty-specific metadata
  metadata: Record<string, unknown>;

  // FHIR reference
  fhirResource?: FHIREpisodeOfCare;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Episode creation request
 */
export interface CreateEpisodeRequest {
  patientId: string;
  specialtySlug: string;
  status?: EpisodeStatus;
  startDate?: string;
  careManagerId?: string;
  careTeamIds?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Episode update request
 */
export interface UpdateEpisodeRequest {
  status?: EpisodeStatus;
  endDate?: string;
  careManagerId?: string;
  careTeamIds?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Episode query params
 */
export interface EpisodeQueryParams {
  patientId?: string;
  specialtySlug?: string;
  status?: EpisodeStatus | EpisodeStatus[];
  active?: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Episode event for tracking state changes
 */
export interface EpisodeEvent {
  episodeId: string;
  type: 'created' | 'updated' | 'status_changed' | 'closed';
  previousStatus?: EpisodeStatus;
  newStatus?: EpisodeStatus;
  timestamp: string;
  actorId: string;
  metadata?: Record<string, unknown>;
}
