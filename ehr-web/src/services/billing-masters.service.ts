/**
 * Billing Masters Service
 * Frontend API client for billing master data
 */

import { AxiosHeaders } from 'axios';
import { apiClient } from './api';

type RequestHeaders = Record<string, string | undefined>;
type QueryParamValue = string | number | boolean | undefined | null;

export interface CPTCode {
  id: string;
  code: string;
  description: string;
  short_description?: string;
  category?: string;
  subcategory?: string;
  modifier_allowed: boolean;
  active: boolean;
  effective_date?: string;
  termination_date?: string;
  version?: string;
  rvu_work?: number;
  rvu_facility?: number;
  rvu_malpractice?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ICDCode {
  id: string;
  code: string;
  description: string;
  short_description?: string;
  category?: string;
  chapter?: string;
  icd_version: string;
  active: boolean;
  effective_date?: string;
  termination_date?: string;
  is_billable: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Modifier {
  id: string;
  code: string;
  description: string;
  modifier_type: 'CPT' | 'HCPCS' | 'ambulance' | 'anesthesia';
  active: boolean;
  effective_date?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Payer {
  id: string;
  name: string;
  payer_id?: string;
  payer_type: 'medicare' | 'medicaid' | 'commercial' | 'self_pay' | 'workers_comp' | 'tricare' | 'champva' | 'other';
  address?: any;
  contact_email?: string;
  contact_phone?: string;
  claim_submission_method?: 'electronic' | 'paper' | 'portal';
  timely_filing_days: number;
  requires_prior_auth: boolean;
  era_supported: boolean;
  edi_payer_id?: string;
  clearinghouse_id?: string;
  active: boolean;
  settings?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  org_id?: string;
  user_id?: string;
  npi: string;
  first_name?: string;
  last_name?: string;
  credentials?: string;
  taxonomy_code?: string;
  specialty?: string;
  license_number?: string;
  license_state?: string;
  dea_number?: string;
  address?: any;
  is_billing_provider: boolean;
  is_rendering_provider: boolean;
  is_referring_provider: boolean;
  active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface FeeSchedule {
  id: string;
  org_id: string;
  payer_id?: string;
  payer_name?: string;
  cpt_code: string;
  cpt_description?: string;
  modifier?: string;
  amount: number;
  facility_amount?: number;
  effective_from: string;
  effective_to?: string;
  active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: string;
  org_id: string;
  gateway_name: string;
  gateway_provider: 'stripe' | 'sepay' | 'square' | 'authorize_net';
  merchant_id?: string;
  is_active: boolean;
  is_default: boolean;
  supported_methods: string[];
  test_mode: boolean;
  configuration?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  overallReady: boolean;
  chartOfAccounts: {
    ready: boolean;
    count: number;
    systemAccountsReady: boolean;
    activeAccounts: number;
    missingRequired: string[];
  };
  cptCodes: { ready: boolean; count: number; recommended: number };
  icdCodes: { ready: boolean; count: number; recommended: number };
  payers: { ready: boolean; count: number; breakdown: any };
  feeSchedules: { ready: boolean; count: number; payersWithFees: number; cptCodesWithFees: number };
  costCenters: { ready: boolean; count: number; revenueGenerating: number };
  bankAccounts: { ready: boolean; count: number; hasDefault: boolean };
  paymentGateways: { ready: boolean; count: number; hasDefault: boolean; productionGateways: number };
  billingSettings: { ready: boolean; exists: boolean; hasClaimMDConfig: boolean };
  validatedAt: string;
}

export class BillingMastersService {
  private static buildHeaders(headers?: RequestHeaders) {
    if (!headers) {
      return undefined;
    }

    const filtered = Object.fromEntries(
      Object.entries(headers).filter(([, value]) => value !== undefined && value !== '')
    ) as Record<string, string>;

    return Object.keys(filtered).length > 0 ? filtered : undefined;
  }

  private static buildParams(params?: Record<string, QueryParamValue>) {
    if (!params) {
      return undefined;
    }

    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ) as Record<string, string | number | boolean>;

    return Object.keys(filtered).length > 0 ? filtered : undefined;
  }

  private static withHeaders(headers?: RequestHeaders) {
    const filtered = this.buildHeaders(headers);
    return filtered ? { headers: AxiosHeaders.from(filtered) } : {};
  }

  /**
   * CPT Codes
   */
  static async getCPTCodes(filters?: {
    search?: string;
    category?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/codes/cpt', {
      params: this.buildParams(filters),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async searchCPTCodes(query: string, limit: number = 20, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/codes/cpt/search', {
      params: this.buildParams({ q: query, limit }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async getCPTCodeByCode(code: string, headers?: RequestHeaders) {
    const response = await apiClient.get(`/billing/codes/cpt/${code}`, this.withHeaders(headers));
    return response.data;
  }

  static async bulkImportCPTCodes(codes: Partial<CPTCode>[], headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/codes/cpt/bulk', { codes }, this.withHeaders(headers));
    return response.data;
  }

  /**
   * ICD Codes
   */
  static async getICDCodes(filters?: {
    search?: string;
    category?: string;
    icd_version?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/codes/icd', {
      params: this.buildParams(filters),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async searchICDCodes(query: string, icd_version: string = 'ICD-10', limit: number = 20, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/codes/icd/search', {
      params: this.buildParams({ q: query, icd_version, limit }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async bulkImportICDCodes(codes: Partial<ICDCode>[], headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/codes/icd/bulk', { codes }, this.withHeaders(headers));
    return response.data;
  }

  /**
   * Modifiers
   */
  static async getModifiers(filters?: { modifier_type?: string; active?: boolean }, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/codes/modifiers', {
      params: this.buildParams(filters),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  /**
   * Payers
   */
  static async getPayers(filters?: {
    search?: string;
    payer_type?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/payers', {
      params: this.buildParams(filters),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async getPayerById(payerId: string, headers?: RequestHeaders) {
    const response = await apiClient.get(`/billing/payers/${payerId}`, this.withHeaders(headers));
    return response.data;
  }

  static async createPayer(data: Partial<Payer>, headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/payers', data, this.withHeaders(headers));
    return response.data;
  }

  static async updatePayer(payerId: string, data: Partial<Payer>, headers?: RequestHeaders) {
    const response = await apiClient.put(`/billing/payers/${payerId}`, data, this.withHeaders(headers));
    return response.data;
  }

  /**
   * Providers
   */
  static async getProviders(orgId: string, filters?: {
    search?: string;
    specialty?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/providers', {
      params: this.buildParams({ orgId, ...(filters || {}) }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async verifyNPI(npi: string, headers?: RequestHeaders) {
    const response = await apiClient.get(`/billing/providers/verify-npi/${npi}`, this.withHeaders(headers));
    return response.data;
  }

  static async createProvider(orgId: string, data: Partial<Provider>, headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/providers', { ...data, orgId }, this.withHeaders(headers));
    return response.data;
  }

  static async updateProvider(orgId: string, providerId: string, data: Partial<Provider>, headers?: RequestHeaders) {
    const response = await apiClient.put(`/billing/providers/${providerId}`, { ...data, orgId }, this.withHeaders(headers));
    return response.data;
  }

  /**
   * Fee Schedules
   */
  static async getFeeSchedules(orgId: string, filters?: {
    payer_id?: string;
    cpt_code?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/fee-schedules', {
      params: this.buildParams({ orgId, ...(filters || {}) }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async lookupFee(orgId: string, cptCode: string, payerId?: string, modifier?: string, date?: string, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/fee-schedules/lookup', {
      params: this.buildParams({ orgId, cpt: cptCode, payer: payerId, modifier, date }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async createFeeSchedule(orgId: string, data: Partial<FeeSchedule>, headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/fee-schedules', { ...data, orgId }, this.withHeaders(headers));
    return response.data;
  }

  static async bulkImportFeeSchedules(orgId: string, schedules: Partial<FeeSchedule>[], headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/fee-schedules/bulk', { orgId, schedules }, this.withHeaders(headers));
    return response.data;
  }

  /**
   * Payment Gateways
   */
  static async getPaymentGateways(orgId: string, includeInactive: boolean = false, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/payment-gateways', {
      params: this.buildParams({ orgId, includeInactive }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async createPaymentGateway(orgId: string, data: Partial<PaymentGateway>, headers?: RequestHeaders) {
    const response = await apiClient.post('/billing/payment-gateways', { ...data, orgId }, this.withHeaders(headers));
    return response.data;
  }

  static async updatePaymentGateway(orgId: string, gatewayId: string, data: Partial<PaymentGateway>, headers?: RequestHeaders) {
    const response = await apiClient.put(`/billing/payment-gateways/${gatewayId}`, { ...data, orgId }, this.withHeaders(headers));
    return response.data;
  }

  static async testPaymentGateway(orgId: string, gatewayId: string, headers?: RequestHeaders) {
    const response = await apiClient.post(`/billing/payment-gateways/${gatewayId}/test`, { orgId }, this.withHeaders(headers));
    return response.data;
  }

  static async setDefaultGateway(orgId: string, gatewayId: string, headers?: RequestHeaders) {
    const response = await apiClient.put(`/billing/payment-gateways/${gatewayId}/set-default`, { orgId }, this.withHeaders(headers));
    return response.data;
  }

  /**
   * Settings & Validation
   */
  static async getBillingSettings(orgId: string, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/settings', {
      params: this.buildParams({ orgId }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async updateBillingSettings(orgId: string, data: any, headers?: RequestHeaders) {
    const response = await apiClient.put('/billing/settings', { ...data, orgId }, this.withHeaders(headers));
    return response.data;
  }

  static async validateMasterData(orgId: string, headers?: RequestHeaders): Promise<ValidationResult> {
    const response = await apiClient.get('/billing/settings/validate', {
      params: this.buildParams({ orgId }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }

  static async getSetupProgress(orgId: string, headers?: RequestHeaders) {
    const response = await apiClient.get('/billing/settings/setup-progress', {
      params: this.buildParams({ orgId }),
      ...this.withHeaders(headers),
    });
    return response.data;
  }
}
