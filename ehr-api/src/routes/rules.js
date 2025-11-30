const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const universalRuleEngine = require('../services/universal-rule-engine.service');

// Apply authentication to all routes
router.use(requireAuth);

/**
 * GET /api/rules
 * Get all rules for an organization
 */
router.get('/', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { rule_type, category, is_active, trigger_event } = req.query;

    let query = `
      SELECT
        r.*,
        u.name as created_by_name
      FROM rules r
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.org_id = $1
    `;

    const params = [orgId];
    let paramIndex = 2;

    if (rule_type) {
      query += ` AND r.rule_type = $${paramIndex}`;
      params.push(rule_type);
      paramIndex++;
    }

    if (category) {
      query += ` AND r.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (is_active !== undefined) {
      query += ` AND r.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    if (trigger_event) {
      query += ` AND r.trigger_event = $${paramIndex}`;
      params.push(trigger_event);
      paramIndex++;
    }

    query += ` ORDER BY r.priority DESC, r.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rules',
      message: error.message
    });
  }
});

/**
 * GET /api/rules/:id
 * Get a specific rule
 */
router.get('/:id', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;

    const query = `
      SELECT r.*, u.name as created_by_name
      FROM rules r
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.id = $1 AND r.org_id = $2
    `;

    const result = await pool.query(query, [id, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rule',
      message: error.message
    });
  }
});

/**
 * POST /api/rules
 * Create a new rule
 */
router.post('/', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const {
      name,
      description,
      rule_type,
      category,
      is_active,
      priority,
      trigger_event,
      trigger_timing,
      conditions,
      conditions_json_logic,
      used_variables,
      actions,
      config
    } = req.body;

    // Validation
    if (!name || !rule_type || !trigger_event || !conditions || !actions) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, rule_type, trigger_event, conditions, actions'
      });
    }

    // If conditions_json_logic is not provided, convert from query builder format
    let jsonLogic = conditions_json_logic;
    if (!jsonLogic && conditions.combinator) {
      jsonLogic = universalRuleEngine.convertQueryBuilderToJsonLogic(conditions);
    }

    const query = `
      INSERT INTO rules (
        org_id,
        name,
        description,
        rule_type,
        category,
        is_active,
        priority,
        trigger_event,
        trigger_timing,
        conditions,
        conditions_json_logic,
        used_variables,
        actions,
        config,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const result = await pool.query(query, [
      orgId,
      name,
      description,
      rule_type,
      category,
      is_active !== undefined ? is_active : true,
      priority || 0,
      trigger_event,
      trigger_timing || 'immediate',
      JSON.stringify(conditions),
      jsonLogic ? JSON.stringify(jsonLogic) : null,
      used_variables || [],
      JSON.stringify(actions),
      config ? JSON.stringify(config) : '{}',
      userId
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating rule:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'A rule with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create rule',
      message: error.message
    });
  }
});

/**
 * PUT /api/rules/:id
 * Update a rule
 */
router.put('/:id', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const { id } = req.params;
    const {
      name,
      description,
      rule_type,
      category,
      is_active,
      priority,
      trigger_event,
      trigger_timing,
      conditions,
      conditions_json_logic,
      used_variables,
      actions,
      config
    } = req.body;

    // If conditions provided but no json_logic, convert
    let jsonLogic = conditions_json_logic;
    if (!jsonLogic && conditions && conditions.combinator) {
      jsonLogic = universalRuleEngine.convertQueryBuilderToJsonLogic(conditions);
    }

    const query = `
      UPDATE rules
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        rule_type = COALESCE($3, rule_type),
        category = COALESCE($4, category),
        is_active = COALESCE($5, is_active),
        priority = COALESCE($6, priority),
        trigger_event = COALESCE($7, trigger_event),
        trigger_timing = COALESCE($8, trigger_timing),
        conditions = COALESCE($9, conditions),
        conditions_json_logic = COALESCE($10, conditions_json_logic),
        used_variables = COALESCE($11, used_variables),
        actions = COALESCE($12, actions),
        config = COALESCE($13, config),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 AND org_id = $15
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      description,
      rule_type,
      category,
      is_active,
      priority,
      trigger_event,
      trigger_timing,
      conditions ? JSON.stringify(conditions) : null,
      jsonLogic ? JSON.stringify(jsonLogic) : null,
      used_variables,
      actions ? JSON.stringify(actions) : null,
      config ? JSON.stringify(config) : null,
      id,
      orgId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rule',
      message: error.message
    });
  }
});

/**
 * DELETE /api/rules/:id
 * Delete a rule
 */
router.delete('/:id', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;

    const query = `
      DELETE FROM rules
      WHERE id = $1 AND org_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rule',
      message: error.message
    });
  }
});

