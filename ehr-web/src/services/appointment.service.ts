import { medplum } from '@/lib/medplum';
import { Appointment, AppointmentStats, AppointmentStatus } from '@/types/appointment';

// FHIR Appointment type
interface FHIRAppointment {
  resourceType: 'Appointment';
  id?: string;
  status?: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  start?: string;
  end?: string;
  minutesDuration?: number;
  comment?: string;
  description?: string;
  appointmentType?: {
    coding?: Array<{ display?: string }>;
  };
  participant?: Array<{
    actor?: {
      reference?: string;
      display?: string;
    };
    status?: string;
  }>;
  meta?: {
    lastUpdated?: string;
  };
}

export class AppointmentService {
  /**
   * Fetch appointments for a given date range
   */
  static async getAppointments(
    startDate: Date,
    endDate: Date,
    practitionerId?: string
  ): Promise<Appointment[]> {
    try {
      const searchParams: Record<string, string> = {
        date: `ge${startDate.toISOString()}`,
        _sort: 'date'
      };

      if (endDate) {
        searchParams.date = `${searchParams.date},le${endDate.toISOString()}`;
      }

      if (practitionerId) {
        searchParams.actor = `Practitioner/${practitionerId}`;
      }

      const bundle = await medplum.searchResources('Appointment', searchParams);

      return bundle.map((fhir) => AppointmentService.transformFHIRAppointment(fhir));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  /**
   * Get appointments for a specific date
   */
  static async getAppointmentsByDate(date: Date, practitionerId?: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getAppointments(startOfDay, endOfDay, practitionerId);
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(startDate: Date, endDate: Date): Promise<AppointmentStats> {
    const appointments = await this.getAppointments(startDate, endDate);

    return {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      inProgress: appointments.filter(a => a.status === 'in-progress').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    };
  }

  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    try {
      const fhirAppointment: Partial<FHIRAppointment> = {
        resourceType: 'Appointment',
        status: AppointmentService.mapStatusToFHIR(appointmentData.status || 'scheduled'),
        start: appointmentData.startTime?.toISOString(),
        end: appointmentData.endTime?.toISOString(),
        minutesDuration: appointmentData.duration,
        comment: appointmentData.reason,
        participant: [
          {
            actor: {
              reference: `Patient/${appointmentData.patientId}`,
              display: appointmentData.patientName
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: `Practitioner/${appointmentData.practitionerId}`,
              display: appointmentData.practitionerName
            },
            status: 'accepted'
          }
        ]
      };

      const created = await medplum.createResource(fhirAppointment as FHIRAppointment);
      return AppointmentService.transformFHIRAppointment(created);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update an appointment
   */
  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      // Build FHIR update payload with only the fields we're updating
      const updatePayload: Partial<FHIRAppointment> = {
        resourceType: 'Appointment',
        id: id
      };

      if (updates.status) {
        updatePayload.status = AppointmentService.mapStatusToFHIR(updates.status);
      }
      if (updates.startTime) {
        updatePayload.start = updates.startTime instanceof Date
          ? updates.startTime.toISOString()
          : new Date(updates.startTime).toISOString();
      }
      if (updates.endTime) {
        updatePayload.end = updates.endTime instanceof Date
          ? updates.endTime.toISOString()
          : new Date(updates.endTime).toISOString();
      }
      if (updates.duration) {
        updatePayload.minutesDuration = updates.duration;
      }
      if (updates.reason) {
        updatePayload.comment = updates.reason;
      }

      // Use PATCH instead of full update
      const result = await medplum.patchResource('Appointment', id, [
        {
          op: 'replace',
          path: '/start',
          value: updatePayload.start
        },
        {
          op: 'replace',
          path: '/end',
          value: updatePayload.end
        }
      ]);

      return AppointmentService.transformFHIRAppointment(result);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    return this.updateAppointment(id, {
      status: 'cancelled',
      notes: reason
    });
  }

  /**
   * Transform FHIR Appointment to our Appointment type
   */
  private static transformFHIRAppointment(fhir: FHIRAppointment): Appointment {
    const patient = fhir.participant?.find((p) => p.actor?.reference?.startsWith('Patient/'));
    const practitioner = fhir.participant?.find((p) => p.actor?.reference?.startsWith('Practitioner/'));

    return {
      id: fhir.id!,
      patientId: patient?.actor?.reference?.split('/')[1] || '',
      patientName: patient?.actor?.display || 'Unknown Patient',
      practitionerId: practitioner?.actor?.reference?.split('/')[1] || '',
      practitionerName: practitioner?.actor?.display || 'Unknown Practitioner',
      appointmentType: fhir.appointmentType?.coding?.[0]?.display || 'General',
      status: AppointmentService.mapStatusFromFHIR(fhir.status),
      startTime: new Date(fhir.start || ''),
      endTime: new Date(fhir.end || ''),
      duration: fhir.minutesDuration || 30,
      reason: fhir.comment,
      notes: fhir.description,
      createdAt: new Date(fhir.meta?.lastUpdated || ''),
      updatedAt: new Date(fhir.meta?.lastUpdated || '')
    };
  }

  /**
   * Map our status to FHIR status
   */
  private static mapStatusToFHIR(status: AppointmentStatus): FHIRAppointment['status'] {
    const statusMap: Record<AppointmentStatus, FHIRAppointment['status']> = {
      'scheduled': 'booked',
      'in-progress': 'arrived',
      'completed': 'fulfilled',
      'cancelled': 'cancelled',
      'no-show': 'noshow',
      'rescheduled': 'booked'
    };
    return statusMap[status] || 'booked';
  }

  /**
   * Map FHIR status to our status
   */
  private static mapStatusFromFHIR(status?: FHIRAppointment['status']): AppointmentStatus {
    const statusMap: Record<string, AppointmentStatus> = {
      'booked': 'scheduled',
      'arrived': 'in-progress',
      'fulfilled': 'completed',
      'cancelled': 'cancelled',
      'noshow': 'no-show',
      'pending': 'scheduled'
    };
    return statusMap[status || 'booked'] || 'scheduled';
  }
}
