// Organization Settings Types

export interface OrganizationSettings {
  id?: string;
  organizationId: string;
  appointmentSettings: AppointmentSettings;
  updatedAt?: Date;
}

export interface AppointmentSettings {
  defaultDuration: number; // in minutes (5-60)
  slotDuration: number; // Calendar slot duration in minutes (5-60)
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  allowedDurations: number[]; // Available duration options [15, 30, 45, 60]
  autoNavigateToEncounter: boolean; // If true, "Start" navigates to encounter; if false, only updates status
}

export const DEFAULT_APPOINTMENT_SETTINGS: AppointmentSettings = {
  defaultDuration: 30, // 30 minutes default
  slotDuration: 60, // 1 hour calendar slots
  workingHours: {
    start: '09:00',
    end: '17:00'
  },
  allowedDurations: [15, 30, 45, 60, 90, 120],
  autoNavigateToEncounter: true // Default: navigate to encounter (for doctors)
};
