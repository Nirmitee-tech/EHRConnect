/**
 * Safe Database Query Wrapper
 * 
 * Provides guaranteed connection release even in error cases.
 * Prevents connection pool exhaustion from leaked connections.
 * 
 * Usage:
 *   const { safeQuery, safeTransaction } = require('./utils/safe-db');
 *   
 *   // Automatically releases connection
 *   const result = await safeQuery('SELECT * FROM users WHERE id = $1', [userId]);
 *   
 *   // Automatically commits/rollbacks and releases
 *   await safeTransaction(async (client) => {
 *     await client.query('INSERT...');
 *     await client.query('UPDATE...');
 *   });
 */

const { pool } = require('../database/connection');
const logger = require('./logger');

/**
 * Execute query with guaranteed connection release
 */
async function safeQuery(text, params, options = {}) {
  const { timeout = 30000, orgContext } = options;
  
  const client = await pool.connect();
  const startTime = Date.now();
  
  try {
    // Set query timeout
    await client.query(`SET statement_timeout = ${timeout}`);
    
    // Set org context if provided
    if (orgContext?.org_id) {
      await client.query(`SET app.current_org_id = '${orgContext.org_id}'`);
    }
    if (orgContext?.user_role) {
      await client.query(`SET app.current_user_role = '${orgContext.user_role}'`);
    }

    const result = await client.query(text, params);
    
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        duration: `${duration}ms`,
        query: text.substring(0, 100),
        rowCount: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Query error', {
      duration: `${duration}ms`,
      query: text.substring(0, 100),
      error: error.message,
      code: error.code
    });
    throw error;
  } finally {
    // GUARANTEED release - even if there's an error
    try {
      client.release();
    } catch (releaseError) {
      logger.error('Error releasing connection', {
        error: releaseError.message
      });
      // Force destroy the connection if release fails
      try {
        client.release(true);
      } catch (destroyError) {
        logger.error('Error destroying connection', {
          error: destroyError.message
        });
      }
    }
  }
}

/**
 * Execute transaction with guaranteed connection release
 */
async function safeTransaction(callback, options = {}) {
  const { timeout = 30000, orgContext, isolationLevel = 'READ COMMITTED' } = options;
  
  const client = await pool.connect();
  const startTime = Date.now();
  
  try {
    // Set query timeout
    await client.query(`SET statement_timeout = ${timeout}`);
    
    // Set isolation level
    await client.query(`BEGIN ISOLATION LEVEL ${isolationLevel}`);
    
    // Set org context if provided
    if (orgContext?.org_id) {
      await client.query(`SET app.current_org_id = '${orgContext.org_id}'`);
    }
    if (orgContext?.user_role) {
      await client.query(`SET app.current_user_role = '${orgContext.user_role}'`);
    }

    const result = await callback(client);
    
    await client.query('COMMIT');
    
    const duration = Date.now() - startTime;
    if (duration > 2000) {
      logger.warn('Slow transaction detected', {
        duration: `${duration}ms`
      });
    }
    
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error('Error rolling back transaction', {
        error: rollbackError.message
      });
    }
    
    const duration = Date.now() - startTime;
    logger.error('Transaction error', {
      duration: `${duration}ms`,
      error: error.message,
      code: error.code
    });
    throw error;
  } finally {
    // GUARANTEED release - even if commit/rollback fails
    try {
      client.release();
    } catch (releaseError) {
      logger.error('Error releasing connection', {
        error: releaseError.message
      });
      // Force destroy the connection if release fails
      try {
        client.release(true);
      } catch (destroyError) {
        logger.error('Error destroying connection', {
          error: destroyError.message
        });
      }
    }
  }
}

/**
 * Execute multiple queries in parallel (READ-ONLY operations)
 */
async function safeParallelQueries(queries, options = {}) {
  const { timeout = 30000 } = options;
  
  const promises = queries.map(({ text, params, orgContext }) =>
    safeQuery(text, params, { timeout, orgContext })
  );
  
  return await Promise.all(promises);
}

/**
 * Execute batch of queries with connection reuse
 */
async function safeBatch(queries, options = {}) {
  const { timeout = 30000, orgContext } = options;
  
  const client = await pool.connect();
  const startTime = Date.now();
  const results = [];
  
  try {
    await client.query(`SET statement_timeout = ${timeout}`);
    
    if (orgContext?.org_id) {
      await client.query(`SET app.current_org_id = '${orgContext.org_id}'`);
    }

    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    const duration = Date.now() - startTime;
    logger.debug('Batch queries completed', {
      count: queries.length,
      duration: `${duration}ms`
    });
    
    return results;
  } catch (error) {
    logger.error('Batch query error', {
      error: error.message,
      completedQueries: results.length,
      totalQueries: queries.length
    });
    throw error;
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      logger.error('Error releasing connection', {
        error: releaseError.message
      });
      try {
        client.release(true);
      } catch (destroyError) {
        logger.error('Error destroying connection', {
          error: destroyError.message
        });
      }
    }
  }
}

/**
 * Health check - verify database connectivity
 */
async function healthCheck() {
  try {
    const result = await safeQuery('SELECT 1 as health', [], { timeout: 5000 });
    return {
      healthy: result.rows[0].health === 1,
      latency: Date.now()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}

module.exports = {
  safeQuery,
  safeTransaction,
  safeParallelQueries,
  safeBatch,
  healthCheck,
};
