const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database connection pool with optimized configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123',
  // Connection pool configuration (optimized for performance)
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '5'),  // Minimum pool size  
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail after 5s if no connection available
  // Additional optimizations
  allowExitOnIdle: false, // Keep pool alive when no active connections
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30s query timeout
});

// Log configuration on startup (production-safe)
logger.info('Database pool configured', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  max: pool.options.max,
  min: pool.options.min,
});

// Monitor pool health
pool.on('connect', (client) => {
  logger.debug('Database connection established');
  // Set application name for query tracking
  client.query('SET application_name = $1', ['ehr-api']).catch(err => {
    logger.warn('Failed to set application name', { error: err.message });
  });
});

pool.on('error', (err, client) => {
  logger.error('Unexpected database pool error', {
    error: err.message,
    stack: err.stack,
    code: err.code
  });
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

// Query helper with organization context and performance monitoring
async function query(text, params, orgContext) {
  const client = await pool.connect();
  const startTime = Date.now();
  
  try {
    // Set session variables for RLS if org context provided
    if (orgContext?.org_id) {
      await client.query(`SET app.current_org_id = '${orgContext.org_id}'`);
    }
    if (orgContext?.user_role) {
      await client.query(`SET app.current_user_role = '${orgContext.user_role}'`);
    }

    const result = await client.query(text, params);
    
    // Log slow queries (> 1 second)
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        duration: `${duration}ms`,
        query: text.substring(0, 200), // First 200 chars
        rowCount: result.rowCount,
        orgId: orgContext?.org_id
      });
    } else if (duration > 500) {
      logger.debug('Query executed', {
        duration: `${duration}ms`,
        rowCount: result.rowCount
      });
    }
    
    return result;
  } finally {
    client.release();
  }
}

// Transaction helper
async function transaction(callback, orgContext) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Set session variables for RLS
    if (orgContext?.org_id) {
      await client.query(`SET app.current_org_id = '${orgContext.org_id}'`);
    }
    if (orgContext?.user_role) {
      await client.query(`SET app.current_user_role = '${orgContext.user_role}'`);
    }

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Helper to safely escape SQL identifiers
function escapeIdentifier(str) {
  return `"${str.replace(/"/g, '""')}"`;
}

// Helper to build WHERE clauses for org isolation
function buildOrgFilter(orgId, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return {
    text: `${prefix}org_id = $1`,
    params: [orgId]
  };
}

// Helper to build location filter
function buildLocationFilter(locationIds, alias = '', paramOffset = 0) {
  if (!locationIds || locationIds.length === 0) {
    return { text: '1=1', params: [] };
  }
  
  const prefix = alias ? `${alias}.` : '';
  const placeholders = locationIds.map((_, i) => `$${i + paramOffset + 1}`).join(', ');
  
  return {
    text: `${prefix}location_id IN (${placeholders})`,
    params: locationIds
  };
}

// Get connection pool statistics
function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    max: pool.options.max,
    min: pool.options.min,
  };
}

module.exports = {
  pool,
  query,
  transaction,
  escapeIdentifier,
  buildOrgFilter,
  buildLocationFilter,
  getPoolStats,
};
