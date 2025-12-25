'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Loader2, Edit2, CheckCircle, XCircle, Shield
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
import { BillingMastersService, Provider } from '@/services/billing-masters.service';

export default function ProvidersPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const headers = useApiHeaders();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    npi: '',
    first_name: '',
    last_name: '',
    credentials: '',
    specialty: '',
    taxonomy_code: '',
    license_number: '',
    license_state: '',
    dea_number: '',
    is_billing_provider: false,
    is_rendering_provider: false,
    is_referring_provider: false,
    active: true,
  });

  const resolvedOrgId = headers['x-org-id'] || orgId || currentFacility?.id || null;
  const hasOrgHeader = Boolean(headers['x-org-id']);

  useEffect(() => {
    if (resolvedOrgId && hasOrgHeader) {
      loadProviders();
    }
  }, [resolvedOrgId, showInactive, hasOrgHeader]);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, selectedRole]);

  const loadProviders = async () => {
    if (!resolvedOrgId || !hasOrgHeader) return;

    try {
      setLoading(true);
      const response = await BillingMastersService.getProviders(resolvedOrgId, {
        active: !showInactive ? true : undefined,
        limit: 1000
      }, headers);
      setProviders(response.data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Failed to load providers.');
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    if (selectedRole !== 'all') {
      filtered = filtered.filter(p => {
        if (selectedRole === 'billing') return p.is_billing_provider;
        if (selectedRole === 'rendering') return p.is_rendering_provider;
        if (selectedRole === 'referring') return p.is_referring_provider;
        return true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.npi.toLowerCase().includes(term) ||
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        p.specialty?.toLowerCase().includes(term)
      );
    }

    setFilteredProviders(filtered);
  };

  const openCreateDialog = () => {
    setEditingProvider(null);
    setFormData({
      npi: '',
      first_name: '',
      last_name: '',
      credentials: '',
      specialty: '',
      taxonomy_code: '',
      license_number: '',
      license_state: '',
      dea_number: '',
      is_billing_provider: false,
      is_rendering_provider: false,
      is_referring_provider: false,
      active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      npi: provider.npi,
      first_name: provider.first_name || '',
      last_name: provider.last_name || '',
      credentials: provider.credentials || '',
      specialty: provider.specialty || '',
      taxonomy_code: provider.taxonomy_code || '',
      license_number: provider.license_number || '',
      license_state: provider.license_state || '',
      dea_number: provider.dea_number || '',
      is_billing_provider: provider.is_billing_provider,
      is_rendering_provider: provider.is_rendering_provider,
      is_referring_provider: provider.is_referring_provider,
      active: provider.active,
    });
    setIsDialogOpen(true);
  };

  const handleVerifyNPI = async () => {
    if (!formData.npi || formData.npi.length !== 10) {
      toast.error('Please enter a valid 10-digit NPI.');
      return;
    }
    if (!hasOrgHeader) {
      toast.error('Organization context is required.');
      return;
    }

    try {
      setVerifying(true);
      const result = await BillingMastersService.verifyNPI(formData.npi, headers);

      if (result.success) {
        setFormData({
          ...formData,
          first_name: result.data.first_name || formData.first_name,
          last_name: result.data.last_name || formData.last_name,
          credentials: result.data.credentials || formData.credentials,
          specialty: result.data.specialty || formData.specialty,
          taxonomy_code: result.data.taxonomy_code || formData.taxonomy_code,
        });
        toast.success(t('billing.masters.providers.npi_verified'));
      } else {
        toast.warning(t('billing.masters.providers.npi_verification_failed'));
      }
    } catch (error) {
      console.error('Error verifying NPI:', error);
      toast.error('Failed to verify NPI.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!resolvedOrgId || !hasOrgHeader) {
      toast.error('Organization context is required.');
      return;
    }

    if (!formData.npi.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('NPI, first name, and last name are required.');
      return;
    }

    try {
      setSaving(true);

      const data = {
        npi: formData.npi.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        credentials: formData.credentials.trim() || undefined,
        specialty: formData.specialty.trim() || undefined,
        taxonomy_code: formData.taxonomy_code.trim() || undefined,
        license_number: formData.license_number.trim() || undefined,
        license_state: formData.license_state.trim() || undefined,
        dea_number: formData.dea_number.trim() || undefined,
        is_billing_provider: formData.is_billing_provider,
        is_rendering_provider: formData.is_rendering_provider,
        is_referring_provider: formData.is_referring_provider,
        active: formData.active,
      };

      if (editingProvider) {
        await BillingMastersService.updateProvider(resolvedOrgId, editingProvider.id, data, headers);
        toast.success(t('billing.masters.providers.update_success'));
      } else {
        await BillingMastersService.createProvider(resolvedOrgId, data, headers);
        toast.success(t('billing.masters.providers.create_success'));
      }

      setIsDialogOpen(false);
      await loadProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error('Failed to save provider.');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.active).length,
    billing: providers.filter(p => p.is_billing_provider).length,
    rendering: providers.filter(p => p.is_rendering_provider).length,
    referring: providers.filter(p => p.is_referring_provider).length,
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-[1500px] mx-auto p-4 animate-in fade-in duration-500 space-y-6">
        <div className="flex flex-col gap-4 border-b border-border dark:border-gray-700 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/settings/billing" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted dark:hover:bg-gray-800 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('billing.masters.providers.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.providers.title')}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.providers.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('billing.masters.providers.subtitle')}</p>
            </div>
            <Button size="sm" onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('billing.masters.providers.new_provider')}
            </Button>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-5">
            <div>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.providers.total_providers')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-[11px] text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.billing}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.providers.billing_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.rendering}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.providers.rendering_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.referring}</div>
              <div className="text-[11px] text-muted-foreground">{t('billing.masters.providers.referring_count')}</div>
            </div>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder={t('billing.masters.providers.search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-input bg-background dark:bg-gray-900 pl-10 pr-4 py-2 text-sm text-foreground dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="rounded-md border border-input bg-background dark:bg-gray-900 text-foreground dark:text-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="all">{t('billing.masters.providers.all_roles')}</option>
              <option value="billing">{t('billing.masters.providers.billing')}</option>
              <option value="rendering">{t('billing.masters.providers.rendering')}</option>
              <option value="referring">{t('billing.masters.providers.referring')}</option>
            </select>
            <label className="flex items-center gap-2 rounded-md border border-input bg-background dark:bg-gray-900 px-4 py-2 text-sm text-muted-foreground hover:text-foreground dark:text-gray-300">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded border-border" />
              {t('billing.masters.providers.show_inactive')}
            </label>
          </div>
        </div>

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
                    <th className="px-6 py-3 text-left">{t('billing.masters.providers.npi')}</th>
                    <th className="px-6 py-3 text-left">Provider Name</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.providers.credentials')}</th>
                    <th className="px-6 py-3 text-left">{t('billing.masters.providers.specialty')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.providers.provider_roles')}</th>
                    <th className="px-6 py-3 text-center">{t('billing.masters.providers.status')}</th>
                    <th className="px-6 py-3 text-right">{t('billing.masters.providers.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {filteredProviders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">{t('billing.masters.providers.no_providers')}</td>
                    </tr>
                  ) : (
                    filteredProviders.map((provider) => (
                      <tr key={provider.id} className="hover:bg-muted/40 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 text-sm font-mono text-foreground dark:text-white">{provider.npi}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">
                          {provider.first_name} {provider.last_name} {provider.credentials && <span className="text-xs text-muted-foreground">{provider.credentials}</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{provider.credentials || '-'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{provider.specialty || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {provider.is_billing_provider && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">B</span>}
                            {provider.is_rendering_provider && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">R</span>}
                            {provider.is_referring_provider && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Ref</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {provider.active ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.providers.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{t('billing.masters.providers.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEditDialog(provider)} className="text-primary hover:text-primary/80">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {editingProvider ? t('billing.masters.providers.edit_provider') : t('billing.masters.providers.new_provider')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {editingProvider ? 'Update provider credentials and roles.' : 'Add a healthcare provider to the billing registry.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="npi" className="dark:text-gray-200">{t('billing.masters.providers.npi')}</Label>
              <div className="flex gap-2">
                <Input id="npi" value={formData.npi} onChange={(e) => setFormData({ ...formData, npi: e.target.value })} placeholder="1234567890" maxLength={10} disabled={Boolean(editingProvider)} className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
                {!editingProvider && (
                  <Button type="button" variant="outline" onClick={handleVerifyNPI} disabled={verifying} className="gap-2">
                    <Shield className="h-4 w-4" />
                    {verifying ? t('billing.masters.providers.verifying') : t('billing.masters.providers.verify_npi')}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name" className="dark:text-gray-200">{t('billing.masters.providers.first_name')}</Label>
              <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="dark:text-gray-200">{t('billing.masters.providers.last_name')}</Label>
              <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="Smith" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentials" className="dark:text-gray-200">{t('billing.masters.providers.credentials')}</Label>
              <Input id="credentials" value={formData.credentials} onChange={(e) => setFormData({ ...formData, credentials: e.target.value })} placeholder="MD, DO, NP" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty" className="dark:text-gray-200">{t('billing.masters.providers.specialty')}</Label>
              <Input id="specialty" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} placeholder="Cardiology" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxonomy_code" className="dark:text-gray-200">{t('billing.masters.providers.taxonomy_code')}</Label>
              <Input id="taxonomy_code" value={formData.taxonomy_code} onChange={(e) => setFormData({ ...formData, taxonomy_code: e.target.value })} placeholder="207Q00000X" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number" className="dark:text-gray-200">{t('billing.masters.providers.license_number')}</Label>
              <Input id="license_number" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} placeholder="MD12345" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_state" className="dark:text-gray-200">{t('billing.masters.providers.license_state')}</Label>
              <Input id="license_state" value={formData.license_state} onChange={(e) => setFormData({ ...formData, license_state: e.target.value })} placeholder="CA" maxLength={2} className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dea_number" className="dark:text-gray-200">{t('billing.masters.providers.dea_number')}</Label>
              <Input id="dea_number" value={formData.dea_number} onChange={(e) => setFormData({ ...formData, dea_number: e.target.value })} placeholder="AB1234563" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="dark:text-gray-200">{t('billing.masters.providers.provider_roles')}</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_billing_provider} onChange={(e) => setFormData({ ...formData, is_billing_provider: e.target.checked })} className="rounded border-border" />
                  <span className="text-sm dark:text-gray-200">{t('billing.masters.providers.is_billing_provider')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_rendering_provider} onChange={(e) => setFormData({ ...formData, is_rendering_provider: e.target.checked })} className="rounded border-border" />
                  <span className="text-sm dark:text-gray-200">{t('billing.masters.providers.is_rendering_provider')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_referring_provider} onChange={(e) => setFormData({ ...formData, is_referring_provider: e.target.checked })} className="rounded border-border" />
                  <span className="text-sm dark:text-gray-200">{t('billing.masters.providers.is_referring_provider')}</span>
                </label>
              </div>
            </div>
            {editingProvider && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <input id="active" type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="rounded border-border" />
                <Label htmlFor="active" className="dark:text-gray-200">{t('billing.masters.providers.active')}</Label>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>{t('billing.masters.providers.cancel')}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? t('billing.masters.providers.saving') : t('billing.masters.providers.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
