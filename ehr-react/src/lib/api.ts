import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import keycloak from './keycloak';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      // Check if token needs refresh
      try {
        await keycloak.updateToken(30);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Token refresh failed, might need to re-authenticate
        keycloak.login();
        return Promise.reject(error);
      }

      config.headers.Authorization = `Bearer ${keycloak.token}`;

      // Add org-id header if available
      if (keycloak.tokenParsed) {
        const orgId = (keycloak.tokenParsed as any).org_id;
        if (orgId) {
          config.headers['x-org-id'] = orgId;
        }

        // Add user-id header
        const userId = keycloak.tokenParsed.sub;
        if (userId) {
          config.headers['x-user-id'] = userId;
        }

        // Add roles header
        const roles = (keycloak.tokenParsed as any).realm_access?.roles;
        if (roles) {
          config.headers['x-user-roles'] = JSON.stringify(roles);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized, try to refresh token
      try {
        const refreshed = await keycloak.updateToken(-1);
        if (refreshed && error.config) {
          // Retry the original request with new token
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        keycloak.login();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
