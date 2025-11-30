const pool = require('../config/database');

/**
 * Rule Variable Evaluator Service
 * Computes aggregate, formula, and lookup variables for use in rules
 */

/**
 * Compute a variable's value for a specific patient/context
 * @param {string} variableId - Variable ID
 * @param {string} patientId - Patient ID (optional)
 * @param {object} context - Additional context data
 * @param {string} orgId - Organization ID
 * @returns {Promise<any>} Computed value
 */
async function computeVariable(variableId, patientId, context, orgId) {
  // Get variable definition
  const varQuery = `
    SELECT * FROM rule_variables
    WHERE id = $1 AND org_id = $2 AND is_active = TRUE
  `;
  const varResult = await pool.query(varQuery, [variableId, orgId]);

  if (varResult.rows.length === 0) {
    throw new Error(`Variable ${variableId} not found or inactive`);
  }

  const variable = varResult.rows[0];

  // Check cache
  const cachedValue = await getCachedValue(variableId, patientId);
  if (cachedValue !== null) {
    console.log(`[Variable Evaluator] Using cached value for ${variable.variable_key}`);
    return cachedValue;
  }

  let value;

  switch (variable.computation_type) {
    case 'aggregate':
      value = await computeAggregate(variable, patientId, orgId);
      break;
    case 'formula':
      value = await computeFormula(variable, patientId, context, orgId);
      break;
    case 'lookup':
      value = await computeLookup(variable, patientId, orgId);
      break;
    case 'time_based':
      value = await computeTimeBased(variable, patientId, orgId);
      break;
    default:
      throw new Error(`Unknown computation type: ${variable.computation_type}`);
  }

  // Cache the value
  await cacheValue(variableId, patientId, value, variable.cache_duration_minutes);

  return value;
}

/**
 * Compute all variables used in a rule
 * @param {string[]} variableKeys - Array of variable keys (e.g., ["avg_bp_systolic_24h"])
 * @param {string} patientId - Patient ID
 * @param {object} context - Additional context
 * @param {string} orgId - Organization ID
 * @returns {Promise<object>} Map of variable_key -> computed_value
 */
async function computeVariables(variableKeys, patientId, context, orgId) {
  const results = {};

  if (!variableKeys || variableKeys.length === 0) {
    return results;
  }

  // Get all variable definitions
  const varQuery = `
    SELECT * FROM rule_variables
    WHERE org_id = $1 AND variable_key = ANY($2) AND is_active = TRUE
  `;
  const varResult = await pool.query(varQuery, [orgId, variableKeys]);

  // Compute each variable
  for (const variable of varResult.rows) {
    try {
      const value = await computeVariable(variable.id, patientId, context, orgId);
      results[variable.variable_key] = value;
    } catch (error) {
      console.error(`[Variable Evaluator] Error computing ${variable.variable_key}:`, error);
      results[variable.variable_key] = null;
    }
  }

  return results;
}

/**
 * Compute an aggregate variable
 * @param {object} variable - Variable definition
 * @param {string} patientId - Patient ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<number>} Computed aggregate value
 */
async function computeAggregate(variable, patientId, orgId) {
  const {
    data_source,
    aggregate_function,
    aggregate_field,
    aggregate_filters,
    time_window_hours
  } = variable;

  // Build dynamic query based on data source
  let baseQuery = '';
  let whereConditions = ['org_id = $1'];
  const params = [orgId];
  let paramIndex = 2;

  // Map data sources to tables
  const tableMap = {
    'observations': 'fhir_observations',
    'medications': 'fhir_medication_requests',
    'appointments': 'fhir_appointments',
    'lab_results': 'fhir_observations',
    'conditions': 'fhir_conditions',
    'procedures': 'fhir_procedures'
  };

  const tableName = tableMap[data_source] || data_source;

  // Patient filter
  if (patientId) {
    whereConditions.push(`subject_reference = $${paramIndex}`);
    params.push(`Patient/${patientId}`);
    paramIndex++;
  }

  // Time window filter
  if (time_window_hours) {
    whereConditions.push(`effective_date_time >= NOW() - INTERVAL '${time_window_hours} hours'`);
  }

  // Additional filters from aggregate_filters
  if (aggregate_filters && typeof aggregate_filters === 'object') {
    for (const [filterKey, filterValue] of Object.entries(aggregate_filters)) {
      if (filterKey.includes('_coding_')) {
        // Handle JSONB coding fields
        const parts = filterKey.split('_coding_');
        const jsonbField = parts[0];
        const codingField = parts[1];
        whereConditions.push(`${jsonbField}->0->'coding'->0->>'${codingField}' = $${paramIndex}`);
      } else if (filterKey.includes('->')) {
        // Direct JSONB path
        whereConditions.push(`${filterKey} = $${paramIndex}`);
      } else {
        // Regular column
        whereConditions.push(`${filterKey} = $${paramIndex}`);
      }
      params.push(filterValue);
      paramIndex++;
    }
  }

  // Build aggregate function
  let aggregateExpr;
  switch (aggregate_function) {
    case 'sum':
      aggregateExpr = `COALESCE(SUM((${aggregate_field})::numeric), 0)`;
      break;
    case 'avg':
      aggregateExpr = `COALESCE(AVG((${aggregate_field})::numeric), 0)`;
      break;
    case 'count':
      aggregateExpr = `COUNT(*)`;
      break;
    case 'min':
      aggregateExpr = `MIN((${aggregate_field})::numeric)`;
      break;
    case 'max':
      aggregateExpr = `MAX((${aggregate_field})::numeric)`;
      break;
    case 'last':
      aggregateExpr = `(
        SELECT ${aggregate_field}
        FROM ${tableName}
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY effective_date_time DESC NULLS LAST, created_at DESC
        LIMIT 1
      )`;
      break;
    case 'first':
      aggregateExpr = `(
        SELECT ${aggregate_field}
        FROM ${tableName}
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY effective_date_time ASC NULLS LAST, created_at ASC
        LIMIT 1
      )`;
      break;
    default:
      throw new Error(`Unknown aggregate function: ${aggregate_function}`);
  }

  // Execute query
  const query = `
    SELECT ${aggregateExpr} as result
    FROM ${tableName}
    WHERE ${whereConditions.join(' AND ')}
  `;

  console.log(`[Variable Evaluator] Executing aggregate query:`, query, params);

  const result = await pool.query(query, params);
  const value = result.rows[0]?.result;

  // Convert to appropriate type
  if (variable.result_type === 'number') {
    return value !== null && value !== undefined ? parseFloat(value) : null;
  }

  return value;
}

