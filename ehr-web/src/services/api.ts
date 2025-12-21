/**
 * API Client Configuration
 * Base axios instance for making API requests
 */

import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth headers
apiClient.interceptors.request.use((config) => {
  // Try to get from localStorage first (for backward compatibility)
  const userId = localStorage.getItem('userId');
  const orgId = localStorage.getItem('orgId');

  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  if (orgId) {
    config.headers['x-org-id'] = orgId;
  }

  return config;
});

/**
 * Create an API client instance with custom headers (typically from session)
 * Use this when you have session data available
 */
export function createApiClient(headers?: {
  userId?: string;
  orgId?: string;
  orgSlug?: string;
  locationIds?: string[];
}): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Add request interceptor with provided headers
  client.interceptors.request.use((config) => {
    if (headers?.userId) {
      config.headers['x-user-id'] = headers.userId;
    }
    if (headers?.orgId) {
      config.headers['x-org-id'] = headers.orgId;
    }
    if (headers?.orgSlug) {
      config.headers['x-org-slug'] = headers.orgSlug;
    }
    if (headers?.locationIds) {
      config.headers['x-location-ids'] = JSON.stringify(headers.locationIds);
    }

    return config;
  });

  return client;
}

export default apiClient;
