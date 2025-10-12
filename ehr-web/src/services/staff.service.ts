import { StaffMember, OfficeHours, VacationSchedule } from '@/types/staff';

// FHIR Extension URLs for custom fields
const EXTENSION_URLS = {
  color: 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-color',
  officeHours: 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-office-hours',
  vacationSchedule: 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-vacation',
  employmentType: 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-employment-type'
};

export class StaffService {
  private static baseUrl = '/api/fhir';

  /**
   * Convert FHIR Practitioner resource to StaffMember
   */
  private static fhirToStaffMember(resource: any): StaffMember {
    const name = resource.name?.[0];
    const telecom = resource.telecom || [];
    const qualification = resource.qualification?.[0];
    const extensions = resource.extension || [];

    // Extract custom extensions
    const colorExt = extensions.find((ext: any) => ext.url === EXTENSION_URLS.color);
    const officeHoursExt = extensions.find((ext: any) => ext.url === EXTENSION_URLS.officeHours);
    const vacationExt = extensions.find((ext: any) => ext.url === EXTENSION_URLS.vacationSchedule);
    const employmentExt = extensions.find((ext: any) => ext.url === EXTENSION_URLS.employmentType);

    return {
      id: resource.id,
      name: name ? `${(name.given || []).join(' ')} ${name.family || ''}`.trim() : 'Unknown',
      specialty: qualification?.code?.coding?.[0]?.display || 'General Practitioner',
      phone: telecom.find((t: any) => t.system === 'phone')?.value || '',
      email: telecom.find((t: any) => t.system === 'email')?.value || '',
      qualification: qualification?.code?.text || qualification?.code?.coding?.[0]?.display || 'Medical Doctor',
      active: resource.active !== false,
      resourceType: resource.resourceType,
      color: colorExt?.valueString || '#3B82F6',
      officeHours: officeHoursExt?.valueString ? JSON.parse(officeHoursExt.valueString) : undefined,
      vacationSchedules: vacationExt?.valueString ? JSON.parse(vacationExt.valueString) : undefined,
      employmentType: employmentExt?.valueString as any || 'full-time'
    };
  }

  /**
   * Convert StaffMember to FHIR Practitioner resource
   */
  private static staffMemberToFhir(staff: StaffMember): any {
    const nameParts = staff.name.split(' ');
    const family = nameParts.pop() || '';
    const given = nameParts;

    const extensions = [];

    if (staff.color) {
      extensions.push({
        url: EXTENSION_URLS.color,
        valueString: staff.color
      });
    }

    if (staff.officeHours) {
      extensions.push({
        url: EXTENSION_URLS.officeHours,
        valueString: JSON.stringify(staff.officeHours)
      });
    }

    if (staff.vacationSchedules) {
      extensions.push({
        url: EXTENSION_URLS.vacationSchedule,
        valueString: JSON.stringify(staff.vacationSchedules)
      });
    }

    if (staff.employmentType) {
      extensions.push({
        url: EXTENSION_URLS.employmentType,
        valueString: staff.employmentType
      });
    }

    return {
      resourceType: 'Practitioner',
      id: staff.id,
      active: staff.active,
      name: [
        {
          family,
          given,
          use: 'official'
        }
      ],
      telecom: [
        staff.phone && {
          system: 'phone',
          value: staff.phone,
          use: 'work'
        },
        staff.email && {
          system: 'email',
          value: staff.email,
          use: 'work'
        }
      ].filter(Boolean),
      qualification: [
        {
          code: {
            text: staff.qualification,
            coding: [
              {
                display: staff.specialty
              }
            ]
          }
        }
      ],
      extension: extensions
    };
  }

  /**
   * Get all practitioners
   */
  static async getPractitioners(params?: {
    name?: string;
    active?: boolean;
    count?: number;
  }): Promise<StaffMember[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.name) queryParams.append('name', params.name);
      if (params?.active !== undefined) queryParams.append('active', params.active.toString());
      if (params?.count) queryParams.append('_count', params.count.toString());

      const url = `${this.baseUrl}/Practitioner${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch practitioners: ${response.statusText}`);
      }

      const bundle = await response.json();
      return (bundle.entry || []).map((entry: any) => this.fhirToStaffMember(entry.resource));
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      throw error;
    }
  }

  /**
   * Get a single practitioner by ID
   */
  static async getPractitioner(id: string): Promise<StaffMember> {
    try {
      const response = await fetch(`${this.baseUrl}/Practitioner/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch practitioner: ${response.statusText}`);
      }

      const resource = await response.json();
      return this.fhirToStaffMember(resource);
    } catch (error) {
      console.error('Error fetching practitioner:', error);
      throw error;
    }
  }

  /**
   * Create a new practitioner
   */
  static async createPractitioner(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    try {
      const fhirResource = this.staffMemberToFhir({ ...staff, id: '' } as StaffMember);
      delete fhirResource.id; // Let the server generate the ID

      const response = await fetch(`${this.baseUrl}/Practitioner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(fhirResource)
      });

      if (!response.ok) {
        throw new Error(`Failed to create practitioner: ${response.statusText}`);
      }

      const resource = await response.json();
      return this.fhirToStaffMember(resource);
    } catch (error) {
      console.error('Error creating practitioner:', error);
      throw error;
    }
  }

  /**
   * Update an existing practitioner
   */
  static async updatePractitioner(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    try {
      // First, get the existing practitioner
      const existing = await this.getPractitioner(id);

      // Merge updates with existing data
      const updated = { ...existing, ...updates, id };

      // Convert to FHIR resource
      const fhirResource = this.staffMemberToFhir(updated);

      const response = await fetch(`${this.baseUrl}/Practitioner/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(fhirResource)
      });

      if (!response.ok) {
        throw new Error(`Failed to update practitioner: ${response.statusText}`);
      }

      const resource = await response.json();
      return this.fhirToStaffMember(resource);
    } catch (error) {
      console.error('Error updating practitioner:', error);
      throw error;
    }
  }

  /**
   * Delete a practitioner (soft delete by setting active = false)
   */
  static async deletePractitioner(id: string): Promise<void> {
    try {
      await this.updatePractitioner(id, { active: false });
    } catch (error) {
      console.error('Error deleting practitioner:', error);
      throw error;
    }
  }

  /**
   * Update office hours for a practitioner
   */
  static async updateOfficeHours(id: string, officeHours: OfficeHours[]): Promise<StaffMember> {
    return this.updatePractitioner(id, { officeHours });
  }

  /**
   * Update vacation schedules for a practitioner
   */
  static async updateVacationSchedules(id: string, vacationSchedules: VacationSchedule[]): Promise<StaffMember> {
    return this.updatePractitioner(id, { vacationSchedules });
  }

  /**
   * Update practitioner color
   */
  static async updateColor(id: string, color: string): Promise<StaffMember> {
    return this.updatePractitioner(id, { color });
  }
}
