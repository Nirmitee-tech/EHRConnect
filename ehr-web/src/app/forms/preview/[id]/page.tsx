'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formsService } from '@/services/forms.service';
import { CompactFormRenderer } from '@/features/forms/components/form-renderer/compact-form-renderer';
import type { FormTemplate, FHIRQuestionnaire } from '@/types/forms';
import { SidebarToggle } from '@/components/forms/sidebar-toggle';

export default function FormPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure auth headers are set in localStorage
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', '0df77487-970d-4245-acd5-b2a6504e88cd');
      }
      if (!localStorage.getItem('orgId')) {
        localStorage.setItem('orgId', '1200d873-8725-439a-8bbe-e6d4e7c26338');
      }
    }

    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await formsService.getTemplate(templateId);
      setTemplate(data.template);
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Form not found</h2>
          <Button onClick={() => router.push('/forms')} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Forms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Top Bar */}
      <div className="flex-shrink-0 bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-base font-semibold text-gray-900">{template.title}</h1>
            <p className="text-xs text-gray-500">Preview Mode - Read Only</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push(`/forms/fill/${templateId}`)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="h-3 w-3 mr-1" />
            Fill Form
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/forms/builder/${templateId}`)}
            className="h-8 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Preview Content - No padding, full height */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>Preview Mode:</strong> This is a read-only preview. Use "Fill Form" to test submission.
            </p>
          </div>
          <CompactFormRenderer
            questionnaire={template.questionnaire as FHIRQuestionnaire}
            onSubmit={async () => {
              alert('This is preview mode. Form submission is disabled.');
            }}
            readonly={true}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
