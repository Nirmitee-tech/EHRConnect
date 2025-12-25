'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Share, Plus, Building2, Building, ChevronRight, HelpCircle, Activity, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

export default function EntityLinkingPage() {
    const { t } = useTranslation('common');

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/settings"
                        className="p-2.5 hover:bg-accent rounded-xl transition-all border border-transparent hover:border-border group"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            {t('settings_registry.entity_linking.title')}
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Share className="h-5 w-5 text-primary" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">{t('settings_registry.entity_linking.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 uppercase text-[10px] font-bold border-border hover:bg-accent h-10 px-6 tracking-widest">
                        <Activity className="h-4 w-4" />
                        {t('settings_registry.entity_linking.view_topology')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 uppercase text-[10px] font-bold h-10 px-6 tracking-widest shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
                        <Save className="h-4 w-4" />
                        {t('settings_registry.entity_linking.sync_hierarchy')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Hierarchy Tree */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.entity_linking.enterprise_structure')}</h2>
                            </div>
                            <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] gap-2 font-bold uppercase border-border hover:bg-accent text-foreground rounded-lg shadow-sm">
                                <Plus className="h-4 w-4" />
                                {t('settings_registry.entity_linking.add_subsidiary')}
                            </Button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Root Organization */}
                            <div className="relative">
                                <div className="flex items-center gap-5 p-6 border-2 border-primary/30 bg-primary/[0.03] rounded-2xl relative z-10 transition-all hover:bg-primary/[0.05] group/root">
                                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 group-hover/root:scale-105 transition-transform duration-500">
                                        <Building2 className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-foreground tracking-tight">{t('settings_registry.entity_linking.hq_name')}</h3>
                                            <Badge className="bg-primary hover:bg-primary text-white text-[9px] h-5 py-0 uppercase border-none shadow-lg shadow-primary/20 font-bold px-3 tracking-wider">
                                                {t('settings_registry.entity_linking.enterprise_root')}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase mt-1.5 flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                            {t('settings_registry.entity_linking.global_master_parent')}
                                            <span className="text-border mx-1">|</span>
                                            12 {t('settings_registry.entity_linking.active_entities')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        <div className="h-2 w-32 bg-primary/10 rounded-full overflow-hidden hidden md:block">
                                            <div className="h-full bg-primary w-full" />
                                        </div>
                                        <span className="text-[10px] font-bold text-primary uppercase hidden md:block">Synced</span>
                                    </div>
                                </div>

                                {/* Sub-entities */}
                                <div className="ml-8 mt-6 pl-12 border-l-2 border-dashed border-border/60 space-y-5 relative">
                                    <div className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 to-transparent" />

                                    {/* Entity 1 */}
                                    <div className="relative group/leaf">
                                        <div className="absolute -left-[49px] top-8 w-12 h-[2px] bg-border/60 group-hover/leaf:bg-primary/40 transition-colors" />
                                        <div className="flex items-center justify-between p-5 border border-border bg-card rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group shadow-sm group-hover/leaf:translate-x-1 duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 group-hover:rotate-12">
                                                    <Building className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground tracking-tight">{t('settings_registry.entity_linking.facility_hospital_name')}</h4>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide opacity-80">{t('settings_registry.entity_linking.facility_hospital_meta')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">{t('settings_registry.entity_linking.synchronized')}</span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1 rounded-full bg-green-500" />)}
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Entity 2 */}
                                    <div className="relative group/leaf">
                                        <div className="absolute -left-[49px] top-8 w-12 h-[2px] bg-border/60 group-hover/leaf:bg-primary/40 transition-colors" />
                                        <div className="flex items-center justify-between p-5 border border-border bg-card rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group shadow-sm group-hover/leaf:translate-x-1 duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 group-hover:rotate-12">
                                                    <Building className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground tracking-tight">{t('settings_registry.entity_linking.facility_clinic_name')}</h4>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide opacity-80">{t('settings_registry.entity_linking.facility_clinic_meta')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">{t('settings_registry.entity_linking.awaiting_mapping')}</span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1 rounded-full bg-amber-500" />)}
                                                        {[4, 5].map(i => <div key={i} className="w-1.5 h-1 rounded-full bg-muted/30" />)}
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-950 border border-indigo-400/30 rounded-2xl p-6 flex gap-6 shadow-2xl relative overflow-hidden group/info">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/info:scale-150 transition-transform duration-1000">
                            <Activity className="h-24 w-24 text-white" />
                        </div>
                        <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white shadow-inner h-fit">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">{t('settings_registry.entity_linking.about_inheritance')}</h4>
                            <p className="text-xs text-indigo-100/70 leading-relaxed font-medium max-w-2xl italic">
                                {t('settings_registry.entity_linking.inheritance_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Linking Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl p-6 space-y-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono flex items-center gap-2">
                            <Workflow className="h-3.5 w-3.5 text-primary" />
                            {t('settings_registry.entity_linking.inheritance_rules')}
                        </h2>

                        <div className="space-y-3">
                            <RuleItem label={t('settings_registry.entity_linking.master_catalog')} status={t('settings_registry.entity_linking.status_enabled')} desc={t('settings_registry.entity_linking.catalog_desc')} color="green" />
                            <RuleItem label={t('settings_registry.entity_linking.financial_rollup')} status={t('settings_registry.entity_linking.status_partial')} desc={t('settings_registry.entity_linking.rollup_desc')} color="amber" />
                            <RuleItem label={t('settings_registry.entity_linking.staff_portability')} status={t('settings_registry.entity_linking.status_disabled')} desc={t('settings_registry.entity_linking.portability_desc')} color="gray" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group/link">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover/link:bg-white/20 transition-all duration-700" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5 text-blue-100/80">{t('settings_registry.entity_linking.link_new_registry')}</h4>
                        <div className="space-y-4 relative z-10">
                            <div className="relative">
                                <Share className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                <input
                                    placeholder={t('settings_registry.entity_linking.registry_id_placeholder')}
                                    className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 text-xs placeholder:text-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all font-mono"
                                />
                            </div>
                            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 text-[10px] font-bold uppercase h-11 rounded-xl shadow-xl transition-all active:scale-95">
                                {t('settings_registry.entity_linking.validate_connection')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RuleItem({ label, status, desc, color }: { label: string, status: string, desc: string, color: 'green' | 'amber' | 'gray' }) {
    const colors = {
        green: "bg-green-500/10 text-green-700 dark:text-green-500",
        amber: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
        gray: "bg-muted text-muted-foreground/50 border-border"
    };

    return (
        <div className="p-4 bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl border border-border/50 group/rule">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-foreground/80 group-hover/rule:text-primary transition-colors">{label}</span>
                <Badge className={cn("text-[8px] py-0 font-bold uppercase h-4 tracking-tighter border-none", colors[color])}>
                    {status}
                </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{desc}</p>
        </div>
    );
}


