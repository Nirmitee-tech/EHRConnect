'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Loader2, Edit2, CheckCircle, XCircle
} from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BillingMastersService, Payer } from '@/services/billing-masters.service';

export default function PayersPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const headers = useApiHeaders();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [filteredPayers, setFilteredPayers] = useState<Payer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    payer_id: '',
    payer_type: 'commercial' as any,
    contact_email: '',
    contact_phone: '',
    claim_submission_method: 'electronic' as 'electronic' | 'paper' | 'portal',
    timely_filing_days: '90',
    requires_prior_auth: false,
    era_supported: false,
    edi_payer_id: '',
    clearinghouse_id: '',
    active: true,
  });

  const resolvedOrgId = headers['x-org-id'] || orgId || currentFacility?.id || null;
  const hasOrgHeader = Boolean(headers['x-org-id']);

  useEffect(() => {
    if (resolvedOrgId && hasOrgHeader) {
      loadPayers();
    }
  }, [resolvedOrgId, showInactive, hasOrgHeader]);

  useEffect(() => {
    filterPayers();
  }, [payers, searchTerm, selectedType]);

  const loadPayers = async () => {
    if (!hasOrgHeader) return;
    try {
      setLoading(true);
      const response = await BillingMastersService.getPayers({
        active: !showInactive ? true : undefined,
        limit: 1000
      }, headers);
      setPayers(response.data || []);
    } catch (error) {
      console.error('Error loading payers:', error);
      toast.error('Failed to load payers.');
    } finally {
      setLoading(false);
    }
  };

  const filterPayers = () => {
    let filtered = [...payers];

    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.payer_type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.payer_id?.toLowerCase().includes(term) ||
        p.edi_payer_id?.toLowerCase().includes(term)
      );
    }

    setFilteredPayers(filtered);
  };

  const openCreateDialog = () => {
    setEditingPayer(null);
    setFormData({
      name: '',
      payer_id: '',
      payer_type: 'commercial',
      contact_email: '',
      contact_phone: '',
      claim_submission_method: 'electronic',
      timely_filing_days: '90',
      requires_prior_auth: false,
      era_supported: false,
      edi_payer_id: '',
      clearinghouse_id: '',
      active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (payer: Payer) => {
    setEditingPayer(payer);
    setFormData({
      name: payer.name,
      payer_id: payer.payer_id || '',
      payer_type: payer.payer_type,
      contact_email: payer.contact_email || '',
      contact_phone: payer.contact_phone || '',
      claim_submission_method: payer.claim_submission_method || 'electronic',
      timely_filing_days: payer.timely_filing_days?.toString() || '90',
      requires_prior_auth: payer.requires_prior_auth,
      era_supported: payer.era_supported,
      edi_payer_id: payer.edi_payer_id || '',
      clearinghouse_id: payer.clearinghouse_id || '',
      active: payer.active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Payer name is required.');
      return;
    }
    if (!hasOrgHeader) {
      toast.error('Organization context is required.');
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: formData.name.trim(),
        payer_id: formData.payer_id.trim() || undefined,
        payer_type: formData.payer_type,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        claim_submission_method: formData.claim_submission_method,
        timely_filing_days: parseInt(formData.timely_filing_days) || 90,
        requires_prior_auth: formData.requires_prior_auth,
        era_supported: formData.era_supported,
        edi_payer_id: formData.edi_payer_id.trim() || undefined,
        clearinghouse_id: formData.clearinghouse_id.trim() || undefined,
        active: formData.active,
      };

      if (editingPayer) {
        await BillingMastersService.updatePayer(editingPayer.id, data, headers);
        toast.success(t('billing.masters.payers.update_success'));
      } else {
        await BillingMastersService.createPayer(data, headers);
        toast.success(t('billing.masters.payers.create_success'));
      }

      setIsDialogOpen(false);
      await loadPayers();
    } catch (error) {
      console.error('Error saving payer:', error);
      toast.error('Failed to save payer.');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: payers.length,
    active: payers.filter(p => p.active).length,
    medicare: payers.filter(p => p.payer_type === 'medicare').length,
    medicaid: payers.filter(p => p.payer_type === 'medicaid').length,
    commercial: payers.filter(p => p.payer_type === 'commercial').length,
    eraEnabled: payers.filter(p => p.era_supported).length,
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
              {t('billing.masters.payers.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.payers.title')}</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.payers.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('billing.masters.payers.subtitle')}
              </p>
            </div>

            <Button size="sm" onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('billing.masters.payers.new_payer')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-6">
            <div>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.payers.total_payers')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-[11px] text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.medicare}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.payers.medicare_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.medicaid}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.payers.medicaid_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.commercial}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.payers.commercial_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.eraEnabled}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.payers.era_enabled_count')}</div>
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
                placeholder={t('billing.masters.payers.search_placeholder')}
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
              <option value="all">{t('billing.masters.payers.all_types')}</option>
              <option value="medicare">{t('billing.masters.payers.medicare')}</option>
              <option value="medicaid">{t('billing.masters.payers.medicaid')}</option>
              <option value="commercial">{t('billing.masters.payers.commercial')}</option>
              <option value="self_pay">{t('billing.masters.payers.self_pay')}</option>
              <option value="workers_comp">{t('billing.masters.payers.workers_comp')}</option>
              <option value="tricare">{t('billing.masters.payers.tricare')}</option>
              <option value="champva">{t('billing.masters.payers.champva')}</option>
              <option value="other">{t('billing.masters.payers.other')}</option>
            </select>

            <label className="flex items-center gap-2 rounded-md border border-input bg-background dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:text-gray-300">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-border"
              />
              {t('billing.masters.payers.show_inactive')}
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
                    <th className="px-6 py-3 text-left">{t('billing.masters.payers.payer_name')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.payers.payer_id')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.payers.payer_type')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.payers.claim_submission_method')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.payers.timely_filing_days')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.payers.era_supported')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.payers.status')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.payers.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {filteredPayers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        {t('billing.masters.payers.no_payers')}
                      </td>
                    </tr>
                  ) : (
                    filteredPayers.map((payer) => (
                      <tr key={payer.id} className="hover:bg-muted/40 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">{payer.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{payer.payer_id || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payer.payer_type === 'medicare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            payer.payer_type === 'medicaid' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            payer.payer_type === 'commercial' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {t(`billing.masters.payers.${payer.payer_type}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {payer.claim_submission_method ? t(`billing.masters.payers.${payer.claim_submission_method}`) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-foreground dark:text-white">{payer.timely_filing_days}</td>
                        <td className="px-6 py-4 text-center">
                          {payer.era_supported ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {payer.active ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.payers.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.payers.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditDialog(payer)}
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
        <DialogContent className="sm:max-w-[700px] dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {editingPayer ? t('billing.masters.payers.edit_payer') : t('billing.masters.payers.new_payer')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {editingPayer ? 'Update insurance payer details.' : 'Create a new insurance payer for claim processing.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="dark:text-gray-200">{t('billing.masters.payers.payer_name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Blue Cross Blue Shield"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payer_id" className="dark:text-gray-200">{t('billing.masters.payers.payer_id')}</Label>
              <Input
                id="payer_id"
                value={formData.payer_id}
                onChange={(e) => setFormData({ ...formData, payer_id: e.target.value })}
                placeholder="BCBS001"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payer_type" className="dark:text-gray-200">{t('billing.masters.payers.payer_type')}</Label>
              <select
                id="payer_type"
                value={formData.payer_type}
                onChange={(e) => setFormData({ ...formData, payer_type: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"
              >
                <option value="commercial">{t('billing.masters.payers.commercial')}</option>
                <option value="medicare">{t('billing.masters.payers.medicare')}</option>
                <option value="medicaid">{t('billing.masters.payers.medicaid')}</option>
                <option value="self_pay">{t('billing.masters.payers.self_pay')}</option>
                <option value="workers_comp">{t('billing.masters.payers.workers_comp')}</option>
                <option value="tricare">{t('billing.masters.payers.tricare')}</option>
                <option value="champva">{t('billing.masters.payers.champva')}</option>
                <option value="other">{t('billing.masters.payers.other')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="dark:text-gray-200">{t('billing.masters.payers.contact_email')}</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="claims@payer.com"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="dark:text-gray-200">{t('billing.masters.payers.contact_phone')}</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="1-800-555-0123"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim_submission_method" className="dark:text-gray-200">{t('billing.masters.payers.claim_submission_method')}</Label>
              <select
                id="claim_submission_method"
                value={formData.claim_submission_method}
                onChange={(e) => setFormData({ ...formData, claim_submission_method: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"
              >
                <option value="electronic">{t('billing.masters.payers.electronic')}</option>
                <option value="paper">{t('billing.masters.payers.paper')}</option>
                <option value="portal">{t('billing.masters.payers.portal')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timely_filing_days" className="dark:text-gray-200">{t('billing.masters.payers.timely_filing_days')}</Label>
              <Input
                id="timely_filing_days"
                type="number"
                value={formData.timely_filing_days}
                onChange={(e) => setFormData({ ...formData, timely_filing_days: e.target.value })}
                placeholder="90"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edi_payer_id" className="dark:text-gray-200">{t('billing.masters.payers.edi_payer_id')}</Label>
              <Input
                id="edi_payer_id"
                value={formData.edi_payer_id}
                onChange={(e) => setFormData({ ...formData, edi_payer_id: e.target.value })}
                placeholder="EDI123"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clearinghouse_id" className="dark:text-gray-200">{t('billing.masters.payers.clearinghouse_id')}</Label>
              <Input
                id="clearinghouse_id"
                value={formData.clearinghouse_id}
                onChange={(e) => setFormData({ ...formData, clearinghouse_id: e.target.value })}
                placeholder="CH001"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            <div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requires_prior_auth}
                  onChange={(e) => setFormData({ ...formData, requires_prior_auth: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm dark:text-gray-200">{t('billing.masters.payers.requires_prior_auth')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.era_supported}
                  onChange={(e) => setFormData({ ...formData, era_supported: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm dark:text-gray-200">{t('billing.masters.payers.era_supported')}</span>
              </label>
            </div>
            {editingPayer && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="active" className="dark:text-gray-200">{t('billing.masters.payers.active')}</Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              {t('billing.masters.payers.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('billing.masters.payers.saving') : t('billing.masters.payers.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
