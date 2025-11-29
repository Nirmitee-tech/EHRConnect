const taskService = require('../services/task.service');

/**
 * Task-Appointment Integration
 * Automatically creates and manages tasks for appointments
 */

class TaskAppointmentIntegration {
  /**
   * Create a task when an appointment is scheduled
   * Called after appointment creation
   */
  static async createTaskForAppointment(appointment, orgId, createdByUserId) {
    try {
      // Only create tasks for certain appointment statuses
      const validStatuses = ['proposed', 'pending', 'booked', 'arrived'];
      if (!validStatuses.includes(appointment.status)) {
        console.log(`Skipping task creation for appointment with status: ${appointment.status}`);
        return null;
      }

      // Extract patient ID from participants
      const patientParticipant = appointment.participant?.find(p =>
        p.actor?.reference?.startsWith('Patient/')
      );
      const patientId = patientParticipant?.actor?.reference?.replace('Patient/', '');

      // Extract practitioner ID from participants
      const practitionerParticipant = appointment.participant?.find(p =>
        p.actor?.reference?.startsWith('Practitioner/')
      );
      const practitionerId = practitionerParticipant?.actor?.reference?.replace('Practitioner/', '');

      if (!patientId && !practitionerId) {
        console.log('Cannot create task: No patient or practitioner found in appointment');
        return null;
      }

      // Determine task description based on appointment type
      const appointmentType = appointment.appointmentType?.coding?.[0]?.display ||
                             appointment.appointmentType?.text ||
                             'appointment';

      const description = `Prepare for ${appointmentType} with patient`;

      // Calculate due date (1 hour before appointment start time)
      const appointmentStart = new Date(appointment.start);
      const dueDate = new Date(appointmentStart.getTime() - (60 * 60 * 1000)); // 1 hour before

      // Determine priority based on appointment priority
      let priority = 'routine';
      if (appointment.priority > 0) {
        if (appointment.priority >= 4) {
          priority = 'urgent';
        } else if (appointment.priority >= 2) {
          priority = 'stat';
        }
      }

      // Create the task
      const taskData = {
        orgId,
        description,
        assignedToUserId: practitionerId, // Assign to the practitioner
        patientId,
        appointmentId: appointment.id,
        dueDate: dueDate.toISOString(),
        priority,
        intent: 'order',
        status: 'ready',
        category: 'appointment_prep',
        taskType: 'fulfill',
        labels: ['appointment', appointmentType],
        metadata: {
          appointmentStart: appointment.start,
          appointmentEnd: appointment.end,
          appointmentStatus: appointment.status,
          autoCreated: true,
          createdFrom: 'appointment'
        }
      };

      const task = await taskService.createTask(taskData, createdByUserId || 'system');

      console.log(`Created task ${task.id} for appointment ${appointment.id}`);

      return task;

    } catch (error) {
      console.error('Error creating task for appointment:', error);
      // Don't throw - task creation failure shouldn't break appointment creation
      return null;
    }
  }

  /**
   * Update task when appointment status changes
   */
  static async updateTaskForAppointment(appointment, orgId, updatedByUserId) {
    try {
      // Find tasks linked to this appointment
      const { query } = require('../database/connection');
      const result = await query(
        `SELECT * FROM tasks
         WHERE appointment_id = $1
         AND org_id = $2
         AND deleted_at IS NULL`,
        [appointment.id, orgId]
      );

      if (result.rows.length === 0) {
        console.log(`No tasks found for appointment ${appointment.id}`);
        return null;
      }

      const task = result.rows[0];

      // Determine task status based on appointment status
      let taskStatus = task.status;
      let shouldUpdate = false;

      switch (appointment.status) {
        case 'fulfilled':
        case 'arrived':
          if (task.status !== 'completed') {
            taskStatus = 'completed';
            shouldUpdate = true;
          }
          break;

        case 'cancelled':
        case 'noshow':
          if (task.status !== 'cancelled') {
            taskStatus = 'cancelled';
            shouldUpdate = true;
          }
          break;

        case 'proposed':
        case 'pending':
        case 'booked':
          if (task.status === 'draft') {
            taskStatus = 'ready';
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
              appointmentStatus: appointment.status,
              lastSyncedAt: new Date().toISOString()
            }
          },
          updatedByUserId || 'system'
        );

        console.log(`Updated task ${task.id} status to ${taskStatus} for appointment ${appointment.id}`);

        return updatedTask;
      }

