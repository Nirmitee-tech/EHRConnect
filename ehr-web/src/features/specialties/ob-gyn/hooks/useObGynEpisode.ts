/**
 * OB/GYN Episode Hook
 * Custom hook for managing OB/GYN prenatal episodes
 */

import { useCallback } from 'react';
import { useEpisodeContext } from '@/contexts/episode-context';
import { CreateEpisodeRequest } from '@/types/episode';

/**
 * Hook for OB/GYN episode management
 */
export function useObGynEpisode() {
  const {
    getEpisodeBySpecialty,
    hasActiveEpisode,
    createEpisode,
    updateEpisode,
    closeEpisode,
  } = useEpisodeContext();

  const obgynEpisode = getEpisodeBySpecialty('ob-gyn');
  const hasObGynEpisode = hasActiveEpisode('ob-gyn');

  /**
   * Start a new prenatal episode
   */
  const startPrenatalEpisode = useCallback(
    async (prenatalData: {
      lmp: string;
      edd: string;
      gravida: number;
      para: number;
      highRisk?: boolean;
      riskFactors?: string;
    }) => {
      const request: CreateEpisodeRequest = {
        patientId: '', // Will be set by context
        specialtySlug: 'ob-gyn',
        status: 'active',
        metadata: {
          ...prenatalData,
          startDate: new Date().toISOString(),
        },
      };

      return await createEpisode(request);
    },
    [createEpisode]
  );

  /**
   * Update prenatal episode data
   */
  const updatePrenatalData = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!obgynEpisode) {
        throw new Error('No active OB/GYN episode');
      }

      return await updateEpisode(obgynEpisode.id, {
        metadata: updates,
      });
    },
    [obgynEpisode, updateEpisode]
  );

  /**
   * Close prenatal episode (after delivery)
   */
  const completeDelivery = useCallback(
    async (deliveryData: {
      deliveryDate: string;
      deliveryType: string;
      outcome: string;
    }) => {
      if (!obgynEpisode) {
        throw new Error('No active OB/GYN episode');
      }

      // Update with delivery data
      await updateEpisode(obgynEpisode.id, {
        metadata: deliveryData,
      });

      // Close the episode
      return await closeEpisode(
        obgynEpisode.id,
        `Delivery completed: ${deliveryData.outcome}`
      );
    },
    [obgynEpisode, updateEpisode, closeEpisode]
  );

  return {
    obgynEpisode,
    hasObGynEpisode,
    startPrenatalEpisode,
    updatePrenatalData,
    completeDelivery,
  };
}
