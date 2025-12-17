'use client';

import React, { useState } from 'react';
import { Play, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { RuleTestResult } from '@/types/forms';

interface TestPanelProps {
  stepId: string;
  ruleId: string;
  ruleName: string;
  onTest: (ruleId: string, mockData: Record<string, any>) => Promise<RuleTestResult>;
  onClose: () => void;
}

export function TestPanel({ stepId, ruleId, ruleName, onTest, onClose }: TestPanelProps) {
  const [mockDataText, setMockDataText] = useState('{\n  "patient": {\n    "age": 25\n  },\n  "answers": {\n    "q1": "Yes"\n  }\n}');
  const [testResult, setTestResult] = useState<RuleTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setError(null);
    setTestResult(null);

    // Parse mock data
    let mockData: Record<string, any>;
    try {
      mockData = JSON.parse(mockDataText);
    } catch (err) {
      setError('Invalid JSON format');
      return;
    }

    setIsTesting(true);
    try {
      const result = await onTest(ruleId, mockData);
      setTestResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to test rule');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">Test Rule: {ruleName}</CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Provide mock data to test how the rule evaluates
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Mock Data Input */}
        <div>
          <Label className="text-xs">Mock Data (JSON)</Label>
          <Textarea
            value={mockDataText}
            onChange={(e) => setMockDataText(e.target.value)}
            placeholder='{"patient": {"age": 25}}'
            className="text-xs font-mono min-h-[120px]"
          />
        </div>

        {/* Test Button */}
        <Button
          size="sm"
          onClick={handleTest}
          disabled={isTesting}
          className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
        >
          <Play className="h-3 w-3 mr-1" />
          {isTesting ? 'Testing...' : 'Run Test'}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-900">Test Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className="space-y-3">
            {/* Overall Result */}
            <div className={`p-3 rounded border ${testResult.conditionsMet ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                {testResult.conditionsMet ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Conditions Met</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">Conditions Not Met</span>
                  </>
                )}
              </div>
            </div>

            {/* Conditions Evaluation */}
            <div>
              <Label className="text-xs mb-2 block">Condition Evaluation</Label>
              <div className="space-y-1">
                {testResult.conditionsEvaluation.map((evalItem, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-xs ${evalItem.result ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {evalItem.result ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span className="font-mono">{evalItem.explanation}</span>
                    </div>
                    <div className="text-gray-600 ml-5">
                      Context value: <span className="font-mono">{JSON.stringify(evalItem.contextValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Executed */}
            {testResult.actionsExecuted.length > 0 && (
              <div>
                <Label className="text-xs mb-2 block">Actions That Would Execute</Label>
                <div className="space-y-1">
                  {testResult.actionsExecuted.map((action, idx) => (
                    <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {action.actionType}
                        </Badge>
                        {action.message && <span>{action.message}</span>}
                        {action.field && <span className="text-gray-600">Field: {action.field}</span>}
                        {action.value !== undefined && (
                          <span className="text-gray-600">
                            Value: <span className="font-mono">{JSON.stringify(action.value)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              Tested at: {new Date(testResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
