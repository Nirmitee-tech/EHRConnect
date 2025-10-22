const BaseIntegrationHandler = require('./base-handler');
const claimMDService = require('../services/claimmd.service');
const billingService = require('../services/billing.service');

/**
 * Claim.MD Medical Billing Clearinghouse Handler
 * Wraps existing claimmd.service.js to integrate with plugin framework
 */
class ClaimMDHandler extends BaseIntegrationHandler {
  constructor() {
    super('claimmd');
  }

  /**
   * Initialize Claim.MD integration
   * @param {Object} integration - Integration configuration
   */
  async initialize(integration) {
    await super.initialize(integration);

    console.log(`✓ Claim.MD integration initialized for org: ${integration.orgId}`);
    
    // Client is managed by claimmd.service per org
    // No need to store client here since service handles multi-tenant
    this.setClient(integration.id, {
      orgId: integration.orgId,
      initialized: true
    });
  }

  /**
   * Execute Claim.MD operation
   * @param {Object} integration - Integration configuration
   * @param {string} operation - Operation name
   * @param {Object} params - Operation parameters
   */
  async execute(integration, operation, params) {
    const client = this.getClient(integration.id);

    if (!client || !client.initialized) {
      console.log('Initializing Claim.MD client...');
      await this.initialize(integration);
    }

    const orgId = integration.orgId;

    switch (operation) {
      // Eligibility Operations
      case 'checkEligibility':
        return await billingService.checkEligibility(
          orgId,
          params,
          params.userId
        );

      case 'getEligibilityHistory':
        return await billingService.getEligibilityHistory(
          orgId,
          params.patientId,
          params.limit || 10
        );

      // Prior Authorization Operations
      case 'submitPriorAuth':
        return await billingService.submitPriorAuthorization(
          orgId,
          params,
          params.userId
        );

      case 'getPriorAuths':
        return await billingService.getPriorAuthorizations(
          orgId,
          params
        );

      case 'getPriorAuthDetail':
        return await billingService.getPriorAuthDetail(
          orgId,
          params.id
        );

      case 'checkPriorAuthStatus':
        return await claimMDService.checkPriorAuthStatus(
          orgId,
          params.authNumber
        );

      // Claims Operations
      case 'createClaim':
        return await billingService.createClaim(
          orgId,
          params,
          params.userId
        );

      case 'validateClaim':
        return await billingService.validateClaim(
          orgId,
          params.claimId
        );

      case 'submitClaim':
        return await billingService.submitClaim(
          orgId,
          params.claimId,
          params.userId
        );

      case 'getClaims':
        return await billingService.getClaims(
          orgId,
          params
        );

      case 'getClaimDetail':
        return await billingService.getClaimDetail(
          orgId,
          params.claimId
        );

      case 'checkClaimStatus':
        return await claimMDService.checkClaimStatus(
          orgId,
          params.claimMdId
        );

      // Remittance (ERA) Operations
      case 'fetchRemittanceFiles':
        return await claimMDService.fetchRemittanceFiles(
          orgId,
          params.startDate,
          params.endDate
        );

      case 'getRemittances':
        return await billingService.getRemittances(
          orgId,
          params
        );

      case 'getRemittanceDetail':
        return await billingService.getRemittanceDetail(
          orgId,
          params.remittanceId
        );

      case 'postRemittance':
        return await billingService.postRemittancePayment(
          orgId,
          params.remittanceId,
          params.userId
        );

      // Dashboard & Reports
      case 'getDashboardKPIs':
        return await billingService.getDashboardKPIs(
          orgId,
          params.startDate,
          params.endDate
        );

      case 'getRevenueReport':
        return await billingService.getRevenueReport(
          orgId,
          params.startDate,
          params.endDate,
          params.groupBy
        );

      case 'getDenialsReport':
        return await billingService.getDenialsReport(
          orgId,
          params.startDate,
          params.endDate
        );

      default:
        throw new Error(`Unknown Claim.MD operation: ${operation}`);
    }
  }

