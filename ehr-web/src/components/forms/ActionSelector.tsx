'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RuleAction, ActionType, RuleType } from '@/types/forms';

interface ActionSelectorProps {
  actions: RuleAction[];
  ruleType: RuleType;
  onChange: (actions: RuleAction[]) => void;
}

// Action types based on rule type
const ACTION_TYPES_BY_RULE_TYPE: Record<RuleType, { value: ActionType; label: string }[]> = {
  validation: [
    { value: 'error', label: 'Show Error' },
    { value: 'warning', label: 'Show Warning' },
  ],
  visibility: [
    { value: 'show_hide', label: 'Show/Hide Field' },
    { value: 'enable_disable', label: 'Enable/Disable Field' },
  ],
  navigation: [
    { value: 'navigate_to', label: 'Navigate to Step' },
  ],
  calculation: [
    { value: 'set_value', label: 'Set Field Value' },
    { value: 'calculate', label: 'Calculate' },
  ],
};

export function ActionSelector({ actions, ruleType, onChange }: ActionSelectorProps) {
  const availableActionTypes = ACTION_TYPES_BY_RULE_TYPE[ruleType] || [];

  const addAction = () => {
    const defaultActionType = availableActionTypes[0]?.value || 'error';
    onChange([
      ...actions,
      {
        type: defaultActionType,
        message: '',
        value: '',
      },
    ]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: keyof RuleAction, value: any) => {
    const updated = actions.map((action, i) => {
      if (i === index) {
        return { ...action, [field]: value };
      }
      return action;
    });
    onChange(updated);
  };

  const renderActionFields = (action: RuleAction, index: number) => {
    switch (action.type) {
      case 'error':
      case 'warning':
        return (
          <Textarea
            value={action.message || ''}
            onChange={(e) => updateAction(index, 'message', e.target.value)}
            placeholder="Enter error/warning message..."
            className="text-xs min-h-[60px]"
          />
        );

      case 'show_hide':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={action.field || ''}
              onChange={(e) => updateAction(index, 'field', e.target.value)}
              placeholder="Field to show/hide"
              className="h-7 text-xs"
            />
            <Select
              value={action.value as string}
              onValueChange={(v) => updateAction(index, 'value', v)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Show</SelectItem>
                <SelectItem value="hide">Hide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'enable_disable':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={action.field || ''}
              onChange={(e) => updateAction(index, 'field', e.target.value)}
              placeholder="Field to enable/disable"
              className="h-7 text-xs"
            />
            <Select
              value={action.value as string}
              onValueChange={(v) => updateAction(index, 'value', v)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enable">Enable</SelectItem>
                <SelectItem value="disable">Disable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'set_value':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={action.field || ''}
              onChange={(e) => updateAction(index, 'field', e.target.value)}
              placeholder="Target field"
              className="h-7 text-xs"
            />
            <Input
              value={action.value as string}
              onChange={(e) => updateAction(index, 'value', e.target.value)}
              placeholder="Value (use {{field}} for variables)"
              className="h-7 text-xs"
            />
          </div>
        );

      case 'navigate_to':
        return (
          <Input
            type="number"
            value={action.targetStep || ''}
            onChange={(e) => updateAction(index, 'targetStep', parseInt(e.target.value) || 1)}
            placeholder="Step number to navigate to"
            className="h-7 text-xs"
            min={1}
          />
        );

      case 'calculate':
        return (
          <div className="space-y-2">
            <Input
              value={action.field || ''}
              onChange={(e) => updateAction(index, 'field', e.target.value)}
              placeholder="Target field for result"
              className="h-7 text-xs"
            />
            <Textarea
              value={action.expression || ''}
              onChange={(e) => updateAction(index, 'expression', e.target.value)}
              placeholder="Expression (e.g., {{age}} + 5, {{price}} * 1.1)"
              className="text-xs min-h-[60px] font-mono"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Action List */}
      {actions.length === 0 ? (
        <div className="text-center py-4 border border-dashed rounded bg-gray-50">
          <p className="text-xs text-gray-500">No actions added</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="p-2 bg-blue-50 rounded border space-y-2">
              <div className="flex items-center gap-2">
                {/* Action Type */}
                <Select
                  value={action.type}
                  onValueChange={(v) => updateAction(index, 'type', v as ActionType)}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAction(index)}
                  className="h-7 w-7 p-0 text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Action-specific fields */}
              {renderActionFields(action, index)}
            </div>
          ))}
        </div>
      )}

      {/* Add Action Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={addAction}
        className="w-full h-7 text-xs"
        disabled={availableActionTypes.length === 0}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Action
      </Button>
    </div>
  );
}
