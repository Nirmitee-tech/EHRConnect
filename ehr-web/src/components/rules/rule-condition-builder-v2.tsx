'use client';

import { useState } from 'react';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';
import Editor from '@monaco-editor/react';
import { BookTemplate } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RuleBuilderModeSelector, type RuleBuilderMode } from './rule-builder-modes';
import { GuidedRuleBuilderEnterprise } from './guided-rule-builder-enterprise';
import { AIRuleBuilder } from './ai-rule-builder';
import { RuleTemplateSelector } from './rule-template-selector';
import { FHIR_FIELDS_ENTERPRISE } from './fhir-fields-enterprise.config';
import type { RuleExample } from './rule-examples.config';
import 'react-querybuilder/dist/query-builder.css';
import styles from './rule-condition-builder.module.css';

interface RuleConditionBuilderProps {
  value: any;
  onChange: (value: any) => void;
  availableFields?: Array<{ name: string; label: string; type?: string; inputType?: string }>;
}

// Convert FHIR fields to format expected by QueryBuilder
const defaultFields = FHIR_FIELDS_ENTERPRISE.map((f) => ({
  name: f.name,
  label: f.label,
  inputType: f.inputType || (f.type === 'number' ? 'number' : 'text'),
  type: f.type,
}));

const operators = [
  { name: '=', label: 'Equals' },
  { name: '!=', label: 'Not Equals' },
  { name: '<', label: 'Less Than' },
  { name: '>', label: 'Greater Than' },
  { name: '<=', label: 'Less Than or Equal' },
  { name: '>=', label: 'Greater Than or Equal' },
  { name: 'contains', label: 'Contains' },
  { name: 'in', label: 'In' },
];

export function RuleConditionBuilder({
  value,
  onChange,
  availableFields = defaultFields,
}: RuleConditionBuilderProps) {
  const [builderMode, setBuilderMode] = useState<RuleBuilderMode>('guided');
  const [codeViewMode, setCodeViewMode] = useState<'visual' | 'code'>('visual');
  const [showTemplates, setShowTemplates] = useState(false);
  const [codeValue, setCodeValue] = useState(
    JSON.stringify(value?.conditions_json_logic || value?.conditions || {}, null, 2)
  );

  const handleTemplateSelect = (template: RuleExample) => {
    onChange(template.rule);
    setShowTemplates(false);
  };

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
        return convertToJsonLogic(rule);
      }

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
      {/* Mode Selector and Template Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RuleBuilderModeSelector mode={builderMode} onChange={setBuilderMode} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-7 text-xs"
          >
            <BookTemplate className="h-3.5 w-3.5 mr-1.5" />
            Templates
          </Button>
        </div>
        {builderMode === 'visual' && (
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
            <button
              onClick={() => setCodeViewMode('visual')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                codeViewMode === 'visual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setCodeViewMode('code')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                codeViewMode === 'code'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Code
            </button>
          </div>
        )}
      </div>

      {/* Template Selector */}
      {showTemplates && (
        <Card className="p-3">
          <RuleTemplateSelector
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        </Card>
      )}

      {/* Content Area */}
      <div>
        {builderMode === 'guided' && (
          <GuidedRuleBuilderEnterprise value={value} onChange={onChange} availableFields={FHIR_FIELDS_ENTERPRISE} />
        )}

        {builderMode === 'ai' && (
          <AIRuleBuilder value={value} onChange={onChange} availableFields={availableFields} />
        )}

        {builderMode === 'visual' && (
          <div className="space-y-2">
            {codeViewMode === 'visual' ? (
              <>
                <Card className={`p-2 ${styles.queryBuilder}`}>
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
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-1.5">
                  <span className="font-medium">Tips:</span> Click "+ Rule" to add conditions, "+ Group" for nested logic
                </div>
              </>
            ) : (
              <>
                <Card className="p-0 overflow-hidden">
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    value={codeValue}
                    onChange={handleCodeChange}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </Card>
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-1.5">
                  <span className="font-medium">JSONLogic:</span> Use {'{'}\"and\": [...]{'}'},  {'{'}\"or\": [...]{'}'}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
