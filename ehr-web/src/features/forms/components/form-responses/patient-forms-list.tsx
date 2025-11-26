/**
 * Patient Forms List
 * Compact view of all form responses for a patient
 * Can be embedded in patient sidebar or detail view
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  ScrollArea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../shared/simple-ui';
import {
  FileText,
  Plus,
  Calendar,
  User,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { formsService } from '@/services/forms.service';
import { CompactFormRenderer } from '../form-renderer/compact-form-renderer';
import type {
  FormResponse,
  FormTemplate,
  FHIRQuestionnaire,
  FHIRQuestionnaireResponse,
} from '@/types/forms';

interface PatientFormsListProps {
  patientId: string;
  encounterId?: string;
  episodeId?: string;
  compact?: boolean;
  maxHeight?: string;
}

export function PatientFormsList({
  patientId,
  encounterId,
  episodeId,
  compact = true,
  maxHeight = '400px',
}: PatientFormsListProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // Load form responses for patient
  useEffect(() => {
    loadResponses();
    loadTemplates();
  }, [patientId, encounterId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const result = await formsService.listResponses({
        patient_id: patientId,
        encounter_id: encounterId,
        pageSize: 100,
      });
      setResponses(result.responses);
    } catch (error) {
      console.error('Failed to load form responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const result = await formsService.listTemplates({
        status: 'active',
        pageSize: 100,
      });
      setTemplates(result.templates);
    } catch (error) {
      console.error('Failed to load form templates:', error);
    }
  };

  const handleSubmitNewForm = async (response: FHIRQuestionnaireResponse) => {
    try {
      await formsService.createResponse({
        form_template_id: selectedTemplate!.id,
        patient_id: patientId,
        encounter_id: encounterId,
        episode_id: episodeId,
        response,
      });

      setShowNewForm(false);
      setSelectedTemplate(null);
      await loadResponses();
    } catch (error) {
      console.error('Failed to submit form:', error);
      throw error;
    }
  };

  const handleViewResponse = (response: FormResponse) => {
    setSelectedResponse(response);
    setShowResponse(true);
  };

  const handleNewForm = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setShowNewForm(true);
  };

  if (loading) {
    return (
      <Card className={compact ? 'shadow-sm' : ''}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={compact ? 'shadow-sm' : ''}>
        <CardHeader className={compact ? 'p-3 pb-2' : 'p-4'}>
          <div className="flex items-center justify-between">
            <CardTitle className={compact ? 'text-sm' : 'text-base'}>
              Forms & Assessments
            </CardTitle>
            {templates.length > 0 && (
              <Button
                variant="ghost"
                size={compact ? 'sm' : 'default'}
                className={compact ? 'h-6 text-xs' : ''}
                onClick={() => {
                  if (templates.length === 1) {
                    handleNewForm(templates[0]);
                  } else {
                    // Show template selector (simplified for now)
                    handleNewForm(templates[0]);
                  }
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                New Form
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
          <ScrollArea style={{ maxHeight }}>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className={compact ? 'text-xs' : 'text-sm'}>No forms submitted yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className={`group flex items-center justify-between ${
                      compact ? 'p-2' : 'p-3'
                    } rounded-lg border hover:bg-accent cursor-pointer transition-colors`}
                    onClick={() => handleViewResponse(response)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                        <span
                          className={`font-medium truncate ${
                            compact ? 'text-xs' : 'text-sm'
                          }`}
                        >
                          {response.form_title}
                        </span>
                        <Badge
                          variant={response.status === 'completed' ? 'default' : 'secondary'}
                          className={compact ? 'text-[10px] h-4 px-1' : 'text-xs'}
                        >
                          {response.status}
                        </Badge>
                      </div>
                      <div
                        className={`flex items-center gap-3 text-muted-foreground mt-1 ${
                          compact ? 'text-[10px]' : 'text-xs'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                          {response.submitted_at
                            ? format(new Date(response.submitted_at), 'MMM d, yyyy')
                            : format(new Date(response.created_at), 'MMM d, yyyy')}
                        </span>
                        {response.practitioner_id && (
                          <span className="flex items-center gap-1">
                            <User className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                            Provider
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={`${
                        compact ? 'h-3 w-3' : 'h-4 w-4'
                      } text-muted-foreground group-hover:text-foreground transition-colors`}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* New Form Dialog */}
      {selectedTemplate && (
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fill Form</DialogTitle>
            </DialogHeader>
            <CompactFormRenderer
              questionnaire={selectedTemplate.questionnaire as FHIRQuestionnaire}
              patientId={patientId}
              encounterId={encounterId}
              onSubmit={handleSubmitNewForm}
              compact={false}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Response Dialog */}
      {selectedResponse && (
        <Dialog open={showResponse} onOpenChange={setShowResponse}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedResponse.form_title}</DialogTitle>
            </DialogHeader>
            <CompactFormRenderer
              questionnaire={selectedResponse.form_questionnaire as FHIRQuestionnaire}
              initialResponse={selectedResponse.response as FHIRQuestionnaireResponse}
              readonly
              compact={false}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
