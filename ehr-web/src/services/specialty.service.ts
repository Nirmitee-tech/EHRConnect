/**
 * Specialty Pack Service
 * API client for specialty pack management
 */

import type {
  SpecialtyPack,
  PackSetting,
  PackAudit,
  SpecialtyContext,
  EnablePackRequest,
  DisablePackRequest
} from '@/types/specialty';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface APIHeaders {
  'Content-Type': string;
  'x-org-id': string;
  'x-user-id': string;
  'x-user-roles': string;
  'x-location-id'?: string;
  'x-department-id'?: string;
}

function getHeaders(session: any): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-org-id': session?.org_id || '',
    'x-user-id': session?.user?.id || '',
    'x-user-roles': JSON.stringify(session?.roles || [])
  };
  
  if (session?.location_ids?.[0]) {
    headers['x-location-id'] = session.location_ids[0];
  }
  
  return headers;
}

export const specialtyService = {
  /**
   * Get specialty context for current user
   */
  async getContext(session: any): Promise<SpecialtyContext> {
    const response = await fetch(`${API_BASE}/api/specialties/context`, {
      headers: getHeaders(session)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch specialty context');
    }

    const data = await response.json();
    return data.context;
  },

  /**
   * List all enabled packs
   */
  async listPacks(session: any, scope?: string, scopeRefId?: string): Promise<PackSetting[]> {
    const params = new URLSearchParams();
    if (scope) params.append('scope', scope);
    if (scopeRefId) params.append('scopeRefId', scopeRefId);

    const response = await fetch(
      `${API_BASE}/api/specialties/packs?${params.toString()}`,
      { headers: getHeaders(session) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch packs');
    }

    const data = await response.json();
    return data.packs;
  },

  /**
   * Get details for a specific pack
   */
  async getPack(session: any, slug: string, version = '1.0.0'): Promise<SpecialtyPack> {
    const response = await fetch(
      `${API_BASE}/api/specialties/packs/${slug}?version=${version}`,
      { headers: getHeaders(session) }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pack: ${slug}`);
    }

    const data = await response.json();
    return data.pack;
  },

  /**
   * Get pack components (templates, visit types, workflows)
   */
  async getPackComponents(
    session: any,
    slug: string,
    version = '1.0.0',
    component: 'all' | 'templates' | 'visitTypes' | 'workflows' | 'reports' = 'all'
  ) {
    const response = await fetch(
      `${API_BASE}/api/specialties/packs/${slug}/components?version=${version}&component=${component}`,
      { headers: getHeaders(session) }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pack components: ${slug}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * ADMIN: List org specialty settings
   */
  async getOrgSpecialties(
    session: any,
    orgId: string,
    scope?: string,
    scopeRefId?: string
  ): Promise<PackSetting[]> {
    const params = new URLSearchParams();
    if (scope) params.append('scope', scope);
    if (scopeRefId) params.append('scopeRefId', scopeRefId);

    const response = await fetch(
      `${API_BASE}/api/specialties/admin/orgs/${orgId}/specialties?${params.toString()}`,
      { headers: getHeaders(session) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch org specialties');
    }

    const data = await response.json();
    return data.packs;
  },

  /**
   * ADMIN: Enable/disable packs
   */
  async updateOrgSpecialties(
    session: any,
    orgId: string,
    enable: EnablePackRequest[] = [],
    disable: DisablePackRequest[] = []
  ) {
    const response = await fetch(
      `${API_BASE}/api/specialties/admin/orgs/${orgId}/specialties`,
      {
        method: 'PUT',
        headers: getHeaders(session),
        body: JSON.stringify({ enable, disable })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update specialties');
    }

    return await response.json();
  },

  /**
   * ADMIN: Get audit history
   */
  async getAuditHistory(
    session: any,
    orgId: string,
    packSlug?: string,
    limit = 50
  ): Promise<PackAudit[]> {
    const endpoint = packSlug
      ? `${API_BASE}/api/specialties/admin/orgs/${orgId}/specialties/${packSlug}/history?limit=${limit}`
      : `${API_BASE}/api/specialties/admin/orgs/${orgId}/specialties/history?limit=${limit}`;

    const response = await fetch(endpoint, { headers: getHeaders(session) });

    if (!response.ok) {
      throw new Error('Failed to fetch audit history');
    }

    const data = await response.json();
    return data.history;
  },

  /**
   * ADMIN: Reload pack (invalidate cache)
   */
  async reloadPack(session: any, slug: string, version = '1.0.0') {
    const response = await fetch(
      `${API_BASE}/api/specialties/admin/specialties/packs/${slug}/reload`,
      {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify({ version })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reload pack: ${slug}`);
    }

    return await response.json();
  },

  /**
   * ADMIN: Get cache stats
   */
  async getCacheStats(session: any) {
    const response = await fetch(
      `${API_BASE}/api/specialties/admin/specialties/cache/stats`,
      { headers: getHeaders(session) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cache stats');
    }

    return await response.json();
  },

  /**
   * ADMIN: Clear cache
   */
  async clearCache(session: any) {
    const response = await fetch(
      `${API_BASE}/api/specialties/admin/specialties/cache`,
      {
        method: 'DELETE',
        headers: getHeaders(session)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to clear cache');
    }

    return await response.json();
  }
};
