const db = require('../database/connection');
// const { createAuditEvent } = require('./audit.service'); // Audit service not implemented yet

/**
 * Helper function to validate and sanitize userId for UUID fields
 * Returns null if userId is not a valid UUID (e.g., if it's an email)
 */
function sanitizeUserId(userId) {
  if (!userId) return null;
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId) ? userId : null;
}

/**
 * Bed Management Service
 * Handles all bed management, hospitalization, and inpatient operations
 */

// =====================================================
// WARD MANAGEMENT
// =====================================================

/**
 * Get all wards for an organization/location
 */
async function getWards(orgId, locationId = null, filters = {}) {
  try {
    let query = `
      SELECT
        w.*,
        u.name as head_nurse_name,
        COUNT(b.id) FILTER (WHERE b.active = true) as total_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'occupied' AND b.active = true) as occupied_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'available' AND b.active = true) as available_beds
      FROM wards w
      LEFT JOIN users u ON w.head_nurse_id = u.id
      LEFT JOIN beds b ON b.ward_id = w.id
      WHERE w.org_id = $1
    `;

    const params = [orgId];
    let paramIndex = 2;

    if (locationId) {
      query += ` AND w.location_id = $${paramIndex}`;
      params.push(locationId);
      paramIndex++;
    }

    if (filters.active !== undefined) {
      query += ` AND w.active = $${paramIndex}`;
      params.push(filters.active);
      paramIndex++;
    }

    if (filters.wardType) {
      query += ` AND w.ward_type = $${paramIndex}`;
      params.push(filters.wardType);
      paramIndex++;
    }

    query += `
      GROUP BY w.id, u.name
      ORDER BY w.name ASC
    `;

    const result = await db.query(query, params);
    // Transform snake_case to camelCase for frontend
    return result.rows.map(row => ({
      ...row,
      capacity: row.total_capacity,
      floor: row.floor_number,
      floorNumber: row.floor_number,
      totalCapacity: row.total_capacity
    }));
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw error;
  }
}

/**
 * Get a single ward by ID
 */
