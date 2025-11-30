'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ruleService } from '@/services/rule.service';
import { RuleConditionBuilder } from '@/components/rules/rule-condition-builder-v2';
import { FHIR_FIELDS_ENTERPRISE } from '@/components/rules/fhir-fields-enterprise.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import {
  ArrowLeft,
  Save,
  Play,
  Menu,
  X,
  Activity,
  Zap,
  GitBranch,
  Target,
  FileText,
} from 'lucide-react';

const FIELD_CATEGORIES = [
  { icon: Activity, label: 'Patient Demographics', count: 9, color: 'text-blue-600 bg-blue-50' },
  { icon: Activity, label: 'Vital Signs & Observations', count: 10, color: 'text-green-600 bg-green-50' },
  { icon: FileText, label: 'Laboratory Results', count: 20, color: 'text-purple-600 bg-purple-50' },
  { icon: Target, label: 'Medications', count: 11, color: 'text-orange-600 bg-orange-50' },
  { icon: Zap, label: 'Conditions & Diagnoses', count: 5, color: 'text-red-600 bg-red-50' },
];

const ACTION_TYPES = [
  { id: 'task_assignment', label: 'Task', icon: '📋', desc: 'Create task' },
  { id: 'alert', label: 'Alert', icon: '🔔', desc: 'Send alert' },
  { id: 'cds_hook', label: 'CDS', icon: '💡', desc: 'CDS card' },
  { id: 'care_plan', label: 'Care Plan', icon: '📝', desc: 'Update plan' },
  { id: 'service_request', label: 'Order', icon: '🔬', desc: 'Create order' },
];

