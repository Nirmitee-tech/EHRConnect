import { medplum } from '@/lib/medplum';
import { Encounter, EncounterStatus } from '@/types/encounter';
import { Appointment } from '@/types/appointment';

// FHIR Encounter type
interface FHIREncounter {
  resourceType: 'Encounter';
  id?: string;
  status?: 'planned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'entered-in-error';
  class?: {
    system?: string;
    code?: string;
    display?: string;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  participant?: Array<{
    individual?: {
      reference?: string;
      display?: string;
    };
    type?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
  }>;
  appointment?: Array<{
    reference?: string;
  }>;
  period?: {
    start?: string;
    end?: string;
  };
  reasonCode?: Array<{
    text?: string;
  }>;
  location?: Array<{
    location?: {
      display?: string;
    };
  }>;
  meta?: {
    lastUpdated?: string;
  };
}

export class EncounterService {
  /**
   * Create an encounter from an appointment
   */
  static async createFromAppointment(appointment: Appointment): Promise<Encounter> {
    try {
      const fhirEncounter: Partial<FHIREncounter> = {
        resourceType: 'Encounter',
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory'
        },
        subject: {
          reference: `Patient/${appointment.patientId}`,
          display: appointment.patientName
        },
        participant: [
          {
            individual: {
              reference: `Practitioner/${appointment.practitionerId}`,
              display: appointment.practitionerName
            },
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PPRF',
                    display: 'primary performer'
                  }
                ]
              }
            ]
          }
        ],
        appointment: [
          {
            reference: `Appointment/${appointment.id}`
          }
        ],
        period: {
          start: appointment.startTime instanceof Date
            ? appointment.startTime.toISOString()
            : new Date(appointment.startTime).toISOString()
        },
        reasonCode: appointment.reason ? [
          {
            text: appointment.reason
          }
        ] : undefined,
        location: appointment.location ? [
          {
            location: {
              display: appointment.location
            }
          }
        ] : undefined
      };

      const created = await medplum.createResource(fhirEncounter as FHIREncounter);
      return EncounterService.transformFHIREncounter(created, appointment);
    } catch (error) {
      console.error('Error creating encounter:', error);
      throw error;
    }
  }

  /**
   * Get encounter by ID
   */
  static async getById(id: string): Promise<Encounter> {
    try {
      const fhirEncounter = await medplum.readResource('Encounter', id);

      // We need the appointment to get patient and practitioner names
      const appointmentRef = fhirEncounter.appointment?.[0]?.reference;
      let appointment: Appointment | undefined;

      if (appointmentRef) {
        const appointmentId = appointmentRef.split('/')[1];
        try {
          const fhirAppointment = await medplum.readResource('Appointment', appointmentId);
          const patient = fhirAppointment.participant?.find((p: any) => p.actor?.reference?.startsWith('Patient/'));
          const practitioner = fhirAppointment.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'));

          appointment = {
            id: appointmentId,
            patientId: patient?.actor?.reference?.split('/')[1] || '',
            patientName: patient?.actor?.display || 'Unknown Patient',
            practitionerId: practitioner?.actor?.reference?.split('/')[1] || '',
            practitionerName: practitioner?.actor?.display || 'Unknown Practitioner',
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            status: 'scheduled',
            appointmentType: 'General',
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } catch (error) {
          console.error('Error fetching appointment:', error);
        }
      }

      return EncounterService.transformFHIREncounter(fhirEncounter, appointment);
    } catch (error) {
      console.error('Error fetching encounter:', error);
      throw error;
    }
  }

  /**
   * Update encounter
   */
  static async update(id: string, data: Partial<Encounter>): Promise<Encounter> {
    try {
      const patchOps: Array<{op: string; path: string; value: any}> = [];

      if (data.status) {
        patchOps.push({
          op: 'replace',
          path: '/status',
          value: data.status
        });
      }

      if (data.chiefComplaint) {
        patchOps.push({
          op: 'replace',
          path: '/reasonCode',
          value: [{ text: data.chiefComplaint }]
        });
      }

      if (data.endTime) {
        const encounter = await medplum.readResource('Encounter', id);
        patchOps.push({
          op: 'replace',
          path: '/period',
          value: {
            start: encounter.period?.start,
            end: data.endTime instanceof Date ? data.endTime.toISOString() : new Date(data.endTime).toISOString()
          }
        });
      }

      const result = await medplum.patchResource('Encounter', id, patchOps);
      return EncounterService.transformFHIREncounter(result);
    } catch (error) {
      console.error('Error updating encounter:', error);
      throw error;
    }
  }

  /**
   * Update encounter status
   */
  static async updateStatus(id: string, status: EncounterStatus): Promise<Encounter> {
    return this.update(id, { status });
  }

  /**
   * Complete encounter and update associated appointment
   */
  static async complete(id: string): Promise<Encounter> {
    try {
      // First, update the encounter status
      const updatedEncounter = await this.update(id, {
        status: 'completed',
        endTime: new Date()
      });

      // Then, update the associated appointment status to completed
      if (updatedEncounter.appointmentId) {
        try {
          const { medplum } = await import('@/lib/medplum');
          await medplum.patchResource('Appointment', updatedEncounter.appointmentId, [
            {
              op: 'replace',
              path: '/status',
              value: 'fulfilled' // FHIR status for completed
            }
          ]);
          console.log(`Appointment ${updatedEncounter.appointmentId} marked as completed`);
        } catch (appointmentError) {
          console.error('Error updating appointment status:', appointmentError);
          // Don't throw - encounter is still completed even if appointment update fails
        }
      }

      return updatedEncounter;
    } catch (error) {
      console.error('Error completing encounter:', error);
      throw error;
    }
  }

  /**
   * Get all encounters for a patient
   */
  static async getByPatientId(patientId: string): Promise<Encounter[]> {
    try {
      const bundle = await medplum.searchResources('Encounter', {
        subject: `Patient/${patientId}`,
        _sort: '-date'
      });

      return bundle.map((fhir: FHIREncounter) => EncounterService.transformFHIREncounter(fhir));
    } catch (error) {
      console.error('Error fetching encounters:', error);
      return [];
    }
  }

  /**
   * Transform FHIR Encounter to our Encounter type
   */
  private static transformFHIREncounter(fhir: FHIREncounter, appointment?: Appointment): Encounter {
    const subject = fhir.subject;
    const practitioner = fhir.participant?.[0]?.individual;
    const appointmentRef = fhir.appointment?.[0]?.reference;

    return {
      id: fhir.id!,
      appointmentId: appointmentRef?.split('/')[1],
      patientId: appointment?.patientId || subject?.reference?.split('/')[1] || '',
      patientName: appointment?.patientName || subject?.display || 'Unknown Patient',
      practitionerId: appointment?.practitionerId || practitioner?.reference?.split('/')[1] || '',
      practitionerName: appointment?.practitionerName || practitioner?.display || 'Unknown Practitioner',
      status: fhir.status || 'in-progress',
      class: fhir.class?.code === 'AMB' ? 'ambulatory' :
             fhir.class?.code === 'EMER' ? 'emergency' :
             fhir.class?.code === 'IMP' ? 'inpatient' :
             fhir.class?.code === 'VR' ? 'virtual' : 'outpatient',
      startTime: new Date(fhir.period?.start || new Date()),
      endTime: fhir.period?.end ? new Date(fhir.period.end) : undefined,
      reasonDisplay: fhir.reasonCode?.[0]?.text,
      location: fhir.location?.[0]?.location?.display,
      createdAt: new Date(fhir.meta?.lastUpdated || new Date()),
      updatedAt: new Date(fhir.meta?.lastUpdated || new Date())
    };
  }
}
