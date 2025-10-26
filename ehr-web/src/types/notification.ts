export type NotificationCategory =
  | 'appointment'
  | 'task'
  | 'system'
  | 'billing'
  | 'alert'
  | 'other';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  href?: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  createdAt: string;
  read: boolean;
  meta?: Record<string, unknown>;
}

export interface NotificationEventPayload {
  event: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface NotificationEventMapper {
  title: string | ((payload: NotificationEventPayload) => string);
  description:
    | string
    | ((payload: NotificationEventPayload) => string | undefined);
  category?: NotificationCategory;
  severity?:
    | NotificationSeverity
    | ((payload: NotificationEventPayload) => NotificationSeverity | undefined);
  href?: (payload: NotificationEventPayload) => string | undefined;
}
