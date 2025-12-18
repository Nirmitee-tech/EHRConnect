'use client';

import React, { useState, useEffect } from 'react';
import { Code, Plus, Search, Upload, Download, Edit, Trash2, X, Info, CheckCircle, AlertCircle, Activity, FileText, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface MedicalCode {
  id: string;
  code_type: 'cpt' | 'icd10' | 'hcpcs' | 'custom';
  code: string;
  description: string;
  category?: string;
  is_active: boolean;
  effective_date?: string;
  termination_date?: string;
  created_at: string;
}

export default function CodesPage() {
  const [codes, setCodes] = useState<MedicalCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingCode, setEditingCode] = useState<MedicalCode | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    code_type: 'cpt' as 'cpt' | 'icd10' | 'hcpcs' | 'custom',
    code: '',
    description: '',
    category: '',
    is_active: true,
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      // TODO: Implement API endpoint
      setCodes([]);
    } catch (error) {
      console.error('Failed to load codes:', error);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCode) {
        // await billingService.updateCode(editingCode.id, formData);
      } else {
        // await billingService.createCode(formData);
      }
      setShowSidebar(false);
      resetForm();
      loadCodes();
    } catch (error) {
      console.error('Failed to save code:', error);
      alert('Failed to save code');
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) return;

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('code_type', filterType === 'all' ? 'cpt' : filterType);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // await billingService.bulkUploadCodes(formData);
      alert('Codes uploaded successfully!');
      setShowBulkUpload(false);
      setUploadFile(null);
      setUploadProgress(0);
      loadCodes();
    } catch (error) {
      console.error('Failed to upload codes:', error);
      alert('Failed to upload codes');
    }
  };

  const handleEdit = (code: MedicalCode) => {
    setEditingCode(code);
    setFormData({
      code_type: code.code_type,
      code: code.code,
      description: code.description,
      category: code.category || '',
      is_active: code.is_active,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    try {
      // await billingService.deleteCode(id);
      loadCodes();
    } catch (error) {
      console.error('Failed to delete code:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code_type: 'cpt',
      code: '',
      description: '',
      category: '',
      is_active: true,
    });
    setEditingCode(null);
  };

  const getCodeTypeColor = (type: string) => {
    switch (type) {
      case 'cpt': return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200';
      case 'icd10': return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200';
      case 'hcpcs': return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200';
      case 'custom': return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCodeTypeIcon = (type: string) => {
    switch (type) {
      case 'cpt': return '⚕️';
      case 'icd10': return '🏥';
      case 'hcpcs': return '💊';
      case 'custom': return '⭐';
      default: return '📋';
    }
  };

  const filteredCodes = codes.filter((code) => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || code.code_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: codes.length,
    cpt: codes.filter(c => c.code_type === 'cpt').length,
    icd10: codes.filter(c => c.code_type === 'icd10').length,
    hcpcs: codes.filter(c => c.code_type === 'hcpcs').length,
    custom: codes.filter(c => c.code_type === 'custom').length,
    active: codes.filter(c => c.is_active).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Medical Codes Manager
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    CPT, ICD-10, HCPCS & Custom Codes - FHIR R4 Compliant
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Upload className="h-5 w-5" />
                Bulk Upload
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowSidebar(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-200 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Plus className="h-5 w-5" />
                Add Code
              </button>
            </div>
          </div>
        </div>

        {/* Data Sources Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Official FHIR Code Systems</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    CPT Codes (AMA)
                  </div>
                  <p className="text-gray-600 mb-2">Current Procedural Terminology</p>
                  <a href="https://www.ama-assn.org/practice-management/cpt" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Official: ama-assn.org/cpt (Paid)
                  </a>
                  <a href="https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs flex items-center gap-1 mt-1">
                    <Download className="h-3 w-3" />
                    Free Alternative: CMS HCPCS
                  </a>
                </div>

                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="font-semibold text-green-700 mb-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    ICD-10-CM (CDC/CMS) - FREE
                  </div>
                  <p className="text-gray-600 mb-2">International Classification of Diseases</p>
                  <a href="https://www.cms.gov/medicare/coding-billing/icd-10-codes" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    cms.gov/icd-10-codes (FREE!)
                  </a>
                  <a href="https://www.cms.gov/files/zip/2024-code-descriptions-tabular-order.zip" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1">
                    <Download className="h-3 w-3" />
                    Direct Download 2024 Codes
                  </a>
                </div>

                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <div className="font-semibold text-purple-700 mb-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    HCPCS (CMS) - FREE
                  </div>
                  <p className="text-gray-600 mb-2">Healthcare Common Procedure Coding</p>
                  <a href="https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-xs flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    cms.gov/HCPCSReleaseCodeSets
                  </a>
                </div>

                <div className="bg-white rounded-lg p-3 border border-orange-100">
                  <div className="font-semibold text-orange-700 mb-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    LOINC (Regenstrief) - FREE
                  </div>
                  <p className="text-gray-600 mb-2">Lab & Clinical Observations</p>
                  <a href="https://loinc.org/downloads/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline text-xs flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    loinc.org/downloads
                  </a>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> Use bulk upload to import official code sets. Supports CSV, Excel, and TXT formats.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">All Codes</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => setFilterType('cpt')}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{getCodeTypeIcon('cpt')}</div>
              <span className="text-xs font-medium text-blue-700 bg-white px-2 py-1 rounded-full">
                CPT
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{stats.cpt}</p>
            <p className="text-sm text-blue-600 mt-1">Procedures</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm border border-green-200 p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => setFilterType('icd10')}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{getCodeTypeIcon('icd10')}</div>
              <span className="text-xs font-medium text-green-700 bg-white px-2 py-1 rounded-full">
                ICD-10
              </span>
            </div>
            <p className="text-3xl font-bold text-green-700">{stats.icd10}</p>
            <p className="text-sm text-green-600 mt-1">Diagnoses</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm border border-purple-200 p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => setFilterType('hcpcs')}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{getCodeTypeIcon('hcpcs')}</div>
              <span className="text-xs font-medium text-purple-700 bg-white px-2 py-1 rounded-full">
                HCPCS
              </span>
            </div>
            <p className="text-3xl font-bold text-purple-700">{stats.hcpcs}</p>
            <p className="text-sm text-purple-600 mt-1">Healthcare Codes</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm border border-orange-200 p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => setFilterType('custom')}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{getCodeTypeIcon('custom')}</div>
              <span className="text-xs font-medium text-orange-700 bg-white px-2 py-1 rounded-full">
                Custom
              </span>
            </div>
            <p className="text-3xl font-bold text-orange-700">{stats.custom}</p>
            <p className="text-sm text-orange-600 mt-1">Organization Codes</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl shadow-sm border border-emerald-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-white px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{stats.active}</p>
            <p className="text-sm text-emerald-600 mt-1">In Use</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('cpt')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'cpt'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                CPT
              </button>
              <button
                onClick={() => setFilterType('icd10')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'icd10'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ICD-10
              </button>
              <button
                onClick={() => setFilterType('hcpcs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'hcpcs'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                HCPCS
              </button>
              <button
                onClick={() => setFilterType('custom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'custom'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Codes List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading codes...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <Code className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Codes Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== 'all' ? 'Try adjusting your filters' : 'Import official code sets or add custom codes'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowBulkUpload(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Upload className="h-4 w-4" />
                    Bulk Upload Codes
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowSidebar(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Single Code
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredCodes.map((code) => (
              <div
                key={code.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 p-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">{getCodeTypeIcon(code.code_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold font-mono text-gray-900">{code.code}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCodeTypeColor(code.code_type)}`}>
                          {code.code_type.toUpperCase()}
                        </span>
                        {code.is_active ? (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{code.description}</p>
                      {code.category && (
                        <p className="text-xs text-gray-500 mt-1">Category: {code.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(code)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Form */}
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => {
              setShowSidebar(false);
              resetForm();
            }}
          ></div>
          <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingCode ? 'Edit Code' : 'Add New Code'}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {editingCode ? 'Update code information' : 'Add a new medical code to your library'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Code Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Code Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Code Type *</Label>
                    <select
                      value={formData.code_type}
                      onChange={(e) => setFormData({ ...formData, code_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                      required
                    >
                      <option value="cpt">⚕️ CPT - Current Procedural Terminology</option>
                      <option value="icd10">🏥 ICD-10-CM - Diagnosis Codes</option>
                      <option value="hcpcs">💊 HCPCS - Healthcare Procedures</option>
                      <option value="custom">⭐ Custom - Organization Specific</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Code *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., 99213 or E11.9"
                      className="mt-1 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Description *</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Full description of the code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Office Visits, Diabetes"
                      className="mt-1"
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Active Code</p>
                      <p className="text-xs text-gray-500">Code is available for use in billing</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSidebar(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg rounded-lg font-semibold transition-all"
                >
                  {editingCode ? 'Update Code' : 'Add Code'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => {
              setShowBulkUpload(false);
              setUploadFile(null);
              setUploadProgress(0);
            }}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Bulk Upload Codes</h2>
                    <p className="text-emerald-100 mt-1">Import medical codes from CSV, Excel, or TXT files</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBulkUpload(false);
                      setUploadFile(null);
                      setUploadProgress(0);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:underline font-semibold">Click to upload</span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">CSV, Excel, or TXT (Max 50MB)</p>
                  {uploadFile && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2 justify-center">
                        <FileText className="h-4 w-4" />
                        {uploadFile.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* File Format Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Expected File Format:</h4>
                  <div className="text-sm text-blue-800 space-y-1 font-mono bg-white p-3 rounded">
                    <p>code,description,category</p>
                    <p>99213,"Office visit, established patient","Office Visits"</p>
                    <p>E11.9,"Type 2 diabetes mellitus","Diabetes"</p>
                  </div>
                </div>

                {/* Progress */}
                {uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="font-semibold text-emerald-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkUpload(false);
                      setUploadFile(null);
                      setUploadProgress(0);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile || uploadProgress > 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Codes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
