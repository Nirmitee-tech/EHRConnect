'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Filter, Upload, Loader2, FileText, Activity,
  Stethoscope, Plus, Download, RefreshCw
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { BillingMastersService, CPTCode, ICDCode, Modifier } from '@/services/billing-masters.service';

export default function BillingCodesPage() {
  const { currentFacility } = useFacility();
  const [activeTab, setActiveTab] = useState<'cpt' | 'icd' | 'modifiers'>('cpt');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cptCodes, setCptCodes] = useState<CPTCode[]>([]);
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (currentFacility?.id) {
      loadInitialData();
    }
  }, [currentFacility, activeTab]);

  const loadInitialData = async () => {
    if (!currentFacility?.id) return;

    try {
      setLoading(true);
      if (activeTab === 'cpt') {
        const response = await BillingMastersService.getCPTCodes({ limit: 50, active: true });
        setCptCodes(response.data || []);
      } else if (activeTab === 'icd') {
        const response = await BillingMastersService.getICDCodes({ limit: 50, active: true });
        setIcdCodes(response.data || []);
      } else {
        const response = await BillingMastersService.getModifiers({ active: true });
        setModifiers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      loadInitialData();
      return;
    }

    try {
      setSearching(true);
      if (activeTab === 'cpt') {
        const results = await BillingMastersService.searchCPTCodes(searchTerm, 100);
        setCptCodes(results.data || []);
      } else if (activeTab === 'icd') {
        const results = await BillingMastersService.searchICDCodes(searchTerm, 'ICD-10', 100);
        setIcdCodes(results.data || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        loadInitialData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const tabs = [
    { id: 'cpt' as const, label: 'CPT Codes', icon: FileText, count: cptCodes.length },
    { id: 'icd' as const, label: 'ICD-10 Codes', icon: Activity, count: icdCodes.length },
    { id: 'modifiers' as const, label: 'Modifiers', icon: Stethoscope, count: modifiers.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/settings/billing" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Billing Settings
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing Codes Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive CPT, ICD-10, and modifier code management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Bulk Import
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Code
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}+
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'cpt' ? 'CPT' : activeTab === 'icd' ? 'ICD-10' : 'modifier'} codes...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <button 
              onClick={loadInitialData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {activeTab === 'cpt' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RVU</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Modifier</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cptCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-gray-900">{code.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{code.short_description || code.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{code.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{code.rvu_work?.toFixed(2) || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {code.modifier_allowed ? (
                            <span className="text-green-600 text-xs font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {code.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'icd' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Billable</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {icdCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-gray-900">{code.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{code.short_description || code.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{code.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{code.chapter || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {code.is_billable ? (
                            <span className="text-green-600 text-xs font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {code.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'modifiers' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {modifiers.map((modifier) => (
                      <tr key={modifier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-gray-900">{modifier.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{modifier.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {modifier.modifier_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            modifier.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {modifier.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {activeTab === 'cpt' ? cptCodes.length : activeTab === 'icd' ? icdCodes.length : modifiers.length} codes
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
}
