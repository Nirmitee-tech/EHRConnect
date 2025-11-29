const express = require('express');
const router = express.Router();
const taskService = require('../services/task.service');
const { requireAuth } = require('../middleware/auth');

// Apply authentication to all routes
router.use(requireAuth);

/**
 * Task Management Routes
 * RESTful API for task CRUD, comments, pools, and analytics
 */

// ============================================
// TASK CRUD OPERATIONS
// ============================================

/**
 * Create new task
 * POST /api/tasks
 */
router.post('/', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      orgId: req.userContext.orgId
    };

    const task = await taskService.createTask(taskData, req.userContext.userId);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Search/List tasks
 * GET /api/tasks
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const filters = {
      orgId: req.userContext.orgId,
      assignedToUserId: req.query.assignedToUserId,
      assignedToPatientId: req.query.assignedToPatientId,
      assignedToPoolId: req.query.assignedToPoolId,
      createdByUserId: req.query.createdByUserId,
      patientId: req.query.patientId,
      status: req.query.status ? req.query.status.split(',') : undefined,
      priority: req.query.priority ? req.query.priority.split(',') : undefined,
      taskType: req.query.taskType,
      category: req.query.category,
      labels: req.query.labels ? req.query.labels.split(',') : undefined,
      dueAfter: req.query.dueAfter,
      dueBefore: req.query.dueBefore,
      isOverdue: req.query.isOverdue === 'true',
      searchTerm: req.query.search,
      appointmentId: req.query.appointmentId,
      formId: req.query.formId,
      orderId: req.query.orderId
    };

    const pagination = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      sortBy: req.query.sortBy || 'due_date',
      sortOrder: req.query.sortOrder || 'ASC'
    };

    const result = await taskService.searchTasks(filters, pagination);

    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get my tasks (assigned to me)
 * GET /api/tasks/my-tasks
 */
