/**
 * Pediatrics API Routes
 * RESTful endpoints for pediatric-specific clinical data
 */

const express = require('express');
const PediatricsService = require('../services/pediatrics.service');

const router = express.Router();

/**
 * Initialize Pediatrics routes with database pool
 */
function initializePediatricsRoutes(pool) {
  const pediatricsService = new PediatricsService(pool);

  // ============================================
  // Patient Demographics
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/demographics
   * Save pediatric patient demographics
   */
  router.post('/patients/:patientId/pediatrics/demographics', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-org-id'
        });
      }

      const result = await pediatricsService.saveDemographics({
        ...req.body,
        patientId,
        orgId
      });

      return res.status(201).json({
        success: true,
        demographics: result
      });
    } catch (error) {
      console.error('Error saving pediatric demographics:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/demographics
   * Get pediatric demographics
   */
  router.get('/patients/:patientId/pediatrics/demographics', async (req, res) => {
    try {
      const { patientId } = req.params;

      const demographics = await pediatricsService.getDemographics(patientId);

      return res.json({
        success: true,
        demographics
      });
    } catch (error) {
      console.error('Error fetching pediatric demographics:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Growth Records & Charts
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/growth
   * Save growth record
   */
  router.post('/patients/:patientId/pediatrics/growth', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await pediatricsService.saveGrowthRecord({
        ...req.body,
        patientId,
        recordedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        growthRecord: result
      });
    } catch (error) {
      console.error('Error saving growth record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/growth
   * Get growth records
   */
  router.get('/patients/:patientId/pediatrics/growth', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId, startDate, endDate } = req.query;

      const records = await pediatricsService.getGrowthRecords(patientId, {
        episodeId,
        startDate,
        endDate
      });

      return res.json({
        success: true,
        records,
        count: records.length
      });
    } catch (error) {
      console.error('Error fetching growth records:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/growth/percentiles
   * Calculate growth percentiles
   */
  router.get('/patients/:patientId/pediatrics/growth/percentiles', async (req, res) => {
    try {
      const { patientId } = req.params;

      const percentiles = await pediatricsService.calculateGrowthPercentiles(patientId);

      return res.json({
        success: true,
        percentiles
      });
    } catch (error) {
      console.error('Error calculating percentiles:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Vital Signs
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/vitals
   * Save vital signs
   */
  router.post('/patients/:patientId/pediatrics/vitals', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await pediatricsService.saveVitalSigns({
        ...req.body,
        patientId,
        recordedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        vitalSigns: result
      });
    } catch (error) {
      console.error('Error saving vital signs:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/vitals
   * Get vital signs
   */
  router.get('/patients/:patientId/pediatrics/vitals', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId, limit } = req.query;

      const vitals = await pediatricsService.getVitalSigns(patientId, {
        episodeId,
        limit: limit ? parseInt(limit) : 20
      });

      return res.json({
        success: true,
        vitals,
        count: vitals.length
      });
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Well Visits
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/well-visits
   * Save well-child visit
   */
  router.post('/patients/:patientId/pediatrics/well-visits', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await pediatricsService.saveWellVisit({
        ...req.body,
        patientId,
        recordedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        wellVisit: result
      });
    } catch (error) {
      console.error('Error saving well visit:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/well-visits
   * Get well-child visits
   */
  router.get('/patients/:patientId/pediatrics/well-visits', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const visits = await pediatricsService.getWellVisits(patientId, episodeId);

      return res.json({
        success: true,
        visits,
        count: visits.length
      });
    } catch (error) {
      console.error('Error fetching well visits:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/well-visits/schedule
   * Get due well-child visits
   */
  router.get('/patients/:patientId/pediatrics/well-visits/schedule', async (req, res) => {
    try {
      const { patientId } = req.params;

      const schedule = await pediatricsService.getWellVisitSchedule(patientId);

      return res.json({
        success: true,
        schedule
      });
    } catch (error) {
      console.error('Error generating well visit schedule:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Immunizations
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/immunizations
   * Record immunization
   */
  router.post('/patients/:patientId/pediatrics/immunizations', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await pediatricsService.saveImmunization({
        ...req.body,
        patientId,
        administeredBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        immunization: result
      });
    } catch (error) {
      console.error('Error saving immunization:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/immunizations
   * Get immunization records
   */
  router.get('/patients/:patientId/pediatrics/immunizations', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const immunizations = await pediatricsService.getImmunizations(patientId, episodeId);

      return res.json({
        success: true,
        immunizations,
        count: immunizations.length
      });
    } catch (error) {
      console.error('Error fetching immunizations:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/immunizations/schedule
   * Get immunization schedule (due vaccines)
   */
  router.get('/patients/:patientId/pediatrics/immunizations/schedule', async (req, res) => {
    try {
      const { patientId } = req.params;

      const schedule = await pediatricsService.getImmunizationSchedule(patientId);

      return res.json({
        success: true,
        schedule
      });
    } catch (error) {
      console.error('Error generating immunization schedule:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/pediatrics/immunizations/catch-up
   * Generate catch-up immunization schedule
   */
  router.post('/patients/:patientId/pediatrics/immunizations/catch-up', async (req, res) => {
    try {
      const { patientId } = req.params;

      const catchUpSchedule = await pediatricsService.generateCatchUpSchedule(patientId);

      return res.json({
        success: true,
        catchUpSchedule
      });
    } catch (error) {
      console.error('Error generating catch-up schedule:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Developmental Screening
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/developmental-screening
   * Save developmental screening
   */
  router.post('/patients/:patientId/pediatrics/developmental-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await pediatricsService.saveDevelopmentalScreening({
        ...req.body,
        patientId,
        screenedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        screening: result
      });
    } catch (error) {
      console.error('Error saving developmental screening:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/developmental-screening
   * Get developmental screenings
   */
  router.get('/patients/:patientId/pediatrics/developmental-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const screenings = await pediatricsService.getDevelopmentalScreenings(patientId, episodeId);

      return res.json({
        success: true,
        screenings,
        count: screenings.length
      });
    } catch (error) {
      console.error('Error fetching developmental screenings:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Newborn Screening
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/newborn-screening
   * Save newborn screening results
   */
  router.post('/patients/:patientId/pediatrics/newborn-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-org-id'
        });
      }

      const result = await pediatricsService.saveNewbornScreening({
        ...req.body,
        patientId,
        orgId
      });

      return res.status(201).json({
        success: true,
        screening: result
      });
    } catch (error) {
      console.error('Error saving newborn screening:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/newborn-screening
   * Get newborn screening results
   */
  router.get('/patients/:patientId/pediatrics/newborn-screening', async (req, res) => {
    try {
      const { patientId } = req.params;

      const screenings = await pediatricsService.getNewbornScreenings(patientId);

      return res.json({
        success: true,
        screenings,
        count: screenings.length
      });
    } catch (error) {
      console.error('Error fetching newborn screenings:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // HEADSS Assessment
  // ============================================

  /**
   * POST /api/patients/:patientId/pediatrics/headss
   * Save HEADSS assessment
   */
  router.post('/patients/:patientId/pediatrics/headss', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await pediatricsService.saveHEADSSAssessment({
        ...req.body,
        patientId,
        assessedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        assessment: result
      });
    } catch (error) {
      console.error('Error saving HEADSS assessment:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/pediatrics/headss
   * Get HEADSS assessments
   */
  router.get('/patients/:patientId/pediatrics/headss', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const assessments = await pediatricsService.getHEADSSAssessments(patientId, episodeId);

      return res.json({
        success: true,
        assessments,
        count: assessments.length
      });
    } catch (error) {
      console.error('Error fetching HEADSS assessments:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Additional Screening Endpoints
  // ============================================

  // Lead Screening
  router.post('/patients/:patientId/pediatrics/lead-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];

      const result = await pediatricsService.saveLeadScreening({
        ...req.body,
        patientId,
        orgId
      });

      return res.status(201).json({ success: true, screening: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/patients/:patientId/pediatrics/lead-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const screenings = await pediatricsService.getLeadScreenings(patientId);
      return res.json({ success: true, screenings });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Autism Screening
  router.post('/patients/:patientId/pediatrics/autism-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      const result = await pediatricsService.saveAutismScreening({
        ...req.body,
        patientId,
        screenedBy: userId,
        orgId
      });

      return res.status(201).json({ success: true, screening: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/patients/:patientId/pediatrics/autism-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const screenings = await pediatricsService.getAutismScreenings(patientId);
      return res.json({ success: true, screenings });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

module.exports = initializePediatricsRoutes;
