/**
 * Episode Service
 * Frontend API client for FHIR EpisodeOfCare resources
 */

import { Session } from 'next-auth';
import {
  Episode,
  CreateEpisodeRequest,
  UpdateEpisodeRequest,
  EpisodeQueryParams,
  FHIREpisodeOfCare
} from '@/types/episode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create headers for API requests
 */
function getHeaders(session: Session | null): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-org-id': session?.org_id || '',
    'x-user-id': session?.user?.id || '',
    'x-user-roles': JSON.stringify(session?.roles || []),
    'x-location-id': session?.location_ids?.[0] || '',
  };
}

/**
 * Episode Service
 */
export const episodeService = {
  /**
   * Create a new episode for a patient
   */
  async createEpisode(
    session: Session | null,
    patientId: string,
    request: CreateEpisodeRequest
  ): Promise<Episode> {
    const response = await fetch(
      `${API_URL}/api/patients/${patientId}/episodes`,
      {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create episode');
    }

    const data = await response.json();
    return data.episode;
  },

  /**
   * Get all episodes for a patient
   */
  async getPatientEpisodes(
    session: Session | null,
    patientId: string,
    params?: EpisodeQueryParams
  ): Promise<Episode[]> {
    const queryParams = new URLSearchParams();

    if (params?.specialtySlug) {
      queryParams.append('specialtySlug', params.specialtySlug);
    }

    if (params?.status) {
      if (Array.isArray(params.status)) {
        queryParams.append('status', params.status.join(','));
      } else {
        queryParams.append('status', params.status);
      }
    }

    if (params?.active !== undefined) {
      queryParams.append('activeOnly', params.active.toString());
    }

    const url = `${API_URL}/api/patients/${patientId}/episodes${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      headers: getHeaders(session),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch patient episodes');
    }

    const data = await response.json();
    return data.episodes;
  },

  /**
   * Get a specific episode by ID
   */
  async getEpisodeById(
    session: Session | null,
    patientId: string,
    episodeId: string,
    includeFHIR = true
  ): Promise<Episode> {
    const url = `${API_URL}/api/patients/${patientId}/episodes/${episodeId}?includeFHIR=${includeFHIR}`;

    const response = await fetch(url, {
      headers: getHeaders(session),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch episode');
    }

    const data = await response.json();
    return data.episode;
  },

  /**
   * Update an episode
   */
  async updateEpisode(
    session: Session | null,
    patientId: string,
    episodeId: string,
    updates: UpdateEpisodeRequest
  ): Promise<Episode> {
    const response = await fetch(
      `${API_URL}/api/patients/${patientId}/episodes/${episodeId}`,
      {
        method: 'PATCH',
        headers: getHeaders(session),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update episode');
    }

    const data = await response.json();
    return data.episode;
  },

  /**
   * Close an episode
   */
  async closeEpisode(
    session: Session | null,
    patientId: string,
    episodeId: string,
    reason?: string
  ): Promise<Episode> {
    const response = await fetch(
      `${API_URL}/api/patients/${patientId}/episodes/${episodeId}/close`,
      {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to close episode');
    }

    const data = await response.json();
    return data.episode;
  },

  /**
   * Get FHIR EpisodeOfCare resource
   */
  async getFHIRResource(
    session: Session | null,
    episodeId: string
  ): Promise<FHIREpisodeOfCare> {
    const response = await fetch(
      `${API_URL}/api/episodes/fhir/${episodeId}`,
      {
        headers: getHeaders(session),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch FHIR resource');
    }

    return await response.json();
  },

  /**
   * Get all active episodes for a specialty
   */
  async getSpecialtyEpisodes(
    session: Session | null,
    specialtySlug: string
  ): Promise<Episode[]> {
    const response = await fetch(
      `${API_URL}/api/specialties/${specialtySlug}/episodes`,
      {
        headers: getHeaders(session),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch specialty episodes');
    }

    const data = await response.json();
    return data.episodes;
  },
};
