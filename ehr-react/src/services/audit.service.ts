import type { AuditEventResponse, AuditSettingsMap } from '@/types/audit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AuditEventFilters {
  limit?: number;
  offset?: number;
  status?: string;
  action?: string;
  category?: string;
  actorUserId?: string;
  targetType?: string;
  search?: string;
  from?: string;
  to?: string;
}

export class AuditService {
  static async getEvents(orgId: string, userId: string, filters: AuditEventFilters = {}): Promise<AuditEventResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const url = `${API_URL}/api/orgs/${orgId}/audit/events${params.toString() ? `?${params}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'x-org-id': orgId,
        'x-user-id': userId,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to load audit events');
    }

    return response.json();
  }

  static async exportEvents(orgId: string, userId: string, filters: AuditEventFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    params.append('format', 'csv');

    const url = `${API_URL}/api/orgs/${orgId}/audit/events?${params}`;

    const response = await fetch(url, {
      headers: {
        'x-org-id': orgId,
        'x-user-id': userId
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to export audit events');
    }

    const csv = await response.text();
    return new Blob([csv], { type: 'text/csv' });
  }

  static async getSettings(orgId: string, userId: string): Promise<AuditSettingsMap> {
    const response = await fetch(`${API_URL}/api/orgs/${orgId}/audit/settings`, {
      headers: {
        'x-org-id': orgId,
        'x-user-id': userId
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to load audit settings');
    }

    const data = await response.json();
    return data.settings as AuditSettingsMap;
  }

  static async updateSettings(orgId: string, userId: string, updates: AuditSettingsMap): Promise<AuditSettingsMap> {
    const response = await fetch(`${API_URL}/api/orgs/${orgId}/audit/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
        'x-user-id': userId
      },
      credentials: 'include',
      body: JSON.stringify({ settings: updates })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update audit settings' }));
      throw new Error(error.error || 'Failed to update audit settings');
    }

    const data = await response.json();
    return data.settings as AuditSettingsMap;
  }
}
