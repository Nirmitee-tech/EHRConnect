const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Migration: Create Tasks Management System
-- Description: FHIR-compliant task management system with pools, subtasks, comments, and audit logs
-- FHIR Spec: https://www.hl7.org/fhir/task.html

-- ============================================
-- TASK POOLS
-- ============================================
CREATE TABLE IF NOT EXISTS task_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Default assignee when task assigned to pool
  default_assignee_id UUID NOT NULL REFERENCES users(id),

  -- Pool settings
  settings JSONB DEFAULT '{
    "auto_assignment": false,
    "show_in_all_queues": false,
    "allow_claiming": true,
    "workload_balancing": false
  }'::jsonb,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),

  CONSTRAINT unique_pool_name_per_org UNIQUE (org_id, name)
);

-- ============================================
-- TASK POOL MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS task_pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES task_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Member role in pool
  role VARCHAR(50) DEFAULT 'member', -- member, lead, viewer

  -- Workload settings (placeholder for future workload balancing)
  max_concurrent_tasks INTEGER,
  is_available BOOLEAN DEFAULT TRUE,

  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES users(id),

  CONSTRAINT unique_pool_member UNIQUE (pool_id, user_id),
  CONSTRAINT valid_pool_role CHECK (role IN ('member', 'lead', 'viewer'))
);

-- ============================================
-- TASKS CORE TABLE (FHIR-compliant)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization & Tenant
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- FHIR Task fields
  identifier VARCHAR(255) UNIQUE, -- FHIR identifier
  intent VARCHAR(50) NOT NULL DEFAULT 'order', -- proposal, plan, order, original-order, reflex-order, filler-order, instance-order, option
  status VARCHAR(50) NOT NULL DEFAULT 'ready', -- draft, requested, received, accepted, rejected, ready, cancelled, in-progress, on-hold, failed, completed, entered-in-error
  business_status VARCHAR(100), -- waiting_on_patient, waiting_on_provider, etc.
  priority VARCHAR(20) NOT NULL DEFAULT 'routine', -- routine, urgent, asap, stat

  -- Task content
  code VARCHAR(100), -- Task code (FHIR CodeableConcept)
  description TEXT,
  focus VARCHAR(255), -- What task is acting on (reference to resource)
  for_reference VARCHAR(255), -- Beneficiary (typically Patient reference)

  -- Context
  encounter_id UUID, -- FHIR Encounter reference
  appointment_id UUID REFERENCES fhir_appointments(id) ON DELETE SET NULL,
  based_on VARCHAR(255), -- Request fulfilled by this task
  part_of VARCHAR(255), -- Composite task

  -- Assignment (internal tracking)
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_patient_id UUID REFERENCES fhir_patients(id) ON DELETE CASCADE,
  assigned_to_pool_id UUID REFERENCES task_pools(id) ON DELETE SET NULL,
  owner_reference VARCHAR(255), -- FHIR owner reference (Practitioner, Organization, etc.)
  requester_reference VARCHAR(255), -- FHIR requester reference
  assigned_by_user_id UUID NOT NULL REFERENCES users(id),

  -- Patient context (for quick filtering)
  patient_id UUID REFERENCES fhir_patients(id) ON DELETE CASCADE,

  -- Task type and category
  task_type VARCHAR(50) NOT NULL DEFAULT 'internal', -- internal, patient, automated, form_completion, order, appointment
  category VARCHAR(100), -- medication, lab, follow_up, administrative, etc.

  -- Execution period
  execution_period_start TIMESTAMPTZ,
  execution_period_end TIMESTAMPTZ,
  authored_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Dates
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES users(id),

  -- Labels & Organization
  labels TEXT[], -- Array of label strings for filtering

  -- Performance type
  performer_type VARCHAR(100)[], -- Types of performers suitable for task

  -- Location
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Reason
  reason_code VARCHAR(100),
  reason_reference VARCHAR(255),

  -- Insurance
  insurance VARCHAR(255)[], -- Insurance plans relevant to task

  -- Notes
  note TEXT,

  -- Relevant history
  relevant_history JSONB DEFAULT '[]'::jsonb,

  -- Restrictions
  restriction JSONB, -- {repetitions: 1, period: {...}, recipient: [...]}

  -- Input/Output (FHIR Task.input and Task.output)
  input JSONB DEFAULT '[]'::jsonb, -- Task inputs
  output JSONB DEFAULT '[]'::jsonb, -- Task outputs/results

  -- Recurrence (placeholder for future)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB, -- RRULE format
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Form integration
  form_id UUID, -- Link to forms module
  form_response_id UUID, -- Link to form response

  -- Order integration
  order_id UUID, -- Link to orders
  order_type VARCHAR(50), -- lab_order, imaging_order, medication_order, etc.

  -- Visibility settings
  show_assignee BOOLEAN DEFAULT TRUE, -- Setting to show/hide who assigned

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  fhir_resource JSONB, -- Full FHIR Task resource

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Constraints
  CONSTRAINT valid_intent CHECK (intent IN ('proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'requested', 'received', 'accepted', 'rejected', 'ready', 'cancelled', 'in-progress', 'on-hold', 'failed', 'completed', 'entered-in-error')),
  CONSTRAINT valid_priority CHECK (priority IN ('routine', 'urgent', 'asap', 'stat')),
  CONSTRAINT valid_task_type CHECK (task_type IN ('internal', 'patient', 'automated', 'form_completion', 'order', 'appointment')),
  CONSTRAINT must_have_assignee CHECK (
    assigned_to_user_id IS NOT NULL OR
    assigned_to_patient_id IS NOT NULL OR
    assigned_to_pool_id IS NOT NULL
  )
);

-- ============================================
-- SUBTASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Order within parent
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_subtask_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- ============================================
-- TASK COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Author (can be staff or patient)
  author_user_id UUID REFERENCES users(id),
  author_patient_id UUID REFERENCES fhir_patients(id),
  author_type VARCHAR(20) NOT NULL, -- staff, patient, system

  comment_text TEXT NOT NULL,

  -- Mentions/Tags
  mentioned_user_ids UUID[], -- Array of user IDs mentioned

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_author_type CHECK (author_type IN ('staff', 'patient', 'system')),
  CONSTRAINT must_have_author CHECK (author_user_id IS NOT NULL OR author_patient_id IS NOT NULL)
);

