const { v4: uuidv4 } = require('uuid');

class PractitionerController {
  // Search practitioners
  async search(db, query) {
    try {
      let whereClause = 'WHERE resource_type = $1 AND deleted = FALSE';
      let queryParams = ['Practitioner'];
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
      throw new Error(`Failed to search practitioners: ${error.message}`);
    }
  }

  // Read single practitioner
  async read(db, id) {
    try {
      const { rows } = await db.query(
        'SELECT resource_data FROM fhir_resources WHERE id = $1 AND resource_type = $2 AND deleted = FALSE',
        [id, 'Practitioner']
      );
      return rows.length > 0 ? rows[0].resource_data : null;
    } catch (error) {
      throw new Error(`Failed to read practitioner: ${error.message}`);
    }
  }

  // Create new practitioner
  async create(db, resourceData) {
    try {
      const id = resourceData.id || uuidv4();
      const now = new Date().toISOString();
      
      const practitioner = {
        ...resourceData,
        id,
        resourceType: 'Practitioner',
        meta: {
          versionId: '1',
          lastUpdated: now
        }
      };

      await db.query(
        `INSERT INTO fhir_resources (id, resource_type, version_id, resource_data, last_updated) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, 'Practitioner', '1', JSON.stringify(practitioner), now]
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, '1', 'Practitioner', JSON.stringify(practitioner), now, 'CREATE']
      );

      return practitioner;
    } catch (error) {
      throw new Error(`Failed to create practitioner: ${error.message}`);
    }
  }

  // Update practitioner
  async update(db, id, resourceData) {
    try {
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Practitioner not found');
      }

      const now = new Date().toISOString();
      const currentVersion = parseInt(existing.meta.versionId) || 1;
      const newVersion = (currentVersion + 1).toString();

      const updatedPractitioner = {
        ...resourceData,
        id,
        resourceType: 'Practitioner',
        meta: {
          versionId: newVersion,
          lastUpdated: now
        }
      };

      await db.query(
        `UPDATE fhir_resources 
         SET resource_data = $1, version_id = $2, last_updated = $3
         WHERE id = $4 AND resource_type = $5`,
        [JSON.stringify(updatedPractitioner), newVersion, now, id, 'Practitioner']
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, newVersion, 'Practitioner', JSON.stringify(updatedPractitioner), now, 'UPDATE']
      );

      return updatedPractitioner;
    } catch (error) {
      throw new Error(`Failed to update practitioner: ${error.message}`);
    }
  }

  // Delete practitioner (soft delete)
  async delete(db, id) {
    try {
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Practitioner not found');
      }

      const now = new Date().toISOString();

      await db.query(
        `UPDATE fhir_resources 
         SET deleted = TRUE, last_updated = $1
         WHERE id = $2 AND resource_type = $3`,
        [now, id, 'Practitioner']
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, existing.meta.versionId, 'Practitioner', JSON.stringify(existing), now, 'DELETE']
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to delete practitioner: ${error.message}`);
    }
  }

  // Get practitioner history
  async history(db, id) {
    try {
      const { rows } = await db.query(
        `SELECT resource_data FROM fhir_resource_history 
         WHERE id = $1 AND resource_type = $2 
         ORDER BY last_updated DESC`,
        [id, 'Practitioner']
      );
      return rows.map(row => row.resource_data);
    } catch (error) {
      throw new Error(`Failed to get practitioner history: ${error.message}`);
    }
  }
}

module.exports = new PractitionerController();
