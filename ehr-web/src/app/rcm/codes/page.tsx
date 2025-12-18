'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  DownloadCloud,
  FileSpreadsheet,
  Plus,
  RefreshCcw,
  Search,
  Upload,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

type CodeCategory = 'icd' | 'cpt' | 'other';

type CodeRecord = {
  code: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive';
  lastUpdated: string;
};

type UploadState = {
  isUploading: boolean;
  error: string | null;
  success: string | null;
};

const CODE_TABS: { key: CodeCategory; label: string; helper: string }[] = [
  { key: 'icd', label: 'ICD Codes', helper: 'Diagnosis and condition codes for clinical documentation and billing' },
  { key: 'cpt', label: 'CPT Codes', helper: 'Procedure codes used for billing and revenue cycle workflows' },
  { key: 'other', label: 'Other Code Sets', helper: 'Custom internal codes, HCPCS, SNOMED, or payer-specific mappings' }
];

const INITIAL_CODE_SETS: Record<CodeCategory, CodeRecord[]> = {
  icd: [
    {
      code: 'E11.9',
      description: 'Type 2 diabetes mellitus without complications',
      category: 'Endocrine',
      status: 'Active',
      lastUpdated: '2024-03-12'
    },
    {
      code: 'I10',
      description: 'Essential (primary) hypertension',
      category: 'Cardiology',
      status: 'Active',
      lastUpdated: '2024-02-28'
    }
  ],
  cpt: [
    {
      code: '99213',
      description: 'Office or other outpatient visit, established patient (20-29 minutes)',
      category: 'Evaluation & Management',
      status: 'Active',
      lastUpdated: '2024-01-15'
    },
    {
      code: '93000',
      description: 'Electrocardiogram, routine ECG with at least 12 leads',
      category: 'Cardiology',
      status: 'Active',
      lastUpdated: '2023-12-02'
    }
  ],
  other: [
    {
      code: 'A0428',
      description: 'Ambulance service, basic life support, non-emergency transport',
      category: 'HCPCS',
      status: 'Active',
      lastUpdated: '2023-11-10'
    }
  ]
};

const DEFAULT_UPLOAD_STATE: UploadState = {
  isUploading: false,
  error: null,
  success: null
};

