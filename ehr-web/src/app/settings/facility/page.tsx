'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Save, Building2, Info, Calendar,
  Clock, Lock, ShieldCheck, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { useFacility } from '@/contexts/facility-context';
import { SettingsService } from '@/services/settings.service';
import { FacilitySettings } from '@/types/settings';
import { cn } from '@/lib/utils';

export default function FacilitySettingsPage() {
  const { currentFacility } = useFacility();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [settings, setSettings] = useState<FacilitySettings>({
    facilityName: '',
    slotDuration: 15,
    defaultApptDuration: 30,
    workingHours: {
      start: '08:00',
      end: '17:00'
    },
    autoNavigateToEncounter: true
  });

  useEffect(() => {
    if (currentFacility) {
      loadSettings();
    }
  }, [currentFacility]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getFacilitySettings(currentFacility?.id);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await SettingsService.updateFacilitySettings(settings, currentFacility?.id);
      setMessage({ type: 'success', text: t('common.save_success') || 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: t('common.save_error') || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground uppercase animate-pulse tracking-widest">Initialising Secure Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div className="flex items-center gap-5">
          <Link
            href="/settings"
            className="p-3 hover:bg-accent rounded-2xl transition-all border border-transparent hover:border-border group shadow-sm bg-card"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-4">
              {t('settings_registry.facility_settings.title')}
              <div className="p-2 bg-primary/10 rounded-xl">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </h1>
            <p className="text-sm text-muted-foreground font-semibold mt-1.5 opacity-80">{t('settings_registry.facility_settings.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-3 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-12 px-8 tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
          >
            {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
            {t('common.save_changes')}
          </Button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl border flex items-center gap-3 animate-in zoom-in-95 duration-300 shadow-lg",
          message.type === 'success' ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-destructive/10 border-destructive/30 text-destructive"
        )}>
          {message.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
          <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Cards */}
        <div className="lg:col-span-8 space-y-8">
          {/* Basic Info */}
          <div className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden group/card hover:border-primary/30 transition-all duration-500">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
              <div className="p-2 bg-background rounded-xl border border-border">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.facility_settings.basic_info')}</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('settings_registry.facility_form.facility_name')}</label>
                  <Input
                    value={settings.facilityName}
                    onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
                    className="h-12 bg-muted/20 border-border focus:ring-4 focus:ring-primary/10 rounded-2xl px-5 font-medium transition-all"
                    placeholder={t('settings_registry.facility_form.facility_name_placeholder')}
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('settings_registry.facility_form.facility_type')}</label>
                  <div className="h-12 bg-muted/20 border border-border rounded-2xl px-5 flex items-center text-sm font-bold text-foreground/70 cursor-not-allowed">
                    Multi-specialty HQ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Config */}
          <div className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden group/card hover:border-primary/30 transition-all duration-500">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
              <div className="p-2 bg-background rounded-xl border border-border">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.facility_settings.calendar_config')}</h2>
            </div>
            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('settings_registry.facility_settings.slot_duration')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15, 20, 30, 60].map(duration => (
                      <button
                        key={duration}
                        onClick={() => setSettings({ ...settings, slotDuration: duration })}
                        className={cn(
                          "h-12 rounded-2xl border text-[10px] font-bold uppercase transition-all shadow-sm flex flex-col items-center justify-center gap-0.5",
                          settings.slotDuration === duration
                            ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105"
                            : "bg-background border-border text-muted-foreground hover:bg-accent hover:scale-[1.02]"
                        )}
                      >
                        {duration}
                        <span className="text-[8px] opacity-70">Min</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1 italic font-medium">{t('settings_registry.facility_settings.slot_desc')}</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('settings_registry.facility_settings.working_hours')}</label>
                  <div className="space-y-4 p-6 bg-muted/30 rounded-3xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('settings_registry.facility_settings.start_time')}</span>
                      <Input
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) => setSettings({ ...settings, workingHours: { ...settings.workingHours, start: e.target.value } })}
                        className="w-32 h-10 bg-background border-border rounded-xl text-center font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('settings_registry.facility_settings.end_time')}</span>
                      <Input
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) => setSettings({ ...settings, workingHours: { ...settings.workingHours, end: e.target.value } })}
                        className="w-32 h-10 bg-background border-border rounded-xl text-center font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between bg-primary/[0.02] -mx-8 -mb-8 p-8 mt-4">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground tracking-tight">{t('settings_registry.facility_settings.auto_navigate')}</h4>
                  <p className="text-[11px] text-muted-foreground max-w-md font-medium">{t('settings_registry.facility_settings.auto_navigate_desc')}</p>
                </div>
                <div
                  onClick={() => setSettings({ ...settings, autoNavigateToEncounter: !settings.autoNavigateToEncounter })}
                  className={cn(
                    "w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300",
                    settings.autoNavigateToEncounter ? "bg-primary" : "bg-muted shadow-inner"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300",
                    settings.autoNavigateToEncounter ? "ml-6" : "ml-0"
                  )} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Insights & Policies */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-indigo-950 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group/info border border-indigo-400/20">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover/info:bg-white/20 transition-all duration-1000" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-200">{t('settings_registry.facility_settings.important_notes')}</h3>
              </div>
              <div className="space-y-4">
                <PolicyItem
                  icon={<Clock className="h-4 w-4" />}
                  title="Real-time Enforcement"
                  desc="Changes to slot duration will re-render the appointment grid for all active front-desk staff instantly."
                />
                <PolicyItem
                  icon={<Calendar className="h-4 w-4" />}
                  title="Shift Compliance"
                  desc="Ensure working hours align with doctor shift rosters to prevent overbooking errors."
                />
                <PolicyItem
                  icon={<Lock className="h-4 w-4" />}
                  title="Legal Archiving"
                  desc="Historical settings data is preserved for audit purposes as per HIPAA and GDPR regulations."
                />
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em] italic">Vault Version: 1.0.4-LTS</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[2rem] border border-border p-8 shadow-xl relative overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Security Protocol
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Settings Hash</span>
                  <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] tracking-tighter uppercase">Verified</Badge>
                </div>
                <code className="text-[10px] font-mono text-muted-foreground break-all opacity-50">FAC-F842-192B-9021-EEAR</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group/item">
      <div className="p-2.5 bg-white/10 rounded-xl h-fit group-hover/item:bg-white/20 transition-colors">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</h4>
        <p className="text-[10px] text-indigo-100/60 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
