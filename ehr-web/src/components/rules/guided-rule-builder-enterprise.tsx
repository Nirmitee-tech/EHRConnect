'use client';

import { useState } from 'react';
import { Plus, Trash2, Info, Sparkles, Clock, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CodeSearchInput } from './code-search-input';
import { TemporalOperatorBuilder } from './temporal-operator-builder';
import {
  FHIR_FIELDS_ENTERPRISE,
  FHIR_FIELD_CATEGORIES,
  getFieldByName,
  getCategoriesWithCounts,
  type FHIRFieldEnterprise,
} from './fhir-fields-enterprise.config';

interface GuidedRuleBuilderEnterpriseProps {
  value: any;
  onChange: (value: any) => void;
  availableFields?: FHIRFieldEnterprise[];
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  displayValue?: string; // For code display names
  temporalConfig?: any;
}

const operators = [
  { value: '=', label: 'equals' },
  { value: '!=', label: 'does not equal' },
  { value: '>', label: 'is greater than' },
  { value: '<', label: 'is less than' },
  { value: '>=', label: 'is at least' },
  { value: '<=', label: 'is at most' },
  { value: 'contains', label: 'contains' },
  { value: 'in', label: 'is one of' },
];

export function GuidedRuleBuilderEnterprise({
  value,
  onChange,
  availableFields = FHIR_FIELDS_ENTERPRISE,
}: GuidedRuleBuilderEnterpriseProps) {
  const [combinator, setCombinator] = useState<'and' | 'or'>(value?.combinator || 'and');
  const [conditions, setConditions] = useState<Condition[]>(
    value?.rules?.map((r: any, i: number) => ({
      id: `cond-${i}`,
      field: r.field || '',
      operator: r.operator || '=',
      value: r.value || '',
      displayValue: r.displayValue,
      temporalConfig: r.temporalConfig,
    })) || [{ id: 'cond-0', field: '', operator: '=', value: '' }]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [showFieldInfo, setShowFieldInfo] = useState<string | null>(null);
  const [openFieldPicker, setOpenFieldPicker] = useState<string | null>(null);

  const categoriesWithCounts = getCategoriesWithCounts();

  const updateConditions = (newConditions: Condition[]) => {
    setConditions(newConditions);
    onChange({
      combinator,
      rules: newConditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        displayValue: c.displayValue,
        temporalConfig: c.temporalConfig,
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
    if (conditions.length === 1) return;
    updateConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (
    id: string,
    updates: Partial<Condition>
  ) => {
    updateConditions(
      conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleCombinatorChange = (newCombinator: 'and' | 'or') => {
    setCombinator(newCombinator);
    onChange({
      combinator: newCombinator,
      rules: conditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        displayValue: c.displayValue,
        temporalConfig: c.temporalConfig,
      })),
    });
  };

  const filteredFields = selectedCategory && selectedCategory !== '__all__'
    ? availableFields.filter((f) => f.category === selectedCategory)
    : availableFields;

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-semibold mb-1">
              Enterprise Rule Builder
            </p>
            <p className="text-xs text-blue-800">
              Build clinical rules with 200+ FHIR fields, standardized codes (LOINC, SNOMED,
              RxNorm, ICD-10, CPT), and temporal operators. Supports all major healthcare data
              types.
            </p>
          </div>
        </div>
      </Card>

      {/* Combinator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-700 font-medium">When</span>
        <Select value={combinator} onValueChange={handleCombinatorChange}>
          <SelectTrigger className="w-24 h-8 text-sm font-bold bg-blue-50 border-blue-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and" className="font-bold">
              ALL
            </SelectItem>
            <SelectItem value="or" className="font-bold">
              ANY
            </SelectItem>
          </SelectContent>
        </Select>
        <span className="text-gray-700 font-medium">of these conditions are true:</span>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Filter by Category (optional)</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="All categories..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              <span className="font-medium">All Categories ({availableFields.length} fields)</span>
            </SelectItem>
            {categoriesWithCounts.map((cat) => (
              <SelectItem key={cat.key} value={cat.label}>
                {cat.label} <span className="text-gray-500">({cat.count})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        {conditions.map((condition, index) => {
          const fieldConfig = getFieldByName(condition.field);
          const isTemporal = fieldConfig?.type === 'temporal';
          const isAction = fieldConfig?.type === 'action';

          return (
            <Card
              key={condition.id}
              className={`p-3 border-2 ${
                isTemporal
                  ? 'border-purple-300 bg-purple-50/50'
                  : isAction
                  ? 'border-green-300 bg-green-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Step Number */}
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {index + 1}
                </div>

                <div className="flex-1 space-y-2">
                  {/* Field Selection with Search - Searchable Combobox */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Search className="h-3 w-3 text-blue-600" />
                      Field (Type to search {filteredFields.length} fields)
                    </label>
                    <div className="flex items-center gap-2">
                      <Popover
                        open={openFieldPicker === condition.id}
                        onOpenChange={(open) => setOpenFieldPicker(open ? condition.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openFieldPicker === condition.id}
                            className="flex-1 justify-between h-9 text-sm font-medium hover:bg-blue-50"
                          >
                            {condition.field ? (
                              <span className="flex items-center gap-2">
                                {getFieldByName(condition.field)?.label || condition.field}
                                {getFieldByName(condition.field)?.codeSystem && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {getFieldByName(condition.field)?.codeSystem?.system}
                                  </Badge>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500">Search fields...</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search by field name, category, or code system..."
                              className="h-9"
                            />
                            <CommandEmpty>
                              <div className="py-6 text-center text-sm">
                                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">No fields found.</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Try different search terms or change category filter
                                </p>
                              </div>
                            </CommandEmpty>
                            <CommandList className="max-h-[400px]">
                              {Object.entries(
                                filteredFields.reduce((acc, field) => {
                                  if (!acc[field.category]) {
                                    acc[field.category] = [];
                                  }
                                  acc[field.category].push(field);
                                  return acc;
                                }, {} as Record<string, FHIRFieldEnterprise[]>)
                              ).map(([category, fields]) => (
                                <CommandGroup key={category} heading={category}>
                                  {fields.map((field) => (
                                    <CommandItem
                                      key={field.name}
                                      value={`${field.name} ${field.label} ${field.category} ${field.codeSystem?.system || ''}`}
                                      onSelect={() => {
                                        updateCondition(condition.id, {
                                          field: field.name,
                                          operator: field.type === 'boolean' ? '=' : condition.operator,
                                          value: '',
                                        });
                                        setOpenFieldPicker(null);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          condition.field === field.name
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        }`}
                                      />
                                      <div className="flex-1 flex items-center justify-between">
                                        <span className="text-sm font-medium">{field.label}</span>
                                        <div className="flex items-center gap-1">
                                          {field.codeSystem && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                              {field.codeSystem.system}
                                            </Badge>
                                          )}
                                          {field.type === 'temporal' && (
                                            <Badge className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700">
                                              <Clock className="h-2.5 w-2.5 mr-0.5" />
                                              Temporal
                                            </Badge>
                                          )}
                                          {field.unit && (
                                            <span className="text-xs text-gray-500">
                                              {field.unit}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Field Info Tooltip */}
                      {fieldConfig?.tooltip && (
                        <button
                          onClick={() =>
                            setShowFieldInfo(
                              showFieldInfo === condition.field ? null : condition.field
                            )
                          }
                          className="flex-shrink-0 p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Tooltip Display */}
                    {showFieldInfo === condition.field && fieldConfig?.tooltip && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                        <div className="font-medium mb-0.5">About this field:</div>
                        <div>{fieldConfig.tooltip}</div>
                        {fieldConfig.description && (
                          <div className="mt-1 text-blue-700">{fieldConfig.description}</div>
                        )}
                        {fieldConfig.codeSystem && (
                          <div className="mt-1 pt-1 border-t border-blue-200">
                            <span className="font-medium">Code System:</span>{' '}
                            {fieldConfig.codeSystem.display}
                          </div>
                        )}
                        {fieldConfig.unit && (
                          <div className="mt-0.5">
                            <span className="font-medium">Unit:</span> {fieldConfig.unit}
                          </div>
                        )}
                        {fieldConfig.examples && fieldConfig.examples.length > 0 && (
                          <div className="mt-1">
                            <span className="font-medium">Examples:</span>{' '}
                            {fieldConfig.examples.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Temporal Operator Builder */}
                  {condition.field && isTemporal && (
                    <TemporalOperatorBuilder
                      value={
                        condition.temporalConfig || {
                          operator: 'COUNT',
                          field: '',
                          timeUnit: 'days',
                        }
                      }
                      onChange={(config) =>
                        updateCondition(condition.id, { temporalConfig: config })
                      }
                      availableFields={availableFields
                        .filter((f) => f.type !== 'temporal' && f.type !== 'action')
                        .map((f) => ({ name: f.name, label: f.label }))}
                    />
                  )}

                  {/* Regular Conditions (non-temporal, non-action) */}
                  {condition.field && !isTemporal && !isAction && (
                    <>
                      {/* Operator Selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Operator</label>
                        <Select
                          value={condition.operator}
                          onValueChange={(val) => updateCondition(condition.id, { operator: val })}
                        >
                          <SelectTrigger className="text-sm font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators
                              .filter((op) => {
                                // Filter operators based on field type
                                if (fieldConfig?.type === 'boolean') {
                                  return op.value === '=';
                                }
                                if (fieldConfig?.type === 'code' || fieldConfig?.type === 'string') {
                                  return ['=', '!=', 'contains', 'in'].includes(op.value);
                                }
                                return true;
                              })
                              .map((op) => (
                                <SelectItem key={op.value} value={op.value} className="text-sm">
                                  {op.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value Input */}
                      {condition.operator && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Value</label>

                          {/* Code Search Input */}
                          {fieldConfig?.inputType === 'code-search' && (
                            <CodeSearchInput
                              value={condition.value}
                              onChange={(val, display) =>
                                updateCondition(condition.id, {
                                  value: val,
                                  displayValue: display,
                                })
                              }
                              codeSystem={fieldConfig.codeSystem}
                              valueSet={fieldConfig.valueSet}
                            />
                          )}

                          {/* Dropdown Select */}
                          {fieldConfig?.inputType === 'select' && fieldConfig.valueSet && (
                            <Select
                              value={condition.value}
                              onValueChange={(val) => updateCondition(condition.id, { value: val })}
                            >
                              <SelectTrigger className="text-sm font-medium">
                                <SelectValue placeholder="Select value..." />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldConfig.valueSet.map((option) => (
                                  <SelectItem key={option.code} value={option.code} className="text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{option.display}</span>
                                      {option.definition && (
                                        <span className="text-xs text-gray-600">
                                          - {option.definition}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Boolean Input */}
                          {fieldConfig?.type === 'boolean' && (
                            <Select
                              value={condition.value}
                              onValueChange={(val) => updateCondition(condition.id, { value: val })}
                            >
                              <SelectTrigger className="text-sm font-medium">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {/* Date Input */}
                          {fieldConfig?.inputType === 'date' && (
                            <Input
                              type="date"
                              value={condition.value}
                              onChange={(e) =>
                                updateCondition(condition.id, { value: e.target.value })
                              }
                              className="text-sm font-medium"
                            />
                          )}

                          {/* Number Input */}
                          {fieldConfig?.inputType === 'number' && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(condition.id, { value: e.target.value })
                                }
                                placeholder={fieldConfig.examples?.[0] || 'Enter value...'}
                                className="flex-1 text-sm font-medium"
                              />
                              {fieldConfig.unit && (
                                <span className="text-sm text-gray-600 font-medium">
                                  {fieldConfig.unit}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Text Input */}
                          {fieldConfig?.inputType === 'text' &&
                            !fieldConfig.valueSet &&
                            fieldConfig.type !== 'boolean' && (
                              <Input
                                type="text"
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(condition.id, { value: e.target.value })
                                }
                                placeholder={
                                  fieldConfig.examples?.[0] || 'Enter value...'
                                }
                                className="text-sm font-medium"
                              />
                            )}

                          {/* Default fallback */}
                          {!fieldConfig?.inputType && fieldConfig?.type !== 'boolean' && (
                            <Input
                              type={fieldConfig?.type === 'number' ? 'number' : 'text'}
                              value={condition.value}
                              onChange={(e) =>
                                updateCondition(condition.id, { value: e.target.value })
                              }
                              placeholder="Enter value..."
                              className="text-sm font-medium"
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Remove Button */}
                {conditions.length > 1 && (
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Condition Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="w-full h-9 text-sm font-medium border-2 border-dashed border-blue-300 hover:bg-blue-50 hover:border-blue-400"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Condition
      </Button>

      {/* Preview */}
      <Card className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-300">
        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Rule Preview:
        </p>
        <div className="text-sm text-gray-800 leading-relaxed">
          {conditions.length === 0 && <span className="text-gray-500">No conditions defined</span>}
          {conditions.length > 0 && (
            <>
              <span className="font-medium">When </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">
                {combinator.toUpperCase()}
              </span>
              <span className="font-medium"> of:</span>
              <div className="mt-2 space-y-1">
                {conditions.map((c, i) => {
                  const field = getFieldByName(c.field);
                  const op = operators.find((o) => o.value === c.operator);
                  if (!field || !c.value) return null;
                  return (
                    <div key={c.id} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500">•</span>
                      <span>
                        <span className="font-semibold text-blue-700">{field.label}</span>{' '}
                        <span className="text-gray-600">{op?.label}</span>{' '}
                        <span className="font-semibold text-purple-700">
                          {c.displayValue || c.value}
                        </span>
                        {field.unit && (
                          <span className="text-gray-600 ml-1">{field.unit}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
