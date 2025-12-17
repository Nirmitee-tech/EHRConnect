/**
 * Forms Service
 * Handles form template management with PostgreSQL storage
 * All FHIR Questionnaire/QuestionnaireResponse data stored in JSONB columns
 */

const { pool } = require('../database/connection');

class FormsService {
  // ============================================================================
  // Form Templates
  // ============================================================================

  /**
   * List form templates with filtering and pagination
   * Optimized with CTE to avoid double query execution
   */
  async listTemplates(orgId, { status, category, search, specialty, page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    
    // Build filter conditions
    let filterClause = 'WHERE ft.org_id = $1';
    const params = [orgId];
    let paramIndex = 2;

    if (status) {
      filterClause += ` AND ft.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      filterClause += ` AND ft.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (specialty) {
      filterClause += ` AND ft.specialty_slug = $${paramIndex}`;
      params.push(specialty);
      paramIndex++;
    }

    if (search) {
      filterClause += ` AND (
        ft.title ILIKE $${paramIndex}
        OR ft.description ILIKE $${paramIndex}
        OR $${paramIndex + 1} = ANY(ft.tags)
      )`;
      params.push(`%${search}%`, search);
      paramIndex += 2;
    }

    // Use CTE with window function to get count and data in single query
    const query = `
      WITH filtered_templates AS (
        SELECT
          ft.id,
          ft.org_id,
          ft.title,
          ft.description,
          ft.status,
          ft.version,
          ft.questionnaire,
          ft.fhir_url,
          ft.category,
          ft.tags,
          ft.specialty_slug,
          ft.theme_id,
          ft.created_by,
          ft.created_at,
          ft.updated_by,
          ft.updated_at,
          ft.published_at,
          ft.archived_at,
          ft.parent_version_id,
          ft.is_latest_version,
          ft.usage_count,
          ft.last_used_at,
          ft_theme.name as theme_name,
          ft_theme.config as theme_config,
          COUNT(*) OVER() as total_count
        FROM form_templates ft
        LEFT JOIN form_themes ft_theme ON ft.theme_id = ft_theme.id
        ${filterClause}
        ORDER BY ft.updated_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      )
      SELECT * FROM filtered_templates
    `;
    
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    // Remove total_count from each row
    const templates = result.rows.map(({ total_count, ...row }) => row);

    return {
      templates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get form template by ID with full FHIR Questionnaire
   */
  async getTemplate(templateId, orgId) {
    const query = `
      SELECT
        ft.*,
        ft_theme.name as theme_name,
        ft_theme.config as theme_config
      FROM form_templates ft
      LEFT JOIN form_themes ft_theme ON ft.theme_id = ft_theme.id
      WHERE ft.id = $1 AND ft.org_id = $2
    `;
    const result = await pool.query(query, [templateId, orgId]);

    if (result.rows.length === 0) {
      throw new Error('Form template not found');
    }

    const template = result.rows[0];

    // Fetch population and extraction rules
    const [populationRules, extractionRules] = await Promise.all([
      this.getPopulationRules(templateId),
      this.getExtractionRules(templateId),
    ]);

    return {
      template,
      questionnaire: template.questionnaire, // Already parsed from JSONB
      populationRules,
      extractionRules,
    };
  }

  /**
   * Create new form template
   */
  async createTemplate(orgId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Prepare questionnaire JSONB
      let questionnaire = data.questionnaire || null;
      let fhirUrl = null;

      if (questionnaire) {
        // Ensure questionnaire has required fields
        questionnaire = {
          resourceType: 'Questionnaire',
          status: questionnaire.status || 'draft',
          title: questionnaire.title || data.title,
          ...questionnaire,
        };
        fhirUrl = questionnaire.url || `urn:uuid:${require('crypto').randomUUID()}`;
      }

      // Create metadata in PostgreSQL
      const query = `
        INSERT INTO form_templates (
          org_id, title, description, status, version,
          questionnaire, fhir_url, category, tags, specialty_slug,
          theme_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const result = await client.query(query, [
        orgId,
        data.title,
        data.description || null,
        'draft',
        data.version || '1.0.0',
        questionnaire ? JSON.stringify(questionnaire) : null,
        fhirUrl,
        data.category || null,
        data.tags || [],
        data.specialty_slug || null,
        data.theme_id || null,
        userId,
      ]);

      const template = result.rows[0];

      // Log audit trail
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: template.id,
        action: 'created',
        actor_id: userId,
        metadata: { title: data.title },
      });

      await client.query('COMMIT');

      return template;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update form template
   */
  async updateTemplate(templateId, orgId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get existing template
      const existing = await client.query(
        'SELECT * FROM form_templates WHERE id = $1 AND org_id = $2',
        [templateId, orgId]
      );

      if (existing.rows.length === 0) {
        throw new Error('Form template not found');
      }

      const template = existing.rows[0];

      // Cannot edit published templates (status = 'active')
      if (template.status === 'active' && !data.allowEditPublished) {
        throw new Error('Cannot edit published form template. Create a new version instead.');
      }

      // Prepare questionnaire update
      let questionnaire = template.questionnaire;
      let fhirUrl = template.fhir_url;

      if (data.questionnaire) {
        questionnaire = {
          ...questionnaire,
          ...data.questionnaire,
        };
        fhirUrl = questionnaire.url || fhirUrl;
      }

      // Update metadata
      const updateQuery = `
        UPDATE form_templates
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          tags = COALESCE($4, tags),
          specialty_slug = COALESCE($5, specialty_slug),
          theme_id = COALESCE($6, theme_id),
          questionnaire = COALESCE($7, questionnaire),
          fhir_url = COALESCE($8, fhir_url),
          updated_by = $9,
          updated_at = NOW()
        WHERE id = $10 AND org_id = $11
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        data.title,
        data.description,
        data.category,
        data.tags,
        data.specialty_slug,
        data.theme_id,
        questionnaire ? JSON.stringify(questionnaire) : null,
        fhirUrl,
        userId,
        templateId,
        orgId,
      ]);

      // Log audit trail
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: templateId,
        action: 'updated',
        actor_id: userId,
        changes: data,
      });

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Publish form template (change status to 'active')
   */
  async publishTemplate(templateId, orgId, userId, newVersion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get existing template
      const existing = await client.query(
        'SELECT * FROM form_templates WHERE id = $1 AND org_id = $2',
        [templateId, orgId]
      );

      if (existing.rows.length === 0) {
        throw new Error('Form template not found');
      }

      const template = existing.rows[0];

      if (template.status === 'active') {
        throw new Error('Form template is already published');
      }

      // Update questionnaire status in JSONB
      let questionnaire = template.questionnaire;
      if (questionnaire) {
        questionnaire.status = 'active';
        if (newVersion) {
          questionnaire.version = newVersion;
        }
      }

      // Update status in PostgreSQL
      const updateQuery = `
        UPDATE form_templates
        SET
          status = 'active',
          version = COALESCE($1, version),
          questionnaire = COALESCE($2, questionnaire),
          published_at = NOW(),
          updated_by = $3,
          updated_at = NOW()
        WHERE id = $4 AND org_id = $5
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        newVersion,
        questionnaire ? JSON.stringify(questionnaire) : null,
        userId,
        templateId,
        orgId,
      ]);

      // Log audit trail
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: templateId,
        action: 'published',
        actor_id: userId,
        metadata: { version: newVersion || template.version },
      });

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Archive form template
   */
  async archiveTemplate(templateId, orgId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE form_templates
        SET
          status = 'archived',
          archived_at = NOW(),
          updated_by = $1,
          updated_at = NOW()
        WHERE id = $2 AND org_id = $3
        RETURNING *
      `;

      const result = await client.query(query, [userId, templateId, orgId]);

      if (result.rows.length === 0) {
        throw new Error('Form template not found');
      }

      // Log audit trail
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: templateId,
        action: 'archived',
        actor_id: userId,
      });

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete form template (soft delete - archives it)
   */
  async deleteTemplate(templateId, orgId, userId) {
    // For now, archiving is the same as deleting
    return this.archiveTemplate(templateId, orgId, userId);
  }

