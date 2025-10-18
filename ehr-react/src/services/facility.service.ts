import { fhirService } from '@/lib/medplum';
import type { FHIROrganization, FacilitySummary, AuditLogEntry } from '@/types/fhir';

export interface FacilitySearchParams {
  active?: boolean;
  name?: string;
  type?: string;
  parentOrgId?: string;
  _count?: number;
  _offset?: number;
  _sort?: string;
}

export interface CreateFacilityRequest {
  name: string;
  type: 'clinic' | 'hospital' | 'lab' | 'pharmacy';
  parentOrgId?: string;
  address?: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  identifiers?: Array<{
    system: string;
    value: string;
    type?: string;
  }>;
}

export interface UpdateFacilityRequest extends Partial<CreateFacilityRequest> {
  id: string;
  active?: boolean;
}

export class FacilityService {
  private auditLog: AuditLogEntry[] = [];

  /**
   * Search facilities with filtering
   */
  async searchFacilities(params: FacilitySearchParams = {}): Promise<{
    facilities: FacilitySummary[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const searchParams: Record<string, string | number | boolean> = {
        _count: params._count || 50,
        _offset: params._offset || 0,
        _sort: params._sort || 'name'
      };

      // Filter by active status
      if (params.active !== undefined) {
        searchParams.active = params.active;
      }

      // Name search
      if (params.name) {
        searchParams.name = params.name;
      }

      // Type filter
      if (params.type) {
        searchParams.type = params.type;
      }

      // Parent organization filter
      if (params.parentOrgId) {
        searchParams.partof = `Organization/${params.parentOrgId}`;
      }

      const response = await fhirService.search('Organization', searchParams);
      
      const facilities: FacilitySummary[] = [];

      if (response.entry) {
        response.entry
          .filter(entry => this.isOrganizationResource(entry.resource))
          .forEach(entry => {
            const org = entry.resource as FHIROrganization;
            const summary = this.convertToFacilitySummary(org);
            if (summary) {
              facilities.push(summary);
            }
          });
      }

      return {
        facilities,
        total: response.total || 0,
        hasMore: facilities.length === (params._count || 50)
      };

    } catch (error) {
      console.error('Error searching facilities:', error);
      throw new Error('Failed to search facilities');
    }
  }

  /**
   * Get a single facility by ID
   */
  async getFacilityById(id: string): Promise<FHIROrganization | null> {
    try {
      return await fhirService.read<FHIROrganization>('Organization', id);
    } catch (error) {
      console.error('Error fetching facility:', error);
      return null;
    }
  }

  /**
   * Create a new facility
   */
  async createFacility(request: CreateFacilityRequest, userId: string): Promise<FHIROrganization> {
    try {
      const facility = this.buildFacilityResource(request);
      
      const createdFacility = await fhirService.create(facility) as FHIROrganization;

      // Log audit entry
      this.logAudit({
        resourceType: 'Organization',
        resourceId: createdFacility.id!,
        action: 'CREATE',
        userId,
        facilityId: createdFacility.id!,
        timestamp: new Date().toISOString(),
        changes: request as Record<string, unknown>
      });

      return createdFacility;
    } catch (error) {
      console.error('Error creating facility:', error);
      throw new Error('Failed to create facility');
    }
  }

  /**
   * Update an existing facility
   */
  async updateFacility(request: UpdateFacilityRequest, userId: string): Promise<FHIROrganization> {
    try {
      // Get existing facility first
      const existingFacility = await this.getFacilityById(request.id);
      if (!existingFacility) {
        throw new Error('Facility not found');
      }

      // Build updated facility resource
      const updatedFacility = this.mergeFacilityUpdate(existingFacility, request);
      
      const result = await fhirService.update(updatedFacility) as FHIROrganization;

      // Log audit entry
      this.logAudit({
        resourceType: 'Organization',
        resourceId: request.id,
        action: 'UPDATE',
        userId,
        facilityId: request.id,
        timestamp: new Date().toISOString(),
        changes: request as Record<string, unknown>
      });

      return result;
    } catch (error) {
      console.error('Error updating facility:', error);
      throw new Error('Failed to update facility');
    }
  }

  /**
   * Soft delete a facility (set active = false)
   */
  async softDeleteFacility(id: string, userId: string): Promise<FHIROrganization> {
    try {
      const existingFacility = await this.getFacilityById(id);
      if (!existingFacility) {
        throw new Error('Facility not found');
      }

      const deactivatedFacility = {
        ...existingFacility,
        active: false
      };

      const result = await fhirService.update(deactivatedFacility) as FHIROrganization;

      // Log audit entry
      this.logAudit({
        resourceType: 'Organization',
        resourceId: id,
        action: 'DELETE',
        userId,
        facilityId: id,
        timestamp: new Date().toISOString(),
        changes: { active: false }
      });

      return result;
    } catch (error) {
      console.error('Error soft deleting facility:', error);
      throw new Error('Failed to delete facility');
    }
  }

