import { medplum } from '@/lib/medplum';
import { Appointment } from '@/types/appointment';

export type PatientFlowStatus =
  | 'checked-in'
  | 'waiting-room'
  | 'with-provider'
  | 'ready-checkout'
  | 'checked-out';

export interface PatientFlowData extends Appointment {
  flowStatus: PatientFlowStatus;
  checkedInAt?: Date;
  roomedAt?: Date;
  withProviderAt?: Date;
  readyCheckoutAt?: Date;
  checkedOutAt?: Date;
  room?: string;
  waitTime?: number; // in minutes
}

export class PatientFlowService {
  /**
   * Get today's patient flow (only today's appointments with flow status)
   */
  static async getTodayFlow(practitionerId?: string): Promise<PatientFlowData[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const searchParams: Record<string, string> = {
        date: `ge${today.toISOString()},le${tomorrow.toISOString()}`,
        status: 'booked,arrived,checked-in,fulfilled',
        _sort: 'date'
      };

      if (practitionerId) {
        searchParams.actor = `Practitioner/${practitionerId}`;
      }

      const bundle = await medplum.searchResources('Appointment', searchParams);

      const flowData = bundle
        .map((fhir: any) => PatientFlowService.transformToFlowData(fhir))
        .filter((data): data is PatientFlowData => {
          // Only show appointments that have started check-in process or are in progress
          return data.flowStatus !== null && data.status !== 'cancelled' && data.status !== 'no-show';
        });

      // Fetch practitioner colors
      const practitionerIds = [...new Set(flowData.map(f => f.practitionerId).filter(Boolean))];
      if (practitionerIds.length > 0) {
        const practitioners = await medplum.searchResources('Practitioner', {
          _id: practitionerIds.join(',')
        });

        const colorMap: Record<string, string> = {};
        practitioners.forEach((p: any) => {
          const colorExt = p.extension?.find((e: any) =>
            e.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-color'
          );
          if (colorExt && p.id) {
            colorMap[p.id] = colorExt.valueString;
          }
        });

        flowData.forEach(f => {
          if (f.practitionerId) {
            f.practitionerColor = colorMap[f.practitionerId];
          }
        });
      }

      return flowData;
    } catch (error) {
      console.error('Error fetching patient flow:', error);
      return [];
    }
  }

  /**
   * Update patient flow status
   */
  static async updateFlowStatus(
    appointmentId: string,
    flowStatus: PatientFlowStatus,
    room?: string
  ): Promise<PatientFlowData> {
    try {
      const appointment: any = await medplum.readResource('Appointment', appointmentId);

      // Get existing extensions
      const extensions = appointment.extension || [];

      // Remove old flow status extension if exists
      const filteredExtensions = extensions.filter((ext: any) =>
        ext.url !== 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-status' &&
        ext.url !== 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-timestamps' &&
        ext.url !== 'http://ehrconnect.io/fhir/StructureDefinition/patient-room'
      );

      // Add new flow status
      filteredExtensions.push({
        url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-status',
        valueString: flowStatus
      });

      // Update timestamps
      const now = new Date().toISOString();
      const timestamps: any = {};

      // Preserve existing timestamps
      const existingTimestamps = extensions.find((ext: any) =>
        ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-timestamps'
      );
      if (existingTimestamps?.valueString) {
        try {
          Object.assign(timestamps, JSON.parse(existingTimestamps.valueString));
        } catch (e) {
          // ignore parse errors
        }
      }

      // Add new timestamp
      switch (flowStatus) {
        case 'checked-in':
          timestamps.checkedInAt = now;
          break;
        case 'waiting-room':
          timestamps.roomedAt = now;
          break;
        case 'with-provider':
          timestamps.withProviderAt = now;
          break;
        case 'ready-checkout':
          timestamps.readyCheckoutAt = now;
          break;
        case 'checked-out':
          timestamps.checkedOutAt = now;
          break;
      }

      filteredExtensions.push({
        url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-timestamps',
        valueString: JSON.stringify(timestamps)
      });

      // Add room if provided
      if (room) {
        filteredExtensions.push({
          url: 'http://ehrconnect.io/fhir/StructureDefinition/patient-room',
          valueString: room
        });
      }

      // Update FHIR status based on flow status
      let fhirStatus = appointment.status;
      if (flowStatus === 'checked-in') {
        fhirStatus = 'arrived';
      } else if (flowStatus === 'with-provider') {
        fhirStatus = 'arrived';
      } else if (flowStatus === 'checked-out') {
        fhirStatus = 'fulfilled';
      }

      const updated = await medplum.updateResource({
        ...appointment,
        status: fhirStatus,
        extension: filteredExtensions
      });

      return PatientFlowService.transformToFlowData(updated);
    } catch (error) {
      console.error('Error updating flow status:', error);
      throw error;
    }
  }

  /**
   * Transform FHIR Appointment to PatientFlowData
   */
  private static transformToFlowData(fhir: any): PatientFlowData {
    const patient = fhir.participant?.find((p: any) => p.actor?.reference?.startsWith('Patient/'));
    const practitioner = fhir.participant?.find((p: any) => p.actor?.reference?.startsWith('Practitioner/'));

    // Extract flow status from extension
    const flowStatusExt = fhir.extension?.find((ext: any) =>
      ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-status'
    );

    const timestampsExt = fhir.extension?.find((ext: any) =>
      ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/patient-flow-timestamps'
    );

    const roomExt = fhir.extension?.find((ext: any) =>
      ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/patient-room'
    );

    const modeExt = fhir.extension?.find((ext: any) =>
      ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/appointment-mode'
    );

    let timestamps: any = {};
    if (timestampsExt?.valueString) {
      try {
        timestamps = JSON.parse(timestampsExt.valueString);
      } catch (e) {
        // ignore
      }
    }

    // Calculate wait time if checked in
    let waitTime: number | undefined;
    if (timestamps.checkedInAt) {
      const checkedIn = new Date(timestamps.checkedInAt);
      const now = new Date();
      waitTime = Math.floor((now.getTime() - checkedIn.getTime()) / 60000);
    }

    // Map FHIR status to our AppointmentStatus
    const statusMap: Record<string, any> = {
      'booked': 'scheduled',
      'arrived': 'in-progress',
      'checked-in': 'in-progress',
      'fulfilled': 'completed',
      'cancelled': 'cancelled',
      'noshow': 'no-show'
    };

    return {
      id: fhir.id!,
      patientId: patient?.actor?.reference?.split('/')[1] || '',
      patientName: patient?.actor?.display || 'Unknown Patient',
      practitionerId: practitioner?.actor?.reference?.split('/')[1] || '',
      practitionerName: practitioner?.actor?.display || 'Unknown Practitioner',
      appointmentType: fhir.appointmentType?.coding?.[0]?.display || 'General',
      status: statusMap[fhir.status] || 'scheduled',
      startTime: new Date(fhir.start || ''),
      endTime: new Date(fhir.end || ''),
      duration: fhir.minutesDuration || 30,
      reason: fhir.comment,
      notes: fhir.description,
      mode: modeExt?.valueString,
      flowStatus: flowStatusExt?.valueString || 'checked-in',
      checkedInAt: timestamps.checkedInAt ? new Date(timestamps.checkedInAt) : undefined,
      roomedAt: timestamps.roomedAt ? new Date(timestamps.roomedAt) : undefined,
      withProviderAt: timestamps.withProviderAt ? new Date(timestamps.withProviderAt) : undefined,
      readyCheckoutAt: timestamps.readyCheckoutAt ? new Date(timestamps.readyCheckoutAt) : undefined,
      checkedOutAt: timestamps.checkedOutAt ? new Date(timestamps.checkedOutAt) : undefined,
      room: roomExt?.valueString,
      waitTime,
      createdAt: new Date(fhir.meta?.lastUpdated || ''),
      updatedAt: new Date(fhir.meta?.lastUpdated || '')
    };
  }

  /**
   * Get flow statistics for today
   */
  static async getFlowStats(): Promise<Record<PatientFlowStatus, number>> {
    const flowData = await PatientFlowService.getTodayFlow();

    const stats: Record<PatientFlowStatus, number> = {
      'checked-in': 0,
      'waiting-room': 0,
      'with-provider': 0,
      'ready-checkout': 0,
      'checked-out': 0
    };

    flowData.forEach(item => {
      if (item.flowStatus) {
        stats[item.flowStatus]++;
      }
    });

    return stats;
  }
}
