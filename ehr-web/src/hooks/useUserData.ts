import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * ==============================================================================
 * USER DATA HOOKS - WITH REDIS CACHING
 * ==============================================================================
 *
 * These hooks fetch data from separate, efficient API endpoints with Redis caching.
 * Data is automatically cached for 1-2 hours and invalidated when updated.
 *
 * WHY SEPARATE ENDPOINTS:
 * - Prevents "431 Request Header Fields Too Large" errors
 * - Allows granular caching strategies
 * - Improves performance with Redis
 * - Only fetches data you need, when you need it
 *
 * BACKEND APIS:
 * - GET /api/user/permissions - All user permissions (cached 1hr)
 * - GET /api/user/roles - All user roles (cached 1hr)
 * - GET /api/user/locations - All location IDs and details (cached 1hr)
 * - GET /api/user/organization - Org data with logo (cached 2hr)
 * - GET /api/user/profile - Complete user profile (cached 1hr)
 */

// ============================================================================
// PERMISSIONS HOOK
// ============================================================================

/**
 * Fetch all user permissions (not limited like in session)
 *
 * USAGE:
 * ```tsx
 * const { permissions, loading, error, refetch } = usePermissions();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * // permissions is an array of { name, description, category }
 * const canWrite = permissions.some(p => p.name === 'patients:write');
 * ```
 */
export function usePermissions(options?: { autoFetch?: boolean }) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFetch = options?.autoFetch !== false;

  const fetchPermissions = async () => {
    if (status !== 'authenticated') {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/user/permissions`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id || '',
          'x-org-id': session?.org_id || '',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch permissions');
      }

      setPermissions(data.permissions);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && permissions.length === 0 && !loading) {
      fetchPermissions();
    }
  }, [status, autoFetch]);

  return {
    permissions,
    loading: loading || status === 'loading',
    error,
    refetch: fetchPermissions,
  };
}

/**
 * Check if user has a specific permission
 *
 * USAGE:
 * ```tsx
 * const hasPermission = usePermission('patients:write');
 *
 * if (!hasPermission) return <AccessDenied />;
 * ```
 */
export function usePermission(permissionName: string) {
  const { permissions, loading } = usePermissions();

  if (loading || !permissions) {
    return false;
  }

  return permissions.some(p => p.name === permissionName);
}

// ============================================================================
// ROLES HOOK
// ============================================================================

/**
 * Fetch all user roles (not limited like in session)
 *
 * USAGE:
 * ```tsx
 * const { roles, loading, error } = useRoles();
 *
 * // roles is an array of { id, name, description, level }
 * const isAdmin = roles.some(r => r.name === 'admin');
 * ```
 */
export function useRoles(options?: { autoFetch?: boolean }) {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFetch = options?.autoFetch !== false;

  const fetchRoles = async () => {
    if (status !== 'authenticated') {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/user/roles`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id || '',
          'x-org-id': session?.org_id || '',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch roles');
      }

      setRoles(data.roles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && roles.length === 0 && !loading) {
      fetchRoles();
    }
  }, [status, autoFetch]);

  return {
    roles,
    loading: loading || status === 'loading',
    error,
    refetch: fetchRoles,
  };
}

/**
 * Check if user has a specific role
 *
 * USAGE:
 * ```tsx
 * const isAdmin = useRole('admin');
 * const isDoctor = useRole('practitioner');
 * ```
 */
export function useRole(roleName: string) {
  const { roles, loading } = useRoles();

  if (loading || !roles) {
    return false;
  }

  return roles.some(r => r.name === roleName);
}

// ============================================================================
// LOCATIONS HOOK
// ============================================================================

/**
 * Fetch all user location IDs and details
 *
 * USAGE:
 * ```tsx
 * const { locations, locationIds, loading } = useLocations();
 *
 * // locationIds is array of IDs
 * // locations is array of { id, name, status, address }
 * ```
 */
export function useLocations(options?: { autoFetch?: boolean }) {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<any[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFetch = options?.autoFetch !== false;

  const fetchLocations = async () => {
    if (status !== 'authenticated') {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/user/locations`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id || '',
          'x-org-id': session?.org_id || '',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch locations');
      }

      setLocations(data.locations);
      setLocationIds(data.location_ids);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && locations.length === 0 && !loading) {
      fetchLocations();
    }
  }, [status, autoFetch]);

  return {
    locations,
    locationIds,
    loading: loading || status === 'loading',
    error,
    refetch: fetchLocations,
  };
}

// ============================================================================
// ORGANIZATION HOOK
// ============================================================================

/**
 * Fetch organization data including logo
 *
 * USAGE:
 * ```tsx
 * const { organization, loading } = useOrganization();
 *
 * return <img src={organization.logo_url} alt={organization.name} />;
 * ```
 */
export function useOrganization(options?: { autoFetch?: boolean }) {
  const { data: session, status } = useSession();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFetch = options?.autoFetch !== false;

  const fetchOrganization = async () => {
    if (status !== 'authenticated') {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/user/organization`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id || '',
          'x-org-id': session?.org_id || '',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch organization');
      }

      setOrganization(data.organization);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organization');
      console.error('Error fetching organization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && !organization && !loading) {
      fetchOrganization();
    }
  }, [status, autoFetch]);

  return {
    organization,
    loading: loading || status === 'loading',
    error,
    refetch: fetchOrganization,
  };
}

// ============================================================================
// USER PROFILE HOOK
// ============================================================================

/**
 * Fetch complete user profile
 *
 * USAGE:
 * ```tsx
 * const { profile, loading } = useUserProfile();
 * ```
 */
export function useUserProfile(options?: { autoFetch?: boolean }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFetch = options?.autoFetch !== false;

  const fetchProfile = async () => {
    if (status !== 'authenticated') {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id || '',
          'x-org-id': session?.org_id || '',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && !profile && !loading) {
      fetchProfile();
    }
  }, [status, autoFetch]);

  return {
    profile,
    loading: loading || status === 'loading',
    error,
    refetch: fetchProfile,
  };
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

/**
 * Manually invalidate user cache (useful after updates)
 *
 * USAGE:
 * ```tsx
 * const { invalidateCache } = useCacheInvalidation();
 *
 * // After updating user roles
 * await updateUserRoles(userId, newRoles);
 * await invalidateCache('roles'); // Clear roles cache
 *
 * // Or invalidate everything
 * await invalidateCache('all');
 * ```
 */
export function useCacheInvalidation() {
  const { data: session } = useSession();

  const invalidateCache = async (type: 'permissions' | 'roles' | 'locations' | 'profile' | 'all' = 'all') => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/user/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
          'x-user-id': session?.user?.id || '',
          'x-org-id': session?.org_id || '',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to invalidate cache');
      }

      console.log(`✅ Cache invalidated: ${type}`);
      return true;
    } catch (error: any) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  };

  return { invalidateCache };
}
