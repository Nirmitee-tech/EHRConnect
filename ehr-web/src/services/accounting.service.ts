/**
 * Accounting Service
 * Frontend API client for accounting master data
 */

import { apiClient } from './api';

export interface ChartOfAccount {
  id: string;
  org_id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'contra_asset';
  account_subtype?: string;
  parent_account_id?: string;
  normal_balance: 'debit' | 'credit';
  description?: string;
  is_system: boolean;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CostCenter {
  id: string;
  org_id: string;
  cost_center_code: string;
  cost_center_name: string;
  cost_center_type: 'revenue_generating' | 'administrative' | 'support';
  department_id?: string;
  department_name?: string;
  parent_cost_center_id?: string;
  budget_amount?: number;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  org_id: string;
  account_name: string;
  account_number_last4?: string;
  bank_name: string;
  routing_number?: string;
  account_type?: 'checking' | 'savings' | 'payroll' | 'merchant';
  gl_account_id?: string;
  gl_account_code?: string;
  gl_account_name?: string;
  current_balance: number;
  is_active: boolean;
  is_default: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export class AccountingService {
  /**
   * Chart of Accounts
   */
  static async getChartOfAccounts(orgId: string, filters?: {
    account_type?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams({ orgId, ...filters as any });
    const response = await apiClient.get(`/accounting/chart-of-accounts?${params}`);
    return response.data;
  }

  static async getAccountById(orgId: string, accountId: string) {
    const response = await apiClient.get(`/accounting/chart-of-accounts/${accountId}?orgId=${orgId}`);
    return response.data;
  }

  static async createAccount(orgId: string, data: Partial<ChartOfAccount>) {
    const response = await apiClient.post('/accounting/chart-of-accounts', { ...data, orgId });
    return response.data;
  }

  static async updateAccount(orgId: string, accountId: string, data: Partial<ChartOfAccount>) {
    const response = await apiClient.put(`/accounting/chart-of-accounts/${accountId}`, { ...data, orgId });
    return response.data;
  }

  static async deleteAccount(orgId: string, accountId: string) {
    const response = await apiClient.delete(`/accounting/chart-of-accounts/${accountId}?orgId=${orgId}`);
    return response.data;
  }

  /**
   * Cost Centers
   */
  static async getCostCenters(orgId: string, filters?: {
    cost_center_type?: string;
    department_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams({ orgId, ...filters as any });
    const response = await apiClient.get(`/accounting/cost-centers?${params}`);
    return response.data;
  }

  static async createCostCenter(orgId: string, data: Partial<CostCenter>) {
    const response = await apiClient.post('/accounting/cost-centers', { ...data, orgId });
    return response.data;
  }

  static async updateCostCenter(orgId: string, costCenterId: string, data: Partial<CostCenter>) {
    const response = await apiClient.put(`/accounting/cost-centers/${costCenterId}`, { ...data, orgId });
    return response.data;
  }

  /**
   * Bank Accounts
   */
  static async getBankAccounts(orgId: string, is_active: boolean = true) {
    const response = await apiClient.get(`/accounting/bank-accounts?orgId=${orgId}&is_active=${is_active}`);
    return response.data;
  }

  static async createBankAccount(orgId: string, data: Partial<BankAccount>) {
    const response = await apiClient.post('/accounting/bank-accounts', { ...data, orgId });
    return response.data;
  }

  static async setDefaultBankAccount(orgId: string, bankAccountId: string) {
    const response = await apiClient.put(`/accounting/bank-accounts/${bankAccountId}/set-default`, { orgId });
    return response.data;
  }
}
