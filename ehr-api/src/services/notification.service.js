const { pool } = require('../database/connection');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function coerceLimit(limit) {
  if (!limit) return DEFAULT_LIMIT;
  const parsed = parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(Boolean);
}

function resolveDefaultsForEvent(event, payload = {}) {
  switch (event) {
    case 'appointment:created': {
      const start = payload.start ? new Date(payload.start) : null;
      const when = start && !Number.isNaN(start.getTime())
        ? start.toLocaleString()
        : null;
      return {
        title: 'Appointment scheduled',
        message: when
          ? `A new appointment was scheduled for ${when}.`
          : 'A new appointment was scheduled.',
        category: 'appointment',
        severity: 'success',
      };
    }
    case 'appointment:updated': {
      const status = payload?.status;
      return {
        title: 'Appointment updated',
        message: status
          ? `Appointment status updated to ${String(status).toUpperCase()}.`
          : 'Appointment details were updated.',
        category: 'appointment',
        severity: 'info',
      };
    }
    case 'appointment:cancelled': {
      const start = payload.start ? new Date(payload.start) : null;
      const when = start && !Number.isNaN(start.getTime())
        ? start.toLocaleString()
        : null;
      return {
        title: 'Appointment cancelled',
        message: when
          ? `The appointment scheduled for ${when} was cancelled.`
          : 'An appointment was cancelled.',
        category: 'appointment',
        severity: 'warning',
      };
    }
    case 'permission-changed': {
      const changeType = payload.changeData?.type || payload.type || 'update';
      const roleName = payload.changeData?.roleName || payload.changeData?.roleKey;
      const readableType = changeType.replace(/[_-]/g, ' ');
      return {
        title: 'Permissions updated',
        message: roleName
          ? `${roleName} permissions were ${readableType}.`
          : `Your permissions were ${readableType}.`,
        category: 'system',
        severity: 'info',
      };
    }
    case 'role-changed': {
      const roleName = payload.changeData?.roleName || payload.changeData?.roleKey;
      return {
        title: 'Role configuration updated',
        message: roleName
          ? `Role ${roleName} was updated for your organization.`
          : 'Organization role definitions were updated.',
        category: 'system',
        severity: 'info',
      };
    }
    case 'role-assignment-changed': {
      const roleName = payload.changeData?.roleName || payload.changeData?.roleKey;
      const targetUser = payload.changeData?.targetUserName || payload.changeData?.targetUserId;
      return {
        title: 'Role assignment updated',
        message: roleName
          ? `Role ${roleName} assignment was updated${targetUser ? ` for ${targetUser}` : ''}.`
          : 'A role assignment was updated.',
        category: 'system',
        severity: 'info',
      };
    }
    case 'role-revocation': {
      const roleName = payload.changeData?.roleName || payload.changeData?.roleKey;
      const targetUser = payload.changeData?.targetUserName || payload.changeData?.targetUserId;
      return {
        title: 'Role revoked',
        message: roleName
          ? `Role ${roleName} was revoked${targetUser ? ` for ${targetUser}` : ''}.`
          : 'A role assignment was revoked.',
        category: 'system',
        severity: 'warning',
      };
    }
    case 'task:assigned': {
      const taskTitle = payload.task?.title || payload.taskTitle;
      const due = payload.task?.dueDate || payload.dueDate;
      const dueDate = due ? new Date(due) : null;
      const dueLabel = dueDate && !Number.isNaN(dueDate.getTime())
        ? ` Due ${dueDate.toLocaleDateString()}.`
        : '';
      return {
        title: 'Task assigned',
        message: taskTitle
          ? `New task "${taskTitle}" assigned to you.${dueLabel}`
          : `You have been assigned a new task.${dueLabel}`,
        category: 'task',
        severity: 'info',
      };
    }
    case 'task:completed': {
      const taskTitle = payload.task?.title || payload.taskTitle;
      return {
        title: 'Task completed',
        message: taskTitle
          ? `Task "${taskTitle}" was completed.`
          : 'A monitored task was completed.',
        category: 'task',
        severity: 'success',
      };
    }
    case 'billing:invoice-created': {
      const invoiceNumber = payload.invoice?.number || payload.invoiceNumber;
      return {
        title: 'Invoice created',
        message: invoiceNumber
          ? `Invoice ${invoiceNumber} has been generated.`
          : 'A new invoice has been generated.',
        category: 'billing',
        severity: 'info',
      };
    }
    case 'billing:payment-failed': {
      const invoiceNumber = payload.invoice?.number || payload.invoiceNumber;
      return {
        title: 'Payment failed',
        message: invoiceNumber
          ? `Payment failed for invoice ${invoiceNumber}.`
          : 'A billing payment failed to process.',
        category: 'billing',
        severity: 'error',
      };
    }
    default:
      return {
        title: 'System notification',
        message: 'A new update is available.',
        category: 'system',
        severity: 'info',
      };
  }
}

