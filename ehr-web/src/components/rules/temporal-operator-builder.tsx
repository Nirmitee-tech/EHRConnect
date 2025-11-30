'use client';

import { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, Calendar, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemporalOperatorConfig {
  operator: 'COUNT' | 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'FIRST' | 'LAST' | 'TREND_UP' | 'TREND_DOWN' | 'TIME_SINCE' | 'DURATION';
  field: string;
  timeWindow?: string;
  timeUnit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  timeValue?: number;
  condition?: string;
}

interface TemporalOperatorBuilderProps {
  value: TemporalOperatorConfig;
  onChange: (value: TemporalOperatorConfig) => void;
  availableFields: Array<{ name: string; label: string }>;
}

const TEMPORAL_OPERATORS = [
  {
    value: 'COUNT',
    label: 'COUNT',
    description: 'Count occurrences within time window',
    icon: Calendar,
    example: 'COUNT(BP > 140, last_30_days) >= 3',
    requiresTimeWindow: true,
    requiresCondition: true,
  },
  {
    value: 'AVG',
    label: 'AVG',
    description: 'Average value over time period',
    icon: TrendingUp,
    example: 'AVG(glucose, last_7_days) > 180',
    requiresTimeWindow: true,
    requiresCondition: false,
  },
  {
    value: 'SUM',
    label: 'SUM',
    description: 'Sum values over time period',
    icon: TrendingUp,
    example: 'SUM(medication.dosage, last_month)',
    requiresTimeWindow: true,
    requiresCondition: false,
  },
  {
    value: 'MIN',
    label: 'MIN',
    description: 'Minimum value in time period',
    icon: TrendingDown,
    example: 'MIN(eGFR, last_6_months) < 60',
    requiresTimeWindow: true,
    requiresCondition: false,
  },
  {
    value: 'MAX',
    label: 'MAX',
    description: 'Maximum value in time period',
    icon: TrendingUp,
    example: 'MAX(BP_systolic, last_24_hours) > 160',
    requiresTimeWindow: true,
    requiresCondition: false,
  },
  {
    value: 'FIRST',
    label: 'FIRST',
    description: 'First/earliest recorded value',
    icon: Calendar,
    example: 'FIRST(A1c)',
    requiresTimeWindow: false,
    requiresCondition: false,
  },
  {
    value: 'LAST',
    label: 'LAST',
    description: 'Last/most recent recorded value',
    icon: Calendar,
    example: 'LAST(creatinine) > 1.5',
    requiresTimeWindow: false,
    requiresCondition: false,
  },
  {
    value: 'TREND_UP',
    label: 'TREND_UP',
    description: 'Value is trending upward',
    icon: TrendingUp,
    example: 'TREND_UP(creatinine, last_3_months)',
    requiresTimeWindow: true,
    requiresCondition: false,
  },
  {
    value: 'TREND_DOWN',
    label: 'TREND_DOWN',
    description: 'Value is trending downward',
    icon: TrendingDown,
    example: 'TREND_DOWN(eGFR, last_6_months)',
    requiresTimeWindow: true,
    requiresCondition: false,
  },
  {
    value: 'TIME_SINCE',
    label: 'TIME_SINCE',
    description: 'Time elapsed since last event',
    icon: Clock,
    example: 'TIME_SINCE(encounter.class = AMB) > 365 days',
    requiresTimeWindow: false,
    requiresCondition: true,
  },
  {
    value: 'DURATION',
    label: 'DURATION',
    description: 'Duration of a condition or state',
    icon: Clock,
    example: 'DURATION(condition.status = active) > 90 days',
    requiresTimeWindow: false,
    requiresCondition: true,
  },
];

export function TemporalOperatorBuilder({
  value,
  onChange,
  availableFields,
}: TemporalOperatorBuilderProps) {
  const [showInfo, setShowInfo] = useState(false);

  const selectedOperator = TEMPORAL_OPERATORS.find((op) => op.value === value.operator);

  const updateConfig = (updates: Partial<TemporalOperatorConfig>) => {
    onChange({ ...value, ...updates });
  };

  const Icon = selectedOperator?.icon || Clock;

  return (
    <Card className="p-3 space-y-3 border-2 border-purple-200 bg-purple-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">Temporal Operator</span>
          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
            Advanced
          </Badge>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-purple-600 hover:text-purple-800"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-purple-100 border border-purple-200 rounded p-2 text-xs text-purple-800">
          <div className="font-medium mb-1">About Temporal Operators</div>
          <p>
            Temporal operators allow you to analyze data over time windows, calculate trends, and
            track changes. These are essential for chronic disease management, quality measures,
            and population health.
          </p>
          {selectedOperator && (
            <div className="mt-2 p-2 bg-white rounded border border-purple-200">
              <div className="font-medium text-purple-900">{selectedOperator.label}</div>
              <div className="text-purple-700 mt-0.5">{selectedOperator.description}</div>
              <div className="mt-1 font-mono text-purple-600 text-xs">
                Example: {selectedOperator.example}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operator Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Temporal Operator</label>
        <Select
          value={value.operator}
          onValueChange={(val) =>
            updateConfig({
              operator: val as TemporalOperatorConfig['operator'],
            })
          }
        >
          <SelectTrigger className="text-sm font-medium">
            <SelectValue placeholder="Select operator..." />
          </SelectTrigger>
          <SelectContent>
            <div className="p-1">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">Aggregations</div>
              {['COUNT', 'AVG', 'SUM', 'MIN', 'MAX'].map((op) => {
                const config = TEMPORAL_OPERATORS.find((o) => o.value === op);
                return (
                  <SelectItem key={op} value={op} className="text-sm">
                    <div className="flex items-center gap-2">
                      {config?.icon && <config.icon className="h-3.5 w-3.5 text-gray-500" />}
                      <span className="font-mono font-semibold">{op}</span>
                      <span className="text-xs text-gray-600">- {config?.description}</span>
                    </div>
                  </SelectItem>
                );
              })}

              <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">
                First/Last Values
              </div>
              {['FIRST', 'LAST'].map((op) => {
                const config = TEMPORAL_OPERATORS.find((o) => o.value === op);
                return (
                  <SelectItem key={op} value={op} className="text-sm">
                    <div className="flex items-center gap-2">
                      {config?.icon && <config.icon className="h-3.5 w-3.5 text-gray-500" />}
                      <span className="font-mono font-semibold">{op}</span>
                      <span className="text-xs text-gray-600">- {config?.description}</span>
                    </div>
                  </SelectItem>
                );
              })}

              <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">Trends</div>
              {['TREND_UP', 'TREND_DOWN'].map((op) => {
                const config = TEMPORAL_OPERATORS.find((o) => o.value === op);
                return (
                  <SelectItem key={op} value={op} className="text-sm">
                    <div className="flex items-center gap-2">
                      {config?.icon && <config.icon className="h-3.5 w-3.5 text-gray-500" />}
                      <span className="font-mono font-semibold">{op}</span>
                      <span className="text-xs text-gray-600">- {config?.description}</span>
                    </div>
                  </SelectItem>
                );
              })}

              <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">Time-Based</div>
              {['TIME_SINCE', 'DURATION'].map((op) => {
                const config = TEMPORAL_OPERATORS.find((o) => o.value === op);
                return (
                  <SelectItem key={op} value={op} className="text-sm">
                    <div className="flex items-center gap-2">
                      {config?.icon && <config.icon className="h-3.5 w-3.5 text-gray-500" />}
                      <span className="font-mono font-semibold">{op}</span>
                      <span className="text-xs text-gray-600">- {config?.description}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Field Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Field to Analyze</label>
        <Select value={value.field} onValueChange={(val) => updateConfig({ field: val })}>
          <SelectTrigger className="text-sm font-medium">
            <SelectValue placeholder="Select field..." />
          </SelectTrigger>
          <SelectContent>
            {availableFields.map((field) => (
              <SelectItem key={field.name} value={field.name} className="text-sm">
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Window (if required) */}
      {selectedOperator?.requiresTimeWindow && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Time Window</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value.timeValue || ''}
              onChange={(e) =>
                updateConfig({ timeValue: parseInt(e.target.value) || undefined })
              }
              placeholder="Value"
              className="flex-1 text-sm font-medium"
              min="1"
            />
            <Select
              value={value.timeUnit || 'days'}
              onValueChange={(val) =>
                updateConfig({ timeUnit: val as TemporalOperatorConfig['timeUnit'] })
              }
            >
              <SelectTrigger className="w-32 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-gray-600">
            Example: "7 days" = last 7 days, "3 months" = last 3 months
          </div>
        </div>
      )}

      {/* Condition (if required) */}
      {selectedOperator?.requiresCondition && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Condition (optional)</label>
          <Input
            value={value.condition || ''}
            onChange={(e) => updateConfig({ condition: e.target.value })}
            placeholder="e.g., > 140 or = 'active'"
            className="text-sm font-medium"
          />
          <div className="text-xs text-gray-600">
            Add a condition to filter which records to count/analyze
          </div>
        </div>
      )}

      {/* Preview */}
      {value.operator && value.field && (
        <div className="bg-white border-2 border-purple-300 rounded p-2">
          <div className="text-xs font-medium text-purple-900 mb-1">Formula Preview:</div>
          <div className="font-mono text-sm text-purple-700 font-bold">
            {value.operator}(
            {value.field}
            {value.condition && ` ${value.condition}`}
            {value.timeValue && value.timeUnit && `, last_${value.timeValue}_${value.timeUnit}`})
          </div>
        </div>
      )}

      {/* Use Cases */}
      {selectedOperator && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
          <div className="font-medium text-blue-900 mb-1">Clinical Use Cases:</div>
          <ul className="space-y-0.5 text-blue-800">
            {value.operator === 'COUNT' && (
              <>
                <li>• Track number of high BP readings for HTN management</li>
                <li>• Count hospital visits for high utilizers</li>
                <li>• Monitor medication fills for adherence</li>
              </>
            )}
            {value.operator === 'AVG' && (
              <>
                <li>• Calculate average glucose for diabetes control</li>
                <li>• Track average BP over time</li>
                <li>• Monitor lab trends</li>
              </>
            )}
            {value.operator === 'TREND_UP' && (
              <>
                <li>• Detect worsening kidney function (rising creatinine)</li>
                <li>• Identify uncontrolled diabetes (rising A1c)</li>
                <li>• Alert on increasing pain scores</li>
              </>
            )}
            {value.operator === 'TIME_SINCE' && (
              <>
                <li>• Identify patients overdue for visits</li>
                <li>• Track time since last screening</li>
                <li>• Monitor care gaps</li>
              </>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}