export default function CodeSetManagementPage() {
  const [activeTab, setActiveTab] = useState<CodeCategory>('icd');
  const [codeSets, setCodeSets] = useState<Record<CodeCategory, CodeRecord[]>>(INITIAL_CODE_SETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState<Omit<CodeRecord, 'lastUpdated'>>({
    code: '',
    description: '',
    category: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [recentAction, setRecentAction] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<Record<CodeCategory, UploadState>>({
    icd: { ...DEFAULT_UPLOAD_STATE },
    cpt: { ...DEFAULT_UPLOAD_STATE },
    other: { ...DEFAULT_UPLOAD_STATE }
  });

  const uploadInputRefs = useRef<Record<CodeCategory, HTMLInputElement | null>>({
    icd: null,
    cpt: null,
    other: null
  });

  const filteredCodes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return codeSets[activeTab];
    }

    return codeSets[activeTab].filter((entry) =>
      [entry.code, entry.description, entry.category, entry.status]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [activeTab, codeSets, searchQuery]);

  const resetForm = () => {
    setNewCode({ code: '', description: '', category: '', status: 'Active' });
    setFormError(null);
  };

  const handleCreateCode = () => {
    if (!newCode.code.trim() || !newCode.description.trim()) {
      setFormError('Code and description are required to add a new entry.');
      return;
    }

    const normalizedCode = newCode.code.trim().toUpperCase();
    const timestamp = new Date().toISOString().slice(0, 10);

    setCodeSets((previous) => ({
      ...previous,
      [activeTab]: [
        {
          code: normalizedCode,
          description: newCode.description.trim(),
          category: newCode.category.trim() || 'General',
          status: newCode.status,
          lastUpdated: timestamp
        },
        ...previous[activeTab]
      ]
    }));

    setRecentAction(`${CODE_TABS.find((tab) => tab.key === activeTab)?.label || 'Code'} list updated with ${normalizedCode}.`);
    resetForm();
    setShowCreateForm(false);
  };

  const updateUploadState = (category: CodeCategory, update: Partial<UploadState>) => {
    setUploadStates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...update
      }
    }));
  };

  const handleUpload = async (category: CodeCategory, file: File) => {
    if (!file) return;

    updateUploadState(category, { isUploading: true, error: null, success: null });

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);

      if (lines.length === 0) {
        throw new Error('The uploaded file is empty.');
      }

      const hasHeader = lines[0].toLowerCase().includes('code');
      const records = (hasHeader ? lines.slice(1) : lines).map((line) => {
        const [code, description, categoryValue, status] = line
          .split(',')
          .map((value) => value.trim().replace(/^"|"$/g, ''));

        if (!code || !description) {
          throw new Error('Each row must include at least a code and description.');
        }

        return {
          code: code.toUpperCase(),
          description: description || 'Unspecified description',
          category: categoryValue || 'General',
          status: (status?.toLowerCase() === 'inactive' ? 'Inactive' : 'Active') as CodeRecord['status'],
          lastUpdated: new Date().toISOString().slice(0, 10)
        } satisfies CodeRecord;
      });

      setCodeSets((prev) => ({
        ...prev,
        [category]: [...records, ...prev[category]]
      }));

      const successMessage = `${records.length} ${category.toUpperCase()} codes uploaded successfully.`;
      updateUploadState(category, { success: successMessage });
      setRecentAction(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to process the uploaded file.';
      updateUploadState(category, { error: message });
    } finally {
      updateUploadState(category, { isUploading: false });
      if (uploadInputRefs.current[category]) {
        uploadInputRefs.current[category]!.value = '';
      }
    }
  };

  const handleDownload = (category: CodeCategory) => {
    const records = codeSets[category];
    const header = 'code,description,category,status,lastUpdated';
    const csvBody = records
      .map((entry) =>
        [entry.code, entry.description, entry.category, entry.status, entry.lastUpdated]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const csvContent = `${header}\n${csvBody}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${category}-codes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setRecentAction(`Downloaded ${records.length} ${category.toUpperCase()} codes.`);
  };

  const handleRefresh = () => {
    setCodeSets(INITIAL_CODE_SETS);
    setRecentAction('Code lists restored to the latest synced values.');
  };

  const activeUploadState = uploadStates[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Code Set Management</h1>
          <p className="text-gray-600 mt-1 max-w-3xl">
            Maintain ICD, CPT, and custom reimbursement code lists used throughout revenue cycle and analytics workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reset Lists
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Code
          </Button>
        </div>
      </div>

      {recentAction && (
        <Card className="border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="flex items-center gap-2 font-medium">
            <FileSpreadsheet className="h-4 w-4" />
            {recentAction}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {CODE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearchQuery('');
              setShowCreateForm(false);
              setFormError(null);
            }}
            className={cn(
              'rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200',
              activeTab === tab.key
                ? 'border-blue-500 bg-blue-500 text-white shadow'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {CODE_TABS.find((tab) => tab.key === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-600">
              {CODE_TABS.find((tab) => tab.key === activeTab)?.helper}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search codes, descriptions, or categories..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={(ref) => {
                  uploadInputRefs.current[activeTab] = ref;
                }}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleUpload(activeTab, file);
                  }
                }}
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => uploadInputRefs.current[activeTab]?.click()}
                disabled={activeUploadState.isUploading}
              >
                {activeUploadState.isUploading ? (
                  <Upload className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpFromLine className="h-4 w-4" />
                )}
                Upload CSV
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleDownload(activeTab)}>
                <ArrowDownToLine className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>

        {(activeUploadState.error || activeUploadState.success) && (
          <div
            className={cn(
              'mt-4 rounded-lg border p-3 text-sm',
              activeUploadState.error
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            )}
          >
            {activeUploadState.error || activeUploadState.success}
          </div>
        )}

        {showCreateForm && (
          <div className="mt-6 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Add a new code</h3>
                <p className="text-sm text-blue-700">
                  Capture the essential metadata required for downstream billing exports.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <Input
                  value={newCode.code}
                  onChange={(event) => setNewCode((previous) => ({ ...previous, code: event.target.value }))}
                  placeholder="e.g., E11.9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Input
                  value={newCode.category}
                  onChange={(event) => setNewCode((previous) => ({ ...previous, category: event.target.value }))}
                  placeholder="Specialty, payer, or internal grouping"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description *</label>
                <Input
                  value={newCode.description}
                  onChange={(event) => setNewCode((previous) => ({ ...previous, description: event.target.value }))}
                  placeholder="Official description used for billing"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newCode.status}
                  onChange={(event) =>
                    setNewCode((previous) => ({ ...previous, status: event.target.value as CodeRecord['status'] }))
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-600">{formError}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={handleCreateCode} className="gap-2">
                <UploadCloud className="h-4 w-4" />
                Save Code
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Clear Fields
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                      <DownloadCloud className="h-10 w-10 text-gray-300" />
                      <p className="text-base font-medium text-gray-700">No codes match the current filters</p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search terms or upload a CSV to seed this code list.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCodes.map((entry) => (
                  <tr key={`${entry.code}-${entry.lastUpdated}`} className="hover:bg-blue-50/40">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{entry.code}</td>
                    <td className="px-4 py-3 text-gray-700">{entry.description}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {entry.category || 'General'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant={entry.status === 'Active' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{entry.lastUpdated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
