const express = require('express');
const notificationService = require('../services/notification.service');

const router = express.Router();

function requireUserContext(req, res, next) {
  const userId = req.headers['x-user-id'];
  const orgId = req.headers['x-org-id'];

  if (!userId || !orgId) {
    return res.status(401).json({
      error: 'Missing authentication context. x-user-id and x-org-id headers are required.',
    });
  }

  req.notificationContext = {
    userId: String(userId),
    orgId: String(orgId),
  };

  next();
}

router.use(requireUserContext);

router.get('/', async (req, res) => {
  try {
    const { notificationContext } = req;
    const { limit, unreadOnly } = req.query;

    const notifications = await notificationService.fetchNotifications({
      orgId: notificationContext.orgId,
      userId: notificationContext.userId,
      limit,
      unreadOnly: unreadOnly === 'true',
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch notifications',
    });
  }
});

router.post('/read-all', async (req, res) => {
  try {
    const { notificationContext } = req;

    await notificationService.markAllAsRead({
      orgId: notificationContext.orgId,
      userId: notificationContext.userId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    res.status(500).json({
      error: error.message || 'Failed to update notifications',
    });
  }
});

router.post('/:notificationId/read', async (req, res) => {
  try {
    const { notificationContext } = req;
    const { notificationId } = req.params;

    await notificationService.markAsRead({
      notificationId,
      orgId: notificationContext.orgId,
      userId: notificationContext.userId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({
      error: error.message || 'Failed to update notification',
    });
  }
});

module.exports = router;