-- ============================================
-- TASK HISTORY / AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- What changed
  action VARCHAR(50) NOT NULL, -- created, assigned, status_changed, completed, claimed, etc.
  changes JSONB NOT NULL, -- {field: {old: value, new: value}}

  -- Who did it
  actor_user_id UUID REFERENCES users(id),
  actor_patient_id UUID REFERENCES fhir_patients(id),
  actor_type VARCHAR(50), -- user, patient, system, automation

  -- Context
  metadata JSONB DEFAULT '{}'::jsonb,

  occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_actor_type CHECK (actor_type IN ('user', 'patient', 'system', 'automation'))
);

-- ============================================
-- TASK REMINDERS
-- ============================================
CREATE TABLE IF NOT EXISTS task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- When to remind
  remind_at TIMESTAMPTZ NOT NULL,

  -- Who to remind
  recipient_user_id UUID REFERENCES users(id),
  recipient_patient_id UUID REFERENCES fhir_patients(id),

  -- Reminder method
  method VARCHAR(50) NOT NULL DEFAULT 'in_app', -- email, sms, push, in_app

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_reminder_method CHECK (method IN ('email', 'sms', 'push', 'in_app')),
  CONSTRAINT valid_reminder_status CHECK (status IN ('pending', 'sent', 'failed'))
);

-- ============================================
-- TASK TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Template content
  title_template VARCHAR(500) NOT NULL,
  description_template TEXT,
  code VARCHAR(100),

  -- Default settings
  default_priority VARCHAR(20) DEFAULT 'routine',
  default_intent VARCHAR(50) DEFAULT 'order',
  default_due_in_hours INTEGER DEFAULT 24,
  default_category VARCHAR(100),
  default_labels TEXT[],
  default_task_type VARCHAR(50) DEFAULT 'internal',

  -- Default assignment
  default_assigned_to_pool_id UUID REFERENCES task_pools(id),

  -- Include subtasks
  subtasks JSONB DEFAULT '[]'::jsonb, -- [{title, description, sort_order}]

  -- Form linkage
  linked_form_id UUID,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),

  CONSTRAINT unique_template_name UNIQUE (org_id, name)
);

-- ============================================
-- TASK WEBHOOKS CONFIGURATION
-- ============================================
CREATE TABLE IF NOT EXISTS task_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,

  -- Events to trigger on
  events VARCHAR(50)[], -- created, updated, completed, assigned, etc.

  -- Filters
  filters JSONB DEFAULT '{}'::jsonb, -- {task_type: ['internal'], status: ['completed']}

  -- Authentication
  auth_type VARCHAR(50), -- none, basic, bearer, api_key
  auth_config JSONB, -- Encrypted auth credentials

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,

  -- Stats
  last_triggered_at TIMESTAMPTZ,
  total_triggers INTEGER DEFAULT 0,
  failed_triggers INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- ============================================
