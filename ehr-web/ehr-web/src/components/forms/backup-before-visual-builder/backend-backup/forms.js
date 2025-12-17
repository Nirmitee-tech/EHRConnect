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

// ============================================================================
// Multi-Step Forms
// ============================================================================

/**
 * POST /api/forms/templates/:id/steps
 * Create a new form step
 */
router.post('/templates/:id/steps', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id: formTemplateId } = req.params;

    const step = await formsService.createStep(formTemplateId, req.body, userId, orgId);

    res.status(201).json(step);
  } catch (error) {
    console.error('Error creating form step:', error);
    res.status(error.message === 'Form template not found' ? 404 : 400).json({
      error: 'Failed to create form step',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/templates/:id/steps
 * Get all steps for a form template
 */
router.get('/templates/:id/steps', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id: formTemplateId } = req.params;

    const steps = await formsService.getSteps(formTemplateId, orgId);

    res.json(steps);
  } catch (error) {
    console.error('Error getting form steps:', error);
    res.status(500).json({
      error: 'Failed to get form steps',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/steps/:stepId
 * Get single step by ID
 */
router.get('/steps/:stepId', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { stepId } = req.params;

    const step = await formsService.getStep(stepId, orgId);

    res.json(step);
  } catch (error) {
    console.error('Error getting form step:', error);
    res.status(error.message === 'Form step not found' ? 404 : 500).json({
      error: 'Failed to get form step',
      message: error.message,
    });
  }
});

/**
 * PUT /api/forms/steps/:stepId
 * Update form step
 */
router.put('/steps/:stepId', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { stepId } = req.params;

    const step = await formsService.updateStep(stepId, req.body, userId, orgId);

    res.json(step);
  } catch (error) {
    console.error('Error updating form step:', error);
    res.status(error.message === 'Form step not found' ? 404 : 400).json({
      error: 'Failed to update form step',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/forms/steps/:stepId
 * Delete form step
 */
router.delete('/steps/:stepId', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { stepId } = req.params;

    await formsService.deleteStep(stepId, userId, orgId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting form step:', error);
    res.status(error.message === 'Form step not found' ? 404 : 500).json({
      error: 'Failed to delete form step',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/templates/:id/steps/reorder
 * Reorder form steps
 */
router.post('/templates/:id/steps/reorder', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id: formTemplateId } = req.params;
    const { stepOrder } = req.body;

    if (!Array.isArray(stepOrder)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'stepOrder must be an array of {id, order} objects',
      });
    }

    await formsService.reorderSteps(formTemplateId, stepOrder, userId, orgId);

    res.json({ message: 'Steps reordered successfully' });
  } catch (error) {
    console.error('Error reordering form steps:', error);
    res.status(500).json({
      error: 'Failed to reorder form steps',
      message: error.message,
    });
  }
});

// ============================================================================
// Step Validation Rules
// ============================================================================

/**
 * POST /api/forms/steps/:stepId/rules
 * Create a validation rule for a step
 */
router.post('/steps/:stepId/rules', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { stepId } = req.params;

    const result = await formsService.createStepRule(stepId, req.body, userId, orgId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating step rule:', error);
    res.status(error.message === 'Form step not found' ? 404 : 400).json({
      error: 'Failed to create step rule',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/steps/:stepId/rules
 * Get all rules for a step
 */
router.get('/steps/:stepId/rules', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { stepId } = req.params;

    const rules = await formsService.getStepRules(stepId, orgId);

    res.json({ rules });
  } catch (error) {
    console.error('Error getting step rules:', error);
    res.status(error.message === 'Form step not found' ? 404 : 500).json({
      error: 'Failed to get step rules',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/steps/:stepId/rules/evaluate
 * Evaluate step rules against context data
 */
router.post('/steps/:stepId/rules/evaluate', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { stepId } = req.params;
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'context data is required',
      });
    }

    const result = await formsService.evaluateStepRules(stepId, context, orgId);

    res.json(result);
  } catch (error) {
    console.error('Error evaluating step rules:', error);
    res.status(error.message === 'Form step not found' ? 404 : 500).json({
      error: 'Failed to evaluate step rules',
      message: error.message,
    });
  }
});

/**
 * POST /api/forms/steps/:stepId/rules/:ruleId/test
 * Test a rule with mock data
 */
router.post('/steps/:stepId/rules/:ruleId/test', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { stepId, ruleId } = req.params;
    const { mockData } = req.body;

    if (!mockData) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'mockData is required for testing',
      });
    }

    const result = await formsService.testStepRule(stepId, ruleId, mockData, orgId);

    res.json(result);
  } catch (error) {
    console.error('Error testing step rule:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to test step rule',
      message: error.message,
    });
  }
});

/**
 * PUT /api/forms/steps/:stepId/rules/:ruleId
 * Update a step validation rule
 */
router.put('/steps/:stepId/rules/:ruleId', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { stepId, ruleId } = req.params;

    const result = await formsService.updateStepRule(stepId, ruleId, req.body, userId, orgId);

    res.json(result);
  } catch (error) {
    console.error('Error updating step rule:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      error: 'Failed to update step rule',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/forms/steps/:stepId/rules/:ruleId
 * Delete a step validation rule
 */
router.delete('/steps/:stepId/rules/:ruleId', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { stepId, ruleId } = req.params;

    const result = await formsService.deleteStepRule(stepId, ruleId, userId, orgId);

    res.json({ message: 'Rule deleted successfully', step: result });
  } catch (error) {
    console.error('Error deleting step rule:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to delete step rule',
      message: error.message,
    });
  }
});

