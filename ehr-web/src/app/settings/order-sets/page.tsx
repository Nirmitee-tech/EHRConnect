'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, FileText, ClipboardList,
    ShieldCheck, Zap, HelpCircle, Workflow, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface OrderSet {
    id: string;
    name: string;
    category: string;
    itemsCount: number;
    lastUpdated: string;
    status: 'published' | 'draft' | 'under-review';
}

export default function OrderSetBuilderPage() {
    const { t } = useTranslation('common');
    const [orderSets] = useState<OrderSet[]>([
        { id: '1', name: 'Post-Op Standard Protocol', category: 'Surgery', itemsCount: 12, lastUpdated: '2025-12-20', status: 'published' },
        { id: '2', name: 'Acute MI Admission Orders', category: 'Cardiology', itemsCount: 8, lastUpdated: '2025-12-24', status: 'draft' },
        { id: '3', name: 'Newborn Wellness Bundle', category: 'Pediatrics', itemsCount: 5, lastUpdated: '2025-12-15', status: 'published' },
        { id: '4', name: 'Sepsis Screening Protocol', category: 'Emergency', itemsCount: 15, lastUpdated: '2025-12-26', status: 'under-review' },
    ]);

    return (
        <div className="max-w-[1500px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
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
                            {t('settings_registry.order_sets.title')}
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Workflow className="h-5 w-5 text-primary" />
                            </div>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">{t('settings_registry.order_sets.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-[10px] font-bold uppercase border-border hover:bg-accent h-10 px-6 tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
                        {t('settings_registry.order_sets.clinical_validation')}
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-10 px-6 tracking-widest shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
                        <Plus className="h-4 w-4" />
                        {t('settings_registry.order_sets.new_order_set')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Set List & Filtering */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="p-5 bg-muted/30 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('settings_registry.order_sets.protocol_registry')}</h2>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input placeholder={t('settings_registry.order_sets.search_placeholder')} className="pl-10 h-10 text-xs w-[280px] bg-background border-border focus:ring-2 focus:ring-primary/20 rounded-xl transition-all" />
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {orderSets.map(set => (
                                <div key={set.id} className="p-5 flex items-center justify-between hover:bg-primary/[0.02] transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all duration-500 group-hover/item:rotate-6 shadow-sm">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-bold text-foreground tracking-tight group-hover/item:text-primary transition-colors">{set.name}</h3>
                                                <Badge variant="outline" className="text-[9px] h-5 px-2 uppercase border-border/50 text-muted-foreground font-bold tracking-wider">{set.category}</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-70">
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{set.itemsCount} {t('settings_registry.order_sets.items_count')}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('settings_registry.order_sets.target_dept')}: {set.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <Badge className={cn(
                                                "text-[9px] py-0 font-bold uppercase h-5 px-3 tracking-widest border-none pointer-events-none shadow-sm",
                                                set.status === 'published' ? 'bg-green-500/10 text-green-700 dark:text-green-500' :
                                                    set.status === 'under-review' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-500' :
                                                        'bg-amber-500/10 text-amber-700 dark:text-amber-500'
                                            )}>
                                                {t(`settings_registry.order_sets.${set.status}`)}
                                            </Badge>
                                            <div className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tighter opacity-60 italic">{t('settings_registry.order_sets.last_updated')}: {set.lastUpdated}</div>
                                        </div>
                                        <div className="p-2 rounded-full group-hover/item:bg-primary/10 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-purple-950 border border-purple-400/30 rounded-2xl flex gap-5 shadow-2xl relative overflow-hidden group/card shadow-purple-500/10 active:scale-[0.99] transition-transform cursor-default">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:scale-125 transition-transform duration-1000">
                                <Zap className="h-20 w-20 text-white" />
                            </div>
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white shadow-inner h-fit">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">{t('settings_registry.order_sets.smart_ordering')}</h4>
                                <p className="text-[11px] text-purple-100/60 leading-relaxed font-medium italic">
                                    {t('settings_registry.order_sets.smart_ordering_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex gap-5 shadow-lg relative overflow-hidden group/card active:scale-[0.99] transition-transform cursor-default">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:scale-125 transition-transform duration-1000 rotate-12">
                                <HelpCircle className="h-20 w-20 text-primary" />
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner h-fit">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{t('settings_registry.order_sets.versioning')}</h4>
                                <p className="text-[11px] text-primary/70 leading-relaxed font-medium italic">
                                    {t('settings_registry.order_sets.versioning_desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl p-6 space-y-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            {t('settings_registry.order_sets.quick_builder')}
                        </h2>

                        <div className="space-y-3">
                            <div className="p-5 border-2 border-dashed border-border rounded-2xl text-center space-y-3 group/btn hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer">
                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto group-hover/btn:bg-primary/20 text-muted-foreground group-hover/btn:text-primary transition-all duration-500 group-hover/btn:rotate-12">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/btn:text-primary transition-colors">{t('settings_registry.order_sets.start_empty')}</p>
                                    <p className="text-[10px] text-muted-foreground px-4 font-medium italic">{t('settings_registry.order_sets.start_empty_desc')}</p>
                                </div>
                            </div>

                            <div className="p-5 border-2 border-dashed border-border rounded-2xl text-center space-y-3 group/btn hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer">
                                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto group-hover/btn:bg-primary/20 text-muted-foreground group-hover/btn:text-primary transition-all duration-500 group-hover/btn:scale-110">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/btn:text-primary transition-colors">{t('settings_registry.order_sets.import_template')}</p>
                                    <p className="text-[10px] text-muted-foreground px-4 font-medium italic">{t('settings_registry.order_sets.import_template_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border p-6 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                {t('settings_registry.order_sets.system_stats')}
                            </h4>
                            <Badge className="bg-primary hover:bg-primary text-white border-none text-[8px] px-2 h-4 font-bold shadow-lg shadow-primary/20 tracking-tighter shrink-0 uppercase">Real-time Analysis</Badge>
                        </div>

                        <div className="space-y-6">
                            <StatItem label={t('settings_registry.order_sets.total_published')} value="142" />
                            <StatItem label={t('settings_registry.order_sets.shared_across')} value="88%" trend="+12%" />
                            <StatItem label={t('settings_registry.order_sets.validation_errors')} value="0" isZero />
                        </div>

                        <Button className="w-full mt-8 bg-foreground text-background hover:bg-foreground/90 text-[10px] font-bold uppercase h-11 rounded-xl shadow-xl transition-all active:scale-95 tracking-widest">
                            {t('settings_registry.order_sets.download_audit')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, trend, isZero }: { label: string, value: string, trend?: string, isZero?: boolean }) {
    return (
        <div className="flex items-center justify-between group/stat">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider group-hover/stat:text-foreground transition-colors">{label}</span>
            <div className="flex items-center gap-3">
                {trend && <span className="text-[10px] font-bold text-green-600 dark:text-green-400">{trend}</span>}
                <span className={cn("text-xl font-bold font-mono tracking-tighter", isZero ? "text-muted-foreground/30" : "text-foreground")}>{value}</span>
            </div>
        </div>
    );
}


