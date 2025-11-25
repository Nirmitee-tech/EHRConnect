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
    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    if (match) {
      headers['Accept-Language'] = match[2];
    }
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
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { session, skipAuth, ...fetchOptions } = options

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  // Prepare headers
  const headers = new Headers(fetchOptions.headers)

  // Add session headers if not skipping auth
  if (!skipAuth && session) {
    const sessionHeaders = getApiHeaders(session)
    Object.entries(sessionHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })
  }

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(error.error || error.message || 'API request failed')
  }

  // Parse response
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }

  return response.text() as any
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
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
