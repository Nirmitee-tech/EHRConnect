'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Eye, Edit, Copy, Archive, Download, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formsService } from '@/services/forms.service';
import type { FormTemplate } from '@/types/forms';
import { format } from 'date-fns';

export default function FormsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 100 };
      if (filter !== 'all') {
        params.status = filter;
      }
      const result = await formsService.listTemplates(params);
      setTemplates(result.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (templateId: string, title: string) => {
    try {
      const questionnaire = await formsService.exportTemplate(templateId);
      const blob = new Blob([JSON.stringify(questionnaire, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export template:', error);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      await formsService.duplicateTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleArchive = async (templateId: string) => {
    try {
      await formsService.archiveTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to archive template:', error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage FHIR-compliant form templates</p>
        </div>
        <Button onClick={() => router.push('/forms/builder')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Form Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'draft', 'archived'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as any)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No form templates yet</h3>
            <p className="text-gray-600 mb-4">Create your first form template to get started</p>
            <Button onClick={() => router.push('/forms/builder')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Form Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <Badge variant={getStatusVariant(template.status)} className="mt-2">
                      {template.status}
                    </Badge>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description || 'No description'}
                </p>

                <div className="flex flex-wrap gap-1">
                  {template.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags && template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>Version: {template.version}</div>
                  <div>
                    Created: {format(new Date(template.created_at), 'MMM d, yyyy')}
                  </div>
                  {template.usage_count > 0 && (
                    <div>Used {template.usage_count} times</div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/forms/preview/${template.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/forms/builder/${template.id}`)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(template.id)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExport(template.id, template.title)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  {template.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchive(template.id)}
                      className="flex-1"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
