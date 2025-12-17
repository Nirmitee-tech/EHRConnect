/**
 * AI Clinical Intelligence API Routes
 * 
 * Endpoints for AI-powered clinical decision support
 */

const express = require('express');
const router = express.Router();
const aiClinicalService = require('../services/ai-clinical-intelligence.service');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

/**
 * @route   GET /api/ai-clinical/status
 * @desc    Get AI service status
 * @access  Private
 */
router.get('/status', authenticateToken, (req, res) => {
  try {
    const status = aiClinicalService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai-clinical/auto-complete-note
 * @desc    Auto-complete clinical notes with AI
 * @access  Private - Providers only
 */
router.post(
  '/auto-complete-note',
  authenticateToken,
  checkPermission('clinical:write'),
  async (req, res) => {
    try {
      const { partialNote, patientContext, encounterType } = req.body;

      if (!partialNote) {
        return res.status(400).json({ error: 'partialNote is required' });
      }

      const result = await aiClinicalService.autoCompleteNote({
        partialNote,
        patientContext: patientContext || {},
        encounterType: encounterType || 'general'
      });

      res.json(result);
    } catch (error) {
      console.error('Auto-complete note error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/differential-diagnosis
 * @desc    Get AI-suggested differential diagnoses
 * @access  Private - Providers only
 */
router.post(
  '/differential-diagnosis',
  authenticateToken,
  checkPermission('clinical:read'),
  async (req, res) => {
    try {
      const { symptoms, vitals, labResults, patientHistory } = req.body;

      const result = await aiClinicalService.suggestDifferentialDiagnosis({
        symptoms: symptoms || [],
        vitals: vitals || {},
        labResults: labResults || [],
        patientHistory: patientHistory || {}
      });

      res.json(result);
    } catch (error) {
      console.error('Differential diagnosis error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/medication-interactions
 * @desc    Check medication interactions with AI
 * @access  Private - Providers only
 */
router.post(
  '/medication-interactions',
  authenticateToken,
  checkPermission('clinical:read'),
  async (req, res) => {
    try {
      const { medications } = req.body;

      if (!medications || !Array.isArray(medications)) {
        return res.status(400).json({ error: 'medications array is required' });
      }

      const result = await aiClinicalService.checkMedicationInteractions(medications);

      res.json(result);
    } catch (error) {
      console.error('Medication interaction check error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/predict-risk
 * @desc    Predict patient risk with AI
 * @access  Private - Providers only
 */
router.post(
  '/predict-risk',
  authenticateToken,
  checkPermission('clinical:read'),
  async (req, res) => {
    try {
      const { patientData } = req.body;

      if (!patientData) {
        return res.status(400).json({ error: 'patientData is required' });
      }

      const result = await aiClinicalService.predictPatientRisk(patientData);

      res.json(result);
    } catch (error) {
      console.error('Risk prediction error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/natural-query
 * @desc    Execute natural language query on patient data
 * @access  Private - Requires query permission
 */
router.post(
  '/natural-query',
  authenticateToken,
  checkPermission('reports:read'),
  async (req, res) => {
    try {
      const { query } = req.body;
      const orgId = req.user.orgId;

      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }

      const result = await aiClinicalService.naturalLanguageQuery(query, orgId);

      res.json(result);
    } catch (error) {
      console.error('Natural language query error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/suggest-coding
 * @desc    Get AI-suggested ICD-10 and CPT codes
 * @access  Private - Providers and Billing staff
 */
router.post(
  '/suggest-coding',
  authenticateToken,
  checkPermission('billing:read'),
  async (req, res) => {
    try {
      const { chiefComplaint, assessment, procedures, duration } = req.body;

      const result = await aiClinicalService.suggestCoding({
        chiefComplaint: chiefComplaint || '',
        assessment: assessment || '',
        procedures: procedures || '',
        duration: duration || 15
      });

      res.json(result);
    } catch (error) {
      console.error('Coding suggestion error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/clinical-guidelines
 * @desc    Get evidence-based clinical guideline recommendations
 * @access  Private - Providers only
 */
router.post(
  '/clinical-guidelines',
  authenticateToken,
  checkPermission('clinical:read'),
  async (req, res) => {
    try {
      const { diagnosis, patientAge, comorbidities } = req.body;

      if (!diagnosis) {
        return res.status(400).json({ error: 'diagnosis is required' });
      }

      const result = await aiClinicalService.getGuidelineRecommendations({
        diagnosis,
        patientAge: patientAge || null,
        comorbidities: comorbidities || []
      });

      res.json(result);
    } catch (error) {
      console.error('Clinical guidelines error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   POST /api/ai-clinical/check-documentation-quality
 * @desc    Check clinical documentation quality
 * @access  Private - Providers only
 */
router.post(
  '/check-documentation-quality',
  authenticateToken,
  checkPermission('clinical:write'),
  async (req, res) => {
    try {
      const { documentationText, documentType } = req.body;

      if (!documentationText) {
        return res.status(400).json({ error: 'documentationText is required' });
      }

      const result = await aiClinicalService.checkDocumentationQuality(
        documentationText,
        documentType || 'SOAP'
      );

      res.json(result);
    } catch (error) {
      console.error('Documentation quality check error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route   GET /api/ai-clinical/patient-summary/:patientId
 * @desc    Generate AI-powered patient summary
 * @access  Private - Providers only
 */
router.get(
  '/patient-summary/:patientId',
  authenticateToken,
  checkPermission('clinical:read'),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const orgId = req.user.orgId;

      const result = await aiClinicalService.generatePatientSummary(patientId, orgId);

      res.json(result);
    } catch (error) {
      console.error('Patient summary generation error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
