const { query, transaction } = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const WebhookService = require('./webhook.service');
const TaskNotificationService = require('./task-notification.service');

/**
 * Task Management Service
 * Handles all task operations including CRUD, assignments, comments, and business logic
 */
class TaskService {
  /**
   * Create a new task
   */
  async createTask(taskData, actorUserId) {
    return await transaction(async (client) => {
      const {
        orgId,
        title,
        description,
        assignedToUserId,
        assignedToPatientId,
        assignedToPoolId,
        patientId,
        dueDate,
        priority = 'routine',
        status = 'ready',
        intent = 'order',
        category,
        taskType = 'internal',
        labels = [],
        appointmentId,
        formId,
        orderId,
        orderType,
        encounterId,
        metadata = {},
        subtasks = [],
        showAssignee = true
      } = taskData;

      // Validate assignee
      if (!assignedToUserId && !assignedToPatientId && !assignedToPoolId) {
        throw new Error('Task must be assigned to a user, patient, or pool');
      }

      // If assigned to pool, get default assignee
      let finalAssignedUserId = assignedToUserId;
      if (assignedToPoolId && !assignedToUserId) {
        const poolResult = await client.query(
          'SELECT default_assignee_id FROM task_pools WHERE id = $1 AND org_id = $2',
          [assignedToPoolId, orgId]
        );
        if (poolResult.rows.length === 0) {
          throw new Error('Task pool not found');
        }

        const poolSettings = await this.getPoolSettings(assignedToPoolId, client);
        if (poolSettings.show_in_all_queues) {
          // Don't assign to default, let pool members claim
          finalAssignedUserId = null;
        } else {
          finalAssignedUserId = poolResult.rows[0].default_assignee_id;
        }
      }

      // Create task
      const taskId = uuidv4();
      const identifier = `TASK-${Date.now()}-${taskId.substring(0, 8)}`;

      const taskResult = await client.query(
        `INSERT INTO tasks (
          id, org_id, identifier, intent, status, priority,
          description, assigned_to_user_id, assigned_to_patient_id, assigned_to_pool_id,
          assigned_by_user_id, patient_id, due_date, task_type, category,
          labels, appointment_id, form_id, order_id, order_type, encounter_id,
          metadata, show_assignee, authored_on
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          taskId, orgId, identifier, intent, status, priority,
          description, finalAssignedUserId, assignedToPatientId, assignedToPoolId,
          actorUserId, patientId, dueDate, taskType, category,
          labels, appointmentId, formId, orderId, orderType, encounterId,
          JSON.stringify(metadata), showAssignee
        ]
      );

      const task = taskResult.rows[0];

      // Create subtasks if provided
      if (subtasks && subtasks.length > 0) {
        for (let i = 0; i < subtasks.length; i++) {
          await client.query(
            `INSERT INTO task_subtasks (
              parent_task_id, title, description, sort_order
            ) VALUES ($1, $2, $3, $4)`,
            [taskId, subtasks[i].title, subtasks[i].description || '', i]
          );
        }
      }

      // Log creation in history
      await this.logTaskHistory(taskId, 'created', {}, actorUserId, 'user', client);

      // Create notifications
      await this.createTaskNotifications(task, 'task_assigned', client);

      // Trigger webhooks
      await this.triggerWebhooks(orgId, 'task.created', task);

      return await this.getTaskById(taskId);
    });
  }

  /**
   * Get task by ID with all related data
   */
  async getTaskById(taskId) {
    const result = await query(
      `SELECT
        t.*,
        u.name as assigned_to_user_name,
        u.email as assigned_to_user_email,
        p.resource->'name'->0->>'text' as assigned_to_patient_name,
        creator.name as assigned_by_user_name,
        pat.resource->'name'->0->>'text' as patient_name,
        tp.name as pool_name,
        (SELECT COUNT(*) FROM task_subtasks WHERE parent_task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM task_subtasks WHERE parent_task_id = t.id AND status = 'completed') as completed_subtask_count,
        (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id AND deleted_at IS NULL) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to_user_id = u.id
      LEFT JOIN fhir_patients p ON t.assigned_to_patient_id = p.id
      LEFT JOIN users creator ON t.assigned_by_user_id = creator.id
      LEFT JOIN fhir_patients pat ON t.patient_id = pat.id
      LEFT JOIN task_pools tp ON t.assigned_to_pool_id = tp.id
      WHERE t.id = $1 AND t.deleted_at IS NULL`,
      [taskId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const task = result.rows[0];

    // Get subtasks
    const subtasksResult = await query(
      'SELECT * FROM task_subtasks WHERE parent_task_id = $1 ORDER BY sort_order',
      [taskId]
    );
    task.subtasks = subtasksResult.rows;

    // Get recent comments
    const commentsResult = await query(
      `SELECT
        c.*,
        u.name as author_user_name,
        u.email as author_user_email,
        p.resource->'name'->0->>'text' as author_patient_name
      FROM task_comments c
      LEFT JOIN users u ON c.author_user_id = u.id
      LEFT JOIN fhir_patients p ON c.author_patient_id = p.id
      WHERE c.task_id = $1 AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT 10`,
      [taskId]
    );
    task.recent_comments = commentsResult.rows;

    return task;
  }

  /**
   * Search/list tasks with filters
   */
  async searchTasks(filters, pagination = {}) {
    const {
      orgId,
      assignedToUserId,
      assignedToPatientId,
      assignedToPoolId,
      createdByUserId,
      patientId,
      status,
      priority,
      taskType,
      category,
      labels,
      dueAfter,
      dueBefore,
      isOverdue,
      searchTerm,
      appointmentId,
      formId,
      orderId
    } = filters;

    const { limit = 50, offset = 0, sortBy = 'due_date', sortOrder = 'ASC' } = pagination;

    let conditions = ['t.deleted_at IS NULL'];
    let params = [];
    let paramCount = 0;

    if (orgId) {
      paramCount++;
      conditions.push(`t.org_id = $${paramCount}`);
      params.push(orgId);
    }

    if (assignedToUserId) {
      paramCount++;
      conditions.push(`t.assigned_to_user_id = $${paramCount}`);
      params.push(assignedToUserId);
    }

    if (assignedToPatientId) {
      paramCount++;
      conditions.push(`t.assigned_to_patient_id = $${paramCount}`);
      params.push(assignedToPatientId);
    }

    if (assignedToPoolId) {
      paramCount++;
      conditions.push(`t.assigned_to_pool_id = $${paramCount}`);
      params.push(assignedToPoolId);
    }

    if (createdByUserId) {
      paramCount++;
      conditions.push(`t.assigned_by_user_id = $${paramCount}`);
      params.push(createdByUserId);
    }

    if (patientId) {
      paramCount++;
      conditions.push(`t.patient_id = $${paramCount}`);
      params.push(patientId);
    }

    if (status) {
      if (Array.isArray(status)) {
        paramCount++;
        conditions.push(`t.status = ANY($${paramCount})`);
        params.push(status);
      } else {
        paramCount++;
        conditions.push(`t.status = $${paramCount}`);
        params.push(status);
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        paramCount++;
        conditions.push(`t.priority = ANY($${paramCount})`);
        params.push(priority);
      } else {
        paramCount++;
        conditions.push(`t.priority = $${paramCount}`);
        params.push(priority);
      }
    }

    if (taskType) {
      paramCount++;
      conditions.push(`t.task_type = $${paramCount}`);
      params.push(taskType);
    }

    if (category) {
      paramCount++;
      conditions.push(`t.category = $${paramCount}`);
      params.push(category);
    }

    if (labels && labels.length > 0) {
      paramCount++;
      conditions.push(`t.labels && $${paramCount}`);
      params.push(labels);
    }

    if (dueAfter) {
      paramCount++;
      conditions.push(`t.due_date >= $${paramCount}`);
      params.push(dueAfter);
    }

    if (dueBefore) {
      paramCount++;
      conditions.push(`t.due_date <= $${paramCount}`);
      params.push(dueBefore);
    }

    if (isOverdue) {
      conditions.push(`t.due_date < CURRENT_TIMESTAMP`);
      conditions.push(`t.status IN ('ready', 'in-progress', 'accepted')`);
    }

    if (appointmentId) {
      paramCount++;
      conditions.push(`t.appointment_id = $${paramCount}`);
      params.push(appointmentId);
    }

    if (formId) {
      paramCount++;
      conditions.push(`t.form_id = $${paramCount}`);
      params.push(formId);
    }

    if (orderId) {
      paramCount++;
      conditions.push(`t.order_id = $${paramCount}`);
      params.push(orderId);
    }

    if (searchTerm) {
      paramCount++;
      conditions.push(`(
        t.description ILIKE $${paramCount} OR
        t.identifier ILIKE $${paramCount}
      )`);
      params.push(`%${searchTerm}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM tasks t ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get tasks
    const allowedSortFields = ['due_date', 'created_at', 'priority', 'status'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'due_date';
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const tasksResult = await query(
      `SELECT
        t.*,
        u.name as assigned_to_user_name,
        p.resource->'name'->0->>'text' as assigned_to_patient_name,
        creator.name as assigned_by_user_name,
        pat.resource->'name'->0->>'text' as patient_name,
        tp.name as pool_name,
        (SELECT COUNT(*) FROM task_subtasks WHERE parent_task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM task_subtasks WHERE parent_task_id = t.id AND status = 'completed') as completed_subtask_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to_user_id = u.id
      LEFT JOIN fhir_patients p ON t.assigned_to_patient_id = p.id
      LEFT JOIN users creator ON t.assigned_by_user_id = creator.id
      LEFT JOIN fhir_patients pat ON t.patient_id = pat.id
      LEFT JOIN task_pools tp ON t.assigned_to_pool_id = tp.id
      ${whereClause}
      ORDER BY t.${validSortBy} ${validSortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    );

    return {
      tasks: tasksResult.rows,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Update task
   */
  async updateTask(taskId, updates, actorUserId) {
    return await transaction(async (client) => {
      // Get current task
      const currentResult = await client.query(
        'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL',
        [taskId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Task not found');
      }

      const currentTask = currentResult.rows[0];
      const changes = {};

      // Build update query dynamically
      const updateFields = [];
      const params = [taskId];
      let paramCount = 1;

      const allowedFields = [
        'description', 'status', 'priority', 'due_date', 'category',
        'labels', 'assigned_to_user_id', 'assigned_to_patient_id', 'assigned_to_pool_id',
        'business_status', 'show_assignee', 'metadata'
      ];

      for (const field of allowedFields) {
        if (updates.hasOwnProperty(field)) {
          paramCount++;

          // Handle JSON fields
          if (field === 'metadata') {
            updateFields.push(`${field} = $${paramCount}::jsonb`);
            params.push(JSON.stringify(updates[field]));
          } else if (field === 'labels') {
            updateFields.push(`${field} = $${paramCount}`);
            params.push(updates[field]);
          } else {
            updateFields.push(`${field} = $${paramCount}`);
            params.push(updates[field]);
          }

          changes[field] = { old: currentTask[field], new: updates[field] };
        }
      }

      if (updateFields.length === 0) {
        return currentTask;
      }

      // Auto-set completed_at if status changed to completed
      if (updates.status === 'completed' && currentTask.status !== 'completed') {
        paramCount++;
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
        updateFields.push(`completed_by_user_id = $${paramCount}`);
        params.push(actorUserId);
      }

      const updateResult = await client.query(
        `UPDATE tasks
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        params
      );

      const updatedTask = updateResult.rows[0];

      // Log history
      let action = 'updated';
      if (updates.status && updates.status !== currentTask.status) {
        if (updates.status === 'completed') action = 'completed';
        else if (updates.status === 'cancelled') action = 'cancelled';
        else action = 'status_changed';
      } else if (updates.assigned_to_user_id || updates.assigned_to_patient_id || updates.assigned_to_pool_id) {
        action = 'reassigned';
      }

      await this.logTaskHistory(taskId, action, changes, actorUserId, 'user', client);

      // Create notifications for status changes or reassignments
      if (action === 'reassigned') {
        await this.createTaskNotifications(updatedTask, 'task_assigned', client);
      } else if (action === 'completed') {
        await this.createTaskNotifications(updatedTask, 'task_completed', client);
      } else if (action === 'status_changed') {
        await this.createTaskNotifications(updatedTask, 'task_updated', client);
      }

      // Trigger webhooks
      await this.triggerWebhooks(updatedTask.org_id, `task.${action}`, updatedTask);

      return await this.getTaskById(taskId);
    });
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId, actorUserId) {
    return await transaction(async (client) => {
      const result = await client.query(
        `UPDATE tasks
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [taskId]
      );

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }

      await this.logTaskHistory(taskId, 'deleted', {}, actorUserId, 'user', client);

      return { success: true, message: 'Task deleted successfully' };
    });
  }

  /**
   * Claim task from pool
   */
  async claimTask(taskId, userId) {
    return await transaction(async (client) => {
      const taskResult = await client.query(
        `SELECT t.*, tp.settings
         FROM tasks t
         LEFT JOIN task_pools tp ON t.assigned_to_pool_id = tp.id
         WHERE t.id = $1 AND t.deleted_at IS NULL`,
        [taskId]
      );

      if (taskResult.rows.length === 0) {
        throw new Error('Task not found');
      }

      const task = taskResult.rows[0];

      if (!task.assigned_to_pool_id) {
        throw new Error('Task is not assigned to a pool');
      }

      // Check if user is member of the pool
      const memberResult = await client.query(
        'SELECT * FROM task_pool_members WHERE pool_id = $1 AND user_id = $2',
        [task.assigned_to_pool_id, userId]
      );

      if (memberResult.rows.length === 0) {
        throw new Error('User is not a member of this task pool');
      }

      // Check pool settings
      const settings = task.settings || {};
      if (settings.allow_claiming === false) {
        throw new Error('Task claiming is not allowed for this pool');
      }

      // Claim the task
      const updateResult = await client.query(
        `UPDATE tasks
         SET assigned_to_user_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [userId, taskId]
      );

      await this.logTaskHistory(
        taskId,
        'claimed',
        { assigned_to_user_id: { old: null, new: userId } },
        userId,
        'user',
        client
      );

      await this.createTaskNotifications(updateResult.rows[0], 'task_claimed', client);

      return await this.getTaskById(taskId);
    });
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, commentData, actorUserId, actorType = 'user') {
    return await transaction(async (client) => {
      const { commentText, authorUserId, authorPatientId, mentionedUserIds = [], attachments = [] } = commentData;

      const commentResult = await client.query(
        `INSERT INTO task_comments (
          task_id, author_user_id, author_patient_id, author_type,
          comment_text, mentioned_user_ids, attachments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
        RETURNING *`,
        [
          taskId,
          authorUserId || actorUserId,
          authorPatientId,
          actorType,
          commentText,
          mentionedUserIds,
          JSON.stringify(attachments)
        ]
      );

      // Create notifications for mentions
      if (mentionedUserIds && mentionedUserIds.length > 0) {
        for (const userId of mentionedUserIds) {
          await client.query(
            `INSERT INTO task_notifications (
              recipient_user_id, task_id, notification_type, title, message
            ) VALUES ($1, $2, 'mention', $3, $4)`,
            [
              userId,
              taskId,
              'You were mentioned in a task comment',
              commentText.substring(0, 200)
            ]
          );
        }
      }

      return commentResult.rows[0];
    });
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT
        c.*,
        u.name as author_user_name,
        u.email as author_user_email,
        p.resource->'name'->0->>'text' as author_patient_name
      FROM task_comments c
      LEFT JOIN users u ON c.author_user_id = u.id
      LEFT JOIN fhir_patients p ON c.author_patient_id = p.id
      WHERE c.task_id = $1 AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3`,
      [taskId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get task history
   */
  async getTaskHistory(taskId) {
    const result = await query(
      `SELECT
        h.*,
        u.name as actor_user_name
      FROM task_history h
      LEFT JOIN users u ON h.actor_user_id = u.id
      WHERE h.task_id = $1
      ORDER BY h.occurred_at DESC`,
      [taskId]
    );

    return result.rows;
  }

  /**
   * Manage subtasks
   */
  async addSubtask(parentTaskId, subtaskData) {
    const { title, description = '', sortOrder } = subtaskData;

    const result = await query(
      `INSERT INTO task_subtasks (parent_task_id, title, description, sort_order)
       VALUES ($1, $2, $3, COALESCE($4, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM task_subtasks WHERE parent_task_id = $1)))
       RETURNING *`,
      [parentTaskId, title, description, sortOrder]
    );

    return result.rows[0];
  }

  async updateSubtask(subtaskId, updates) {
    const { title, description, status } = updates;
    const fields = [];
    const params = [subtaskId];
    let paramCount = 1;

    if (title) {
      paramCount++;
      fields.push(`title = $${paramCount}`);
      params.push(title);
    }

    if (description !== undefined) {
      paramCount++;
      fields.push(`description = $${paramCount}`);
      params.push(description);
    }

    if (status) {
      paramCount++;
      fields.push(`status = $${paramCount}`);
      params.push(status);

      if (status === 'completed') {
        fields.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (fields.length === 0) return null;

    const result = await query(
      `UPDATE task_subtasks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      params
    );

    return result.rows[0];
  }

