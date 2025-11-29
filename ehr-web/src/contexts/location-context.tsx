'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Location {
  id: string;
  name: string;
  location_type?: string;
  address?: any;
  active: boolean;
}

interface LocationContextType {
  currentLocation: Location | null;
  locations: Location[];
  loading: boolean;
  error: string | null;
  setCurrentLocation: (location: Location | null) => void;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get org and user context
  useEffect(() => {
    if (session?.user?.email) {
      if (session.org_id && session.user.id) {
        setOrgId(session.org_id);
        setUserId(session.user.id);
      } else {
        // Fetch user context if not in session
        fetchUserContext();
      }
    }
  }, [session]);

  const fetchUserContext = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user-context?email=${encodeURIComponent(session?.user?.email || '')}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const context = await response.json();
        setOrgId(context.org_id);
        setUserId(context.user_id);
      }
    } catch (err) {
      console.error('Error fetching user context:', err);
    }
  };

  // Load locations when we have orgId and userId
  useEffect(() => {
    if (orgId && userId) {
      loadLocations();
    }
  }, [orgId, userId]);

  const loadLocations = async () => {
    if (!orgId || !userId) return;

    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${API_URL}/api/orgs/${orgId}/locations?activeOnly=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': orgId,
            'x-user-id': userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const activeLocations = data.locations || [];
        setLocations(activeLocations);

        // Set current location from localStorage or first location
        if (activeLocations.length > 0) {
          const savedLocationId = localStorage.getItem('currentLocationId');
          const savedLocation = savedLocationId
            ? activeLocations.find((l: Location) => l.id === savedLocationId)
            : null;

          const initialLocation = savedLocation || activeLocations[0];
          setCurrentLocationState(initialLocation);

          if (initialLocation) {
            localStorage.setItem('currentLocationId', initialLocation.id);
          }
        }
      } else {
        throw new Error('Failed to load locations');
      }
    } catch (err) {
      setError('Failed to load locations');
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentLocation = (location: Location | null) => {
    setCurrentLocationState(location);
    if (location) {
      localStorage.setItem('currentLocationId', location.id);
    } else {
      localStorage.removeItem('currentLocationId');
    }
  };

  const refreshLocations = async () => {
    await loadLocations();
  };

  const value: LocationContextType = {
    currentLocation,
    locations,
    loading,
    error,
    setCurrentLocation,
    refreshLocations
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
