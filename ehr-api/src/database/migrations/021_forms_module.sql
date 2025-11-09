-- Forms Module: Questionnaire Management
-- Stores metadata for form templates, with full FHIR resources in Medplum

-- Form Themes Table (must be created first due to FK in form_templates)
CREATE TABLE IF NOT EXISTS form_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,

  name VARCHAR(100) NOT NULL,
  is_global BOOLEAN DEFAULT false, -- Global themes available to all orgs

  -- Theme configuration (JSON)
  config JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#3b82f6",
      "background": "#ffffff",
      "form": "#f9fafb",
      "toolbar": "#1f2937"
    },
    "fonts": {
      "family": "Inter, sans-serif",
      "size": "14px"
    },
    "inputs": {
      "accent": "#3b82f6",
      "text": "#1f2937",
      "background": "#ffffff"
    },
    "buttons": {
      "submit": "#3b82f6",
      "submitText": "#ffffff"
    },
    "branding": {
      "logoUrl": null,
      "logoPosition": "top-right"
    }
  }'::jsonb,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_theme_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Form Templates Table (Metadata)
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Basic metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired', 'archived')),
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',

  -- FHIR data (stored in PostgreSQL)
  questionnaire JSONB, -- Full FHIR Questionnaire resource
  fhir_url TEXT, -- Canonical URL

  -- Categorization
  category VARCHAR(50), -- clinical, administrative, intake, assessment, etc.
  tags TEXT[], -- Searchable tags
  specialty_slug VARCHAR(100), -- Optional link to specialty pack

  -- Theme and presentation
  theme_id UUID REFERENCES form_themes(id),

  -- Lifecycle metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  archived_at TIMESTAMP,

  -- Version control
  parent_version_id UUID REFERENCES form_templates(id),
  is_latest_version BOOLEAN DEFAULT true,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  CONSTRAINT fk_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Form Responses Table (Light metadata, full response in Medplum)
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Links
  form_template_id UUID NOT NULL REFERENCES form_templates(id),
  response JSONB, -- Full FHIR QuestionnaireResponse resource

  -- Context
  patient_id UUID,
  encounter_id UUID,
  episode_id UUID,
  practitioner_id UUID,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'amended', 'entered-in-error')),

  -- Submission metadata
  submitted_by UUID,
  submitted_at TIMESTAMP,

  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_response_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_response_template FOREIGN KEY (form_template_id) REFERENCES form_templates(id)
);

-- Form Population Rules (for $populate operation)
CREATE TABLE IF NOT EXISTS form_population_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,

  -- Rule definition
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- Patient, Observation, Condition, etc.
  source_query TEXT, -- FHIRPath or SQL query
  target_link_id VARCHAR(255) NOT NULL, -- Questionnaire item linkId

  -- Transformation
  transform_expression TEXT, -- FHIRPath for data transformation

  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Form Extraction Rules (for $extract operation)
CREATE TABLE IF NOT EXISTS form_extraction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,

  -- Rule definition
  name VARCHAR(255) NOT NULL,
  source_link_id VARCHAR(255) NOT NULL, -- Questionnaire item linkId
  target_resource_type VARCHAR(50) NOT NULL, -- Observation, Condition, etc.

  -- Mapping
  fhir_path TEXT, -- Where to place the value in target resource
  value_transformation TEXT, -- FHIRPath expression for transformation

  -- Conditions
  condition_expression TEXT, -- When to apply this rule

  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Form Audit Log
CREATE TABLE IF NOT EXISTS form_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  entity_type VARCHAR(50) NOT NULL, -- form_template, form_response, form_theme
  entity_id UUID NOT NULL,

  action VARCHAR(50) NOT NULL, -- created, updated, published, archived, deleted
  actor_id UUID NOT NULL,
  actor_name VARCHAR(255),

  changes JSONB, -- JSON diff of changes
  metadata JSONB,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_audit_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_templates_org_status ON form_templates(org_id, status);
CREATE INDEX IF NOT EXISTS idx_form_templates_specialty ON form_templates(specialty_slug) WHERE specialty_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_templates_fhir_url ON form_templates(fhir_url);
CREATE INDEX IF NOT EXISTS idx_form_templates_latest ON form_templates(parent_version_id, is_latest_version);

CREATE INDEX IF NOT EXISTS idx_form_responses_template ON form_responses(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_patient ON form_responses(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_responses_encounter ON form_responses(encounter_id) WHERE encounter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_responses_status ON form_responses(org_id, status);

CREATE INDEX IF NOT EXISTS idx_form_population_rules_template ON form_population_rules(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_extraction_rules_template ON form_extraction_rules(form_template_id);

CREATE INDEX IF NOT EXISTS idx_form_audit_log_entity ON form_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_form_audit_log_org_time ON form_audit_log(org_id, created_at DESC);

-- Insert default global themes
INSERT INTO form_themes (id, name, is_global, config) VALUES
(gen_random_uuid(), 'Default', true, '{
  "colors": {
    "primary": "#3b82f6",
    "background": "#ffffff",
    "form": "#f9fafb",
    "toolbar": "#1f2937"
  },
  "fonts": {
    "family": "Inter, sans-serif",
    "size": "14px"
  },
  "inputs": {
    "accent": "#3b82f6",
    "text": "#1f2937",
    "background": "#ffffff"
  },
  "buttons": {
    "submit": "#3b82f6",
    "submitText": "#ffffff"
  }
}'::jsonb),
(gen_random_uuid(), 'NHS Style', true, '{
  "colors": {
    "primary": "#005eb8",
    "background": "#ffffff",
    "form": "#f0f4f5",
    "toolbar": "#005eb8"
  },
  "fonts": {
    "family": "Arial, sans-serif",
    "size": "16px"
  },
  "inputs": {
    "accent": "#005eb8",
    "text": "#212b32",
    "background": "#ffffff"
  },
  "buttons": {
    "submit": "#007f3b",
    "submitText": "#ffffff"
  }
}'::jsonb),
(gen_random_uuid(), 'Monochrome', true, '{
  "colors": {
    "primary": "#000000",
    "background": "#ffffff",
    "form": "#f5f5f5",
    "toolbar": "#000000"
  },
  "fonts": {
    "family": "system-ui, sans-serif",
    "size": "14px"
  },
  "inputs": {
    "accent": "#333333",
    "text": "#000000",
    "background": "#ffffff"
  },
  "buttons": {
    "submit": "#000000",
    "submitText": "#ffffff"
  }
}'::jsonb)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust based on your RBAC setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON form_templates TO ehr_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON form_responses TO ehr_app_user;
-- GRANT SELECT ON form_themes TO ehr_app_user;

COMMENT ON TABLE form_templates IS 'Form templates with full FHIR Questionnaire stored in questionnaire JSONB column.';
COMMENT ON TABLE form_themes IS 'Reusable themes for form styling and branding.';
COMMENT ON TABLE form_responses IS 'Form submissions with full FHIR QuestionnaireResponse in response JSONB column.';
COMMENT ON TABLE form_population_rules IS 'Rules for $populate operation to prefill forms with patient data.';
COMMENT ON TABLE form_extraction_rules IS 'Rules for $extract operation to convert responses to FHIR resources.';
