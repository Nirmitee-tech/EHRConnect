import { fhirService } from '@/lib/medplum';
import type {
  FHIRPatient,
  FHIRBundle,
  FHIROrganization,
  PatientSummary,
  FacilitySummary,
  AuditLogEntry
} from '@/types/fhir';

export interface PatientSearchParams {
  facilityId?: string;
  active?: boolean;
  name?: string;
  mrn?: string;
  gender?: string;
  birthDate?: string;
  _count?: number;
  _offset?: number;
  _sort?: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  email?: string;
  phone?: string;
  address?: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  mrn?: string;
  facilityId: string;
  identifiers?: Array<{
    system: string;
    value: string;
    type?: string;
  }>;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
  active?: boolean;
}

export class PatientService {
  private auditLog: AuditLogEntry[] = [];

  /**
   * Search patients with facility filtering and other criteria
   */
  async searchPatients(params: PatientSearchParams = {}): Promise<{
    patients: PatientSummary[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const searchParams: Record<string, string | number | boolean> = {
        _count: params._count || 50,
        _offset: params._offset || 0,
        _sort: params._sort || '-_lastUpdated',
        _include: 'Patient:organization'
      };

      // Filter by facility (organization)
      if (params.facilityId) {
        searchParams.organization = params.facilityId;
      }

      // Filter by active status
      if (params.active !== undefined) {
        searchParams.active = params.active;
      }

      // Name search
      if (params.name) {
        searchParams.name = params.name;
      }

      // MRN search
      if (params.mrn) {
        searchParams.identifier = params.mrn;
      }

      // Gender filter
      if (params.gender) {
        searchParams.gender = params.gender;
      }

      // Birth date filter
      if (params.birthDate) {
        searchParams.birthdate = params.birthDate;
      }

      const response = await fhirService.search('Patient', searchParams);
      
      const patients: PatientSummary[] = [];
      const facilities = new Map<string, string>();

      if (response.entry) {
        // Extract facilities from included resources
        response.entry
          .filter(entry => this.isOrganizationResource(entry.resource))
          .forEach(entry => {
            const org = entry.resource as FHIROrganization;
            if (org.id && org.name) {
              facilities.set(org.id, org.name);
            }
          });

        // Process patient entries
        response.entry
          .filter(entry => this.isPatientResource(entry.resource))
          .forEach(entry => {
            const patient = entry.resource as FHIRPatient;
            const summary = this.convertToPatientSummary(patient, facilities);
            if (summary) {
              patients.push(summary);
            }
          });
      }

      return {
        patients,
        total: response.total || 0,
        hasMore: patients.length === (params._count || 50)
      };

    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Failed to search patients');
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatientById(id: string): Promise<FHIRPatient | null> {
    try {
      return await fhirService.getPatientById(id) as FHIRPatient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(request: CreatePatientRequest, userId: string): Promise<FHIRPatient> {
    try {
      const patient = this.buildPatientResource(request);
      
      const createdPatient = await fhirService.createPatient(patient) as FHIRPatient;

      // Log audit entry
      this.logAudit({
        resourceType: 'Patient',
        resourceId: createdPatient.id!,
        action: 'CREATE',
        userId,
        facilityId: request.facilityId,
        timestamp: new Date().toISOString(),
        changes: request
      });

      return createdPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient');
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(request: UpdatePatientRequest, userId: string): Promise<FHIRPatient> {
    try {
      // Get existing patient first
      const existingPatient = await this.getPatientById(request.id);
      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      // Build updated patient resource
      const updatedPatient = this.mergePatientUpdate(existingPatient, request);
      
      const result = await fhirService.update(updatedPatient) as FHIRPatient;

      // Log audit entry
      this.logAudit({
        resourceType: 'Patient',
        resourceId: request.id,
        action: 'UPDATE',
        userId,
        facilityId: request.facilityId || this.extractFacilityId(existingPatient),
        timestamp: new Date().toISOString(),
        changes: request
      });

      return result;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient');
    }
  }

  /**
   * Soft delete a patient (set active = false)
   */
  async softDeletePatient(id: string, userId: string): Promise<FHIRPatient> {
    try {
      const existingPatient = await this.getPatientById(id);
      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      const deactivatedPatient = {
        ...existingPatient,
        active: false
      };

      const result = await fhirService.update(deactivatedPatient) as FHIRPatient;

      // Log audit entry
      this.logAudit({
        resourceType: 'Patient',
        resourceId: id,
        action: 'DELETE',
        userId,
        facilityId: this.extractFacilityId(existingPatient),
        timestamp: new Date().toISOString(),
        changes: { active: false }
      });

      return result;
    } catch (error) {
      console.error('Error soft deleting patient:', error);
      throw new Error('Failed to delete patient');
    }
  }

  /**
   * Get patients by facility
   */
  async getPatientsByFacility(facilityId: string, params: Omit<PatientSearchParams, 'facilityId'> = {}): Promise<{
    patients: PatientSummary[];
    total: number;
    hasMore: boolean;
  }> {
    return this.searchPatients({ ...params, facilityId });
  }

  /**
   * Convert FHIR Patient to PatientSummary
   */
  private convertToPatientSummary(
    patient: FHIRPatient, 
    facilities: Map<string, string>
  ): PatientSummary | null {
    if (!patient.id) return null;

    const name = this.extractPatientName(patient);
    const mrn = this.extractMRN(patient);
    const facilityId = this.extractFacilityId(patient);
    const facilityName = facilityId ? facilities.get(facilityId) : undefined;

    return {
      id: patient.id,
      name,
      dateOfBirth: patient.birthDate || '',
      gender: patient.gender || 'unknown',
      mrn,
      facilityId,
      facilityName,
      active: patient.active !== false,
      lastUpdated: patient.meta?.lastUpdated
    };
  }

  /**
   * Extract patient name from FHIR resource
   */
  private extractPatientName(patient: FHIRPatient): string {
    const name = patient.name?.find(n => n.use === 'official') || patient.name?.[0];
    if (!name) return 'Unknown';

    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim() || 'Unknown';
  }

  /**
   * Extract MRN from patient identifiers
   */
  private extractMRN(patient: FHIRPatient): string | undefined {
    return patient.identifier?.find(
      id => id.type?.coding?.some(c => c.code === 'MR')
    )?.value;
  }

  /**
   * Extract facility ID from managing organization
   */
  private extractFacilityId(patient: FHIRPatient): string {
    const ref = patient.managingOrganization?.reference;
    if (ref?.startsWith('Organization/')) {
      return ref.substring('Organization/'.length);
    }
    return patient.managingOrganization?.reference || '';
  }

  /**
   * Build FHIR Patient resource from request
   */
  private buildPatientResource(request: CreatePatientRequest): Omit<FHIRPatient, 'id'> {
    const identifiers = [
      ...(request.identifiers?.map(id => ({
        use: 'official' as const,
        system: id.system,
        value: id.value,
        type: id.type ? {
          coding: [{
            code: id.type,
            display: id.type
          }]
        } : undefined
      })) || [])
    ];

    // Add MRN if provided
    if (request.mrn) {
      identifiers.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }]
        },
        value: request.mrn
      });
    }

    const telecom = [];
    if (request.email) {
      telecom.push({
        system: 'email' as const,
        value: request.email,
        use: 'home' as const
      });
    }
    if (request.phone) {
      telecom.push({
        system: 'phone' as const,
        value: request.phone,
        use: 'home' as const
      });
    }

    return {
      resourceType: 'Patient',
      identifier: identifiers.length > 0 ? identifiers : undefined,
      active: true,
      name: [{
        use: 'official',
        family: request.lastName,
        given: [request.firstName]
      }],
      telecom: telecom.length > 0 ? telecom : undefined,
      gender: request.gender,
      birthDate: request.dateOfBirth,
      address: request.address ? [{
        use: 'home',
        type: 'physical',
        line: request.address.line,
        city: request.address.city,
        state: request.address.state,
        postalCode: request.address.postalCode,
        country: request.address.country || 'US'
      }] : undefined,
      managingOrganization: {
        reference: `Organization/${request.facilityId}`
      }
    };
  }

  /**
   * Merge updates into existing patient resource
   */
  private mergePatientUpdate(existing: FHIRPatient, update: UpdatePatientRequest): FHIRPatient {
    const updated = { ...existing };

    // Update active status
    if (update.active !== undefined) {
      updated.active = update.active;
    }

    // Update name
    if (update.firstName || update.lastName) {
      const currentName = updated.name?.find(n => n.use === 'official') || updated.name?.[0];
      updated.name = [{
        use: 'official',
        family: update.lastName || currentName?.family || '',
        given: [update.firstName || currentName?.given?.[0] || '']
      }];
    }

    // Update gender
    if (update.gender) {
      updated.gender = update.gender;
    }

    // Update birth date
    if (update.dateOfBirth) {
      updated.birthDate = update.dateOfBirth;
    }

    // Update contact info
    if (update.email || update.phone) {
      const telecom = [];
      if (update.email) {
        telecom.push({
          system: 'email' as const,
          value: update.email,
          use: 'home' as const
        });
      }
      if (update.phone) {
        telecom.push({
          system: 'phone' as const,
          value: update.phone,
          use: 'home' as const
        });
      }
      updated.telecom = telecom;
    }

    // Update address
    if (update.address) {
      updated.address = [{
        use: 'home',
        type: 'physical',
        line: update.address.line,
        city: update.address.city,
        state: update.address.state,
        postalCode: update.address.postalCode,
        country: update.address.country || 'US'
      }];
    }

    // Update facility
    if (update.facilityId) {
      updated.managingOrganization = {
        reference: `Organization/${update.facilityId}`
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

  /**
   * Type guard to check if a resource is a Patient
   */
  private isPatientResource(resource: unknown): resource is FHIRPatient {
    return typeof resource === 'object' && resource !== null && 
           'resourceType' in resource && 
           (resource as { resourceType: string }).resourceType === 'Patient';
  }
}

// Export singleton instance
export const patientService = new PatientService();
