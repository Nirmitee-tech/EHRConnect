import { fhirService } from '@/lib/medplum';

export interface CarePlanActivityReason {
  reasonCode: string;
  reasonStatus: string;
  reasonRecordingDate: string;
  reasonEndDate: string;
}

export interface CarePlanActivity {
  code: string;
  date: string;
  type: string;
  description: string;
  status: string;
  reason?: CarePlanActivityReason;
}

export interface CarePlanFormData {
  title?: string;
  description?: string;
  status: string;
  intent: string;
  activities: CarePlanActivity[];
  goals?: string;
  interventions?: string;
  outcomes?: string;
}

class CarePlanService {
  /**
   * Create a FHIR CarePlan resource
   */
  async createCarePlan(
    patientId: string,
    encounterId: string,
    formData: CarePlanFormData
  ) {
    const carePlan = {
      resourceType: 'CarePlan',
      status: formData.status,
      intent: formData.intent,
      title: formData.title || undefined,
      description: formData.description || undefined,
      subject: {
        reference: `Patient/${patientId}`
      },
      encounter: {
        reference: `Encounter/${encounterId}`
      },
      created: new Date().toISOString(),
      activity: formData.activities.map((activity) => {
        const activityDetail: any = {
          code: {
            text: activity.code
          },
          status: activity.status,
          scheduledString: activity.date,
          kind: activity.type,
          description: activity.description
        };

        // Add reason if present
        if (activity.reason && activity.reason.reasonCode) {
          activityDetail.reasonCode = [{
            text: activity.reason.reasonCode
          }];

          // Add reason period
          activityDetail.reasonReference = [{
            display: activity.reason.reasonCode,
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/careplan-activity-reason-status',
                valueCode: activity.reason.reasonStatus
              },
              {
                url: 'http://hl7.org/fhir/StructureDefinition/careplan-activity-reason-period',
                valuePeriod: {
                  start: activity.reason.reasonRecordingDate,
                  end: activity.reason.reasonEndDate || undefined
                }
              }
            ]
          }];
        }

        return {
          detail: activityDetail
        };
      })
    };

    return await fhirService.create(carePlan);
  }

  /**
   * Update an existing CarePlan
   */
  async updateCarePlan(
    carePlanId: string,
    patientId: string,
    encounterId: string,
    formData: CarePlanFormData
  ) {
    const carePlan = {
      resourceType: 'CarePlan',
      id: carePlanId,
      status: formData.status,
      intent: formData.intent,
      title: formData.title || undefined,
      description: formData.description || undefined,
      subject: {
        reference: `Patient/${patientId}`
      },
      encounter: {
        reference: `Encounter/${encounterId}`
      },
      created: new Date().toISOString(),
      activity: formData.activities.map((activity) => {
        const activityDetail: any = {
          code: {
            text: activity.code
          },
          status: activity.status,
          scheduledString: activity.date,
          kind: activity.type,
          description: activity.description
        };

        if (activity.reason && activity.reason.reasonCode) {
          activityDetail.reasonCode = [{
            text: activity.reason.reasonCode
          }];

          activityDetail.reasonReference = [{
            display: activity.reason.reasonCode,
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/careplan-activity-reason-status',
                valueCode: activity.reason.reasonStatus
              },
              {
                url: 'http://hl7.org/fhir/StructureDefinition/careplan-activity-reason-period',
                valuePeriod: {
                  start: activity.reason.reasonRecordingDate,
                  end: activity.reason.reasonEndDate || undefined
                }
              }
            ]
          }];
        }

        return {
          detail: activityDetail
        };
      })
    };

    return await fhirService.update(carePlan);
  }

  /**
   * Get CarePlans for a patient
   */
  async getCarePlans(patientId: string) {
    const bundle = await fhirService.search('CarePlan', {
      patient: patientId,
      _sort: '-date',
      _count: 100
    });

    return bundle.entry?.map((entry: any) => entry.resource) || [];
  }

  /**
   * Get CarePlans for a specific encounter
   */
  async getCarePlansByEncounter(encounterId: string) {
    const bundle = await fhirService.search('CarePlan', {
      encounter: encounterId,
      _sort: '-date'
    });

    return bundle.entry?.map((entry: any) => entry.resource) || [];
  }

  /**
   * Get a single CarePlan by ID
   */
  async getCarePlan(carePlanId: string) {
    return await fhirService.read('CarePlan', carePlanId);
  }

  /**
   * Delete a CarePlan
   */
  async deleteCarePlan(carePlanId: string) {
    return await fhirService.delete('CarePlan', carePlanId);
  }

  /**
   * Convert FHIR CarePlan to form data
   */
  convertToFormData(carePlan: any): CarePlanFormData {
    const activities = carePlan.activity?.map((activity: any) => {
      const detail = activity.detail || {};
      const activityData: CarePlanActivity = {
        code: detail.code?.text || '',
        date: detail.scheduledString || new Date().toISOString().split('T')[0],
        type: detail.kind || 'Task',
        description: detail.description || '',
        status: detail.status || 'not-started'
      };

      // Extract reason if present
      if (detail.reasonCode && detail.reasonCode.length > 0) {
        const reasonRef = detail.reasonReference?.[0];
        const extensions = reasonRef?.extension || [];

        const statusExt = extensions.find((ext: any) =>
          ext.url === 'http://hl7.org/fhir/StructureDefinition/careplan-activity-reason-status'
        );
        const periodExt = extensions.find((ext: any) =>
          ext.url === 'http://hl7.org/fhir/StructureDefinition/careplan-activity-reason-period'
        );

        activityData.reason = {
          reasonCode: detail.reasonCode[0].text || '',
          reasonStatus: statusExt?.valueCode || 'not-started',
          reasonRecordingDate: periodExt?.valuePeriod?.start || new Date().toISOString().split('T')[0],
          reasonEndDate: periodExt?.valuePeriod?.end || ''
        };
      }

      return activityData;
    }) || [];

    return {
      title: carePlan.title || '',
      description: carePlan.description || '',
      status: carePlan.status || 'active',
      intent: carePlan.intent || 'plan',
      activities: activities.length > 0 ? activities : [{
        code: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Task',
        description: '',
        status: 'not-started'
      }]
    };
  }
}

export const carePlanService = new CarePlanService();
