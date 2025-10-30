const express = require('express');
const router = express.Router();
const virtualMeetingsController = require('../controllers/virtual-meetings.controller');

/**
 * Virtual Meetings Routes
 * Handles all virtual meeting related endpoints
 */

// Public routes (no authentication required)
router.post('/join/:meetingCode', virtualMeetingsController.joinMeetingByCode);
router.get('/code/:meetingCode', virtualMeetingsController.getMeetingByCode);

// Protected routes (authentication required via middleware in index.js)
router.post('/instant', virtualMeetingsController.createInstantMeeting);
router.post('/appointment/:appointmentId', virtualMeetingsController.createMeetingForAppointment);
router.get('/:meetingId', virtualMeetingsController.getMeetingDetails);
router.post('/:meetingId/end', virtualMeetingsController.endMeeting);
router.get('/org/:orgId', virtualMeetingsController.listMeetings);
router.post('/:meetingId/token', virtualMeetingsController.generateParticipantToken);

module.exports = router;
