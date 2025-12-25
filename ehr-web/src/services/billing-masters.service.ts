/**
 * Billing Masters Service
 * Frontend API client for billing master data
 */

import { apiClient } from './api';

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
  /**
   * CPT Codes
   */
  static async getCPTCodes(filters?: {
    search?: string;
    category?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams(filters as any);
    const response = await apiClient.get(`/billing/codes/cpt?${params}`);
    return response.data;
  }

  static async searchCPTCodes(query: string, limit: number = 20) {
    const response = await apiClient.get(`/billing/codes/cpt/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }

  static async getCPTCodeByCode(code: string) {
    const response = await apiClient.get(`/billing/codes/cpt/${code}`);
    return response.data;
  }

  static async bulkImportCPTCodes(codes: Partial<CPTCode>[]) {
    const response = await apiClient.post('/billing/codes/cpt/bulk', { codes });
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
  }) {
    const params = new URLSearchParams(filters as any);
    const response = await apiClient.get(`/billing/codes/icd?${params}`);
    return response.data;
  }

  static async searchICDCodes(query: string, icd_version: string = 'ICD-10', limit: number = 20) {
    const response = await apiClient.get(`/billing/codes/icd/search?q=${encodeURIComponent(query)}&icd_version=${icd_version}&limit=${limit}`);
    return response.data;
  }

  static async bulkImportICDCodes(codes: Partial<ICDCode>[]) {
    const response = await apiClient.post('/billing/codes/icd/bulk', { codes });
    return response.data;
  }

  /**
   * Modifiers
   */
  static async getModifiers(filters?: { modifier_type?: string; active?: boolean }) {
    const params = new URLSearchParams(filters as any);
    const response = await apiClient.get(`/billing/codes/modifiers?${params}`);
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
  }) {
    const params = new URLSearchParams(filters as any);
    const response = await apiClient.get(`/billing/payers?${params}`);
    return response.data;
  }

  static async getPayerById(payerId: string) {
    const response = await apiClient.get(`/billing/payers/${payerId}`);
    return response.data;
  }

  static async createPayer(data: Partial<Payer>) {
    const response = await apiClient.post('/billing/payers', data);
    return response.data;
  }

  static async updatePayer(payerId: string, data: Partial<Payer>) {
    const response = await apiClient.put(`/billing/payers/${payerId}`, data);
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
  }) {
    const params = new URLSearchParams({ orgId, ...filters as any });
    const response = await apiClient.get(`/billing/providers?${params}`);
    return response.data;
  }

  static async verifyNPI(npi: string) {
    const response = await apiClient.get(`/billing/providers/verify-npi/${npi}`);
    return response.data;
  }

  static async createProvider(orgId: string, data: Partial<Provider>) {
    const response = await apiClient.post('/billing/providers', { ...data, orgId });
    return response.data;
  }

  static async updateProvider(orgId: string, providerId: string, data: Partial<Provider>) {
    const response = await apiClient.put(`/billing/providers/${providerId}`, { ...data, orgId });
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
  }) {
    const params = new URLSearchParams({ orgId, ...filters as any });
    const response = await apiClient.get(`/billing/fee-schedules?${params}`);
    return response.data;
  }

  static async lookupFee(orgId: string, cptCode: string, payerId?: string, modifier?: string, date?: string) {
    const params = new URLSearchParams({ orgId, cpt: cptCode });
    if (payerId) params.append('payer', payerId);
    if (modifier) params.append('modifier', modifier);
    if (date) params.append('date', date);
    
    const response = await apiClient.get(`/billing/fee-schedules/lookup?${params}`);
    return response.data;
  }

  static async createFeeSchedule(orgId: string, data: Partial<FeeSchedule>) {
    const response = await apiClient.post('/billing/fee-schedules', { ...data, orgId });
    return response.data;
  }

  static async bulkImportFeeSchedules(orgId: string, schedules: Partial<FeeSchedule>[]) {
    const response = await apiClient.post('/billing/fee-schedules/bulk', { orgId, schedules });
    return response.data;
  }

  /**
   * Payment Gateways
   */
  static async getPaymentGateways(orgId: string, includeInactive: boolean = false) {
    const response = await apiClient.get(`/billing/payment-gateways?orgId=${orgId}&includeInactive=${includeInactive}`);
    return response.data;
  }

  static async createPaymentGateway(orgId: string, data: Partial<PaymentGateway>) {
    const response = await apiClient.post('/billing/payment-gateways', { ...data, orgId });
    return response.data;
  }

  static async updatePaymentGateway(orgId: string, gatewayId: string, data: Partial<PaymentGateway>) {
    const response = await apiClient.put(`/billing/payment-gateways/${gatewayId}`, { ...data, orgId });
    return response.data;
  }

  static async testPaymentGateway(orgId: string, gatewayId: string) {
    const response = await apiClient.post(`/billing/payment-gateways/${gatewayId}/test`, { orgId });
    return response.data;
  }

  static async setDefaultGateway(orgId: string, gatewayId: string) {
    const response = await apiClient.put(`/billing/payment-gateways/${gatewayId}/set-default`, { orgId });
    return response.data;
  }

  /**
   * Settings & Validation
   */
  static async getBillingSettings(orgId: string) {
    const response = await apiClient.get(`/billing/settings?orgId=${orgId}`);
    return response.data;
  }

  static async updateBillingSettings(orgId: string, data: any) {
    const response = await apiClient.put('/billing/settings', { ...data, orgId });
    return response.data;
  }

  static async validateMasterData(orgId: string): Promise<ValidationResult> {
    const response = await apiClient.get(`/billing/settings/validate?orgId=${orgId}`);
    return response.data;
  }

  static async getSetupProgress(orgId: string) {
    const response = await apiClient.get(`/billing/settings/setup-progress?orgId=${orgId}`);
    return response.data;
  }
}
