'use client';

import { useState } from 'react';
import { QueryBuilder, RuleGroupType, formatQuery } from 'react-querybuilder';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import 'react-querybuilder/dist/query-builder.css';
import styles from './rule-condition-builder.module.css';

interface RuleConditionBuilderProps {
  value: any;
  onChange: (value: any) => void;
  availableFields?: Array<{ name: string; label: string; type?: string }>;
}

const defaultFields = [
  { name: 'patient.age', label: 'Patient Age', inputType: 'number' },
  { name: 'patient.gender', label: 'Patient Gender', inputType: 'text' },
  { name: 'event.type', label: 'Event Type', inputType: 'text' },
  { name: 'event.priority', label: 'Event Priority', inputType: 'text' },
  { name: 'context.time_of_day', label: 'Time of Day', inputType: 'number' },
  { name: 'context.day_of_week', label: 'Day of Week', inputType: 'number' },
];

const operators = [
  { name: '=', label: 'Equals' },
  { name: '!=', label: 'Not Equals' },
  { name: '<', label: 'Less Than' },
  { name: '>', label: 'Greater Than' },
  { name: '<=', label: 'Less Than or Equal' },
  { name: '>=', label: 'Greater Than or Equal' },
  { name: 'contains', label: 'Contains' },
  { name: 'in', label: 'In' },
  { name: 'between', label: 'Between' },
];

export function RuleConditionBuilder({
  value,
  onChange,
  availableFields = defaultFields,
}: RuleConditionBuilderProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [codeValue, setCodeValue] = useState(
    JSON.stringify(value?.conditions_json_logic || value?.conditions || {}, null, 2)
  );

  const handleQueryChange = (query: RuleGroupType) => {
    onChange({
      combinator: query.combinator,
      rules: query.rules,
    });
    setCodeValue(JSON.stringify(convertToJsonLogic(query), null, 2));
  };

  const handleCodeChange = (newValue: string | undefined) => {
    if (!newValue) return;
    setCodeValue(newValue);

    try {
      const parsed = JSON.parse(newValue);
      onChange(parsed);
    } catch (error) {
      // Invalid JSON, don't update
    }
  };

  const convertToJsonLogic = (query: RuleGroupType): any => {
    if (!query.rules || query.rules.length === 0) {
      return {};
    }

    const combinator = query.combinator || 'and';
    const rules = query.rules.map((rule: any) => {
      if (rule.combinator) {
        // Nested group
        return convertToJsonLogic(rule);
      }

      // Single rule
      const { field, operator, value } = rule;

      switch (operator) {
        case '=':
          return { '==': [{ var: field }, value] };
        case '!=':
          return { '!=': [{ var: field }, value] };
        case '<':
          return { '<': [{ var: field }, value] };
        case '<=':
          return { '<=': [{ var: field }, value] };
        case '>':
          return { '>': [{ var: field }, value] };
        case '>=':
          return { '>=': [{ var: field }, value] };
        case 'contains':
          return { in: [value, { var: field }] };
        case 'in':
          return { in: [{ var: field }, value] };
        case 'between':
          return {
            and: [
              { '>=': [{ var: field }, value[0]] },
              { '<=': [{ var: field }, value[1]] },
            ],
          };
        default:
          return { '==': [{ var: field }, value] };
      }
    });

    return { [combinator]: rules };
  };

  const initialQuery: RuleGroupType = value?.combinator
    ? value
    : {
        combinator: 'and',
        rules: [
          {
            field: 'patient.age',
            operator: '>',
            value: 18,
          },
        ],
      };

  return (
    <div className="space-y-2">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'visual' | 'code')}>
        <div className="flex items-center justify-between mb-3">
          <TabsList>
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="code">Code Editor</TabsTrigger>
          </TabsList>
          <div className="text-xs text-gray-500">
            {viewMode === 'visual' ? 'Drag and drop to build conditions' : 'JSONLogic format'}
          </div>
        </div>

        <TabsContent value="visual" className="space-y-2">
          <Card className={`p-3 ${styles.queryBuilder}`}>
            <QueryBuilder
              fields={availableFields}
              operators={operators}
              query={initialQuery}
              onQueryChange={handleQueryChange}
              controlClassnames={{
                queryBuilder: 'queryBuilder-branches',
                ruleGroup: 'ruleGroup',
                header: 'ruleGroup-header',
                body: 'ruleGroup-body',
                combinators: 'ruleGroup-combinators',
                addRule: 'ruleGroup-addRule',
                addGroup: 'ruleGroup-addGroup',
                removeGroup: 'ruleGroup-remove',
                rule: 'rule',
                fields: 'rule-fields',
                operators: 'rule-operators',
                value: 'rule-value',
                removeRule: 'rule-remove',
              }}
            />
          </Card>
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Click "+ Rule" to add a new condition</li>
              <li>Click "+ Group" to add a nested group of conditions</li>
              <li>Use AND/OR to change how conditions are combined</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="code" className="space-y-2">
          <Card className="p-0 overflow-hidden">
            <Editor
              height="350px"
              defaultLanguage="json"
              value={codeValue}
              onChange={handleCodeChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </Card>
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            <p className="font-medium mb-1">JSONLogic Format:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Use {"{"}"and": [...]{"}"} or {"{"}"or": [...]{"}"} for combinators</li>
              <li>Access fields with {"{"}"var": "field.name"{"}"}</li>
              <li>Operators: ==, !=, {'<'}, {'>'}, {'<='}, {'>='}, in, etc.</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
