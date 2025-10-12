import { AddressData, NoteData } from '@/types/encounter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const FHIR_BASE_URL = `${API_BASE_URL}/fhir/R4`;

export class AddressService {
  /**
   * Get patient with addresses and notes from FHIR Patient resource
   */
  static async getPatientData(patientId: string): Promise<{addresses: AddressData[], socialNotes: NoteData[], internalNotes: NoteData[]}> {
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

      console.log('🔷 AddressService.getPatientData - Returning:', { addresses, socialNotes, internalNotes });
      return { addresses, socialNotes, internalNotes };
    } catch (error) {
      console.error('Error fetching patient data:', error);
      return { addresses: [], socialNotes: [], internalNotes: [] };
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
        }
      ];

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
}
