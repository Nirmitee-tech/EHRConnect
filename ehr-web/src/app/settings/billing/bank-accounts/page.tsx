'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Loader2, Edit2, CheckCircle, XCircle, Star
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AccountingService, BankAccount, ChartOfAccount } from '@/services/accounting.service';

export default function BankAccountsPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState<BankAccount[]>([]);
  const [glAccounts, setGlAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number_last4: '',
    routing_number: '',
    account_type: 'checking' as 'checking' | 'savings' | 'payroll' | 'merchant',
    gl_account_id: '',
    current_balance: '0',
    is_active: true,
  });

  const resolvedOrgId = orgId || currentFacility?.id || null;

  useEffect(() => {
    if (resolvedOrgId) {
      loadBankAccounts();
      loadGLAccounts();
    }
  }, [resolvedOrgId, showInactive]);

  useEffect(() => {
    filterBankAccounts();
  }, [bankAccounts, searchTerm, selectedType]);

  const loadBankAccounts = async () => {
    if (!resolvedOrgId) return;

    try {
      setLoading(true);
      const response = await AccountingService.getBankAccounts(resolvedOrgId, !showInactive);
      setBankAccounts(response.data || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load bank accounts.');
    } finally {
      setLoading(false);
    }
  };

  const loadGLAccounts = async () => {
    if (!resolvedOrgId) return;

    try {
      const response = await AccountingService.getChartOfAccounts(resolvedOrgId, {
        account_type: 'asset',
        is_active: true,
        limit: 500
      });
      setGlAccounts(response.data || []);
    } catch (error) {
      console.error('Error loading GL accounts:', error);
    }
  };

  const filterBankAccounts = () => {
    let filtered = [...bankAccounts];

    if (selectedType !== 'all') {
      filtered = filtered.filter(ba => ba.account_type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ba =>
        ba.account_name.toLowerCase().includes(term) ||
        ba.bank_name.toLowerCase().includes(term)
      );
    }

    setFilteredBankAccounts(filtered);
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setFormData({
      account_name: '',
      bank_name: '',
      account_number_last4: '',
      routing_number: '',
      account_type: 'checking',
      gl_account_id: '',
      current_balance: '0',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name,
      bank_name: account.bank_name,
      account_number_last4: account.account_number_last4 || '',
      routing_number: account.routing_number || '',
      account_type: account.account_type || 'checking',
      gl_account_id: account.gl_account_id || '',
      current_balance: account.current_balance?.toString() || '0',
      is_active: account.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!resolvedOrgId) {
      toast.error('Organization context is required.');
      return;
    }

    if (!formData.account_name.trim() || !formData.bank_name.trim()) {
      toast.error('Account name and bank name are required.');
      return;
    }

    try {
      setSaving(true);

      const data = {
        account_name: formData.account_name.trim(),
        bank_name: formData.bank_name.trim(),
        account_number_last4: formData.account_number_last4.trim() || undefined,
        routing_number: formData.routing_number.trim() || undefined,
        account_type: formData.account_type,
        gl_account_id: formData.gl_account_id || undefined,
        current_balance: parseFloat(formData.current_balance) || 0,
        is_active: formData.is_active,
      };

      if (editingAccount) {
        toast.info('Update functionality coming soon.');
      } else {
        await AccountingService.createBankAccount(resolvedOrgId, data);
        toast.success(t('billing.masters.bank_accounts.create_success'));
      }

      setIsDialogOpen(false);
      await loadBankAccounts();
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('Failed to save bank account.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    if (!resolvedOrgId) return;

    try {
      await AccountingService.setDefaultBankAccount(resolvedOrgId, accountId);
      toast.success(t('billing.masters.bank_accounts.default_set_success'));
      await loadBankAccounts();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to set default bank account.');
    }
  };

  const stats = {
    total: bankAccounts.length,
    totalBalance: bankAccounts.reduce((sum, ba) => sum + (ba.current_balance || 0), 0),
    hasDefault: bankAccounts.some(ba => ba.is_default),
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-[1500px] mx-auto p-4 animate-in fade-in duration-500 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border dark:border-gray-700 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted dark:hover:bg-gray-800 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('billing.masters.bank_accounts.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.bank_accounts.title')}</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.bank_accounts.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('billing.masters.bank_accounts.subtitle')}
              </p>
            </div>

            <Button size="sm" onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('billing.masters.bank_accounts.new_bank_account')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.bank_accounts.total_accounts')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">${stats.totalBalance.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.bank_accounts.total_balance')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.hasDefault ? '1' : '0'}</div>
              <div className="text-[11px] text-muted-foreground">Default Account</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('billing.masters.bank_accounts.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background dark:bg-gray-900 pl-10 pr-4 py-2 text-sm text-foreground dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-input bg-background dark:bg-gray-900 text-foreground dark:text-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">{t('billing.masters.bank_accounts.all_types')}</option>
              <option value="checking">{t('billing.masters.bank_accounts.checking')}</option>
              <option value="savings">{t('billing.masters.bank_accounts.savings')}</option>
              <option value="payroll">{t('billing.masters.bank_accounts.payroll')}</option>
              <option value="merchant">{t('billing.masters.bank_accounts.merchant')}</option>
            </select>

            <label className="flex items-center gap-2 rounded-md border border-input bg-background dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:text-gray-300">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-border"
              />
              {t('billing.masters.bank_accounts.show_inactive')}
            </label>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-card dark:bg-gray-800 rounded-lg border border-border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 dark:bg-gray-900">
                  <tr className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">{t('billing.masters.bank_accounts.account_name')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.bank_accounts.bank_name')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.bank_accounts.account_type')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.bank_accounts.gl_account')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.bank_accounts.current_balance')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.bank_accounts.status')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.bank_accounts.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {filteredBankAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        {t('billing.masters.bank_accounts.no_bank_accounts')}
                      </td>
                    </tr>
                  ) : (
                    filteredBankAccounts.map((ba) => (
                      <tr key={ba.id} className="hover:bg-muted/40 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">
                          <div className="flex items-center gap-2">
                            {ba.account_name}
                            {ba.is_default && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {t('billing.masters.bank_accounts.default_badge')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground dark:text-white">{ba.bank_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {ba.account_type || 'checking'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {ba.gl_account_code ? `${ba.gl_account_code} - ${ba.gl_account_name}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-foreground dark:text-white">
                          ${(ba.current_balance || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {ba.is_active ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.bank_accounts.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.bank_accounts.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!ba.is_default && (
                            <button
                              onClick={() => handleSetDefault(ba.id)}
                              className="text-yellow-600 hover:text-yellow-500 mr-3"
                              title={t('billing.masters.bank_accounts.set_as_default')}
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditDialog(ba)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {editingAccount ? t('billing.masters.bank_accounts.edit_bank_account') : t('billing.masters.bank_accounts.new_bank_account')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {editingAccount ? 'Update bank account details.' : 'Create a new bank account for your organization.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_name" className="dark:text-gray-200">{t('billing.masters.bank_accounts.account_name')}</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Operating Account"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name" className="dark:text-gray-200">{t('billing.masters.bank_accounts.bank_name')}</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Chase Bank"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_type" className="dark:text-gray-200">{t('billing.masters.bank_accounts.account_type')}</Label>
              <select
                id="account_type"
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"
              >
                <option value="checking">{t('billing.masters.bank_accounts.checking')}</option>
                <option value="savings">{t('billing.masters.bank_accounts.savings')}</option>
                <option value="payroll">{t('billing.masters.bank_accounts.payroll')}</option>
                <option value="merchant">{t('billing.masters.bank_accounts.merchant')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gl_account_id" className="dark:text-gray-200">{t('billing.masters.bank_accounts.gl_account')}</Label>
              <select
                id="gl_account_id"
                value={formData.gl_account_id}
                onChange={(e) => setFormData({ ...formData, gl_account_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"
              >
                <option value="">{t('billing.masters.bank_accounts.select_gl_account')}</option>
                {glAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_code} - {acc.account_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_balance" className="dark:text-gray-200">{t('billing.masters.bank_accounts.current_balance')}</Label>
              <Input
                id="current_balance"
                type="number"
                step="0.01"
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                placeholder="0.00"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number_last4" className="dark:text-gray-200">{t('billing.masters.bank_accounts.account_number_last4')}</Label>
              <Input
                id="account_number_last4"
                value={formData.account_number_last4}
                onChange={(e) => setFormData({ ...formData, account_number_last4: e.target.value })}
                placeholder="1234"
                maxLength={4}
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
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
                <Label htmlFor="is_active" className="dark:text-gray-200">{t('billing.masters.bank_accounts.active')}</Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              {t('billing.masters.bank_accounts.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('billing.masters.bank_accounts.saving') : t('billing.masters.bank_accounts.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