// ============================================================================
// Form Progress Tracking
// ============================================================================

/**
 * POST /api/forms/templates/:id/progress
 * Save form progress (auto-save)
 */
router.post('/templates/:id/progress', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id: formTemplateId } = req.params;
    const { sessionId, ...progressData } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionId is required',
      });
    }

    const progress = await formsService.saveProgress(
      formTemplateId,
      userId,
      sessionId,
      progressData,
      orgId
    );

    res.json(progress);
  } catch (error) {
    console.error('Error saving form progress:', error);
    res.status(500).json({
      error: 'Failed to save form progress',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/templates/:id/progress
 * Get user's progress for a form
 */
router.get('/templates/:id/progress', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id: formTemplateId } = req.params;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'sessionId query parameter is required',
      });
    }

    const progress = await formsService.getProgress(formTemplateId, userId, sessionId, orgId);

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress found for this form and session',
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error getting form progress:', error);
    res.status(500).json({
      error: 'Failed to get form progress',
      message: error.message,
    });
  }
});

/**
 * PUT /api/forms/progress/:progressId/complete
 * Mark form progress as completed
 */
router.put('/progress/:progressId/complete', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { progressId } = req.params;

    const progress = await formsService.completeProgress(progressId, orgId);

    res.json(progress);
  } catch (error) {
    console.error('Error completing form progress:', error);
    res.status(error.message === 'Progress record not found' ? 404 : 500).json({
      error: 'Failed to complete form progress',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/templates/:id/progress/list
 * List all progress records for a form (admin)
 */
router.get('/templates/:id/progress/list', requirePermission('forms:read'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id: formTemplateId } = req.params;
    const { userId, isCompleted } = req.query;

    const filters = {};
    if (userId) filters.userId = userId;
    if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';

    const progressList = await formsService.listProgress(formTemplateId, orgId, filters);

    res.json(progressList);
  } catch (error) {
    console.error('Error listing form progress:', error);
    res.status(500).json({
      error: 'Failed to list form progress',
      message: error.message,
    });
  }
});

// ============================================================================
// Visit Templates (eCRF)
// ============================================================================

/**
 * POST /api/forms/visit-templates
 * Create visit template
 */
router.post('/visit-templates', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { trialId, ...templateData } = req.body;

    if (!trialId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'trialId is required',
      });
    }

    const template = await formsService.createVisitTemplate(orgId, trialId, templateData, userId);

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating visit template:', error);
    res.status(400).json({
      error: 'Failed to create visit template',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/visit-templates/trial/:trialId
 * Get visit templates for a trial
 */
router.get('/visit-templates/trial/:trialId', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { trialId } = req.params;

    const templates = await formsService.getVisitTemplates(orgId, trialId);

    res.json(templates);
  } catch (error) {
    console.error('Error getting visit templates:', error);
    res.status(500).json({
      error: 'Failed to get visit templates',
      message: error.message,
    });
  }
});

/**
 * GET /api/forms/visit-templates/:id
 * Get single visit template
 */
router.get('/visit-templates/:id', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const { id } = req.params;

    const template = await formsService.getVisitTemplate(id, orgId);

    res.json(template);
  } catch (error) {
    console.error('Error getting visit template:', error);
    res.status(error.message === 'Visit template not found' ? 404 : 500).json({
      error: 'Failed to get visit template',
      message: error.message,
    });
  }
});

/**
 * PUT /api/forms/visit-templates/:id
 * Update visit template
 */
router.put('/visit-templates/:id', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    const template = await formsService.updateVisitTemplate(id, req.body, userId, orgId);

    res.json(template);
  } catch (error) {
    console.error('Error updating visit template:', error);
    res.status(error.message === 'Visit template not found' ? 404 : 400).json({
      error: 'Failed to update visit template',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/forms/visit-templates/:id
 * Delete visit template (soft delete)
 */
router.delete('/visit-templates/:id', requirePermission('forms:write'), async (req, res) => {
  try {
    const orgId = req.userContext.orgId;
    const userId = req.userContext.userId;
    const { id } = req.params;

    await formsService.deleteVisitTemplate(id, userId, orgId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting visit template:', error);
    res.status(error.message === 'Visit template not found' ? 404 : 500).json({
      error: 'Failed to delete visit template',
      message: error.message,
    });
  }
});

module.exports = router;
