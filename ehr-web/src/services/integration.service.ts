/**
 * Integration Service
 * Frontend service for interacting with integration management APIs
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface IntegrationMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  vendor: string;
  website: string;
  documentation: string;
  features: string[];
  pricing?: {
    model: string;
    plans: Array<{
      name: string;
      price: string;
      claims?: string;
    }>;
  };
  requiresCredentials: boolean;
  credentialFields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    default?: string;
  }>;
}

export interface IntegrationOperation {
  name: string;
  category: string;
  description: string;
}

export interface IntegrationTestResult {
  success: boolean;
  vendorId: string;
  orgId: string;
  message: string;
}

export interface IntegrationExecuteRequest {
  operation: string;
  params: Record<string, any>;
}

export interface IntegrationExecuteResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export class IntegrationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE}/api/integrations`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      const orgId = localStorage.getItem('selected_org_id');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (orgId) {
        config.headers['x-org-id'] = orgId;
      }

      return config;
    });
  }

  /**
   * List all available integrations
   */
  async listIntegrations(): Promise<IntegrationMetadata[]> {
    const response = await this.api.get('/');
    return response.data;
  }

  /**
   * Get integration metadata
   */
  async getIntegration(vendorId: string): Promise<IntegrationMetadata> {
    const response = await this.api.get(`/${vendorId}`);
    return response.data;
  }

  /**
   * Get available operations for an integration
   */
  async getOperations(vendorId: string): Promise<IntegrationOperation[]> {
    const response = await this.api.get(`/${vendorId}/operations`);
    return response.data;
  }

  /**
   * Test connection to an integration
   */
  async testConnection(vendorId: string): Promise<IntegrationTestResult> {
    const response = await this.api.post(`/${vendorId}/test`);
    return response.data;
  }

  /**
   * Execute an operation with specific integration
   */
  async execute(
    vendorId: string,
    operation: string,
    params: Record<string, unknown>
  ): Promise<IntegrationExecuteResponse> {
    const response = await this.api.post(`/${vendorId}/execute`, {
      operation,
      params,
    });
    return response.data;
  }

  /**
   * Execute operation with automatic failover
   */
  async executeWithFailover(
    category: string,
    operation: string,
    params: Record<string, unknown>
  ): Promise<IntegrationExecuteResponse> {
    const response = await this.api.post('/execute-with-failover', {
      category,
      operation,
      params,
    });
    return response.data;
  }

  /**
   * Clear integration cache
   */
  async clearCache(vendorId?: string): Promise<void> {
    await this.api.post('/cache/clear', { vendorId });
  }
}

export default new IntegrationService();
