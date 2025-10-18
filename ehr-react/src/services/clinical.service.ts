import { fhirService } from '@/lib/medplum';

/**
 * Clinical Service
 * Handles all clinical data operations (vitals, problems, medications, etc.)
 */
export class ClinicalService {
  /**
   * Create vitals observation
   */
  static async createVitals(patientId: string, vitals: {
    bloodPressureSystolic?: string;
    bloodPressureDiastolic?: string;
    heartRate?: string;
    temperature?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
  }): Promise<void> {
    const observations = [];
    const timestamp = new Date().toISOString();

    if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
      observations.push({
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
            code: '85354-9',
            display: 'Blood pressure panel'
          }],
          text: 'Blood Pressure'
        },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: timestamp,
        component: [
          {
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8480-6',
                display: 'Systolic blood pressure'
              }]
            },
            valueQuantity: {
              value: parseFloat(vitals.bloodPressureSystolic),
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          },
          {
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8462-4',
                display: 'Diastolic blood pressure'
              }]
            },
            valueQuantity: {
              value: parseFloat(vitals.bloodPressureDiastolic),
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          }
        ]
      });
    }

    const vitalMappings = [
      { key: 'heartRate', loinc: '8867-4', display: 'Heart rate', unit: 'beats/minute', code: '/min' },
      { key: 'temperature', loinc: '8310-5', display: 'Body temperature', unit: 'Cel', code: 'Cel' },
      { key: 'respiratoryRate', loinc: '9279-1', display: 'Respiratory rate', unit: 'breaths/minute', code: '/min' },
      { key: 'oxygenSaturation', loinc: '59408-5', display: 'Oxygen saturation', unit: '%', code: '%' },
      { key: 'weight', loinc: '29463-7', display: 'Body weight', unit: 'kg', code: 'kg' },
      { key: 'height', loinc: '8302-2', display: 'Body height', unit: 'cm', code: 'cm' }
    ];

    vitalMappings.forEach(mapping => {
      const value = vitals[mapping.key as keyof typeof vitals];
      if (value) {
        observations.push({
          resourceType: 'Observation',
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: mapping.loinc,
              display: mapping.display
            }]
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp,
          valueQuantity: {
            value: parseFloat(value),
            unit: mapping.unit,
            system: 'http://unitsofmeasure.org',
            code: mapping.code
          }
        });
      }
    });

    await Promise.all(observations.map(obs => fhirService.create(obs)));
  }

  /**
   * Create problem/condition
   */
  static async createProblem(patientId: string, patientName: string, problem: {
    condition: string;
    category: string;
    severity?: string;
    onsetDate: string;
  }): Promise<void> {
    const severityMap: Record<string, { code: string; display: string }> = {
      severe: { code: '24484000', display: 'Severe' },
      moderate: { code: '6736007', display: 'Moderate' },
      mild: { code: '255604002', display: 'Mild' }
    };

    const conditionResource = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed'
        }]
      },
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: problem.category,
          display: problem.category === 'problem-list-item' ? 'Problem List Item' : 'Encounter Diagnosis'
        }]
      }],
      severity: problem.severity ? {
        coding: [{
          system: 'http://snomed.info/sct',
          ...severityMap[problem.severity]
        }]
      } : undefined,
      code: { text: problem.condition },
      subject: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      onsetDateTime: problem.onsetDate,
      recordedDate: new Date().toISOString()
    };

    await fhirService.create(conditionResource);
  }

  /**
   * Create medication request
   */
  static async createMedication(patientId: string, patientName: string, medication: {
    medication: string;
    dosageValue: string;
    dosageUnit: string;
    route: string;
    frequency: string;
    period: string;
    periodUnit: string;
    instructions?: string;
  }): Promise<void> {
    const routeMap: Record<string, { code: string; display: string }> = {
      oral: { code: '26643006', display: 'Oral' },
      intravenous: { code: '47625008', display: 'Intravenous' },
      intramuscular: { code: '78421000', display: 'Intramuscular' },
      subcutaneous: { code: '34206005', display: 'Subcutaneous' },
      topical: { code: '6064005', display: 'Topical' }
    };

    const medicationResource = {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: medication.medication },
      subject: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [{
        text: medication.instructions || undefined,
        route: {
          coding: [{
            system: 'http://snomed.info/sct',
            ...routeMap[medication.route]
          }]
        },
        timing: {
          repeat: {
            frequency: parseInt(medication.frequency),
            period: parseInt(medication.period),
            periodUnit: medication.periodUnit
          }
        },
        doseAndRate: [{
          doseQuantity: {
            value: parseFloat(medication.dosageValue),
            unit: medication.dosageUnit
          }
        }]
      }]
    };

    await fhirService.create(medicationResource);
  }

  /**
   * Create encounter
   */
  static async createEncounter(patientId: string, patientName: string, encounter: {
    encounterClass: string;
    practitioner?: string;
    location?: string;
  }): Promise<void> {
    const encounterResource = {
      resourceType: 'Encounter',
      status: 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: encounter.encounterClass,
        display: encounter.encounterClass.charAt(0).toUpperCase() + encounter.encounterClass.slice(1)
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      participant: encounter.practitioner ? [{
        type: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
            code: 'PPRF',
            display: 'Primary Performer'
          }]
        }],
        individual: {
          reference: `Practitioner/${encounter.practitioner}`
        }
      }] : [],
      period: {
        start: new Date().toISOString()
      },
      serviceProvider: encounter.location ? {
        reference: `Organization/${encounter.location}`
      } : undefined
    };

    await fhirService.create(encounterResource);
  }

  /**
   * Create allergy intolerance
   */
  static async createAllergy(patientId: string, patientName: string, allergy: {
    allergen: string;
    category: string;
    criticality: string;
    reaction?: string;
    severity?: string;
  }): Promise<void> {
    const allergyResource = {
      resourceType: 'AllergyIntolerance',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: 'active',
          display: 'Active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
          code: 'confirmed',
          display: 'Confirmed'
        }]
      },
      type: 'allergy',
      category: [allergy.category],
      criticality: allergy.criticality,
      code: {
        text: allergy.allergen
      },
      patient: {
        reference: `Patient/${patientId}`,
        display: patientName
      },
      recordedDate: new Date().toISOString(),
      reaction: allergy.reaction ? [{
        manifestation: [{
          text: allergy.reaction
        }],
        severity: allergy.severity || 'moderate'
      }] : undefined
    };

    await fhirService.create(allergyResource);
  }
}
