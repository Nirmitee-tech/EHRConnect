const abdmHandler = require('../integrations/abdm.handler');
const pool = require('../database/connection');

/**
 * ABDM Service Layer
 * Manages ABDM integrations and operations for multiple organizations
 */
class ABDMService {
  /**
   * Get ABDM integration for an organization
   */
  async getIntegrationConfig(organizationId, integrationName = 'abdm-default') {
    // integrationName is ignored for now since we query by environment
    // Default to sandbox if multiple configs exist
    const query = `
      SELECT * FROM integrations
      WHERE org_id = $1
        AND vendor_id = 'abdm'
        AND enabled = true
      ORDER BY
        CASE WHEN environment = 'sandbox' THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [organizationId]);

    if (result.rows.length === 0) {
      throw new Error('ABDM integration not found or not active');
    }

    return result.rows[0];
  }

  /**
   * Create or update ABDM integration configuration
   */
  async saveIntegrationConfig(organizationId, config) {
    const {
      name = 'abdm-default',
      clientId,
      clientSecret,
      xCmId = 'sbx',
      publicKey,
      environment = 'sandbox'
    } = config;

    // Validate required fields
    if (!clientId || !clientSecret) {
      throw new Error('clientId and clientSecret are required');
    }

    const query = `
      INSERT INTO integrations (
        org_id,
        vendor_id,
        credentials,
        enabled,
        environment,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (org_id, vendor_id, environment)
      DO UPDATE SET
        credentials = EXCLUDED.credentials,
        enabled = EXCLUDED.enabled,
        updated_at = NOW()
      RETURNING *
    `;

    const credentials = {
      clientId,
      clientSecret,
      xCmId,
      publicKey,
      name
    };

    const result = await pool.query(query, [
      organizationId,
      'abdm',
      JSON.stringify(credentials),
      true,
      environment
    ]);

    // Initialize the handler
    await abdmHandler.initialize(result.rows[0]);

    return result.rows[0];
  }

  /**
   * List all ABDM integrations for an organization
   */
  async listIntegrations(organizationId) {
    const query = `
      SELECT id, vendor_id, enabled, environment, created_at, updated_at
      FROM integrations
      WHERE org_id = $1 AND vendor_id = 'abdm'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [organizationId]);
    return result.rows.map(row => ({
      ...row,
      name: row.credentials?.name || 'abdm-default',
      status: row.enabled ? 'active' : 'inactive'
    }));
  }

  /**
   * Delete ABDM integration
   */
  async deleteIntegration(organizationId, integrationId) {
    const query = `
      DELETE FROM integrations
      WHERE id = $1 AND org_id = $2 AND vendor_id = 'abdm'
      RETURNING id
    `;

    const result = await pool.query(query, [integrationId, organizationId]);

    if (result.rows.length > 0) {
      await abdmHandler.cleanup(integrationId);
    }

    return result.rows.length > 0;
  }

  /**
   * Send OTP to Aadhaar registered mobile
   */
  async sendOtp(organizationId, aadhaar, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    // Ensure handler is initialized
    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendOtp', { aadhaar });

    // Store transaction for tracking
    await this.logTransaction(organizationId, integration.id, 'sendOtp', {
      txnId: result.txnId,
      aadhaar: `******${aadhaar.slice(-4)}`
    });

    return result;
  }

