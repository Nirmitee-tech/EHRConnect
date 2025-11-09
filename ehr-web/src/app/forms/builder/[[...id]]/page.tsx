'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formsService } from '@/services/forms.service';
import type { FHIRQuestionnaire, QuestionnaireItem } from '@/types/forms';

const QUESTION_TYPES = [
  { value: 'string', label: 'Text Input' },
  { value: 'text', label: 'Text Area' },
  { value: 'integer', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'choice', label: 'Multiple Choice' },
];

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id?.[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [questions, setQuestions] = useState<QuestionnaireItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const template = await formsService.getTemplate(templateId);
      setTitle(template.title);
      setDescription(template.description || '');
      setCategory(template.category);
      setQuestions(template.questionnaire.item || []);
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuestionnaireItem = {
      linkId: `question_${Date.now()}`,
      text: '',
      type: 'string',
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuestionnaireItem, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addChoice = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].answerOption) {
      updated[questionIndex].answerOption = [];
    }
    updated[questionIndex].answerOption!.push({ valueString: '' });
    setQuestions(updated);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].answerOption![choiceIndex] = { valueString: value };
    setQuestions(updated);
  };

  const deleteChoice = (questionIndex: number, choiceIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answerOption = updated[questionIndex].answerOption!.filter((_, i) => i !== choiceIndex);
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title) return;

    try {
      setSaving(true);

      const questionnaire: FHIRQuestionnaire = {
        resourceType: 'Questionnaire',
        title,
        status: 'draft',
        item: questions,
      };

      if (templateId) {
        await formsService.updateTemplate(templateId, { title, description, category, questionnaire });
      } else {
        await formsService.createTemplate({ title, description, category, tags: ['custom'], questionnaire });
      }

      router.push('/forms');
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/forms')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-600">{templateId ? 'Edit' : 'Create'} form template</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={!title || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Form Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Patient Intake Form" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this form is used for..." rows={2} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="general">General</option>
                <option value="intake">Patient Intake</option>
                <option value="assessment">Assessment</option>
                <option value="screening">Screening</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions</CardTitle>
            <Button onClick={addQuestion} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions yet. Click "Add Question" to start building your form.</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <Card key={q.linkId} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label>Question Text *</Label>
                            <Input value={q.text} onChange={(e) => updateQuestion(idx, 'text', e.target.value)} placeholder="Enter question..." />
                          </div>
                          <div className="w-48">
                            <Label>Type</Label>
                            <select value={q.type} onChange={(e) => updateQuestion(idx, 'type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                              {QUESTION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(idx, 'required', e.target.checked)} id={`required-${idx}`} className="rounded" />
                          <Label htmlFor={`required-${idx}`} className="font-normal cursor-pointer">Required field</Label>
                        </div>

                        {q.type === 'choice' && (
                          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            <div className="flex items-center justify-between">
                              <Label>Answer Options</Label>
                              <Button size="sm" variant="outline" onClick={() => addChoice(idx)}>
                                <Plus className="h-3 w-3 mr-1" />
                                Add Option
                              </Button>
                            </div>
                            {q.answerOption?.map((option, choiceIdx) => (
                              <div key={choiceIdx} className="flex gap-2">
                                <Input value={option.valueString || ''} onChange={(e) => updateChoice(idx, choiceIdx, e.target.value)} placeholder={`Option ${choiceIdx + 1}`} />
                                <Button size="sm" variant="ghost" onClick={() => deleteChoice(idx, choiceIdx)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteQuestion(idx)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
