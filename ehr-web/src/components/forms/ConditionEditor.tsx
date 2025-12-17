'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RuleCondition, RuleOperator, LogicOperator } from '@/types/forms';

interface ConditionEditorProps {
  conditions: RuleCondition[];
  onChange: (conditions: RuleCondition[]) => void;
}

const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'greater_or_equal', label: 'Greater or Equal' },
  { value: 'less_or_equal', label: 'Less or Equal' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
];

export function ConditionEditor({ conditions, onChange }: ConditionEditorProps) {
  const addCondition = () => {
    onChange([
      ...conditions,
      {
        field: '',
        operator: 'equals',
        value: '',
        logicOperator: conditions.length === 0 ? 'AND' : conditions[0]?.logicOperator || 'AND',
      },
    ]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof RuleCondition, value: any) => {
    const updated = conditions.map((cond, i) => {
      if (i === index) {
        return { ...cond, [field]: value };
      }
      return cond;
    });
    onChange(updated);
  };

  const updateLogicOperator = (operator: LogicOperator) => {
    // Update all conditions to use the same logic operator
    onChange(conditions.map((cond) => ({ ...cond, logicOperator: operator })));
  };

  return (
    <div className="space-y-2">
      {/* Logic Operator Toggle (only show if multiple conditions) */}
      {conditions.length > 1 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-600">Match:</span>
          <Select
            value={conditions[0]?.logicOperator || 'AND'}
            onValueChange={(v) => updateLogicOperator(v as LogicOperator)}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">All (AND)</SelectItem>
              <SelectItem value="OR">Any (OR)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-500">of the following conditions:</span>
        </div>
      )}

      {/* Condition List */}
      {conditions.length === 0 ? (
        <div className="text-center py-4 border border-dashed rounded bg-gray-50">
          <p className="text-xs text-gray-500">No conditions added</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              {/* Field */}
              <div className="flex-1">
                <Input
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  placeholder="Field path (e.g., patient.age)"
                  className="h-7 text-xs"
                />
              </div>

              {/* Operator */}
              <Select
                value={condition.operator}
                onValueChange={(v) => updateCondition(index, 'operator', v as RuleOperator)}
              >
                <SelectTrigger className="h-7 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value (hide for is_empty and is_not_empty) */}
              {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
                <div className="flex-1">
                  <Input
                    value={typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value)}
                    onChange={(e) => {
                      // Try to parse as JSON for arrays, otherwise use string
                      let value = e.target.value;
                      try {
                        if ((condition.operator === 'in' || condition.operator === 'not_in') && value.startsWith('[')) {
                          value = JSON.parse(value);
                        }
                      } catch {
                        // Keep as string if JSON parse fails
                      }
                      updateCondition(index, 'value', value);
                    }}
                    placeholder={
                      condition.operator === 'in' || condition.operator === 'not_in'
                        ? '["value1", "value2"]'
                        : 'Value'
                    }
                    className="h-7 text-xs"
                  />
                </div>
              )}

              {/* Remove Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeCondition(index)}
                className="h-7 w-7 p-0 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Condition Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={addCondition}
        className="w-full h-7 text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Condition
      </Button>
    </div>
  );
}
