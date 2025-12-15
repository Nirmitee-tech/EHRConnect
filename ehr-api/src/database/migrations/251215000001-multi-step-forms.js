'use strict';

const { Pool } = require('pg');

/**
 * Migration: Multi-Step Forms Enhancement
 *
 * Adds support for multi-step form builder with:
 * - form_steps: Step definitions with navigation config
 * - form_progress: User progress tracking with auto-save
 * - visit_templates: Clinical trial visit definitions (eCRF)
 * - form_templates updates: Multi-step flags and config
 *
 * FHIR Compliance:
 * - Uses Questionnaire.item[].type: "group" for steps
 * - Extensions for step-order and navigation
 * - QuestionnaireResponse partial storage in form_progress
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
-- ============================================================================
-- Multi-Step Forms Enhancement
-- ============================================================================

-- Form Steps Table
-- Stores individual steps in multi-step forms with navigation and validation config
CREATE TABLE IF NOT EXISTS form_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id UUID NOT NULL,
  org_id UUID NOT NULL,

  -- Step definition
  step_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Navigation configuration
  navigation_config JSONB NOT NULL DEFAULT '{
    "allowBack": true,
    "allowSkip": false,
    "showProgress": true
  }'::jsonb,

  -- Validation configuration
  validation_config JSONB NOT NULL DEFAULT '{
    "validateOnNext": true,
    "validateOnBlur": false,
    "required": false
  }'::jsonb,

  -- FHIR Questionnaire items for this step (array of item objects)
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Conditional logic (when to show this step)
  conditional_logic JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,

  -- Constraints
  CONSTRAINT fk_form_step_template FOREIGN KEY (form_template_id)
    REFERENCES form_templates(id) ON DELETE CASCADE,
  CONSTRAINT fk_form_step_org FOREIGN KEY (org_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT unique_form_step_order UNIQUE (form_template_id, step_order),
  CONSTRAINT check_step_order_positive CHECK (step_order > 0)
);

-- Form Progress Table
-- Tracks user progress through multi-step forms with auto-save support
CREATE TABLE IF NOT EXISTS form_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,

  -- Progress tracking
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],

  -- Partial response data (FHIR QuestionnaireResponse structure)
  step_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Session management
  session_id VARCHAR(255),
  last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Completion tracking
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  -- Context
  patient_id UUID,
  encounter_id UUID,
  episode_id UUID,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_form_progress_template FOREIGN KEY (form_template_id)
    REFERENCES form_templates(id) ON DELETE CASCADE,
  CONSTRAINT fk_form_progress_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_form_progress_org FOREIGN KEY (org_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT unique_form_progress_session UNIQUE (form_template_id, user_id, session_id),
  CONSTRAINT check_current_step_positive CHECK (current_step > 0)
);

-- Visit Templates Table
-- Clinical trial visit definitions with frequency configurations (eCRF)
CREATE TABLE IF NOT EXISTS visit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Visit identification
  trial_id VARCHAR(255) NOT NULL,
  visit_name VARCHAR(255) NOT NULL,
  visit_code VARCHAR(100),
  visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('baseline', 'interim', 'followup', 'closeout', 'unscheduled')),

  -- Scheduling
  frequency_config JSONB,
  /* Example frequency_config:
  {
    "type": "weekly",
    "interval": 4,
    "window": {
      "before": 2,
      "after": 3,
      "unit": "days"
    }
  }
  */

  -- Associated forms
  form_template_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],

  -- CDASH annotations for clinical data standards
  cdash_annotations JSONB,
  /* Example cdash_annotations:
  {
    "domain": "VS",
    "variables": ["VSDTC", "VSTEST", "VSORRES"],
    "mapping": {...}
  }
  */

  -- Display configuration
  display_order INTEGER,
  description TEXT,
  instructions TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,

  -- Constraints
  CONSTRAINT fk_visit_template_org FOREIGN KEY (org_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT unique_visit_template UNIQUE (org_id, trial_id, visit_name)
);

-- Add multi-step columns to form_templates
ALTER TABLE form_templates
  ADD COLUMN IF NOT EXISTS is_multi_step BOOLEAN DEFAULT FALSE;

