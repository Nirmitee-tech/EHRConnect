const { query } = require('../database/connection');

/**
 * Synchronize the denormalized location_ids column on the users table (if present)
 * with the active role assignments for the given user.
 *
 * @param {Object} options
 * @param {string} options.userId - Target user ID
 * @param {string|null} [options.orgId] - Optional organization filter
 * @param {import('pg').PoolClient} [options.client] - Optional transaction client
 * @returns {Promise<string[]>} Array of active location IDs for the user
 */
async function syncUserLocations({ userId, orgId = null, client = null }) {
  const run = client ? client.query.bind(client) : query;

  const { rows } = await run(
    `SELECT
       ARRAY_AGG(DISTINCT location_id) FILTER (WHERE location_id IS NOT NULL) AS location_ids
     FROM role_assignments
     WHERE user_id = $1
       AND ($2::uuid IS NULL OR org_id = $2)
       AND revoked_at IS NULL`,
    [userId, orgId]
  );

  const locationIds = (rows[0]?.location_ids || []).filter(Boolean);

  try {
    await run(
      'UPDATE users SET location_ids = $1 WHERE id = $2',
      [locationIds, userId]
    );
  } catch (error) {
    // Ignore missing column errors (postgres code 42703) to stay backward compatible
    if (error.code !== '42703') {
      throw error;
    }
  }

  return locationIds;
}

module.exports = {
  syncUserLocations,
};
