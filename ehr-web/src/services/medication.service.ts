import { fhirService } from '@/lib/medplum';
import { Prescription } from '@/types/encounter';

/**
 * Medication Service
 * Handles FHIR MedicationRequest operations
 */
export class MedicationService {
  /**
   * Create a new medication request
   */
  static async createMedication(patientId: string, prescription: Prescription): Promise<any> {
    const medicationRequest = {
      resourceType: 'MedicationRequest',
      status: prescription.status || 'active',
      intent: prescription.intent || 'order',
      medicationCodeableConcept: prescription.medicationCodeableConcept || {
        text: prescription.medication
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: prescription.subject?.display
      },
      authoredOn: prescription.authoredOn || new Date().toISOString(),
      dosageInstruction: this.buildDosageInstruction(prescription),
      encounter: prescription.encounter
    };

    return await fhirService.create(medicationRequest);
  }

  /**
   * Update an existing medication request
   */
  static async updateMedication(medicationId: string, prescription: Prescription): Promise<any> {
    // First get the existing medication
    const existing = await fhirService.read('MedicationRequest', medicationId);

    const updated = {
      ...existing,
      status: prescription.status || existing.status,
      medicationCodeableConcept: prescription.medicationCodeableConcept || {
        text: prescription.medication
      },
      dosageInstruction: this.buildDosageInstruction(prescription)
    };

    return await fhirService.update(updated);
  }

  /**
   * Delete (cancel) a medication request
   */
  static async deleteMedication(medicationId: string): Promise<void> {
    // In FHIR, we typically don't delete but mark as stopped/cancelled
    const existing = await fhirService.read('MedicationRequest', medicationId);
    const updated = {
      ...existing,
      status: 'stopped'
    };
    await fhirService.update(updated);
  }

  /**
   * Get all medications for a patient
   */
  static async getPatientMedications(patientId: string): Promise<any[]> {
    const response = await fhirService.search('MedicationRequest', {
      subject: `Patient/${patientId}`,
      status: 'active',
      _sort: '-authored'
    });

    return response.entry?.map((entry: any) => entry.resource) || [];
  }

  /**
   * Get medications for a specific encounter
   */
  static async getEncounterMedications(encounterId: string): Promise<any[]> {
    const response = await fhirService.search('MedicationRequest', {
      encounter: `Encounter/${encounterId}`,
      _sort: '-authored'
    });

    return response.entry?.map((entry: any) => entry.resource) || [];
  }

  /**
   * Build FHIR dosageInstruction from prescription data
   */
  private static buildDosageInstruction(prescription: Prescription): any[] {
    // If already has proper FHIR dosageInstruction, use it
    if (prescription.dosageInstruction && prescription.dosageInstruction.length > 0) {
      return prescription.dosageInstruction;
    }

    // Build from legacy fields
    const dosageInstruction: any = {
      text: prescription.instructions,
      timing: {},
      doseAndRate: []
    };

    // Parse dosage
    if (prescription.dosage) {
      const dosageMatch = prescription.dosage.match(/^([\d.]+)\s*(.*)$/);
      if (dosageMatch) {
        dosageInstruction.doseAndRate.push({
          doseQuantity: {
            value: parseFloat(dosageMatch[1]),
            unit: dosageMatch[2] || 'unit'
          }
        });
      }
    }

    // Parse frequency and duration
    if (prescription.frequency || prescription.duration) {
      dosageInstruction.timing.repeat = {};

      // Map common frequency patterns
      const freqMap: Record<string, { frequency: number; period: number; periodUnit: string }> = {
        'once daily': { frequency: 1, period: 1, periodUnit: 'd' },
        'twice daily': { frequency: 2, period: 1, periodUnit: 'd' },
        'three times daily': { frequency: 3, period: 1, periodUnit: 'd' },
        'four times daily': { frequency: 4, period: 1, periodUnit: 'd' },
        'every 4 hours': { frequency: 1, period: 4, periodUnit: 'h' },
        'every 6 hours': { frequency: 1, period: 6, periodUnit: 'h' },
        'every 8 hours': { frequency: 1, period: 8, periodUnit: 'h' },
        'every 12 hours': { frequency: 1, period: 12, periodUnit: 'h' }
      };

      const freqLower = (prescription.frequency || '').toLowerCase();
      if (freqMap[freqLower]) {
        Object.assign(dosageInstruction.timing.repeat, freqMap[freqLower]);
      }

      // Parse duration
      if (prescription.duration) {
        const durationMatch = prescription.duration.match(/^(\d+)\s*(day|days|week|weeks|month|months)/i);
        if (durationMatch) {
          const value = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          const unitMap: Record<string, string> = {
            'day': 'd', 'days': 'd',
            'week': 'wk', 'weeks': 'wk',
            'month': 'mo', 'months': 'mo'
          };
          dosageInstruction.timing.repeat.duration = value;
          dosageInstruction.timing.repeat.durationUnit = unitMap[unit] || 'd';
        }
      }
    }

    return [dosageInstruction];
  }

  /**
   * Convert FHIR MedicationRequest to internal Prescription format
   */
  static convertFHIRToPrescription(fhirMed: any): Prescription {
    const dosageInstruction = fhirMed.dosageInstruction?.[0];
    const doseQuantity = dosageInstruction?.doseAndRate?.[0]?.doseQuantity;
    const timing = dosageInstruction?.timing?.repeat;

    return {
      id: fhirMed.id,
      resourceType: 'MedicationRequest',
      status: fhirMed.status,
      intent: fhirMed.intent,
      medicationCodeableConcept: fhirMed.medicationCodeableConcept,
      medication: fhirMed.medicationCodeableConcept?.text ||
                  fhirMed.medicationCodeableConcept?.coding?.[0]?.display ||
                  '',
      dosage: doseQuantity ? `${doseQuantity.value} ${doseQuantity.unit}` : '',
      frequency: this.formatFrequency(timing),
      duration: this.formatDuration(timing),
      instructions: dosageInstruction?.text || '',
      dosageInstruction: fhirMed.dosageInstruction,
      authoredOn: fhirMed.authoredOn,
      subject: fhirMed.subject,
      requester: fhirMed.requester,
      encounter: fhirMed.encounter
    };
  }

  private static formatFrequency(timing: any): string {
    if (!timing) return '';

    const { frequency, period, periodUnit } = timing;
    if (!frequency || !period) return '';

    const unitMap: Record<string, string> = {
      h: 'hour', d: 'day', wk: 'week', mo: 'month'
    };
    const unit = unitMap[periodUnit] || periodUnit;

    // Create readable format
    if (frequency === 1 && period === 1) {
      return `Once ${unit}ly`;
    }
    if (frequency === 2 && period === 1 && periodUnit === 'd') {
      return 'Twice daily';
    }
    if (frequency === 3 && period === 1 && periodUnit === 'd') {
      return 'Three times daily';
    }

    return `${frequency}x per ${period} ${unit}${period > 1 ? 's' : ''}`;
  }

  private static formatDuration(timing: any): string {
    if (!timing) return '';

    const { duration, durationUnit } = timing;
    if (!duration || !durationUnit) return '';

    const unitMap: Record<string, string> = {
      h: 'hour', d: 'day', wk: 'week', mo: 'month'
    };
    const unit = unitMap[durationUnit] || durationUnit;

    return `${duration} ${unit}${duration > 1 ? 's' : ''}`;
  }
}