  /**
   * Get all active facilities for dropdown/selection
   */
  async getActiveFacilities(): Promise<FacilitySummary[]> {
    const result = await this.searchFacilities({ 
      active: true, 
      _count: 1000,
      _sort: 'name'
    });
    return result.facilities;
  }

  /**
   * Convert FHIR Organization to FacilitySummary
   */
  private convertToFacilitySummary(org: FHIROrganization): FacilitySummary | null {
    if (!org.id || !org.name) return null;

    const type = this.extractFacilityType(org);
    const parentOrgId = this.extractParentOrgId(org);

    return {
      id: org.id,
      name: org.name,
      type,
      active: org.active !== false,
      parentOrgId
    };
  }

  /**
   * Extract facility type from organization
   */
  private extractFacilityType(org: FHIROrganization): string | undefined {
    return org.type?.[0]?.coding?.[0]?.code || org.type?.[0]?.coding?.[0]?.display;
  }

  /**
   * Extract parent organization ID
   */
  private extractParentOrgId(org: FHIROrganization): string | undefined {
    const ref = org.partOf?.reference;
    if (ref?.startsWith('Organization/')) {
      return ref.substring('Organization/'.length);
    }
    return undefined;
  }

  /**
   * Build FHIR Organization resource from request
   */
  private buildFacilityResource(request: CreateFacilityRequest): Omit<FHIROrganization, 'id'> {
    const identifiers = request.identifiers?.map(id => ({
      use: 'official' as const,
      system: id.system,
      value: id.value,
      type: id.type ? {
        coding: [{
          code: id.type,
          display: id.type
        }]
      } : undefined
    }));

    const telecom = [];
    if (request.email) {
      telecom.push({
        system: 'email' as const,
        value: request.email,
        use: 'work' as const
      });
    }
    if (request.phone) {
      telecom.push({
        system: 'phone' as const,
        value: request.phone,
        use: 'work' as const
      });
    }

    return {
      resourceType: 'Organization',
      identifier: identifiers,
      active: true,
      type: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/organization-type',
          code: request.type,
          display: request.type.charAt(0).toUpperCase() + request.type.slice(1)
        }]
      }],
      name: request.name,
      telecom: telecom.length > 0 ? telecom : undefined,
      address: request.address ? [{
        use: 'work',
        type: 'physical',
        line: request.address.line,
        city: request.address.city,
        state: request.address.state,
        postalCode: request.address.postalCode,
        country: request.address.country || 'US'
      }] : undefined,
      partOf: request.parentOrgId ? {
        reference: `Organization/${request.parentOrgId}`
      } : undefined
    };
  }

  /**
   * Merge updates into existing facility resource
   */
  private mergeFacilityUpdate(existing: FHIROrganization, update: UpdateFacilityRequest): FHIROrganization {
    const updated = { ...existing };

    // Update active status
    if (update.active !== undefined) {
      updated.active = update.active;
    }

    // Update name
    if (update.name) {
      updated.name = update.name;
    }

    // Update type
    if (update.type) {
      updated.type = [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/organization-type',
          code: update.type,
          display: update.type.charAt(0).toUpperCase() + update.type.slice(1)
        }]
      }];
    }

    // Update contact info
    if (update.email || update.phone) {
      const telecom = [];
      if (update.email) {
        telecom.push({
          system: 'email' as const,
          value: update.email,
          use: 'work' as const
        });
      }
      if (update.phone) {
        telecom.push({
          system: 'phone' as const,
          value: update.phone,
          use: 'work' as const
        });
      }
      updated.telecom = telecom;
    }

    // Update address
    if (update.address) {
      updated.address = [{
        use: 'work',
        type: 'physical',
        line: update.address.line,
        city: update.address.city,
        state: update.address.state,
        postalCode: update.address.postalCode,
        country: update.address.country || 'US'
      }];
    }

    // Update parent organization
    if (update.parentOrgId) {
      updated.partOf = {
        reference: `Organization/${update.parentOrgId}`
      };
    }

    return updated;
  }

  /**
   * Log audit entry
   */
  private logAudit(entry: Omit<AuditLogEntry, 'id'>): void {
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      ...entry
    };
    this.auditLog.push(auditEntry);
    
    // In a real implementation, this would be sent to an audit service
    console.log('AUDIT:', auditEntry);
  }

  /**
   * Get audit logs (for demo purposes)
   */
  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Type guard to check if a resource is an Organization
   */
  private isOrganizationResource(resource: unknown): resource is FHIROrganization {
    return typeof resource === 'object' && resource !== null && 
           'resourceType' in resource && 
           (resource as { resourceType: string }).resourceType === 'Organization';
  }
}

// Export singleton instance
export const facilityService = new FacilityService();
