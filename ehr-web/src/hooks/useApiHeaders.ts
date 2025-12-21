/**
 * Hook to get API headers from session
 * Use this hook to get properly authenticated headers for API calls
 */

'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

export interface ApiHeaders {
  'x-org-id': string;
  'x-user-id': string;
  'x-org-slug'?: string;
  'x-location-ids'?: string;
  [key: string]: string | undefined;
}

export function useApiHeaders(): ApiHeaders {
  const { data: session } = useSession();

  return useMemo(() => {
    const headers: ApiHeaders = {
      'x-org-id': session?.org_id || '',
      'x-user-id': session?.user?.id || '',
    };

    if (session?.org_slug) {
      headers['x-org-slug'] = session.org_slug;
    }

    if (session?.location_ids) {
      headers['x-location-ids'] = JSON.stringify(session.location_ids);
    }

    return headers;
  }, [session?.org_id, session?.user?.id, session?.org_slug, session?.location_ids]);
}

/**
 * Alternative: Get headers object without React hooks (for use in non-component contexts)
 */
export function getApiHeadersFromSession(session: any): ApiHeaders {
  const headers: ApiHeaders = {
    'x-org-id': session?.org_id || '',
    'x-user-id': session?.user?.id || '',
  };

  if (session?.org_slug) {
    headers['x-org-slug'] = session.org_slug;
  }

  if (session?.location_ids) {
    headers['x-location-ids'] = JSON.stringify(session.location_ids);
  }

  return headers;
}
