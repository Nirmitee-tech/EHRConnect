import { useSession } from 'next-auth/react';

/**
 * Hook to get current organization from session
 */
export function useOrganization() {
  const { data: session, status } = useSession();

  return {
    orgId: session?.org_id || null,
    orgSlug: session?.org_slug || null,
    locationIds: session?.location_ids || [],
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
