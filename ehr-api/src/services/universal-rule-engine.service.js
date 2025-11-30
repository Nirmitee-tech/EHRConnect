const pool = require('../config/database');
const jsonLogic = require('json-logic-js');
const variableEvaluator = require('./rule-variable-evaluator.service');
const taskService = require('./task.service');

/**
 * Universal Rule Engine Service
 * Evaluates rules for multiple use cases: task assignment, alerts, CDS hooks, medication assignment
 */

/**
 * Evaluate and execute rules for a specific event
 * @param {string} eventType - Event type (patient_view, lab_result, vital_recorded, etc.)
 * @param {object} eventData - Data about the event
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID who triggered the event
 * @param {string} patientId - Patient ID (optional)
 * @returns {Promise<Array>} Array of execution results
 */
async function evaluateRules(eventType, eventData, orgId, userId, patientId = null) {
  const startTime = Date.now();

  try {
    // Get active rules for this event type
    const rulesQuery = `
      SELECT *
      FROM rules
      WHERE org_id = $1
        AND trigger_event = $2
        AND is_active = TRUE
      ORDER BY priority DESC, created_at ASC
    `;

    const rulesResult = await pool.query(rulesQuery, [orgId, eventType]);
    const rules = rulesResult.rows;

    console.log(`[Universal Rule Engine] Found ${rules.length} rules for event ${eventType}`);

    const executionResults = [];

    // Evaluate each rule
    for (const rule of rules) {
      try {
        const ruleStartTime = Date.now();

        // Compute required variables
        const computedVars = await variableEvaluator.computeVariables(
          rule.used_variables || [],
          patientId,
          { event: eventData },
          orgId
        );

        // Build evaluation context
        const evaluationContext = {
          patient: eventData.patient || {},
          event: eventData,
          var: computedVars,
          context: {
            user_role: eventData.userRole,
            location: eventData.location,
            time_of_day: new Date().getHours(),
            day_of_week: new Date().getDay()
          }
        };

        // Evaluate conditions using JSONLogic
        const conditionsMet = evaluateConditions(rule.conditions_json_logic || rule.conditions, evaluationContext);

        console.log(`[Universal Rule Engine] Rule "${rule.name}" conditions met: ${conditionsMet}`);

        // Execute actions if conditions are met
        let actionsResult = null;
        if (conditionsMet) {
          actionsResult = await executeActions(rule, evaluationContext, orgId, userId, patientId);
        }

        // Log execution
        await logRuleExecution(
          rule.id,
          eventType,
          eventData,
          patientId,
          userId,
          computedVars,
          conditionsMet,
          actionsResult,
          null,
          Date.now() - ruleStartTime
        );

        executionResults.push({
          rule_id: rule.id,
          rule_name: rule.name,
          conditions_met: conditionsMet,
          actions_result: actionsResult
        });

      } catch (error) {
        console.error(`[Universal Rule Engine] Error executing rule ${rule.name}:`, error);

        // Log failed execution
        await logRuleExecution(
          rule.id,
          eventType,
          eventData,
          patientId,
          userId,
          {},
          false,
          null,
          error.message,
          Date.now() - startTime
        );
      }
    }

    console.log(`[Universal Rule Engine] Completed in ${Date.now() - startTime}ms, executed ${executionResults.length} rules`);

    return executionResults;

  } catch (error) {
    console.error('[Universal Rule Engine] Error evaluating rules:', error);
    throw error;
  }
}

/**
 * Evaluate rule conditions using JSONLogic
 * @param {object} conditions - Conditions in JSONLogic format
 * @param {object} context - Evaluation context with data
 * @returns {boolean} True if conditions are met
 */
function evaluateConditions(conditions, context) {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // No conditions means always match
  }

  try {
    // If conditions are in React Query Builder format, convert to JSONLogic
    if (conditions.combinator) {
      conditions = convertQueryBuilderToJsonLogic(conditions);
    }

    const result = jsonLogic.apply(conditions, context);
    return Boolean(result);
  } catch (error) {
    console.error('[Universal Rule Engine] Error evaluating conditions:', error);
    return false;
  }
}

