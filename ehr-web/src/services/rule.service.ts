import { Session } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RuleVariable {
  id: string;
  org_id: string;
  name: string;
  variable_key: string;
  description?: string;
  category?: string;
  computation_type: 'aggregate' | 'formula' | 'lookup' | 'time_based' | 'custom';
  data_source: string;
  aggregate_function?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'last' | 'first';
  aggregate_field?: string;
  aggregate_filters?: Record<string, any>;
  time_window_hours?: number;
  formula?: string;
  lookup_table?: string;
  lookup_key?: string;
  lookup_value?: string;
  result_type: 'number' | 'string' | 'boolean' | 'date';
  unit?: string;
  cache_duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
}

export interface Rule {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  rule_type: 'task_assignment' | 'alert' | 'cds_hook' | 'medication_assignment' | 'reminder' | 'notification' | 'workflow_automation';
  category?: string;
  is_active: boolean;
  priority: number;
  trigger_event: string;
  trigger_timing: 'immediate' | 'scheduled' | 'on_demand';
  conditions: any;
  conditions_json_logic?: any;
  used_variables?: string[];
  actions: any;
  config?: Record<string, any>;
  execution_count: number;
  last_executed_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
}

export interface RuleExecution {
  id: string;
  rule_id: string;
  trigger_event: string;
  trigger_data: any;
  patient_id?: string;
  user_id?: string;
  computed_variables?: Record<string, any>;
  conditions_met: boolean;
  conditions_result?: any;
  actions_performed?: string[];
  actions_success: boolean;
  result_data?: any;
  error_message?: string;
  stack_trace?: string;
  executed_at: string;
  execution_time_ms: number;
  debug_info?: any;
  triggered_by_name?: string;
}

// Rule Variables API
export const ruleVariableService = {
  async getVariables(
    session: Session | null,
    filters?: {
      category?: string;
      computation_type?: string;
      is_active?: boolean;
    }
  ): Promise<{ success: boolean; data: RuleVariable[] }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.computation_type) params.append('computation_type', filters.computation_type);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

    const response = await fetch(
      `${API_URL}/api/rule-variables?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'x-org-id': session?.orgId || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch variables');
    }

    return response.json();
  },

  async getVariable(session: Session | null, id: string): Promise<{ success: boolean; data: RuleVariable }> {
    const response = await fetch(`${API_URL}/api/rule-variables/${id}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch variable');
    }

    return response.json();
  },

  async createVariable(
    session: Session | null,
    variable: Partial<RuleVariable>
  ): Promise<{ success: boolean; data: RuleVariable }> {
    const response = await fetch(`${API_URL}/api/rule-variables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
        'x-user-id': session?.userId || '',
      },
      body: JSON.stringify(variable),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create variable');
    }

    return response.json();
  },

  async updateVariable(
    session: Session | null,
    id: string,
    variable: Partial<RuleVariable>
  ): Promise<{ success: boolean; data: RuleVariable }> {
    const response = await fetch(`${API_URL}/api/rule-variables/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
      body: JSON.stringify(variable),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update variable');
    }

    return response.json();
  },

  async deleteVariable(session: Session | null, id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/rule-variables/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete variable');
    }

    return response.json();
  },

  async testVariable(
    session: Session | null,
    id: string,
    patient_id?: string
  ): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${API_URL}/api/rule-variables/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
      body: JSON.stringify({ patient_id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to test variable');
    }

    return response.json();
  },

  async getCategories(): Promise<{ success: boolean; data: Array<{ id: string; label: string }> }> {
    const response = await fetch(`${API_URL}/api/rule-variables/categories/list`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getAggregateFunctions(): Promise<{ success: boolean; data: Array<{ id: string; label: string; description: string }> }> {
    const response = await fetch(`${API_URL}/api/rule-variables/aggregate-functions/list`);
    if (!response.ok) throw new Error('Failed to fetch aggregate functions');
    return response.json();
  },
};

// Rules API
export const ruleService = {
  async getRules(
    session: Session | null,
    filters?: {
      rule_type?: string;
      category?: string;
      is_active?: boolean;
      trigger_event?: string;
    }
  ): Promise<{ success: boolean; data: Rule[] }> {
    const params = new URLSearchParams();
    if (filters?.rule_type) params.append('rule_type', filters.rule_type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.trigger_event) params.append('trigger_event', filters.trigger_event);

    const response = await fetch(
      `${API_URL}/api/rules?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'x-org-id': session?.orgId || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rules');
    }

    return response.json();
  },

  async getRule(session: Session | null, id: string): Promise<{ success: boolean; data: Rule }> {
    const response = await fetch(`${API_URL}/api/rules/${id}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rule');
    }

    return response.json();
  },

  async createRule(
    session: Session | null,
    rule: Partial<Rule>
  ): Promise<{ success: boolean; data: Rule }> {
    const response = await fetch(`${API_URL}/api/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
        'x-user-id': session?.userId || '',
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create rule');
    }

    return response.json();
  },

  async updateRule(
    session: Session | null,
    id: string,
    rule: Partial<Rule>
  ): Promise<{ success: boolean; data: Rule }> {
    const response = await fetch(`${API_URL}/api/rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
      body: JSON.stringify(rule),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update rule');
    }

    return response.json();
  },

  async deleteRule(session: Session | null, id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/rules/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete rule');
    }

    return response.json();
  },

  async testRule(
    session: Session | null,
    id: string,
    event_data: any,
    patient_id?: string
  ): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${API_URL}/api/rules/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`,
        'x-org-id': session?.orgId || '',
        'x-user-id': session?.userId || '',
      },
      body: JSON.stringify({ event_data, patient_id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to test rule');
    }

    return response.json();
  },

  async getRuleExecutions(
    session: Session | null,
    ruleId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; data: RuleExecution[]; pagination: any }> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const response = await fetch(
      `${API_URL}/api/rules/${ruleId}/executions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'x-org-id': session?.orgId || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rule executions');
    }

    return response.json();
  },

  async getRuleTypes(): Promise<{ success: boolean; data: Array<{ id: string; label: string; description: string; icon: string }> }> {
    const response = await fetch(`${API_URL}/api/rules/types/list`);
    if (!response.ok) throw new Error('Failed to fetch rule types');
    return response.json();
  },

  async getTriggerEvents(): Promise<{ success: boolean; data: Array<{ id: string; label: string; description: string; availableFields: string[] }> }> {
    const response = await fetch(`${API_URL}/api/rules/events/list`);
    if (!response.ok) throw new Error('Failed to fetch trigger events');
    return response.json();
  },

  async getCategories(): Promise<{ success: boolean; data: Array<{ id: string; label: string }> }> {
    const response = await fetch(`${API_URL}/api/rules/categories/list`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
};
