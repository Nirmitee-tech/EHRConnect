/**
 * Fixed Webhook Service with Backpressure and Timeouts
 * 
 * Fixes:
 * 1. Backpressure handling - limit concurrent webhook deliveries
 * 2. Timeout configuration for external API calls
 * 3. Retry logic with exponential backoff
 * 4. Better error handling and logging
 */

const axios = require('axios');
const crypto = require('crypto');
const { query, transaction } = require('../database/connection');
const logger = require('../utils/logger');

/**
 * Webhook Service with Performance Optimizations
 */
class WebhookService {
  constructor() {
    // Configure axios with timeouts
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 second timeout
      maxRedirects: 3,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
  }

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

    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) {
        return false;
      }
    }

    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) {
        return false;
      }
    }

    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(task.category)) {
        return false;
      }
    }

    if (filters.assignedToUserId) {
      if (task.assigned_to_user_id !== filters.assignedToUserId) {
        return false;
      }
    }

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
   * Trigger webhooks for task event - WITH BACKPRESSURE
   */
  static async triggerWebhooks(orgId, eventType, task) {
    try {
      const webhooks = await this.getActiveWebhooks(orgId, eventType);

      if (webhooks.length === 0) {
        return { success: true, delivered: 0 };
      }

      // Filter webhooks based on task properties
      const matchingWebhooks = webhooks.filter((webhook) =>
        this.matchesFilters(task, webhook.filters)
      );

      if (matchingWebhooks.length === 0) {
        return { success: true, delivered: 0 };
      }

      logger.info('Triggering webhooks', {
        orgId,
        eventType,
        taskId: task.id,
        webhookCount: matchingWebhooks.length
      });

      // Deliver webhooks with concurrency limit (backpressure)
      const results = await this.deliverWebhooksWithBackpressure(
        matchingWebhooks,
        task,
        eventType
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info('Webhook delivery completed', {
        total: matchingWebhooks.length,
        successful,
        failed
      });

      return {
        success: true,
        delivered: successful,
        failed,
        results,
      };
    } catch (error) {
      logger.error('Error triggering webhooks', {
        orgId,
        eventType,
        taskId: task.id,
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Deliver webhooks with concurrency limit to prevent memory spikes
   */
  static async deliverWebhooksWithBackpressure(webhooks, task, eventType, concurrency = 10) {
    const results = [];
    
    // Process webhooks in batches
    for (let i = 0; i < webhooks.length; i += concurrency) {
      const batch = webhooks.slice(i, i + concurrency);
      
      const batchResults = await Promise.allSettled(
        batch.map(webhook => this.deliverWebhook(webhook, task, eventType))
      );
      
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Deliver single webhook with retry logic
   */
  static async deliverWebhook(webhook, task, eventType, retries = 3) {
    const payload = {
      event: eventType,
      task: {
        id: task.id,
        identifier: task.identifier,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        due_date: task.due_date,
        patient_id: task.patient_id,
        assigned_to_user_id: task.assigned_to_user_id,
        assigned_to_pool_id: task.assigned_to_pool_id,
      },
      timestamp: new Date().toISOString(),
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': eventType,
    };

    // Add signature if secret is configured
    if (webhook.secret) {
      const signature = this.generateSignature(payload, webhook.secret);
      headers['X-Webhook-Signature'] = signature;
    }

    // Retry with exponential backoff
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const startTime = Date.now();
        
        const response = await axios.post(webhook.url, payload, {
          headers,
          timeout: 10000, // 10 second timeout
          maxRedirects: 3,
        });
        
        const duration = Date.now() - startTime;

        // Log delivery
        await this.logWebhookDelivery(
          webhook.id,
          task.id,
          response.status,
          duration,
          true,
          null
        );

        logger.debug('Webhook delivered successfully', {
          webhookId: webhook.id,
          url: webhook.url,
          status: response.status,
          duration: `${duration}ms`,
          attempt: attempt + 1
        });

        return {
          webhookId: webhook.id,
          success: true,
          status: response.status,
          duration,
        };
      } catch (error) {
        const isLastAttempt = attempt === retries - 1;
        
        if (isLastAttempt) {
          // Log failed delivery
          await this.logWebhookDelivery(
            webhook.id,
            task.id,
            error.response?.status || 0,
            0,
            false,
            error.message
          );

          logger.error('Webhook delivery failed after retries', {
            webhookId: webhook.id,
            url: webhook.url,
            attempts: retries,
            error: error.message
          });

          throw error;
        }

        // Wait before retry (exponential backoff: 1s, 2s, 4s)
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        logger.warn('Webhook delivery failed, retrying', {
          webhookId: webhook.id,
          attempt: attempt + 1,
          retries,
          waitTime: `${waitTime}ms`
        });
      }
    }
  }

  /**
   * Log webhook delivery attempt
   */
  static async logWebhookDelivery(webhookId, taskId, statusCode, duration, success, errorMessage) {
    try {
      await query(
        `INSERT INTO task_webhook_deliveries 
         (webhook_id, task_id, status_code, response_time_ms, success, error_message, delivered_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [webhookId, taskId, statusCode, duration, success, errorMessage]
      );
    } catch (error) {
      // Don't throw if logging fails
      logger.error('Failed to log webhook delivery', {
        webhookId,
        taskId,
        error: error.message
      });
    }
  }

  /**
   * Get webhook delivery statistics
   */
  static async getDeliveryStats(webhookId, since = '24 hours') {
    const result = await query(
      `SELECT 
        COUNT(*) as total_deliveries,
        COUNT(*) FILTER (WHERE success = true) as successful,
        COUNT(*) FILTER (WHERE success = false) as failed,
        AVG(response_time_ms) FILTER (WHERE success = true) as avg_response_time,
        MAX(response_time_ms) as max_response_time
       FROM task_webhook_deliveries
       WHERE webhook_id = $1
       AND delivered_at > NOW() - INTERVAL '${since}'`,
      [webhookId]
    );

    return result.rows[0];
  }
}

module.exports = WebhookService;