async function getWardById(wardId, orgId) {
  try {
    const query = `
      SELECT
        w.*,
        u.name as head_nurse_name,
        COUNT(b.id) FILTER (WHERE b.active = true) as total_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'occupied' AND b.active = true) as occupied_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'available' AND b.active = true) as available_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'reserved' AND b.active = true) as reserved_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'cleaning' AND b.active = true) as cleaning_beds
      FROM wards w
      LEFT JOIN users u ON w.head_nurse_id = u.id
      LEFT JOIN beds b ON b.ward_id = w.id
      WHERE w.id = $1 AND w.org_id = $2
      GROUP BY w.id, u.name
    `;

    const result = await db.query(query, [wardId, orgId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching ward:', error);
    throw error;
  }
}

/**
 * Create a new ward
 */
async function createWard(orgId, userId, wardData) {
  try {
    const query = `
      INSERT INTO wards (
        org_id, location_id, department_id, name, code, ward_type,
        specialty, floor_number, building, description, total_capacity, head_nurse_id,
        gender_restriction, age_restriction, active, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      orgId,
      wardData.locationId,
      wardData.departmentId || null,
      wardData.name,
      wardData.code,
      wardData.wardType,
      wardData.specialty || null,
      wardData.floorNumber || null,
      wardData.building || null,
      wardData.description || null,
      wardData.capacity || 0,
      wardData.headNurseId || null,
      wardData.genderRestriction || 'none',
      wardData.ageRestriction || 'none',
      wardData.active !== undefined ? wardData.active : true,
      wardData.notes || null,
      sanitizeUserId(userId)
    ];

    const result = await db.query(query, values);

    // Create audit event
    // TODO: Implement audit service
    // await createAuditEvent(orgId, userId, {
    //   action: 'WARD.CREATED',
    //   targetType: 'Ward',
    //   targetId: result.rows[0].id,
    //   targetName: wardData.name,
    //   metadata: { wardData }
    // });

    return result.rows[0];
  } catch (error) {
    console.error('Error creating ward:', error);
    throw error;
  }
}

/**
 * Update a ward
 */
async function updateWard(wardId, orgId, userId, wardData) {
  try {
    const updateFields = [];
    const values = [wardId, orgId];
    let valueIndex = 3;

    const allowedFields = [
      'name', 'ward_type', 'specialty', 'floor_number', 'building',
      'description', 'head_nurse_id', 'gender_restriction',
      'age_restriction', 'active', 'notes'
    ];

    allowedFields.forEach(field => {
      if (wardData[field] !== undefined) {
        updateFields.push(`${field} = $${valueIndex}`);
        values.push(wardData[field]);
        valueIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE wards
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND org_id = $2
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Ward not found');
    }

    await createAuditEvent(orgId, userId, {
      action: 'WARD.UPDATED',
      targetType: 'Ward',
      targetId: wardId,
      targetName: result.rows[0].name,
      metadata: { changes: wardData }
    });

    return result.rows[0];
  } catch (error) {
    console.error('Error updating ward:', error);
    throw error;
  }
}

// =====================================================
// BED MANAGEMENT
// =====================================================

/**
 * Get all beds with filters
 */
async function getBeds(orgId, filters = {}) {
  try {
    let query = `
      SELECT
        b.*,
        w.name as ward_name,
        w.ward_type,
        r.room_number,
        h.patient_name as current_patient_name
      FROM beds b
      INNER JOIN wards w ON b.ward_id = w.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hospitalizations h ON b.current_admission_id = h.id AND h.status = 'admitted'
      WHERE b.org_id = $1
    `;

    const params = [orgId];
    let paramIndex = 2;

    if (filters.locationId) {
      query += ` AND b.location_id = $${paramIndex}`;
      params.push(filters.locationId);
      paramIndex++;
    }

    if (filters.wardId) {
      query += ` AND b.ward_id = $${paramIndex}`;
      params.push(filters.wardId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.bedType) {
      query += ` AND b.bed_type = $${paramIndex}`;
      params.push(filters.bedType);
      paramIndex++;
    }

    if (filters.active !== undefined) {
      query += ` AND b.active = $${paramIndex}`;
      params.push(filters.active);
      paramIndex++;
    }

    query += ` ORDER BY w.name, b.bed_number ASC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching beds:', error);
    throw error;
  }
}

/**
 * Get a single bed by ID
 */
async function getBedById(bedId, orgId) {
  try {
    const query = `
      SELECT
        b.*,
        w.name as ward_name,
        w.ward_type,
        w.floor_number as ward_floor,
        r.room_number,
        h.id as hospitalization_id,
        h.patient_id,
        h.patient_name as current_patient_name,
        h.patient_mrn,
        h.admission_date,
        h.attending_doctor_name
      FROM beds b
      INNER JOIN wards w ON b.ward_id = w.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hospitalizations h ON b.current_admission_id = h.id AND h.status = 'admitted'
      WHERE b.id = $1 AND b.org_id = $2
    `;

    const result = await db.query(query, [bedId, orgId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching bed:', error);
    throw error;
  }
}

/**
 * Create a new bed
 */
async function createBed(orgId, userId, bedData) {
  try {
    // Get location_id from the ward
    const wardQuery = `SELECT location_id FROM wards WHERE id = $1 AND org_id = $2`;
    const wardResult = await db.query(wardQuery, [bedData.wardId, orgId]);

    if (wardResult.rows.length === 0) {
      throw new Error('Ward not found');
    }

    const locationId = wardResult.rows[0].location_id;

    const query = `
      INSERT INTO beds (
        org_id, location_id, ward_id, room_id, bed_number, bed_type,
        has_oxygen, has_suction, has_monitor, has_iv_pole, is_electric,
        gender_restriction, active, notes, status, status_updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      orgId,
      locationId, // Use location_id from ward
      bedData.wardId,
      bedData.roomId || null,
      bedData.bedNumber,
      bedData.bedType,
      bedData.hasOxygen || false,
      bedData.hasSuction || false,
      bedData.hasMonitor || false,
      bedData.hasIvPole || false,
      bedData.isElectric || false,
      bedData.genderRestriction || 'none',
      bedData.active !== undefined ? bedData.active : true,
      bedData.notes || null,
      'available',
      sanitizeUserId(userId)
    ];

    const result = await db.query(query, values);

    // TODO: Implement audit service
    // await createAuditEvent(orgId, userId, {
    //   action: 'BED.CREATED',
    //   targetType: 'Bed',
    //   targetId: result.rows[0].id,
    //   targetName: bedData.bedNumber,
    //   metadata: { bedData }
    // });

    return result.rows[0];
  } catch (error) {
    console.error('Error creating bed:', error);
    throw error;
  }
}

/**
 * Update bed status
 */
async function updateBedStatus(bedId, orgId, userId, status, notes = null) {
  try {
    const query = `
      UPDATE beds
      SET status = $1,
          status_updated_at = CURRENT_TIMESTAMP,
          status_updated_by = $2,
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND org_id = $5
      RETURNING *
    `;

    const result = await db.query(query, [status, userId, notes, bedId, orgId]);

    if (result.rows.length === 0) {
      throw new Error('Bed not found');
    }

    await createAuditEvent(orgId, userId, {
      action: 'BED.STATUS_CHANGED',
      targetType: 'Bed',
      targetId: bedId,
      targetName: result.rows[0].bed_number,
      metadata: { newStatus: status, notes }
    });

    return result.rows[0];
  } catch (error) {
    console.error('Error updating bed status:', error);
    throw error;
  }
}

// =====================================================
// HOSPITALIZATION MANAGEMENT
// =====================================================

/**
 * Get all hospitalizations
 */
async function getHospitalizations(orgId, filters = {}) {
  try {
    let query = `
      SELECT
        h.*,
        b.bed_number,
        w.name as ward_name,
        w.ward_type,
        r.room_number
      FROM hospitalizations h
      LEFT JOIN beds b ON h.current_bed_id = b.id
      LEFT JOIN wards w ON h.current_ward_id = w.id
      LEFT JOIN rooms r ON h.current_room_id = r.id
      WHERE h.org_id = $1
    `;

    const params = [orgId];
    let paramIndex = 2;

    if (filters.locationId) {
      query += ` AND h.location_id = $${paramIndex}`;
      params.push(filters.locationId);
      paramIndex++;
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query += ` AND h.status = ANY($${paramIndex})`;
        params.push(filters.status);
      } else {
        query += ` AND h.status = $${paramIndex}`;
        params.push(filters.status);
      }
      paramIndex++;
    }

    if (filters.wardId) {
      query += ` AND h.current_ward_id = $${paramIndex}`;
      params.push(filters.wardId);
      paramIndex++;
    }

    if (filters.attendingDoctorId) {
      query += ` AND h.attending_doctor_id = $${paramIndex}`;
      params.push(filters.attendingDoctorId);
      paramIndex++;
    }

    if (filters.patientId) {
      query += ` AND h.patient_id = $${paramIndex}`;
      params.push(filters.patientId);
      paramIndex++;
    }

    query += ` ORDER BY h.admission_date DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching hospitalizations:', error);
    throw error;
  }
}

/**
 * Get a single hospitalization by ID
 */
async function getHospitalizationById(hospitalizationId, orgId) {
  try {
    const query = `
      SELECT
        h.*,
        b.bed_number,
        b.bed_type,
        w.name as ward_name,
        w.ward_type,
        w.floor_number as ward_floor,
        r.room_number,
        r.room_type
      FROM hospitalizations h
      LEFT JOIN beds b ON h.current_bed_id = b.id
      LEFT JOIN wards w ON h.current_ward_id = w.id
      LEFT JOIN rooms r ON h.current_room_id = r.id
      WHERE h.id = $1 AND h.org_id = $2
    `;

    const result = await db.query(query, [hospitalizationId, orgId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching hospitalization:', error);
    throw error;
  }
}

/**
 * Admit a patient (create hospitalization)
 */
async function admitPatient(orgId, userId, admissionData) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Create hospitalization record
    const hospitalizationQuery = `
      INSERT INTO hospitalizations (
        org_id, location_id, patient_id, patient_name, patient_mrn,
        admission_date, admission_type, admission_source, admission_reason,
        chief_complaint, primary_diagnosis, primary_diagnosis_code,
        admitting_practitioner_id, admitting_practitioner_name,
        attending_doctor_id, attending_doctor_name,
        primary_nurse_id, primary_nurse_name,
        priority, isolation_required, isolation_type,
        special_requirements, diet_requirements, allergies,
        insurance_info, pre_authorization_number,
        status, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `;

    const hospitalizationValues = [
      orgId,
      admissionData.locationId,
      admissionData.patientId,
      admissionData.patientName,
      admissionData.patientMrn || null,
      admissionData.admissionDate,
      admissionData.admissionType,
      admissionData.admissionSource || null,
      admissionData.admissionReason,
      admissionData.chiefComplaint || null,
      admissionData.primaryDiagnosis || null,
      admissionData.primaryDiagnosisCode || null,
      admissionData.admittingPractitionerId || userId,
      admissionData.admittingPractitionerName || null,
      admissionData.attendingDoctorId || null,
      admissionData.attendingDoctorName || null,
      admissionData.primaryNurseId || null,
      admissionData.primaryNurseName || null,
      admissionData.priority || 'routine',
      admissionData.isolationRequired || false,
      admissionData.isolationType || null,
      admissionData.specialRequirements || null,
      admissionData.dietRequirements || null,
      admissionData.allergies || null,
      admissionData.insuranceInfo ? JSON.stringify(admissionData.insuranceInfo) : null,
      admissionData.preAuthorizationNumber || null,
      'admitted',
      admissionData.notes || null,
      userId
    ];

    const hospitalizationResult = await client.query(hospitalizationQuery, hospitalizationValues);
    const hospitalization = hospitalizationResult.rows[0];

    // Assign bed if provided
    if (admissionData.bedId) {
      await assignBedToPatient(
        client,
        orgId,
        userId,
        hospitalization.id,
        admissionData.patientId,
        admissionData.bedId
      );
    }

    await client.query('COMMIT');

    await createAuditEvent(orgId, userId, {
      action: 'PATIENT.ADMITTED',
      targetType: 'Hospitalization',
      targetId: hospitalization.id,
      targetName: admissionData.patientName,
      metadata: { admissionData }
    });

    return hospitalization;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error admitting patient:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Assign bed to patient (internal helper)
 */
async function assignBedToPatient(client, orgId, userId, hospitalizationId, patientId, bedId) {
  // Get bed and ward info
  const bedQuery = await client.query(
    'SELECT ward_id, room_id FROM beds WHERE id = $1 AND org_id = $2',
    [bedId, orgId]
  );

  if (bedQuery.rows.length === 0) {
    throw new Error('Bed not found');
  }

  const bed = bedQuery.rows[0];

  // Mark previous assignment as not current
  await client.query(
    'UPDATE bed_assignments SET is_current = false WHERE hospitalization_id = $1 AND is_current = true',
    [hospitalizationId]
  );

  // Create new bed assignment
  const assignmentQuery = `
    INSERT INTO bed_assignments (
      org_id, hospitalization_id, patient_id, bed_id, ward_id, room_id,
      assigned_by, is_current
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    RETURNING *
  `;

  await client.query(assignmentQuery, [
    orgId,
    hospitalizationId,
    patientId,
    bedId,
    bed.ward_id,
    bed.room_id,
    userId
  ]);

  // Update hospitalization with current bed
  await client.query(
    `UPDATE hospitalizations
     SET current_bed_id = $1, current_ward_id = $2, current_room_id = $3, bed_assigned_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [bedId, bed.ward_id, bed.room_id, hospitalizationId]
  );
}

/**
 * Assign bed to hospitalization (public API)
 */
async function assignBed(orgId, userId, hospitalizationId, bedId, notes = null) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Get hospitalization
    const hospQuery = await client.query(
      'SELECT patient_id, patient_name FROM hospitalizations WHERE id = $1 AND org_id = $2',
      [hospitalizationId, orgId]
    );

    if (hospQuery.rows.length === 0) {
      throw new Error('Hospitalization not found');
    }

    const hosp = hospQuery.rows[0];

    await assignBedToPatient(client, orgId, userId, hospitalizationId, hosp.patient_id, bedId);

    await client.query('COMMIT');

    await createAuditEvent(orgId, userId, {
      action: 'BED.ASSIGNED',
      targetType: 'BedAssignment',
      targetId: bedId,
      targetName: hosp.patient_name,
      metadata: { hospitalizationId, bedId, notes }
    });

    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning bed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Discharge patient
 */
async function dischargePatient(orgId, userId, hospitalizationId, dischargeData) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const query = `
      UPDATE hospitalizations
      SET status = 'discharged',
          discharge_date = $1,
          discharge_type = $2,
          discharge_practitioner_id = $3,
          discharge_practitioner_name = $4,
          discharge_summary = $5,
          discharge_diagnosis = $6,
          discharge_diagnosis_code = $7,
          discharge_instructions = $8,
          discharge_disposition = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND org_id = $11
      RETURNING *
    `;

    const values = [
      dischargeData.dischargeDate,
      dischargeData.dischargeType,
      userId,
      dischargeData.dischargePractitionerName || null,
      dischargeData.dischargeSummary || null,
      dischargeData.dischargeDiagnosis || null,
      dischargeData.dischargeDiagnosisCode || null,
      dischargeData.dischargeInstructions || null,
      dischargeData.dischargeDisposition || null,
      hospitalizationId,
      orgId
    ];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Hospitalization not found');
    }

    // Release current bed assignment
    await client.query(
      `UPDATE bed_assignments
       SET is_current = false, released_at = CURRENT_TIMESTAMP, released_by = $1, release_reason = 'discharge'
       WHERE hospitalization_id = $2 AND is_current = true`,
      [userId, hospitalizationId]
    );

    await client.query('COMMIT');

    await createAuditEvent(orgId, userId, {
      action: 'PATIENT.DISCHARGED',
      targetType: 'Hospitalization',
      targetId: hospitalizationId,
      targetName: result.rows[0].patient_name,
      metadata: { dischargeData }
    });

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error discharging patient:', error);
    throw error;
  } finally {
    client.release();
  }
}

// =====================================================
// DASHBOARD & ANALYTICS
// =====================================================

/**
 * Get bed occupancy statistics
 */
async function getBedOccupancyStats(orgId, locationId = null) {
  try {
    let query = `
      SELECT
        COUNT(*) as total_beds,
        COUNT(*) FILTER (WHERE status = 'occupied') as occupied_beds,
        COUNT(*) FILTER (WHERE status = 'available') as available_beds,
        COUNT(*) FILTER (WHERE status = 'reserved') as reserved_beds,
        COUNT(*) FILTER (WHERE status = 'cleaning') as cleaning_beds,
        COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_beds,
        COUNT(*) FILTER (WHERE status = 'out_of_service') as out_of_service_beds
      FROM beds
      WHERE org_id = $1 AND active = true
    `;

    const params = [orgId];

    if (locationId) {
      query += ` AND location_id = $2`;
      params.push(locationId);
    }

    const result = await db.query(query, params);
    const stats = result.rows[0];

    stats.occupancy_rate = stats.total_beds > 0
      ? (parseInt(stats.occupied_beds) / parseInt(stats.total_beds) * 100).toFixed(2)
      : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching bed occupancy stats:', error);
    throw error;
  }
}

/**
 * Get ward occupancy data
 */
async function getWardOccupancy(orgId, locationId = null) {
  try {
    let query = `
      SELECT
        w.id as ward_id,
        w.name as ward_name,
        w.ward_type,
        COUNT(b.id) as total_beds,
        COUNT(b.id) FILTER (WHERE b.status = 'occupied') as occupied,
        COUNT(b.id) FILTER (WHERE b.status = 'available') as available
      FROM wards w
      LEFT JOIN beds b ON b.ward_id = w.id AND b.active = true
      WHERE w.org_id = $1 AND w.active = true
    `;

    const params = [orgId];

    if (locationId) {
      query += ` AND w.location_id = $2`;
      params.push(locationId);
    }

    query += `
      GROUP BY w.id, w.name, w.ward_type
      ORDER BY w.name ASC
    `;

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      ...row,
      occupancy_rate: row.total_beds > 0
        ? (parseInt(row.occupied) / parseInt(row.total_beds) * 100).toFixed(2)
        : 0
    }));
  } catch (error) {
    console.error('Error fetching ward occupancy:', error);
    throw error;
  }
}

/**
 * Get hospitalization summary
 */
async function getHospitalizationSummary(orgId, locationId = null) {
  try {
    let query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pre_admit') as pre_admit,
        COUNT(*) FILTER (WHERE status = 'admitted') as admitted,
        COUNT(*) FILTER (WHERE status = 'discharged' AND discharge_date >= CURRENT_DATE - INTERVAL '30 days') as discharged_last_30_days,
        AVG(los_days) FILTER (WHERE status = 'discharged' AND los_days IS NOT NULL) as average_los
      FROM hospitalizations
      WHERE org_id = $1
    `;

    const params = [orgId];

    if (locationId) {
      query += ` AND location_id = $2`;
      params.push(locationId);
    }

    const result = await db.query(query, params);
    const summary = result.rows[0];

    // Calculate occupancy rate
    const bedStats = await getBedOccupancyStats(orgId, locationId);
    summary.occupancy_rate = bedStats.occupancy_rate;

    return summary;
  } catch (error) {
    console.error('Error fetching hospitalization summary:', error);
    throw error;
  }
}

module.exports = {
  // Ward management
  getWards,
  getWardById,
  createWard,
  updateWard,

  // Bed management
  getBeds,
  getBedById,
  createBed,
  updateBedStatus,

  // Hospitalization management
  getHospitalizations,
  getHospitalizationById,
  admitPatient,
  assignBed,
  dischargePatient,

  // Analytics
  getBedOccupancyStats,
  getWardOccupancy,
  getHospitalizationSummary
};
