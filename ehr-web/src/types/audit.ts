export interface AuditChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AuditEventMetadata {
  summary?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  requestBody?: unknown;
  responseBody?: unknown;
  changes?: AuditChange[];
  [key: string]: unknown;
}

export interface AuditEvent {
  id: string;
  action: string;
  category: string;
  status: 'success' | 'failure' | 'pending';
  actor_user_id: string | null;
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  created_at: string;
  metadata: AuditEventMetadata;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  request_id: string | null;
  error_message?: string | null;
}

export interface AuditSettingsPreference {
  enabled: boolean;
  retention_days?: number;
  capture_diffs?: boolean;
  redact_fields?: string[];
  [key: string]: unknown;
}

export type AuditSettingsMap = Record<string, AuditSettingsPreference>;

export interface AuditEventResponse {
  total: number;
  events: AuditEvent[];
}
