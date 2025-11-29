const axios = require('axios');
const crypto = require('crypto');
const { query, transaction } = require('../database/connection');

/**
 * Webhook Service
 * Handles webhook delivery for task events
 */

class WebhookService {
  /**
   * Get active webhooks for an organization
   */
  static async getActiveWebhooks(orgId, eventType) {
    const result = await query(
      `SELECT * FROM task_webhooks
       WHERE org_id = $1
       AND is_active = TRUE
       AND $2 = ANY(events)
       ORDER BY created_at`,
      [orgId, eventType]
    );

    return result.rows;
  }

  /**
   * Check if webhook matches task filters
   */
  static matchesFilters(task, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return true;
    }

    // Check status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) {
        return false;
      }
    }

    // Check priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) {
        return false;
      }
    }

    // Check category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(task.category)) {
        return false;
      }
    }

    // Check assignee filter
    if (filters.assignedToUserId) {
      if (task.assigned_to_user_id !== filters.assignedToUserId) {
        return false;
      }
    }

    // Check patient filter
    if (filters.patientId) {
      if (task.patient_id !== filters.patientId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  static generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Build authentication headers
   */
  static buildAuthHeaders(authConfig) {
    if (!authConfig || !authConfig.type) {
      return {};
    }

    switch (authConfig.type) {
      case 'basic':
        const basicAuth = Buffer.from(
          `${authConfig.username}:${authConfig.password}`
        ).toString('base64');
        return { Authorization: `Basic ${basicAuth}` };

      case 'bearer':
        return { Authorization: `Bearer ${authConfig.token}` };

      case 'api_key':
        if (authConfig.header) {
          return { [authConfig.header]: authConfig.key };
        }
        return { 'X-API-Key': authConfig.key };

      default:
        return {};
    }
  }

  /**
   * Deliver webhook to a single endpoint
   */
  static async deliverWebhook(webhook, payload, attemptNumber = 1) {
    const startTime = Date.now();
    const webhookId = webhook.id;
    const maxAttempts = parseInt(process.env.TASK_WEBHOOK_RETRY_ATTEMPTS) || 3;
    const timeout = parseInt(process.env.TASK_WEBHOOK_TIMEOUT) || 30000;

    try {
      // Build headers
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'EHR-Connect-Webhook/1.0',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery': crypto.randomUUID(),
        'X-Webhook-Timestamp': new Date().toISOString(),
        ...this.buildAuthHeaders(webhook.auth_config)
      };

      // Add signature if secret is configured
      const webhookSecret = process.env.WEBHOOK_SECRET_KEY || webhook.secret_key;
      if (webhookSecret) {
        const signature = this.generateSignature(payload, webhookSecret);
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }

      // Make HTTP request
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout,
        validateStatus: (status) => status >= 200 && status < 300
      });

      const duration = Date.now() - startTime;

      // Log successful delivery
      await this.logWebhookDelivery({
        webhookId,
        taskId: payload.data.id,
        event: payload.event,
        status: 'success',
        statusCode: response.status,
        attemptNumber,
        duration,
        response: {
          status: response.status,
          headers: response.headers,
          data: response.data
        }
      });

      return { success: true, statusCode: response.status };

    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error.response?.status || 0;
      const errorMessage = error.message;

      // Log failed delivery
      await this.logWebhookDelivery({
        webhookId,
        taskId: payload.data.id,
        event: payload.event,
        status: 'failed',
        statusCode,
        attemptNumber,
        duration,
        error: errorMessage,
        response: error.response ? {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        } : null
      });

      // Retry with exponential backoff
      if (attemptNumber < maxAttempts) {
        const delay = Math.pow(2, attemptNumber) * 1000; // 2s, 4s, 8s
        console.log(`Webhook delivery failed, retrying in ${delay}ms (attempt ${attemptNumber + 1}/${maxAttempts})`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.deliverWebhook(webhook, payload, attemptNumber + 1);
      }

      console.error(`Webhook delivery failed after ${maxAttempts} attempts:`, errorMessage);
      return { success: false, statusCode, error: errorMessage };
    }
  }

  /**
   * Log webhook delivery attempt
   */
  static async logWebhookDelivery(logData) {
    try {
      await query(
        `INSERT INTO task_webhook_logs
         (webhook_id, task_id, event, status, status_code, attempt_number, duration_ms, error_message, response_data, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
        [
          logData.webhookId,
          logData.taskId,
          logData.event,
          logData.status,
          logData.statusCode,
          logData.attemptNumber,
          logData.duration,
          logData.error || null,
          JSON.stringify(logData.response || {})
        ]
      );
    } catch (error) {
      console.error('Error logging webhook delivery:', error);
    }
  }

  /**
   * Trigger webhooks for a task event
   */
  static async triggerWebhooks(orgId, eventType, task, actorUserId = null) {
    try {
      // Get active webhooks for this event type
      const webhooks = await this.getActiveWebhooks(orgId, eventType);

      if (webhooks.length === 0) {
        return { triggered: 0, successful: 0, failed: 0 };
      }

      console.log(`Triggering ${webhooks.length} webhook(s) for event: ${eventType}`);

      const results = {
        triggered: webhooks.length,
        successful: 0,
        failed: 0
      };

      // Build webhook payload
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        organization_id: orgId,
        actor_user_id: actorUserId,
        data: {
          id: task.id,
          identifier: task.identifier,
          status: task.status,
          priority: task.priority,
          description: task.description,
          category: task.category,
          labels: task.labels,
          assigned_to_user_id: task.assigned_to_user_id,
          assigned_to_patient_id: task.assigned_to_patient_id,
          assigned_to_pool_id: task.assigned_to_pool_id,
          patient_id: task.patient_id,
          due_date: task.due_date,
          completed_at: task.completed_at,
          appointment_id: task.appointment_id,
          form_id: task.form_id,
          order_id: task.order_id,
          metadata: task.metadata,
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      };

      // Deliver webhooks (in parallel for performance)
      const deliveryPromises = webhooks.map(async (webhook) => {
        // Check if task matches webhook filters
        if (!this.matchesFilters(task, webhook.filters)) {
          console.log(`Task does not match webhook filters for webhook ${webhook.id}`);
          return { success: true, skipped: true };
        }

        return this.deliverWebhook(webhook, payload);
      });

      const deliveryResults = await Promise.allSettled(deliveryPromises);

      // Count successful and failed deliveries
      deliveryResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.skipped) {
            results.triggered--;
          } else if (result.value.success) {
            results.successful++;
          } else {
            results.failed++;
          }
        } else {
          results.failed++;
        }
      });

      console.log(`Webhook delivery results: ${results.successful} successful, ${results.failed} failed`);

      return results;

    } catch (error) {
      console.error('Error triggering webhooks:', error);
      throw error;
    }
  }

  /**
   * Test webhook delivery
   */
  static async testWebhook(webhookId) {
    try {
      const result = await query(
        'SELECT * FROM task_webhooks WHERE id = $1',
        [webhookId]
      );

      if (result.rows.length === 0) {
        throw new Error('Webhook not found');
      }

      const webhook = result.rows[0];

      // Create test payload
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        organization_id: webhook.org_id,
        data: {
          message: 'This is a test webhook delivery',
          webhook_id: webhookId
        }
      };

      const deliveryResult = await this.deliverWebhook(webhook, testPayload);

      return {
        success: deliveryResult.success,
        statusCode: deliveryResult.statusCode,
        error: deliveryResult.error
      };

    } catch (error) {
      console.error('Error testing webhook:', error);
      throw error;
    }
  }

  /**
   * Get webhook delivery logs
   */
  static async getWebhookLogs(webhookId, limit = 50) {
    const result = await query(
      `SELECT * FROM task_webhook_logs
       WHERE webhook_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [webhookId, limit]
    );

    return result.rows;
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(webhookId, days = 7) {
    const result = await query(
      `SELECT
         COUNT(*) as total_deliveries,
         COUNT(*) FILTER (WHERE status = 'success') as successful,
         COUNT(*) FILTER (WHERE status = 'failed') as failed,
         AVG(duration_ms) as avg_duration_ms,
         MAX(created_at) as last_delivery
       FROM task_webhook_logs
       WHERE webhook_id = $1
       AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'`,
      [webhookId]
    );

    return result.rows[0];
  }
}

module.exports = WebhookService;
