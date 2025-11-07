import { medplum } from '@/lib/medplum';
import { Appointment, AppointmentStats, AppointmentStatus } from '@/types/appointment';

export type AppointmentPrefillAdvisorySeverity = 'info' | 'warning';

export interface AppointmentPrefillAdvisory {
  code:
    | 'missing-provider-npi'
    | 'no-active-coverage'
    | 'multiple-coverages'
    | 'missing-subscriber-id'
    | 'missing-patient-account'
    | 'encounter-not-started';
  severity: AppointmentPrefillAdvisorySeverity;
  message: string;
  detail?: string;
}

export interface AppointmentBillingCoverageSummary {
  id: string;
  subscriberId?: string;
  policyNumber?: string;
  payerName?: string;
  payerReference?: string;
  planName?: string;
  relationship?: string;
  order?: number;
}

export interface AppointmentBillingContext {
  appointment: Appointment;
  patient?: {
    id: string;
    name: string;
    dateOfBirth?: string;
    identifiers?: Array<{ system?: string; value?: string; type?: string }>;
    accountNumber?: string;
  };
  provider?: {
    id: string;
    name: string;
    npi?: string;
  };
  encounterId?: string;
  coverage?: AppointmentBillingCoverageSummary;
  coverageOptions?: AppointmentBillingCoverageSummary[];
  advisories?: AppointmentPrefillAdvisory[];
}

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
      const appointments = bundle.map((fhir) => AppointmentService.transformFHIRAppointment(fhir));

      // Fetch ALL practitioners (not just those with appointments) to get vacations/leaves
      const allPractitioners = await medplum.searchResources('Practitioner', { active: 'true' });
      const allPractitionerIds = allPractitioners.map((p: any) => p.id).filter(Boolean);

      // Fetch all unique practitioners to get their colors
      const practitionerIds = [...new Set(appointments.map(apt => apt.practitionerId).filter((id): id is string => Boolean(id)))];

      let allAppointments = [...appointments];

      if (practitionerIds.length > 0) {
        const practitionersMap = await AppointmentService.fetchPractitionerColors(practitionerIds);

        // Add practitioner colors to appointments
        allAppointments = appointments.map(apt => ({
          ...apt,
          practitionerColor: apt.practitionerId ? practitionersMap[apt.practitionerId] : undefined
        }));
      }

      // Fetch practitioner vacations and leaves for ALL practitioners
      if (allPractitionerIds.length > 0) {
        const vacationEvents = await AppointmentService.fetchPractitionerVacations(startDate, endDate, allPractitionerIds);
        allAppointments = [...allAppointments, ...vacationEvents];
      }

      return allAppointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  /**
   * Build a billing context payload for superbill/claim creation
   */
  static async getBillingContext(appointmentId: string): Promise<AppointmentBillingContext> {
    try {
      const fhirAppointment: any = await medplum.readResource('Appointment', appointmentId);
      const appointment = AppointmentService.transformFHIRAppointment(fhirAppointment);

      const patientParticipant = fhirAppointment.participant?.find((p: any) =>
        p.actor?.reference?.startsWith('Patient/')
      );
      const practitionerParticipant = fhirAppointment.participant?.find((p: any) =>
        p.actor?.reference?.startsWith('Practitioner/')
      );

      const patientId: string | undefined = patientParticipant?.actor?.reference?.split('/')[1];
      const practitionerId: string | undefined = practitionerParticipant?.actor?.reference?.split('/')[1];

      let patientInfo: AppointmentBillingContext['patient'];
      if (patientId) {
        try {
          const patientResource: any = await medplum.readResource('Patient', patientId);
          const primaryName = patientResource.name?.[0];
          const identifierList: any[] = Array.isArray(patientResource.identifier)
            ? patientResource.identifier
            : [];
          const simplifiedIdentifiers = identifierList.length > 0
            ? identifierList.map((identifier: any) => ({
                system: identifier.system,
                value: identifier.value,
                type:
                  identifier.type?.text ||
                  identifier.type?.coding?.[0]?.display ||
                  identifier.type?.coding?.[0]?.code,
              }))
            : undefined;
          const accountIdentifier = identifierList.find((identifier: any) => {
            const typeCoding = identifier.type?.coding?.[0];
            const typeCode = typeCoding?.code?.toLowerCase();
            const typeDisplay = typeCoding?.display?.toLowerCase();
            const typeText = identifier.type?.text?.toLowerCase();

            return (
              typeCode === 'mr' ||
              typeCode === 'mrn' ||
              typeDisplay === 'mrn' ||
              typeDisplay === 'medical record' ||
              typeText?.includes('medical record') ||
              typeText?.includes('account')
            );
          });
          const fallbackIdentifier = identifierList[0];

          patientInfo = {
            id: patientId,
            name: primaryName
              ? `${primaryName.given?.join(' ') || ''} ${primaryName.family || ''}`.trim() || patientParticipant?.actor?.display ||
                'Unknown Patient'
              : patientParticipant?.actor?.display || 'Unknown Patient',
            dateOfBirth: patientResource.birthDate,
            identifiers: simplifiedIdentifiers,
            accountNumber: accountIdentifier?.value || fallbackIdentifier?.value,
          };
        } catch (error) {
          console.error('Failed to load patient for billing context', error);
        }
      }

      let providerInfo: AppointmentBillingContext['provider'];
      if (practitionerId) {
        try {
          const practitionerResource: any = await medplum.readResource('Practitioner', practitionerId);
          const practitionerName = practitionerResource.name?.[0]
            ? `${practitionerResource.name[0].given?.join(' ') || ''} ${practitionerResource.name[0].family || ''}`.trim()
            : practitionerParticipant?.actor?.display || 'Unknown Practitioner';

          const npiIdentifier = Array.isArray(practitionerResource.identifier)
            ? practitionerResource.identifier.find((identifier: any) => {
                const system = identifier.system?.toLowerCase() || '';
                const typeCode = identifier.type?.coding?.[0]?.code?.toLowerCase();
                const typeText = identifier.type?.text?.toLowerCase();
                return system.includes('npi') || typeCode === 'npi' || typeText === 'npi';
              })
            : undefined;

          providerInfo = {
            id: practitionerId,
            name: practitionerName,
            npi: npiIdentifier?.value,
          };
        } catch (error) {
          console.error('Failed to load practitioner for billing context', error);
        }
      }

      const advisories: AppointmentPrefillAdvisory[] = [];

      let encounterId: string | undefined;
      try {
        const encounters: any[] = await medplum.searchResources('Encounter', {
          appointment: `Appointment/${appointmentId}`,
          _sort: '-_lastUpdated',
          _count: 1,
        });

        if (encounters?.length > 0) {
          encounterId = encounters[0].id;
        }
      } catch (error) {
        console.error('Failed to load encounter for billing context', error);
      }

      let coverageInfo: AppointmentBillingCoverageSummary | undefined;
      let coverageOptions: AppointmentBillingCoverageSummary[] | undefined;
      if (patientId) {
        try {
          const coverages: any[] = await medplum.searchResources('Coverage', {
            patient: `Patient/${patientId}`,
            status: 'active',
            _sort: '-period-start',
            _count: 5,
          });

          if (coverages?.length > 0) {
            const payerNameCache = new Map<string, string>();

            const resolvePayerName = async (reference?: string, fallback?: string) => {
              if (!reference) {
                return fallback;
              }

              if (payerNameCache.has(reference)) {
                return payerNameCache.get(reference) || fallback;
              }

              try {
                const payerId = reference.split('/')[1];
                if (payerId) {
                  const organization: any = await medplum.readResource('Organization', payerId);
                  if (organization?.name) {
                    payerNameCache.set(reference, organization.name);
                    return organization.name;
                  }
                }
              } catch (error) {
                console.error('Failed to load coverage payer organization', error);
              }

              payerNameCache.set(reference, fallback || '');
              return fallback;
            };

            const mappedCoverages = await Promise.all(
              coverages.map(async (coverage: any) => {
                if (!coverage?.id) {
                  return undefined;
                }

                const payerReference = coverage.payor?.[0]?.reference;
                const payerName = await resolvePayerName(payerReference, coverage.payor?.[0]?.display);

                const planClass = Array.isArray(coverage.class)
                  ? coverage.class.find((cls: any) =>
                      cls.type?.coding?.some((coding: any) => (coding.code || '').toLowerCase() === 'plan')
                    )
                  : undefined;

                const rawOrder = (coverage as any).order ?? (coverage as any).priority;
                const orderValue = typeof rawOrder === 'number'
                  ? rawOrder
                  : typeof rawOrder?.valuePositiveInt === 'number'
                  ? rawOrder.valuePositiveInt
                  : undefined;

                return {
                  id: coverage.id,
                  subscriberId: coverage.subscriberId || coverage.identifier?.[0]?.value,
                  policyNumber: coverage.identifier?.[0]?.value,
                  payerName: payerName || coverage.payor?.[0]?.display,
                  payerReference,
                  planName: planClass?.name || planClass?.value,
                  relationship:
                    coverage.relationship?.text ||
                    coverage.relationship?.coding?.[0]?.display ||
                    coverage.relationship?.coding?.[0]?.code,
                  order: orderValue,
                } as AppointmentBillingCoverageSummary;
              })
            );

            coverageOptions = mappedCoverages.filter(
              (coverage): coverage is AppointmentBillingCoverageSummary => Boolean(coverage?.id)
            );

            if (coverageOptions.length > 0) {
              coverageOptions.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
              coverageInfo = coverageOptions[0];
            }
          }
        } catch (error) {
          console.error('Failed to load coverage for billing context', error);
        }
      }

      if (providerInfo && !providerInfo.npi) {
        advisories.push({
          code: 'missing-provider-npi',
          severity: 'warning',
          message: 'Rendering provider is missing an NPI.',
          detail: 'Add the practitioner NPI in the provider profile so claims can be validated.',
        });
      }

      if (!coverageOptions || coverageOptions.length === 0) {
        advisories.push({
          code: 'no-active-coverage',
          severity: 'warning',
          message: 'No active coverage was found for this patient.',
          detail: 'Choose a payer manually or add coverage before validating the superbill.',
        });
      } else {
        if (coverageOptions.length > 1) {
          advisories.push({
            code: 'multiple-coverages',
            severity: 'info',
            message: 'Patient has multiple active coverages.',
            detail: 'Confirm the correct payer order before submitting the claim to avoid denials.',
          });
        }

        if (coverageInfo && !coverageInfo.subscriberId) {
          advisories.push({
            code: 'missing-subscriber-id',
            severity: 'warning',
            message: 'Selected coverage is missing a subscriber/member ID.',
            detail: 'Update the coverage or enter a subscriber number before submission.',
          });
        }
      }

      if (patientInfo && !patientInfo.accountNumber) {
        advisories.push({
          code: 'missing-patient-account',
          severity: 'info',
          message: 'Patient record does not include an account or MRN identifier.',
          detail: 'Billing can proceed but consider assigning an account number for auditing.',
        });
      }

      if (!encounterId) {
        advisories.push({
          code: 'encounter-not-started',
          severity: 'info',
          message: 'No encounter was started from this appointment.',
          detail: 'Start an encounter to capture documentation that supports the superbill.',
        });
      }

      return {
        appointment,
        patient: patientInfo,
        provider: providerInfo,
        encounterId,
        coverage: coverageInfo,
        coverageOptions,
        advisories,
      };
    } catch (error) {
      console.error('Error building appointment billing context:', error);
      throw error;
    }
  }

  /**
   * Fetch practitioner colors from FHIR
   */
  private static async fetchPractitionerColors(practitionerIds: string[]): Promise<Record<string, string>> {
    const colorsMap: Record<string, string> = {};

    try {
      // Fetch practitioners in parallel
      const practitioners = await Promise.all(
        practitionerIds.map(id =>
          medplum.readResource('Practitioner', id).catch(() => null)
        )
      );

      practitioners.forEach((practitioner: any) => {
        if (practitioner) {
          // Extract color from extension
          const colorExtension = practitioner.extension?.find(
            (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-color'
          );

          if (colorExtension?.valueString) {
            colorsMap[practitioner.id] = colorExtension.valueString;
          }
        }
      });
    } catch (error) {
      console.error('Error fetching practitioner colors:', error);
    }

    return colorsMap;
  }

  /**
   * Fetch practitioner vacations and leaves as all-day events
   */
  private static async fetchPractitionerVacations(
    startDate: Date,
    endDate: Date,
    practitionerIds: string[]
  ): Promise<Appointment[]> {
    const vacationEvents: Appointment[] = [];

    try {
      // Fetch all practitioners
      const practitioners = await Promise.all(
        practitionerIds.map(id =>
          medplum.readResource('Practitioner', id).catch(() => null)
        )
      );

      practitioners.forEach((practitioner: any) => {
        if (!practitioner) return;

        // Extract vacation/leave data from extension
        const vacationExtension = practitioner.extension?.find(
          (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-vacation'
        );

        if (vacationExtension?.valueString) {
          try {
            const vacations = JSON.parse(vacationExtension.valueString);

            vacations.forEach((vacation: any) => {
              const vacationStart = new Date(vacation.startDate);
              const vacationEnd = new Date(vacation.endDate);

              // Check if vacation overlaps with the requested date range
              if (vacationStart <= endDate && vacationEnd >= startDate) {
                // Get practitioner name
                const practitionerName = practitioner.name?.[0]
                  ? `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim()
                  : 'Unknown Practitioner';

                // Get practitioner color
                const colorExtension = practitioner.extension?.find(
                  (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/practitioner-color'
                );

                // Create an all-day event for each day in the vacation range
                let currentDate = new Date(vacationStart);
                currentDate.setHours(0, 0, 0, 0);

                const rangeEnd = new Date(vacationEnd);
                rangeEnd.setHours(0, 0, 0, 0);

                while (currentDate <= rangeEnd) {
                  // Only include dates within the requested range
                  if (currentDate >= startDate && currentDate <= endDate) {
                    vacationEvents.push({
                      id: `vacation-${practitioner.id}-${vacation.id}-${currentDate.toISOString()}`,
                      patientId: practitioner.id,
                      patientName: practitionerName,
                      practitionerId: practitioner.id,
                      practitionerName: practitionerName,
                      practitionerColor: colorExtension?.valueString,
                      appointmentType: vacation.type || 'vacation',
                      status: 'scheduled',
                      startTime: new Date(currentDate),
                      endTime: new Date(currentDate),
                      duration: 0,
                      isAllDay: true,
                      allDayEventType: vacation.type || 'vacation',
                      reason: `${practitionerName} - ${vacation.type || 'Vacation'}`,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    });
                  }

                  // Move to next day
                  currentDate.setDate(currentDate.getDate() + 1);
                }
              }
            });
          } catch (parseError) {
            console.error('Error parsing vacation data:', parseError);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching practitioner vacations:', error);
    }

    return vacationEvents;
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
  static async createAppointment(appointmentData: Partial<Appointment>, orgId?: string): Promise<Appointment> {
    try {
      // Use provided org_id or try to get from localStorage as fallback
      const finalOrgId = orgId || (typeof window !== 'undefined' ? localStorage.getItem('currentFacilityId') : null);

      if (!finalOrgId) {
        throw new Error('No facility selected. Please select a facility from settings.');
      }

      const extensions: any[] = [
        {
          url: 'http://ehrconnect.io/fhir/StructureDefinition/appointment-organization',
          valueReference: {
            reference: `Organization/${finalOrgId}`
          }
        }
      ];

      // Add appointment mode extension if provided
      if (appointmentData.mode) {
        extensions.push({
          url: 'http://ehrconnect.io/fhir/StructureDefinition/appointment-mode',
          valueString: appointmentData.mode
        });
      }

      const fhirAppointment: any = {
        resourceType: 'Appointment',
        status: AppointmentService.mapStatusToFHIR(appointmentData.status || 'scheduled'),
        start: appointmentData.startTime ? new Date(appointmentData.startTime).toISOString() : undefined,
        end: appointmentData.endTime ? new Date(appointmentData.endTime).toISOString() : undefined,
        minutesDuration: appointmentData.duration,
        comment: appointmentData.reason,
        appointmentType: appointmentData.appointmentType ? {
          coding: [{
            display: appointmentData.appointmentType
          }]
        } : undefined,
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
        ],
        extension: extensions
      };

      console.log('[Appointment Service] Creating appointment with org_id:', finalOrgId);

      // Use direct fetch with org_id header (matching user's pattern)
      const response = await fetch('/api/fhir/Appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'x-org-id': finalOrgId,
        },
        body: JSON.stringify(fhirAppointment),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to create appointment: ${response.status} ${response.statusText}`);
      }

      const created = await response.json();
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
      // If practitioner is being changed, we need to use PUT with full resource
      // because PATCH on nested participant arrays is unreliable
      if (updates.practitionerId || updates.practitionerName) {
        console.log('🔄 Updating appointment with practitioner change:', {
          id,
          newPractitionerId: updates.practitionerId,
          newPractitionerName: updates.practitionerName
        });

        // Get the current appointment
        const current: any = await medplum.readResource('Appointment', id);

        // Update the practitioner participant
        const updatedParticipants = current.participant?.map((p: any) => {
          if (p.actor?.reference?.startsWith('Practitioner/')) {
            return {
              ...p,
              actor: {
                reference: updates.practitionerId ? `Practitioner/${updates.practitionerId}` : p.actor.reference,
                display: updates.practitionerName || p.actor.display
              }
            };
          }
          return p;
        }) || [];

        // Build updated resource
        const updatedResource = {
          ...current,
          participant: updatedParticipants
        };

        // Apply other updates
        if (updates.status) {
          updatedResource.status = AppointmentService.mapStatusToFHIR(updates.status);
        }
        if (updates.startTime) {
          updatedResource.start = updates.startTime instanceof Date
            ? updates.startTime.toISOString()
            : new Date(updates.startTime).toISOString();
        }
        if (updates.endTime) {
          updatedResource.end = updates.endTime instanceof Date
            ? updates.endTime.toISOString()
            : new Date(updates.endTime).toISOString();
        }
        if (updates.duration !== undefined) {
          updatedResource.minutesDuration = updates.duration;
        }
        if (updates.reason) {
          updatedResource.comment = updates.reason;
        }
        if (updates.appointmentType) {
          updatedResource.appointmentType = {
            coding: [{
              display: updates.appointmentType
            }]
          };
        }

        console.log('📤 Sending PUT request with updated resource');
        console.log('Updated FHIR resource:', JSON.stringify(updatedResource, null, 2));

        // Use PUT to update the entire resource
        const result = await medplum.updateResource(updatedResource);

        console.log('✅ Backend returned updated resource:', JSON.stringify(result, null, 2));

        const transformed = AppointmentService.transformFHIRAppointment(result);

        console.log('🔄 Transformed appointment:', {
          id: transformed.id,
          practitionerId: transformed.practitionerId,
          practitionerName: transformed.practitionerName,
          patientName: transformed.patientName,
          startTime: transformed.startTime,
          endTime: transformed.endTime
        });

        return transformed;
      }

      // For non-practitioner updates, use PATCH for efficiency
      const patchOps: any[] = [];

      if (updates.status) {
        patchOps.push({
          op: 'replace',
          path: '/status',
          value: AppointmentService.mapStatusToFHIR(updates.status)
        });
      }

      if (updates.startTime) {
        patchOps.push({
          op: 'replace',
          path: '/start',
          value: updates.startTime instanceof Date
            ? updates.startTime.toISOString()
            : new Date(updates.startTime).toISOString()
        });
      }

      if (updates.endTime) {
        patchOps.push({
          op: 'replace',
          path: '/end',
          value: updates.endTime instanceof Date
            ? updates.endTime.toISOString()
            : new Date(updates.endTime).toISOString()
        });
      }

      if (updates.duration !== undefined) {
        patchOps.push({
          op: 'replace',
          path: '/minutesDuration',
          value: updates.duration
        });
      }

      if (updates.reason) {
        patchOps.push({
          op: 'replace',
          path: '/comment',
          value: updates.reason
        });
      }

      if (updates.appointmentType) {
        patchOps.push({
          op: 'replace',
          path: '/appointmentType',
          value: {
            coding: [{
              display: updates.appointmentType
            }]
          }
        });
      }

      console.log('📤 Sending PATCH operations:', patchOps);

      // Use PATCH with only the fields being updated
      const result = await medplum.patchResource('Appointment', id, patchOps);

      return AppointmentService.transformFHIRAppointment(result);
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
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

    // Extract appointment mode from extension
    const modeExtension = (fhir as any).extension?.find(
      (ext: any) => ext.url === 'http://ehrconnect.io/fhir/StructureDefinition/appointment-mode'
    );

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
      mode: modeExtension?.valueString as any,
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
      'rescheduled': 'booked',
      'waitlist': 'waitlist'
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
