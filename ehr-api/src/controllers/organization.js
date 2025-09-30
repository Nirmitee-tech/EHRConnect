const { v4: uuidv4 } = require('uuid');

class OrganizationController {
  // Search organizations
  async search(db, query) {
    try {
      let whereClause = 'WHERE resource_type = $1 AND deleted = FALSE';
      let queryParams = ['Organization'];
      let paramIndex = 2;

      // Handle search parameters
      if (query.name) {
        whereClause += ` AND resource_data->'name' ? $${paramIndex}`;
        queryParams.push(query.name);
        paramIndex++;
      }

      if (query.identifier) {
        whereClause += ` AND resource_data->'identifier' @> $${paramIndex}::jsonb`;
        queryParams.push(JSON.stringify([{ value: query.identifier }]));
        paramIndex++;
      }

      if (query.type) {
        whereClause += ` AND resource_data->'type' @> $${paramIndex}::jsonb`;
        queryParams.push(JSON.stringify([{ coding: [{ code: query.type }] }]));
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
      throw new Error(`Failed to search organizations: ${error.message}`);
    }
  }

  // Read single organization
  async read(db, id) {
    try {
      const { rows } = await db.query(
        'SELECT resource_data FROM fhir_resources WHERE id = $1 AND resource_type = $2 AND deleted = FALSE',
        [id, 'Organization']
      );
      return rows.length > 0 ? rows[0].resource_data : null;
    } catch (error) {
      throw new Error(`Failed to read organization: ${error.message}`);
    }
  }

  // Create new organization
  async create(db, resourceData) {
    try {
      const id = resourceData.id || uuidv4();
      const now = new Date().toISOString();
      
      const organization = {
        ...resourceData,
        id,
        resourceType: 'Organization',
        meta: {
          versionId: '1',
          lastUpdated: now
        }
      };

      // Validate required fields
      if (!organization.name) {
        throw new Error('Organization name is required');
      }

      await db.query(
        `INSERT INTO fhir_resources (id, resource_type, version_id, resource_data, last_updated) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, 'Organization', '1', JSON.stringify(organization), now]
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, '1', 'Organization', JSON.stringify(organization), now, 'CREATE']
      );

      return organization;
    } catch (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }
  }

  // Update organization
  async update(db, id, resourceData) {
    try {
      // Check if organization exists
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Organization not found');
      }

      const now = new Date().toISOString();
      const currentVersion = parseInt(existing.meta.versionId) || 1;
      const newVersion = (currentVersion + 1).toString();

      const updatedOrganization = {
        ...resourceData,
        id,
        resourceType: 'Organization',
        meta: {
          versionId: newVersion,
          lastUpdated: now
        }
      };

      // Validate required fields
      if (!updatedOrganization.name) {
        throw new Error('Organization name is required');
      }

      await db.query(
        `UPDATE fhir_resources 
         SET resource_data = $1, version_id = $2, last_updated = $3
         WHERE id = $4 AND resource_type = $5`,
        [JSON.stringify(updatedOrganization), newVersion, now, id, 'Organization']
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, newVersion, 'Organization', JSON.stringify(updatedOrganization), now, 'UPDATE']
      );

      return updatedOrganization;
    } catch (error) {
      throw new Error(`Failed to update organization: ${error.message}`);
    }
  }

  // Delete organization (soft delete)
  async delete(db, id) {
    try {
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Organization not found');
      }

      const now = new Date().toISOString();

      await db.query(
        `UPDATE fhir_resources 
         SET deleted = TRUE, last_updated = $1
         WHERE id = $2 AND resource_type = $3`,
        [now, id, 'Organization']
      );

      // Save to history
      await db.query(
        `INSERT INTO fhir_resource_history (id, version_id, resource_type, resource_data, last_updated, method) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, existing.meta.versionId, 'Organization', JSON.stringify(existing), now, 'DELETE']
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to delete organization: ${error.message}`);
    }
  }

  // Get organization history
  async history(db, id) {
    try {
      const { rows } = await db.query(
        `SELECT resource_data FROM fhir_resource_history 
         WHERE id = $1 AND resource_type = $2 
         ORDER BY last_updated DESC`,
        [id, 'Organization']
      );
      return rows.map(row => row.resource_data);
    } catch (error) {
      throw new Error(`Failed to get organization history: ${error.message}`);
    }
  }
}

module.exports = new OrganizationController();
