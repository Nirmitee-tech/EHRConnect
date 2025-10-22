/**
 * Integration Orchestrator Service
 * Routes operations to correct integration handlers
 * Provides failover support for multi-vendor scenarios
 */

const { pool: db } = require('../database/connection');

class IntegrationOrchestrator {
  constructor() {
    this.handlers = new Map();
    this.integrationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Register an integration handler
   * @param {string} vendorId - Vendor identifier
   * @param {Object} handler - Integration handler instance
   */
  registerHandler(vendorId, handler) {
    this.handlers.set(vendorId, handler);
    console.log(`✓ Registered integration handler: ${vendorId}`);
  }

  /**
   * Get handler for a vendor
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} - Integration handler
   */
  getHandler(vendorId) {
    const handler = this.handlers.get(vendorId);
    if (!handler) {
      throw new Error(`No handler registered for vendor: ${vendorId}`);
    }
    return handler;
  }

  /**
   * Get integration configuration from database
   * @param {string} orgId - Organization ID
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} - Integration configuration
   */
  async getIntegrationConfig(orgId, vendorId) {
    const cacheKey = `${orgId}:${vendorId}`;
    
    // Check cache first
    const cached = this.integrationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.config;
    }

    // For Claim.MD, use billing_tenant_settings table (legacy)
    if (vendorId === 'claimmd') {
      try {
        const result = await db.query(
          `SELECT 
             org_id,
             claim_md_account_key,
             claim_md_token,
             claim_md_api_url,
             active,
             settings
           FROM billing_tenant_settings
           WHERE org_id = $1 AND active = true`,
          [orgId]
        );

        if (result.rows.length === 0) {
          throw new Error('Claim.MD not configured for this organization');
        }

        const config = {
          id: `claimmd-${orgId}`,
          orgId,
          vendorId: 'claimmd',
          name: 'Claim.MD',
          category: 'billing',
          status: 'active',
          credentials: {
            accountKey: result.rows[0].claim_md_account_key,
            token: result.rows[0].claim_md_token,
            apiUrl: result.rows[0].claim_md_api_url,
          },
          settings: result.rows[0].settings || {},
        };

        // Cache the config
        this.integrationCache.set(cacheKey, {
          config,
          timestamp: Date.now()
        });

        return config;
      } catch (error) {
        console.error('Error fetching Claim.MD config:', error);
        throw error;
      }
    }

    // For other integrations, use integration_configs table (future)
    // This table would be created in a future migration
    try {
      const result = await db.query(
        `SELECT * FROM integration_configs
         WHERE org_id = $1 AND vendor_id = $2 AND status = 'active'`,
        [orgId, vendorId]
      );

      if (result.rows.length === 0) {
        throw new Error(`${vendorId} not configured for this organization`);
      }

      const config = result.rows[0];
      
      // Cache the config
      this.integrationCache.set(cacheKey, {
        config,
        timestamp: Date.now()
      });

      return config;
    } catch (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        throw new Error(`Integration ${vendorId} requires integration_configs table`);
      }
      throw error;
    }
  }

  /**
   * Get all active integrations for an organization by category
   * @param {string} orgId - Organization ID
   * @param {string} category - Integration category (billing, payment, etc.)
   * @returns {Array} - List of integration configurations
   */
  async getActiveIntegrations(orgId, category) {
    const integrations = [];

    // Check Claim.MD for billing category
    if (category === 'billing') {
      try {
        const claimMdConfig = await this.getIntegrationConfig(orgId, 'claimmd');
        integrations.push(claimMdConfig);
      } catch (error) {
        console.log('Claim.MD not configured:', error.message);
      }
    }

    // Check integration_configs table for other integrations
    try {
      const result = await db.query(
        `SELECT * FROM integration_configs
         WHERE org_id = $1 AND category = $2 AND status = 'active'
         ORDER BY created_at ASC`,
        [orgId, category]
      );

      integrations.push(...result.rows);
    } catch (error) {
      if (error.code !== '42P01') {
        console.error('Error fetching active integrations:', error);
      }
    }

    return integrations;
  }

  /**
   * Execute an operation with a specific integration
   * @param {string} orgId - Organization ID
   * @param {string} vendorId - Vendor identifier
   * @param {string} operation - Operation name
   * @param {Object} params - Operation parameters
   * @returns {Object} - Operation result
   */
  async execute(orgId, vendorId, operation, params) {
    try {
      // Get integration configuration
      const integration = await this.getIntegrationConfig(orgId, vendorId);
      
      // Get handler
      const handler = this.getHandler(vendorId);
      
      // Execute operation
      console.log(`Executing ${vendorId}.${operation} for org ${orgId}`);
      const result = await handler.execute(integration, operation, params);
      
      // Log success
      await this.logUsage(integration.id, operation, true, null, Date.now());
      
      return result;
    } catch (error) {
      console.error(`Integration execution failed:`, error);
      
      // Log failure
      try {
        await this.logUsage(
          `${vendorId}-${orgId}`,
          operation,
          false,
          error.message,
          Date.now()
        );
      } catch (logError) {
        console.error('Failed to log integration usage:', logError);
      }
      
      throw error;
    }
  }

  /**
   * Execute operation with automatic failover
   * @param {string} orgId - Organization ID
   * @param {string} category - Integration category
   * @param {string} operation - Operation name
   * @param {Object} params - Operation parameters
   * @returns {Object} - Operation result
   */
  async executeWithFailover(orgId, category, operation, params) {
    const integrations = await this.getActiveIntegrations(orgId, category);
    
    if (integrations.length === 0) {
      throw new Error(`No active ${category} integrations configured`);
    }

    const errors = [];
    
    for (const integration of integrations) {
      try {
        console.log(`Attempting ${integration.vendorId} (${category})`);
        
        const result = await this.execute(
          orgId,
          integration.vendorId || integration.vendor_id,
          operation,
          params
        );
        
        console.log(`✓ Success with ${integration.vendorId}`);
        return result;
        
      } catch (error) {
        console.warn(`✗ Failover: ${integration.vendorId} failed - ${error.message}`);
        errors.push({
          vendor: integration.vendorId || integration.vendor_id,
          error: error.message
        });
        
        // Continue to next integration
      }
    }
    
    // All integrations failed
    throw new Error(
      `All ${category} integrations failed:\n` +
      errors.map(e => `- ${e.vendor}: ${e.error}`).join('\n')
    );
  }

  /**
   * Test connection for an integration
   * @param {string} orgId - Organization ID
   * @param {string} vendorId - Vendor identifier
   * @returns {boolean} - True if connection successful
   */
  async testConnection(orgId, vendorId) {
    try {
      const integration = await this.getIntegrationConfig(orgId, vendorId);
      const handler = this.getHandler(vendorId);
      
      console.log(`Testing connection: ${vendorId} for org ${orgId}`);
      const isHealthy = await handler.testConnection(integration);
      
      console.log(`Connection test result: ${isHealthy ? 'SUCCESS' : 'FAILED'}`);
      return isHealthy;
      
    } catch (error) {
      console.error(`Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Get available operations for an integration
   * @param {string} vendorId - Vendor identifier
   * @returns {Array} - List of available operations
   */
  getAvailableOperations(vendorId) {
    const handler = this.getHandler(vendorId);
    
    if (typeof handler.getAvailableOperations === 'function') {
      return handler.getAvailableOperations();
    }
    
    return [];
  }

  /**
   * Get integration metadata
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} - Integration metadata
   */
  getMetadata(vendorId) {
    const handler = this.getHandler(vendorId);
    
    if (typeof handler.getMetadata === 'function') {
      return handler.getMetadata();
    }
    
    return {
      id: vendorId,
      name: vendorId,
      description: 'No metadata available'
    };
  }

  /**
   * List all registered handlers
   * @returns {Array} - List of vendor IDs
   */
  listHandlers() {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get all handler metadata
   * @returns {Array} - List of handler metadata
   */
  getAllMetadata() {
    const metadata = [];
    
    for (const vendorId of this.handlers.keys()) {
      try {
        metadata.push(this.getMetadata(vendorId));
      } catch (error) {
        console.error(`Error getting metadata for ${vendorId}:`, error);
      }
    }
    
    return metadata;
  }

  /**
   * Clear integration cache
   * @param {string} orgId - Organization ID (optional)
   * @param {string} vendorId - Vendor identifier (optional)
   */
  clearCache(orgId, vendorId) {
    if (orgId && vendorId) {
      this.integrationCache.delete(`${orgId}:${vendorId}`);
    } else if (orgId) {
      // Clear all integrations for org
      for (const key of this.integrationCache.keys()) {
        if (key.startsWith(`${orgId}:`)) {
          this.integrationCache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.integrationCache.clear();
    }
    
    console.log('Integration cache cleared');
  }

  /**
   * Log integration usage for analytics
   * @param {string} integrationId - Integration ID
   * @param {string} operation - Operation name
   * @param {boolean} success - Whether operation succeeded
   * @param {string} errorMessage - Error message if failed
   * @param {number} executionTime - Execution time in ms
   */
  async logUsage(integrationId, operation, success, errorMessage, executionTime) {
    try {
      await db.query(
        `INSERT INTO integration_usage 
         (integration_id, operation, success, error_message, execution_time_ms, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [integrationId, operation, success, errorMessage, executionTime]
      );
    } catch (error) {
      // Silently fail if table doesn't exist yet
      if (error.code !== '42P01') {
        console.error('Error logging integration usage:', error);
      }
    }
  }
}

// Export singleton instance
module.exports = new IntegrationOrchestrator();
