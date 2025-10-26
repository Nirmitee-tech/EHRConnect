'use client';

import { io, Socket } from 'socket.io-client';
import {
  NotificationEventMapper,
  NotificationEventPayload,
  NotificationItem,
  NotificationSeverity,
} from '@/types/notification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MAX_NOTIFICATIONS = 50;

type NotificationHandler = (notification: NotificationItem) => void;
type ConnectionHandler = () => void;

interface ConnectOptions {
  token: string;
  orgId?: string | null;
  userId?: string | null;
  onNotification?: NotificationHandler;
  onConnect?: ConnectionHandler;
  onDisconnect?: ConnectionHandler;
}

interface AuthHeaders {
  token: string;
  orgId?: string | null;
  userId?: string | null;
}

const FALLBACK_SEVERITY: NotificationSeverity = 'info';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EVENT_MAPPERS: Record<string, NotificationEventMapper> = {
  'appointment:created': {
    title: 'Appointment scheduled',
    description: (payload) => {
      const patientName =
        (payload.appointment?.patientName as string | undefined) ??
        (payload.patientName as string | undefined) ??
        'A patient';
      const start = payload.appointment?.start ?? payload.start;
      return `${patientName} booked an appointment${start ? ` for ${new Date(start as string).toLocaleString()}` : ''
        }.`;
    },
    category: 'appointment',
    severity: 'success',
    href: (payload) =>
      payload.appointmentId
        ? `/appointments/${payload.appointmentId}`
        : '/appointments',
  },
  'appointment:updated': {
    title: 'Appointment updated',
    description: (payload) => {
      const status = payload.status ? `Status: ${(payload.status as string).toUpperCase()}` : undefined;
      const start = payload.start as string | undefined;
      const timeInfo = start ? `Updated time: ${new Date(start).toLocaleString()}` : undefined;
      return [status, timeInfo].filter(Boolean).join(' • ') || 'Appointment details changed.';
    },
    category: 'appointment',
    severity: 'info',
    href: (payload) =>
      payload.appointmentId
        ? `/appointments/${payload.appointmentId}`
        : '/appointments',
  },
  'appointment:cancelled': {
    title: 'Appointment cancelled',
    description: (payload) => {
      const start = payload.start as string | undefined;
      return start
        ? `Appointment scheduled for ${new Date(start).toLocaleString()} was cancelled.`
        : 'An appointment was cancelled.';
    },
    category: 'appointment',
    severity: 'warning',
    href: (payload) =>
      payload.appointmentId
        ? `/appointments/${payload.appointmentId}`
        : '/appointments',
  },
  'permission-changed': {
    title: 'Permissions updated',
    description: (payload) => {
      const changeType = (payload.changeData?.type as string | undefined) || (payload.type as string | undefined);
      const roleName = payload.changeData?.roleName as string | undefined;
      const readableType = changeType ? changeType.replace(/[_-]/g, ' ') : 'updated';
      if (roleName) {
        return `${roleName} permissions were ${readableType}.`;
      }
      return `Your permissions were ${readableType}.`;
    },
    category: 'system',
    severity: 'info',
    href: () => '/settings/roles',
  },
  'role-changed': {
    title: 'Role configuration updated',
    description: (payload) => {
      const roleName = payload.changeData?.roleName as string | undefined;
      return roleName
        ? `Organization role ${roleName} was updated.`
        : 'Organization role definitions were updated.';
    },
    category: 'system',
    severity: 'info',
    href: () => '/settings/roles',
  },
  'role-assignment-changed': {
    title: 'Role assignment updated',
    description: (payload) => {
      const roleName = payload.changeData?.roleName as string | undefined;
      const targetUser = payload.changeData?.targetUserName as string | undefined;
      if (roleName && targetUser) {
        return `${roleName} assignment updated for ${targetUser}.`;
      }
      if (roleName) {
        return `Assignment for role ${roleName} was updated.`;
      }
      return 'A role assignment was updated.';
    },
    category: 'system',
    severity: 'info',
    href: () => '/settings/roles',
  },
  'role-revocation': {
    title: 'Role revoked',
    description: (payload) => {
      const roleName = payload.changeData?.roleName as string | undefined;
      const targetUser = payload.changeData?.targetUserName as string | undefined;
      if (roleName && targetUser) {
        return `${roleName} role was revoked for ${targetUser}.`;
      }
      if (roleName) {
        return `${roleName} role was revoked.`;
      }
      return 'A role assignment was revoked.';
    },
    category: 'system',
    severity: 'warning',
    href: () => '/settings/roles',
  },
  'task:assigned': {
    title: 'Task assigned',
    description: (payload) => {
      const task = payload.task as { title?: string; dueDate?: string } | undefined;
      const taskTitle = task?.title ?? (payload.taskTitle as string | undefined);
      const due = task?.dueDate ?? (payload.dueDate as string | undefined);
      const dueText = due ? ` Due ${new Date(due).toLocaleDateString()}.` : '';
      return taskTitle
        ? `New task "${taskTitle}" assigned to you.${dueText}`
        : `You have been assigned a new task.${dueText}`;
    },
    category: 'task',
    severity: 'info',
    href: (payload) => {
      const task = payload.task as { id?: string } | undefined;
      const taskId = task?.id ?? (payload.taskId as string | undefined);
      return taskId ? `/tasks/${taskId}` : '/tasks';
    },
  },
  'task:completed': {
    title: 'Task completed',
    description: (payload) => {
      const task = payload.task as { title?: string } | undefined;
      const taskTitle = task?.title ?? (payload.taskTitle as string | undefined);
      return taskTitle
        ? `Task "${taskTitle}" was completed.`
        : 'A tracked task has been completed.';
    },
    category: 'task',
    severity: 'success',
    href: (payload) => {
      const task = payload.task as { id?: string } | undefined;
      const taskId = task?.id ?? (payload.taskId as string | undefined);
      return taskId ? `/tasks/${taskId}` : '/tasks';
    },
  },
  'billing:invoice-created': {
    title: 'Invoice created',
    description: (payload) => {
      const invoice = payload.invoice as { number?: string } | undefined;
      const invoiceNumber = invoice?.number ?? (payload.invoiceNumber as string | undefined);
      return invoiceNumber
        ? `Invoice ${invoiceNumber} has been generated.`
        : 'A new invoice has been generated.';
    },
    category: 'billing',
    severity: 'info',
    href: (payload) => {
      const invoice = payload.invoice as { id?: string } | undefined;
      const invoiceId = invoice?.id ?? (payload.invoiceId as string | undefined);
      return invoiceId ? `/billing/invoices/${invoiceId}` : '/billing';
    },
  },
  'billing:payment-failed': {
    title: 'Payment failed',
    description: (payload) => {
      const invoice = payload.invoice as { number?: string } | undefined;
      const invoiceNumber = invoice?.number ?? (payload.invoiceNumber as string | undefined);
      return invoiceNumber
        ? `Payment failed for invoice ${invoiceNumber}.`
        : 'A billing payment attempt failed.';
    },
    category: 'billing',
    severity: 'error',
    href: (payload) => {
      const invoice = payload.invoice as { id?: string } | undefined;
      const invoiceId = invoice?.id ?? (payload.invoiceId as string | undefined);
      return invoiceId ? `/billing/invoices/${invoiceId}` : '/billing';
    },
  },
  notification: {
    title: (payload) =>
      (payload.title as string | undefined) ?? 'System notification',
    description: (payload) =>
      (payload.message as string | undefined) ??
      (payload.description as string | undefined) ??
      'You have a new notification.',
    category: 'system',
    severity: (payload) =>
      (payload.severity as NotificationSeverity | undefined) ?? 'info',
    href: (payload) =>
      (payload.href as string | undefined) ??
      (payload.link as string | undefined),
  },
};

