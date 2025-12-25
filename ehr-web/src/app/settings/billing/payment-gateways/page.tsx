'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Loader2, Edit2, CheckCircle, XCircle, Star, Zap } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BillingMastersService, PaymentGateway } from '@/services/billing-masters.service';

export default function PaymentGatewaysPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const headers = useApiHeaders();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [filteredGateways, setFilteredGateways] = useState<PaymentGateway[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [formData, setFormData] = useState({
    gateway_name: '',
    gateway_provider: 'stripe' as 'stripe' | 'sepay' | 'square' | 'authorize_net',
    merchant_id: '',
    api_key: '',
    api_secret: '',
    test_mode: true,
    supported_methods: ['credit_card'] as string[],
    is_active: true,
  });

  const resolvedOrgId = headers['x-org-id'] || orgId || currentFacility?.id || null;
  const hasOrgHeader = Boolean(headers['x-org-id']);

  useEffect(() => {
    if (resolvedOrgId && hasOrgHeader) {
      loadGateways();
    }
  }, [resolvedOrgId, showInactive, hasOrgHeader]);

  useEffect(() => {
    filterGateways();
  }, [gateways, searchTerm]);

  const loadGateways = async () => {
    if (!resolvedOrgId || !hasOrgHeader) return;
    try {
      setLoading(true);
      const response = await BillingMastersService.getPaymentGateways(resolvedOrgId, showInactive, headers);
      setGateways(response.data || []);
    } catch (error) {
      console.error('Error loading payment gateways:', error);
      toast.error('Failed to load payment gateways.');
    } finally {
      setLoading(false);
    }
  };

  const filterGateways = () => {
    let filtered = [...gateways];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => g.gateway_name.toLowerCase().includes(term) || g.merchant_id?.toLowerCase().includes(term));
    }
    setFilteredGateways(filtered);
  };

  const openCreateDialog = () => {
    setEditingGateway(null);
    setFormData({ gateway_name: '', gateway_provider: 'stripe', merchant_id: '', api_key: '', api_secret: '', test_mode: true, supported_methods: ['credit_card'], is_active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setFormData({
      gateway_name: gateway.gateway_name,
      gateway_provider: gateway.gateway_provider,
      merchant_id: gateway.merchant_id || '',
      api_key: '',
      api_secret: '',
      test_mode: gateway.test_mode,
      supported_methods: gateway.supported_methods || ['credit_card'],
      is_active: gateway.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!resolvedOrgId || !hasOrgHeader || !formData.gateway_name.trim()) {
      toast.error('Gateway name is required.');
      return;
    }
    try {
      setSaving(true);
      const data = {
        gateway_name: formData.gateway_name.trim(),
        gateway_provider: formData.gateway_provider,
        merchant_id: formData.merchant_id.trim() || undefined,
        test_mode: formData.test_mode,
        supported_methods: formData.supported_methods,
        is_active: formData.is_active,
        configuration: {
          api_key: formData.api_key || undefined,
          api_secret: formData.api_secret || undefined,
        }
      };
      if (editingGateway) {
        await BillingMastersService.updatePaymentGateway(resolvedOrgId, editingGateway.id, data, headers);
        toast.success(t('billing.masters.payment_gateways.update_success'));
      } else {
        await BillingMastersService.createPaymentGateway(resolvedOrgId, data, headers);
        toast.success(t('billing.masters.payment_gateways.create_success'));
      }
      setIsDialogOpen(false);
      await loadGateways();
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      toast.error('Failed to save payment gateway.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (gatewayId: string) => {
    if (!resolvedOrgId || !hasOrgHeader) return;
    try {
      setTesting(true);
      await BillingMastersService.testPaymentGateway(resolvedOrgId, gatewayId, headers);
      toast.success(t('billing.masters.payment_gateways.test_success'));
    } catch (error) {
      console.error('Error testing gateway:', error);
      toast.error(t('billing.masters.payment_gateways.test_failed'));
    } finally {
      setTesting(false);
    }
  };

  const handleSetDefault = async (gatewayId: string) => {
    if (!resolvedOrgId || !hasOrgHeader) return;
    try {
      await BillingMastersService.setDefaultGateway(resolvedOrgId, gatewayId, headers);
      toast.success(t('billing.masters.payment_gateways.default_set_success'));
      await loadGateways();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to set default gateway.');
    }
  };

  const stats = {
    total: gateways.length,
    active: gateways.filter(g => g.is_active).length,
    production: gateways.filter(g => !g.test_mode).length,
    hasDefault: gateways.some(g => g.is_default),
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-[1500px] mx-auto p-4 animate-in fade-in duration-500 space-y-6">
        <div className="flex flex-col gap-4 border-b border-border dark:border-gray-700 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/settings/billing" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted dark:hover:bg-gray-800 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />{t('billing.masters.payment_gateways.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.payment_gateways.title')}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.payment_gateways.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('billing.masters.payment_gateways.subtitle')}</p>
            </div>
            <Button size="sm" onClick={openCreateDialog} className="gap-2"><Plus className="h-4 w-4" />{t('billing.masters.payment_gateways.new_gateway')}</Button>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div><div className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.payment_gateways.total_gateways')}</div></div>
            <div><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.payment_gateways.active_count')}</div></div>
            <div><div className="text-2xl font-bold text-blue-600">{stats.production}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.payment_gateways.production_count')}</div></div>
            <div><div className="text-2xl font-bold text-yellow-600">{stats.hasDefault ? '1' : '0'}</div><div className="text-[11px] text-muted-foreground">{t('billing.masters.payment_gateways.default_gateway')}</div></div>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder={t('billing.masters.payment_gateways.search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-input bg-background dark:bg-gray-900 pl-10 pr-4 py-2 text-sm text-foreground dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <label className="flex items-center gap-2 rounded-md border border-input bg-background dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:text-gray-300">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded border-border" />{t('billing.masters.payment_gateways.show_inactive')}
            </label>
          </div>
        </div>

        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : (
          <div className="bg-card dark:bg-gray-800 rounded-lg border border-border dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 dark:bg-gray-900">
                  <tr className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">{t('billing.masters.payment_gateways.gateway_name')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.payment_gateways.gateway_provider')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.payment_gateways.merchant_id')}</th>
                    <th className="px-6 py-3 text-center">Mode</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.payment_gateways.status')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.payment_gateways.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {filteredGateways.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">{t('billing.masters.payment_gateways.no_gateways')}</td></tr>
                  ) : (
                    filteredGateways.map((gateway) => (
                      <tr key={gateway.id} className="hover:bg-muted/40 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">
                          <div className="flex items-center gap-2">
                            {gateway.gateway_name}
                            {gateway.is_default && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1"><Star className="h-3 w-3" />{t('billing.masters.payment_gateways.default_badge')}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{t(`billing.masters.payment_gateways.${gateway.gateway_provider}`)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{gateway.merchant_id || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          {gateway.test_mode ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">{t('billing.masters.payment_gateways.test_mode_badge')}</span> : <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">{t('billing.masters.payment_gateways.production_mode')}</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {gateway.is_active ? <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle className="h-4 w-4" /><span className="text-xs font-medium">{t('billing.masters.payment_gateways.active')}</span></span> : <span className="inline-flex items-center gap-1 text-muted-foreground"><XCircle className="h-4 w-4" /><span className="text-xs font-medium">{t('billing.masters.payment_gateways.inactive')}</span></span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!gateway.is_default && <button onClick={() => handleSetDefault(gateway.id)} className="text-yellow-600 hover:text-yellow-500" title={t('billing.masters.payment_gateways.set_as_default')}><Star className="h-4 w-4" /></button>}
                            <button onClick={() => handleTestConnection(gateway.id)} disabled={testing} className="text-blue-600 hover:text-blue-500" title={t('billing.masters.payment_gateways.test_connection')}><Zap className="h-4 w-4" /></button>
                            <button onClick={() => openEditDialog(gateway)} className="text-primary hover:text-primary/80"><Edit2 className="h-4 w-4" /></button>
                          </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">{editingGateway ? t('billing.masters.payment_gateways.edit_gateway') : t('billing.masters.payment_gateways.new_gateway')}</DialogTitle><DialogDescription className="dark:text-gray-300">{editingGateway ? 'Update payment gateway configuration.' : 'Add a new payment processing gateway.'}</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="gateway_name" className="dark:text-gray-200">{t('billing.masters.payment_gateways.gateway_name')}</Label><Input id="gateway_name" value={formData.gateway_name} onChange={(e) => setFormData({ ...formData, gateway_name: e.target.value })} placeholder="Stripe Production" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="gateway_provider" className="dark:text-gray-200">{t('billing.masters.payment_gateways.gateway_provider')}</Label><select id="gateway_provider" value={formData.gateway_provider} onChange={(e) => setFormData({ ...formData, gateway_provider: e.target.value as any })} className="w-full rounded-md border border-input bg-background dark:bg-gray-900 dark:text-white dark:border-gray-700 px-3 py-2 text-sm"><option value="stripe">{t('billing.masters.payment_gateways.stripe')}</option><option value="sepay">{t('billing.masters.payment_gateways.sepay')}</option><option value="square">{t('billing.masters.payment_gateways.square')}</option><option value="authorize_net">{t('billing.masters.payment_gateways.authorize_net')}</option></select></div>
            <div className="space-y-2"><Label htmlFor="merchant_id" className="dark:text-gray-200">{t('billing.masters.payment_gateways.merchant_id')}</Label><Input id="merchant_id" value={formData.merchant_id} onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })} placeholder="MERCH123" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="api_key" className="dark:text-gray-200">{t('billing.masters.payment_gateways.api_key')}</Label><Input id="api_key" type="password" value={formData.api_key} onChange={(e) => setFormData({ ...formData, api_key: e.target.value })} placeholder="sk_live_..." className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="space-y-2"><Label htmlFor="api_secret" className="dark:text-gray-200">{t('billing.masters.payment_gateways.api_secret')}</Label><Input id="api_secret" type="password" value={formData.api_secret} onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })} placeholder="Secret key" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
            <div className="flex items-center gap-2 sm:col-span-2"><input id="test_mode" type="checkbox" checked={formData.test_mode} onChange={(e) => setFormData({ ...formData, test_mode: e.target.checked })} className="rounded border-border" /><Label htmlFor="test_mode" className="dark:text-gray-200">{t('billing.masters.payment_gateways.test_mode')}</Label></div>
            {editingGateway && <div className="flex items-center gap-2 sm:col-span-2"><input id="is_active" type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded border-border" /><Label htmlFor="is_active" className="dark:text-gray-200">{t('billing.masters.payment_gateways.active')}</Label></div>}
          </div>
          <DialogFooter className="gap-2 sm:gap-3"><Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>{t('billing.masters.payment_gateways.cancel')}</Button><Button onClick={handleSave} disabled={saving}>{saving ? t('billing.masters.payment_gateways.saving') : t('billing.masters.payment_gateways.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