export default function CreateRulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ruleTypes, setRuleTypes] = useState<any[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'task_assignment',
    category: '',
    trigger_event: '',
    trigger_timing: 'immediate',
    conditions: { combinator: 'and', rules: [] },
    actions: {
      type: 'task_assignment',
      config: {},
    },
  });

  useEffect(() => {
    loadMetadata();
  }, [session]);

  const loadMetadata = async () => {
    try {
      const [typesRes, eventsRes, catsRes] = await Promise.all([
        ruleService.getRuleTypes().catch(() => ({
          data: [
            { id: 'task_assignment', label: 'Task Assignment' },
            { id: 'alert', label: 'Alert' },
            { id: 'cds_hook', label: 'CDS Hook' },
            { id: 'workflow_automation', label: 'Workflow' },
          ]
        })),
        ruleService.getTriggerEvents().catch(() => ({
          data: [
            { id: 'observation_created', label: 'Observation Created', description: 'New observation' },
            { id: 'appointment_scheduled', label: 'Appointment Scheduled', description: 'Appointment booked' },
            { id: 'patient_registered', label: 'Patient Registered', description: 'New patient' },
            { id: 'lab_result_received', label: 'Lab Result', description: 'Lab results' },
            { id: 'medication_prescribed', label: 'Medication Prescribed', description: 'Medication ordered' },
            { id: 'condition_diagnosed', label: 'Condition Diagnosed', description: 'Diagnosis made' },
          ]
        })),
        ruleService.getCategories().catch(() => ({
          data: [
            { id: 'clinical_care', label: 'Clinical Care' },
            { id: 'population_health', label: 'Population Health' },
            { id: 'quality_measures', label: 'Quality Measures' },
            { id: 'patient_safety', label: 'Patient Safety' },
          ]
        })),
      ]);

      setRuleTypes(typesRes.data || []);
      setTriggerEvents(eventsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err: any) {
      error('Failed to load metadata');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.trigger_event) {
      error('Name and trigger event are required');
      return;
    }

    try {
      setLoading(true);
      await ruleService.createRule(session, formData);
      success('Rule created successfully');
      router.push('/rules');
    } catch (err: any) {
      error(err.message || 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Collapsible */}
      <div
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'}
          transition-all duration-300 ease-in-out
          bg-white border-r border-gray-200 overflow-hidden
          lg:block
        `}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Quick Access
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              200+ FHIR fields • LOINC • SNOMED • RxNorm
            </p>
          </div>

          <div className="p-3 space-y-4">
            {/* Field Categories */}
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Field Categories
              </h4>
              <div className="space-y-1">
                {FIELD_CATEGORIES.map((category, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className={`p-1.5 rounded ${category.color}`}>
                      <category.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {category.label}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {category.count} fields
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logic Operators */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Logic Operators
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <GitBranch className="h-3.5 w-3.5 text-blue-600" />
                  <div>
                    <div className="text-xs font-medium text-gray-700">AND</div>
                    <div className="text-[10px] text-gray-500">All must be true</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                  <GitBranch className="h-3.5 w-3.5 text-purple-600" />
                  <div>
                    <div className="text-xs font-medium text-gray-700">OR</div>
                    <div className="text-[10px] text-gray-500">Any can be true</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Types */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Action Types
              </h4>
              <div className="space-y-1">
                {ACTION_TYPES.map((action) => (
                  <button
                    key={action.id}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        actions: { type: action.id, config: {} },
                      })
                    }
                    className={`
                      w-full flex items-center gap-2 p-2 rounded text-left transition-colors
                      ${formData.actions.type === action.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-base">{action.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{action.label}</div>
                      <div className="text-[10px] text-gray-500 truncate">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header - Compact & Responsive */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile menu button */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 hover:bg-gray-100 rounded"
              >
                <Menu className="h-4 w-4 text-gray-600" />
              </button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-7 text-xs px-2"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="hidden sm:block h-4 w-px bg-gray-300" />

            <Input
              placeholder="Rule name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-7 text-xs flex-1 min-w-[150px] max-w-[250px]"
            />

            <Select
              value={formData.trigger_event}
              onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
            >
              <SelectTrigger className="h-7 text-xs w-[140px] sm:w-[180px]">
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggerEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id} className="text-xs">
                    <div>
                      <div className="font-medium">{event.label}</div>
                      <div className="text-[10px] text-gray-500">{event.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="h-7 text-xs px-2 hidden sm:flex"
              >
                <Play className="h-3 w-3 mr-1" />
                Test
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.trigger_event}
                className="h-7 bg-blue-600 hover:bg-blue-700 text-xs px-3"
              >
                <Save className="h-3 w-3 mr-1" />
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>

          {/* Secondary row - Basic info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Select
              value={formData.rule_type}
              onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
            >
              <SelectTrigger className="h-6 text-xs w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ruleTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="h-6 text-xs w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.trigger_timing}
              onValueChange={(value) => setFormData({ ...formData, trigger_timing: value })}
            >
              <SelectTrigger className="h-6 text-xs w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate" className="text-xs">Immediate</SelectItem>
                <SelectItem value="scheduled" className="text-xs">Scheduled</SelectItem>
                <SelectItem value="on_demand" className="text-xs">On Demand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rules Editor - All 3 Modes with Full Features */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5" />
                  Conditions
                  <span className="text-[10px] font-normal text-gray-500">
                    • 200+ FHIR fields • All builder modes available
                  </span>
                </h3>
              </div>

              <div className="p-3">
                {/* Rule Condition Builder with ALL 3 modes */}
                <RuleConditionBuilder
                  value={formData.conditions}
                  onChange={(conditions) => setFormData({ ...formData, conditions })}
                />
              </div>
            </div>

            {/* Action Configuration - Compact */}
            {formData.actions.type && (
              <div className="mt-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" />
                    Then Action
                    <span className="text-[10px] font-normal text-gray-500">
                      • {ACTION_TYPES.find(a => a.id === formData.actions.type)?.label}
                    </span>
                  </h3>
                </div>

                <div className="p-3">
                  {formData.actions.type === 'task_assignment' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Task description (e.g., Review patient for elevated BP)"
                        value={(formData.actions.config as any).description || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { description: e.target.value },
                            },
                          })
                        }
                        className="h-8 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={(formData.actions.config as any).priority || 'routine'}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                config: { ...(formData.actions.config as any), priority: value },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine" className="text-xs">Routine</SelectItem>
                            <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                            <SelectItem value="stat" className="text-xs">STAT</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Due (hours)"
                          value={(formData.actions.config as any).due_hours || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                config: { ...(formData.actions.config as any), due_hours: e.target.value },
                              },
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {formData.actions.type === 'alert' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Alert title"
                        value={(formData.actions.config as any).title || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { title: e.target.value },
                            },
                          })
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Message"
                        value={(formData.actions.config as any).message || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { ...(formData.actions.config as any), message: e.target.value },
                            },
                          })
                        }
                        className="h-8 text-xs"
                      />
                      <Select
                        value={(formData.actions.config as any).severity || 'medium'}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { ...(formData.actions.config as any), severity: value },
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low" className="text-xs">Low</SelectItem>
                          <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                          <SelectItem value="high" className="text-xs">High</SelectItem>
                          <SelectItem value="critical" className="text-xs">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.actions.type === 'cds_hook' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="CDS card title"
                        value={(formData.actions.config as any).title || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { title: e.target.value },
                            },
                          })
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Summary"
                        value={(formData.actions.config as any).summary || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { ...(formData.actions.config as any), summary: e.target.value },
                            },
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
