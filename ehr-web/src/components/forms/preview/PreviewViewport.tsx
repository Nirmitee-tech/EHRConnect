/**
 * PreviewViewport Component - Phase 3: Responsive Preview System
 *
 * Renders form preview with:
 * - Responsive viewport dimensions
 * - CSS scaling (zoom)
 * - Live sync from builder state
 * - Test mode interactivity
 * - Debounced updates (300ms)
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePreviewStore } from '@/stores/preview-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface QuestionnaireItem {
  linkId: string;
  text?: string;
  type: string;
  required?: boolean;
  item?: QuestionnaireItem[];
  answerOption?: Array<{ valueString?: string; valueCoding?: any }>;
  [key: string]: any;
}

interface PreviewViewportProps {
  // Form builder state
  title: string;
  description?: string;
  questions: QuestionnaireItem[];
}

export function PreviewViewport({ title, description, questions }: PreviewViewportProps) {
  const {
    dimensions,
    zoom,
    testMode,
    testData,
    updateTestData
  } = usePreviewStore();

  const [debouncedQuestions, setDebouncedQuestions] = useState<QuestionnaireItem[]>(questions);

  // Debounce questions updates (300ms) to prevent re-render thrashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuestions(questions);
    }, 300);

    return () => clearTimeout(timer);
  }, [questions]);

  // Calculate scale for zoom
  const scale = zoom / 100;

  // Calculate container dimensions (accounting for zoom)
  const containerStyle = useMemo(() => ({
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    transition: 'transform 0.2s ease-in-out'
  }), [dimensions, scale]);

  // Apply responsive CSS class based on viewport width
  const viewportClass = useMemo(() => {
    if (dimensions.width < 640) return 'mobile-viewport';
    if (dimensions.width < 1024) return 'tablet-viewport';
    return 'desktop-viewport';
  }, [dimensions.width]);

  // Calculate wrapper dimensions to accommodate scaled content
  const wrapperStyle = useMemo(() => ({
    width: `${dimensions.width * scale}px`,
    height: `${dimensions.height * scale}px`,
  }), [dimensions, scale]);

  return (
    <div className="flex-1 overflow-auto p-8 bg-muted/30">
      {/* Scaled viewport wrapper */}
      <div style={wrapperStyle} className="mx-auto">
        <div
          style={containerStyle}
          className={cn(
            'bg-background border rounded-lg shadow-lg overflow-y-auto',
            viewportClass
          )}
        >
          <div className="p-6 h-full">
            {/* Form Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {title || 'Form Preview'}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {/* Form Fields */}
            {debouncedQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No questions added yet</p>
                <p className="text-xs mt-1">Add components from the left panel</p>
              </div>
            ) : (
              <div className="space-y-4">
                {debouncedQuestions.map((question) => (
                  <PreviewField
                    key={question.linkId}
                    field={question}
                    value={testData[question.linkId]}
                    onChange={(value) => {
                      if (testMode) {
                        updateTestData({ [question.linkId]: value });
                      }
                    }}
                    disabled={!testMode}
                  />
                ))}
              </div>
            )}

            {/* Submit Button */}
            {debouncedQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <Button
                  className="w-full"
                  disabled={!testMode}
                  onClick={() => {
                    if (testMode) {
                      console.log('Form submitted:', testData);
                      alert('Form submitted! Check console for data.');
                    }
                  }}
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PreviewField Component
 * Renders individual form field based on type
 */
function PreviewField({
  field,
  value,
  onChange,
  disabled
}: {
  field: QuestionnaireItem;
  value: any;
  onChange: (value: any) => void;
  disabled: boolean;
}) {
  // Handle display elements (heading, description, separator)
  const displayCategory = field.type === 'display'
    ? field.extension?.find((ext: any) =>
        ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
      )?.valueCode
    : null;

  if (displayCategory === 'heading') {
    return (
      <h2 className="text-xl font-bold text-foreground mt-6 mb-3">
        {field.text || 'Heading'}
      </h2>
    );
  }

  if (displayCategory === 'description') {
    return (
      <p className="text-sm text-muted-foreground my-3">
        {field.text || 'Description text'}
      </p>
    );
  }

  if (displayCategory === 'separator') {
    return <hr className="my-4 border-t" />;
  }

  // Handle group (container) elements
  if (field.type === 'group') {
    const isColumns = field.extension?.some((ext: any) =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCode === 'columns'
    );

    const columnCount = isColumns
      ? field.extension?.find((ext: any) =>
          ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns'
        )?.valueInteger || 2
      : 2;

    return (
      <div className="space-y-3">
        {field.text && (
          <h3 className="text-lg font-semibold text-foreground">
            {field.text}
          </h3>
        )}
        <div
          className={cn(
            'space-y-4',
            isColumns && 'grid gap-4',
            isColumns && columnCount === 2 && 'grid-cols-1 sm:grid-cols-2',
            isColumns && columnCount === 3 && 'grid-cols-1 sm:grid-cols-3',
            isColumns && columnCount === 4 && 'grid-cols-1 sm:grid-cols-4'
          )}
        >
          {field.item?.map((child) => (
            <PreviewField
              key={child.linkId}
              field={child}
              value={value?.[child.linkId]}
              onChange={(childValue) => {
                onChange({
                  ...value,
                  [child.linkId]: childValue
                });
              }}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    );
  }

  // Regular input fields
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.text || 'Untitled Question'}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Text Input */}
      {field.type === 'string' && (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
          placeholder={disabled ? 'Enable Test Mode to interact' : 'Your answer'}
        />
      )}

      {/* Long Text */}
      {field.type === 'text' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder={disabled ? 'Enable Test Mode to interact' : 'Your answer'}
        />
      )}

      {/* Number */}
      {(field.type === 'integer' || field.type === 'decimal') && (
        <Input
          type="number"
          step={field.type === 'decimal' ? '0.01' : '1'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
          placeholder={disabled ? 'Enable Test Mode to interact' : '0'}
        />
      )}

      {/* Boolean (Yes/No) */}
      {field.type === 'boolean' && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.linkId}
              checked={value === true}
              onChange={() => onChange(true)}
              disabled={disabled}
              className="cursor-pointer"
            />
            <span className="text-sm">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field.linkId}
              checked={value === false}
              onChange={() => onChange(false)}
              disabled={disabled}
              className="cursor-pointer"
            />
            <span className="text-sm">No</span>
          </label>
        </div>
      )}

      {/* Date */}
      {field.type === 'date' && (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      )}

      {/* Time */}
      {field.type === 'time' && (
        <Input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      )}

      {/* DateTime */}
      {field.type === 'dateTime' && (
        <Input
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      )}

      {/* Choice (Single Select) */}
      {field.type === 'choice' && field.answerOption && (
        <div className="space-y-2">
          {field.answerOption.map((option, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted"
            >
              <input
                type="radio"
                name={field.linkId}
                checked={value === option.valueString}
                onChange={() => onChange(option.valueString)}
                disabled={disabled}
                className="cursor-pointer"
              />
              <span className="text-sm">{option.valueString}</span>
            </label>
          ))}
        </div>
      )}

      {/* Open Choice (allow custom) */}
      {field.type === 'open-choice' && (
        <div className="space-y-2">
          {field.answerOption?.map((option, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(option.valueString)}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...current, option.valueString]);
                  } else {
                    onChange(current.filter((v: any) => v !== option.valueString));
                  }
                }}
                disabled={disabled}
                className="cursor-pointer"
              />
              <span className="text-sm">{option.valueString}</span>
            </label>
          ))}
        </div>
      )}

      {/* Attachment */}
      {field.type === 'attachment' && (
        <Input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0])}
          disabled={disabled}
          className="w-full"
        />
      )}
    </div>
  );
}
