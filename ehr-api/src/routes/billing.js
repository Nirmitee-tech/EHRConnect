/**
 * Billing API Routes
 * Handles all billing-related endpoints
 */

const express = require('express');
const router = express.Router();
const billingService = require('../services/billing.service');
const claimMDService = require('../services/claimmd.service');
const { pool: db } = require('../database/connection');

// =====================================================
// PROVIDERS CRUD (No org context required - system-wide)
// =====================================================

/**
 * GET /api/billing/masters/providers
 * Get all providers with pagination and filters (no org context required - system-wide)
 */
router.get('/masters/providers', async (req, res) => {
  try {
    const search = req.query.search || '';
    const specialty = req.query.specialty || '';
    const state = req.query.state || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = ['active = true'];
    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      conditions.push(`(
        first_name ILIKE $${paramIndex} OR
        last_name ILIKE $${paramIndex} OR
        npi ILIKE $${paramIndex} OR
        specialty ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Specialty filter
    if (specialty) {
      conditions.push(`specialty ILIKE $${paramIndex}`);
      params.push(`%${specialty}%`);
      paramIndex++;
    }

    // State filter
    if (state) {
      conditions.push(`state = $${paramIndex}`);
      params.push(state.toUpperCase());
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM billing_providers WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const result = await db.query(
      `SELECT * FROM billing_providers
       WHERE ${whereClause}
       ORDER BY last_name, first_name ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      error: 'Failed to fetch providers',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/masters/providers/:id
 * Get provider by ID
 */
router.get('/masters/providers/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM billing_providers WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({
      error: 'Failed to fetch provider',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/masters/providers
 * Create new provider
 */
router.post('/masters/providers', async (req, res) => {
  try {
    const {
      npi,
      first_name,
      last_name,
      specialty,
      taxonomy_code,
      license_number,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
    } = req.body;

    const result = await db.query(
      `INSERT INTO billing_providers (
        npi, first_name, last_name, specialty, taxonomy_code,
        license_number, email, phone, address_line1, address_line2,
        city, state, zip_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        npi, first_name, last_name, specialty, taxonomy_code,
        license_number, email, phone, address_line1, address_line2 || null,
        city, state, zip_code
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create provider error:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        error: 'Provider with this NPI already exists',
        message: 'A provider with this NPI number is already registered',
      });
    }

    res.status(500).json({
      error: 'Failed to create provider',
      message: error.message,
    });
  }
});

/**
 * PUT /api/billing/masters/providers/:id
 * Update provider
 */
router.put('/masters/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      npi,
      first_name,
      last_name,
      specialty,
      taxonomy_code,
      license_number,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
    } = req.body;

    const result = await db.query(
      `UPDATE billing_providers SET
        npi = $1, first_name = $2, last_name = $3, specialty = $4,
        taxonomy_code = $5, license_number = $6, email = $7, phone = $8,
        address_line1 = $9, address_line2 = $10, city = $11, state = $12,
        zip_code = $13, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        npi, first_name, last_name, specialty, taxonomy_code,
        license_number, email, phone, address_line1, address_line2 || null,
        city, state, zip_code, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update provider error:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        error: 'Provider with this NPI already exists',
        message: 'Another provider with this NPI number already exists',
      });
    }

    res.status(500).json({
      error: 'Failed to update provider',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/billing/masters/providers/:id
 * Delete provider
 */
router.delete('/masters/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if provider is used in any claims
    const usageCheck = await db.query(
      `SELECT COUNT(*) as count FROM billing_claims
       WHERE provider_id = $1`,
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete provider that is used in claims',
        message: 'This provider is referenced in existing claims',
      });
    }

    const result = await db.query(
      `DELETE FROM billing_providers
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Delete provider error:', error);
    res.status(500).json({
      error: 'Failed to delete provider',
      message: error.message,
    });
  }
});

// Middleware to extract org context
const extractOrgContext = (req, res, next) => {
  const orgId = req.headers['x-org-id'] || req.user?.orgId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context required' });
  }
  req.orgId = orgId;
  next();
};

router.use(extractOrgContext);

// =====================================================
// ELIGIBILITY ENDPOINTS
// =====================================================

/**
 * POST /api/billing/eligibility/check
 * Check patient insurance eligibility
 */
router.post('/eligibility/check', async (req, res) => {
  try {
    const result = await billingService.checkEligibility(
      req.orgId,
      req.body,
      req.user?.id
    );
    res.json(result);
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({
      error: 'Eligibility check failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/eligibility/history/:patientId
 * Get eligibility history for a patient
 */
router.get('/eligibility/history/:patientId', async (req, res) => {
  try {
    const history = await billingService.getEligibilityHistory(
      req.orgId,
      req.params.patientId,
      parseInt(req.query.limit) || 10
    );
    res.json(history);
  } catch (error) {
    console.error('Eligibility history error:', error);
    res.status(500).json({
      error: 'Failed to fetch eligibility history',
      message: error.message,
    });
  }
});

// =====================================================
// PRIOR AUTHORIZATION ENDPOINTS
// =====================================================

/**
 * POST /api/billing/prior-auth/submit
 * Submit prior authorization request
 */
router.post('/prior-auth/submit', async (req, res) => {
  try {
    const result = await billingService.submitPriorAuthorization(
      req.orgId,
      req.body,
      req.user?.id
    );
    res.json(result);
  } catch (error) {
    console.error('Prior auth submission error:', error);
    res.status(error.status || 500).json({
      error: 'Prior authorization submission failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/prior-auth
 * Get prior authorizations
 */
router.get('/prior-auth', async (req, res) => {
  try {
    const filters = {
      patientId: req.query.patientId,
      status: req.query.status,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const priorAuths = await billingService.getPriorAuthorizations(req.orgId, filters);
    res.json(priorAuths);
  } catch (error) {
    console.error('Get prior auths error:', error);
    res.status(500).json({
      error: 'Failed to fetch prior authorizations',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/prior-auth/:id
 * Get prior authorization detail
 */
router.get('/prior-auth/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         pa.*,
         p.name as payer_name,
         u.name as requested_by_name
       FROM billing_prior_authorizations pa
       LEFT JOIN billing_payers p ON pa.payer_id = p.id
       LEFT JOIN users u ON pa.requested_by = u.id
       WHERE pa.id = $1 AND pa.org_id = $2`,
      [req.params.id, req.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prior authorization not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get prior auth detail error:', error);
    res.status(500).json({
      error: 'Failed to fetch prior authorization',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/prior-auth/:authNumber/status
 * Check prior authorization status
 */
router.get('/prior-auth/:authNumber/status', async (req, res) => {
  try {
    const result = await claimMDService.checkPriorAuthStatus(
      req.orgId,
      req.params.authNumber
    );
    res.json(result);
  } catch (error) {
    console.error('Prior auth status check error:', error);
    res.status(500).json({
      error: 'Failed to check prior authorization status',
      message: error.message,
    });
  }
});

// =====================================================
// CLAIMS ENDPOINTS
// =====================================================

/**
 * POST /api/billing/claims
 * Create new claim
 */
router.post('/claims', async (req, res) => {
  try {
    const result = await billingService.createClaim(
      req.orgId,
      req.body,
      req.user?.id
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({
      error: 'Failed to create claim',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/claims
 * Get claims list
 */
router.get('/claims', async (req, res) => {
  try {
    const filters = {
      patientId: req.query.patientId,
      status: req.query.status,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const claims = await billingService.getClaims(req.orgId, filters);
    res.json(claims);
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      error: 'Failed to fetch claims',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/claims/:id
 * Get claim detail
 */
router.get('/claims/:id', async (req, res) => {
  try {
    const claim = await billingService.getClaimDetail(req.orgId, req.params.id);
    res.json(claim);
  } catch (error) {
    console.error('Get claim detail error:', error);
    res.status(500).json({
      error: 'Failed to fetch claim detail',
      message: error.message,
    });
  }
});

/**
 * PUT /api/billing/claims/:id
 * Update claim
 */
router.put('/claims/:id', async (req, res) => {
  try {
    const { status, ...updateData } = req.body;

    // Only allow updates to draft claims
    const claimCheck = await db.query(
      'SELECT status FROM billing_claims WHERE id = $1 AND org_id = $2',
      [req.params.id, req.orgId]
    );

    if (claimCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (claimCheck.rows[0].status !== 'draft') {
      return res.status(400).json({
        error: 'Only draft claims can be edited',
      });
    }

    await db.query(
      `UPDATE billing_claims
       SET claim_payload = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND org_id = $3`,
      [JSON.stringify(updateData), req.params.id, req.orgId]
    );

    res.json({ success: true, message: 'Claim updated successfully' });
  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({
      error: 'Failed to update claim',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/claims/:id/validate
 * Validate claim
 */
router.post('/claims/:id/validate', async (req, res) => {
  try {
    const result = await billingService.validateClaim(req.orgId, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Validate claim error:', error);
    res.status(500).json({
      error: 'Failed to validate claim',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/claims/:id/submit
 * Submit claim to payer
 */
router.post('/claims/:id/submit', async (req, res) => {
  try {
    const result = await billingService.submitClaim(
      req.orgId,
      req.params.id,
      req.user?.id
    );
    res.json(result);
  } catch (error) {
    console.error('Submit claim error:', error);
    res.status(500).json({
      error: 'Failed to submit claim',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/claims/:claimMdId/status
 * Check claim status
 */
router.get('/claims/:claimMdId/status', async (req, res) => {
  try {
    const result = await claimMDService.checkClaimStatus(
      req.orgId,
      req.params.claimMdId
    );
    res.json(result);
  } catch (error) {
    console.error('Check claim status error:', error);
    res.status(500).json({
      error: 'Failed to check claim status',
      message: error.message,
    });
  }
});

// =====================================================
// REMITTANCE (ERA) ENDPOINTS
// =====================================================

/**
 * GET /api/billing/remittance
 * Get remittances list
 */
router.get('/remittance', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    };

    const remittances = await billingService.getRemittances(req.orgId, filters);
    res.json(remittances);
  } catch (error) {
    console.error('Get remittances error:', error);
    res.status(500).json({
      error: 'Failed to fetch remittances',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/remittance/:id
 * Get remittance detail
 */
router.get('/remittance/:id', async (req, res) => {
  try {
    const remittanceResult = await db.query(
      `SELECT r.*, p.name as payer_name
       FROM billing_remittance r
       LEFT JOIN billing_payers p ON r.payer_id = p.id
       WHERE r.id = $1 AND r.org_id = $2`,
      [req.params.id, req.orgId]
    );

    if (remittanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Remittance not found' });
    }

    const remittance = remittanceResult.rows[0];

    // Fetch remittance lines
    const linesResult = await db.query(
      `SELECT rl.*, c.claim_number
       FROM billing_remittance_lines rl
       LEFT JOIN billing_claims c ON rl.claim_id = c.id
       WHERE rl.remittance_id = $1`,
      [req.params.id]
    );

    remittance.lines = linesResult.rows;

    res.json(remittance);
  } catch (error) {
    console.error('Get remittance detail error:', error);
    res.status(500).json({
      error: 'Failed to fetch remittance detail',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/remittance/:id/post
 * Post remittance payment to ledger
 */
router.post('/remittance/:id/post', async (req, res) => {
  try {
    const result = await billingService.postRemittancePayment(
      req.orgId,
      req.params.id,
      req.user?.id
    );
    res.json(result);
  } catch (error) {
    console.error('Post remittance error:', error);
    res.status(500).json({
      error: 'Failed to post remittance',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/remittance/fetch
 * Manually fetch remittance files from Claim.MD
 */
router.post('/remittance/fetch', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const files = await claimMDService.fetchRemittanceFiles(
      req.orgId,
      startDate,
      endDate
    );

    res.json({ files, count: files.length });
  } catch (error) {
    console.error('Fetch remittance files error:', error);
    res.status(500).json({
      error: 'Failed to fetch remittance files',
      message: error.message,
    });
  }
});

// =====================================================
// BILLING MASTERS ENDPOINTS
// =====================================================

/**
 * GET /api/billing/masters/cpt-codes
 * Get CPT codes
 */
router.get('/masters/cpt-codes', async (req, res) => {
  try {
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit) || 100;

    const result = await db.query(
      `SELECT * FROM billing_cpt_codes
       WHERE active = true
       AND (code ILIKE $1 OR description ILIKE $1)
       ORDER BY code
       LIMIT $2`,
      [`%${search}%`, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get CPT codes error:', error);
    res.status(500).json({
      error: 'Failed to fetch CPT codes',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/masters/icd-codes
 * Get ICD codes
 */
router.get('/masters/icd-codes', async (req, res) => {
  try {
    const search = req.query.search || '';
    const limit = parseInt(req.query.limit) || 100;

    const result = await db.query(
      `SELECT * FROM billing_icd_codes
       WHERE active = true
       AND (code ILIKE $1 OR description ILIKE $1)
       ORDER BY code
       LIMIT $2`,
      [`%${search}%`, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ICD codes error:', error);
    res.status(500).json({
      error: 'Failed to fetch ICD codes',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/masters/payers
 * Get payers
 */
router.get('/masters/payers', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM billing_payers
       WHERE active = true
       ORDER BY name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get payers error:', error);
    res.status(500).json({
      error: 'Failed to fetch payers',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/masters/modifiers
 * Get modifiers
 */
router.get('/masters/modifiers', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM billing_modifiers
       WHERE active = true
       ORDER BY code`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get modifiers error:', error);
    res.status(500).json({
      error: 'Failed to fetch modifiers',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/masters/fee-schedule
 * Get fee schedule for CPT code
 */
router.get('/masters/fee-schedule', async (req, res) => {
  try {
    const { cptCode, payerId } = req.query;

    const result = await db.query(
      `SELECT * FROM billing_fee_schedules
       WHERE org_id = $1
       AND cpt_code = $2
       AND (payer_id = $3 OR payer_id IS NULL)
       AND active = true
       AND effective_from <= CURRENT_DATE
       AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
       ORDER BY payer_id DESC NULLS LAST
       LIMIT 1`,
      [req.orgId, cptCode, payerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fee schedule not found for this CPT code' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get fee schedule error:', error);
    res.status(500).json({
      error: 'Failed to fetch fee schedule',
      message: error.message,
    });
  }
});

// =====================================================
// DASHBOARD & REPORTS ENDPOINTS
// =====================================================

/**
 * GET /api/billing/dashboard/kpis
 * Get billing dashboard KPIs
 */
router.get('/dashboard/kpis', async (req, res) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];

    const kpis = await billingService.getDashboardKPIs(req.orgId, startDate, endDate);
    res.json(kpis);
  } catch (error) {
    console.error('Get dashboard KPIs error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard KPIs',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/reports/revenue
 * Get revenue report
 */
router.get('/reports/revenue', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const groupBy = req.query.groupBy || 'day'; // day, week, month

    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = 'YYYY-IW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const result = await db.query(
      `SELECT
         TO_CHAR(service_date_from, $1) as period,
         SUM(total_charge) as billed,
         SUM(total_paid) as collected
       FROM billing_claims
       WHERE org_id = $2
       AND service_date_from >= $3
       AND service_date_to <= $4
       GROUP BY period
       ORDER BY period`,
      [dateFormat, req.orgId, startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue report',
      message: error.message,
    });
  }
});

/**
 * GET /api/billing/reports/denials
 * Get denial reasons report
 */
router.get('/reports/denials', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const result = await db.query(
      `SELECT
         denial_reason,
         COUNT(*) as count,
         SUM(total_charge) as total_amount
       FROM billing_claims
       WHERE org_id = $1
       AND status IN ('denied', 'rejected')
       AND submission_date >= $2
       AND submission_date <= $3
       AND denial_reason IS NOT NULL
       GROUP BY denial_reason
       ORDER BY count DESC
       LIMIT 10`,
      [req.orgId, startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get denials report error:', error);
    res.status(500).json({
      error: 'Failed to fetch denials report',
      message: error.message,
    });
  }
});

// =====================================================
// PAYERS CRUD
// =====================================================

/**
 * GET /api/billing/masters/payers
 * Get all payers
 */
router.get('/masters/payers', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM billing_payers
       WHERE org_id = $1
       ORDER BY name ASC`,
      [req.orgId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get payers error:', error);
    res.status(500).json({
      error: 'Failed to fetch payers',
      message: error.message,
    });
  }
});

/**
 * POST /api/billing/masters/payers
 * Create new payer
 */
router.post('/masters/payers', async (req, res) => {
  try {
    const {
      payer_id,
      name,
      payer_type,
      contact_name,
      contact_phone,
      contact_email,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      website,
      claim_submission_method,
      eligibility_check_enabled,
      prior_auth_required,
    } = req.body;

    const result = await db.query(
      `INSERT INTO billing_payers (
        org_id, payer_id, name, payer_type,
        contact_name, contact_phone, contact_email,
        address_line1, address_line2, city, state, zip_code,
        website, claim_submission_method,
        eligibility_check_enabled, prior_auth_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        req.orgId, payer_id, name, payer_type,
        contact_name, contact_phone, contact_email,
        address_line1, address_line2 || null, city, state, zip_code,
        website || null, claim_submission_method,
        eligibility_check_enabled !== false, prior_auth_required === true
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create payer error:', error);
    res.status(500).json({
      error: 'Failed to create payer',
      message: error.message,
    });
  }
});

/**
 * PUT /api/billing/masters/payers/:id
 * Update payer
 */
router.put('/masters/payers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      payer_id,
      name,
      payer_type,
      contact_name,
      contact_phone,
      contact_email,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      website,
      claim_submission_method,
      eligibility_check_enabled,
      prior_auth_required,
    } = req.body;

    const result = await db.query(
      `UPDATE billing_payers SET
        payer_id = $1, name = $2, payer_type = $3,
        contact_name = $4, contact_phone = $5, contact_email = $6,
        address_line1 = $7, address_line2 = $8, city = $9, state = $10, zip_code = $11,
        website = $12, claim_submission_method = $13,
        eligibility_check_enabled = $14, prior_auth_required = $15,
        updated_at = NOW()
       WHERE id = $16 AND org_id = $17
       RETURNING *`,
      [
        payer_id, name, payer_type,
        contact_name, contact_phone, contact_email,
        address_line1, address_line2 || null, city, state, zip_code,
        website || null, claim_submission_method,
        eligibility_check_enabled !== false, prior_auth_required === true,
        id, req.orgId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update payer error:', error);
    res.status(500).json({
      error: 'Failed to update payer',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/billing/masters/payers/:id
 * Delete payer
 */
router.delete('/masters/payers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payer is used in any claims
    const usageCheck = await db.query(
      `SELECT COUNT(*) as count FROM billing_claims
       WHERE org_id = $1 AND payer_id = $2`,
      [req.orgId, id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete payer that is used in claims',
        message: 'This payer is referenced in existing claims',
      });
    }

    const result = await db.query(
      `DELETE FROM billing_payers
       WHERE id = $1 AND org_id = $2
       RETURNING id`,
      [id, req.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payer not found' });
    }

    res.json({ success: true, message: 'Payer deleted successfully' });
  } catch (error) {
    console.error('Delete payer error:', error);
    res.status(500).json({
      error: 'Failed to delete payer',
      message: error.message,
    });
  }
});

// =====================================================
// ENHANCED PAYERS & PROVIDERS ENDPOINTS (using new services)
// =====================================================

const billingPayersService = require('../services/billing-payers.service');
const billingProvidersService = require('../services/billing-providers.service');

/**
 * GET /api/billing/payers
 * Enhanced payers list with filters
 */
router.get('/payers', async (req, res) => {
  try {
    const result = await billingPayersService.getPayers(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get payers error:', error);
    res.status(500).json({ error: 'Failed to fetch payers', message: error.message });
  }
});

/**
 * GET /api/billing/payers/:id
 * Get payer by ID
 */
router.get('/payers/:id', async (req, res) => {
  try {
    const payer = await billingPayersService.getPayerById(req.params.id);
    if (!payer) {
      return res.status(404).json({ error: 'Payer not found' });
    }
    res.json(payer);
  } catch (error) {
    console.error('Get payer error:', error);
    res.status(500).json({ error: 'Failed to fetch payer', message: error.message });
  }
});

/**
 * POST /api/billing/payers
 * Create payer
 */
router.post('/payers', async (req, res) => {
  try {
    const payer = await billingPayersService.createPayer(req.body);
    res.status(201).json(payer);
  } catch (error) {
    console.error('Create payer error:', error);
    res.status(500).json({ error: 'Failed to create payer', message: error.message });
  }
});

/**
 * PUT /api/billing/payers/:id
 * Update payer
 */
router.put('/payers/:id', async (req, res) => {
  try {
    const payer = await billingPayersService.updatePayer(req.params.id, req.body);
    res.json(payer);
  } catch (error) {
    console.error('Update payer error:', error);
    res.status(500).json({ error: 'Failed to update payer', message: error.message });
  }
});

/**
 * GET /api/billing/providers
 * Enhanced providers list with filters
 */
router.get('/providers', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const result = await billingProvidersService.getProviders(orgId, req.query);
    res.json(result);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers', message: error.message });
  }
});

/**
 * GET /api/billing/providers/:id
 * Get provider by ID
 */
router.get('/providers/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const provider = await billingProvidersService.getProviderById(orgId, req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ error: 'Failed to fetch provider', message: error.message });
  }
});

/**
 * GET /api/billing/providers/verify-npi/:npi
 * Verify NPI with NPPES registry
 */
router.get('/providers/verify-npi/:npi', async (req, res) => {
  try {
    const result = await billingProvidersService.verifyNPI(req.params.npi);
    res.json(result);
  } catch (error) {
    console.error('Verify NPI error:', error);
    res.status(500).json({ error: 'Failed to verify NPI', message: error.message });
  }
});

/**
 * POST /api/billing/providers
 * Create provider
 */
router.post('/providers', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const provider = await billingProvidersService.createProvider(orgId, req.body);
    res.status(201).json(provider);
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ error: 'Failed to create provider', message: error.message });
  }
});

/**
 * PUT /api/billing/providers/:id
 * Update provider
 */
router.put('/providers/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const provider = await billingProvidersService.updateProvider(orgId, req.params.id, req.body);
    res.json(provider);
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ error: 'Failed to update provider', message: error.message });
  }
});

module.exports = router;
