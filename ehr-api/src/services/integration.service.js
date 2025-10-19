const { v4: uuidv4 } = require('uuid');

/**
 * Integration Service
 * Manages third-party integrations and their lifecycle
 */
class IntegrationService {
  constructor() {
    this.activeIntegrations = new Map(); // In-memory store for active integrations
    this.integrationHandlers = new Map(); // Registered handlers per vendor
  }

  /**
   * Register an integration handler
   */
  registerHandler(vendorId, handler) {
    this.integrationHandlers.set(vendorId, handler);
    console.log(`✓ Registered handler for: ${vendorId}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const camelCaseObj = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCaseObj[camelKey] = obj[key];
    }
    return camelCaseObj;
  }

  /**
   * Get all integrations for an organization
   */
  async getIntegrations(db, { orgId, activeOnly = false, vendorId = null }) {
    try {
      let query = `
        SELECT
          id, org_id, vendor_id, enabled, environment,
          api_endpoint, credentials, usage_mappings,
          health_status, last_tested_at, last_error,
          created_at, updated_at, created_by, updated_by
        FROM integrations
        WHERE org_id = $1
      `;
      const params = [orgId];
      let paramIndex = 2;

      if (activeOnly) {
        query += ` AND enabled = true`;
      }

      if (vendorId) {
        query += ` AND vendor_id = $${paramIndex}`;
        params.push(vendorId);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;

      const result = await db.query(query, params);

      // Convert to camelCase for frontend
      return result.rows.map(row => this.toCamelCase(row));
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }

  /**
   * Get a single integration by ID
   */
  async getIntegration(db, integrationId) {
    try {
      const result = await db.query(
        'SELECT * FROM integrations WHERE id = $1',
        [integrationId]
      );
      return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching integration:', error);
      throw error;
    }
  }

  /**
   * Create a new integration
   */
  async createIntegration(db, data) {
    try {
      const id = uuidv4();

      const result = await db.query(
        `INSERT INTO integrations (
          id, org_id, vendor_id, enabled, environment,
          api_endpoint, credentials, usage_mappings,
          health_status, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          id,
          data.orgId,
          data.vendorId,
          data.enabled,
          data.environment,
          data.apiEndpoint,
          JSON.stringify(data.credentials),
          JSON.stringify(data.usageMappings),
          'inactive',
          data.createdBy || null, // Allow null if no user ID
          data.createdBy || null
        ]
      );

      // Log activity
      await this.logActivity(db, id, 'created', 'success', {}, data.createdBy || null);

      return this.toCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  /**
   * Update an integration
   */
  async updateIntegration(db, integrationId, data) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.enabled !== undefined) {
        fields.push(`enabled = $${paramIndex++}`);
        values.push(data.enabled);
      }

      if (data.environment) {
        fields.push(`environment = $${paramIndex++}`);
        values.push(data.environment);
      }

      if (data.api_endpoint !== undefined) {
        fields.push(`api_endpoint = $${paramIndex++}`);
        values.push(data.api_endpoint);
      }

      if (data.credentials) {
        fields.push(`credentials = $${paramIndex++}`);
        values.push(JSON.stringify(data.credentials));
      }

      if (data.usage_mappings) {
        fields.push(`usage_mappings = $${paramIndex++}`);
        values.push(JSON.stringify(data.usage_mappings));
      }

      if (data.updatedBy) {
        fields.push(`updated_by = $${paramIndex++}`);
        values.push(data.updatedBy);
      }

      if (fields.length === 0) {
        return await this.getIntegration(db, integrationId);
      }

