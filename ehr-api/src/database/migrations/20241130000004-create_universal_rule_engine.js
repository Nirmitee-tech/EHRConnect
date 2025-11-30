const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
      -- ============================================
      -- UNIVERSAL RULE ENGINE
      -- Flexible system for task assignment, alerts, CDS hooks, medication assignment, etc.
      -- ============================================

      -- Rule Types Enum (for clarity, not enforced)
      -- task_assignment, alert, cds_hook, medication_assignment, reminder, notification, workflow_automation

      -- Variables/Aggregates
      -- Reusable computed values that can be used in rules
      CREATE TABLE IF NOT EXISTS rule_variables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

        -- Metadata
        name VARCHAR(255) NOT NULL,
        variable_key VARCHAR(255) NOT NULL, -- Used in conditions as {{var.variable_key}}
        description TEXT,
        category VARCHAR(100), -- clinical, lab, vital, medication, appointment, etc.

        -- Computation definition
        computation_type VARCHAR(50) NOT NULL, -- aggregate, formula, lookup, time_based
        data_source VARCHAR(100) NOT NULL, -- observations, medications, appointments, lab_results, etc.

        -- Aggregate configuration (for aggregate type)
        aggregate_function VARCHAR(50), -- sum, avg, count, min, max, last, first
        aggregate_field VARCHAR(255), -- Field to aggregate
        aggregate_filters JSONB, -- Filters for the aggregate query
        time_window_hours INTEGER, -- Look back X hours

        -- Formula configuration (for formula type)
        formula TEXT, -- JavaScript-like formula: "{{var.bp_systolic}} / {{var.bp_diastolic}}"

        -- Lookup configuration (for lookup type)
        lookup_table VARCHAR(255), -- Table to lookup from
        lookup_key VARCHAR(255), -- Key field
        lookup_value VARCHAR(255), -- Value field

        -- Result configuration
        result_type VARCHAR(50) DEFAULT 'number', -- number, string, boolean, date
        unit VARCHAR(50), -- Unit of measure (mmHg, mg/dL, etc.)

        -- Caching
        cache_duration_minutes INTEGER DEFAULT 5,

        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id),

        CONSTRAINT unique_variable_key_per_org UNIQUE (org_id, variable_key),
        CONSTRAINT valid_computation_type CHECK (computation_type IN ('aggregate', 'formula', 'lookup', 'time_based', 'custom'))
      );

      -- Universal Rules
      -- Supports multiple rule types with flexible configuration
      CREATE TABLE IF NOT EXISTS rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

        -- Metadata
        name VARCHAR(255) NOT NULL,
        description TEXT,
        rule_type VARCHAR(100) NOT NULL, -- task_assignment, alert, cds_hook, medication_assignment, reminder, etc.
        category VARCHAR(100), -- clinical, operational, compliance, safety, etc.

        is_active BOOLEAN DEFAULT TRUE,
        priority INTEGER DEFAULT 0, -- Higher priority = evaluated first

        -- Trigger Configuration
        trigger_event VARCHAR(100) NOT NULL, -- patient_view, lab_result, vital_recorded, medication_ordered, etc.
        trigger_timing VARCHAR(50) DEFAULT 'immediate', -- immediate, scheduled, on_demand

        -- Conditions (react-query-builder format)
        conditions JSONB NOT NULL, -- {combinator: "and", rules: [{field, operator, value}]}
        conditions_json_logic JSONB, -- JSONLogic format for backend evaluation

        -- Variables used in this rule
        used_variables TEXT[], -- Array of variable_keys used in conditions

        -- Actions Configuration (varies by rule_type)
        actions JSONB NOT NULL, -- Flexible action configuration based on rule_type

        -- Rule-type specific configurations
        config JSONB DEFAULT '{}'::jsonb,

        -- Audit
        execution_count INTEGER DEFAULT 0,
        last_executed_at TIMESTAMPTZ,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,

        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id),

        CONSTRAINT unique_universal_rule_name_per_org UNIQUE (org_id, name)
      );

      -- Rule Execution Log
      -- Universal execution log for all rule types
      CREATE TABLE IF NOT EXISTS rule_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,

        -- Execution context
        trigger_event VARCHAR(100) NOT NULL,
        trigger_data JSONB NOT NULL,
        patient_id VARCHAR(255), -- Patient context if applicable
        user_id UUID REFERENCES users(id), -- User who triggered

        -- Computed variables at execution time
        computed_variables JSONB, -- {var_key: computed_value}

        -- Evaluation result
        conditions_met BOOLEAN NOT NULL,
        conditions_result JSONB, -- Detailed condition evaluation

        -- Actions performed
        actions_performed JSONB, -- List of actions that were executed
        actions_success BOOLEAN,

        -- Results (varies by rule type)
        result_data JSONB, -- Task created, alert shown, etc.

        -- Error handling
        error_message TEXT,
        stack_trace TEXT,

        -- Timing
        executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,

        -- For debugging
        debug_info JSONB
      );

      -- Rule Templates
      -- Pre-built rule templates for common use cases
      CREATE TABLE IF NOT EXISTS rule_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = global template

        name VARCHAR(255) NOT NULL,
        description TEXT,
        rule_type VARCHAR(100) NOT NULL,
        category VARCHAR(100),

        -- Template content
        template_conditions JSONB NOT NULL,
        template_actions JSONB NOT NULL,
        template_config JSONB DEFAULT '{}'::jsonb,

        -- Required variables
        required_variables TEXT[],

        -- Usage
        usage_count INTEGER DEFAULT 0,

        is_active BOOLEAN DEFAULT TRUE,
        is_global BOOLEAN DEFAULT FALSE, -- Available to all orgs

        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
      );

      -- Indexes
      CREATE INDEX idx_rule_variables_org ON rule_variables(org_id) WHERE is_active = TRUE;
      CREATE INDEX idx_rule_variables_key ON rule_variables(variable_key);
      CREATE INDEX idx_rule_variables_category ON rule_variables(category);

      CREATE INDEX idx_rules_org ON rules(org_id) WHERE is_active = TRUE;
      CREATE INDEX idx_rules_type ON rules(rule_type) WHERE is_active = TRUE;
      CREATE INDEX idx_rules_trigger ON rules(trigger_event) WHERE is_active = TRUE;
      CREATE INDEX idx_rules_priority ON rules(priority DESC) WHERE is_active = TRUE;
      CREATE INDEX idx_rules_type_trigger ON rules(rule_type, trigger_event) WHERE is_active = TRUE;

      CREATE INDEX idx_rule_executions_rule ON rule_executions(rule_id);
      CREATE INDEX idx_rule_executions_patient ON rule_executions(patient_id) WHERE patient_id IS NOT NULL;
      CREATE INDEX idx_rule_executions_executed ON rule_executions(executed_at DESC);
      CREATE INDEX idx_rule_executions_conditions_met ON rule_executions(rule_id, conditions_met);

      CREATE INDEX idx_rule_templates_type ON rule_templates(rule_type) WHERE is_active = TRUE;
      CREATE INDEX idx_rule_templates_global ON rule_templates(is_global) WHERE is_global = TRUE AND is_active = TRUE;

      -- Triggers
      CREATE TRIGGER trigger_rule_variables_updated_at
        BEFORE UPDATE ON rule_variables
        FOR EACH ROW
        EXECUTE FUNCTION update_tasks_updated_at();

      CREATE TRIGGER trigger_rules_updated_at
        BEFORE UPDATE ON rules
        FOR EACH ROW
        EXECUTE FUNCTION update_tasks_updated_at();

      -- Update execution stats trigger
      CREATE OR REPLACE FUNCTION update_rule_execution_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE rules
        SET
          execution_count = execution_count + 1,
          last_executed_at = NEW.executed_at,
          success_count = success_count + CASE WHEN NEW.actions_success THEN 1 ELSE 0 END,
          failure_count = failure_count + CASE WHEN NOT NEW.actions_success THEN 1 ELSE 0 END
        WHERE id = NEW.rule_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_rule_stats
        AFTER INSERT ON rule_executions
        FOR EACH ROW
        EXECUTE FUNCTION update_rule_execution_stats();

      -- Comments
      COMMENT ON TABLE rule_variables IS 'Reusable computed variables (aggregates, formulas) for use in rules';
      COMMENT ON TABLE rules IS 'Universal rule engine supporting task assignment, alerts, CDS hooks, medication assignment, etc.';
      COMMENT ON TABLE rule_executions IS 'Execution log for all rule types with detailed debugging info';
      COMMENT ON TABLE rule_templates IS 'Pre-built rule templates for common use cases';

      COMMENT ON COLUMN rule_variables.computation_type IS 'Type of computation: aggregate (sum/avg/count), formula (calculations), lookup (table lookup), time_based, custom';
      COMMENT ON COLUMN rule_variables.aggregate_function IS 'For aggregates: sum, avg, count, min, max, last, first';
      COMMENT ON COLUMN rule_variables.time_window_hours IS 'Look back window for time-based aggregates';

      COMMENT ON COLUMN rules.conditions IS 'Conditions in react-query-builder format for UI';
      COMMENT ON COLUMN rules.conditions_json_logic IS 'Conditions in JSONLogic format for backend evaluation';
      COMMENT ON COLUMN rules.actions IS 'Actions to perform when conditions are met (format varies by rule_type)';
      COMMENT ON COLUMN rules.rule_type IS 'Type: task_assignment, alert, cds_hook, medication_assignment, reminder, notification, workflow_automation';
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
      console.log('🔄 Executing create_universal_rule_engine...');
      await pool.query(sql);
      console.log('✅ create_universal_rule_engine completed');
    } catch (error) {
      console.error('❌ create_universal_rule_engine failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const sql = `
      DROP TRIGGER IF EXISTS trigger_update_rule_stats ON rule_executions;
      DROP FUNCTION IF EXISTS update_rule_execution_stats();
      DROP TRIGGER IF EXISTS trigger_rules_updated_at ON rules;
      DROP TRIGGER IF EXISTS trigger_rule_variables_updated_at ON rule_variables;

      DROP TABLE IF EXISTS rule_templates CASCADE;
      DROP TABLE IF EXISTS rule_executions CASCADE;
      DROP TABLE IF EXISTS rules CASCADE;
      DROP TABLE IF EXISTS rule_variables CASCADE;
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