function mapRowToPayload(row, userId) {
  const payloadData = row.data || {};
  return {
    id: row.id,
    notificationId: row.id,
    event: row.event,
    title: row.title,
    message: row.message,
    category: row.category,
    severity: row.severity,
    href: row.href,
    ...payloadData,
    data: payloadData,
    recipients: row.recipients || [],
    read: Boolean(row.is_read),
    timestamp: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
    meta: {
      readBy: row.read_by || [],
      userId,
    },
  };
}

async function createNotification({
  orgId,
  userId = null,
  recipients = [],
  event,
  title,
  message,
  category,
  severity,
  href = null,
  data = {},
}) {
  if (!orgId) {
    throw new Error('orgId is required to create a notification');
  }
  if (!event) {
    throw new Error('event is required to create a notification');
  }

  const normalizedRecipients = normalizeArray(recipients);
  const defaults = resolveDefaultsForEvent(event, data);

  const resolvedTitle = title || defaults.title;
  const resolvedMessage = message || defaults.message;
  const resolvedCategory = category || defaults.category;
  const resolvedSeverity = severity || defaults.severity;

  const recipientArray = normalizedRecipients.length
    ? normalizedRecipients
    : (userId ? [userId] : []);

  const result = await pool.query(
    `
      INSERT INTO notifications
        (org_id, event, title, message, category, severity, href, data, recipients)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::text[])
      RETURNING *
    `,
    [
      orgId,
      event,
      resolvedTitle,
      resolvedMessage,
      resolvedCategory,
      resolvedSeverity,
      href,
      JSON.stringify(data ?? {}),
      recipientArray,
    ]
  );

  const row = result.rows[0];
  return mapRowToPayload(row, userId || null);
}

async function recordOrgEvent({
  orgId,
  event,
  data = {},
  title,
  message,
  category,
  severity,
  href = null,
  recipients = [],
}) {
  return createNotification({
    orgId,
    event,
    data,
    title,
    message,
    category,
    severity,
    href,
    recipients: normalizeArray(recipients),
  });
}

async function fetchNotifications({ orgId, userId, limit, unreadOnly = false }) {
  if (!orgId || !userId) {
    throw new Error('orgId and userId are required to fetch notifications');
  }

  const resolvedLimit = coerceLimit(limit);

  const result = await pool.query(
    `
      SELECT
        n.*,
        (n.read_by @> ARRAY[$2]::text[]) AS is_read
      FROM notifications n
      WHERE n.org_id = $1
        AND (
          cardinality(n.recipients) = 0
          OR $2 = ANY(n.recipients)
        )
        AND (
          $3::boolean = FALSE
          OR NOT (n.read_by @> ARRAY[$2]::text[])
        )
      ORDER BY n.created_at DESC
      LIMIT $4
    `,
    [orgId, userId, unreadOnly, resolvedLimit]
  );

  return result.rows.map((row) => mapRowToPayload(row, userId));
}

async function markAsRead({ orgId, userId, notificationId }) {
  if (!orgId || !userId || !notificationId) {
    throw new Error('orgId, userId, and notificationId are required');
  }

  await pool.query(
    `
      UPDATE notifications
      SET read_by = CASE
        WHEN read_by @> ARRAY[$2]::text[] THEN read_by
        ELSE read_by || ARRAY[$2]::text[]
      END
      WHERE id = $1
        AND org_id = $3
        AND (
          cardinality(recipients) = 0
          OR $2 = ANY(recipients)
        )
    `,
    [notificationId, userId, orgId]
  );
}

async function markAllAsRead({ orgId, userId }) {
  if (!orgId || !userId) {
    throw new Error('orgId and userId are required');
  }

  await pool.query(
    `
      UPDATE notifications
      SET read_by = CASE
        WHEN read_by @> ARRAY[$2]::text[] THEN read_by
        ELSE read_by || ARRAY[$2]::text[]
      END
      WHERE org_id = $1
        AND (
          cardinality(recipients) = 0
          OR $2 = ANY(recipients)
        )
    `,
    [orgId, userId]
  );
}

module.exports = {
  createNotification,
  recordOrgEvent,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
};
