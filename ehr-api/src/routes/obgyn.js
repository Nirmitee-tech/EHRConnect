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

  return router;
}

module.exports = initializeObGynRoutes;
