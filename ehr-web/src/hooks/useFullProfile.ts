import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Custom hook to fetch full user profile data
 *
 * WHY THIS EXISTS:
 * To prevent "431 Request Header Fields Too Large" errors, we limit what's stored
 * in the NextAuth session. Large arrays (permissions, roles, location_ids) are
 * truncated to keep JWT cookies small.
 *
 * This hook fetches the complete user profile from the backend API when you need
 * data that's not available in the session.
 *
 * USAGE:
 * ```tsx
 * const { fullProfile, loading, error, refetch } = useFullProfile();
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 *
 * // Access full data
 * console.log(fullProfile.permissions); // All permissions, not just first 20
 * console.log(fullProfile.roles); // All roles, not just first 10
 * console.log(fullProfile.org_logo); // Organization logo URL
 * ```
 *
 * WHEN TO USE:
 * - When you need all permissions (session only has first 20)
 * - When you need all roles (session only has first 3)
 * - When you need org logo (not in session)
 * - When you need all location IDs (session only has first 10)
 * - When you need all org specialties (session only has first 5)
 *
 * WHEN NOT TO USE:
 * - For basic user info (id, name, email) - use useSession() instead
 * - For org_id, org_slug, org_name - use useSession() instead
 * - For checking if user is authenticated - use useSession() instead
 */
export function useFullProfile(options?: { autoFetch?: boolean }) {
  const { data: session, status } = useSession();
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoFetch = options?.autoFetch !== false; // Default to true

  const fetchProfile = async () => {
    if (status !== 'authenticated') {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setFullProfile(data.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching full profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && !fullProfile && !loading) {
      fetchProfile();
    }
  }, [status, autoFetch]);

  return {
    fullProfile,
    loading: loading || status === 'loading',
    error,
    refetch: fetchProfile,
    // Also expose session for convenience
    session,
  };
}

/**
 * Hook to check if user has a specific permission
 *
 * USAGE:
 * ```tsx
 * const hasPermission = usePermission('patients:read');
 * const canWrite = usePermission('patients:write');
 *
 * if (!hasPermission) return <div>Access denied</div>;
 * ```
 */
export function usePermission(permission: string) {
  const { fullProfile, loading } = useFullProfile();

  if (loading || !fullProfile) {
    return false;
  }

  const permissions = fullProfile.permissions || [];
  return permissions.includes(permission);
}

/**
 * Hook to check if user has a specific role
 *
 * USAGE:
 * ```tsx
 * const isAdmin = useRole('admin');
 * const isDoctor = useRole('practitioner');
 *
 * if (isAdmin) {
 *   return <AdminPanel />;
 * }
 * ```
 */
export function useRole(role: string) {
  const { fullProfile, loading } = useFullProfile();

  if (loading || !fullProfile) {
    return false;
  }

  const roles = fullProfile.roles || [];
  return roles.includes(role);
}
