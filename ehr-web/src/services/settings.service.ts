import { medplum } from '@/lib/medplum';
import { OrganizationSettings, AppointmentSettings, DEFAULT_APPOINTMENT_SETTINGS, FacilitySettings } from '@/types/settings';

/**
 * Service for managing organization settings stored in FHIR
 * Settings are stored as extensions in the Organization resource
 */
export class SettingsService {
  private static readonly SETTINGS_EXTENSION_URL = 'http://ehrconnect.com/fhir/StructureDefinition/organization-settings';
  private static readonly APPOINTMENT_SETTINGS_URL = 'http://ehrconnect.com/fhir/StructureDefinition/appointment-settings';

  /**
   * Get organization settings
   */
  static async getOrganizationSettings(organizationId: string): Promise<OrganizationSettings> {
    try {
      const organization = await medplum.readResource('Organization', organizationId);

      // Extract settings from extensions
      const settingsExtension = organization.extension?.find(
        (ext: any) => ext.url === this.SETTINGS_EXTENSION_URL
      );

      if (!settingsExtension) {
        // Return default settings if none exist
        return {
          organizationId,
          appointmentSettings: DEFAULT_APPOINTMENT_SETTINGS
        };
      }

      // Parse appointment settings from extension
      const appointmentSettingsExt = settingsExtension.extension?.find(
        (ext: any) => ext.url === this.APPOINTMENT_SETTINGS_URL
      );

      const appointmentSettings: AppointmentSettings = appointmentSettingsExt
        ? this.parseAppointmentSettings(appointmentSettingsExt)
        : DEFAULT_APPOINTMENT_SETTINGS;

      return {
        id: organization.id,
        organizationId,
        appointmentSettings,
        updatedAt: organization.meta?.lastUpdated ? new Date(organization.meta.lastUpdated) : undefined
      };
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      // Return defaults on error
      return {
        organizationId,
        appointmentSettings: DEFAULT_APPOINTMENT_SETTINGS
      };
    }
  }

  /**
   * Update organization appointment settings
   */
  static async updateAppointmentSettings(
    organizationId: string,
    appointmentSettings: Partial<AppointmentSettings>
  ): Promise<OrganizationSettings> {
    try {
      const organization = await medplum.readResource('Organization', organizationId);

      // Get current settings
      const currentSettings = await this.getOrganizationSettings(organizationId);

      // Merge with new settings
      const updatedAppointmentSettings: AppointmentSettings = {
        ...currentSettings.appointmentSettings,
        ...appointmentSettings
      };

      // Validate settings
      this.validateAppointmentSettings(updatedAppointmentSettings);

      // Create extension structure
      const appointmentSettingsExtension = this.createAppointmentSettingsExtension(updatedAppointmentSettings);

      // Update or add settings extension
      let extensions = organization.extension || [];
      const settingsExtensionIndex = extensions.findIndex(
        (ext: any) => ext.url === this.SETTINGS_EXTENSION_URL
      );

      const settingsExtension = {
        url: this.SETTINGS_EXTENSION_URL,
        extension: [appointmentSettingsExtension]
      };

      if (settingsExtensionIndex >= 0) {
        extensions[settingsExtensionIndex] = settingsExtension;
      } else {
        extensions.push(settingsExtension);
      }

      // Update organization
      const updated = await medplum.updateResource({
        ...organization,
        extension: extensions
      });

      return {
        id: updated.id,
        organizationId,
        appointmentSettings: updatedAppointmentSettings,
        updatedAt: new Date(updated.meta?.lastUpdated || new Date())
      };
    } catch (error) {
      console.error('Error updating organization settings:', error);
      throw error;
    }
  }

  /**
   * Parse appointment settings from FHIR extension
   */
  private static parseAppointmentSettings(extension: any): AppointmentSettings {
    const getValue = (url: string) => {
      const ext = extension.extension?.find((e: any) => e.url === url);
      return ext?.valueInteger || ext?.valueString;
    };

    const getArrayValue = (url: string): number[] => {
      const ext = extension.extension?.find((e: any) => e.url === url);
      if (ext?.valueString) {
        return ext.valueString.split(',').map((v: string) => parseInt(v.trim()));
      }
      return [];
    };

    return {
      defaultDuration: getValue('defaultDuration') || DEFAULT_APPOINTMENT_SETTINGS.defaultDuration,
      slotDuration: getValue('slotDuration') || DEFAULT_APPOINTMENT_SETTINGS.slotDuration,
      workingHours: {
        start: getValue('workingHoursStart') || DEFAULT_APPOINTMENT_SETTINGS.workingHours.start,
        end: getValue('workingHoursEnd') || DEFAULT_APPOINTMENT_SETTINGS.workingHours.end
      },
      allowedDurations: getArrayValue('allowedDurations').length > 0
        ? getArrayValue('allowedDurations')
        : DEFAULT_APPOINTMENT_SETTINGS.allowedDurations,
      autoNavigateToEncounter: getValue('autoNavigateToEncounter') !== undefined
        ? getValue('autoNavigateToEncounter') === 'true' || getValue('autoNavigateToEncounter') === true
        : DEFAULT_APPOINTMENT_SETTINGS.autoNavigateToEncounter
    };
  }

  /**
   * Create appointment settings extension
   */
  private static createAppointmentSettingsExtension(settings: AppointmentSettings): any {
    return {
      url: this.APPOINTMENT_SETTINGS_URL,
      extension: [
        { url: 'defaultDuration', valueInteger: settings.defaultDuration },
        { url: 'slotDuration', valueInteger: settings.slotDuration },
        { url: 'workingHoursStart', valueString: settings.workingHours.start },
        { url: 'workingHoursEnd', valueString: settings.workingHours.end },
        { url: 'allowedDurations', valueString: settings.allowedDurations.join(',') }
      ]
    };
  }

  /**
   * Validate appointment settings
   */
  private static validateAppointmentSettings(settings: AppointmentSettings): void {
    if (settings.defaultDuration < 5 || settings.defaultDuration > 240) {
      throw new Error('Default duration must be between 5 and 240 minutes');
    }

    if (settings.slotDuration < 5 || settings.slotDuration > 240) {
      throw new Error('Slot duration must be between 5 and 240 minutes');
    }

    if (settings.allowedDurations.some(d => d < 5 || d > 240)) {
      throw new Error('All allowed durations must be between 5 and 240 minutes');
    }

    // Validate working hours format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(settings.workingHours.start) || !timeRegex.test(settings.workingHours.end)) {
      throw new Error('Working hours must be in HH:mm format');
    }
  }

  /**
   * Get facility settings (wrapper for org settings for now)
   */
  static async getFacilitySettings(organizationId: string = 'default'): Promise<FacilitySettings> {
    const orgSettings = await this.getOrganizationSettings(organizationId);
    return {
      facilityName: 'Main Campus HQ', // This should come from org resource name
      slotDuration: orgSettings.appointmentSettings.slotDuration,
      defaultApptDuration: orgSettings.appointmentSettings.defaultDuration,
      workingHours: orgSettings.appointmentSettings.workingHours,
      autoNavigateToEncounter: orgSettings.appointmentSettings.autoNavigateToEncounter
    };
  }

  /**
   * Update facility settings
   */
  static async updateFacilitySettings(settings: FacilitySettings, organizationId: string = 'default'): Promise<void> {
    await this.updateAppointmentSettings(organizationId, {
      slotDuration: settings.slotDuration,
      defaultDuration: settings.defaultApptDuration,
      workingHours: settings.workingHours,
      autoNavigateToEncounter: settings.autoNavigateToEncounter
    });
  }
}