  /**
   * Duplicate form template
   */
  async duplicateTemplate(templateId, orgId, userId, newTitle) {
    const original = await this.getTemplate(templateId, orgId);

    const duplicateData = {
      title: newTitle || `${original.template.title} (Copy)`,
      description: original.template.description,
      category: original.template.category,
      tags: original.template.tags,
      specialty_slug: original.template.specialty_slug,
      theme_id: original.template.theme_id,
      questionnaire: original.questionnaire,
    };

    return this.createTemplate(orgId, userId, duplicateData);
  }

  // ============================================================================
  // Form Themes
  // ============================================================================

  /**
   * List available themes
   */
  async listThemes(orgId) {
    const query = `
      SELECT * FROM form_themes
      WHERE is_global = true OR org_id = $1
      ORDER BY is_global DESC, name ASC
    `;
    const result = await pool.query(query, [orgId]);
    return result.rows;
  }

  /**
   * Create custom theme
   */
  async createTheme(orgId, userId, data) {
    const query = `
      INSERT INTO form_themes (org_id, name, is_global, config)
      VALUES ($1, $2, false, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [orgId, data.name, JSON.stringify(data.config)]);
    return result.rows[0];
  }

  // ============================================================================
  // Population Rules
  // ============================================================================

  async getPopulationRules(templateId) {
    const query = `
      SELECT * FROM form_population_rules
      WHERE form_template_id = $1 AND enabled = true
      ORDER BY priority ASC
    `;
    const result = await pool.query(query, [templateId]);
    return result.rows;
  }

  async createPopulationRule(templateId, data) {
    const query = `
      INSERT INTO form_population_rules (
        form_template_id, name, source_type, source_query, target_link_id,
        transform_expression, priority, enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      templateId,
      data.name,
      data.source_type,
      data.source_query || null,
      data.target_link_id,
      data.transform_expression || null,
      data.priority || 0,
      data.enabled !== false,
    ]);
    return result.rows[0];
  }

  // ============================================================================
  // Extraction Rules
  // ============================================================================

  async getExtractionRules(templateId) {
    const query = `
      SELECT * FROM form_extraction_rules
      WHERE form_template_id = $1 AND enabled = true
      ORDER BY priority ASC
    `;
    const result = await pool.query(query, [templateId]);
    return result.rows;
  }

  async createExtractionRule(templateId, data) {
    const query = `
      INSERT INTO form_extraction_rules (
        form_template_id, name, source_link_id, target_resource_type,
        fhir_path, value_transformation, condition_expression, priority, enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      templateId,
      data.name,
      data.source_link_id,
      data.target_resource_type,
      data.fhir_path || null,
      data.value_transformation || null,
      data.condition_expression || null,
      data.priority || 0,
      data.enabled !== false,
    ]);
    return result.rows[0];
  }

  // ============================================================================
  // Form Responses (QuestionnaireResponse)
  // ============================================================================

  /**
   * Create form response (submit form)
   */
  async createResponse(orgId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get template to ensure it exists
      const templateQuery = `SELECT id, questionnaire, status FROM form_templates WHERE id = $1 AND org_id = $2`;
      const templateResult = await client.query(templateQuery, [data.form_template_id, orgId]);

      if (templateResult.rows.length === 0) {
        throw new Error('Form template not found');
      }

      const template = templateResult.rows[0];

      // Can only fill active forms (or allow drafts for testing)
      if (template.status !== 'active' && template.status !== 'draft') {
        throw new Error('Cannot submit response for archived form');
      }

      // Prepare response JSONB
      let response = data.response || null;

      if (response) {
        // Ensure response has required fields
        response = {
          resourceType: 'QuestionnaireResponse',
          status: response.status || 'completed',
          questionnaire: template.questionnaire?.url || `urn:template:${data.form_template_id}`,
          authored: response.authored || new Date().toISOString(),
          author: response.author || {
            reference: `Practitioner/${userId}`,
          },
          subject: response.subject || (data.patient_id ? {
            reference: `Patient/${data.patient_id}`,
          } : undefined),
          encounter: data.encounter_id ? {
            reference: `Encounter/${data.encounter_id}`,
          } : undefined,
          ...response,
        };
      }

      // Create response in PostgreSQL
      const query = `
        INSERT INTO form_responses (
          org_id, form_template_id, response,
          patient_id, encounter_id, episode_id, practitioner_id,
          status, submitted_by, submitted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await client.query(query, [
        orgId,
        data.form_template_id,
        response ? JSON.stringify(response) : null,
        data.patient_id || null,
        data.encounter_id || null,
        data.episode_id || null,
        userId,
        response?.status || 'completed',
        userId,
        response?.status === 'completed' ? new Date() : null,
      ]);

      const savedResponse = result.rows[0];

      // Update template usage count
      await client.query(
        `UPDATE form_templates
         SET usage_count = usage_count + 1, last_used_at = NOW()
         WHERE id = $1`,
        [data.form_template_id]
      );

      await client.query('COMMIT');

      return savedResponse;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * List form responses with filtering
   */
  async listResponses(orgId, { form_template_id, patient_id, encounter_id, status, page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    let query = `
      SELECT
        fr.*,
        ft.title as form_title,
        ft.category as form_category
      FROM form_responses fr
      LEFT JOIN form_templates ft ON fr.form_template_id = ft.id
      WHERE fr.org_id = $1
    `;
    const params = [orgId];
    let paramIndex = 2;

    if (form_template_id) {
      query += ` AND fr.form_template_id = $${paramIndex}`;
      params.push(form_template_id);
      paramIndex++;
    }

    if (patient_id) {
      query += ` AND fr.patient_id = $${paramIndex}`;
      params.push(patient_id);
      paramIndex++;
    }

    if (encounter_id) {
      query += ` AND fr.encounter_id = $${paramIndex}`;
      params.push(encounter_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND fr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY fr.submitted_at DESC, fr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);

    return {
      responses: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get form response by ID
   */
  async getResponse(responseId, orgId) {
    const query = `
      SELECT
        fr.*,
        ft.title as form_title,
        ft.questionnaire as form_questionnaire
      FROM form_responses fr
      LEFT JOIN form_templates ft ON fr.form_template_id = ft.id
      WHERE fr.id = $1 AND fr.org_id = $2
    `;
    const result = await pool.query(query, [responseId, orgId]);

    if (result.rows.length === 0) {
      throw new Error('Form response not found');
    }

    return result.rows[0];
  }

  /**
   * Update form response (for in-progress forms)
   */
  async updateResponse(responseId, orgId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get existing response
      const existing = await client.query(
        'SELECT * FROM form_responses WHERE id = $1 AND org_id = $2',
        [responseId, orgId]
      );

      if (existing.rows.length === 0) {
        throw new Error('Form response not found');
      }

      const currentResponse = existing.rows[0];

      // Can only update in-progress responses
      if (currentResponse.status === 'completed') {
        throw new Error('Cannot update completed form response');
      }

      // Update response JSONB
      let response = currentResponse.response;
      if (data.response) {
        response = {
          ...response,
          ...data.response,
        };
      }

      const updateQuery = `
        UPDATE form_responses
        SET
          response = COALESCE($1, response),
          status = COALESCE($2, status),
          submitted_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE submitted_at END,
          updated_at = NOW()
        WHERE id = $3 AND org_id = $4
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        response ? JSON.stringify(response) : null,
        data.status,
        responseId,
        orgId,
      ]);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // SDC Operations ($populate, $extract)
  // ============================================================================

  /**
   * Populate questionnaire with patient data ($populate operation)
   * Note: This is a simplified implementation. Full SDC support would require FHIRPath evaluation.
   */
  async populateQuestionnaire(questionnaireId, patientId, context = {}) {
    // Get questionnaire from template
    const templateQuery = `
      SELECT id, questionnaire FROM form_templates
      WHERE id = $1 OR fhir_url = $1
    `;
    const templateResult = await pool.query(templateQuery, [questionnaireId]);

    if (templateResult.rows.length === 0) {
      throw new Error('Questionnaire not found');
    }

    const template = templateResult.rows[0];
    const questionnaire = template.questionnaire;

    if (!questionnaire) {
      throw new Error('Questionnaire data not found');
    }

    // Get population rules
    const rules = await this.getPopulationRules(template.id);

    // Create initial response
    const response = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: questionnaire.url || `Questionnaire/${questionnaireId}`,
      status: 'in-progress',
      subject: {
        reference: `Patient/${patientId}`,
      },
      authored: new Date().toISOString(),
      item: [],
    };

    // Apply population rules (simplified - would need FHIRPath for production)
    // For now, this is a placeholder for future implementation
    console.log('Population rules to apply:', rules.length);

    return { questionnaire, response };
  }

  /**
   * Extract structured data from questionnaire response ($extract operation)
   * Note: This is a simplified implementation. Full SDC support would require FHIRPath evaluation.
   */
  async extractFromResponse(responseId) {
    // Get response from database
    const responseQuery = `
      SELECT * FROM form_responses WHERE id = $1
    `;
    const responseResult = await pool.query(responseQuery, [responseId]);

    if (responseResult.rows.length === 0) {
      throw new Error('Response not found');
    }

    const responseData = responseResult.rows[0];
    const response = responseData.response;

    // Get extraction rules
    const rules = await this.getExtractionRules(responseData.form_template_id);

    const extractedResources = [];

    // Apply extraction rules (simplified - would need FHIRPath for production)
    // For now, this is a placeholder for future implementation
    console.log('Extraction rules to apply:', rules.length);

    return extractedResources;
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  async logAudit(client, data) {
    const query = `
      INSERT INTO form_audit_log (
        org_id, entity_type, entity_id, action, actor_id, actor_name, changes, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await client.query(query, [
      data.org_id,
      data.entity_type,
      data.entity_id,
      data.action,
      data.actor_id,
      data.actor_name || null,
      data.changes ? JSON.stringify(data.changes) : null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]);
  }

  // ============================================================================
  // Multi-Step Forms
  // ============================================================================

  /**
   * Create a form step
   * @param {string} formTemplateId - Form template UUID
   * @param {object} stepData - Step definition
   * @param {string} userId - Creator user ID
   * @param {string} orgId - Organization ID
   * @returns {object} Created step
   */
  async createStep(formTemplateId, stepData, userId, orgId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify form exists and user has access
      const formCheck = await client.query(
        'SELECT id, is_multi_step FROM form_templates WHERE id = $1 AND org_id = $2',
        [formTemplateId, orgId]
      );

      if (formCheck.rows.length === 0) {
        throw new Error('Form template not found');
      }

      // Enable multi-step mode if not already enabled
      if (!formCheck.rows[0].is_multi_step) {
        await client.query(
          'UPDATE form_templates SET is_multi_step = true WHERE id = $1',
          [formTemplateId]
        );
      }

      // Create step
      const query = `
        INSERT INTO form_steps (
          form_template_id, org_id, step_order, title, description,
          navigation_config, validation_config, fields, conditional_logic,
          created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const result = await client.query(query, [
        formTemplateId,
        orgId,
        stepData.step_order,
        stepData.title,
        stepData.description || '',
        stepData.navigation_config || { allowBack: true, allowSkip: false, showProgress: true },
        stepData.validation_config || { validateOnNext: true, validateOnBlur: false, required: false },
        stepData.fields || [],
        stepData.conditional_logic || null,
        userId,
        userId
      ]);

      // Update form step count
      await this.updateFormStepConfig(client, formTemplateId);

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_step',
        entity_id: result.rows[0].id,
        action: 'created',
        actor_id: userId,
        metadata: { form_template_id: formTemplateId, step_order: stepData.step_order }
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating form step:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all steps for a form template
   * @param {string} formTemplateId - Form template UUID
   * @param {string} orgId - Organization ID
   * @returns {array} Array of steps ordered by step_order
   */
  async getSteps(formTemplateId, orgId) {
    const query = `
      SELECT * FROM form_steps
      WHERE form_template_id = $1 AND org_id = $2
      ORDER BY step_order ASC
    `;
    const result = await pool.query(query, [formTemplateId, orgId]);
    return result.rows;
  }

  /**
   * Get single step by ID
   * @param {string} stepId - Step UUID
   * @param {string} orgId - Organization ID
   * @returns {object} Step data
   */
  async getStep(stepId, orgId) {
    const query = `
      SELECT * FROM form_steps
      WHERE id = $1 AND org_id = $2
    `;
    const result = await pool.query(query, [stepId, orgId]);

    if (result.rows.length === 0) {
      throw new Error('Form step not found');
    }

    return result.rows[0];
  }

  /**
   * Update form step
   * @param {string} stepId - Step UUID
   * @param {object} stepData - Updated step data
   * @param {string} userId - Updater user ID
   * @param {string} orgId - Organization ID
   * @returns {object} Updated step
   */
  async updateStep(stepId, stepData, userId, orgId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get existing step
      const existing = await client.query(
        'SELECT * FROM form_steps WHERE id = $1 AND org_id = $2',
        [stepId, orgId]
      );

      if (existing.rows.length === 0) {
        throw new Error('Form step not found');
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (stepData.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(stepData.title);
      }
      if (stepData.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(stepData.description);
      }
      if (stepData.step_order !== undefined) {
        updates.push(`step_order = $${paramIndex++}`);
        values.push(stepData.step_order);
      }
      if (stepData.navigation_config !== undefined) {
        updates.push(`navigation_config = $${paramIndex++}`);
        values.push(stepData.navigation_config);
      }
      if (stepData.validation_config !== undefined) {
        updates.push(`validation_config = $${paramIndex++}`);
        values.push(stepData.validation_config);
      }
      if (stepData.fields !== undefined) {
        updates.push(`fields = $${paramIndex++}`);
        values.push(stepData.fields);
      }
      if (stepData.conditional_logic !== undefined) {
        updates.push(`conditional_logic = $${paramIndex++}`);
        values.push(stepData.conditional_logic);
      }

      updates.push(`updated_by = $${paramIndex++}`);
      values.push(userId);
      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      values.push(stepId);
      values.push(orgId);

      const query = `
        UPDATE form_steps
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex++} AND org_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await client.query(query, values);

      // Update form step config if step order changed
      if (stepData.step_order !== undefined) {
        await this.updateFormStepConfig(client, existing.rows[0].form_template_id);
      }

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_step',
        entity_id: stepId,
        action: 'updated',
        actor_id: userId,
        changes: stepData
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating form step:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete form step
   * @param {string} stepId - Step UUID
   * @param {string} userId - User performing deletion
   * @param {string} orgId - Organization ID
   */
  async deleteStep(stepId, userId, orgId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get step to retrieve form_template_id before deletion
      const stepResult = await client.query(
        'SELECT form_template_id FROM form_steps WHERE id = $1 AND org_id = $2',
        [stepId, orgId]
      );

      if (stepResult.rows.length === 0) {
        throw new Error('Form step not found');
      }

      const formTemplateId = stepResult.rows[0].form_template_id;

      // Delete step
      await client.query(
        'DELETE FROM form_steps WHERE id = $1 AND org_id = $2',
        [stepId, orgId]
      );

      // Update form step config
      await this.updateFormStepConfig(client, formTemplateId);

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_step',
        entity_id: stepId,
        action: 'deleted',
        actor_id: userId
      });

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting form step:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reorder form steps
   * @param {string} formTemplateId - Form template UUID
   * @param {array} stepOrder - Array of {id, order} objects
   * @param {string} userId - User performing reorder
   * @param {string} orgId - Organization ID
   */
  async reorderSteps(formTemplateId, stepOrder, userId, orgId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update each step's order
      for (const item of stepOrder) {
        await client.query(
          'UPDATE form_steps SET step_order = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND org_id = $4',
          [item.order, userId, item.id, orgId]
        );
      }

      // Update form step config
      await this.updateFormStepConfig(client, formTemplateId);

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'form_step',
        entity_id: formTemplateId,
        action: 'reordered',
        actor_id: userId,
        metadata: { step_order: stepOrder }
      });

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error reordering form steps:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update form template step configuration
   * Internal helper to sync step count
   * @param {object} client - Database client
   * @param {string} formTemplateId - Form template UUID
   */
  async updateFormStepConfig(client, formTemplateId) {
    const countResult = await client.query(
      'SELECT COUNT(*) as total FROM form_steps WHERE form_template_id = $1',
      [formTemplateId]
    );

    const totalSteps = parseInt(countResult.rows[0].total);

    // Update form template step_config
    await client.query(
      `UPDATE form_templates
       SET step_config = jsonb_set(
         COALESCE(step_config, '{}'::jsonb),
         '{totalSteps}',
         $1::text::jsonb
       )
       WHERE id = $2`,
      [totalSteps, formTemplateId]
    );
  }

  // ============================================================================
  // Form Progress Tracking
  // ============================================================================

  /**
   * Save form progress (auto-save support)
   * @param {string} formTemplateId - Form template UUID
   * @param {string} userId - User ID
   * @param {string} sessionId - Session identifier
   * @param {object} progressData - Progress data including current_step and step_data
   * @param {string} orgId - Organization ID
   * @returns {object} Saved progress
   */
  async saveProgress(formTemplateId, userId, sessionId, progressData, orgId) {
    const query = `
      INSERT INTO form_progress (
        form_template_id, user_id, org_id, current_step, step_data,
        session_id, patient_id, encounter_id, episode_id, completed_steps
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (form_template_id, user_id, session_id)
      DO UPDATE SET
        current_step = EXCLUDED.current_step,
        step_data = EXCLUDED.step_data,
        completed_steps = EXCLUDED.completed_steps,
        last_saved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      formTemplateId,
      userId,
      orgId,
      progressData.current_step,
      progressData.step_data || {},
      sessionId,
      progressData.patient_id || null,
      progressData.encounter_id || null,
      progressData.episode_id || null,
      progressData.completed_steps || []
    ]);

    return result.rows[0];
  }

  /**
   * Get user progress for a form
   * @param {string} formTemplateId - Form template UUID
   * @param {string} userId - User ID
   * @param {string} sessionId - Session identifier
   * @param {string} orgId - Organization ID
   * @returns {object} Progress data or null
   */
  async getProgress(formTemplateId, userId, sessionId, orgId) {
    const query = `
      SELECT * FROM form_progress
      WHERE form_template_id = $1 AND user_id = $2 AND session_id = $3 AND org_id = $4
      ORDER BY last_saved_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [formTemplateId, userId, sessionId, orgId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Mark form progress as completed
   * @param {string} progressId - Progress UUID
   * @param {string} orgId - Organization ID
   * @returns {object} Updated progress
   */
  async completeProgress(progressId, orgId) {
    const query = `
      UPDATE form_progress
      SET is_completed = true, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND org_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [progressId, orgId]);

    if (result.rows.length === 0) {
      throw new Error('Progress record not found');
    }

    return result.rows[0];
  }

  /**
   * List progress records for a form
   * @param {string} formTemplateId - Form template UUID
   * @param {string} orgId - Organization ID
   * @param {object} filters - Optional filters (userId, isCompleted)
   * @returns {array} Progress records
   */
  async listProgress(formTemplateId, orgId, filters = {}) {
    let query = `
      SELECT fp.*, u.email as user_email, u.first_name, u.last_name
      FROM form_progress fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.form_template_id = $1 AND fp.org_id = $2
    `;
    const params = [formTemplateId, orgId];
    let paramIndex = 3;

    if (filters.userId) {
      query += ` AND fp.user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters.isCompleted !== undefined) {
      query += ` AND fp.is_completed = $${paramIndex++}`;
      params.push(filters.isCompleted);
    }

    query += ' ORDER BY fp.updated_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // ============================================================================
  // Visit Templates (eCRF)
  // ============================================================================

  /**
   * Create visit template for clinical trials
   * @param {string} orgId - Organization ID
   * @param {string} trialId - Trial identifier
   * @param {object} templateData - Visit template data
   * @param {string} userId - Creator user ID
   * @returns {object} Created visit template
   */
  async createVisitTemplate(orgId, trialId, templateData, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO visit_templates (
          org_id, trial_id, visit_name, visit_code, visit_type,
          frequency_config, form_template_ids, cdash_annotations,
          display_order, description, instructions, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const result = await client.query(query, [
        orgId,
        trialId,
        templateData.visit_name,
        templateData.visit_code || null,
        templateData.visit_type,
        templateData.frequency_config || null,
        templateData.form_template_ids || [],
        templateData.cdash_annotations || null,
        templateData.display_order || null,
        templateData.description || null,
        templateData.instructions || null,
        userId,
        userId
      ]);

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'visit_template',
        entity_id: result.rows[0].id,
        action: 'created',
        actor_id: userId,
        metadata: { trial_id: trialId }
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating visit template:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get visit templates for a trial
   * @param {string} orgId - Organization ID
   * @param {string} trialId - Trial identifier
   * @returns {array} Visit templates
   */
  async getVisitTemplates(orgId, trialId) {
    const query = `
      SELECT * FROM visit_templates
      WHERE org_id = $1 AND trial_id = $2 AND is_active = true
      ORDER BY display_order ASC, created_at ASC
    `;

    const result = await pool.query(query, [orgId, trialId]);
    return result.rows;
  }

  /**
   * Get single visit template
   * @param {string} templateId - Visit template UUID
   * @param {string} orgId - Organization ID
   * @returns {object} Visit template
   */
  async getVisitTemplate(templateId, orgId) {
    const query = `
      SELECT * FROM visit_templates
      WHERE id = $1 AND org_id = $2
    `;

    const result = await pool.query(query, [templateId, orgId]);

    if (result.rows.length === 0) {
      throw new Error('Visit template not found');
    }

    return result.rows[0];
  }

  /**
   * Update visit template
   * @param {string} templateId - Visit template UUID
   * @param {object} templateData - Updated data
   * @param {string} userId - Updater user ID
   * @param {string} orgId - Organization ID
   * @returns {object} Updated visit template
   */
  async updateVisitTemplate(templateId, templateData, userId, orgId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramIndex = 1;

      const updateFields = [
        'visit_name', 'visit_code', 'visit_type', 'frequency_config',
        'form_template_ids', 'cdash_annotations', 'display_order',
        'description', 'instructions', 'is_active'
      ];

      for (const field of updateFields) {
        if (templateData[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(templateData[field]);
        }
      }

      updates.push(`updated_by = $${paramIndex++}`);
      values.push(userId);
      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      values.push(templateId);
      values.push(orgId);

      const query = `
        UPDATE visit_templates
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex++} AND org_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Visit template not found');
      }

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'visit_template',
        entity_id: templateId,
        action: 'updated',
        actor_id: userId,
        changes: templateData
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating visit template:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete visit template
   * @param {string} templateId - Visit template UUID
   * @param {string} userId - User performing deletion
   * @param {string} orgId - Organization ID
   */
  async deleteVisitTemplate(templateId, userId, orgId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Soft delete by setting is_active = false
      const result = await client.query(
        'UPDATE visit_templates SET is_active = false, updated_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND org_id = $3 RETURNING *',
        [userId, templateId, orgId]
      );

      if (result.rows.length === 0) {
        throw new Error('Visit template not found');
      }

      // Audit log
      await this.logAudit(client, {
        org_id: orgId,
        entity_type: 'visit_template',
        entity_id: templateId,
        action: 'deleted',
        actor_id: userId
      });

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting visit template:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new FormsService();
