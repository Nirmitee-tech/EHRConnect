const { query, transaction } = require('../database/connection');
const socketService = require('./socket.service');

/**
 * Task Notification Service
 * Handles in-app notifications specifically for task events
 */

class TaskNotificationService {
  /**
   * Create a task notification
   */
  static async createNotification(notificationData) {
    try {
      const {
        recipientUserId,
        recipientPatientId,
        taskId,
        notificationType,
        title,
        message,
        metadata = {}
      } = notificationData;

      // Validate that at least one recipient is specified
      if (!recipientUserId && !recipientPatientId) {
        throw new Error('Notification must have a recipient (user or patient)');
      }

      const result = await query(
        `INSERT INTO task_notifications
         (recipient_user_id, recipient_patient_id, task_id, notification_type, title, message, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          recipientUserId || null,
          recipientPatientId || null,
          taskId,
          notificationType,
          title,
          message,
          JSON.stringify(metadata)
        ]
      );

      const notification = result.rows[0];

      // Send real-time notification via Socket.IO (if user is online)
      if (recipientUserId) {
        try {
          await this.sendRealtimeNotification(recipientUserId, notification);
        } catch (error) {
          console.error('Error sending real-time notification:', error);
          // Don't throw - notification is already created in DB
        }
      }

      return notification;

    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications in bulk
   */
  static async createBulkNotifications(notifications) {
    const results = [];

    for (const notificationData of notifications) {
      try {
        const notification = await this.createNotification(notificationData);
        results.push({ success: true, notification });
      } catch (error) {
        console.error('Error creating bulk notification:', error);
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send real-time notification via Socket.IO
   */
  static async sendRealtimeNotification(userId, notification) {
    try {
      // Get user's organization for socket room
      const userResult = await query(
        'SELECT org_id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length > 0) {
        const orgId = userResult.rows[0].org_id;

        // Emit notification to user's socket room
        socketService.emitToUser(orgId, userId, 'task_notification', {
          id: notification.id,
          type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          taskId: notification.task_id,
          metadata: notification.metadata,
          createdAt: notification.created_at,
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      unreadOnly = false,
      notificationType = null
    } = options;

    try {
      let whereConditions = ['recipient_user_id = $1'];
      const params = [userId];
      let paramCount = 1;

      if (unreadOnly) {
        whereConditions.push('is_read = FALSE');
      }

      if (notificationType) {
        paramCount++;
        whereConditions.push(`notification_type = $${paramCount}`);
        params.push(notificationType);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM task_notifications WHERE ${whereClause}`,
        params
      );

      const total = parseInt(countResult.rows[0].total);

      // Get notifications with task details
      paramCount++;
      params.push(limit);
      paramCount++;
      params.push(offset);

      const result = await query(
        `SELECT
           n.*,
           t.identifier as task_identifier,
           t.description as task_description,
           t.status as task_status,
           t.priority as task_priority
         FROM task_notifications n
         LEFT JOIN tasks t ON n.task_id = t.id
         WHERE ${whereClause}
         ORDER BY n.created_at DESC
         LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
        params
      );

      return {
        notifications: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };

    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get patient notifications
   */
  static async getPatientNotifications(patientId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      unreadOnly = false
    } = options;

    try {
      let whereCondition = 'recipient_patient_id = $1';
      if (unreadOnly) {
        whereCondition += ' AND is_read = FALSE';
      }

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM task_notifications WHERE ${whereCondition}`,
        [patientId]
      );

      const total = parseInt(countResult.rows[0].total);

      // Get notifications
      const result = await query(
        `SELECT
           n.*,
           t.identifier as task_identifier,
           t.description as task_description,
           t.status as task_status
         FROM task_notifications n
         LEFT JOIN tasks t ON n.task_id = t.id
         WHERE ${whereCondition}
         ORDER BY n.created_at DESC
         LIMIT $2 OFFSET $3`,
        [patientId, limit, offset]
      );

      return {
        notifications: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };

    } catch (error) {
      console.error('Error getting patient notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      const result = await query(
        `SELECT COUNT(*) as count
         FROM task_notifications
         WHERE recipient_user_id = $1 AND is_read = FALSE`,
        [userId]
      );

      return parseInt(result.rows[0].count);

    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      const result = await query(
        `UPDATE task_notifications
         SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND recipient_user_id = $2
         RETURNING *`,
        [notificationId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      return result.rows[0];

    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      const result = await query(
        `UPDATE task_notifications
         SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
         WHERE recipient_user_id = $1 AND is_read = FALSE`,
        [userId]
      );

      return {
        success: true,
        updatedCount: result.rowCount
      };

    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await query(
        `DELETE FROM task_notifications
         WHERE id = $1 AND recipient_user_id = $2
         RETURNING id`,
        [notificationId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      return { success: true, message: 'Notification deleted' };

    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Create task assignment notification
   */
  static async notifyTaskAssigned(task, assigneeUserId, assignerUserId) {
    const title = 'New Task Assigned';
    const message = `You have been assigned to: ${task.description || task.identifier}`;

    return this.createNotification({
      recipientUserId: assigneeUserId,
      taskId: task.id,
      notificationType: 'task_assigned',
      title,
      message,
      metadata: {
        assignedBy: assignerUserId,
        priority: task.priority,
        dueDate: task.due_date
      }
    });
  }

  /**
   * Create task status change notification
   */
  static async notifyTaskStatusChanged(task, recipientUserId, oldStatus, newStatus) {
    const title = 'Task Status Updated';
    const message = `Task "${task.description || task.identifier}" status changed from ${oldStatus} to ${newStatus}`;

    return this.createNotification({
      recipientUserId,
      taskId: task.id,
      notificationType: 'task_status_changed',
      title,
      message,
      metadata: {
        oldStatus,
        newStatus,
        updatedAt: task.updated_at
      }
    });
  }

  /**
   * Create comment mention notification
   */
  static async notifyCommentMention(task, mentionedUserId, commenterUserId, commentText) {
    const title = 'You were mentioned in a comment';
    const message = `You were mentioned in a comment on task: ${task.description || task.identifier}`;

    return this.createNotification({
      recipientUserId: mentionedUserId,
      taskId: task.id,
      notificationType: 'task_comment_mention',
      title,
      message,
      metadata: {
        commentedBy: commenterUserId,
        commentPreview: commentText.substring(0, 100)
      }
    });
  }

  /**
   * Create task due soon notification
   */
  static async notifyTaskDueSoon(task, recipientUserId) {
    const title = 'Task Due Soon';
    const dueDate = new Date(task.due_date);
    const message = `Task "${task.description || task.identifier}" is due on ${dueDate.toLocaleDateString()}`;

    return this.createNotification({
      recipientUserId,
      taskId: task.id,
      notificationType: 'task_due_soon',
      title,
      message,
      metadata: {
        dueDate: task.due_date,
        priority: task.priority
      }
    });
  }

  /**
   * Create task overdue notification
   */
  static async notifyTaskOverdue(task, recipientUserId) {
    const title = 'Task Overdue';
    const message = `Task "${task.description || task.identifier}" is overdue`;

    return this.createNotification({
      recipientUserId,
      taskId: task.id,
      notificationType: 'task_overdue',
      title,
      message,
      metadata: {
        dueDate: task.due_date,
        priority: task.priority
      }
    });
  }

  /**
   * Create task completed notification (for task creator)
   */
  static async notifyTaskCompleted(task, recipientUserId, completedByUserId) {
    const title = 'Task Completed';
    const message = `Task "${task.description || task.identifier}" has been completed`;

    return this.createNotification({
      recipientUserId,
      taskId: task.id,
      notificationType: 'task_completed',
      title,
      message,
      metadata: {
        completedBy: completedByUserId,
        completedAt: task.completed_at
      }
    });
  }

  /**
   * Send email notification (placeholder for email integration)
   */
  static async sendEmailNotification(userId, notificationType, taskData) {
    try {
      // This would integrate with your existing email service
      // For now, just log
      console.log(`Email notification ${notificationType} for user ${userId} about task ${taskData.id}`);

      // TODO: Integrate with email service
      // Example:
      // const emailService = require('./email.service');
      // await emailService.sendTaskNotificationEmail(userId, notificationType, taskData);

      return { success: true };

    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old notifications (for maintenance jobs)
   */
  static async cleanupOldNotifications(daysToKeep = 90) {
    try {
      const result = await query(
        `DELETE FROM task_notifications
         WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysToKeep} days'
         AND is_read = TRUE`,
        []
      );

      console.log(`Cleaned up ${result.rowCount} old notifications`);

      return {
        success: true,
        deletedCount: result.rowCount
      };

    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }
}

module.exports = TaskNotificationService;
