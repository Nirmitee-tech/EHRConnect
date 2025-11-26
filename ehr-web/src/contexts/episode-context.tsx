'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Episode, CreateEpisodeRequest, UpdateEpisodeRequest, EpisodeStatus } from '@/types/episode';
import { episodeService } from '@/services/episode.service';

interface EpisodeContextValue {
  episodes: Episode[];
  activeEpisode: Episode | null;
  loading: boolean;
  error: string | null;

  // Actions
  setActiveEpisode: (episode: Episode | null) => void;
  refreshEpisodes: () => Promise<void>;
  createEpisode: (request: CreateEpisodeRequest) => Promise<Episode>;
  updateEpisode: (episodeId: string, updates: UpdateEpisodeRequest) => Promise<Episode>;
  closeEpisode: (episodeId: string, reason?: string) => Promise<Episode>;

  // Helper functions
  getEpisodeBySpecialty: (specialtySlug: string) => Episode | undefined;
  hasActiveEpisode: (specialtySlug: string) => boolean;
  getActiveEpisodes: () => Episode[];
}

const EpisodeContext = createContext<EpisodeContextValue | undefined>(undefined);

interface EpisodeProviderProps {
  patientId: string;
  children: React.ReactNode;
  autoLoad?: boolean; // Automatically load episodes on mount
}

/**
 * Episode Provider
 * Manages patient episodes and provides context to child components
 */
export function EpisodeProvider({ patientId, children, autoLoad = true }: EpisodeProviderProps) {
  const { data: session } = useSession();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all episodes for the patient
   */
  const fetchEpisodes = useCallback(async () => {
    if (!patientId || !session) return;

    try {
      setLoading(true);
      setError(null);

      const data = await episodeService.getPatientEpisodes(session, patientId);
      setEpisodes(data);

      // Auto-set active episode if there's only one active episode
      const activeEpisodes = data.filter(e => e.status === 'active');
      if (activeEpisodes.length === 1 && !activeEpisode) {
        setActiveEpisode(activeEpisodes[0]);
      }
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch episodes');
    } finally {
      setLoading(false);
    }
  }, [patientId, session, activeEpisode]);

  /**
   * Auto-load episodes on mount
   */
  useEffect(() => {
    if (autoLoad) {
      fetchEpisodes();
    }
  }, [autoLoad, fetchEpisodes]);

  /**
   * Create a new episode
   */
  const createEpisode = useCallback(
    async (request: CreateEpisodeRequest): Promise<Episode> => {
      if (!session) {
        throw new Error('No active session');
      }

      try {
        setLoading(true);
        setError(null);

        const newEpisode = await episodeService.createEpisode(
          session,
          patientId,
          request
        );

        // Add to episodes list
        setEpisodes(prev => [newEpisode, ...prev]);

        // Set as active if it's the only active episode
        if (newEpisode.status === 'active') {
          setActiveEpisode(newEpisode);
        }

        return newEpisode;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create episode';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [session, patientId]
  );

  /**
   * Update an episode
   */
  const updateEpisode = useCallback(
    async (episodeId: string, updates: UpdateEpisodeRequest): Promise<Episode> => {
      if (!session) {
        throw new Error('No active session');
      }

      try {
        setLoading(true);
        setError(null);

        const updatedEpisode = await episodeService.updateEpisode(
          session,
          patientId,
          episodeId,
          updates
        );

        // Update in episodes list
        setEpisodes(prev =>
          prev.map(e => (e.id === episodeId ? updatedEpisode : e))
        );

        // Update active episode if it's the one being updated
        if (activeEpisode?.id === episodeId) {
          setActiveEpisode(updatedEpisode);
        }

        return updatedEpisode;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update episode';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [session, patientId, activeEpisode]
  );

  /**
   * Close an episode
   */
  const closeEpisode = useCallback(
    async (episodeId: string, reason?: string): Promise<Episode> => {
      if (!session) {
        throw new Error('No active session');
      }

      try {
        setLoading(true);
        setError(null);

        const closedEpisode = await episodeService.closeEpisode(
          session,
          patientId,
          episodeId,
          reason
        );

        // Update in episodes list
        setEpisodes(prev =>
          prev.map(e => (e.id === episodeId ? closedEpisode : e))
        );

        // Clear active episode if it's the one being closed
        if (activeEpisode?.id === episodeId) {
          setActiveEpisode(null);
        }

        return closedEpisode;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to close episode';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [session, patientId, activeEpisode]
  );

  /**
   * Get episode by specialty slug
   */
  const getEpisodeBySpecialty = useCallback(
    (specialtySlug: string): Episode | undefined => {
      return episodes.find(e => e.specialtySlug === specialtySlug && e.status === 'active');
    },
    [episodes]
  );

  /**
   * Check if patient has an active episode for a specialty
   */
  const hasActiveEpisode = useCallback(
    (specialtySlug: string): boolean => {
      return episodes.some(
        e => e.specialtySlug === specialtySlug && e.status === 'active'
      );
    },
    [episodes]
  );

  /**
   * Get all active episodes
   */
  const getActiveEpisodes = useCallback((): Episode[] => {
    return episodes.filter(e => e.status === 'active');
  }, [episodes]);

  const value: EpisodeContextValue = useMemo(
    () => ({
      episodes,
      activeEpisode,
      loading,
      error,
      setActiveEpisode,
      refreshEpisodes: fetchEpisodes,
      createEpisode,
      updateEpisode,
      closeEpisode,
      getEpisodeBySpecialty,
      hasActiveEpisode,
      getActiveEpisodes,
    }),
    [
      episodes,
      activeEpisode,
      loading,
      error,
      fetchEpisodes,
      createEpisode,
      updateEpisode,
      closeEpisode,
      getEpisodeBySpecialty,
      hasActiveEpisode,
      getActiveEpisodes,
    ]
  );

  return (
    <EpisodeContext.Provider value={value}>
      {children}
    </EpisodeContext.Provider>
  );
}

/**
 * Hook to access episode context
 * @throws Error if used outside EpisodeProvider
 */
export function useEpisodeContext() {
  const context = useContext(EpisodeContext);
  if (context === undefined) {
    throw new Error('useEpisodeContext must be used within an EpisodeProvider');
  }
  return context;
}

/**
 * Hook to access active episode
 */
export function useActiveEpisode(): Episode | null {
  const { activeEpisode } = useEpisodeContext();
  return activeEpisode;
}

/**
 * Hook to check if a specific specialty has an active episode
 */
export function useHasActiveEpisode(specialtySlug: string): boolean {
  const { hasActiveEpisode } = useEpisodeContext();
  return hasActiveEpisode(specialtySlug);
}

/**
 * Hook to get episode for a specific specialty
 */
export function useSpecialtyEpisode(specialtySlug: string): Episode | undefined {
  const { getEpisodeBySpecialty } = useEpisodeContext();
  return getEpisodeBySpecialty(specialtySlug);
}

/**
 * Hook to get all active episodes
 */
export function useActiveEpisodes(): Episode[] {
  const { getActiveEpisodes } = useEpisodeContext();
  return getActiveEpisodes();
}
