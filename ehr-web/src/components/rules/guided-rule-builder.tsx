'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GuidedRuleBuilderProps {
  value: any;
  onChange: (value: any) => void;
  availableFields?: Array<{ name: string; label: string; type?: string }>;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const operators = [
  { value: '=', label: 'equals' },
  { value: '!=', label: 'does not equal' },
  { value: '>', label: 'is greater than' },
  { value: '<', label: 'is less than' },
  { value: '>=', label: 'is at least' },
  { value: '<=', label: 'is at most' },
  { value: 'contains', label: 'contains' },
];

export function GuidedRuleBuilder({ value, onChange, availableFields = [] }: GuidedRuleBuilderProps) {
  const [combinator, setCombinator] = useState<'and' | 'or'>(value?.combinator || 'and');
  const [conditions, setConditions] = useState<Condition[]>(
    value?.rules?.map((r: any, i: number) => ({
      id: `cond-${i}`,
      field: r.field || '',
      operator: r.operator || '=',
      value: r.value || '',
    })) || [
      { id: 'cond-0', field: '', operator: '=', value: '' },
    ]
  );

  const updateConditions = (newConditions: Condition[]) => {
    setConditions(newConditions);
    onChange({
      combinator,
      rules: newConditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
      })),
    });
  };

  const addCondition = () => {
    updateConditions([
      ...conditions,
      { id: `cond-${Date.now()}`, field: '', operator: '=', value: '' },
    ]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length === 1) return; // Keep at least one
    updateConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    updateConditions(conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleCombinatorChange = (newCombinator: 'and' | 'or') => {
    setCombinator(newCombinator);
    onChange({
      combinator: newCombinator,
      rules: conditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
      })),
    });
  };

  return (
    <div className="space-y-2">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
        <p className="text-xs text-blue-800 font-medium">
          Build your rule step-by-step. Add conditions that must be met for this rule to execute.
        </p>
      </div>

      {/* Combinator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-600 font-medium">When</span>
        <Select value={combinator} onValueChange={handleCombinatorChange}>
          <SelectTrigger className="w-20 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">ALL</SelectItem>
            <SelectItem value="or">ANY</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-gray-600 font-medium">of these conditions are true:</span>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {conditions.map((condition, index) => {
          const selectedField = availableFields.find((f) => f.name === condition.field);
          const fieldType = selectedField?.type || 'text';

          return (
            <div key={condition.id} className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 space-y-2">
                  {/* Field Selection */}
                  <div className="flex items-center gap-2 text-xs">
                    <Select
                      value={condition.field}
                      onValueChange={(val) => updateCondition(condition.id, 'field', val)}
                    >
                      <SelectTrigger className="flex-1 h-7 text-xs">
                        <SelectValue placeholder="Select a field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator Selection */}
                  {condition.field && (
                    <div className="flex items-center gap-2 text-xs">
                      <Select
                        value={condition.operator}
                        onValueChange={(val) => updateCondition(condition.id, 'operator', val)}
                      >
                        <SelectTrigger className="flex-1 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Value Input */}
                  {condition.field && condition.operator && (
                    <div className="flex items-center gap-2 text-xs">
                      <Input
                        type={fieldType === 'number' ? 'number' : 'text'}
                        placeholder="Enter value..."
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  )}
                </div>

                {conditions.length > 1 && (
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Condition Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="w-full h-7 text-xs"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Another Condition
      </Button>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
        <p className="text-xs font-medium text-gray-700 mb-1">Rule Preview:</p>
        <p className="text-xs text-gray-600">
          {conditions.length === 0 && 'No conditions defined'}
          {conditions.length > 0 && (
            <>
              When{' '}
              <span className="font-medium text-blue-600">
                {combinator.toUpperCase()}
              </span>{' '}
              of: {conditions.map((c, i) => {
                const field = availableFields.find((f) => f.name === c.field);
                const op = operators.find((o) => o.value === c.operator);
                if (!field || !c.value) return null;
                return (
                  <span key={c.id}>
                    {i > 0 && ` ${combinator} `}
                    <span className="font-medium">{field.label}</span> {op?.label}{' '}
                    <span className="font-medium">{c.value}</span>
                  </span>
                );
              })}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
