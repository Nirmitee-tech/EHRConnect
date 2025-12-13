/**
 * Forms API Routes
 * RESTful API for Questionnaire/Forms management
 */

const express = require('express');
const router = express.Router();
const formsService = require('../services/forms.service');
const formsVersioningService = require('../services/forms-versioning.service');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// All routes require authentication
router.use(requireAuth);

// ============================================================================
// Form Templates
// ============================================================================

/**
 * GET /api/forms/templates
 * List form templates with filtering and pagination
 */
router.get('/templates', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const {
      status,
      category,
      search,
      specialty,
      page = 1,
      pageSize = 20,
    } = req.query;

    const result = await formsService.listTemplates(orgId, {
      status,
      category,
      search,
      specialty,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });

    res.json(result);
  } catch (error) {
    console.error('Error listing form templates:', error);
    res.status(500).json({ error: 'Failed to list form templates', message: error.message });
  }
});

/**
 * GET /api/forms/templates/:id
 * Get form template by ID with full FHIR Questionnaire
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id } = req.params;

    const result = await formsService.getTemplate(id, orgId);

    res.json(result);
  } catch (error) {
    console.error('Error getting form template:', error);
    res.status(error.message === 'Form template not found' ? 404 : 500).json({
      error: 'Failed to get form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates
 * Create new form template
 */
router.post('/templates', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;

    const template = await formsService.createTemplate(orgId, userId, req.body);

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating form template:', error);
    res.status(500).json({ error: 'Failed to create form template', message: error.message });
  }
});

/**
 * PUT /api/forms/templates/:id
 * Update form template
 */