/**
 * Convert React Query Builder format to JSONLogic
 * @param {object} queryBuilder - Query builder format
 * @returns {object} JSONLogic format
 */
function convertQueryBuilderToJsonLogic(queryBuilder) {
  if (!queryBuilder.rules || queryBuilder.rules.length === 0) {
    return {};
  }

  const combinator = queryBuilder.combinator || 'and';
  const rules = queryBuilder.rules.map(rule => {
    // Nested group
    if (rule.combinator) {
      return convertQueryBuilderToJsonLogic(rule);
    }

    // Single rule
    const { field, operator, value } = rule;

    switch (operator) {
      case '=':
        return { '==': [{ var: field }, value] };
      case '!=':
        return { '!=': [{ var: field }, value] };
      case '<':
        return { '<': [{ var: field }, value] };
      case '<=':
        return { '<=': [{ var: field }, value] };
      case '>':
        return { '>': [{ var: field }, value] };
      case '>=':
        return { '>=': [{ var: field }, value] };
      case 'between':
        return {
          and: [
            { '>=': [{ var: field }, value[0]] },
            { '<=': [{ var: field }, value[1]] }
          ]
        };
      case 'contains':
        return { in: [value, { var: field }] };
      case 'notContains':
        return { '!': { in: [value, { var: field }] } };
      case 'in':
        return { in: [{ var: field }, value] };
      case 'notIn':
        return { '!': { in: [{ var: field }, value] } };
      case 'isEmpty':
        return { '==': [{ var: field }, []] };
      case 'isNotEmpty':
        return { '!=': [{ var: field }, []] };
      case 'startsWith':
        return { startsWith: [{ var: field }, value] };
      case 'endsWith':
        return { endsWith: [{ var: field }, value] };
      default:
        console.warn(`[Universal Rule Engine] Unknown operator: ${operator}`);
        return { '==': [{ var: field }, value] };
    }
  });

  return { [combinator]: rules };
}

/**
 * Execute actions based on rule type
 * @param {object} rule - Rule definition
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Action execution result
 */
async function executeActions(rule, context, orgId, userId, patientId) {
  const { rule_type, actions } = rule;

  console.log(`[Universal Rule Engine] Executing ${rule_type} actions for rule "${rule.name}"`);

  switch (rule_type) {
    case 'task_assignment':
      return await executeTaskAssignmentAction(actions, context, orgId, userId, patientId);
    case 'alert':
      return await executeAlertAction(actions, context, orgId, userId, patientId);
    case 'cds_hook':
      return await executeCdsHookAction(actions, context, orgId, userId, patientId);
    case 'medication_assignment':
      return await executeMedicationAssignmentAction(actions, context, orgId, userId, patientId);
    case 'reminder':
      return await executeReminderAction(actions, context, orgId, userId, patientId);
    case 'notification':
      return await executeNotificationAction(actions, context, orgId, userId, patientId);
    case 'workflow_automation':
      return await executeWorkflowAutomationAction(actions, context, orgId, userId, patientId);
    default:
      console.warn(`[Universal Rule Engine] Unknown rule type: ${rule_type}`);
      return { success: false, error: 'Unknown rule type' };
  }
}

/**
 * Execute task assignment action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Task creation result
 */
async function executeTaskAssignmentAction(actions, context, orgId, userId, patientId) {
  const taskConfig = actions.task;

  if (!taskConfig) {
    throw new Error('Task configuration is required for task_assignment rule type');
  }

  // Calculate due date
  const dueInHours = taskConfig.due_in_hours || 24;
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + dueInHours);

  // Build task data
  const taskData = {
    org_id: orgId,
    description: replaceTokens(taskConfig.description, context),
    priority: taskConfig.priority || 'routine',
    status: taskConfig.status || 'ready',
    category: taskConfig.category,
    due_date: dueDate.toISOString(),
    labels: taskConfig.labels || [],
    intent: 'order',
    task_type: 'internal',
    notes: taskConfig.notes ? replaceTokens(taskConfig.notes, context) : null,
    patient_id: patientId || context.event.patientId,
    assigned_by_user_id: userId,
  };

  // Apply assignment strategy
  if (taskConfig.assignment) {
    await applyAssignmentStrategy(
      taskData,
      taskConfig.assignment.strategy,
      taskConfig.assignment,
      orgId
    );
  }

  // Create the task
  const task = await taskService.createTask(taskData, userId);

  console.log(`[Universal Rule Engine] Task created: ${task.id}`);

  return {
    success: true,
    action_type: 'task_assignment',
    task_id: task.id,
    task
  };
}