router.get('/my-tasks', requireAuth, async (req, res) => {
  try {
    const filters = {
      orgId: req.userContext.orgId,
      assignedToUserId: req.userContext.userId,
      status: req.query.status ? req.query.status.split(',') : ['ready', 'in-progress', 'accepted']
    };

    const pagination = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      sortBy: 'due_date',
      sortOrder: 'ASC'
    };

    const result = await taskService.searchTasks(filters, pagination);

    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get tasks created by me
 * GET /api/tasks/created-by-me
 */
router.get('/created-by-me', requireAuth, async (req, res) => {
  try {
    const filters = {
      orgId: req.userContext.orgId,
      createdByUserId: req.userContext.userId
    };

    const pagination = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    };

    const result = await taskService.searchTasks(filters, pagination);

    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Get created by me tasks error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get overdue tasks
 * GET /api/tasks/overdue
 */
router.get('/overdue', requireAuth, async (req, res) => {
  try {
    const filters = {
      orgId: req.userContext.orgId,
      isOverdue: true
    };

    if (req.query.userId) {
      filters.assignedToUserId = req.query.userId;
    }

    const result = await taskService.searchTasks(filters, { limit: 100, offset: 0 });

    res.json({
      success: true,
      data: result.tasks
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get task by ID
 * GET /api/tasks/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access (user's org)
    if (task.org_id !== req.userContext.orgId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update task
 * PUT /api/tasks/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.userContext.userId
    );

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.userContext.userId);

    res.json(result);
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Claim task from pool
 * POST /api/tasks/:id/claim
 */
router.post('/:id/claim', requireAuth, async (req, res) => {
  try {
    const task = await taskService.claimTask(req.params.id, req.userContext.userId);

    res.json({
      success: true,
      data: task,
      message: 'Task claimed successfully'
    });
  } catch (error) {
    console.error('Claim task error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// COMMENTS
// ============================================

/**
 * Add comment to task
 * POST /api/tasks/:id/comments
 */
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const comment = await taskService.addComment(
      req.params.id,
      {
        commentText: req.body.commentText,
        authorUserId: req.userContext.userId,
        mentionedUserIds: req.body.mentionedUserIds || [],
        attachments: req.body.attachments || []
      },
      req.userContext.userId,
      'staff'
    );

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get task comments
 * GET /api/tasks/:id/comments
 */
router.get('/:id/comments', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const comments = await taskService.getTaskComments(req.params.id, limit, offset);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// HISTORY
// ============================================

/**
 * Get task history
 * GET /api/tasks/:id/history
 */
router.get('/:id/history', requireAuth, async (req, res) => {
  try {
    const history = await taskService.getTaskHistory(req.params.id);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// SUBTASKS
// ============================================

/**
 * Add subtask
 * POST /api/tasks/:id/subtasks
 */
router.post('/:id/subtasks', requireAuth, async (req, res) => {
  try {
    const subtask = await taskService.addSubtask(req.params.id, req.body);

    res.status(201).json({
      success: true,
      data: subtask
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update subtask
 * PUT /api/tasks/subtasks/:subtaskId
 */
router.put('/subtasks/:subtaskId', requireAuth, async (req, res) => {
  try {
    const subtask = await taskService.updateSubtask(req.params.subtaskId, req.body);

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: 'Subtask not found'
      });
    }

    res.json({
      success: true,
      data: subtask
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TASK POOLS
// ============================================

/**
 * Create task pool
 * POST /api/tasks/pools
 */
router.post('/pools', requireAuth, async (req, res) => {
  try {
    const poolData = {
      ...req.body,
      orgId: req.userContext.orgId
    };

    const pool = await taskService.createTaskPool(poolData, req.userContext.userId);

    res.status(201).json({
      success: true,
      data: pool
    });
  } catch (error) {
    console.error('Create pool error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get task pools
 * GET /api/tasks/pools
 */
router.get('/pools', requireAuth, async (req, res) => {
  try {
    const { query } = require('../database/connection');
    const result = await query(
      `SELECT
        tp.*,
        u.name as default_assignee_name,
        (SELECT COUNT(*) FROM task_pool_members WHERE pool_id = tp.id) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to_pool_id = tp.id AND deleted_at IS NULL) as task_count
      FROM task_pools tp
      LEFT JOIN users u ON tp.default_assignee_id = u.id
      WHERE tp.org_id = $1 AND tp.is_active = TRUE
      ORDER BY tp.name`,
      [req.userContext.orgId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get pool details with members
 * GET /api/tasks/pools/:id
 */
router.get('/pools/:id', requireAuth, async (req, res) => {
  try {
    const { query } = require('../database/connection');

    // Get pool
    const poolResult = await query(
      `SELECT tp.*, u.name as default_assignee_name
       FROM task_pools tp
       LEFT JOIN users u ON tp.default_assignee_id = u.id
       WHERE tp.id = $1 AND tp.org_id = $2`,
      [req.params.id, req.userContext.orgId]
    );

    if (poolResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      });
    }

    const pool = poolResult.rows[0];

    // Get members
    const membersResult = await query(
      `SELECT
        pm.*,
        u.name as user_name,
        u.email as user_email
      FROM task_pool_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.pool_id = $1
      ORDER BY pm.role DESC, u.name`,
      [req.params.id]
    );

    pool.members = membersResult.rows;

    res.json({
      success: true,
      data: pool
    });
  } catch (error) {
    console.error('Get pool details error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Add member to pool
 * POST /api/tasks/pools/:id/members
 */
router.post('/pools/:id/members', requireAuth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const member = await taskService.addPoolMember(
      req.params.id,
      userId,
      role,
      req.userContext.userId
    );

    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Add pool member error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Remove member from pool
 * DELETE /api/tasks/pools/:id/members/:userId
 */
router.delete('/pools/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    const { query } = require('../database/connection');
    await query(
      'DELETE FROM task_pool_members WHERE pool_id = $1 AND user_id = $2',
      [req.params.id, req.params.userId]
    );

    res.json({
      success: true,
      message: 'Member removed from pool'
    });
  } catch (error) {
    console.error('Remove pool member error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * Get task analytics
 * GET /api/tasks/analytics
 */
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const analytics = await taskService.getTaskAnalytics(req.userContext.orgId, filters);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// NOTIFICATIONS
// ============================================

const TaskNotificationService = require('../services/task-notification.service');

/**
 * Get user notifications
 * GET /api/tasks/notifications
 */
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      unreadOnly: req.query.unreadOnly === 'true',
      notificationType: req.query.type
    };

    const result = await TaskNotificationService.getUserNotifications(req.userContext.userId, options);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get unread notification count
 * GET /api/tasks/notifications/unread-count
 */
router.get('/notifications/unread-count', requireAuth, async (req, res) => {
  try {
    const count = await TaskNotificationService.getUnreadCount(req.userContext.userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Mark notification as read
 * PUT /api/tasks/notifications/:id/read
 */
router.put('/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await TaskNotificationService.markAsRead(req.params.id, req.userContext.userId);

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/tasks/notifications/read-all
 */
router.put('/notifications/read-all', requireAuth, async (req, res) => {
  try {
    const result = await TaskNotificationService.markAllAsRead(req.userContext.userId);

    res.json(result);
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete notification
 * DELETE /api/tasks/notifications/:id
 */
router.delete('/notifications/:id', requireAuth, async (req, res) => {
  try {
    const result = await TaskNotificationService.deleteNotification(req.params.id, req.userContext.userId);

    res.json(result);
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
