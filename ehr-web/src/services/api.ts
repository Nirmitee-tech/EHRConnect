/**
 * API Client Configuration
 * Base axios instance for making API requests
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseUrl: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth headers
apiClient.interceptors.request.use((config) => {
  // Get headers from context or local storage
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

export default apiClient;
