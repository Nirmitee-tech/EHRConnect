/**
 * OB/GYN API Routes
 * RESTful endpoints for OB/GYN-specific clinical data
 */

const express = require('express');
const ObGynService = require('../services/obgyn.service');

const router = express.Router();

/**
 * Initialize OB/GYN routes with database pool
 */
function initializeObGynRoutes(pool) {
  const obgynService = new ObGynService(pool);

  // ============================================
  // EPDS (Edinburgh Postnatal Depression Scale)
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/epds
   * Save EPDS assessment
   */
  router.post('/patients/:patientId/obgyn/epds', async (req, res) => {
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

      const result = await obgynService.saveEPDSAssessment({
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
      console.error('Error saving EPDS assessment:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/epds
   * Get EPDS assessments for a patient
   */
  router.get('/patients/:patientId/obgyn/epds', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const assessments = await obgynService.getEPDSAssessments(patientId, episodeId);

      return res.json({
        success: true,
        assessments,
        count: assessments.length
      });
    } catch (error) {
      console.error('Error fetching EPDS assessments:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/epds/latest
   * Get latest EPDS assessment
   */
  router.get('/patients/:patientId/obgyn/epds/latest', async (req, res) => {
    try {
      const { patientId } = req.params;

      const assessment = await obgynService.getLatestEPDS(patientId);

      return res.json({
        success: true,
        assessment
      });
    } catch (error) {
      console.error('Error fetching latest EPDS:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Labor & Delivery
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/labor-delivery
   * Save labor & delivery record
   */
  router.post('/patients/:patientId/obgyn/labor-delivery', async (req, res) => {
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

      const result = await obgynService.saveLaborDeliveryRecord({
        ...req.body,
        patientId,
        recordedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error saving labor/delivery record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/labor-delivery/:episodeId
   * Get labor & delivery record for an episode
   */
  router.get('/patients/:patientId/obgyn/labor-delivery/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;

      const record = await obgynService.getLaborDeliveryRecord(episodeId);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Labor/delivery record not found'
        });
      }

      return res.json({
        success: true,
        record
      });
    } catch (error) {
      console.error('Error fetching labor/delivery record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/labor-delivery/:recordId
   * Update labor & delivery record
   */
  router.patch('/patients/:patientId/obgyn/labor-delivery/:recordId', async (req, res) => {
    try {
      const { recordId } = req.params;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-user-id'
        });
      }

      const record = await obgynService.updateLaborDeliveryRecord(
        recordId,
        req.body,
        userId
      );

      return res.json({
        success: true,
        record
      });
    } catch (error) {
      console.error('Error updating labor/delivery record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Postpartum Visits
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/postpartum-visits
   * Save postpartum visit
   */
  router.post('/patients/:patientId/obgyn/postpartum-visits', async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.headers['x-org-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-org-id'
        });
      }

      const result = await obgynService.savePostpartumVisit({
        ...req.body,
        patientId,
        orgId
      });

      return res.status(201).json({
        success: true,
        visit: result
      });
    } catch (error) {
      console.error('Error saving postpartum visit:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/postpartum-visits
   * Get postpartum visits for a patient
   */
  router.get('/patients/:patientId/obgyn/postpartum-visits', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const visits = await obgynService.getPostpartumVisits(patientId, episodeId);

      return res.json({
        success: true,
        visits,
        count: visits.length
      });
    } catch (error) {
      console.error('Error fetching postpartum visits:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Ultrasound Records
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/ultrasounds
   * Save ultrasound record
   */
  router.post('/patients/:patientId/obgyn/ultrasounds', async (req, res) => {
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

      const result = await obgynService.saveUltrasoundRecord({
        ...req.body,
        patientId,
        recordedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error saving ultrasound record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/ultrasounds
   * Get ultrasound records for a patient
   */
  router.get('/patients/:patientId/obgyn/ultrasounds', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const records = await obgynService.getUltrasoundRecords(patientId, episodeId);

      return res.json({
        success: true,
        records,
        count: records.length
      });
    } catch (error) {
      console.error('Error fetching ultrasound records:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/ultrasounds/:recordId
   * Get ultrasound record by ID
   */
  router.get('/patients/:patientId/obgyn/ultrasounds/:recordId', async (req, res) => {
    try {
      const { recordId } = req.params;

      const record = await obgynService.getUltrasoundById(recordId);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Ultrasound record not found'
        });
      }

      return res.json({
        success: true,
        record
      });
    } catch (error) {
      console.error('Error fetching ultrasound record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Complications
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/complications
   * Save complication record
   */
  router.post('/patients/:patientId/obgyn/complications', async (req, res) => {
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

      const result = await obgynService.saveComplication({
        ...req.body,
        patientId,
        recordedBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        complication: result
      });
    } catch (error) {
      console.error('Error saving complication:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/complications
   * Get complications for a patient
   */
  router.get('/patients/:patientId/obgyn/complications', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const complications = await obgynService.getComplications(patientId, episodeId);

      return res.json({
        success: true,
        complications,
        count: complications.length
      });
    } catch (error) {
      console.error('Error fetching complications:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/complications/:complicationId
   * Update complication
   */
  router.patch('/patients/:patientId/obgyn/complications/:complicationId', async (req, res) => {
    try {
      const { complicationId } = req.params;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-user-id'
        });
      }

      const result = await obgynService.updateComplication(complicationId, req.body, userId);

      return res.json({
        success: true,
        complication: result
      });
    } catch (error) {
      console.error('Error updating complication:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Baby Records
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/babies
   * Save baby record
   */
  router.post('/patients/:patientId/obgyn/babies', async (req, res) => {
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

      const result = await obgynService.saveBabyRecord({
        ...req.body,
        maternalPatientId: patientId,
        createdBy: userId,
        orgId
      });

      return res.status(201).json({
        success: true,
        baby: result
      });
    } catch (error) {
      console.error('Error saving baby record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/babies
   * Get baby records for a maternal patient
   */
  router.get('/patients/:patientId/obgyn/babies', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const babies = await obgynService.getBabyRecords(patientId, episodeId);

      return res.json({
        success: true,
        babies,
        count: babies.length
      });
    } catch (error) {
      console.error('Error fetching baby records:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Pregnancy History
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/pregnancy-history
   * Save pregnancy history (GTPAL, prior pregnancies, risk factors)
   */
  router.post('/patients/:patientId/obgyn/pregnancy-history', async (req, res) => {
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

      const result = await obgynService.savePregnancyHistory(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        history: result
      });
    } catch (error) {
      console.error('Error saving pregnancy history:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/pregnancy-history
   * Get pregnancy history for a patient
   */
  router.get('/patients/:patientId/obgyn/pregnancy-history', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const history = await obgynService.getPregnancyHistory(patientId, episodeId);

      return res.json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Error fetching pregnancy history:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Genetic Screening
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/genetic-screening
   * Save genetic screening data
   */
  router.post('/patients/:patientId/obgyn/genetic-screening', async (req, res) => {
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

      const result = await obgynService.saveGeneticScreening(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        screening: result
      });
    } catch (error) {
      console.error('Error saving genetic screening:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/genetic-screening
   * Get genetic screening for a patient
   */
  router.get('/patients/:patientId/obgyn/genetic-screening', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const screening = await obgynService.getGeneticScreening(patientId, episodeId);

      return res.json({
        success: true,
        screening
      });
    } catch (error) {
      console.error('Error fetching genetic screening:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Labs Tracking
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/labs
   * Save labs tracking data
   */
  router.post('/patients/:patientId/obgyn/labs', async (req, res) => {
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

      const result = await obgynService.saveLabsTracking(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        labs: result
      });
    } catch (error) {
      console.error('Error saving labs tracking:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/labs
   * Get labs tracking for a patient
   */
  router.get('/patients/:patientId/obgyn/labs', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const labs = await obgynService.getLabsTracking(patientId, episodeId);

      return res.json({
        success: true,
        labs
      });
    } catch (error) {
      console.error('Error fetching labs tracking:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Kick Counts (Fetal Movement)
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/kick-counts
   * Save kick count sessions
   */
  router.post('/patients/:patientId/obgyn/kick-counts', async (req, res) => {
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

      const result = await obgynService.saveKickCounts(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        kickCounts: result
      });
    } catch (error) {
      console.error('Error saving kick counts:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/kick-counts
   * Get kick counts for a patient
   */
  router.get('/patients/:patientId/obgyn/kick-counts', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const kickCounts = await obgynService.getKickCounts(patientId, episodeId);

      return res.json({
        success: true,
        kickCounts
      });
    } catch (error) {
      console.error('Error fetching kick counts:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Birth Plan
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/birth-plan
   * Save birth plan
   */
  router.post('/patients/:patientId/obgyn/birth-plan', async (req, res) => {
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

      const result = await obgynService.saveBirthPlan(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        birthPlan: result
      });
    } catch (error) {
      console.error('Error saving birth plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/birth-plan
   * Get birth plan for a patient
   */
  router.get('/patients/:patientId/obgyn/birth-plan', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const birthPlan = await obgynService.getBirthPlan(patientId, episodeId);

      return res.json({
        success: true,
        birthPlan
      });
    } catch (error) {
      console.error('Error fetching birth plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Vitals Log
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/vitals-log
   * Save vitals log entries
   */
  router.post('/patients/:patientId/obgyn/vitals-log', async (req, res) => {
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

      const result = await obgynService.saveVitalsLog(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        vitalsLog: result
      });
    } catch (error) {
      console.error('Error saving vitals log:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/vitals-log
   * Get vitals log for a patient
   */
  router.get('/patients/:patientId/obgyn/vitals-log', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const vitalsLog = await obgynService.getVitalsLog(patientId, episodeId);

      return res.json({
        success: true,
        vitalsLog
      });
    } catch (error) {
      console.error('Error fetching vitals log:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Fetal Assessment (NST/BPP)
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/fetal-assessment
   * Save NST/BPP records
   */
  router.post('/patients/:patientId/obgyn/fetal-assessment', async (req, res) => {
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

      const result = await obgynService.saveNSTRecord(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        fetalAssessment: result
      });
    } catch (error) {
      console.error('Error saving fetal assessment:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/fetal-assessment
   * Get fetal assessment records for a patient
   */
  router.get('/patients/:patientId/obgyn/fetal-assessment', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const fetalAssessment = await obgynService.getFetalAssessment(patientId, episodeId);

      return res.json({
        success: true,
        fetalAssessment
      });
    } catch (error) {
      console.error('Error fetching fetal assessment:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Risk Assessment
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/risk-assessment
   * Save risk assessment
   */
  router.post('/patients/:patientId/obgyn/risk-assessment', async (req, res) => {
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

      const result = await obgynService.saveRiskAssessment(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        riskAssessment: result
      });
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/risk-assessment
   * Get risk assessment for a patient
   */
  router.get('/patients/:patientId/obgyn/risk-assessment', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const riskAssessment = await obgynService.getRiskAssessment(patientId, episodeId);

      return res.json({
        success: true,
        riskAssessment
      });
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Medication Review
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/medication-review
   * Save medication review
   */
  router.post('/patients/:patientId/obgyn/medication-review', async (req, res) => {
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

      const result = await obgynService.saveMedicationReview(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        medicationReview: result
      });
    } catch (error) {
      console.error('Error saving medication review:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/medication-review
   * Get medication review for a patient
   */
  router.get('/patients/:patientId/obgyn/medication-review', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const medicationReview = await obgynService.getMedicationReview(patientId, episodeId);

      return res.json({
        success: true,
        medicationReview
      });
    } catch (error) {
      console.error('Error fetching medication review:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Consent Management
  // ============================================

  /**
   * POST /api/patients/:patientId/obgyn/consents
   * Save consent records
   */
  router.post('/patients/:patientId/obgyn/consents', async (req, res) => {
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

      const result = await obgynService.saveConsents(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        consents: result
      });
    } catch (error) {
      console.error('Error saving consents:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/consents
   * Get consents for a patient
   */
  router.get('/patients/:patientId/obgyn/consents', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const consents = await obgynService.getConsents(patientId, episodeId);

      return res.json({
        success: true,
        consents
      });
    } catch (error) {
      console.error('Error fetching consents:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Cycles
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles
   * Get IVF cycles for a patient
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const cycles = await obgynService.getIVFCycles(patientId, episodeId);

      return res.json({
        success: true,
        cycles
      });
    } catch (error) {
      console.error('Error fetching IVF cycles:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles
   * Create a new IVF cycle
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles', async (req, res) => {
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

      const result = await obgynService.createIVFCycle(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        cycle: result
      });
    } catch (error) {
      console.error('Error creating IVF cycle:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId
   * Update an IVF cycle
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId', async (req, res) => {
    try {
      const { cycleId } = req.params;
      const userId = req.headers['x-user-id'];

      const result = await obgynService.updateIVFCycle(cycleId, {
        ...req.body,
        userId
      });

      return res.json({
        success: true,
        cycle: result
      });
    } catch (error) {
      console.error('Error updating IVF cycle:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Monitoring (Daily Stimulation Tracking)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring
   * Get monitoring records for an IVF cycle
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring', async (req, res) => {
    try {
      const { cycleId } = req.params;

      const records = await obgynService.getIVFMonitoring(cycleId);

      return res.json({
        success: true,
        records,
        count: records.length
      });
    } catch (error) {
      console.error('Error fetching IVF monitoring records:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring
   * Create a monitoring record
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await obgynService.createIVFMonitoring(cycleId, {
        ...req.body,
        patientId,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error creating IVF monitoring record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring/:monitoringId
   * Update a monitoring record
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring/:monitoringId', async (req, res) => {
    try {
      const { monitoringId } = req.params;

      const result = await obgynService.updateIVFMonitoring(monitoringId, req.body);

      return res.json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error updating IVF monitoring record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring/:monitoringId
   * Delete a monitoring record
   */
  router.delete('/patients/:patientId/obgyn/ivf-cycles/:cycleId/monitoring/:monitoringId', async (req, res) => {
    try {
      const { monitoringId } = req.params;

      await obgynService.deleteIVFMonitoring(monitoringId);

      return res.json({
        success: true,
        message: 'Monitoring record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting IVF monitoring record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Retrievals (Egg Collection Procedures)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval
   * Get retrieval record for a cycle
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval', async (req, res) => {
    try {
      const { cycleId } = req.params;

      const record = await obgynService.getIVFRetrieval(cycleId);

      return res.json({
        success: true,
        record
      });
    } catch (error) {
      console.error('Error fetching IVF retrieval record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval
   * Create retrieval record
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await obgynService.createIVFRetrieval(cycleId, {
        ...req.body,
        patientId,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error creating IVF retrieval record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId
   * Update retrieval record
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId', async (req, res) => {
    try {
      const { retrievalId } = req.params;

      const result = await obgynService.updateIVFRetrieval(retrievalId, req.body);

      return res.json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error updating IVF retrieval record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Oocytes (Individual Oocyte Tracking)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId/oocytes
   * Get oocytes for a retrieval
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId/oocytes', async (req, res) => {
    try {
      const { retrievalId } = req.params;

      const records = await obgynService.getIVFOocytes(retrievalId);

      return res.json({
        success: true,
        records,
        count: records.length
      });
    } catch (error) {
      console.error('Error fetching IVF oocytes:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId/oocytes
   * Create oocyte record
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId/oocytes', async (req, res) => {
    try {
      const { patientId, cycleId, retrievalId } = req.params;
      const orgId = req.headers['x-org-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-org-id'
        });
      }

      const result = await obgynService.createIVFOocyte(retrievalId, {
        ...req.body,
        cycleId,
        patientId,
        orgId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error creating IVF oocyte record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId/oocytes/:oocyteId
   * Update oocyte record
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId/retrieval/:retrievalId/oocytes/:oocyteId', async (req, res) => {
    try {
      const { oocyteId } = req.params;

      const result = await obgynService.updateIVFOocyte(oocyteId, req.body);

      return res.json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error updating IVF oocyte record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Embryo Development (Day-by-Day Tracking)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/embryos
   * Get embryo development records for a cycle
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/embryos', async (req, res) => {
    try {
      const { cycleId } = req.params;

      const records = await obgynService.getIVFEmbryoDevelopment(cycleId);

      return res.json({
        success: true,
        records,
        count: records.length
      });
    } catch (error) {
      console.error('Error fetching IVF embryo development records:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/embryos
   * Create embryo development record
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles/:cycleId/embryos', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;
      const orgId = req.headers['x-org-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-org-id'
        });
      }

      const result = await obgynService.createIVFEmbryoDevelopment(cycleId, {
        ...req.body,
        patientId,
        orgId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error creating IVF embryo development record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/embryos/:embryoId
   * Update embryo development record
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId/embryos/:embryoId', async (req, res) => {
    try {
      const { embryoId } = req.params;

      const result = await obgynService.updateIVFEmbryoDevelopment(embryoId, req.body);

      return res.json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error updating IVF embryo development record:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Transfers (Phase 3: Transfer Precision)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers
   * Get all transfers for a cycle
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;

      const transfers = await obgynService.getIVFTransfers(patientId, cycleId);

      return res.json({
        success: true,
        transfers,
        count: transfers.length
      });
    } catch (error) {
      console.error('Error fetching IVF transfers:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId
   * Get single transfer by ID
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId', async (req, res) => {
    try {
      const { patientId, transferId } = req.params;

      const transfer = await obgynService.getIVFTransfer(patientId, transferId);

      if (!transfer) {
        return res.status(404).json({
          success: false,
          error: 'Transfer not found'
        });
      }

      return res.json({
        success: true,
        transfer
      });
    } catch (error) {
      console.error('Error fetching IVF transfer:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers
   * Create new transfer record
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;
      const userId = req.headers['x-user-id'] || req.headers['x-org-id'] || 'system';

      const transfer = await obgynService.createIVFTransfer(patientId, cycleId, req.body, userId);

      return res.status(201).json({
        success: true,
        transfer
      });
    } catch (error) {
      console.error('Error creating IVF transfer:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId
   * Update transfer record
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId', async (req, res) => {
    try {
      const { transferId } = req.params;
      const userId = req.headers['x-user-id'] || req.headers['x-org-id'] || 'system';

      const transfer = await obgynService.updateIVFTransfer(transferId, {
        ...req.body,
        userId
      });

      return res.json({
        success: true,
        transfer
      });
    } catch (error) {
      console.error('Error updating IVF transfer:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId
   * Delete transfer record
   */
  router.delete('/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId', async (req, res) => {
    try {
      const { transferId } = req.params;

      const success = await obgynService.deleteIVFTransfer(transferId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Transfer not found'
        });
      }

      return res.json({
        success: true,
        message: 'Transfer deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting IVF transfer:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // IVF Pregnancy Outcomes (Phase 4: Outcome Intelligence)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome
   * Get pregnancy outcome for a cycle
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;

      const outcome = await obgynService.getIVFPregnancyOutcome(patientId, cycleId);

      return res.json({
        success: true,
        outcome
      });
    } catch (error) {
      console.error('Error fetching pregnancy outcome:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId/pregnancy-outcome
   * Get pregnancy outcome by transfer ID
   */
  router.get('/patients/:patientId/obgyn/ivf-cycles/:cycleId/transfers/:transferId/pregnancy-outcome', async (req, res) => {
    try {
      const { transferId } = req.params;

      const outcome = await obgynService.getIVFPregnancyOutcomeByTransfer(transferId);

      return res.json({
        success: true,
        outcome
      });
    } catch (error) {
      console.error('Error fetching pregnancy outcome by transfer:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome
   * Create pregnancy outcome record
   */
  router.post('/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome', async (req, res) => {
    try {
      const { patientId, cycleId } = req.params;
      const userId = req.headers['x-user-id'] || req.headers['x-org-id'] || 'system';

      const outcome = await obgynService.createIVFPregnancyOutcome(patientId, cycleId, req.body, userId);

      return res.status(201).json({
        success: true,
        outcome
      });
    } catch (error) {
      console.error('Error creating pregnancy outcome:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome/:outcomeId
   * Update pregnancy outcome record
   */
  router.patch('/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome/:outcomeId', async (req, res) => {
    try {
      const { outcomeId } = req.params;
      const userId = req.headers['x-user-id'] || req.headers['x-org-id'] || 'system';

      const outcome = await obgynService.updateIVFPregnancyOutcome(outcomeId, {
        ...req.body,
        userId
      });

      return res.json({
        success: true,
        outcome
      });
    } catch (error) {
      console.error('Error updating pregnancy outcome:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome/:outcomeId
   * Delete pregnancy outcome record
   */
  router.delete('/patients/:patientId/obgyn/ivf-cycles/:cycleId/pregnancy-outcome/:outcomeId', async (req, res) => {
    try {
      const { outcomeId } = req.params;

      const success = await obgynService.deleteIVFPregnancyOutcome(outcomeId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Pregnancy outcome not found'
        });
      }

      return res.json({
        success: true,
        message: 'Pregnancy outcome deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting pregnancy outcome:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Cervical Length
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/cervical-length
   * Get cervical length measurements
   */
  router.get('/patients/:patientId/obgyn/cervical-length', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const measurements = await obgynService.getCervicalLengths(patientId, episodeId);

      return res.json({
        success: true,
        measurements
      });
    } catch (error) {
      console.error('Error fetching cervical lengths:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/cervical-length
   * Save a cervical length measurement
   */
  router.post('/patients/:patientId/obgyn/cervical-length', async (req, res) => {
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

      const result = await obgynService.saveCervicalLength(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        measurement: result
      });
    } catch (error) {
      console.error('Error saving cervical length:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Patient Education
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/education
   * Get patient education records
   */
  router.get('/patients/:patientId/obgyn/education', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const records = await obgynService.getPatientEducation(patientId, episodeId);

      return res.json({
        success: true,
        records
      });
    } catch (error) {
      console.error('Error fetching patient education:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/education
   * Save patient education record
   */
  router.post('/patients/:patientId/obgyn/education', async (req, res) => {
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

      const result = await obgynService.savePatientEducation(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        record: result
      });
    } catch (error) {
      console.error('Error saving patient education:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Care Plans (FHIR R4)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/care-plans
   * Get care plans for a patient
   */
  router.get('/patients/:patientId/obgyn/care-plans', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { episodeId } = req.query;

      const carePlans = await obgynService.getCarePlans(patientId, episodeId);

      return res.json({
        success: true,
        carePlans
      });
    } catch (error) {
      console.error('Error fetching care plans:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/care-plans
   * Create a new care plan
   */
  router.post('/patients/:patientId/obgyn/care-plans', async (req, res) => {
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

      const result = await obgynService.createCarePlan(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        carePlan: result
      });
    } catch (error) {
      console.error('Error creating care plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/care-plans/:carePlanId
   * Update a care plan
   */
  router.patch('/patients/:patientId/obgyn/care-plans/:carePlanId', async (req, res) => {
    try {
      const { patientId, carePlanId } = req.params;
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      const result = await obgynService.updateCarePlan(carePlanId, req.body);

      return res.json({
        success: true,
        carePlan: result
      });
    } catch (error) {
      console.error('Error updating care plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/care-plans/:carePlanId/activities
   * Add activity to care plan
   */
  router.post('/patients/:patientId/obgyn/care-plans/:carePlanId/activities', async (req, res) => {
    try {
      const { carePlanId } = req.params;
      const { activity } = req.body;

      const result = await obgynService.addCarePlanActivity(carePlanId, activity);

      return res.status(201).json({
        success: true,
        carePlan: result
      });
    } catch (error) {
      console.error('Error adding activity:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/care-plans/:carePlanId/activities/:activityIndex
   * Update activity status
   */
  router.patch('/patients/:patientId/obgyn/care-plans/:carePlanId/activities/:activityIndex', async (req, res) => {
    try {
      const { carePlanId, activityIndex } = req.params;
      const { status } = req.body;

      const result = await obgynService.updateActivityStatus(carePlanId, parseInt(activityIndex), status);

      return res.json({
        success: true,
        carePlan: result
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // Goals (FHIR R4)
  // ============================================

  /**
   * GET /api/patients/:patientId/obgyn/goals
   * Get goals for a patient
   */
  router.get('/patients/:patientId/obgyn/goals', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { carePlanId, episodeId } = req.query;

      const goals = await obgynService.getGoals(patientId, carePlanId, episodeId);

      return res.json({
        success: true,
        goals
      });
    } catch (error) {
      console.error('Error fetching goals:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/obgyn/goals
   * Create a new goal
   */
  router.post('/patients/:patientId/obgyn/goals', async (req, res) => {
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

      const result = await obgynService.createGoal(patientId, {
        ...req.body,
        orgId,
        userId
      });

      return res.status(201).json({
        success: true,
        goal: result
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/obgyn/goals/:goalId
   * Update a goal
   */
  router.patch('/patients/:patientId/obgyn/goals/:goalId', async (req, res) => {
    try {
      const { goalId } = req.params;

      const result = await obgynService.updateGoal(goalId, req.body);

      return res.json({
        success: true,
        goal: result
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/patients/:patientId/obgyn/goals/:goalId
   * Delete a goal
   */
  router.delete('/patients/:patientId/obgyn/goals/:goalId', async (req, res) => {
    try {
      const { goalId } = req.params;

      await obgynService.deleteGoal(goalId);

      return res.json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = initializeObGynRoutes;
