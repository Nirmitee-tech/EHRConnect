const { v4: uuidv4 } = require('uuid');

class AppointmentController {
  // Search appointments
  async search(db, query) {
    try {
      let whereClause = 'WHERE resource_type = $1 AND deleted = FALSE';
      let queryParams = ['Appointment'];
      let paramIndex = 2;

      // Handle search parameters
      if (query.patient) {
        whereClause += ` AND resource_data->'participant' @> $${paramIndex}::jsonb`;
        queryParams.push(JSON.stringify([{ actor: { reference: `Patient/${query.patient}` } }]));
        paramIndex++;
      }

      if (query.practitioner) {
        whereClause += ` AND resource_data->'participant' @> $${paramIndex}::jsonb`;
        queryParams.push(JSON.stringify([{ actor: { reference: `Practitioner/${query.practitioner}` } }]));
        paramIndex++;
      }

      // Handle generic actor parameter (can be Patient/ or Practitioner/)
      if (query.actor) {
        whereClause += ` AND resource_data->'participant' @> $${paramIndex}::jsonb`;
        queryParams.push(JSON.stringify([{ actor: { reference: query.actor } }]));
        paramIndex++;
      }

      if (query.status) {
        whereClause += ` AND resource_data->>'status' = $${paramIndex}`;
        queryParams.push(query.status);
        paramIndex++;
      }

      if (query.date) {
        // Handle FHIR date search format: "ge2025-10-22T18:30:00.000Z,le2025-10-23T18:29:59.999Z"
        const dateValue = query.date;

        if (dateValue.includes(',')) {
          // Range query with both ge (greater or equal) and le (less or equal)
          const parts = dateValue.split(',');
          let startDate, endDate;

          for (const part of parts) {
            if (part.startsWith('ge')) {
              startDate = part.substring(2); // Remove 'ge' prefix
            } else if (part.startsWith('le')) {
              endDate = part.substring(2); // Remove 'le' prefix
            }
          }

          if (startDate && endDate) {
            whereClause += ` AND (resource_data->>'start')::timestamp >= $${paramIndex}::timestamp AND (resource_data->>'start')::timestamp <= $${paramIndex + 1}::timestamp`;
            queryParams.push(startDate, endDate);
            paramIndex += 2;
          }
        } else if (dateValue.startsWith('ge')) {
          // Greater than or equal
          whereClause += ` AND (resource_data->>'start')::timestamp >= $${paramIndex}::timestamp`;
          queryParams.push(dateValue.substring(2));
          paramIndex++;
        } else if (dateValue.startsWith('le')) {
          // Less than or equal
          whereClause += ` AND (resource_data->>'start')::timestamp <= $${paramIndex}::timestamp`;
          queryParams.push(dateValue.substring(2));
          paramIndex++;
        } else {
          // Exact date match
          whereClause += ` AND DATE(resource_data->>'start') = $${paramIndex}`;
          queryParams.push(dateValue);
          paramIndex++;
        }
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
      throw new Error(`Failed to search appointments: ${error.message}`);
    }
  }

  // Read single appointment
  async read(db, id) {
    try {
      const { rows } = await db.query(
        'SELECT resource_data FROM fhir_resources WHERE id = $1 AND resource_type = $2 AND deleted = FALSE',
        [id, 'Appointment']
      );
      return rows.length > 0 ? rows[0].resource_data : null;
    } catch (error) {
      throw new Error(`Failed to read appointment: ${error.message}`);
    }
  }

  // Create new appointment
  async create(db, resourceData) {
    try {
      const id = resourceData.id || uuidv4();
      const now = new Date().toISOString();

      const appointment = {
        ...resourceData,
        id,
        resourceType: 'Appointment',
        meta: {
          versionId: '1',
          lastUpdated: now
        }
      };

      // Set default status if not provided
      if (!appointment.status) {
        appointment.status = 'proposed';
      }

      // Validate required fields
      if (!appointment.participant || !Array.isArray(appointment.participant) || appointment.participant.length === 0) {
        throw new Error('Appointment must have at least one participant');
      }

      // Ensure start time
      if (!appointment.start) {
        throw new Error('Appointment must have a start time');
      }

      const query = `
        INSERT INTO fhir_resources (id, resource_type, resource_data, version_id, last_updated)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      await db.query(query, [
        id,
        'Appointment',
        JSON.stringify(appointment),
        1,
        now
      ]);

      return appointment;
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  // Update appointment
  async update(db, id, resourceData) {
    try {
      // Check if appointment exists
      const existing = await this.read(db, id);
      if (!existing) {
        throw new Error('Appointment not found');
      }

      const now = new Date().toISOString();
      const currentVersion = parseInt(existing.meta.versionId);
      const newVersion = currentVersion + 1;

      const updatedAppointment = {
        ...resourceData,
        id,
        resourceType: 'Appointment',
        meta: {
          versionId: String(newVersion),
          lastUpdated: now
        }
      };

      const query = `
        UPDATE fhir_resources
        SET resource_data = $1, version_id = $2, last_updated = $3
        WHERE id = $4 AND resource_type = $5 AND deleted = FALSE
        RETURNING *
      `;

      const { rows } = await db.query(query, [
        JSON.stringify(updatedAppointment),
        newVersion,
        now,
        id,
        'Appointment'
      ]);

      if (rows.length === 0) {
        throw new Error('Failed to update appointment');
      }

      return updatedAppointment;
    } catch (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }
  }

  // Delete appointment (soft delete)
  async delete(db, id) {
    try {
      const query = `
        UPDATE fhir_resources
        SET deleted = TRUE, last_updated = $1
        WHERE id = $2 AND resource_type = $3 AND deleted = FALSE
        RETURNING id
      `;

      const { rows } = await db.query(query, [
        new Date().toISOString(),
        id,
        'Appointment'
      ]);

      if (rows.length === 0) {
        throw new Error('Appointment not found');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete appointment: ${error.message}`);
    }
  }

  // Get appointment history
  async history(db, id) {
    try {
      const query = `
        SELECT resource_data
        FROM fhir_resources
        WHERE id = $1 AND resource_type = $2
        ORDER BY version_id DESC
      `;

      const { rows } = await db.query(query, [id, 'Appointment']);
      return rows.map(row => row.resource_data);
    } catch (error) {
      throw new Error(`Failed to get appointment history: ${error.message}`);
    }
  }
}

module.exports = new AppointmentController();
