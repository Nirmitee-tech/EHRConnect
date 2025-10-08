/**
 * Billing Service
 * Frontend service for interacting with billing APIs
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface EligibilityRequest {
  patientId: string;
  payerId: string;
  memberID: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  serviceDate?: string;
  serviceType?: string;
}

interface PriorAuthRequest {
  patientId: string;
  encounterId?: string;
  payerId: string;
  providerNPI: string;
  cptCodes: string[];
  icdCodes: string[];
  units?: number;
  serviceLocation?: string;
  notes?: string;
}

interface ClaimData {
  patientId: string;
  encounterId?: string;
  payerId: string;
  locationId?: string;
  authId?: string;
  authNumber?: string;
  claimType: 'professional' | 'institutional';
  billingProviderNpi: string;
  renderingProviderNpi?: string;
  serviceLocationNpi?: string;
  subscriberMemberId: string;
  patientAccountNumber?: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  totalCharge: number;
  lines: ClaimLine[];
}

interface ClaimLine {
  serviceDate: string;
  placeOfService?: string;
  cptCode: string;
  modifiers?: string[];
  icdCodes: string[];
  units: number;
  chargeAmount: number;
  renderingProviderNpi?: string;
}

export class BillingService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE}/api/billing`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      const orgId = localStorage.getItem('selected_org_id');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (orgId) {
        config.headers['x-org-id'] = orgId;
      }

      return config;
    });
  }

  // =====================================================
  // ELIGIBILITY
  // =====================================================

  async checkEligibility(data: EligibilityRequest) {
    const response = await this.api.post('/eligibility/check', data);
    return response.data;
  }

  async getEligibilityHistory(patientId: string, limit = 10) {
    const response = await this.api.get(`/eligibility/history/${patientId}`, {
      params: { limit },
    });
    return response.data;
  }

  // =====================================================
  // PRIOR AUTHORIZATION
  // =====================================================

  async submitPriorAuthorization(data: PriorAuthRequest) {
    const response = await this.api.post('/prior-auth/submit', data);
    return response.data;
  }

  async getPriorAuthorizations(filters?: {
    patientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.api.get('/prior-auth', { params: filters });
    return response.data;
  }

  async getPriorAuthDetail(id: string) {
    const response = await this.api.get(`/prior-auth/${id}`);
    return response.data;
  }

  async checkPriorAuthStatus(authNumber: string) {
    const response = await this.api.get(`/prior-auth/${authNumber}/status`);
    return response.data;
  }

  // =====================================================
  // CLAIMS
  // =====================================================

  async createClaim(data: ClaimData) {
    const response = await this.api.post('/claims', data);
    return response.data;
  }

  async getClaims(filters?: {
    patientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.api.get('/claims', { params: filters });
    return response.data;
  }

  async getClaimDetail(id: string) {
    const response = await this.api.get(`/claims/${id}`);
    return response.data;
  }

  async updateClaim(id: string, data: Partial<ClaimData>) {
    const response = await this.api.put(`/claims/${id}`, data);
    return response.data;
  }

  async validateClaim(id: string) {
    const response = await this.api.post(`/claims/${id}/validate`);
    return response.data;
  }

  async submitClaim(id: string) {
    const response = await this.api.post(`/claims/${id}/submit`);
    return response.data;
  }

  async checkClaimStatus(claimMdId: string) {
    const response = await this.api.get(`/claims/${claimMdId}/status`);
    return response.data;
  }

  // =====================================================
  // REMITTANCE (ERA)
  // =====================================================

  async getRemittances(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.api.get('/remittance', { params: filters });
    return response.data;
  }

  async getRemittanceDetail(id: string) {
    const response = await this.api.get(`/remittance/${id}`);
    return response.data;
  }

  async postRemittance(id: string) {
    const response = await this.api.post(`/remittance/${id}/post`);
    return response.data;
  }

  async fetchRemittanceFiles(startDate: string, endDate: string) {
    const response = await this.api.post('/remittance/fetch', {
      startDate,
      endDate,
    });
    return response.data;
  }

  // =====================================================
  // BILLING MASTERS
  // =====================================================

  async getCPTCodes(search = '', limit = 100) {
    const response = await this.api.get('/masters/cpt-codes', {
      params: { search, limit },
    });
    return response.data;
  }

  async getICDCodes(search = '', limit = 100) {
    const response = await this.api.get('/masters/icd-codes', {
      params: { search, limit },
    });
    return response.data;
  }

  async getPayers() {
    const response = await this.api.get('/masters/payers');
    return response.data;
  }

  async createPayer(data: any) {
    const response = await this.api.post('/masters/payers', data);
    return response.data;
  }

  async updatePayer(id: string, data: any) {
    const response = await this.api.put(`/masters/payers/${id}`, data);
    return response.data;
  }

  async deletePayer(id: string) {
    const response = await this.api.delete(`/masters/payers/${id}`);
    return response.data;
  }

  async getModifiers() {
    const response = await this.api.get('/masters/modifiers');
    return response.data;
  }

  async getFeeSchedule(cptCode: string, payerId?: string) {
    const response = await this.api.get('/masters/fee-schedule', {
      params: { cptCode, payerId },
    });
    return response.data;
  }

  // =====================================================
  // PROVIDERS
  // =====================================================

  async getProviders(params?: {
    search?: string;
    specialty?: string;
    state?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.api.get('/masters/providers', {
      params,
    });
    return response.data;
  }

  async getProviderById(id: string) {
    const response = await this.api.get(`/masters/providers/${id}`);
    return response.data;
  }

  async createProvider(data: any) {
    const response = await this.api.post('/masters/providers', data);
    return response.data;
  }

  async updateProvider(id: string, data: any) {
    const response = await this.api.put(`/masters/providers/${id}`, data);
    return response.data;
  }

  async deleteProvider(id: string) {
    const response = await this.api.delete(`/masters/providers/${id}`);
    return response.data;
  }

  // =====================================================
  // DASHBOARD & REPORTS
  // =====================================================

  async getDashboardKPIs(startDate?: string, endDate?: string) {
    const response = await this.api.get('/dashboard/kpis', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getRevenueReport(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) {
    const response = await this.api.get('/reports/revenue', {
      params: { startDate, endDate, groupBy },
    });
    return response.data;
  }

  async getDenialsReport(startDate: string, endDate: string) {
    const response = await this.api.get('/reports/denials', {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export default new BillingService();
