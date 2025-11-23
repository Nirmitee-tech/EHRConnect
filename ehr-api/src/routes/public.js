const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Controllers
const patientController = require('../controllers/patient');
const appointmentController = require('../controllers/appointment');
const practitionerController = require('../controllers/practitioner');
const formsService = require('../services/forms.service');

// Helper function to create FHIR OperationOutcome for errors
function createOperationOutcome(severity, code, message) {
  return {
    resourceType: 'OperationOutcome',
    issue: [{
      severity,
      code,
      details: { text: message }
    }]
  };
}

// Middleware to extract and validate org_id
function extractOrgId(req, res, next) {
  const orgId = req.query.org_id || req.body.org_id || req.headers['x-org-id'];

  if (!orgId) {
    return res.status(400).json({
      success: false,
      error: 'org_id is required. Please provide org_id as a query parameter, in the request body, or as x-org-id header.',
      example: '/api/public/v2/practitioners?org_id=YOUR_ORG_ID'
    });
  }

  req.orgId = orgId;
  next();
}

// Helper to filter resources by org
async function filterByOrg(db, resourceType, orgId) {
  const sql = `
    SELECT resource_data
    FROM fhir_resources
    WHERE resource_type = $1
      AND deleted = FALSE
      AND (
        resource_data->'managingOrganization'->>'reference' = $2
        OR resource_data->'managingOrganization'->>'reference' = $3
      )
    ORDER BY last_updated DESC
    LIMIT 100
  `;

  const { rows } = await db.query(sql, [resourceType, `Organization/${orgId}`, orgId]);
  return rows.map(row => row.resource_data);
}

