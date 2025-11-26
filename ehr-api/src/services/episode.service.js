/**
 * Episode Service
 * Manages FHIR EpisodeOfCare resources for specialty-based patient care
 * @see https://www.hl7.org/fhir/episodeofcare.html
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

class EpisodeService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Convert database episode to FHIR EpisodeOfCare resource
   * @private
   */
  _toFHIRResource(dbEpisode) {
    const resource = {
      resourceType: 'EpisodeOfCare',
      id: dbEpisode.id,
      identifier: [
        {
          system: 'urn:ehrconnect:episode',
          value: dbEpisode.id,
          use: 'official'
        }
      ],
      status: dbEpisode.episode_state,
      type: [
        {
          coding: [
            {
              system: 'urn:ehrconnect:specialty',
              code: dbEpisode.specialty_slug,
              display: dbEpisode.specialty_slug
            }
          ],
          text: dbEpisode.specialty_slug
        }
      ],
      patient: {
        reference: `Patient/${dbEpisode.patient_id}`,
        type: 'Patient'
      },
      managingOrganization: {
        reference: `Organization/${dbEpisode.org_id}`,
        type: 'Organization'
      },
      period: {
        start: dbEpisode.start_at,
        end: dbEpisode.end_at || undefined
      },
      meta: {
        lastUpdated: dbEpisode.updated_at,
        versionId: '1',
        tag: [
          {
            system: 'urn:ehrconnect:active',
            code: dbEpisode.active ? 'active' : 'inactive'
          }
        ]
      }
    };

    // Add care manager if present
    if (dbEpisode.primary_practitioner_id) {
      resource.careManager = {
        reference: `Practitioner/${dbEpisode.primary_practitioner_id}`,
        type: 'Practitioner'
      };
    }

    // Add care team if present
    if (dbEpisode.care_team_ids && dbEpisode.care_team_ids.length > 0) {
      resource.team = dbEpisode.care_team_ids.map(id => ({
        reference: `Practitioner/${id}`,
        type: 'Practitioner'
      }));
    }

    return resource;
  }

  /**
   * Convert database episode to simplified Episode object
   * @private
   */
  _toSimplifiedEpisode(dbEpisode, includeFHIR = false) {
    const episode = {
      id: dbEpisode.id,
      patientId: dbEpisode.patient_id,
      specialtySlug: dbEpisode.specialty_slug,
      status: dbEpisode.episode_state,
      period: {
        start: dbEpisode.start_at,
        end: dbEpisode.end_at || undefined
      },
      metadata: dbEpisode.metadata || {},
      createdAt: dbEpisode.created_at,
      updatedAt: dbEpisode.updated_at
    };

    if (dbEpisode.primary_practitioner_id) {
      episode.careManager = {
        id: dbEpisode.primary_practitioner_id,
        name: 'Unknown' // TODO: Fetch from practitioner table
      };
    }

    if (dbEpisode.care_team_ids && dbEpisode.care_team_ids.length > 0) {
      episode.careTeam = dbEpisode.care_team_ids.map(id => ({
        id,
        name: 'Unknown' // TODO: Fetch from practitioner table
      }));
    }

    if (includeFHIR) {
      episode.fhirResource = this._toFHIRResource(dbEpisode);
    }

    return episode;
  }

  /**
   * Create a new episode
   * @param {Object} data - Episode data
   * @param {string} data.patientId - Patient ID
   * @param {string} data.specialtySlug - Specialty pack slug
   * @param {string} data.orgId - Organization ID
   * @param {string} [data.status='active'] - Episode status
   * @param {string} [data.startDate] - Start date (ISO format)
   * @param {string} [data.careManagerId] - Care manager practitioner ID
   * @param {string[]} [data.careTeamIds] - Care team practitioner IDs
   * @param {Object} [data.metadata={}] - Specialty-specific metadata
   * @param {string} data.createdBy - User ID creating the episode
   * @returns {Promise<Object>} Created episode with FHIR resource
   */
  async createEpisode(data) {
    const {
      patientId,
      specialtySlug,
      orgId,
      status = 'active',
      startDate,
      careManagerId,
      careTeamIds = [],
      metadata = {},
      createdBy
    } = data;

    // Validate required fields
    if (!patientId || !specialtySlug || !orgId || !createdBy) {
      throw new Error('Missing required fields: patientId, specialtySlug, orgId, createdBy');
    }

    // Check if patient already has an active episode for this specialty
    const existingEpisode = await this.pool.query(
      `SELECT id FROM patient_specialty_episodes
       WHERE patient_id = $1 AND specialty_slug = $2 AND active = true`,
      [patientId, specialtySlug]
    );

    if (existingEpisode.rows.length > 0) {
      throw new Error(`Patient already has an active episode for specialty: ${specialtySlug}`);
    }

    const episodeId = uuidv4();
    const startAt = startDate || new Date().toISOString();
    const active = status === 'active' || status === 'planned';

    const result = await this.pool.query(
      `INSERT INTO patient_specialty_episodes
       (id, patient_id, org_id, specialty_slug, episode_state, start_at, active,
        metadata, primary_practitioner_id, care_team_ids, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
       RETURNING *`,
      [
        episodeId,
        patientId,
        orgId,
        specialtySlug,
        status,
        startAt,
        active,
        JSON.stringify(metadata),
        careManagerId || null,
        careTeamIds,
        createdBy
      ]
    );

    const episode = this._toSimplifiedEpisode(result.rows[0], true);

    return {
      success: true,
      episode,
      fhirResource: episode.fhirResource
    };
  }

  /**
   * Get episodes by patient ID
   * @param {string} patientId - Patient ID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.specialtySlug] - Filter by specialty
   * @param {string|string[]} [filters.status] - Filter by status
   * @param {boolean} [filters.activeOnly=false] - Only active episodes
   * @returns {Promise<Object[]>} Array of episodes
   */
  async getPatientEpisodes(patientId, filters = {}) {
    const { specialtySlug, status, activeOnly = false } = filters;

    let query = 'SELECT * FROM patient_specialty_episodes WHERE patient_id = $1';
    const params = [patientId];
    let paramIndex = 2;

    if (specialtySlug) {
      query += ` AND specialty_slug = $${paramIndex}`;
      params.push(specialtySlug);
      paramIndex++;
    }

    if (status) {
      if (Array.isArray(status)) {
        query += ` AND episode_state = ANY($${paramIndex})`;
        params.push(status);
      } else {
        query += ` AND episode_state = $${paramIndex}`;
        params.push(status);
      }
      paramIndex++;
    }

    if (activeOnly) {
      query += ' AND active = true';
    }

    query += ' ORDER BY start_at DESC';

    const result = await this.pool.query(query, params);

    return result.rows.map(row => this._toSimplifiedEpisode(row, false));
  }

  /**
   * Get episode by ID
   * @param {string} episodeId - Episode ID
   * @param {boolean} [includeFHIR=true] - Include FHIR resource
   * @returns {Promise<Object>} Episode
   */
  async getEpisodeById(episodeId, includeFHIR = true) {
    const result = await this.pool.query(
      'SELECT * FROM patient_specialty_episodes WHERE id = $1',
      [episodeId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Episode not found: ${episodeId}`);
    }

    return this._toSimplifiedEpisode(result.rows[0], includeFHIR);
  }

  /**
   * Update episode
   * @param {string} episodeId - Episode ID
   * @param {Object} updates - Updates to apply
   * @param {string} [updates.status] - New status
   * @param {string} [updates.endDate] - End date
   * @param {string} [updates.careManagerId] - Care manager ID
   * @param {string[]} [updates.careTeamIds] - Care team IDs
   * @param {Object} [updates.metadata] - Metadata updates (merged with existing)
   * @param {string} updatedBy - User ID updating the episode
   * @returns {Promise<Object>} Updated episode
   */
  async updateEpisode(episodeId, updates, updatedBy) {
    const {
      status,
      endDate,
      careManagerId,
      careTeamIds,
      metadata
    } = updates;

    // Get existing episode
    const existing = await this.getEpisodeById(episodeId, false);

    // Build update query
    const updateFields = [];
    const params = [episodeId];
    let paramIndex = 2;

    if (status !== undefined) {
      updateFields.push(`episode_state = $${paramIndex}`);
      params.push(status);
      paramIndex++;

      // Update active flag based on status
      const active = status === 'active' || status === 'planned';
      updateFields.push(`active = $${paramIndex}`);
      params.push(active);
      paramIndex++;
    }

    if (endDate !== undefined) {
      updateFields.push(`end_at = $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    if (careManagerId !== undefined) {
      updateFields.push(`primary_practitioner_id = $${paramIndex}`);
      params.push(careManagerId);
      paramIndex++;
    }

    if (careTeamIds !== undefined) {
      updateFields.push(`care_team_ids = $${paramIndex}`);
      params.push(careTeamIds);
      paramIndex++;
    }

    if (metadata !== undefined) {
      // Merge with existing metadata
      const mergedMetadata = { ...existing.metadata, ...metadata };
      updateFields.push(`metadata = $${paramIndex}`);
      params.push(JSON.stringify(mergedMetadata));
      paramIndex++;
    }

    updateFields.push(`updated_by = $${paramIndex}`);
    params.push(updatedBy);
    paramIndex++;

    if (updateFields.length === 0) {
      return existing;
    }

    const query = `
      UPDATE patient_specialty_episodes
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, params);

    return this._toSimplifiedEpisode(result.rows[0], true);
  }

  /**
   * Close episode
   * @param {string} episodeId - Episode ID
   * @param {string} [reason] - Closure reason
   * @param {string} updatedBy - User ID closing the episode
   * @returns {Promise<Object>} Closed episode
   */
  async closeEpisode(episodeId, reason, updatedBy) {
    const endDate = new Date().toISOString();
    const metadata = reason ? { closureReason: reason } : {};

    return this.updateEpisode(
      episodeId,
      {
        status: 'finished',
        endDate,
        metadata
      },
      updatedBy
    );
  }

  /**
   * Get active episodes by specialty
   * @param {string} orgId - Organization ID
   * @param {string} specialtySlug - Specialty slug
   * @returns {Promise<Object[]>} Active episodes
   */
  async getActiveEpisodesBySpecialty(orgId, specialtySlug) {
    const result = await this.pool.query(
      `SELECT * FROM patient_specialty_episodes
       WHERE org_id = $1 AND specialty_slug = $2 AND active = true
       ORDER BY start_at DESC`,
      [orgId, specialtySlug]
    );

    return result.rows.map(row => this._toSimplifiedEpisode(row, false));
  }

  /**
   * Get FHIR EpisodeOfCare resource by ID
   * @param {string} episodeId - Episode ID
   * @returns {Promise<Object>} FHIR EpisodeOfCare resource
   */
  async getFHIRResource(episodeId) {
    const result = await this.pool.query(
      'SELECT * FROM patient_specialty_episodes WHERE id = $1',
      [episodeId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Episode not found: ${episodeId}`);
    }

    return this._toFHIRResource(result.rows[0]);
  }
}

module.exports = EpisodeService;
