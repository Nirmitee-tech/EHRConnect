'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Filter, Download, Upload, Loader2,
  Edit2, Trash2, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Lock, TrendingUp, TrendingDown, DollarSign, Building2, AlertTriangle
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { AccountingService, ChartOfAccount } from '@/services/accounting.service';

export default function ChartOfAccountsPage() {
  const { currentFacility } = useFacility();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['asset', 'liability', 'equity', 'revenue', 'expense']));

  useEffect(() => {
    if (currentFacility?.id) {
      loadAccounts();
    }
  }, [currentFacility]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, selectedType, showInactive]);

  const loadAccounts = async () => {
    if (!currentFacility?.id) return;

    try {
      setLoading(true);
      const response = await AccountingService.getChartOfAccounts(currentFacility.id, {
        is_active: !showInactive ? true : undefined,
        limit: 1000
      });
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = [...accounts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.account_code.toLowerCase().includes(term) ||
          acc.account_name.toLowerCase().includes(term)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((acc) => acc.account_type === selectedType);
    }

    setFilteredAccounts(filtered);
  };

  const toggleGroup = (type: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedGroups(newExpanded);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'liability':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'equity':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      asset: 'Assets',
      liability: 'Liabilities',
      equity: 'Equity',
      revenue: 'Revenue',
      expense: 'Expenses',
      contra_asset: 'Contra Assets'
    };
    return labels[type] || type;
  };

  const getAccountTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-purple-100 text-purple-800',
      revenue: 'bg-green-100 text-green-800',
      expense: 'bg-orange-100 text-orange-800',
      contra_asset: 'bg-gray-100 text-gray-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const groupAccountsByType = () => {
    const groups: Record<string, ChartOfAccount[]> = {
      asset: [],
      liability: [],
      equity: [],
      revenue: [],
      expense: [],
      contra_asset: []
    };

    filteredAccounts.forEach((account) => {
      if (groups[account.account_type]) {
        groups[account.account_type].push(account);
      }
    });

    return groups;
  };

  const accountGroups = groupAccountsByType();

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.is_active).length,
    system: accounts.filter((a) => a.is_system).length,
    assets: accounts.filter((a) => a.account_type === 'asset').length,
    liabilities: accounts.filter((a) => a.account_type === 'liability').length,
    revenue: accounts.filter((a) => a.account_type === 'revenue').length,
    expenses: accounts.filter((a) => a.account_type === 'expense').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/settings/billing"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Billing Settings
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your organization's accounting structure
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{stats.system}</div>
              <div className="text-xs text-gray-600">System</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.assets}</div>
              <div className="text-xs text-gray-600">Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.liabilities}</div>
              <div className="text-xs text-gray-600">Liabilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.revenue}</div>
              <div className="text-xs text-gray-600">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.expenses}</div>
              <div className="text-xs text-gray-600">Expenses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="asset">Assets</option>
            <option value="liability">Liabilities</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expenses</option>
          </select>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Show Inactive</span>
          </label>
        </div>
      </div>

      {/* Accounts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(accountGroups).map(([type, typeAccounts]) => {
              if (typeAccounts.length === 0) return null;
              const isExpanded = expandedGroups.has(type);

              return (
                <div key={type} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(type)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getAccountIcon(type)}
                      <span className="font-semibold text-gray-900">
                        {getAccountTypeLabel(type)}
                      </span>
                      <span className="text-sm text-gray-500">({typeAccounts.length})</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Accounts Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-t border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Account Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {typeAccounts.map((account) => (
                            <tr key={account.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm text-gray-900">
                                    {account.account_code}
                                  </span>
                                  {account.is_system && (
                                    <Lock className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {account.account_name}
                                </div>
                                {account.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {account.description}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeBadge(account.account_type)}`}>
                                  {account.normal_balance === 'debit' ? 'DR' : 'CR'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                -
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {account.is_active ? (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs font-medium">Active</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-gray-400">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-xs font-medium">Inactive</span>
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  disabled={account.is_system}
                                  className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed mr-3"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  disabled={account.is_system}
                                  className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredAccounts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No accounts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