      return task;

    } catch (error) {
      console.error('Error updating task for appointment:', error);
      // Don't throw - task update failure shouldn't break appointment update
      return null;
    }
  }

  /**
   * Cancel task when appointment is cancelled
   */
  static async cancelTaskForAppointment(appointmentId, orgId, cancelledByUserId) {
    try {
      const { query } = require('../database/connection');
      const result = await query(
        `SELECT * FROM tasks
         WHERE appointment_id = $1
         AND org_id = $2
         AND deleted_at IS NULL
         AND status NOT IN ('completed', 'cancelled')`,
        [appointmentId, orgId]
      );

      if (result.rows.length === 0) {
        console.log(`No active tasks found for cancelled appointment ${appointmentId}`);
        return null;
      }

      const updatedTasks = [];

      for (const task of result.rows) {
        const updatedTask = await taskService.updateTask(
          task.id,
          {
            status: 'cancelled',
            metadata: {
              ...task.metadata,
              cancelledReason: 'Appointment cancelled',
              cancelledAt: new Date().toISOString()
            }
          },
          cancelledByUserId || 'system'
        );

        updatedTasks.push(updatedTask);
      }

      console.log(`Cancelled ${updatedTasks.length} task(s) for appointment ${appointmentId}`);

      return updatedTasks;

    } catch (error) {
      console.error('Error cancelling tasks for appointment:', error);
      // Don't throw - task cancellation failure shouldn't break appointment cancellation
      return null;
    }
  }

  /**
   * Get tasks for an appointment
   */
  static async getTasksForAppointment(appointmentId, orgId) {
    try {
      const filters = {
        orgId,
        appointmentId
      };

      const result = await taskService.searchTasks(filters, { limit: 100, offset: 0 });

      return result.tasks;

    } catch (error) {
      console.error('Error getting tasks for appointment:', error);
      return [];
    }
  }

  /**
   * Create follow-up task after appointment completion
   */
  static async createFollowUpTask(appointment, orgId, createdByUserId, followUpDetails) {
    try {
      const patientParticipant = appointment.participant?.find(p =>
        p.actor?.reference?.startsWith('Patient/')
      );
      const patientId = patientParticipant?.actor?.reference?.replace('Patient/', '');

      const practitionerParticipant = appointment.participant?.find(p =>
        p.actor?.reference?.startsWith('Practitioner/')
      );
      const practitionerId = practitionerParticipant?.actor?.reference?.replace('Practitioner/', '');

      if (!patientId || !practitionerId) {
        throw new Error('Patient and practitioner required for follow-up task');
      }

      // Calculate due date for follow-up (default 7 days after appointment)
      const appointmentEnd = new Date(appointment.end || appointment.start);
      const followUpDays = followUpDetails?.days || 7;
      const dueDate = new Date(appointmentEnd.getTime() + (followUpDays * 24 * 60 * 60 * 1000));

      const taskData = {
        orgId,
        description: followUpDetails?.description || `Follow up with patient after ${appointment.appointmentType?.text || 'appointment'}`,
        assignedToUserId: practitionerId,
        patientId,
        appointmentId: appointment.id,
        dueDate: dueDate.toISOString(),
        priority: followUpDetails?.priority || 'routine',
        intent: 'order',
        status: 'ready',
        category: 'follow_up',
        taskType: 'fulfill',
        labels: ['follow-up', 'post-appointment'],
        metadata: {
          relatedAppointmentId: appointment.id,
          followUpType: followUpDetails?.type || 'general',
          autoCreated: true,
          createdFrom: 'appointment_completion'
        }
      };

      const task = await taskService.createTask(taskData, createdByUserId || 'system');

      console.log(`Created follow-up task ${task.id} for appointment ${appointment.id}`);

      return task;

    } catch (error) {
      console.error('Error creating follow-up task:', error);
      throw error;
    }
  }
}

module.exports = TaskAppointmentIntegration;
