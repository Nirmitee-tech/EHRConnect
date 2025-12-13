/**
 * Compact Form Renderer
 * Super compact form display/fill component for patient context
 * Can be embedded in patient sidebar, encounter view, etc.
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '../shared/simple-ui';
import { Loader2, Save, Check, AlertCircle } from 'lucide-react';
import type {
  FHIRQuestionnaire,
  QuestionnaireItem,
  FHIRQuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '@/types/forms';

interface CompactFormRendererProps {
  questionnaire: FHIRQuestionnaire;
  initialResponse?: FHIRQuestionnaireResponse;
  patientId?: string;
  encounterId?: string;
  onSubmit: (response: FHIRQuestionnaireResponse) => Promise<void>;
  onSave?: (response: FHIRQuestionnaireResponse) => Promise<void>; // For in-progress saves
  readonly?: boolean;
  compact?: boolean; // Extra compact mode
}

export function CompactFormRenderer({
  questionnaire,
  initialResponse,
  patientId,
  encounterId,
  onSubmit,
  onSave,
  readonly = false,
  compact = true,
}: CompactFormRendererProps) {
  const [responses, setResponses] = useState<Record<string, QuestionnaireResponseItemAnswer>>(
    () => buildResponseMap(initialResponse)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Build response map from existing response
  function buildResponseMap(response?: FHIRQuestionnaireResponse): Record<string, QuestionnaireResponseItemAnswer> {
    const map: Record<string, QuestionnaireResponseItemAnswer> = {};
    if (!response?.item) return map;

    const traverse = (items: QuestionnaireResponseItem[]) => {
      items.forEach((item) => {
        if (item.answer && item.answer.length > 0) {
          map[item.linkId] = item.answer[0];
        }
        if (item.item) {
          traverse(item.item);
        }
      });
    };

    traverse(response.item);
    return map;
  }

  // Update answer for an item
  const updateAnswer = useCallback((linkId: string, answer: QuestionnaireResponseItemAnswer) => {
    setResponses((prev) => ({ ...prev, [linkId]: answer }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[linkId];
      return newErrors;
    });
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const checkRequired = (items: QuestionnaireItem[]) => {
      items.forEach((item) => {
        if (item.required && !responses[item.linkId]) {
          newErrors[item.linkId] = 'This field is required';
        }
        if (item.item) {
          checkRequired(item.item);
        }
      });
    };

    checkRequired(questionnaire.item);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [questionnaire.item, responses]);

  // Build QuestionnaireResponse
  const buildResponse = useCallback((status: 'in-progress' | 'completed'): FHIRQuestionnaireResponse => {
    const buildItems = (items: QuestionnaireItem[]): QuestionnaireResponseItem[] => {
      return items
        .map((item) => {
          const answer = responses[item.linkId];
          const responseItem: QuestionnaireResponseItem = {
            linkId: item.linkId,
            text: item.text,
          };

          if (answer) {
            responseItem.answer = [answer];
          }

          if (item.item) {
            const childItems = buildItems(item.item);
            if (childItems.length > 0) {
              responseItem.item = childItems;
            }
          }

          return responseItem;
        })
        .filter((item) => item.answer || item.item);
    };

    return {
      resourceType: 'QuestionnaireResponse',
      questionnaire: questionnaire.url || `Questionnaire/${questionnaire.id}`,
      status,
      authored: new Date().toISOString(),
      subject: patientId ? { reference: `Patient/${patientId}` } : undefined,
      encounter: encounterId ? { reference: `Encounter/${encounterId}` } : undefined,
      item: buildItems(questionnaire.item),
    };
  }, [questionnaire, responses, patientId, encounterId]);

  // Handle save (in-progress)
  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      const response = buildResponse('in-progress');
      await onSave(response);
    } catch (error) {
      console.error('Failed to save form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle submit (completed)
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = buildResponse('completed');
      await onSubmit(response);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual item
  const renderItem = (item: QuestionnaireItem) => {
    const answer = responses[item.linkId];
    const error = errors[item.linkId];
    const spacing = compact ? 'space-y-1' : 'space-y-2';

    // Check if this is a columns layout
    const isColumns = item.type === 'group' && item.extension?.some(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCode === 'columns'
    );

    const columnCount = isColumns ? (item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns'
    )?.valueInteger || 2) : 2;

    // Check for display category
    const displayCategory = item.type === 'display' ? item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
    )?.valueCode : null;

    // Separator
    if (displayCategory === 'separator') {
      return (
        <hr key={item.linkId} className={compact ? 'my-2 border-t' : 'my-3 border-t-2'} />
      );
    }

    // Heading
    if (displayCategory === 'heading') {
      return (
        <h3 key={item.linkId} className={compact ? 'text-sm font-bold mt-3 mb-1' : 'text-base font-bold mt-4 mb-2'}>
          {item.text}
        </h3>
      );
    }

    // Description
    if (displayCategory === 'description') {
      return (
        <p key={item.linkId} className={compact ? 'text-xs text-muted-foreground mb-2' : 'text-sm text-muted-foreground mb-3'}>
          {item.text}
        </p>
      );
    }

    // Display item (info only) - default display
    if (item.type === 'display') {
      return (
        <div key={item.linkId} className="text-sm text-muted-foreground py-1">
          {item.text}
        </div>
      );
    }

    // Columns layout
    if (isColumns) {
      return (
        <div key={item.linkId} className={spacing}>
          {item.text && (
            <Label className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'}>
              {item.text}
              {item.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          <div
            className={`grid gap-${compact ? '2' : '3'} ${
              columnCount === 2 ? 'grid-cols-2' :
              columnCount === 3 ? 'grid-cols-3' :
              columnCount === 4 ? 'grid-cols-4' :
              'grid-cols-2'
            }`}
          >
            {item.item?.map(renderItem)}
          </div>
        </div>
      );
    }

    // Group container
    if (item.type === 'group') {
      return (
        <div key={item.linkId} className={`${spacing} border-l-2 border-muted pl-3 py-1`}>
          {item.text && (
            <Label className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'}>
              {item.text}
              {item.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {item.item?.map(renderItem)}
        </div>
      );
    }

    const inputId = `input-${item.linkId}`;
    const labelClass = compact ? 'text-xs' : 'text-sm';
    const inputClass = compact ? 'h-7 text-xs' : 'h-9 text-sm';

    return (
      <div key={item.linkId} className={spacing}>
        <Label htmlFor={inputId} className={labelClass}>
          {item.text}
          {item.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {/* Text input */}
        {item.type === 'string' && (
          <Input
            id={inputId}
            className={inputClass}
            value={answer?.valueString || ''}
            onChange={(e) => updateAnswer(item.linkId, { valueString: e.target.value })}
            disabled={readonly}
            maxLength={item.maxLength}
          />
        )}

        {/* Text area */}
        {item.type === 'text' && (
          <Textarea
            id={inputId}
            className={compact ? 'text-xs min-h-[60px]' : 'text-sm'}
            value={answer?.valueString || ''}
            onChange={(e) => updateAnswer(item.linkId, { valueString: e.target.value })}
            disabled={readonly}
            rows={compact ? 2 : 3}
          />
        )}

        {/* Integer */}
        {item.type === 'integer' && (
          <Input
            id={inputId}
            type="number"
            step="1"
            className={inputClass}
            value={answer?.valueInteger ?? ''}
            onChange={(e) =>
              updateAnswer(item.linkId, { valueInteger: parseInt(e.target.value) || 0 })
            }
            disabled={readonly}
          />
        )}

        {/* Decimal */}
        {item.type === 'decimal' && (
          <Input
            id={inputId}
            type="number"
            step="0.01"
            className={inputClass}
            value={answer?.valueDecimal ?? ''}
            onChange={(e) =>
              updateAnswer(item.linkId, { valueDecimal: parseFloat(e.target.value) || 0 })
            }
            disabled={readonly}
          />
        )}

        {/* Date */}
        {item.type === 'date' && (
          <Input
            id={inputId}
            type="date"
            className={inputClass}
            value={answer?.valueDate || ''}
            onChange={(e) => updateAnswer(item.linkId, { valueDate: e.target.value })}
            disabled={readonly}
          />
        )}

        {/* Time */}
        {item.type === 'time' && (
          <Input
            id={inputId}
            type="time"
            className={inputClass}
            value={answer?.valueTime || ''}
            onChange={(e) => updateAnswer(item.linkId, { valueTime: e.target.value })}
            disabled={readonly}
          />
        )}

        {/* DateTime */}
        {item.type === 'dateTime' && (
          <Input
            id={inputId}
            type="datetime-local"
            className={inputClass}
            value={answer?.valueDateTime || ''}
            onChange={(e) => updateAnswer(item.linkId, { valueDateTime: e.target.value })}
            disabled={readonly}
          />
        )}

        {/* Boolean (checkbox) */}
        {item.type === 'boolean' && (
          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              id={inputId}
              checked={answer?.valueBoolean || false}
              onCheckedChange={(checked) =>
                updateAnswer(item.linkId, { valueBoolean: Boolean(checked) })
              }
              disabled={readonly}
            />
            <Label htmlFor={inputId} className={`${labelClass} font-normal cursor-pointer`}>
              {item.text}
            </Label>
          </div>
        )}

        {/* Choice (dropdown or radio) */}
        {item.type === 'choice' && item.answerOption && (
          <>
            {item.answerOption.length <= 3 ? (
              // Radio for 3 or fewer options
              <RadioGroup
                value={answer?.valueCoding?.code || answer?.valueString || ''}
                onValueChange={(value) => {
                  const option = item.answerOption!.find(
                    (opt) => opt.valueCoding?.code === value || opt.valueString === value
                  );
                  if (option?.valueCoding) {
                    updateAnswer(item.linkId, { valueCoding: option.valueCoding });
                  } else if (option?.valueString) {
                    updateAnswer(item.linkId, { valueString: option.valueString });
                  }
                }}
                disabled={readonly}
              >
                {item.answerOption.map((option, idx) => {
                  const optionValue = option.valueCoding?.code || option.valueString || `option-${idx}`;
                  const optionLabel = option.valueCoding?.display || option.valueString || '';

                  return (
                    <div key={optionValue} className="flex items-center space-x-2">
                      <RadioGroupItem value={optionValue} id={`${inputId}-${idx}`} />
                      <Label
                        htmlFor={`${inputId}-${idx}`}
                        className={`${labelClass} font-normal cursor-pointer`}
                      >
                        {optionLabel}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              // Dropdown for 4+ options
              <Select
                value={answer?.valueCoding?.code || answer?.valueString || ''}
                onValueChange={(value) => {
                  const option = item.answerOption!.find(
                    (opt) => opt.valueCoding?.code === value || opt.valueString === value
                  );
                  if (option?.valueCoding) {
                    updateAnswer(item.linkId, { valueCoding: option.valueCoding });
                  } else if (option?.valueString) {
                    updateAnswer(item.linkId, { valueString: option.valueString });
                  }
                }}
                disabled={readonly}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {item.answerOption.map((option, idx) => {
                    const optionValue = option.valueCoding?.code || option.valueString || `option-${idx}`;
                    const optionLabel = option.valueCoding?.display || option.valueString || '';

                    return (
                      <SelectItem key={optionValue} value={optionValue}>
                        {optionLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </>
        )}

        {error && (
          <div className="flex items-center gap-1 text-xs text-destructive mt-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={compact ? 'shadow-sm' : ''}>
      <CardHeader className={compact ? 'p-3 pb-2' : 'p-4'}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? 'text-sm' : 'text-base'}>
            {questionnaire.title}
          </CardTitle>
          {questionnaire.status && (
            <Badge variant={questionnaire.status === 'active' ? 'default' : 'secondary'}>
              {questionnaire.status}
            </Badge>
          )}
        </div>
        {questionnaire.description && (
          <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
            {questionnaire.description}
          </p>
        )}
      </CardHeader>

      <CardContent className={compact ? 'p-3 pt-0 space-y-2' : 'p-4 pt-0 space-y-3'}>
        {questionnaire.item.map(renderItem)}

        {!readonly && (
          <div className={`flex gap-2 ${compact ? 'pt-2' : 'pt-3'} border-t`}>
            {onSave && (
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={handleSave}
                disabled={isSaving || isSubmitting}
                className={compact ? 'h-7 text-xs' : ''}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-3 w-3" />
                    Save Draft
                  </>
                )}
              </Button>
            )}
            <Button
              size={compact ? 'sm' : 'default'}
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving}
              className={compact ? 'h-7 text-xs' : ''}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Submit
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