/**
 * Compute a formula variable
 * @param {object} variable - Variable definition
 * @param {string} patientId - Patient ID
 * @param {object} context - Context with other computed variables
 * @param {string} orgId - Organization ID
 * @returns {Promise<any>} Computed formula result
 */
async function computeFormula(variable, patientId, context, orgId) {
  const { formula } = variable;

  if (!formula) {
    throw new Error('Formula is required for formula type variables');
  }

  // Extract variable references from formula
  const varRegex = /\{\{var\.([^}]+)\}\}/g;
  const varMatches = [...formula.matchAll(varRegex)];
  const requiredVars = varMatches.map(m => m[1]);

  // Compute dependent variables if not in context
  const computedVars = context?.var || {};
  for (const varKey of requiredVars) {
    if (!(varKey in computedVars)) {
      // Get variable definition
      const varQuery = `
        SELECT id FROM rule_variables
        WHERE org_id = $1 AND variable_key = $2 AND is_active = TRUE
      `;
      const varResult = await pool.query(varQuery, [orgId, varKey]);

      if (varResult.rows.length > 0) {
        computedVars[varKey] = await computeVariable(varResult.rows[0].id, patientId, context, orgId);
      }
    }
  }

  // Replace variables in formula
  let evaluableFormula = formula;
  for (const [varKey, value] of Object.entries(computedVars)) {
    const regex = new RegExp(`\\{\\{var\\.${varKey}\\}\\}`, 'g');
    evaluableFormula = evaluableFormula.replace(regex, value !== null ? value : 'null');
  }

  // Safely evaluate formula
  try {
    // Use Function constructor for safer eval
    const func = new Function(`return (${evaluableFormula});`);
    const result = func();

    return result;
  } catch (error) {
    console.error(`[Variable Evaluator] Error evaluating formula:`, error);
    throw new Error(`Formula evaluation failed: ${error.message}`);
  }
}

/**
 * Compute a lookup variable
 * @param {object} variable - Variable definition
 * @param {string} patientId - Patient ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<any>} Looked up value
 */
async function computeLookup(variable, patientId, orgId) {
  const { lookup_table, lookup_key, lookup_value } = variable;

  const query = `
    SELECT ${lookup_value} as result
    FROM ${lookup_table}
    WHERE org_id = $1 AND ${lookup_key} = $2
    LIMIT 1
  `;

  const result = await pool.query(query, [orgId, patientId]);
  return result.rows[0]?.result || null;
}

/**
 * Compute a time-based variable
 * @param {object} variable - Variable definition
 * @param {string} patientId - Patient ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<any>} Computed value
 */
async function computeTimeBased(variable, patientId, orgId) {
  // Similar to aggregate but with more time-specific logic
  return computeAggregate(variable, patientId, orgId);
}

/**
 * Get cached variable value
 * @param {string} variableId - Variable ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<any|null>} Cached value or null
 */
async function getCachedValue(variableId, patientId) {
  // TODO: Implement Redis caching
  // For now, return null (no cache)
  return null;
}

/**
 * Cache variable value
 * @param {string} variableId - Variable ID
 * @param {string} patientId - Patient ID
 * @param {any} value - Value to cache
 * @param {number} durationMinutes - Cache duration in minutes
 * @returns {Promise<void>}
 */
async function cacheValue(variableId, patientId, value, durationMinutes) {
  // TODO: Implement Redis caching
  // For now, no-op
}

/**
 * Test a variable computation with sample data
 * @param {object} variable - Variable definition
 * @param {string} patientId - Patient ID for testing
 * @param {string} orgId - Organization ID
 * @returns {Promise<object>} Test result with value and debug info
 */
async function testVariable(variable, patientId, orgId) {
  const startTime = Date.now();

  try {
    const value = await computeVariable(variable.id, patientId, {}, orgId);

    return {
      success: true,
      value,
      result_type: variable.result_type,
      unit: variable.unit,
      execution_time_ms: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      execution_time_ms: Date.now() - startTime
    };
  }
}

module.exports = {
  computeVariable,
  computeVariables,
  testVariable,
  computeAggregate,
  computeFormula,
  computeLookup
};
