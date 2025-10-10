'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  Star,
  StarOff,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MedicalCode {
  id: string;
  code: string;
  description: string;
  code_type: 'icd10' | 'cpt' | 'hcpcs' | 'loinc' | 'snomed' | 'rxnorm' | 'ndc' | 'custom';
  category: string;
  subcategory?: string;
  version: string;
  effective_date: string;
  termination_date?: string;
  is_active: boolean;
  is_favorite?: boolean;
  usage_count?: number;
  last_used?: string;
  billable?: boolean;
  requires_auth?: boolean;
  age_range?: string;
  gender?: 'male' | 'female' | 'both';
  notes?: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CSVColumnMapping {
  csvColumn: string;
  mappedTo: string;
  sample?: string;
  isRequired: boolean;
  detected: boolean;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

const CODE_TYPES = [
  { value: 'icd10', label: 'ICD-10-CM', description: 'Diagnosis Codes', color: 'blue' },
  { value: 'cpt', label: 'CPT', description: 'Procedure Codes', color: 'emerald' },
  { value: 'hcpcs', label: 'HCPCS', description: 'Healthcare Codes', color: 'purple' },
  { value: 'loinc', label: 'LOINC', description: 'Lab/Observation', color: 'orange' },
  { value: 'snomed', label: 'SNOMED CT', description: 'Clinical Terms', color: 'teal' },
  { value: 'rxnorm', label: 'RxNorm', description: 'Medications', color: 'pink' },
  { value: 'ndc', label: 'NDC', description: 'Drug Codes', color: 'indigo' },
  { value: 'custom', label: 'Custom', description: 'Custom Codes', color: 'gray' },
];

const REQUIRED_FIELDS = ['code', 'description', 'category', 'version', 'effective_date'];

const FIELD_ALIASES: Record<string, string[]> = {
  code: ['code', 'code_value', 'medical_code', 'diagnosis_code', 'procedure_code', 'concept_code'],
  description: ['description', 'desc', 'name', 'display_name', 'label', 'title', 'concept_name'],
  category: ['category', 'cat', 'type', 'class', 'classification', 'group'],
  subcategory: ['subcategory', 'subcat', 'subtype', 'subclass', 'subgroup'],
  version: ['version', 'ver', 'year', 'edition', 'release'],
  effective_date: ['effective_date', 'start_date', 'date', 'effective', 'valid_from', 'activation_date'],
  termination_date: ['termination_date', 'end_date', 'expiration_date', 'valid_to', 'deactivation_date'],
  billable: ['billable', 'is_billable', 'can_bill', 'billing_allowed'],
  requires_auth: ['requires_auth', 'prior_auth', 'authorization_required', 'auth_required', 'needs_auth'],
  gender: ['gender', 'sex', 'patient_gender', 'applicable_gender'],
  age_range: ['age_range', 'age', 'age_group', 'applicable_age'],
  notes: ['notes', 'note', 'comments', 'comment', 'remarks', 'additional_info'],
};

const SAMPLE_CODES: MedicalCode[] = [
  {
    id: '1',
    code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    code_type: 'icd10',
    category: 'Endocrine, Nutritional and Metabolic Diseases',
    subcategory: 'Diabetes Mellitus',
    version: '2024',
    effective_date: '2024-10-01',
    is_active: true,
    is_favorite: true,
    usage_count: 156,
    last_used: '2024-01-15',
    billable: true,
    requires_auth: false,
    gender: 'both',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    code: 'I10',
    description: 'Essential (primary) hypertension',
    code_type: 'icd10',
    category: 'Diseases of the Circulatory System',
    subcategory: 'Hypertensive Diseases',
    version: '2024',
    effective_date: '2024-10-01',
    is_active: true,
    is_favorite: true,
    usage_count: 289,
    last_used: '2024-01-14',
    billable: true,
    requires_auth: false,
    gender: 'both',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    code: '99213',
    description: 'Office or other outpatient visit for the evaluation and management of an established patient (20-29 minutes)',
    code_type: 'cpt',
    category: 'Evaluation and Management',
    subcategory: 'Office Visits',
    version: '2024',
    effective_date: '2024-01-01',
    is_active: true,
    is_favorite: true,
    usage_count: 445,
    last_used: '2024-01-15',
    billable: true,
    requires_auth: false,
    created_at: '2024-01-01',
  },
  {
    id: '4',
    code: '38341003',
    description: 'Hypertensive disorder',
    code_type: 'snomed',
    category: 'Clinical Finding',
    subcategory: 'Cardiovascular',
    version: '2024',
    effective_date: '2024-01-01',
    is_active: true,
    usage_count: 89,
    billable: false,
    created_at: '2024-01-01',
  },
  {
    id: '5',
    code: '153165',
    description: 'Metformin 500 MG Oral Tablet',
    code_type: 'rxnorm',
    category: 'Clinical Drug',
    subcategory: 'Antidiabetic Agents',
    version: '2024',
    effective_date: '2024-01-01',
    is_active: true,
    usage_count: 234,
    billable: false,
    created_at: '2024-01-01',
  },
];

export default function MedicalCodesPage() {
  const [codes, setCodes] = useState<MedicalCode[]>(SAMPLE_CODES);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'icd10' | 'cpt' | 'hcpcs' | 'loinc' | 'snomed' | 'rxnorm' | 'ndc' | 'custom'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [editingCode, setEditingCode] = useState<MedicalCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<CSVColumnMapping[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [validRowCount, setValidRowCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = 20;

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    code_type: 'icd10' as 'icd10' | 'cpt' | 'hcpcs' | 'loinc' | 'snomed' | 'rxnorm' | 'ndc' | 'custom',
    category: '',
    subcategory: '',
    version: '2024',
    effective_date: '',
    termination_date: '',
    is_active: true,
    billable: true,
    requires_auth: false,
    age_range: '',
    gender: 'both' as 'male' | 'female' | 'both',
    notes: '',
  });

  // Filter codes by active tab first
  const tabFilteredCodes = activeTab === 'all'
    ? codes
    : codes.filter((code) => code.code_type === activeTab);

  // Get unique categories for current tab
  const categories = Array.from(new Set(tabFilteredCodes.map((c) => c.category))).sort();

  // Further filter codes
  const filteredCodes = tabFilteredCodes.filter((code) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matches =
        code.code.toLowerCase().includes(search) ||
        code.description.toLowerCase().includes(search) ||
        code.category.toLowerCase().includes(search);
      if (!matches) return false;
    }
    if (categoryFilter && code.category !== categoryFilter) return false;
    if (showFavoritesOnly && !code.is_favorite) return false;
    if (showActiveOnly && !code.is_active) return false;
    return true;
  });

  // Pagination
  const pagination: PaginationInfo = {
    page: currentPage,
    limit,
    total: filteredCodes.length,
    totalPages: Math.ceil(filteredCodes.length / limit),
    hasNextPage: currentPage < Math.ceil(filteredCodes.length / limit),
    hasPrevPage: currentPage > 1,
  };

  const paginatedCodes = filteredCodes.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // Statistics for current tab
  const stats = {
    total: tabFilteredCodes.length,
    totalAll: codes.length,
    byType: CODE_TYPES.map((type) => ({
      ...type,
      count: codes.filter((c) => c.code_type === type.value).length,
    })),
    favorites: tabFilteredCodes.filter((c) => c.is_favorite).length,
    active: tabFilteredCodes.filter((c) => c.is_active).length,
    billable: tabFilteredCodes.filter((c) => c.billable).length,
  };

  const toggleFavorite = (id: string) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_favorite: !c.is_favorite } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingCode) {
        setCodes((prev) =>
          prev.map((c) =>
            c.id === editingCode.id
              ? { ...c, ...formData, id: c.id, created_at: c.created_at }
              : c
          )
        );
      } else {
        const newCode: MedicalCode = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          usage_count: 0,
          is_favorite: false,
          created_at: new Date().toISOString(),
        };
        setCodes((prev) => [newCode, ...prev]);
      }
      setShowDrawer(false);
      resetForm();
    } catch (error: unknown) {
      console.error('Failed to save code:', error);
      alert('Failed to save medical code');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (code: MedicalCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description,
      code_type: code.code_type,
      category: code.category,
      subcategory: code.subcategory || '',
      version: code.version,
      effective_date: code.effective_date,
      termination_date: code.termination_date || '',
      is_active: code.is_active,
      billable: code.billable || false,
      requires_auth: code.requires_auth || false,
      age_range: code.age_range || '',
      gender: code.gender || 'both',
      notes: code.notes || '',
    });
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    try {
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch (error: unknown) {
      console.error('Failed to delete code:', error);
      alert('Failed to delete medical code');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      code_type: 'icd10',
      category: '',
      subcategory: '',
      version: '2024',
      effective_date: '',
      termination_date: '',
      is_active: true,
      billable: true,
      requires_auth: false,
      age_range: '',
      gender: 'both',
      notes: '',
    });
    setEditingCode(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setShowFavoritesOnly(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // CSV Import Functions
  const detectFieldMapping = (header: string): string | null => {
    const normalized = header.toLowerCase().trim().replace(/[_\s-]+/g, '_');

    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.some((alias) => normalized.includes(alias.toLowerCase().replace(/[_\s-]+/g, '_')))) {
        return field;
      }
    }
    return null;
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map((line) =>
      line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    );

    return { headers, data };
  };

  const handleFileSelect = async (file: File) => {
    try {
      setImporting(true);
      const { headers, data } = await parseCSV(file);

      setCsvHeaders(headers);
      setCsvData(data);

      // Auto-detect mappings
      const mappings: CSVColumnMapping[] = headers.map((header, index) => {
        const detected = detectFieldMapping(header);
        const sample = data.length > 0 ? data[0][index] : '';

        return {
          csvColumn: header,
          mappedTo: detected || '',
          sample,
          isRequired: detected ? REQUIRED_FIELDS.includes(detected) : false,
          detected: !!detected,
        };
      });

      setColumnMappings(mappings);
      setImportFile(file);
      setShowImportModal(false);
      setShowMappingModal(true);
    } catch (error: any) {
      console.error('CSV parsing error:', error);
      alert(error.message || 'Failed to parse CSV file');
    } finally {
      setImporting(false);
    }
  };

  const validateImportData = () => {
    const errors: ImportError[] = [];
    let validCount = 0;

    csvData.forEach((row, rowIndex) => {
      let rowHasError = false;

      // Check required fields
      REQUIRED_FIELDS.forEach((field) => {
        const mapping = columnMappings.find((m) => m.mappedTo === field);
        if (!mapping || !mapping.csvColumn) {
          if (!rowHasError) {
            errors.push({
              row: rowIndex + 2,
              field,
              message: `Required field "${field}" is not mapped`,
              value: '',
            });
            rowHasError = true;
          }
          return;
        }

        const colIndex = csvHeaders.indexOf(mapping.csvColumn);
        const value = row[colIndex];

        if (!value || value.trim() === '') {
          errors.push({
            row: rowIndex + 2,
            field,
            message: `Required field "${field}" is empty`,
            value: value || '',
          });
          rowHasError = true;
        }
      });

      // Validate code format
      const codeMapping = columnMappings.find((m) => m.mappedTo === 'code');
      if (codeMapping?.csvColumn) {
        const colIndex = csvHeaders.indexOf(codeMapping.csvColumn);
        const code = row[colIndex];
        if (code && (code.length > 50 || code.length < 1)) {
          errors.push({
            row: rowIndex + 2,
            field: 'code',
            message: 'Code must be between 1 and 50 characters',
            value: code,
          });
          rowHasError = true;
        }
      }

      // Validate dates
      const dateMapping = columnMappings.find((m) => m.mappedTo === 'effective_date');
      if (dateMapping?.csvColumn) {
        const colIndex = csvHeaders.indexOf(dateMapping.csvColumn);
        const date = row[colIndex];
        if (date && isNaN(Date.parse(date))) {
          errors.push({
            row: rowIndex + 2,
            field: 'effective_date',
            message: 'Invalid date format (use YYYY-MM-DD)',
            value: date,
          });
          rowHasError = true;
        }
      }

      if (!rowHasError) {
        validCount++;
      }
    });

    setImportErrors(errors);
    setValidRowCount(validCount);
    return errors.length === 0;
  };

  const handleImportConfirm = () => {
    const isValid = validateImportData();

    if (!isValid && importErrors.length > 0) {
      if (!confirm(`Found ${importErrors.length} errors. ${validRowCount} rows are valid. Import valid rows only?`)) {
        return;
      }
    }

    try {
      const newCodes: MedicalCode[] = [];

      csvData.forEach((row, rowIndex) => {
        // Check if this row has errors
        const rowErrors = importErrors.filter((e) => e.row === rowIndex + 2);
        if (rowErrors.length > 0) return; // Skip rows with errors

        const getFieldValue = (field: string): string => {
          const mapping = columnMappings.find((m) => m.mappedTo === field);
          if (!mapping?.csvColumn) return '';
          const colIndex = csvHeaders.indexOf(mapping.csvColumn);
          return row[colIndex] || '';
        };

        const code: MedicalCode = {
          id: Math.random().toString(36).substr(2, 9),
          code: getFieldValue('code'),
          description: getFieldValue('description'),
          code_type: (activeTab === 'all' ? 'custom' : activeTab) as any,
          category: getFieldValue('category'),
          subcategory: getFieldValue('subcategory'),
          version: getFieldValue('version'),
          effective_date: getFieldValue('effective_date'),
          termination_date: getFieldValue('termination_date'),
          is_active: getFieldValue('is_active')?.toLowerCase() !== 'false',
          billable: getFieldValue('billable')?.toLowerCase() !== 'false',
          requires_auth: getFieldValue('requires_auth')?.toLowerCase() === 'true',
          gender: (getFieldValue('gender') || 'both') as 'male' | 'female' | 'both',
          age_range: getFieldValue('age_range'),
          notes: getFieldValue('notes'),
          usage_count: 0,
          is_favorite: false,
          created_at: new Date().toISOString(),
        };

        newCodes.push(code);
      });

      if (newCodes.length > 0) {
        setCodes((prev) => [...newCodes, ...prev]);
        alert(`Successfully imported ${newCodes.length} codes!`);
        setShowMappingModal(false);
        setImportFile(null);
        setCsvData([]);
        setCsvHeaders([]);
        setColumnMappings([]);
        setImportErrors([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('No valid codes to import');
      }
    } catch (error: unknown) {
      console.error('Import error:', error);
      alert('Failed to import codes');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#3342a5]" />
              Medical Codes
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              {pagination.total} code{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setShowDrawer(true);
              }}
              className="bg-[#3342a5] hover:bg-[#2a3686] text-white h-9"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Code
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('all');
              clearFilters();
            }}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === 'all'
                ? 'border-[#3342a5] text-[#3342a5] bg-[#3342a5]/5'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <span>All Codes</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded text-xs font-semibold',
                activeTab === 'all'
                  ? 'bg-[#3342a5] text-white'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {stats.totalAll}
              </span>
            </div>
          </button>
          {CODE_TYPES.map((type) => {
            const typeCount = codes.filter((c) => c.code_type === type.value).length;
            return (
              <button
                key={type.value}
                onClick={() => {
                  setActiveTab(type.value as any);
                  clearFilters();
                }}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === type.value
                    ? 'border-[#3342a5] text-[#3342a5] bg-[#3342a5]/5'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{type.label}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-semibold',
                    activeTab === type.value
                      ? 'bg-[#3342a5] text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {typeCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-xs text-gray-600 mb-1">
              {activeTab === 'all' ? 'Total Codes' : `${CODE_TYPES.find(t => t.value === activeTab)?.label} Codes`}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">
              {activeTab === 'all' ? 'All types' : CODE_TYPES.find(t => t.value === activeTab)?.description}
            </div>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'p-3 rounded-lg border text-left transition-all',
              showFavoritesOnly
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="text-xs text-gray-600 mb-1">Favorites</div>
            <div className="text-2xl font-bold text-gray-900">{stats.favorites}</div>
            <div className="text-xs text-gray-500">Starred codes</div>
          </button>
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-xs text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <div className="text-xs text-gray-500">Currently in use</div>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-xs text-gray-600 mb-1">Billable</div>
            <div className="text-2xl font-bold text-gray-900">{stats.billable}</div>
            <div className="text-xs text-gray-500">Can be billed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <Input
                placeholder="Search by code, description, or category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-9 bg-white"
              />
            </div>
          </div>
          <Select
            value={categoryFilter || 'all'}
            onValueChange={(value) => {
              setCategoryFilter(value === 'all' ? '' : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`h-9 ${showActiveOnly ? 'bg-[#3342a5]/5 border-[#3342a5]' : ''}`}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Active Only
          </Button>
          {(searchTerm || categoryFilter || showFavoritesOnly) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3342a5] mx-auto"></div>
            <p className="text-gray-600 mt-4 text-sm">Loading codes...</p>
          </div>
        ) : paginatedCodes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No Medical Codes Found</p>
            <p className="text-xs text-gray-500 mt-2">
              {searchTerm || categoryFilter
                ? 'Try adjusting your filters or switching tabs'
                : `Add your first ${activeTab === 'all' ? 'medical' : CODE_TYPES.find(t => t.value === activeTab)?.label} code or import from CSV`}
            </p>
            {!searchTerm && !categoryFilter && (
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={() => setShowImportModal(true)}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowDrawer(true);
                  }}
                  className="bg-[#3342a5] hover:bg-[#2a3686] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Code
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedCodes.map((code) => {
                    const codeType = CODE_TYPES.find((t) => t.value === code.code_type);
                    return (
                      <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-bold font-mono text-gray-900">
                              {code.code}
                            </code>
                            {code.is_favorite && (
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">v{code.version}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 max-w-md">
                            {code.description.length > 80
                              ? code.description.substring(0, 80) + '...'
                              : code.description}
                          </div>
                          {code.subcategory && (
                            <div className="text-xs text-gray-500 mt-0.5">{code.subcategory}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#3342a5]/10 text-[#3342a5]">
                            {codeType?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{code.category}</div>
                        </td>
                        <td className="px-4 py-3">
                          {code.usage_count !== undefined && code.usage_count > 0 ? (
                            <div className="flex items-center text-sm text-gray-600">
                              <TrendingUp className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              {code.usage_count}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {code.is_active && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            )}
                            {code.billable && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Billable
                              </span>
                            )}
                            {code.requires_auth && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Auth
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              onClick={() => toggleFavorite(code.id)}
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title={code.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {code.is_favorite ? (
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <StarOff className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleEdit(code)}
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(code.id)}
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> codes
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={pagination.page === pageNum ? 'h-8 w-8 p-0 bg-[#3342a5] hover:bg-[#2a3686] text-white' : 'h-8 w-8 p-0'}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="h-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Import File Selection Modal */}
      {showImportModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowImportModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Import Medical Codes</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload a CSV file to bulk import medical codes
                    </p>
                  </div>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {activeTab !== 'all' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Importing to:</strong> {CODE_TYPES.find(t => t.value === activeTab)?.label} tab
                    </p>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#3342a5] transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-[#3342a5] hover:underline font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">CSV files only (Max 10MB)</p>
                  {importFile && (
                    <div className="mt-4 p-3 bg-[#3342a5]/5 rounded-lg">
                      <p className="text-sm font-semibold text-[#3342a5]">
                        Selected: {importFile.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Smart CSV Mapping
                  </h4>
                  <p className="text-sm text-blue-800">
                    Our intelligent system will automatically detect and map your CSV columns to the correct fields.
                    You'll be able to review and adjust mappings before importing.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSV Mapping Modal */}
      {showMappingModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Map CSV Columns</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Review and adjust field mappings • {csvData.length} rows detected
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMappingModal(false);
                      setImportFile(null);
                      setCsvData([]);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {columnMappings.map((mapping, index) => {
                    const isRequired = REQUIRED_FIELDS.includes(mapping.mappedTo);
                    const hasMapping = mapping.mappedTo !== '';

                    return (
                      <div
                        key={index}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all',
                          mapping.detected
                            ? 'border-green-200 bg-green-50'
                            : hasMapping
                            ? 'border-blue-200 bg-blue-50'
                            : isRequired
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {mapping.csvColumn}
                              </span>
                              {mapping.detected && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Auto-detected
                                </span>
                              )}
                            </div>
                            {mapping.sample && (
                              <div className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                                Sample: {mapping.sample.substring(0, 60)}
                                {mapping.sample.length > 60 ? '...' : ''}
                              </div>
                            )}
                          </div>

                          <ArrowRight className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />

                          <div className="w-64">
                            <Select
                              value={mapping.mappedTo}
                              onValueChange={(value) => {
                                setColumnMappings((prev) =>
                                  prev.map((m, i) =>
                                    i === index
                                      ? {
                                          ...m,
                                          mappedTo: value,
                                          isRequired: REQUIRED_FIELDS.includes(value),
                                        }
                                      : m
                                  )
                                );
                              }}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Skip this column" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Skip this column</SelectItem>
                                <SelectItem value="code">Code *</SelectItem>
                                <SelectItem value="description">Description *</SelectItem>
                                <SelectItem value="category">Category *</SelectItem>
                                <SelectItem value="subcategory">Subcategory</SelectItem>
                                <SelectItem value="version">Version *</SelectItem>
                                <SelectItem value="effective_date">Effective Date *</SelectItem>
                                <SelectItem value="termination_date">Termination Date</SelectItem>
                                <SelectItem value="billable">Billable</SelectItem>
                                <SelectItem value="requires_auth">Requires Auth</SelectItem>
                                <SelectItem value="gender">Gender</SelectItem>
                                <SelectItem value="age_range">Age Range</SelectItem>
                                <SelectItem value="notes">Notes</SelectItem>
                              </SelectContent>
                            </Select>
                            {isRequired && (
                              <p className="text-xs text-red-600 mt-1">* Required field</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Validation Results */}
                {importErrors.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          Validation Issues Found
                        </h4>
                        <p className="text-sm text-yellow-800 mb-3">
                          {importErrors.length} error(s) found in {csvData.length - validRowCount} row(s).
                          {validRowCount > 0 && ` ${validRowCount} row(s) are valid and ready to import.`}
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {importErrors.slice(0, 10).map((error, i) => (
                            <div key={i} className="text-xs bg-white p-2 rounded border border-yellow-300">
                              <span className="font-semibold text-red-600">Row {error.row}:</span>{' '}
                              <span className="text-gray-700">{error.field}</span> - {error.message}
                              {error.value && (
                                <span className="text-gray-500"> (value: "{error.value}")</span>
                              )}
                            </div>
                          ))}
                          {importErrors.length > 10 && (
                            <p className="text-xs text-yellow-700 font-medium">
                              ... and {importErrors.length - 10} more errors
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {importErrors.length === 0 && validRowCount > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-900">All Validations Passed!</h4>
                        <p className="text-sm text-green-800">
                          {validRowCount} row(s) are ready to import with no errors.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMappingModal(false);
                    setImportFile(null);
                    setCsvData([]);
                    setColumnMappings([]);
                    setImportErrors([]);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    validateImportData();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Validate Data
                </Button>
                <Button
                  onClick={handleImportConfirm}
                  className="flex-1 bg-[#3342a5] hover:bg-[#2a3686] text-white"
                  disabled={validRowCount === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Import {validRowCount} Codes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Code Form Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingCode ? 'Edit Medical Code' : 'Add New Medical Code'}</SheetTitle>
            <SheetDescription>
              {editingCode
                ? 'Update medical code information'
                : 'Enter medical code details for billing and documentation'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Code *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., E11.9"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Code Type *</Label>
                    <Select
                      value={formData.code_type}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, code_type: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CODE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description *</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full description of the code"
                    required
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#3342a5] focus:border-[#3342a5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Category *</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Endocrine Diseases"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subcategory</Label>
                    <Input
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g., Diabetes Mellitus"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Version *</Label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="2024"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Effective Date *</Label>
                    <Input
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Code Properties</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded w-4 h-4 text-[#3342a5]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Active Code</p>
                    <p className="text-xs text-gray-500">Code is currently in use</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.billable}
                    onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                    className="rounded w-4 h-4 text-[#3342a5]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Billable</p>
                    <p className="text-xs text-gray-500">Can be used for billing claims</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.requires_auth}
                    onChange={(e) => setFormData({ ...formData, requires_auth: e.target.checked })}
                    className="rounded w-4 h-4 text-[#3342a5]"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Requires Prior Authorization</p>
                    <p className="text-xs text-gray-500">Prior auth needed for billing</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDrawer(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#3342a5] hover:bg-[#2a3686] text-white"
              >
                {saving ? 'Saving...' : editingCode ? 'Update Code' : 'Add Code'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
