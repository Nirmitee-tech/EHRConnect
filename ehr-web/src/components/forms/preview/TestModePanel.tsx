/**
 * TestModePanel Component - Phase 3: Responsive Preview System
 *
 * Displays test mode validation results:
 * - Required field validation
 * - Field completion status
 * - Visual feedback (success/error icons)
 */

'use client';

import { useMemo } from 'react';
import { usePreviewStore } from '@/stores/preview-store';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionnaireItem {
  linkId: string;
  text?: string;
  type: string;
  required?: boolean;
  item?: QuestionnaireItem[];
  [key: string]: any;
}

interface TestModePanelProps {
  questions: QuestionnaireItem[];
}

export function TestModePanel({ questions }: TestModePanelProps) {
  const { testData, testMode } = usePreviewStore();

  // Flatten nested questions to get all required fields
  const allFields = useMemo(() => {
    const fields: QuestionnaireItem[] = [];

    const flatten = (items: QuestionnaireItem[]) => {
      items.forEach(item => {
        // Skip display-only elements
        if (item.type !== 'display' && item.type !== 'group') {
          fields.push(item);
        }
        if (item.item) {
          flatten(item.item);
        }
      });
    };

    flatten(questions);
    return fields;
  }, [questions]);

  // Calculate validation status
  const validation = useMemo(() => {
    const requiredFields = allFields.filter(f => f.required);
    const missingFields: QuestionnaireItem[] = [];
    const completedFields: QuestionnaireItem[] = [];

    requiredFields.forEach(field => {
      const value = testData[field.linkId];
      const isEmpty = value === undefined || value === null || value === '';

      if (isEmpty) {
        missingFields.push(field);
      } else {
        completedFields.push(field);
      }
    });

    return {
      total: requiredFields.length,
      completed: completedFields.length,
      missing: missingFields.length,
      missingFields,
      isValid: missingFields.length === 0,
      completionRate: requiredFields.length > 0
        ? Math.round((completedFields.length / requiredFields.length) * 100)
        : 100
    };
  }, [allFields, testData]);

  if (!testMode) {
    return (
      <div className="border-t p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">
              Test Mode Disabled
            </h3>
            <p className="text-xs text-muted-foreground">
              Enable test mode from the toolbar to interact with the form and validate inputs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t p-4 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          Test Results
          {validation.isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </h3>

        {/* Completion Badge */}
        {validation.total > 0 && (
          <div className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            validation.isValid
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          )}>
            {validation.completed} / {validation.total} required
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {validation.total > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                validation.isValid ? 'bg-green-600' : 'bg-orange-500'
              )}
              style={{ width: `${validation.completionRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {validation.completionRate}% complete
          </p>
        </div>
      )}

      {/* Validation Messages */}
      {validation.isValid ? (
        <div className="text-sm text-muted-foreground bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-2" />
          All required fields are filled. Form is ready to submit.
        </div>
      ) : validation.total === 0 ? (
        <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Info className="h-4 w-4 text-blue-600 inline mr-2" />
          No required fields in this form.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Missing required fields:</span>
          </div>
          <ul className="text-sm space-y-1 ml-6">
            {validation.missingFields.slice(0, 5).map((field) => (
              <li key={field.linkId} className="text-muted-foreground">
                • {field.text || field.linkId}
              </li>
            ))}
            {validation.missingFields.length > 5 && (
              <li className="text-xs text-muted-foreground italic">
                + {validation.missingFields.length - 5} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Test Data Summary */}
      <div className="mt-4 pt-3 border-t">
        <details className="group">
          <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Test Data Summary ({Object.keys(testData).length} fields filled)
          </summary>
          <div className="mt-2 max-h-32 overflow-auto">
            <pre className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