/**
 * Execute alert action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Alert creation result
 */
async function executeAlertAction(actions, context, orgId, userId, patientId) {
  const alertConfig = actions.alert;

  if (!alertConfig) {
    throw new Error('Alert configuration is required for alert rule type');
  }

  // Create alert record
  const alertData = {
    org_id: orgId,
    patient_id: patientId,
    severity: alertConfig.severity || 'medium',
    title: replaceTokens(alertConfig.title, context),
    message: replaceTokens(alertConfig.message, context),
    display_on: alertConfig.display_on || ['patient_chart'],
    requires_acknowledgment: alertConfig.requires_acknowledgment || false,
    auto_dismiss_hours: alertConfig.auto_dismiss_hours,
    created_by: userId
  };

  // TODO: Create alert in database (need to create alerts table)
  // For now, log it
  console.log(`[Universal Rule Engine] Alert created:`, alertData);

  // Send notifications to specified users
  if (alertConfig.notify_users && alertConfig.notify_users.length > 0) {
    // TODO: Send notifications
    console.log(`[Universal Rule Engine] Would notify users:`, alertConfig.notify_users);
  }

  return {
    success: true,
    action_type: 'alert',
    alert: alertData
  };
}

/**
 * Execute CDS hook action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} CDS card result
 */
async function executeCdsHookAction(actions, context, orgId, userId, patientId) {
  const cdsConfig = actions.cds;

  if (!cdsConfig) {
    throw new Error('CDS configuration is required for cds_hook rule type');
  }

  // Build CDS cards
  const cards = cdsConfig.cards.map(card => ({
    summary: replaceTokens(card.summary, context),
    indicator: card.indicator || 'info',
    source: card.source,
    suggestions: card.suggestions || []
  }));

  // TODO: Store CDS cards for display
  console.log(`[Universal Rule Engine] CDS cards created:`, cards);

  return {
    success: true,
    action_type: 'cds_hook',
    hook_type: cdsConfig.hook_type,
    cards
  };
}

/**
 * Execute medication assignment action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Medication suggestion result
 */
async function executeMedicationAssignmentAction(actions, context, orgId, userId, patientId) {
  const medConfig = actions.medication;

  if (!medConfig) {
    throw new Error('Medication configuration is required for medication_assignment rule type');
  }

  // Create medication suggestions
  const suggestions = medConfig.medications.map(med => ({
    code: med.code,
    display: med.display,
    dosage: replaceTokens(med.dosage, context),
    route: med.route,
    reason: replaceTokens(med.reason, context),
    requires_approval: medConfig.requires_approval !== false
  }));

  // TODO: Create medication suggestions in database
  console.log(`[Universal Rule Engine] Medication suggestions created:`, suggestions);

  // Notify provider if configured
  if (medConfig.notify_provider) {
    // TODO: Send notification
    console.log(`[Universal Rule Engine] Would notify provider about medication suggestions`);
  }

  return {
    success: true,
    action_type: 'medication_assignment',
    suggestion_type: medConfig.suggestion_type,
    medications: suggestions
  };
}

/**
 * Execute reminder action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Reminder result
 */
async function executeReminderAction(actions, context, orgId, userId, patientId) {
  // TODO: Implement reminder action
  console.log(`[Universal Rule Engine] Reminder action - not yet implemented`);
  return { success: true, action_type: 'reminder' };
}

/**
 * Execute notification action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Notification result
 */
async function executeNotificationAction(actions, context, orgId, userId, patientId) {
  // TODO: Implement notification action
  console.log(`[Universal Rule Engine] Notification action - not yet implemented`);
  return { success: true, action_type: 'notification' };
}

