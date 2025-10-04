const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123',
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Query helper with organization context
async function query(text, params, orgContext) {
  const client = await pool.connect();
  try {
    // Set session variables for RLS if org context provided
    if (orgContext?.org_id) {
      await client.query(`SET app.current_org_id = '${orgContext.org_id}'`);
    }
    if (orgContext?.user_role) {
      await client.query(`SET app.current_user_role = '${orgContext.user_role}'`);
    }

    const result = await client.query(text, params);
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

module.exports = {
  pool,
  query,
  transaction,
  escapeIdentifier,
  buildOrgFilter,
  buildLocationFilter,
};
