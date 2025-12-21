/**
 * Pediatrics Service
 * Frontend service for pediatric API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class PediatricsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/patients`;
  }

  // Demographics
  async saveDemographics(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/demographics`, data);
    return response.data;
  }

  async getDemographics(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/demographics`);
    return response.data;
  }

  // Growth Records
  async saveGrowthRecord(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/growth`, data);
    return response.data;
  }

  async getGrowthRecords(patientId: string, params?: any) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/growth`, { params });
    return response.data;
  }

  async calculateGrowthPercentiles(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/growth/percentiles`);
    return response.data;
  }

  // Vital Signs
  async saveVitalSigns(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/vitals`, data);
    return response.data;
  }

  async getVitalSigns(patientId: string, params?: any) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/vitals`, { params });
    return response.data;
  }

  // Well Visits
  async saveWellVisit(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/well-visits`, data);
    return response.data;
  }

  async getWellVisits(patientId: string, episodeId?: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/well-visits`, {
      params: { episodeId }
    });
    return response.data;
  }

  async getWellVisitSchedule(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/well-visits/schedule`);
    return response.data;
  }

  // Immunizations
  async saveImmunization(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/immunizations`, data);
    return response.data;
  }

  async getImmunizations(patientId: string, episodeId?: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/immunizations`, {
      params: { episodeId }
    });
    return response.data;
  }

  async getImmunizationSchedule(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/immunizations/schedule`);
    return response.data;
  }

  async generateCatchUpSchedule(patientId: string) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/immunizations/catch-up`);
    return response.data;
  }

  // Developmental Screening
  async saveDevelopmentalScreening(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/developmental-screening`, data);
    return response.data;
  }

  async getDevelopmentalScreenings(patientId: string, episodeId?: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/developmental-screening`, {
      params: { episodeId }
    });
    return response.data;
  }

  // Newborn Screening
  async saveNewbornScreening(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/newborn-screening`, data);
    return response.data;
  }

  async getNewbornScreenings(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/newborn-screening`);
    return response.data;
  }

  // HEADSS Assessment
  async saveHEADSSAssessment(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/headss`, data);
    return response.data;
  }

  async getHEADSSAssessments(patientId: string, episodeId?: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/headss`, {
      params: { episodeId }
    });
    return response.data;
  }

  // Lead Screening
  async saveLeadScreening(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/lead-screening`, data);
    return response.data;
  }

  async getLeadScreenings(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/lead-screening`);
    return response.data;
  }

  // Autism Screening
  async saveAutismScreening(patientId: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${patientId}/pediatrics/autism-screening`, data);
    return response.data;
  }

  async getAutismScreenings(patientId: string) {
    const response = await axios.get(`${this.baseURL}/${patientId}/pediatrics/autism-screening`);
    return response.data;
  }
}

// Export singleton instance
export const pediatricsService = new PediatricsService();
