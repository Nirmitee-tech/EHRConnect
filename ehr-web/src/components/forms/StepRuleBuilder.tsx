'use client';

import React, { useState } from 'react';
import { Plus, Save, Trash2, Play, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  StepRule,
  RuleType,
  RuleCondition,
  RuleAction,
  CreateStepRuleRequest,
  RuleTestResult,
} from '@/types/forms';
import { ConditionEditor } from './ConditionEditor';
import { ActionSelector } from './ActionSelector';
import { TestPanel } from './TestPanel';

interface StepRuleBuilderProps {
  stepId: string;
  rules: StepRule[];
  onCreateRule: (ruleData: CreateStepRuleRequest) => Promise<void>;
  onUpdateRule: (ruleId: string, ruleData: Partial<StepRule>) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
  onTestRule: (ruleId: string, mockData: Record<string, any>) => Promise<RuleTestResult>;
}

export function StepRuleBuilder({
  stepId,
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onTestRule,
}: StepRuleBuilderProps) {
  const [editingRule, setEditingRule] = useState<StepRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);

  // New rule form state
  const [newRuleType, setNewRuleType] = useState<RuleType>('validation');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleEnabled, setNewRuleEnabled] = useState(true);
  const [newRuleConditions, setNewRuleConditions] = useState<RuleCondition[]>([]);
  const [newRuleActions, setNewRuleActions] = useState<RuleAction[]>([]);

  const toggleRuleExpanded = (ruleId: string) => {
    const newSet = new Set(expandedRules);
    if (newSet.has(ruleId)) {
      newSet.delete(ruleId);
    } else {
      newSet.add(ruleId);
    }
    setExpandedRules(newSet);
  };

  const handleCreateRule = async () => {
    if (!newRuleName.trim()) {
      alert('Please enter a rule name');
      return;
    }

    if (newRuleConditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }

    if (newRuleActions.length === 0) {
      alert('Please add at least one action');
      return;
    }

    try {
      await onCreateRule({
        type: newRuleType,
        name: newRuleName,
        description: newRuleDescription,
        enabled: newRuleEnabled,
        conditions: newRuleConditions,
        actions: newRuleActions,
      });

      // Reset form
      setNewRuleName('');
      setNewRuleDescription('');
      setNewRuleConditions([]);
      setNewRuleActions([]);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create rule:', error);
      alert('Failed to create rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await onDeleteRule(ruleId);
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert('Failed to delete rule');
    }
  };

  const getRuleTypeColor = (type: RuleType) => {
    switch (type) {
      case 'validation':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'visibility':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'navigation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'calculation':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Step Validation Rules</h3>
          <p className="text-sm text-gray-600">
            Define conditions and actions for this step
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Rule
        </Button>
      </div>

      {/* Existing Rules List */}
      <div className="space-y-2">
        {rules.length === 0 && !isCreating && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No rules defined yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Create rules to add validation, visibility control, or navigation logic
              </p>
            </CardContent>
          </Card>
        )}

        {rules.map((rule) => (
          <Card key={rule.id} className={`${rule.enabled ? '' : 'opacity-60'}`}>
            <CardHeader className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{rule.name}</CardTitle>
                    <Badge className={getRuleTypeColor(rule.type)}>{rule.type}</Badge>
                    {!rule.enabled && (
                      <Badge variant="outline" className="text-xs">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-xs text-gray-600 mt-1">{rule.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTestingRuleId(rule.id)}
                    className="h-7 px-2"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="h-7 px-2 text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleRuleExpanded(rule.id)}
                    className="h-7 px-2"
                  >
                    {expandedRules.has(rule.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedRules.has(rule.id) && (
              <CardContent className="p-3 pt-0 border-t space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Conditions ({rule.conditions.length})</Label>
                  <div className="mt-1 space-y-1">
                    {rule.conditions.map((condition, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-gray-50 p-2 rounded border font-mono"
                      >
                        {condition.field} {condition.operator} {JSON.stringify(condition.value)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Actions ({rule.actions.length})</Label>
                  <div className="mt-1 space-y-1">
                    {rule.actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-blue-50 p-2 rounded border"
                      >
                        <span className="font-semibold">{action.type}</span>
                        {action.message && `: ${action.message}`}
                        {action.field && ` (${action.field})`}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Create New Rule Form */}
      {isCreating && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Create New Rule</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Rule Type</Label>
                <Select value={newRuleType} onValueChange={(v) => setNewRuleType(v as RuleType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="visibility">Visibility</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="calculation">Calculation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Enabled</Label>
                  <div className="h-8 flex items-center">
                    <Switch checked={newRuleEnabled} onCheckedChange={setNewRuleEnabled} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs">Rule Name</Label>
              <Input
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g., Age must be 18 or older"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Description (Optional)</Label>
              <Textarea
                value={newRuleDescription}
                onChange={(e) => setNewRuleDescription(e.target.value)}
                placeholder="Describe what this rule does..."
                className="text-xs min-h-[60px]"
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Conditions</Label>
              <ConditionEditor
                conditions={newRuleConditions}
                onChange={setNewRuleConditions}
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Actions</Label>
              <ActionSelector
                actions={newRuleActions}
                ruleType={newRuleType}
                onChange={setNewRuleActions}
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateRule}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                Create Rule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewRuleName('');
                  setNewRuleDescription('');
                  setNewRuleConditions([]);
                  setNewRuleActions([]);
                }}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Panel */}
      {testingRuleId && (
        <TestPanel
          stepId={stepId}
          ruleId={testingRuleId}
          ruleName={rules.find((r) => r.id === testingRuleId)?.name || ''}
          onTest={onTestRule}
          onClose={() => setTestingRuleId(null)}
        />
      )}
    </div>
  );
}
