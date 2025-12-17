'use client';

import { useState } from 'react';
import { BookOpen, ChevronRight, Sparkles, TrendingUp, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RULE_EXAMPLES, type RuleExample, getExamplesByLevel } from './rule-examples.config';

interface RuleTemplateSelectorProps {
  onSelect: (template: RuleExample) => void;
  onClose: () => void;
}

const LEVEL_CONFIG = {
  basic: {
    icon: BookOpen,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: 'Basic',
    description: 'Simple, single-condition rules',
  },
  intermediate: {
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Intermediate',
    description: 'Multiple conditions with clinical logic',
  },
  advanced: {
    icon: Award,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    label: 'Advanced',
    description: 'Complex clinical pathways',
  },
  expert: {
    icon: Star,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Expert',
    description: 'Multi-system protocols & guidelines',
  },
};

export function RuleTemplateSelector({ onSelect, onClose }: RuleTemplateSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'intermediate' | 'advanced' | 'expert'>('basic');
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const examples = getExamplesByLevel(selectedLevel);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Rule Templates & Examples</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
          Close
        </Button>
      </div>

      <p className="text-xs text-gray-600">
        Start with a pre-built template and customize it for your needs
      </p>

      {/* Level Selector */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(LEVEL_CONFIG) as Array<keyof typeof LEVEL_CONFIG>).map((level) => {
          const config = LEVEL_CONFIG[level];
          const Icon = config.icon;
          const count = getExamplesByLevel(level).length;

          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`p-2 rounded-md border transition-all ${
                selectedLevel === level
                  ? config.color + ' shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <div className="text-xs font-medium">{config.label}</div>
              <div className="text-xs opacity-75">{count} templates</div>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
        <p className="text-xs text-gray-700">
          <span className="font-medium">{LEVEL_CONFIG[selectedLevel].label}:</span>{' '}
          {LEVEL_CONFIG[selectedLevel].description}
        </p>
      </div>

      {/* Examples List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {examples.map((example) => {
          const isExpanded = expandedExample === example.id;

          return (
            <Card
              key={example.id}
              className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                isExpanded ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div
                onClick={() => setExpandedExample(isExpanded ? null : example.id)}
                className="flex items-start gap-2"
              >
                <ChevronRight
                  className={`h-4 w-4 flex-shrink-0 mt-0.5 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{example.name}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{example.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {example.category}
                    </Badge>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      {/* Use Case */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs font-medium text-blue-900 mb-1">Use Case:</p>
                        <p className="text-xs text-blue-800">{example.useCase}</p>
                      </div>

                      {/* Clinical Rationale */}
                      {example.clinicalRationale && (
                        <div className="bg-purple-50 border border-purple-200 rounded p-2">
                          <p className="text-xs font-medium text-purple-900 mb-1">
                            Clinical Rationale:
                          </p>
                          <p className="text-xs text-purple-800">{example.clinicalRationale}</p>
                        </div>
                      )}

                      {/* Conditions Preview */}
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <p className="text-xs font-medium text-gray-900 mb-1">Conditions:</p>
                        <ul className="space-y-1">
                          {example.rule.rules.map((rule, i) => (
                            <li key={i} className="text-xs text-gray-700">
                              • {rule.field} {rule.operator} {rule.value}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Use Template Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(example);
                        }}
                        size="sm"
                        className="w-full h-7 bg-blue-600 hover:opacity-90"
                      >
                        <Sparkles className="h-3 w-3 mr-1.5" />
                        Use This Template
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {examples.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No templates available for this level</p>
        </div>
      )}
    </div>
  );
}
