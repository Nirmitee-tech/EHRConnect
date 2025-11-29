const taskService = require('../services/task.service');

/**
 * Task-Form Integration
 * Automatically creates and manages tasks for forms/questionnaires
 */

class TaskFormIntegration {
  /**
   * Create a task when a form is sent to a patient
   * Called after form assignment/sending
   */
  static async createTaskForForm(form, patientId, orgId, createdByUserId) {
    try {
      // Validate required fields
      if (!form || !patientId || !orgId) {
        throw new Error('Form, patient ID, and org ID are required');
      }

      // Determine task description
      const formTitle = form.title || form.name || `Form ${form.id}`;
      const description = `Complete form: ${formTitle}`;

      // Calculate due date (default 7 days from now, or use form's expiry)
      let dueDate;
      if (form.expiryDate || form.expires_at) {
        dueDate = new Date(form.expiryDate || form.expires_at);
      } else {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
      }

      // Determine priority based on form urgency
      let priority = 'routine';
      if (form.priority) {
        priority = form.priority;
      } else if (form.urgent || form.isUrgent) {
        priority = 'urgent';
      }

      // Create the task
      const taskData = {
        orgId,
        description,
        assignedToPatientId: patientId, // Assign directly to patient
        patientId,
        formId: form.id,
        dueDate: dueDate.toISOString(),
        priority,
        intent: 'order',
        status: 'ready',
        category: 'form_completion',
        taskType: 'fulfill',
        labels: ['form', 'patient-task'],
        showAssignee: false, // Hide assignee for patient privacy
        metadata: {
          formType: form.type || 'questionnaire',
          formTitle,
          formStatus: form.status || 'active',
          autoCreated: true,
          createdFrom: 'form_assignment',
          sentAt: new Date().toISOString()
        }
      };

      // If form has an associated practitioner, add them to metadata
      if (form.practitionerId || form.assignedByUserId) {
        taskData.createdByUserId = form.practitionerId || form.assignedByUserId;
        taskData.metadata.assignedByPractitioner = form.practitionerId || form.assignedByUserId;
      }

      const task = await taskService.createTask(taskData, createdByUserId || 'system');

      console.log(`Created task ${task.id} for form ${form.id}`);

      return task;

    } catch (error) {
      console.error('Error creating task for form:', error);
      // Don't throw - task creation failure shouldn't break form sending
      return null;
    }
  }

  /**
   * Complete task when form is submitted
   */
  static async completeTaskForForm(formId, orgId, completedByUserId) {
    try {
      const { query } = require('../database/connection');

      // Find tasks linked to this form
      const result = await query(
        `SELECT * FROM tasks
         WHERE form_id = $1
         AND org_id = $2
         AND deleted_at IS NULL
         AND status NOT IN ('completed', 'cancelled')`,
        [formId, orgId]
      );

      if (result.rows.length === 0) {
        console.log(`No active tasks found for form ${formId}`);
        return null;
      }

      const completedTasks = [];

      for (const task of result.rows) {
        const updatedTask = await taskService.updateTask(
          task.id,
          {
            status: 'completed',
            completedAt: new Date().toISOString(),
            metadata: {
              ...task.metadata,
              formSubmittedAt: new Date().toISOString(),
              completedBy: completedByUserId || 'patient'
            }
          },
          completedByUserId || 'system'
        );

        completedTasks.push(updatedTask);
      }

      console.log(`Completed ${completedTasks.length} task(s) for form ${formId}`);

      return completedTasks;

    } catch (error) {
      console.error('Error completing tasks for form:', error);
      // Don't throw - task completion failure shouldn't break form submission
      return null;
    }
  }

  /**
   * Update task when form status changes
   */
  static async updateTaskForForm(formId, formStatus, orgId, updatedByUserId) {
    try {
      const { query } = require('../database/connection');

      // Find tasks linked to this form
      const result = await query(
        `SELECT * FROM tasks
         WHERE form_id = $1
         AND org_id = $2
         AND deleted_at IS NULL`,
        [formId, orgId]
      );

      if (result.rows.length === 0) {
        console.log(`No tasks found for form ${formId}`);
        return null;
      }

      const task = result.rows[0];

      // Determine task status based on form status
      let taskStatus = task.status;
      let shouldUpdate = false;

      switch (formStatus) {
        case 'completed':
        case 'submitted':
          if (task.status !== 'completed') {
            taskStatus = 'completed';
            shouldUpdate = true;
          }
          break;

        case 'cancelled':
        case 'expired':
          if (task.status !== 'cancelled') {
            taskStatus = 'cancelled';
            shouldUpdate = true;
          }
          break;

        case 'in-progress':
        case 'started':
          if (task.status === 'ready') {
            taskStatus = 'in-progress';
            shouldUpdate = true;
          }
          break;
      }

      if (shouldUpdate) {
        const updatedTask = await taskService.updateTask(
          task.id,
          {
            status: taskStatus,
            metadata: {
              ...task.metadata,
              formStatus,
              lastSyncedAt: new Date().toISOString()
            }
          },
          updatedByUserId || 'system'
        );

        console.log(`Updated task ${task.id} status to ${taskStatus} for form ${formId}`);

        return updatedTask;
      }

      return task;

    } catch (error) {
      console.error('Error updating task for form:', error);
      // Don't throw - task update failure shouldn't break form update
      return null;
    }
  }

