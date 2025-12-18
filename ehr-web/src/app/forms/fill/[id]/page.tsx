'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { formsService } from '@/services/forms.service';
import type { FHIRQuestionnaire, QuestionnaireItem } from '@/types/forms';
import { cn } from '@/lib/utils';
import { SidebarToggle } from '@/components/forms/sidebar-toggle';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface FormProgress {
  completed: number;
  total: number;
  percentage: number;
}

export default function FormFillPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const templateId = params?.id as string;
  const patientId = params?.patientId as string | undefined;
  const encounterId = params?.encounterId as string | undefined;
  const orgIdParam = searchParams?.get('orgId');
  const DEFAULT_ORG_ID = '1200d873-8725-439a-8bbe-e6d4e7c26338';

  const [questionnaire, setQuestionnaire] = useState<FHIRQuestionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progress, setProgress] = useState<FormProgress>({ completed: 0, total: 0, percentage: 0 });

  // Load form
  useEffect(() => {
    loadForm();
  }, [templateId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!questionnaire || submitted) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [answers, questionnaire, submitted]);

  // Calculate progress
  useEffect(() => {
    if (!questionnaire?.item) return;

    const countQuestions = (items: QuestionnaireItem[]): number => {
      return items.reduce((count, item) => {
        if (item.type === 'display' || item.type === 'group') {
          return count + (item.item ? countQuestions(item.item) : 0);
        }
        return count + 1;
      }, 0);
    };

    const countAnswered = (items: QuestionnaireItem[]): number => {
      return items.reduce((count, item) => {
        if (item.type === 'display' || item.type === 'group') {
          return count + (item.item ? countAnswered(item.item) : 0);
        }
        const hasAnswer = answers[item.linkId] !== undefined && answers[item.linkId] !== null && answers[item.linkId] !== '';
        return count + (hasAnswer ? 1 : 0);
      }, 0);
    };

    const total = countQuestions(questionnaire.item);
    const completed = countAnswered(questionnaire.item);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    setProgress({ completed, total, percentage });
  }, [answers, questionnaire]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      if (userId) {
        const template = await formsService.getTemplate(templateId);
        setQuestionnaire(template.questionnaire as FHIRQuestionnaire);
      } else {
        // Public access
        const orgId = orgIdParam || (typeof window !== 'undefined' ? localStorage.getItem('orgId') : null) || DEFAULT_ORG_ID;
        const template = await formsService.getPublicTemplate(templateId, orgId);
        setQuestionnaire(template.questionnaire as FHIRQuestionnaire);
      }
    } catch (error: any) {
      console.error('Failed to load form:', error);
      setErrors(prev => ({ ...prev, global: error.message || 'Unknown error' }));
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (linkId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [linkId]: value }));
    setTouched(prev => ({ ...prev, [linkId]: true }));

    // Clear error when user types
    if (errors[linkId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[linkId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const validateItems = (items: QuestionnaireItem[]) => {
      items.forEach(item => {
        if (item.required && (answers[item.linkId] === undefined || answers[item.linkId] === null || answers[item.linkId] === '')) {
          newErrors[item.linkId] = 'This field is required';
        }
        if (item.item) {
          validateItems(item.item);
        }
      });
    };

    if (questionnaire?.item) {
      validateItems(questionnaire.item);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildQuestionnaireResponse = (status: 'in-progress' | 'completed') => {
    const buildResponseItems = (items: QuestionnaireItem[]): any[] => {
      return items
        .map(item => {
          const answer = answers[item.linkId];
          const responseItem: any = {
            linkId: item.linkId,
            text: item.text,
          };

          if (answer !== undefined && answer !== null && answer !== '') {
            if (item.type === 'boolean') {
              responseItem.answer = [{ valueBoolean: answer }];
            } else if (item.type === 'integer') {
              responseItem.answer = [{ valueInteger: parseInt(answer) }];
            } else if (item.type === 'decimal') {
              responseItem.answer = [{ valueDecimal: parseFloat(answer) }];
            } else if (item.type === 'date') {
              responseItem.answer = [{ valueDate: answer }];
            } else if (item.type === 'time') {
              responseItem.answer = [{ valueTime: answer }];
            } else if (item.type === 'dateTime') {
              responseItem.answer = [{ valueDateTime: answer }];
            } else if (item.type === 'choice') {
              responseItem.answer = [{ valueCoding: { code: answer, display: answer } }];
            } else {
              responseItem.answer = [{ valueString: answer }];
            }
          }

          if (item.item) {
            responseItem.item = buildResponseItems(item.item);
          }

          return responseItem;
        })
        .filter(item => item.answer || item.item);
    };

    return {
      resourceType: 'QuestionnaireResponse',
      status,
      questionnaire: questionnaire?.url || `Questionnaire/${templateId}`,
      authored: new Date().toISOString(),
      item: questionnaire?.item ? buildResponseItems(questionnaire.item) : [],
    };
  };

  const handleAutoSave = async () => {
    if (Object.keys(answers).length === 0) return;

    try {
      setAutoSaving(true);
      const response = buildQuestionnaireResponse('in-progress');

      if (draftId) {
        await formsService.updateResponse(draftId, { response });
      } else {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        let created;

        if (userId) {
          created = await formsService.createResponse({
            form_template_id: templateId,
            patient_id: patientId || undefined,
            encounter_id: encounterId || undefined,
            response,
          });
        } else {
          // Public submission
          const orgId = orgIdParam || (typeof window !== 'undefined' ? localStorage.getItem('orgId') : null) || DEFAULT_ORG_ID;
          created = await formsService.submitPublicResponse(orgId, {
            form_template_id: templateId,
            patient_id: patientId || undefined,
            response,
          });
        }
        setDraftId(created.id);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allFields: Record<string, boolean> = {};
    const markTouched = (items: QuestionnaireItem[]) => {
      items.forEach(item => {
        if (item.type !== 'display') {
          allFields[item.linkId] = true;
        }
        if (item.item) {
          markTouched(item.item);
        }
      });
    };
    if (questionnaire?.item) {
      markTouched(questionnaire.item);
    }
    setTouched(allFields);

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(`q-${firstError}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }

    try {
      setSubmitting(true);
      const response = buildQuestionnaireResponse('completed');

      if (draftId) {
        await formsService.updateResponse(draftId, { response });
      } else {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

        if (userId) {
          await formsService.createResponse({
            form_template_id: templateId,
            patient_id: patientId || undefined,
            encounter_id: encounterId || undefined,
            response,
          });
        } else {
          // Public submission
          const orgId = orgIdParam || (typeof window !== 'undefined' ? localStorage.getItem('orgId') : null) || DEFAULT_ORG_ID;
          await formsService.submitPublicResponse(orgId, {
            form_template_id: templateId,
            patient_id: patientId || undefined,
            response,
          });
        }
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (item: QuestionnaireItem) => {
    const value = answers[item.linkId] || '';
    const hasError = touched[item.linkId] && !!errors[item.linkId];

    switch (item.type) {
      case 'string':
        return (
          <Input
            value={value}
            onChange={(e) => updateAnswer(item.linkId, e.target.value)}
            placeholder="Enter your answer"
            maxLength={item.maxLength}
            className={cn('h-9', hasError && 'border-red-500')}
          />
        );

      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateAnswer(item.linkId, e.target.value)}
            placeholder="Enter your answer"
            rows={3}
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'integer':
      case 'decimal':
        return (
          <Input
            type="number"
            step={item.type === 'decimal' ? '0.01' : '1'}
            value={value}
            onChange={(e) => updateAnswer(item.linkId, e.target.value)}
            placeholder="0"
            className={cn('h-9', hasError && 'border-red-500')}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateAnswer(item.linkId, e.target.value)}
            className={cn('h-9', hasError && 'border-red-500')}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={value}
            onChange={(e) => updateAnswer(item.linkId, e.target.value)}
            className={cn('h-9', hasError && 'border-red-500')}
          />
        );

      case 'dateTime':
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => updateAnswer(item.linkId, e.target.value)}
            className={cn('h-9', hasError && 'border-red-500')}
          />
        );

      case 'boolean':
        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateAnswer(item.linkId, true)}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                value === true
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => updateAnswer(item.linkId, false)}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium',
                value === false
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
            >
              No
            </button>
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-2">
            {item.answerOption?.map((option, idx) => {
              const optionValue = option.valueCoding?.code || option.valueString || '';
              const optionLabel = option.valueCoding?.display || option.valueString || '';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateAnswer(item.linkId, optionValue)}
                  className={cn(
                    'w-full text-left py-3 px-4 rounded-lg border-2 transition-all',
                    value === optionValue
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  )}
                >
                  {optionLabel}
                </button>
              );
            })}
          </div>
        );

      case 'display':
        return (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            {item.text}
          </div>
        );

      default:
        return null;
    }
  };

  const renderQuestion = (item: QuestionnaireItem, index: number) => {
    if (item.type === 'display') {
      return (
        <div key={item.linkId} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-900">
          {item.text}
        </div>
      );
    }

    if (item.type === 'group') {
      return (
        <div key={item.linkId} className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 pb-2 border-b">{item.text}</h3>
          <div className="pl-3 space-y-3">
            {item.item?.map((subItem, subIdx) => renderQuestion(subItem, subIdx))}
          </div>
        </div>
      );
    }

    const hasAnswer = answers[item.linkId] !== undefined && answers[item.linkId] !== null && answers[item.linkId] !== '';
    const hasError = touched[item.linkId] && !!errors[item.linkId];

    return (
      <div key={item.linkId} id={`q-${item.linkId}`} className="scroll-mt-20">
        <div className={cn(
          'p-4 rounded-lg border-2 transition-all',
          hasError ? 'border-red-400 bg-red-50/50' : hasAnswer ? 'border-green-400 bg-green-50/50' : 'border-gray-200 bg-white'
        )}>
          <Label className="block text-sm font-medium text-gray-900 mb-2">
            {item.text}
            {item.required && <span className="text-red-600 ml-1">*</span>}
          </Label>

          {renderInput(item)}

          {hasError && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors[item.linkId]}</span>
            </div>
          )}

          {hasAnswer && !hasError && (
            <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Answered</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderItems = (items: QuestionnaireItem[]) => {
    return items.map((item, idx) => renderQuestion(item, idx));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
        <Card className="max-w-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm">
            The form you're looking for doesn't exist or could not be loaded.
          </p>
          {Object.keys(errors).length > 0 && errors.global && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
              Error: {errors.global}
            </div>
          )}
          <Button onClick={() => router.push('/forms')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Back to Forms
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted!</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Thank you for completing <strong>{questionnaire.title}</strong>
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-semibold">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Questions:</span>
              <span className="font-semibold">{progress.completed} of {progress.total}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.push('/forms')} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
            <Button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Submit Another Response
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Ultra Compact Header */}
      <div className="flex-shrink-0 bg-white border-b px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/forms')}
            className="h-6 px-1.5 text-xs"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Exit
          </Button>
          <div className="border-l pl-2 ml-1">
            <h1 className="text-sm font-semibold text-gray-900 leading-none">{questionnaire.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          )}
          {lastSaved && !autoSaving && (
            <span className="text-xs text-gray-400">
              {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
            <span className="font-medium">{progress.percentage}%</span>
            <span className="text-gray-400">•</span>
            <span>{progress.completed}/{progress.total}</span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="sm"
            className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Submitting
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-1" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Thin Progress Bar */}
      <div className="flex-shrink-0 h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Form Content - Full Height Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-4">

          {/* Questions */}
          <div className="space-y-3">
            {questionnaire.item && renderItems(questionnaire.item)}
          </div>

          {/* Bottom Submit - Compact */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-xs text-gray-700">
              {progress.completed === progress.total
                ? 'All questions answered! Ready to submit.'
                : `${progress.total - progress.completed} questions remaining`}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="sm"
              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