ALTER TABLE form_templates
  ADD COLUMN IF NOT EXISTS step_config JSONB DEFAULT '{
    "totalSteps": 1,
    "showProgress": true,
    "allowSaveProgress": true,
    "progressBarStyle": "steps"
  }'::jsonb;

ALTER TABLE form_templates
  ADD COLUMN IF NOT EXISTS visit_template_id UUID REFERENCES visit_templates(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_steps_template ON form_steps(form_template_id, step_order);
CREATE INDEX IF NOT EXISTS idx_form_steps_org ON form_steps(org_id);

CREATE INDEX IF NOT EXISTS idx_form_progress_user_form ON form_progress(user_id, form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_progress_session ON form_progress(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_progress_patient ON form_progress(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_progress_org_updated ON form_progress(org_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_visit_templates_trial ON visit_templates(org_id, trial_id);
CREATE INDEX IF NOT EXISTS idx_visit_templates_active ON visit_templates(org_id, is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_form_templates_multi_step ON form_templates(org_id, is_multi_step) WHERE is_multi_step = TRUE;
CREATE INDEX IF NOT EXISTS idx_form_templates_visit ON form_templates(visit_template_id) WHERE visit_template_id IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE form_steps IS 'Individual steps in multi-step forms with FHIR Questionnaire.item[] stored in fields JSONB column';
COMMENT ON TABLE form_progress IS 'User progress tracking with auto-save support, stores partial QuestionnaireResponse in step_data';
COMMENT ON TABLE visit_templates IS 'Clinical trial visit definitions (eCRF) with CDASH compliance support';

COMMENT ON COLUMN form_steps.fields IS 'Array of FHIR Questionnaire.item objects for this step';
COMMENT ON COLUMN form_steps.navigation_config IS 'Step navigation rules (allowBack, allowSkip, showProgress)';
COMMENT ON COLUMN form_steps.validation_config IS 'Validation timing and requirements';

COMMENT ON COLUMN form_progress.step_data IS 'Partial FHIR QuestionnaireResponse with answers for completed steps';
COMMENT ON COLUMN form_progress.completed_steps IS 'Array of step numbers that have been completed';

COMMENT ON COLUMN visit_templates.frequency_config IS 'Visit scheduling configuration (weekly, monthly, quarterly with windows)';
COMMENT ON COLUMN visit_templates.cdash_annotations IS 'CDISC CDASH standard mappings for clinical data interchange';
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 251215000001-multi-step-forms migration...');
      await pool.query(sql);
      console.log('✅ Multi-step forms tables created successfully');
      console.log('   - form_steps table');
      console.log('   - form_progress table');
      console.log('   - visit_templates table');
      console.log('   - form_templates columns: is_multi_step, step_config, visit_template_id');
      console.log('   - All indexes created');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
-- Drop indexes first
DROP INDEX IF EXISTS idx_form_templates_visit;
DROP INDEX IF EXISTS idx_form_templates_multi_step;
DROP INDEX IF EXISTS idx_visit_templates_active;
DROP INDEX IF EXISTS idx_visit_templates_trial;
DROP INDEX IF EXISTS idx_form_progress_org_updated;
DROP INDEX IF EXISTS idx_form_progress_patient;
DROP INDEX IF EXISTS idx_form_progress_session;
DROP INDEX IF EXISTS idx_form_progress_user_form;
DROP INDEX IF EXISTS idx_form_steps_org;
DROP INDEX IF EXISTS idx_form_steps_template;

-- Remove columns from form_templates
ALTER TABLE form_templates DROP COLUMN IF EXISTS visit_template_id;
ALTER TABLE form_templates DROP COLUMN IF EXISTS step_config;
ALTER TABLE form_templates DROP COLUMN IF EXISTS is_multi_step;

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS form_progress;
DROP TABLE IF EXISTS form_steps;
DROP TABLE IF EXISTS visit_templates;
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Rolling back 251215000001-multi-step-forms migration...');
      await pool.query(sql);
      console.log('✅ Multi-step forms migration rolled back successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
