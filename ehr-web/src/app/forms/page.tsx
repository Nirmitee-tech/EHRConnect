'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Share2, MoreVertical, Loader2, ChevronDown, FileText,
  Copy, Check, Mail, MessageSquare, Filter, SortAsc, SortDesc,
  Calendar, Eye, Edit, Archive, Trash2, Download, BarChart3,
  TrendingUp, Users, FileCheck, Clock, Grid, List as ListIcon,
  RefreshCw, Settings, Star, StarOff, ChevronRight, ArrowUpDown,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formsService } from '@/services/forms.service';
import type { FormTemplate } from '@/types/forms';
import { SidebarToggle } from '@/components/forms/sidebar-toggle';
import { cn } from '@/lib/utils';

type ViewMode = 'table' | 'grid';
type SortField = 'title' | 'updated_at' | 'usage_count' | 'status';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZES = [10, 20, 50, 100];

export default function FormsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('form-favorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setTimeout(() => setRefreshing(false), 500);
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
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
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

  const handleBulkArchive = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => formsService.archiveTemplate(id)));
      await loadTemplates();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to bulk archive:', error);
    }
  };

  const handleBulkExport = async () => {
    try {
      for (const id of Array.from(selectedIds)) {
        const template = templates.find(t => t.id === id);
        if (template) {
          await handleExport(id, template.title);
        }
      }
    } catch (error) {
      console.error('Failed to bulk export:', error);
    }
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      localStorage.setItem('form-favorites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTemplates.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalForms = templates.length;
    const activeForms = templates.filter(t => t.status === 'active').length;
    const draftForms = templates.filter(t => t.status === 'draft').length;
    const totalResponses = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);

    return { totalForms, activeForms, draftForms, totalResponses };
  }, [templates]);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let result = templates.filter(template => {
      const matchesSearch = searchQuery === '' ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'usage_count') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (sortField === 'title') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Favorites first
    result.sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

    return result;
  }, [templates, searchQuery, sortField, sortOrder, favorites]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTemplates.length / pageSize);
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedTemplates.slice(startIndex, endIndex);
  }, [filteredAndSortedTemplates, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, sortField, sortOrder]);

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading form templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Forms</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalForms}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{stats.activeForms}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Drafts</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.draftForms}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Responses</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">{stats.totalResponses}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header - Enhanced */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <SidebarToggle />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">Form Templates</h1>
              {selectedIds.size > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedIds.size} selected
                </Badge>
              )}
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search forms by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="gap-2 h-9"
                >
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  className="gap-2 h-9 text-red-600 hover:text-red-700"
                >
                  <Archive className="h-4 w-4" />
                  Archive Selected
                </Button>
                <div className="h-6 w-px bg-gray-200 mx-1" />
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={cn("gap-2 h-9", refreshing && "opacity-50")}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Filter className="h-4 w-4" />
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['all', 'active', 'draft', 'archived'].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className="capitalize"
                  >
                    {status === filter && <Check className="h-4 w-4 mr-2" />}
                    {status === filter ? '' : <span className="w-6" />}
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('title')}>
                  {sortField === 'title' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />)}
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('updated_at')}>
                  {sortField === 'updated_at' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />)}
                  Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('usage_count')}>
                  {sortField === 'usage_count' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />)}
                  Usage Count
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('status')}>
                  {sortField === 'status' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />)}
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('table')}
                className={cn(
                  "h-7 w-7 p-0",
                  viewMode === 'table' && "bg-white shadow-sm text-blue-600"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "h-7 w-7 p-0",
                  viewMode === 'grid' && "bg-white shadow-sm text-blue-600"
                )}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/forms/responses')}
              className="gap-2 h-9"
            >
              <FileText className="h-4 w-4" />
              <span className="text-gray-700">Submissions</span>
            </Button>

            <Button
              onClick={() => router.push('/forms/builder')}
              size="sm"
              className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first form template to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/forms/builder')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 w-12">
                      <Checkbox
                        checked={selectedIds.size === paginatedTemplates.length && paginatedTemplates.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Responses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className={cn(
                        "hover:bg-gray-50 transition-colors group",
                        selectedIds.has(template.id) && "bg-blue-50"
                      )}
                    >
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedIds.has(template.id)}
                          onCheckedChange={() => toggleSelect(template.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleFavorite(template.id)}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            {favorites.has(template.id) ? (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                              {template.title}
                            </div>
                            <div className="text-xs text-gray-500 font-mono truncate max-w-md">
                              {template.fhir_url || `forms.aidbox.io/questionnaire/${template.id}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={getStatusVariant(template.status)}
                          className={cn("text-xs font-medium capitalize border", getStatusColor(template.status))}
                        >
                          {template.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                          <Users className="h-3 w-3 text-gray-400" />
                          {template.usage_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(template.updated_at || template.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/forms/preview/${template.id}`)}
                            className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openShareDialog(template)}
                            className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
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
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {template.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handlePublish(template.id)}
                                  className="text-green-600"
                                >
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(template.id)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleExport(template.id, template.title)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {template.status !== 'archived' && (
                                <DropdownMenuItem
                                  onClick={() => handleArchive(template.id)}
                                  className="text-red-600"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
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

            {/* Pagination Controls */}
            {filteredAndSortedTemplates.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedTemplates.length)} of {filteredAndSortedTemplates.length} results
                  </span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-[100px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} / page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={cn(
                            "h-9 w-9",
                            currentPage === pageNum && "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedTemplates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden",
                    selectedIds.has(template.id) && "ring-2 ring-blue-500"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Checkbox
                        checked={selectedIds.has(template.id)}
                        onCheckedChange={() => toggleSelect(template.id)}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          {favorites.has(template.id) ? (
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/forms/builder/${template.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {template.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handlePublish(template.id)}
                                className="text-green-600"
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(template.id, template.title)}>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {template.status !== 'archived' && (
                              <DropdownMenuItem
                                onClick={() => handleArchive(template.id)}
                                className="text-red-600"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {template.title}
                      </h3>
                      {template.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant={getStatusVariant(template.status)}
                        className={cn("text-xs capitalize border", getStatusColor(template.status))}
                      >
                        {template.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        {template.usage_count || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/forms/preview/${template.id}`)}
                        className="h-7 text-xs flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openShareDialog(template)}
                        className="h-7 text-xs flex-1"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls for Grid View */}
            {filteredAndSortedTemplates.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedTemplates.length)} of {filteredAndSortedTemplates.length} results
                  </span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-[100px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} / page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={cn(
                            "h-9 w-9",
                            currentPage === pageNum && "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
                <Button size="sm" onClick={copyToClipboard} className="px-3 bg-blue-600 hover:bg-blue-700 text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Email integration coming soon')}>
                  <Mail className="h-4 w-4" />
                  <span className="text-gray-700">Email Link</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('SMS integration coming soon')}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-gray-700">Send SMS</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
