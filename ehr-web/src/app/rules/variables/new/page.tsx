'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ruleVariableService } from '@/services/rule.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function CreateVariablePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [aggregateFunctions, setAggregateFunctions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    variable_key: '',
    description: '',
    category: '',
    computation_type: 'aggregate' as 'aggregate' | 'formula' | 'lookup' | 'time_based' | 'custom',
    data_source: '',
    aggregate_function: 'avg',
    aggregate_field: '',
    aggregate_filters: {},
    time_window_hours: 24,
    formula: '',
    lookup_table: '',
    lookup_key: '',
    lookup_value: '',
    result_type: 'number' as 'number' | 'string' | 'boolean' | 'date',
    unit: '',
    cache_duration_minutes: 5,
    is_active: true,
  });

  useEffect(() => {
    loadMetadata();
  }, [session]);

  const loadMetadata = async () => {
    try {
      const [catsRes, funcsRes] = await Promise.all([
        ruleVariableService.getCategories(),
        ruleVariableService.getAggregateFunctions(),
      ]);

      setCategories(catsRes.data);
      setAggregateFunctions(funcsRes.data);
    } catch (err: any) {
      error('Failed to load metadata');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.variable_key || !formData.data_source) {
      error('Name, variable key, and data source are required');
      return;
    }

    // Validate variable key format (lowercase, alphanumeric, underscores only)
    if (!/^[a-z0-9_]+$/.test(formData.variable_key)) {
      error('Variable key must be lowercase alphanumeric with underscores only');
      return;
    }

    try {
      setLoading(true);

      await ruleVariableService.createVariable(session, formData);

      success('Variable created successfully');

      router.push('/rules/variables');
    } catch (err: any) {
      error(err.message || 'Failed to create variable');
    } finally {
      setLoading(false);
    }
  };

  const generateVariableKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      variable_key: formData.variable_key || generateVariableKey(name),
    });
  };

  const getComputationFields = () => {
    switch (formData.computation_type) {
      case 'aggregate':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_source">
                  Data Source <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.data_source}
                  onValueChange={(value) => setFormData({ ...formData, data_source: value })}
                >
                  <SelectTrigger id="data_source">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observations">Observations (Vital Signs)</SelectItem>
                    <SelectItem value="medications">Medications</SelectItem>
                    <SelectItem value="lab_results">Lab Results</SelectItem>
                    <SelectItem value="conditions">Conditions</SelectItem>
                    <SelectItem value="procedures">Procedures</SelectItem>
                    <SelectItem value="appointments">Appointments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aggregate_function">
                  Aggregate Function <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.aggregate_function}
                  onValueChange={(value) => setFormData({ ...formData, aggregate_function: value })}
                >
                  <SelectTrigger id="aggregate_function">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aggregateFunctions.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        <div>
                          <div className="font-medium">{func.label}</div>
                          <div className="text-xs text-gray-500">{func.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="aggregate_field">
                Field to Aggregate <span className="text-red-500">*</span>
              </Label>
              <Input
                id="aggregate_field"
                placeholder="value_quantity_value"
                value={formData.aggregate_field}
                onChange={(e) => setFormData({ ...formData, aggregate_field: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Database column to aggregate (e.g., value_quantity_value for observations)
              </p>
            </div>

            <div>
              <Label htmlFor="time_window_hours">Time Window (hours)</Label>
              <Input
                id="time_window_hours"
                type="number"
                placeholder="24"
                value={formData.time_window_hours}
                onChange={(e) =>
                  setFormData({ ...formData, time_window_hours: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500 mt-1">How far back to look for data</p>
            </div>

            <div>
              <Label htmlFor="aggregate_filters">Filters (JSON)</Label>
              <Textarea
                id="aggregate_filters"
                placeholder={'{\n  "code_coding_code": "8480-6",\n  "status": "final"\n}'}
                value={JSON.stringify(formData.aggregate_filters, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, aggregate_filters: JSON.parse(e.target.value) });
                  } catch {}
                }}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Filter conditions for the aggregate query
              </p>
            </div>
          </div>
        );

      case 'formula':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="formula">
                Formula <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="formula"
                placeholder="({{var.bp_systolic}} + 2 * {{var.bp_diastolic}}) / 3"
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{var.variable_key}}'} to reference other variables
              </p>
            </div>
          </div>
        );

      case 'lookup':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="lookup_table">
                Lookup Table <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lookup_table"
                placeholder="patient_risk_assessments"
                value={formData.lookup_table}
                onChange={(e) => setFormData({ ...formData, lookup_table: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lookup_key">
                  Key Field <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lookup_key"
                  placeholder="patient_id"
                  value={formData.lookup_key}
                  onChange={(e) => setFormData({ ...formData, lookup_key: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="lookup_value">
                  Value Field <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lookup_value"
                  placeholder="risk_score"
                  value={formData.lookup_value}
                  onChange={(e) => setFormData({ ...formData, lookup_value: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
            Select a computation type to configure the variable
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Variable</h1>
          <p className="text-sm text-gray-600 mt-1">Define computed variables for your rules</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Name and describe your variable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                Variable Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Average Systolic BP (24h)"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="variable_key">
                Variable Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="variable_key"
                placeholder="avg_bp_systolic_24h"
                value={formData.variable_key}
                onChange={(e) => setFormData({ ...formData, variable_key: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use in rules as {'{{var.' + (formData.variable_key || 'variable_key') + '}}'}
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Average systolic blood pressure over the last 24 hours"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="computation_type">
                  Computation Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.computation_type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, computation_type: value })
                  }
                >
                  <SelectTrigger id="computation_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aggregate">Aggregate (Sum, Avg, Count, etc.)</SelectItem>
                    <SelectItem value="formula">Formula (Calculate from other variables)</SelectItem>
                    <SelectItem value="lookup">Lookup (Database lookup)</SelectItem>
                    <SelectItem value="time_based">Time-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Computation Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Computation Configuration</CardTitle>
            <CardDescription>How should this variable be computed?</CardDescription>
          </CardHeader>
          <CardContent>{getComputationFields()}</CardContent>
        </Card>

        {/* Result Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Result Configuration</CardTitle>
            <CardDescription>Configure the result type and caching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="result_type">Result Type</Label>
                <Select
                  value={formData.result_type}
                  onValueChange={(value: any) => setFormData({ ...formData, result_type: value })}
                >
                  <SelectTrigger id="result_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="mmHg"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="cache_duration_minutes">Cache (minutes)</Label>
                <Input
                  id="cache_duration_minutes"
                  type="number"
                  placeholder="5"
                  value={formData.cache_duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, cache_duration_minutes: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Variable'}
          </Button>
        </div>
      </form>
    </div>
  );
}
