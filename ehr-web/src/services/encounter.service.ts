import { medplum } from '@/lib/medplum';
import { Encounter, EncounterStatus, Instruction, InstructionType } from '@/types/encounter';
import { Appointment } from '@/types/appointment';
import { FHIRCommunication } from '@/types/fhir';

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

      // Load vitals from FHIR Observations
      let vitalsFromObservations: any = {};
      try {
        const observations = await medplum.searchResources('Observation', {
          encounter: `Encounter/${id}`,
          category: 'vital-signs'
        });

        console.log(`📊 Loaded ${observations.length} vital observations for encounter ${id}`);

        // Map observations back to vitals object
        const loincToVitalKey: Record<string, string> = {
          '9279-1': 'respiratoryRate',
          '8867-4': 'heartRate',
          '8310-5': 'temperature',
          '2708-6': 'oxygenSaturation',
          '8480-6': 'bloodPressureSystolic',
          '8462-4': 'bloodPressureDiastolic',
          '8302-2': 'height',
          '29463-7': 'weight',
          '39156-5': 'bmi',
          '1558-6': 'bloodGlucoseFasting',
          '87422-2': 'bloodGlucosePostprandial',
          '2339-0': 'bloodGlucoseRandom',
          '4548-4': 'hba1c',
          '72514-3': 'painScore',
          '9269-2': 'glasgowComaScale',
        };

        for (const obs of observations) {
          const loincCode = (obs as any).code?.coding?.find((c: any) => c.system === 'http://loinc.org')?.code;
          if (loincCode && loincToVitalKey[loincCode]) {
            const vitalKey = loincToVitalKey[loincCode];
            const value = (obs as any).valueQuantity?.value || (obs as any).valueString;
            if (value !== undefined) {
              vitalsFromObservations[vitalKey] = value;
            }
          }
        }
      } catch (error) {
        console.error('Error loading vital observations:', error);
      }

      const encounter = EncounterService.transformFHIREncounter(fhirEncounter, appointment);

      // Merge vitals from Observations with vitals from extensions (extensions take precedence)
      if (Object.keys(vitalsFromObservations).length > 0) {
        encounter.vitals = {
          ...vitalsFromObservations,
          ...encounter.vitals
        };
      }

      return encounter;
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
      console.log('🔄 EncounterService.update - Starting update for encounter:', id);
      console.log('🔄 EncounterService.update - Data to update:', data);

      const patchOps: any[] = [];

      // Read encounter once for extensions and period
      const encounter = await medplum.readResource('Encounter', id);
      console.log('🔄 EncounterService.update - Current encounter:', encounter);

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
        patchOps.push({
          op: 'replace',
          path: '/period',
          value: {
            start: encounter.period?.start,
            end: data.endTime instanceof Date ? data.endTime.toISOString() : new Date(data.endTime).toISOString()
          }
        });
      }

      // Handle vitals, clinical notes, findings, investigation, diagnosis, clinical notes list in extensions
      if (data.vitals || data.clinicalNotes !== undefined || data.clinicalNotesList !== undefined || data.findingsText !== undefined || data.investigationsText !== undefined || data.diagnosesText !== undefined) {
        const extensions = (encounter as any).extension || [];

        // Update or add vitals extension
        if (data.vitals) {
          console.log('💉 EncounterService.update - Saving vitals to extension:', data.vitals);
          const vitalsExtIndex = extensions.findIndex((ext: any) => ext.url === 'vitals');
          const vitalsExt = {
            url: 'vitals',
            valueString: JSON.stringify(data.vitals)
          };

          if (vitalsExtIndex >= 0) {
            extensions[vitalsExtIndex] = vitalsExt;
          } else {
            extensions.push(vitalsExt);
          }

          // Also create FHIR Observation resources for vitals
          await this.createVitalObservations(id, encounter.subject?.reference || '', data.vitals);
        }

        // Update or add clinical notes extension
        if (data.clinicalNotes !== undefined) {
          console.log('📝 EncounterService.update - Saving clinical notes:', data.clinicalNotes);
          const notesExtIndex = extensions.findIndex((ext: any) => ext.url === 'clinicalNotes');
          const notesExt = {
            url: 'clinicalNotes',
            valueString: data.clinicalNotes
          };

          if (notesExtIndex >= 0) {
            extensions[notesExtIndex] = notesExt;
          } else {
            extensions.push(notesExt);
          }
        }

        // Update or add findings extension
        if (data.findingsText !== undefined) {
          console.log('🔍 EncounterService.update - Saving findings:', data.findingsText);
          const findingsExtIndex = extensions.findIndex((ext: any) => ext.url === 'findings');
          const findingsExt = {
            url: 'findings',
            valueString: data.findingsText
          };

          if (findingsExtIndex >= 0) {
            extensions[findingsExtIndex] = findingsExt;
          } else {
            extensions.push(findingsExt);
          }
        }

        // Update or add investigation extension
        if (data.investigationsText !== undefined) {
          console.log('🔬 EncounterService.update - Saving investigations:', data.investigationsText);
          const investigationExtIndex = extensions.findIndex((ext: any) => ext.url === 'investigations');
          const investigationExt = {
            url: 'investigations',
            valueString: data.investigationsText
          };

          if (investigationExtIndex >= 0) {
            extensions[investigationExtIndex] = investigationExt;
          } else {
            extensions.push(investigationExt);
          }
        }

        // Update or add diagnosis extension
        if (data.diagnosesText !== undefined) {
          console.log('🩺 EncounterService.update - Saving diagnoses:', data.diagnosesText);
          const diagnosisExtIndex = extensions.findIndex((ext: any) => ext.url === 'diagnoses');
          const diagnosisExt = {
            url: 'diagnoses',
            valueString: data.diagnosesText
          };

          if (diagnosisExtIndex >= 0) {
            extensions[diagnosisExtIndex] = diagnosisExt;
          } else {
            extensions.push(diagnosisExt);
          }
        }

        // Update or add clinical notes list extension
        if (data.clinicalNotesList !== undefined) {
          console.log('📋 EncounterService.update - Saving clinical notes list:', data.clinicalNotesList);
          const notesListExtIndex = extensions.findIndex((ext: any) => ext.url === 'clinicalNotesList');
          const notesListExt = {
            url: 'clinicalNotesList',
            valueString: JSON.stringify(data.clinicalNotesList)
          };

          if (notesListExtIndex >= 0) {
            extensions[notesListExtIndex] = notesListExt;
          } else {
            extensions.push(notesListExt);
          }
        }

        patchOps.push({
          op: 'replace',
          path: '/extension',
          value: extensions
        });
      }

      if (patchOps.length > 0) {
        console.log('🔄 EncounterService.update - Applying patch operations:', patchOps);
        const result = await medplum.patchResource('Encounter', id, patchOps);
        console.log('✅ EncounterService.update - Successfully updated encounter');
        return EncounterService.transformFHIREncounter(result);
      }

      console.log('⚠️ EncounterService.update - No patch operations to apply');
      return this.getById(id);
    } catch (error) {
      console.error('❌ EncounterService.update - Error updating encounter:', error);
      throw error;
    }
  }

  /**
   * Create FHIR Observation resources for vitals
   */
  private static async createVitalObservations(encounterId: string, patientReference: string, vitals: any): Promise<void> {
    try {
      console.log('💉 Creating FHIR Observations for vitals:', vitals);

      // Mapping of vital signs to LOINC codes
      const vitalMappings: Record<string, { code: string; display: string; unit: string }> = {
        respiratoryRate: { code: '9279-1', display: 'Respiratory rate', unit: '/min' },
        heartRate: { code: '8867-4', display: 'Heart rate', unit: '/min' },
        temperature: { code: '8310-5', display: 'Body temperature', unit: 'degF' },
        oxygenSaturation: { code: '2708-6', display: 'Oxygen saturation', unit: '%' },
        bloodPressureSystolic: { code: '8480-6', display: 'Systolic blood pressure', unit: 'mmHg' },
        bloodPressureDiastolic: { code: '8462-4', display: 'Diastolic blood pressure', unit: 'mmHg' },
        height: { code: '8302-2', display: 'Body height', unit: 'cm' },
        weight: { code: '29463-7', display: 'Body weight', unit: 'kg' },
        bmi: { code: '39156-5', display: 'Body mass index', unit: 'kg/m2' },
        bloodGlucoseFasting: { code: '1558-6', display: 'Fasting glucose', unit: 'mg/dL' },
        bloodGlucosePostprandial: { code: '87422-2', display: 'Postprandial glucose', unit: 'mg/dL' },
        bloodGlucoseRandom: { code: '2339-0', display: 'Glucose', unit: 'mg/dL' },
        hba1c: { code: '4548-4', display: 'Hemoglobin A1c', unit: '%' },
        pulseRate: { code: '8867-4', display: 'Pulse rate', unit: '/min' },
        painScore: { code: '72514-3', display: 'Pain severity', unit: '{score}' },
        glasgowComaScale: { code: '9269-2', display: 'Glasgow coma score', unit: '{score}' },
      };

      // Create observations for each vital sign
      const observations = [];
      for (const [vitalKey, value] of Object.entries(vitals)) {
        if (value && vitalMappings[vitalKey]) {
          const mapping = vitalMappings[vitalKey];

          const observation = {
            resourceType: 'Observation',
            status: 'final',
            category: [{
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }]
            }],
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: mapping.code,
                display: mapping.display
              }],
              text: mapping.display
            },
            subject: {
              reference: patientReference
            },
            encounter: {
              reference: `Encounter/${encounterId}`
            },
            effectiveDateTime: new Date().toISOString(),
            valueQuantity: typeof value === 'number' ? {
              value: value,
              unit: mapping.unit,
              system: 'http://unitsofmeasure.org',
              code: mapping.unit
            } : undefined,
            valueString: typeof value === 'string' ? value : undefined
          };

          observations.push(observation);
        }
      }

      // Create all observations
      for (const obs of observations) {
        try {
          await medplum.createResource(obs as any);
          console.log(`✅ Created Observation for ${obs.code.text}`);
        } catch (error) {
          console.error(`❌ Failed to create Observation for ${obs.code.text}:`, error);
        }
      }

      console.log(`✅ Created ${observations.length} FHIR Observations`);
    } catch (error) {
      console.error('❌ Error creating vital observations:', error);
      // Don't throw - we still have vitals in extensions
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
   * Get all encounters with optional filters
   */
  static async getAll(filters?: {
    status?: EncounterStatus;
    class?: string;
    practitionerId?: string;
    patientId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Encounter[]> {
    try {
      const params: any = {
        _sort: '-date',
        _count: 100
      };

      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.class) {
        // Map our class names to FHIR codes
        const classCodeMap: Record<string, string> = {
          'ambulatory': 'AMB',
          'emergency': 'EMER',
          'inpatient': 'IMP',
          'outpatient': 'OUTPATIENT',
          'virtual': 'VR'
        };
        const fhirCode = classCodeMap[filters.class] || filters.class;
        params.class = fhirCode;
      }
      if (filters?.practitionerId) {
        params.participant = `Practitioner/${filters.practitionerId}`;
      }
      if (filters?.patientId) {
        params.subject = `Patient/${filters.patientId}`;
      }
      if (filters?.startDate) {
        params.date = `ge${filters.startDate.toISOString()}`;
      }
      if (filters?.endDate) {
        const endParam = `le${filters.endDate.toISOString()}`;
        params.date = params.date ? `${params.date}&date=${endParam}` : endParam;
      }

      const bundle = await medplum.searchResources('Encounter', params);
      return bundle.map((fhir: FHIREncounter) => EncounterService.transformFHIREncounter(fhir));
    } catch (error) {
      console.error('Error fetching all encounters:', error);
      return [];
    }
  }

  /**
   * Create or Update Instruction as FHIR Communication
   */
  static async saveInstruction(
    encounterId: string,
    patientId: string,
    instruction: Instruction
  ): Promise<Instruction> {
    try {
      const category = instruction.type === 'clinical'
        ? 'clinical-instruction'
        : 'patient-instruction';

      const communication: Partial<FHIRCommunication> = {
        resourceType: 'Communication',
        status: instruction.isActive === false ? 'stopped' : 'completed',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/communication-category',
            code: category,
            display: instruction.type === 'clinical' ? 'Clinical Instruction' : 'Patient Instruction'
          }],
          text: instruction.category || 'general'
        }],
        priority: instruction.priority === 'high' ? 'stat' :
                 instruction.priority === 'medium' ? 'urgent' : 'routine',
        subject: {
          reference: `Patient/${patientId}`
        },
        encounter: {
          reference: `Encounter/${encounterId}`
        },
        sent: new Date().toISOString(),
        payload: [{
          contentString: instruction.text
        }],
        note: instruction.category ? [{
          text: `Category: ${instruction.category}`,
          time: new Date().toISOString()
        }] : undefined
      };

      let savedCommunication: FHIRCommunication;

      if (instruction.fhirId) {
        // Update existing
        savedCommunication = await medplum.updateResource({
          ...communication,
          id: instruction.fhirId
        } as FHIRCommunication);
      } else {
        // Create new
        savedCommunication = await medplum.createResource(communication as FHIRCommunication);
      }

      return this.transformFHIRCommunicationToInstruction(savedCommunication);
    } catch (error) {
      console.error('Error saving instruction:', error);
      throw error;
    }
  }

  /**
   * Get Instructions for an Encounter
   */
  static async getInstructions(encounterId: string, type?: InstructionType): Promise<Instruction[]> {
    try {
      const searchParams: any = {
        encounter: `Encounter/${encounterId}`,
        _sort: '-sent'
      };

      if (type) {
        const categoryCode = type === 'clinical' ? 'clinical-instruction' : 'patient-instruction';
        searchParams.category = categoryCode;
      }

      const communications = await medplum.searchResources('Communication', searchParams);

      return communications.map((comm: FHIRCommunication) =>
        this.transformFHIRCommunicationToInstruction(comm)
      );
    } catch (error) {
      console.error('Error fetching instructions:', error);
      return [];
    }
  }

  /**
   * Delete Instruction
   */
  static async deleteInstruction(fhirId: string): Promise<void> {
    try {
      await medplum.deleteResource('Communication', fhirId);
    } catch (error) {
      console.error('Error deleting instruction:', error);
      throw error;
    }
  }

  /**
   * Transform FHIR Communication to Instruction
   */
  private static transformFHIRCommunicationToInstruction(comm: FHIRCommunication): Instruction {
    const categoryCode = comm.category?.[0]?.coding?.[0]?.code;
    const type: InstructionType = categoryCode === 'clinical-instruction' ? 'clinical' : 'patient';
    const categoryText = comm.category?.[0]?.text;

    return {
      id: comm.id || `comm-${Date.now()}`,
      fhirId: comm.id,
      type,
      category: categoryText as any,
      text: comm.payload?.[0]?.contentString || '',
      priority: comm.priority === 'stat' ? 'high' :
               comm.priority === 'urgent' ? 'medium' : 'low',
      isActive: comm.status !== 'stopped',
      createdAt: comm.sent || comm.meta?.lastUpdated,
      updatedAt: comm.meta?.lastUpdated
    };
  }

  /**
   * Transform FHIR Encounter to our Encounter type
   */
  private static transformFHIREncounter(fhir: FHIREncounter, appointment?: Appointment): Encounter {
    const subject = fhir.subject;
    const practitioner = fhir.participant?.[0]?.individual;
    const appointmentRef = fhir.appointment?.[0]?.reference;

    // Extract vitals from extensions
    const vitalsExt = (fhir as any).extension?.find((ext: any) => ext.url === 'vitals');
    const vitals = vitalsExt?.valueString ? JSON.parse(vitalsExt.valueString) : undefined;

    // Extract clinical notes from extensions
    const notesExt = (fhir as any).extension?.find((ext: any) => ext.url === 'clinicalNotes');
    const clinicalNotes = notesExt?.valueString;

    // Extract findings from extensions
    const findingsExt = (fhir as any).extension?.find((ext: any) => ext.url === 'findings');
    const findingsText = findingsExt?.valueString;

    // Extract investigations from extensions
    const investigationsExt = (fhir as any).extension?.find((ext: any) => ext.url === 'investigations');
    const investigationsText = investigationsExt?.valueString;

    // Extract diagnoses from extensions
    const diagnosesExt = (fhir as any).extension?.find((ext: any) => ext.url === 'diagnoses');
    const diagnosesText = diagnosesExt?.valueString;

    // Extract clinical notes list from extensions
    const notesListExt = (fhir as any).extension?.find((ext: any) => ext.url === 'clinicalNotesList');
    const clinicalNotesList = notesListExt?.valueString ? JSON.parse(notesListExt.valueString) : undefined;

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
      chiefComplaint: fhir.reasonCode?.[0]?.text,
      location: fhir.location?.[0]?.location?.display,
      vitals,
      clinicalNotes,
      clinicalNotesList,
      findingsText,
      investigationsText,
      diagnosesText,
      createdAt: new Date(fhir.meta?.lastUpdated || new Date()),
      updatedAt: new Date(fhir.meta?.lastUpdated || new Date())
    };
  }
}