function normalizeMapper(
  event: string,
  payload: NotificationEventPayload
): NotificationItem | null {
  const mapper = EVENT_MAPPERS[event];
  const baseTimestamp = payload.timestamp ?? new Date().toISOString();

  const id =
    (payload.notificationId as string | undefined) ??
    (payload.id as string | undefined) ??
    `${event}-${baseTimestamp}-${Math.random().toString(36).slice(2, 8)}`;

  const readState = typeof payload.read === 'boolean' ? payload.read : false;

  if (!mapper) {
    return {
      id,
      title: event.replace(/[:_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description:
        typeof payload.message === 'string'
          ? payload.message
          : 'You have a new notification.',
      category: 'other',
      severity: FALLBACK_SEVERITY,
      createdAt: baseTimestamp,
      read: readState,
      meta: { event, payload },
    };
  }

  const resolvedTitle =
    typeof mapper.title === 'function'
      ? mapper.title(payload) ?? 'Notification'
      : mapper.title;

  const resolvedDescription =
    typeof mapper.description === 'function'
      ? mapper.description(payload) ?? 'You have a new notification.'
      : mapper.description;

  const resolvedSeverity =
    typeof mapper.severity === 'function'
      ? mapper.severity(payload) ?? FALLBACK_SEVERITY
      : mapper.severity ?? FALLBACK_SEVERITY;

  const href =
    typeof mapper.href === 'function' ? mapper.href(payload) : undefined;

  return {
    id,
    title: resolvedTitle ?? 'Notification',
    description: resolvedDescription ?? 'You have a new notification.',
    category: mapper.category ?? 'other',
    severity: resolvedSeverity,
    createdAt: baseTimestamp,
    read: readState,
    href,
    meta: { event, payload },
  };
}

class NotificationService {
  private socket: Socket | null = null;
  private handlers = new Set<NotificationHandler>();
  private onConnectHandlers = new Set<ConnectionHandler>();
  private onDisconnectHandlers = new Set<ConnectionHandler>();
  private currentToken: string | null = null;

  connect(options: ConnectOptions): void {
    const { token, orgId, userId, onNotification, onConnect, onDisconnect } =
      options;

    if (!token) {
      console.warn('[NotificationService] Missing auth token. Skipping connection.');
      return;
    }

    if (onNotification) {
      this.handlers.add(onNotification);
    }
    if (onConnect) {
      this.onConnectHandlers.add(onConnect);
    }
    if (onDisconnect) {
      this.onDisconnectHandlers.add(onDisconnect);
    }

    if (this.socket && this.currentToken === token) {
      return;
    }

    this.currentToken = token;

    if (this.socket) {
      this.teardownSocket();
    }

    this.socket = io(API_URL, {
      path: '/socket.io/',
      auth: {
        token,
        orgId,
        userId,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.onConnectHandlers.forEach((handler) => handler());
    });

    this.socket.on('disconnect', () => {
      this.onDisconnectHandlers.forEach((handler) => handler());
    });

    const events = Object.keys(EVENT_MAPPERS);
    events.forEach((eventName) => {
      this.socket?.on(eventName, (payload: NotificationEventPayload) => {
        const notification = normalizeMapper(eventName, payload);
        if (notification) {
          this.handlers.forEach((handler) => handler(notification));
        }
      });
    });

    // Fallback for custom events routed through notifyUser/notifyOrg
    this.socket.onAny((eventName, payload: NotificationEventPayload) => {
      if (EVENT_MAPPERS[eventName]) {
        return;
      }
      const notification = normalizeMapper(eventName, payload);
      if (notification) {
        this.handlers.forEach((handler) => handler(notification));
      }
    });
  }

  disconnect(handler?: NotificationHandler) {
    if (handler) {
      this.handlers.delete(handler);
    }
    if (this.handlers.size === 0) {
      this.teardownSocket();
    }
  }

  onConnection(handler: ConnectionHandler, type: 'connect' | 'disconnect') {
    if (type === 'connect') {
      this.onConnectHandlers.add(handler);
    } else {
      this.onDisconnectHandlers.add(handler);
    }
  }

  offConnection(handler: ConnectionHandler) {
    this.onConnectHandlers.delete(handler);
    this.onDisconnectHandlers.delete(handler);
  }

  private teardownSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
  }

  private buildHeaders({ token, orgId, userId }: AuthHeaders) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (orgId) {
      headers['x-org-id'] = orgId;
    }
    if (userId) {
      headers['x-user-id'] = userId;
    }
    return headers;
  }

  async fetchNotifications(auth: AuthHeaders): Promise<NotificationItem[]> {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: this.buildHeaders(auth),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      const items = (Array.isArray(data?.notifications)
        ? data.notifications
        : data) as NotificationEventPayload[];

      return items
        .map((item) => normalizeMapper(item.event ?? 'notification', item))
        .filter((item): item is NotificationItem => Boolean(item))
        .slice(0, MAX_NOTIFICATIONS);
    } catch (error) {
      console.warn('[NotificationService] Falling back to empty list:', error);
      return [];
    }
  }

  async markAsRead(auth: AuthHeaders, notificationId: string): Promise<void> {
    if (!UUID_REGEX.test(notificationId)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: this.buildHeaders(auth),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.warn('[NotificationService] Unable to mark as read:', error);
    }
  }

  async markAllAsRead(auth: AuthHeaders): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: this.buildHeaders(auth),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.warn('[NotificationService] Unable to mark all as read:', error);
    }
  }
}

export const notificationService = new NotificationService();