router.put('/templates/:id', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    const template = await formsService.updateTemplate(id, orgId, userId, req.body);

    res.json(template);
  } catch (error) {
    console.error('Error updating form template:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to update form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/publish
 * Publish form template (change status to 'active')
 */
router.post('/templates/:id/publish', requirePermission('forms:publish'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;
    const { version } = req.body;

    const template = await formsService.publishTemplate(id, orgId, userId, version);

    res.json(template);
  } catch (error) {
    console.error('Error publishing form template:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      error: 'Failed to publish form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/archive
 * Archive form template
 */
router.post('/templates/:id/archive', requirePermission('forms:delete'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    const template = await formsService.archiveTemplate(id, orgId, userId);

    res.json(template);
  } catch (error) {
    console.error('Error archiving form template:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to archive form template',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/forms/templates/:id
 * Delete form template (soft delete)
 */
router.delete('/templates/:id', requirePermission('forms:delete'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    const template = await formsService.deleteTemplate(id, orgId, userId);

    res.json({ message: 'Form template deleted successfully', template });
  } catch (error) {
    console.error('Error deleting form template:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to delete form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/retire
 * Retire form template (no longer available for new responses)
 */
router.post('/templates/:id/retire', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const template = await formsVersioningService.retireTemplate(id, orgId, userId, { reason });

    res.json(template);
  } catch (error) {
    console.error('Error retiring form template:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      error: 'Failed to retire form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/restore
 * Restore archived form template to draft status
 */
router.post('/templates/:id/restore', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    const template = await formsVersioningService.restoreTemplate(id, orgId, userId);

    res.json(template);
  } catch (error) {
    console.error('Error restoring form template:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      error: 'Failed to restore form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/versions
 * Create a new version of an existing form template
 */
router.post('/templates/:id/versions', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;
    const { versionType = 'minor', title, description, changeNotes } = req.body;

    const newVersion = await formsVersioningService.createVersion(id, orgId, userId, {
      versionType,
      title,
      description,
      changeNotes,
    });

    res.status(201).json(newVersion);
  } catch (error) {
    console.error('Error creating form version:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      error: 'Failed to create form version',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/templates/:id/versions
 * Get version history for a form template
 */
router.get('/templates/:id/versions', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id } = req.params;

    const versions = await formsVersioningService.getVersionHistory(id, orgId);

    res.json({ versions });
  } catch (error) {
    console.error('Error getting version history:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to get version history',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/templates/:id/versions/compare
 * Compare two versions of a form template
 */
router.get('/templates/:id/versions/compare', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id } = req.params;
    const { compareWith } = req.query;

    if (!compareWith) {
      return res.status(400).json({ error: 'compareWith parameter is required' });
    }

    const comparison = await formsVersioningService.compareVersions(id, compareWith, orgId);

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing versions:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to compare versions',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/duplicate
 * Duplicate form template
 */
router.post('/templates/:id/duplicate', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;
    const { title } = req.body;

    const template = await formsService.duplicateTemplate(id, orgId, userId, title);

    res.status(201).json(template);
  } catch (error) {
    console.error('Error duplicating form template:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to duplicate form template',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/import
 * Import FHIR Questionnaire JSON
 */
router.post('/templates/import', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { questionnaire, title, description, category, tags } = req.body;

    if (!questionnaire || questionnaire.resourceType !== 'Questionnaire') {
      return res.status(400).json({ error: 'Invalid FHIR Questionnaire' });
    }

    const template = await formsService.createTemplate(orgId, userId, {
      title: title || questionnaire.title,
      description: description || questionnaire.description,
      category,
      tags,
      questionnaire,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error importing questionnaire:', error);
    res.status(500).json({ error: 'Failed to import questionnaire', message: error.message });
  }
});

/**
 * GET /api/forms/templates/:id/export
 * Export FHIR Questionnaire as JSON
 */
router.get('/templates/:id/export', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id } = req.params;

    const { questionnaire } = await formsService.getTemplate(id, orgId);

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    res.setHeader('Content-Type', 'application/fhir+json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="questionnaire-${id}.json"`
    );
    res.json(questionnaire);
  } catch (error) {
    console.error('Error exporting questionnaire:', error);
    res.status(500).json({ error: 'Failed to export questionnaire', message: error.message });
  }
});

// ============================================================================
// Form Themes
// ============================================================================

/**
 * GET /api/forms/themes
 * List available themes
 */
router.get('/themes', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    const themes = await formsService.listThemes(orgId);

    res.json({ themes });
  } catch (error) {
    console.error('Error listing themes:', error);
    res.status(500).json({ error: 'Failed to list themes', message: error.message });
  }
});

/**
 * POST /api/forms/themes
 * Create custom theme
 */
router.post('/themes', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;

    const theme = await formsService.createTheme(orgId, userId, req.body);

    res.status(201).json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme', message: error.message });
  }
});

// ============================================================================
// Population Rules
// ============================================================================

/**
 * GET /api/forms/templates/:id/population-rules
 * Get population rules for a template
 */
router.get('/templates/:id/population-rules', async (req, res) => {
  try {
    const { id } = req.params;

    const rules = await formsService.getPopulationRules(id);

    res.json({ rules });
  } catch (error) {
    console.error('Error getting population rules:', error);
    res.status(500).json({ error: 'Failed to get population rules', message: error.message });
  }
});

/**
 * POST /api/forms/templates/:id/population-rules
 * Create population rule
 */
router.post('/templates/:id/population-rules', requirePermission('forms:write'), async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await formsService.createPopulationRule(id, req.body);

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating population rule:', error);
    res.status(500).json({ error: 'Failed to create population rule', message: error.message });
  }
});

// ============================================================================
// Extraction Rules
// ============================================================================

/**
 * GET /api/forms/templates/:id/extraction-rules
 * Get extraction rules for a template
 */
router.get('/templates/:id/extraction-rules', async (req, res) => {
  try {
    const { id } = req.params;

    const rules = await formsService.getExtractionRules(id);

    res.json({ rules });
  } catch (error) {
    console.error('Error getting extraction rules:', error);
    res.status(500).json({ error: 'Failed to get extraction rules', message: error.message });
  }
});

/**
 * POST /api/forms/templates/:id/extraction-rules
 * Create extraction rule
 */
router.post('/templates/:id/extraction-rules', requirePermission('forms:write'), async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await formsService.createExtractionRule(id, req.body);

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating extraction rule:', error);
    res.status(500).json({ error: 'Failed to create extraction rule', message: error.message });
  }
});

// ============================================================================
// SDC Operations
// ============================================================================

/**
 * POST /api/forms/$populate
 * Populate questionnaire with patient data ($populate operation)
 */
router.post('/$populate', async (req, res) => {
  try {
    const { questionnaireId, patientId, context } = req.body;

    if (!questionnaireId || !patientId) {
      return res.status(400).json({ error: 'questionnaireId and patientId are required' });
    }

    const result = await formsService.populateQuestionnaire(
      questionnaireId,
      patientId,
      context
    );

    res.json(result);
  } catch (error) {
    console.error('Error populating questionnaire:', error);
    res.status(500).json({ error: 'Failed to populate questionnaire', message: error.message });
  }
});

/**
 * POST /api/forms/$extract
 * Extract structured data from questionnaire response ($extract operation)
 */
router.post('/$extract', async (req, res) => {
  try {
    const { responseId } = req.body;

    if (!responseId) {
      return res.status(400).json({ error: 'responseId is required' });
    }

    const resources = await formsService.extractFromResponse(responseId);

    res.json({ resources });
  } catch (error) {
    console.error('Error extracting from response:', error);
    res.status(500).json({ error: 'Failed to extract data', message: error.message });
  }
});

// ============================================================================
// Form Responses (QuestionnaireResponse)
// ============================================================================

/**
 * GET /api/forms/responses
 * List form responses with filtering
 */
router.get('/responses', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { form_template_id, patient_id, encounter_id, status, page, pageSize } = req.query;

    const result = await formsService.listResponses(orgId, {
      form_template_id,
      patient_id,
      encounter_id,
      status,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('Error listing form responses:', error);
    res.status(500).json({ error: 'Failed to list form responses', message: error.message });
  }
});

/**
 * POST /api/forms/responses
 * Create new form response (submit form)
 */
router.post('/responses', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;

    const response = await formsService.createResponse(orgId, userId, req.body);

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating form response:', error);
    res.status(500).json({ error: 'Failed to create form response', message: error.message });
  }
});

/**
 * GET /api/forms/responses/:id
 * Get form response by ID
 */
router.get('/responses/:id', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id } = req.params;

    const response = await formsService.getResponse(id, orgId);

    res.json(response);
  } catch (error) {
    console.error('Error getting form response:', error);
    res.status(error.message === 'Form response not found' ? 404 : 500).json({
      error: 'Failed to get form response',
      message: error.message,
    });
  }
});

/**
 * PUT /api/forms/responses/:id
 * Update form response (for in-progress forms)
 */
router.put('/responses/:id', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    const response = await formsService.updateResponse(id, orgId, userId, req.body);

    res.json(response);
  } catch (error) {
    console.error('Error updating form response:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      error: 'Failed to update form response',
      message: error.message,
    });
  }
});

module.exports = router;
