const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const variableEvaluator = require('../services/rule-variable-evaluator.service');

// Apply authentication to all routes
router.use(requireAuth);

/**
 * GET /api/rule-variables
 * Get all rule variables for an organization
 */
router.get('/', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { category, computation_type, is_active } = req.query;

    let query = `
      SELECT
        rv.*,
        u.name as created_by_name
      FROM rule_variables rv
      LEFT JOIN users u ON u.id = rv.created_by
      WHERE rv.org_id = $1
    `;

    const params = [orgId];
    let paramIndex = 2;

    if (category) {
      query += ` AND rv.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (computation_type) {
      query += ` AND rv.computation_type = $${paramIndex}`;
      params.push(computation_type);
      paramIndex++;
    }

    if (is_active !== undefined) {
      query += ` AND rv.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    query += ` ORDER BY rv.category, rv.name`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rule variables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rule variables',
      message: error.message
    });
  }
});

/**
 * GET /api/rule-variables/:id
 * Get a specific rule variable
 */
router.get('/:id', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;

    const query = `
      SELECT rv.*, u.name as created_by_name
      FROM rule_variables rv
      LEFT JOIN users u ON u.id = rv.created_by
      WHERE rv.id = $1 AND rv.org_id = $2
    `;

    const result = await pool.query(query, [id, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule variable not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching rule variable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rule variable',
      message: error.message
    });
  }
});

/**
 * POST /api/rule-variables
 * Create a new rule variable
 */
router.post('/', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const {
      name,
      variable_key,
      description,
      category,
      computation_type,
      data_source,
      aggregate_function,
      aggregate_field,
      aggregate_filters,
      time_window_hours,
      formula,
      lookup_table,
      lookup_key,
      lookup_value,
      result_type,
      unit,
      cache_duration_minutes,
      is_active
    } = req.body;

    // Validation
    if (!name || !variable_key || !computation_type || !data_source) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, variable_key, computation_type, data_source'
      });
    }

    // Validate computation type specific fields
    if (computation_type === 'aggregate' && !aggregate_function) {
      return res.status(400).json({
        success: false,
        error: 'aggregate_function is required for aggregate computation type'
      });
    }

    if (computation_type === 'formula' && !formula) {
      return res.status(400).json({
        success: false,
        error: 'formula is required for formula computation type'
      });
    }

    if (computation_type === 'lookup' && (!lookup_table || !lookup_key || !lookup_value)) {
      return res.status(400).json({
        success: false,
        error: 'lookup_table, lookup_key, and lookup_value are required for lookup computation type'
      });
    }

    const query = `
      INSERT INTO rule_variables (
        org_id,
        name,
        variable_key,
        description,
        category,
        computation_type,
        data_source,
        aggregate_function,
        aggregate_field,
        aggregate_filters,
        time_window_hours,
        formula,
        lookup_table,
        lookup_key,
        lookup_value,
        result_type,
        unit,
        cache_duration_minutes,
        is_active,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const result = await pool.query(query, [
      orgId,
      name,
      variable_key,
      description,
      category,
      computation_type,
      data_source,
      aggregate_function,
      aggregate_field,
      aggregate_filters ? JSON.stringify(aggregate_filters) : null,
      time_window_hours,
      formula,
      lookup_table,
      lookup_key,
      lookup_value,
      result_type || 'number',
      unit,
      cache_duration_minutes || 5,
      is_active !== undefined ? is_active : true,
      userId
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating rule variable:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'A variable with this key already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create rule variable',
      message: error.message
    });
  }
});

/**
 * PUT /api/rule-variables/:id
 * Update a rule variable
 */
router.put('/:id', async (req, res) => {
  try {
    const { orgId, userId } = req.userContext;
    const { id } = req.params;
    const {
      name,
      variable_key,
      description,
      category,
      computation_type,
      data_source,
      aggregate_function,
      aggregate_field,
      aggregate_filters,
      time_window_hours,
      formula,
      lookup_table,
      lookup_key,
      lookup_value,
      result_type,
      unit,
      cache_duration_minutes,
      is_active
    } = req.body;

    const query = `
      UPDATE rule_variables
      SET
        name = COALESCE($1, name),
        variable_key = COALESCE($2, variable_key),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        computation_type = COALESCE($5, computation_type),
        data_source = COALESCE($6, data_source),
        aggregate_function = COALESCE($7, aggregate_function),
        aggregate_field = COALESCE($8, aggregate_field),
        aggregate_filters = COALESCE($9, aggregate_filters),
        time_window_hours = COALESCE($10, time_window_hours),
        formula = COALESCE($11, formula),
        lookup_table = COALESCE($12, lookup_table),
        lookup_key = COALESCE($13, lookup_key),
        lookup_value = COALESCE($14, lookup_value),
        result_type = COALESCE($15, result_type),
        unit = COALESCE($16, unit),
        cache_duration_minutes = COALESCE($17, cache_duration_minutes),
        is_active = COALESCE($18, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19 AND org_id = $20
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      variable_key,
      description,
      category,
      computation_type,
      data_source,
      aggregate_function,
      aggregate_field,
      aggregate_filters ? JSON.stringify(aggregate_filters) : null,
      time_window_hours,
      formula,
      lookup_table,
      lookup_key,
      lookup_value,
      result_type,
      unit,
      cache_duration_minutes,
      is_active,
      id,
      orgId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule variable not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating rule variable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rule variable',
      message: error.message
    });
  }
});