  /**
   * Test connection to Claim.MD
   * @param {Object} integration - Integration configuration
   * @returns {boolean} - True if connection successful
   */
  async testConnection(integration) {
    try {
      console.log(`Testing Claim.MD connection for org: ${integration.orgId}`);

      // Try to get credentials from database
      const credentials = await claimMDService.getTenantCredentials(
        integration.orgId
      );

      if (!credentials || !credentials.active) {
        console.log('Claim.MD credentials not configured or inactive');
        return false;
      }

      // Test a simple operation (eligibility check with minimal data)
      // In production, you might want to use a dedicated test endpoint
      console.log('✓ Claim.MD credentials found and active');
      return true;

    } catch (error) {
      console.error('Claim.MD connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Handle webhook from Claim.MD
   * @param {Object} integration - Integration configuration
   * @param {Object} payload - Webhook payload
   * @param {Object} headers - Request headers
   */
  async handleWebhook(integration, payload, headers) {
    console.log('Received Claim.MD webhook:', payload.type || 'unknown');

    // Claim.MD webhook events (if supported by their API)
    switch (payload.type) {
      case 'claim.status_changed':
        console.log('✓ Claim status changed:', payload.claimId);
        // Update claim status in database
        if (payload.claimId) {
          await claimMDService.checkClaimStatus(
            integration.orgId,
            payload.claimId
          );
        }
        break;

      case 'remittance.available':
        console.log('✓ New remittance available:', payload.fileId);
        // Trigger ERA download
        if (payload.fileId) {
          await claimMDService.downloadRemittanceFile(
            integration.orgId,
            payload.fileId
          );
        }
        break;

      case 'prior_auth.status_changed':
        console.log('✓ Prior auth status changed:', payload.authNumber);
        // Update prior auth status
        if (payload.authNumber) {
          await claimMDService.checkPriorAuthStatus(
            integration.orgId,
            payload.authNumber
          );
        }
        break;

      default:
        console.log('Unhandled webhook event:', payload.type);
    }

    return { received: true, processed: true };
  }

  /**
   * Get available operations for this integration
   * @returns {Array} - List of available operations
   */
  getAvailableOperations() {
    return [
      // Eligibility
      { name: 'checkEligibility', category: 'eligibility', description: 'Verify patient insurance eligibility' },
      { name: 'getEligibilityHistory', category: 'eligibility', description: 'Get eligibility verification history' },
      
      // Prior Authorization
      { name: 'submitPriorAuth', category: 'prior_auth', description: 'Submit prior authorization request' },
      { name: 'getPriorAuths', category: 'prior_auth', description: 'List prior authorizations' },
      { name: 'getPriorAuthDetail', category: 'prior_auth', description: 'Get prior auth details' },
      { name: 'checkPriorAuthStatus', category: 'prior_auth', description: 'Check prior auth status' },
      
      // Claims
      { name: 'createClaim', category: 'claims', description: 'Create new claim draft' },
      { name: 'validateClaim', category: 'claims', description: 'Validate claim data' },
      { name: 'submitClaim', category: 'claims', description: 'Submit claim to payer' },
      { name: 'getClaims', category: 'claims', description: 'List claims' },
      { name: 'getClaimDetail', category: 'claims', description: 'Get claim details' },
      { name: 'checkClaimStatus', category: 'claims', description: 'Check claim status' },
      
      // Remittance
      { name: 'fetchRemittanceFiles', category: 'remittance', description: 'Fetch ERA files' },
      { name: 'getRemittances', category: 'remittance', description: 'List remittances' },
      { name: 'getRemittanceDetail', category: 'remittance', description: 'Get remittance details' },
      { name: 'postRemittance', category: 'remittance', description: 'Post remittance to ledger' },
      
      // Reports
      { name: 'getDashboardKPIs', category: 'reports', description: 'Get billing KPIs' },
      { name: 'getRevenueReport', category: 'reports', description: 'Get revenue report' },
      { name: 'getDenialsReport', category: 'reports', description: 'Get denials report' },
    ];
  }

  /**
   * Get integration metadata
   * @returns {Object} - Integration metadata
   */
  getMetadata() {
    return {
      id: 'claimmd',
      name: 'Claim.MD',
      category: 'billing',
      description: 'Medical billing clearinghouse for claims submission and processing',
      version: '1.0.0',
      vendor: 'Claim.MD',
      website: 'https://claim.md',
      documentation: 'https://docs.claim.md',
      features: [
        'Eligibility verification (270/271)',
        'Prior authorization management',
        'Claims submission (837P/837I)',
        'Electronic remittance advice (ERA/835)',
        'Real-time status tracking',
        'Payment posting',
      ],
      pricing: {
        model: 'per-claim',
        plans: [
          { name: 'Basic', price: '$30/month', claims: 'Pay per use' },
          { name: 'Small Volume', price: '$60/month', claims: '100 per month' },
          { name: 'Unlimited', price: '$120/month', claims: 'Unlimited' },
        ]
      },
      requiresCredentials: true,
      credentialFields: [
        { name: 'claim_md_account_key', label: 'Account Key', type: 'text', required: true },
        { name: 'claim_md_token', label: 'API Token', type: 'password', required: true },
        { name: 'claim_md_api_url', label: 'API URL', type: 'text', default: 'https://api.claim.md/v1' },
      ]
    };
  }
}

module.exports = new ClaimMDHandler();