      values.push(integrationId);
      const query = `
        UPDATE integrations
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows[0]) {
        await this.logActivity(db, integrationId, 'updated', 'success', data, data.updatedBy);
      }

      return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  /**
   * Delete an integration
   */
  async deleteIntegration(db, integrationId) {
    try {
      // Stop integration if running
      await this.stopIntegration(integrationId);

      const result = await db.query(
        'DELETE FROM integrations WHERE id = $1 RETURNING id',
        [integrationId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }

  /**
   * Toggle integration enabled status
   */
  async toggleIntegration(db, integrationId, enabled) {
    try {
      const result = await db.query(
        `UPDATE integrations
         SET enabled = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [enabled, integrationId]
      );

      if (result.rows[0]) {
        await this.logActivity(
          db,
          integrationId,
          enabled ? 'enabled' : 'disabled',
          'success',
          {},
          null
        );
      }

      return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
    } catch (error) {
      console.error('Error toggling integration:', error);
      throw error;
    }
  }

  /**
   * Test integration connection
   */
  async testConnection(db, integrationId) {
    try {
      const integration = await this.getIntegration(db, integrationId);

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Update status to testing
      await db.query(
        `UPDATE integrations
         SET health_status = 'testing', last_tested_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [integrationId]
      );

      const handler = this.integrationHandlers.get(integration.vendor_id);

      let success = false;
      let errorMessage = null;

      if (!handler) {
        errorMessage = `No handler registered for ${integration.vendor_id}`;
        console.warn(errorMessage);
      } else {
        try {
          success = await handler.testConnection(integration);
        } catch (error) {
          errorMessage = error.message;
          console.error('Connection test error:', error);
        }
      }

      // Update health status
      await db.query(
        `UPDATE integrations
         SET health_status = $1, last_error = $2, last_tested_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [success ? 'active' : 'error', errorMessage, integrationId]
      );

      // Log activity
      await this.logActivity(
        db,
        integrationId,
        'tested',
        success ? 'success' : 'error',
        {},
        null,
        errorMessage
      );

      return {
        success,
        message: success ? 'Connection test successful' : 'Connection test failed',
        data: { errorMessage }
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  /**
   * Initialize an integration
   */
  async initializeIntegration(integration) {
    try {
      console.log(`⚡ Initializing: ${integration.vendor_id} (${integration.environment})`);

      const handler = this.integrationHandlers.get(integration.vendor_id);

      if (!handler) {
        console.warn(`⚠ No handler registered for: ${integration.vendor_id}`);
        this.activeIntegrations.set(integration.id, integration);
        return;
      }

      await handler.initialize(integration);
      this.activeIntegrations.set(integration.id, integration);

      console.log(`✓ ${integration.vendor_id} initialized`);
    } catch (error) {
      console.error(`Failed to initialize ${integration.vendor_id}:`, error);
      throw error;
    }
  }

  /**
   * Stop an integration
   */
  async stopIntegration(integrationId) {
    this.activeIntegrations.delete(integrationId);
    console.log(`⊘ Stopped integration: ${integrationId}`);
  }

  /**
   * Execute an integration operation
   */
  async executeIntegration(integrationId, operation, params) {
    const integration = this.activeIntegrations.get(integrationId);

    if (!integration) {
      throw new Error(`Integration not found or not active: ${integrationId}`);
    }

    const handler = this.integrationHandlers.get(integration.vendor_id);

    if (!handler) {
      throw new Error(`No handler registered for: ${integration.vendor_id}`);
    }

    return await handler.execute(integration, operation, params);
  }

  /**
   * Get health status for all integrations in an organization
   */
  async getHealthStatus(db, orgId) {
    try {
      const integrations = await this.getIntegrations(db, { orgId });

      const healthStatus = integrations.map(integration => ({
        id: integration.id,
        vendor_id: integration.vendor_id,
        enabled: integration.enabled,
        health_status: integration.health_status,
        environment: integration.environment,
        last_tested_at: integration.last_tested_at,
        last_error: integration.last_error,
        is_active: this.activeIntegrations.has(integration.id)
      }));

      const summary = {
        total: integrations.length,
        enabled: integrations.filter(i => i.enabled).length,
        active: integrations.filter(i => i.health_status === 'active').length,
        errors: integrations.filter(i => i.health_status === 'error').length,
        inactive: integrations.filter(i => i.health_status === 'inactive').length
      };

      return { integrations: healthStatus, summary };
    } catch (error) {
      console.error('Error getting health status:', error);
      throw error;
    }
  }

  /**
   * Perform health checks for all active integrations
   */
  async performHealthChecks(db, orgId) {
    try {
      const integrations = await this.getIntegrations(db, { orgId, activeOnly: true });

      for (const integration of integrations) {
        try {
          await this.testConnection(db, integration.id);
        } catch (error) {
          console.error(`Health check failed for ${integration.vendor_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error performing health checks:', error);
      throw error;
    }
  }

  /**
   * Log integration activity
   */
  async logActivity(db, integrationId, activityType, status, details, createdBy, errorMessage = null) {
    try {
      await db.query(
        `INSERT INTO integration_activity_log (
          integration_id, activity_type, status, details, error_message, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          integrationId,
          activityType,
          status,
          JSON.stringify(details),
          errorMessage,
          createdBy
        ]
      );
    } catch (error) {
      console.error('Error logging integration activity:', error);
      // Don't throw - activity logging failure shouldn't break the main flow
    }
  }

  /**
   * Load all active integrations on startup
   */
  async loadActiveIntegrations(db, orgId) {
    try {
      console.log(`📦 Loading active integrations for org: ${orgId}...`);

      const integrations = await this.getIntegrations(db, { orgId, activeOnly: true });

      for (const integration of integrations) {
        try {
          await this.initializeIntegration(integration);
        } catch (error) {
          console.error(`Failed to initialize ${integration.vendor_id}:`, error);
        }
      }

      console.log(`✓ Loaded ${integrations.length} active integrations`);
    } catch (error) {
      console.error('Error loading active integrations:', error);
      throw error;
    }
  }
}

module.exports = IntegrationService;
