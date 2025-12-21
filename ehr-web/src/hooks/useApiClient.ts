/**
 * Hook to get an API client instance configured with session headers
 * Use this hook in components that make API calls to ensure proper authentication
 */

'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/services/api';
import type { AxiosInstance } from 'axios';

export function useApiClient(): AxiosInstance {
  const { data: session } = useSession();

  return useMemo(() => {
    const headers = {
      userId: session?.user?.id,
      orgId: session?.org_id,
      orgSlug: session?.org_slug,
      locationIds: session?.location_ids,
    };

    return createApiClient(headers);
  }, [session?.user?.id, session?.org_id, session?.org_slug, session?.location_ids]);
}
