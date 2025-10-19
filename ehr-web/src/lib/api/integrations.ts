/**
 * Integrations API Client
 * Connects to EHR API backend for integration management
 */

import { IntegrationConfig, IntegrationVendor } from '@/types/integration';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
  count?: number;
  summary?: any;
}

/**
 * Get all available integration vendors
 */
export async function getVendors(options?: {
  category?: string;
  featured?: boolean;
}): Promise<IntegrationVendor[]> {
  const params = new URLSearchParams();

  if (options?.category) {
    params.append('category', options.category);
  }

  if (options?.featured) {
    params.append('featured', 'true');
  }

  const url = `${API_BASE}/api/integrations/vendors${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  const result: ApiResponse<IntegrationVendor[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch vendors');
  }

  return result.data || [];
}

/**
 * Get all integrations for an organization
 */
export async function getIntegrations(orgId: string, options?: {
  active?: boolean;
  vendorId?: string;
}): Promise<IntegrationConfig[]> {
  const params = new URLSearchParams({ org_id: orgId });

  if (options?.active) {
    params.append('active', 'true');
  }

  if (options?.vendorId) {
    params.append('vendor_id', options.vendorId);
  }

  const response = await fetch(`${API_BASE}/api/integrations?${params.toString()}`, {
    headers: {
      'x-org-id': orgId
    }
  });

  const result: ApiResponse<IntegrationConfig[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch integrations');
  }

  return result.data || [];
}

/**
 * Get a single integration
 */
export async function getIntegration(integrationId: string): Promise<IntegrationConfig> {
  const response = await fetch(`${API_BASE}/api/integrations/${integrationId}`);
  const result: ApiResponse<IntegrationConfig> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch integration');
  }

  return result.data;
}

/**
 * Create a new integration
 */
export async function createIntegration(
  orgId: string,
  integration: Partial<IntegrationConfig>
): Promise<IntegrationConfig> {
  const response = await fetch(`${API_BASE}/api/integrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-org-id': orgId
    },
    body: JSON.stringify({
      org_id: orgId,
      vendor_id: integration.vendorId,
      enabled: integration.enabled || false,
      environment: integration.environment || 'sandbox',
      api_endpoint: integration.apiEndpoint || '',
      credentials: integration.credentials || {},
      usage_mappings: integration.usageMappings || []
    })
  });

  const result: ApiResponse<IntegrationConfig> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to create integration');
  }

  return result.data;
}

/**
 * Update an integration
 */
export async function updateIntegration(
  integrationId: string,
  updates: Partial<IntegrationConfig>
): Promise<IntegrationConfig> {
  const response = await fetch(`${API_BASE}/api/integrations/${integrationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      enabled: updates.enabled,
      environment: updates.environment,
      api_endpoint: updates.apiEndpoint,
      credentials: updates.credentials,
      usage_mappings: updates.usageMappings
    })
  });

  const result: ApiResponse<IntegrationConfig> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to update integration');
  }

  return result.data;
}

/**
 * Delete an integration
 */
export async function deleteIntegration(integrationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/integrations/${integrationId}`, {
    method: 'DELETE'
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete integration');
  }
}

/**
 * Toggle integration enabled status
 */
export async function toggleIntegration(
  integrationId: string,
  enabled: boolean
): Promise<IntegrationConfig> {
  const response = await fetch(`${API_BASE}/api/integrations/${integrationId}/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ enabled })
  });

  const result: ApiResponse<IntegrationConfig> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to toggle integration');
  }

  return result.data;
}

/**
 * Test integration connection
 */
export async function testIntegrationConnection(integrationId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${API_BASE}/api/integrations/${integrationId}/test`, {
    method: 'POST'
  });

  const result: ApiResponse<any> = await response.json();

  return {
    success: result.success,
    message: result.message || (result.success ? 'Connection successful' : 'Connection failed')
  };
}

/**
 * Get health status for all integrations
 */
export async function getHealthStatus(orgId: string): Promise<{
  integrations: any[];
  summary: {
    total: number;
    enabled: number;
    active: number;
    errors: number;
    inactive: number;
  };
}> {
  const response = await fetch(`${API_BASE}/api/integrations/health/status?org_id=${orgId}`, {
    headers: {
      'x-org-id': orgId
    }
  });

  const result: ApiResponse<any> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to get health status');
  }

  return {
    integrations: result.data || [],
    summary: result.summary || { total: 0, enabled: 0, active: 0, errors: 0, inactive: 0 }
  };
}

/**
 * Trigger health check for all integrations
 */
export async function performHealthCheck(orgId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/integrations/health/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-org-id': orgId
    },
    body: JSON.stringify({ org_id: orgId })
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to perform health check');
  }
}