  /**
   * Task Pool Management
   */
  async createTaskPool(poolData, createdBy) {
    const { orgId, name, description, defaultAssigneeId, settings = {} } = poolData;

    return await transaction(async (client) => {
      const poolResult = await client.query(
        `INSERT INTO task_pools (org_id, name, description, default_assignee_id, settings, created_by)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6)
         RETURNING *`,
        [orgId, name, description, defaultAssigneeId, JSON.stringify(settings), createdBy]
      );

      const pool = poolResult.rows[0];

      // Add default assignee as pool member with 'lead' role
      await client.query(
        `INSERT INTO task_pool_members (pool_id, user_id, role, added_by)
         VALUES ($1, $2, 'lead', $3)`,
        [pool.id, defaultAssigneeId, createdBy]
      );

      return pool;
    });
  }

  async addPoolMember(poolId, userId, role = 'member', addedBy) {
    const result = await query(
      `INSERT INTO task_pool_members (pool_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pool_id, user_id) DO UPDATE SET role = $3, is_available = TRUE
       RETURNING *`,
      [poolId, userId, role, addedBy]
    );

    return result.rows[0];
  }

  async getPoolSettings(poolId, client = null) {
    const queryFn = client ? client.query.bind(client) : query;
    const result = await queryFn(
      'SELECT settings FROM task_pools WHERE id = $1',
      [poolId]
    );
    return result.rows.length > 0 ? result.rows[0].settings : {};
  }