-- TASK WEBHOOK LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS task_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES task_webhooks(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,

  -- Response
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,

  -- Timing
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  success BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TASK NOTIFICATIONS (for in-app notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_patient_id UUID REFERENCES fhir_patients(id) ON DELETE CASCADE,

  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  notification_type VARCHAR(50) NOT NULL, -- task_assigned, task_updated, task_completed, task_overdue, mention, comment
  title VARCHAR(255) NOT NULL,
  message TEXT,

  -- Link/Action
  action_url TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_notification_type CHECK (notification_type IN (
    'task_assigned', 'task_updated', 'task_completed', 'task_overdue',
    'mention', 'comment', 'task_claimed', 'subtask_completed'
  )),
  CONSTRAINT must_have_recipient CHECK (recipient_user_id IS NOT NULL OR recipient_patient_id IS NOT NULL)
);

-- ============================================
-- TASK ANALYTICS CACHE (for performance)
-- ============================================
CREATE TABLE IF NOT EXISTS task_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Time period
  period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- User-specific or org-wide
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Metrics
  metrics JSONB NOT NULL, -- {total_tasks, completed, overdue, avg_completion_time, etc.}

  generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_period_type CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  CONSTRAINT unique_analytics_period UNIQUE (org_id, period_type, period_start, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Task pools
CREATE INDEX idx_task_pools_org ON task_pools(org_id) WHERE is_active = TRUE;
CREATE INDEX idx_task_pool_members_pool ON task_pool_members(pool_id) WHERE is_available = TRUE;
CREATE INDEX idx_task_pool_members_user ON task_pool_members(user_id);

-- Tasks - Primary queries
CREATE INDEX idx_tasks_org_id ON tasks(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned_to_user ON tasks(assigned_to_user_id) WHERE deleted_at IS NULL AND status NOT IN ('completed', 'cancelled');
CREATE INDEX idx_tasks_assigned_to_patient ON tasks(assigned_to_patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned_to_pool ON tasks(assigned_to_pool_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_task_type ON tasks(task_type) WHERE deleted_at IS NULL;

-- Tasks - Composite indexes for common queries
CREATE INDEX idx_tasks_user_status_due ON tasks(assigned_to_user_id, status, due_date)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_org_status_due ON tasks(org_id, status, due_date)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_patient_status ON tasks(patient_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_pool_status ON tasks(assigned_to_pool_id, status)
  WHERE deleted_at IS NULL;

-- Tasks - Overdue query optimization
CREATE INDEX idx_tasks_overdue ON tasks(due_date, status)
  WHERE status IN ('ready', 'in-progress', 'accepted')
  AND deleted_at IS NULL;

-- Tasks - Analytics indexes
CREATE INDEX idx_tasks_created_at ON tasks(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by_user_id);
CREATE INDEX idx_tasks_org_created ON tasks(org_id, created_at) WHERE deleted_at IS NULL;

-- Tasks - Integration indexes
CREATE INDEX idx_tasks_appointment ON tasks(appointment_id) WHERE appointment_id IS NOT NULL;
CREATE INDEX idx_tasks_form ON tasks(form_id) WHERE form_id IS NOT NULL;
CREATE INDEX idx_tasks_order ON tasks(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_tasks_encounter ON tasks(encounter_id) WHERE encounter_id IS NOT NULL;

-- Tasks - FHIR indexes
CREATE INDEX idx_tasks_identifier ON tasks(identifier) WHERE identifier IS NOT NULL;
CREATE INDEX idx_tasks_intent ON tasks(intent);
CREATE INDEX idx_tasks_business_status ON tasks(business_status) WHERE business_status IS NOT NULL;

-- Tasks - Labels search (GIN index for array)
CREATE INDEX idx_tasks_labels_gin ON tasks USING GIN(labels) WHERE deleted_at IS NULL;

-- Tasks - Full-text search
CREATE INDEX idx_tasks_description_search ON tasks USING GIN(to_tsvector('english', COALESCE(description, ''))) WHERE deleted_at IS NULL;

-- Tasks - FHIR resource search
CREATE INDEX idx_tasks_fhir_resource_gin ON tasks USING GIN(fhir_resource) WHERE fhir_resource IS NOT NULL;

-- Subtasks
CREATE INDEX idx_subtasks_parent ON task_subtasks(parent_task_id);
CREATE INDEX idx_subtasks_status ON task_subtasks(status);

-- Comments
CREATE INDEX idx_task_comments_task ON task_comments(task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_comments_author_user ON task_comments(author_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_comments_author_patient ON task_comments(author_patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_comments_created ON task_comments(created_at);

-- History
CREATE INDEX idx_task_history_task ON task_history(task_id);
CREATE INDEX idx_task_history_occurred_at ON task_history(occurred_at DESC);
CREATE INDEX idx_task_history_actor_user ON task_history(actor_user_id) WHERE actor_user_id IS NOT NULL;
CREATE INDEX idx_task_history_action ON task_history(action);

-- Reminders
CREATE INDEX idx_task_reminders_task ON task_reminders(task_id);
CREATE INDEX idx_task_reminders_pending ON task_reminders(remind_at, status)
  WHERE status = 'pending';

-- Templates
CREATE INDEX idx_task_templates_org ON task_templates(org_id) WHERE is_active = TRUE;

-- Webhooks
CREATE INDEX idx_task_webhooks_org ON task_webhooks(org_id) WHERE is_active = TRUE;
CREATE INDEX idx_task_webhook_logs_webhook ON task_webhook_logs(webhook_id);
CREATE INDEX idx_task_webhook_logs_task ON task_webhook_logs(task_id);
CREATE INDEX idx_task_webhook_logs_attempted ON task_webhook_logs(attempted_at DESC);

-- Notifications
CREATE INDEX idx_task_notifications_user ON task_notifications(recipient_user_id) WHERE is_read = FALSE;
CREATE INDEX idx_task_notifications_patient ON task_notifications(recipient_patient_id) WHERE is_read = FALSE;
CREATE INDEX idx_task_notifications_task ON task_notifications(task_id);
CREATE INDEX idx_task_notifications_created ON task_notifications(created_at DESC);

-- Analytics cache
CREATE INDEX idx_task_analytics_org_period ON task_analytics_cache(org_id, period_type, period_start);
CREATE INDEX idx_task_analytics_user ON task_analytics_cache(user_id) WHERE user_id IS NOT NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.last_modified = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

CREATE TRIGGER trigger_task_pools_updated_at
  BEFORE UPDATE ON task_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

CREATE TRIGGER trigger_task_subtasks_updated_at
  BEFORE UPDATE ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

CREATE TRIGGER trigger_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

CREATE TRIGGER trigger_task_webhooks_updated_at
  BEFORE UPDATE ON task_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Audit log trigger
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
  action_type VARCHAR(50);
  old_status VARCHAR(50);
  new_status VARCHAR(50);
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    changes_json := jsonb_build_object(
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine specific action based on what changed
    IF OLD.status != NEW.status THEN
      old_status := OLD.status;
      new_status := NEW.status;

      IF new_status = 'completed' THEN
        action_type := 'completed';
      ELSIF new_status = 'cancelled' THEN
        action_type := 'cancelled';
      ELSIF new_status = 'in-progress' AND old_status != 'in-progress' THEN
        action_type := 'started';
      ELSE
        action_type := 'status_changed';
      END IF;
    ELSIF OLD.assigned_to_user_id != NEW.assigned_to_user_id
       OR OLD.assigned_to_patient_id != NEW.assigned_to_patient_id
       OR OLD.assigned_to_pool_id != NEW.assigned_to_pool_id THEN
      action_type := 'reassigned';
    ELSE
      action_type := 'updated';
    END IF;

    changes_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    changes_json := to_jsonb(OLD);
  END IF;

  INSERT INTO task_history (
    task_id,
    action,
    changes,
    actor_type,
    metadata
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    action_type,
    changes_json,
    'system',
    jsonb_build_object('trigger', TG_OP)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_audit_log
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_changes();

-- Auto-complete parent task when all subtasks completed
CREATE OR REPLACE FUNCTION check_subtasks_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_subtasks INTEGER;
  completed_subtasks INTEGER;
BEGIN
  -- Count total and completed subtasks
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_subtasks, completed_subtasks
  FROM task_subtasks
  WHERE parent_task_id = NEW.parent_task_id;

  -- If all subtasks completed, update parent (placeholder for future auto-complete)
  IF total_subtasks > 0 AND total_subtasks = completed_subtasks THEN
    -- Could auto-complete parent here, but leaving as placeholder
    -- UPDATE tasks SET status = 'completed' WHERE id = NEW.parent_task_id;
    NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_subtasks_completion
  AFTER INSERT OR UPDATE OF status ON task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION check_subtasks_completion();

-- ============================================
-- COMMENTS ON TABLES
-- ============================================

COMMENT ON TABLE tasks IS 'FHIR-compliant tasks for clinical and administrative workflow management';
COMMENT ON TABLE task_pools IS 'Groups of users that can be assigned tasks collectively';
COMMENT ON TABLE task_pool_members IS 'Members of task pools with their roles and availability';
COMMENT ON TABLE task_subtasks IS 'Smaller actionable items within a task';
COMMENT ON TABLE task_comments IS 'Comments and discussions on tasks by staff and patients';
COMMENT ON TABLE task_history IS 'Complete audit trail of all task changes';
COMMENT ON TABLE task_reminders IS 'Scheduled reminders for tasks';
COMMENT ON TABLE task_templates IS 'Reusable task templates for common workflows';
COMMENT ON TABLE task_webhooks IS 'Webhook configurations for task events';
COMMENT ON TABLE task_webhook_logs IS 'Logs of webhook deliveries';
COMMENT ON TABLE task_notifications IS 'In-app notifications for task events';
COMMENT ON TABLE task_analytics_cache IS 'Pre-computed analytics for performance';

-- Key column comments
COMMENT ON COLUMN tasks.intent IS 'FHIR: Indicates the "level" of actionability associated with the Task';
COMMENT ON COLUMN tasks.status IS 'FHIR: The current status of the task';
COMMENT ON COLUMN tasks.business_status IS 'FHIR: Additional business-specific state information';
COMMENT ON COLUMN tasks.priority IS 'FHIR: Indicates how quickly the task should be addressed';
COMMENT ON COLUMN tasks.code IS 'FHIR: A name or code describing the task';
COMMENT ON COLUMN tasks.focus IS 'FHIR: The request being actioned or the resource being manipulated';
COMMENT ON COLUMN tasks.for_reference IS 'FHIR: Beneficiary of the task (typically patient)';
COMMENT ON COLUMN tasks.encounter_id IS 'Healthcare event during which this task was created';
COMMENT ON COLUMN tasks.owner_reference IS 'FHIR: Individual or organization responsible for task';
COMMENT ON COLUMN tasks.requester_reference IS 'FHIR: Who is asking for task to be done';
COMMENT ON COLUMN tasks.fhir_resource IS 'Complete FHIR Task resource representation';
COMMENT ON COLUMN tasks.show_assignee IS 'Setting to show/hide who assigned the task';
COMMENT ON COLUMN task_pools.settings IS 'JSON configuration for pool behavior';
COMMENT ON COLUMN task_webhooks.events IS 'Array of event types that trigger this webhook';
COMMENT ON COLUMN task_webhooks.filters IS 'JSON filters to limit when webhook fires';
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
      console.log('🔄 Executing 20240101000033-create_tasks_system...');
      await pool.query(sql);
      console.log('✅ 20240101000033-create_tasks_system completed');
    } catch (error) {
      console.error('❌ 20240101000033-create_tasks_system failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
      DROP TRIGGER IF EXISTS trigger_check_subtasks_completion ON task_subtasks;
      DROP TRIGGER IF EXISTS trigger_task_audit_log ON tasks;
      DROP TRIGGER IF EXISTS trigger_task_webhooks_updated_at ON task_webhooks;
      DROP TRIGGER IF EXISTS trigger_task_templates_updated_at ON task_templates;
      DROP TRIGGER IF EXISTS trigger_task_subtasks_updated_at ON task_subtasks;
      DROP TRIGGER IF EXISTS trigger_task_pools_updated_at ON task_pools;
      DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;

      DROP FUNCTION IF EXISTS check_subtasks_completion();
      DROP FUNCTION IF EXISTS log_task_changes();
      DROP FUNCTION IF EXISTS update_tasks_updated_at();

      DROP TABLE IF EXISTS task_analytics_cache CASCADE;
      DROP TABLE IF EXISTS task_notifications CASCADE;
      DROP TABLE IF EXISTS task_webhook_logs CASCADE;
      DROP TABLE IF EXISTS task_webhooks CASCADE;
      DROP TABLE IF EXISTS task_templates CASCADE;
      DROP TABLE IF EXISTS task_reminders CASCADE;
      DROP TABLE IF EXISTS task_history CASCADE;
      DROP TABLE IF EXISTS task_comments CASCADE;
      DROP TABLE IF EXISTS task_subtasks CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS task_pool_members CASCADE;
      DROP TABLE IF EXISTS task_pools CASCADE;
    `;

    await queryInterface.sequelize.query(sql);
  }
};
