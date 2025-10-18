'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FacilitySummary } from '@/types/fhir';
import { facilityService } from '@/services/facility.service';

interface FacilityContextType {
  currentFacility: FacilitySummary | null;
  facilities: FacilitySummary[];
  loading: boolean;
  error: string | null;
  setCurrentFacility: (facility: FacilitySummary | null) => void;
  refreshFacilities: () => Promise<void>;
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

export function FacilityProvider({ children }: { children: React.ReactNode }) {
  const [currentFacility, setCurrentFacility] = useState<FacilitySummary | null>(null);
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const activeFacilities = await facilityService.getActiveFacilities();
      setFacilities(activeFacilities);
      
      // If no current facility is selected and we have facilities, select the first one
      if (!currentFacility && activeFacilities.length > 0) {
        const savedFacilityId = localStorage.getItem('currentFacilityId');
        const savedFacility = savedFacilityId 
          ? activeFacilities.find(f => f.id === savedFacilityId)
          : activeFacilities[0];
        
        setCurrentFacility(savedFacility || activeFacilities[0]);
      }
    } catch (err) {
      setError('Failed to load facilities');
      console.error('Error loading facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentFacility = (facility: FacilitySummary | null) => {
    setCurrentFacility(facility);
    if (facility) {
      localStorage.setItem('currentFacilityId', facility.id);
    } else {
      localStorage.removeItem('currentFacilityId');
    }
  };

  const refreshFacilities = async () => {
    await loadFacilities();
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const value: FacilityContextType = {
    currentFacility,
    facilities,
    loading,
    error,
    setCurrentFacility: handleSetCurrentFacility,
    refreshFacilities
  };

  return (
    <FacilityContext.Provider value={value}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (context === undefined) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
}
