const { pool } = require('../database/connection');

const DEFAULT_SETTINGS = {
  http_requests: {
    enabled: true,
    retention_days: 180,
    redact_fields: ['password', 'token', 'secret', 'authorization']
  },
  data_changes: {
    enabled: true,
    capture_diffs: true,
    retention_days: 2555
  },
  authentication: {
    enabled: true,
    retention_days: 2555
  },
  administration: {
    enabled: true,
    retention_days: 2555
  },
  security: {
    enabled: true,
    retention_days: 2555
  }
};

const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class AuditService {
  constructor() {
    this.settingsCache = new Map();
  }

  /**
   * Compute simple diff between before and after payloads
   */
  computeChanges(before, after) {
    if (!before && !after) {
      return undefined;
    }

    const beforeObj = before || {};
    const afterObj = after || {};
    const fields = new Set([
      ...Object.keys(beforeObj),
      ...Object.keys(afterObj)
    ]);

    const changes = [];

    for (const field of fields) {
      const beforeValue = beforeObj[field];
      const afterValue = afterObj[field];

      if (this.areValuesEqual(beforeValue, afterValue)) {
        continue;
      }

      changes.push({ field, before: beforeValue, after: afterValue });
    }

    return changes.length > 0 ? changes : undefined;
  }

  areValuesEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  async getSettings(orgId, client) {
    if (!orgId) {
      return DEFAULT_SETTINGS;
    }

    const cached = this.settingsCache.get(orgId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const executor = client || pool;
    const { rows } = await executor.query(
      'SELECT preference_key, enabled, config FROM audit_settings WHERE org_id = $1',
      [orgId]
    );

    const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

    for (const row of rows) {
      const config = typeof row.config === 'string' ? JSON.parse(row.config) : row.config || {};
      settings[row.preference_key] = {
        ...(DEFAULT_SETTINGS[row.preference_key] || { enabled: true }),
        ...config,
        enabled: row.enabled
      };
    }

    this.settingsCache.set(orgId, {
      value: settings,
      expiresAt: Date.now() + SETTINGS_CACHE_TTL
    });

    return settings;
  }

  invalidateSettings(orgId) {
    if (orgId) {
      this.settingsCache.delete(orgId);
    }
  }

  async updateSettings(orgId, updates, actorUserId) {
    if (!orgId) {
      throw new Error('Organization context is required to update audit settings');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(updates)) {
        const defaultConfig = DEFAULT_SETTINGS[key] || { enabled: true };
        const enabled = value.enabled ?? defaultConfig.enabled;
        const config = { ...defaultConfig, ...value };
        delete config.enabled;

        await client.query(
          `INSERT INTO audit_settings (org_id, preference_key, enabled, config, updated_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (org_id, preference_key)
           DO UPDATE SET enabled = EXCLUDED.enabled,
                         config = EXCLUDED.config,
                         updated_at = CURRENT_TIMESTAMP,
                         updated_by = EXCLUDED.updated_by`,
          [orgId, key, enabled, JSON.stringify(config), actorUserId || null]
        );
      }

      await this.logEvent({
        orgId,
        actorUserId,
        action: 'AUDIT.SETTINGS_UPDATED',
        targetType: 'AuditSettings',
        targetId: orgId,
        targetName: 'Audit Trail Settings',
        category: 'administration',
        status: 'success',
        metadata: { updates }
      }, { client, skipSettingsCheck: true });

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    this.invalidateSettings(orgId);

    return this.getSettings(orgId);
  }

  shouldLog(settings, category) {
    if (!category) {
      return true;
    }
    const preference = settings[category];
    if (!preference) {
      return true;
    }
    return preference.enabled !== false;
  }

  resolveCategory(action, explicitCategory) {
    if (explicitCategory) {
      return explicitCategory;
    }

    if (!action) {
      return 'system';
    }

    if (action.startsWith('AUTH.')) {
      return 'authentication';
    }
    if (action.startsWith('SECURITY.')) {
      return 'security';
    }
    if (action.startsWith('ORG.') || action.startsWith('ROLE.') || action.startsWith('USER.') || action.startsWith('AUDIT.')) {
      return 'administration';
    }
    if (action.startsWith('HTTP.')) {
      return 'http_requests';
    }
    return 'data_changes';
  }

  sanitizePayload(payload = {}, redactFields = []) {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const clone = Array.isArray(payload) ? payload.map(item => this.sanitizePayload(item, redactFields)) : { ...payload };

    for (const field of Object.keys(clone)) {
      if (redactFields.includes(field.toLowerCase())) {
        clone[field] = '***REDACTED***';
        continue;
      }

      if (typeof clone[field] === 'object') {
        clone[field] = this.sanitizePayload(clone[field], redactFields);
      }
    }

    return clone;
  }

  async logEvent(event, options = {}) {
    const {
      orgId,
      actorUserId = null,
      action,
      targetType,
      targetId = null,
      targetName = null,
      status = 'success',
      errorMessage = null,
      metadata = {},
      ipAddress = null,
      userAgent = null,
      sessionId = null,
      requestId = null,
      category: explicitCategory = null,
      before = null,
      after = null
    } = event;

    if (!orgId || !action || !targetType) {
      return;
    }

    const executor = options.client || pool;
    const settings = await this.getSettings(orgId, options.client);
    const category = this.resolveCategory(action, explicitCategory);

    if (!options.skipSettingsCheck && !this.shouldLog(settings, category)) {
      return;
    }

    const preference = settings[category] || {};
    const redactFields = (preference.redact_fields || preference.redactFields || []).map(field => field.toLowerCase());

    const metadataPayload = {
      ...metadata
    };

    if (before || after) {
      const changes = this.computeChanges(before, after);
      if (changes) {
        metadataPayload.changes = changes;
      }
    }

    if (metadataPayload.requestBody) {
      metadataPayload.requestBody = this.sanitizePayload(metadataPayload.requestBody, redactFields);
    }

    if (metadataPayload.responseBody) {
      metadataPayload.responseBody = this.sanitizePayload(metadataPayload.responseBody, redactFields);
    }

    try {
      await executor.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, category, status, error_message, metadata,
          ip_address, user_agent, session_id, request_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)` ,
        [
          orgId,
          actorUserId,
          action,
          targetType,
          targetId,
          targetName,
          category,
          status,
          errorMessage,
          JSON.stringify(metadataPayload),
          ipAddress,
          userAgent,
          sessionId,
          requestId
        ]
      );
    } catch (error) {
      console.error('Failed to persist audit event:', error.message);
    }
  }

  async logHttpRequest(event) {
    const {
      orgId,
      actorUserId,
      method,
      path,
      statusCode,
      durationMs,
      requestBody,
      responseBody,
      ipAddress,
      userAgent,
      sessionId,
      requestId
    } = event;

    if (!orgId) {
      return;
    }

    const settings = await this.getSettings(orgId);

    if (!this.shouldLog(settings, 'http_requests')) {
      return;
    }

    const preference = settings.http_requests || {};
    const redactions = (preference.redact_fields || preference.redactFields || []).map(field => field.toLowerCase());
    const payload = {
      method,
      path,
      statusCode,
      durationMs,
      requestBody: this.sanitizePayload(requestBody, redactions),
      responseBody: this.sanitizePayload(responseBody, redactions)
    };

    await this.logEvent({
      orgId,
      actorUserId,
      action: 'HTTP.REQUEST',
      targetType: 'HTTPRequest',
      targetId: null,
      targetName: path,
      category: 'http_requests',
      status: statusCode >= 400 ? 'failure' : 'success',
      metadata: payload,
      ipAddress,
      userAgent,
      sessionId,
      requestId
    }, { skipSettingsCheck: true });
  }

  async logSecurityViolation(event) {
    await this.logEvent({
      orgId: event.orgId,
      actorUserId: event.actorUserId,
      action: 'SECURITY.VIOLATION',
      targetType: event.targetType || 'SecurityViolation',
      targetId: event.targetId || null,
      targetName: event.targetName || event.endpoint,
      category: 'security',
      status: 'failure',
      metadata: {
        endpoint: event.endpoint,
        method: event.method,
        details: event.details
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      requestId: event.requestId
    }, { skipSettingsCheck: true });
  }

  async fetchEvents(orgId, filters = {}) {
    const {
      limit = 50,
      offset = 0,
      status,
      action,
      category,
      actorUserId,
      targetType,
      search,
      from,
      to
    } = filters;

    const params = [orgId];
    const where = ['org_id = $1'];
    let idx = 2;

    if (status) {
      where.push(`status = $${idx++}`);
      params.push(status);
    }

    if (action) {
      where.push(`action = $${idx++}`);
      params.push(action);
    }

    if (category) {
      where.push(`category = $${idx++}`);
      params.push(category);
    }

    if (actorUserId) {
      where.push(`actor_user_id = $${idx++}`);
      params.push(actorUserId);
    }

    if (targetType) {
      where.push(`target_type = $${idx++}`);
      params.push(targetType);
    }

    if (from) {
      where.push(`created_at >= $${idx++}`);
      params.push(new Date(from));
    }

    if (to) {
      where.push(`created_at <= $${idx++}`);
      params.push(new Date(to));
    }

    if (search) {
      where.push(`(
        target_name ILIKE $${idx} OR
        action ILIKE $${idx} OR
        target_type ILIKE $${idx} OR
        COALESCE(metadata::text, '') ILIKE $${idx}
      )`);
      params.push(`%${search}%`);
      idx += 1;
    }

    const safeLimit = Math.min(limit, 200);

    const query = `
      SELECT
        id,
        action,
        actor_user_id,
        target_type,
        target_id,
        target_name,
        category,
        status,
        error_message,
        metadata,
        ip_address,
        user_agent,
        session_id,
        request_id,
        created_at,
        COUNT(*) OVER() AS total_count
      FROM audit_events
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    const { rows } = await pool.query(query, params);

    return {
      total: rows[0]?.total_count ? parseInt(rows[0].total_count, 10) : 0,
      events: rows.map(row => ({
        ...row,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {}
      }))
    };
  }

  async exportEvents(orgId, filters = {}) {
    const data = await this.fetchEvents(orgId, { ...filters, limit: 5000, offset: 0 });
    const headers = ['Timestamp', 'Action', 'Category', 'Status', 'Actor', 'Target', 'Target Type', 'IP Address', 'Details'];

    const rows = data.events.map(event => ([
      new Date(event.created_at).toISOString(),
      event.action,
      event.category,
      event.status,
      event.actor_user_id || '',
      event.target_name || '',
      event.target_type || '',
      event.ip_address || '',
      JSON.stringify(event.metadata || {})
    ]));

    return [headers, ...rows]
      .map(columns => columns.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}

module.exports = new AuditService();
