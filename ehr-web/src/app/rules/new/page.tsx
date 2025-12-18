'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ruleService } from '@/services/rule.service';
import { RuleConditionBuilder } from '@/components/rules/rule-condition-builder-v2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Check, TestTube2, Save } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

// Action type configurations
const ACTION_TYPES = [
  { id: 'task_assignment', label: 'Task Assignment', icon: '📋', desc: 'Create a task for care team' },
  { id: 'alert', label: 'Alert', icon: '🔔', desc: 'Send notification/alert' },
  { id: 'cds_hook', label: 'CDS Hook', icon: '💡', desc: 'Clinical decision support card' },
  { id: 'care_plan', label: 'Care Plan', icon: '📝', desc: 'Update care plan' },
  { id: 'service_request', label: 'Service Order', icon: '🔬', desc: 'Order lab/imaging' },
  { id: 'medication_request', label: 'Medication', icon: '💊', desc: 'Prescribe medication' },
  { id: 'referral', label: 'Referral', icon: '👨‍⚕️', desc: 'Refer to specialist' },
  { id: 'communication', label: 'Communication', icon: '💬', desc: 'Send message' },
];

export default function CreateRulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [ruleTypes, setRuleTypes] = useState<any[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'task_assignment',
    category: '',
    description: '',
    active: true,
    priority: 0,
    trigger_event: '',
    trigger_timing: 'immediate',
    conditions: { combinator: 'and', rules: [] },
    actions: {
      type: 'task_assignment',
      config: {},
    },
  });

  // Tab completion status
  const [tabsCompleted, setTabsCompleted] = useState({
    basic: false,
    trigger: false,
    conditions: false,
    actions: false,
  });

  useEffect(() => {
    loadMetadata();
  }, [session]);

  useEffect(() => {
    // Update tab completion status
    setTabsCompleted({
      basic: !!(formData.name && formData.rule_type),
      trigger: !!formData.trigger_event,
      conditions: !!(formData.conditions?.rules && formData.conditions.rules.length > 0),
      actions: !!(formData.actions?.type && formData.actions?.config),
    });
  }, [formData]);

  const loadMetadata = async () => {
    try {
      const [typesRes, eventsRes, catsRes] = await Promise.all([
        ruleService.getRuleTypes().catch(() => ({
          data: [
            { id: 'task_assignment', label: 'Task Assignment', description: 'Assign tasks to care team' },
            { id: 'alert', label: 'Alert', description: 'Send alerts and notifications' },
            { id: 'cds_hook', label: 'CDS Hook', description: 'Clinical decision support' },
            { id: 'notification', label: 'Notification', description: 'System notifications' },
            { id: 'workflow_automation', label: 'Workflow Automation', description: 'Automate workflows' },
          ]
        })),
        ruleService.getTriggerEvents().catch(() => ({
          data: [
            { id: 'observation_created', label: 'Observation Created', description: 'When a new observation is recorded' },
            { id: 'appointment_scheduled', label: 'Appointment Scheduled', description: 'When an appointment is booked' },
            { id: 'patient_registered', label: 'Patient Registered', description: 'When a new patient registers' },
            { id: 'lab_result_received', label: 'Lab Result Received', description: 'When lab results arrive' },
            { id: 'medication_prescribed', label: 'Medication Prescribed', description: 'When medication is ordered' },
            { id: 'condition_diagnosed', label: 'Condition Diagnosed', description: 'When a condition is diagnosed' },
            { id: 'encounter_completed', label: 'Encounter Completed', description: 'When visit is completed' },
          ]
        })),
        ruleService.getCategories().catch(() => ({
          data: [
            { id: 'clinical_care', label: 'Clinical Care' },
            { id: 'population_health', label: 'Population Health' },
            { id: 'quality_measures', label: 'Quality Measures' },
            { id: 'patient_safety', label: 'Patient Safety' },
            { id: 'chronic_disease', label: 'Chronic Disease Management' },
            { id: 'preventive_care', label: 'Preventive Care' },
            { id: 'medication_safety', label: 'Medication Safety' },
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
    // Validate all tabs
    if (!tabsCompleted.basic) {
      error('Please complete the Basic Information tab');
      setActiveTab('basic');
      return;
    }
    if (!tabsCompleted.trigger) {
      error('Please complete the Trigger tab');
      setActiveTab('trigger');
      return;
    }
    if (!tabsCompleted.conditions) {
      error('Please add at least one condition');
      setActiveTab('conditions');
      return;
    }
    if (!tabsCompleted.actions) {
      error('Please configure the action');
      setActiveTab('actions');
      return;
    }

    try {
      setLoading(true);
      await ruleService.createRule(session, formData as any);
      success('Rule created successfully');
      router.push('/rules');
    } catch (err: any) {
      error(err.message || 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  const allTabsComplete = Object.values(tabsCompleted).every(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-9"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Rule</h1>
              <p className="text-sm text-gray-600">Define clinical automation rule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!allTabsComplete}
              className="h-9"
            >
              <TestTube2 className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading || !allTabsComplete}
              className="h-9 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Rule'}
            </Button>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger
              value="basic"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2">
                {tabsCompleted.basic && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <span>Basic</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="trigger"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2">
                {tabsCompleted.trigger && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <span>Trigger</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="conditions"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2">
                {tabsCompleted.conditions && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <span>Conditions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-2">
                {tabsCompleted.actions && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <span>Actions</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Rule name, type, and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., Elevated BP Alert"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-type">Type *</Label>
                    <Select
                      value={formData.rule_type}
                      onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
                    >
                      <SelectTrigger id="rule-type" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              {type.description && (
                                <div className="text-xs text-gray-500">{type.description}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category" className="h-10">
                        <SelectValue placeholder="Select category..." />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this rule does..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor="active" className="cursor-pointer">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="priority">Priority:</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setActiveTab('trigger')}
                    disabled={!formData.name || !formData.rule_type}
                  >
                    Next: Trigger
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Trigger */}
          <TabsContent value="trigger">
            <Card>
              <CardHeader>
                <CardTitle>Trigger Event</CardTitle>
                <CardDescription>When should this rule execute?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger-event">Event *</Label>
                  <Select
                    value={formData.trigger_event}
                    onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
                  >
                    <SelectTrigger id="trigger-event" className="h-10">
                      <SelectValue placeholder="Select trigger event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div>
                            <div className="font-medium">{event.label}</div>
                            {event.description && (
                              <div className="text-xs text-gray-500">{event.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timing">Timing</Label>
                  <Select
                    value={formData.trigger_timing}
                    onValueChange={(value) => setFormData({ ...formData, trigger_timing: value })}
                  >
                    <SelectTrigger id="timing" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="on_demand">On Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab('basic')}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setActiveTab('conditions')}
                    disabled={!formData.trigger_event}
                  >
                    Next: Conditions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Conditions */}
          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
                <CardDescription>
                  200+ FHIR fields • LOINC • SNOMED • RxNorm • ICD-10 • CPT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RuleConditionBuilder
                  value={formData.conditions}
                  onChange={(conditions) => setFormData({ ...formData, conditions })}
                />

                <div className="flex justify-between pt-6 mt-6 border-t">
                  <Button variant="outline" onClick={() => setActiveTab('trigger')}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setActiveTab('actions')}
                    disabled={!formData.conditions?.rules || formData.conditions.rules.length === 0}
                  >
                    Next: Actions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Actions */}
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>What happens when conditions are met?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Action Type Selection */}
                <div className="space-y-3">
                  <Label>Action Type *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                          p-3 rounded-lg border-2 text-left transition-all
                          ${formData.actions.type === action.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="text-2xl mb-1">{action.icon}</div>
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{action.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Configuration */}
                {formData.actions.type === 'task_assignment' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Task Description *</Label>
                      <Textarea
                        placeholder="e.g., Review patient for elevated blood pressure"
                        value={(formData.actions.config as any).description || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { ...(formData.actions.config as any), description: e.target.value },
                            },
                          })
                        }
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Priority</Label>
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
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="stat">STAT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due (hours)</Label>
                        <Input
                          type="number"
                          placeholder="24"
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
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.actions.type === 'alert' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Alert Title *</Label>
                      <Input
                        placeholder="e.g., High Blood Pressure Detected"
                        value={(formData.actions.config as any).title || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { ...(formData.actions.config as any), title: e.target.value },
                            },
                          })
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Alert message..."
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
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
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
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {formData.actions.type === 'cds_hook' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Card Title *</Label>
                      <Input
                        placeholder="CDS card title"
                        value={(formData.actions.config as any).title || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              config: { ...(formData.actions.config as any), title: e.target.value },
                            },
                          })
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Summary</Label>
                      <Textarea
                        placeholder="Clinical decision support summary..."
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
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab('conditions')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !allTabsComplete}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Rule'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
