/**
 * Forms Module Types
 * Type definitions for the Questionnaire/Forms Builder system
 */

// ============================================================================
// FHIR Questionnaire Types (Extended from FHIR R4)
// ============================================================================

export type QuestionnaireStatus = 'draft' | 'active' | 'retired' | 'archived';

export type QuestionnaireItemType =
  | 'group'
  | 'display'
  | 'boolean'
  | 'decimal'
  | 'integer'
  | 'date'
  | 'dateTime'
  | 'time'
  | 'string'
  | 'text'
  | 'url'
  | 'choice'
  | 'open-choice'
  | 'attachment'
  | 'reference'
  | 'quantity';

export interface QuestionnaireItemAnswerOption {
  valueString?: string;
  valueCoding?: {
    system?: string;
    code: string;
    display: string;
  };
  valueInteger?: number;
  valueDate?: string;
  initialSelected?: boolean;
}

export interface QuestionnaireItemEnableWhen {
  question: string; // linkId of question
  operator: 'exists' | '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in';
  answerBoolean?: boolean;
  answerDecimal?: number;
  answerInteger?: number;
  answerDate?: string;
  answerDateTime?: string;
  answerTime?: string;
  answerString?: string;
  answerCoding?: QuestionnaireItemAnswerOption['valueCoding'];
}

export interface QuestionnaireItem {
  linkId: string;
  definition?: string;
  code?: Array<{
    system?: string;
    code: string;
    display?: string;
  }>;
  prefix?: string;
  text?: string;
  type: QuestionnaireItemType;
  enableWhen?: QuestionnaireItemEnableWhen[];
  enableBehavior?: 'all' | 'any';
  required?: boolean;
  repeats?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  answerValueSet?: string;
  answerOption?: QuestionnaireItemAnswerOption[];
  initial?: Array<{
    valueBoolean?: boolean;
    valueDecimal?: number;
    valueInteger?: number;
    valueDate?: string;
    valueDateTime?: string;
    valueTime?: string;
    valueString?: string;
    valueUri?: string;
    valueAttachment?: unknown;
    valueCoding?: QuestionnaireItemAnswerOption['valueCoding'];
    valueQuantity?: {
      value: number;
      unit?: string;
      system?: string;
      code?: string;
    };
    valueReference?: {
      reference: string;
      display?: string;
    };
  }>;
  item?: QuestionnaireItem[];

  // SDC Extensions
  extension?: Array<{
    url: string;
    valueString?: string;
    valueInteger?: number;
    valueBoolean?: boolean;
    valueCode?: string;
    valueExpression?: {
      language: string;
      expression: string;
    };
  }>;
}

export interface FHIRQuestionnaire {
  resourceType: 'Questionnaire';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  url?: string;
  identifier?: Array<{
    system?: string;
    value: string;
  }>;
  version?: string;
  name?: string;
  title: string;
  derivedFrom?: string[];
  status: QuestionnaireStatus;
  experimental?: boolean;
  subjectType?: string[];
  date?: string;
  publisher?: string;
  description?: string;
  useContext?: unknown[];
  jurisdiction?: unknown[];
  purpose?: string;
  copyright?: string;
  approvalDate?: string;
  lastReviewDate?: string;
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  code?: Array<{
    system?: string;
    code: string;
    display?: string;
  }>;
  item: QuestionnaireItem[];

  // SDC Extensions at Questionnaire level
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueCode?: string;
  }>;
}

// ============================================================================
// FHIR QuestionnaireResponse Types
// ============================================================================

export type QuestionnaireResponseStatus =
  | 'in-progress'
  | 'completed'
  | 'amended'
  | 'entered-in-error'
  | 'stopped';

