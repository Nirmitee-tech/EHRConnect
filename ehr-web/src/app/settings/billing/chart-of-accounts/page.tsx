'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Download, Upload, Loader2,
  Edit2, Trash2, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Lock, TrendingUp, TrendingDown, DollarSign, Building2, AlertTriangle
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AccountingService, ChartOfAccount } from '@/services/accounting.service';

export default function ChartOfAccountsPage() {
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resolvedOrgId = orgId || currentFacility?.id || null;
  const accountCodeById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.account_code])),
    [accounts]
  );
  const defaultNormalBalance: Record<string, 'debit' | 'credit'> = {
    asset: 'debit',
    expense: 'debit',
    contra_asset: 'credit',
    liability: 'credit',
    equity: 'credit',
    revenue: 'credit',
  };
  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense', 'contra_asset'];
  const typeNodeId = (type: string) => `type:${type}`;
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'asset',
    account_subtype: '',
    parent_account_id: '',
    normal_balance: 'debit' as 'debit' | 'credit',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (resolvedOrgId) {
      loadAccounts();
    }
  }, [resolvedOrgId, showInactive]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, selectedType, showInactive]);

  const getRootAccountIds = (list: ChartOfAccount[]) => {
    const ids = new Set(list.map((account) => account.id));
    return list
      .filter((account) => !account.parent_account_id || !ids.has(account.parent_account_id))
      .map((account) => account.id);
  };

  const getScopedAccounts = () => (
    selectedType === 'all'
      ? accounts
      : accounts.filter((account) => account.account_type === selectedType)
  );

  useEffect(() => {
    if (searchTerm) {
      return;
    }

    const scoped = getScopedAccounts();
    const typesToExpand = selectedType === 'all' ? typeOrder : [selectedType];
    const rootIds = getRootAccountIds(scoped);
    const nextExpanded = new Set<string>();
    typesToExpand.forEach((type) => nextExpanded.add(typeNodeId(type)));
    rootIds.forEach((id) => nextExpanded.add(id));
    setExpandedNodes(nextExpanded);
  }, [accounts, selectedType, searchTerm]);

  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    const term = searchTerm.toLowerCase();
    const scoped = getScopedAccounts();
    const accountById = new Map(scoped.map((account) => [account.id, account]));
    const matches = scoped.filter(
      (account) =>
        account.account_code.toLowerCase().includes(term) ||
        account.account_name.toLowerCase().includes(term)
    );
    const nextExpanded = new Set<string>();
    const typesWithMatches = new Set<string>();

    matches.forEach((match) => {
      typesWithMatches.add(match.account_type);
      let current: ChartOfAccount | undefined = match;
      while (current) {
        if (nextExpanded.has(current.id)) {
          break;
        }
        nextExpanded.add(current.id);
        if (!current.parent_account_id) {
          break;
        }
        current = accountById.get(current.parent_account_id);
      }
    });

    const typesToExpand = selectedType === 'all' ? typeOrder : [selectedType];
    typesToExpand.forEach((type) => {
      if (typesWithMatches.has(type) || selectedType !== 'all') {
        nextExpanded.add(typeNodeId(type));
      }
    });

    setExpandedNodes(nextExpanded);
  }, [accounts, searchTerm, selectedType]);

  const loadAccounts = async () => {
    if (!resolvedOrgId) return;

    try {
      setLoading(true);
      const response = await AccountingService.getChartOfAccounts(resolvedOrgId, {
        is_active: !showInactive ? true : undefined,
        limit: 1000
      });
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load chart of accounts.');
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let scoped = [...getScopedAccounts()];

    if (!searchTerm) {
      setFilteredAccounts(scoped);
      return;
    }

    const term = searchTerm.toLowerCase();
    const accountById = new Map(scoped.map((account) => [account.id, account]));
    const matches = scoped.filter(
      (acc) =>
        acc.account_code.toLowerCase().includes(term) ||
        acc.account_name.toLowerCase().includes(term)
    );
    const visibleIds = new Set<string>();

    matches.forEach((match) => {
      let current: ChartOfAccount | undefined = match;
      while (current) {
        if (visibleIds.has(current.id)) {
          break;
        }
        visibleIds.add(current.id);
        if (!current.parent_account_id) {
          break;
        }
        current = accountById.get(current.parent_account_id);
      }
    });

    const filtered = scoped.filter((acc) => visibleIds.has(acc.id));
    setFilteredAccounts(filtered);
  };

  const toggleNode = (accountId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: 'asset',
      account_subtype: '',
      parent_account_id: '',
      normal_balance: defaultNormalBalance.asset,
      description: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (account: ChartOfAccount) => {
    if (account.is_system) {
      toast.info('System accounts cannot be edited.');
      return;
    }

    setEditingAccount(account);
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      account_subtype: account.account_subtype || '',
      parent_account_id: account.parent_account_id || '',
      normal_balance: account.normal_balance,
      description: account.description || '',
      is_active: account.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!resolvedOrgId) {
      toast.error('Organization context is required.');
      return;
    }

    if (!formData.account_code.trim() || !formData.account_name.trim()) {
      toast.error('Account code and name are required.');
      return;
    }

    try {
      setSaving(true);

      if (editingAccount) {
        await AccountingService.updateAccount(resolvedOrgId, editingAccount.id, {
          account_name: formData.account_name.trim(),
          account_subtype: formData.account_subtype.trim() || undefined,
          parent_account_id: formData.parent_account_id || undefined,
          description: formData.description.trim() || undefined,
          is_active: formData.is_active,
        });
        toast.success('Account updated.');
      } else {
        await AccountingService.createAccount(resolvedOrgId, {
          account_code: formData.account_code.trim(),
          account_name: formData.account_name.trim(),
          account_type: formData.account_type,
          account_subtype: formData.account_subtype.trim() || undefined,
          parent_account_id: formData.parent_account_id || undefined,
          normal_balance: formData.normal_balance,
          description: formData.description.trim() || undefined,
        });
        toast.success('Account created.');
      }

      setIsDialogOpen(false);
      await loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account: ChartOfAccount) => {
    if (account.is_system) {
      toast.info('System accounts cannot be deleted.');
      return;
    }

    if (!resolvedOrgId) {
      toast.error('Organization context is required.');
      return;
    }

    const confirmed = confirm(`Delete account "${account.account_name}"? This will deactivate the account.`);
    if (!confirmed) return;

    try {
      setSaving(true);
      await AccountingService.deleteAccount(resolvedOrgId, account.id);
      toast.success('Account deactivated.');
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account.');
    } finally {
      setSaving(false);
    }
  };

  const escapeCsvValue = (value: string) => {
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const handleExport = () => {
    if (filteredAccounts.length === 0) {
      toast.info('No accounts to export.');
      return;
    }

    const headers = [
      'account_code',
      'account_name',
      'account_type',
      'normal_balance',
      'account_subtype',
      'parent_account_code',
      'description',
      'is_active',
      'is_system',
    ];

    const rows = filteredAccounts.map((account) => [
      account.account_code,
      account.account_name,
      account.account_type,
      account.normal_balance,
      account.account_subtype || '',
      account.parent_account_id ? accountCodeById.get(account.parent_account_id) || '' : '',
      account.description || '',
      account.is_active ? 'true' : 'false',
      account.is_system ? 'true' : 'false',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((value) => escapeCsvValue(String(value))).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-of-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready.');
  };

  const parseCsvLine = (line: string) => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    values.push(current);
    return values;
  };

  const normalizeHeader = (value: string) =>
    value.trim().toLowerCase().replace(/^\ufeff/, '').replace(/[^a-z0-9]+/g, '_');

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!resolvedOrgId) {
      toast.error('Organization context is required.');
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
      if (lines.length < 2) {
        toast.error('CSV file is empty.');
        return;
      }

      const rawHeaders = parseCsvLine(lines[0]);
      const headers = rawHeaders.map(normalizeHeader);
      const required = ['account_code', 'account_name', 'account_type'];
      const missingRequired = required.filter((key) => !headers.includes(key));

      if (missingRequired.length > 0) {
        toast.error(`Missing required columns: ${missingRequired.join(', ')}`);
        return;
      }

      const existingByCode = new Map(
        accounts.map((account) => [account.account_code.toLowerCase(), account])
      );
      const createdByCode = new Map<string, ChartOfAccount>();
      let createdCount = 0;
      let skippedCount = 0;
      let failedCount = 0;
      const pendingParents: Array<{ accountId: string; parentCode: string }> = [];

      for (let i = 1; i < lines.length; i += 1) {
        const values = parseCsvLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() ?? '';
        });

        const accountCode = row.account_code;
        const accountName = row.account_name;
        const rawType = row.account_type;

        if (!accountCode || !accountName || !rawType) {
          failedCount += 1;
          continue;
        }

        if (existingByCode.has(accountCode.toLowerCase())) {
          skippedCount += 1;
          continue;
        }

        const normalizedType = rawType.toLowerCase().replace(/\s+/g, '_');
        const typeMap: Record<string, string> = {
          assets: 'asset',
          liabilities: 'liability',
          revenues: 'revenue',
          expenses: 'expense',
          contra_assets: 'contra_asset',
          contraasset: 'contra_asset',
        };
        const mappedType = typeMap[normalizedType] || normalizedType;
        const accountType = ['asset', 'liability', 'equity', 'revenue', 'expense', 'contra_asset']
          .includes(mappedType)
          ? mappedType
          : 'asset';

        const rawBalance = row.normal_balance?.toLowerCase();
        const normalBalance = rawBalance === 'credit' || rawBalance === 'cr'
          ? 'credit'
          : rawBalance === 'debit' || rawBalance === 'dr'
            ? 'debit'
            : defaultNormalBalance[accountType] || 'debit';

        const parentCode = row.parent_account_code?.toLowerCase();
        const parentAccount =
          (parentCode && (createdByCode.get(parentCode) || existingByCode.get(parentCode))) || null;

        try {
          const created = await AccountingService.createAccount(resolvedOrgId, {
            account_code: accountCode,
            account_name: accountName,
            account_type: accountType,
            account_subtype: row.account_subtype || undefined,
            parent_account_id: parentAccount?.id,
            normal_balance: normalBalance,
            description: row.description || undefined,
          });

          createdCount += 1;
          createdByCode.set(created.account_code.toLowerCase(), created);
          existingByCode.set(created.account_code.toLowerCase(), created);

          if (parentCode && !parentAccount) {
            pendingParents.push({ accountId: created.id, parentCode });
          }
        } catch (error) {
          console.error('Import row failed:', error);
          failedCount += 1;
        }
      }

      for (const pending of pendingParents) {
        const parentAccount = createdByCode.get(pending.parentCode) || existingByCode.get(pending.parentCode);
        if (!parentAccount) {
          skippedCount += 1;
          continue;
        }

        try {
          await AccountingService.updateAccount(resolvedOrgId, pending.accountId, {
            parent_account_id: parentAccount.id,
          });
        } catch (error) {
          console.error('Failed to update parent account:', error);
          failedCount += 1;
        }
      }

      toast.success(`Import complete. ${createdCount} created, ${skippedCount} skipped, ${failedCount} failed.`);
      await loadAccounts();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import accounts.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
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
      contra_asset: 'bg-muted text-muted-foreground'
    };
    return styles[type] || 'bg-muted text-muted-foreground';
  };

  const sortAccountsByCode = (list: ChartOfAccount[]) => (
    list.slice().sort((a, b) =>
      a.account_code.localeCompare(b.account_code, undefined, { numeric: true })
    )
  );

  const buildTree = (list: ChartOfAccount[]) => {
    const ids = new Set(list.map((account) => account.id));
    const childrenByParentId = new Map<string, ChartOfAccount[]>();

    list.forEach((account) => {
      if (account.parent_account_id && ids.has(account.parent_account_id)) {
        const existing = childrenByParentId.get(account.parent_account_id) || [];
        existing.push(account);
        childrenByParentId.set(account.parent_account_id, existing);
      }
    });

    childrenByParentId.forEach((children, parentId) => {
      childrenByParentId.set(parentId, sortAccountsByCode(children));
    });

    const roots = sortAccountsByCode(
      list.filter((account) => !account.parent_account_id || !ids.has(account.parent_account_id))
    );

    return { roots, childrenByParentId };
  };

  const renderAccountRow = (
    account: ChartOfAccount,
    depth: number,
    childrenByParentId: Map<string, ChartOfAccount[]>
  ) => {
    const children = childrenByParentId.get(account.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const indent = Math.min(depth, 6) * 18;

    return (
      <React.Fragment key={account.id}>
        <div className="grid grid-cols-[minmax(0,2.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.7fr)_minmax(0,0.6fr)] items-center gap-2 px-6 py-3 border-b border-border hover:bg-muted/40">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
            {hasChildren ? (
              <button
                onClick={() => toggleNode(account.id)}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                aria-label={isExpanded ? 'Collapse account group' : 'Expand account group'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center text-muted-foreground/40">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">{account.account_code}</span>
              {account.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${account.is_active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {account.account_name}
              </span>
              {account.description && (
                <span className="text-xs text-muted-foreground">{account.description}</span>
              )}
            </div>
          </div>
          <div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeBadge(account.account_type)}`}>
              {account.normal_balance === 'debit' ? 'DR' : 'CR'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">-</div>
          <div>
            {account.is_active ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <XCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Inactive</span>
              </span>
            )}
          </div>
          <div className="flex justify-end text-sm font-medium">
            <button
              disabled={account.is_system}
              onClick={() => openEditDialog(account)}
              className="text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed mr-3"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              disabled={account.is_system}
              onClick={() => handleDelete(account)}
              className="text-red-600 hover:text-red-500 disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderAccountRow(child, depth + 1, childrenByParentId))}
          </div>
        )}
      </React.Fragment>
    );
  };
  const accountsByType = useMemo(() => {
    const grouped = new Map<string, ChartOfAccount[]>();
    filteredAccounts.forEach((account) => {
      const existing = grouped.get(account.account_type) || [];
      existing.push(account);
      grouped.set(account.account_type, existing);
    });
    return grouped;
  }, [filteredAccounts]);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-[1500px] mx-auto p-4 animate-in fade-in duration-500 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Billing Settings
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Chart of Accounts</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Chart of Accounts</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Manage your organization's accounting structure
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import'}
              </Button>
              <Button size="sm" onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                New Account
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 lg:grid-cols-7">
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-[11px] text-muted-foreground">Total Accounts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-[11px] text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">{stats.system}</div>
              <div className="text-[11px] text-muted-foreground">System</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.assets}</div>
              <div className="text-[11px] text-muted-foreground">Assets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.liabilities}</div>
              <div className="text-[11px] text-muted-foreground">Liabilities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.revenue}</div>
              <div className="text-[11px] text-muted-foreground">Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.expenses}</div>
              <div className="text-[11px] text-muted-foreground">Expenses</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Types</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expenses</option>
            </select>

            <label className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-border"
              />
              Show Inactive
            </label>
          </div>
        </div>

        {/* Accounts Tree */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[minmax(0,2.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.7fr)_minmax(0,0.6fr)] gap-2 px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/40">
              <div>Account</div>
              <div>Normal</div>
              <div>Balance</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            <div>
              {(selectedType === 'all' ? typeOrder : [selectedType]).map((type) => {
                const typeAccounts = accountsByType.get(type) || [];
                if (selectedType !== 'all' && typeAccounts.length === 0) {
                  return (
                    <div key={type} className="px-6 py-4 text-sm text-muted-foreground border-b border-border">
                      No accounts found for {getAccountTypeLabel(type)}.
                    </div>
                  );
                }

                const nodeId = typeNodeId(type);
                const isExpanded = expandedNodes.has(nodeId);
                const { roots, childrenByParentId } = buildTree(typeAccounts);

                return (
                  <div key={type} className="border-b border-border last:border-b-0">
                    <button
                      onClick={() => toggleNode(nodeId)}
                      className="w-full flex items-center justify-between px-6 py-3 bg-muted/40 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getAccountIcon(type)}
                        <span className="font-semibold text-foreground">
                          {getAccountTypeLabel(type)}
                        </span>
                        <span className="text-sm text-muted-foreground">({typeAccounts.length})</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div>
                        {roots.length > 0 ? (
                          roots.map((root) => renderAccountRow(root, 0, childrenByParentId))
                        ) : (
                          <div className="px-6 py-4 text-sm text-muted-foreground">
                            No accounts yet for this category.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && filteredAccounts.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">No accounts found matching your criteria.</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleImportFile}
        className="hidden"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'New Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount
                ? 'Update account details and status.'
                : 'Create a new account for your chart of accounts.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_code">Account Code</Label>
              <Input
                id="account_code"
                value={formData.account_code}
                onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                placeholder="1000"
                disabled={Boolean(editingAccount)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Cash and Cash Equivalents"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type</Label>
              <select
                id="account_type"
                value={formData.account_type}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    account_type: value,
                    normal_balance: defaultNormalBalance[value] || formData.normal_balance,
                  });
                }}
                disabled={Boolean(editingAccount)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
                <option value="contra_asset">Contra Asset</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="normal_balance">Normal Balance</Label>
              <select
                id="normal_balance"
                value={formData.normal_balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    normal_balance: e.target.value as 'debit' | 'credit',
                  })
                }
                disabled={Boolean(editingAccount)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="debit">Debit (DR)</option>
                <option value="credit">Credit (CR)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_subtype">Account Subtype</Label>
              <Input
                id="account_subtype"
                value={formData.account_subtype}
                onChange={(e) => setFormData({ ...formData, account_subtype: e.target.value })}
                placeholder="Cash"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_account_id">Parent Account</Label>
              <select
                id="parent_account_id"
                value={formData.parent_account_id}
                onChange={(e) => setFormData({ ...formData, parent_account_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No parent</option>
                {accounts
                  .filter((account) => account.id !== editingAccount?.id)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_code} - {account.account_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="min-h-[80px]"
              />
            </div>
            {editingAccount && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="is_active">Active account</Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingAccount ? 'Save Changes' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
