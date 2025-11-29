-- Migration: Add appointment purpose and automation capabilities
-- This enables intelligent booking with automated workflows

-- ============================================================================
-- APPOINTMENT PURPOSES TABLE
-- ============================================================================
-- Defines different appointment types with their automation rules
CREATE TABLE IF NOT EXISTS appointment_purposes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,

    -- Purpose details
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'preventive', 'acute', 'chronic', 'follow-up', 'specialist'

    -- Scheduling
    default_duration INTEGER DEFAULT 30, -- minutes
    buffer_time INTEGER DEFAULT 0, -- minutes between appointments
    allow_online_booking BOOLEAN DEFAULT true,
    requires_referral BOOLEAN DEFAULT false,

    -- Provider requirements
    required_provider_type VARCHAR(100), -- 'primary-care', 'specialist', 'any'
    preferred_specialties TEXT[], -- Array of specialty codes

    -- Metadata
    color VARCHAR(7), -- Hex color for calendar
    icon VARCHAR(50), -- Icon name
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_purpose_per_org UNIQUE (org_id, code)
);

CREATE INDEX idx_appointment_purposes_org ON appointment_purposes(org_id);
CREATE INDEX idx_appointment_purposes_active ON appointment_purposes(active);
CREATE INDEX idx_appointment_purposes_category ON appointment_purposes(category);

-- ============================================================================
-- APPOINTMENT AUTOMATION RULES TABLE
-- ============================================================================
-- Defines automation workflows for each appointment purpose
CREATE TABLE IF NOT EXISTS appointment_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purpose_id UUID NOT NULL REFERENCES appointment_purposes(id) ON DELETE CASCADE,

    -- Rule configuration
    trigger_event VARCHAR(50) NOT NULL, -- 'created', 'confirmed', '24h_before', 'completed'
    action_type VARCHAR(50) NOT NULL, -- 'send_form', 'send_reminder', 'order_lab', 'schedule_followup'

    -- Action configuration (JSONB for flexibility)
    action_config JSONB NOT NULL,
    -- Examples:
    -- send_form: {"form_id": "health-history", "required": true}
    -- send_reminder: {"channels": ["email", "sms"], "template_id": "reminder-1"}
    -- order_lab: {"lab_tests": ["cbc", "cmp"], "timing": "7d_before"}
    -- schedule_followup: {"days": 30, "purpose": "follow-up"}

    -- Conditions (when to apply this rule)
    conditions JSONB,
    -- Examples:
    -- {"patient_age": {"gt": 40}}
    -- {"first_visit": true}
    -- {"insurance_type": "medicare"}

    -- Priority & timing
    priority INTEGER DEFAULT 0,
    delay_minutes INTEGER DEFAULT 0, -- Delay before executing

    -- Status
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_purpose ON appointment_automation_rules(purpose_id);
CREATE INDEX idx_automation_rules_trigger ON appointment_automation_rules(trigger_event);
CREATE INDEX idx_automation_rules_active ON appointment_automation_rules(active);

-- ============================================================================
-- PRE-VISIT FORMS TABLE
-- ============================================================================
-- Defines forms to be sent before appointments
CREATE TABLE IF NOT EXISTS pre_visit_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,

    -- Form details
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Form structure (JSONB for dynamic forms)
    form_schema JSONB NOT NULL,
    -- Example:
    -- {
    --   "sections": [
    --     {
    --       "title": "Medical History",
    --       "questions": [
    --         {"id": "q1", "type": "text", "question": "Current medications?", "required": true},
    --         {"id": "q2", "type": "yes_no", "question": "Any allergies?", "required": true}
    --       ]
    --     }
    --   ]
    -- }

    -- Form settings
    estimated_minutes INTEGER DEFAULT 10,
    required BOOLEAN DEFAULT false,
    allow_partial_save BOOLEAN DEFAULT true,

    -- Version control
    version VARCHAR(20) DEFAULT '1.0',

    -- Status
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_form_code_per_org UNIQUE (org_id, code)
);

CREATE INDEX idx_pre_visit_forms_org ON pre_visit_forms(org_id);
CREATE INDEX idx_pre_visit_forms_active ON pre_visit_forms(active);

