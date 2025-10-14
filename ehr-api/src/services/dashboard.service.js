const { pool } = require('../database/connection');

const VALID_ROLE_LEVELS = new Set(['executive', 'clinical', 'operations', 'billing', 'patient', 'general']);
const DEFAULT_ROLE_LEVEL = 'general';
const VALID_DATA_MODES = new Set(['actual', 'demo']);

function normalizeRoleLevel(roleLevel) {
  if (!roleLevel) {
    return DEFAULT_ROLE_LEVEL;
  }

  const normalized = roleLevel.toLowerCase();
  if (VALID_ROLE_LEVELS.has(normalized)) {
    return normalized;
  }

  // map some common synonyms to supported levels
  switch (normalized) {
    case 'admin':
    case 'administrator':
    case 'executive_admin':
      return 'executive';
    case 'clinician':
    case 'practitioner':
    case 'provider':
      return 'clinical';
    case 'front_desk':
    case 'receptionist':
    case 'operations_admin':
      return 'operations';
    case 'finance':
    case 'rcm':
    case 'billing_admin':
      return 'billing';
    case 'patient_portal':
    case 'member':
      return 'patient';
    default:
      return DEFAULT_ROLE_LEVEL;
  }
}

function normalizeDataMode(dataMode) {
  if (!dataMode) {
    return 'actual';
  }
  const normalized = dataMode.toLowerCase();
  return VALID_DATA_MODES.has(normalized) ? normalized : 'actual';
}

function parseDate(value, fallback) {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date;
}

function formatDateForQuery(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchLocationOptions(orgId) {
  if (!orgId) {
    return [];
  }

  const result = await pool.query(
    `SELECT id, name
     FROM locations
     WHERE org_id = $1
     ORDER BY name ASC`,
    [orgId]
  );

  return result.rows.map(row => ({ id: row.id, name: row.name }));
}

async function findSnapshot({
  orgId,
  locationIds,
  roleLevel,
  dataMode,
  periodStart,
  periodEnd
}) {
  const params = [
    roleLevel,
    dataMode,
    orgId || null,
    locationIds && locationIds.length ? locationIds : null,
    formatDateForQuery(periodStart),
    formatDateForQuery(periodEnd)
  ];

  const result = await pool.query(
    `SELECT id, org_id, location_ids, role_level, data_mode, period_start, period_end, payload,
            created_at, updated_at
     FROM dashboard_snapshots
     WHERE role_level = $1
       AND data_mode = $2
       AND ($3::uuid IS NULL OR org_id = $3 OR org_id IS NULL)
       AND ($4::uuid[] IS NULL OR location_ids && $4::uuid[] OR location_ids IS NULL)
       AND period_start <= $6::date
       AND period_end >= $5::date
     ORDER BY
       CASE WHEN org_id = $3 THEN 0 WHEN org_id IS NULL THEN 1 ELSE 2 END,
       CASE WHEN $4::uuid[] IS NOT NULL AND location_ids && $4::uuid[] THEN 0 WHEN location_ids IS NULL THEN 1 ELSE 2 END,
       period_end DESC
     LIMIT 1`,
    params
  );

  return result.rows[0] || null;
}

async function getDashboardOverview(options = {}) {
  const {
    orgId,
    locationIds,
    roleLevel: requestedRoleLevel,
    dataMode: requestedDataMode,
    periodStart: rawPeriodStart,
    periodEnd: rawPeriodEnd,
    allowDemoFallback = true,
    allowRoleFallback = true
  } = options;

  const dataMode = normalizeDataMode(requestedDataMode);
  const roleLevel = normalizeRoleLevel(requestedRoleLevel);

  const periodEnd = parseDate(rawPeriodEnd, new Date());
  const defaultStart = new Date(periodEnd);
  defaultStart.setDate(defaultStart.getDate() - 30);
  const periodStart = parseDate(rawPeriodStart, defaultStart);

  let snapshot = await findSnapshot({ orgId, locationIds, roleLevel, dataMode, periodStart, periodEnd });
  let fallbackUsed = false;
  const fallbackReasons = [];

  if (!snapshot && dataMode === 'actual' && allowDemoFallback) {
    fallbackReasons.push('no_actual_snapshot');
    snapshot = await findSnapshot({ orgId, locationIds, roleLevel, dataMode: 'demo', periodStart, periodEnd });
    fallbackUsed = !!snapshot;
  }

  if (!snapshot && allowRoleFallback && roleLevel !== DEFAULT_ROLE_LEVEL) {
    fallbackReasons.push('no_role_snapshot');
    snapshot = await findSnapshot({ orgId, locationIds, roleLevel: DEFAULT_ROLE_LEVEL, dataMode, periodStart, periodEnd });
    fallbackUsed = fallbackUsed || !!snapshot;
  }

  if (!snapshot && allowRoleFallback && roleLevel !== DEFAULT_ROLE_LEVEL && dataMode === 'actual' && allowDemoFallback) {
    fallbackReasons.push('fallback_to_demo_general');
    snapshot = await findSnapshot({ orgId, locationIds, roleLevel: DEFAULT_ROLE_LEVEL, dataMode: 'demo', periodStart, periodEnd });
    fallbackUsed = fallbackUsed || !!snapshot;
  }

  if (!snapshot) {
    return {
      meta: {
        roleLevel,
        dataMode,
        fallbackUsed: true,
        fallbackReasons: [...fallbackReasons, 'no_snapshot_found']
      },
      summary: [],
      sections: [],
      insights: []
    };
  }

  const payload = snapshot.payload || {};
  const locationOptions = await fetchLocationOptions(orgId);

  return {
    meta: {
      ...(payload.meta || {}),
      roleLevel: snapshot.role_level,
      dataMode: snapshot.data_mode,
      orgId: snapshot.org_id,
      locationIds: snapshot.location_ids,
      period: {
        start: snapshot.period_start,
        end: snapshot.period_end
      },
      generatedAt: snapshot.updated_at,
      fallbackUsed,
      fallbackReasons
    },
    summary: payload.summary || [],
    sections: payload.sections || [],
    insights: payload.insights || [],
    filters: {
      availableLocations: locationOptions,
      supportedRanges: ['7d', '14d', '30d', '60d', 'qtd', 'ytd'],
      ...(payload.filters || {})
    }
  };
}

module.exports = {
  getDashboardOverview
};