// Helper to calculate slots for a single practitioner
async function calculatePractitionerSlots(db, practitioner, date) {
  // Parse office hours from extension
  const officeHoursExt = practitioner.extension?.find(e => e.url?.includes('office-hours'));
  let officeHours = [];
  if (officeHoursExt && officeHoursExt.valueString) {
    try {
      officeHours = JSON.parse(officeHoursExt.valueString);
    } catch (e) {
      console.error('Error parsing office hours:', e);
    }
  }

  // Get day of week for the requested date
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  const daySchedule = officeHours.find(h => h.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isWorking) {
    return {
      practitionerId: practitioner.id,
      practitionerName: practitioner.name?.[0] ?
        `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim() : 'Unknown',
      availableSlots: [],
      isWorking: false
    };
  }

  // Get existing appointments for this practitioner on this date
  const existingAppointments = await db.query(`
    SELECT resource_data
    FROM fhir_resources
    WHERE resource_type = 'Appointment'
      AND deleted = FALSE
      AND DATE(resource_data->>'start') = $1
      AND resource_data->'participant' @> $2::jsonb
      AND resource_data->>'status' NOT IN ('cancelled', 'noshow')
  `, [date, JSON.stringify([{ actor: { reference: `Practitioner/${practitioner.id}` } }])]);

  const bookedSlots = existingAppointments.rows.map(row => ({
    start: new Date(row.resource_data.start),
    end: new Date(row.resource_data.end || new Date(row.resource_data.start).getTime() + 30 * 60000)
  }));

  // Generate available slots (30-minute intervals)
  const availableSlots = [];
  const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
  const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

  const startTime = new Date(date);
  startTime.setHours(startHour, startMin, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);

  let currentSlot = new Date(startTime);
  const slotDuration = 30; // minutes

  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);

    // Check if this slot overlaps with any booked appointments
    const isBooked = bookedSlots.some(booked =>
      (currentSlot >= booked.start && currentSlot < booked.end) ||
      (slotEnd > booked.start && slotEnd <= booked.end) ||
      (currentSlot <= booked.start && slotEnd >= booked.end)
    );

    if (!isBooked) {
      availableSlots.push({
        start: currentSlot.toISOString(),
        end: slotEnd.toISOString(),
        duration: slotDuration
      });
    }

    currentSlot = slotEnd;
  }

  return {
    practitionerId: practitioner.id,
    practitionerName: practitioner.name?.[0] ?
      `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim() : 'Unknown',
    specialty: practitioner.qualification?.[0]?.code?.coding?.[0]?.display,
    phone: practitioner.telecom?.find(t => t.system === 'phone')?.value,
    workingHours: {
      start: daySchedule.startTime,
      end: daySchedule.endTime
    },
    availableSlots: availableSlots,
    totalSlots: availableSlots.length,
    isWorking: true
  };
}

// Helper to get slots for all practitioners
async function getAllPractitionersSlots(req, res, date) {
  try {
    // Get all active practitioners
    const sql = `
      SELECT resource_data
      FROM fhir_resources
      WHERE resource_type = 'Practitioner'
        AND deleted = FALSE
        AND (resource_data->>'active' = 'true' OR resource_data->>'active' IS NULL)
      ORDER BY last_updated DESC
      LIMIT 100
    `;
    const { rows } = await req.db.query(sql);
    const practitioners = rows.map(row => row.resource_data);

    // Calculate slots for each practitioner
    const practitionerSlots = await Promise.all(
      practitioners.map(practitioner => calculatePractitionerSlots(req.db, practitioner, date))
    );

    // Filter to only practitioners who are working and have slots
    const workingPractitioners = practitionerSlots.filter(p => p.isWorking && p.totalSlots > 0);

    // Calculate total slots across all practitioners
    const totalSlots = workingPractitioners.reduce((sum, p) => sum + p.totalSlots, 0);

    res.json({
      success: true,
      orgId: req.orgId,
      date: date,
      totalPractitioners: practitioners.length,
      workingPractitioners: workingPractitioners.length,
      totalAvailableSlots: totalSlots,
      practitioners: workingPractitioners
    });
  } catch (error) {
    console.error('Error fetching slots for all practitioners:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== PATIENT ENDPOINTS ====================

// Create a new patient
// POST /api/public/patients
router.post('/patients', async (req, res) => {
  try {
    const patient = await patientController.create(req.db, req.body);
    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      operationOutcome: createOperationOutcome('error', 'invalid', error.message)
    });
  }
});

// Get all patients (with optional search)
// GET /api/public/patients?family=Smith&given=John
router.get('/patients', async (req, res) => {
  try {
    const patients = await patientController.search(req.db, req.query);
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get a specific patient by ID
// GET /api/public/patients/:id
router.get('/patients/:id', async (req, res) => {
  try {
    const patient = await patientController.read(req.db, req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        operationOutcome: createOperationOutcome('error', 'not-found', `Patient with id ${req.params.id} not found`)
      });
    }
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error reading patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update a patient
// PUT /api/public/patients/:id
router.put('/patients/:id', async (req, res) => {
  try {
    const updatedPatient = await patientController.update(req.db, req.params.id, req.body);
    res.json({
      success: true,
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== APPOINTMENT ENDPOINTS ====================

// Create a new appointment
// POST /api/public/appointments
router.post('/appointments', async (req, res) => {
  try {
    const appointment = await appointmentController.create(req.db, req.body);
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      operationOutcome: createOperationOutcome('error', 'invalid', error.message)
    });
  }
});

// Get all appointments (with optional search)
// GET /api/public/appointments?patient=patient-id&status=booked&date=2024-01-15
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await appointmentController.search(req.db, req.query);
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error searching appointments:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get a specific appointment by ID
// GET /api/public/appointments/:id
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await appointmentController.read(req.db, req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
        operationOutcome: createOperationOutcome('error', 'not-found', `Appointment with id ${req.params.id} not found`)
      });
    }
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error reading appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update an appointment
// PUT /api/public/appointments/:id
router.put('/appointments/:id', async (req, res) => {
  try {
    const updatedAppointment = await appointmentController.update(req.db, req.params.id, req.body);

    // Extract org_id from the appointment extension
    const orgExtension = updatedAppointment.extension?.find(ext =>
      ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/appointment-organization'
    );
    const orgId = orgExtension?.valueReference?.reference?.replace('Organization/', '');

    // Broadcast real-time update
    if (orgId) {
      const socketService = require('../services/socket.service');
      const practitionerParticipant = updatedAppointment.participant?.find(p =>
        p.actor?.reference?.startsWith('Practitioner/')
      );
      const practitionerId = practitionerParticipant?.actor?.reference?.replace('Practitioner/', '');

      socketService.notifyAppointmentUpdated(orgId, {
        appointmentId: updatedAppointment.id,
        practitionerId: practitionerId,
        start: updatedAppointment.start,
        end: updatedAppointment.end,
        status: updatedAppointment.status,
        date: updatedAppointment.start?.split('T')[0]
      });
    }

    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel an appointment (update status to cancelled)
// POST /api/public/appointments/:id/cancel
router.post('/appointments/:id/cancel', async (req, res) => {
  try {
    const appointment = await appointmentController.read(req.db, req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const updatedAppointment = {
      ...appointment,
      status: 'cancelled',
      cancelationReason: req.body.reason || { text: 'Cancelled' }
    };

    const result = await appointmentController.update(req.db, req.params.id, updatedAppointment);

    // Extract org_id from the appointment extension
    const orgExtension = result.extension?.find(ext =>
      ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/appointment-organization'
    );
    const orgId = orgExtension?.valueReference?.reference?.replace('Organization/', '');

    // Broadcast real-time update
    if (orgId) {
      const socketService = require('../services/socket.service');
      const practitionerParticipant = result.participant?.find(p =>
        p.actor?.reference?.startsWith('Practitioner/')
      );
      const practitionerId = practitionerParticipant?.actor?.reference?.replace('Practitioner/', '');

      socketService.notifyAppointmentCancelled(orgId, {
        appointmentId: result.id,
        practitionerId: practitionerId,
        start: result.start,
        end: result.end,
        date: result.start?.split('T')[0]
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: result
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== DEPRECATED V1 ENDPOINTS ====================
// WARNING: These v1 endpoints lack multi-tenant org_id security
// Use v2 endpoints instead: /api/public/v2/*

// Simple appointment booking endpoint for VAPI/voice assistants
// POST /api/public/book-appointment
// DEPRECATED: Use POST /api/public/v2/book-appointment instead
router.post('/book-appointment', async (req, res) => {
  try {
    console.warn('[SECURITY WARNING] Deprecated v1 endpoint called: POST /api/public/book-appointment');

    const { patientId, practitionerId, startTime, endTime, appointmentType, reason } = req.body;

    // Validate required fields
    if (!patientId || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientId and startTime are required',
        deprecated: true,
        message: 'This endpoint is deprecated and lacks multi-tenant security. Use POST /api/public/v2/book-appointment'
      });
    }

    // WARNING: Create appointment resource WITHOUT org_id (SECURITY RISK!)
    const appointment = {
      resourceType: 'Appointment',
      status: 'booked',
      appointmentType: appointmentType ? {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
          code: appointmentType,
          display: appointmentType
        }]
      } : undefined,
      reasonCode: reason ? [{
        text: reason
      }] : undefined,
      start: startTime,
      end: endTime || new Date(new Date(startTime).getTime() + 30 * 60000).toISOString(), // Default 30 min
      participant: [
        {
          actor: {
            reference: `Patient/${patientId}`,
            display: 'Patient'
          },
          required: 'required',
          status: 'accepted'
        }
      ]
    };

    // Add practitioner if provided
    if (practitionerId) {
      appointment.participant.push({
        actor: {
          reference: `Practitioner/${practitionerId}`,
          display: 'Practitioner'
        },
        required: 'required',
        status: 'accepted'
      });
    }

    const createdAppointment = await appointmentController.create(req.db, appointment);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: createdAppointment.id,
      data: createdAppointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Health check for public API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      v1: {
        patients: {
          create: 'POST /api/public/patients',
          list: 'GET /api/public/patients',
          get: 'GET /api/public/patients/:id',
          update: 'PUT /api/public/patients/:id'
        },
        appointments: {
          create: 'POST /api/public/appointments',
          list: 'GET /api/public/appointments',
          get: 'GET /api/public/appointments/:id',
          update: 'PUT /api/public/appointments/:id',
          cancel: 'POST /api/public/appointments/:id/cancel',
          book: 'POST /api/public/book-appointment'
        }
      },
      v2: {
        note: 'V2 endpoints require org_id parameter',
        practitioners: 'GET /api/public/v2/practitioners?org_id=xxx',
        patients: 'GET /api/public/v2/patients?org_id=xxx',
        appointments: 'GET /api/public/v2/appointments?org_id=xxx',
        availableSlots: 'GET /api/public/v2/available-slots?org_id=xxx&practitioner_id=xxx&date=YYYY-MM-DD',
        checkPatient: 'GET /api/public/v2/check-patient?org_id=xxx&phone=xxx or &email=xxx',
        bookAppointment: 'POST /api/public/v2/book-appointment (with org_id in body)'
      }
    }
  });
});

// ==================== V2 ORG-BASED ENDPOINTS ====================

// ==================== WIDGET BOOKING ENDPOINTS ====================
// These endpoints support the public booking widget

// Get organization details by slug (for booking widget header/branding)
// GET /api/public/v2/widget/organization/:slug
router.get('/v2/widget/organization/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Query organization by slug from organizations table
    const sql = `
      SELECT id, name, slug, org_type, logo_url, specialties, settings
      FROM organizations
      WHERE slug = $1 AND status = 'active'
      LIMIT 1
    `;

    const { rows } = await req.db.query(sql, [slug]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
        slug: slug
      });
    }

    const org = rows[0];

    // Return simplified organization data for widget
    res.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        type: org.org_type,
        logo_url: org.logo_url,
        specialties: org.specialties || [],
        // Widget-specific settings (if configured)
        booking_settings: org.settings?.booking_settings || {
          enabled: true,
          require_reason: true,
          default_duration: 30,
          min_advance_hours: 2,
          max_advance_days: 90
        }
      }
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get appointment types for an organization
// GET /api/public/v2/widget/appointment-types?org_id=xxx
router.get('/v2/widget/appointment-types', extractOrgId, async (req, res) => {
  try {
    // Query organization-specific appointment types from settings or defaults
    const sql = `
      SELECT id, name, settings
      FROM organizations
      WHERE id = $1 AND status = 'active'
      LIMIT 1
    `;

    const { rows } = await req.db.query(sql, [req.orgId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const org = rows[0];

    // Get appointment types from org settings or use defaults
    const appointmentTypes = org.settings?.appointment_types || [
      { code: 'follow-up', display: 'Follow-up Visit', duration: 30, description: 'Follow-up appointment with your provider' },
      { code: 'new-patient', display: 'New Patient Visit', duration: 60, description: 'Comprehensive initial visit for new patients' },
      { code: 'annual-physical', display: 'Annual Physical', duration: 45, description: 'Yearly health checkup and physical examination' },
      { code: 'consultation', display: 'Consultation', duration: 30, description: 'General consultation with healthcare provider' },
      { code: 'urgent-care', display: 'Urgent Care', duration: 30, description: 'Same-day urgent medical care' }
    ];

    res.json({
      success: true,
      orgId: req.orgId,
      count: appointmentTypes.length,
      appointmentTypes: appointmentTypes
    });
  } catch (error) {
    console.error('Error fetching appointment types:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get locations for an organization
// GET /api/public/v2/widget/locations?org_id=xxx
router.get('/v2/widget/locations', extractOrgId, async (req, res) => {
  try {
    // Query FHIR Location resources for this organization
    const sql = `
      SELECT resource_data
      FROM fhir_resources
      WHERE resource_type = 'Location'
        AND deleted = FALSE
        AND resource_data->>'status' = 'active'
        AND (
          resource_data->'managingOrganization'->>'reference' = $1
          OR resource_data->'managingOrganization'->>'reference' = $2
        )
      ORDER BY resource_data->>'name' ASC
      LIMIT 50
    `;

    const { rows } = await req.db.query(sql, [`Organization/${req.orgId}`, req.orgId]);

    const locations = rows.map(row => {
      const loc = row.resource_data;
      return {
        id: loc.id,
        name: loc.name,
        description: loc.description,
        address: loc.address ? {
          line: loc.address.line?.join(', '),
          city: loc.address.city,
          state: loc.address.state,
          postalCode: loc.address.postalCode,
          country: loc.address.country
        } : null,
        phone: loc.telecom?.find(t => t.system === 'phone')?.value,
        type: loc.type?.[0]?.coding?.[0]?.display || 'Healthcare Facility'
      };
    });

    // If no locations found, return default
    if (locations.length === 0) {
      locations.push({
        id: 'default',
        name: 'Main Location',
        description: 'Primary healthcare facility',
        address: null,
        phone: null,
        type: 'Healthcare Facility'
      });
    }

    res.json({
      success: true,
      orgId: req.orgId,
      count: locations.length,
      locations: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get practitioners for booking widget (optionally filtered by provider slug)
// GET /api/public/v2/widget/practitioners?org_id=xxx&provider=dr-john-smith
// This is different from v2/practitioners as it's optimized for the booking widget
router.get('/v2/widget/practitioners', extractOrgId, async (req, res) => {
  try {
    const { provider } = req.query;

    let sql = `
      SELECT resource_data
      FROM fhir_resources
      WHERE resource_type = 'Practitioner'
        AND deleted = FALSE
        AND (resource_data->>'active' = 'true' OR resource_data->>'active' IS NULL)
    `;

    const queryParams = [];

    // If provider slug is specified, filter to that specific practitioner
    if (provider) {
      sql += ` AND resource_data->>'identifier' @> $1`;
      queryParams.push(JSON.stringify([{ system: 'slug', value: provider }]));
    }

    sql += ` ORDER BY last_updated DESC LIMIT 100`;

    const { rows } = await req.db.query(sql, queryParams);
    const practitioners = rows.map(row => row.resource_data);

    // Format for booking widget
    const formattedPractitioners = practitioners.map(p => ({
      id: p.id,
      name: p.name?.[0] ? `${p.name[0].given?.join(' ') || ''} ${p.name[0].family || ''}`.trim() : 'Unknown',
      firstName: p.name?.[0]?.given?.join(' '),
      lastName: p.name?.[0]?.family,
      qualification: p.qualification?.[0]?.code?.coding?.[0]?.display || 'Healthcare Provider',
      specialty: p.qualification?.[0]?.code?.coding?.[0]?.display,
      photo: p.photo?.[0]?.url,
      active: p.active !== false,
      // Generate initials for avatar
      initials: (() => {
        const firstName = p.name?.[0]?.given?.[0] || '';
        const lastName = p.name?.[0]?.family || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'P';
      })()
    }));

    res.json({
      success: true,
      orgId: req.orgId,
      provider: provider || null,
      count: formattedPractitioners.length,
      practitioners: formattedPractitioners
    });
  } catch (error) {
    console.error('Error fetching practitioners for widget:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available slots for booking widget (with provider slots count)
// GET /api/public/v2/widget/slots?org_id=xxx&date=YYYY-MM-DD&provider=xxx (optional)
router.get('/v2/widget/slots', extractOrgId, async (req, res) => {
  try {
    const { date, provider: practitionerId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'date parameter is required (format: YYYY-MM-DD)',
        example: '/api/public/v2/widget/slots?org_id=xxx&date=2025-10-27'
      });
    }

    // Reuse the existing slots logic
    if (!practitionerId) {
      return await getAllPractitionersSlots(req, res, date);
    }

    // Get specific practitioner's slots
    const result = await calculatePractitionerSlots(req.db,
      await practitionerController.read(req.db, practitionerId),
      date
    );

    res.json({
      success: true,
      orgId: req.orgId,
      date: date,
      practitioner: result
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create or find patient for booking widget
// POST /api/public/v2/widget/check-or-create-patient
router.post('/v2/widget/check-or-create-patient', extractOrgId, async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'name, email, and phone are required'
      });
    }

    // Check if patient exists by email or phone
    const existingPatients = await filterByOrg(req.db, 'Patient', req.orgId);
    const matchedPatient = existingPatients.find(p => {
      const hasEmail = p.telecom?.some(t =>
        t.system === 'email' && t.value?.toLowerCase() === email.toLowerCase()
      );
      const hasPhone = p.telecom?.some(t =>
        t.system === 'phone' && t.value?.replace(/\D/g, '').includes(phone.replace(/\D/g, ''))
      );
      return hasEmail || hasPhone;
    });

    if (matchedPatient) {
      return res.json({
        success: true,
        exists: true,
        patient: {
          id: matchedPatient.id,
          name: matchedPatient.name?.[0] ?
            `${matchedPatient.name[0].given?.join(' ') || ''} ${matchedPatient.name[0].family || ''}`.trim() : 'Unknown',
          email: matchedPatient.telecom?.find(t => t.system === 'email')?.value,
          phone: matchedPatient.telecom?.find(t => t.system === 'phone')?.value,
          birthDate: matchedPatient.birthDate
        }
      });
    }

    // Create new patient
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const patientData = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        family: lastName,
        given: [firstName]
      }],
      telecom: [
        { system: 'phone', value: phone, use: 'mobile' },
        { system: 'email', value: email, use: 'home' }
      ],
      birthDate: dob,
      managingOrganization: {
        reference: `Organization/${req.orgId}`
      }
    };

    const newPatient = await patientController.create(req.db, patientData);

    res.status(201).json({
      success: true,
      exists: false,
      created: true,
      patient: {
        id: newPatient.id,
        name: newPatient.name?.[0] ?
          `${newPatient.name[0].given?.join(' ') || ''} ${newPatient.name[0].family || ''}`.trim() : 'Unknown',
        email: newPatient.telecom?.find(t => t.system === 'email')?.value,
        phone: newPatient.telecom?.find(t => t.system === 'phone')?.value,
        birthDate: newPatient.birthDate
      }
    });
  } catch (error) {
    console.error('Error checking/creating patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== END WIDGET ENDPOINTS ====================

// Get all practitioners for an organization
// GET /api/public/v2/practitioners?org_id=xxx
// Note: Practitioners are available to all orgs (they can work across multiple organizations)
router.get('/v2/practitioners', extractOrgId, async (req, res) => {
  try {
    // Get all active practitioners (they're not org-specific in this system)
    const sql = `
      SELECT resource_data
      FROM fhir_resources
      WHERE resource_type = 'Practitioner'
        AND deleted = FALSE
        AND (resource_data->>'active' = 'true' OR resource_data->>'active' IS NULL)
      ORDER BY last_updated DESC
      LIMIT 100
    `;
    const { rows } = await req.db.query(sql);
    const practitioners = rows.map(row => row.resource_data);

    // Extract simplified data for VAPI
    const simplifiedPractitioners = practitioners.map(p => ({
      id: p.id,
      name: p.name?.[0] ? `${p.name[0].given?.join(' ') || ''} ${p.name[0].family || ''}`.trim() : 'Unknown',
      phone: p.telecom?.find(t => t.system === 'phone')?.value,
      email: p.telecom?.find(t => t.system === 'email')?.value,
      active: p.active !== false,
      specialty: p.qualification?.[0]?.code?.coding?.[0]?.display,
      // Extract office hours from extension
      officeHours: p.extension?.find(e => e.url?.includes('office-hours'))?.valueString,
      fullResource: p
    }));

    res.json({
      success: true,
      orgId: req.orgId,
      count: simplifiedPractitioners.length,
      practitioners: simplifiedPractitioners
    });
  } catch (error) {
    console.error('Error fetching practitioners:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all patients for an organization
// GET /api/public/v2/patients?org_id=xxx&phone=xxx or &email=xxx
router.get('/v2/patients', extractOrgId, async (req, res) => {
  try {
    let patients = await filterByOrg(req.db, 'Patient', req.orgId);

    // Filter by phone or email if provided
    const { phone, email } = req.query;
    if (phone || email) {
      patients = patients.filter(p => {
        if (phone && p.telecom?.some(t => t.system === 'phone' && t.value?.includes(phone))) {
          return true;
        }
        if (email && p.telecom?.some(t => t.system === 'email' && t.value?.toLowerCase() === email.toLowerCase())) {
          return true;
        }
        return false;
      });
    }

    const simplifiedPatients = patients.map(p => ({
      id: p.id,
      name: p.name?.[0] ? `${p.name[0].given?.join(' ') || ''} ${p.name[0].family || ''}`.trim() : 'Unknown',
      phone: p.telecom?.find(t => t.system === 'phone')?.value,
      email: p.telecom?.find(t => t.system === 'email')?.value,
      birthDate: p.birthDate,
      gender: p.gender,
      fullResource: p
    }));

    res.json({
      success: true,
      orgId: req.orgId,
      count: simplifiedPatients.length,
      patients: simplifiedPatients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if patient exists by multiple criteria
// GET /api/public/v2/check-patient?org_id=xxx&phone=xxx
// GET /api/public/v2/check-patient?org_id=xxx&email=xxx
// GET /api/public/v2/check-patient?org_id=xxx&name=John+Smith
// GET /api/public/v2/check-patient?org_id=xxx&birthdate=1990-01-15
// GET /api/public/v2/check-patient?org_id=xxx&phone=555-1234&name=John
router.get('/v2/check-patient', extractOrgId, async (req, res) => {
  try {
    const { phone, email, name, family, given, birthdate, identifier } = req.query;

    // Check if at least one search criteria is provided
    if (!phone && !email && !name && !family && !given && !birthdate && !identifier) {
      return res.status(400).json({
        success: false,
        error: 'At least one search parameter must be provided',
        supportedParams: {
          phone: 'Patient phone number (partial match)',
          email: 'Patient email (exact match)',
          name: 'Full name search (partial match)',
          family: 'Family/last name (partial match)',
          given: 'Given/first name (partial match)',
          birthdate: 'Birth date (YYYY-MM-DD)',
          identifier: 'Patient identifier/MRN'
        }
      });
    }

    let patients = await filterByOrg(req.db, 'Patient', req.orgId);

    // Apply filters
    patients = patients.filter(p => {
      let matches = true;

      // Phone filter (partial match)
      if (phone) {
        const hasPhone = p.telecom?.some(t =>
          t.system === 'phone' &&
          t.value?.replace(/\D/g, '').includes(phone.replace(/\D/g, ''))
        );
        if (!hasPhone) matches = false;
      }

      // Email filter (exact match, case insensitive)
      if (email) {
        const hasEmail = p.telecom?.some(t =>
          t.system === 'email' &&
          t.value?.toLowerCase() === email.toLowerCase()
        );
        if (!hasEmail) matches = false;
      }

      // Full name filter (partial match)
      if (name) {
        const fullName = p.name?.[0] ?
          `${p.name[0].given?.join(' ') || ''} ${p.name[0].family || ''}`.toLowerCase() : '';
        if (!fullName.includes(name.toLowerCase())) matches = false;
      }

      // Family name filter (partial match)
      if (family) {
        const familyName = p.name?.[0]?.family?.toLowerCase() || '';
        if (!familyName.includes(family.toLowerCase())) matches = false;
      }

      // Given name filter (partial match)
      if (given) {
        const givenNames = p.name?.[0]?.given?.map(n => n.toLowerCase()).join(' ') || '';
        if (!givenNames.includes(given.toLowerCase())) matches = false;
      }

      // Birth date filter (exact match)
      if (birthdate) {
        if (p.birthDate !== birthdate) matches = false;
      }

      // Identifier filter (partial match)
      if (identifier) {
        const hasIdentifier = p.identifier?.some(id =>
          id.value?.toLowerCase().includes(identifier.toLowerCase())
        );
        if (!hasIdentifier) matches = false;
      }

      return matches;
    });

    if (patients.length > 0) {
      // Return all matches (could be multiple)
      const matchedPatients = patients.map(patient => ({
        id: patient.id,
        name: patient.name?.[0] ?
          `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() : 'Unknown',
        phone: patient.telecom?.find(t => t.system === 'phone')?.value,
        email: patient.telecom?.find(t => t.system === 'email')?.value,
        birthDate: patient.birthDate,
        gender: patient.gender,
        identifier: patient.identifier?.[0]?.value,
        address: patient.address?.[0] ? {
          line: patient.address[0].line?.join(', '),
          city: patient.address[0].city,
          state: patient.address[0].state,
          postalCode: patient.address[0].postalCode
        } : null
      }));

      res.json({
        success: true,
        exists: true,
        count: matchedPatients.length,
        patients: matchedPatients,
        // For backwards compatibility, also return single patient
        patient: matchedPatients[0]
      });
    } else {
      res.json({
        success: true,
        exists: false,
        count: 0,
        message: 'No patients found matching the criteria. You may create a new patient.',
        searchCriteria: { phone, email, name, family, given, birthdate, identifier }
      });
    }
  } catch (error) {
    console.error('Error checking patient:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get appointments for an organization
// GET /api/public/v2/appointments?org_id=xxx&patient_id=xxx&date=YYYY-MM-DD&status=booked
router.get('/v2/appointments', extractOrgId, async (req, res) => {
  try {
    // CRITICAL: Use appointment controller with org_id for multi-tenant data isolation
    const { patient_id, practitioner_id, date, status, _count, _offset } = req.query;

    const query = {
      patient: patient_id,
      practitioner: practitioner_id,
      date,
      status,
      _count: _count || '100',
      _offset: _offset || '0'
    };

    // Use controller with org_id filtering
    const appointments = await appointmentController.search(req.db, query, req.orgId);

    const simplifiedAppointments = appointments.map(a => ({
      id: a.id,
      status: a.status,
      start: a.start,
      end: a.end,
      duration: a.minutesDuration,
      reason: a.reasonCode?.[0]?.text || a.comment,
      patient: a.participant?.find(p => p.actor?.reference?.startsWith('Patient/'))?.actor,
      practitioner: a.participant?.find(p => p.actor?.reference?.startsWith('Practitioner/'))?.actor,
      fullResource: a
    }));

    res.json({
      success: true,
      orgId: req.orgId,
      count: simplifiedAppointments.length,
      appointments: simplifiedAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available time slots for a practitioner (or all practitioners)
// GET /api/public/v2/available-slots?org_id=xxx&practitioner_id=xxx&date=YYYY-MM-DD
// GET /api/public/v2/available-slots?org_id=xxx&date=YYYY-MM-DD (all practitioners)
router.get('/v2/available-slots', extractOrgId, async (req, res) => {
  try {
    const { practitioner_id, date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'date is required (format: YYYY-MM-DD)'
      });
    }

    // If no practitioner_id, get slots for all practitioners
    if (!practitioner_id) {
      return await getAllPractitionersSlots(req, res, date);
    }

    // Get specific practitioner's office hours
    const practitioner = await practitionerController.read(req.db, practitioner_id);
    if (!practitioner) {
      return res.status(404).json({
        success: false,
        error: 'Practitioner not found'
      });
    }

    // Parse office hours from extension
    const officeHoursExt = practitioner.extension?.find(e => e.url?.includes('office-hours'));
    let officeHours = [];
    if (officeHoursExt && officeHoursExt.valueString) {
      try {
        officeHours = JSON.parse(officeHoursExt.valueString);
      } catch (e) {
        console.error('Error parsing office hours:', e);
      }
    }

    // Get day of week for the requested date
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();
    const daySchedule = officeHours.find(h => h.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isWorking) {
      return res.json({
        success: true,
        orgId: req.orgId,
        practitionerId: practitioner_id,
        date: date,
        availableSlots: [],
        message: 'Practitioner is not working on this day'
      });
    }

    // Get existing appointments for this practitioner on this date
    const existingAppointments = await req.db.query(`
      SELECT resource_data
      FROM fhir_resources
      WHERE resource_type = 'Appointment'
        AND deleted = FALSE
        AND DATE(resource_data->>'start') = $1
        AND resource_data->'participant' @> $2::jsonb
        AND resource_data->>'status' NOT IN ('cancelled', 'noshow')
    `, [date, JSON.stringify([{ actor: { reference: `Practitioner/${practitioner_id}` } }])]);

    const bookedSlots = existingAppointments.rows.map(row => ({
      start: new Date(row.resource_data.start),
      end: new Date(row.resource_data.end || new Date(row.resource_data.start).getTime() + 30 * 60000)
    }));

    // Generate available slots (30-minute intervals)
    const availableSlots = [];
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    let currentSlot = new Date(startTime);
    const slotDuration = 30; // minutes

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);

      // Check if this slot overlaps with any booked appointments
      const isBooked = bookedSlots.some(booked =>
        (currentSlot >= booked.start && currentSlot < booked.end) ||
        (slotEnd > booked.start && slotEnd <= booked.end) ||
        (currentSlot <= booked.start && slotEnd >= booked.end)
      );

      if (!isBooked) {
        availableSlots.push({
          start: currentSlot.toISOString(),
          end: slotEnd.toISOString(),
          duration: slotDuration
        });
      }

      currentSlot = slotEnd;
    }

    res.json({
      success: true,
      orgId: req.orgId,
      practitionerId: practitioner_id,
      practitionerName: practitioner.name?.[0] ?
        `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim() : 'Unknown',
      date: date,
      workingHours: {
        start: daySchedule.startTime,
        end: daySchedule.endTime
      },
      totalSlots: availableSlots.length,
      availableSlots: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Book appointment (V2 - org-aware)
// POST /api/public/v2/book-appointment
router.post('/v2/book-appointment', extractOrgId, async (req, res) => {
  try {
    const { patientId, practitionerId, startTime, endTime, appointmentType, reason } = req.body;

    if (!patientId || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'patientId and startTime are required'
      });
    }

    // Verify patient belongs to this org
    const patient = await patientController.read(req.db, patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const patientOrgRef = patient.managingOrganization?.reference;
    if (patientOrgRef !== `Organization/${req.orgId}` && patientOrgRef !== req.orgId) {
      return res.status(403).json({
        success: false,
        error: 'Patient does not belong to this organization'
      });
    }

    // If practitioner specified, verify they belong to this org
    if (practitionerId) {
      const practitioner = await practitionerController.read(req.db, practitionerId);
      if (!practitioner) {
        return res.status(404).json({
          success: false,
          error: 'Practitioner not found'
        });
      }
    }

    // Create appointment (org_id will be added by controller)
    const appointment = {
      resourceType: 'Appointment',
      status: 'booked',
      appointmentType: appointmentType ? {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
          code: appointmentType,
          display: appointmentType
        }]
      } : undefined,
      reasonCode: reason ? [{
        text: reason
      }] : undefined,
      start: startTime,
      end: endTime || new Date(new Date(startTime).getTime() + 30 * 60000).toISOString(),
      participant: [
        {
          actor: {
            reference: `Patient/${patientId}`,
            display: patient.name?.[0] ?
              `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() : 'Patient'
          },
          required: 'required',
          status: 'accepted'
        }
      ]
    };

    if (practitionerId) {
      const practitioner = await practitionerController.read(req.db, practitionerId);
      appointment.participant.push({
        actor: {
          reference: `Practitioner/${practitionerId}`,
          display: practitioner.name?.[0] ?
            `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim() : 'Practitioner'
        },
        required: 'required',
        status: 'accepted'
      });
    }

    // CRITICAL: Pass org_id for multi-tenant data isolation
    const createdAppointment = await appointmentController.create(req.db, appointment, req.orgId);

    // Broadcast real-time update to booking widgets
    const socketService = require('../services/socket.service');
    socketService.notifyAppointmentCreated(req.orgId, {
      appointmentId: createdAppointment.id,
      practitionerId: practitionerId,
      start: createdAppointment.start,
      end: createdAppointment.end,
      date: createdAppointment.start.split('T')[0] // Extract date for slot refresh
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      orgId: req.orgId,
      appointmentId: createdAppointment.id,
      appointment: {
        id: createdAppointment.id,
        status: createdAppointment.status,
        start: createdAppointment.start,
        end: createdAppointment.end,
        patient: createdAppointment.participant?.find(p => p.actor?.reference?.startsWith('Patient/')),
        practitioner: createdAppointment.participant?.find(p => p.actor?.reference?.startsWith('Practitioner/'))
      },
      fullResource: createdAppointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Create patient (V2 - org-aware) - STREAMLINED for VAPI
// POST /api/public/v2/patients
// Accepts simple fields and builds FHIR structure automatically
// Required: firstName, lastName, phone
// Optional: email, birthDate, gender, address (street, city, state, zip)
router.post('/v2/patients', extractOrgId, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      birthDate,
      gender,
      street,
      city,
      state,
      zip,
      country = 'USA'
    } = req.body;

    // Validate required fields
    if (!firstName && !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Either firstName or lastName is required',
        example: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '555-123-4567',
          email: 'john@example.com',
          birthDate: '1990-01-15',
          gender: 'male',
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        }
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        example: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '555-123-4567'
        }
      });
    }

    // Build FHIR-compliant patient resource automatically
    const patientData = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        family: lastName,
        given: firstName ? [firstName] : []
      }],
      telecom: [
        {
          system: 'phone',
          value: phone,
          use: 'mobile'
        }
      ],
      managingOrganization: {
        reference: `Organization/${req.orgId}`
      }
    };

    // Add optional fields if provided
    if (email) {
      patientData.telecom.push({
        system: 'email',
        value: email,
        use: 'home'
      });
    }

    if (birthDate) {
      patientData.birthDate = birthDate;
    }

    if (gender) {
      patientData.gender = gender.toLowerCase();
    }

    // Add address if any address field is provided
    if (street || city || state || zip) {
      patientData.address = [{
        use: 'home',
        type: 'both',
        line: street ? [street] : [],
        city: city || '',
        state: state || '',
        postalCode: zip || '',
        country: country
      }];
    }

    const patient = await patientController.create(req.db, patientData);

    res.status(201).json({
      success: true,
      orgId: req.orgId,
      patient: {
        id: patient.id,
        name: patient.name?.[0] ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() : 'Unknown',
        phone: patient.telecom?.find(t => t.system === 'phone')?.value,
        email: patient.telecom?.find(t => t.system === 'email')?.value,
        birthDate: patient.birthDate,
        gender: patient.gender,
        address: patient.address?.[0] ? {
          street: patient.address[0].line?.join(', '),
          city: patient.address[0].city,
          state: patient.address[0].state,
          zip: patient.address[0].postalCode
        } : null
      },
      fullResource: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== PUBLIC FORM ENDPOINTS ====================

// Get form template by ID (public)
// GET /api/public/v2/forms/templates/:id?org_id=xxx
router.get('/v2/forms/templates/:id', extractOrgId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await formsService.getTemplate(id, req.orgId);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting public form template:', error);
    res.status(error.message === 'Form template not found' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit form response (public)
// POST /api/public/v2/forms/responses?org_id=xxx
router.post('/v2/forms/responses', extractOrgId, async (req, res) => {
  try {
    // Pass null as userId for public submissions
    // The service should handle null userId (e.g. for submitted_by)
    const response = await formsService.createResponse(req.orgId, null, req.body);
    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error submitting public form response:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
