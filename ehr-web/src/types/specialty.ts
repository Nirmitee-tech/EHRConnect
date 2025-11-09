/**
 * Specialty Pack Types
 * Type definitions for the specialty pack system
 */

/**
 * Navigation section for specialty sidebar
 */
export interface SpecialtyNavigationSection {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  category: 'general' | 'clinical' | 'administrative' | 'financial' | 'specialty';
  order?: number;
  count?: number | null;
  badge?: string;
  hidden?: boolean;
  componentName?: string; // Name of the component to render (e.g., 'PrenatalOverview')
}

/**
 * Navigation configuration for a specialty pack
 */
export interface SpecialtyNavigation {
  sections: SpecialtyNavigationSection[];
  replaceSections?: boolean; // If true, replace all sections; if false, merge with base
  mergeWith?: string; // Pack slug to merge with (e.g., 'general')
}

/**
 * Episode configuration for a specialty pack
 */
export interface EpisodeConfig {
  allowConcurrent?: boolean; // Allow multiple episodes of this specialty simultaneously
  defaultState?: 'planned' | 'active' | 'on-hold';
  requiredFields?: string[]; // Required metadata fields for episodes
  stateTransitions?: Record<string, string[]>; // Allowed state transitions
}

/**
 * Enhanced Specialty Pack with navigation and episode config
 * All new fields are optional for backwards compatibility
 */
export interface SpecialtyPack {
  slug: string;
  version: string;
  name?: string;
  description?: string;
  category?: 'clinical' | 'administrative' | 'financial' | 'specialty';
  icon?: string; // Lucide icon name
  color?: string; // Hex color for UI elements
  dependencies?: string[];
  templates: SpecialtyTemplate[];
  visitTypes: SpecialtyVisitType[];
  workflows?: unknown;
  reports?: unknown;
  featureFlags?: Record<string, boolean>;
  devices?: unknown[];

  // Phase 2 enhancements (optional for backwards compatibility)
  navigation?: SpecialtyNavigation;
  episodeConfig?: EpisodeConfig;
}

export interface SpecialtyTemplate {
  path: string;
  schema: FHIRQuestionnaire;
}

export interface FHIRQuestionnaire {
  resourceType: 'Questionnaire';
  id: string;
  name: string;
  title: string;
  status: 'active' | 'draft' | 'retired';
  version: string;
  description?: string;
  item: QuestionnaireItem[];
}

export interface QuestionnaireItem {
  linkId: string;
  text: string;
  type: 'group' | 'string' | 'text' | 'integer' | 'decimal' | 'boolean' | 'date' | 'dateTime' | 'time' | 'choice';
  required?: boolean;
  item?: QuestionnaireItem[];
  answerOption?: Array<{ valueString: string }>;
}

export interface SpecialtyVisitType {
  code: string;
  name: string;
  description?: string;
  duration_min: number;
  buffer_before_min?: number;
  buffer_after_min?: number;
  required_roles?: string[];
  required_resources?: string[];
  category?: string;
  color?: string;
  intake_template_id?: string | null;
  recurrence_template?: RecurrenceTemplate;
}

export interface RecurrenceTemplate {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  count?: number;
  until?: string;
}

export interface PackSetting {
  id: string;
  org_id: string;
  pack_slug: string;
  pack_version: string;
  enabled: boolean;
  scope: 'org' | 'location' | 'department' | 'service_line';
  scope_ref_id: string | null;
  overrides: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PackAudit {
  id: string;
  org_id: string;
  pack_slug: string;
  pack_version: string;
  action: 'enabled' | 'disabled' | 'updated' | 'rollback';
  actor_id: string;
  actor_name?: string;
  created_at: string;
  scope?: string;
  scope_ref_id?: string;
  metadata?: Record<string, unknown>;
}

export interface SpecialtyContext {
  orgId: string;
  locationId?: string | null;
  departmentId?: string | null;
  scope: 'org' | 'location' | 'department' | 'service_line';
  packs: SpecialtyPack[];
}

export interface PatientEpisode {
  id: string;
  patient_id: string;
  org_id: string;
  specialty_slug: string;
  episode_state: 'planned' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  start_at: string;
  end_at?: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  primary_practitioner_id?: string;
  care_team_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface EnablePackRequest {
  slug: string;
  version?: string;
  scope?: 'org' | 'location' | 'department' | 'service_line';
  scopeRefId?: string | null;
  overrides?: Record<string, unknown>;
}

export interface DisablePackRequest {
  slug: string;
  scope?: 'org' | 'location' | 'department' | 'service_line';
  scopeRefId?: string | null;
}
