/**
 * API Client Utility
 * Provides consistent headers and authentication for all API calls
 * Works with both Postgres and Keycloak authentication providers
 */

import { Session } from 'next-auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ApiRequestOptions extends RequestInit {
  session?: Session | null
  skipAuth?: boolean
}

/**
 * Get headers for API requests from session
 * Ensures consistent headers regardless of auth provider
 */
export function getApiHeaders(session: Session | null | undefined): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add language preference from cookie
  if (typeof document !== 'undefined') {
    const cookieName = 'NEXT_LOCALE';
    const cookieHeader = document.cookie || '';
    const matches = [...cookieHeader.matchAll(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`, 'g'))];
    const raw = matches.length > 0 ? matches[matches.length - 1][1] : undefined;
    const decoded = raw ? decodeURIComponent(raw) : undefined;
    const base = decoded ? decoded.split('-')[0] : undefined;
    if (base) headers['Accept-Language'] = base;
  }

  if (!session) {
    return headers
  }

  // Add authentication token
  if (session.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`
  }

  // Add multi-tenant context headers
  if (session.user?.id) {
    headers['x-user-id'] = session.user.id
  }

  if (session.org_id) {
    headers['x-org-id'] = session.org_id
  }

  if (session.org_slug) {
    headers['x-org-slug'] = session.org_slug
  }

  if (session.location_ids && session.location_ids.length > 0) {
    headers['x-location-ids'] = JSON.stringify(session.location_ids)
  }

  if (session.roles && session.roles.length > 0) {
    headers['x-user-roles'] = JSON.stringify(session.roles)
  }

  if (session.permissions && session.permissions.length > 0) {
    headers['x-user-permissions'] = JSON.stringify(session.permissions)
  }

  return headers
}

/**
 * Make authenticated API request
 * Automatically adds session headers
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { session, skipAuth, ...fetchOptions } = options

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  // Prepare headers
  const headers = new Headers(fetchOptions.headers)

  // Add session headers if not skipping auth
  if (!skipAuth) {
    if (session) {
      const sessionHeaders = getApiHeaders(session)
      Object.entries(sessionHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })

      // Log headers in development for easier debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Request]', {
          method: fetchOptions.method || 'GET',
          endpoint,
          headers: {
            'Authorization': session.accessToken ? `Bearer ${session.accessToken.substring(0, 20)}...` : 'none',
            'x-user-id': session.user?.id || 'none',
            'x-org-id': session.org_id || 'none',
            'x-org-slug': session.org_slug || 'none',
          }
        })
      }
    } else {
      console.warn('[API Request] No session provided for authenticated endpoint:', endpoint)
    }
  }

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle errors with better details
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }))

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        endpoint,
        status: response.status,
        error: error.error || error.message || error.details,
        details: error.details || error
      })
    }

    throw new Error(error.error || error.message || error.details || 'API request failed')
  }

  // Parse response
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}

/**
 * Extract user context from session for API calls
 * Useful when you need to pass userId, orgId explicitly
 */
export function getUserContext(session: Session | null | undefined) {
  if (!session) {
    return null
  }

  return {
    userId: session.user?.id,
    orgId: session.org_id,
    orgSlug: session.org_slug,
    orgName: session.org_name,
    locationIds: session.location_ids || [],
    roles: session.roles || [],
    permissions: session.permissions || [],
    scope: session.scope,
    onboardingCompleted: session.onboarding_completed,
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(
  session: Session | null | undefined,
  permission: string | string[]
): boolean {
  if (!session?.permissions) {
    return false
  }

  const permissions = Array.isArray(permission) ? permission : [permission]
  return permissions.some((p) => {
    // Check exact match
    if (session.permissions?.includes(p)) {
      return true
    }

    // Check wildcard permissions (e.g., "patients:*" matches "patients:read")
    const [resource] = p.split(':')
    if (session.permissions?.includes(`${resource}:*`)) {
      return true
    }

    return false
  })
}

/**
 * Check if user has required role
 */
export function hasRole(
  session: Session | null | undefined,
  role: string | string[]
): boolean {
  if (!session?.roles) {
    return false
  }

  const roles = Array.isArray(role) ? role : [role]
  return roles.some((r) => session.roles?.includes(r))
}

/**
 * Generate a complete cURL command with all auth headers for testing
 * Perfect for copying to Postman or terminal
 */
export function generateCurlCommand(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  session: Session | null | undefined,
  body?: unknown
): string {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`
  const headers = session ? getApiHeaders(session) : { 'Content-Type': 'application/json' }

  let curl = `curl -X ${method} '${url}'`

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`
  })

  // Add body if present
  if (body) {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body, null, 2)
    curl += ` \\\n  -d '${bodyStr}'`
  }

  return curl
}

/**
 * Generate HTTP headers as a formatted object for display/copying
 */
export function getFormattedHeaders(session: Session | null | undefined): Record<string, string> {
  if (!session) {
    return { 'Content-Type': 'application/json' }
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': session.accessToken ? `Bearer ${session.accessToken}` : '',
    'x-user-id': session.user?.id || '',
    'x-org-id': session.org_id || '',
    'x-org-slug': session.org_slug || '',
    'x-location-ids': session.location_ids ? JSON.stringify(session.location_ids) : '',
    'x-user-roles': session.roles ? JSON.stringify(session.roles) : '',
    'x-user-permissions': session.permissions ? JSON.stringify(session.permissions) : '',
  }
}