/**
 * Execute workflow automation action
 * @param {object} actions - Action configuration
 * @param {object} context - Evaluation context
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<object>} Workflow result
 */
async function executeWorkflowAutomationAction(actions, context, orgId, userId, patientId) {
  // TODO: Implement workflow automation action
  console.log(`[Universal Rule Engine] Workflow automation action - not yet implemented`);
  return { success: true, action_type: 'workflow_automation' };
}

/**
 * Replace tokens in string with context data
 * @param {string} template - Template string with {{tokens}}
 * @param {object} context - Context object
 * @returns {string} Replaced string
 */
function replaceTokens(template, context) {
  if (!template) return template;

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim());
    return value !== undefined && value !== null ? value : match;
  });
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
      const userByRole = await findUserByRole(target.role, orgId);
      if (userByRole) {
        taskData.assigned_to_user_id = userByRole.id;
      }
      break;

    case 'round_robin':
      const nextUser = await findNextUserRoundRobin(target.pool_id, orgId);
      if (nextUser) {
        taskData.assigned_to_user_id = nextUser.id;
      }
      break;

    case 'workload_balanced':
      const leastBusyUser = await findLeastBusyUser(target.pool_id, orgId);
      if (leastBusyUser) {
        taskData.assigned_to_user_id = leastBusyUser.id;
      }
      break;

    default:
      console.warn(`[Universal Rule Engine] Unknown assignment strategy: ${strategy}`);
  }
}

/**
 * Find user by role
 */
async function findUserByRole(role, orgId) {
  const query = `
    SELECT u.*
    FROM users u
    WHERE u.role = $1 AND u.org_id = $2 AND u.is_active = TRUE
    LIMIT 1
  `;
  const result = await pool.query(query, [role, orgId]);
  return result.rows[0] || null;
}

/**
 * Find next user in round-robin
 */
async function findNextUserRoundRobin(poolId, orgId) {
  const query = `
    SELECT u.*
    FROM users u
    INNER JOIN task_pool_members tpm ON tpm.user_id = u.id
    WHERE tpm.pool_id = $1 AND tpm.is_available = TRUE AND u.is_active = TRUE
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
 */
async function findLeastBusyUser(poolId, orgId) {
  const query = `
    SELECT u.*, COUNT(t.id) as active_task_count
    FROM users u
    INNER JOIN task_pool_members tpm ON tpm.user_id = u.id
    LEFT JOIN tasks t ON t.assigned_to_user_id = u.id
      AND t.status IN ('ready', 'in-progress')
      AND t.deleted_at IS NULL
    WHERE tpm.pool_id = $1 AND tpm.is_available = TRUE AND u.is_active = TRUE
    GROUP BY u.id
    ORDER BY active_task_count ASC, u.created_at ASC
    LIMIT 1
  `;
  const result = await pool.query(query, [poolId]);
  return result.rows[0] || null;
}

/**
 * Log rule execution
 */
async function logRuleExecution(
  ruleId,
  triggerEvent,
  triggerData,
  patientId,
  userId,
  computedVariables,
  conditionsMet,
  actionsResult,
  errorMessage,
  executionTimeMs
) {
  const query = `
    INSERT INTO rule_executions (
      rule_id,
      trigger_event,
      trigger_data,
      patient_id,
      user_id,
      computed_variables,
      conditions_met,
      actions_performed,
      actions_success,
      result_data,
      error_message,
      execution_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  await pool.query(query, [
    ruleId,
    triggerEvent,
    JSON.stringify(triggerData),
    patientId,
    userId,
    JSON.stringify(computedVariables),
    conditionsMet,
    actionsResult ? JSON.stringify([actionsResult.action_type]) : null,
    actionsResult?.success || false,
    actionsResult ? JSON.stringify(actionsResult) : null,
    errorMessage,
    executionTimeMs
  ]);
}

module.exports = {
  evaluateRules,
  evaluateConditions,
  convertQueryBuilderToJsonLogic,
  replaceTokens
};