export interface QuestionnaireResponseItemAnswer {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueString?: string;
  valueUri?: string;
  valueAttachment?: {
    contentType?: string;
    data?: string;
    url?: string;
    size?: number;
    title?: string;
  };
  valueCoding?: {
    system?: string;
    version?: string;
    code: string;
    display?: string;
  };
  valueQuantity?: {
    value: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueReference?: {
    reference: string;
    display?: string;
  };
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseItem {
  linkId: string;
  definition?: string;
  text?: string;
  answer?: QuestionnaireResponseItemAnswer[];
  item?: QuestionnaireResponseItem[];
}

export interface FHIRQuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  identifier?: {
    system?: string;
    value: string;
  };
  basedOn?: Array<{
    reference: string;
  }>;
  partOf?: Array<{
    reference: string;
  }>;
  questionnaire: string; // Canonical URL of the Questionnaire
  status: QuestionnaireResponseStatus;
  subject?: {
    reference: string;
    display?: string;
  };
  encounter?: {
    reference: string;
  };
  authored?: string;
  author?: {
    reference: string;
    display?: string;
  };
  source?: {
    reference: string;
  };
  item?: QuestionnaireResponseItem[];
}

// ============================================================================
// Form Template Metadata (PostgreSQL)
// ============================================================================

export interface FormTemplate {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  status: QuestionnaireStatus;
  version: string;
  fhir_questionnaire_id?: string; // Medplum resource ID
  fhir_url?: string; // Canonical URL
  category?: string;
  tags?: string[];
  specialty_slug?: string;
  theme_id?: string;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
  parent_version_id?: string;
  is_latest_version: boolean;
  usage_count: number;
  last_used_at?: string;
}

// ============================================================================
// Form Theme
// ============================================================================

export interface FormThemeColors {
  primary: string;
  background: string;
  form: string;
  toolbar: string;
}

export interface FormThemeFonts {
  family: string;
  size: string;
}

export interface FormThemeInputs {
  accent: string;
  text: string;
  background: string;
}

export interface FormThemeButtons {
  submit: string;
  submitText: string;
}

export interface FormThemeBranding {
  logoUrl?: string | null;
  logoPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface FormThemeConfig {
  colors: FormThemeColors;
  fonts: FormThemeFonts;
  inputs: FormThemeInputs;
  buttons: FormThemeButtons;
  branding?: FormThemeBranding;
}

export interface FormTheme {
  id: string;
  org_id?: string;
  name: string;
  is_global: boolean;
  config: FormThemeConfig;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Form Response Metadata
// ============================================================================

export interface FormResponse {
  id: string;
  org_id: string;
  form_template_id: string;
  fhir_response_id?: string; // Medplum QuestionnaireResponse ID
  patient_id?: string;
  encounter_id?: string;
  episode_id?: string;
  practitioner_id?: string;
  status: QuestionnaireResponseStatus;
  submitted_by?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Population and Extraction Rules
// ============================================================================

export interface FormPopulationRule {
  id: string;
  form_template_id: string;
  name: string;
  source_type: string; // Patient, Observation, Condition, etc.
  source_query?: string; // FHIRPath or SQL query
  target_link_id: string; // Questionnaire item linkId
  transform_expression?: string; // FHIRPath for transformation
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormExtractionRule {
  id: string;
  form_template_id: string;
  name: string;
  source_link_id: string; // Questionnaire item linkId
  target_resource_type: string; // Observation, Condition, etc.
  fhir_path?: string; // Where to place value in target resource
  value_transformation?: string; // FHIRPath expression
  condition_expression?: string; // When to apply rule
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Form Builder UI Types
// ============================================================================

export type ComponentCategory =
  | 'input-fields'
  | 'selection'
  | 'complex'
  | 'text-display'
  | 'media'
  | 'advanced'
  | 'structural'
  | 'fhir-specific';

export interface FormComponentDefinition {
  id: string;
  category: ComponentCategory;
  type: QuestionnaireItemType;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  defaultProps: Partial<QuestionnaireItem>;
}

export interface FormBuilderState {
  questionnaire: FHIRQuestionnaire;
  selectedItemLinkId?: string;
  isDirty: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  linkId?: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateFormTemplateRequest {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  specialty_slug?: string;
  theme_id?: string;
  questionnaire?: FHIRQuestionnaire; // If importing
}

export interface UpdateFormTemplateRequest {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  theme_id?: string;
  questionnaire?: FHIRQuestionnaire;
}

export interface PublishFormTemplateRequest {
  version?: string;
}

export interface FormTemplateListResponse {
  templates: FormTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FormTemplateDetailResponse {
  template: FormTemplate;
  questionnaire: FHIRQuestionnaire;
  theme?: FormTheme;
  populationRules?: FormPopulationRule[];
  extractionRules?: FormExtractionRule[];
}

// ============================================================================
// SDC Operations
// ============================================================================

export interface PopulateRequest {
  questionnaire: string; // URL or ID
  subject?: string; // Patient reference
  context?: Array<{
    name: string;
    content: unknown; // FHIR resource
  }>;
}

export interface PopulateResponse {
  questionnaire: FHIRQuestionnaire;
  response: FHIRQuestionnaireResponse;
}

export interface ExtractRequest {
  questionnaireResponse: FHIRQuestionnaireResponse;
}

export interface ExtractResponse {
  resources: unknown[]; // Array of FHIR resources
}

// ============================================================================
// Form Preview/Render Types
// ============================================================================

export interface FormRenderContext {
  mode: 'builder' | 'preview' | 'fill' | 'view';
  theme?: FormTheme;
  patient?: {
    id: string;
    name: string;
  };
  encounter?: {
    id: string;
    type: string;
  };
  readOnly?: boolean;
  showValidation?: boolean;
  onSubmit?: (response: FHIRQuestionnaireResponse) => void | Promise<void>;
}

// ============================================================================
// Audit Log
// ============================================================================

export interface FormAuditLog {
  id: string;
  org_id: string;
  entity_type: 'form_template' | 'form_response' | 'form_theme';
  entity_id: string;
  action: 'created' | 'updated' | 'published' | 'archived' | 'deleted';
  actor_id: string;
  actor_name?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
}
