import type {
  CountryPack,
  CountryModule,
  CountryContext,
  CountryModuleConfig,
  CountryPackAudit
} from '@/types/country';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Country Pack Service
 * Handles all API calls related to country-specific configuration
 */
class CountryService {
  /**
   * Get all available country packs
   */
  async getAllCountryPacks(
    headers: Record<string, string>,
    activeOnly: boolean = true
  ): Promise<CountryPack[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/countries/packs?active=${activeOnly}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch country packs');
      }

      const data = await response.json();
      return data.packs || [];
    } catch (error) {
      console.error('Error fetching country packs:', error);
      throw error;
    }
  }

  /**
   * Get country pack by code
   */
  async getCountryPack(
    countryCode: string,
    headers: Record<string, string>
  ): Promise<CountryPack> {
    try {
      const response = await fetch(
        `${API_URL}/api/countries/packs/${countryCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch country pack: ${countryCode}`);
      }

      const data = await response.json();
      return data.pack;
    } catch (error) {
      console.error('Error fetching country pack:', error);
      throw error;
    }
  }

  /**
   * Get modules available for a country
   */
  async getCountryModules(
    countryCode: string,
    headers: Record<string, string>,
    activeOnly: boolean = true
  ): Promise<CountryModule[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/countries/packs/${countryCode}/modules?active=${activeOnly}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch modules for ${countryCode}`);
      }

      const data = await response.json();
      return data.modules || [];
    } catch (error) {
      console.error('Error fetching country modules:', error);
      throw error;
    }
  }

  /**
   * Get country context for current organization
   */
  async getCountryContext(
    headers: Record<string, string>
  ): Promise<CountryContext> {
    try {
      const response = await fetch(
        `${API_URL}/api/countries/context`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch country context');
      }

      const data = await response.json();
      return data.context;
    } catch (error) {
      console.error('Error fetching country context:', error);
      throw error;
    }
  }

  /**
   * Enable country pack for organization (Admin only)
   */
  async enableCountryPack(
    orgId: string,
    countryCode: string,
    headers: Record<string, string>,
    scope: 'org' | 'location' = 'org',
    scopeRefId: string | null = null,
    overrides: Record<string, any> = {}
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orgs/${orgId}/country`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            countryCode,
            scope,
            scopeRefId,
            overrides
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable country pack');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error enabling country pack:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enable modules for organization (Admin only)
   */
  async enableModules(
    orgId: string,
    modules: CountryModuleConfig[],
    headers: Record<string, string>
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orgs/${orgId}/country/modules`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            enable: modules
          })
        }
      );

      const data = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || 'Failed to enable modules');
      }

      return { success: data.success, data };
    } catch (error) {
      console.error('Error enabling modules:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Disable modules for organization (Admin only)
   */
  async disableModules(
    orgId: string,
    modules: Array<{ moduleCode: string; scope?: string; scopeRefId?: string | null }>,
    headers: Record<string, string>
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orgs/${orgId}/country/modules`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            disable: modules
          })
        }
      );

      const data = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || 'Failed to disable modules');
      }

      return { success: data.success, data };
    } catch (error) {
      console.error('Error disabling modules:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update module configuration (Admin only)
   */
  async updateModuleConfig(
    orgId: string,
    moduleCode: string,
    config: Record<string, any>,
    headers: Record<string, string>,
    scope: 'org' | 'location' | 'department' = 'org',
    scopeRefId: string | null = null
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orgs/${orgId}/country/modules/${moduleCode}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            config,
            scope,
            scopeRefId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update module config');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating module config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get audit history for country pack changes (Admin only)
   */
  async getAuditHistory(
    orgId: string,
    headers: Record<string, string>,
    countryCode?: string,
    limit: number = 50
  ): Promise<CountryPackAudit[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(countryCode && { countryCode })
      });

      const response = await fetch(
        `${API_URL}/api/admin/orgs/${orgId}/country/history?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audit history');
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error fetching audit history:', error);
      throw error;
    }
  }

  /**
   * Clear country pack cache (Admin only)
   */
  async clearCache(headers: Record<string, string>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/countries/cache`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear cache');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const countryService = new CountryService();
