import { AppointmentType } from '@/types/staff';

export class AppointmentTypesService {
  private static baseUrl = '/api/appointment-types';

  /**
   * Get all appointment types
   */
  static async getAppointmentTypes(): Promise<AppointmentType[]> {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch appointment types: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment types:', error);
      throw error;
    }
  }

  /**
   * Get a single appointment type by ID
   */
  static async getAppointmentType(id: string): Promise<AppointmentType> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch appointment type: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment type:', error);
      throw error;
    }
  }

  /**
   * Create a new appointment type
   */
  static async createAppointmentType(appointmentType: Omit<AppointmentType, 'id'>): Promise<AppointmentType> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentType)
      });

      if (!response.ok) {
        throw new Error(`Failed to create appointment type: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating appointment type:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment type
   */
  static async updateAppointmentType(id: string, appointmentType: AppointmentType): Promise<AppointmentType> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentType)
      });

      if (!response.ok) {
        throw new Error(`Failed to update appointment type: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating appointment type:', error);
      throw error;
    }
  }

  /**
   * Delete an appointment type
   */
  static async deleteAppointmentType(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete appointment type: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting appointment type:', error);
      throw error;
    }
  }
}
