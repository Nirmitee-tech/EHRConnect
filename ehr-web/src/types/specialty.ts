/**
 * Specialty Pack Types
 * Type definitions for the specialty pack system
 */

export interface SpecialtyPack {
  slug: string;
  version: string;
  name?: string;
  description?: string;
  dependencies?: string[];
  templates: SpecialtyTemplate[];
  visitTypes: SpecialtyVisitType[];
  workflows?: any;
  reports?: any;
  featureFlags?: Record<string, boolean>;
  devices?: any[];
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
  overrides: Record<string, any>;
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
  metadata?: Record<string, any>;
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
  metadata: Record<string, any>;
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
  overrides?: Record<string, any>;
}

export interface DisablePackRequest {
  slug: string;
  scope?: 'org' | 'location' | 'department' | 'service_line';
  scopeRefId?: string | null;
}
