const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
      -- Task Assignment Rules
      -- Automatically assign tasks based on configurable rules
      CREATE TABLE IF NOT EXISTS task_assignment_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

        -- Rule metadata
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        priority INTEGER DEFAULT 0, -- Higher priority rules are evaluated first

        -- Trigger conditions
        trigger_event VARCHAR(100) NOT NULL, -- lab_order_created, imaging_order_created, appointment_scheduled, form_submitted, etc.
        trigger_conditions JSONB DEFAULT '{}'::jsonb, -- {status: 'pending', priority: ['urgent', 'stat'], specialty: 'cardiology'}

        -- Task assignment configuration
        task_template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
        task_config JSONB NOT NULL, -- {description, priority, due_in_hours, category, labels}

        -- Assignment strategy
        assignment_strategy VARCHAR(50) NOT NULL DEFAULT 'pool', -- pool, user, patient, role, round_robin, workload_balanced
        assignment_target JSONB NOT NULL, -- {pool_id: 'uuid'} or {role: 'nurse'} or {user_id: 'uuid'}

        -- Additional options
        options JSONB DEFAULT '{}'::jsonb, -- {send_notification: true, auto_start: false, require_acknowledgment: true}

        -- Audit fields
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id),

        CONSTRAINT unique_rule_name_per_org UNIQUE (org_id, name),
        CONSTRAINT valid_assignment_strategy CHECK (assignment_strategy IN ('pool', 'user', 'patient', 'role', 'round_robin', 'workload_balanced'))
      );

      -- Task Assignment Rule Execution Log
      -- Track when rules are triggered and tasks are created
      CREATE TABLE IF NOT EXISTS task_assignment_rule_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rule_id UUID NOT NULL REFERENCES task_assignment_rules(id) ON DELETE CASCADE,

        -- Execution details
        trigger_event VARCHAR(100) NOT NULL,
        trigger_data JSONB NOT NULL, -- The data that triggered the rule

        -- Result
        success BOOLEAN NOT NULL,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        error_message TEXT,

        -- Timing
        executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER
      );

      -- Indexes
      CREATE INDEX idx_task_assignment_rules_org ON task_assignment_rules(org_id) WHERE is_active = TRUE;
      CREATE INDEX idx_task_assignment_rules_trigger ON task_assignment_rules(trigger_event) WHERE is_active = TRUE;
      CREATE INDEX idx_task_assignment_rules_priority ON task_assignment_rules(priority DESC) WHERE is_active = TRUE;
      CREATE INDEX idx_task_assignment_rule_executions_rule ON task_assignment_rule_executions(rule_id);
      CREATE INDEX idx_task_assignment_rule_executions_executed ON task_assignment_rule_executions(executed_at DESC);

      -- Update trigger
      CREATE TRIGGER trigger_task_assignment_rules_updated_at
        BEFORE UPDATE ON task_assignment_rules
        FOR EACH ROW
        EXECUTE FUNCTION update_tasks_updated_at();

      -- Comments
      COMMENT ON TABLE task_assignment_rules IS 'Rules for automatic task assignment based on events (lab orders, imaging, appointments, etc.)';
      COMMENT ON COLUMN task_assignment_rules.trigger_event IS 'Event that triggers the rule (lab_order_created, imaging_order_created, appointment_scheduled, etc.)';
      COMMENT ON COLUMN task_assignment_rules.trigger_conditions IS 'JSON conditions that must be met for the rule to execute';
      COMMENT ON COLUMN task_assignment_rules.assignment_strategy IS 'How to assign the task (to a pool, user, role, etc.)';
      COMMENT ON COLUMN task_assignment_rules.assignment_target IS 'Target for assignment based on strategy';
      COMMENT ON TABLE task_assignment_rule_executions IS 'Log of rule executions and created tasks';
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
      console.log('🔄 Executing create_task_assignment_rules...');
      await pool.query(sql);
      console.log('✅ create_task_assignment_rules completed');
    } catch (error) {
      console.error('❌ create_task_assignment_rules failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
      DROP TRIGGER IF EXISTS trigger_task_assignment_rules_updated_at ON task_assignment_rules;
      DROP TABLE IF EXISTS task_assignment_rule_executions CASCADE;
      DROP TABLE IF EXISTS task_assignment_rules CASCADE;
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
      await pool.query(sql);
    } catch (error) {
      console.error('Error rolling back:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  }
};
