import { useState, useEffect } from 'react';
import { useFacility } from '@/contexts/facility-context';
import { SettingsService } from '@/services/settings.service';

/**
 * Hook to get calendar settings including slot duration
 */
export function useCalendarSettings() {
  const { currentFacility } = useFacility();
  const [slotDuration, setSlotDuration] = useState(60); // Default 60 minutes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [currentFacility]);

  const loadSettings = async () => {
    if (!currentFacility?.id) {
      setLoading(false);
      return;
    }

    try {
      const settings = await SettingsService.getOrganizationSettings(currentFacility.id);
      setSlotDuration(settings.appointmentSettings.slotDuration);
    } catch (error) {
      console.error('Error loading calendar settings:', error);
      // Keep default 60 minutes on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate time slots based on slot duration
   * @param startHour Starting hour (default 0)
   * @param endHour Ending hour (default 24)
   * @returns Array of time slot strings like ["9:00", "9:15", "9:30", ...]
   */
  const getTimeSlots = (startHour: number = 0, endHour: number = 24): string[] => {
    const slots: string[] = [];
    const totalMinutes = (endHour - startHour) * 60;
    const slotsCount = Math.floor(totalMinutes / slotDuration);

    for (let i = 0; i <= slotsCount; i++) {
      const totalMins = startHour * 60 + (i * slotDuration);
      const hours = Math.floor(totalMins / 60);
      const minutes = totalMins % 60;

      if (hours < endHour || (hours === endHour && minutes === 0)) {
        slots.push(`${hours}:${minutes.toString().padStart(2, '0')}`);
      }
    }

    return slots;
  };

  /**
   * Get the height in pixels for a given duration based on slot duration
   * This is used to calculate appointment card heights
   */
  const getPixelsPerMinute = (hourHeightPx: number = 60): number => {
    return hourHeightPx / slotDuration;
  };

  return {
    slotDuration,
    loading,
    getTimeSlots,
    getPixelsPerMinute,
    refresh: loadSettings
  };
}
