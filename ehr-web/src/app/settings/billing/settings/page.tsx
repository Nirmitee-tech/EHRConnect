'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import { useOrganization } from '@/hooks/useOrganization';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/i18n/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BillingMastersService } from '@/services/billing-masters.service';

export default function BillingSettingsPage() {
  const { t } = useTranslation('common');
  const { currentFacility } = useFacility();
  const { orgId } = useOrganization();
  const headers = useApiHeaders();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    claimmd_api_url: '',
    claimmd_username: '',
    claimmd_password: '',
    claimmd_auto_submit: false,
    claimmd_api_key: '',
    payment_approval_threshold: '1000',
    refund_approval_threshold: '500',
    adjustment_approval_threshold: '250',
    statement_frequency_days: '30',
    statement_grace_period_days: '7',
    late_payment_fee_percentage: '0',
    minimum_payment_amount: '10',
    auto_post_insurance_payments: false,
    auto_post_patient_payments: false,
    require_secondary_billing: true,
    enable_payment_plans: true,
    enable_prior_auth_check: true,
  });

  const resolvedOrgId = headers['x-org-id'] || orgId || currentFacility?.id || null;
  const hasOrgHeader = Boolean(headers['x-org-id']);

  useEffect(() => {
    if (resolvedOrgId && hasOrgHeader) {
      loadSettings();
    }
  }, [resolvedOrgId, hasOrgHeader]);

  const loadSettings = async () => {
    if (!resolvedOrgId || !hasOrgHeader) return;
    try {
      setLoading(true);
      const response = await BillingMastersService.getBillingSettings(resolvedOrgId, headers);
      if (response.data) {
        setFormData({
          claimmd_api_url: response.data.claimmd_api_url || '',
          claimmd_username: response.data.claimmd_username || '',
          claimmd_password: '',
          claimmd_auto_submit: response.data.claimmd_auto_submit || false,
          claimmd_api_key: '',
          payment_approval_threshold: response.data.payment_approval_threshold?.toString() || '1000',
          refund_approval_threshold: response.data.refund_approval_threshold?.toString() || '500',
          adjustment_approval_threshold: response.data.adjustment_approval_threshold?.toString() || '250',
          statement_frequency_days: response.data.statement_frequency_days?.toString() || '30',
          statement_grace_period_days: response.data.statement_grace_period_days?.toString() || '7',
          late_payment_fee_percentage: response.data.late_payment_fee_percentage?.toString() || '0',
          minimum_payment_amount: response.data.minimum_payment_amount?.toString() || '10',
          auto_post_insurance_payments: response.data.auto_post_insurance_payments || false,
          auto_post_patient_payments: response.data.auto_post_patient_payments || false,
          require_secondary_billing: response.data.require_secondary_billing !== false,
          enable_payment_plans: response.data.enable_payment_plans !== false,
          enable_prior_auth_check: response.data.enable_prior_auth_check !== false,
        });
      }
    } catch (error) {
      console.error('Error loading billing settings:', error);
      toast.error('Failed to load billing settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resolvedOrgId || !hasOrgHeader) {
      toast.error('Organization context is required.');
      return;
    }

    try {
      setSaving(true);
      const data = {
        claimmd_api_url: formData.claimmd_api_url.trim() || undefined,
        claimmd_username: formData.claimmd_username.trim() || undefined,
        claimmd_password: formData.claimmd_password.trim() || undefined,
        claimmd_auto_submit: formData.claimmd_auto_submit,
        claimmd_api_key: formData.claimmd_api_key.trim() || undefined,
        payment_approval_threshold: parseFloat(formData.payment_approval_threshold) || 1000,
        refund_approval_threshold: parseFloat(formData.refund_approval_threshold) || 500,
        adjustment_approval_threshold: parseFloat(formData.adjustment_approval_threshold) || 250,
        statement_frequency_days: parseInt(formData.statement_frequency_days) || 30,
        statement_grace_period_days: parseInt(formData.statement_grace_period_days) || 7,
        late_payment_fee_percentage: parseFloat(formData.late_payment_fee_percentage) || 0,
        minimum_payment_amount: parseFloat(formData.minimum_payment_amount) || 10,
        auto_post_insurance_payments: formData.auto_post_insurance_payments,
        auto_post_patient_payments: formData.auto_post_patient_payments,
        require_secondary_billing: formData.require_secondary_billing,
        enable_payment_plans: formData.enable_payment_plans,
        enable_prior_auth_check: formData.enable_prior_auth_check,
      };

      await BillingMastersService.updateBillingSettings(resolvedOrgId, data, headers);
      toast.success(t('billing.masters.billing_settings.settings_saved'));
      await loadSettings();
    } catch (error) {
      console.error('Error saving billing settings:', error);
      toast.error(t('billing.masters.billing_settings.settings_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-[1200px] mx-auto p-4 animate-in fade-in duration-500 space-y-6">
        <div className="flex flex-col gap-4 border-b border-border dark:border-gray-700 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/settings/billing" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted dark:hover:bg-gray-800 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />{t('billing.masters.billing_settings.back_to_billing')}
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground dark:text-white">{t('billing.masters.billing_settings.title')}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('billing.masters.billing_settings.title')}</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t('billing.masters.billing_settings.subtitle')}</p>
            </div>
            <Button size="sm" onClick={handleSave} disabled={saving || loading} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? t('billing.masters.billing_settings.saving') : t('billing.masters.billing_settings.save')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">{t('billing.masters.billing_settings.claimmd_integration')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="claimmd_api_url" className="dark:text-gray-200">{t('billing.masters.billing_settings.claimmd_api_url')}</Label><Input id="claimmd_api_url" value={formData.claimmd_api_url} onChange={(e) => setFormData({ ...formData, claimmd_api_url: e.target.value })} placeholder="https://api.claimmd.com" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="claimmd_username" className="dark:text-gray-200">{t('billing.masters.billing_settings.claimmd_username')}</Label><Input id="claimmd_username" value={formData.claimmd_username} onChange={(e) => setFormData({ ...formData, claimmd_username: e.target.value })} placeholder="username" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="claimmd_password" className="dark:text-gray-200">{t('billing.masters.billing_settings.claimmd_password')}</Label><Input id="claimmd_password" type="password" value={formData.claimmd_password} onChange={(e) => setFormData({ ...formData, claimmd_password: e.target.value })} placeholder="Leave blank to keep current" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="claimmd_api_key" className="dark:text-gray-200">{t('billing.masters.billing_settings.claimmd_api_key')}</Label><Input id="claimmd_api_key" type="password" value={formData.claimmd_api_key} onChange={(e) => setFormData({ ...formData, claimmd_api_key: e.target.value })} placeholder="API Key" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="flex items-center gap-2 sm:col-span-2"><input id="claimmd_auto_submit" type="checkbox" checked={formData.claimmd_auto_submit} onChange={(e) => setFormData({ ...formData, claimmd_auto_submit: e.target.checked })} className="rounded border-border" /><Label htmlFor="claimmd_auto_submit" className="dark:text-gray-200">{t('billing.masters.billing_settings.claimmd_auto_submit')}</Label></div>
              </div>
            </div>

            <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">{t('billing.masters.billing_settings.approval_thresholds')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="payment_approval_threshold" className="dark:text-gray-200">{t('billing.masters.billing_settings.payment_approval_threshold')}</Label><Input id="payment_approval_threshold" type="number" step="0.01" value={formData.payment_approval_threshold} onChange={(e) => setFormData({ ...formData, payment_approval_threshold: e.target.value })} placeholder="1000" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="refund_approval_threshold" className="dark:text-gray-200">{t('billing.masters.billing_settings.refund_approval_threshold')}</Label><Input id="refund_approval_threshold" type="number" step="0.01" value={formData.refund_approval_threshold} onChange={(e) => setFormData({ ...formData, refund_approval_threshold: e.target.value })} placeholder="500" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="adjustment_approval_threshold" className="dark:text-gray-200">{t('billing.masters.billing_settings.adjustment_approval_threshold')}</Label><Input id="adjustment_approval_threshold" type="number" step="0.01" value={formData.adjustment_approval_threshold} onChange={(e) => setFormData({ ...formData, adjustment_approval_threshold: e.target.value })} placeholder="250" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
              </div>
            </div>

            <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">{t('billing.masters.billing_settings.statement_settings')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="statement_frequency_days" className="dark:text-gray-200">{t('billing.masters.billing_settings.statement_frequency_days')}</Label><Input id="statement_frequency_days" type="number" value={formData.statement_frequency_days} onChange={(e) => setFormData({ ...formData, statement_frequency_days: e.target.value })} placeholder="30" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="statement_grace_period_days" className="dark:text-gray-200">{t('billing.masters.billing_settings.statement_grace_period_days')}</Label><Input id="statement_grace_period_days" type="number" value={formData.statement_grace_period_days} onChange={(e) => setFormData({ ...formData, statement_grace_period_days: e.target.value })} placeholder="7" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="late_payment_fee_percentage" className="dark:text-gray-200">{t('billing.masters.billing_settings.late_payment_fee_percentage')}</Label><Input id="late_payment_fee_percentage" type="number" step="0.01" value={formData.late_payment_fee_percentage} onChange={(e) => setFormData({ ...formData, late_payment_fee_percentage: e.target.value })} placeholder="0" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
                <div className="space-y-2"><Label htmlFor="minimum_payment_amount" className="dark:text-gray-200">{t('billing.masters.billing_settings.minimum_payment_amount')}</Label><Input id="minimum_payment_amount" type="number" step="0.01" value={formData.minimum_payment_amount} onChange={(e) => setFormData({ ...formData, minimum_payment_amount: e.target.value })} placeholder="10" className="dark:bg-gray-900 dark:text-white dark:border-gray-700" /></div>
              </div>
            </div>

            <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">{t('billing.masters.billing_settings.auto_billing_rules')}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><input id="auto_post_insurance_payments" type="checkbox" checked={formData.auto_post_insurance_payments} onChange={(e) => setFormData({ ...formData, auto_post_insurance_payments: e.target.checked })} className="rounded border-border" /><Label htmlFor="auto_post_insurance_payments" className="dark:text-gray-200">{t('billing.masters.billing_settings.auto_post_insurance_payments')}</Label></div>
                <div className="flex items-center gap-2"><input id="auto_post_patient_payments" type="checkbox" checked={formData.auto_post_patient_payments} onChange={(e) => setFormData({ ...formData, auto_post_patient_payments: e.target.checked })} className="rounded border-border" /><Label htmlFor="auto_post_patient_payments" className="dark:text-gray-200">{t('billing.masters.billing_settings.auto_post_patient_payments')}</Label></div>
                <div className="flex items-center gap-2"><input id="require_secondary_billing" type="checkbox" checked={formData.require_secondary_billing} onChange={(e) => setFormData({ ...formData, require_secondary_billing: e.target.checked })} className="rounded border-border" /><Label htmlFor="require_secondary_billing" className="dark:text-gray-200">{t('billing.masters.billing_settings.require_secondary_billing')}</Label></div>
                <div className="flex items-center gap-2"><input id="enable_payment_plans" type="checkbox" checked={formData.enable_payment_plans} onChange={(e) => setFormData({ ...formData, enable_payment_plans: e.target.checked })} className="rounded border-border" /><Label htmlFor="enable_payment_plans" className="dark:text-gray-200">{t('billing.masters.billing_settings.enable_payment_plans')}</Label></div>
                <div className="flex items-center gap-2"><input id="enable_prior_auth_check" type="checkbox" checked={formData.enable_prior_auth_check} onChange={(e) => setFormData({ ...formData, enable_prior_auth_check: e.target.checked })} className="rounded border-border" /><Label htmlFor="enable_prior_auth_check" className="dark:text-gray-200">{t('billing.masters.billing_settings.enable_prior_auth_check')}</Label></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
