const { Pool } = require('pg');
const crypto = require('crypto');
const hundredMSHandler = require('../integrations/100ms.handler');

/**
 * Virtual Meetings Service
 * FHIR-first approach for managing telehealth virtual meetings using 100ms
 */
class VirtualMeetingsService {
  constructor(pool) {
    this.pool = pool || require('../database/connection').pool;
  }

  /**
   * Generate a short meeting code for easy access
   */
  generateMeetingCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create an instant meeting (no appointment required)
   * @param {Object} params - Meeting parameters
   * @returns {Object} Meeting details with public link
   */
  async createInstantMeeting(params) {
    const {
      orgId,
      hostPractitionerId,
      patientId,
      displayName = 'Instant Consultation',
      recordingEnabled = false,
      createdBy
    } = params;

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get 100ms integration for the organization
      const integration = await this.get100msIntegration(orgId);

      if (!integration) {
        throw new Error('100ms integration not configured for this organization');
      }

      // Generate unique meeting code
      const meetingCode = await this.generateUniqueMeetingCode();

      // Create room in 100ms
      const roomParams = {
        name: `Instant Meeting - ${meetingCode}`,
        description: displayName,
        templateId: integration.credentials.templateId
      };

      const roomResult = await hundredMSHandler.execute(integration, 'createRoom', roomParams);

      // Generate URLs
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const roomUrl = `${baseUrl}/meeting/${meetingCode}`;
      const publicLink = `${baseUrl}/join/${meetingCode}`;

      // Create meeting record
      const insertQuery = `
        INSERT INTO virtual_meetings (
          org_id,
          meeting_id,
          meeting_code,
          room_url,
          public_link,
          host_practitioner_id,
          patient_id,
          status,
          room_details,
          template_id,
          recording_enabled,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        orgId,
        roomResult.id,
        meetingCode,
        roomUrl,
        publicLink,
        hostPractitionerId,
        patientId,
        'scheduled',
        JSON.stringify(roomResult),
        roomResult.template_id,
        recordingEnabled,
        createdBy
      ];

      const result = await client.query(insertQuery, values);
      const meeting = result.rows[0];

      // Create host auth token
      if (hostPractitionerId) {
        await this.createParticipantToken(
          meeting.id,
          hostPractitionerId,
          'practitioner',
          'Host',
          'host',
          integration
        );
      }

      // Log event
      await this.logMeetingEvent(
        meeting.id,
        'meeting_created',
        { method: 'instant', createdBy },
        createdBy,
        'user',
        client
      );

      await client.query('COMMIT');

      return this.formatMeetingResponse(meeting);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating instant meeting:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a meeting for an existing appointment
   * @param {UUID} appointmentId - FHIR Appointment ID
   * @param {Object} params - Additional parameters
   * @returns {Object} Meeting details
   */
  async createMeetingForAppointment(appointmentId, params) {
    const { orgId, recordingEnabled = false, createdBy } = params;

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get appointment details
      const appointmentQuery = `
        SELECT
          id,
          resource_data,
          org_id,
          resource_data->'participant'->0->'actor'->>'reference' as practitioner_ref,
          resource_data->'participant'->1->'actor'->>'reference' as patient_ref
        FROM fhir_resources
        WHERE id = $1 AND org_id = $2 AND resource_type = 'Appointment'
      `;

      const appointmentResult = await client.query(appointmentQuery, [appointmentId, orgId]);

      if (appointmentResult.rows.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentResult.rows[0];

      // Parse resource_data if it's a string
      const appointmentResource = typeof appointment.resource_data === 'string'
        ? JSON.parse(appointment.resource_data)
        : appointment.resource_data;

      // Extract IDs from FHIR references (e.g., "Patient/123" -> "123")
      appointment.practitioner_id = appointment.practitioner_ref?.split('/')[1];
      appointment.patient_id = appointment.patient_ref?.split('/')[1];

      // Check if meeting already exists
      const existingMeeting = await client.query(
        'SELECT * FROM virtual_meetings WHERE appointment_id = $1',
        [appointmentId]
      );

      if (existingMeeting.rows.length > 0) {
        return this.formatMeetingResponse(existingMeeting.rows[0]);
      }

      // Get 100ms integration
      const integration = await this.get100msIntegration(orgId);

      if (!integration) {
        throw new Error('100ms integration not configured');
      }

      // Generate meeting code
      const meetingCode = await this.generateUniqueMeetingCode();

      // Create room in 100ms
      const roomParams = {
        name: `Appointment ${appointmentResource.identifier?.[0]?.value || appointmentResource.id || meetingCode}`,
        description: appointmentResource.description || 'Telehealth Consultation',
        templateId: integration.credentials.templateId
      };

      const roomResult = await hundredMSHandler.execute(integration, 'createRoom', roomParams);

      // Generate URLs
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const roomUrl = `${baseUrl}/meeting/${meetingCode}`;
      const publicLink = `${baseUrl}/join/${meetingCode}`;

      // Create meeting record
      const insertQuery = `
        INSERT INTO virtual_meetings (
          appointment_id,
          org_id,
          meeting_id,
          meeting_code,
          room_url,
          public_link,
          host_practitioner_id,
          patient_id,
          status,
          room_details,
          template_id,
          recording_enabled,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        appointmentId,
        orgId,
        roomResult.id,
        meetingCode,
        roomUrl,
        publicLink,
        appointment.practitioner_id,
        appointment.patient_id,
        'scheduled',
        JSON.stringify(roomResult),
        roomResult.template_id,
        recordingEnabled,
        createdBy
      ];

      const result = await client.query(insertQuery, values);
      const meeting = result.rows[0];

      // Update appointment to include meeting link
      await client.query(
        `UPDATE fhir_resources
         SET resource_data = jsonb_set(resource_data, '{telehealth}', $1::jsonb, true),
             last_updated = CURRENT_TIMESTAMP
         WHERE id = $2 AND resource_type = 'Appointment'`,
        [
          JSON.stringify({
            enabled: true,
            meetingCode: meetingCode,
            publicLink: publicLink
          }),
          appointmentId
        ]
      );

      // Log event
      await this.logMeetingEvent(
        meeting.id,
        'meeting_created',
        { appointmentId, createdBy },
        createdBy,
        'user',
        client
      );

      await client.query('COMMIT');

      return this.formatMeetingResponse(meeting);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating meeting for appointment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate auth token for a participant
   * @returns {Object} Auth token details
   */
  async createParticipantToken(meetingId, userId, userType, displayName, role, integration) {
    const client = await this.pool.connect();

    try {
      // Get meeting details
      const meetingQuery = await client.query(
        'SELECT * FROM virtual_meetings WHERE id = $1',
        [meetingId]
      );

      if (meetingQuery.rows.length === 0) {
        throw new Error('Meeting not found');
      }

      const meeting = meetingQuery.rows[0];

      // Generate auth token from 100ms
      const tokenParams = {
        roomId: meeting.meeting_id,
        userId: userId || `guest_${Date.now()}`,
        role: role,
        type: 'app'
      };

      const tokenResult = await hundredMSHandler.execute(
        integration || await this.get100msIntegration(meeting.org_id),
        'createAuthToken',
        tokenParams
      );

      // Store participant record
      const insertQuery = `
        INSERT INTO virtual_meeting_participants (
          meeting_id,
          user_id,
          user_type,
          display_name,
          auth_token,
          role
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        meetingId,
        userId,
        userType,
        displayName,
        tokenResult.token,
        role
      ]);

      return {
        ...result.rows[0],
        token: tokenResult.token
      };
    } catch (error) {
      console.error('Error creating participant token:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Join a meeting using meeting code (public access)
   * @param {String} meetingCode - Meeting code
   * @param {Object} guestInfo - Guest information
   * @returns {Object} Meeting details and auth token
   */
  async joinMeetingByCode(meetingCode, guestInfo) {
    const { displayName = 'Guest', userId = null, userType = 'guest' } = guestInfo;

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Find meeting by code
      const meetingQuery = await client.query(
        'SELECT * FROM virtual_meetings WHERE meeting_code = $1 AND status IN ($2, $3)',
        [meetingCode, 'scheduled', 'active']
      );

      if (meetingQuery.rows.length === 0) {
        throw new Error('Meeting not found or has ended');
      }

      const meeting = meetingQuery.rows[0];

      // If meeting is scheduled and a practitioner is joining, activate it and create encounter
      if (meeting.status === 'scheduled' && userType === 'practitioner' && userId) {
        // Create encounter for this meeting
        const encounterId = await this.createEncounterForMeeting(
          client,
          meeting,
          userId
        );

        // Update meeting status to active and set encounter_id
        await client.query(
          `UPDATE virtual_meetings
           SET status = 'active', started_at = CURRENT_TIMESTAMP, encounter_id = $1
           WHERE id = $2`,
          [encounterId, meeting.id]
        );

        meeting.status = 'active';
        meeting.encounter_id = encounterId;

        // Log meeting started event
        await this.logMeetingEvent(
          meeting.id,
          'meeting_started',
          { practitionerId: userId, encounterId },
          userId,
          'user',
          client
        );
      }

      // Get integration
      const integration = await this.get100msIntegration(meeting.org_id);

      // Determine role based on user type
      const role = userType === 'practitioner' ? 'host' : 'guest';

      // Generate participant token
      const participant = await this.createParticipantToken(
        meeting.id,
        userId,
        userType,
        displayName,
        role,
        integration
      );

      // Update participant joined time
      await client.query(
        'UPDATE virtual_meeting_participants SET joined_at = CURRENT_TIMESTAMP WHERE id = $1',
        [participant.id]
      );

      // Log join event
      await this.logMeetingEvent(
        meeting.id,
        'participant_joined',
        { displayName, userId, userType, participantId: participant.id },
        userId,
        'user',
        client
      );

      await client.query('COMMIT');

      return {
        ...this.formatMeetingResponse(meeting),
        authToken: participant.token,
        participantId: participant.id,
        encounterId: meeting.encounter_id
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error joining meeting:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create FHIR Encounter when meeting starts
   * @param {Object} client - Database client
   * @param {Object} meeting - Meeting data
   * @param {UUID} practitionerId - Practitioner ID
   * @returns {UUID} Encounter ID
   */
  async createEncounterForMeeting(client, meeting, practitionerId) {
    // Generate encounter ID
    const { v4: uuidv4 } = require('uuid');
    const encounterId = uuidv4();

    // Build FHIR Encounter resource
    const encounterResource = {
      resourceType: 'Encounter',
      id: encounterId,
      status: 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'VR', // Virtual encounter
        display: 'Virtual'
      },
      type: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '308335008',
              display: 'Patient encounter procedure'
            }
          ],
          text: 'Telehealth Consultation'
        }
      ],
      serviceType: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/service-type',
            code: '540', // Telehealth
            display: 'Telehealth'
          }
        ]
      },
      subject: {
        reference: `Patient/${meeting.patient_id}`,
        type: 'Patient'
      },
      participant: [
        {
          type: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                  code: 'PPRF',
                  display: 'primary performer'
                }
              ]
            }
          ],
          individual: {
            reference: `Practitioner/${practitionerId}`,
            type: 'Practitioner'
          },
          period: {
            start: new Date().toISOString()
          }
        }
      ],
      period: {
        start: new Date().toISOString()
      },
      appointment: meeting.appointment_id ? [
        {
          reference: `Appointment/${meeting.appointment_id}`,
          type: 'Appointment'
        }
      ] : undefined,
      extension: [
        {
          url: 'http://ehr.com/fhir/StructureDefinition/virtual-meeting',
          valueReference: {
            reference: `VirtualMeeting/${meeting.id}`,
            display: `Meeting Code: ${meeting.meeting_code}`
          }
        },
        {
          url: 'http://ehr.com/fhir/StructureDefinition/meeting-link',
          valueUrl: meeting.public_link
        }
      ]
    };

    // Insert encounter into fhir_resources table
    const insertEncounterQuery = `
      INSERT INTO fhir_resources (
        id,
        resource_type,
        resource_data,
        org_id,
        last_updated,
        created_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;

    await client.query(insertEncounterQuery, [
      encounterId,
      'Encounter',
      JSON.stringify(encounterResource),
      meeting.org_id
    ]);

    console.log(`✅ Created FHIR Encounter ${encounterId} for meeting ${meeting.meeting_code}`);

    // Update appointment status if it exists
    if (meeting.appointment_id) {
      await client.query(
        `UPDATE fhir_resources
         SET resource_data = jsonb_set(
           resource_data,
           '{status}',
           '"in-progress"'::jsonb,
           true
         ),
         last_updated = CURRENT_TIMESTAMP
         WHERE id = $1 AND resource_type = 'Appointment'`,
        [meeting.appointment_id]
      );
    }

    return encounterId;
  }

  /**
   * Get meeting details
   * @param {UUID} meetingId - Meeting ID
   * @returns {Object} Meeting details
   */
  async getMeetingDetails(meetingId) {
    const query = `
      SELECT
        vm.*,
        COUNT(vmp.id) as participant_count
      FROM virtual_meetings vm
      LEFT JOIN virtual_meeting_participants vmp ON vm.id = vmp.meeting_id
      WHERE vm.id = $1
      GROUP BY vm.id
    `;

    const result = await this.pool.query(query, [meetingId]);

    if (result.rows.length === 0) {
      throw new Error('Meeting not found');
    }

    return this.formatMeetingResponse(result.rows[0]);
  }

  /**
   * End a meeting
   * @param {UUID} meetingId - Meeting ID
   * @param {UUID} endedBy - User ID who ended the meeting
   */
  async endMeeting(meetingId, endedBy) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const meeting = await client.query(
        'SELECT * FROM virtual_meetings WHERE id = $1',
        [meetingId]
      );

      if (meeting.rows.length === 0) {
        throw new Error('Meeting not found');
      }

      const meetingData = meeting.rows[0];

      // Get integration
      const integration = await this.get100msIntegration(meetingData.org_id);

      // End room in 100ms
      await hundredMSHandler.execute(integration, 'endRoom', { roomId: meetingData.meeting_id });

      // Update meeting status
      await client.query(
        `UPDATE virtual_meetings
         SET status = $1, ended_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        ['ended', meetingId]
      );

      // Close the encounter if it exists
      if (meetingData.encounter_id) {
        await this.closeEncounter(client, meetingData.encounter_id);
      }

      // Update appointment status if it exists
      if (meetingData.appointment_id) {
        await client.query(
          `UPDATE fhir_resources
           SET resource_data = jsonb_set(
             resource_data,
             '{status}',
             '"fulfilled"'::jsonb,
             true
           ),
           last_updated = CURRENT_TIMESTAMP
           WHERE id = $1 AND resource_type = 'Appointment'`,
          [meetingData.appointment_id]
        );
      }

      // Log event
      await this.logMeetingEvent(
        meetingId,
        'meeting_ended',
        { endedBy, encounterId: meetingData.encounter_id },
        endedBy,
        'user',
        client
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Meeting ended successfully',
        encounterId: meetingData.encounter_id
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error ending meeting:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close FHIR Encounter when meeting ends
   * @param {Object} client - Database client
   * @param {UUID} encounterId - Encounter ID
   */
  async closeEncounter(client, encounterId) {
    // Update encounter status to finished in fhir_resources table
    await client.query(
      `UPDATE fhir_resources
       SET
         resource_data = jsonb_set(
           jsonb_set(
             resource_data,
             '{status}',
             '"finished"'::jsonb,
             true
           ),
           '{period,end}',
           to_jsonb(to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
           true
         ),
         last_updated = CURRENT_TIMESTAMP
       WHERE id = $1 AND resource_type = 'Encounter'`,
      [encounterId]
    );

    console.log(`✅ Closed FHIR Encounter ${encounterId}`);
  }

  /**
   * Get 100ms integration for organization
   */
  async get100msIntegration(orgId) {
    const query = `
      SELECT i.*, iv.*
      FROM integrations i
      JOIN integration_vendors iv ON i.vendor_id = iv.id
      WHERE i.org_id = $1
        AND iv.id = '100ms'
        AND i.enabled = true
      LIMIT 1
    `;

    const result = await this.pool.query(query, [orgId]);

    if (result.rows.length === 0) {
      console.log(`⚠️  No active 100ms integration found for org ${orgId}`);
      return null;
    }

    return result.rows[0];
  }

  /**
   * Generate unique meeting code
   */
  async generateUniqueMeetingCode() {
    let code;
    let exists = true;

    while (exists) {
      code = this.generateMeetingCode();
      const result = await this.pool.query(
        'SELECT id FROM virtual_meetings WHERE meeting_code = $1',
        [code]
      );
      exists = result.rows.length > 0;
    }

    return code;
  }

  /**
   * Log meeting event
   * @param {object} client - Optional transaction client. If provided, uses this client instead of pool.
   */
  async logMeetingEvent(meetingId, eventType, eventData, triggeredBy, triggeredByType, client = null) {
    const query = `
      INSERT INTO virtual_meeting_events (
        meeting_id,
        event_type,
        event_data,
        triggered_by,
        triggered_by_type
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    const dbClient = client || this.pool;
    await dbClient.query(query, [
      meetingId,
      eventType,
      JSON.stringify(eventData),
      triggeredBy,
      triggeredByType
    ]);
  }

  /**
   * Send SMS notification (Placeholder - to be implemented with Twilio/Exotel)
   */
  async sendSMSNotification(phoneNumber, meetingCode, publicLink) {
    console.log('\n📱 SMS Notification (TO BE SENT):');
    console.log(`   To: ${phoneNumber}`);
    console.log(`   Message: "Your telehealth appointment is ready!"`);
    console.log(`   Meeting Code: ${meetingCode}`);
    console.log(`   Join Link: ${publicLink}`);
    console.log('   📝 Note: Integrate Twilio/Exotel API to send actual SMS\n');

    // TODO: Implement Twilio/Exotel SMS sending
    // Example:
    // await twilioClient.messages.create({
    //   body: `Your telehealth appointment is ready! Meeting Code: ${meetingCode}\nJoin: ${publicLink}`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });
  }

  /**
   * Send email notification (Placeholder - to be implemented)
   */
  async sendEmailNotification(email, meetingCode, publicLink, patientName, practitionerName) {
    console.log('\n📧 Email Notification (TO BE SENT):');
    console.log(`   To: ${email}`);
    console.log(`   Subject: "Your Telehealth Appointment with Dr. ${practitionerName}"`);
    console.log(`   Meeting Code: ${meetingCode}`);
    console.log(`   Join Link: ${publicLink}`);
    console.log('   📝 Note: Integrate SendGrid/AWS SES to send actual emails\n');

    // TODO: Implement email sending
    // Example:
    // await emailClient.send({
    //   to: email,
    //   from: 'noreply@yourehr.com',
    //   subject: `Your Telehealth Appointment with Dr. ${practitionerName}`,
    //   html: `<p>Dear ${patientName},</p>
    //          <p>Your telehealth appointment is ready!</p>
    //          <p>Meeting Code: <strong>${meetingCode}</strong></p>
    //          <p><a href="${publicLink}">Join Meeting</a></p>`
    // });
  }

  /**
   * Log meeting link sharing (for audit trail)
   */
  async logMeetingLinkShared(meetingId, method, recipient) {
    console.log(`📋 Meeting Link Shared: ${method} to ${recipient} for meeting ${meetingId}`);

    // Log to database
    await this.logMeetingEvent(
      meetingId,
      'link_shared',
      { method, recipient },
      null,
      'system'
    );
  }

  /**
   * Format meeting response
   */
  formatMeetingResponse(meeting) {
    return {
      id: meeting.id,
      appointmentId: meeting.appointment_id,
      encounterId: meeting.encounter_id,
      orgId: meeting.org_id,
      meetingId: meeting.meeting_id,
      meetingCode: meeting.meeting_code,
      roomUrl: meeting.room_url,
      publicLink: meeting.public_link,
      hostLink: meeting.host_link,
      status: meeting.status,
      hostPractitionerId: meeting.host_practitioner_id,
      patientId: meeting.patient_id,
      startedAt: meeting.started_at,
      endedAt: meeting.ended_at,
      recordingEnabled: meeting.recording_enabled,
      recordingUrl: meeting.recording_url,
      createdAt: meeting.created_at,
      updatedAt: meeting.updated_at,
      participantCount: meeting.participant_count || 0
    };
  }
}

module.exports = VirtualMeetingsService;