-- ============================================================================
-- FORM RESPONSES TABLE
-- ============================================================================
-- Stores patient responses to pre-visit forms
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    form_id UUID NOT NULL REFERENCES pre_visit_forms(id),
    appointment_id UUID, -- Can be NULL if form sent before appointment created
    patient_id UUID NOT NULL,

    -- Response data
    responses JSONB NOT NULL,
    -- Example:
    -- {
    --   "q1": {"answer": "Metformin 500mg daily", "answered_at": "2025-10-26T10:30:00Z"},
    --   "q2": {"answer": "yes", "details": "Penicillin", "answered_at": "2025-10-26T10:31:00Z"}
    -- }

    -- Status
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'expired'
    completion_percentage INTEGER DEFAULT 0,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_responses_form ON form_responses(form_id);
CREATE INDEX idx_form_responses_appointment ON form_responses(appointment_id);
CREATE INDEX idx_form_responses_patient ON form_responses(patient_id);
CREATE INDEX idx_form_responses_status ON form_responses(status);

-- ============================================================================
-- AUTOMATION EXECUTION LOG TABLE
-- ============================================================================
-- Tracks execution of automation rules for auditing
CREATE TABLE IF NOT EXISTS automation_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    rule_id UUID NOT NULL REFERENCES appointment_automation_rules(id),
    appointment_id UUID NOT NULL,

    -- Execution details
    trigger_event VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL, -- 'pending', 'executing', 'completed', 'failed'
    error_message TEXT,

    -- Result
    result JSONB,
    -- Example:
    -- {
    --   "form_sent": true,
    --   "recipient": "patient@example.com",
    --   "sent_at": "2025-10-26T10:00:00Z"
    -- }

    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_automation_log_rule ON automation_execution_log(rule_id);
CREATE INDEX idx_automation_log_appointment ON automation_execution_log(appointment_id);
CREATE INDEX idx_automation_log_status ON automation_execution_log(status);
CREATE INDEX idx_automation_log_scheduled ON automation_execution_log(scheduled_at);

-- ============================================================================
-- SMART SYMPTOM MAPPING TABLE
-- ============================================================================
-- Maps symptoms to recommended appointment purposes (for AI suggestions)
CREATE TABLE IF NOT EXISTS symptom_to_purpose_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,

    -- Symptom
    symptom_keywords TEXT[], -- Array of keywords to match
    symptom_category VARCHAR(100), -- 'respiratory', 'cardiac', 'digestive', etc.

    -- Recommended purpose
    purpose_id UUID NOT NULL REFERENCES appointment_purposes(id),
    confidence_score DECIMAL(3,2) DEFAULT 0.8, -- 0.0 to 1.0

    -- Additional info
    urgency_level VARCHAR(50), -- 'routine', 'urgent', 'emergency'
    recommended_timeframe VARCHAR(100), -- 'within_24h', 'within_week', 'within_month'

    -- Provider routing
    preferred_specialty VARCHAR(100),

    -- Status
    active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_symptom_mapping_org ON symptom_to_purpose_mapping(org_id);
CREATE INDEX idx_symptom_mapping_purpose ON symptom_to_purpose_mapping(purpose_id);
CREATE INDEX idx_symptom_mapping_keywords ON symptom_to_purpose_mapping USING GIN (symptom_keywords);

-- ============================================================================
-- SEED DEFAULT PURPOSES & AUTOMATION RULES
-- ============================================================================

-- Note: We'll create a separate seeder script for default data
-- This migration only creates the schema

COMMENT ON TABLE appointment_purposes IS 'Defines appointment types with automation configurations';
COMMENT ON TABLE appointment_automation_rules IS 'Automation workflows triggered by appointment lifecycle events';
COMMENT ON TABLE pre_visit_forms IS 'Dynamic forms sent to patients before appointments';
COMMENT ON TABLE form_responses IS 'Patient responses to pre-visit forms';
COMMENT ON TABLE automation_execution_log IS 'Audit log of automation rule executions';
COMMENT ON TABLE symptom_to_purpose_mapping IS 'AI-powered symptom to appointment type recommendations';
