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
   */
  async listTemplates(orgId, { status, category, search, specialty, page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    let query = `
      SELECT
        ft.*,
        ft_theme.name as theme_name,
        ft_theme.config as theme_config
      FROM form_templates ft
      LEFT JOIN form_themes ft_theme ON ft.theme_id = ft_theme.id
      WHERE ft.org_id = $1
    `;
    const params = [orgId];
    let paramIndex = 2;

    if (status) {
      query += ` AND ft.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      query += ` AND ft.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (specialty) {
      query += ` AND ft.specialty_slug = $${paramIndex}`;
      params.push(specialty);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        ft.title ILIKE $${paramIndex}
        OR ft.description ILIKE $${paramIndex}
        OR $${paramIndex + 1} = ANY(ft.tags)
      )`;
      params.push(`%${search}%`, search);
      paramIndex += 2;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY ft.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);

    return {
      templates: result.rows,
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
}

module.exports = new FormsService();
