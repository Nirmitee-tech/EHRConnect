/**
 * Claim.MD API Integration Service
 * Handles all communication with Claim.MD APIs for:
 * - Eligibility verification
 * - Prior authorization
 * - Claim submission
 * - Remittance (ERA) retrieval
 */

const axios = require('axios');
const { pool: db } = require('../database/connection');

class ClaimMDService {
  constructor() {
    this.baseURL = process.env.CLAIMMD_API_URL || 'https://api.claim.md/v1';
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get Claim.MD credentials for an organization
   */
  async getTenantCredentials(orgId) {
    try {
      const result = await db.query(
        `SELECT claim_md_account_key, claim_md_token, claim_md_api_url, active
         FROM billing_tenant_settings
         WHERE org_id = $1 AND active = true`,
        [orgId]
      );

      if (result.rows.length === 0) {
        throw new Error('Claim.MD credentials not configured for this organization');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error fetching tenant credentials:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to Claim.MD API with retry logic
   */
  async makeRequest(orgId, endpoint, method = 'POST', data = {}) {
    const credentials = await this.getTenantCredentials(orgId);
    const apiUrl = credentials.claim_md_api_url || this.baseURL;

    const config = {
      method,
      url: `${apiUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.claim_md_token}`,
        'X-Account-Key': credentials.claim_md_account_key,
      },
      data,
      timeout: this.timeout,
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(config);
        return response.data;
      } catch (error) {
        lastError = error;
        console.error(`Claim.MD API request failed (attempt ${attempt}/${this.maxRetries}):`, {
          endpoint,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });

        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }

        // Wait before retrying
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Verify patient eligibility with insurance
   */
  async checkEligibility(orgId, eligibilityRequest) {
    const {
      patientId,
      payerId,
      memberID,
      firstName,
      lastName,
      dateOfBirth,
      serviceDate,
      serviceType = 'medical',
    } = eligibilityRequest;

    try {
      const payload = {
        patient: {
          memberId: memberID,
          firstName,
          lastName,
          dateOfBirth,
        },
        serviceDate,
        serviceType,
      };

      const response = await this.makeRequest(orgId, '/eligibility/check', 'POST', payload);

      // Store eligibility result in database
      const payer = await db.query('SELECT id FROM billing_payers WHERE payer_id = $1', [payerId]);
      const payerDbId = payer.rows[0]?.id;

      await db.query(
        `INSERT INTO billing_eligibility_history
         (org_id, patient_id, payer_id, member_id, service_date, eligibility_status, coverage_details, response_raw)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orgId,
          patientId,
          payerDbId,
          memberID,
          serviceDate,
          response.status || 'unknown',
          JSON.stringify(response.coverage || {}),
          JSON.stringify(response),
        ]
      );

      return {
        status: response.status,
        coverage: response.coverage,
        copay: response.coverage?.copay,
        deductible: response.coverage?.deductible,
        deductibleRemaining: response.coverage?.deductibleRemaining,
        outOfPocketMax: response.coverage?.outOfPocketMax,
        planName: response.coverage?.planName,
        effectiveDate: response.coverage?.effectiveDate,
        terminationDate: response.coverage?.terminationDate,
      };
    } catch (error) {
      console.error('Eligibility check failed:', error);
      throw {
        message: 'Eligibility check failed',
        details: error.response?.data || error.message,
      };
    }
  }

  /**
   * Submit prior authorization request
   */
  async submitPriorAuthorization(orgId, authRequest) {
    const {
      patientId,
      encounterId,
      payerId,
      payerDbId,
      providerNPI,
      cptCodes,
      icdCodes,
      units,
      serviceLocation,
      notes,
      requestedBy,
      readinessScore = 0,
      readinessPassed = false,
      readinessNotes = '',
    } = authRequest;

    try {
      const payload = {
        patient: {
          id: patientId,
        },
        provider: {
          npi: providerNPI,
        },
        services: cptCodes.map((cpt, index) => ({
          cptCode: cpt,
          units: units || 1,
          diagnosisCodes: icdCodes,
        })),
        serviceLocation,
        notes,
      };

      const response = await this.makeRequest(orgId, '/prior-auth/submit', 'POST', payload);

      // Store prior auth in database
      let payerDb = payerDbId;
      if (!payerDb) {
        const payer = await db.query(
          'SELECT id FROM billing_payers WHERE payer_id = $1 OR id::text = $1 LIMIT 1',
          [payerId]
        );
        payerDb = payer.rows[0]?.id;
      }

      const result = await db.query(
        `INSERT INTO billing_prior_authorizations
         (auth_number, org_id, patient_id, encounter_id, payer_id, provider_npi,
          cpt_codes, icd_codes, units, service_location, status, requested_date, readiness_score,
          readiness_passed, readiness_notes, request_payload, response_payload, requested_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         RETURNING id, auth_number`,
        [
          response.authorizationNumber,
          orgId,
          patientId,
          encounterId,
          payerDb,
          providerNPI,
          cptCodes,
          icdCodes,
          units,
          serviceLocation,
          response.status || 'pending',
          new Date(),
          readinessScore,
          readinessPassed,
          readinessNotes,
          JSON.stringify(payload),
          JSON.stringify(response),
          requestedBy,
        ]
      );

      return {
        id: result.rows[0].id,
        authNumber: result.rows[0].auth_number,
        status: response.status,
        message: response.message,
      };
    } catch (error) {
      console.error('Prior authorization submission failed:', error);
      throw {
        message: 'Prior authorization submission failed',
        details: error.response?.data || error.message,
      };
    }
  }

  /**
   * Check prior authorization status
   */
  async checkPriorAuthStatus(orgId, authNumber) {
    try {
      const response = await this.makeRequest(orgId, `/prior-auth/status/${authNumber}`, 'GET');

      // Update status in database
      await db.query(
        `UPDATE billing_prior_authorizations
         SET status = $1, response_payload = $2, updated_at = CURRENT_TIMESTAMP
         WHERE auth_number = $3 AND org_id = $4`,
        [response.status, JSON.stringify(response), authNumber, orgId]
      );

      return response;
    } catch (error) {
      console.error('Prior auth status check failed:', error);
      throw error;
    }
  }

  /**
   * Submit claim to payer via Claim.MD
   */
  async submitClaim(orgId, claimId) {
    try {
      // Fetch claim details
      const claimResult = await db.query(
        `SELECT c.*, p.payer_id, p.name as payer_name
         FROM billing_claims c
         LEFT JOIN billing_payers p ON c.payer_id = p.id
         WHERE c.id = $1 AND c.org_id = $2`,
        [claimId, orgId]
      );

      if (claimResult.rows.length === 0) {
        throw new Error('Claim not found');
      }

      const claim = claimResult.rows[0];

      // Fetch claim lines
      const linesResult = await db.query(
        `SELECT * FROM billing_claim_lines WHERE claim_id = $1 ORDER BY line_number`,
        [claimId]
      );

      const lines = linesResult.rows;

      // Build 837 payload
      const payload = {
        claimType: claim.claim_type,
        claimNumber: claim.claim_number,
        billingProvider: {
          npi: claim.billing_provider_npi,
        },
        renderingProvider: {
          npi: claim.rendering_provider_npi,
        },
        subscriber: {
          memberId: claim.subscriber_member_id,
        },
        patient: {
          accountNumber: claim.patient_account_number,
        },
        serviceDateFrom: claim.service_date_from,
        serviceDateTo: claim.service_date_to,
        totalCharge: claim.total_charge,
        authorizationNumber: claim.auth_number,
        serviceLines: lines.map(line => ({
          lineNumber: line.line_number,
          serviceDate: line.service_date,
          placeOfService: line.place_of_service,
          cptCode: line.cpt_code,
          modifiers: line.modifiers || [],
          diagnosisCodes: line.icd_codes || [],
          units: line.units,
          chargeAmount: line.charge_amount,
          renderingProviderNpi: line.rendering_provider_npi,
        })),
      };

      const response = await this.makeRequest(orgId, '/claims/submit', 'POST', payload);

      // Update claim with Claim.MD response
      await db.query(
        `UPDATE billing_claims
         SET claim_md_id = $1,
             control_number = $2,
             status = $3,
             submission_date = CURRENT_TIMESTAMP,
             response_payload = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [
          response.claimId,
          response.controlNumber,
          response.status === 'Accepted' ? 'accepted' : 'submitted',
          JSON.stringify(response),
          claimId,
        ]
      );

      return {
        claimMdId: response.claimId,
        controlNumber: response.controlNumber,
        status: response.status,
        message: response.message,
        errors: response.errors || [],
      };
    } catch (error) {
      console.error('Claim submission failed:', error);

      // Update claim with error
      await db.query(
        `UPDATE billing_claims
         SET status = 'rejected',
             rejection_reason = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [error.response?.data?.message || error.message, claimId]
      );

      throw {
        message: 'Claim submission failed',
        details: error.response?.data || error.message,
      };
    }
  }

  /**
   * Check claim status
   */
  async checkClaimStatus(orgId, claimMdId) {
    try {
      const response = await this.makeRequest(orgId, `/claims/status/${claimMdId}`, 'GET');

      // Update claim status in database
      await db.query(
        `UPDATE billing_claims
         SET status = $1,
             total_paid = COALESCE($2, total_paid),
             response_payload = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE claim_md_id = $4 AND org_id = $5`,
        [
          response.status?.toLowerCase() || 'submitted',
          response.paidAmount,
          JSON.stringify(response),
          claimMdId,
          orgId,
        ]
      );

      return response;
    } catch (error) {
      console.error('Claim status check failed:', error);
      throw error;
    }
  }

  /**
   * Fetch remittance (ERA) files
   */
  async fetchRemittanceFiles(orgId, startDate, endDate) {
    try {
      const response = await this.makeRequest(orgId, '/remittance/list', 'POST', {
        startDate,
        endDate,
      });

      return response.files || [];
    } catch (error) {
      console.error('Fetch remittance files failed:', error);
      throw error;
    }
  }

  /**
   * Download and parse specific ERA file
   */
  async downloadRemittanceFile(orgId, fileId) {
    try {
      const response = await this.makeRequest(orgId, `/remittance/download/${fileId}`, 'GET');

      // Parse ERA 835 data
      const eraData = this.parseERA835(response.content);

      // Store in database
      const payer = await db.query('SELECT id FROM billing_payers WHERE payer_id = $1', [eraData.payerId]);
      const payerDbId = payer.rows[0]?.id;

      const remittanceResult = await db.query(
        `INSERT INTO billing_remittance
         (remittance_number, org_id, payer_id, payment_method, payment_amount,
          payment_date, era_file_id, era_content, status, received_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'received', CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          eraData.checkNumber,
          orgId,
          payerDbId,
          eraData.paymentMethod || 'eft',
          eraData.paymentAmount,
          eraData.paymentDate,
          fileId,
          JSON.stringify(eraData),
        ]
      );

      const remittanceId = remittanceResult.rows[0].id;

      // Store remittance lines
      for (const line of eraData.claims) {
        const claimResult = await db.query(
          'SELECT id FROM billing_claims WHERE claim_number = $1 OR control_number = $2',
          [line.claimNumber, line.claimNumber]
        );

        if (claimResult.rows.length > 0) {
          const claimId = claimResult.rows[0].id;

          await db.query(
            `INSERT INTO billing_remittance_lines
             (remittance_id, claim_id, billed_amount, allowed_amount, paid_amount,
              adjustment_amount, patient_responsibility, adjustment_codes, remark_codes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              remittanceId,
              claimId,
              line.billedAmount,
              line.allowedAmount,
              line.paidAmount,
              line.adjustmentAmount,
              line.patientResponsibility,
              JSON.stringify(line.adjustmentCodes || []),
              line.remarkCodes || [],
            ]
          );
        }
      }

      return {
        remittanceId,
        checkNumber: eraData.checkNumber,
        paymentAmount: eraData.paymentAmount,
        claimCount: eraData.claims.length,
      };
    } catch (error) {
      console.error('Download remittance file failed:', error);
      throw error;
    }
  }

  /**
   * Parse ERA 835 content
   */
  parseERA835(content) {
    // Simplified parser - in production, use a proper X12 parser library
    return {
      payerId: content.payer_id || '',
      checkNumber: content.check_number || '',
      paymentAmount: parseFloat(content.payment_amount || 0),
      paymentDate: content.payment_date || new Date().toISOString().split('T')[0],
      paymentMethod: content.payment_method || 'eft',
      claims: (content.claims || []).map(claim => ({
        claimNumber: claim.claim_number,
        billedAmount: parseFloat(claim.billed_amount || 0),
        allowedAmount: parseFloat(claim.allowed_amount || 0),
        paidAmount: parseFloat(claim.paid_amount || 0),
        adjustmentAmount: parseFloat(claim.adjustment_amount || 0),
        patientResponsibility: parseFloat(claim.patient_responsibility || 0),
        adjustmentCodes: claim.adjustment_codes || [],
        remarkCodes: claim.remark_codes || [],
      })),
    };
  }

  /**
   * Validate claim data before submission
   */
  validateClaim(claimData) {
    const errors = [];

    // Required fields
    if (!claimData.billing_provider_npi) {
      errors.push('Billing provider NPI is required');
    }
    if (!claimData.subscriber_member_id) {
      errors.push('Subscriber member ID is required');
    }
    if (!claimData.service_date_from) {
      errors.push('Service date from is required');
    }
    if (!claimData.service_date_to) {
      errors.push('Service date to is required');
    }
    if (!claimData.total_charge || claimData.total_charge <= 0) {
      errors.push('Total charge must be greater than 0');
    }

    // NPI format (10 digits)
    if (claimData.billing_provider_npi && !/^\d{10}$/.test(claimData.billing_provider_npi)) {
      errors.push('Billing provider NPI must be 10 digits');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = new ClaimMDService();
