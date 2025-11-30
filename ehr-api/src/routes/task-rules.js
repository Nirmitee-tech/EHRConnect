const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Apply authentication to all routes
router.use(requireAuth);

/**
 * GET /api/task-rules
 * Get all task assignment rules for an organization
 */
router.get('/', async (req, res) => {
  try {
    const { orgId } = req.userContext;

    const query = `
      SELECT
        r.*,
        u.name as created_by_name,
        tt.name as template_name
      FROM task_assignment_rules r
      LEFT JOIN users u ON u.id = r.created_by
      LEFT JOIN task_templates tt ON tt.id = r.task_template_id
      WHERE r.org_id = $1
      ORDER BY r.priority DESC, r.created_at DESC
    `;

    const result = await pool.query(query, [orgId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching task rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task rules',
      message: error.message
    });
  }
});

/**
 * GET /api/task-rules/:id
 * Get a specific task assignment rule
 */
router.get('/:id', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;

    const query = `
      SELECT r.*, u.name as created_by_name
      FROM task_assignment_rules r
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.id = $1 AND r.org_id = $2
    `;

    const result = await pool.query(query, [id, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching task rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task rule',
      message: error.message
    });
  }
});

/**
 * POST /api/task-rules
 * Create a new task assignment rule
 */
router.post('/', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const {
      name,
      description,
      is_active,
      priority,
      trigger_event,
      trigger_conditions,
      task_template_id,
      task_config,
      assignment_strategy,
      assignment_target,
      options
    } = req.body;

    // Validation
    if (!name || !trigger_event || !task_config || !assignment_strategy || !assignment_target) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, trigger_event, task_config, assignment_strategy, assignment_target'
      });
    }

    const query = `
      INSERT INTO task_assignment_rules (
        org_id,
        name,
        description,
        is_active,
        priority,
        trigger_event,
        trigger_conditions,
        task_template_id,
        task_config,
        assignment_strategy,
        assignment_target,
        options,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      orgId,
      name,
      description,
      is_active !== undefined ? is_active : true,
      priority || 0,
      trigger_event,
      JSON.stringify(trigger_conditions || {}),
      task_template_id,
      JSON.stringify(task_config),
      assignment_strategy,
      JSON.stringify(assignment_target),
      JSON.stringify(options || {}),
      userId
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating task rule:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'A rule with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create task rule',
      message: error.message
    });
  }
});

/**
 * PUT /api/task-rules/:id
 * Update a task assignment rule
 */
router.put('/:id', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const { id } = req.params;
    const {
      name,
      description,
      is_active,
      priority,
      trigger_event,
      trigger_conditions,
      task_template_id,
      task_config,
      assignment_strategy,
      assignment_target,
      options
    } = req.body;

    const query = `
      UPDATE task_assignment_rules
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active),
        priority = COALESCE($4, priority),
        trigger_event = COALESCE($5, trigger_event),
        trigger_conditions = COALESCE($6, trigger_conditions),
        task_template_id = COALESCE($7, task_template_id),
        task_config = COALESCE($8, task_config),
        assignment_strategy = COALESCE($9, assignment_strategy),
        assignment_target = COALESCE($10, assignment_target),
        options = COALESCE($11, options),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND org_id = $13
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      description,
      is_active,
      priority,
      trigger_event,
      trigger_conditions ? JSON.stringify(trigger_conditions) : null,
      task_template_id,
      task_config ? JSON.stringify(task_config) : null,
      assignment_strategy,
      assignment_target ? JSON.stringify(assignment_target) : null,
      options ? JSON.stringify(options) : null,
      id,
      orgId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task rule',
      message: error.message
    });
  }
});

/**
 * DELETE /api/task-rules/:id
 * Delete a task assignment rule
 */
router.delete('/:id', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;

    const query = `
      DELETE FROM task_assignment_rules
      WHERE id = $1 AND org_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Task rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task rule',
      message: error.message
    });
  }
});

/**
 * GET /api/task-rules/:id/executions
 * Get execution history for a rule
 */
router.get('/:id/executions', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify rule belongs to org
    const ruleCheck = await pool.query(
      'SELECT id FROM task_assignment_rules WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (ruleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task rule not found'
      });
    }

    const query = `
      SELECT
        e.*,
        t.identifier as task_identifier,
        t.description as task_description
      FROM task_assignment_rule_executions e
      LEFT JOIN tasks t ON t.id = e.task_id
      WHERE e.rule_id = $1
      ORDER BY e.executed_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [id, limit, offset]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM task_assignment_rule_executions WHERE rule_id = $1',
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
 * GET /api/task-rules/events/types
 * Get available event types for rules
 */
router.get('/events/types', async (req, res) => {
  const eventTypes = [
    {
      id: 'lab_order_created',
      label: 'Lab Order Created',
      description: 'Triggered when a new lab order is created',
      availableFields: ['orderId', 'patientId', 'orderType', 'priority', 'status']
    },
    {
      id: 'imaging_order_created',
      label: 'Imaging Order Created',
      description: 'Triggered when a new imaging order is created',
      availableFields: ['orderId', 'patientId', 'orderType', 'priority', 'status']
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
      id: 'prescription_created',
      label: 'Prescription Created',
      description: 'Triggered when a new prescription is created',
      availableFields: ['prescriptionId', 'patientId', 'medicationName', 'priority']
    },
    {
      id: 'lab_result_received',
      label: 'Lab Result Received',
      description: 'Triggered when lab results are received',
      availableFields: ['resultId', 'patientId', 'testType', 'abnormal']
    }
  ];

  res.json({
    success: true,
    data: eventTypes
  });
});

module.exports = router;
