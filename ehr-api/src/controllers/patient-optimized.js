/**
 * Optimized Patient Controller for Sub-10ms Response Times
 * 
 * Uses materialized views, aggressive caching, and prepared statements
 * for lightning-fast patient searches and lookups.
 * 
 * Target Performance:
 * - Patient lookup by ID: <5ms
 * - Patient search: <10ms
 * - Cache hit rate: >90%
 */

const { v4: uuidv4 } = require('uuid');
const multiCache = require('../utils/multi-level-cache');
const logger = require('../utils/logger');

/**
 * Generate unique Medical Record Number (MRN)
 */
function generateMRN() {
  const prefix = 'PT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

class OptimizedPatientController {
  /**
   * Search patients using materialized view for ultra-fast results
   * Target: <10ms response time
   */
  async search(db, query) {
    const cacheKey = multiCache.KEYS.PATIENT_SEARCH(query);
    
    return await multiCache.get(
      cacheKey,
      async () => {
        try {
          const startTime = Date.now();
          
          // Use materialized view for fast searches
          let whereClause = '1=1';
          let queryParams = [];
          let paramIndex = 1;

          // Build optimized where clause
          if (query.family) {
            whereClause += ` AND family_name_lower LIKE LOWER($${paramIndex})`;
            queryParams.push(`%${query.family}%`);
            paramIndex++;
          }

          if (query.given) {
            whereClause += ` AND given_name_lower LIKE LOWER($${paramIndex})`;
            queryParams.push(`%${query.given}%`);
            paramIndex++;
          }

          if (query.identifier) {
            whereClause += ` AND mrn = $${paramIndex}`;
            queryParams.push(query.identifier);
            paramIndex++;
          }

          if (query.birthdate) {
            whereClause += ` AND birth_date = $${paramIndex}`;
            queryParams.push(query.birthdate);
            paramIndex++;
          }

          if (query.gender) {
            whereClause += ` AND gender = $${paramIndex}`;
            queryParams.push(query.gender);
            paramIndex++;
          }

          const limit = Math.min(parseInt(query._count) || 20, 100); // Cap at 100
          const offset = parseInt(query._offset) || 0;

          // Use materialized view for ultra-fast search
          const sql = `
            SELECT resource_data 
            FROM patient_search_cache 
            WHERE ${whereClause}
            ORDER BY last_updated DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
          `;

          queryParams.push(limit, offset);

          const { rows } = await db.query(sql, queryParams);
          const duration = Date.now() - startTime;
          
          logger.debug('Patient search executed', {
            duration: `${duration}ms`,
            resultCount: rows.length,
            query: query
          });

          return rows.map(row => row.resource_data);
        } catch (error) {
          // Fallback to regular query if materialized view doesn't exist yet
          logger.warn('Materialized view not available, using fallback', {
            error: error.message
          });
          return this.searchFallback(db, query);
        }
      },
      30000 // Cache for 30 seconds
    );
  }

  /**
   * Fallback search using GIN indexes (still fast, but not as fast as mat view)
   */
  async searchFallback(db, query) {
    let whereClause = 'WHERE resource_type = $1 AND deleted = FALSE';
    let queryParams = ['Patient'];
    let paramIndex = 2;

    if (query.family) {
      whereClause += ` AND LOWER(resource_data->'name'->0->>'family') LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${query.family}%`);
      paramIndex++;
    }

    if (query.given) {
      whereClause += ` AND LOWER(resource_data->'name'->0->'given'->>0) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${query.given}%`);
      paramIndex++;
    }

    if (query.identifier) {
      whereClause += ` AND resource_data->'identifier' @> $${paramIndex}::jsonb`;
      queryParams.push(JSON.stringify([{ value: query.identifier }]));
      paramIndex++;
    }

    if (query.birthdate) {
      whereClause += ` AND resource_data->>'birthDate' = $${paramIndex}`;
      queryParams.push(query.birthdate);
      paramIndex++;
    }

    if (query.gender) {
      whereClause += ` AND resource_data->>'gender' = $${paramIndex}`;
      queryParams.push(query.gender);
      paramIndex++;
    }

    const limit = Math.min(parseInt(query._count) || 20, 100);
    const offset = parseInt(query._offset) || 0;

    const sql = `
      SELECT resource_data 
      FROM fhir_resources 
      ${whereClause}
      ORDER BY last_updated DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const { rows } = await db.query(sql, queryParams);
    return rows.map(row => row.resource_data);
  }

  /**
   * Read single patient with aggressive caching
   * Target: <5ms response time
   */
  async read(db, id) {
    const cacheKey = multiCache.KEYS.PATIENT(id);
    
    return await multiCache.get(
      cacheKey,
      async () => {
        try {
          const startTime = Date.now();
          
          // Try materialized view first
          let { rows } = await db.query(
            'SELECT resource_data FROM patient_search_cache WHERE patient_id = $1',
            [id]
          );
          
          // Fallback to main table
          if (rows.length === 0) {
            ({ rows } = await db.query(
              'SELECT resource_data FROM fhir_resources WHERE id = $1 AND resource_type = $2 AND deleted = FALSE',
              [id, 'Patient']
            ));
          }
          
          const duration = Date.now() - startTime;
          
          logger.debug('Patient read executed', {
            duration: `${duration}ms`,
            id,
            found: rows.length > 0
          });
          
          return rows.length > 0 ? rows[0].resource_data : null;
        } catch (error) {
          logger.error('Patient read error', {
            id,
            error: error.message,
            stack: error.stack
          });
          throw new Error(`Failed to read patient: ${error.message}`);
        }
      },
      60000 // Cache for 1 minute
    );
  }

  /**
   * Create new patient (invalidates cache)
   */
  async create(db, resourceData) {
    try {
      const id = resourceData.id || uuidv4();
      const now = new Date().toISOString();

      // Generate MRN if not provided
      if (!resourceData.identifier || resourceData.identifier.length === 0) {
        resourceData.identifier = [
          {
            system: 'urn:oid:1.2.840.114350',
            value: generateMRN(),
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical Record Number',
                },
              ],
            },
          },
        ];
      }

      const patient = {
        ...resourceData,
        id,
        resourceType: 'Patient',
        meta: {
          versionId: '1',
          lastUpdated: now,
        },
      };

      await db.query(
        `INSERT INTO fhir_resources (id, resource_type, resource_data, last_updated, deleted)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, 'Patient', JSON.stringify(patient), now, false]
      );

      // Invalidate patient list caches
      multiCache.invalidatePattern('patient-search:*');
      
      logger.info('Patient created', { id });

      return patient;
    } catch (error) {
      logger.error('Patient create error', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  /**
   * Update patient (invalidates cache)
   */
  async update(db, id, resourceData) {
    try {
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Patient not found');
      }

      const now = new Date().toISOString();
      const currentVersion = parseInt(existing.meta?.versionId || '1');

      const updated = {
        ...existing,
        ...resourceData,
        id,
        resourceType: 'Patient',
        meta: {
          versionId: (currentVersion + 1).toString(),
          lastUpdated: now,
        },
      };

      await db.query(
        `UPDATE fhir_resources 
         SET resource_data = $1, last_updated = $2
         WHERE id = $3 AND resource_type = $4`,
        [JSON.stringify(updated), now, id, 'Patient']
      );

      // Invalidate caches
      multiCache.invalidate(multiCache.KEYS.PATIENT(id));
      multiCache.invalidatePattern('patient-search:*');
      
      logger.info('Patient updated', { id });

      return updated;
    } catch (error) {
      logger.error('Patient update error', {
        id,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to update patient: ${error.message}`);
    }
  }

  /**
   * Delete patient (soft delete, invalidates cache)
   */
  async delete(db, id) {
    try {
      const result = await db.query(
        `UPDATE fhir_resources 
         SET deleted = TRUE, last_updated = $1
         WHERE id = $2 AND resource_type = $3`,
        [new Date().toISOString(), id, 'Patient']
      );

      if (result.rowCount === 0) {
        throw new Error('Patient not found');
      }

      // Invalidate caches
      multiCache.invalidate(multiCache.KEYS.PATIENT(id));
      multiCache.invalidatePattern('patient-search:*');
      
      logger.info('Patient deleted', { id });

      return { deleted: true, id };
    } catch (error) {
      logger.error('Patient delete error', {
        id,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to delete patient: ${error.message}`);
    }
  }
}

module.exports = new OptimizedPatientController();
