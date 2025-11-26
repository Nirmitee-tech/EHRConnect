import { AddressData, NoteData, HabitsData, AllergiesData, InsuranceData } from '@/types/encounter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const FHIR_BASE_URL = `${API_BASE_URL}/fhir/R4`;

export class AddressService {
  /**
   * Get patient with addresses, notes, and medical info from FHIR Patient resource
   */
  static async getPatientData(patientId: string): Promise<{
    addresses: AddressData[],
    socialNotes: NoteData[],
    internalNotes: NoteData[],
    insuranceCards: InsuranceData[],
    patientHistory?: string,
    habitsStructured?: HabitsData,
    allergiesStructured?: AllergiesData
  }> {
    try {
      console.log('🔷 AddressService.getPatientData - Fetching patient:', patientId);
      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/fhir+json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient: ${response.statusText}`);
      }

      const patient = await response.json();
      console.log('🔷 AddressService.getPatientData - Patient received:', patient);

      // Extract addresses from extension
      const addressesExt = patient.extension?.find((ext: any) => ext.url === 'addresses');
      console.log('🔷 AddressService.getPatientData - Addresses extension:', addressesExt);
      const addresses: AddressData[] = addressesExt?.valueString ? JSON.parse(addressesExt.valueString) : [];
      console.log('🔷 AddressService.getPatientData - Parsed addresses:', addresses);

      // Extract social notes from extension
      const socialNotesExt = patient.extension?.find((ext: any) => ext.url === 'socialNotes');
      const socialNotes: NoteData[] = socialNotesExt?.valueString ? JSON.parse(socialNotesExt.valueString) : [];

      // Extract internal notes from extension
      const internalNotesExt = patient.extension?.find((ext: any) => ext.url === 'internalNotes');
      const internalNotes: NoteData[] = internalNotesExt?.valueString ? JSON.parse(internalNotesExt.valueString) : [];

      // Extract patient history from extension
      const patientHistoryExt = patient.extension?.find((ext: any) => ext.url === 'patientHistory');
      const patientHistory: string | undefined = patientHistoryExt?.valueString;

      // Extract structured habits from extension
      const habitsExt = patient.extension?.find((ext: any) => ext.url === 'habitsStructured');
      const habitsStructured: HabitsData | undefined = habitsExt?.valueString ? JSON.parse(habitsExt.valueString) : undefined;

      // Extract structured allergies from extension
      const allergiesExt = patient.extension?.find((ext: any) => ext.url === 'allergiesStructured');
      const allergiesStructured: AllergiesData | undefined = allergiesExt?.valueString ? JSON.parse(allergiesExt.valueString) : undefined;

      // Extract insurance cards from extension
      const insuranceExt = patient.extension?.find((ext: any) => ext.url === 'insuranceCards');
      const insuranceCards: InsuranceData[] = insuranceExt?.valueString ? JSON.parse(insuranceExt.valueString) : [];

      console.log('🔷 AddressService.getPatientData - Returning:', { addresses, socialNotes, internalNotes, insuranceCards, patientHistory, habitsStructured, allergiesStructured });
      return { addresses, socialNotes, internalNotes, insuranceCards, patientHistory, habitsStructured, allergiesStructured };
    } catch (error) {
      console.error('Error fetching patient data:', error);
      return { addresses: [], socialNotes: [], internalNotes: [], insuranceCards: [] };
    }
  }

  /**
   * Update patient addresses using FHIR PATCH
   */
  static async batchUpdate(patientId: string, addresses: AddressData[]): Promise<AddressData[]> {
    try {
      // Use FHIR PATCH to update the patient's extension
      const patchOps = [
        {
          op: 'replace',
          path: '/extension',
          value: [
            {
              url: 'addresses',
              valueString: JSON.stringify(addresses)
            }
          ]
        }
      ];

      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patchOps),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.issue?.[0]?.details?.text || 'Failed to update addresses');
      }

      return addresses;
    } catch (error) {
      console.error('Error updating addresses:', error);
      throw error;
    }
  }

  /**
   * Update patient notes (social or internal) using FHIR PATCH
   */
  static async updateNotes(patientId: string, notes: NoteData[], type: 'social' | 'internal'): Promise<NoteData[]> {
    try {
      // First get current patient data to preserve other extensions
      const currentData = await this.getPatientData(patientId);

      const extensionUrl = type === 'social' ? 'socialNotes' : 'internalNotes';

      // Build extensions array with all data
      const extensions = [
        {
          url: 'addresses',
          valueString: JSON.stringify(currentData.addresses)
        },
        {
          url: 'socialNotes',
          valueString: JSON.stringify(type === 'social' ? notes : currentData.socialNotes)
        },
        {
          url: 'internalNotes',
          valueString: JSON.stringify(type === 'internal' ? notes : currentData.internalNotes)
        }
      ];

      const patchOps = [
        {
          op: 'replace',
          path: '/extension',
          value: extensions
        }
      ];

      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patchOps),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.issue?.[0]?.details?.text || 'Failed to update notes');
      }

      return notes;
    } catch (error) {
      console.error(`Error updating ${type} notes:`, error);
      throw error;
    }
  }

  /**
   * Update patient active status
   */
  static async updatePatientStatus(patientId: string, active: boolean): Promise<void> {
    try {
      console.log('🔷 AddressService.updatePatientStatus - Called with:', { patientId, active });

      const patchOps = [
        {
          op: 'replace',
          path: '/active',
          value: active
        }
      ];

      console.log('🔷 AddressService.updatePatientStatus - Patch operations:', JSON.stringify(patchOps, null, 2));

      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patchOps),
      });

      console.log('🔷 AddressService.updatePatientStatus - Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('🔷 AddressService.updatePatientStatus - Error response:', error);
        throw new Error(error.issue?.[0]?.details?.text || 'Failed to update patient status');
      }

      const result = await response.json();
      console.log('✅ AddressService.updatePatientStatus - Success! Updated patient:', result);
    } catch (error) {
      console.error('❌ AddressService.updatePatientStatus - Error:', error);
      throw error;
    }
  }

  /**
   * Update both addresses and notes together (more efficient)
   */
  static async updatePatientData(
    patientId: string,
    addresses: AddressData[],
    socialNotes: NoteData[],
    internalNotes: NoteData[]
  ): Promise<void> {
    try {
      console.log('🔷 AddressService.updatePatientData - Called with:');
      console.log('  - Patient ID:', patientId);
      console.log('  - Addresses count:', addresses.length);
      console.log('  - Addresses data:', addresses);
      console.log('  - Social notes count:', socialNotes.length);
      console.log('  - Internal notes count:', internalNotes.length);

      // Get current patient data to preserve medical info
      const currentData = await this.getPatientData(patientId);

      const extensions = [
        {
          url: 'addresses',
          valueString: JSON.stringify(addresses)
        },
        {
          url: 'socialNotes',
          valueString: JSON.stringify(socialNotes)
        },
        {
          url: 'internalNotes',
          valueString: JSON.stringify(internalNotes)
        },
        {
          url: 'insuranceCards',
          valueString: JSON.stringify(currentData.insuranceCards)
        }
      ];

      // Preserve patient history if exists
      if (currentData.patientHistory !== undefined) {
        extensions.push({
          url: 'patientHistory',
          valueString: currentData.patientHistory
        });
      }

      // Preserve structured medical data if exists
      if (currentData.habitsStructured) {
        extensions.push({
          url: 'habitsStructured',
          valueString: JSON.stringify(currentData.habitsStructured)
        });
      }
      if (currentData.allergiesStructured) {
        extensions.push({
          url: 'allergiesStructured',
          valueString: JSON.stringify(currentData.allergiesStructured)
        });
      }

      const patchOps = [
        {
          op: 'replace',
          path: '/extension',
          value: extensions
        }
      ];

      console.log('🔷 AddressService.updatePatientData - Patch operations:', JSON.stringify(patchOps, null, 2));

      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patchOps),
      });

      console.log('🔷 AddressService.updatePatientData - Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('🔷 AddressService.updatePatientData - Error response:', error);
        throw new Error(error.issue?.[0]?.details?.text || 'Failed to update patient data');
      }

      const result = await response.json();
      console.log('✅ AddressService.updatePatientData - Success! Updated patient:', result);
    } catch (error) {
      console.error('❌ AddressService.updatePatientData - Error:', error);
      throw error;
    }
  }

  /**
   * Update patient medical information (history, structured habits, structured allergies)
   */
  static async updatePatientMedicalInfo(
    patientId: string,
    patientHistory?: string,
    habitsStructured?: HabitsData,
    allergiesStructured?: AllergiesData
  ): Promise<void> {
    try {
      console.log('🔷 AddressService.updatePatientMedicalInfo - Called with:');
      console.log('  - Patient ID:', patientId);
      console.log('  - Patient History:', patientHistory);
      console.log('  - Habits Structured:', habitsStructured);
      console.log('  - Allergies Structured:', allergiesStructured);

      // Get current patient data to preserve addresses and notes
      const currentData = await this.getPatientData(patientId);

      const extensions = [
        {
          url: 'addresses',
          valueString: JSON.stringify(currentData.addresses)
        },
        {
          url: 'socialNotes',
          valueString: JSON.stringify(currentData.socialNotes)
        },
        {
          url: 'internalNotes',
          valueString: JSON.stringify(currentData.internalNotes)
        },
        {
          url: 'insuranceCards',
          valueString: JSON.stringify(currentData.insuranceCards)
        }
      ];

      // Add patient history
      if (patientHistory !== undefined) {
        extensions.push({
          url: 'patientHistory',
          valueString: patientHistory
        });
      }

      // Add structured habits
      if (habitsStructured) {
        extensions.push({
          url: 'habitsStructured',
          valueString: JSON.stringify(habitsStructured)
        });
      }

      // Add structured allergies
      if (allergiesStructured) {
        extensions.push({
          url: 'allergiesStructured',
          valueString: JSON.stringify(allergiesStructured)
        });
      }

      const patchOps = [
        {
          op: 'replace',
          path: '/extension',
          value: extensions
        }
      ];

      console.log('🔷 AddressService.updatePatientMedicalInfo - Patch operations:', JSON.stringify(patchOps, null, 2));

      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patchOps),
      });

      console.log('🔷 AddressService.updatePatientMedicalInfo - Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('🔷 AddressService.updatePatientMedicalInfo - Error response:', error);
        throw new Error(error.issue?.[0]?.details?.text || 'Failed to update medical info');
      }

      const result = await response.json();
      console.log('✅ AddressService.updatePatientMedicalInfo - Success! Updated patient:', result);
    } catch (error) {
      console.error('❌ AddressService.updatePatientMedicalInfo - Error:', error);
      throw error;
    }
  }

  /**
   * Update patient insurance cards
   */
  static async updateInsuranceCards(patientId: string, insuranceCards: InsuranceData[]): Promise<void> {
    try {
      console.log('🔷 AddressService.updateInsuranceCards - Called with:');
      console.log('  - Patient ID:', patientId);
      console.log('  - Insurance Cards:', insuranceCards);

      // Get current patient data to preserve other extensions
      const currentData = await this.getPatientData(patientId);

      const extensions = [
        {
          url: 'addresses',
          valueString: JSON.stringify(currentData.addresses)
        },
        {
          url: 'socialNotes',
          valueString: JSON.stringify(currentData.socialNotes)
        },
        {
          url: 'internalNotes',
          valueString: JSON.stringify(currentData.internalNotes)
        },
        {
          url: 'insuranceCards',
          valueString: JSON.stringify(insuranceCards)
        }
      ];

      // Preserve patient history if exists
      if (currentData.patientHistory !== undefined) {
        extensions.push({
          url: 'patientHistory',
          valueString: currentData.patientHistory
        });
      }

      // Preserve structured medical data if exists
      if (currentData.habitsStructured) {
        extensions.push({
          url: 'habitsStructured',
          valueString: JSON.stringify(currentData.habitsStructured)
        });
      }
      if (currentData.allergiesStructured) {
        extensions.push({
          url: 'allergiesStructured',
          valueString: JSON.stringify(currentData.allergiesStructured)
        });
      }

      const patchOps = [
        {
          op: 'replace',
          path: '/extension',
          value: extensions
        }
      ];

      console.log('🔷 AddressService.updateInsuranceCards - Patch operations:', JSON.stringify(patchOps, null, 2));

      const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patchOps),
      });

      console.log('🔷 AddressService.updateInsuranceCards - Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('🔷 AddressService.updateInsuranceCards - Error response:', error);
        throw new Error(error.issue?.[0]?.details?.text || 'Failed to update insurance cards');
      }

      const result = await response.json();
      console.log('✅ AddressService.updateInsuranceCards - Success! Updated patient:', result);
    } catch (error) {
      console.error('❌ AddressService.updateInsuranceCards - Error:', error);
      throw error;
    }
  }
}