  /**
   * Log task history
   */
  async logTaskHistory(taskId, action, changes, actorUserId, actorType = 'user', client = null) {
    const queryFn = client ? client.query.bind(client) : query;

    await queryFn(
      `INSERT INTO task_history (task_id, action, changes, actor_user_id, actor_type)
       VALUES ($1, $2, $3::jsonb, $4, $5)`,
      [taskId, action, JSON.stringify(changes), actorUserId, actorType]
    );
  }

  /**
   * Create task notifications
   */
  async createTaskNotifications(task, notificationType, client = null) {
    try {
      // Notify assignee
      if (task.assigned_to_user_id && notificationType === 'task_assigned') {
        await TaskNotificationService.createNotification({
          recipientUserId: task.assigned_to_user_id,
          taskId: task.id,
          notificationType,
          title: 'New task assigned to you',
          message: task.description || task.identifier,
          metadata: {
            priority: task.priority,
            dueDate: task.due_date,
            category: task.category
          }
        });
      }

      // Notify patient
      if (task.assigned_to_patient_id) {
        await TaskNotificationService.createNotification({
          recipientPatientId: task.assigned_to_patient_id,
          taskId: task.id,
          notificationType,
          title: notificationType === 'task_assigned' ? 'New task for you' : 'Task updated',
          message: task.description || task.identifier,
          metadata: {
            dueDate: task.due_date
          }
        });
      }

      // Notify pool members if assigned to pool
      if (task.assigned_to_pool_id && notificationType === 'task_assigned') {
        const queryFn = client ? client.query.bind(client) : query;
        const membersResult = await queryFn(
          'SELECT user_id FROM task_pool_members WHERE pool_id = $1 AND is_available = TRUE',
          [task.assigned_to_pool_id]
        );

        for (const member of membersResult.rows) {
          await TaskNotificationService.createNotification({
            recipientUserId: member.user_id,
            taskId: task.id,
            notificationType,
            title: 'New task in your pool',
            message: task.description || task.identifier,
            metadata: {
              poolId: task.assigned_to_pool_id,
              priority: task.priority,
              dueDate: task.due_date
            }
          });
        }
      }
    } catch (error) {
      console.error('Error creating task notifications:', error);
      // Don't throw - notification errors shouldn't break task operations
    }
  }

