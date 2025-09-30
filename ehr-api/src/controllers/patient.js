const { v4: uuidv4 } = require('uuid');

class PatientController {
  // Search patients
  async search(db, query) {
    try {
      let whereClause = 'WHERE resource_type = $1 AND deleted = FALSE';
      let queryParams = ['Patient'];
      let paramIndex = 2;

      // Handle search parameters
      if (query.family) {
        whereClause += ` AND LOWER(resource_data->'name'->0->>'family') LIKE LOWER($${paramIndex})`;
        queryParams.push(`%${query.family}%`);
        paramIndex++;
      }

      if (query.given) {
        whereClause += ` AND resource_data->'name'->0->'given' ? $${paramIndex}`;
        queryParams.push(query.given);
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

      const limit = parseInt(query._count) || 20;
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
    } catch (error) {
      throw new Error(`Failed to search patients: ${error.message}`);
    }
  }

  // Read single patient
  async read(db, id) {
    try {
      const { rows } = await db.query(
        'SELECT resource_data FROM fhir_resources WHERE id = $1 AND resource_type = $2 AND deleted = FALSE',
        [id, 'Patient']
      );
      return rows.length > 0 ? rows[0].resource_data : null;
    } catch (error) {
      throw new Error(`Failed to read patient: ${error.message}`);
    }
  }

  // Create new patient
  async create(db, resourceData) {
    try {
      const id = resourceData.id || uuidv4();
      const now = new Date().toISOString();
      
      const patient = {
        ...resourceData,
        id,
        resourceType: 'Patient',
        meta: {
          versionId: '1',
          lastUpdated: now
        }
      };

      // Validate required fields
      if (!patient.name || !Array.isArray(patient.name) || patient.name.length === 0) {
        throw new Error('Patient must have at least one name');
      }

      // Ensure required name structure
      const name = patient.name[0];
      if (!name.family && (!name.given || name.given.length === 0)) {
        throw new Error('Patient name must have either family name or given name');
      }

      await db.query(
        `INSERT INTO fhir_resources (id, resource_type, version_id, resource_data, last_updated) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, 'Patient', '1', JSON.stringify(patient), now]
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, '1', 'Patient', JSON.stringify(patient), now, 'CREATE']
      );

      return patient;
    } catch (error) {
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  // Update patient
  async update(db, id, resourceData) {
    try {
      // Check if patient exists
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Patient not found');
      }

      const now = new Date().toISOString();
      const currentVersion = parseInt(existing.meta.versionId) || 1;
      const newVersion = (currentVersion + 1).toString();

      const updatedPatient = {
        ...resourceData,
        id,
        resourceType: 'Patient',
        meta: {
          versionId: newVersion,
          lastUpdated: now
        }
      };

      // Validate required fields
      if (!updatedPatient.name || !Array.isArray(updatedPatient.name) || updatedPatient.name.length === 0) {
        throw new Error('Patient must have at least one name');
      }

      await db.query(
        `UPDATE fhir_resources 
         SET resource_data = $1, version_id = $2, last_updated = $3
         WHERE id = $4 AND resource_type = $5`,
        [JSON.stringify(updatedPatient), newVersion, now, id, 'Patient']
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, newVersion, 'Patient', JSON.stringify(updatedPatient), now, 'UPDATE']
      );

      return updatedPatient;
    } catch (error) {
      throw new Error(`Failed to update patient: ${error.message}`);
    }
  }

  // Delete patient (soft delete)
  async delete(db, id) {
    try {
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Patient not found');
      }

      const now = new Date().toISOString();

      await db.query(
        `UPDATE fhir_resources 
         SET deleted = TRUE, last_updated = $1
         WHERE id = $2 AND resource_type = $3`,
        [now, id, 'Patient']
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, existing.meta.versionId, 'Patient', JSON.stringify(existing), now, 'DELETE']
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to delete patient: ${error.message}`);
    }
  }

  // Get patient history
  async history(db, id) {
    try {
      const { rows } = await db.query(
        `SELECT resource_data FROM fhir_resource_history 
         WHERE id = $1 AND resource_type = $2 
         ORDER BY last_updated DESC`,
        [id, 'Patient']
      );
      return rows.map(row => row.resource_data);
    } catch (error) {
      throw new Error(`Failed to get patient history: ${error.message}`);
    }
  }
}

module.exports = new PatientController();
