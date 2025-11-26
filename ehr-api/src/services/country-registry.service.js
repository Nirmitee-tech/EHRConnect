const { pool } = require('../database/connection');
const fs = require('fs').promises;
const path = require('path');

/**
 * Country Pack Registry Service
 * Manages country-specific features, modules, and configurations
 * Similar to specialty-registry but for country-specific requirements
 */
class CountryRegistryService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // =====================================================
  // COUNTRY PACK RESOLUTION
  // =====================================================

  /**
   * Resolve country context for current request
   * Returns enabled country pack and modules based on org/location
   */
  async resolveContext(orgId, locationId = null) {
    try {
      const client = await pool.connect();

      try {
        // Determine scope
        const scope = locationId ? 'location' : 'org';
        const scopeRefId = locationId || null;

        // Get enabled country settings
        const settingsQuery = `
          SELECT
            ocs.id,
            ocs.country_code,
            ocs.pack_slug,
            ocs.pack_version,
            ocs.enabled,
            ocs.scope,
            ocs.scope_ref_id,
            ocs.overrides,
            ocs.language_override,
            ocs.currency_override,
            ocs.timezone_override,
            ocs.compliance_settings,
            cp.country_name,
            cp.region,
            cp.default_language,
            cp.supported_languages,
            cp.default_currency,
            cp.default_timezone,
            cp.date_format,
            cp.number_format,
            cp.regulatory_body,
            cp.data_residency_required,
            cp.gdpr_compliant,
            cp.hipaa_compliant,
            cp.features,
            cp.modules
          FROM org_country_settings ocs
          JOIN country_packs cp ON ocs.country_code = cp.country_code
          WHERE ocs.org_id = $1
            AND ocs.enabled = true
            AND (
              (ocs.scope = 'org' AND ocs.scope_ref_id IS NULL)
              OR (ocs.scope = 'location' AND ocs.scope_ref_id = $2)
            )
          ORDER BY
            CASE
              WHEN ocs.scope = 'location' THEN 1
              WHEN ocs.scope = 'org' THEN 2
            END
          LIMIT 1
        `;

        const settingsResult = await client.query(settingsQuery, [orgId, scopeRefId]);

        if (settingsResult.rows.length === 0) {
          return {
            orgId,
            countryPack: null,
            enabledModules: [],
            localization: {
              language: 'en',
              currency: 'USD',
              timezone: 'UTC',
              dateFormat: 'MM/DD/YYYY',
              numberFormat: 'en-US'
            }
          };
        }

        const settings = settingsResult.rows[0];

        // Get enabled modules for this org
        const modulesQuery = `
          SELECT
            oem.id,
            oem.module_code,
            oem.enabled,
            oem.config,
            oem.status,
            oem.last_sync_at,
            cm.module_name,
            cm.module_type,
            cm.description,
            cm.version,
            cm.component_path,
            cm.settings_component_path,
            cm.required_integrations,
            cm.required_permissions,
            cm.beta
          FROM org_enabled_modules oem
          JOIN country_modules cm ON oem.module_code = cm.module_code
          WHERE oem.org_id = $1
            AND oem.country_code = $2
            AND oem.enabled = true
            AND cm.active = true
            AND (
              (oem.scope = 'org' AND oem.scope_ref_id IS NULL)
              OR (oem.scope = 'location' AND oem.scope_ref_id = $3)
            )
          ORDER BY cm.module_type, cm.module_code
        `;

        const modulesResult = await client.query(modulesQuery, [orgId, settings.country_code, scopeRefId]);

        return {
          orgId,
          countryPack: {
            countryCode: settings.country_code,
            countryName: settings.country_name,
            region: settings.region,
            packSlug: settings.pack_slug,
            packVersion: settings.pack_version,
            regulatoryBody: settings.regulatory_body,
            dataResidencyRequired: settings.data_residency_required,
            gdprCompliant: settings.gdpr_compliant,
            hipaaCompliant: settings.hipaa_compliant,
            features: settings.features,
            modules: settings.modules,
            overrides: settings.overrides,
            complianceSettings: settings.compliance_settings
          },
          enabledModules: modulesResult.rows.map(module => ({
            id: module.id,
            moduleCode: module.module_code,
            moduleName: module.module_name,
            moduleType: module.module_type,
            description: module.description,
            version: module.version,
            config: module.config,
            status: module.status,
            lastSyncAt: module.last_sync_at,
            componentPath: module.component_path,
            settingsComponentPath: module.settings_component_path,
            requiredIntegrations: module.required_integrations,
            requiredPermissions: module.required_permissions,
            beta: module.beta
          })),
          localization: {
            language: settings.language_override || settings.default_language,
            currency: settings.currency_override || settings.default_currency,
            timezone: settings.timezone_override || settings.default_timezone,
            dateFormat: settings.date_format,
            numberFormat: settings.number_format,
            supportedLanguages: settings.supported_languages
          }
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error resolving country context:', error);
      throw error;
    }
  }

  /**
   * Get all available country packs
   */
  async getAllCountryPacks(activeOnly = true) {
    try {
      const client = await pool.connect();

      try {
        const query = `
          SELECT
            country_code,
            country_name,
            region,
            pack_slug,
            pack_version,
            regulatory_body,
            default_language,
            supported_languages,
            default_currency,
            default_timezone,
            date_format,
            number_format,
            data_residency_required,
            gdpr_compliant,
            hipaa_compliant,
            features,
            modules,
            active
          FROM country_packs
          ${activeOnly ? 'WHERE active = true' : ''}
          ORDER BY country_name
        `;

        const result = await client.query(query);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching country packs:', error);
      throw error;
    }
  }

  /**
   * Get country pack by code
   */
  async getCountryPack(countryCode) {
    try {
      const client = await pool.connect();

      try {
        const query = `
          SELECT *
          FROM country_packs
          WHERE country_code = $1 AND active = true
        `;

        const result = await client.query(query, [countryCode]);

        if (result.rows.length === 0) {
          throw new Error(`Country pack not found: ${countryCode}`);
        }

        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching country pack:', error);
      throw error;
    }
  }

  /**
   * Get all modules for a country
   */
  async getCountryModules(countryCode, activeOnly = true) {
    try {
      const client = await pool.connect();

      try {
        const query = `
          SELECT
            module_code,
            module_name,
            module_type,
            description,
            version,
            config_schema,
            default_config,
            required_integrations,
            required_permissions,
            component_path,
            settings_component_path,
            active,
            beta,
            documentation_url,
            metadata
          FROM country_modules
          WHERE country_code = $1
            ${activeOnly ? 'AND active = true' : ''}
          ORDER BY module_type, module_code
        `;

        const result = await client.query(query, [countryCode]);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching country modules:', error);
      throw error;
    }
  }

  // =====================================================
  // ORG COUNTRY CONFIGURATION
  // =====================================================

  /**
   * Enable country pack for organization
   */
  async enableCountryPack(orgId, countryCode, userId, scope = 'org', scopeRefId = null, overrides = {}) {
    try {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Get country pack details
        const packQuery = `
          SELECT pack_slug, pack_version
          FROM country_packs
          WHERE country_code = $1 AND active = true
        `;

        const packResult = await client.query(packQuery, [countryCode]);

        if (packResult.rows.length === 0) {
          throw new Error(`Country pack not found: ${countryCode}`);
        }

        const { pack_slug, pack_version } = packResult.rows[0];

        // Insert or update org country settings
        const upsertQuery = `
          INSERT INTO org_country_settings (
            org_id, country_code, pack_slug, pack_version,
            enabled, scope, scope_ref_id, overrides,
            created_by, updated_by
          ) VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $8)
          ON CONFLICT (org_id, scope, scope_ref_id)
          DO UPDATE SET
            country_code = EXCLUDED.country_code,
            pack_slug = EXCLUDED.pack_slug,
            pack_version = EXCLUDED.pack_version,
            enabled = true,
            overrides = EXCLUDED.overrides,
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `;

        const result = await client.query(upsertQuery, [
          orgId, countryCode, pack_slug, pack_version,
          scope, scopeRefId, JSON.stringify(overrides), userId
        ]);

        await client.query('COMMIT');

        return {
          id: result.rows[0].id,
          orgId,
          countryCode,
          packSlug: pack_slug,
          packVersion: pack_version,
          enabled: true
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error enabling country pack:', error);
      throw error;
    }
  }

  /**
   * Enable specific module for organization
   */
  async enableModule(orgId, countryCode, moduleCode, userId, config = {}, scope = 'org', scopeRefId = null) {
    try {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Verify module exists and is active
        const moduleQuery = `
          SELECT module_code, default_config
          FROM country_modules
          WHERE country_code = $1 AND module_code = $2 AND active = true
        `;

        const moduleResult = await client.query(moduleQuery, [countryCode, moduleCode]);

        if (moduleResult.rows.length === 0) {
          throw new Error(`Module not found: ${moduleCode}`);
        }

        const defaultConfig = moduleResult.rows[0].default_config;
        const mergedConfig = { ...defaultConfig, ...config };

        // Insert or update org enabled module
        const upsertQuery = `
          INSERT INTO org_enabled_modules (
            org_id, country_code, module_code,
            enabled, scope, scope_ref_id, config,
            status, created_by, updated_by
          ) VALUES ($1, $2, $3, true, $4, $5, $6, 'active', $7, $7)
          ON CONFLICT (org_id, module_code, scope, scope_ref_id)
          DO UPDATE SET
            enabled = true,
            config = EXCLUDED.config,
            status = 'active',
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `;

        const result = await client.query(upsertQuery, [
          orgId, countryCode, moduleCode,
          scope, scopeRefId, JSON.stringify(mergedConfig), userId
        ]);

        await client.query('COMMIT');

        return {
          id: result.rows[0].id,
          orgId,
          countryCode,
          moduleCode,
          enabled: true,
          config: mergedConfig
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error enabling module:', error);
      throw error;
    }
  }

  /**
   * Disable specific module for organization
   */
  async disableModule(orgId, moduleCode, userId, scope = 'org', scopeRefId = null) {
    try {
      const client = await pool.connect();

      try {
        const query = `
          UPDATE org_enabled_modules
          SET
            enabled = false,
            status = 'disabled',
            updated_by = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE org_id = $1
            AND module_code = $2
            AND scope = $4
            AND (scope_ref_id = $5 OR (scope_ref_id IS NULL AND $5 IS NULL))
          RETURNING id
        `;

        const result = await client.query(query, [orgId, moduleCode, userId, scope, scopeRefId]);

        if (result.rows.length === 0) {
          throw new Error(`Module not found or already disabled: ${moduleCode}`);
        }

        return {
          orgId,
          moduleCode,
          enabled: false
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error disabling module:', error);
      throw error;
    }
  }

  /**
   * Update module configuration
   */
  async updateModuleConfig(orgId, moduleCode, config, userId, scope = 'org', scopeRefId = null) {
    try {
      const client = await pool.connect();

      try {
        const query = `
          UPDATE org_enabled_modules
          SET
            config = $3,
            updated_by = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE org_id = $1
            AND module_code = $2
            AND scope = $5
            AND (scope_ref_id = $6 OR (scope_ref_id IS NULL AND $6 IS NULL))
          RETURNING id
        `;

        const result = await client.query(query, [
          orgId, moduleCode, JSON.stringify(config), userId, scope, scopeRefId
        ]);

        if (result.rows.length === 0) {
          throw new Error(`Module not found: ${moduleCode}`);
        }

        return {
          orgId,
          moduleCode,
          config
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating module config:', error);
      throw error;
    }
  }

  /**
   * Get audit history for country pack changes
   */
  async getCountryPackAuditHistory(orgId, countryCode = null, limit = 50) {
    try {
      const client = await pool.connect();

      try {
        const query = `
          SELECT
            cpa.id,
            cpa.org_id,
            cpa.country_code,
            cpa.pack_slug,
            cpa.pack_version,
            cpa.action,
            cpa.actor_id,
            cpa.created_at,
            cpa.scope,
            cpa.scope_ref_id,
            cpa.metadata,
            u.name as actor_name,
            u.email as actor_email
          FROM country_pack_audits cpa
          LEFT JOIN users u ON cpa.actor_id = u.id
          WHERE cpa.org_id = $1
            ${countryCode ? 'AND cpa.country_code = $2' : ''}
          ORDER BY cpa.created_at DESC
          LIMIT $${countryCode ? '3' : '2'}
        `;

        const params = countryCode ? [orgId, countryCode, limit] : [orgId, limit];
        const result = await client.query(query, params);

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching audit history:', error);
      throw error;
    }
  }

  // =====================================================
  // CACHE MANAGEMENT
  // =====================================================

  getCacheKey(key) {
    return `country:${key}`;
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  invalidateCache(key = null) {
    if (key) {
      this.cache.delete(this.getCacheKey(key));
    } else {
      this.cache.clear();
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new CountryRegistryService();
