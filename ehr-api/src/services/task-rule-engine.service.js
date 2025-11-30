const pool = require('../config/database');
const taskService = require('./task.service');

/**
 * Task Assignment Rule Engine
 * Evaluates rules and automatically creates tasks based on events
 */

/**
 * Evaluate and execute rules for a specific event
 * @param {string} eventType - Event type (lab_order_created, imaging_order_created, etc.)
 * @param {object} eventData - Data about the event
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID who triggered the event
 * @returns {Promise<Array>} Array of created tasks
 */
async function evaluateRules(eventType, eventData, orgId, userId) {
  const startTime = Date.now();

  try {
    // Get active rules for this event type
    const rulesQuery = `
      SELECT *
      FROM task_assignment_rules
      WHERE org_id = $1
        AND trigger_event = $2
        AND is_active = TRUE
      ORDER BY priority DESC, created_at ASC
    `;

    const rulesResult = await pool.query(rulesQuery, [orgId, eventType]);
    const rules = rulesResult.rows;

    console.log(`[Rule Engine] Found ${rules.length} rules for event ${eventType}`);

    const createdTasks = [];

    // Evaluate each rule
    for (const rule of rules) {
      try {
        const ruleStartTime = Date.now();

        // Check if rule conditions match
        if (!matchesConditions(eventData, rule.trigger_conditions)) {
          console.log(`[Rule Engine] Rule ${rule.name} conditions not met, skipping`);
          continue;
        }

        console.log(`[Rule Engine] Rule ${rule.name} matched, creating task`);

        // Create task based on rule configuration
        const task = await createTaskFromRule(rule, eventData, orgId, userId);

        createdTasks.push(task);

        // Log successful execution
        await logRuleExecution(rule.id, eventType, eventData, true, task.id, null, Date.now() - ruleStartTime);

        console.log(`[Rule Engine] Task created: ${task.id} from rule ${rule.name}`);

      } catch (error) {
        console.error(`[Rule Engine] Error executing rule ${rule.name}:`, error);

        // Log failed execution
        await logRuleExecution(rule.id, eventType, eventData, false, null, error.message, Date.now() - startTime);
      }
    }

    console.log(`[Rule Engine] Completed in ${Date.now() - startTime}ms, created ${createdTasks.length} tasks`);

    return createdTasks;

  } catch (error) {
    console.error('[Rule Engine] Error evaluating rules:', error);
    throw error;
  }
}

/**
 * Check if event data matches rule conditions
 * @param {object} eventData - Event data
 * @param {object} conditions - Rule conditions
 * @returns {boolean} True if conditions match
 */
function matchesConditions(eventData, conditions) {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // No conditions means always match
  }

  for (const [key, expectedValue] of Object.entries(conditions)) {
    const actualValue = getNestedValue(eventData, key);

    // Handle array of acceptable values
    if (Array.isArray(expectedValue)) {
      if (!expectedValue.includes(actualValue)) {
        return false;
      }
    }
    // Handle exact match
    else if (actualValue !== expectedValue) {
      return false;
    }
  }

  return true;
}

/**
 * Get nested object value by dot notation
 * @param {object} obj - Object
 * @param {string} path - Dot-notated path
 * @returns {*} Value at path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Create a task from a rule
 * @param {object} rule - Task assignment rule
 * @param {object} eventData - Event data
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} Created task
 */
async function createTaskFromRule(rule, eventData, orgId, userId) {
  const config = rule.task_config;

  // Calculate due date
  const dueInHours = config.due_in_hours || 24;
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + dueInHours);

  // Build task data
  const taskData = {
    org_id: orgId,
    description: replaceTokens(config.description, eventData),
    priority: config.priority || 'routine',
    status: config.status || 'ready',
    category: config.category,
    due_date: dueDate.toISOString(),
    labels: config.labels || [],
    intent: 'order',
    task_type: config.task_type || 'internal',
    notes: config.notes ? replaceTokens(config.notes, eventData) : null,

    // Link to patient if available
    patient_id: eventData.patientId || eventData.patient_id,

    // Link to related resources
    order_id: eventData.orderId || eventData.order_id,
    order_type: eventData.orderType || eventData.order_type,
    appointment_id: eventData.appointmentId || eventData.appointment_id,
    form_id: eventData.formId || eventData.form_id,

    assigned_by_user_id: userId,
  };

  // Apply assignment strategy
  await applyAssignmentStrategy(taskData, rule.assignment_strategy, rule.assignment_target, orgId);

  // Create the task
  const task = await taskService.createTask(taskData, userId);

  // Handle additional options
  if (rule.options) {
    if (rule.options.auto_start && task.status === 'ready') {
      await taskService.updateTask(task.id, { status: 'in-progress' }, userId);
    }

    if (rule.options.send_notification) {
      // TODO: Send notification
      console.log(`[Rule Engine] Would send notification for task ${task.id}`);
    }
  }

  return task;
}

