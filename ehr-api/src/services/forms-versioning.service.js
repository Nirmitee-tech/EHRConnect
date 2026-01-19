/**
 * Forms Versioning Service
 * Handles form template versioning and lifecycle management
 */

const { pool } = require('../database/connection');

class FormsVersioningService {
  /**
   * Create a new version of an existing form template
   * @param {string} templateId - ID of the template to version
   * @param {string} orgId - Organization ID
   * @param {string} userId - User creating the version
   * @param {object} options - Versioning options
   * @returns {object} New draft version of the template
   */
  async createVersion(templateId, orgId, userId, options = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get existing template - specify only needed columns for performance
      const existing = await client.query(
        `SELECT id, title, description, status, version, questionnaire, fhir_url,
                category, tags, specialty_slug, theme_id, parent_version_id, 
                is_latest_version, created_by
         FROM form_templates 
         WHERE id = $1 AND org_id = $2`,
        [templateId, orgId]
      );

      if (existing.rows.length === 0) {
        throw new Error('Form template not found');
      }

      const originalTemplate = existing.rows[0];

      // Only allow versioning of active templates
      if (originalTemplate.status !== 'active') {
        throw new Error('Can only create versions of active (published) templates');
      }

      // Calculate new version number
      const newVersion = this._incrementVersion(
        originalTemplate.version,
        options.versionType || 'minor'
      );

      // Update original template to mark it as not latest
      await client.query(
        'UPDATE form_templates SET is_latest_version = false WHERE id = $1',
        [templateId]
      );

      // Create new draft version
      const insertQuery = `
        INSERT INTO form_templates (
          org_id, title, description, status, version,
          questionnaire, fhir_url, category, tags, specialty_slug,
          theme_id, parent_version_id, is_latest_version,
          created_by, updated_by
        )
        SELECT
          org_id,
          $1, -- title (allow customization)
          $2, -- description (allow customization)
          'draft', -- new version starts as draft
          $3, -- new version number
          questionnaire,
          fhir_url,
          category,
          tags,
          specialty_slug,
          theme_id,
          $4, -- parent_version_id = original template id
          true, -- this is now the latest version
          $5, -- created_by
          $5  -- updated_by
        FROM form_templates
        WHERE id = $4
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        options.title || originalTemplate.title,
        options.description || originalTemplate.description,
        newVersion,
        templateId,
        userId,
      ]);

      const newTemplate = result.rows[0];

      // Copy population rules if they exist
      await client.query(
        `INSERT INTO form_population_rules (form_template_id, fhir_query, target_link_id, source_path, transform)
         SELECT $1, fhir_query, target_link_id, source_path, transform
         FROM form_population_rules WHERE form_template_id = $2`,
        [newTemplate.id, templateId]
      );

      // Copy extraction rules if they exist
      await client.query(
        `INSERT INTO form_extraction_rules (form_template_id, link_id, resource_type, fhir_path, value_type)
         SELECT $1, link_id, resource_type, fhir_path, value_type
         FROM form_extraction_rules WHERE form_template_id = $2`,
        [newTemplate.id, templateId]
      );

      // Log audit trail
      await this._logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: newTemplate.id,
        action: 'version_created',
        actor_id: userId,
        metadata: {
          parent_version_id: templateId,
          parent_version: originalTemplate.version,
          new_version: newVersion,
          version_type: options.versionType || 'minor',
          change_notes: options.changeNotes,
        },
      });

      await client.query('COMMIT');

      return {
        ...newTemplate,
        change_notes: options.changeNotes,
        parent_version: originalTemplate.version,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all versions of a form template
   * @param {string} templateId - ID of any version of the template
   * @param {string} orgId - Organization ID
   * @returns {array} All versions of the template
   */
  async getVersionHistory(templateId, orgId) {
    // First, find the root template (no parent)
    const findRootQuery = `
      WITH RECURSIVE version_chain AS (
        SELECT id, parent_version_id
        FROM form_templates
        WHERE id = $1 AND org_id = $2

        UNION ALL

        SELECT ft.id, ft.parent_version_id
        FROM form_templates ft
        INNER JOIN version_chain vc ON ft.id = vc.parent_version_id
      )
      SELECT id FROM version_chain WHERE parent_version_id IS NULL LIMIT 1
    `;

    const rootResult = await pool.query(findRootQuery, [templateId, orgId]);

    if (rootResult.rows.length === 0) {
      throw new Error('Form template not found');
    }

    const rootId = rootResult.rows[0].id;

    // Now get all versions from the root
    const versionsQuery = `
      WITH RECURSIVE version_tree AS (
        SELECT
          id, title, description, status, version,
          parent_version_id, is_latest_version,
          created_at, updated_at, published_at,
          created_by, updated_by, usage_count
        FROM form_templates
        WHERE id = $1 AND org_id = $2

        UNION ALL

        SELECT
          ft.id, ft.title, ft.description, ft.status, ft.version,
          ft.parent_version_id, ft.is_latest_version,
          ft.created_at, ft.updated_at, ft.published_at,
          ft.created_by, ft.updated_by, ft.usage_count
        FROM form_templates ft
        INNER JOIN version_tree vt ON ft.parent_version_id = vt.id
      )
      SELECT
        vt.*,
        u1.email as created_by_email,
        u2.email as updated_by_email
      FROM version_tree vt
      LEFT JOIN users u1 ON vt.created_by = u1.id
      LEFT JOIN users u2 ON vt.updated_by = u2.id
      ORDER BY vt.created_at ASC
    `;

    const result = await pool.query(versionsQuery, [rootId, orgId]);

    return result.rows;
  }

  /**
   * Retire a form template (no longer available for new responses)
   * @param {string} templateId - Template ID to retire
   * @param {string} orgId - Organization ID
   * @param {string} userId - User performing the action
   * @param {object} options - Options including reason
   * @returns {object} Updated template
   */
  async retireTemplate(templateId, orgId, userId, options = {}) {
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

      // Can only retire active templates
      if (template.status !== 'active') {
        throw new Error('Can only retire active templates');
      }

      // Update status
      const updateQuery = `
        UPDATE form_templates
        SET
          status = 'retired',
          retired_at = NOW(),
          updated_by = $1,
          updated_at = NOW()
        WHERE id = $2 AND org_id = $3
        RETURNING *
      `;

      const result = await client.query(updateQuery, [userId, templateId, orgId]);

      // Log audit trail
      await this._logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: templateId,
        action: 'retired',
        actor_id: userId,
        metadata: {
          reason: options.reason,
          version: template.version,
        },
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
   * Restore an archived template to draft status
   * @param {string} templateId - Template ID to restore
   * @param {string} orgId - Organization ID
   * @param {string} userId - User performing the action
   * @returns {object} Restored template
   */
  async restoreTemplate(templateId, orgId, userId) {
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

      // Can only restore archived templates
      if (template.status !== 'archived') {
        throw new Error('Can only restore archived templates');
      }

      // Restore to draft status
      const updateQuery = `
        UPDATE form_templates
        SET
          status = 'draft',
          updated_by = $1,
          updated_at = NOW()
        WHERE id = $2 AND org_id = $3
        RETURNING *
      `;

      const result = await client.query(updateQuery, [userId, templateId, orgId]);

      // Log audit trail
      await this._logAudit(client, {
        org_id: orgId,
        entity_type: 'form_template',
        entity_id: templateId,
        action: 'restored',
        actor_id: userId,
        metadata: {
          version: template.version,
        },
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
   * Get version comparison between two versions
   * @param {string} version1Id - First version ID
   * @param {string} version2Id - Second version ID
   * @param {string} orgId - Organization ID
   * @returns {object} Comparison details
   */
  async compareVersions(version1Id, version2Id, orgId) {
    const query = `
      SELECT
        ft1.id as v1_id,
        ft1.version as v1_version,
        ft1.questionnaire as v1_questionnaire,
        ft1.updated_at as v1_updated_at,
        ft2.id as v2_id,
        ft2.version as v2_version,
        ft2.questionnaire as v2_questionnaire,
        ft2.updated_at as v2_updated_at
      FROM form_templates ft1
      CROSS JOIN form_templates ft2
      WHERE ft1.id = $1
      AND ft2.id = $2
      AND ft1.org_id = $3
      AND ft2.org_id = $3
    `;

    const result = await pool.query(query, [version1Id, version2Id, orgId]);

    if (result.rows.length === 0) {
      throw new Error('One or both templates not found');
    }

    const row = result.rows[0];

    // Calculate differences
    const differences = this._calculateQuestionnaireChanges(
      row.v1_questionnaire,
      row.v2_questionnaire
    );

    return {
      version1: {
        id: row.v1_id,
        version: row.v1_version,
        updated_at: row.v1_updated_at,
      },
      version2: {
        id: row.v2_id,
        version: row.v2_version,
        updated_at: row.v2_updated_at,
      },
      differences,
    };
  }

  // Private helper methods

  /**
   * Increment version number based on type
   * @private
   */
  _incrementVersion(currentVersion, versionType) {
    const parts = currentVersion.split('.').map((n) => parseInt(n, 10));
    let [major, minor, patch] = parts;

    switch (versionType.toLowerCase()) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        break;
      case 'patch':
        patch += 1;
        break;
      default:
        throw new Error('Invalid version type. Must be major, minor, or patch');
    }

    return `${major}.${minor}.${patch}`;
  }

  /**
   * Calculate changes between two questionnaires
   * @private
   */
  _calculateQuestionnaireChanges(q1, q2) {
    const changes = {
      added_questions: [],
      removed_questions: [],
      modified_questions: [],
      metadata_changes: {},
    };

    // Compare title, description
    if (q1.title !== q2.title) {
      changes.metadata_changes.title = { from: q1.title, to: q2.title };
    }

    if (q1.description !== q2.description) {
      changes.metadata_changes.description = {
        from: q1.description,
        to: q2.description,
      };
    }

    // Deep comparison of questions would go here
    // This is simplified - a full implementation would recursively compare items

    const q1LinkIds = new Set(this._extractLinkIds(q1.item || []));
    const q2LinkIds = new Set(this._extractLinkIds(q2.item || []));

    // Find added questions
    for (const linkId of q2LinkIds) {
      if (!q1LinkIds.has(linkId)) {
        changes.added_questions.push(linkId);
      }
    }

    // Find removed questions
    for (const linkId of q1LinkIds) {
      if (!q2LinkIds.has(linkId)) {
        changes.removed_questions.push(linkId);
      }
    }

    changes.summary = {
      total_changes:
        changes.added_questions.length +
        changes.removed_questions.length +
        Object.keys(changes.metadata_changes).length,
      breaking_changes: changes.removed_questions.length > 0,
    };

    return changes;
  }

  /**
   * Extract all linkIds from questionnaire items recursively
   * @private
   */
  _extractLinkIds(items) {
    const linkIds = [];

    const traverse = (itemList) => {
      for (const item of itemList || []) {
        if (item.linkId) {
          linkIds.push(item.linkId);
        }
        if (item.item) {
          traverse(item.item);
        }
      }
    };

    traverse(items);
    return linkIds;
  }

  /**
   * Log audit trail
   * @private
   */
  async _logAudit(client, data) {
    const query = `
      INSERT INTO audit_logs (
        org_id, entity_type, entity_id, action, actor_id, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await client.query(query, [
      data.org_id,
      data.entity_type,
      data.entity_id,
      data.action,
      data.actor_id,
      JSON.stringify(data.metadata || {}),
    ]);
  }
}

module.exports = new FormsVersioningService();