  /**
   * Verify OTP and enroll ABHA
   */
  async verifyOtpAndEnroll(organizationId, txnId, otp, mobile, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyOtpAndEnroll', {
      txnId,
      otp,
      mobile
    });

    // Store ABHA account information with tokens
    if (result.ABHAProfile) {
      await this.storeAbhaProfile(organizationId, result.ABHAProfile, result.tokens);
    }

    await this.logTransaction(organizationId, integration.id, 'verifyOtpAndEnroll', {
      txnId,
      success: true,
      abhaNumber: result.ABHAProfile?.ABHANumber
    });

    return result;
  }

  /**
   * Send mobile OTP for verification
   * @param {string} txnId - Optional txnId for mobile update flow (from previous enrollment/login)
   */
  async sendMobileOtp(organizationId, mobile, txnId = null, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendMobileOtp', { mobile, txnId });

    await this.logTransaction(organizationId, integration.id, 'sendMobileOtp', {
      txnId: result.txnId,
      mobile: `******${mobile.slice(-4)}`,
      flow: txnId ? 'mobile-update' : 'initial-verification'
    });

    return result;
  }

  /**
   * Verify mobile OTP
   */
  async verifyMobileOtp(organizationId, txnId, otp, scope, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyMobileOtp', {
      txnId,
      otp,
      scope
    });

    await this.logTransaction(organizationId, integration.id, 'verifyMobileOtp', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Get ABHA address suggestions
   */
  async getAddressSuggestions(organizationId, txnId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    return await abdmHandler.execute(integration, 'getAddressSuggestions', { txnId });
  }

  /**
   * Set ABHA address
   */
  async setAbhaAddress(organizationId, txnId, abhaAddress, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'setAbhaAddress', {
      txnId,
      abhaAddress
    });

    await this.logTransaction(organizationId, integration.id, 'setAbhaAddress', {
      abhaAddress,
      success: true
    });

    return result;
  }

  /**
   * Get ABDM public certificate
   */
  async getPublicCertificate(organizationId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    return await abdmHandler.execute(integration, 'getPublicCertificate', {});
  }

  /**
   * Test ABDM connection
   */
  async testConnection(organizationId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    return await abdmHandler.testConnection(integration);
  }

  /**
   * Get ABHA profile details
   */
  async getProfile(organizationId, xToken, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    return await abdmHandler.execute(integration, 'getProfile', { xToken });
  }

  /**
   * Download ABHA card
   */
  async downloadAbhaCard(organizationId, xToken, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'downloadAbhaCard', { xToken });

    await this.logTransaction(organizationId, integration.id, 'downloadAbhaCard', {
      success: true
    });

    return result;
  }

  /**
   * Send email verification link
   * Requires X-Token (Auth token)
   */
  async sendEmailVerification(organizationId, xToken, email, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendEmailVerification', { xToken, email });

    await this.logTransaction(organizationId, integration.id, 'sendEmailVerification', {
      email: email,
      success: true
    });

    return result;
  }

  /**
   * Login with ABHA Address
   */
  async loginWithAbhaAddress(organizationId, abhaAddress, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'loginWithAbhaAddress', { abhaAddress });

    await this.logTransaction(organizationId, integration.id, 'loginWithAbhaAddress', {
      abhaAddress: abhaAddress,
      txnId: result.txnId
    });

    return result;
  }

  /**
   * Verify login OTP
   */
  async verifyLoginOtp(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyLoginOtp', { txnId, otp });

    // Update tokens if ABHA profile exists
    if (result.tokens && result.profile?.ABHANumber) {
      await this.updateProfileTokens(organizationId, result.profile.ABHANumber, result.tokens);
    }

    await this.logTransaction(organizationId, integration.id, 'verifyLoginOtp', {
      txnId: txnId,
      success: true
    });

    return result;
  }

  /**
   * Store ABHA profile in database with tokens
   */
  async storeAbhaProfile(organizationId, profile, tokens = null) {
    const query = `
      INSERT INTO abha_profiles (
        org_id,
        abha_number,
        abha_address,
        name,
        gender,
        date_of_birth,
        mobile,
        email,
        profile_data,
        x_token,
        x_token_expires_at,
        t_token,
        refresh_token,
        token_updated_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
      ON CONFLICT (abha_number, org_id)
      DO UPDATE SET
        abha_address = $3,
        name = $4,
        mobile = $7,
        email = $8,
        profile_data = $9,
        x_token = COALESCE($10, abha_profiles.x_token),
        x_token_expires_at = COALESCE($11, abha_profiles.x_token_expires_at),
        t_token = COALESCE($12, abha_profiles.t_token),
        refresh_token = COALESCE($13, abha_profiles.refresh_token),
        token_updated_at = CASE WHEN $10 IS NOT NULL THEN NOW() ELSE abha_profiles.token_updated_at END,
        updated_at = NOW()
      RETURNING *
    `;

    // Calculate token expiry time (default 30 minutes if not provided)
    const expiresIn = tokens?.expiresIn || 1800;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const result = await pool.query(query, [
      organizationId,
      profile.ABHANumber,
      profile.preferredAbhaAddress || profile.ABHANumber,
      profile.name,
      profile.gender,
      profile.dateOfBirth,
      profile.mobile,
      profile.email,
      JSON.stringify(profile),
      tokens?.token || null,
      tokens?.token ? expiresAt : null,
      tokens?.tToken || null,
      tokens?.refreshToken || null
    ]);

    return result.rows[0];
  }

  /**
   * Get stored tokens for an ABHA profile
   */
  async getStoredTokens(organizationId, abhaNumber) {
    const query = `
      SELECT x_token, x_token_expires_at, t_token, refresh_token, token_updated_at
      FROM abha_profiles
      WHERE org_id = $1 AND abha_number = $2
    `;

    const result = await pool.query(query, [organizationId, abhaNumber]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Check if x_token is still valid
    const isXTokenValid = row.x_token && row.x_token_expires_at &&
                          new Date(row.x_token_expires_at) > new Date();

    return {
      xToken: row.x_token,
      xTokenExpiresAt: row.x_token_expires_at,
      xTokenValid: isXTokenValid,
      tToken: row.t_token,
      refreshToken: row.refresh_token,
      tokenUpdatedAt: row.token_updated_at
    };
  }

  /**
   * Update tokens for an existing profile
   */
  async updateProfileTokens(organizationId, abhaNumber, tokens) {
    const expiresIn = tokens.expiresIn || 1800;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const query = `
      UPDATE abha_profiles
      SET
        x_token = $3,
        x_token_expires_at = $4,
        t_token = COALESCE($5, t_token),
        refresh_token = COALESCE($6, refresh_token),
        token_updated_at = NOW(),
        updated_at = NOW()
      WHERE org_id = $1 AND abha_number = $2
      RETURNING *
    `;

    const result = await pool.query(query, [
      organizationId,
      abhaNumber,
      tokens.token,
      expiresAt,
      tokens.tToken || null,
      tokens.refreshToken || null
    ]);

    return result.rows[0];
  }

  /**
   * Log ABDM transaction
   */
  async logTransaction(organizationId, integrationId, operation, metadata) {
    const query = `
      INSERT INTO abdm_transactions (
        org_id,
        integration_id,
        operation,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      organizationId,
      integrationId,
      operation,
      JSON.stringify(metadata)
    ]);

    return result.rows[0];
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(organizationId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM abdm_transactions
      WHERE org_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [organizationId, limit, offset]);
    return result.rows;
  }

  /**
   * ABHA Verification APIs
   */

  /**
   * Send Auth OTP via Aadhaar (for existing ABHA verification)
   */
  async sendAuthOtpViaAadhaar(organizationId, aadhaar, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendAuthOtpViaAadhaar', { aadhaar });

    await this.logTransaction(organizationId, integration.id, 'sendAuthOtpViaAadhaar', {
      txnId: result.txnId,
      aadhaar: `******${aadhaar.slice(-4)}`
    });

    return result;
  }

  /**
   * Verify Auth OTP via Aadhaar
   */
  async verifyAuthOtpViaAadhaar(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyAuthOtpViaAadhaar', { txnId, otp });

    await this.logTransaction(organizationId, integration.id, 'verifyAuthOtpViaAadhaar', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Send Auth OTP via ABHA Number + Aadhaar OTP
   */
  async sendAuthOtpViaAbhaAadhaar(organizationId, abhaNumber, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendAuthOtpViaAbhaAadhaar', { abhaNumber });

    await this.logTransaction(organizationId, integration.id, 'sendAuthOtpViaAbhaAadhaar', {
      txnId: result.txnId,
      abhaNumber: `******${abhaNumber.slice(-4)}`
    });

    return result;
  }

  /**
   * Verify Auth OTP via ABHA Number + Aadhaar OTP
   */
  async verifyAuthOtpViaAbhaAadhaar(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyAuthOtpViaAbhaAadhaar', { txnId, otp });

    await this.logTransaction(organizationId, integration.id, 'verifyAuthOtpViaAbhaAadhaar', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Send Auth OTP via ABHA Number
   */
  async sendAuthOtpViaAbhaNumber(organizationId, abhaNumber, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendAuthOtpViaAbhaNumber', { abhaNumber });

    await this.logTransaction(organizationId, integration.id, 'sendAuthOtpViaAbhaNumber', {
      txnId: result.txnId,
      abhaNumber: `******${abhaNumber.slice(-4)}`
    });

    return result;
  }

  /**
   * Verify Auth OTP via ABHA Number
   */
  async verifyAuthOtpViaAbhaNumber(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyAuthOtpViaAbhaNumber', { txnId, otp });

    await this.logTransaction(organizationId, integration.id, 'verifyAuthOtpViaAbhaNumber', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Verify via Password
   */
  async verifyViaPassword(organizationId, abhaNumber, password, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyViaPassword', { abhaNumber, password });

    await this.logTransaction(organizationId, integration.id, 'verifyViaPassword', {
      abhaNumber: `******${abhaNumber.slice(-4)}`,
      success: true
    });

    return result;
  }

  /**
   * Send Auth OTP via Mobile
   */
  async sendAuthOtpViaMobile(organizationId, mobile, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendAuthOtpViaMobile', { mobile });

    await this.logTransaction(organizationId, integration.id, 'sendAuthOtpViaMobile', {
      txnId: result.txnId,
      mobile: `******${mobile.slice(-4)}`
    });

    return result;
  }

  /**
   * Verify Auth OTP via Mobile
   */
  async verifyAuthOtpViaMobile(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyAuthOtpViaMobile', { txnId, otp });

    await this.logTransaction(organizationId, integration.id, 'verifyAuthOtpViaMobile', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Verify User (Get user details after auth)
   */
  async verifyUser(organizationId, xToken, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifyUser', { xToken });

    await this.logTransaction(organizationId, integration.id, 'verifyUser', {
      success: true
    });

    return result;
  }

  /**
   * Search ABHA accounts by mobile number
   */
  async searchAbhaByMobile(organizationId, mobile, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'searchAbhaByMobile', { mobile });

    await this.logTransaction(organizationId, integration.id, 'searchAbhaByMobile', {
      mobile: `******${mobile.slice(-4)}`,
      success: true,
      accountsFound: result.accounts?.length || 0
    });

    return result;
  }

  /**
   * Search ABHA accounts by ABHA Number
   */
  async searchAbhaByAbhaNumber(organizationId, abhaNumber, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'searchAbhaByAbhaNumber', { abhaNumber });

    await this.logTransaction(organizationId, integration.id, 'searchAbhaByAbhaNumber', {
      abhaNumber: `****-****-${abhaNumber.slice(-4)}`,
      success: true,
      accountsFound: result.accounts?.length || 0
    });

    return result;
  }

  /**
   * Search ABHA accounts by ABHA Address
   */
  async searchAbhaByAbhaAddress(organizationId, abhaAddress, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'searchAbhaByAbhaAddress', { abhaAddress });

    await this.logTransaction(organizationId, integration.id, 'searchAbhaByAbhaAddress', {
      abhaAddress,
      success: true,
      accountsFound: result.accounts?.length || 0
    });

    return result;
  }

  /**
   * Search ABHA accounts by Aadhaar
   */
  async searchAbhaByAadhaar(organizationId, aadhaar, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'searchAbhaByAadhaar', { aadhaar });

    await this.logTransaction(organizationId, integration.id, 'searchAbhaByAadhaar', {
      aadhaar: `********${aadhaar.slice(-4)}`,
      success: true,
      accountsFound: result.accounts?.length || 0
    });

    return result;
  }

  /**
   * Send OTP for search-based auth via Mobile
   */
  async sendSearchOtpViaMobile(organizationId, index, txnId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendSearchOtpViaMobile', { index, txnId });

    await this.logTransaction(organizationId, integration.id, 'sendSearchOtpViaMobile', {
      index,
      success: true
    });

    return result;
  }

  /**
   * Send OTP for search-based auth via Aadhaar
   */
  async sendSearchOtpViaAadhaar(organizationId, index, txnId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendSearchOtpViaAadhaar', { index, txnId });

    await this.logTransaction(organizationId, integration.id, 'sendSearchOtpViaAadhaar', {
      index,
      success: true
    });

    return result;
  }

  /**
   * Verify OTP for search-based auth via Mobile
   */
  async verifySearchOtpViaMobile(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifySearchOtpViaMobile', { txnId, otp });

    await this.logTransaction(organizationId, integration.id, 'verifySearchOtpViaMobile', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Verify OTP for search-based auth via Aadhaar
   */
  async verifySearchOtpViaAadhaar(organizationId, txnId, otp, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifySearchOtpViaAadhaar', { txnId, otp });

    await this.logTransaction(organizationId, integration.id, 'verifySearchOtpViaAadhaar', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Send fingerprint bio request for search-based auth
   */
  async sendSearchBioFingerprint(organizationId, index, txnId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendSearchBioFingerprint', { index, txnId });

    await this.logTransaction(organizationId, integration.id, 'sendSearchBioFingerprint', {
      index,
      success: true
    });

    return result;
  }

  /**
   * Verify fingerprint bio for search-based auth
   */
  async verifySearchBioFingerprint(organizationId, txnId, pid, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifySearchBioFingerprint', { txnId, pid });

    await this.logTransaction(organizationId, integration.id, 'verifySearchBioFingerprint', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Send face bio request for search-based auth
   */
  async sendSearchBioFace(organizationId, index, txnId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendSearchBioFace', { index, txnId });

    await this.logTransaction(organizationId, integration.id, 'sendSearchBioFace', {
      index,
      success: true
    });

    return result;
  }

  /**
   * Verify face bio for search-based auth
   */
  async verifySearchBioFace(organizationId, txnId, pid, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifySearchBioFace', { txnId, pid });

    await this.logTransaction(organizationId, integration.id, 'verifySearchBioFace', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Send IRIS bio request for search-based auth
   */
  async sendSearchBioIris(organizationId, index, txnId, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'sendSearchBioIris', { index, txnId });

    await this.logTransaction(organizationId, integration.id, 'sendSearchBioIris', {
      index,
      success: true
    });

    return result;
  }

  /**
   * Verify IRIS bio for search-based auth
   */
  async verifySearchBioIris(organizationId, txnId, pid, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'verifySearchBioIris', { txnId, pid });

    await this.logTransaction(organizationId, integration.id, 'verifySearchBioIris', {
      txnId,
      success: true
    });

    return result;
  }

  /**
   * Get QR Code for ABHA profile
   */
  async getQRCode(organizationId, xToken, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    return await abdmHandler.execute(integration, 'getQRCode', { xToken });
  }

  /**
   * Update Profile Photo
   */
  async updateProfilePhoto(organizationId, xToken, photoBase64, integrationName = 'abdm-default') {
    const integration = await this.getIntegrationConfig(organizationId, integrationName);

    if (!abdmHandler.getClient(integration.id)) {
      await abdmHandler.initialize(integration);
    }

    const result = await abdmHandler.execute(integration, 'updateProfilePhoto', { xToken, photoBase64 });

    await this.logTransaction(organizationId, integration.id, 'updateProfilePhoto', {
      success: true
    });

    return result;
  }
}

module.exports = new ABDMService();