/**
 * Replace tokens in string with event data
 * @param {string} template - Template string with {{tokens}}
 * @param {object} data - Data object
 * @returns {string} Replaced string
 */
function replaceTokens(template, data) {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    return getNestedValue(data, path.trim()) || match;
  });
}

/**
 * Apply assignment strategy to task data
 * @param {object} taskData - Task data being built
 * @param {string} strategy - Assignment strategy
 * @param {object} target - Assignment target
 * @param {string} orgId - Organization ID
 * @returns {Promise<void>}
 */
async function applyAssignmentStrategy(taskData, strategy, target, orgId) {
  switch (strategy) {
    case 'pool':
      taskData.assigned_to_pool_id = target.pool_id || target.poolId;
      break;

    case 'user':
      taskData.assigned_to_user_id = target.user_id || target.userId;
      break;

    case 'patient':
      taskData.assigned_to_patient_id = target.patient_id || target.patientId;
      break;

    case 'role':
      // Find first user with this role
      const userByRole = await findUserByRole(target.role, orgId);
      if (userByRole) {
        taskData.assigned_to_user_id = userByRole.id;
      }
      break;

    case 'round_robin':
      // Find next user in round-robin for this pool
      const nextUser = await findNextUserRoundRobin(target.pool_id, orgId);
      if (nextUser) {
        taskData.assigned_to_user_id = nextUser.id;
      }
      break;

    case 'workload_balanced':
      // Find user with least active tasks
      const leastBusyUser = await findLeastBusyUser(target.pool_id, orgId);
      if (leastBusyUser) {
        taskData.assigned_to_user_id = leastBusyUser.id;
      }
      break;

    default:
      console.warn(`[Rule Engine] Unknown assignment strategy: ${strategy}`);
  }
}

/**
 * Find user by role
 * @param {string} role - Role name
 * @param {string} orgId - Organization ID
 * @returns {Promise<object|null>} User or null
 */
async function findUserByRole(role, orgId) {
  const query = `
    SELECT u.*
    FROM users u
    WHERE u.role = $1
      AND u.org_id = $2
      AND u.is_active = TRUE
    LIMIT 1
  `;

  const result = await pool.query(query, [role, orgId]);
  return result.rows[0] || null;
}

/**
 * Find next user in round-robin
 * @param {string} poolId - Pool ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<object|null>} User or null
 */
async function findNextUserRoundRobin(poolId, orgId) {
  // Simple implementation: get pool members and return the one with oldest last assignment
  const query = `
    SELECT u.*
    FROM users u
    INNER JOIN task_pool_members tpm ON tpm.user_id = u.id
    WHERE tpm.pool_id = $1
      AND tpm.is_available = TRUE
      AND u.is_active = TRUE
    ORDER BY (
      SELECT MAX(t.created_at)
      FROM tasks t
      WHERE t.assigned_to_user_id = u.id
    ) ASC NULLS FIRST
    LIMIT 1
  `;

  const result = await pool.query(query, [poolId]);
  return result.rows[0] || null;
}

/**
 * Find user with least active tasks
 * @param {string} poolId - Pool ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<object|null>} User or null
 */
async function findLeastBusyUser(poolId, orgId) {
  const query = `
    SELECT u.*, COUNT(t.id) as active_task_count
    FROM users u
    INNER JOIN task_pool_members tpm ON tpm.user_id = u.id
    LEFT JOIN tasks t ON t.assigned_to_user_id = u.id
      AND t.status IN ('ready', 'in-progress')
      AND t.deleted_at IS NULL
    WHERE tpm.pool_id = $1
      AND tpm.is_available = TRUE
      AND u.is_active = TRUE
    GROUP BY u.id
    ORDER BY active_task_count ASC, u.created_at ASC
    LIMIT 1
  `;

  const result = await pool.query(query, [poolId]);
  return result.rows[0] || null;
}

/**
 * Log rule execution
 * @param {string} ruleId - Rule ID
 * @param {string} eventType - Event type
 * @param {object} eventData - Event data
 * @param {boolean} success - Whether execution succeeded
 * @param {string|null} taskId - Created task ID
 * @param {string|null} errorMessage - Error message if failed
 * @param {number} executionTimeMs - Execution time in ms
 * @returns {Promise<void>}
 */
async function logRuleExecution(ruleId, eventType, eventData, success, taskId, errorMessage, executionTimeMs) {
  const query = `
    INSERT INTO task_assignment_rule_executions (
      rule_id, trigger_event, trigger_data, success, task_id, error_message, execution_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  await pool.query(query, [
    ruleId,
    eventType,
    JSON.stringify(eventData),
    success,
    taskId,
    errorMessage,
    executionTimeMs
  ]);
}

module.exports = {
  evaluateRules,
  matchesConditions,
  replaceTokens,
};
