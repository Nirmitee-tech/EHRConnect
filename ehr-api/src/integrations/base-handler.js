/**
 * Base Integration Handler
 * All integration handlers should extend this class
 */

class BaseIntegrationHandler {
  constructor(vendorId) {
    this.vendorId = vendorId;
    this.clients = new Map(); // Store active clients by integration ID
  }

  /**
   * Initialize the integration
   * @param {Object} integration - Integration configuration
   */
  async initialize(integration) {
    console.log(`Initializing ${this.vendorId} integration: ${integration.id}`);
    // Override in subclass
  }

  /**
   * Execute an integration operation
   * @param {Object} integration - Integration configuration
   * @param {string} operation - Operation name
   * @param {Object} params - Operation parameters
   */
  async execute(integration, operation, params) {
    throw new Error(`Operation ${operation} not implemented for ${this.vendorId}`);
  }

  /**
   * Test connection to the integration
   * @param {Object} integration - Integration configuration
   * @returns {boolean} - True if connection successful
   */
  async testConnection(integration) {
    console.log(`Testing connection for ${this.vendorId}`);
    return true; // Override in subclass
  }

  /**
   * Perform health check
   * @param {Object} integration - Integration configuration
   * @returns {boolean} - True if healthy
   */
  async healthCheck(integration) {
    return this.testConnection(integration);
  }

  /**
   * Handle webhook from the integration
   * @param {Object} integration - Integration configuration
   * @param {Object} payload - Webhook payload
   * @param {Object} headers - Request headers
   */
  async handleWebhook(integration, payload, headers) {
    console.log(`Received webhook for ${this.vendorId}`);
    // Override in subclass
    return { received: true };
  }

  /**
   * Cleanup when integration is stopped
   * @param {string} integrationId - Integration ID
   */
  async cleanup(integrationId) {
    this.clients.delete(integrationId);
    console.log(`Cleaned up ${this.vendorId} integration: ${integrationId}`);
  }

  /**
   * Get client for an integration
   * @param {string} integrationId - Integration ID
   */
  getClient(integrationId) {
    return this.clients.get(integrationId);
  }

  /**
   * Set client for an integration
   * @param {string} integrationId - Integration ID
   * @param {Object} client - Client instance
   */
  setClient(integrationId, client) {
    this.clients.set(integrationId, client);
  }
}

module.exports = BaseIntegrationHandler;
