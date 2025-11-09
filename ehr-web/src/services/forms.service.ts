/**
 * Forms API Service Client
 * Handles all API calls for the Forms/Questionnaire Builder module
 */

import { apiClient } from './api';
import type {
  FormTemplate,
  FormTemplateListResponse,
  FormTemplateDetailResponse,
  CreateFormTemplateRequest,
  UpdateFormTemplateRequest,
  PublishFormTemplateRequest,
  FormTheme,
  FormPopulationRule,
  FormExtractionRule,
  FHIRQuestionnaire,
  PopulateRequest,
  PopulateResponse,
  ExtractRequest,
  ExtractResponse,
} from '@/types/forms';

export const formsService = {
  // ============================================================================
  // Form Templates
  // ============================================================================

  /**
   * List form templates with filtering and pagination
   */
  async listTemplates(params?: {
    status?: string;
    category?: string;
    search?: string;
    specialty?: string;
    page?: number;
    pageSize?: number;
  }): Promise<FormTemplateListResponse> {
    const response = await apiClient.get('/forms/templates', { params });
    return response.data;
  },

  /**
   * Get form template by ID with full FHIR Questionnaire
   */
  async getTemplate(id: string): Promise<FormTemplateDetailResponse> {
    const response = await apiClient.get(`/forms/templates/${id}`);
    return response.data;
  },

  /**
   * Create new form template
   */
  async createTemplate(data: CreateFormTemplateRequest): Promise<FormTemplate> {
    const response = await apiClient.post('/forms/templates', data);
    return response.data;
  },

  /**
   * Update form template
   */
  async updateTemplate(id: string, data: UpdateFormTemplateRequest): Promise<FormTemplate> {
    const response = await apiClient.put(`/forms/templates/${id}`, data);
    return response.data;
  },

  /**
   * Publish form template
   */
  async publishTemplate(id: string, data?: PublishFormTemplateRequest): Promise<FormTemplate> {
    const response = await apiClient.post(`/forms/templates/${id}/publish`, data);
    return response.data;
  },

  /**
   * Archive form template
   */
  async archiveTemplate(id: string): Promise<FormTemplate> {
    const response = await apiClient.post(`/forms/templates/${id}/archive`);
    return response.data;
  },

  /**
   * Delete form template
   */
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/forms/templates/${id}`);
  },

  /**
   * Duplicate form template
   */
  async duplicateTemplate(id: string, title?: string): Promise<FormTemplate> {
    const response = await apiClient.post(`/forms/templates/${id}/duplicate`, { title });
    return response.data;
  },

  /**
   * Import FHIR Questionnaire JSON
   */
  async importQuestionnaire(data: {
    questionnaire: FHIRQuestionnaire;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }): Promise<FormTemplate> {
    const response = await apiClient.post('/forms/templates/import', data);
    return response.data;
  },

  /**
   * Export FHIR Questionnaire as JSON
   */
  async exportQuestionnaire(id: string): Promise<FHIRQuestionnaire> {
    const response = await apiClient.get(`/forms/templates/${id}/export`);
    return response.data;
  },

  /**
   * Export template (alias)
   */
  async exportTemplate(id: string): Promise<FHIRQuestionnaire> {
    return this.exportQuestionnaire(id);
  },

  // ============================================================================
  // Form Responses
  // ============================================================================

  /**
   * List form responses with filtering
   */
  async listResponses(params?: {
    patient_id?: string;
    encounter_id?: string;
    episode_id?: string;
    form_template_id?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ responses: any[]; total: number }> {
    const response = await apiClient.get('/forms/responses', { params });
    return response.data;
  },

  /**
   * Get form response by ID
   */
  async getResponse(id: string): Promise<any> {
    const response = await apiClient.get(`/forms/responses/${id}`);
    return response.data;
  },

  /**
   * Create/submit form response
   */
  async createResponse(data: {
    form_template_id: string;
    patient_id?: string;
    encounter_id?: string;
    episode_id?: string;
    response: any;
  }): Promise<any> {
    const response = await apiClient.post('/forms/responses', data);
    return response.data;
  },

  /**
   * Update form response (for in-progress forms)
   */
  async updateResponse(id: string, data: { response: any }): Promise<any> {
    const response = await apiClient.put(`/forms/responses/${id}`, data);
    return response.data;
  },

  // ============================================================================
  // Form Themes
  // ============================================================================

  /**
   * List available themes
   */
  async listThemes(): Promise<FormTheme[]> {
    const response = await apiClient.get('/forms/themes');
    return response.data.themes;
  },

  /**
   * Create custom theme
   */
  async createTheme(data: { name: string; config: FormTheme['config'] }): Promise<FormTheme> {
    const response = await apiClient.post('/forms/themes', data);
    return response.data;
  },

  // ============================================================================
  // Population Rules
  // ============================================================================

  /**
   * Get population rules for a template
   */
  async getPopulationRules(templateId: string): Promise<FormPopulationRule[]> {
    const response = await apiClient.get(`/forms/templates/${templateId}/population-rules`);
    return response.data.rules;
  },

  /**
   * Create population rule
   */
  async createPopulationRule(
    templateId: string,
    data: Omit<FormPopulationRule, 'id' | 'form_template_id' | 'created_at' | 'updated_at'>
  ): Promise<FormPopulationRule> {
    const response = await apiClient.post(`/forms/templates/${templateId}/population-rules`, data);
    return response.data;
  },

  // ============================================================================
  // Extraction Rules
  // ============================================================================

  /**
   * Get extraction rules for a template
   */
  async getExtractionRules(templateId: string): Promise<FormExtractionRule[]> {
    const response = await apiClient.get(`/forms/templates/${templateId}/extraction-rules`);
    return response.data.rules;
  },

  /**
   * Create extraction rule
   */
  async createExtractionRule(
    templateId: string,
    data: Omit<FormExtractionRule, 'id' | 'form_template_id' | 'created_at' | 'updated_at'>
  ): Promise<FormExtractionRule> {
    const response = await apiClient.post(`/forms/templates/${templateId}/extraction-rules`, data);
    return response.data;
  },

  // ============================================================================
  // SDC Operations
  // ============================================================================

  /**
   * Populate questionnaire with patient data ($populate operation)
   */
  async populateQuestionnaire(data: PopulateRequest): Promise<PopulateResponse> {
    const response = await apiClient.post('/forms/$populate', data);
    return response.data;
  },

  /**
   * Extract structured data from questionnaire response ($extract operation)
   */
  async extractFromResponse(data: ExtractRequest): Promise<ExtractResponse> {
    const response = await apiClient.post('/forms/$extract', data);
    return response.data;
  },
};