  /**
   * Trigger webhooks for task events
   */
  async triggerWebhooks(orgId, event, taskData, actorUserId = null) {
    try {
      await WebhookService.triggerWebhooks(orgId, event, taskData, actorUserId);
    } catch (error) {
      console.error(`Error triggering webhooks for ${event}:`, error);
      // Don't throw - webhook errors shouldn't break task operations
    }
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(orgId, filters = {}) {
    const { userId, startDate, endDate } = filters;

    let userCondition = '';
    let params = [orgId];
    let paramCount = 1;

    if (userId) {
      paramCount++;
      userCondition = `AND assigned_to_user_id = $${paramCount}`;
      params.push(userId);
    }

    if (startDate) {
      paramCount++;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      params.push(endDate);
    }

    const dateCondition = startDate && endDate
      ? `AND created_at BETWEEN $${paramCount - 1} AND $${paramCount}`
      : '';

    const result = await query(
      `SELECT
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status IN ('ready', 'in-progress', 'accepted')) as pending_tasks,
        COUNT(*) FILTER (WHERE due_date < CURRENT_TIMESTAMP AND status IN ('ready', 'in-progress', 'accepted')) as overdue_tasks,
        COUNT(*) FILTER (WHERE priority = 'stat') as stat_priority,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_priority,
        AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE completed_at IS NOT NULL) as avg_completion_hours,
        COUNT(*) FILTER (WHERE task_type = 'patient') as patient_tasks,
        COUNT(*) FILTER (WHERE task_type = 'internal') as internal_tasks
      FROM tasks
      WHERE org_id = $1 AND deleted_at IS NULL ${userCondition} ${dateCondition}`,
      params
    );

    return result.rows[0];
  }
}

module.exports = new TaskService();
