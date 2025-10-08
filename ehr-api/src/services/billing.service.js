/**
 * Billing Service
 * Business logic for billing operations
 */

const { db } = require('../database/connection');
const claimMDService = require('./claimmd.service');
const { v4: uuidv4 } = require('uuid');

class BillingService {
  /**
   * Check patient eligibility
   */
  async checkEligibility(orgId, eligibilityData, userId) {
    const {
      patientId,
      payerId,
      memberID,
      firstName,
      lastName,
      dateOfBirth,
      serviceDate = new Date().toISOString().split('T')[0],
      serviceType = 'medical',
    } = eligibilityData;

    try {
      // Call Claim.MD eligibility API
      const result = await claimMDService.checkEligibility(orgId, {
        patientId,
        payerId,
        memberID,
        firstName,
        lastName,
        dateOfBirth,
        serviceDate,
        serviceType,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Eligibility check service error:', error);
      throw error;
    }
  }

  /**
   * Get eligibility history for a patient
   */
  async getEligibilityHistory(orgId, patientId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT
           eh.id,
           eh.patient_id,
           eh.service_date,
           eh.eligibility_status,
           eh.coverage_details,
           eh.checked_at,
           p.name as payer_name,
           u.name as checked_by_name
         FROM billing_eligibility_history eh
         LEFT JOIN billing_payers p ON eh.payer_id = p.id
         LEFT JOIN users u ON eh.checked_by = u.id
         WHERE eh.org_id = $1 AND eh.patient_id = $2
         ORDER BY eh.checked_at DESC
         LIMIT $3`,
        [orgId, patientId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching eligibility history:', error);
      throw error;
    }
  }

  /**
   * Submit prior authorization
   */
  async submitPriorAuthorization(orgId, authData, userId) {
    try {
      const result = await claimMDService.submitPriorAuthorization(orgId, {
        ...authData,
        requestedBy: userId,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Prior authorization service error:', error);
      throw error;
    }
  }

  /**
   * Get prior authorizations
   */
  async getPriorAuthorizations(orgId, filters = {}) {
    try {
      const { patientId, status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT
          pa.id,
          pa.auth_number,
          pa.patient_id,
          pa.encounter_id,
          pa.status,
          pa.cpt_codes,
          pa.icd_codes,
          pa.requested_date,
          pa.valid_from,
          pa.valid_to,
          pa.denial_reason,
          pa.created_at,
          p.name as payer_name,
          u.name as requested_by_name
        FROM billing_prior_authorizations pa
        LEFT JOIN billing_payers p ON pa.payer_id = p.id
        LEFT JOIN users u ON pa.requested_by = u.id
        WHERE pa.org_id = $1
      `;

      const params = [orgId];
      let paramIndex = 2;

      if (patientId) {
        query += ` AND pa.patient_id = $${paramIndex}`;
        params.push(patientId);
        paramIndex++;
      }

      if (status) {
        query += ` AND pa.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY pa.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows;
    } catch (error) {
      console.error('Error fetching prior authorizations:', error);
      throw error;
    }
  }

  /**
   * Create claim draft
   */
  async createClaim(orgId, claimData, userId) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate claim number
      const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Insert claim header
      const claimResult = await client.query(
        `INSERT INTO billing_claims
         (claim_number, org_id, location_id, patient_id, encounter_id, payer_id,
          auth_id, auth_number, claim_type, billing_provider_npi, rendering_provider_npi,
          service_location_npi, subscriber_member_id, patient_account_number,
          total_charge, service_date_from, service_date_to, status, claim_payload, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'draft', $18, $19)
         RETURNING id, claim_number`,
        [
          claimNumber,
          orgId,
          claimData.locationId,
          claimData.patientId,
          claimData.encounterId,
          claimData.payerId,
          claimData.authId,
          claimData.authNumber,
          claimData.claimType || 'professional',
          claimData.billingProviderNpi,
          claimData.renderingProviderNpi,
          claimData.serviceLocationNpi,
          claimData.subscriberMemberId,
          claimData.patientAccountNumber,
          claimData.totalCharge || 0,
          claimData.serviceDateFrom,
          claimData.serviceDateTo,
          JSON.stringify(claimData),
          userId,
        ]
      );

      const claimId = claimResult.rows[0].id;

      // Insert claim lines
      if (claimData.lines && claimData.lines.length > 0) {
        for (let i = 0; i < claimData.lines.length; i++) {
          const line = claimData.lines[i];
          await client.query(
            `INSERT INTO billing_claim_lines
             (claim_id, line_number, service_date, place_of_service, cpt_code,
              modifiers, icd_codes, units, charge_amount, rendering_provider_npi, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')`,
            [
              claimId,
              i + 1,
              line.serviceDate,
              line.placeOfService,
              line.cptCode,
              line.modifiers || [],
              line.icdCodes || [],
              line.units || 1,
              line.chargeAmount,
              line.renderingProviderNpi,
            ]
          );
        }
      }

      await client.query('COMMIT');

      return {
        id: claimId,
        claimNumber: claimResult.rows[0].claim_number,
        status: 'draft',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating claim:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate claim
   */
  async validateClaim(orgId, claimId) {
    try {
      // Fetch claim
      const claimResult = await db.query(
        'SELECT * FROM billing_claims WHERE id = $1 AND org_id = $2',
        [claimId, orgId]
      );

      if (claimResult.rows.length === 0) {
        throw new Error('Claim not found');
      }

      const claim = claimResult.rows[0];

      // Validate using Claim.MD service
      const validation = claimMDService.validateClaim(claim);

      if (!validation.valid) {
        // Store validation errors
        await db.query(
          'UPDATE billing_claims SET validation_errors = $1 WHERE id = $2',
          [JSON.stringify(validation.errors), claimId]
        );

        return {
          valid: false,
          errors: validation.errors,
        };
      }

      // Mark as validated
      await db.query(
        'UPDATE billing_claims SET status = $1, validation_errors = NULL WHERE id = $2',
        ['validated', claimId]
      );

      return {
        valid: true,
        errors: [],
      };
    } catch (error) {
      console.error('Error validating claim:', error);
      throw error;
    }
  }

  /**
   * Submit claim
   */
  async submitClaim(orgId, claimId, userId) {
    try {
      // Validate first
      const validation = await this.validateClaim(orgId, claimId);

      if (!validation.valid) {
        throw new Error(`Claim validation failed: ${validation.errors.join(', ')}`);
      }

      // Submit via Claim.MD
      const result = await claimMDService.submitClaim(orgId, claimId);

      // Update submitted_by
      await db.query(
        'UPDATE billing_claims SET submitted_by = $1 WHERE id = $2',
        [userId, claimId]
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error submitting claim:', error);
      throw error;
    }
  }

  /**
   * Get claims
   */
  async getClaims(orgId, filters = {}) {
    try {
      const { patientId, status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT * FROM v_billing_claims_summary
        WHERE org_id = $1
      `;

      const params = [orgId];
      let paramIndex = 2;

      if (patientId) {
        query += ` AND patient_id = $${paramIndex}`;
        params.push(patientId);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows;
    } catch (error) {
      console.error('Error fetching claims:', error);
      throw error;
    }
  }

  /**
   * Get claim detail
   */
  async getClaimDetail(orgId, claimId) {
    try {
      // Fetch claim
      const claimResult = await db.query(
        `SELECT c.*, p.name as payer_name, u.name as created_by_name
         FROM billing_claims c
         LEFT JOIN billing_payers p ON c.payer_id = p.id
         LEFT JOIN users u ON c.created_by = u.id
         WHERE c.id = $1 AND c.org_id = $2`,
        [claimId, orgId]
      );

      if (claimResult.rows.length === 0) {
        throw new Error('Claim not found');
      }

      const claim = claimResult.rows[0];

      // Fetch claim lines
      const linesResult = await db.query(
        'SELECT * FROM billing_claim_lines WHERE claim_id = $1 ORDER BY line_number',
        [claimId]
      );

      // Fetch status history
      const historyResult = await db.query(
        `SELECT * FROM billing_claim_status_history
         WHERE claim_id = $1 ORDER BY changed_at DESC`,
        [claimId]
      );

      return {
        ...claim,
        lines: linesResult.rows,
        statusHistory: historyResult.rows,
      };
    } catch (error) {
      console.error('Error fetching claim detail:', error);
      throw error;
    }
  }

  /**
   * Post remittance payment
   */
  async postRemittancePayment(orgId, remittanceId, userId) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch remittance
      const remittanceResult = await client.query(
        'SELECT * FROM billing_remittance WHERE id = $1 AND org_id = $2',
        [remittanceId, orgId]
      );

      if (remittanceResult.rows.length === 0) {
        throw new Error('Remittance not found');
      }

      const remittance = remittanceResult.rows[0];

      // Fetch remittance lines
      const linesResult = await client.query(
        'SELECT * FROM billing_remittance_lines WHERE remittance_id = $1',
        [remittanceId]
      );

      // Post each line to payment ledger
      for (const line of linesResult.rows) {
        // Update claim totals
        await client.query(
          `UPDATE billing_claims
           SET total_paid = COALESCE(total_paid, 0) + $1,
               total_adjustment = COALESCE(total_adjustment, 0) + $2,
               patient_responsibility = COALESCE(patient_responsibility, 0) + $3,
               status = CASE WHEN ($4 >= total_charge) THEN 'paid' ELSE status END,
               paid_date = CASE WHEN ($4 >= total_charge) THEN CURRENT_TIMESTAMP ELSE paid_date END
           WHERE id = $5`,
          [line.paid_amount, line.adjustment_amount, line.patient_responsibility, line.paid_amount, line.claim_id]
        );

        // Get patient ID for ledger
        const claimResult = await client.query(
          'SELECT patient_id FROM billing_claims WHERE id = $1',
          [line.claim_id]
        );
        const patientId = claimResult.rows[0]?.patient_id;

        // Create payment ledger entry
        await client.query(
          `INSERT INTO billing_payment_ledger
           (org_id, patient_id, claim_id, remittance_id, transaction_type,
            transaction_date, amount, payer_type, payer_id, description, posted_by)
           VALUES ($1, $2, $3, $4, 'payment', $5, $6, 'insurance', $7, $8, $9)`,
          [
            orgId,
            patientId,
            line.claim_id,
            remittanceId,
            remittance.payment_date,
            line.paid_amount,
            remittance.payer_id,
            `Payment from ${remittance.remittance_number}`,
            userId,
          ]
        );

        // Create adjustment ledger entry if applicable
        if (line.adjustment_amount > 0) {
          await client.query(
            `INSERT INTO billing_payment_ledger
             (org_id, patient_id, claim_id, remittance_id, transaction_type,
              transaction_date, amount, payer_type, payer_id, description, posted_by)
             VALUES ($1, $2, $3, $4, 'adjustment', $5, $6, 'insurance', $7, $8, $9)`,
            [
              orgId,
              patientId,
              line.claim_id,
              remittanceId,
              remittance.payment_date,
              -line.adjustment_amount,
              remittance.payer_id,
              `Adjustment from ${remittance.remittance_number}`,
              userId,
            ]
          );
        }
      }

      // Mark remittance as posted
      await client.query(
        `UPDATE billing_remittance
         SET status = 'posted', posted_at = CURRENT_TIMESTAMP, posted_by = $1
         WHERE id = $2`,
        [userId, remittanceId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Remittance posted successfully',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error posting remittance:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get remittances
   */
  async getRemittances(orgId, filters = {}) {
    try {
      const { status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT
          r.id,
          r.remittance_number,
          r.payment_method,
          r.payment_amount,
          r.payment_date,
          r.status,
          r.received_at,
          p.name as payer_name,
          u.name as posted_by_name
        FROM billing_remittance r
        LEFT JOIN billing_payers p ON r.payer_id = p.id
        LEFT JOIN users u ON r.posted_by = u.id
        WHERE r.org_id = $1
      `;

      const params = [orgId];
      let paramIndex = 2;

      if (status) {
        query += ` AND r.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY r.received_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows;
    } catch (error) {
      console.error('Error fetching remittances:', error);
      throw error;
    }
  }

  /**
   * Get billing dashboard KPIs
   */
  async getDashboardKPIs(orgId, startDate, endDate) {
    try {
      // Total billed
      const billedResult = await db.query(
        `SELECT COALESCE(SUM(total_charge), 0) as total_billed
         FROM billing_claims
         WHERE org_id = $1 AND service_date_from >= $2 AND service_date_to <= $3`,
        [orgId, startDate, endDate]
      );

      // Total collected
      const collectedResult = await db.query(
        `SELECT COALESCE(SUM(total_paid), 0) as total_collected
         FROM billing_claims
         WHERE org_id = $1 AND service_date_from >= $2 AND service_date_to <= $3`,
        [orgId, startDate, endDate]
      );

      // Claims by status
      const statusResult = await db.query(
        `SELECT status, COUNT(*) as count
         FROM billing_claims
         WHERE org_id = $1 AND created_at >= $2 AND created_at <= $3
         GROUP BY status`,
        [orgId, startDate, endDate]
      );

      // Denial rate
      const denialResult = await db.query(
        `SELECT
           COUNT(CASE WHEN status IN ('denied', 'rejected') THEN 1 END) as denied_count,
           COUNT(*) as total_count
         FROM billing_claims
         WHERE org_id = $1 AND submission_date >= $2 AND submission_date <= $3`,
        [orgId, startDate, endDate]
      );

      const denialRate = denialResult.rows[0].total_count > 0
        ? (denialResult.rows[0].denied_count / denialResult.rows[0].total_count) * 100
        : 0;

      // Average payment lag
      const lagResult = await db.query(
        `SELECT AVG(EXTRACT(DAY FROM (paid_date - submission_date))) as avg_lag
         FROM billing_claims
         WHERE org_id = $1 AND status = 'paid' AND paid_date >= $2 AND paid_date <= $3`,
        [orgId, startDate, endDate]
      );

      return {
        totalBilled: parseFloat(billedResult.rows[0].total_billed),
        totalCollected: parseFloat(collectedResult.rows[0].total_collected),
        collectionRate: billedResult.rows[0].total_billed > 0
          ? (collectedResult.rows[0].total_collected / billedResult.rows[0].total_billed) * 100
          : 0,
        claimsByStatus: statusResult.rows,
        denialRate: Math.round(denialRate * 100) / 100,
        avgPaymentLag: Math.round(parseFloat(lagResult.rows[0].avg_lag || 0)),
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  }
}

module.exports = new BillingService();
