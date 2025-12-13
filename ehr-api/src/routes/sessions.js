const express = require('express');
const router = express.Router();
const sessionService = require('../services/session.service');
const { query } = require('../database/connection');

/**
 * Session Management Routes
 *
 * Endpoints:
 * - POST /api/sessions/refresh - Refresh access token
 * - GET /api/sessions - Get all active sessions for user
 * - DELETE /api/sessions/:sessionId - Revoke specific session
 * - DELETE /api/sessions - Revoke all sessions except current
 * - POST /api/sessions/cleanup - Clean up expired sessions (admin/cron)
 */

/**
 * POST /api/sessions/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
      });
    }

    const result = await sessionService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({
      error: 'Failed to refresh token',
      message: error.message,
    });
  }
});

/**
 * GET /api/sessions
 * Get all active sessions for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const currentSessionId = req.headers['x-session-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sessions = await sessionService.getUserSessions(userId);

    // Mark current session
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));

    res.json({
      success: true,
      sessions: sessionsWithCurrent,
      total: sessionsWithCurrent.length,
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * Revoke a specific session
 */
router.delete('/:sessionId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await sessionService.revokeSession(sessionId, userId);

    // Log audit event
    if (orgId) {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata, ip_address, user_agent
        )
        VALUES ($1, $2, 'SESSION.REVOKED', 'Session', $3,
                $4, 'success', $5, $6, $7)`,
        [
          orgId,
          userId,
          sessionId,
          `Session ${sessionId}`,
          JSON.stringify({ sessionId }),
          req.ip,
          req.headers['user-agent'],
        ]
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({
      error: 'Failed to revoke session',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/sessions
 * Revoke all sessions except the current one
 */
router.delete('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    const currentSessionId = req.headers['x-session-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await sessionService.revokeAllSessions(userId, currentSessionId);

    // Log audit event
    if (orgId) {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata, ip_address, user_agent
        )
        VALUES ($1, $2, 'SESSION.REVOKED_ALL', 'User', $2,
                (SELECT email FROM users WHERE id = $2),
                'success', $3, $4, $5)`,
        [
          orgId,
          userId,
          JSON.stringify({ revokedCount: result.revokedCount }),
          req.ip,
          req.headers['user-agent'],
        ]
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({
      error: 'Failed to revoke all sessions',
      message: error.message,
    });
  }
});

/**
 * POST /api/sessions/cleanup
 * Clean up expired sessions (should be called by cron job)
 */
router.post('/cleanup', async (req, res) => {
  try {
    // In production, protect this with an API key or admin check
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.CRON_API_KEY;

    if (expectedKey && apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await sessionService.cleanupExpiredSessions();

    res.json(result);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    res.status(500).json({
      error: 'Failed to cleanup sessions',
      message: error.message,
    });
  }
});

module.exports = router;
