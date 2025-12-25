'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Loader2, Edit2, Trash2,
  CheckCircle, XCircle, BarChart3, Building2, Users, DollarSign
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AccountingService, CostCenter } from '@/services/accounting.service';

export default function CostCentersPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [filteredCostCenters, setFilteredCostCenters] = useState<CostCenter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [formData, setFormData] = useState({
    cost_center_code: '',
    cost_center_name: '',
    cost_center_type: 'revenue_generating' as 'revenue_generating' | 'administrative' | 'support',
    department_id: '',
    parent_cost_center_id: '',
    budget_amount: '',
    description: '',
    is_active: true,
  });

  const resolvedOrgId = orgId || currentFacility?.id || null;

  useEffect(() => {
    if (resolvedOrgId) {
      loadCostCenters();
    }
  }, [resolvedOrgId, showInactive]);

  useEffect(() => {
    filterCostCenters();
  }, [costCenters, searchTerm, selectedType]);

  const loadCostCenters = async () => {
    if (!resolvedOrgId) return;

    try {
      setLoading(true);
      const response = await AccountingService.getCostCenters(resolvedOrgId, {
        is_active: !showInactive ? true : undefined,
        limit: 1000
      });
      setCostCenters(response.data || []);
    } catch (error) {
      console.error('Error loading cost centers:', error);
      toast.error('Failed to load cost centers.');
    } finally {
      setLoading(false);
    }
  };

  const filterCostCenters = () => {
    let filtered = [...costCenters];

    if (selectedType !== 'all') {
      filtered = filtered.filter(cc => cc.cost_center_type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cc =>
        cc.cost_center_code.toLowerCase().includes(term) ||
        cc.cost_center_name.toLowerCase().includes(term) ||
        cc.department_name?.toLowerCase().includes(term)
      );
    }

    setFilteredCostCenters(filtered);
  };

  const openCreateDialog = () => {
    setEditingCostCenter(null);
    setFormData({
      cost_center_code: '',
      cost_center_name: '',
      cost_center_type: 'revenue_generating',
      department_id: '',
      parent_cost_center_id: '',
      budget_amount: '',
      description: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setFormData({
      cost_center_code: costCenter.cost_center_code,
      cost_center_name: costCenter.cost_center_name,
      cost_center_type: costCenter.cost_center_type,
      department_id: costCenter.department_id || '',
      parent_cost_center_id: costCenter.parent_cost_center_id || '',
      budget_amount: costCenter.budget_amount?.toString() || '',
      description: costCenter.metadata?.description || '',
      is_active: costCenter.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!resolvedOrgId) {
      toast.error('Organization context is required.');
      return;
    }

    if (!formData.cost_center_code.trim() || !formData.cost_center_name.trim()) {
      toast.error('Cost center code and name are required.');
      return;
    }

    try {
      setSaving(true);

      const data = {
        cost_center_code: formData.cost_center_code.trim(),
        cost_center_name: formData.cost_center_name.trim(),
        cost_center_type: formData.cost_center_type,
        department_id: formData.department_id || undefined,
        parent_cost_center_id: formData.parent_cost_center_id || undefined,
        budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : undefined,
        is_active: formData.is_active,
        metadata: {
          description: formData.description.trim() || undefined
        }
      };

      if (editingCostCenter) {
        await AccountingService.updateCostCenter(resolvedOrgId, editingCostCenter.id, data);
        toast.success(t('billing.masters.cost_centers.update_success'));
      } else {
        await AccountingService.createCostCenter(resolvedOrgId, data);
        toast.success(t('billing.masters.cost_centers.create_success'));
      }

      setIsDialogOpen(false);
      await loadCostCenters();
    } catch (error) {
      console.error('Error saving cost center:', error);
      toast.error('Failed to save cost center.');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: costCenters.length,
    active: costCenters.filter(cc => cc.is_active).length,
    revenueGen: costCenters.filter(cc => cc.cost_center_type === 'revenue_generating').length,
    admin: costCenters.filter(cc => cc.cost_center_type === 'administrative').length,
    support: costCenters.filter(cc => cc.cost_center_type === 'support').length,
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
              {t('billing.masters.cost_centers.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.cost_centers.title')}</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.cost_centers.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('billing.masters.cost_centers.subtitle')}
              </p>
            </div>

            <Button size="sm" onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('billing.masters.cost_centers.new_cost_center')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-5">
            <div>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.cost_centers.total_cost_centers')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.cost_centers.active_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.revenueGen}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.cost_centers.revenue_gen_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.admin}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.cost_centers.admin_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.support}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.cost_centers.support_count')}</div>
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
                placeholder={t('billing.masters.cost_centers.search_placeholder')}
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
              <option value="all">{t('billing.masters.cost_centers.all_types')}</option>
              <option value="revenue_generating">{t('billing.masters.cost_centers.revenue_generating')}</option>
              <option value="administrative">{t('billing.masters.cost_centers.administrative')}</option>
              <option value="support">{t('billing.masters.cost_centers.support')}</option>
            </select>

            <label className="flex items-center gap-2 rounded-md border border-input bg-background dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:text-gray-300">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-border"
              />
              {t('billing.masters.cost_centers.show_inactive')}
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
                    <th className="px-6 py-3 text-left">{t('billing.masters.cost_centers.cost_center_code')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.cost_centers.cost_center_name')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.cost_centers.cost_center_type')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.cost_centers.department')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.cost_centers.budget_amount')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.cost_centers.status')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.cost_centers.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {filteredCostCenters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        {t('billing.masters.cost_centers.no_cost_centers')}
                      </td>
                    </tr>
                  ) : (
                    filteredCostCenters.map((cc) => (
                      <tr key={cc.id} className="hover:bg-muted/40 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 text-sm font-mono text-foreground dark:text-white">{cc.cost_center_code}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">{cc.cost_center_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            cc.cost_center_type === 'revenue_generating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            cc.cost_center_type === 'administrative' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {cc.cost_center_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{cc.department_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-foreground dark:text-white">
                          {cc.budget_amount ? `$${cc.budget_amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {cc.is_active ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.cost_centers.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.cost_centers.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditDialog(cc)}
                            className="text-primary hover:text-primary/80 mr-3"
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
              {editingCostCenter ? t('billing.masters.cost_centers.edit_cost_center') : t('billing.masters.cost_centers.new_cost_center')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {editingCostCenter ? 'Update cost center details.' : 'Create a new cost center for budgeting and allocation.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost_center_code" className="dark:text-gray-200">{t('billing.masters.cost_centers.cost_center_code')}</Label>
              <Input
                id="cost_center_code"
                value={formData.cost_center_code}
                onChange={(e) => setFormData({ ...formData, cost_center_code: e.target.value })}
                placeholder="CC001"
                disabled={Boolean(editingCostCenter)}
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_center_name" className="dark:text-gray-200">{t('billing.masters.cost_centers.cost_center_name')}</Label>
              <Input
                id="cost_center_name"
                value={formData.cost_center_name}
                onChange={(e) => setFormData({ ...formData, cost_center_name: e.target.value })}
                placeholder="Cardiology Department"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_center_type" className="dark:text-gray-200">{t('billing.masters.cost_centers.cost_center_type')}</Label>
              <select
                id="cost_center_type"
                value={formData.cost_center_type}
                onChange={(e) => setFormData({ ...formData, cost_center_type: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"
              >
                <option value="revenue_generating">{t('billing.masters.cost_centers.revenue_generating')}</option>
                <option value="administrative">{t('billing.masters.cost_centers.administrative')}</option>
                <option value="support">{t('billing.masters.cost_centers.support')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_amount" className="dark:text-gray-200">{t('billing.masters.cost_centers.budget_amount')}</Label>
              <Input
                id="budget_amount"
                type="number"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                placeholder="50000.00"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description" className="dark:text-gray-200">{t('billing.masters.cost_centers.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="min-h-[80px] dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            {editingCostCenter && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="is_active" className="dark:text-gray-200">{t('billing.masters.cost_centers.active')}</Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              {t('billing.masters.cost_centers.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('billing.masters.cost_centers.saving') : t('billing.masters.cost_centers.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
