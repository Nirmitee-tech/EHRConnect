'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Share2, MoreVertical, Loader2, ChevronDown, FileText, Copy, Check, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formsService } from '@/services/forms.service';
import type { FormTemplate } from '@/types/forms';
import { SidebarToggle } from '@/components/forms/sidebar-toggle';

export default function FormsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Share Dialog State
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handlePublish = async (templateId: string) => {
    try {
      await formsService.publishTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to publish template:', error);
    }
  };

  const openShareDialog = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!selectedTemplate) return;
    const orgId = localStorage.getItem('orgId') || '1200d873-8725-439a-8bbe-e6d4e7c26338';
    const url = `${window.location.origin}/forms/fill/${selectedTemplate.id}?orgId=${orgId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <h1 className="text-base font-semibold text-gray-900">Form Templates</h1>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 w-48 h-7 text-xs bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-7 text-xs"
              onClick={() => router.push('/forms/responses')}
            >
              <FileText className="h-3 w-3" />
              Submissions
            </Button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                  {filter.toUpperCase()}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['all', 'active', 'draft', 'archived'].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className="capitalize text-xs"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => router.push('/forms/builder')} size="sm" className="gap-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3 w-3" />
              New Template
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No templates found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first form template to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/forms/builder')} size="sm" className="gap-2 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-100">
                  {filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* Template Name & URL */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {template.title}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {template.fhir_url || `http://forms.aidbox.io/questionnaire/${template.id}`}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 w-32">
                        <Badge
                          variant={getStatusVariant(template.status)}
                          className="text-xs font-medium capitalize"
                        >
                          {template.status}
                        </Badge>
                      </td>

                      {/* Usage Count */}
                      <td className="px-6 py-4 w-24 text-center">
                        <span className="text-sm text-gray-700">
                          {template.usage_count || 1}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/forms/preview/${template.id}`)}
                            className="h-8 text-xs"
                          >
                            PREVIEW
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openShareDialog(template)}
                            className="h-8 text-xs"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            SHARE
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/forms/builder/${template.id}`)}
                              >
                                Edit
                              </DropdownMenuItem>
                              {template.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handlePublish(template.id)}
                                  className="text-green-600"
                                >
                                  Publish (Make Active)
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(template.id)}
                              >
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleExport(template.id, template.title)}
                              >
                                Export
                              </DropdownMenuItem>
                              {template.status !== 'archived' && (
                                <DropdownMenuItem
                                  onClick={() => handleArchive(template.id)}
                                  className="text-red-600"
                                >
                                  Archive
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Form</DialogTitle>
            <DialogDescription>
              Share this link with patients to fill out the form.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/forms/fill/${selectedTemplate.id}?orgId=${typeof window !== 'undefined' ? localStorage.getItem('orgId') || '1200d873-8725-439a-8bbe-e6d4e7c26338' : ''}`}
                    className="h-9 text-xs"
                  />
                </div>
                <Button size="sm" onClick={copyToClipboard} className="px-3">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Email integration coming soon')}>
                  <Mail className="h-4 w-4" />
                  Email Link
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('SMS integration coming soon')}>
                  <MessageSquare className="h-4 w-4" />
                  Send SMS
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
