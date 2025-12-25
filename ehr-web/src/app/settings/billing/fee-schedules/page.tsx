'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Loader2, Edit2, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BillingMastersService, FeeSchedule, Payer } from '@/services/billing-masters.service';

export default function FeeSchedulesPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const headers = useApiHeaders();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([]);
  const [filteredFeeSchedules, setFilteredFeeSchedules] = useState<FeeSchedule[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeeSchedule, setEditingFeeSchedule] = useState<FeeSchedule | null>(null);
  const [formData, setFormData] = useState({
    cpt_code: '',
    payer_id: '',
    modifier: '',
    amount: '',
    facility_amount: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    active: true,
  });

  const resolvedOrgId = headers['x-org-id'] || orgId || currentFacility?.id || null;
  const hasOrgHeader = Boolean(headers['x-org-id']);

  useEffect(() => {
    if (resolvedOrgId && hasOrgHeader) {
      loadFeeSchedules();
      loadPayers();
    }
  }, [resolvedOrgId, showInactive, hasOrgHeader]);

  useEffect(() => {
    filterFeeSchedules();
  }, [feeSchedules, searchTerm, selectedPayer]);

  const loadFeeSchedules = async () => {
    if (!resolvedOrgId || !hasOrgHeader) return;
    try {
      setLoading(true);
      const response = await BillingMastersService.getFeeSchedules(resolvedOrgId, { active: !showInactive ? true : undefined, limit: 1000 }, headers);
      setFeeSchedules(response.data || []);
    } catch (error) {
      console.error('Error loading fee schedules:', error);
      toast.error('Failed to load fee schedules.');
    } finally {
      setLoading(false);
    }
  };

  const loadPayers = async () => {
    if (!hasOrgHeader) return;
    try {
      const response = await BillingMastersService.getPayers({ active: true, limit: 500 }, headers);
      setPayers(response.data || []);
    } catch (error) {
      console.error('Error loading payers:', error);
    }
  };

  const filterFeeSchedules = () => {
    let filtered = [...feeSchedules];
    if (selectedPayer !== 'all') filtered = filtered.filter(f => f.payer_id === selectedPayer);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => f.cpt_code.toLowerCase().includes(term) || f.cpt_description?.toLowerCase().includes(term));
    }
    setFilteredFeeSchedules(filtered);
  };

  const openCreateDialog = () => {
    setEditingFeeSchedule(null);
    setFormData({ cpt_code: '', payer_id: '', modifier: '', amount: '', facility_amount: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '', active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (fee: FeeSchedule) => {
    setEditingFeeSchedule(fee);
    setFormData({
      cpt_code: fee.cpt_code,
      payer_id: fee.payer_id || '',
      modifier: fee.modifier || '',
      amount: fee.amount?.toString() || '',
      facility_amount: fee.facility_amount?.toString() || '',
      effective_from: fee.effective_from?.split('T')[0] || '',
      effective_to: fee.effective_to?.split('T')[0] || '',
      active: fee.active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!resolvedOrgId || !hasOrgHeader || !formData.cpt_code.trim() || !formData.amount) {
      toast.error('CPT code and amount are required.');
      return;
    }
    try {
      setSaving(true);
      const data = {
        cpt_code: formData.cpt_code.trim(),
        payer_id: formData.payer_id || undefined,
        modifier: formData.modifier.trim() || undefined,
        amount: parseFloat(formData.amount),
        facility_amount: formData.facility_amount ? parseFloat(formData.facility_amount) : undefined,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || undefined,
        active: formData.active,
      };
      await BillingMastersService.createFeeSchedule(resolvedOrgId, data, headers);
      toast.success(t('billing.masters.fee_schedules.create_success'));
      setIsDialogOpen(false);
      await loadFeeSchedules();
    } catch (error) {
      console.error('Error saving fee schedule:', error);
      toast.error('Failed to save fee schedule.');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: feeSchedules.length,
    active: feeSchedules.filter(f => f.active).length,
    payersWithFees: new Set(feeSchedules.map(f => f.payer_id)).size,
    cptCodesWithFees: new Set(feeSchedules.map(f => f.cpt_code)).size,
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-[1500px] mx-auto p-4 animate-in fade-in duration-500 space-y-6">
        <div className="flex flex-col gap-4 border-b border-border dark:border-gray-700 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/settings/billing" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted dark:hover:bg-gray-800 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />{t('billing.masters.fee_schedules.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.fee_schedules.title')}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.fee_schedules.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('billing.masters.fee_schedules.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2"><Upload className="h-4 w-4" />{t('billing.masters.fee_schedules.bulk_import')}</Button>
              <Button size="sm" onClick={openCreateDialog} className="gap-2"><Plus className="h-4 w-4" />{t('billing.masters.fee_schedules.new_fee_schedule')}</Button>
            </div>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div><div className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.fee_schedules.total_schedules')}</div></div>
            <div><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.fee_schedules.active_count')}</div></div>
            <div><div className="text-2xl font-bold text-blue-600">{stats.payersWithFees}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.fee_schedules.payers_with_fees')}</div></div>
            <div><div className="text-2xl font-bold text-purple-600">{stats.cptCodesWithFees}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.fee_schedules.cpt_codes_with_fees')}</div></div>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder={t('billing.masters.fee_schedules.search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-input bg-background dark:bg-gray-900 pl-10 pr-4 py-2 text-sm text-foreground dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <select value={selectedPayer} onChange={(e) => setSelectedPayer(e.target.value)} className="rounded-md border border-input bg-background dark:bg-gray-900 text-foreground dark:text-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="all">{t('billing.masters.fee_schedules.all_payers')}</option>
              {payers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-md border border-input bg-background dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:text-gray-300">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded border-border" />{t('billing.masters.fee_schedules.show_inactive')}
            </label>
          </div>
        </div>

        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : (
          <div className="bg-card dark:bg-gray-800 rounded-lg border border-border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 dark:bg-gray-900">
                  <tr className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">{t('billing.masters.fee_schedules.cpt_code')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.fee_schedules.payer')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.fee_schedules.amount')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.fee_schedules.facility_amount')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.fee_schedules.effective_from')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.fee_schedules.status')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.fee_schedules.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {filteredFeeSchedules.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">{t('billing.masters.fee_schedules.no_fee_schedules')}</td></tr>
                  ) : (
                    filteredFeeSchedules.map((fee) => (
                      <tr key={fee.id} className="hover:bg-muted/40 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 text-sm font-mono text-foreground dark:text-white">{fee.cpt_code}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{fee.payer_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-foreground dark:text-white">${fee.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right text-muted-foreground">{fee.facility_amount ? `$${fee.facility_amount.toLocaleString()}` : '-'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(fee.effective_from).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">{fee.active ? <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle className="h-4 w-4" /><span className="text-xs font-medium">{t('billing.masters.fee_schedules.active')}</span></span> : <span className="inline-flex items-center gap-1 text-muted-foreground"><XCircle className="h-4 w-4" /><span className="text-xs font-medium">{t('billing.masters.fee_schedules.inactive')}</span></span>}</td>
                        <td className="px-6 py-4 text-right"><button onClick={() => openEditDialog(fee)} className="text-primary hover:text-primary/80"><Edit2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">{editingFeeSchedule ? t('billing.masters.fee_schedules.edit_fee_schedule') : t('billing.masters.fee_schedules.new_fee_schedule')}</DialogTitle><DialogDescription className="dark:text-gray-300">{editingFeeSchedule ? 'Update fee schedule details.' : 'Create a new fee schedule for CPT code pricing.'}</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="cpt_code" className="dark:text-gray-200">{t('billing.masters.fee_schedules.cpt_code')}</Label><Input id="cpt_code" value={formData.cpt_code} onChange={(e) => setFormData({ ...formData, cpt_code: e.target.value })} placeholder="99213" disabled={Boolean(editingFeeSchedule)} className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="payer_id" className="dark:text-gray-200">{t('billing.masters.fee_schedules.payer')}</Label><select id="payer_id" value={formData.payer_id} onChange={(e) => setFormData({ ...formData, payer_id: e.target.value })} className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"><option value="">All Payers</option>{payers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="amount" className="dark:text-gray-200">{t('billing.masters.fee_schedules.amount')}</Label><Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="150.00" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="facility_amount" className="dark:text-gray-200">{t('billing.masters.fee_schedules.facility_amount')}</Label><Input id="facility_amount" type="number" step="0.01" value={formData.facility_amount} onChange={(e) => setFormData({ ...formData, facility_amount: e.target.value })} placeholder="120.00" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="effective_from" className="dark:text-gray-200">{t('billing.masters.fee_schedules.effective_from')}</Label><Input id="effective_from" type="date" value={formData.effective_from} onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })} className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="effective_to" className="dark:text-gray-200">{t('billing.masters.fee_schedules.effective_to')}</Label><Input id="effective_to" type="date" value={formData.effective_to} onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })} className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            {editingFeeSchedule && <div className="flex items-center gap-2 sm:col-span-2"><input id="active" type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="rounded border-border" /><Label htmlFor="active" className="dark:text-gray-200">{t('billing.masters.fee_schedules.active')}</Label></div>}
          </div>
          <DialogFooter className="gap-2 sm:gap-3"><Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>{t('billing.masters.fee_schedules.cancel')}</Button><Button onClick={handleSave} disabled={saving}>{saving ? t('billing.masters.fee_schedules.saving') : t('billing.masters.fee_schedules.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
