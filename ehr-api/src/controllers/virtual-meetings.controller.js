const VirtualMeetingsService = require('../services/virtual-meetings.service');

const meetingsService = new VirtualMeetingsService();

/**
 * Virtual Meetings Controller
 * Handles HTTP requests for virtual meeting operations
 */

/**
 * Create an instant meeting
 * POST /api/virtual-meetings/instant
 */
async function createInstantMeeting(req, res) {
  try {
    const { orgId, practitionerId, patientId, displayName, recordingEnabled } = req.body;
    const createdBy = req.user?.id;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const meeting = await meetingsService.createInstantMeeting({
      orgId,
      hostPractitionerId: practitionerId,
      patientId,
      displayName,
      recordingEnabled,
      createdBy
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating instant meeting:', error);
    res.status(500).json({ error: error.message || 'Failed to create instant meeting' });
  }
}

/**
 * Create meeting for appointment
 * POST /api/virtual-meetings/appointment/:appointmentId
 */
async function createMeetingForAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const { orgId, recordingEnabled } = req.body;
    const createdBy = req.user?.id;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const meeting = await meetingsService.createMeetingForAppointment(appointmentId, {
      orgId,
      recordingEnabled,
      createdBy
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting for appointment:', error);
    res.status(500).json({ error: error.message || 'Failed to create meeting' });
  }
}

/**
 * Join meeting by code (public access - no auth required)
 * POST /api/virtual-meetings/join/:meetingCode
 */
async function joinMeetingByCode(req, res) {
  try {
    const { meetingCode } = req.params;
    const { displayName, userId, userType } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const meeting = await meetingsService.joinMeetingByCode(meetingCode, {
      displayName,
      userId,
      userType: userType || 'guest' // practitioner or guest
    });

    res.status(200).json(meeting);
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ error: error.message || 'Failed to join meeting' });
  }
}

/**
 * Get meeting details
 * GET /api/virtual-meetings/:meetingId
 */
async function getMeetingDetails(req, res) {
  try {
    const { meetingId } = req.params;

    const meeting = await meetingsService.getMeetingDetails(meetingId);

    res.status(200).json(meeting);
  } catch (error) {
    console.error('Error getting meeting details:', error);
    res.status(404).json({ error: error.message || 'Meeting not found' });
  }
}

/**
 * Get meeting by code (public)
 * GET /api/virtual-meetings/code/:meetingCode
 */
async function getMeetingByCode(req, res) {
  try {
    const { meetingCode } = req.params;

    const query = `
      SELECT * FROM virtual_meetings
      WHERE meeting_code = $1
      LIMIT 1
    `;

    const result = await meetingsService.pool.query(query, [meetingCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const meeting = meetingsService.formatMeetingResponse(result.rows[0]);

    res.status(200).json(meeting);
  } catch (error) {
    console.error('Error getting meeting by code:', error);
    res.status(500).json({ error: error.message || 'Failed to get meeting' });
  }
}

/**
 * End meeting
 * POST /api/virtual-meetings/:meetingId/end
 */
async function endMeeting(req, res) {
  try {
    const { meetingId } = req.params;
    const endedBy = req.user?.id;

    const result = await meetingsService.endMeeting(meetingId, endedBy);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({ error: error.message || 'Failed to end meeting' });
  }
}

/**
 * List meetings for organization
 * GET /api/virtual-meetings/org/:orgId
 */
async function listMeetings(req, res) {
  try {
    const { orgId } = req.params;
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT vm.*, COUNT(vmp.id) as participant_count
      FROM virtual_meetings vm
      LEFT JOIN virtual_meeting_participants vmp ON vm.id = vmp.meeting_id
      WHERE vm.org_id = $1
    `;

    const params = [orgId];
    let paramIndex = 2;

    if (status) {
      query += ` AND vm.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND vm.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND vm.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += `
      GROUP BY vm.id
      ORDER BY vm.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await meetingsService.pool.query(query, params);

    const meetings = result.rows.map(m => meetingsService.formatMeetingResponse(m));

    res.status(200).json({
      data: meetings,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error listing meetings:', error);
    res.status(500).json({ error: error.message || 'Failed to list meetings' });
  }
}

/**
 * Generate participant token
 * POST /api/virtual-meetings/:meetingId/token
 */
async function generateParticipantToken(req, res) {
  try {
    const { meetingId } = req.params;
    const { userId, userType, displayName, role } = req.body;

    if (!displayName || !role) {
      return res.status(400).json({ error: 'Display name and role are required' });
    }

    const meeting = await meetingsService.getMeetingDetails(meetingId);
    const integration = await meetingsService.get100msIntegration(meeting.orgId);

    const participant = await meetingsService.createParticipantToken(
      meetingId,
      userId,
      userType,
      displayName,
      role,
      integration
    );

    res.status(201).json(participant);
  } catch (error) {
    console.error('Error generating participant token:', error);
    res.status(500).json({ error: error.message || 'Failed to generate token' });
  }
}

module.exports = {
  createInstantMeeting,
  createMeetingForAppointment,
  joinMeetingByCode,
  getMeetingDetails,
  getMeetingByCode,
  endMeeting,
  listMeetings,
  generateParticipantToken
};
