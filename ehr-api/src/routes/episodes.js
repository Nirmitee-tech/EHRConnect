/**
 * Episode API Routes
 * RESTful endpoints for FHIR EpisodeOfCare resources
 */

const express = require('express');
const EpisodeService = require('../services/episode.service');

const router = express.Router();

/**
 * Initialize episode service with database pool
 * This should be called from the main app
 */
function initializeEpisodeRoutes(pool) {
  const episodeService = new EpisodeService(pool);

  /**
   * POST /api/patients/:patientId/episodes
   * Create a new episode for a patient
   */
  router.post('/patients/:patientId/episodes', async (req, res) => {
    try {
      const { patientId } = req.params;
      const {
        specialtySlug,
        status,
        startDate,
        careManagerId,
        careTeamIds,
        metadata
      } = req.body;

      // Get org ID and user ID from headers
      const orgId = req.headers['x-org-id'];
      const userId = req.headers['x-user-id'];

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-org-id, x-user-id'
        });
      }

      if (!specialtySlug) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: specialtySlug'
        });
      }

      const result = await episodeService.createEpisode({
        patientId,
        specialtySlug,
        orgId,
        status,
        startDate,
        careManagerId,
        careTeamIds,
        metadata,
        createdBy: userId
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating episode:', error);
      return res.status(error.message.includes('already has an active episode') ? 409 : 500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/episodes
   * Get all episodes for a patient
   */
  router.get('/patients/:patientId/episodes', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { specialtySlug, status, activeOnly } = req.query;

      const episodes = await episodeService.getPatientEpisodes(patientId, {
        specialtySlug,
        status: status ? (status.includes(',') ? status.split(',') : status) : undefined,
        activeOnly: activeOnly === 'true'
      });

      return res.json({
        success: true,
        episodes,
        count: episodes.length
      });
    } catch (error) {
      console.error('Error fetching patient episodes:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/patients/:patientId/episodes/:episodeId
   * Get a specific episode
   */
  router.get('/patients/:patientId/episodes/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const { includeFHIR } = req.query;

      const episode = await episodeService.getEpisodeById(
        episodeId,
        includeFHIR !== 'false'
      );

      return res.json({
        success: true,
        episode
      });
    } catch (error) {
      console.error('Error fetching episode:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/patients/:patientId/episodes/:episodeId
   * Update an episode
   */
  router.patch('/patients/:patientId/episodes/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const updates = req.body;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-user-id'
        });
      }

      const episode = await episodeService.updateEpisode(
        episodeId,
        updates,
        userId
      );

      return res.json({
        success: true,
        episode
      });
    } catch (error) {
      console.error('Error updating episode:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/patients/:patientId/episodes/:episodeId/close
   * Close an episode
   */
  router.post('/patients/:patientId/episodes/:episodeId/close', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const { reason } = req.body;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-user-id'
        });
      }

      const episode = await episodeService.closeEpisode(
        episodeId,
        reason,
        userId
      );

      return res.json({
        success: true,
        episode
      });
    } catch (error) {
      console.error('Error closing episode:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/episodes/fhir/:episodeId
   * Get FHIR EpisodeOfCare resource
   */
  router.get('/episodes/fhir/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;

      const fhirResource = await episodeService.getFHIRResource(episodeId);

      return res.json(fhirResource);
    } catch (error) {
      console.error('Error fetching FHIR resource:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: status === 404 ? 'not-found' : 'exception',
            diagnostics: error.message
          }
        ]
      });
    }
  });

  /**
   * GET /api/specialties/:specialtySlug/episodes
   * Get all active episodes for a specialty
   */
  router.get('/specialties/:specialtySlug/episodes', async (req, res) => {
    try {
      const { specialtySlug } = req.params;
      const orgId = req.headers['x-org-id'];

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required header: x-org-id'
        });
      }

      const episodes = await episodeService.getActiveEpisodesBySpecialty(
        orgId,
        specialtySlug
      );

      return res.json({
        success: true,
        episodes,
        count: episodes.length
      });
    } catch (error) {
      console.error('Error fetching specialty episodes:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = initializeEpisodeRoutes;