  /**
   * Cancel task when form is cancelled or expired
   */
  static async cancelTaskForForm(formId, orgId, cancelledByUserId, reason = 'Form cancelled') {
    try {
      const { query } = require('../database/connection');

      const result = await query(
        `SELECT * FROM tasks
         WHERE form_id = $1
         AND org_id = $2
         AND deleted_at IS NULL
         AND status NOT IN ('completed', 'cancelled')`,
        [formId, orgId]
      );

      if (result.rows.length === 0) {
        console.log(`No active tasks found for form ${formId}`);
        return null;
      }

      const cancelledTasks = [];

      for (const task of result.rows) {
        const updatedTask = await taskService.updateTask(
          task.id,
          {
            status: 'cancelled',
            metadata: {
              ...task.metadata,
              cancelledReason: reason,
              cancelledAt: new Date().toISOString()
            }
          },
          cancelledByUserId || 'system'
        );

        cancelledTasks.push(updatedTask);
      }

      console.log(`Cancelled ${cancelledTasks.length} task(s) for form ${formId}`);

      return cancelledTasks;

    } catch (error) {
      console.error('Error cancelling tasks for form:', error);
      // Don't throw - task cancellation failure shouldn't break form cancellation
      return null;
    }
  }

  /**
   * Get tasks for a form
   */
  static async getTasksForForm(formId, orgId) {
    try {
      const filters = {
        orgId,
        formId
      };

      const result = await taskService.searchTasks(filters, { limit: 100, offset: 0 });

      return result.tasks;

    } catch (error) {
      console.error('Error getting tasks for form:', error);
      return [];
    }
  }

  /**
   * Create reminder task for incomplete form
   */
  static async createFormReminderTask(formId, patientId, orgId, practitionerId, reminderDetails) {
    try {
      const { query } = require('../database/connection');

      // Get original form task
      const result = await query(
        `SELECT * FROM tasks
         WHERE form_id = $1
         AND assigned_to_patient_id = $2
         AND org_id = $3
         AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [formId, patientId, orgId]
      );

      if (result.rows.length === 0) {
        throw new Error('Original form task not found');
      }

      const originalTask = result.rows[0];

      // Calculate reminder due date (default 1 day from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (reminderDetails?.days || 1));

      const taskData = {
        orgId,
        description: reminderDetails?.description || `Reminder: ${originalTask.description}`,
        assignedToUserId: practitionerId, // Assign reminder to practitioner
        patientId,
        formId,
        dueDate: dueDate.toISOString(),
        priority: reminderDetails?.priority || originalTask.priority,
        intent: 'order',
        status: 'ready',
        category: 'reminder',
        taskType: 'fulfill',
        labels: ['reminder', 'form', 'follow-up'],
        metadata: {
          originalTaskId: originalTask.id,
          reminderType: 'incomplete_form',
          autoCreated: true,
          createdFrom: 'form_reminder'
        }
      };

      const task = await taskService.createTask(taskData, 'system');

      console.log(`Created reminder task ${task.id} for incomplete form ${formId}`);

      return task;

    } catch (error) {
      console.error('Error creating reminder task for form:', error);
      throw error;
    }
  }

  /**
   * Link multiple forms to a single task
   * Useful for multi-step form workflows
   */
  static async linkFormsToTask(taskId, formIds, orgId) {
    try {
      const { query } = require('../database/connection');

      // Update task metadata to include all form IDs
      const result = await query(
        `UPDATE tasks
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{linkedFormIds}',
           $1::jsonb
         )
         WHERE id = $2
         AND org_id = $3
         AND deleted_at IS NULL
         RETURNING *`,
        [JSON.stringify(formIds), taskId, orgId]
      );

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }

      console.log(`Linked ${formIds.length} forms to task ${taskId}`);

      return result.rows[0];

    } catch (error) {
      console.error('Error linking forms to task:', error);
      throw error;
    }
  }
}

module.exports = TaskFormIntegration;