/**
 * DELETE /api/rule-variables/:id
 * Delete a rule variable
 */
router.delete('/:id', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;

    // Check if variable is used in any rules
    const usageCheck = await pool.query(
      `SELECT COUNT(*) as count FROM rules WHERE org_id = $1 AND $2 = ANY(used_variables)`,
      [orgId, id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete variable that is used in rules. Please update or delete those rules first.'
      });
    }

    const query = `
      DELETE FROM rule_variables
      WHERE id = $1 AND org_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule variable not found'
      });
    }

    res.json({
      success: true,
      message: 'Rule variable deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rule variable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rule variable',
      message: error.message
    });
  }
});

/**
 * POST /api/rule-variables/:id/test
 * Test a variable computation
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { orgId } = req.userContext;
    const { id } = req.params;
    const { patient_id } = req.body;

    // Get variable definition
    const varQuery = `
      SELECT * FROM rule_variables
      WHERE id = $1 AND org_id = $2
    `;
    const varResult = await pool.query(varQuery, [id, orgId]);

    if (varResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rule variable not found'
      });
    }

    const variable = varResult.rows[0];

    // Test computation
    const result = await variableEvaluator.testVariable(variable, patient_id, orgId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing rule variable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test rule variable',
      message: error.message
    });
  }
});

/**
 * GET /api/rule-variables/categories/list
 * Get available categories
 */
router.get('/categories/list', async (req, res) => {
  const categories = [
    { id: 'clinical', label: 'Clinical' },
    { id: 'lab', label: 'Laboratory' },
    { id: 'vital', label: 'Vital Signs' },
    { id: 'medication', label: 'Medication' },
    { id: 'appointment', label: 'Appointment' },
    { id: 'billing', label: 'Billing' },
    { id: 'operational', label: 'Operational' },
    { id: 'custom', label: 'Custom' }
  ];

  res.json({
    success: true,
    data: categories
  });
});

/**
 * GET /api/rule-variables/aggregate-functions/list
 * Get available aggregate functions
 */
router.get('/aggregate-functions/list', async (req, res) => {
  const functions = [
    { id: 'sum', label: 'Sum', description: 'Total of all values' },
    { id: 'avg', label: 'Average', description: 'Average of all values' },
    { id: 'count', label: 'Count', description: 'Count of records' },
    { id: 'min', label: 'Minimum', description: 'Minimum value' },
    { id: 'max', label: 'Maximum', description: 'Maximum value' },
    { id: 'last', label: 'Last', description: 'Most recent value' },
    { id: 'first', label: 'First', description: 'Oldest value in window' }
  ];

  res.json({
    success: true,
    data: functions
  });
});

module.exports = router;
