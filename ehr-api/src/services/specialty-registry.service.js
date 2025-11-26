const { query, transaction } = require('../database/connection');
const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

/**
 * Specialty Registry Service
 * Manages specialty packs: validation, loading, caching, and resolution
 */

class SpecialtyRegistryService {
  constructor() {
    this.packCache = new Map(); // In-memory cache: pack_slug:version -> compiled pack
    this.packDirectory = path.join(__dirname, '../../specialty-packs');
    this.packSchema = this.definePackSchema();
    this.validatePackFn = ajv.compile(this.packSchema);
  }

  /**
   * Define JSON Schema for pack.json validation
   */
  definePackSchema() {
    return {
      type: 'object',
      required: ['slug', 'version', 'templates', 'visitTypes'],
      properties: {
        slug: {
          type: 'string',
          pattern: '^[a-z0-9-]+$',
          minLength: 2,
          maxLength: 50
        },
        version: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+$' // Semantic versioning
        },
        name: {
          type: 'string' // Display name
        },
        description: {
          type: 'string' // Pack description
        },
        // Phase 2 Enhancement: Metadata fields
        category: {
          type: 'string',
          enum: ['clinical', 'administrative', 'financial', 'general']
        },
        icon: {
          type: 'string' // Lucide icon name
        },
        color: {
          type: 'string' // Hex color code
        },
        // Phase 2 Enhancement: Navigation configuration
        navigation: {
          type: 'object',
          properties: {
            sections: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'label'],
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  icon: { type: 'string' },
                  category: {
                    type: 'string',
                    enum: ['general', 'clinical', 'administrative', 'financial', 'specialty']
                  },
                  order: { type: 'number' },
                  requiresEpisode: { type: 'boolean' },
                  badge: { type: 'string' },
                  componentName: { type: 'string' }, // Component to render (e.g., 'PrenatalOverview')
                  hidden: { type: 'boolean' }
                }
              }
            },
            replaceSections: { type: 'boolean' },
            mergeWith: { type: 'string' }
          }
        },
        // Phase 2 Enhancement: Episode configuration
        episodeConfig: {
          type: 'object',
          properties: {
            allowConcurrent: { type: 'boolean' },
            defaultState: {
              type: 'string',
              enum: ['planned', 'waitlist', 'active', 'on-hold', 'finished', 'cancelled']
            },
            requiredFields: {
              type: 'array',
              items: { type: 'string' }
            },
            stateTransitions: { type: 'object' },
            autoClose: { type: 'boolean' },
            maxDuration: { type: 'number' }
          }
        },
        dependencies: {
          type: 'array',
          items: { type: 'string' }
        },
        templates: {
          type: 'array',
          items: { type: 'string' }
        },
        visitTypes: {
          type: 'string' // Path to visit-types.json
        },
        workflows: {
          type: ['string', 'null'] // Path to workflows file or null
        },
        reports: {
          type: ['string', 'null'] // Path to reports config or null
        },
        featureFlags: {
          type: 'object'
        },
        devices: {
          type: 'array',
          items: { type: 'object' }
        }
      },
      additionalProperties: false
    };
  }

  /**
   * Load and validate a specialty pack from filesystem
   * @param {string} slug - Pack slug (e.g., 'ob-gyn')
   * @param {string} version - Pack version (e.g., '1.0.0')
   * @returns {Promise<Object>} Compiled pack object
   */
  async loadPack(slug, version) {
    const cacheKey = `${slug}:${version}`;

    // Check cache first
    if (this.packCache.has(cacheKey)) {
      return this.packCache.get(cacheKey);
    }

    try {
      // Read pack.json
      const packPath = path.join(this.packDirectory, slug, version, 'pack.json');
      const packContent = await fs.readFile(packPath, 'utf8');
      const packManifest = JSON.parse(packContent);

      // Validate schema
      const valid = this.validatePackFn(packManifest);
      if (!valid) {
        throw new Error(`Pack validation failed: ${JSON.stringify(this.validatePackFn.errors)}`);
      }

      // Load referenced files (templates, visit types, workflows)
      const compiledPack = {
        ...packManifest,
        templates: await this.loadTemplates(slug, version, packManifest.templates),
        visitTypes: await this.loadVisitTypes(slug, version, packManifest.visitTypes),
        workflows: packManifest.workflows
          ? await this.loadWorkflows(slug, version, packManifest.workflows)
          : null,
        reports: packManifest.reports
          ? await this.loadReports(slug, version, packManifest.reports)
          : null
      };

      // Cache compiled pack
      this.packCache.set(cacheKey, compiledPack);

      return compiledPack;
    } catch (error) {
      throw new Error(`Failed to load pack ${slug}:${version} - ${error.message}`);
    }
  }

  /**
   * Load template files
   */
  async loadTemplates(slug, version, templatePaths) {
    const templates = [];
    for (const templatePath of templatePaths) {
      try {
        const fullPath = path.join(this.packDirectory, slug, version, templatePath);
        const content = await fs.readFile(fullPath, 'utf8');
        templates.push({
          path: templatePath,
          schema: JSON.parse(content)
        });
      } catch (error) {
        console.error(`Failed to load template ${templatePath}:`, error.message);
      }
    }
    return templates;
  }

  /**
   * Load visit types configuration
   */
  async loadVisitTypes(slug, version, visitTypesPath) {
    try {
      const fullPath = path.join(this.packDirectory, slug, version, visitTypesPath);
      const content = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load visit types:`, error.message);
      return [];
    }
  }

  /**
   * Load workflows configuration
   */
  async loadWorkflows(slug, version, workflowsPath) {
    try {
      const fullPath = path.join(this.packDirectory, slug, version, workflowsPath);
      const content = await fs.readFile(fullPath, 'utf8');
      // Support both JSON and YAML
      if (workflowsPath.endsWith('.json')) {
        return JSON.parse(content);
      }
      // For YAML support, would need 'js-yaml' package
      return content; // Return raw for now
    } catch (error) {
      console.error(`Failed to load workflows:`, error.message);
      return null;
    }
  }

  /**
   * Load reports configuration
   */
  async loadReports(slug, version, reportsPath) {
    try {
      const fullPath = path.join(this.packDirectory, slug, version, reportsPath);
      const content = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load reports:`, error.message);
      return null;
    }
  }

  /**
   * Get enabled packs for an organization
   * Resolves inheritance: org -> location -> department
   * @param {string} orgId - Organization UUID
   * @param {string} scope - 'org', 'location', 'department', 'service_line'
   * @param {string} scopeRefId - Reference ID for the scope
   * @returns {Promise<Array>} Array of enabled pack configurations
   */
  async getEnabledPacks(orgId, scope = 'org', scopeRefId = null) {
    try {
      // Query with scope inheritance
      const result = await query(`
        SELECT DISTINCT ON (pack_slug)
          pack_slug,
          pack_version,
          enabled,
          scope,
          scope_ref_id,
          overrides
        FROM org_specialty_settings
        WHERE org_id = $1
          AND enabled = true
          AND (
            (scope = 'org' AND scope_ref_id IS NULL) OR
            (scope = $2 AND scope_ref_id = $3)
          )
        ORDER BY pack_slug,
          CASE scope
            WHEN 'service_line' THEN 4
            WHEN 'department' THEN 3
            WHEN 'location' THEN 2
            WHEN 'org' THEN 1
          END DESC
      `, [orgId, scope, scopeRefId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching enabled packs:', error);
      throw new Error('Failed to retrieve enabled packs');
    }
  }

  /**
   * Get ALL pack settings for an organization (both enabled and disabled)
   * Used by admin UI to show all pack states
   * @param {string} orgId - Organization UUID
   * @param {string} scope - 'org', 'location', 'department', 'service_line'
   * @param {string} scopeRefId - Reference ID for the scope
   * @returns {Promise<Array>} Array of all pack settings
   */
  async getAllPackSettings(orgId, scope = 'org', scopeRefId = null) {
    try {
      const result = await query(`
        SELECT DISTINCT ON (pack_slug)
          pack_slug,
          pack_version,
          enabled,
          scope,
          scope_ref_id,
          overrides,
          created_at,
          updated_at
        FROM org_specialty_settings
        WHERE org_id = $1
          AND (
            (scope = 'org' AND scope_ref_id IS NULL) OR
            (scope = $2 AND scope_ref_id = $3)
          )
        ORDER BY pack_slug,
          CASE scope
            WHEN 'service_line' THEN 4
            WHEN 'department' THEN 3
            WHEN 'location' THEN 2
            WHEN 'org' THEN 1
          END DESC
      `, [orgId, scope, scopeRefId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching all pack settings:', error);
      throw new Error('Failed to retrieve pack settings');
    }
  }

  /**
   * Enable a specialty pack for an organization
   */
  async enablePack(orgId, packSlug, packVersion, scope, scopeRefId, userId, overrides = {}) {
    try {
      // Validate pack exists and can be loaded
      await this.loadPack(packSlug, packVersion);

      // Check dependencies
      const packData = this.packCache.get(`${packSlug}:${packVersion}`);
      if (packData.dependencies && packData.dependencies.length > 0) {
        const enabledPacks = await this.getEnabledPacks(orgId, scope, scopeRefId);
        const enabledSlugs = new Set(enabledPacks.map(p => p.pack_slug));

        for (const dep of packData.dependencies) {
          if (!enabledSlugs.has(dep)) {
            throw new Error(`Missing dependency: ${dep} must be enabled first`);
          }
        }
      }

      return await transaction(async (client) => {
        // Insert or update pack setting
        const result = await client.query(`
          INSERT INTO org_specialty_settings (
            org_id, pack_slug, pack_version, enabled, scope, scope_ref_id, overrides, created_by, updated_by
          ) VALUES ($1, $2, $3, true, $4, $5, $6, $7, $7)
          ON CONFLICT (org_id, pack_slug, scope, scope_ref_id)
          DO UPDATE SET
            pack_version = EXCLUDED.pack_version,
            enabled = true,
            overrides = EXCLUDED.overrides,
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [orgId, packSlug, packVersion, scope, scopeRefId, JSON.stringify(overrides), userId]);

        // Audit trail is handled by trigger

        return result.rows[0];
      });
    } catch (error) {
      console.error('Error enabling pack:', error);
      throw error;
    }
  }

  /**
   * Disable a specialty pack
   */
  async disablePack(orgId, packSlug, scope, scopeRefId, userId) {
    try {
      return await transaction(async (client) => {
        const result = await client.query(`
          UPDATE org_specialty_settings
          SET enabled = false, updated_by = $5, updated_at = CURRENT_TIMESTAMP
          WHERE org_id = $1 AND pack_slug = $2 AND scope = $3
            AND (scope_ref_id = $4 OR ($4 IS NULL AND scope_ref_id IS NULL))
          RETURNING *
        `, [orgId, packSlug, scope, scopeRefId, userId]);

        if (result.rows.length === 0) {
          throw new Error('Pack setting not found');
        }

        return result.rows[0];
      });
    } catch (error) {
      console.error('Error disabling pack:', error);
      throw error;
    }
  }

  /**
   * Get pack audit history
   */
  async getPackAuditHistory(orgId, packSlug = null, limit = 50) {
    try {
      const queryText = packSlug
        ? `
          SELECT a.*, u.name as actor_name
          FROM specialty_pack_audits a
          JOIN users u ON a.actor_id = u.id
          WHERE a.org_id = $1 AND a.pack_slug = $2
          ORDER BY a.created_at DESC
          LIMIT $3
        `
        : `
          SELECT a.*, u.name as actor_name
          FROM specialty_pack_audits a
          JOIN users u ON a.actor_id = u.id
          WHERE a.org_id = $1
          ORDER BY a.created_at DESC
          LIMIT $2
        `;

      const params = packSlug ? [orgId, packSlug, limit] : [orgId, limit];
      const result = await query(queryText, params);

      return result.rows;
    } catch (error) {
      console.error('Error fetching audit history:', error);
      throw error;
    }
  }

  /**
   * Resolve specialty context for a request
   * Returns the effective packs based on org + location + department
   */
  async resolveContext(orgId, locationId = null, departmentId = null) {
    try {
      // Determine scope
      let scope = 'org';
      let scopeRefId = null;

      if (departmentId) {
        scope = 'department';
        scopeRefId = departmentId;
      } else if (locationId) {
        scope = 'location';
        scopeRefId = locationId;
      }

      // Get enabled packs
      const enabledPacks = await this.getEnabledPacks(orgId, scope, scopeRefId);

      // Load pack data
      const packsData = [];
      for (const packSetting of enabledPacks) {
        try {
          const packData = await this.loadPack(packSetting.pack_slug, packSetting.pack_version);
          packsData.push({
            slug: packSetting.pack_slug,
            version: packSetting.pack_version,
            overrides: packSetting.overrides,
            ...packData
          });
        } catch (error) {
          console.error(`Failed to load pack ${packSetting.pack_slug}:`, error.message);
        }
      }

      return {
        orgId,
        locationId,
        departmentId,
        scope,
        packs: packsData
      };
    } catch (error) {
      console.error('Error resolving specialty context:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache for a specific pack
   */
  invalidateCache(slug, version) {
    const cacheKey = `${slug}:${version}`;
    this.packCache.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.packCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.packCache.size,
      keys: Array.from(this.packCache.keys())
    };
  }
}

module.exports = new SpecialtyRegistryService();