/**
 * POST /api/rules/:id/test
 * Test a rule with sample data
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const { id } = req.params;
    const { event_data, patient_id } = req.body;

    // Get rule definition
    const ruleQuery = `
      SELECT * FROM rules
      WHERE id = $1 AND org_id = $2
    `;
    const ruleResult = await pool.query(ruleQuery, [id, orgId]);

    if (ruleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    const rule = ruleResult.rows[0];

    // Test rule evaluation
    const startTime = Date.now();

    const results = await universalRuleEngine.evaluateRules(
      rule.trigger_event,
      event_data || {},
      orgId,
      userId,
      patient_id
    );

    res.json({
      success: true,
      data: {
        execution_time_ms: Date.now() - startTime,
        results
      }
    });
  } catch (error) {
    console.error('Error testing rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test rule',
      message: error.message
    });
  }
});

/**
 * GET /api/rules/:id/executions
 * Get execution history for a rule
 */
router.get('/:id/executions', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify rule belongs to org
    const ruleCheck = await pool.query(
      'SELECT id FROM rules WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (ruleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    const query = `
      SELECT
        e.*,
        u.name as triggered_by_name
      FROM rule_executions e
      LEFT JOIN users u ON u.id = e.user_id
      WHERE e.rule_id = $1
      ORDER BY e.executed_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [id, limit, offset]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM rule_executions WHERE rule_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching rule executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rule executions',
      message: error.message
    });
  }
});

/**
 * GET /api/rules/types/list
 * Get available rule types
 */
router.get('/types/list', async (req, res) => {
  const ruleTypes = [
    {
      id: 'task_assignment',
      label: 'Task Assignment',
      description: 'Automatically create and assign tasks based on events',
      icon: 'CheckSquare'
    },
    {
      id: 'alert',
      label: 'Clinical Alert',
      description: 'Display alerts on patient charts and dashboards',
      icon: 'AlertTriangle'
    },
    {
      id: 'cds_hook',
      label: 'CDS Hook',
      description: 'Clinical decision support suggestions and recommendations',
      icon: 'Lightbulb'
    },
    {
      id: 'medication_assignment',
      label: 'Medication Assignment',
      description: 'Suggest medications based on protocols and conditions',
      icon: 'Pill'
    },
    {
      id: 'reminder',
      label: 'Reminder',
      description: 'Send reminders to patients or staff',
      icon: 'Bell'
    },
    {
      id: 'notification',
      label: 'Notification',
      description: 'Send notifications via email, SMS, or in-app',
      icon: 'Mail'
    },
    {
      id: 'workflow_automation',
      label: 'Workflow Automation',
      description: 'Automate complex multi-step workflows',
      icon: 'GitBranch'
    }
  ];

  res.json({
    success: true,
    data: ruleTypes
  });
});

/**
 * GET /api/rules/events/list
 * Get available event types
 */
router.get('/events/list', async (req, res) => {
  const eventTypes = [
    {
      id: 'patient_view',
      label: 'Patient Viewed',
      description: 'Triggered when a patient record is viewed',
      availableFields: ['patientId', 'userId', 'location']
    },
    {
      id: 'lab_result',
      label: 'Lab Result Received',
      description: 'Triggered when lab results are received',
      availableFields: ['resultId', 'patientId', 'testType', 'abnormal', 'value']
    },
    {
      id: 'vital_recorded',
      label: 'Vital Signs Recorded',
      description: 'Triggered when vital signs are recorded',
      availableFields: ['patientId', 'vitalType', 'value', 'unit']
    },
    {
      id: 'medication_ordered',
      label: 'Medication Ordered',
      description: 'Triggered when a medication is ordered',
      availableFields: ['orderId', 'patientId', 'medicationCode', 'medicationName']
    },
    {
      id: 'lab_order_created',
      label: 'Lab Order Created',
      description: 'Triggered when a lab order is created',
      availableFields: ['orderId', 'patientId', 'orderType', 'priority']
    },
    {
      id: 'imaging_order_created',
      label: 'Imaging Order Created',
      description: 'Triggered when an imaging order is created',
      availableFields: ['orderId', 'patientId', 'orderType', 'priority']
    },
    {
      id: 'appointment_scheduled',
      label: 'Appointment Scheduled',
      description: 'Triggered when an appointment is scheduled',
      availableFields: ['appointmentId', 'patientId', 'appointmentType', 'providerId', 'date']
    },
    {
      id: 'form_submitted',
      label: 'Form Submitted',
      description: 'Triggered when a patient submits a form',
      availableFields: ['formId', 'patientId', 'formType', 'responseId']
    },
    {
      id: 'admission',
      label: 'Patient Admission',
      description: 'Triggered when a patient is admitted',
      availableFields: ['patientId', 'encounterId', 'department', 'admissionType']
    },
    {
      id: 'discharge',
      label: 'Patient Discharge',
      description: 'Triggered when a patient is discharged',
      availableFields: ['patientId', 'encounterId', 'department', 'dischargeType']
    }
  ];

  res.json({
    success: true,
    data: eventTypes
  });
});

/**
 * GET /api/rules/categories/list
 * Get available categories
 */
router.get('/categories/list', async (req, res) => {
  const categories = [
    { id: 'clinical', label: 'Clinical' },
    { id: 'operational', label: 'Operational' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'safety', label: 'Safety' },
    { id: 'quality', label: 'Quality' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'custom', label: 'Custom' }
  ];

  res.json({
    success: true,
    data: categories
  });
});

module.exports = router;
